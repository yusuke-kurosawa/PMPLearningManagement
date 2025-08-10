#!/bin/bash

# Git Hooks インストールスクリプト
# IDD準拠のためのGit Hooksを自動的にインストールします

set -e

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Installing IDD Git Hooks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# スクリプトのディレクトリを取得
HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Hooksをインストール
install_hook() {
    local hook_name=$1
    local source_file="$HOOKS_DIR/$hook_name"
    local target_file="$GIT_HOOKS_DIR/$hook_name"
    
    if [ -f "$source_file" ]; then
        # 既存のフックをバックアップ
        if [ -f "$target_file" ] && [ ! -L "$target_file" ]; then
            echo -e "${YELLOW}Backing up existing $hook_name to $hook_name.backup${NC}"
            mv "$target_file" "$target_file.backup"
        fi
        
        # シンボリックリンクを作成
        ln -sf "$source_file" "$target_file"
        chmod +x "$source_file"
        echo -e "${GREEN}✓ Installed $hook_name${NC}"
    else
        echo -e "${YELLOW}⚠ $hook_name not found${NC}"
    fi
}

# 各フックをインストール
install_hook "pre-commit"
install_hook "commit-msg"
install_hook "pre-push"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ IDD Git Hooks installation completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "The following hooks have been installed:"
echo "  • pre-commit  - Checks for issue references before commit"
echo "  • commit-msg  - Validates commit message format"
echo "  • pre-push    - Final IDD compliance check before push"
echo ""
echo "To disable strict mode (not recommended):"
echo "  export IDD_STRICT_MODE=false"
echo ""
echo "To uninstall hooks:"
echo "  .github/hooks/uninstall.sh"
echo ""