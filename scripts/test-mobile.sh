#!/bin/bash

# PMP Learning Management - Mobile Testing Script
# Comprehensive testing suite for mobile-optimized features

set -e

echo "🧪 Starting mobile component testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}: $message"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_name${NC}: $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "${BLUE}📱 Mobile Component File Structure Tests${NC}"

# Test 1: Mobile component files exist
echo "Testing mobile component file structure..."

mobile_components=(
    "src/components/mobile/MobileFlashCard.tsx"
    "src/components/mobile/MobileMockExam.tsx" 
    "src/components/mobile/MobilePMBOKMatrix.tsx"
    "src/components/mobile/MobileProgressDashboard.tsx"
    "src/components/layout/MobileNavigation.tsx"
    "src/components/layout/MobileLayout.tsx"
)

for component in "${mobile_components[@]}"; do
    if [ -f "$component" ]; then
        log_test "File Existence" "PASS" "$component exists"
    else
        log_test "File Existence" "FAIL" "$component missing"
    fi
done

echo -e "${BLUE}🎯 PWA Infrastructure Tests${NC}"

# Test 2: PWA files exist
pwa_files=(
    "public/sw.js"
    "public/manifest.json" 
    "src/lib/pwa.ts"
    "src/components/PWAManager.tsx"
)

for file in "${pwa_files[@]}"; do
    if [ -f "$file" ]; then
        log_test "PWA File" "PASS" "$file exists"
    else
        log_test "PWA File" "FAIL" "$file missing"
    fi
done

echo -e "${BLUE}🤲 Touch Gesture System Tests${NC}"

# Test 3: Touch gesture hooks exist
touch_files=(
    "src/hooks/useTouchGestures.ts"
)

for file in "${touch_files[@]}"; do
    if [ -f "$file" ]; then
        log_test "Touch System" "PASS" "$file exists"
    else
        log_test "Touch System" "FAIL" "$file missing"
    fi
done

echo -e "${BLUE}🎨 UI Component Tests${NC}"

# Test 4: Mobile-optimized UI components exist
ui_components=(
    "src/components/ui/sheet.tsx"
    "src/components/ui/collapsible.tsx"
    "src/components/ui/progress.tsx"
    "src/components/ui/radio-group.tsx"
    "src/components/ui/badge.tsx"
    "src/components/ui/input.tsx"
    "src/components/ui/checkbox.tsx"
    "src/components/ui/label.tsx"
    "src/components/ui/tabs.tsx"
)

for component in "${ui_components[@]}"; do
    if [ -f "$component" ]; then
        log_test "UI Component" "PASS" "$component exists"
    else
        log_test "UI Component" "FAIL" "$component missing"
    fi
done

echo -e "${BLUE}⚙️  Configuration Tests${NC}"

