#!/usr/bin/env node

/**
 * Fix malformed import statements caused by logger migration
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match the malformed import
const malformedPattern = /import\s*{\s*\nimport\s*{\s*logger\s*}\s*from\s*['"].*\/logger['"]\s*\n/gm;

// Files with parsing errors related to imports
const filesWithErrors = [
  'src/components/learning/EnhancedFlashCardSystem.tsx',
  'src/components/mobile/MobileOptimizedApp.tsx',
  'src/components/pmbok/EnhancedPMBOKMatrix.tsx',
  'src/components/providers/PWAProvider.tsx',
  'src/components/simulator/ProjectSimulator.jsx',
  'src/components/visualizations/ITTONetworkDiagram.jsx',
  'src/components/visualizations/NetworkGraphControls.jsx',
  'src/components/visualizations/PerformanceMetrics.jsx',
  'src/components/visualizations/ProcessFlowDiagram.jsx',
  'src/components/visualizations/VisualizationHub.jsx',
  'src/hooks/useLocalStorage.js',
  'src/hooks/usePermissions.ts',
  'src/hooks/useUnifiedProgress.ts',
  'src/server/middleware/authMiddleware.ts',
  'src/server/monitoring/logger.ts',
  'src/server/monitoring/monitoring.ts',
  'src/server/routers/payment.ts',
  'src/server/services/encryptedUserService.ts',
];

let fixedCount = 0;
let errorCount = 0;

filesWithErrors.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Fix the malformed import pattern
    content = content.replace(malformedPattern, (match) => {
      // Extract the logger import path
      const loggerMatch = match.match(/from\s*['"](.*)\/logger['"]/);
      const loggerPath = loggerMatch ? loggerMatch[1] + '/logger' : '../services/logger';
      
      return `import { logger } from '${loggerPath}'\nimport {\n`;
    });
    
    // Alternative pattern for different formatting
    const altPattern = /import\s*{\s*import\s*{\s*logger\s*}\s*from\s*['"].*\/logger['"]/gm;
    content = content.replace(altPattern, (match) => {
      const loggerMatch = match.match(/from\s*['"](.*)\/logger['"]/);
      const loggerPath = loggerMatch ? loggerMatch[1] + '/logger' : '../services/logger';
      return `import { logger } from '${loggerPath}'\nimport {`;
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Total: ${filesWithErrors.length} files`);