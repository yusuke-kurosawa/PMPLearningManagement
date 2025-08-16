#!/usr/bin/env bash

# Claude Context Health Check Script
# Purpose: Quick health check for project and context synchronization
# Author: DevOps Team
# Version: 1.0.0

set -euo pipefail

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LIB_DIR="${SCRIPT_DIR}/lib"

# Source utility library
if [[ -f "${LIB_DIR}/context-utils.sh" ]]; then
    source "${LIB_DIR}/context-utils.sh"
else
    echo "Error: Utility library not found at ${LIB_DIR}/context-utils.sh" >&2
    exit 1
fi

# ============================== Health Checks ==============================

check_git_status() {
    echo "🔍 Git Repository Health"
    echo "------------------------"
    
    if [[ -d "${PROJECT_ROOT}/.git" ]]; then
        echo "✅ Git repository found"
        echo "   Branch: $(git_current_branch)"
        echo "   Commits: $(git_commit_count)"
        echo "   Contributors: $(git_contributors_count)"
        
        if git_is_clean; then
            echo "✅ Working directory is clean"
        else
            echo "⚠️  Working directory has uncommitted changes"
            echo "   $(git status --porcelain | wc -l | tr -d ' ') files modified"
        fi
    else
        echo "❌ Not a git repository"
        return 1
    fi
    echo
}

check_node_environment() {
    echo "🔍 Node.js Environment"
    echo "---------------------"
    
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
    fi
    
    if command -v npm >/dev/null 2>&1; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm not found"
    fi
    
    if [[ -f "${PROJECT_ROOT}/package.json" ]]; then
        echo "✅ package.json found"
        local pkg_name=$(json_get "${PROJECT_ROOT}/package.json" ".name" "unknown")
        local pkg_version=$(json_get "${PROJECT_ROOT}/package.json" ".version" "unknown")
        echo "   Package: ${pkg_name}@${pkg_version}"
    else
        echo "❌ package.json not found"
    fi
    echo
}

check_context_files() {
    echo "🔍 Context Files"
    echo "---------------"
    
    local context_dir="${PROJECT_ROOT}/.claude/context"
    local required_files=(
        "current-status.md"
        "recent-changes.md"
        "todo-list.md"
        "project-summary.md"
    )
    
    local missing=0
    local outdated=0
    
    for file in "${required_files[@]}"; do
        if [[ -f "${context_dir}/${file}" ]]; then
            local file_time
            if [[ "$OSTYPE" == "darwin"* ]]; then
                file_time=$(stat -f %m "${context_dir}/${file}" 2>/dev/null || echo 0)
            else
                file_time=$(stat -c %Y "${context_dir}/${file}" 2>/dev/null || echo 0)
            fi
            
            local current_time=$(date +%s)
            local age=$(( current_time - file_time ))
            local age_hours=$((age / 3600))
            
            if [[ ${age_hours} -gt 24 ]]; then
                echo "⚠️  ${file} (outdated: ${age_hours}h old)"
                ((outdated++))
            else
                echo "✅ ${file} (updated ${age_hours}h ago)"
            fi
        else
            echo "❌ ${file} (missing)"
            ((missing++))
        fi
    done
    
    if [[ ${missing} -gt 0 ]]; then
        echo
        echo "⚠️  ${missing} context files missing - run sync-context.sh"
    fi
    
    if [[ ${outdated} -gt 0 ]]; then
        echo
        echo "⚠️  ${outdated} context files outdated - consider running sync-context.sh"
    fi
    echo
}

check_system_resources() {
    echo "🔍 System Resources"
    echo "------------------"
    
    local memory_usage=$(get_memory_usage 2>/dev/null || echo "N/A")
    local cpu_load=$(get_cpu_load 2>/dev/null || echo "N/A")
    local disk_usage=$(get_disk_usage "${PROJECT_ROOT}" 2>/dev/null || echo "N/A")
    
    echo "💾 Memory: ${memory_usage} MB in use"
    echo "🔥 CPU Load: ${cpu_load}"
    echo "💿 Disk Usage: ${disk_usage}% used"
    
    echo
}

check_dependencies() {
    echo "🔍 Optional Dependencies"
    echo "-----------------------"
    
    local deps=("jq" "parallel" "shellcheck" "ripgrep" "fd")
    
    for dep in "${deps[@]}"; do
        if command -v "${dep}" >/dev/null 2>&1; then
            echo "✅ ${dep} installed"
        else
            echo "⚠️  ${dep} not found (optional)"
        fi
    done
    echo
}

check_environment() {
    echo "🔍 Environment Detection"
    echo "-----------------------"
    
    echo "🖥️  OS Type: $(get_os_type)"
    
    if is_ci; then
        echo "🤖 Running in CI environment"
    fi
    
    if is_docker; then
        echo "🐳 Running in Docker container"
    fi
    
    if is_wsl; then
        echo "🪟 Running in WSL"
    fi
    echo
}

# ============================== Summary ==============================

generate_summary() {
    local issues=0
    
    echo "📊 Health Check Summary"
    echo "====================="
    
    # Check for critical issues
    if ! command -v git >/dev/null 2>&1; then
        echo "❌ Critical: Git not installed"
        ((issues++))
    fi
    
    if ! command -v node >/dev/null 2>&1; then
        echo "❌ Critical: Node.js not installed"
        ((issues++))
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        echo "❌ Critical: package.json not found"
        ((issues++))
    fi
    
    if [[ ${issues} -eq 0 ]]; then
        echo "✅ All critical checks passed!"
        echo
        echo "💡 Recommendations:"
        echo "   - Run './sync-context.sh' to update context files"
        echo "   - Install optional dependencies for better performance"
        echo "   - Keep context files updated (run sync at least daily)"
    else
        echo
        echo "⚠️  ${issues} critical issues found"
        echo "   Please resolve these issues before running sync-context.sh"
    fi
}

# ============================== Main ==============================

main() {
    echo "🏥 Claude Context Health Check"
    echo "=============================="
    echo "Project: ${PROJECT_ROOT}"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    
    check_git_status
    check_node_environment
    check_context_files
    check_system_resources
    check_dependencies
    check_environment
    generate_summary
}

# Run main function
main "$@"