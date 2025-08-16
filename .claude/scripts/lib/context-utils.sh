#!/usr/bin/env bash

# Claude Context Sync - Utility Library
# Purpose: Reusable utility functions for context synchronization scripts
# Author: DevOps Team
# Version: 1.0.0

# Prevent direct execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "This is a library file and should not be executed directly." >&2
    exit 1
fi

# ============================== JSON Processing ==============================

# Parse JSON value using jq or node
json_get() {
    local file=$1
    local path=$2
    local default="${3:-}"
    
    if command -v jq >/dev/null 2>&1; then
        jq -r "${path} // \"${default}\"" "${file}" 2>/dev/null || echo "${default}"
    elif command -v node >/dev/null 2>&1; then
        node -e "
            try {
                const data = require('${file}');
                const result = ${path};
                console.log(result || '${default}');
            } catch {
                console.log('${default}');
            }
        " 2>/dev/null || echo "${default}"
    else
        echo "${default}"
    fi
}

# ============================== File Operations ==============================

# Safe file write with backup
safe_write() {
    local file=$1
    local content=$2
    local backup="${3:-true}"
    
    if [[ -f "${file}" ]] && [[ "${backup}" == "true" ]]; then
        cp "${file}" "${file}.bak.$(date +%Y%m%d_%H%M%S)"
    fi
    
    echo "${content}" > "${file}"
}

# Atomic file write
atomic_write() {
    local file=$1
    local content=$2
    local temp_file="${file}.tmp.$$"
    
    echo "${content}" > "${temp_file}"
    mv -f "${temp_file}" "${file}"
}

# ============================== Git Utilities ==============================

# Get git repository root
git_root() {
    git rev-parse --show-toplevel 2>/dev/null
}

# Check if repository is clean
git_is_clean() {
    [[ -z "$(git status --porcelain 2>/dev/null)" ]]
}

# Get current git branch
git_current_branch() {
    git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# Get commit count
git_commit_count() {
    git rev-list --count HEAD 2>/dev/null || echo 0
}

# Get contributors count
git_contributors_count() {
    git shortlog -sn --all 2>/dev/null | wc -l | tr -d ' '
}

# ============================== Performance Monitoring ==============================

# Memory usage in MB
get_memory_usage() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        free -m | awk 'NR==2{printf "%.1f", $3}'
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages active:\s+(\d+)/ and printf("%.1f", $1*$size/1048576);'
    else
        echo "0"
    fi
}

# CPU load average
get_cpu_load() {
    if command -v uptime >/dev/null 2>&1; then
        uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,$//'
    else
        echo "0"
    fi
}

# Disk usage percentage for path
get_disk_usage() {
    local path="${1:-.}"
    df -h "${path}" 2>/dev/null | awk 'NR==2{print $5}' | sed 's/%//'
}

# ============================== String Manipulation ==============================

