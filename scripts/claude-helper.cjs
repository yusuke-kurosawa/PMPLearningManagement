#!/usr/bin/env node
/**
 * Claude Assistant Helper Script
 * PMPLearningManagement Project
 * 
 * Description: Local helper script for interacting with Claude Assistant workflows
 * 
 * Features:
 * - Trigger Claude analysis locally
 * - Test Claude prompts
 * - Generate context for Claude workflows  
 * - Monitor Claude workflow executions
 * 
 * Usage:
 *   node scripts/claude-helper.js analyze [files]
 *   node scripts/claude-helper.js test-prompt "your question"
 *   node scripts/claude-helper.js monitor
 *   node scripts/claude-helper.js context [scope]
 * 
 * Author: Claude Assistant
 * Created: 2025-08-30
 * @category Scripts
 * @subcategory Development Tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFileSize: 50 * 1024, // 50KB
  maxFiles: 20,
  supportedExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml'],
  claudeModel: 'claude-3-5-sonnet-20241022',
  projectName: 'PMPLearningManagement'
};

/**
 * Main CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    showHelp();
    return;
  }

  switch (command) {
    case 'analyze':
      analyzeFiles(args.slice(1));
      break;
    case 'test-prompt':
      testPrompt(args.slice(1).join(' '));
      break;
    case 'monitor':
      monitorWorkflows();
      break;
    case 'context':
      generateContext(args[1]);
      break;
    case 'workflows':
      listClaudeWorkflows();
      break;
    case 'status':
      showClaudeStatus();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🤖 Claude Assistant Helper v2.1.0

Usage: node scripts/claude-helper.js <command> [options]

Commands:
  analyze [files...]     Analyze specified files or changed files
  test-prompt <text>     Test a prompt with current project context  
  monitor               Monitor Claude workflow executions
  context [scope]       Generate context file for Claude workflows
  workflows            List all Claude-related workflows
  status               Show Claude integration status

Examples:
  node scripts/claude-helper.js analyze src/components/Home.jsx
  node scripts/claude-helper.js test-prompt "Review this component for performance"
  node scripts/claude-helper.js context changed-files
  node scripts/claude-helper.js monitor

For more information, visit: https://github.com/yusuke-kurosawa/PMPLearningManagement
  `);
}

/**
 * Analyze specified files or detect changed files
 */
