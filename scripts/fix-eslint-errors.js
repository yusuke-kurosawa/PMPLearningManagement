#!/usr/bin/env node

/**
 * ESLint Error Auto-Fixer Script
 * 
 * This script automatically fixes common ESLint errors that cannot be auto-fixed by ESLint itself.
 * It handles:
 * - React display names
 * - Unnecessary escape characters
 * - Variable declarations (var to const/let)
 * - Global variables (gtag)
 * - Case declarations
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Fix React display name errors
 */
function fixDisplayNames(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Pattern for anonymous function components
  const patterns = [
    // memo(() => { ... })
    /React\.memo\(\(\) => \{/g,
    /memo\(\(\) => \{/g,
    // forwardRef((props, ref) => { ... })
    /React\.forwardRef\(\((.*?)\) => \{/g,
    /forwardRef\(\((.*?)\) => \{/g,
  ];

  // Add display names for memoized components
  fixed = fixed.replace(/const (\w+) = React\.memo\(\(\) => \{/g, (match, name) => {
    changes++;
    return `const ${name} = React.memo(function ${name}() {`;
  });

  fixed = fixed.replace(/const (\w+) = memo\(\(\) => \{/g, (match, name) => {
    changes++;
    return `const ${name} = memo(function ${name}() {`;
  });

  // Add display names for forwardRef components
  fixed = fixed.replace(/const (\w+) = React\.forwardRef\(\((.*?)\) => \{/g, (match, name, params) => {
    changes++;
    return `const ${name} = React.forwardRef(function ${name}(${params}) {`;
  });

  fixed = fixed.replace(/const (\w+) = forwardRef\(\((.*?)\) => \{/g, (match, name, params) => {
    changes++;
    return `const ${name} = forwardRef(function ${name}(${params}) {`;
  });

  if (changes > 0) {
    log(`  Fixed ${changes} display name issues in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Fix unnecessary escape characters
 */
function fixUnnecessaryEscapes(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Common unnecessary escapes
  const escapePatterns = [
    { pattern: /\\-/g, replacement: '-' },
    { pattern: /\\;/g, replacement: ';' },
    { pattern: /\\\./g, replacement: '.' },
    { pattern: /\\\"/g, replacement: '"' },
  ];

  escapePatterns.forEach(({ pattern, replacement }) => {
    const matches = fixed.match(pattern);
    if (matches) {
      changes += matches.length;
      fixed = fixed.replace(pattern, replacement);
    }
  });

  if (changes > 0) {
    log(`  Fixed ${changes} unnecessary escape characters in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Fix var declarations to let/const
 */
function fixVarDeclarations(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Replace var with let or const
  fixed = fixed.replace(/\bvar\s+(\w+)\s*=/g, (match, varName) => {
    changes++;
    // Use const by default, can be changed to let if needed
    return `const ${varName} =`;
  });

  if (changes > 0) {
    log(`  Fixed ${changes} var declarations in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Fix undefined gtag variable
 */
function fixGtagUndefined(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Check if gtag is used but not defined
  if (fixed.includes('gtag(') && !fixed.includes('declare global') && !fixed.includes('window.gtag')) {
    // Add global declaration for TypeScript files
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const declaration = `/* global gtag */\n`;
      if (!fixed.includes('/* global gtag */')) {
        fixed = declaration + fixed;
        changes++;
      }
    }
    
    // Replace gtag with window.gtag
    fixed = fixed.replace(/\bgtag\(/g, 'window.gtag(');
    changes++;
  }

  if (changes > 0) {
    log(`  Fixed gtag undefined issues in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Fix case declarations
 */
function fixCaseDeclarations(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Wrap case blocks with braces when they contain declarations
  const casePattern = /case\s+['"`]?[\w\s]+['"`]?\s*:\s*\n?\s*(const|let|var)\s+/g;
  
  fixed = fixed.replace(/case\s+(['"`]?[\w\s]+['"`]?)\s*:\s*\n?\s*(const|let|var)\s+(.*?)(?=case\s+|default\s*:|break\s*;|\})/gs, 
    (match, caseValue, declType, rest) => {
      if (!match.includes('{')) {
        changes++;
        return `case ${caseValue}: {\n    ${declType} ${rest}  }`;
      }
      return match;
    }
  );

  if (changes > 0) {
    log(`  Fixed ${changes} case declaration issues in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Fix require statements in TypeScript files
 */
function fixRequireStatements(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Only fix in TypeScript files
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    // Convert require to import for known modules
    const requirePattern = /const\s+(\w+)\s*=\s*require\(['"`](.*?)['"`]\)/g;
    
    fixed = fixed.replace(requirePattern, (match, varName, modulePath) => {
      changes++;
      return `import ${varName} from '${modulePath}'`;
    });

    // Handle destructured requires
    const destructuredPattern = /const\s+\{([^}]+)\}\s*=\s*require\(['"`](.*?)['"`]\)/g;
    
    fixed = fixed.replace(destructuredPattern, (match, vars, modulePath) => {
      changes++;
      return `import { ${vars} } from '${modulePath}'`;
    });
  }

  if (changes > 0) {
    log(`  Fixed ${changes} require statements in ${path.basename(filePath)}`, 'green');
  }

  return fixed;
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply fixes
    content = fixDisplayNames(content, filePath);
    content = fixUnnecessaryEscapes(content, filePath);
    content = fixVarDeclarations(content, filePath);
    content = fixGtagUndefined(content, filePath);
    content = fixCaseDeclarations(content, filePath);
    content = fixRequireStatements(content, filePath);

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    log(`  Error processing ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Get list of files with ESLint errors
 */
async function getFilesWithErrors() {
  try {
    const { stdout } = await execPromise('npx eslint src --ext .js,.jsx,.ts,.tsx --format json');
    const results = JSON.parse(stdout);
    
    return results
      .filter(file => file.errorCount > 0 || file.warningCount > 0)
      .map(file => file.filePath);
  } catch (error) {
    // ESLint exits with non-zero when there are errors, but we still get the output
    if (error.stdout) {
      const results = JSON.parse(error.stdout);
      return results
        .filter(file => file.errorCount > 0)
        .map(file => file.filePath);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  log('\n🔧 ESLint Error Auto-Fixer', 'cyan');
  log('=' .repeat(50), 'cyan');

  try {
    log('\n📋 Getting list of files with errors...', 'yellow');
    const files = await getFilesWithErrors();
    
    log(`\n📁 Found ${files.length} files with issues\n`, 'blue');

    let fixedCount = 0;
    for (const file of files) {
      log(`Processing: ${path.basename(file)}`, 'yellow');
      const wasFixed = await processFile(file);
      if (wasFixed) {
        fixedCount++;
      }
    }

    log('\n' + '=' .repeat(50), 'cyan');
    log(`\n✅ Fixed ${fixedCount} files`, 'green');

    // Run ESLint again to check remaining errors
    log('\n🔍 Running ESLint to check remaining issues...', 'yellow');
    try {
      const { stdout } = await execPromise('npx eslint src --ext .js,.jsx,.ts,.tsx --format compact | tail -5');
      console.log(stdout);
    } catch (error) {
      if (error.stdout) {
        console.log(error.stdout);
      }
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
main();