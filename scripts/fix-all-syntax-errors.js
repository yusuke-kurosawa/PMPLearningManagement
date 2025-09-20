#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    const fileName = path.basename(filePath);
    
    // Pattern 1: useEffect の閉じ括弧エラー (, [])
    const pattern1 = /(\s+)\}, \[\]\)/gm;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '$1}, [])');
      modified = true;
      console.log(`Fixed useEffect closing pattern in ${fileName}`);
    }
    
    // Pattern 2: 不完全な useEffect の閉じ括弧
    const pattern2 = /(\s+)\}\)/gm;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // useEffectの中で、誤った }) が現れた場合
      if (line.match(/^\s+\}\)$/)) {
        // 前の行を確認
        if (i > 0 && lines[i-1].match(/^\s+(}|return)/)) {
          // 次の行を確認
          if (i < lines.length - 1 && lines[i+1].match(/^\s+}/)) {
            lines[i] = line.replace(/\}\)/, '}');
            modified = true;
            console.log(`Fixed incomplete closing at line ${i+1} in ${fileName}`);
          }
        }
      }
    }
    if (modified) {
      content = lines.join('\n');
    }
    
    // Pattern 3: useMemo の閉じ括弧が不足
    const pattern3 = /return\s+\{[^}]+\}\s*\}\s*$/gm;
    const blocks = content.match(/const\s+\w+\s*=\s*useMemo\(\(\)\s*=>\s*\{[\s\S]*?\n\s*\}/g);
    if (blocks) {
      blocks.forEach(block => {
        if (!block.endsWith('}, [])') && !block.endsWith('}, [])')) {
          const fixedBlock = block + ', [])';
          content = content.replace(block, fixedBlock);
          modified = true;
          console.log(`Fixed useMemo closing in ${fileName}`);
        }
      });
    }
    
    // Pattern 4: 孤立した })
    const pattern4 = /^\s*\}\)$/gm;
    if (pattern4.test(content)) {
      // コンテキストを確認して修正
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^\s*\}\)$/)) {
          // 前の行を確認
          let foundUseEffect = false;
          for (let j = Math.max(0, i - 10); j < i; j++) {
            if (lines[j].includes('useEffect') || lines[j].includes('useCallback') || lines[j].includes('useMemo')) {
              foundUseEffect = true;
              break;
            }
          }
          if (!foundUseEffect) {
            lines[i] = lines[i].replace(/\}\)/, '}');
            modified = true;
            console.log(`Fixed orphaned }) at line ${i+1} in ${fileName}`);
          }
        }
      }
      if (modified) {
        content = lines.join('\n');
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Fixed ${fileName}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing all syntax errors in TypeScript/JSX files...\n');
  
  // Find all TypeScript and JSX files
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts',
    'src/**/*.jsx',
  ];
  
  let allFiles = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: process.cwd() });
    allFiles = allFiles.concat(files);
  }
  
  console.log(`Found ${allFiles.length} files to check\n`);
  
  let fixedCount = 0;
  
  for (const file of allFiles) {
    const filePath = path.join(process.cwd(), file);
    const fixed = await fixFile(filePath);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
}

main().catch(console.error);