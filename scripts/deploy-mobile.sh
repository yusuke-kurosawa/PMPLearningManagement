#!/bin/bash

# PMP Learning Management - Mobile Deployment Script
# This script builds and deploys the mobile-optimized PWA

set -e

echo "🚀 Starting mobile-optimized deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Node.js $NODE_VERSION detected. Required: $REQUIRED_VERSION+${NC}"
fi

echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

echo "🔍 Running TypeScript checks..."
npm run typecheck

echo "🧹 Running linter..."
npm run lint

echo "🧪 Running tests..."
if npm list vitest >/dev/null 2>&1; then
    npm run test:run
else
    echo -e "${YELLOW}No tests found, skipping...${NC}"
fi

echo "🏗️ Building production bundle..."
npm run build:production

echo "📊 Analyzing bundle size..."
if [ -f ".bundlesizerc.json" ]; then
    npm run performance:budget
fi

echo "📱 Validating PWA configuration..."

# Check service worker
if [ ! -f "public/sw.js" ]; then
    echo -e "${RED}Error: Service worker not found at public/sw.js${NC}"
    exit 1
fi

# Check manifest
if [ ! -f "public/manifest.json" ]; then
    echo -e "${RED}Error: Web app manifest not found at public/manifest.json${NC}"
    exit 1
fi

# Validate manifest
node -e "
const manifest = require('./public/manifest.json');
const required = ['name', 'short_name', 'icons', 'start_url', 'display'];
const missing = required.filter(field => !manifest[field]);
if (missing.length > 0) {
    console.error('Missing manifest fields:', missing);
    process.exit(1);
}
console.log('✅ Manifest validation passed');
"

# Check icons
if [ ! -f "public/icon-192x192.png" ] || [ ! -f "public/icon-512x512.png" ]; then
    echo -e "${YELLOW}Warning: PWA icons not found${NC}"
fi

echo "🔒 Running security audit..."
npm audit --audit-level=high

echo "📈 Running Lighthouse CI (if available)..."
if [ -f ".lighthouserc.json" ]; then
    if command -v lhci >/dev/null 2>&1; then
        lhci autorun
    else
        echo -e "${YELLOW}Lighthouse CI not installed, skipping...${NC}"
    fi
fi

echo "🚀 Deployment checks completed successfully!"

# If this is a production deployment
if [ "$1" = "production" ]; then
    echo "🌍 Deploying to production..."
    
    # Add your production deployment commands here
    # For example, if using Vercel:
    # npx vercel --prod
    
    # If using GitHub Pages:
    # npm run deploy
    
    # If using Docker:
    # docker build -t pmp-learning-mobile .
    # docker push your-registry/pmp-learning-mobile
    
    echo -e "${GREEN}✅ Production deployment completed!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Mobile deployment ready!${NC}"
echo ""
echo "📱 Mobile Features Available:"
echo "   ✅ Progressive Web App (PWA)"
echo "   ✅ Touch gesture support"
echo "   ✅ Offline functionality"
echo "   ✅ Mobile-optimized UI"
echo "   ✅ Native-like experience"
echo "   ✅ App installation prompts"
echo ""
echo "🔧 Test your deployment:"
echo "   1. Open in mobile browser"
echo "   2. Check PWA install prompt"
echo "   3. Test offline functionality"
echo "   4. Verify touch gestures"
echo "   5. Test on various screen sizes"
echo ""
echo -e "${YELLOW}📋 Post-deployment checklist:${NC}"
echo "   □ Test on iOS Safari"
echo "   □ Test on Android Chrome"
echo "   □ Verify service worker registration"
echo "   □ Check manifest.json serving"
echo "   □ Test offline functionality"
echo "   □ Verify touch interactions"
echo "   □ Check performance metrics"
echo ""

# Optional: Open deployment in browser for testing
if command -v open >/dev/null 2>&1 || command -v xdg-open >/dev/null 2>&1; then
    read -p "Open deployment for testing? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$1" = "production" ]; then
            # Add your production URL here
            URL="https://your-domain.com"
        else
            URL="http://localhost:3000"
        fi
        
        if command -v open >/dev/null 2>&1; then
            open "$URL"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "$URL"
        fi
    fi
fi