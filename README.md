# Dragonlance: Chronicles of Krynn

A comprehensive D&D 5e interactive text-based adventure game set in the legendary world of Dragonlance. Experience the rich lore of Krynn through an immersive choose-your-own-adventure format with character creation, skill checks, and atmospheric music.

## 🎮 Game Features

🎯 **Complete Adventure System**
- **300+ Story Entries** - Extensive branching narrative with meaningful choices
- **Interactive Character Creation** - Choose race, class, and background with detailed artwork
- **D&D 5e Mechanics** - Skill checks, experience points, and character progression
- **Dynamic Music System** - 4 ambient tracks + 2 battle tracks with auto-rotation
- **Rich Visual Experience** - Beautiful character artwork and ornate UI design
- **Debug & Logging System** - Built-in debugging tools for development

🏛️ **Character System**
- **Species**: Human, Qualinesti Elf, Silvanesti Elf, Hill Dwarf, Mountain Dwarf, Kender, Gnome
- **Classes**: Fighter, Wizard, Cleric, Sorcerer, Warlock, Rogue, Paladin
- **Specializations**: Draconic Bloodline, Wild Magic, Moon Sorcerer, Great Wyrm Patron, and more
- **Backgrounds**: Knight of Solamnia, Mage of High Sorcery, Mercenary, Noble, Outlander

🎨 **Enhanced User Interface**
- **Ornate Fantasy Design** - Dragonlance-themed with corner decorations and parchment styling
- **Responsive Layout** - Works on desktop, tablet, and mobile devices
- **Character Status Panel** - Real-time display of character progression
- **Modal Dialogs** - Immersive skill checks and character selection
- **Atmospheric Audio** - Dynamic music system with battle/ambient switching

## 📋 System Requirements