# Trim whitespace
trim() {
    local var="$*"
    var="${var#"${var%%[![:space:]]*}"}"
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

# Convert to lowercase
to_lower() {
    echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Convert to uppercase
to_upper() {
    echo "$1" | tr '[:lower:]' '[:upper:]'
}

# Sanitize filename
sanitize_filename() {
    echo "$1" | sed 's/[^a-zA-Z0-9._-]/_/g'
}

# ============================== Validation ==============================

# Validate email
is_valid_email() {
    local email=$1
    [[ "${email}" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]
}

# Validate URL
is_valid_url() {
    local url=$1
    [[ "${url}" =~ ^https?://[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+(/.*)?$ ]]
}

# Validate semantic version
is_valid_version() {
    local version=$1
    [[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]
}

# Validate port number
is_valid_port() {
    local port=$1
    [[ "${port}" =~ ^[0-9]+$ ]] && [[ "${port}" -ge 1 ]] && [[ "${port}" -le 65535 ]]
}

# ============================== Date/Time Utilities ==============================

# ISO 8601 timestamp
iso_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Unix timestamp
unix_timestamp() {
    date +%s
}

# Human-readable duration from seconds
format_duration() {
    local seconds=$1
    local days=$((seconds / 86400))
    local hours=$(( (seconds % 86400) / 3600 ))
    local minutes=$(( (seconds % 3600) / 60 ))
    local secs=$((seconds % 60))
    
    local result=""
    [[ ${days} -gt 0 ]] && result="${days}d "
    [[ ${hours} -gt 0 ]] && result="${result}${hours}h "
    [[ ${minutes} -gt 0 ]] && result="${result}${minutes}m "
    result="${result}${secs}s"
    
    echo "${result}"
}

# ============================== Array Operations ==============================

# Check if array contains element
array_contains() {
    local element=$1
    shift
    local array=("$@")
    
    for item in "${array[@]}"; do
        [[ "${item}" == "${element}" ]] && return 0
    done
    return 1
}

# Join array with delimiter
array_join() {
    local delimiter=$1
    shift
    local array=("$@")
    
    local result=""
    for item in "${array[@]}"; do
        [[ -n "${result}" ]] && result="${result}${delimiter}"
        result="${result}${item}"
    done
    echo "${result}"
}

# ============================== Network Utilities ==============================

# Check if port is open
is_port_open() {
    local host=$1
    local port=$2
    local timeout="${3:-1}"
    
    if command -v nc >/dev/null 2>&1; then
        nc -z -w "${timeout}" "${host}" "${port}" 2>/dev/null
    elif command -v telnet >/dev/null 2>&1; then
        timeout "${timeout}" bash -c "echo > /dev/tcp/${host}/${port}" 2>/dev/null
    else
        return 1
    fi
}

# Get public IP
get_public_ip() {
    curl -s https://ipinfo.io/ip 2>/dev/null || \
    curl -s https://api.ipify.org 2>/dev/null || \
    echo "unknown"
}

# ============================== Package Management ==============================

# Get npm package version
npm_package_version() {
    local package=$1
    npm list "${package}" --depth=0 2>/dev/null | grep "${package}" | awk -F@ '{print $NF}' || echo "not installed"
}

# Check if npm package is installed
npm_package_exists() {
    local package=$1
    npm list "${package}" --depth=0 >/dev/null 2>&1
}

# ============================== Environment Detection ==============================

# Detect CI environment
is_ci() {
    [[ "${CI:-false}" == "true" ]] || \
    [[ -n "${GITHUB_ACTIONS:-}" ]] || \
    [[ -n "${JENKINS_URL:-}" ]] || \
    [[ -n "${GITLAB_CI:-}" ]] || \
    [[ -n "${CIRCLECI:-}" ]]
}

# Detect Docker environment
is_docker() {
    [[ -f /.dockerenv ]] || [[ -n "${DOCKER_CONTAINER:-}" ]]
}

# Detect WSL environment
is_wsl() {
    [[ -n "${WSL_DISTRO_NAME:-}" ]] || grep -qi microsoft /proc/version 2>/dev/null
}

# Get OS type
get_os_type() {
    case "$OSTYPE" in
        linux*)   echo "linux" ;;
        darwin*)  echo "macos" ;;
        msys*)    echo "windows" ;;
        cygwin*)  echo "windows" ;;
        *)        echo "unknown" ;;
    esac
}

# ============================== Logging Helpers ==============================

# Color output helper
color_text() {
    local color=$1
    local text=$2
    
    case "${color}" in
        red)     echo -e "\033[0;31m${text}\033[0m" ;;
        green)   echo -e "\033[0;32m${text}\033[0m" ;;
        yellow)  echo -e "\033[1;33m${text}\033[0m" ;;
        blue)    echo -e "\033[0;34m${text}\033[0m" ;;
        magenta) echo -e "\033[0;35m${text}\033[0m" ;;
        cyan)    echo -e "\033[0;36m${text}\033[0m" ;;
        white)   echo -e "\033[1;37m${text}\033[0m" ;;
        *)       echo "${text}" ;;
    esac
}

# Progress bar
show_progress() {
    local current=$1
    local total=$2
    local width="${3:-50}"
    
    local percent=$((current * 100 / total))
    local filled=$((width * current / total))
    
    printf "\r["
    printf "%${filled}s" | tr ' ' '='
    printf "%$((width - filled))s" | tr ' ' '-'
    printf "] %3d%%" "${percent}"
    
    [[ ${current} -eq ${total} ]] && echo
}

# ============================== Cache Management ==============================

# Simple file-based cache
cache_set() {
    local key=$1
    local value=$2
    local cache_dir="${3:-/tmp/claude-cache}"
    
    mkdir -p "${cache_dir}"
    echo "${value}" > "${cache_dir}/${key}"
}

cache_get() {
    local key=$1
    local cache_dir="${2:-/tmp/claude-cache}"
    local max_age="${3:-3600}"  # Default 1 hour
    
    local cache_file="${cache_dir}/${key}"
    
    if [[ -f "${cache_file}" ]]; then
        local file_age=$(( $(date +%s) - $(stat -f %m "${cache_file}" 2>/dev/null || stat -c %Y "${cache_file}" 2>/dev/null) ))
        if [[ ${file_age} -lt ${max_age} ]]; then
            cat "${cache_file}"
            return 0
        fi
    fi
    return 1
}

cache_clear() {
    local cache_dir="${1:-/tmp/claude-cache}"
    rm -rf "${cache_dir}"
}

# ============================== Export Functions ==============================

# Export all functions for use in other scripts
export -f json_get
export -f safe_write atomic_write
export -f git_root git_is_clean git_current_branch git_commit_count git_contributors_count
export -f get_memory_usage get_cpu_load get_disk_usage
export -f trim to_lower to_upper sanitize_filename
export -f is_valid_email is_valid_url is_valid_version is_valid_port
export -f iso_timestamp unix_timestamp format_duration
export -f array_contains array_join
export -f is_port_open get_public_ip
export -f npm_package_version npm_package_exists
export -f is_ci is_docker is_wsl get_os_type
export -f color_text show_progress
export -f cache_set cache_get cache_clear