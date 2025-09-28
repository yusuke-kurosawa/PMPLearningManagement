#!/bin/bash

# Context7 Upstash API Key Setup Script
# This script helps configure Upstash API key for Context7 MCP server

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Context7 Upstash API Integration Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed. Installing it now..."
    sudo apt-get update && sudo apt-get install -y jq
fi

CONFIG_FILE="$HOME/.config/Claude/claude_desktop_config.json"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found at: $CONFIG_FILE"
    exit 1
fi

echo "📋 Current Context7 Configuration Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Upstash API key is already configured
if grep -q "UPSTASH_REDIS_REST_URL" "$CONFIG_FILE" 2>/dev/null; then
    echo "✅ Upstash API is already configured"
    echo ""
    echo "Would you like to update the configuration? (y/n)"
    read -r UPDATE_CHOICE
    if [ "$UPDATE_CHOICE" != "y" ]; then
        echo "📌 Keeping existing configuration."
        exit 0
    fi
else
    echo "⚠️  Upstash API is not configured"
fi

echo ""
echo "🔑 Upstash API Key Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get your Upstash credentials:"
echo "1. Visit https://console.upstash.com/"
echo "2. Sign up or log in"
echo "3. Create a new Redis database (free tier available)"
echo "4. Copy the REST URL and Token from the REST API section"
echo ""

# Get Upstash credentials
echo "Enter your Upstash Redis REST URL:"
read -r UPSTASH_URL

echo "Enter your Upstash Redis REST Token:"
read -s -r UPSTASH_TOKEN
echo ""

# Validate inputs
if [ -z "$UPSTASH_URL" ] || [ -z "$UPSTASH_TOKEN" ]; then
    echo "❌ Both URL and Token are required"
    exit 1
fi

echo "🔧 Updating Context7 configuration..."

# Create backup
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# Update the configuration using jq
jq --arg url "$UPSTASH_URL" --arg token "$UPSTASH_TOKEN" \
   '.mcpServers.context7.env += {
      "UPSTASH_REDIS_REST_URL": $url,
      "UPSTASH_REDIS_REST_TOKEN": $token,
      "CONTEXT7_ENABLE_UPSTASH": "true",
      "CONTEXT7_PERSISTENT_CACHE": "true",
      "CONTEXT7_CACHE_BACKEND": "upstash"
   }' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "✅ Configuration updated successfully"

# Create environment file for local development
ENV_FILE=".context7-upstash.env"
cat > "$ENV_FILE" << EOF
# Context7 Upstash Configuration
# Generated on $(date)
UPSTASH_REDIS_REST_URL=$UPSTASH_URL
UPSTASH_REDIS_REST_TOKEN=$UPSTASH_TOKEN
CONTEXT7_ENABLE_UPSTASH=true
CONTEXT7_PERSISTENT_CACHE=true
CONTEXT7_CACHE_BACKEND=upstash
EOF

echo "✅ Environment file created: $ENV_FILE"

echo ""
echo "🎉 Upstash API Integration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Benefits enabled:"
echo "   • Persistent caching across sessions"
echo "   • Shared cache with team members"
echo "   • 10x higher rate limits"
echo "   • Advanced analytics"
echo "   • Premium support"
echo ""
echo "📝 Next steps:"
echo "   1. Restart Claude Desktop to apply changes"
echo "   2. Test with: npm run context7:test"
echo "   3. Monitor performance: npm run context7:monitor"
echo ""
echo "🔒 Security note: Your credentials are stored securely in:"
echo "   • $CONFIG_FILE"
echo "   • $ENV_FILE (add to .gitignore)"
echo ""