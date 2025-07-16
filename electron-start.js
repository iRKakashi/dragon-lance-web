// Electron-specific initialization script
// This file handles Electron-specific functionality

// Add IPC event listeners for menu commands
if (typeof require !== 'undefined' && window.process && window.process.type === 'renderer') {
    const { ipcRenderer } = require('electron');
    
    // Handle menu-triggered events
    ipcRenderer.on('new-game', () => {
        if (window.game && typeof window.game.restartGame === 'function') {
            window.game.restartGame();
        }
    });
    
    ipcRenderer.on('save-game', () => {
        if (window.game && typeof window.game.saveGame === 'function') {
            window.game.saveGame();
        }
    });
    
    ipcRenderer.on('load-game', () => {
        if (window.game && typeof window.game.loadGame === 'function') {
            window.game.loadGame();
        }
    });
    
    ipcRenderer.on('toggle-music', () => {
        if (window.game && typeof window.game.toggleMusic === 'function') {
            window.game.toggleMusic();
        }
    });
    
    ipcRenderer.on('volume-up', () => {
        if (window.game && typeof window.game.adjustVolume === 'function') {
            window.game.adjustVolume(0.1);
        }
    });
    
    ipcRenderer.on('volume-down', () => {
        if (window.game && typeof window.game.adjustVolume === 'function') {
            window.game.adjustVolume(-0.1);
        }
    });
    
    // Disable drag and drop to prevent file loading issues
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    
    // Prevent context menu (right-click) unless in development mode
    if (!process.argv.includes('--dev')) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // Handle window focus events to manage music
    window.addEventListener('focus', () => {
        if (window.game && window.game.gameState.musicEnabled) {
            // Resume music if it was paused when window lost focus
            if (window.game.currentAmbientAudio && window.game.currentAmbientAudio.paused) {
                window.game.currentAmbientAudio.play().catch(console.error);
            }
        }
    });
    
    window.addEventListener('blur', () => {
        // Optionally pause music when window loses focus
        // This can be made configurable in the future
        if (window.game && window.game.currentAmbientAudio && !window.game.currentAmbientAudio.paused) {
            // Don't pause music on blur for now, as it can be annoying
            // window.game.currentAmbientAudio.pause();
        }
    });
}

// Add volume adjustment method to the game class
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game to be initialized
    const checkGameReady = setInterval(() => {
        if (window.game) {
            clearInterval(checkGameReady);
            
            // Add volume adjustment method
            window.game.adjustVolume = function(delta) {
                if (this.currentAmbientAudio) {
                    const newVolume = Math.max(0, Math.min(1, this.currentAmbientAudio.volume + delta));
                    this.currentAmbientAudio.volume = newVolume;
                    
                    // Also adjust battle music volume if playing
                    if (this.currentBattleAudio) {
                        this.currentBattleAudio.volume = newVolume;
                    }
                    
                    // Update all audio elements in playlists
                    this.ambientAudioElements.forEach(audio => {
                        audio.volume = newVolume;
                    });
                    
                    this.battleAudioElements.forEach(audio => {
                        audio.volume = newVolume;
                    });
                    
                    console.log('Volume adjusted to:', Math.round(newVolume * 100) + '%');
                }
            };
        }
    }, 100);
});