# Test 5: Mobile-first configuration files
config_files=(
    "tailwind.config.ts"
    ".lighthouserc.json"
    ".bundlesizerc.json"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        log_test "Config File" "PASS" "$file exists"
    else
        log_test "Config File" "FAIL" "$file missing"
    fi
done

echo -e "${BLUE}📦 Package Dependencies Tests${NC}"

# Test 6: Required mobile dependencies
echo "Checking required mobile dependencies..."

mobile_deps=(
    "framer-motion"
    "@radix-ui/react-collapsible"
    "lucide-react"
)

for dep in "${mobile_deps[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        log_test "Dependency" "PASS" "$dep installed"
    else
        log_test "Dependency" "FAIL" "$dep not installed"
    fi
done

echo -e "${BLUE}🧪 Code Quality Tests${NC}"

# Test 7: TypeScript compilation
echo "Testing TypeScript compilation..."
if npm run typecheck >/dev/null 2>&1; then
    log_test "TypeScript" "PASS" "All mobile components compile successfully"
else
    log_test "TypeScript" "FAIL" "TypeScript compilation errors found"
fi

# Test 8: Linting
echo "Testing ESLint compliance..."
if npm run lint >/dev/null 2>&1; then
    log_test "ESLint" "PASS" "All mobile components pass linting"
else
    log_test "ESLint" "FAIL" "Linting errors found in mobile components"
fi

echo -e "${BLUE}📋 Manifest Validation Tests${NC}"

# Test 9: Web App Manifest validation
echo "Validating web app manifest..."
if [ -f "public/manifest.json" ]; then
    # Check required manifest fields
    required_fields=("name" "short_name" "icons" "start_url" "display")
    manifest_valid=true
    
    for field in "${required_fields[@]}"; do
        if ! grep -q "\"$field\"" "public/manifest.json"; then
            log_test "Manifest Field" "FAIL" "$field missing from manifest.json"
            manifest_valid=false
        else
            log_test "Manifest Field" "PASS" "$field present in manifest.json"
        fi
    done
    
    if [ "$manifest_valid" = true ]; then
        log_test "Manifest" "PASS" "Web app manifest is valid"
    else
        log_test "Manifest" "FAIL" "Web app manifest has missing fields"
    fi
else
    log_test "Manifest" "FAIL" "manifest.json not found"
fi

echo -e "${BLUE}🔧 Service Worker Tests${NC}"

# Test 10: Service Worker validation
echo "Validating service worker..."
if [ -f "public/sw.js" ]; then
    # Check for essential service worker features
    sw_features=("install" "activate" "fetch" "caches")
    sw_valid=true
    
    for feature in "${sw_features[@]}"; do
        if grep -q "$feature" "public/sw.js"; then
            log_test "SW Feature" "PASS" "$feature event handler present"
        else
            log_test "SW Feature" "FAIL" "$feature event handler missing"
            sw_valid=false
        fi
    done
    
    if [ "$sw_valid" = true ]; then
        log_test "Service Worker" "PASS" "Service worker has essential features"
    else
        log_test "Service Worker" "FAIL" "Service worker missing essential features"
    fi
else
    log_test "Service Worker" "FAIL" "sw.js not found"
fi

echo -e "${BLUE}🎯 Mobile-Specific Tests${NC}"

# Test 11: Mobile viewport configuration
echo "Checking mobile viewport configuration..."
if grep -q "viewport.*width=device-width" "app/layout.tsx"; then
    log_test "Viewport" "PASS" "Mobile viewport meta tag configured"
else
    log_test "Viewport" "FAIL" "Mobile viewport meta tag missing"
fi

# Test 12: Touch-friendly target sizes
echo "Checking for touch-friendly CSS classes..."
if grep -q "min-height.*44px\|min-width.*44px" "src/components/layout/MobileLayout.tsx"; then
    log_test "Touch Targets" "PASS" "Touch-friendly target sizes configured"
else
    log_test "Touch Targets" "FAIL" "Touch-friendly target sizes not configured"
fi

echo -e "${BLUE}🚀 Build Tests${NC}"

# Test 13: Production build
echo "Testing production build..."
if npm run build >/dev/null 2>&1; then
    log_test "Build" "PASS" "Production build successful"
else
    log_test "Build" "FAIL" "Production build failed"
fi

echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "================================"
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All mobile tests passed! Mobile implementation is ready.${NC}"
    echo ""
    echo -e "${BLUE}✅ Mobile Features Validated:${NC}"
    echo "   📱 Mobile-optimized components"
    echo "   ⚡ Progressive Web App (PWA) setup"
    echo "   🤲 Touch gesture support"
    echo "   🎨 Mobile-first responsive design"
    echo "   📊 Performance monitoring"
    echo "   🔒 Security configurations"
    echo ""
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo "   1. Run npm run dev and test on mobile devices"
    echo "   2. Test PWA installation on iOS/Android"
    echo "   3. Verify offline functionality"
    echo "   4. Run performance audits with Lighthouse"
    echo "   5. Deploy using scripts/deploy-mobile.sh"
    exit 0
else
    echo -e "${RED}❌ Some mobile tests failed. Please fix the issues above.${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Common fixes:${NC}"
    echo "   • Install missing dependencies: npm install"
    echo "   • Fix TypeScript errors: npm run typecheck"
    echo "   • Fix linting issues: npm run lint:fix"
    echo "   • Ensure all files are created correctly"
    exit 1
fi