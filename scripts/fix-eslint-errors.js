#!/usr/bin/env node

/**
 * ESLint Error Auto-Fixer
 * Automatically fixes common ESLint errors and warnings in the codebase
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '..', 'src'),
  extensions: ['.js', '.jsx'],
  fixPatterns: {
    // Remove unused imports
    unusedImports: {
      pattern: /^import\s+{[^}]*}\s+from\s+['"][^'"]+['"]/gm,
      handler: 'removeUnusedImports'
    },
    // Remove unused variables
    unusedVars: {
      pattern: /const\s+\[[^\]]*\]\s*=|const\s+{[^}]*}\s*=|const\s+\w+\s*=/g,
      handler: 'removeUnusedVars'
    }
  }
};

class ESLintFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      errorsFixed: 0,
      warningsFixed: 0,
      filesModified: 0
    };
  }

  async run() {
    console.log('🔧 Starting ESLint Error Auto-Fixer...\n');
    
    // Step 1: Run ESLint with auto-fix
    await this.runESLintAutoFix();
    
    // Step 2: Get remaining errors
    const errors = await this.getESLintErrors();
    
    // Step 3: Fix specific patterns
    await this.fixSpecificPatterns(errors);
    
    // Step 4: Report results
    this.reportResults();
  }

  async runESLintAutoFix() {
    console.log('📝 Running ESLint auto-fix...');
    try {
      await execAsync('npx eslint src --ext .js,.jsx --fix');
      console.log('✅ ESLint auto-fix completed\n');
    } catch (error) {
      // ESLint returns non-zero exit code if there are unfixed issues
      console.log('⚠️  ESLint auto-fix completed with remaining issues\n');
    }
  }

  async getESLintErrors() {
    console.log('🔍 Analyzing remaining ESLint issues...');
    try {
      const { stdout } = await execAsync('npx eslint src --ext .js,.jsx --format json');
      const results = JSON.parse(stdout);
      
      const errors = [];
      results.forEach(file => {
        if (file.messages.length > 0) {
          file.messages.forEach(message => {
            errors.push({
              file: file.filePath,
              line: message.line,
              column: message.column,
              ruleId: message.ruleId,
              message: message.message,
              severity: message.severity
            });
          });
        }
      });
      
      console.log(`Found ${errors.length} remaining issues\n`);
      return errors;
    } catch (error) {
      // If ESLint fails, return empty array
      return [];
    }
  }

  async fixSpecificPatterns(errors) {
    console.log('🛠️  Fixing specific patterns...\n');
    
    const fileGroups = this.groupErrorsByFile(errors);
    
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      await this.fixFile(filePath, fileErrors);
    }
  }

  groupErrorsByFile(errors) {
    const groups = {};
    errors.forEach(error => {
      if (!groups[error.file]) {
        groups[error.file] = [];
      }
      groups[error.file].push(error);
    });
    return groups;
  }

  async fixFile(filePath, errors) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      
      // Fix unused imports
      const unusedImportErrors = errors.filter(e => 
        e.ruleId === '@typescript-eslint/no-unused-vars' && 
        e.message.includes('is defined but never used')
      );
      
      if (unusedImportErrors.length > 0) {
        content = await this.removeUnusedImports(content, unusedImportErrors);
        modified = true;
      }
      
      // Fix unused variables (destructuring)
      const unusedVarErrors = errors.filter(e => 
        e.ruleId === '@typescript-eslint/no-unused-vars' && 
        e.message.includes('is assigned a value but never used')
      );
      
      if (unusedVarErrors.length > 0) {
        content = await this.removeUnusedVariables(content, unusedVarErrors);
        modified = true;
      }
      
      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        this.stats.filesModified++;
        console.log(`✅ Fixed: ${path.basename(filePath)}`);
      }
      
      this.stats.filesProcessed++;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  async removeUnusedImports(content, errors) {
    const lines = content.split('\n');
    const unusedIdentifiers = new Set();
    
    // Collect all unused identifiers
    errors.forEach(error => {
      const match = error.message.match(/'([^']+)'/);
      if (match) {
        unusedIdentifiers.add(match[1]);
      }
    });
    
    // Process each line
    const processedLines = lines.map(line => {
      // Check if line is an import statement
      if (line.trim().startsWith('import')) {
        let modifiedLine = line;
        
        // Remove unused named imports
        unusedIdentifiers.forEach(identifier => {
          // Handle named imports
          modifiedLine = modifiedLine.replace(
            new RegExp(`\\b${identifier}\\s*,?\\s*`, 'g'),
            ''
          );
        });
        
        // Clean up empty imports
        modifiedLine = modifiedLine.replace(/{\s*,?\s*}/g, '{}');
        modifiedLine = modifiedLine.replace(/,\s*,/g, ',');
        modifiedLine = modifiedLine.replace(/{\s*,/g, '{');
        modifiedLine = modifiedLine.replace(/,\s*}/g, '}');
        
        // Remove import line if it's empty
        if (modifiedLine.includes('{}') && !modifiedLine.includes('* as')) {
          const hasDefault = /import\s+\w+\s+from/.test(modifiedLine);
          if (!hasDefault) {
            return ''; // Remove the line
          }
          // Remove empty named imports but keep default
          modifiedLine = modifiedLine.replace(/,?\s*{\s*}\s*/, '');
        }
        
        this.stats.warningsFixed++;
        return modifiedLine;
      }
      
      return line;
    });
    
    // Remove empty lines created by removing imports
    return processedLines
      .filter((line, index, array) => {
        // Keep line if it's not empty or if it's not surrounded by empty lines
        if (line.trim() !== '') return true;
        if (index === 0) return false;
        if (index === array.length - 1) return false;
        return array[index - 1].trim() !== '' || array[index + 1].trim() !== '';
      })
      .join('\n');
  }

  async removeUnusedVariables(content, errors) {
    errors.forEach(error => {
      const match = error.message.match(/'([^']+)'/);
      if (match) {
        const varName = match[1];
        
        // Handle destructuring assignments
        const destructuringPattern = new RegExp(
          `(const|let|var)\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*=`,
          'g'
        );
        
        content = content.replace(destructuringPattern, (match) => {
          // Remove the variable from destructuring
          let modified = match.replace(
            new RegExp(`\\b${varName}\\s*(?::[^,}]+)?\\s*,?\\s*`, 'g'),
            ''
          );
          
          // Clean up commas
          modified = modified.replace(/,\s*,/g, ',');
          modified = modified.replace(/{\s*,/g, '{');
          modified = modified.replace(/,\s*}/g, '}');
          
          this.stats.warningsFixed++;
          return modified;
        });
        
        // Handle array destructuring
        const arrayPattern = new RegExp(
          `(const|let|var)\\s*\\[[^\\]]*\\b${varName}\\b[^\\]]*\\]\\s*=`,
          'g'
        );
        
        content = content.replace(arrayPattern, (match) => {
          // Replace variable with underscore
          const modified = match.replace(
            new RegExp(`\\b${varName}\\b`, 'g'),
            '_' + varName
          );
          
          this.stats.warningsFixed++;
          return modified;
        });
      }
    });
    
    return content;
  }

  reportResults() {
    console.log('\n📊 ESLint Fix Results:');
    console.log('═══════════════════════════════════════');
    console.log(`Files Processed: ${this.stats.filesProcessed}`);
    console.log(`Files Modified: ${this.stats.filesModified}`);
    console.log(`Warnings Fixed: ${this.stats.warningsFixed}`);
    console.log(`Errors Fixed: ${this.stats.errorsFixed}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('💡 Next Steps:');
    console.log('1. Run "npm run lint" to verify remaining issues');
    console.log('2. Manually review and fix any complex issues');
    console.log('3. Run tests to ensure functionality is preserved');
  }
}

// Run the fixer
const fixer = new ESLintFixer();
fixer.run().catch(console.error);