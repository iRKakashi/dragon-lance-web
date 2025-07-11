# D&D 5e Dragonlance Adventure Game - Project Brief

## Character Creation System
You are to generate an interactive character creation sequence for a Dungeons & Dragons 5th Edition (D&D 5e) choose-your-own-adventure game set in the Dragonlance universe. This sequence will appear at the beginning of the game and will allow the player to build their character through a series of multiple-choice prompts. Structure the flow into clearly numbered entries (e.g., Entry 1, Entry 2, etc.), with each step offering 3–5 options. Each choice should include a brief description and should clearly lead to a new entry that continues the creation flow.

Include the following steps:
1. **Species Selection**
Let the player choose their race/species. Suggested options:
- Human
- Elf (e.g., Qualinesti, Silvanesti)
- Dwarf (e.g., Hill Dwarf, Mountain Dwarf)
- Kender
- Gnome

Each should include a short description and a note on game-relevant traits (e.g., bonuses, unique perspectives).

2. **Class Selection**
Let the player choose a class. Suggested options:
- Fighter
- Wizard (with a nod to the Towers of High Sorcery)
- Cleric (e.g., of Paladine or Mishakal)
- Rogue
- Paladin (especially a Knight of Solamnia)

Include descriptions of the class's role, key abilities, and what it means in the Dragonlance setting.

3. **Background Selection**
Let the player choose a background. Suggested:
- Knight of Solamnia
- Mage of High Sorcery
- Mercenary
- Noble
- Outlander

Each background should include:
- Two skill proficiencies
- One or two tools/languages
- A narrative trait relevant to the world

4. **Ability Score Assignment**
Guide the player to assign a standard array (15, 14, 13, 12, 10, 8) to the six D&D abilities:
- Strength
- Dexterity
- Constitution
- Intelligence
- Wisdom
- Charisma

Give short descriptions for each ability to help new players.

5. **Starting Equipment**
Present equipment options based on the class selected. Example for a Fighter:
- Chain mail or leather armor + shield
- Longsword or axe
- Explorer's pack or dungeoneer's pack

Make this step modular so that Claude remembers what the player selected in the earlier class/background steps.

6. **Personality Traits**
Let the player choose or roll (random options welcome) for:
- Trait
- Ideal
- Bond
- Flaw

Use Dragonlance-themed ideas and NPC archetypes where possible.

**Output Format**
Each step should be presented like an entry in a choose-your-own-adventure book.
- Use numbered entries (Entry 1, Entry 2…) to enable branching and return.
- Each entry should end with 3–5 multiple choice options.
- Clear next-entry references (e.g., "→ Go to Entry 5").

**Style Guidelines**
- Write in a vivid and immersive narrative voice, like a Dungeon Master introducing a player to a magical world.
- Keep paragraphs short and engaging (2–5 sentences max).
- Maintain a tone consistent with Dragonlance lore (noble, mysterious, epic).

## Core Role
You are to act as a Dungeon Master for a Dungeons & Dragons 5th Edition (D&D 5e) text-based, multiple-choice adventure game set in the Dragonlance universe.

## Game Structure
- **Total Entries**: Approximately 300 numbered entries
- **Entry Format**: Each entry contains 5–10 sentences that vividly describe a unique situation or scene
- **Choice System**: Present 3 to 4 options for the player to choose from at the end of each entry
- **Narrative Flow**: Ensure all choices lead logically to subsequent entries without creating narrative dead ends

## D&D 5e Mechanics Integration
- Incorporate skill checks with specific skills and Difficulty Class (DC) values where appropriate
- Clearly delineate outcomes of skill checks, directing players to corresponding entry numbers for success or failure
- Track experience points (XP) and leveling implicitly through story progression
- Integrate combat and skill challenges naturally within the narrative to enhance immersion

## Dragonlance Universe Elements
- Include opportunities for side quests and hidden areas
- Feature encounters with iconic Dragonlance characters and locations
- Maintain consistency with Dragonlance lore and atmosphere

## Technical Implementation Resources

### Tools and Frameworks
- **D&D 5e Choose Your Adventure Prompt**: Structured template for generating D&D 5e choose-your-own-adventure stories with skill checks and branching paths
- **Khagar/dnd-with-claude**: Python script for simulating D&D games with automated Dungeon Master using Anthropic API
- **AI Dungeon**: Text-based, AI-generated fantasy simulation for interactive storytelling reference
- **Friends & Fables**: AI-powered text adventure RPG tools for dungeon masters, character creation, and world-building

### Implementation Strategy
1. **Web Interface**: Use GitHub Pages or Netlify for hosting
2. **Frontend**: HTML/CSS/JavaScript interface for displaying narrative and choices
3. **State Management**: JavaScript for handling user choices, tracking current entry, and managing game state (inventory, health, XP)
4. **Data Storage**: JSON format for adventure entries and branching paths
5. **Styling**: Dragonlance-themed design with appropriate fonts, colors, and imagery

## Quality Standards
- Maintain consistency in plot progression, mechanics, and options throughout the adventure
- Ensure vivid, immersive descriptions that capture the Dragonlance atmosphere
- Balance narrative storytelling with mechanical gameplay elements
- Provide meaningful choices that impact the story progression

## Project Goals
Create an engaging, interactive D&D 5e experience that combines the rich lore of Dragonlance with structured gameplay mechanics, delivered through an accessible web-based interface.

## Corner Decoration System Implementation

### Overview
The UI features ornate corner decorations using custom PNG assets (`Top-left-corner.png` and `Top-right-corner.png`) positioned on key interface tiles to create an immersive fantasy aesthetic.

