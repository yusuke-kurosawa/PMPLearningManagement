#!/bin/bash

# Upstash Context7 Quick Start Script
# Automates the basic setup process for Upstash integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="PMP Learning Management"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 Upstash Context7 Quick Start${NC}"
echo -e "${CYAN}$PROJECT_NAME - Enhanced Performance Setup${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $REQUIRED_VERSION or higher is required. Current: $NODE_VERSION${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version check passed${NC}"

# Check if dependencies are installed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    cd "$PROJECT_ROOT"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check for Upstash Redis dependency
if ! npm list @upstash/redis >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing @upstash/redis...${NC}"
    cd "$PROJECT_ROOT"
    npm install @upstash/redis
    echo -e "${GREEN}✓ @upstash/redis installed${NC}"
fi

# Display setup options
echo ""
echo -e "${CYAN}Setup Options:${NC}"
echo "1. Interactive setup wizard (recommended)"
echo "2. Validate existing configuration"
echo "3. Run performance tests"
echo "4. Troubleshoot issues"
echo "5. View setup guide"
echo "6. Exit"
echo ""

read -p "Choose an option (1-6): " option

case $option in
    1)
        echo -e "${BLUE}🧙 Starting interactive setup wizard...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/upstash-setup.js
        ;;
    2)
        echo -e "${BLUE}🔍 Validating configuration...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/upstash-validate.js
        ;;
    3)
        echo -e "${BLUE}🧪 Running performance tests...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/upstash-test.js --compare
        ;;
    4)
        echo -e "${BLUE}🔧 Starting troubleshooting assistant...${NC}"
        cd "$PROJECT_ROOT"
        node scripts/upstash-troubleshoot.js
        ;;
    5)
        echo -e "${BLUE}📖 Opening setup guide...${NC}"
        if command -v code >/dev/null 2>&1; then
            code "$PROJECT_ROOT/docs/UPSTASH_CONTEXT7_SETUP_GUIDE.md"
        elif command -v less >/dev/null 2>&1; then
            less "$PROJECT_ROOT/docs/UPSTASH_CONTEXT7_SETUP_GUIDE.md"
        else
            echo -e "${CYAN}Setup guide location: docs/UPSTASH_CONTEXT7_SETUP_GUIDE.md${NC}"
        fi
        ;;
    6)
        echo -e "${CYAN}👋 Goodbye! Run this script again anytime.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option. Please choose 1-6.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Setup completed!${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "• Monitor performance: Check Upstash dashboard"
echo "• Run periodic tests: npm run upstash:test"
echo "• Get help: npm run upstash:troubleshoot"
echo ""
echo -e "${CYAN}Resources:${NC}"
echo "• Setup Guide: docs/UPSTASH_CONTEXT7_SETUP_GUIDE.md"
echo "• Upstash Console: https://console.upstash.com"
echo "• Project Documentation: CLAUDE.md"
echo ""