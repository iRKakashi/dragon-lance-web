// Dragonlance Interactive Adventure Game Engine

class DragonlanceGame {
    constructor() {
        this.characterData = null;
        this.adventureData = null;
        this.currentEntry = null;
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
            currentBattleTrackIndex: 0
        };
        
        // Music playlists
        this.ambientPlaylist = [
            'assets/Music/Ambiance/HarpAmbientMusic-Vindsvept-The Fae.mp3',
            'assets/Music/Ambiance/AMbientRoad.mp3',
            'assets/Music/Ambiance/AbientSkyrim.mp3',
            'assets/Music/Ambiance/HarvestdawnAmbiance.mp3'
        ];
        
        this.battlePlaylist = [
            'assets/Music/Battle music/Battlemusic1.mp3',
            'assets/Music/Battle music/Battlemusic2.mp3'
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
        
        // Initialize music playlists
        this.initializeMusicPlaylists();
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
        
        // Display main narrative
        const narrativeElement = document.getElementById('entry-narrative');
        narrativeElement.innerHTML = `<p>${this.currentEntry.narrative}</p>`;
        
        // Add narrative continuation if present
        if (this.currentEntry.narrative_continuation) {
            narrativeElement.innerHTML += `<p>${this.currentEntry.narrative_continuation}</p>`;
        }

        // Display conditional text
        this.displayConditionalText();

        // Display choices
        this.displayChoices();

        // Check for battle scenarios and manage music
        this.checkForBattleScenario();

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
        
        gameLogger.info('Selecting race:', this.currentRaceSelection.name);
        gameLogger.info('Choice object:', this.currentRaceSelection.choice);
        
        // Store the selected race
        this.selectedRace = this.currentRaceSelection.name;
        
        // Close modal
        this.closeRaceModal();
        
        // Handle the choice
        gameLogger.info('About to call handleChoice with:', this.currentRaceSelection.choice, this.currentRaceSelection.index);
        this.handleChoice(this.currentRaceSelection.choice, this.currentRaceSelection.index);
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
            setTimeout(() => {
                gameLogger.info('Loading entry:', choice.destination);
                this.loadEntry(choice.destination);
            }, 500);
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
        // Simple modifier system - could be expanded based on character stats
        return Math.floor(Math.random() * 4) + 1; // Random modifier 1-4 for now
    }

    updateCharacterDisplay() {
        // Update species display
        document.getElementById('species').textContent = this.gameState.species || 'Not Selected';
        
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

    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('dragonlance-save', JSON.stringify(saveData));
            alert('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game.');
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem('dragonlance-save');
            if (!saveData) {
                alert('No saved game found.');
                return;
            }

            const parsed = JSON.parse(saveData);
            this.gameState = parsed.gameState;
            this.updateCharacterDisplay();
            this.loadEntry(this.gameState.currentEntryId);
            alert('Game loaded successfully!');
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