- **Modern Web Browser** (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- **Python 3.6+** (for local server) or alternative web server
- **Audio Support** (for background music)
- **JavaScript Enabled**
- **~50MB Storage** (for game files and assets)

## 🚀 Installation & Setup

### Step 1: Download the Game

**Option A: Git Clone (Recommended)**
```bash
git clone https://github.com/yourusername/dragonlance-dev.git
cd dragonlance-dev
```

**Option B: Download ZIP**
1. Download the ZIP file from GitHub
2. Extract to your desired location
3. Open terminal/command prompt in the extracted folder

### Step 2: Start Local Server

**🪟 Windows Users:**
```cmd
# Method 1: Using Python (most common)
python -m http.server 8000

# If that doesn't work, try:
python3 -m http.server 8000
# or
py -m http.server 8000

# Method 2: Using PowerShell (Windows 10+)
# Open PowerShell as Administrator and run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then install http-server:
# npm install -g http-server
# http-server -p 8000
```

**🐧 Linux/macOS Users:**
```bash
# Method 1: Using Python 3
python3 -m http.server 8000

# Method 2: Using Python 2 (if available)
python -m SimpleHTTPServer 8000

# Method 3: Using Node.js
npx http-server -p 8000

# Method 4: Using PHP
php -S localhost:8000
```

### Step 3: Open in Browser

1. **Start your web browser**
2. **Navigate to:** `http://localhost:8000`
3. **The game should load automatically**

### Alternative Setup Methods

**Using Visual Studio Code:**
1. Install the "Live Server" extension
2. Open the project folder in VS Code
3. Right-click `index.html` → "Open with Live Server"

**Using Node.js http-server:**
```bash
# Install globally
npm install -g http-server

# Run in project directory
http-server -p 8000 -c-1
```

## 📁 Complete File Structure

```
dragonlance-dev/
├── index.html                          # Main game interface
├── game-engine.js                      # Core game logic & music system
├── logger.js                           # Debug logging system
├── styles.css                          # Game styling & animations
├── character_creation_transition.json  # Character creation flow
├── dragonlance_entries_1_20_fixed.json # Adventure story entries
├── assets/
│   ├── Images/                         # Character artwork & UI graphics
│   │   ├── Human.png                   # Character race images
│   │   ├── Qualinesti Elf.png         # (one for each race)
│   │   ├── Background.png              # Main background image
│   │   ├── Top-left-corner.png         # UI corner decorations
│   │   └── Top-right-corner.png
│   └── Music/                          # Audio files
│       ├── Ambiance/                   # Background music (4 tracks)
│       │   ├── HarpAmbientMusic-Vindsvept-The Fae.mp3
│       │   ├── AMbientRoad.mp3
│       │   ├── AbientSkyrim.mp3
│       │   └── HarvestdawnAmbiance.mp3
│       └── Battle music/               # Combat music (2 tracks)
│           ├── Battlemusic1.mp3
│           └── Battlemusic2.mp3
└── README.md                           # This file
```

## 🎯 How to Play

### Getting Started
1. **Launch the Game** - Open in your browser using the setup instructions above
2. **Enable Audio** - Click the music button to enjoy the atmospheric soundtrack
3. **Begin Character Creation** - Follow the guided process to build your hero

### Character Creation Process
1. **Choose Your Race** - Select from iconic Dragonlance species with unique artwork
2. **Select Your Class** - Pick your adventuring profession and specialization
3. **Choose Background** - Define your character's history and motivations
4. **Review Your Character** - Confirm your choices and begin your adventure

### Adventure Gameplay
1. **Read Story Entries** - Immerse yourself in the rich Dragonlance narrative
2. **Make Meaningful Choices** - Your decisions shape the story and character development
3. **Handle Skill Checks** - Roll dice to overcome challenges and obstacles
4. **Experience Dynamic Music** - Enjoy ambient tracks that shift to battle music during combat
5. **Save Your Progress** - Use the save/load system to preserve your adventure

### Game Controls
- **🎵 Music Button** - Toggle background music on/off, shows current track
- **💾 Save Button** - Save your current progress to browser storage
- **📜 Load Button** - Load previously saved game state
- **🔄 Restart Button** - Begin a new adventure (with confirmation)
- **🎲 Dice Rolls** - Click to roll dice during skill checks

### Debug Features
- **Press `Ctrl+Shift+D`** - Toggle debug panel for real-time game logging
- **Export Logs** - Download debug logs for troubleshooting
- **Track Progress** - Monitor character selections and story progression

## 🎵 Audio Experience

The game features a dynamic music system with 6 total tracks:

### Ambient Music (4 tracks)
- **Background music** cycles through atmospheric tracks automatically
- **Seamless looping** - when all tracks finish, playlist restarts
- **Volume optimized** at 30% for comfortable listening

### Battle Music (2 tracks)
- **Combat music** triggers during battle scenarios
- **Auto-rotation** through battle tracks
- **Higher volume** (40%) for battle intensity

**Note:** Due to browser security, you must click the music button to enable audio when first starting the game.

## 🛠️ Troubleshooting

### Common Issues & Solutions

**❌ Game Won't Load**
- **Solution**: Ensure you're using a local server, not opening `index.html` directly
- **Check**: Browser console for errors (Press F12 → Console tab)
- **Verify**: All files are present in the correct directory structure

**❌ "Port Already in Use" Error**
```bash
# Try different ports
python -m http.server 8001
python -m http.server 8002
python -m http.server 8003
```

**❌ Music Not Playing**
- **Click the music button** - Browser security requires user interaction
- **Check audio permissions** - Allow audio in browser settings
- **Verify audio files** - Ensure `assets/Music/` folders contain MP3 files
- **Try refreshing** - Reload the page and click music button again

**❌ Images Not Loading**
- **Check file paths** - Verify `assets/Images/` contains all required files
- **Case sensitivity** - Ensure exact filename matches (Linux/macOS)
- **Browser console** - Look for 404 errors in developer tools

**❌ Character Selection Not Working**
- **Enable debug mode** - Press `Ctrl+Shift+D` to see detailed logs
- **Check browser console** - Look for JavaScript errors
- **Clear browser cache** - Hard refresh with `Ctrl+F5`

**❌ Save/Load Not Working**
- **Check browser storage** - Ensure localStorage is enabled
- **Clear corrupt data** - Open browser console and run `localStorage.clear()`
- **Try different browser** - Test if issue is browser-specific

### Platform-Specific Issues

**Windows:**
- **Python not found** - Install Python from python.org
- **"python" not recognized** - Try `python3` or `py` commands
- **Port conflicts** - Close other local servers or use different ports

**Linux/macOS:**
- **Permission errors** - Try `sudo python3 -m http.server 8000`
- **Python version** - Ensure Python 3.6+ is installed
- **Firewall issues** - Check firewall settings for localhost connections

### Debug Mode

**Enable Debug Panel**: Press `Ctrl+Shift+D`

**Debug Features**:
- **Real-time logging** - See all game events as they happen
- **Export logs** - Download debug files for analysis
- **Track character flow** - Monitor character creation progress
- **Identify errors** - Spot issues in race selection, music, etc.

**Using Debug Logs**:
1. Enable debug panel (`Ctrl+Shift+D`)
2. Reproduce the issue
3. Export logs using the Export button
4. Review logs for error messages or missing events

## 🔧 Technical Details

### System Architecture

**Frontend Technologies**:
- **HTML5** - Modern semantic structure
- **CSS3** - Advanced styling with animations and responsive design
- **JavaScript ES6+** - Modern JavaScript with classes and modules
- **JSON** - Data storage for story entries and character creation

**Key Components**:
- **Game Engine** (`game-engine.js`) - Core game logic and state management
- **Logger System** (`logger.js`) - Comprehensive debugging and logging
- **Audio System** - Dynamic playlist management with auto-rotation
- **UI System** - Modal dialogs, responsive design, and animations

### Data Structure

**Character Creation Flow**:
```json
{
  "species_selection": {
    "title": "Choose Your Heritage",
    "choices": [
      {
        "text": "Human - Adaptable and ambitious...",
        "destination": "class_selection",
        "sets": {"species": "Human"}
      }
    ]
  }
}
```

**Adventure Entries**:
```json
{
  "1": {
    "title": "The Crossroads of Solace",
    "narrative": "Story text here...",
    "choices": [
      {
        "text": "Make a Survival check (DC 15)",
        "skill_check": {
          "skill": "Survival",
          "dc": 15,
          "success": "4",
          "failure": "3"
        }
      }
    ]
  }
}
```

### Music System

**Playlist Management**:
- **Ambient Tracks**: 4 files in `assets/Music/Ambiance/`
- **Battle Tracks**: 2 files in `assets/Music/Battle music/`
- **Auto-rotation**: Seamless progression through all tracks
- **Context switching**: Automatic ambient ↔ battle music transitions

**Audio Implementation**:
- **Dynamic creation**: Audio elements created programmatically
- **Preload optimization**: `preload='none'` for bandwidth efficiency
- **Error handling**: Graceful fallback for missing audio files
- **Volume control**: Ambient (30%) vs Battle (40%) audio levels

### Browser Compatibility

**Fully Supported**:
- **Chrome 70+** - Full feature support
- **Firefox 65+** - All features working
- **Safari 12+** - Complete compatibility
- **Edge 79+** - Full support

**Partially Supported**:
- **Internet Explorer 11** - Limited audio support, no ES6 features
- **Older Mobile Browsers** - May have audio/animation limitations

**Required Browser Features**:
- **ES6 Classes** - For game engine architecture
- **Fetch API** - For loading JSON data
- **LocalStorage** - For save/load functionality
- **Web Audio API** - For music system

## 🎨 Customization & Development

### Adding New Story Content

**Adding Adventure Entries**:
1. Edit `dragonlance_entries_1_20_fixed.json`
2. Follow the existing JSON structure
3. Ensure all `destination` IDs reference valid entries
4. Test all branching paths thoroughly

**Adding Character Options**:
1. Edit `character_creation_transition.json`
2. Add new species/classes/backgrounds with proper artwork
3. Update conditional text references in story entries
4. Maintain consistent naming conventions

### Visual Customization

**Styling Changes** (`styles.css`):
- **Color schemes** - Update CSS variables for theme colors
- **Fonts** - Modify font families and sizes
- **Layout** - Adjust responsive breakpoints and spacing
- **Animations** - Customize hover effects and transitions

**Adding New Artwork**:
1. Place images in `assets/Images/` directory
2. Use PNG format for transparency
3. Follow naming conventions (e.g., "Species Name.png")
4. Update references in game code

### Audio Customization

**Adding Music Tracks**:
1. Place MP3 files in appropriate folders:
   - `assets/Music/Ambiance/` for background music
   - `assets/Music/Battle music/` for combat music
2. Update playlist arrays in `game-engine.js`
3. Test audio loading and transitions

**Audio Requirements**:
- **Format**: MP3 (most compatible)
- **Quality**: 128kbps recommended (balance of quality/file size)
- **Length**: 2-5 minutes per track for variety

### Development Tools

**Debug Console Commands**:
```javascript
// Access game state
window.game.gameState

// Jump to specific entry
window.game.loadEntry("15")

// Export debug logs
gameLogger.exportLogs()

// Clear all logs
gameLogger.clearLogs()
```

**Built-in Debug Features**:
- **Real-time logging** - Track all game events
- **State inspection** - Monitor character progression
- **Error tracking** - Identify issues quickly
- **Performance monitoring** - Check loading times

## 🚀 Performance Optimization

### File Size Optimization
- **Images**: Compress PNG files without losing quality
- **Audio**: Use 128kbps MP3 for good quality/size balance
- **Code**: Minify JavaScript and CSS for production

### Loading Optimization
- **Lazy loading**: Audio files use `preload='none'`
- **Efficient JSON**: Keep story entries under 1MB per file
- **Caching**: Browser caches assets automatically

## 🔮 Future Enhancements

**Planned Features**:
- **Extended Story Content** - Target: 300+ entries
- **Character Stats System** - Full D&D 5e ability scores
- **Inventory Management** - Item collection and usage
- **Combat System** - Detailed battle mechanics
- **Achievement System** - Track player accomplishments
- **Multiple Save Slots** - Support for different playthroughs

**Technical Improvements**:
- **Progressive Web App** - Offline functionality
- **Mobile Optimization** - Touch-friendly interface
- **Accessibility Features** - Screen reader support
- **Multiplayer Support** - Shared adventures

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Content Contributors
1. **Write Story Entries** - Follow existing JSON structure
2. **Create Artwork** - Character images and UI elements
3. **Compose Music** - Ambient and battle tracks
4. **Test Content** - Verify all branching paths work

### Technical Contributors
1. **Fork the Repository** - Create your own copy
2. **Follow Code Style** - Maintain existing patterns
3. **Test Thoroughly** - Verify all features work
4. **Submit Pull Requests** - Include detailed descriptions

### Content Guidelines
- **Maintain Dragonlance Theme** - Stay true to the setting
- **Quality Writing** - Immersive, engaging narrative
- **Balanced Gameplay** - Fair skill check difficulties
- **Inclusive Content** - Welcoming to all players

## 📄 License & Legal

**Fan Project Notice**: This is a fan-made tribute to the Dragonlance universe created for educational and entertainment purposes.

**Trademarks**: 
- Dragonlance® is a trademark of Wizards of the Coast LLC
- D&D® and Dungeons & Dragons® are trademarks of Wizards of the Coast LLC

**Open Game License**: D&D 5e mechanics are used under the Open Game License.

**Code License**: Original code is available under MIT License for educational use.

**Assets**: Music and artwork are provided for non-commercial use only.

## 🙏 Acknowledgments

**Special Thanks**:
- **Wizards of the Coast** - For the Dragonlance universe
- **Margaret Weis & Tracy Hickman** - Original Dragonlance creators
- **Community Contributors** - Story content, artwork, and testing
- **Open Source Libraries** - Making this project possible

---

## 🎲 Ready to Adventure?

**Quick Start Reminder**:
1. Download/clone the repository
2. Run `python -m http.server 8000` in the project directory
3. Open `http://localhost:8000` in your browser
4. Click the music button to enable audio
5. Begin your adventure in the world of Krynn!

**"The gods are stirring, magic pulses through the world with renewed vigor, and heroes are needed now more than ever."** 🐉✨

---

*For support, issues, or contributions, please visit our GitHub repository.*