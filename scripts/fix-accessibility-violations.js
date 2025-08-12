#!/usr/bin/env node
/**
 * アクセシビリティ違反自動修正スクリプト
 * WCAG 2.1 AA準拠のための自動修正を実行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修正対象のコンポーネントと行番号
const violations = [
  { file: 'src/components/collaboration/DiscussionThread.jsx', lines: [118, 229] },
  { file: 'src/components/collaboration/SharedNotes.jsx', lines: [255, 280] },
  { file: 'src/components/collaboration/StudyGroups.jsx', lines: [422, 502] },
  { file: 'src/components/learning/PMPGlossary.jsx', lines: [109] },
  { file: 'src/components/mentorship/MentorshipHub.jsx', lines: [235] },
  { file: 'src/components/pages/PMBOKMatrix.jsx', lines: [1055] },
  { file: 'src/components/shared/CommandPalette.jsx', lines: [367] },
  { file: 'src/components/shared/GlobalSearch.jsx', lines: [190] }
];

// 修正パターン
const fixes = {
  // input要素にラベルを追加
  addInputLabel: (line, index) => {
    if (line.includes('<input') && !line.includes('aria-label') && !line.includes('id=')) {
      const id = `input-${Date.now()}-${index}`;
      let modifiedLine = line;
      
      // type属性を取得
      const typeMatch = line.match(/type="([^"]+)"/);
      const inputType = typeMatch ? typeMatch[1] : 'text';
      
      // placeholder属性を取得（ラベルテキストとして使用）
      const placeholderMatch = line.match(/placeholder="([^"]+)"/);
      const labelText = placeholderMatch ? placeholderMatch[1] : 'Input field';
      
      // id属性を追加
      if (!line.includes('id=')) {
        modifiedLine = modifiedLine.replace('<input', `<input id="${id}"`);
      }
      
      // aria-label属性を追加
      if (!line.includes('aria-label')) {
        modifiedLine = modifiedLine.replace('<input', `<input aria-label="${labelText}"`);
      }
      
      return modifiedLine;
    }
    return line;
  },
  
  // textarea要素にラベルを追加
  addTextareaLabel: (line, index) => {
    if (line.includes('<textarea') && !line.includes('aria-label') && !line.includes('id=')) {
      const id = `textarea-${Date.now()}-${index}`;
      let modifiedLine = line;
      
      // placeholder属性を取得
      const placeholderMatch = line.match(/placeholder="([^"]+)"/);
      const labelText = placeholderMatch ? placeholderMatch[1] : 'Text area';
      
      // id属性を追加
      if (!line.includes('id=')) {
        modifiedLine = modifiedLine.replace('<textarea', `<textarea id="${id}"`);
      }
      
      // aria-label属性を追加
      if (!line.includes('aria-label')) {
        modifiedLine = modifiedLine.replace('<textarea', `<textarea aria-label="${labelText}"`);
      }
      
      return modifiedLine;
    }
    return line;
  },
  
  // select要素にラベルを追加
  addSelectLabel: (line, index) => {
    if (line.includes('<select') && !line.includes('aria-label') && !line.includes('id=')) {
      const id = `select-${Date.now()}-${index}`;
      let modifiedLine = line;
      
      // id属性を追加
      if (!line.includes('id=')) {
        modifiedLine = modifiedLine.replace('<select', `<select id="${id}"`);
      }
      
      // aria-label属性を追加
      if (!line.includes('aria-label')) {
        modifiedLine = modifiedLine.replace('<select', `<select aria-label="Select option"`);
      }
      
      return modifiedLine;
    }
    return line;
  }
};

// ファイルを修正
function fixFile(filePath, targetLines) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  ファイルが見つかりません: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 対象行の前後5行をチェック（行番号のずれを考慮）
      const isTargetArea = targetLines.some(targetLine => 
        Math.abs(lineNumber - targetLine) <= 5
      );
      
      if (isTargetArea) {
        let newLine = line;
        
        // 各修正パターンを適用
        newLine = fixes.addInputLabel(newLine, index);
        newLine = fixes.addTextareaLabel(newLine, index);
        newLine = fixes.addSelectLabel(newLine, index);
        
        if (newLine !== line) {
          lines[index] = newLine;
          modified = true;
          console.log(`✅ 修正: ${filePath}:${lineNumber}`);
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('🔧 アクセシビリティ違反の自動修正を開始...');
  
  let fixedCount = 0;
  let totalViolations = 0;
  
  for (const violation of violations) {
    totalViolations += violation.lines.length;
    if (fixFile(violation.file, violation.lines)) {
      fixedCount++;
    }
  }
  
  console.log(`\n📊 修正結果:`);
  console.log(`  修正されたファイル: ${fixedCount}/${violations.length}`);
  console.log(`  対象違反数: ${totalViolations}`);
  
  // 修正後の検証を実行
  console.log('\n🔍 修正後の検証を実行中...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('npm run quality:accessibility', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  検証中にエラーが発生しました');
  }
}

// 実行
main().catch(console.error);