#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

/**
 * 残りのESLint構文エラー修正スクリプト
 * 特定の構文エラーパターンを自動修正します
 */

const ADDITIONAL_FIXES = [
  // 1. useCallback missing dependency array
  {
    name: 'useCallback dependency array',
    pattern: /(\s+const\s+\w+\s*=\s*useCallback\([\s\S]*?\)\s*)(})(\s*$)/gm,
    replacement: '$1}, [])$3',
    description: 'useCallbackに依存配列を追加'
  },
  // 2. useEffect missing dependency array  
  {
    name: 'useEffect dependency array',
    pattern: /(\s+useEffect\(\(\) => \{[\s\S]*?\}\s*)(})(\s*$)/gm,
    replacement: '$1}, [])$3',
    description: 'useEffectに依存配列を追加'
  },
  // 3. Expression expected errors
  {
    name: 'onClick arrow function',
    pattern: /(onClick={\(\) =>\s*role="button"[^}]*})/g,
    replacement: 'onClick={() => {}}',
    description: 'onClickの構文エラー修正'
  },
  // 4. Broken className hover states
  {
    name: 'Hover states fix',
    pattern: /(hover:\s+[^,\s]*,\s*[^'"`]*)/g,
    replacement: (match) => match.replace(/hover:\s+/, 'hover:').replace(/,\s*/, ' '),
    description: 'Hoverステートの構文修正'
  },
  // 5. Dark mode hover fix
  {
    name: 'Dark hover fix',
    pattern: /(dark:hove,r:)/g,
    replacement: 'dark:hover:',
    description: 'ダークモードhoverの修正'
  },
  // 6. Function expression expected
  {
    name: 'Function expression',
    pattern: /(\w+:\s*)(\w+\([^)]*\)\s*{[^}]*})/g,
    replacement: '$1() => $2',
    description: '関数式の修正'
  }
]

async function fixRemainingErrors() {
  console.log('🔧 残りのESLint構文エラーを修正中...')
  
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
      for (const fix of ADDITIONAL_FIXES) {
        const originalContent = content
        
        if (typeof fix.replacement === 'function') {
          content = content.replace(fix.pattern, fix.replacement)
        } else {
          content = content.replace(fix.pattern, fix.replacement)
        }
        
        if (content !== originalContent) {
          hasChanges = true
          fileFixCount++
          console.log(`  ✓ ${fix.description}: ${file}`)
        }
      }
      
      // 特別な修正: useCallbackやuseEffectの依存配列が完全に欠けている場合
      if (content.includes('useCallback(') && !content.includes('], [')) {
        content = content.replace(
          /(useCallback\([^}]*}\s*)\)/g,
          '$1, [])'
        )
        hasChanges = true
        fileFixCount++
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8')
        totalFiles++
        totalFixes += fileFixCount
      }
    }
    
    console.log(`\n✅ 修正完了:`)
    console.log(`📁 修正ファイル数: ${totalFiles}`)
    console.log(`🔧 総修正数: ${totalFixes}`)
    
    return { totalFiles, totalFixes }
  } catch (error) {
    console.error('❌ エラー修正中にエラーが発生:', error)
    throw error
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fixRemainingErrors()
    .then(({ totalFiles, totalFixes }) => {
      console.log(`\n🎉 追加構文エラー修正が完了しました!`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ スクリプト実行エラー:', error)
      process.exit(1)
    })
}

export default fixRemainingErrors