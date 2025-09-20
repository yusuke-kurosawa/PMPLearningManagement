#!/usr/bin/env node

/**
 * 構文エラー自動修正スクリプト
 * useCallback構文エラーとその他の構文問題を修正
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
  }

  async fixAllFiles() {
    console.log('🔧 構文エラー修正を開始...')
    
    try {
      // TypeScript/JavaScript files を検索
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
      
      // useCallback構文修正
      fixedContent = this.fixUseCallbackSyntax(fixedContent)
      
      // useEffect構文修正
      fixedContent = this.fixUseEffectSyntax(fixedContent)
      
      // 一般的な構文エラー修正
      fixedContent = this.fixGeneralSyntaxErrors(fixedContent)
      
      // アロー関数構文修正
      fixedContent = this.fixArrowFunctionSyntax(fixedContent)
      
      // オブジェクト構文修正
      fixedContent = this.fixObjectSyntax(fixedContent)
      
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

  fixUseCallbackSyntax(content) {
    // useCallback( () => { ... } の修正
    content = content.replace(
      /const\s+(\w+)\s*=\s*useCallback\(\s*\(\s*\)\s*=>\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\s*$/gm,
      (match, varName, body) => {
        // 依存配列を推測
        const dependencies = this.extractDependencies(body)
        const depsArray = dependencies.length > 0 ? `[${dependencies.join(', ')}]` : '[]'
        return `const ${varName} = useCallback(() => {${body}}, ${depsArray})`
      }
    )
    
    // useCallback( async () => { ... } の修正
    content = content.replace(
      /const\s+(\w+)\s*=\s*useCallback\(\s*async\s*\(\s*\)\s*=>\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\s*$/gm,
      (match, varName, body) => {
        const dependencies = this.extractDependencies(body)
        const depsArray = dependencies.length > 0 ? `[${dependencies.join(', ')}]` : '[]'
        return `const ${varName} = useCallback(async () => {${body}}, ${depsArray})`
      }
    )
    
    return content
  }

  fixUseEffectSyntax(content) {
    // useEffect関数の構文修正
    content = content.replace(
      /useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\},\s*\[\s*\]\s*\)/g,
      (match, body) => {
        return `useEffect(() => {${body}}, [])`
      }
    )
    
    return content
  }

  fixGeneralSyntaxErrors(content) {
    // 重複した閉じ括弧と依存配列の修正
    content = content.replace(/\}\s*,\s*\[\s*\]\s*\)\s*\}\s*,\s*\[\s*\]/g, '}, [])')
    
    // 不正な関数終了の修正
    content = content.replace(/\}\s*const\s+(\w+)\s*=/g, '}\n\n  const $1 =')
    
    // オブジェクト内のカンマ不足修正
    content = content.replace(/(\w+):\s*([^,}\n]+)\s*(?=\w+:)/g, '$1: $2,')
    
    return content
  }

  fixArrowFunctionSyntax(content) {
    // アロー関数の構文修正
    content = content.replace(
      /=\s*\(\s*([^)]*)\s*\)\s*=>\s*\{([^}]+)\}\s*(?=\s*const|\s*function|\s*\}|\s*$)/g,
      '= ($1) => {\n$2\n  }'
    )
    
    return content
  }

  fixObjectSyntax(content) {
    // オブジェクトプロパティの構文修正
    content = content.replace(
      /(\w+)\s*:\s*([^,}\n]+)(?=\s*\n\s*\w+\s*:)/g,
      '$1: $2,'
    )
    
    // 配列内のオブジェクト構文修正
    content = content.replace(
      /\{\s*(\w+)\s*:\s*([^,}]+)\s*\}/g,
      '{ $1: $2 }'
    )
    
    return content
  }

  extractDependencies(functionBody) {
    const dependencies = new Set()
    
    // 一般的な依存関係パターンをマッチ
    const patterns = [
      /\b(currentUser|targetId|targetType|processId|knowledgeArea|filterTag|groupId|userId)\b/g,
      /\bset\w+\(/g, // setState関数は除外
    ]
    
    patterns.forEach((pattern, index) => {
      let match
      while ((match = pattern.exec(functionBody)) !== null) {
        if (index === 0) { // 変数名の場合
          dependencies.add(match[1])
        }
      }
    })
    
    // setState関数は依存配列から除外
    const filteredDeps = Array.from(dependencies).filter(dep => 
      !dep.startsWith('set') && 
      !['console', 'localStorage', 'alert'].includes(dep)
    )
    
    return filteredDeps
  }

  printSummary() {
    console.log('\\n📊 構文エラー修正サマリー')
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
    
    console.log('\\n🎯 修正内容:')
    console.log('  - useCallback構文の正規化')
    console.log('  - 依存配列の自動推測・追加')
    console.log('  - アロー関数構文の正規化')
    console.log('  - オブジェクト構文の修正')
    
    console.log('\\n📋 次のステップ:')
    console.log('  1. npm run lint で残り構文エラー確認')
    console.log('  2. 手動修正が必要な複雑な構文エラー対応')
    console.log('  3. TypeScript型チェックエラー確認')
  }
}

// 実行
const fixer = new SyntaxErrorFixer()
await fixer.fixAllFiles()

export default SyntaxErrorFixer