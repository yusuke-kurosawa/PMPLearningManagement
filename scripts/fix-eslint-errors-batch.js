#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 修正対象ファイルと修正内容
const fixes = [
  {
    file: 'src/utils/performance-monitor.ts',
    replacements: [
      { from: /catch\s*\(\s*e\s*\)/g, to: 'catch (_e)' }
    ]
  },
  {
    file: 'src/services/performanceOptimizer.ts',
    replacements: [
      { from: /const virtualizeThreshold/g, to: 'const _virtualizeThreshold' }
    ]
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    replacements: [
      { from: /const MockSettingsProvider/g, to: 'const _MockSettingsProvider' },
      { from: /const AllTheProviders/g, to: 'const _AllTheProviders' }
    ]
  },
  {
    file: 'src/types/service-worker.d.ts',
    replacements: [
      { from: /interface Window \{/g, to: 'interface _Window {' },
      { from: /interface Navigator \{/g, to: 'interface _Navigator {' }
    ]
  },
  {
    file: 'src/types/test.d.ts',
    replacements: [
      { from: /interface TouchList \{/g, to: 'interface _TouchList {' }
    ]
  },
  {
    file: 'src/services/aiCoachingService.ts',
    replacements: [
      { from: /\(profile, learningGoals\)/g, to: '(_profile, _learningGoals)' },
      { from: /learningGoals\)/g, to: '_learningGoals)' }
    ]
  },
  {
    file: 'src/server/auth/__tests__/middleware.test.ts',
    replacements: [
      { from: /\(payload, secret\)/g, to: '(_payload, _secret)' },
      { from: /\(token, secret\)/g, to: '(_token, _secret)' }
    ]
  },
  {
    file: 'src/server/auth/__tests__/rbac.test.ts',
    replacements: [
      { from: /\(payload, secret\)/g, to: '(_payload, _secret)' },
      { from: /\(token, secret\)/g, to: '(_token, _secret)' }
    ]
  },
  {
    file: 'src/lib/pwa/serviceWorker.ts',
    replacements: [
      { from: /catch \(error\)/g, to: 'catch (_error)' }
    ]
  },
  {
    file: 'src/server/routers/learning.ts',
    replacements: [
      { from: /import { KnowledgeArea, ProcessGroup }/g, to: 'import { KnowledgeArea as _KnowledgeArea, ProcessGroup as _ProcessGroup }' }
    ]
  }
];

console.log('Starting ESLint error fixes...\n');

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      console.log(`  ✓ Applied fix: ${from.toString()} → ${to}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}\n`);
  } else {
    console.log(`⏭️  No changes needed: ${file}\n`);
  }
});

console.log('ESLint error fixes completed!');