# Dragonlance Adventure - Build Instructions

## Prerequisites

1. **Node.js** (v16 or later)
2. **npm** (comes with Node.js)

## Building the Application

### For Windows Users

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build Windows executable:**
   ```bash
   npm run build-win
   ```

   This will create a portable Windows executable in the `dist/` folder.

### For Linux/WSL Users

Due to cross-platform building limitations, you have two options:

#### Option 1: Build Linux AppImage
```bash
npm run build-linux
```

#### Option 2: Build for Windows (requires additional setup)
1. Install Wine:
   ```bash
   sudo apt update
   sudo apt install wine
   ```

2. Then run:
   ```bash
   npm run build-win
   ```

### For macOS Users

```bash
npm run build-mac
```

## Running the Application

### Development Mode
```bash
npm start
```

### Production Build
After building, you'll find the executable in the `dist/` folder:
- Windows: `dist/Dragonlance Adventure-1.0.0-portable.exe`
- Linux: `dist/Dragonlance Adventure-1.0.0.AppImage`
- macOS: `dist/Dragonlance Adventure-1.0.0.dmg`

## Distribution

The built executables are self-contained and can be distributed without requiring Node.js or any other dependencies to be installed on the target machine.

### File Sizes (Approximate)
- Windows Portable: ~120MB
- Linux AppImage: ~130MB
- macOS DMG: ~125MB

## Features

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Offline**: No internet connection required
- **Self-contained**: All assets bundled
- **Native menus**: File, View, Audio, Help menus
- **Keyboard shortcuts**: Save (Ctrl+S), Load (Ctrl+O), etc.
- **File dialog**: Proper save/load dialogs
- **Audio support**: Background music and sound effects

## Troubleshooting

### Windows Build Issues
- Ensure you have the latest version of Node.js
- Try running `npm install` again
- Check that your antivirus isn't blocking the build process

### Linux Build Issues
- For cross-platform Windows builds, Wine is required
- Consider building on a Windows machine for best results
- WSL users may need to install additional dependencies

### General Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all JSON files are valid
- Ensure all asset files are present in the assets folder