function analyzeFiles(files) {
  console.log('🔍 Claude Analysis Helper');
  console.log('========================');

  try {
    let targetFiles = files;

    // If no files specified, get changed files from git
    if (files.length === 0) {
      console.log('📁 No files specified, detecting changed files...');
      try {
        const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
        targetFiles = gitOutput.trim().split('\n').filter(f => f);
        console.log(`📋 Found ${targetFiles.length} changed files`);
      } catch (error) {
        console.log('⚠️ Could not detect changed files, analyzing recent modifications...');
        targetFiles = getRecentlyModifiedFiles();
      }
    }

    if (targetFiles.length === 0) {
      console.log('ℹ️ No files to analyze');
      return;
    }

    // Filter and validate files
    const validFiles = targetFiles
      .filter(file => fs.existsSync(file))
      .filter(file => {
        const ext = path.extname(file);
        return CONFIG.supportedExtensions.includes(ext);
      })
      .filter(file => {
        const stats = fs.statSync(file);
        return stats.size <= CONFIG.maxFileSize;
      })
      .slice(0, CONFIG.maxFiles);

    if (validFiles.length === 0) {
      console.log('❌ No valid files found for analysis');
      return;
    }

    console.log(`📊 Analyzing ${validFiles.length} files:`);
    validFiles.forEach(file => console.log(`  • ${file}`));

    // Generate context
    const context = generateAnalysisContext(validFiles);
    
    // Save context file
    const contextFile = 'claude-analysis-context.json';
    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
    
    console.log(`\n✅ Analysis context saved to: ${contextFile}`);
    console.log(`📊 Context size: ${(JSON.stringify(context).length / 1024).toFixed(1)}KB`);
    
    // Show summary
    console.log('\n📋 Analysis Summary:');
    console.log(`  • Files: ${validFiles.length}`);
    console.log(`  • Total lines: ${context.metrics.totalLines}`);
    console.log(`  • File types: ${Array.from(context.metrics.fileTypes).join(', ')}`);
    console.log(`  • Complexity: ${assessComplexity(context.metrics)}`);
    
    // Suggest next steps
    console.log('\n🚀 Next Steps:');
    console.log('  1. Push changes to trigger Claude workflows');
    console.log('  2. Or mention @claude in a PR/Issue comment');
    console.log('  3. Or run: gh workflow run claude-enhanced.yml');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test a prompt with current project context
 */
function testPrompt(promptText) {
  if (!promptText) {
    console.log('❌ Please provide a prompt to test');
    return;
  }

  console.log('🧪 Claude Prompt Tester');
  console.log('=======================');
  console.log(`📝 Prompt: ${promptText}`);

  // Generate basic context
  const context = {
    project: CONFIG.projectName,
    timestamp: new Date().toISOString(),
    prompt: promptText,
    environment: 'local-test',
    cwd: process.cwd()
  };

  // Add git information if available
  try {
    context.git = {
      branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
      commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7),
      status: execSync('git status --porcelain', { encoding: 'utf8' }).trim()
    };
  } catch (error) {
    console.log('⚠️ Git information not available');
  }

  // Save test context
  const testFile = 'claude-prompt-test.json';
  fs.writeFileSync(testFile, JSON.stringify(context, null, 2));

  console.log(`✅ Test context saved to: ${testFile}`);
  console.log('\n📋 Context Summary:');
  console.log(`  • Project: ${context.project}`);
  console.log(`  • Branch: ${context.git?.branch || 'unknown'}`);
  console.log(`  • Commit: ${context.git?.commit || 'unknown'}`);
  console.log('\n💡 To test this prompt with Claude:');
  console.log('  1. Create an issue or PR');
  console.log(`  2. Comment: @claude ${promptText}`);
}

/**
 * Monitor Claude workflow executions
 */
function monitorWorkflows() {
  console.log('👀 Claude Workflow Monitor');
  console.log('==========================');

  try {
    // Get recent workflow runs
    console.log('📊 Fetching recent Claude workflows...');
    const workflows = execSync(
      'gh run list --workflow="claude" --limit=10 --json databaseId,name,status,conclusion,createdAt,event', 
      { encoding: 'utf8' }
    );
    
    const runs = JSON.parse(workflows);
    
    if (runs.length === 0) {
      console.log('ℹ️ No Claude workflows found');
      return;
    }

    console.log(`\n📋 Recent Claude Workflow Runs (${runs.length}):\n`);
    
    runs.forEach((run, index) => {
      const status = getStatusIcon(run.status, run.conclusion);
      const date = new Date(run.createdAt).toLocaleString();
      const event = run.event.padEnd(15);
      
      console.log(`${String(index + 1).padStart(2)}. ${status} ${event} ${date} (ID: ${run.databaseId})`);
    });

    console.log('\n🚀 Quick Actions:');
    console.log('  • View details: gh run view <ID>');
    console.log('  • Download logs: gh run download <ID>');
    console.log('  • Trigger manually: gh workflow run claude-enhanced.yml');

  } catch (error) {
    console.log('❌ Could not fetch workflow information:', error.message);
    console.log('💡 Make sure GitHub CLI is installed and authenticated');
  }
}

/**
 * Generate context for Claude workflows
 */
function generateContext(scope = 'auto') {
  console.log('🧠 Claude Context Generator');
  console.log('===========================');

  let files = [];
  
  switch (scope) {
    case 'changed-files':
      try {
        const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
        files = gitOutput.trim().split('\n').filter(f => f);
        console.log(`📋 Detected ${files.length} changed files`);
      } catch (error) {
        console.log('⚠️ Could not detect changed files');
        files = [];
      }
      break;
      
    case 'modified-recently':
      files = getRecentlyModifiedFiles();
      console.log(`📋 Found ${files.length} recently modified files`);
      break;
      
    case 'all-source':
      files = getAllSourceFiles();
      console.log(`📋 Found ${files.length} source files`);
      break;
      
    default:
      // Auto-detect best scope
      try {
        const gitOutput = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
        files = gitOutput.trim().split('\n').filter(f => f);
        if (files.length === 0) {
          files = getRecentlyModifiedFiles();
          scope = 'modified-recently';
        } else {
          scope = 'changed-files';
        }
      } catch (error) {
        files = getRecentlyModifiedFiles();
        scope = 'modified-recently';
      }
  }

  const context = generateAnalysisContext(files);
  context.scope = scope;
  
  const contextFile = `claude-context-${scope}.json`;
  fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
  
  console.log(`✅ Context generated: ${contextFile}`);
  console.log(`📊 Context size: ${(JSON.stringify(context).length / 1024).toFixed(1)}KB`);
  console.log(`🎯 Scope: ${scope}`);
  console.log(`📁 Files: ${files.length}`);
}

/**
 * List all Claude-related workflows
 */
function listClaudeWorkflows() {
  console.log('📋 Claude Workflow Inventory');
  console.log('============================');

  const workflowsDir = '.github/workflows';
  if (!fs.existsSync(workflowsDir)) {
    console.log('❌ No workflows directory found');
    return;
  }

  const workflowFiles = fs.readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(workflowsDir, file));

  const claudeWorkflows = [];

  workflowFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('claude') || content.includes('Claude') || content.includes('CLAUDE')) {
        const lines = content.split('\n');
        const nameLine = lines.find(line => line.startsWith('name:'));
        const name = nameLine ? nameLine.replace('name:', '').trim().replace(/['"]/g, '') : path.basename(file);
        
        claudeWorkflows.push({
          file: path.basename(file),
          name,
          path: file,
          size: fs.statSync(file).size
        });
      }
    } catch (error) {
      console.log(`⚠️ Could not read ${file}: ${error.message}`);
    }
  });

  console.log(`\n🤖 Found ${claudeWorkflows.length} Claude-related workflows:\n`);

  claudeWorkflows.forEach((workflow, index) => {
    console.log(`${String(index + 1).padStart(2)}. ${workflow.name}`);
    console.log(`    📁 File: ${workflow.file}`);
    console.log(`    📊 Size: ${(workflow.size / 1024).toFixed(1)}KB\n`);
  });

  if (claudeWorkflows.length > 0) {
    console.log('🚀 Quick Actions:');
    console.log('  • View workflow: gh workflow view <file>');
    console.log('  • Run workflow: gh workflow run <file>');
    console.log('  • List runs: gh run list --workflow=<file>');
  }
}

