#!/bin/bash

# ==========================================
# Secure Key Generator for Production
# ==========================================
# This script generates secure keys for production environment
# P0 Security Fix - Required for deployment

set -e

echo "🔐 Secure Key Generator for PMPLearningManagement"
echo "================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate secure keys
generate_keys() {
    echo "📝 Generating secure keys..."
    echo ""
    
    # Generate ENCRYPTION_MASTER_KEY (64 hex characters)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    # Generate HASH_PEPPER (32 hex characters)
    HASH_PEPPER=$(openssl rand -hex 16)
    
    # Generate APP_SECRET (base64, 32+ characters)
    APP_SECRET=$(openssl rand -base64 32)
    
    # Display generated keys
    echo -e "${GREEN}✅ Keys generated successfully!${NC}"
    echo ""
    echo "=========================================="
    echo "COPY THESE TO YOUR ENVIRONMENT VARIABLES:"
    echo "=========================================="
    echo ""
    echo -e "${YELLOW}ENCRYPTION_MASTER_KEY=${NC}${ENCRYPTION_KEY}"
    echo ""
    echo -e "${YELLOW}HASH_PEPPER=${NC}${HASH_PEPPER}"
    echo ""
    echo -e "${YELLOW}APP_SECRET=${NC}${APP_SECRET}"
    echo ""
    echo "=========================================="
}

# Function to create .env.production.local
create_env_file() {
    echo ""
    read -p "Do you want to create .env.production.local file? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Check if file exists
        if [ -f ".env.production.local" ]; then
            echo -e "${YELLOW}⚠️  .env.production.local already exists.${NC}"
            read -p "Overwrite? (y/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Skipping file creation."
                return
            fi
        fi
        
        # Copy template
        cp .env.production.example .env.production.local
        
        # Replace placeholder values
        sed -i "s/your_64_character_hex_key_here_do_not_use_this_example_key/${ENCRYPTION_KEY}/g" .env.production.local
        sed -i "s/your_32_character_hex_pepper_here/${HASH_PEPPER}/g" .env.production.local
        sed -i "s/your_application_secret_key_here_minimum_32_characters/${APP_SECRET}/g" .env.production.local
        
        echo -e "${GREEN}✅ .env.production.local created successfully!${NC}"
        echo ""
        echo -e "${RED}⚠️  IMPORTANT: Never commit .env.production.local to the repository!${NC}"
    fi
}

# Function to display GitHub Secrets instructions
github_secrets_instructions() {
    echo ""
    echo "=========================================="
    echo "📚 GitHub Secrets Setup Instructions:"
    echo "=========================================="
    echo ""
    echo "1. Go to your repository on GitHub:"
    echo "   https://github.com/yusuke-kurosawa/PMPLearningManagement"
    echo ""
    echo "2. Navigate to: Settings > Secrets and variables > Actions"
    echo ""
    echo "3. Click 'New repository secret' and add each of the following:"
    echo ""
    echo "   Secret name: ENCRYPTION_MASTER_KEY"
    echo "   Secret value: ${ENCRYPTION_KEY}"
    echo ""
    echo "   Secret name: HASH_PEPPER"
    echo "   Secret value: ${HASH_PEPPER}"
    echo ""
    echo "   Secret name: APP_SECRET"
    echo "   Secret value: ${APP_SECRET}"
    echo ""
    echo "4. Also add your Supabase credentials:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "5. (Optional) Add Upstash Redis credentials:"
    echo "   - UPSTASH_REDIS_REST_URL"
    echo "   - UPSTASH_REDIS_REST_TOKEN"
    echo ""
}

# Main execution
main() {
    # Check if openssl is installed
    if ! command -v openssl &> /dev/null; then
        echo -e "${RED}❌ Error: openssl is not installed.${NC}"
        echo "Please install openssl first:"
        echo "  Ubuntu/Debian: sudo apt-get install openssl"
        echo "  macOS: brew install openssl"
        exit 1
    fi
    
    # Generate keys
    generate_keys
    
    # Optionally create .env file
    create_env_file
    
    # Show GitHub instructions
    github_secrets_instructions
    
    echo -e "${GREEN}✨ Setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Security Reminders:${NC}"
    echo "  - Store these keys in a secure password manager"
    echo "  - Never share these keys in public forums"
    echo "  - Rotate keys periodically (recommended: every 90 days)"
    echo "  - Use different keys for development and production"
    echo ""
}

# Run main function
main
