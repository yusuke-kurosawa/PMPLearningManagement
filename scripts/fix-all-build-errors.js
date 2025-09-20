#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

/**
 * 全てのビルドエラーを修正する包括的スクリプト
 */

const FIX_PATTERNS = [
  {
    name: 'Misplaced useEffect/useCallback dependency array',
    pattern: /(\s+})\s*,\s*\[\]\s*\)/g,
    replacement: '$1)',
    description: '誤配置された依存配列の除去'
  },
  {
    name: 'Fix broken style with dependency array',
    pattern: /(style=\{[^}]+\})\s*,\s*\[\]\)/g,
    replacement: '$1)',
    description: 'style属性に誤って追加された依存配列の除去'
  },
  {
    name: 'Fix JSX closing tag with misplaced array',
    pattern: /(\/>)\s*,\s*\[\]/g,
    replacement: '$1',
    description: 'JSX終了タグ後の誤った配列の除去'
  },
  {
    name: 'Fix element attribute with misplaced array',
    pattern: /(className=["'][^"']+["'])\s*,\s*\[\]/g,
    replacement: '$1',
    description: '属性後の誤った配列の除去'
  },
  {
    name: 'Fix React.FC type annotations',
    pattern: /:\s*React\.FC\s*=\s*\(\)/g,
    replacement: ' = ()',
    description: 'React.FCの型注釈の修正'
  },
  {
    name: 'Fix double comma in parameters',
    pattern: /,\s*,/g,
    replacement: ',',
    description: '二重カンマの修正'
  },
  {
    name: 'Fix trailing comma before closing brace',
    pattern: /,\s*}/g,
    replacement: '}',
    description: '閉じ括弧前の末尾カンマ除去'
  },
  {
    name: 'Fix misplaced array after JSX element',
    pattern: /(<\/\w+>)\s*,\s*\[\]/g,
    replacement: '$1',
    description: 'JSX要素後の誤った配列の除去'
  },
  {
    name: 'Fix style object with trailing array',
    pattern: /(style=\{\{[^}]+\}\})\s*,\s*\[\]/g,
    replacement: '$1',
    description: 'styleオブジェクト後の誤った配列の除去'
  },
  {
    name: 'Fix useState setter type',
    pattern: /useState<([^>]+)>\(\)/g,
    replacement: 'useState<$1>()',
    description: 'useState型パラメータの修正'
  }
]

async function fixAllBuildErrors() {
  console.log('🔧 全ビルドエラーの修正を開始...\n')
  
  // TypeScriptとTypeScript JSXファイルを取得
  const files = await new Promise((resolve, reject) => {
    glob('src/**/*.{ts,tsx}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    }, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
  
  let totalFixCount = 0
  const fixedFiles = []
  
  for (const file of files) {
    const filePath = path.resolve(file)
    let content = fs.readFileSync(filePath, 'utf8')
    let originalContent = content
    let fileFixCount = 0
    
    // 各パターンを適用
    for (const fix of FIX_PATTERNS) {
      const matches = content.match(fix.pattern)
      if (matches) {
        content = content.replace(fix.pattern, fix.replacement)
        const fixCount = matches.length
        fileFixCount += fixCount
        totalFixCount += fixCount
      }
    }
    
    // 特定のファイルに対する特別な修正
    if (file.includes('MindMapView.tsx')) {
      // MindMapViewの特定のエラー修正
      content = content.replace(
        /style=\{\{ background: '#f9fafb' \}\}, \[\]\)/g,
        "style={{ background: '#f9fafb' }})"
      )
      if (content !== originalContent) {
        fileFixCount++
        totalFixCount++
      }
    }
    
    if (file.includes('ProcessFlowDiagram.tsx')) {
      // wrap関数の閉じ括弧修正
      content = content.replace(
        /(\s+}\s*}\s*\)\s*}\s*\)\s*$)/gm,
        '    }\n  }'
      )
      if (content !== originalContent) {
        fileFixCount++
        totalFixCount++
      }
    }
    
    // ファイルが変更された場合のみ書き込み
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8')
      fixedFiles.push({ file: path.relative(process.cwd(), filePath), fixes: fileFixCount })
      console.log(`  ✓ ${path.relative(process.cwd(), filePath)}: ${fileFixCount}件の修正`)
    }
  }
  
  // レポート
  console.log('\n' + '='.repeat(60))
  console.log(`✅ 修正完了サマリー`)
  console.log('='.repeat(60))
  console.log(`  総ファイル数: ${files.length}`)
  console.log(`  修正ファイル数: ${fixedFiles.length}`)
  console.log(`  総修正数: ${totalFixCount}`)
  
  if (fixedFiles.length > 0) {
    console.log('\n📝 修正されたファイル:')
    fixedFiles.forEach(({ file, fixes }) => {
      console.log(`    - ${file} (${fixes}件)`)
    })
  }
  
  return totalFixCount
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllBuildErrors()
    .then(fixCount => {
      if (fixCount > 0) {
        console.log('\n🎉 ビルドエラー修正が完了しました!')
        console.log('次のコマンドでビルドを確認してください:')
        console.log('  npm run build')
      } else {
        console.log('\n✨ 修正が必要なエラーは見つかりませんでした。')
      }
    })
    .catch(error => {
      console.error('❌ エラーが発生しました:', error)
      process.exit(1)
    })
}

export default fixAllBuildErrors