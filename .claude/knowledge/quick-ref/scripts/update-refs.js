#!/usr/bin/env node

/**
 * Auto-update Quick Reference Documentation
 * Syncs references with codebase changes
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '../../..')
const quickRefDir = join(__dirname, '..')

// Reference update configurations
const updateConfigs = [
  {
    file: 'commands.md',
    sources: [
      { path: 'package.json', type: 'npm-scripts' },
      { path: '.github/workflows', type: 'github-actions' },
      { path: 'scripts', type: 'shell-scripts' },
    ],
  },
  {
    file: 'file-locations.md',
    sources: [
      { path: 'src', type: 'directory-tree' },
      { path: 'prisma', type: 'directory-tree' },
      { path: '.github', type: 'directory-tree' },
    ],
  },
  {
    file: 'apis.md',
    sources: [
      { path: 'src/services', type: 'api-services' },
      { path: 'docs/api', type: 'api-docs' },
    ],
  },
  {
    file: 'workflows.md',
    sources: [{ path: '.github/workflows', type: 'workflow-files' }],
  },
  {
    file: 'environment.md',
    sources: [
      { path: '.env.example', type: 'env-file' },
      { path: '.env.development', type: 'env-file' },
    ],
  },
]

// Extract NPM scripts
function extractNpmScripts() {
  const packagePath = join(projectRoot, 'package.json')
  if (!existsSync(packagePath)) return []

  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
  const scripts = packageJson.scripts || {}

  return Object.entries(scripts).map(([name, command]) => ({
    name: `npm run ${name}`,
    command,
    category: categorizeScript(name),
    description: getScriptDescription(name),
  }))
}

// Categorize scripts
function categorizeScript(name) {
  if (name.includes('test')) return 'Testing'
  if (name.includes('build') || name.includes('compile')) return 'Build'
  if (name.includes('dev') || name.includes('start')) return 'Development'
  if (name.includes('deploy')) return 'Deployment'
  if (name.includes('lint') || name.includes('format')) return 'Code Quality'
  if (name.includes('db') || name.includes('prisma')) return 'Database'
  if (name.includes('docker')) return 'Docker'
  return 'Other'
}

// Get script description
function getScriptDescription(name) {
  const descriptions = {
    dev: 'Start development server',
    build: 'Build for production',
    test: 'Run tests',
    deploy: 'Deploy to production',
    lint: 'Run ESLint',
    format: 'Format code with Prettier',
    'db:migrate': 'Run database migrations',
    'docker:build': 'Build Docker image',
  }
  return descriptions[name] || ''
}

// Extract GitHub Actions
function extractGitHubActions() {
  const workflowsDir = join(projectRoot, '.github/workflows')
  if (!existsSync(workflowsDir)) return []

  const workflows = []
  const files = readdirSync(workflowsDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))

  files.forEach((file) => {
    const content = readFileSync(join(workflowsDir, file), 'utf-8')
    const lines = content.split('\n')

    let name = ''
    const jobs = []

    lines.forEach((line) => {
      if (line.startsWith('name:')) {
        name = line.replace('name:', '').trim()
      }
      if (line.includes('run:')) {
        const command = line.replace('run:', '').trim()
        if (command && !command.startsWith('#')) {
          jobs.push(command)
        }
      }
    })

    workflows.push({
      file,
      name,
      commands: jobs,
    })
  })

  return workflows
}

// Get directory structure
function getDirectoryStructure(dir, level = 0, maxLevel = 3) {
  if (!existsSync(dir) || level > maxLevel) return []

  const items = []
  const entries = readdirSync(dir, { withFileTypes: true })

  entries.forEach((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return

    const path = join(dir, entry.name)
    const relativePath = path.replace(projectRoot, '')

    items.push({
      name: entry.name,
      path: relativePath,
      type: entry.isDirectory() ? 'directory' : 'file',
      level,
    })

    if (entry.isDirectory() && level < maxLevel) {
      items.push(...getDirectoryStructure(path, level + 1, maxLevel))
    }
  })

  return items
}

// Update reference file
function updateReferenceFile(config) {
  console.log(`Updating ${config.file}...`)

  const filePath = join(quickRefDir, config.file)
  if (!existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${config.file}`)
    return
  }

  let content = readFileSync(filePath, 'utf-8')
  const originalContent = content

  // Add update timestamp
  const timestamp = new Date().toISOString()
  content = content.replace(/Last (?:update|updated|sync|synced): .*/g, `Last update: ${timestamp}`)

  // Update based on source type
  config.sources.forEach((source) => {
    switch (source.type) {
      case 'npm-scripts':
        const scripts = extractNpmScripts()
        console.log(`  Found ${scripts.length} npm scripts`)
        break

      case 'github-actions':
        const workflows = extractGitHubActions()
        console.log(`  Found ${workflows.length} workflows`)
        break

      case 'directory-tree':
        const structure = getDirectoryStructure(join(projectRoot, source.path))
        console.log(`  Found ${structure.length} files/directories in ${source.path}`)
        break
    }
  })

  // Write updated content if changed
  if (content !== originalContent) {
    writeFileSync(filePath, content)
    console.log(`  ✅ Updated ${config.file}`)
  } else {
    console.log(`  ℹ️  No changes needed for ${config.file}`)
  }
}

