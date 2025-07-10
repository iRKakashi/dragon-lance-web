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
            currentBattleTrack: null
        };
        
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
        
        // Initialize background music
        this.backgroundMusic = document.getElementById('background-music');
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3; // Set to 30% volume
            this.backgroundMusic.addEventListener('canplaythrough', () => {
                console.log('Background music loaded and ready to play');
                // Show visual indicator that music is available
                this.showMusicPrompt();
            });
            this.backgroundMusic.addEventListener('error', (e) => {
                console.log('Background music failed to load:', e);
                this.hideMusicButton();
            });
            this.backgroundMusic.addEventListener('ended', () => {
                // Restart music when it ends (backup to loop attribute)
                if (this.gameState.musicEnabled && !this.gameState.inBattle) {
                    this.backgroundMusic.currentTime = 0;
                    this.backgroundMusic.play();
                }
            });
            
            // Update button to show initial state (will be corrected by canplaythrough event)
            this.updateMusicButton();
        } else {
            console.log('Background music element not found');
        }

        // Initialize battle music
        this.battleMusic1 = document.getElementById('battle-music-1');
        this.battleMusic2 = document.getElementById('battle-music-2');
        
        if (this.battleMusic1) {
            this.battleMusic1.volume = 0.4; // Slightly louder for battle intensity
            this.battleMusic1.addEventListener('error', (e) => {
                console.log('Battle music 1 failed to load:', e);
            });
        }
        
        if (this.battleMusic2) {
            this.battleMusic2.volume = 0.4; // Slightly louder for battle intensity
            this.battleMusic2.addEventListener('error', (e) => {
                console.log('Battle music 2 failed to load:', e);
            });
        }
    }

    loadEntry(entryId) {
        console.log(`Loading entry: ${entryId}`);
        
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
        if (!this.currentEntry) {
            console.error('No current entry to display');
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

        this.currentEntry.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            
            button.addEventListener('click', () => {
                this.handleChoice(choice, index);
            });

            choicesContainer.appendChild(button);
        });
    }

    handleChoice(choice, index) {
        console.log('Choice selected:', choice);

        // Disable all choice buttons to prevent multiple clicks
        const buttons = document.querySelectorAll('.choice-button');
        buttons.forEach(btn => btn.disabled = true);

        // Handle character creation choices that set state
        if (choice.sets) {
            Object.keys(choice.sets).forEach(key => {
                this.gameState[key] = choice.sets[key];
                console.log(`Set ${key} to ${choice.sets[key]}`);
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
            setTimeout(() => {
                this.loadEntry(choice.destination);
            }, 500);
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
            if (this.backgroundMusic && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
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
                currentBattleTrack: null
            };
            this.updateCharacterDisplay();
            this.loadEntry('species_selection');
            
            // Restart music if it was enabled
            setTimeout(() => {
                if (this.gameState.musicEnabled && this.backgroundMusic) {
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
        
        // Pause background music
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }

        // Randomly select battle track
        const randomTrack = Math.random() < 0.5 ? this.battleMusic1 : this.battleMusic2;
        const trackNumber = randomTrack === this.battleMusic1 ? 1 : 2;
        
        if (randomTrack) {
            this.gameState.currentBattleTrack = trackNumber;
            randomTrack.currentTime = 0; // Start from beginning
            randomTrack.play().then(() => {
                console.log(`⚔️ Battle music ${trackNumber} started!`);
                this.updateMusicButtonForBattle();
            }).catch(error => {
                console.log('Could not play battle music:', error);
            });
        }
    }

    endBattleMusic() {
        this.gameState.inBattle = false;
        this.gameState.currentBattleTrack = null;

        // Stop both battle tracks
        if (this.battleMusic1 && !this.battleMusic1.paused) {
            this.battleMusic1.pause();
            this.battleMusic1.currentTime = 0;
        }
        if (this.battleMusic2 && !this.battleMusic2.paused) {
            this.battleMusic2.pause();
            this.battleMusic2.currentTime = 0;
        }

        // Resume background music if enabled
        if (this.gameState.musicEnabled && this.backgroundMusic) {
            this.backgroundMusic.play().then(() => {
                console.log('🎵 Ambient music resumed');
                this.updateMusicButton();
            }).catch(error => {
                console.log('Could not resume background music:', error);
            });
        }
    }

    getCurrentBattleTrack() {
        if (!this.gameState.inBattle || !this.gameState.currentBattleTrack) return null;
        return this.gameState.currentBattleTrack === 1 ? this.battleMusic1 : this.battleMusic2;
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
        if (this.backgroundMusic) {
            this.backgroundMusic.play().then(() => {
                this.gameState.musicEnabled = true;
                this.updateMusicButton();
                console.log('🎵 Background music started automatically');
            }).catch(error => {
                console.log('Could not auto-play background music:', error);
                // Show user-friendly message for autoplay restrictions
                if (error.name === 'NotAllowedError') {
                    console.log('Autoplay prevented - user interaction required');
                    this.showMusicPrompt();
                    // Keep musicEnabled true so it will play when user clicks
                    this.gameState.musicEnabled = true;
                    this.updateMusicButton();
                }
            });
        }
    }

    pauseMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.gameState.musicEnabled = false;
            this.updateMusicButton();
            console.log('Background music paused');
        }
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
            musicButton.title = 'Mute Background Music';
            musicButton.classList.add('playing');
            if (indicator) indicator.style.background = '#44ff44';
        } else {
            icon.textContent = '🎵';
            text.textContent = 'Music';
            musicButton.title = 'Click to Enable Background Music';
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
            musicButton.title = `Battle Music ${this.gameState.currentBattleTrack} Playing`;
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