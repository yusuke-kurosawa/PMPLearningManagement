#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    
    // Pattern 1: }, []) が行末にある場合の修正
    const pattern1 = /\}, \[\]\)$/gm;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '}');
      modified = true;
      console.log(`Fixed pattern "}, [])" at end of line in ${filePath}`);
    }
    
    // Pattern 2: style={{ ... }}, []) のような誤った構文
    const pattern2 = /style=\{\{[^}]+\}\}, \[\]\)/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, (match) => {
        return match.replace(', [])', '}');
      });
      modified = true;
      console.log(`Fixed style pattern in ${filePath}`);
    }
    
    // Pattern 3: 関数定義の最後に誤った }, []) がある場合
    const pattern3 = /(\s+\})\s*,\s*\[\]\)\s*$/gm;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, '$1');
      modified = true;
      console.log(`Fixed function closing pattern in ${filePath}`);
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing JSX/TSX syntax errors...\n');
  
  const targetFiles = [
    'src/components/visualizations/MindMapView.tsx',
    'src/components/visualizations/EnhancedNetworkGraph.tsx',
    'src/components/visualizations/ProcessFlowDiagram.tsx',
    'src/components/visualizations/KnowledgeAreaHeatmap.tsx',
    'src/components/visualizations/ProcessHeatmap.tsx',
  ];
  
  let fixedCount = 0;
  
  for (const file of targetFiles) {
    const filePath = path.join(process.cwd(), file);
    const fixed = await fixFile(filePath);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
}

main().catch(console.error);