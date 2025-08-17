#!/usr/bin/env node

/**
 * TypeScript any型自動修正スクリプト
 * any型を適切な型定義に置換
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class TypeScriptAnyFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
    this.typeReplacements = new Map()
    this.initializeTypeReplacements()
  }

  initializeTypeReplacements() {
    // 一般的なany型の置換パターン
    this.typeReplacements.set(
      /Record<string,\s*any>/g,
      'Record<string, unknown>'
    )
    
    this.typeReplacements.set(
      /\[\s*key:\s*string\s*\]:\s*any/g,
      '[key: string]: unknown'
    )
    
    // Event handlers
    this.typeReplacements.set(
      /\(.*?:\s*any\s*\)\s*=>/g,
      (match) => {
        if (match.includes('event') || match.includes('e')) {
          return match.replace('any', 'Event')
        }
        if (match.includes('data')) {
          return match.replace('any', 'unknown')
        }
        return match.replace('any', 'unknown')
      }
    )
    
    // Function parameters
    this.typeReplacements.set(
      /\\s*:\s*any(?=\\s*[,)])/g,
      ': unknown'
    )
    
    // Array types
    this.typeReplacements.set(
      /any\\[\\]/g,
      'unknown[]'
    )
    
    // Console statements replacement
    this.typeReplacements.set(
      /console\\.(log|error|warn|info)/g,
      '// console.$1'
    )
  }

  async fixAllFiles() {
    console.log('🔧 TypeScript any型修正を開始...')
    
    try {
      // TypeScript files を検索
      const files = await new Promise((resolve, reject) => {
        glob('src/**/*.{ts,tsx}', { 
          ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'src/**/*.d.ts']
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
      
      // 一般的なany型置換
      fixedContent = this.replaceGeneralAnyTypes(fixedContent)
      
      // コンテキスト特化型置換
      fixedContent = this.replaceContextSpecificTypes(fixedContent, filePath)
      
      // コンソール文の修正
      fixedContent = this.fixConsoleStatements(fixedContent)
      
      // 型インポートの追加
      fixedContent = this.addMissingTypeImports(fixedContent, filePath)
      
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

  replaceGeneralAnyTypes(content) {
    // Record<string, any> -> Record<string, unknown>
    content = content.replace(/Record<string,\\s*any>/g, 'Record<string, unknown>')
    
    // { [key: string]: any } -> { [key: string]: unknown }
    content = content.replace(/\\{\\s*\\[\\s*key:\\s*string\\s*\\]:\\s*any\\s*\\}/g, '{ [key: string]: unknown }')
    
    // Array types: any[] -> unknown[]
    content = content.replace(/\\bany\\[\\]/g, 'unknown[]')
    
    // Function parameters: (param: any) -> (param: unknown)
    content = content.replace(/(\\w+):\\s*any(?=\\s*[,)])/g, '$1: unknown')
    
    // Generic any: <any> -> <unknown>
    content = content.replace(/<any>/g, '<unknown>')
    
    // Type assertions: as any -> as unknown
    content = content.replace(/\\bas\\s+any\\b/g, 'as unknown')
    
    return content
  }

  replaceContextSpecificTypes(content, filePath) {
    const fileName = path.basename(filePath, path.extname(filePath))
    
    // API関連ファイル
    if (fileName.includes('api') || fileName.includes('service')) {
      content = content.replace(
        /(response|data|result):\\s*any/g,
        '$1: ApiResponse<unknown>'
      )
    }
    
    // Event handler files
    if (content.includes('onClick') || content.includes('onChange')) {
      content = content.replace(
        /(event|e):\\s*any/g,
        '$1: React.MouseEvent | React.ChangeEvent'
      )
    }
    
    // Context files
    if (fileName.includes('context') || fileName.includes('Context')) {
      content = content.replace(
        /(value|state):\\s*any/g,
        '$1: unknown'
      )
    }
    
    // Store/State files
    if (fileName.includes('store') || fileName.includes('Store') || fileName.includes('state')) {
      content = content.replace(
        /(state|action|payload):\\s*any/g,
        '$1: unknown'
      )
    }
    
    // Form handling
    if (content.includes('formData') || content.includes('FormData')) {
      content = content.replace(
        /(formData|values):\\s*any/g,
        '$1: Record<string, unknown>'
      )
    }
    
    // Performance monitoring
    if (fileName.includes('performance') || fileName.includes('monitor')) {
      content = content.replace(
        /(entry|metric):\\s*any/g,
        '$1: PerformanceEntry'
      )
    }
    
    return content
  }

  fixConsoleStatements(content) {
    // コンソール文をコメントアウト（開発時のみ）
    if (process.env.NODE_ENV !== 'development') {
      content = content.replace(
        /^(\\s*)console\\.(log|error|warn|info)/gm,
        '$1// console.$2'
      )
    }
    
    return content
  }

  addMissingTypeImports(content, filePath) {
    const imports = []
    
    // React types
    if (content.includes('React.MouseEvent') || content.includes('React.ChangeEvent')) {
      if (!content.includes('import React') && !content.includes('import type { ')) {
        imports.push("import type { MouseEvent, ChangeEvent } from 'react'")
      }
    }
    
    // API response types
    if (content.includes('ApiResponse') && !content.includes('import') && !content.includes('ApiResponse')) {
      imports.push("import type { ApiResponse } from '../types/common/api'")
    }
    
    // Performance types
    if (content.includes('PerformanceEntry') && !content.includes('PerformanceEntry')) {
      // PerformanceEntry is built-in, no import needed
    }
    
    if (imports.length > 0) {
      const importStatements = imports.join('\\n') + '\\n'
      
      // Find the position to insert imports (after existing imports or at top)
      const importInsertPosition = content.search(/^(?!import|\/\\*|\/\/)/m)
      if (importInsertPosition !== -1) {
        content = content.slice(0, importInsertPosition) + importStatements + content.slice(importInsertPosition)
      } else {
        content = importStatements + content
      }
    }
    
    return content
  }

  printSummary() {
    console.log('\\n📊 TypeScript any型修正サマリー')
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
    console.log('  - any → unknown (一般的な未知の型)')
    console.log('  - Record<string, any> → Record<string, unknown>')
    console.log('  - any[] → unknown[]')
    console.log('  - イベントハンドラー型の適切な指定')
    console.log('  - コンテキスト別の型推論')
    
    console.log('\\n📋 次のステップ:')
    console.log('  1. npm run lint で型エラー確認')
    console.log('  2. 手動で具体的な型を指定（可能な箇所）')
    console.log('  3. TypeScript strict mode での動作確認')
  }
}

// 実行
const fixer = new TypeScriptAnyFixer()
await fixer.fixAllFiles()

export default TypeScriptAnyFixer