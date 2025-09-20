#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 修正対象のパターンを定義
const patterns = [
  {
    // useState直前の閉じ括弧不足
    name: 'Missing closing bracket before useState',
    pattern: /(\s+})\n(\s+const \[.+\] = useState)/g,
    replacement: '$1)\n$2'
  },
  {
    // useCallbackの依存配列が間違った位置にある
    name: 'Misplaced useCallback dependencies',
    pattern: /\}, \[\]\)/g,
    replacement: '}, [])'
  },
  {
    // useMemoの依存配列が間違った位置にある
    name: 'Misplaced useMemo dependencies in if statement',
    pattern: /return .+\n\s+\}, \[\]\)/g,
    replacement: function(match) {
      return match.replace('}, [])', '}');
    }
  },
  {
    // 配列pushの閉じ括弧不足
    name: 'Missing closing parenthesis for array push',
    pattern: /\.push\({[^}]+}\)\n\s+}/g,
    replacement: function(match) {
      return match.replace('})\n', '})\n');
    }
  },
  {
    // forEachやmapの閉じ括弧不足
    name: 'Missing closing parenthesis for forEach/map',
    pattern: /\.forEach\([^)]+\)\n\s+}\n\s+}/g,
    replacement: function(match) {
      return match.replace(/}\n\s+}/g, '})\n    })');
    }
  }
];

// ファイルを処理する関数
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  patterns.forEach(({ name, pattern, replacement }) => {
    const originalContent = content;
    
    if (typeof replacement === 'function') {
      content = content.replace(pattern, replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== originalContent) {
      console.log(`  Applied fix: ${name}`);
      modified = true;
    }
  });
  
  // 特定のファイル用の修正
  if (filePath.includes('ProjectSimulator.tsx')) {
    // ProjectSimulator特有の修正
    const projectSimulatorPattern = /riskLevel: 'medium'\n\s+}\n\s+const \[decisions/g;
    const projectSimulatorReplacement = "riskLevel: 'medium'\n  })\n  const [decisions";
    
    const originalContent = content;
    content = content.replace(projectSimulatorPattern, projectSimulatorReplacement);
    if (content !== originalContent) {
      console.log(`  Applied fix: ProjectSimulator specific fix`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Fixed ${filePath}`);
  }
}

// メイン処理
function main() {
  console.log('Fixing remaining syntax errors...\n');
  
  // 対象ファイルを検索
  const targetPatterns = [
    'src/**/*.tsx',
    'src/**/*.ts',
    'src/**/*.jsx',
    'src/**/*.js'
  ];
  
  let totalFiles = 0;
  
  targetPatterns.forEach(pattern => {
    const files = glob.globSync(path.join(process.cwd(), pattern));
    files.forEach(file => {
      if (!file.includes('node_modules')) {
        processFile(file);
        totalFiles++;
      }
    });
  });
  
  console.log(`\n✅ Processed ${totalFiles} files`);
}

main();