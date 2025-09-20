#!/usr/bin/env node

/**
 * アクセシビリティ問題を修正するスクリプト
 * 主にラベルとフォームコントロールの関連付けを修正
 */

const fs = require('fs');
const path = require('path');

// ESLintレポートからアクセシビリティ問題を抽出
function getAccessibilityIssues() {
  try {
    const reportPath = path.join(process.cwd(), 'eslint-report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    const a11yIssues = [];
    
    report.forEach(file => {
      file.messages.forEach(msg => {
        if (msg.ruleId && msg.ruleId.includes('jsx-a11y')) {
          a11yIssues.push({
            file: file.filePath,
            line: msg.line,
            column: msg.column,
            message: msg.message,
            ruleId: msg.ruleId,
            source: msg.source
          });
        }
      });
    });
    
    return a11yIssues;
  } catch (error) {
    console.error('ESLintレポートの読み込みに失敗:', error);
    return [];
  }
}

// labelとinputの関連付けを修正
function fixLabelAssociation(content, issues) {
  let modified = content;
  
  // パターン1: labelに隣接するinput/select/textareaを検出
  // <label>Text</label><input ... />
  modified = modified.replace(
    /<label([^>]*)>([^<]+)<\/label>\s*<(input|select|textarea)([^>]*)(\/)?>/g,
    (match, labelAttrs, labelText, inputType, inputAttrs, selfClosing) => {
      // htmlFor属性がない場合、IDを生成して追加
      if (!labelAttrs.includes('htmlFor')) {
        // input側のid属性を確認
        const idMatch = inputAttrs.match(/id=["']([^"']+)["']/);
        let inputId;
        
        if (idMatch) {
          inputId = idMatch[1];
        } else {
          // IDを生成（ラベルテキストベース）
          inputId = labelText.trim().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-input';
          
          // input側にもidを追加
          if (selfClosing) {
            inputAttrs = ` id="${inputId}"${inputAttrs}`;
          } else {
            inputAttrs = ` id="${inputId}"${inputAttrs}`;
          }
        }
        
        labelAttrs = ` htmlFor="${inputId}"${labelAttrs}`;
      }
      
      return `<label${labelAttrs}>${labelText}</label><${inputType}${inputAttrs}${selfClosing || ''}>`;
    }
  );
  
  // パターン2: labelの中にinputがネストされている場合
  // <label><input ... />Text</label>
  modified = modified.replace(
    /<label([^>]*)>\s*<(input|select|textarea)([^>]*)(\/)?>\s*([^<]+)<\/label>/g,
    (match, labelAttrs, inputType, inputAttrs, selfClosing, labelText) => {
      // ネストされている場合はhtmlForは不要だが、アクセシビリティのために追加
      const idMatch = inputAttrs.match(/id=["']([^"']+)["']/);
      let inputId;
      
      if (!idMatch) {
        inputId = labelText.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-input';
        inputAttrs = ` id="${inputId}"${inputAttrs}`;
      } else {
        inputId = idMatch[1];
      }
      
      if (!labelAttrs.includes('htmlFor')) {
        labelAttrs = ` htmlFor="${inputId}"${labelAttrs}`;
      }
      
      return `<label${labelAttrs}><${inputType}${inputAttrs}${selfClosing || ''}>${labelText}</label>`;
    }
  );
  
  // パターン3: 独立したlabelにhtmlForを追加
  // <label>Text</label> ... <input id="existing-id" />
  modified = modified.replace(
    /<label([^>]*)>([^<]+)<\/label>/g,
    (match, attrs, text) => {
      if (!attrs.includes('htmlFor')) {
        // ラベルテキストからIDを推測
        const suggestedId = text.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        // 同じ行または次の行にある入力要素を探す
        const inputPattern = new RegExp(`<(input|select|textarea)[^>]*id=["']${suggestedId}[^"']*["'][^>]*>`, 'g');
        if (modified.match(inputPattern)) {
          return `<label htmlFor="${suggestedId}"${attrs}>${text}</label>`;
        }
      }
      return match;
    }
  );
  
  return modified !== content ? modified : null;
}

// aria-labelを追加（labelが使えない場合）
function addAriaLabels(content) {
  let modified = content;
  
  // パターン1: プレースホルダーがあるがaria-labelがない入力要素
  modified = modified.replace(
    /<(input|textarea)([^>]*placeholder=["']([^"']+)["'][^>]*)>/g,
    (match, tagName, attrs, placeholder) => {
      if (!attrs.includes('aria-label') && !attrs.includes('aria-labelledby')) {
        // プレースホルダーをaria-labelとして使用
        return `<${tagName} aria-label="${placeholder}"${attrs}>`;
      }
      return match;
    }
  );
  
  // パターン2: typeがsubmit/buttonでvalueがあるがaria-labelがない
  modified = modified.replace(
    /<input([^>]*type=["'](submit|button)["'][^>]*value=["']([^"']+)["'][^>]*)>/g,
    (match, attrs, type, value) => {
      if (!attrs.includes('aria-label')) {
        return `<input aria-label="${value}"${attrs}>`;
      }
      return match;
    }
  );
  
  return modified !== content ? modified : null;
}

// ファイルのアクセシビリティ問題を修正
function fixAccessibilityInFile(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    console.warn(`ファイルが見つかりません: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // label関連の修正を適用
  const labelFixed = fixLabelAssociation(content, issues);
  if (labelFixed) {
    content = labelFixed;
  }
  
  // aria-labelの追加
  const ariaFixed = addAriaLabels(content);
  if (ariaFixed) {
    content = ariaFixed;
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// メイン処理
function main() {
  console.log('♿ アクセシビリティ問題を分析中...');
  
  const issues = getAccessibilityIssues();
  console.log(`📊 ${issues.length}件のアクセシビリティ問題を検出`);
  
  // 問題タイプ別に分類
  const issuesByType = {};
  issues.forEach(issue => {
    if (!issuesByType[issue.ruleId]) {
      issuesByType[issue.ruleId] = [];
    }
    issuesByType[issue.ruleId].push(issue);
  });
  
  console.log('\n問題タイプ別の内訳:');
  Object.entries(issuesByType).forEach(([ruleId, ruleIssues]) => {
    console.log(`  ${ruleId}: ${ruleIssues.length}件`);
  });
  
  // ファイルごとにグループ化
  const fileGroups = {};
  issues.forEach(issue => {
    if (!fileGroups[issue.file]) {
      fileGroups[issue.file] = [];
    }
    fileGroups[issue.file].push(issue);
  });
  
  // 各ファイルを修正
  let fixedCount = 0;
  for (const [file, fileIssues] of Object.entries(fileGroups)) {
    // JSX/TSXファイルのみ処理
    if (file.match(/\.(jsx|tsx)$/)) {
      console.log(`📝 修正中: ${path.basename(file)} (${fileIssues.length}件)`);
      if (fixAccessibilityInFile(file, fileIssues)) {
        fixedCount++;
      }
    }
  }
  
  console.log(`\n✅ ${fixedCount}ファイルを修正しました`);
  
  // 推奨事項を出力
  console.log('\n📋 アクセシビリティ改善の推奨事項:');
  console.log('1. すべてのフォーム要素にラベルまたはaria-labelを設定');
  console.log('2. 画像にはalt属性を必ず追加');
  console.log('3. インタラクティブ要素には適切なrole属性を設定');
  console.log('4. キーボードナビゲーションをサポート');
  console.log('5. カラーコントラストを WCAG AA 基準に準拠');
}

main();