### Asset Requirements
- **Top-left-corner.png**: 64x64px ornate scrollwork design in deep brown (#6d3f26)
- **Top-right-corner.png**: 64x64px ornate scrollwork design (mirrored version)
- **Location**: `assets/Images/` directory
- **Format**: PNG with transparency for layering

### Implementation Details

#### CSS Classes and Positioning
```css
.corner {
    position: absolute;
    width: 48px; /* Default size */
    height: 48px;
    background-size: contain;
    z-index: 10;
    pointer-events: none;
}

.corner.top-left {
    top: 0;
    left: 0;
    background: url('assets/Images/Top-left-corner.png') no-repeat center;
}

.corner.top-right {
    top: 0;
    right: 0;
    background: url('assets/Images/Top-right-corner.png') no-repeat center;
}
```

#### Responsive Sizing
- **Desktop**: 48px default, 64px for title sections
- **Tablet (≤768px)**: 36px default, 48px for title sections  
- **Mobile (≤480px)**: 32px default, 40px for title sections

#### Elements with Corner Decorations
1. **Character Panel**: CSS pseudo-elements (48px)
2. **Story Book**: HTML + CSS pseudo-elements (64px)
3. **Race Modal**: CSS pseudo-elements (48px)
4. **Title Header**: HTML + CSS pseudo-elements (64px)
5. **Race Options**: HTML + CSS pseudo-elements (48px)
6. **Choice Buttons**: HTML + CSS pseudo-elements (48px)

### Critical Implementation Notes

#### ⚠️ DO NOT BREAK - Animation Separation
- **Race Options** and **Choice Buttons** have complex hover animations using `::before` pseudo-elements
- Corner images are kept separate from animated backgrounds to prevent moving corners
- Top-left corners use HTML `<div class="corner top-left"></div>` elements
- Top-right corners use static CSS `::after` pseudo-elements

#### ⚠️ DO NOT BREAK - Z-Index Layering
```css
/* Corners must stay above content */
.corner, .element::after { z-index: 10; }
/* Content must stay above backgrounds */
.content { z-index: 2; }
/* Animated backgrounds stay below */
.element::before { z-index: 0-5; }
```

#### ⚠️ DO NOT BREAK - File Path References
- All corner images use exact file names: `Top-left-corner.png` and `Top-right-corner.png`
- Case-sensitive file paths in CSS
- Any filename changes require updating all CSS references

### JavaScript Integration
Race options and choice buttons automatically receive corner decorations via JavaScript:
```javascript
// Race options
raceOption.innerHTML = `
    <div class="corner top-left"></div>
    <div class="race-icon">${raceInfo.icon}</div>
    <div class="race-name">${speciesName}</div>
`;

// Choice buttons  
button.innerHTML = `
    <div class="corner top-left"></div>
    ${choice.text}
`;
```

### Maintenance Guidelines
1. **Never embed corner images in animated pseudo-elements**
2. **Maintain z-index hierarchy**: corners (10) > content (2) > backgrounds (0-5)
3. **Use HTML corner elements for complex interactive components**
4. **Keep corner sizing proportional across responsive breakpoints**
5. **Test corner positioning after any layout changes**

## Audio System Implementation

### Background Music
- **Primary Track**: `assets/Music/HarpAmbientMusic-Vindsvept-The Fae.mp3`
- **Volume**: 30% (0.3) for ambient background
- **Autoplay**: Disabled by default due to browser restrictions
- **Loop**: Enabled for continuous playback

### Battle Music System
- **Track 1**: `assets/Music/Battlemusic1.mp3`
- **Track 2**: `assets/Music/Battlemusic2.mp3`  
- **Volume**: 40% (0.4) for combat intensity
- **Trigger**: Automatic detection via keywords in entry content
- **Selection**: Random between two tracks

### Music Control Implementation
- **Toggle Button**: Visual indicator with status
- **States**: Music/Mute with appropriate icons
- **Battle Mode**: Special icon (⚔️) during combat
- **Status Indicator**: Color-coded dot (green=playing, red=muted, orange=battle)

### Critical Music Notes
#### ⚠️ DO NOT BREAK - Battle Detection
Keywords that trigger battle music:
- 'combat', 'battle', 'fight', 'attack', 'enemies'
- 'skeletal warriors', 'bandits', 'combat erupts'
- 'clash of steel', 'fight for your life'

#### ⚠️ DO NOT BREAK - Audio State Management
```javascript
gameState: {
    musicEnabled: false,
    inBattle: false,
    currentBattleTrack: null
}
```

## Race Selection Modal System

### Modal Implementation
- **Trigger**: Click-based (not hover) to prevent layout issues
- **Size**: 700px width, 95vh max height
- **Content**: Image (350px height), description, traits list
- **Actions**: "Choose this Race" and "Go Back" buttons

### Race Data Structure
```javascript
raceData = {
    'Species Name': {
        image: 'assets/Images/SpeciesRace.png',
        icon: '🏛️',
        subtitle: 'The Descriptive Title',
        description: '1-2 sentence description',
        traits: ['Trait 1', 'Trait 2', 'Trait 3', 'Trait 4']
    }
}
```

### Critical Modal Notes
#### ⚠️ DO NOT BREAK - Image Assets
Required race images in `assets/Images/`:
- `HumanRace.png`
- `Elf-QualinestiRace.png`
- `Elf-SylvanestiRace.png`
- `HillDwarvesRace.png`
- `MountainDwarvesRace.png`
- `KenderRace.png`
- `GnomesRace.png`