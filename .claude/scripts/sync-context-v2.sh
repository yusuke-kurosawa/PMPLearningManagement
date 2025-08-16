#!/usr/bin/env bash

# Claude Context Sync Script - Simplified Working Version
# Version: 2.0.1

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly CONTEXT_DIR="${PROJECT_ROOT}/.claude/context"
readonly TODAY=$(date +%Y-%m-%d)
readonly TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Colors
if [[ -t 1 ]]; then
    readonly GREEN='\033[0;32m'
    readonly BLUE='\033[0;34m'
    readonly YELLOW='\033[1;33m'
    readonly RED='\033[0;31m'
    readonly NC='\033[0m'
else
    readonly GREEN=''
    readonly BLUE=''
    readonly YELLOW=''
    readonly RED=''
    readonly NC=''
fi

# Options
DRY_RUN=0
SKIP_TODO=0
SKIP_COVERAGE=0
VERBOSE=0

# ============================== Functions ==============================

log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $*"
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $*"
}

log_error() {
    echo -e "${RED}❌ ERROR:${NC} $*" >&2
}

show_help() {
    cat << EOF
Claude Context Sync Script v2.0.1

USAGE: $(basename "$0") [OPTIONS]

OPTIONS:
    -h, --help         Show this help message
    -n, --dry-run      Preview changes without modifying files
    --skip-todo        Skip TODO/FIXME collection
    --skip-coverage    Skip coverage report generation
    -v, --verbose      Enable verbose output

EXAMPLES:
    $(basename "$0")                        # Basic sync
    $(basename "$0") --dry-run              # Preview changes
    $(basename "$0") --skip-todo --skip-coverage  # Quick sync

EOF
}

# ============================== Main Functions ==============================

sync_git_status() {
    log_info "Collecting Git information..."
    
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    local commit=$(git log -1 --pretty=format:"%h - %s (%cr)" 2>/dev/null || echo "no commits")
    local uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    local remote=$(git remote get-url origin 2>/dev/null || echo "no remote")
    
    if [[ $DRY_RUN -eq 0 ]]; then
        cat > "${CONTEXT_DIR}/current-status.md" << EOF
# Current Project Status

Last updated: ${TIMESTAMP}

## Git Information

- **Branch**: ${branch}
- **Last Commit**: ${commit}
- **Uncommitted Changes**: ${uncommitted} files
- **Remote**: ${remote}

EOF
    else
        log_info "[DRY RUN] Would update current-status.md"
    fi
}

sync_project_info() {
    log_info "Collecting project information..."
    
    local name=$(node -p "require('${PROJECT_ROOT}/package.json').name || 'unknown'" 2>/dev/null || echo "unknown")
    local version=$(node -p "require('${PROJECT_ROOT}/package.json').version || 'unknown'" 2>/dev/null || echo "unknown")
    local deps=$(node -p "Object.keys(require('${PROJECT_ROOT}/package.json').dependencies || {}).length" 2>/dev/null || echo 0)
    local devDeps=$(node -p "Object.keys(require('${PROJECT_ROOT}/package.json').devDependencies || {}).length" 2>/dev/null || echo 0)
    
    if [[ $DRY_RUN -eq 0 ]]; then
        cat >> "${CONTEXT_DIR}/current-status.md" << EOF
## Project Information

- **Name**: ${name}
- **Version**: ${version}
- **Dependencies**: ${deps} production, ${devDeps} development

EOF
    fi
}

