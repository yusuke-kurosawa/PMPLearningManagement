#!/bin/bash

# Node.js v20 Installation Script using apt
echo "🔧 Node.js v20 Installation via apt"
echo "====================================="

# Check current version
echo ""
echo "📌 Current Node.js version:"
node --version 2>/dev/null || echo "Node.js not installed"

# Remove old Node.js (optional)
echo ""
echo "⚠️  Do you want to remove the old Node.js? (y/n)"
read -r REMOVE_OLD

if [ "$REMOVE_OLD" = "y" ]; then
    echo "🗑️  Removing old Node.js..."
    sudo apt-get remove -y nodejs npm
    sudo apt-get autoremove -y
fi

# Add NodeSource repository for Node.js v20
echo ""
echo "📦 Adding NodeSource repository for Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js v20
echo ""
echo "⬇️  Installing Node.js v20..."
sudo apt-get install -y nodejs

# Verify installation
echo ""
echo "✅ Installation complete!"
echo "📌 New Node.js version:"
node --version
npm --version

echo ""
echo "🎯 Next steps:"
echo "  1. Verify: node --version (should show v20.x.x)"
echo "  2. Rebuild project: cd /home/kurosawa/PMPLearningManagement && npm run build"
echo "  3. Deploy: npm run deploy"
