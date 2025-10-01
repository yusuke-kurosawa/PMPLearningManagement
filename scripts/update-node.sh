#!/bin/bash

# Node.js Update Script using nvm
echo "🔧 Node.js Update Script"
echo "========================"

# Load nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    echo "✅ nvm loaded"
else
    echo "❌ nvm not found at $NVM_DIR/nvm.sh"
    echo ""
    echo "Please install nvm first:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Show current version
echo ""
echo "📌 Current Node.js version:"
node --version

# Show available versions
echo ""
echo "📋 Installed Node.js versions:"
nvm list

# Install Node.js v20 (LTS)
echo ""
echo "🚀 Installing Node.js v20 (LTS)..."
nvm install 20

# Set as default
echo ""
echo "🔧 Setting Node.js v20 as default..."
nvm alias default 20

# Use v20
echo ""
echo "✅ Switching to Node.js v20..."
nvm use 20

# Verify installation
echo ""
echo "✅ Node.js updated successfully!"
echo "📌 New version:"
node --version
npm --version

echo ""
echo "💡 Tips:"
echo "  - To use this version: nvm use 20"
echo "  - To switch versions: nvm use <version>"
echo "  - To list versions: nvm list"
echo ""
echo "🎯 Next steps:"
echo "  1. Restart your terminal or run: source ~/.bashrc"
echo "  2. Verify: node --version"
echo "  3. Rebuild: npm run build"
