#!/bin/bash

# Git Hooks アンインストールスクリプト

set -e

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "🔧 Uninstalling IDD Git Hooks..."
echo ""

uninstall_hook() {
    local hook_name=$1
    local hook_file="$GIT_HOOKS_DIR/$hook_name"
    
    if [ -L "$hook_file" ]; then
        rm "$hook_file"
        echo -e "${GREEN}✓ Removed $hook_name${NC}"
        
        # バックアップを復元
        if [ -f "$hook_file.backup" ]; then
            mv "$hook_file.backup" "$hook_file"
            echo -e "${YELLOW}  Restored original $hook_name${NC}"
        fi
    fi
}

uninstall_hook "pre-commit"
uninstall_hook "commit-msg"
uninstall_hook "pre-push"

echo ""
echo -e "${GREEN}✨ IDD Git Hooks uninstalled successfully!${NC}"