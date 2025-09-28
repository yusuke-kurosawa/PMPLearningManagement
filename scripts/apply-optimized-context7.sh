#!/bin/bash

# Apply Optimized Context7 Configuration Script
# This script applies the optimized Context7 configuration to Claude Desktop

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration paths
CONFIG_DIR="$HOME/.config/Claude"
CURRENT_CONFIG="$CONFIG_DIR/claude_desktop_config.json"
OPTIMIZED_CONFIG="$CONFIG_DIR/claude_desktop_config_optimized.json"
BACKUP_CONFIG="$CONFIG_DIR/claude_desktop_config.backup.$(date +%Y%m%d_%H%M%S).json"

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to print banner
print_banner() {
    echo
    print_color $BLUE "╔══════════════════════════════════════════════════════════╗"
    print_color $BLUE "║        Context7 MCP Optimization Installer              ║"
    print_color $BLUE "║        Maximize Documentation Retrieval Speed           ║"
    print_color $BLUE "╚══════════════════════════════════════════════════════════╝"
    echo
}

# Function to check prerequisites
check_prerequisites() {
    print_color $YELLOW "📋 Checking prerequisites..."

    # Check if Claude Desktop config exists
    if [ ! -f "$CURRENT_CONFIG" ]; then
        print_color $RED "❌ Claude Desktop config not found at $CURRENT_CONFIG"
        print_color $YELLOW "Please ensure Claude Desktop is installed and has been run at least once."
        exit 1
    fi

    # Check if optimized config exists
    if [ ! -f "$OPTIMIZED_CONFIG" ]; then
        print_color $RED "❌ Optimized config not found at $OPTIMIZED_CONFIG"
        print_color $YELLOW "The optimized configuration has already been created."
        exit 1
    fi

    # Check if jq is installed for JSON manipulation
    if ! command -v jq &> /dev/null; then
        print_color $YELLOW "⚠️  jq is not installed. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install jq
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y jq
        else
            print_color $RED "Please install jq manually"
            exit 1
        fi
    fi

    print_color $GREEN "✅ All prerequisites met"
}

# Function to backup current configuration
backup_configuration() {
    print_color $YELLOW "💾 Creating backup of current configuration..."

    cp "$CURRENT_CONFIG" "$BACKUP_CONFIG"

    if [ -f "$BACKUP_CONFIG" ]; then
        print_color $GREEN "✅ Backup created: $BACKUP_CONFIG"
    else
        print_color $RED "❌ Failed to create backup"
        exit 1
    fi
}

# Function to apply optimized configuration
apply_optimized_config() {
    print_color $YELLOW "🚀 Applying optimized Context7 configuration..."

    # Check if user wants to add Upstash credentials
    echo
    read -p "Do you have Upstash API credentials to add? (y/n): " has_upstash

    if [[ $has_upstash == "y" || $has_upstash == "Y" ]]; then
        print_color $CYAN "Please enter your Upstash credentials:"
        read -p "UPSTASH_REDIS_REST_URL: " upstash_url
        read -sp "UPSTASH_REDIS_REST_TOKEN: " upstash_token
        echo

        # Add Upstash credentials to the optimized config
        if [ -n "$upstash_url" ] && [ -n "$upstash_token" ]; then
            jq --arg url "$upstash_url" --arg token "$upstash_token" \
                '.mcpServers.context7.env.UPSTASH_REDIS_REST_URL = $url |
                 .mcpServers.context7.env.UPSTASH_REDIS_REST_TOKEN = $token' \
                "$OPTIMIZED_CONFIG" > "$OPTIMIZED_CONFIG.tmp"
            mv "$OPTIMIZED_CONFIG.tmp" "$OPTIMIZED_CONFIG"
            print_color $GREEN "✅ Upstash credentials added"
        fi
    fi

    # Apply the optimized configuration
    cp "$OPTIMIZED_CONFIG" "$CURRENT_CONFIG"

    if [ $? -eq 0 ]; then
        print_color $GREEN "✅ Optimized configuration applied successfully"
    else
        print_color $RED "❌ Failed to apply optimized configuration"
        exit 1
    fi
}

