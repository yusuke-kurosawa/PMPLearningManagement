#!/bin/bash

# Production Deployment Script
# This script handles the complete deployment process with validation and rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV="${1:-production}"
DRY_RUN="${2:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="18.0.0"
    
    if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
        log_error "Node.js version $NODE_VERSION is below required $REQUIRED_VERSION"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory is not clean"
        if [[ "$DEPLOY_ENV" == "production" ]]; then
            log_error "Cannot deploy to production with uncommitted changes"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Run quality checks
run_quality_checks() {
    log_info "Running quality checks..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:run
    
    # Run coverage check
    log_info "Checking test coverage..."
    npm run test:coverage
    
    # Check coverage threshold (80%)
    COVERAGE=$(npm run test:coverage --silent 2>/dev/null | grep -o 'All files.*[0-9]\+\.[0-9]\+' | grep -o '[0-9]\+\.[0-9]\+' | head -1 || echo "0")
    
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
        log_error "Test coverage $COVERAGE% is below 80% threshold"
        exit 1
    fi
    
    log_success "Coverage $COVERAGE% meets requirements"
    
    # Run E2E tests for production
    if [[ "$DEPLOY_ENV" == "production" ]]; then
        log_info "Running E2E tests..."
        npm run test:e2e
    fi
    
    # Run accessibility tests
    log_info "Running accessibility tests..."
    npm run test:a11y
    
    log_success "Quality checks passed"
}

# Build application
build_application() {
    log_info "Building application for $DEPLOY_ENV..."
    
    # Set environment
    export NODE_ENV="$DEPLOY_ENV"
    export VITE_BUILD_VERSION="$(git rev-parse HEAD)"
    export VITE_BUILD_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    # Build
    npm run build
    
    # Verify build
    if [[ ! -d "dist" ]]; then
        log_error "Build failed - dist directory not found"
        exit 1
    fi
    
    if [[ ! -f "dist/index.html" ]]; then
        log_error "Build failed - index.html not found"
        exit 1
    fi
    
    # Check bundle size
    BUNDLE_SIZE=$(du -sk dist/ | cut -f1)
    MAX_SIZE=5120  # 5MB
    
    if [[ $BUNDLE_SIZE -gt $MAX_SIZE ]]; then
        log_error "Bundle size ${BUNDLE_SIZE}KB exceeds maximum ${MAX_SIZE}KB"
        exit 1
    fi
    
    log_success "Build completed - Bundle size: ${BUNDLE_SIZE}KB"
    
    # Generate build info
    cat > dist/build-info.json << EOF
{
  "buildTime": "$VITE_BUILD_TIMESTAMP",
  "commitSha": "$VITE_BUILD_VERSION",
  "environment": "$DEPLOY_ENV",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "bundleSize": "${BUNDLE_SIZE}KB"
}
EOF
    
    log_success "Build info generated"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would deploy to GitHub Pages"
        return 0
    fi
    
    log_info "Deploying to GitHub Pages..."
    
    # Deploy using gh-pages
    npm run deploy
    
    log_success "Deployed to GitHub Pages"
}

# Health check
health_check() {
    local url="https://yusuke-kurosawa.github.io/PMPLearningManagement/"
    
    log_info "Performing health check..."
    
    # Wait for deployment to be available
    sleep 30
    
    # Check if site is accessible
    if curl -f -s "$url" > /dev/null; then
        log_success "Site is accessible at $url"
    else
        log_error "Site is not accessible"
        return 1
    fi
    
    # Check build info
    if curl -f -s "${url}build-info.json" > /dev/null; then
        log_success "Build info is accessible"
        BUILD_INFO=$(curl -s "${url}build-info.json")
        echo "$BUILD_INFO" | jq .
    else
        log_warning "Build info not found"
    fi
    
    # Basic smoke test
    if curl -s "$url" | grep -q "PMPLearningManagement"; then
        log_success "Smoke test passed"
    else
        log_error "Smoke test failed"
        return 1
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed. Initiating rollback..."
    
    # Get previous commit
    PREVIOUS_COMMIT=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)
    
    log_info "Rolling back to commit: $PREVIOUS_COMMIT"
    
    # Reset to previous commit and redeploy
    git reset --hard "$PREVIOUS_COMMIT"
    build_application
    deploy_github_pages
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Clean up any temporary files
    rm -rf .nyc_output 2>/dev/null || true
    rm -rf playwright-report 2>/dev/null || true
    rm -rf test-results 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main deployment process
main() {
    log_info "Starting deployment process for environment: $DEPLOY_ENV"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Running in DRY RUN mode"
    fi
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Set up error handling
    trap 'log_error "Deployment failed"; cleanup; exit 1' ERR
    
    # Run deployment steps
    check_prerequisites
    run_quality_checks
    build_application
    
    if [[ "$DEPLOY_ENV" == "production" ]]; then
        deploy_github_pages
        
        # Health check with rollback on failure
        if ! health_check; then
            rollback
            exit 1
        fi
    fi
    
    cleanup
    
    log_success "Deployment completed successfully!"
    
    if [[ "$DEPLOY_ENV" == "production" ]]; then
        echo ""
        echo "🚀 Your application is now live at:"
        echo "   https://yusuke-kurosawa.github.io/PMPLearningManagement/"
        echo ""
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [environment] [dry-run]"
    echo ""
    echo "Arguments:"
    echo "  environment  Deployment environment (production, staging, development)"
    echo "  dry-run      Set to 'true' to run without actual deployment"
    echo ""
    echo "Examples:"
    echo "  $0 production"
    echo "  $0 staging"
    echo "  $0 production true  # Dry run"
}

# Handle script arguments
if [[ "$#" -gt 2 ]]; then
    usage
    exit 1
fi

if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    usage
    exit 0
fi

# Run main function
main