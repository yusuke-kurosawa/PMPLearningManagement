#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

/**
 * 自動修正で生じた構文エラーをクリーンアップするスクリプト
 */

const CLEANUP_FIXES = [
  // 1. 誤った依存配列の位置修正
  {
    name: 'Misplaced dependency arrays in try-catch',
    pattern: /(\s+})\s*,\s*\[\]\s*(\s+}\s*(?:catch|finally|else))/g,
    replacement: '$1$2',
    description: 'try-catch内の誤った依存配列を除去'
  },
  // 2. 関数呼び出し内の誤った依存配列
  {
    name: 'Misplaced dependency arrays in function calls',
    pattern: /(\w+\([^)]*)\s*,\s*\[\]\s*(\))/g,
    replacement: '$1$2',
    description: '関数呼び出し内の誤った依存配列を除去'
  },
  // 3. オブジェクト内の誤った依存配列
  {
    name: 'Misplaced dependency arrays in objects',
    pattern: /(\s+})\s*,\s*\[\]\s*(\s*(?:,|\}))/g,
    replacement: '$1$2',
    description: 'オブジェクト内の誤った依存配列を除去'
  },
  // 4. JSX内の誤った依存配列
  {
    name: 'Misplaced dependency arrays in JSX',
    pattern: /(})\s*,\s*\[\]\s*(\s*(?:>|,|\}))/g,
    replacement: '$1$2',
    description: 'JSX内の誤った依存配列を除去'
  },
  // 5. Hoverクラス修正
  {
    name: 'Fix broken hover classes',
    pattern: /(hover:disable\s+d:opacity-50)/g,
    replacement: 'hover:disabled:opacity-50',
    description: 'hoverクラスの修正'
  },
  // 6. ダークモードhover修正
  {
    name: 'Fix broken dark hover classes',
    pattern: /(hover:dark:hove\s+r:)/g,
    replacement: 'hover:dark:hover:',
    description: 'ダークモードhoverの修正'
  },
  // 7. 不正なeventHandler内のdependency array
  {
    name: 'Fix dependency arrays in event handlers',
    pattern: /(onKeyDown=\{[^}]*}\s*)\s*,\s*\[\]\s*/g,
    replacement: '$1',
    description: 'イベントハンドラー内の依存配列を除去'
  }
]

async function cleanupSyntaxErrors() {
  console.log('🧹 自動修正で生じた構文エラーをクリーンアップ中...')
  
  try {
    // TypeScript/JavaScriptファイルを取得
    const files = await new Promise((resolve, reject) => {
      glob('src/**/*.{ts,tsx,js,jsx}', {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
      }, (err, files) => {
        if (err) reject(err)
        else resolve(files)
      })
    })
    
    let totalFiles = 0
    let totalFixes = 0
    
    for (const file of files) {
      const filePath = path.resolve(file)
      
      if (!fs.existsSync(filePath)) {
        continue
      }
      
      let content = fs.readFileSync(filePath, 'utf8')
      let hasChanges = false
      let fileFixCount = 0
      
      // 各修正パターンを適用
      for (const fix of CLEANUP_FIXES) {
        const originalContent = content
        content = content.replace(fix.pattern, fix.replacement)
        
        if (content !== originalContent) {
          hasChanges = true
          fileFixCount++
          console.log(`  ✓ ${fix.description}: ${file}`)
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8')
        totalFiles++
        totalFixes += fileFixCount
      }
    }
    
    console.log(`\n✅ クリーンアップ完了:`)
    console.log(`📁 修正ファイル数: ${totalFiles}`)
    console.log(`🔧 総修正数: ${totalFixes}`)
    
    return { totalFiles, totalFixes }
  } catch (error) {
    console.error('❌ クリーンアップ中にエラーが発生:', error)
    throw error
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupSyntaxErrors()
    .then(({ totalFiles, totalFixes }) => {
      console.log(`\n🎉 構文エラークリーンアップが完了しました!`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ スクリプト実行エラー:', error)
      process.exit(1)
    })
}

export default cleanupSyntaxErrors