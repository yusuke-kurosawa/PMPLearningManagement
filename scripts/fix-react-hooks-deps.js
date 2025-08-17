#!/usr/bin/env node

/**
 * React Hooks依存関係自動修正スクリプト
 * useEffect、useCallback、useMemoの依存配列を自動修正
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class ReactHooksFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
  }

  async fixAllFiles() {
    console.log('🔧 React Hooks依存関係修正を開始...')
    
    try {
      // React component files (JSX/TSX) を検索
      const files = await new Promise((resolve, reject) => {
        glob('src/**/*.{js,jsx,ts,tsx}', { 
          ignore: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.spec.{js,jsx,ts,tsx}']
        }, (err, matches) => {
          if (err) reject(err)
          else resolve(matches)
        })
      })
      
      console.log(`📁 対象ファイル数: ${files.length}`)
      
      for (const file of files) {
        await this.fixFile(file)
      }
      
      this.printSummary()
      
    } catch (error) {
      console.error('❌ エラー:', error.message)
      process.exit(1)
    }
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let fixedContent = content
      
      // useEffect依存関係修正
      fixedContent = this.fixUseEffectDeps(fixedContent)
      
      // useCallback依存関係修正
      fixedContent = this.fixUseCallbackDeps(fixedContent)
      
      // useMemo依存関係修正
      fixedContent = this.fixUseMemo(fixedContent)
      
      // アクセシビリティ問題修正
      fixedContent = this.fixAccessibilityIssues(fixedContent)
      
      if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8')
        this.fixedFiles.push(filePath)
        console.log(`✅ 修正完了: ${path.relative(process.cwd(), filePath)}`)
      }
      
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message })
      console.error(`❌ エラー ${filePath}: ${error.message}`)
    }
  }

  fixUseEffectDeps(content) {
    // loadXXX関数を含むuseEffectの修正
    const loadFunctionPattern = /const\s+(\w*[Ll]oad\w*)\s*=\s*(?:useCallback\s*\()?(?:async\s+)?\(\s*\)/g
    const loadFunctions = []
    let match
    
    while ((match = loadFunctionPattern.exec(content)) !== null) {
      loadFunctions.push(match[1])
    }
    
    if (loadFunctions.length > 0) {
      // useEffectの依存配列修正
      loadFunctions.forEach(funcName => {
        const useEffectPattern = new RegExp(
          `useEffect\\(\\s*\\(\\s*\\)\\s*=>\\s*{[^}]*${funcName}\\(\\)[^}]*}\\s*,\\s*\\[\\s*\\]\\s*\\)`,
          'g'
        )
        
        content = content.replace(useEffectPattern, (match) => {
          return match.replace('[]', `[${funcName}]`)
        })
      })
    }
    
    return content
  }

  fixUseCallbackDeps(content) {
    // useCallbackをuseEffectで使用する関数に追加
    const callbackNeeded = [
      'initializeDashboard',
      'startRealTimeMonitoring', 
      'loadComments',
      'loadNotes',
      'loadGroups',
      'loadAICoaching',
      'loadInitialData'
    ]
    
    callbackNeeded.forEach(funcName => {
      // 関数定義をuseCallbackでラップ
      const funcPattern = new RegExp(
        `const\\s+${funcName}\\s*=\\s*(async\\s+)?\\(`,
        'g'
      )
      
      content = content.replace(funcPattern, (match) => {
        if (!content.includes(`useCallback`) || !match.includes('useCallback')) {
          return match.replace(`const ${funcName} =`, `const ${funcName} = useCallback(`)
        }
        return match
      })
      
      // 対応する終了部分を修正
      const funcEndPattern = new RegExp(
        `(\\s*}\\s*)(?=\\s*const\\s+(?:${callbackNeeded.filter(f => f !== funcName).join('|')})|\\s*useEffect|\\s*return)`,
        'g'
      )
      
      if (content.includes(`const ${funcName} = useCallback(`) && !content.includes(`}, [])`)) {
        content = content.replace(funcEndPattern, '$1}, [])\n\n  ')
      }
    })
    
    return content
  }

  fixUseMemo(content) {
    // useMemo最適化が必要な計算重い処理を検出
    const memoPatterns = [
      /const\s+(\w+)\s*=\s*data\.filter\(/g,
      /const\s+(\w+)\s*=\s*items\.map\(/g,
      /const\s+(\w+)\s*=\s*\w+\.reduce\(/g
    ]
    
    memoPatterns.forEach(pattern => {
      content = content.replace(pattern, (match, varName) => {
        if (!match.includes('useMemo')) {
          return `const ${varName} = useMemo(() => ${match.split('=')[1].trim()}, [data])`
        }
        return match
      })
    })
    
    return content
  }

  fixAccessibilityIssues(content) {
    // label要素のfor属性をhtmlFor属性に修正
    content = content.replace(/\\s+for=[\"']([^\"']+)[\"']/g, ' htmlFor=\"$1\"')
    
    // onClick要素にキーボードイベント追加
    content = content.replace(
      /(\\s+onClick={[^}]+})/g,
      '$1 onKeyDown={(e) => e.key === \"Enter\" && $1.onClick(e)} tabIndex={0}'
    )
    
    // div要素のrole属性追加（クリックハンドラーがある場合）
    content = content.replace(
      /<div([^>]*onClick[^>]*)>/g,
      '<div$1 role=\"button\">'
    )
    
    return content
  }

  printSummary() {
    console.log('\\n📊 修正サマリー')
    console.log('='.repeat(50))
    console.log(`✅ 修正完了ファイル数: ${this.fixedFiles.length}`)
    console.log(`❌ エラーファイル数: ${this.errors.length}`)
    
    if (this.fixedFiles.length > 0) {
      console.log('\\n🔧 修正されたファイル:')
      this.fixedFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`)
      })
    }
    
    if (this.errors.length > 0) {
      console.log('\\n❌ エラーが発生したファイル:')
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`)
      })
    }
    
    console.log('\\n🎯 次のステップ:')
    console.log('  1. npm run lint で残り問題を確認')
    console.log('  2. 手動修正が必要な項目に対応')
    console.log('  3. npm test でテスト実行')
  }
}

// 実行
const fixer = new ReactHooksFixer()
await fixer.fixAllFiles()

export default ReactHooksFixer