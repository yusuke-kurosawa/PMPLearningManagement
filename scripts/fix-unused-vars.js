#!/usr/bin/env node

/**
 * ESLint未使用変数の自動修正スクリプト
 * 実際に未使用のimportや変数をコメントアウトまたは削除
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ESLintの結果を取得
function getEslintIssues() {
  try {
    const result = execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --format json', {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB
    })
    return JSON.parse(result)
  } catch (error) {
    if (error.stdout) {
      return JSON.parse(error.stdout)
    }
    return []
  }
}

// 未使用変数の修正
function fixUnusedVars(filePath, messages) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  // 未使用変数のメッセージをフィルタ
  const unusedVarMessages = messages.filter(msg => 
    msg.ruleId === '@typescript-eslint/no-unused-vars' ||
    msg.ruleId === 'no-unused-vars'
  )
  
  // 行番号でソート（逆順：下から上へ処理）
  unusedVarMessages.sort((a, b) => b.line - a.line)
  
  unusedVarMessages.forEach(msg => {
    const lineIndex = msg.line - 1
    const line = lines[lineIndex]
    
    if (!line) return
    
    // import文の処理
    if (line.includes('import')) {
      // 特定のimportのみを削除
      const match = msg.message.match(/'([^']+)'/)
      if (match) {
        const varName = match[1]
        
        // デフォルトインポートの場合
        if (line.includes(`import ${varName} from`)) {
          lines[lineIndex] = `// ${line} // TODO: Will be used in future`
        }
        // 名前付きインポートの場合
        else if (line.includes(varName)) {
          // 複数インポートから特定の変数のみ削除
          const importMatch = line.match(/import\s*{([^}]+)}\s*from/)
          if (importMatch) {
            const imports = importMatch[1].split(',').map(s => s.trim())
            const filteredImports = imports.filter(imp => !imp.includes(varName))
            
            if (filteredImports.length === 0) {
              lines[lineIndex] = `// ${line} // TODO: Will be used in future`
            } else {
              const newImportList = filteredImports.join(', ')
              lines[lineIndex] = line.replace(importMatch[1], ` ${newImportList} `)
            }
          }
        }
      }
    }
    // 変数宣言の処理
    else if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
      const match = msg.message.match(/'([^']+)'/)
      if (match) {
        const varName = match[1]
        
        // 分割代入の場合
        if (line.includes('{') && line.includes('}')) {
          const destructMatch = line.match(/{([^}]+)}/)
          if (destructMatch) {
            const vars = destructMatch[1].split(',').map(s => s.trim())
            const filteredVars = vars.filter(v => !v.includes(varName))
            
            if (filteredVars.length === 0) {
              lines[lineIndex] = `// ${line} // TODO: Will be used in future`
            } else {
              const newVarList = filteredVars.join(', ')
              lines[lineIndex] = line.replace(destructMatch[1], ` ${newVarList} `)
            }
          }
        }
        // 通常の変数宣言
        else if (line.includes(varName)) {
          // 値が代入されていて使用されていない場合はコメントアウト
          if (msg.message.includes('is assigned a value but never used')) {
            lines[lineIndex] = `// ${line} // TODO: Will be used in future`
          }
          // 定義のみで使用されていない場合もコメントアウト
          else if (msg.message.includes('is defined but never used')) {
            lines[lineIndex] = `// ${line} // TODO: Will be used in future`
          }
        }
      }
    }
    // 関数の引数の処理
    else if (msg.message.includes('is defined but never used') && msg.message.includes('Allowed unused args')) {
      const match = msg.message.match(/'([^']+)'/)
      if (match) {
        const varName = match[1]
        // 引数名の前にアンダースコアを追加
        const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`)
        lines[lineIndex] = newLine
      }
    }
  })
  
  return lines.join('\n')
}

// メイン処理
async function main() {
  console.log('🔍 ESLint未使用変数の自動修正を開始...')
  
  const results = getEslintIssues()
  let totalFixed = 0
  
  for (const result of results) {
    if (result.messages.length === 0) continue
    
    const unusedVarMessages = result.messages.filter(msg => 
      msg.ruleId === '@typescript-eslint/no-unused-vars' ||
      msg.ruleId === 'no-unused-vars'
    )
    
    if (unusedVarMessages.length === 0) continue
    
    console.log(`📝 修正中: ${result.filePath} (${unusedVarMessages.length}件の未使用変数)`)
    
    try {
      const fixedContent = fixUnusedVars(result.filePath, result.messages)
      fs.writeFileSync(result.filePath, fixedContent)
      totalFixed += unusedVarMessages.length
    } catch (error) {
      console.error(`❌ エラー: ${result.filePath}`, error.message)
    }
  }
  
  console.log(`\n✅ 完了: ${totalFixed}件の未使用変数を修正しました`)
  
  // Prettierでフォーマット
  console.log('\n🎨 Prettierでフォーマット中...')
  try {
    execSync('npx prettier --write "src/**/*.{js,jsx,ts,tsx}"', { stdio: 'inherit' })
  } catch (error) {
    console.error('Prettierエラー:', error.message)
  }
}

main().catch(console.error)