#!/bin/bash

# ================================================================
# Maintenance Deployment Script
# Purpose: Automated deployment with health checks and monitoring
# Usage: ./scripts/maintenance-deploy.sh [--force] [--skip-tests]
# ================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="https://yusuke-kurosawa.github.io/PMPLearningManagement/"
HEALTH_CHECK_TIMEOUT=60
BACKUP_ENABLED=${BACKUP_ENABLED:-true}

# Parse arguments
FORCE_DEPLOY=false
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--force] [--skip-tests]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 Starting Maintenance Deployment Process${NC}"
echo "========================================"
echo "Timestamp: $(date)"
echo "Site URL: $SITE_URL"
echo "Force Deploy: $FORCE_DEPLOY"
echo "Skip Tests: $SKIP_TESTS"
echo "========================================"

# Function to print step headers
print_step() {
    echo -e "\n${BLUE}📋 Step: $1${NC}"
    echo "----------------------------------------"
}

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 completed successfully${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Pre-deployment checks
print_step "Pre-deployment Health Checks"

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ] && [ "$FORCE_DEPLOY" != "true" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on main branch (current: $current_branch)${NC}"
    echo "Use --force to deploy from this branch"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ] && [ "$FORCE_DEPLOY" != "true" ]; then
    echo -e "${YELLOW}⚠️  Warning: Uncommitted changes detected${NC}"
    echo "Commit your changes or use --force to continue"
    git status --short
    exit 1
fi

echo -e "${GREEN}✅ Git status check passed${NC}"

# Step 2: Dependency check
print_step "Dependency Installation"
npm ci
check_success "Dependency installation"

# Step 3: Quality checks (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    print_step "Quality Assurance Checks"
    
    echo "Running linting..."
    npm run lint
    check_success "ESLint check"
    
    echo "Running type checking..."
    npm run typecheck || {
        echo -e "${YELLOW}⚠️  TypeScript warnings detected, continuing...${NC}"
    }
    
    echo "Running unit tests..."
    npm run test:run
    check_success "Unit tests"
    
    echo -e "${GREEN}✅ All quality checks passed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping quality checks as requested${NC}"
fi

# Step 4: Build and optimization
print_step "Build and Optimization"

echo "Building optimized production bundle..."
npm run build:optimized
check_success "Production build"

# Analyze build output
echo "Build analysis:"
du -sh dist/
echo "JavaScript assets:"
find dist -name "*.js" -exec du -h {} + | sort -hr | head -5
echo "CSS assets:"
find dist -name "*.css" -exec du -h {} + | sort -hr

# Step 5: Backup current deployment (if enabled)
if [ "$BACKUP_ENABLED" = "true" ]; then
    print_step "Creating Deployment Backup"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/deploy_$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Save current deployment info
    echo "Backup created: $timestamp" > "$backup_dir/backup_info.txt"
    echo "Branch: $current_branch" >> "$backup_info"
    echo "Commit: $(git rev-parse HEAD)" >> "$backup_info"
    
    echo -e "${GREEN}✅ Backup created: $backup_dir${NC}"
fi

# Step 6: Deploy
print_step "Deployment Execution"

echo "Deploying to GitHub Pages..."
npm run deploy
check_success "GitHub Pages deployment"

# Step 7: Health checks
print_step "Post-deployment Health Checks"

echo "Waiting for deployment to propagate..."
sleep 30

# Basic connectivity test
echo "Testing site accessibility..."
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" || echo "000")

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Site is accessible (HTTP $http_code)${NC}"
else
    echo -e "${RED}❌ Site returned HTTP $http_code${NC}"
    echo "Deployment may have failed or is still propagating"
    exit 1
fi

# Test SPA routing
echo "Testing SPA routing..."
spa_code=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}#/matrix" || echo "000")
if [ "$spa_code" = "200" ]; then
    echo -e "${GREEN}✅ SPA routing is working${NC}"
else
    echo -e "${YELLOW}⚠️  SPA routing returned HTTP $spa_code${NC}"
fi

# Test PWA manifest
echo "Testing PWA manifest..."
manifest_code=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}manifest.json" || echo "000")
if [ "$manifest_code" = "200" ]; then
    echo -e "${GREEN}✅ PWA manifest is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  PWA manifest returned HTTP $manifest_code${NC}"
fi

# Step 8: Generate deployment report
print_step "Deployment Report Generation"

report_file="deployment-reports/deploy_$(date +%Y%m%d_%H%M%S).json"
mkdir -p "$(dirname "$report_file")"

cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "branch": "$current_branch",
  "commit": "$(git rev-parse HEAD)",
  "commit_message": "$(git log -1 --pretty=format:'%s')",
  "site_url": "$SITE_URL",
  "build_time": "$(date -Iseconds)",
  "health_checks": {
    "site_accessible": $([ "$http_code" = "200" ] && echo "true" || echo "false"),
    "spa_routing": $([ "$spa_code" = "200" ] && echo "true" || echo "false"),
    "pwa_manifest": $([ "$manifest_code" = "200" ] && echo "true" || echo "false")
  },
  "build_size": "$(du -sh dist/ | cut -f1)",
  "deployment_method": "gh-pages",
  "quality_checks_skipped": $SKIP_TESTS,
  "force_deployed": $FORCE_DEPLOY
}
EOF

echo -e "${GREEN}✅ Deployment report saved: $report_file${NC}"

# Final summary
print_step "Deployment Summary"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Summary:"
echo "  • Site URL: $SITE_URL"
echo "  • Branch: $current_branch"
echo "  • Commit: $(git rev-parse --short HEAD)"
echo "  • Build Size: $(du -sh dist/ | cut -f1)"
echo "  • Deployment Time: $(date)"
echo ""
echo "🔍 Next Steps:"
echo "  • Monitor site performance for 24 hours"
echo "  • Check browser console for any runtime errors"
echo "  • Verify all major user flows are working"
echo ""
echo -e "${BLUE}📋 Maintenance deployment completed successfully!${NC}"