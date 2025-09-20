#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

/**
 * 残りのビルドエラーを修正する最終スクリプト
 */

const SPECIFIC_FIXES = [
  {
    file: 'src/components/learning/LearningModal.tsx',
    fixes: [
      {
        // Line 61の余分な閉じ括弧を修正
        pattern: /(\s+}\s*\)\s*\))/g,
        replacement: '      }',
        description: 'LearningModal.tsxの余分な閉じ括弧を修正'
      },
      {
        // Line 96の閉じ括弧修正
        pattern: /(\s+}\s*\)\s*$\n\s*const handleSave)/gm,
        replacement: '  }\n\n  const handleSave',
        description: 'handleTimerToggleの閉じ括弧を修正'
      }
    ]
  },
  {
    file: 'src/components/visualizations/ProcessFlowDiagram.tsx',
    fixes: [
      {
        // linkGeneratorの閉じ括弧を修正
        pattern: /return linkGenerator\(\{\s*source:\s*\{\s*x:\s*source\.x,\s*y:\s*source\.y\s*\},\s*target:\s*\{\s*x:\s*target\.x,\s*y:\s*target\.y\s*\}\s*\}\s*\)/g,
        replacement: 'return linkGenerator({\n          source: { x: source.x, y: source.y },\n          target: { x: target.x, y: target.y }\n        })',
        description: 'linkGenerator呼び出しの修正'
      }
    ]
  },
  {
    file: 'src/components/visualizations/ProcessHeatmap.tsx',
    fixes: [
      {
        // metrics オブジェクトの構文修正
        pattern: /calculate:\s*\(process\)\s*=>\s*\{([^}]+)\}\}/g,
        replacement: 'calculate: (process) => {$1}',
        description: 'metrics計算関数の構文修正'
      },
      {
        // useEffect の依存配列追加
        pattern: /return\s+\(\)\s+=>\s+window\.removeEventListener\('resize',\s*updateDimensions\)\s*\}\s*\)/g,
        replacement: "return () => window.removeEventListener('resize', updateDimensions)\n  }, [])",
        description: 'useEffect依存配列追加'
      }
    ]
  },
  {
    file: 'src/App.tsx',
    fixes: [
      {
        // useState importの追加
        pattern: /(import React, \{ Suspense, lazy, useEffect \} from 'react')/g,
        replacement: "import React, { Suspense, lazy, useEffect, useState } from 'react'",
        description: 'useStateのimport追加'
      }
    ]
  }
]

function fixRemainingBuildErrors() {
  console.log('🔧 残りのビルドエラーを修正中...\n')
  
  let totalFixCount = 0
  
  for (const fileSpec of SPECIFIC_FIXES) {
    const filePath = path.resolve(fileSpec.file)
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ ファイルが見つかりません: ${fileSpec.file}`)
      continue
    }
    
    let content = fs.readFileSync(filePath, 'utf8')
    let originalContent = content
    let fileFixCount = 0
    
    for (const fix of fileSpec.fixes) {
      const beforeLength = content.length
      content = content.replace(fix.pattern, fix.replacement)
      if (content.length !== beforeLength) {
        fileFixCount++
        totalFixCount++
        console.log(`  ✓ ${fix.description}`)
      }
    }
    
    // 特別な修正が必要な場合
    if (fileSpec.file.includes('LearningModal.tsx')) {
      // Line 61付近の構文エラー修正
      content = content.replace(
        /(\s+}\s*\)\s*\)\s*\n\s*\})/g,
        '      }\n    }'
      )
      
      // Line 96付近の構文エラー修正  
      content = content.replace(
        /setStartTime\(Date\.now\(\)\)\s*\}\s*\}\)/g,
        'setStartTime(Date.now())\n    }\n  }'
      )
      
      if (content !== originalContent) {
        fileFixCount++
        totalFixCount++
      }
    }
    
    if (fileSpec.file.includes('ProcessFlowDiagram.tsx')) {
      // D3.js wrap関数の閉じ括弧修正
      content = content.replace(
        /(\s+}\s*\)\s*\}\s*\n\s*\}\s*\n\s*\/\/ アニメーション機能)/g,
        '      })\n    }\n\n    // アニメーション機能'
      )
      
      if (content !== originalContent) {
        fileFixCount++
        totalFixCount++
      }
    }
    
    if (fileSpec.file.includes('ProcessHeatmap.tsx')) {
      // metrics定義の閉じ括弧修正
      content = content.replace(
        /(\s*return importanceMap\[process\.name\] \|\| 5\s*\}\}\})/g,
        '        return importanceMap[process.name] || 5\n      }\n    }\n  }'
      )
      
      if (content !== originalContent) {
        fileFixCount++
        totalFixCount++
      }
    }
    
    // ファイルが変更された場合のみ書き込み
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`  ✅ ${fileSpec.file}: ${fileFixCount}件の修正を適用`)
    }
  }
  
  console.log(`\n✅ 修正完了: ${totalFixCount}件の修正を適用`)
  return totalFixCount
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixCount = fixRemainingBuildErrors()
  
  if (fixCount > 0) {
    console.log('\n🎉 ビルドエラー修正が完了しました!')
    console.log('次のコマンドでビルドを確認してください:')
    console.log('  npm run build')
  } else {
    console.log('\n✨ 修正が必要なエラーは見つかりませんでした。')
  }
}

export default fixRemainingBuildErrors