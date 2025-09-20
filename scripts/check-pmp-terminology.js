#!/usr/bin/env node

/**
 * PMP Terminology Pre-commit Hook Script
 * Checks staged files for terminology compliance before commit
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuration
const CONFIG = {
  // File extensions to check
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.md'],
  
  // Paths to ignore
  ignorePaths: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    'public',
    'test-results',
  ],
  
  // Maximum file size to check (in bytes)
  maxFileSize: 1024 * 1024, // 1MB
  
  // Severity levels that block commit
  blockingSeverities: ['error'],
  
  // Enable auto-fix
  enableAutofix: false,
  
  // Show suggestions
  showSuggestions: true,
  
  // Maximum issues to display
  maxIssuesDisplay: 20,
};

// Simple terminology rules (subset of full database for performance)
const TERMINOLOGY_RULES = [
  // Critical terms that must be correct
  {
    pattern: /\bproject\s+(lead|coordinator|admin)\b/gi,
    replacement: 'Project Manager',
    severity: 'error',
    message: 'Use "Project Manager" instead of project lead/coordinator/admin',
  },
  {
    pattern: /\bwork\s+breakdown(?!\s+structure)\b/gi,
    replacement: 'Work Breakdown Structure',
    severity: 'error',
    message: 'Use "Work Breakdown Structure" (WBS) not just "work breakdown"',
  },
  {
    pattern: /\bplanning\s+phase\b/gi,
    replacement: 'Planning Process Group',
    severity: 'warning',
    message: 'Use "Planning Process Group" instead of "planning phase"',
  },
  {
    pattern: /\binitiating\s+phase\b/gi,
    replacement: 'Initiating Process Group',
    severity: 'warning',
    message: 'Use "Initiating Process Group" instead of "initiating phase"',
  },
  {
    pattern: /\bexecuting\s+phase\b/gi,
    replacement: 'Executing Process Group',
    severity: 'warning',
    message: 'Use "Executing Process Group" instead of "executing phase"',
  },
  {
    pattern: /\bstakeholder\s+list\b/gi,
    replacement: 'Stakeholder Register',
    severity: 'error',
    message: 'Use "Stakeholder Register" instead of "stakeholder list"',
  },
  {
    pattern: /\brisk\s+list\b/gi,
    replacement: 'Risk Register',
    severity: 'error',
    message: 'Use "Risk Register" instead of "risk list"',
  },
  {
    pattern: /\bchange\s+order\b/gi,
    replacement: 'Change Request',
    severity: 'error',
    message: 'Use "Change Request" instead of "change order"',
  },
  {
    pattern: /\blessons\s+learnt\b/gi,
    replacement: 'Lessons Learned',
    severity: 'warning',
    message: 'Use "Lessons Learned" (US spelling) instead of "lessons learnt"',
  },
  {
    pattern: /\bbudgeted\s+value\b/gi,
    replacement: 'Planned Value',
    severity: 'error',
    message: 'Use "Planned Value (PV)" instead of "budgeted value"',
  },
  {
    pattern: /\breal\s+cost\b/gi,
    replacement: 'Actual Cost',
    severity: 'warning',
    message: 'Use "Actual Cost (AC)" instead of "real cost"',
  },
  {
    pattern: /\bPMBoK\b/g,
    replacement: 'PMBOK',
    severity: 'warning',
    message: 'Use "PMBOK" (all caps) for consistency',
  },
  {
    pattern: /\bpmi\b/g,
    replacement: 'PMI',
    severity: 'warning',
    message: 'Use "PMI" (all caps) for Project Management Institute',
  },
  {
    pattern: /\bbase\s+plan\b/gi,
    replacement: 'Baseline',
    severity: 'error',
    message: 'Use "Baseline" instead of "base plan"',
  },
  {
    pattern: /\btask\s+package\b/gi,
    replacement: 'Work Package',
    severity: 'error',
    message: 'Use "Work Package" instead of "task package"',
  },
];

// Main function
async function main() {
  console.log(`${colors.cyan}${colors.bright}🔍 PMP Terminology Check${colors.reset}`);
  console.log(`${colors.cyan}Checking staged files for PMBOK compliance...${colors.reset}\n`);

  try {
    // Get staged files
    const stagedFiles = await getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log(`${colors.green}✓ No files to check${colors.reset}`);
      process.exit(0);
    }

    console.log(`Found ${stagedFiles.length} staged file(s) to check\n`);

    // Check each file
    const allIssues = [];
    let errorCount = 0;
    let warningCount = 0;
    let filesWithIssues = 0;

    for (const file of stagedFiles) {
      const issues = await checkFile(file);
      
      if (issues.length > 0) {
        filesWithIssues++;
        allIssues.push({ file, issues });
        
        // Count by severity
        issues.forEach(issue => {
          if (issue.severity === 'error') errorCount++;
          else if (issue.severity === 'warning') warningCount++;
        });
      }
    }

    // Display results
    if (allIssues.length === 0) {
      console.log(`${colors.green}${colors.bright}✅ All files passed terminology check!${colors.reset}`);
      console.log(`${colors.green}No PMP terminology issues found.${colors.reset}\n`);
      process.exit(0);
    }

    // Show issues
    console.log(`${colors.bright}Issues found:${colors.reset}\n`);
    
    let displayedIssues = 0;
    for (const { file, issues } of allIssues) {
      console.log(`${colors.bright}${file}:${colors.reset}`);
      
      for (const issue of issues) {
        if (displayedIssues >= CONFIG.maxIssuesDisplay) {
          console.log(`  ${colors.yellow}... and ${allIssues.reduce((sum, f) => sum + f.issues.length, 0) - displayedIssues} more issues${colors.reset}`);
          break;
        }
        
        const severityColor = issue.severity === 'error' ? colors.red : colors.yellow;
        const severityIcon = issue.severity === 'error' ? '❌' : '⚠️';
        
        console.log(`  ${severityIcon} ${severityColor}Line ${issue.line}: ${issue.message}${colors.reset}`);
        console.log(`     Found: "${colors.red}${issue.found}${colors.reset}"`);
        console.log(`     Use:   "${colors.green}${issue.replacement}${colors.reset}"`);
        
        displayedIssues++;
      }
      
      console.log('');
      
      if (displayedIssues >= CONFIG.maxIssuesDisplay) break;
    }

    // Summary
    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  Files checked:    ${stagedFiles.length}`);
    console.log(`  Files with issues: ${filesWithIssues}`);
    console.log(`  ${colors.red}Errors:   ${errorCount}${colors.reset}`);
    console.log(`  ${colors.yellow}Warnings: ${warningCount}${colors.reset}\n`);

    // Check if commit should be blocked
    if (errorCount > 0) {
      console.log(`${colors.red}${colors.bright}❌ Commit blocked due to terminology errors${colors.reset}`);
      console.log(`${colors.red}Please fix the errors above before committing.${colors.reset}\n`);
      
      // Provide helpful suggestions
      console.log(`${colors.cyan}💡 Tips:${colors.reset}`);
      console.log(`  • Review the PMBOK Guide for correct terminology`);
      console.log(`  • Check the project glossary at /glossary`);
      console.log(`  • Run 'npm run terminology:fix' to auto-fix some issues`);
      console.log(`  • Use 'git commit --no-verify' to skip this check (not recommended)\n`);
      
      process.exit(1);
    }

    if (warningCount > 0) {
      console.log(`${colors.yellow}⚠️  Commit allowed with warnings${colors.reset}`);
      console.log(`${colors.yellow}Consider fixing the warnings for better consistency.${colors.reset}\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}Error during terminology check:${colors.reset}`, error);
    // Don't block commit on script errors
    process.exit(0);
  }
}

// Get list of staged files
async function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8'
    });
    
    return output
      .split('\n')
      .filter(file => file.trim())
      .filter(file => {
        const ext = path.extname(file);
        return CONFIG.extensions.includes(ext);
      })
      .filter(file => {
        return !CONFIG.ignorePaths.some(ignorePath => 
          file.includes(ignorePath)
        );
      });
  } catch (error) {
    return [];
  }
}

// Check a single file for terminology issues
async function checkFile(filePath) {
  const issues = [];
  
  try {
    // Get file content from git (staged version)
    const content = execSync(`git show :${filePath}`, {
      encoding: 'utf-8',
      maxBuffer: CONFIG.maxFileSize
    });
    
    const lines = content.split('\n');
    
    // Check each line against rules
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Skip certain lines
      if (shouldSkipLine(line, filePath)) continue;
      
      // Check each rule
      for (const rule of TERMINOLOGY_RULES) {
        let match;
        while ((match = rule.pattern.exec(line)) !== null) {
          issues.push({
            line: lineNum + 1,
            column: match.index + 1,
            found: match[0],
            replacement: rule.replacement,
            severity: rule.severity,
            message: rule.message,
          });
        }
      }
    }
  } catch (error) {
    // File might be new or binary, skip it
    if (error.message.includes('does not exist')) {
      // Try to read the actual file for new files
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return checkContent(content);
      } catch {
        return [];
      }
    }
  }
  
  return issues;
}

// Check content directly (for new files)
function checkContent(content) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    
    if (shouldSkipLine(line)) continue;
    
    for (const rule of TERMINOLOGY_RULES) {
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        issues.push({
          line: lineNum + 1,
          column: match.index + 1,
          found: match[0],
          replacement: rule.replacement,
          severity: rule.severity,
          message: rule.message,
        });
      }
    }
  }
  
  return issues;
}

// Determine if a line should be skipped
function shouldSkipLine(line, filePath = '') {
  // Skip empty lines
  if (!line.trim()) return true;
  
  // Skip import/export statements
  if (/^\s*(import|export)\s/.test(line)) return true;
  
  // Skip URLs
  if (/https?:\/\//.test(line)) return true;
  
  // Skip lines that look like file paths
  if (/[\/\\][\w-]+\.\w+/.test(line)) return true;
  
  // Skip long base64 or hash strings
  if (/[a-zA-Z0-9]{40,}/.test(line)) return true;
  
  // Skip code comments in certain files
  if (filePath.endsWith('.json')) return true;
  
  return false;
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { checkFile, checkContent, TERMINOLOGY_RULES };