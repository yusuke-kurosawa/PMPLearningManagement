#!/bin/bash

echo "=== ESLint構文エラー自動修正スクリプト ==="

# 1. ESLintの自動修正を実行
echo "Step 1: ESLint自動修正実行中..."
npx eslint src --ext .js,.jsx,.ts,.tsx --fix 2>/dev/null || true

# 2. Prettierで整形
echo "Step 2: Prettier整形実行中..."
npx prettier --write "src/**/*.{js,jsx,ts,tsx}" 2>/dev/null || true

# 3. ファイル末尾の改行を追加
echo "Step 3: ファイル末尾の改行追加中..."
find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sh -c 'tail -c1 "$1" | read -r _ || echo >> "$1"' _ {} \;

# 4. TypeScriptのコンパイルチェック
echo "Step 4: TypeScriptコンパイルチェック中..."
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20 || echo "TypeScriptチェック完了"

# 5. 最終的なESLintチェック
echo "Step 5: 最終ESLintチェック中..."
npx eslint src --ext .js,.jsx,.ts,.tsx 2>&1 | grep -c "error" | xargs -I {} echo "残存エラー数: {}"

echo "=== 修正完了 ==="