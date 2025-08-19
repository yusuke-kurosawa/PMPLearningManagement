#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

/**
 * useCallbackとuseEffectの依存配列エラーを修正
 */

async function fixUseCallbackErrors() {
  console.log('🔧 useCallback/useEffect依存配列エラーを修正中...\n')
  
  const files = await new Promise((resolve, reject) => {
    glob('src/**/*.{tsx,jsx,ts,js}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    }, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
  
  let totalFixes = 0
  
  for (const file of files) {
    const filePath = path.resolve(file)
    let content = fs.readFileSync(filePath, 'utf8')
    let originalContent = content
    let fixes = 0
    
    // useCallbackの閉じ括弧修正
    content = content.replace(/(\s+}\s*\)\s*$\n\s*\/\/ )/gm, '  }, [])\n\n  // ')
    
    // useEffectの閉じ括弧修正
    content = content.replace(/(\s+}\s*\)\s*$\n\s*const )/gm, '  }, [])\n\n  const ')
    
    // 特定のパターン修正
    content = content.replace(/(\}\s*\)\s*\n\s*\/\/ Handle)/gm, '  }, [])\n\n  // Handle')
    content = content.replace(/(\}\s*\)\s*\n\s*\/\/ Sign)/gm, '  }, [])\n\n  // Sign')
    content = content.replace(/(\}\s*\)\s*\n\s*\/\/ Update)/gm, '  }, [])\n\n  // Update')
    content = content.replace(/(\}\s*\)\s*\n\s*\/\/ Reset)/gm, '  }, [])\n\n  // Reset')
    content = content.replace(/(\}\s*\)\s*\n\s*const value)/gm, '  }, [])\n\n  const value')
    
    if (content !== originalContent) {
      fixes = (content.match(/\}, \[\]\)/g) || []).length - (originalContent.match(/\}, \[\]\)/g) || []).length
      if (fixes > 0) {
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`  ✓ ${path.relative(process.cwd(), filePath)}: ${fixes}件の修正`)
        totalFixes += fixes
      }
    }
  }
  
  console.log(`\n✅ 合計${totalFixes}件の依存配列を修正しました`)
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fixUseCallbackErrors()
    .then(() => {
      console.log('\n🎉 修正が完了しました!')
    })
    .catch(error => {
      console.error('❌ エラーが発生しました:', error)
      process.exit(1)
    })
}

export default fixUseCallbackErrors