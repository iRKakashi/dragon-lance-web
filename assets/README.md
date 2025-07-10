# Assets Directory

## Background Music

To enable background music functionality, add music files to this directory:

### Required Files:
- `fantasy-ambient.mp3` - Main background music (MP3 format)
- `fantasy-ambient.ogg` - Fallback for browsers that don't support MP3

### Recommended Music Sources:

#### Free/Creative Commons:
- **Freesound.org** - Community-driven sound library
- **Zapsplat** - Professional sound effects and music
- **YouTube Audio Library** - Free music for creators
- **Incompetech** (Kevin MacLeod) - Royalty-free music
- **OpenGameArt.org** - Game assets including music

#### Suggested Search Terms:
- "fantasy ambient music"
- "medieval atmosphere"
- "dungeon ambient"
- "epic fantasy background"
- "Celtic fantasy music"

#### Specifications:
- **Length**: 3-10 minutes (will loop automatically)
- **Volume**: Mixed for background listening (not too loud)
- **Style**: Atmospheric, ambient, fantasy-themed
- **Format**: MP3 (primary) + OGG (fallback)
- **Quality**: 128-192 kbps (good balance of quality/file size)

### Example Sources:
1. **"Peaceful Medieval Village"** - Perfect for character creation
2. **"Mystic Forest Ambience"** - Great for adventure scenes
3. **"Ancient Library"** - Good for scholarly/magical themes
4. **"Tavern Atmosphere"** - Fits the Inn of the Last Home scenes

### Implementation Notes:
- Music starts muted by default (user must click to enable)
- Automatically pauses during skill check modals
- Volume set to 30% to avoid overwhelming narration
- Loops continuously during gameplay
- Saves music preference in localStorage

### File Structure:
```
assets/
├── fantasy-ambient.mp3     (Primary file)
├── fantasy-ambient.ogg     (Browser compatibility)
└── README.md              (This file)
```

### Browser Compatibility:
- **MP3**: Supported by all modern browsers
- **OGG**: Fallback for Firefox and Chrome
- **Autoplay Policy**: Requires user interaction before playing

### Legal Considerations:
- Ensure all music files have appropriate licensing
- Credit composers/sources as required
- Avoid copyrighted material without permission
- Creative Commons and royalty-free sources recommended