#!/bin/bash
# no-non-null-assertion一括修正スクリプト

echo "🔧 no-non-null-assertion一括修正開始..."

# 主要なパターンを一括修正
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/process\.env\.\([A-Z_]*\)!/process.env.\1 || ""/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\(\w\+\)\.\(\w\+\)!/\1?.\2/g' 
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\(\w\+\)\[\([0-9]\+\)\]!/\1?.[\2]/g'

echo "✅ 一括修正完了"

# 修正後の確認
echo "📊 修正後のno-non-null-assertion警告数:"
npm run lint 2>&1 | grep "no-non-null-assertion" | wc -l