/**
 * Show Claude integration status
 */
function showClaudeStatus() {
  console.log('🎯 Claude Integration Status');
  console.log('============================');

  // Check for required files
  const requiredFiles = [
    '.github/workflows/claude.yml',
    '.github/workflows/claude-enhanced.yml',
    '.github/workflows/04-integration-ai-claude.yml'
  ];

  console.log('\n📁 Workflow Files:');
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
    
    if (exists) {
      const size = fs.statSync(file).size;
      console.log(`      Size: ${(size / 1024).toFixed(1)}KB`);
    }
  });

  // Check for environment setup
  console.log('\n🔧 Environment Check:');
  const checks = [
    { name: 'GitHub CLI', command: 'gh --version' },
    { name: 'Git Repository', command: 'git status' },
    { name: 'Node.js', command: 'node --version' },
    { name: 'NPM', command: 'npm --version' }
  ];

  checks.forEach(check => {
    try {
      execSync(check.command, { stdio: 'ignore' });
      console.log(`  ✅ ${check.name}`);
    } catch (error) {
      console.log(`  ❌ ${check.name}`);
    }
  });

  // Show recent activity
  console.log('\n🕐 Recent Activity:');
  try {
    const recentRuns = execSync(
      'gh run list --limit=3 --json name,status,conclusion,createdAt', 
      { encoding: 'utf8' }
    );
    const runs = JSON.parse(recentRuns);
    
    if (runs.length === 0) {
      console.log('  ℹ️ No recent workflow runs');
    } else {
      runs.forEach(run => {
        const status = getStatusIcon(run.status, run.conclusion);
        const date = new Date(run.createdAt).toLocaleDateString();
        console.log(`  ${status} ${run.name} (${date})`);
      });
    }
  } catch (error) {
    console.log('  ⚠️ Could not fetch recent activity');
  }

  console.log('\n💡 Next Steps:');
  console.log('  1. Ensure ANTHROPIC_API_KEY is set in repository secrets');
  console.log('  2. Test Claude by mentioning @claude in an issue comment');
  console.log('  3. Monitor workflows with: node scripts/claude-helper.js monitor');
}

