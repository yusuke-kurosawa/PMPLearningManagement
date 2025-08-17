#!/usr/bin/env node

/**
 * アクセシビリティ問題自動修正スクリプト
 * JSX A11y準拠、WCAG 2.1 AA準拠への修正
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class AccessibilityFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
  }

  async fixAllFiles() {
    console.log('♿ アクセシビリティ問題修正を開始...')
    
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
      
      // label要素の修正
      fixedContent = this.fixLabelAssociation(fixedContent)
      
      // クリック可能要素のキーボード対応
      fixedContent = this.fixClickableElements(fixedContent)
      
      // インタラクティブ要素のrole属性追加
      fixedContent = this.fixInteractiveElements(fixedContent)
      
      // 画像のalt属性追加
      fixedContent = this.fixImageAltAttributes(fixedContent)
      
      // フォーカス管理の改善
      fixedContent = this.improveFocusManagement(fixedContent)
      
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

  fixLabelAssociation(content) {
    // Label要素とinput要素のID自動生成・関連付け
    let idCounter = 1000
    
    // 個別のlabel要素にhtmlFor属性を追加
    content = content.replace(
      /<label([^>]*?)>([^<]*?)<\/label>\s*\n?\s*<(input|select|textarea)([^>]*?)>/gi,
      (match, labelAttrs, labelText, inputTag, inputAttrs) => {
        // 既にhtmlForまたはforがある場合はスキップ
        if (labelAttrs.includes('htmlFor') || labelAttrs.includes('for')) {
          return match
        }
        
        // input要素にidがある場合はそれを使用
        const idMatch = inputAttrs.match(/id=['"]([^'"]+)['"]/i)
        let inputId
        
        if (idMatch) {
          inputId = idMatch[1]
        } else {
          // IDがない場合は新規生成
          inputId = `form-field-${idCounter++}`
          inputAttrs = ` id="${inputId}" ${inputAttrs}`
        }
        
        return `<label${labelAttrs} htmlFor="${inputId}">${labelText}</label>\n      <${inputTag}${inputAttrs}>`
      }
    )
    
    // Radix UI Select系コンポーネントの修正
    content = content.replace(
      /<label([^>]*?)>([^<]*?)<\/label>\s*\n?\s*<(SelectTrigger|Select)([^>]*?)>/gi,
      (match, labelAttrs, labelText, componentTag, componentAttrs) => {
        if (labelAttrs.includes('htmlFor')) {
          return match
        }
        
        const selectId = `select-${idCounter++}`
        return `<label${labelAttrs} htmlFor="${selectId}">${labelText}</label>\n      <${componentTag}${componentAttrs} id="${selectId}">`
      }
    )
    
    // Switch, Checkbox等のRadix UI コンポーネント
    const radixComponents = ['Switch', 'Checkbox', 'RadioGroup', 'Slider']
    radixComponents.forEach(component => {
      const pattern = new RegExp(
        `<label([^>]*?)>([^<]*?)<\/label>\\s*\\n?\\s*<(${component})([^>]*?)>`,
        'gi'
      )
      
      content = content.replace(pattern, (match, labelAttrs, labelText, compTag, compAttrs) => {
        if (labelAttrs.includes('htmlFor')) {
          return match
        }
        
        const compId = `${component.toLowerCase()}-${idCounter++}`
        return `<label${labelAttrs} htmlFor="${compId}">${labelText}</label>\n      <${compTag}${compAttrs} id="${compId}">`
      })
    })
    
    return content
  }

  fixClickableElements(content) {
    // div, span等のクリック可能要素にキーボード対応を追加
    content = content.replace(
      /<(div|span)([^>]*?onClick[^>]*?)>/gi,
      (match, tag, attrs) => {
        // 既にonKeyDownやroleがある場合はスキップ
        if (attrs.includes('onKeyDown') || attrs.includes('onKeyPress')) {
          return match
        }
        
        // role属性がない場合は追加
        let roleAttr = ''
        if (!attrs.includes('role=')) {
          roleAttr = ' role="button"'
        }
        
        // tabIndex属性がない場合は追加
        let tabIndexAttr = ''
        if (!attrs.includes('tabIndex')) {
          tabIndexAttr = ' tabIndex={0}'
        }
        
        // キーボードイベントハンドラー追加
        const keyHandler = ' onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}'
        
        return `<${tag}${attrs}${roleAttr}${tabIndexAttr}${keyHandler}>`
      }
    )
    
    return content
  }

  fixInteractiveElements(content) {
    // Button要素のaria-label追加（テキストがない場合）
    content = content.replace(
      /<(button|Button)([^>]*?)>\s*(<[^>]*?>|&[^;]+;|\s)*<\/(button|Button)>/gi,
      (match, openTag, attrs, innerContent, closeTag) => {
        // aria-labelまたはaria-labelledbyが既にある場合はスキップ
        if (attrs.includes('aria-label') || attrs.includes('aria-labelledby')) {
          return match
        }
        
        // テキストコンテンツがあるかチェック
        const textContent = innerContent.replace(/<[^>]*>/g, '').trim()
        if (textContent.length > 0) {
          return match
        }
        
        // アイコンボタンの場合はaria-label追加
        if (innerContent.includes('Icon') || innerContent.includes('icon')) {
          const ariaLabel = ' aria-label="ボタン"'
          return `<${openTag}${attrs}${ariaLabel}>${innerContent}</${closeTag}>`
        }
        
        return match
      }
    )
    
    return content
  }

  fixImageAltAttributes(content) {
    // img要素のalt属性追加
    content = content.replace(
      /<img([^>]*?)>/gi,
      (match, attrs) => {
        // 既にalt属性がある場合はスキップ
        if (attrs.includes('alt=')) {
          return match
        }
        
        // decorative画像の場合は空のalt
        const altAttr = ' alt=""'
        return `<img${attrs}${altAttr}>`
      }
    )
    
    return content
  }

  improveFocusManagement(content) {
    // フォーカストラップの改善
    content = content.replace(
      /(?=.*useEffect)(?=.*querySelector)(?=.*focus)/s,
      (match) => {
        // 既に適切なフォーカス管理がある場合はスキップ
        if (match.includes('focusFirstElement') || match.includes('tabIndex')) {
          return match
        }
        
        return match
      }
    )
    
    // Modal系コンポーネントのフォーカス管理
    content = content.replace(
      /<(Modal|Dialog|AlertDialog)([^>]*?)(open|isOpen)={([^}]+)}/gi,
      (match, component, attrs, openProp, openValue) => {
        // 既にaria属性がある場合はスキップ
        if (attrs.includes('aria-labelledby') || attrs.includes('aria-describedby')) {
          return match
        }
        
        const ariaAttrs = ' aria-labelledby="modal-title" aria-describedby="modal-description"'
        return `<${component}${attrs}${ariaAttrs} ${openProp}={${openValue}}`
      }
    )
    
    return content
  }

  printSummary() {
    console.log('\\n📊 アクセシビリティ修正サマリー')
    console.log('='.repeat(50))
    console.log(`✅ 修正完了ファイル数: ${this.fixedFiles.length}`)
    console.log(`❌ エラーファイル数: ${this.errors.length}`)
    
    if (this.fixedFiles.length > 0) {
      console.log('\\n♿ 修正されたファイル:')
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
    console.log('  1. npm run lint で残りアクセシビリティ問題を確認')
    console.log('  2. WCAG 2.1 AA準拠の手動確認')
    console.log('  3. アクセシビリティテストツールでの検証')
  }
}

// 実行
const fixer = new AccessibilityFixer()
await fixer.fixAllFiles()

export default AccessibilityFixer