sync_file_stats() {
    log_info "Collecting file statistics..."
    
    local jsx_files=0
    local tsx_files=0
    local js_files=0
    local ts_files=0
    local test_files=0
    local doc_files=0
    
    if [[ -d "${PROJECT_ROOT}/src" ]]; then
        jsx_files=$(find "${PROJECT_ROOT}/src" -name "*.jsx" 2>/dev/null | wc -l | tr -d ' ')
        tsx_files=$(find "${PROJECT_ROOT}/src" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
        js_files=$(find "${PROJECT_ROOT}/src" -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
        ts_files=$(find "${PROJECT_ROOT}/src" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    fi
    
    test_files=$(find "${PROJECT_ROOT}" -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l | tr -d ' ')
    doc_files=$(find "${PROJECT_ROOT}" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    
    if [[ $DRY_RUN -eq 0 ]]; then
        cat >> "${CONTEXT_DIR}/current-status.md" << EOF
## File Statistics

| File Type | Count |
|-----------|-------|
| JSX Files | ${jsx_files} |
| TSX Files | ${tsx_files} |
| JS Files | ${js_files} |
| TS Files | ${ts_files} |
| Test Files | ${test_files} |
| Documentation | ${doc_files} |

EOF
    fi
}

sync_recent_changes() {
    log_info "Generating recent changes report..."
    
    if [[ $DRY_RUN -eq 0 ]]; then
        cat > "${CONTEXT_DIR}/recent-changes.md" << EOF
# Recent Changes

Last updated: ${TIMESTAMP}

## Recent Commits (last 20)

\`\`\`
$(git log --oneline -20 2>/dev/null || echo "No commits found")
\`\`\`

## Modified Files (uncommitted)

\`\`\`
$(git status --porcelain 2>/dev/null || echo "No changes")
\`\`\`

## Activity Summary (last 7 days)

\`\`\`
$(git log --since="7 days ago" --pretty=format:"%h - %an, %ar : %s" 2>/dev/null | head -50 || echo "No activity")
\`\`\`

EOF
    else
        log_info "[DRY RUN] Would update recent-changes.md"
    fi
}

sync_todos() {
    if [[ $SKIP_TODO -eq 1 ]]; then
        log_info "Skipping TODO collection (--skip-todo)"
        return
    fi
    
    log_info "Collecting TODOs and FIXMEs..."
    
    if [[ $DRY_RUN -eq 0 ]]; then
        {
            echo "# TODO List"
            echo ""
            echo "Last updated: ${TIMESTAMP}"
            echo ""
            echo "## Code TODOs"
            echo ""
            
            if [[ -d "${PROJECT_ROOT}/src" ]]; then
                grep -rn "TODO\|FIXME\|XXX\|HACK" "${PROJECT_ROOT}/src" \
                    --include="*.js" \
                    --include="*.jsx" \
                    --include="*.ts" \
                    --include="*.tsx" \
                    2>/dev/null | while IFS=: read -r file line content; do
                    
                    local relative_file="${file#${PROJECT_ROOT}/}"
                    echo "- \`${relative_file}:${line}\`: ${content}"
                done || echo "No TODOs found"
            else
                echo "No src directory found"
            fi
            
        } > "${CONTEXT_DIR}/todo-list.md"
    else
        log_info "[DRY RUN] Would update todo-list.md"
    fi
}

sync_coverage() {
    if [[ $SKIP_COVERAGE -eq 1 ]]; then
        log_info "Skipping coverage collection (--skip-coverage)"
        return
    fi
    
    local coverage_file="${PROJECT_ROOT}/coverage/coverage-summary.json"
    
    if [[ -f "${coverage_file}" ]]; then
        log_info "Collecting test coverage..."
        
        local lines=$(node -p "require('${coverage_file}').total.lines.pct || 0" 2>/dev/null || echo 0)
        local branches=$(node -p "require('${coverage_file}').total.branches.pct || 0" 2>/dev/null || echo 0)
        local functions=$(node -p "require('${coverage_file}').total.functions.pct || 0" 2>/dev/null || echo 0)
        local statements=$(node -p "require('${coverage_file}').total.statements.pct || 0" 2>/dev/null || echo 0)
        
        if [[ $DRY_RUN -eq 0 ]]; then
            cat >> "${CONTEXT_DIR}/current-status.md" << EOF
## Test Coverage

| Metric | Coverage |
|--------|----------|
| Lines | ${lines}% |
| Branches | ${branches}% |
| Functions | ${functions}% |
| Statements | ${statements}% |

EOF
        fi
    else
        log_warn "Coverage file not found: ${coverage_file}"
    fi
}

create_project_summary() {
    log_info "Creating project summary..."
    
    if [[ $DRY_RUN -eq 0 ]]; then
        cp "${CONTEXT_DIR}/current-status.md" "${CONTEXT_DIR}/project-summary.md"
        log_success "Project summary created"
    else
        log_info "[DRY RUN] Would create project-summary.md"
    fi
}

# ============================== Main Execution ==============================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -n|--dry-run)
                DRY_RUN=1
                log_info "DRY RUN MODE - No files will be modified"
                shift
                ;;
            --skip-todo)
                SKIP_TODO=1
                shift
                ;;
            --skip-coverage)
                SKIP_COVERAGE=1
                shift
                ;;
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Start sync
    log_info "Starting context synchronization..."
    log_info "Project root: ${PROJECT_ROOT}"
    
    # Check prerequisites
    if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
        log_error "Not a git repository"
        exit 1
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "package.json not found"
        exit 1
    fi
    
    # Create context directory if needed
    if [[ ! -d "${CONTEXT_DIR}" ]]; then
        log_warn "Creating context directory: ${CONTEXT_DIR}"
        [[ $DRY_RUN -eq 0 ]] && mkdir -p "${CONTEXT_DIR}"
    fi
    
    # Run sync operations
    sync_git_status
    sync_project_info
    sync_file_stats
    sync_coverage
    sync_recent_changes
    sync_todos
    create_project_summary
    
    # Complete
    if [[ $DRY_RUN -eq 0 ]]; then
        log_success "Context synchronization completed!"
        echo ""
        echo "Updated files:"
        echo "  - ${CONTEXT_DIR}/current-status.md"
        echo "  - ${CONTEXT_DIR}/recent-changes.md"
        echo "  - ${CONTEXT_DIR}/todo-list.md"
        echo "  - ${CONTEXT_DIR}/project-summary.md"
    else
        log_success "[DRY RUN] Sync simulation completed!"
    fi
}

# Run main
main "$@"