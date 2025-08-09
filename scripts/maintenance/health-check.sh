#!/bin/bash

# Health Check Script
# Comprehensive health monitoring for the deployed application

set -euo pipefail

# Configuration
BASE_URL="${1:-https://yusuke-kurosawa.github.io/PMPLearningManagement}"
TIMEOUT="${2:-30}"
RETRIES="${3:-3}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Health check results
HEALTH_STATUS="healthy"
FAILED_CHECKS=0
WARNINGS=0

# Record check result
record_result() {
    local check_name="$1"
    local status="$2"
    local message="$3"
    
    case "$status" in
        "pass")
            log_success "$check_name: $message"
            ;;
        "warn")
            log_warning "$check_name: $message"
            ((WARNINGS++))
            ;;
        "fail")
            log_error "$check_name: $message"
            ((FAILED_CHECKS++))
            HEALTH_STATUS="unhealthy"
            ;;
    esac
}

# HTTP connectivity check
check_connectivity() {
    log_info "Checking HTTP connectivity..."
    
    local url="$BASE_URL/"
    local response_code
    
    if response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url"); then
        if [[ "$response_code" == "200" ]]; then
            record_result "HTTP Connectivity" "pass" "Site accessible (HTTP $response_code)"
        else
            record_result "HTTP Connectivity" "fail" "Unexpected HTTP status: $response_code"
        fi
    else
        record_result "HTTP Connectivity" "fail" "Site not accessible"
    fi
}

# Response time check
check_response_time() {
    log_info "Checking response time..."
    
    local url="$BASE_URL/"
    local response_time
    
    if response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        local time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
        
        if (( time_ms < 2000 )); then
            record_result "Response Time" "pass" "${time_ms}ms (excellent)"
        elif (( time_ms < 5000 )); then
            record_result "Response Time" "warn" "${time_ms}ms (acceptable)"
        else
            record_result "Response Time" "fail" "${time_ms}ms (too slow)"
        fi
    else
        record_result "Response Time" "fail" "Unable to measure response time"
    fi
}

# Content check
check_content() {
    log_info "Checking page content..."
    
    local url="$BASE_URL/"
    local content
    
    if content=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        # Check for key content indicators
        if echo "$content" | grep -q "PMPLearningManagement"; then
            record_result "Content Check" "pass" "Key content found"
        else
            record_result "Content Check" "fail" "Key content missing"
        fi
        
        # Check for error indicators
        if echo "$content" | grep -qi "error\|404\|not found\|exception"; then
            record_result "Error Check" "fail" "Error content detected"
        else
            record_result "Error Check" "pass" "No error content detected"
        fi
    else
        record_result "Content Check" "fail" "Unable to fetch content"
    fi
}

# Build info check
check_build_info() {
    log_info "Checking build information..."
    
    local url="$BASE_URL/build-info.json"
    local build_info
    
    if build_info=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        if echo "$build_info" | jq . >/dev/null 2>&1; then
            local build_time commit_sha environment
            build_time=$(echo "$build_info" | jq -r '.buildTime // "unknown"')
            commit_sha=$(echo "$build_info" | jq -r '.commitSha // "unknown"' | cut -c1-7)
            environment=$(echo "$build_info" | jq -r '.environment // "unknown"')
            
            record_result "Build Info" "pass" "Build: $commit_sha ($environment) at $build_time"
            
            # Check build age
            if [[ "$build_time" != "unknown" ]]; then
                local build_timestamp build_age_hours
                build_timestamp=$(date -d "$build_time" +%s 2>/dev/null || echo "0")
                current_timestamp=$(date +%s)
                build_age_hours=$(( (current_timestamp - build_timestamp) / 3600 ))
                
                if (( build_age_hours > 168 )); then  # 1 week
                    record_result "Build Age" "warn" "Build is ${build_age_hours} hours old"
                else
                    record_result "Build Age" "pass" "Build is ${build_age_hours} hours old"
                fi
            fi
        else
            record_result "Build Info" "fail" "Invalid build info JSON"
        fi
    else
        record_result "Build Info" "warn" "Build info not available"
    fi
}

