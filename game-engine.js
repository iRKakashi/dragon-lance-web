// Dragonlance Interactive Adventure Game Engine

class DragonlanceGame {
    constructor() {
        this.characterData = null;
        this.adventureData = null;
        this.currentEntry = null;
        this.playerCharacter = {
            name: '',
            race: null,
            stats: {
                strength: 15,
                dexterity: 14,
                constitution: 13,
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            },
            modifiers: {
                strength: 2,
                dexterity: 2,
                constitution: 1,
                intelligence: 1,
                wisdom: 0,
                charisma: -1
            },
            isComplete: false
        };
        this.gameState = {
            species: null,
            class: null,
            subclass: null,
            background: null,
            currentEntryId: 'species_selection',
            inventory: [],
            xp: 0,
            level: 1,
            musicEnabled: false, // Start disabled due to browser autoplay restrictions
            inBattle: false,
            currentBattleTrack: null,
            currentAmbientTrack: 0,
            currentBattleTrackIndex: 0,
            characterCreated: false
        };
        
        // Music playlists
        this.ambientPlaylist = [
            'assets/Music/Ambiance/HarpAmbientMusic-Vindsvept-The Fae.mp3',
            'assets/Music/Ambiance/AMbientRoad.mp3',
            'assets/Music/Ambiance/AbientSkyrim.mp3',
            'assets/Music/Ambiance/HarvestdawnAmbiance.mp3'
        ];
        
        this.battlePlaylist = [
            'assets/Music/Battle/Battlemusic1.mp3',
            'assets/Music/Battle/Battlemusic2.mp3'
        ];
        
        // Audio elements for playlists
        this.ambientAudioElements = [];
        this.battleAudioElements = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadGameData();
            this.setupEventListeners();
            
            // Start the game with the normal flow
            this.loadEntry(this.gameState.currentEntryId);
            
            // Music will auto-start when the audio element is ready (handled in setupEventListeners)
            // No need for additional timeout-based auto-start
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game data. Please refresh the page.');
        }
    }

    async loadGameData() {
        try {
            // Load character creation data
            const characterResponse = await fetch('./character_creation_transition.json');
            if (!characterResponse.ok) {
                throw new Error(`HTTP error! status: ${characterResponse.status}`);
            }
            this.characterData = await characterResponse.json();

            // Load adventure entries data
            const adventureResponse = await fetch('./dragonlance_entries_1_20_fixed.json');
            if (!adventureResponse.ok) {
                throw new Error(`HTTP error! status: ${adventureResponse.status}`);
            }
            this.adventureData = await adventureResponse.json();

            console.log('Game data loaded successfully');
        } catch (error) {
            console.error('Error loading game data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Game control buttons
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('save-game').addEventListener('click', () => this.saveGame());
        document.getElementById('load-game').addEventListener('click', () => this.loadGame());
        document.getElementById('music-toggle').addEventListener('click', () => this.toggleMusic());

        // Skill check modal handlers
        document.getElementById('roll-skill-check').addEventListener('click', () => this.rollSkillCheck());
        document.getElementById('skill-check-continue').addEventListener('click', () => this.continueFromSkillCheck());
        
        // Character builder handlers
        this.setupCharacterBuilderListeners();
        
        
        // Initialize music playlists
        this.initializeMusicPlaylists();
    }

    // === CHARACTER BUILDER METHODS ===
    
    showCharacterBuilder() {
        console.log('🛠️ Showing character builder');
        const modal = document.getElementById('character-builder-modal');
        console.log('Modal element found:', modal);
        console.log('Modal classes before:', modal.className);
        modal.classList.remove('hidden');
        console.log('Modal classes after:', modal.className);
        
        // Initialize character builder state
        this.initializeCharacterBuilder();
    }
    
    hideCharacterBuilder() {
        const modal = document.getElementById('character-builder-modal');
        modal.classList.add('hidden');
    }
    
    initializeCharacterBuilder() {
        console.log('🔧 Initializing character builder');
        try {
            // Reset name input (but keep if already set)
            const nameInput = document.getElementById('character-name-input');
            console.log('Name input element:', nameInput);
            if (nameInput) {
                nameInput.value = this.playerCharacter.name || '';
            }
            
            // Update race selection display
            this.updateRaceDisplay();
            
            // Update continue button state
            this.updateContinueButtonState();
        } catch (error) {
            console.error('Error initializing character builder:', error);
        }
    }
    
    setupCharacterBuilderListeners() {
        // Character name input validation
        const nameInput = document.getElementById('character-name-input');
        nameInput.addEventListener('input', () => this.validateCharacterName());
        
        // Race selection
        document.getElementById('change-race-btn').addEventListener('click', () => this.openRaceSelection());
        
        // Character builder actions
        document.getElementById('character-builder-reset').addEventListener('click', () => this.resetCharacterBuilder());
        document.getElementById('character-builder-continue').addEventListener('click', () => this.finishCharacterCreation());
        
        // Ability scores modal listeners
        this.setupAbilityScoresListeners();
    }
    
    validateCharacterName() {
        const nameInput = document.getElementById('character-name-input');
        const validation = document.getElementById('name-validation');
        const name = nameInput.value.trim();
        
        if (name.length === 0) {
            validation.textContent = 'Character name is required';
            validation.style.color = 'var(--color-crimson)';
            this.playerCharacter.name = '';
        } else if (name.length < 2) {
            validation.textContent = 'Name must be at least 2 characters long';
            validation.style.color = 'var(--color-crimson)';
            this.playerCharacter.name = '';
        } else if (name.length > 30) {
            validation.textContent = 'Name must be less than 30 characters';
            validation.style.color = 'var(--color-crimson)';
            this.playerCharacter.name = '';
        } else {
            validation.textContent = '✓ Name looks good!';
            validation.style.color = 'var(--color-gold)';
            this.playerCharacter.name = name;
        }
        
        this.updateContinueButtonState();
    }
    
    openRaceSelection() {
        // Hide character builder temporarily and show race selection
        this.hideCharacterBuilder();
        this.loadEntry('species_selection');
    }
    
    updateRaceDisplay() {
        const raceNameEl = document.getElementById('selected-race-name');
        const raceSubtitleEl = document.getElementById('selected-race-subtitle');
        const racePortraitEl = document.getElementById('selected-race-portrait');
        
        if (this.playerCharacter.race) {
            const raceInfo = this.getRaceInfo(this.playerCharacter.race);
            raceNameEl.textContent = this.playerCharacter.race;
            raceSubtitleEl.textContent = raceInfo.subtitle;
            racePortraitEl.src = raceInfo.image;
            racePortraitEl.style.display = 'block';
        } else {
            raceNameEl.textContent = 'No Race Selected';
            raceSubtitleEl.textContent = 'Choose your race to continue';
            racePortraitEl.style.display = 'none';
        }
    }
    
    getRaceInfo(raceName) {
        const raceData = {
            'Human': {
                image: 'assets/Images/HumanRace.png',
                subtitle: 'The Ambitious Wanderers',
                bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 }
            },
            'Qualinesti Elf': {
                image: 'assets/Images/Elf-QualinestiRace.png',
                subtitle: 'The Woodland Speakers',
                bonuses: { dexterity: 2, wisdom: 1 }
            },
            'Silvanesti Elf': {
                image: 'assets/Images/Elf-SylvanestiRace.png',
                subtitle: 'The Ancient Nobles',
                bonuses: { dexterity: 2, intelligence: 1 }
            },
            'Hill Dwarf': {
                image: 'assets/Images/HillDwarvesRace.png',
                subtitle: 'The Merchant Craftsmen',
                bonuses: { constitution: 2, wisdom: 1 }
            },
            'Mountain Dwarf': {
                image: 'assets/Images/MountainDwarvesRace.png',
                subtitle: 'The Forge Masters',
                bonuses: { constitution: 2, strength: 2 }
            },
            'Kender': {
                image: 'assets/Images/KenderRace.png',
                subtitle: 'The Fearless Wanderers',
                bonuses: { dexterity: 2, charisma: 1 }
            },
            'Gnome': {
                image: 'assets/Images/GnomesRace.png',
                subtitle: 'The Tinker Sages',
                bonuses: { constitution: 1, intelligence: 2 }
            }
        };
        
        return raceData[raceName] || { image: '', subtitle: '', bonuses: {} };
    }
    
    handleScoreMethodChange() {
        const method = document.querySelector('input[name="score-method"]:checked').value;
        
        if (method === 'random') {
            this.randomizeScores();
        } else {
            this.resetAbilityScores();
        }
    }
    
    randomizeScores() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            // Roll 3d6 for each ability
            const roll = this.rollDice(3, 6);
            this.playerCharacter.stats[ability] = roll;
            
            // Update the select element
            const select = document.getElementById(`${ability}-select`);
            select.innerHTML = `<option value="${roll}" selected>${roll}</option>`;
        });
        
        this.updateAbilityScores();
    }
    
    resetAbilityScores() {
        // Standard array values available for assignment
        this.availableScores = [15, 14, 13, 12, 10, 8];
        this.usedScores = [];
        
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        // Reset all ability scores to default values
        abilities.forEach(ability => {
            this.playerCharacter.stats[ability] = 10; // Default value
            this.playerCharacter.modifiers[ability] = 0; // Default modifier
        });
        
        // Reset all select elements to blank state
        this.updateAllAbilitySelects();
        this.updateAbilityScores();
    }
    
    updateAbilityScores() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            const select = document.getElementById(`${ability}-select`);
            const value = parseInt(select.value);
            this.playerCharacter.stats[ability] = value;
            
            // Calculate modifier
            const modifier = Math.floor((value - 10) / 2);
            this.playerCharacter.modifiers[ability] = modifier;
            
            // Update modifier display
            const modifierEl = document.getElementById(`${ability}-modifier`);
            modifierEl.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        });
        
        this.updateContinueButtonState();
    }
    
    rollDice(numDice, sides) {
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }
    
    updateContinueButtonState() {
        const continueBtn = document.getElementById('character-builder-continue');
        const isValid = this.playerCharacter.name.length >= 2 && this.playerCharacter.race;
        
        continueBtn.disabled = !isValid;
        
        if (isValid) {
            continueBtn.innerHTML = '<span class="btn-icon">👤</span>Continue to Class Selection';
        } else {
            continueBtn.innerHTML = '<span class="btn-icon">❌</span>Complete Name & Race First';
        }
    }
    
    resetCharacterBuilder() {
        if (confirm('Are you sure you want to reset your character? All progress will be lost.')) {
            this.playerCharacter = {
                name: '',
                race: null,
                stats: {
                    strength: 15,
                    dexterity: 14,
                    constitution: 13,
                    intelligence: 12,
                    wisdom: 10,
                    charisma: 8
                },
                modifiers: {
                    strength: 2,
                    dexterity: 2,
                    constitution: 1,
                    intelligence: 1,
                    wisdom: 0,
                    charisma: -1
                },
                isComplete: false
            };
            
            this.initializeCharacterBuilder();
        }
    }
    
    finishCharacterCreation() {
        if (this.playerCharacter.name.length >= 2 && this.playerCharacter.race) {
            this.playerCharacter.isComplete = true;
            this.gameState.characterCreated = true;
            
            // Update character panel with the created character
            this.updateCharacterDisplay();
            
            // Hide character builder and continue to class selection
            this.hideCharacterBuilder();
            this.loadEntry('class_selection'); // Continue with the existing flow
        }
    }
    
    // === ABILITY SCORES MODAL METHODS ===
    
    setupAbilityScoresListeners() {
        // Ability score method selection
        document.querySelectorAll('input[name="score-method"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleScoreMethodChange());
        });
        
        // Ability score selects
        ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(ability => {
            document.getElementById(`${ability}-select`).addEventListener('change', () => this.updateAbilityScores());
        });
        
        // Score action buttons
        document.getElementById('randomize-scores-btn').addEventListener('click', () => this.randomizeScores());
        document.getElementById('reset-scores-btn').addEventListener('click', () => this.resetAbilityScores());
        
        // Ability scores modal actions
        document.getElementById('ability-scores-reset').addEventListener('click', () => this.resetAbilityScores());
        document.getElementById('ability-scores-continue').addEventListener('click', () => this.finishAbilityScores());
    }
    
    showAbilityScoresModal() {
        console.log('🎲 Showing ability scores modal');
        const modal = document.getElementById('ability-scores-modal');
        modal.classList.remove('hidden');
        
        // Initialize ability scores
        this.resetAbilityScores();
    }
    
    hideAbilityScoresModal() {
        const modal = document.getElementById('ability-scores-modal');
        modal.classList.add('hidden');
    }
    
    handleScoreMethodChange() {
        const method = document.querySelector('input[name="score-method"]:checked').value;
        
        if (method === 'random') {
            this.randomizeScores();
        } else {
            this.resetAbilityScores();
        }
    }
    
    randomizeScores() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            // Roll 3d6 for each ability
            const roll = this.rollDice(3, 6);
            this.playerCharacter.stats[ability] = roll;
            
            // Update the select element
            const select = document.getElementById(`${ability}-select`);
            select.innerHTML = `<option value="${roll}" selected>${roll}</option>`;
        });
        
        this.updateAbilityScores();
    }
    
    resetAbilityScores() {
        // Standard array values available for assignment
        this.availableScores = [15, 14, 13, 12, 10, 8];
        this.usedScores = [];
        
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        // Reset all ability scores to default values
        abilities.forEach(ability => {
            this.playerCharacter.stats[ability] = 10; // Default value
            this.playerCharacter.modifiers[ability] = 0; // Default modifier
        });
        
        // Reset all select elements to blank state
        this.updateAllAbilitySelects();
        this.updateAbilityScores();
    }
    
    updateAllAbilitySelects() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        // Collect currently selected values
        const selectedValues = [];
        abilities.forEach(ability => {
            const select = document.getElementById(`${ability}-select`);
            if (select.value) {
                selectedValues.push(parseInt(select.value));
            }
        });
        
        // Update available scores
        this.usedScores = selectedValues;
        this.availableScores = [15, 14, 13, 12, 10, 8].filter(score => !this.usedScores.includes(score));
        
        abilities.forEach(ability => {
            const select = document.getElementById(`${ability}-select`);
            const currentValue = select.value;
            
            // Clear the select
            select.innerHTML = '';
            
            // Add blank option
            const blankOption = document.createElement('option');
            blankOption.value = '';
            blankOption.textContent = 'Select...';
            blankOption.selected = !currentValue;
            select.appendChild(blankOption);
            
            // Add available scores
            this.availableScores.forEach(score => {
                const option = document.createElement('option');
                option.value = score;
                option.textContent = score;
                select.appendChild(option);
            });
            
            // Add currently selected score if it exists
            if (currentValue) {
                const option = document.createElement('option');
                option.value = currentValue;
                option.textContent = currentValue;
                option.selected = true;
                select.appendChild(option);
            }
        });
    }
    
    updateAbilityScores() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            const select = document.getElementById(`${ability}-select`);
            const value = parseInt(select.value) || 10; // Default to 10 if no value selected
            this.playerCharacter.stats[ability] = value;
            
            // Calculate modifier
            const modifier = Math.floor((value - 10) / 2);
            this.playerCharacter.modifiers[ability] = modifier;
            
            // Update modifier display
            const modifierEl = document.getElementById(`${ability}-modifier`);
            modifierEl.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        });
        
        // Update available scores for all selects when any score changes
        this.updateAllAbilitySelects();
    }
    
    finishAbilityScores() {
        console.log('🎯 Finishing ability scores and starting adventure');
        
        // Validate that all ability scores are assigned
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const unassignedAbilities = [];
        
        abilities.forEach(ability => {
            const select = document.getElementById(`${ability}-select`);
            if (!select.value) {
                unassignedAbilities.push(ability.charAt(0).toUpperCase() + ability.slice(1));
            }
        });
        
        if (unassignedAbilities.length > 0) {
            alert(`Please assign scores to all abilities. Missing: ${unassignedAbilities.join(', ')}`);
            return;
        }
        
        // Validate that all standard array values are used
        const usedValues = abilities.map(ability => {
            const select = document.getElementById(`${ability}-select`);
            return parseInt(select.value);
        }).sort((a, b) => b - a);
        
        const standardArray = [15, 14, 13, 12, 10, 8];
        const usedStandardArray = usedValues.filter(value => standardArray.includes(value)).sort((a, b) => b - a);
        
        if (JSON.stringify(usedStandardArray) !== JSON.stringify(standardArray)) {
            alert('Please use each standard array value (15, 14, 13, 12, 10, 8) exactly once.');
            return;
        }
        
        // Mark character as fully complete
        this.playerCharacter.isComplete = true;
        this.gameState.characterCreated = true;
        
        // Update character display
        this.updateCharacterDisplay();
        
        // Hide ability scores modal
        this.hideAbilityScoresModal();
        
        // Start the adventure
        this.loadEntry('1');
    }

    initializeMusicPlaylists() {
        gameLogger.info('Initializing music playlists...');
        
        // Create ambient music audio elements
        this.ambientPlaylist.forEach((src, index) => {
            const audio = document.createElement('audio');
            audio.src = src;
            audio.volume = 0.3;
            audio.preload = 'none'; // Don't preload to save bandwidth
            
            // Add ended event listener for playlist progression
            audio.addEventListener('ended', () => {
                this.playNextAmbientTrack();
            });
            
            audio.addEventListener('error', (e) => {
                gameLogger.error(`Ambient track ${index + 1} failed to load:`, e);
            });
            
            // First track shows music is ready
            if (index === 0) {
                audio.addEventListener('canplaythrough', () => {
                    gameLogger.info('First ambient track loaded and ready to play');
                    this.showMusicPrompt();
                });
            }
            
            this.ambientAudioElements.push(audio);
        });
        
        // Create battle music audio elements
        this.battlePlaylist.forEach((src, index) => {
            const audio = document.createElement('audio');
            audio.src = src;
            audio.volume = 0.4;
            audio.preload = 'none';
            
            // Add ended event listener for playlist progression
            audio.addEventListener('ended', () => {
                this.playNextBattleTrack();
            });
            
            audio.addEventListener('error', (e) => {
                gameLogger.error(`Battle track ${index + 1} failed to load:`, e);
            });
            
            this.battleAudioElements.push(audio);
        });
        
        // Set current tracks
        this.currentAmbientAudio = this.ambientAudioElements[0];
        this.currentBattleAudio = this.battleAudioElements[0];
        
        gameLogger.info(`Music system initialized: ${this.ambientPlaylist.length} ambient tracks, ${this.battlePlaylist.length} battle tracks`);
    }

    playNextAmbientTrack() {
        if (!this.gameState.musicEnabled || this.gameState.inBattle) return;
        
        // Stop current track
        if (this.currentAmbientAudio) {
            this.currentAmbientAudio.pause();
            this.currentAmbientAudio.currentTime = 0;
        }
        
        // Move to next track
        this.gameState.currentAmbientTrack = (this.gameState.currentAmbientTrack + 1) % this.ambientPlaylist.length;
        this.currentAmbientAudio = this.ambientAudioElements[this.gameState.currentAmbientTrack];
        
        gameLogger.info(`Playing next ambient track: ${this.gameState.currentAmbientTrack + 1}/${this.ambientPlaylist.length}`);
        
        // Play next track
        this.currentAmbientAudio.play().catch(error => {
            gameLogger.error('Could not play next ambient track:', error);
        });
    }

    playNextBattleTrack() {
        if (!this.gameState.musicEnabled || !this.gameState.inBattle) return;
        
        // Stop current track
        if (this.currentBattleAudio) {
            this.currentBattleAudio.pause();
            this.currentBattleAudio.currentTime = 0;
        }
        
        // Move to next track
        this.gameState.currentBattleTrackIndex = (this.gameState.currentBattleTrackIndex + 1) % this.battlePlaylist.length;
        this.currentBattleAudio = this.battleAudioElements[this.gameState.currentBattleTrackIndex];
        
        gameLogger.info(`Playing next battle track: ${this.gameState.currentBattleTrackIndex + 1}/${this.battlePlaylist.length}`);
        
        // Play next track
        this.currentBattleAudio.play().catch(error => {
            gameLogger.error('Could not play next battle track:', error);
        });
    }

    loadEntry(entryId) {
        gameLogger.info(`Loading entry: ${entryId}`);
        gameLogger.info('Character data available:', !!this.characterData);
        gameLogger.info('Adventure data available:', !!this.adventureData);
        
        // First check character creation entries
        if (this.characterData && this.characterData.entries && this.characterData.entries[entryId]) {
            this.currentEntry = this.characterData.entries[entryId];
            this.displayEntry();
            return;
        }

        // Then check adventure entries
        if (this.adventureData && this.adventureData.entries && this.adventureData.entries[entryId]) {
            this.currentEntry = this.adventureData.entries[entryId];
            this.displayEntry();
            return;
        }

        console.error(`Entry not found: ${entryId}`);
        this.showError(`Entry not found: ${entryId}`);
    }

    displayEntry() {
        gameLogger.info('displayEntry called with current entry:', this.currentEntry?.id);
        if (!this.currentEntry) {
            gameLogger.error('No current entry to display');
            return;
        }

        // Update entry title and narrative
        document.getElementById('entry-title').textContent = this.currentEntry.title;
        
        // Display main narrative with character name templating
        const narrativeElement = document.getElementById('entry-narrative');
        let narrativeText = this.currentEntry.narrative;
        
        // Replace ${characterData.name} with actual character name
        if (this.playerCharacter.name) {
            narrativeText = narrativeText.replace(/\$\{characterData\.name\}/g, this.playerCharacter.name);
        }
        
        narrativeElement.innerHTML = `<p>${narrativeText}</p>`;
        
        // Add narrative continuation if present
        if (this.currentEntry.narrative_continuation) {
            narrativeElement.innerHTML += `<p>${this.currentEntry.narrative_continuation}</p>`;
        }

        // Display conditional text
        this.displayConditionalText();

        // Display choices
        this.displayChoices();

        // Handle music - if entry has specific music, use it; otherwise check for battle scenarios
        if (this.currentEntry.music) {
            // Entry has specific music file defined - use it exclusively
            this.handleEntryMusic();
        } else {
            // No specific music - use battle detection system
            this.checkForBattleScenario();
        }

        // Update current entry ID in game state
        this.gameState.currentEntryId = this.currentEntry.id;

        // Scroll to top
        window.scrollTo(0, 0);
    }

    displayConditionalText() {
        const conditionalElement = document.getElementById('conditional-text');
        conditionalElement.innerHTML = '';

        if (!this.currentEntry.conditional_text) {
            return;
        }

        let conditionalContent = '';

        // Process species-specific text
        if (this.currentEntry.conditional_text.species && this.gameState.species) {
            const speciesText = this.currentEntry.conditional_text.species[this.gameState.species];
            if (speciesText) {
                conditionalContent += `<p class="text-italic species-text"><span class="condition-label">🏛️ ${this.gameState.species}:</span> ${speciesText}</p>`;
            }
        }

        // Process class-specific text
        if (this.currentEntry.conditional_text.class && this.gameState.class) {
            const classText = this.currentEntry.conditional_text.class[this.gameState.class];
            if (classText) {
                const classIcon = this.getClassIcon(this.gameState.class);
                conditionalContent += `<p class="text-italic class-text"><span class="condition-label">${classIcon} ${this.gameState.class}:</span> ${classText}</p>`;
            }
        }

        // Process subclass-specific text (if present in data)
        if (this.currentEntry.conditional_text.subclass && this.gameState.subclass) {
            const subclassText = this.currentEntry.conditional_text.subclass[this.gameState.subclass];
            if (subclassText) {
                conditionalContent += `<p class="text-italic subclass-text"><span class="condition-label">✨ ${this.gameState.subclass}:</span> ${subclassText}</p>`;
            }
        }

        // Process background-specific text
        if (this.currentEntry.conditional_text.background && this.gameState.background) {
            const backgroundText = this.currentEntry.conditional_text.background[this.gameState.background];
            if (backgroundText) {
                conditionalContent += `<p class="text-italic background-text"><span class="condition-label">📜 ${this.gameState.background}:</span> ${backgroundText}</p>`;
            }
        }

        if (conditionalContent) {
            conditionalElement.innerHTML = conditionalContent;
        }
    }

    displayChoices() {
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = '';

        if (!this.currentEntry.choices || this.currentEntry.choices.length === 0) {
            choicesContainer.innerHTML = '<p>No choices available. This might be an end point.</p>';
            return;
        }

        // Check if this is the species selection entry
        const isSpeciesSelection = this.currentEntry.id === 'species_selection';
        
        if (isSpeciesSelection) {
            this.displayRaceSelectionUI();
        } else {
            // Regular choice buttons for non-race selection
            this.currentEntry.choices.forEach((choice, index) => {
                const button = document.createElement('button');
                button.className = 'choice-button';
                button.innerHTML = `
                    <div class="corner top-left"></div>
                    ${choice.text}
                `;
                
                button.addEventListener('click', () => {
                    this.handleChoice(choice, index);
                });

                choicesContainer.appendChild(button);
            });
        }
    }

    displayRaceSelectionUI() {
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.className = 'choice-area race-selection-area';
        
        // Enhanced race data with rich D&D lore descriptions
        this.raceData = {
            'Human': {
                image: 'assets/Images/HumanRace.png',
                icon: '🏛️',
                subtitle: 'The Ambitious Wanderers',
                description: 'Adaptable and ambitious, humans thrive in every corner of Krynn, shaping the world through sheer determination.',
                traits: [
                    'Versatile culture & values',
                    'Extra skill or feat flexibility',
                    'Broad class compatibility',
                    'Found in every region of Krynn'
                ]
            },
            'Qualinesti Elf': {
                image: 'assets/Images/Elf-QualinestiRace.png',
                icon: '🌿',
                subtitle: 'The Woodland Speakers',
                description: 'Golden-haired forest dwellers who bridge the gap between elven and human worlds. They value diplomacy and natural harmony above all.',
                traits: [
                    'Keen senses & fey ancestry',
                    'Longsword & longbow proficiency',
                    'Natural diplomats & woodland guides',
                    'Immunity to magical sleep effects'
                ]
            },
            'Silvanesti Elf': {
                image: 'assets/Images/Elf-SylvanestiRace.png',
                icon: '✨',
                subtitle: 'The Ancient Nobles',
                description: 'Proud and ancient, the silver-haired Silvanesti consider themselves the pinnacle of elven civilization. Their mastery of magic is legendary.',
                traits: [
                    'Ancient magical heritage',
                    'Longsword & longbow proficiency',
                    'Centuries of accumulated wisdom',
                    'Natural resistance to enchantments'
                ]
            },
            'Hill Dwarf': {
                image: 'assets/Images/HillDwarvesRace.png',
                icon: '⛏️',
                subtitle: 'The Merchant Craftsmen',
                description: 'Practical and outgoing, hill dwarves are master craftsmen and traders who build communities alongside humans. Their honest nature makes them valued allies.',
                traits: [
                    'Exceptional constitution & poison resistance',
                    'Battleaxe & warhammer proficiency',
                    'Master craftsmen & skilled traders',
                    'Darkvision & natural stoneworking'
                ]
            },
            'Mountain Dwarf': {
                image: 'assets/Images/MountainDwarvesRace.png',
                icon: '🏔️',
                subtitle: 'The Forge Masters',
                description: 'Militaristic and traditional, mountain dwarves dwell in underground cities carved from living rock. They are master smiths creating legendary weapons and armor.',
                traits: [
                    'Natural armor proficiency & weapon training',
                    'Battleaxe & warhammer proficiency',
                    'Master smiths & underground engineers',
                    'Darkvision & resistance to poison'
                ]
            },
            'Kender': {
                image: 'assets/Images/KenderRace.png',
                icon: '🎒',
                subtitle: 'The Fearless Wanderers',
                description: 'Small, childlike beings with insatiable curiosity and complete fearlessness. Their "borrowing" habits and storytelling talents often lead to unexpected adventures.',
                traits: [
                    'Completely immune to fear effects',
                    'Natural skill with slings & lockpicking',
                    'Incredible luck & knack for finding things',
                    'Taunt ability to distract enemies'
                ]
            },
            'Gnome': {
                image: 'assets/Images/GnomesRace.png',
                icon: '🔬',
                subtitle: 'The Tinker Sages',
                description: 'Small, intelligent beings with endless fascination for learning and invention. Natural tinkerers and scholars, equally at home in laboratories or libraries.',
                traits: [
                    'Natural affinity for illusion magic',
                    'Proficiency with tinker tools & alchemy',
                    'Keen intellect & scholarly pursuits',
                    'Small size advantage & gnomish cunning'
                ]
            }
        };

        // Create the race selection container
        const raceSelectionContainer = document.createElement('div');
        raceSelectionContainer.className = 'race-selection-container';

        // Create the race list
        const raceList = document.createElement('div');
        raceList.className = 'race-list';

        // Create race options
        this.currentEntry.choices.forEach((choice, index) => {
            const speciesName = choice.text.split(' - ')[0];
            const raceInfo = this.raceData[speciesName];
            
            if (raceInfo) {
                const raceOption = document.createElement('div');
                raceOption.className = 'race-option';
                raceOption.innerHTML = `
                    <div class="corner top-left"></div>
                    <div class="race-icon">${raceInfo.icon}</div>
                    <div class="race-name">${speciesName}</div>
                `;

                // Add click handler to open modal
                raceOption.addEventListener('click', () => {
                    this.openRaceModal(speciesName, raceInfo, choice, index);
                });

                raceList.appendChild(raceOption);
            }
        });

        // Assemble the UI
        raceSelectionContainer.appendChild(raceList);
        choicesContainer.appendChild(raceSelectionContainer);

        // Create the modal (initially hidden)
        this.createRaceModal();
    }

    createRaceModal() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'race-modal-overlay';
        modalOverlay.id = 'race-modal-overlay';
        
        // Create modal content
        modalOverlay.innerHTML = `
            <div class="race-modal">
                <div class="race-modal-header">
                    <button class="race-modal-close" id="race-modal-close">×</button>
                    <h2 class="race-modal-title" id="race-modal-title">Race Name</h2>
                    <p class="race-modal-subtitle" id="race-modal-subtitle">Subtitle</p>
                </div>
                <div class="race-modal-image-container">
                    <img src="" alt="" class="race-modal-image" id="race-modal-image">
                </div>
                <div class="race-modal-content">
                    <p class="race-modal-description" id="race-modal-description">Description</p>
                    <div class="race-modal-traits">
                        <div class="race-modal-traits-title">Racial Traits</div>
                        <ul class="race-modal-traits-list" id="race-modal-traits-list">
                        </ul>
                    </div>
                </div>
                <div class="race-modal-actions">
                    <button class="race-modal-button race-modal-button--primary" id="race-modal-choose">
                        Choose this Race
                    </button>
                    <button class="race-modal-button race-modal-button--secondary" id="race-modal-back">
                        Go Back
                    </button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modalOverlay);
        
        // Store reference
        this.raceModalOverlay = modalOverlay;
        
        // Add event listeners
        this.setupRaceModalListeners();
    }

    setupRaceModalListeners() {
        const overlay = this.raceModalOverlay;
        const closeBtn = overlay.querySelector('#race-modal-close');
        const backBtn = overlay.querySelector('#race-modal-back');
        const chooseBtn = overlay.querySelector('#race-modal-choose');
        
        // Close modal handlers
        const closeModal = () => {
            this.closeRaceModal();
        };
        
        closeBtn.addEventListener('click', closeModal);
        backBtn.addEventListener('click', closeModal);
        
        // Close when clicking outside modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // ESC key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeModal();
            }
        });
        
        // Choose race handler
        chooseBtn.addEventListener('click', (e) => {
            gameLogger.info('Choose race button clicked!');
            e.preventDefault();
            e.stopPropagation();
            this.selectRace();
        });
    }

    openRaceModal(raceName, raceInfo, choice, index) {
        gameLogger.info('Opening race modal for:', raceName);
        gameLogger.info('Choice data received:', choice);
        gameLogger.info('Index received:', index);
        
        // Store current selection
        this.currentRaceSelection = {
            name: raceName,
            info: raceInfo,
            choice: choice,
            index: index
        };
        
        console.log('Stored currentRaceSelection:', this.currentRaceSelection);
        
        // Update modal content
        const modal = this.raceModalOverlay;
        const title = modal.querySelector('#race-modal-title');
        const subtitle = modal.querySelector('#race-modal-subtitle');
        const image = modal.querySelector('#race-modal-image');
        const description = modal.querySelector('#race-modal-description');
        const traitsList = modal.querySelector('#race-modal-traits-list');
        
        title.textContent = raceName;
        subtitle.textContent = raceInfo.subtitle;
        image.src = raceInfo.image;
        image.alt = `${raceName} portrait`;
        description.textContent = raceInfo.description;
        
        // Populate traits
        traitsList.innerHTML = '';
        raceInfo.traits.forEach(trait => {
            const li = document.createElement('li');
            li.textContent = trait;
            traitsList.appendChild(li);
        });
        
        // Show modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    closeRaceModal() {
        gameLogger.info('Closing race modal');
        const modal = this.raceModalOverlay;
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Clear selection (but only after a delay to allow selectRace to complete)
        setTimeout(() => {
            gameLogger.info('Clearing currentRaceSelection');
            this.currentRaceSelection = null;
        }, 100);
    }

    selectRace() {
        if (!this.currentRaceSelection) {
            gameLogger.error('No race selection found - this should not happen!');
            return;
        }
        
        console.log('🏛️ Selecting race:', this.currentRaceSelection.name);
        gameLogger.info('Selecting race:', this.currentRaceSelection.name);
        gameLogger.info('Choice object:', this.currentRaceSelection.choice);
        
        // Store the selected race in player character
        this.playerCharacter.race = this.currentRaceSelection.name;
        
        // Store the selected race in game state as well
        this.gameState.species = this.currentRaceSelection.name;
        this.selectedRace = this.currentRaceSelection.name;
        
        // Close modal
        this.closeRaceModal();
        
        // Show character builder instead of continuing to class selection
        console.log('🛠️ About to show character builder after race selection');
        this.showCharacterBuilder();
        this.updateRaceDisplay();
        this.updateContinueButtonState();
    }

    handleChoice(choice, index) {
        gameLogger.info('handleChoice called with choice:', choice);
        gameLogger.info('handleChoice called with index:', index);

        // Disable all choice buttons and race options to prevent multiple clicks
        const buttons = document.querySelectorAll('.choice-button');
        buttons.forEach(btn => btn.disabled = true);
        
        const raceOptions = document.querySelectorAll('.race-option');
        raceOptions.forEach(option => {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.6';
        });

        // Handle character creation choices that set state
        if (choice.sets) {
            Object.keys(choice.sets).forEach(key => {
                this.gameState[key] = choice.sets[key];
                gameLogger.info(`Set ${key} to ${choice.sets[key]}`);
            });
            this.updateCharacterDisplay();
        }

        // Handle skill checks
        if (choice.skill_check) {
            this.showSkillCheckModal(choice.skill_check, choice);
            return;
        }

        // Navigate to destination
        if (choice.destination) {
            gameLogger.info('Navigating to destination:', choice.destination);
            
            // Check if we're finishing background selection (going to entry 100)
            if (choice.destination === '100' && this.gameState.background) {
                console.log('🎯 Background selection complete, showing ability scores modal');
                setTimeout(() => {
                    this.showAbilityScoresModal();
                }, 500);
            } else {
                setTimeout(() => {
                    gameLogger.info('Loading entry:', choice.destination);
                    this.loadEntry(choice.destination);
                }, 500);
            }
        } else {
            gameLogger.error('No destination found in choice:', choice);
        }
    }

    rollSkillCheck() {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + this.getSkillModifier(this.currentSkillCheck.skill);
        const success = total >= this.currentSkillCheck.dc;

        const rollResult = document.getElementById('roll-result');
        const resultDiv = document.getElementById('skill-check-result');
        const rollButton = document.getElementById('roll-skill-check');

        rollResult.innerHTML = `
            <strong>Roll Result:</strong> ${roll} + ${this.getSkillModifier(this.currentSkillCheck.skill)} = ${total}<br>
            <strong>DC:</strong> ${this.currentSkillCheck.dc}<br>
            <strong>Result:</strong> ${success ? 'SUCCESS!' : 'FAILURE'}
        `;

        resultDiv.className = success ? 'skill-result success' : 'skill-result failure';
        resultDiv.classList.remove('hidden');
        rollButton.style.display = 'none';

        // Store result for navigation
        this.skillCheckResult = success;
    }

    getSkillModifier(skill) {
        // Map skills to ability scores
        const skillAbilities = {
            'Survival': 'wisdom',
            'Perception': 'wisdom',
            'Investigation': 'intelligence',
            'Insight': 'wisdom',
            'Deception': 'charisma',
            'Persuasion': 'charisma',
            'Stealth': 'dexterity',
            'Strength': 'strength',
            'Medicine': 'wisdom'
        };
        
        const ability = skillAbilities[skill] || 'wisdom';
        return this.playerCharacter.modifiers[ability] || 0;
    }

    updateCharacterDisplay() {
        // Update character name display
        document.getElementById('character-name').textContent = this.playerCharacter.name || 'Not Set';
        
        // Update species display
        document.getElementById('species').textContent = this.playerCharacter.race || this.gameState.species || 'Not Selected';
        
        // Enhanced class display with subclass details
        let classDisplay = this.gameState.class || 'Not Selected';
        const classElement = document.getElementById('class');
        const subclassElement = document.getElementById('subclass-details');
        
        if (this.gameState.subclass && this.gameState.class) {
            if (this.gameState.class === 'Moon Sorcerer') {
                classDisplay = `${this.gameState.class}`;
                subclassElement.textContent = `${this.gameState.subclass} - Lunar magic flows through your veins`;
            } else {
                classDisplay = `${this.gameState.class}`;
                subclassElement.textContent = `${this.gameState.subclass} - ${this.getSubclassDescription(this.gameState.class, this.gameState.subclass)}`;
            }
            subclassElement.classList.remove('hidden');
        } else {
            subclassElement.classList.add('hidden');
        }
        classElement.textContent = classDisplay;
        
        // Update background display
        document.getElementById('background').textContent = this.gameState.background || 'Not Selected';
        
        // Update progression display
        this.updateProgressionDisplay();
    }

    getSubclassDescription(characterClass, subclass) {
        const descriptions = {
            'Sorcerer': {
                'Draconic Bloodline': 'Ancient dragon magic courses through your bloodline',
                'Wild Magic': 'Chaotic magical energies surge unpredictably within you',
                'Divine Soul': 'Touched by divine power, blessed by the gods themselves'
            },
            'Warlock': {
                'The Great Wyrm': 'Bound in service to an ancient and powerful dragon',
                'The Fiend': 'Your soul is pledged to a denizen of the Lower Planes',
                'The Stellar Powers': 'Connected to the cosmic forces beyond the world'
            }
        };
        
        return descriptions[characterClass]?.[subclass] || 'A specialized practitioner of your chosen path';
    }

    getClassIcon(characterClass) {
        const icons = {
            'Fighter': '⚔️',
            'Wizard': '🔮',
            'Cleric': '⛪',
            'Sorcerer': '✨',
            'Moon Sorcerer': '🌙',
            'Warlock': '👁️',
            'Rogue': '🗡️',
            'Paladin': '🛡️'
        };
        
        return icons[characterClass] || '🎭';
    }

    updateProgressionDisplay() {
        const progressionElement = document.getElementById('character-progression');
        const levelElement = document.getElementById('character-level');
        const xpElement = document.getElementById('character-xp');
        
        if (this.gameState.species && this.gameState.class && this.gameState.background) {
            progressionElement.classList.remove('hidden');
            levelElement.textContent = `Level ${this.gameState.level}`;
            xpElement.textContent = `${this.gameState.xp} XP`;
        } else {
            progressionElement.classList.add('hidden');
        }
    }

    async saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                playerCharacter: this.playerCharacter,
                timestamp: new Date().toISOString()
            };
            
            // Check if we're in Electron environment
            if (typeof require !== 'undefined' && window.process && window.process.type === 'renderer') {
                const { ipcRenderer } = require('electron');
                const result = await ipcRenderer.invoke('save-game-data', saveData);
                if (result.success) {
                    alert('Game saved successfully!');
                } else if (!result.canceled) {
                    alert('Error saving game: ' + (result.error || 'Unknown error'));
                }
            } else {
                // Fallback to localStorage for web version
                localStorage.setItem('dragonlance-save', JSON.stringify(saveData));
                alert('Game saved successfully!');
            }
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game.');
        }
    }

    async loadGame() {
        try {
            let saveData = null;
            
            // Check if we're in Electron environment
            if (typeof require !== 'undefined' && window.process && window.process.type === 'renderer') {
                const { ipcRenderer } = require('electron');
                const result = await ipcRenderer.invoke('load-game-data');
                if (result.success) {
                    saveData = result.data;
                } else if (!result.canceled) {
                    alert('Error loading game: ' + (result.error || 'Unknown error'));
                    return;
                } else {
                    return; // User canceled
                }
            } else {
                // Fallback to localStorage for web version
                const storedData = localStorage.getItem('dragonlance-save');
                if (!storedData) {
                    alert('No saved game found.');
                    return;
                }
                saveData = JSON.parse(storedData);
            }

            if (saveData) {
                this.gameState = saveData.gameState;
                if (saveData.playerCharacter) {
                    this.playerCharacter = saveData.playerCharacter;
                }
                this.updateCharacterDisplay();
                this.loadEntry(this.gameState.currentEntryId);
                alert('Game loaded successfully!');
            }
        } catch (error) {
            console.error('Error loading game:', error);
            alert('Failed to load game.');
        }
    }

    restartGame() {
        if (confirm('Are you sure you want to restart? All progress will be lost.')) {
            // Stop all music before resetting
            this.endBattleMusic();
            if (this.currentAmbientAudio && !this.currentAmbientAudio.paused) {
                this.currentAmbientAudio.pause();
            }
            
            this.gameState = {
                species: null,
                class: null,
                subclass: null,
                background: null,
                currentEntryId: 'species_selection',
                inventory: [],
                xp: 0,
                level: 1,
                musicEnabled: false,
                inBattle: false,
                currentBattleTrack: null,
                currentAmbientTrack: 0,
                currentBattleTrackIndex: 0
            };
            
            // Reset current audio references
            this.currentAmbientAudio = this.ambientAudioElements[0];
            this.currentBattleAudio = this.battleAudioElements[0];
            
            this.updateCharacterDisplay();
            this.loadEntry('species_selection');
            
            // Restart music if it was enabled
            setTimeout(() => {
                if (this.gameState.musicEnabled && this.currentAmbientAudio) {
                    this.playMusic();
                }
            }, 500);
        }
    }
    
    handleEntryMusic() {
        if (!this.currentEntry || !this.currentEntry.music || !this.gameState.musicEnabled) {
            return;
        }
        
        const musicFile = this.currentEntry.music;
        console.log('🎵 Entry has music file:', musicFile);
        
        // Check if it's a mystery/investigation music file
        if (musicFile.includes('Mystery')) {
            console.log('🔍 Playing mystery music:', musicFile);
            this.playMysteryMusic(musicFile);
        }
        // Check if it's a battle music file
        else if (musicFile.includes('Battle')) {
            console.log('⚔️ Playing battle music:', musicFile);
            this.playBattleMusic(musicFile);
        }
        // For other music files, we could add ambient handling here
    }
    
    playMysteryMusic(musicFile) {
        // Stop current music
        if (this.gameState.inBattle) {
            this.endBattleMusic();
        }
        if (this.currentAmbientAudio && !this.currentAmbientAudio.paused) {
            this.currentAmbientAudio.pause();
        }
        
        // Create or reuse mystery audio element
        if (!this.mysteryAudio) {
            this.mysteryAudio = document.createElement('audio');
            this.mysteryAudio.volume = 0.3;
            this.mysteryAudio.addEventListener('ended', () => {
                // Resume ambient music when mystery music ends
                if (this.gameState.musicEnabled && this.currentAmbientAudio) {
                    this.currentAmbientAudio.play().catch(error => {
                        gameLogger.error('Could not resume ambient music after mystery:', error);
                    });
                }
            });
        }
        
        this.mysteryAudio.src = musicFile;
        this.mysteryAudio.currentTime = 0;
        this.mysteryAudio.play().catch(error => {
            gameLogger.error('Could not play mystery music:', error);
        });
    }
    
    playBattleMusic(musicFile) {
        if (!this.gameState.musicEnabled) return;
        
        // Stop current music
        if (this.currentAmbientAudio && !this.currentAmbientAudio.paused) {
            this.currentAmbientAudio.pause();
        }
        
        // Stop mystery music if playing
        if (this.mysteryAudio && !this.mysteryAudio.paused) {
            this.mysteryAudio.pause();
        }
        
        // Create or reuse specific battle audio element
        if (!this.specificBattleAudio) {
            this.specificBattleAudio = document.createElement('audio');
            this.specificBattleAudio.volume = 0.4;
            this.specificBattleAudio.addEventListener('ended', () => {
                // Resume ambient music when specific battle music ends
                if (this.gameState.musicEnabled && this.currentAmbientAudio) {
                    this.currentAmbientAudio.play().catch(error => {
                        gameLogger.error('Could not resume ambient music after battle:', error);
                    });
                }
            });
        }
        
        console.log('🎵 Playing specific battle music:', musicFile);
        this.specificBattleAudio.src = musicFile;
        this.specificBattleAudio.currentTime = 0;
        this.specificBattleAudio.play().catch(error => {
            gameLogger.error('Could not play specific battle music:', error);
        });
        
        // Set battle state
        this.gameState.inBattle = true;
    }

    checkForBattleScenario() {
        if (!this.currentEntry) return;

        // Battle keywords to detect combat scenarios
        const battleKeywords = [
            'combat', 'battle', 'fight', 'attack', 'enemies', 'skeletal warriors',
            'bandits', 'combat erupts', 'clash of steel', 'fight for your life',
            'engaging', 'charge', 'melee attack', 'weapon', 'defend', 'skeletons',
            'emerge', 'advance with', 'rusted weapons', 'combat becomes unavoidable',
            'survival depends on', 'fighting', 'strikes back', 'dodge attacks'
        ];

        // Check title and narrative for battle keywords
        const titleText = this.currentEntry.title ? this.currentEntry.title.toLowerCase() : '';
        const narrativeText = this.currentEntry.narrative ? this.currentEntry.narrative.toLowerCase() : '';
        const fullText = titleText + ' ' + narrativeText;

        const isBattleEntry = battleKeywords.some(keyword => fullText.includes(keyword));

        // Specific entry IDs that are known battle scenarios
        const battleEntryIds = ['15', '3']; // Entry 15: "Combat Erupts", Entry 3: "Into the Shadowed Depths"
        const isBattleById = battleEntryIds.includes(this.currentEntry.id);

        const shouldBeBattle = isBattleEntry || isBattleById;

        if (shouldBeBattle && !this.gameState.inBattle) {
            console.log('🗡️ Battle scenario detected! Starting battle music...');
            this.startBattleMusic();
        } else if (!shouldBeBattle && this.gameState.inBattle) {
            console.log('🎵 Battle ended. Returning to ambient music...');
            this.endBattleMusic();
        }
    }

    startBattleMusic() {
        if (!this.gameState.musicEnabled) return;

        this.gameState.inBattle = true;
        
        // Pause ambient music
        if (this.currentAmbientAudio && !this.currentAmbientAudio.paused) {
            this.currentAmbientAudio.pause();
        }

        // Start with first battle track or continue from current
        this.currentBattleAudio = this.battleAudioElements[this.gameState.currentBattleTrackIndex];
        
        if (this.currentBattleAudio) {
            this.gameState.currentBattleTrack = this.gameState.currentBattleTrackIndex + 1;
            this.currentBattleAudio.currentTime = 0; // Start from beginning
            this.currentBattleAudio.play().then(() => {
                gameLogger.info(`⚔️ Battle music ${this.gameState.currentBattleTrack} started!`);
                this.updateMusicButtonForBattle();
            }).catch(error => {
                gameLogger.error('Could not play battle music:', error);
            });
        }
    }

    endBattleMusic() {
        this.gameState.inBattle = false;
        this.gameState.currentBattleTrack = null;

        // Stop all battle tracks
        this.battleAudioElements.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        // Stop specific battle music if playing
        if (this.specificBattleAudio && !this.specificBattleAudio.paused) {
            this.specificBattleAudio.pause();
            this.specificBattleAudio.currentTime = 0;
        }

        // Resume ambient music if enabled
        if (this.gameState.musicEnabled && this.currentAmbientAudio) {
            this.currentAmbientAudio.play().then(() => {
                gameLogger.info('🎵 Ambient music resumed');
                this.updateMusicButton();
            }).catch(error => {
                gameLogger.error('Could not resume ambient music:', error);
            });
        }
    }

    getCurrentBattleTrack() {
        if (!this.gameState.inBattle || !this.currentBattleAudio) return null;
        return this.currentBattleAudio;
    }

    toggleMusic() {
        if (this.gameState.musicEnabled) {
            this.pauseMusic();
            // Also pause battle music if playing
            if (this.gameState.inBattle) {
                this.endBattleMusic();
            }
        } else {
            this.playMusic();
            // If we're in battle, start battle music instead
            if (this.gameState.inBattle) {
                this.startBattleMusic();
            }
        }
    }

    playMusic() {
        if (this.currentAmbientAudio) {
            this.currentAmbientAudio.play().then(() => {
                this.gameState.musicEnabled = true;
                this.updateMusicButton();
                gameLogger.info('🎵 Ambient music started automatically');
            }).catch(error => {
                gameLogger.error('Could not auto-play ambient music:', error);
                // Show user-friendly message for autoplay restrictions
                if (error.name === 'NotAllowedError') {
                    gameLogger.info('Autoplay prevented - user interaction required');
                    this.showMusicPrompt();
                    // Keep musicEnabled true so it will play when user clicks
                    this.gameState.musicEnabled = true;
                    this.updateMusicButton();
                }
            });
        }
    }

    pauseMusic() {
        // Pause ambient music
        if (this.currentAmbientAudio) {
            this.currentAmbientAudio.pause();
        }
        
        // Pause all battle music
        this.battleAudioElements.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
            }
        });
        
        // Pause specific battle music
        if (this.specificBattleAudio && !this.specificBattleAudio.paused) {
            this.specificBattleAudio.pause();
        }
        
        // Pause mystery music
        if (this.mysteryAudio && !this.mysteryAudio.paused) {
            this.mysteryAudio.pause();
        }
        
        this.gameState.musicEnabled = false;
        this.updateMusicButton();
        gameLogger.info('All music paused');
    }

    updateMusicButton() {
        const musicButton = document.getElementById('music-toggle');
        if (!musicButton) return;
        
        const icon = musicButton.querySelector('.button-icon');
        const text = musicButton.querySelector('.button-text');
        const indicator = musicButton.querySelector('.music-status-indicator');
        
        if (this.gameState.musicEnabled) {
            icon.textContent = '🔇';
            text.textContent = 'Mute';
            musicButton.title = `Mute Ambient Music (Track ${this.gameState.currentAmbientTrack + 1}/${this.ambientPlaylist.length})`;
            musicButton.classList.add('playing');
            if (indicator) indicator.style.background = '#44ff44';
        } else {
            icon.textContent = '🎵';
            text.textContent = 'Music';
            musicButton.title = 'Click to Enable Ambient Music';
            musicButton.classList.remove('playing');
            if (indicator) indicator.style.background = '#ff4444';
        }
    }

    updateMusicButtonForBattle() {
        const musicButton = document.getElementById('music-toggle');
        if (!musicButton) return;
        
        const icon = musicButton.querySelector('.button-icon');
        const text = musicButton.querySelector('.button-text');
        const indicator = musicButton.querySelector('.music-status-indicator');
        
        if (this.gameState.musicEnabled && this.gameState.inBattle) {
            icon.textContent = '⚔️';
            text.textContent = 'Battle';
            musicButton.title = `Battle Music ${this.gameState.currentBattleTrack}/${this.battlePlaylist.length} Playing`;
            musicButton.classList.add('playing');
            if (indicator) {
                indicator.style.background = '#ff6b35'; // Orange for battle music
                indicator.style.animation = 'statusPulse 1s ease-in-out infinite';
            }
        } else {
            // Fall back to regular music button state
            this.updateMusicButton();
        }
    }

    hideMusicButton() {
        const musicButton = document.getElementById('music-toggle');
        if (musicButton) {
            musicButton.style.display = 'none';
            console.log('Music button hidden - audio file not available');
        }
    }

    showMusicPrompt() {
        // Visual feedback that music is available but needs interaction
        const musicButton = document.getElementById('music-toggle');
        if (musicButton) {
            musicButton.style.animation = 'musicPulse 1s ease-in-out 3';
            const text = musicButton.querySelector('.button-text');
            const originalText = text.textContent;
            text.textContent = 'Music Ready!';
            musicButton.title = 'Click to Start Fantasy Ambient Music';
            setTimeout(() => {
                text.textContent = originalText;
                musicButton.title = 'Click to Enable Background Music';
                musicButton.style.animation = '';
            }, 3000);
        }
    }

    showSkillCheckModal(skillCheck, choice) {
        // Pause music during skill checks for focus
        const wasMusicPlaying = this.gameState.musicEnabled;
        if (wasMusicPlaying) {
            this.pauseMusic();
        }
        
        const modal = document.getElementById('skill-check-modal');
        const skillName = document.getElementById('skill-name');
        const skillDC = document.getElementById('skill-dc');
        const rollButton = document.getElementById('roll-skill-check');
        const resultDiv = document.getElementById('skill-check-result');

        skillName.textContent = skillCheck.skill;
        skillDC.textContent = skillCheck.dc;
        
        // Store skill check data and music state for later use
        this.currentSkillCheck = {
            ...skillCheck,
            originalChoice: choice,
            wasMusicPlaying: wasMusicPlaying
        };

        // Reset modal state
        resultDiv.classList.add('hidden');
        rollButton.style.display = 'block';

        modal.classList.remove('hidden');
    }

    continueFromSkillCheck() {
        const modal = document.getElementById('skill-check-modal');
        modal.classList.add('hidden');

        // Resume music if it was playing before
        if (this.currentSkillCheck.wasMusicPlaying) {
            this.playMusic();
        }

        const destination = this.skillCheckResult ? 
            this.currentSkillCheck.success : 
            this.currentSkillCheck.failure;

        if (destination) {
            this.loadEntry(destination);
        }
    }

    showError(message) {
        const narrativeElement = document.getElementById('entry-narrative');
        narrativeElement.innerHTML = `<p style="color: red; font-weight: bold;">Error: ${message}</p>`;
        
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = `
            <button class="choice-button" onclick="location.reload()">
                Reload Page
            </button>
        `;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new DragonlanceGame();
});

// Debug functions for development
window.debugGame = {
    setCharacter: (species, charClass, background, subclass = null) => {
        if (window.game) {
            window.game.gameState.species = species;
            window.game.gameState.class = charClass;
            window.game.gameState.subclass = subclass;
            window.game.gameState.background = background;
            window.game.updateCharacterDisplay();
        }
    },
    goToEntry: (entryId) => {
        if (window.game) {
            window.game.loadEntry(entryId);
        }
    },
    getGameState: () => {
        return window.game ? window.game.gameState : null;
    }
};