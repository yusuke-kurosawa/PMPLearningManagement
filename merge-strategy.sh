#!/bin/bash
# Strategic Merge Resolution Script for PR #125
# DevOps Engineer Implementation - Systematic Conflict Resolution

set -e  # Exit on any error

echo "=== Strategic Merge Resolution for PR #125 ==="
echo "Timestamp: $(date)"
echo "Branch: $(git branch --show-current)"
echo

# Phase 1: Pre-merge Analysis
echo "📊 Phase 1: Analyzing merge conflicts..."

# Attempt merge with strategy
git merge main --no-commit --no-ff 2>&1 | tee merge-analysis.log || true

# Count conflict types
if [ -f merge-analysis.log ]; then
    echo "Conflict Analysis:"
    echo "- Content conflicts: $(grep -c "CONFLICT (content)" merge-analysis.log || echo 0)"
    echo "- Modify/delete conflicts: $(grep -c "CONFLICT (modify/delete)" merge-analysis.log || echo 0)"
    echo "- Rename conflicts: $(grep -c "CONFLICT (rename" merge-analysis.log || echo 0)"
    echo "- Add/add conflicts: $(grep -c "CONFLICT (add/add)" merge-analysis.log || echo 0)"
fi

echo
echo "🔧 Phase 2: Automated Safe Resolution Strategy"

# Category 1: Safe automated resolutions
echo "  → Resolving safe conflicts automatically..."

# Prefer main branch for documentation conflicts that are safe
safe_main_preference=(
    ".claude/README.md"
    ".claude/agents/README.md"
    ".github/ISSUE_TEMPLATE/config.yml"
    "docs/github-actions/README.md"
)

# Prefer HEAD (PR branch) for test and implementation files
safe_head_preference=(
    "src/lib/security/__tests__/csrf.test.ts"
    "src/lib/security/__tests__/keyManagement.test.ts"
    "src/lib/cache/__tests__/redisCache.test.ts"
    "src/server/auth/__tests__/middleware.test.ts"
    "src/components/mobile/MobileOptimizedApp.tsx"
)

# Apply safe automated resolutions
for file in "${safe_main_preference[@]}"; do
    if git status --porcelain | grep -q "^UU.*$file" 2>/dev/null; then
        echo "    ✓ Using main version for: $file"
        git checkout main -- "$file" 2>/dev/null || true
        git add "$file" 2>/dev/null || true
    fi
done

for file in "${safe_head_preference[@]}"; do
    if git status --porcelain | grep -q "^UU.*$file" 2>/dev/null; then
        echo "    ✓ Using HEAD version for: $file"
        git checkout HEAD -- "$file" 2>/dev/null || true
        git add "$file" 2>/dev/null || true
    fi
done

echo
echo "📝 Phase 3: Manual resolution required files:"
git status --porcelain | grep "^UU" | head -10 || echo "No remaining conflicts found"

echo
echo "✅ Automated resolution phase completed"
echo "Conflicts resolved automatically: $(git status --porcelain | grep "^M " | wc -l || echo 0)"
echo "Manual resolution needed: $(git status --porcelain | grep "^UU" | wc -l || echo 0)"

exit 0