// Helper Functions
// ================

/**
 * Generate analysis context from files
 */
function generateAnalysisContext(files) {
  const context = {
    project: CONFIG.projectName,
    timestamp: new Date().toISOString(),
    files: [],
    metrics: {
      totalLines: 0,
      totalFiles: files.length,
      fileTypes: new Set(),
      avgFileSize: 0,
      complexity: 'unknown'
    }
  };

  const validFiles = files
    .filter(file => fs.existsSync(file))
    .filter(file => {
      const stats = fs.statSync(file);
      return stats.size <= CONFIG.maxFileSize;
    })
    .slice(0, CONFIG.maxFiles);

  let totalSize = 0;

  validFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const size = content.length;
      const ext = path.extname(filePath);

      context.files.push({
        path: filePath,
        content: content,
        lines: lines,
        size: size,
        extension: ext
      });

      context.metrics.totalLines += lines;
      context.metrics.fileTypes.add(ext);
      totalSize += size;
    } catch (error) {
      console.log(`⚠️ Could not read file: ${filePath}`);
    }
  });

  context.metrics.avgFileSize = validFiles.length > 0 ? Math.round(totalSize / validFiles.length) : 0;
  context.metrics.fileTypes = Array.from(context.metrics.fileTypes);
  context.metrics.complexity = assessComplexity(context.metrics);

  return context;
}

/**
 * Get recently modified files
 */
function getRecentlyModifiedFiles() {
  const files = [];
  
  const searchDirs = ['src', 'scripts', 'docs'];
  
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const dirFiles = walkDir(dir)
        .filter(file => {
          const ext = path.extname(file);
          return CONFIG.supportedExtensions.includes(ext);
        })
        .filter(file => {
          const stats = fs.statSync(file);
          const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
          return hoursSinceModified < 168; // Last week
        })
        .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)
        .slice(0, 10);
      
      files.push(...dirFiles);
    }
  });
  
  return files;
}

/**
 * Get all source files
 */
function getAllSourceFiles() {
  const files = [];
  const searchDirs = ['src'];
  
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const dirFiles = walkDir(dir)
        .filter(file => {
          const ext = path.extname(file);
          return CONFIG.supportedExtensions.includes(ext);
        })
        .slice(0, CONFIG.maxFiles);
      
      files.push(...dirFiles);
    }
  });
  
  return files;
}

/**
 * Recursively walk directory
 */
function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...walkDir(fullPath));
    } else if (stats.isFile()) {
      files.push(fullPath);
    }
  });
  
  return files;
}

/**
 * Assess complexity based on metrics
 */
function assessComplexity(metrics) {
  const avgLines = metrics.totalLines / (metrics.totalFiles || 1);
  const typeCount = metrics.fileTypes.length;
  
  if (avgLines > 200 || typeCount > 4) return 'high';
  if (avgLines > 100 || typeCount > 2) return 'medium';
  return 'low';
}

/**
 * Get status icon for workflow status
 */
function getStatusIcon(status, conclusion) {
  if (status === 'completed') {
    switch (conclusion) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'cancelled': return '⚠️';
      default: return '❓';
    }
  }
  return status === 'in_progress' ? '🟡' : '⚪';
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateAnalysisContext,
  assessComplexity,
  CONFIG
};