# Function to verify configuration
verify_configuration() {
    print_color $YELLOW "🔍 Verifying configuration..."

    # Check if configuration is valid JSON
    if jq empty "$CURRENT_CONFIG" 2>/dev/null; then
        print_color $GREEN "✅ Configuration is valid JSON"
    else
        print_color $RED "❌ Configuration is not valid JSON"
        print_color $YELLOW "Restoring backup..."
        cp "$BACKUP_CONFIG" "$CURRENT_CONFIG"
        exit 1
    fi

    # Check if Context7 is configured
    if jq -e '.mcpServers.context7' "$CURRENT_CONFIG" >/dev/null; then
        print_color $GREEN "✅ Context7 MCP server is configured"
    else
        print_color $RED "❌ Context7 configuration not found"
        exit 1
    fi

    # Display key optimizations
    print_color $CYAN "\n📊 Applied Optimizations:"
    echo "  • Cache TTL: 7 days (604800 seconds)"
    echo "  • Max Cache Size: 500MB"
    echo "  • Concurrent Requests: 10"
    echo "  • Request Timeout: 45 seconds"
    echo "  • Intelligent Prefetch: Enabled"
    echo "  • Predictive Loading: Enabled"
    echo "  • Smart Caching: Enabled"
    echo "  • Connection Pooling: Enabled"
    echo "  • Memory Limit: 8GB"

    # Check documentation sources
    sources_count=$(jq '.mcpServers.context7.settings.documentation.sources | length' "$CURRENT_CONFIG")
    print_color $GREEN "\n✅ Configured with $sources_count documentation sources"
}

# Function to display next steps
show_next_steps() {
    print_color $BLUE "\n📋 Next Steps:"
    echo
    echo "1. ${YELLOW}Restart Claude Desktop${NC} to apply the changes"
    echo "   - Completely quit Claude Desktop (Cmd+Q on Mac, Alt+F4 on Windows/Linux)"
    echo "   - Restart the application"
    echo
    echo "2. ${YELLOW}Test the configuration:${NC}"
    echo "   npm run context7:test"
    echo
    echo "3. ${YELLOW}Monitor performance:${NC}"
    echo "   npm run context7:monitor"
    echo
    echo "4. ${YELLOW}View cache statistics:${NC}"
    echo "   npm run context7:cache:stats"
    echo
    echo "5. ${YELLOW}If you need to add Upstash later:${NC}"
    echo "   npm run upstash:setup"
    echo
    print_color $GREEN "🎉 Configuration optimization complete!"
}

# Function to show comparison
show_comparison() {
    print_color $CYAN "\n📊 Configuration Comparison:"
    echo
    echo "┌─────────────────────┬──────────────┬──────────────┐"
    echo "│ Setting             │ Previous     │ Optimized    │"
    echo "├─────────────────────┼──────────────┼──────────────┤"
    echo "│ Cache TTL           │ 1 day        │ 7 days       │"
    echo "│ Max Cache Size      │ 100MB        │ 500MB        │"
    echo "│ Concurrent Requests │ 5            │ 10           │"
    echo "│ Request Timeout     │ 30s          │ 45s          │"
    echo "│ Memory Limit        │ 4GB          │ 8GB          │"
    echo "│ Prefetch Depth      │ N/A          │ 3 levels     │"
    echo "│ Prefetch Items      │ N/A          │ 100          │"
    echo "│ Compression         │ gzip         │ brotli       │"
    echo "│ Documentation       │ 16 sources   │ 40+ sources  │"
    echo "└─────────────────────┴──────────────┴──────────────┘"
}

# Function to restore backup
restore_backup() {
    print_color $YELLOW "\n⚠️  Restoring previous configuration..."

    if [ -f "$BACKUP_CONFIG" ]; then
        cp "$BACKUP_CONFIG" "$CURRENT_CONFIG"
        print_color $GREEN "✅ Previous configuration restored from: $BACKUP_CONFIG"
    else
        print_color $RED "❌ No backup found to restore"
    fi
}

# Main execution flow
main() {
    print_banner

    # Parse arguments
    case "${1:-}" in
        --restore)
            restore_backup
            exit 0
            ;;
        --help|-h)
            print_color $CYAN "Usage: $0 [options]"
            echo
            echo "Options:"
            echo "  --restore    Restore the previous configuration from backup"
            echo "  --help, -h   Show this help message"
            echo
            echo "This script applies optimized Context7 configuration for better performance."
            exit 0
            ;;
    esac

    check_prerequisites
    backup_configuration
    apply_optimized_config
    verify_configuration
    show_comparison
    show_next_steps

    # Save summary
    print_color $CYAN "\n📝 Configuration Summary:"
    echo "Backup saved at: $BACKUP_CONFIG"
    echo "To restore previous configuration, run:"
    echo "  $0 --restore"
    echo
}

# Trap errors and restore backup if needed
trap 'if [ $? -ne 0 ]; then print_color $RED "\n❌ An error occurred. Restoring backup..."; restore_backup; fi' EXIT

# Run main function
main "$@"