// Generate statistics
function generateStatistics() {
  const stats = {
    totalCommands: 0,
    totalFiles: 0,
    categories: {},
    lastUpdate: new Date().toISOString(),
  }

  // Count commands
  const scripts = extractNpmScripts()
  stats.totalCommands = scripts.length

  // Count by category
  scripts.forEach((script) => {
    stats.categories[script.category] = (stats.categories[script.category] || 0) + 1
  })

  // Count files
  const srcStructure = getDirectoryStructure(join(projectRoot, 'src'))
  stats.totalFiles = srcStructure.filter((item) => item.type === 'file').length

  return stats
}

// Validate references
function validateReferences() {
  console.log('\n🔍 Validating references...\n')

  const issues = []

  // Check for broken links
  const mdFiles = readdirSync(quickRefDir).filter((f) => f.endsWith('.md'))
  mdFiles.forEach((file) => {
    const content = readFileSync(join(quickRefDir, file), 'utf-8')
    const links = content.match(/\[.*?\]\((.*?)\)/g) || []

    links.forEach((link) => {
      const url = link.match(/\((.*?)\)/)[1]
      if (url.startsWith('/') || url.startsWith('./')) {
        const targetPath = join(projectRoot, url)
        if (!existsSync(targetPath)) {
          issues.push(`Broken link in ${file}: ${url}`)
        }
      }
    })
  })

  // Check for outdated commands
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'))
  const availableScripts = Object.keys(packageJson.scripts || {})

  mdFiles.forEach((file) => {
    const content = readFileSync(join(quickRefDir, file), 'utf-8')
    const npmCommands = content.match(/npm run [\w:-]+/g) || []

    npmCommands.forEach((cmd) => {
      const scriptName = cmd.replace('npm run ', '')
      if (!availableScripts.includes(scriptName)) {
        issues.push(`Outdated command in ${file}: ${cmd}`)
      }
    })
  })

  if (issues.length > 0) {
    console.log('❌ Issues found:\n')
    issues.forEach((issue) => console.log(`  - ${issue}`))
  } else {
    console.log('✅ All references are valid!')
  }

  return issues
}

// Generate report
function generateReport() {
  const stats = generateStatistics()
  const issues = validateReferences()

  const report = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    issues: issues,
    files: readdirSync(quickRefDir).filter((f) => f.endsWith('.md')),
  }

  const reportPath = join(quickRefDir, 'update-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n📊 Update Report:')
  console.log(`  Total commands: ${stats.totalCommands}`)
  console.log(`  Total files: ${stats.totalFiles}`)
  console.log(`  Issues found: ${issues.length}`)
  console.log(`  Report saved to: update-report.json`)
}

// Main execution
async function main() {
  console.log('🔄 Auto-updating Quick Reference Documentation\n')

  // Update each reference file
  updateConfigs.forEach((config) => {
    updateReferenceFile(config)
  })

  // Validate references
  validateReferences()

  // Generate report
  generateReport()

  console.log('\n✅ Update complete!')
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Error:', error.message)
  process.exit(1)
})

// Run the updater
main().catch(console.error)