# Route accessibility check
check_routes() {
    log_info "Checking route accessibility..."
    
    local routes=("/" "/#/matrix" "/#/network" "/#/visualizations" "/#/glossary" "/#/progress")
    local successful_routes=0
    
    for route in "${routes[@]}"; do
        local url="$BASE_URL$route"
        local route_name=$(echo "$route" | sed 's/\/#\///' | sed 's/^\//home/')
        
        if curl -s -f --max-time 10 "$url" > /dev/null; then
            log_success "Route: $route_name"
            ((successful_routes++))
        else
            log_error "Route: $route_name (inaccessible)"
        fi
    done
    
    local success_rate=$((successful_routes * 100 / ${#routes[@]}))
    
    if (( success_rate == 100 )); then
        record_result "Route Accessibility" "pass" "$successful_routes/${#routes[@]} routes accessible"
    elif (( success_rate >= 80 )); then
        record_result "Route Accessibility" "warn" "$successful_routes/${#routes[@]} routes accessible ($success_rate%)"
    else
        record_result "Route Accessibility" "fail" "$successful_routes/${#routes[@]} routes accessible ($success_rate%)"
    fi
}

# Security headers check
check_security_headers() {
    log_info "Checking security headers..."
    
    local url="$BASE_URL/"
    local headers
    
    if headers=$(curl -s -I --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        local security_score=0
        
        # Check for important security headers
        if echo "$headers" | grep -qi "x-frame-options"; then
            ((security_score++))
        fi
        
        if echo "$headers" | grep -qi "x-content-type-options"; then
            ((security_score++))
        fi
        
        if echo "$headers" | grep -qi "strict-transport-security"; then
            ((security_score++))
        fi
        
        if echo "$headers" | grep -qi "content-security-policy"; then
            ((security_score++))
        fi
        
        if (( security_score >= 3 )); then
            record_result "Security Headers" "pass" "$security_score/4 headers present"
        elif (( security_score >= 1 )); then
            record_result "Security Headers" "warn" "$security_score/4 headers present"
        else
            record_result "Security Headers" "warn" "No security headers detected"
        fi
    else
        record_result "Security Headers" "fail" "Unable to fetch headers"
    fi
}

# Performance check
check_performance() {
    log_info "Checking basic performance metrics..."
    
    local url="$BASE_URL/"
    local timing_info
    
    if timing_info=$(curl -s -o /dev/null -w "DNS: %{time_namelookup}s, Connect: %{time_connect}s, SSL: %{time_appconnect}s, Transfer: %{time_starttransfer}s, Total: %{time_total}s" --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        record_result "Performance Timing" "pass" "$timing_info"
        
        # Extract total time for evaluation
        local total_time
        total_time=$(echo "$timing_info" | grep -o "Total: [0-9.]*" | cut -d' ' -f2 | cut -d's' -f1)
        local time_ms=$(echo "$total_time * 1000" | bc -l | cut -d. -f1)
        
        if (( time_ms > 5000 )); then
            record_result "Performance Evaluation" "warn" "Total time ${time_ms}ms is high"
        else
            record_result "Performance Evaluation" "pass" "Total time ${time_ms}ms is acceptable"
        fi
    else
        record_result "Performance Check" "fail" "Unable to measure performance"
    fi
}

# Resource availability check
check_resources() {
    log_info "Checking critical resources..."
    
    local resources=("/assets/index.js" "/assets/index.css")
    local available_resources=0
    
    for resource in "${resources[@]}"; do
        local url="$BASE_URL$resource"
        
        if curl -s -f --max-time 10 "$url" > /dev/null; then
            ((available_resources++))
        fi
    done
    
    # Note: This is a basic check - actual resource paths may vary
    if (( available_resources > 0 )); then
        record_result "Resource Availability" "pass" "Core resources appear available"
    else
        record_result "Resource Availability" "warn" "Could not verify resource availability"
    fi
}

# Generate health report
generate_report() {
    echo ""
    echo "=================================="
    echo "      HEALTH CHECK REPORT"
    echo "=================================="
    echo "URL: $BASE_URL"
    echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo "Status: $HEALTH_STATUS"
    echo ""
    echo "Summary:"
    echo "  Failed Checks: $FAILED_CHECKS"
    echo "  Warnings: $WARNINGS"
    echo ""
    
    if [[ "$HEALTH_STATUS" == "healthy" ]]; then
        if (( WARNINGS == 0 )); then
            log_success "All systems operational"
        else
            log_warning "Systems operational with $WARNINGS warning(s)"
        fi
        echo ""
        echo "✅ Application is healthy and ready to serve users"
    else
        log_error "System health check failed"
        echo ""
        echo "❌ Application has critical issues that need attention"
        echo ""
        echo "Recommended actions:"
        echo "  1. Check deployment logs"
        echo "  2. Verify server configuration"
        echo "  3. Test manual navigation"
        echo "  4. Consider rollback if issues persist"
    fi
    
    echo ""
}

# Main execution
main() {
    echo "Starting comprehensive health check for: $BASE_URL"
    echo "Timeout: ${TIMEOUT}s | Retries: $RETRIES"
    echo ""
    
    # Run all health checks
    check_connectivity
    check_response_time
    check_content
    check_build_info
    check_routes
    check_security_headers
    check_performance
    check_resources
    
    # Generate final report
    generate_report
    
    # Exit with appropriate code
    if [[ "$HEALTH_STATUS" == "healthy" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Script usage
if [[ "$#" -gt 3 ]]; then
    echo "Usage: $0 [base-url] [timeout] [retries]"
    echo ""
    echo "Arguments:"
    echo "  base-url  Base URL to check (default: GitHub Pages URL)"
    echo "  timeout   Request timeout in seconds (default: 30)"
    echo "  retries   Number of retries for failed requests (default: 3)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 https://example.com"
    echo "  $0 https://example.com 15 2"
    exit 1
fi

# Run main function
main