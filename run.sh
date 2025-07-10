#!/bin/bash

# Dragonlance Interactive Adventure - Launcher Script
# This script starts a local web server and opens the game in fullscreen

# Configuration
PORT=8000
URL="http://localhost:$PORT"
GAME_TITLE="Dragonlance: Chronicles of Krynn"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║          🐉 DRAGONLANCE: CHRONICLES OF KRYNN 🐉              ║"
    echo "║                                                               ║"
    echo "║              Interactive D&D 5e Adventure                    ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to check if port is available
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
        echo -e "${CYAN}Trying to find an available port...${NC}"
        PORT=$((PORT + 1))
        while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
            PORT=$((PORT + 1))
            if [ $PORT -gt 9000 ]; then
                echo -e "${RED}❌ Could not find an available port${NC}"
                exit 1
            fi
        done
        URL="http://localhost:$PORT"
        echo -e "${GREEN}✅ Using port $PORT instead${NC}"
    fi
}

# Function to detect and start appropriate web server
start_server() {
    echo -e "${CYAN}🚀 Starting web server...${NC}"
    
    # Check if Python 3 is available
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}📡 Starting Python 3 HTTP server on port $PORT${NC}"
        python3 -m http.server $PORT &
        SERVER_PID=$!
        return 0
    fi
    
    # Check if Python 2 is available
    if command -v python &> /dev/null; then
        echo -e "${GREEN}📡 Starting Python 2 HTTP server on port $PORT${NC}"
        python -m SimpleHTTPServer $PORT &
        SERVER_PID=$!
        return 0
    fi
    
    # Check if Node.js http-server is available
    if command -v http-server &> /dev/null; then
        echo -e "${GREEN}📡 Starting Node.js http-server on port $PORT${NC}"
        http-server -p $PORT &
        SERVER_PID=$!
        return 0
    fi
    
    # Check if PHP is available
    if command -v php &> /dev/null; then
        echo -e "${GREEN}📡 Starting PHP built-in server on port $PORT${NC}"
        php -S localhost:$PORT &
        SERVER_PID=$!
        return 0
    fi
    
    # Check if Ruby is available
    if command -v ruby &> /dev/null; then
        echo -e "${GREEN}📡 Starting Ruby WEBrick server on port $PORT${NC}"
        ruby -run -e httpd . -p $PORT &
        SERVER_PID=$!
        return 0
    fi
    
    echo -e "${RED}❌ No suitable web server found!${NC}"
    echo -e "${YELLOW}Please install one of the following:${NC}"
    echo -e "${WHITE}  • Python 3: ${CYAN}sudo apt install python3${NC}"
    echo -e "${WHITE}  • Node.js: ${CYAN}sudo apt install nodejs npm && npm install -g http-server${NC}"
    echo -e "${WHITE}  • PHP: ${CYAN}sudo apt install php${NC}"
    return 1
}

# Function to detect and open browser in fullscreen
open_browser() {
    echo -e "${CYAN}🌐 Opening browser in fullscreen...${NC}"
    
    # Wait a moment for server to start
    sleep 2
    
    # Try different browsers with fullscreen flags
    if command -v google-chrome &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with Google Chrome${NC}"
        google-chrome --start-fullscreen --app="$URL" --disable-web-security --disable-features=TranslateUI &
        return 0
    elif command -v chromium-browser &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with Chromium${NC}"
        chromium-browser --start-fullscreen --app="$URL" --disable-web-security &
        return 0
    elif command -v firefox &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with Firefox${NC}"
        firefox --kiosk "$URL" &
        return 0
    elif command -v microsoft-edge &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with Microsoft Edge${NC}"
        microsoft-edge --start-fullscreen --app="$URL" &
        return 0
    elif command -v safari &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with Safari${NC}"
        open -a Safari "$URL"
        # AppleScript to make Safari fullscreen
        osascript -e 'tell application "Safari" to activate' \
                  -e 'tell application "System Events" to keystroke "f" using {control down, command down}' &
        return 0
    elif command -v xdg-open &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with default browser${NC}"
        xdg-open "$URL" &
        return 0
    elif command -v open &> /dev/null; then
        echo -e "${GREEN}🔍 Opening with default browser (macOS)${NC}"
        open "$URL" &
        return 0
    else
        echo -e "${YELLOW}⚠️  Could not detect browser. Please manually open: ${WHITE}$URL${NC}"
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "${CYAN}📡 Stopping web server (PID: $SERVER_PID)${NC}"
        kill $SERVER_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Cleanup complete. Thanks for playing!${NC}"
    exit 0
}

# Function to show controls
show_controls() {
    echo -e "${BLUE}"
    echo "🎮 GAME CONTROLS:"
    echo "  • F11          - Toggle fullscreen in most browsers"
    echo "  • Ctrl+R       - Reload game"
    echo "  • Ctrl+Shift+I - Open developer tools"
    echo "  • Ctrl+C       - Stop server and exit"
    echo -e "${NC}"
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "index.html" ]; then
        echo -e "${RED}❌ index.html not found!${NC}"
        echo -e "${YELLOW}Please run this script from the game directory.${NC}"
        exit 1
    fi
    
    if [ ! -f "game-engine.js" ]; then
        echo -e "${RED}❌ game-engine.js not found!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Game files found${NC}"
}

# Main execution
main() {
    # Set trap for cleanup
    trap cleanup SIGINT SIGTERM
    
    # Print banner
    print_banner
    
    # Check if we're in the right directory
    check_directory
    
    # Check port availability
    check_port
    
    # Start web server
    if ! start_server; then
        exit 1
    fi
    
    # Show information
    echo -e "${WHITE}📍 Game URL: ${CYAN}$URL${NC}"
    echo -e "${WHITE}📂 Serving from: ${CYAN}$(pwd)${NC}"
    
    # Open browser
    open_browser
    
    # Show controls
    show_controls
    
    # Keep script running and show status
    echo -e "${GREEN}🎯 Server is running! Game should open automatically.${NC}"
    echo -e "${YELLOW}💡 If the browser doesn't open, manually navigate to: ${WHITE}$URL${NC}"
    echo -e "${PURPLE}🎲 Press Ctrl+C to stop the server and exit${NC}"
    echo ""
    
    # Wait for server process
    if [ ! -z "$SERVER_PID" ]; then
        wait $SERVER_PID
    else
        # If no server PID, just wait for interrupt
        while true; do
            sleep 1
        done
    fi
}

# Run main function
main "$@"