#!/usr/bin/env node

/**
 * Template Generator System
 *
 * Main entry point for template generation
 *
 * @module generator
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { prompts, validateAnswers } = require('./prompts')
const { transformTemplate } = require('./transformers')
const { validateTemplate, validateOutputPath } = require('./validators')
const config = require('./config.json')

// ============================================================================
// Constants
// ============================================================================

const TEMPLATES_DIR = path.join(__dirname, '..')
const PROJECT_ROOT = path.join(__dirname, '../../..')

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate file from template
 *
 * @param {Object} options - Generation options
 * @param {string} options.template - Template path
 * @param {string} options.output - Output path
 * @param {Object} options.variables - Template variables
 * @param {boolean} options.force - Force overwrite
 * @returns {Promise<void>}
 */
async function generateFromTemplate(options) {
  const { template, output, variables = {}, force = false } = options

  try {
    // Validate inputs
    const templatePath = path.join(TEMPLATES_DIR, template)
    const templateFile = await findTemplateFile(templatePath)

    if (!templateFile) {
      throw new Error(`Template not found: ${template}`)
    }

    await validateTemplate(templateFile)

    // Determine output path
    const outputPath = path.isAbsolute(output) ? output : path.join(PROJECT_ROOT, output)

    // Check if file exists
    if (!force && (await fs.pathExists(outputPath))) {
      throw new Error(`File already exists: ${outputPath}\nUse --force to overwrite`)
    }

    await validateOutputPath(outputPath)

    // Read and transform template
    const templateContent = await fs.readFile(templateFile, 'utf-8')
    const mergedVariables = mergeVariables(variables)
    const transformedContent = transformTemplate(templateContent, mergedVariables)

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath))

    // Write output file
    await fs.writeFile(outputPath, transformedContent, 'utf-8')

    // Log success
    console.log(chalk.green('✓'), `Generated: ${chalk.cyan(outputPath)}`)

    // Post-generation actions
    await runPostGenerationHooks(outputPath, mergedVariables)

    return outputPath
  } catch (error) {
    console.error(chalk.red('✗'), 'Generation failed:', error.message)
    throw error
  }
}

/**
 * Find template file with various extensions
 *
 * @param {string} templatePath - Base template path
 * @returns {Promise<string|null>} Template file path
 */
async function findTemplateFile(templatePath) {
  const extensions = ['.template', '.tmpl', '.tpl', '']

  for (const ext of extensions) {
    const filePath = `${templatePath}${ext}`
    if (await fs.pathExists(filePath)) {
      return filePath
    }
  }

  // Check for exact match in subdirectories
  const possiblePaths = [
    path.join(templatePath, 'Component.tsx.template'),
    path.join(templatePath, 'Page.tsx.template'),
    path.join(templatePath, 'Layout.tsx.template'),
    path.join(templatePath, 'useHook.ts.template'),
    path.join(templatePath, 'ApiService.ts.template'),
    path.join(templatePath, 'Component.test.tsx.template'),
  ]

  for (const possiblePath of possiblePaths) {
    if (await fs.pathExists(possiblePath)) {
      return possiblePath
    }
  }

  return null
}

/**
 * Merge variables with defaults and environment
 *
 * @param {Object} variables - User-provided variables
 * @returns {Object} Merged variables
 */
function mergeVariables(variables) {
  const date = new Date().toISOString().split('T')[0]
  const author = process.env.USER || process.env.USERNAME || 'Developer'

  // Default variables
  const defaults = {
    Date: date,
    Author: author,
    Timestamp: new Date().toISOString(),
    Year: new Date().getFullYear(),
    ...config.variables,
  }

  // Merge with user variables
  const merged = { ...defaults, ...variables }

  // Add derived variables
  if (merged.ComponentName) {
    merged['kebab-name'] = toKebabCase(merged.ComponentName)
    merged['camelCaseName'] = toCamelCase(merged.ComponentName)
    merged['PascalCaseName'] = toPascalCase(merged.ComponentName)
  }

  if (merged.PageName) {
    merged['kebab-name'] = toKebabCase(merged.PageName)
    merged['route'] = `/${toKebabCase(merged.PageName)}`
  }

  if (merged.ServiceName) {
    merged['kebab-name'] = toKebabCase(merged.ServiceName)
    merged['camelCaseName'] = toCamelCase(merged.ServiceName)
    merged['endpoint'] = toKebabCase(merged.ServiceName).replace('-service', '')
  }

  if (merged.HookName) {
    merged['kebab-name'] = toKebabCase(merged.HookName)
  }

  return merged
}

/**
 * Run post-generation hooks
 *
 * @param {string} outputPath - Generated file path
 * @param {Object} variables - Template variables
 */
async function runPostGenerationHooks(outputPath, variables) {
  const ext = path.extname(outputPath)

  // Format TypeScript/JavaScript files
  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    try {
      const { execSync } = require('child_process')

      // Run Prettier if available
      if (await commandExists('prettier')) {
        execSync(`prettier --write "${outputPath}"`, { stdio: 'ignore' })
        console.log(chalk.gray('  Formatted with Prettier'))
      }

      // Run ESLint fix if available
      if (await commandExists('eslint')) {
        execSync(`eslint --fix "${outputPath}"`, { stdio: 'ignore' })
        console.log(chalk.gray('  Fixed with ESLint'))
      }
    } catch (error) {
      // Ignore formatting errors
    }
  }

  // Add to git if in a git repository
  if (await isGitRepository()) {
    try {
      const { execSync } = require('child_process')
      execSync(`git add "${outputPath}"`, { stdio: 'ignore' })
      console.log(chalk.gray('  Added to git'))
    } catch (error) {
      // Ignore git errors
    }
  }

  // Create corresponding test file if generating component
  if (variables.ComponentName && !outputPath.includes('.test.')) {
    const testPath = outputPath
      .replace('/components/', '/components/__tests__/')
      .replace('.tsx', '.test.tsx')
      .replace('.jsx', '.test.jsx')

    if (!(await fs.pathExists(testPath))) {
      console.log(chalk.yellow('  Consider creating test file:'), chalk.cyan(testPath))
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

/**
 * Check if command exists
 */
async function commandExists(command) {
  const { execSync } = require('child_process')
  try {
    execSync(`which ${command}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Check if in git repository
 */
async function isGitRepository() {
  try {
    await fs.access(path.join(PROJECT_ROOT, '.git'))
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Interactive Mode
// ============================================================================

/**
 * Run generator in interactive mode
 */
async function runInteractive() {
  try {
    console.log(chalk.cyan.bold('\n📄 Template Generator\n'))

    // Get user input
    const answers = await prompts()

    // Validate answers
    const validation = validateAnswers(answers)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Generate from template
    const outputPath = await generateFromTemplate(answers)

    console.log(chalk.green.bold('\n✨ Generation complete!\n'))
    console.log('File created at:', chalk.cyan(outputPath))

    // Show next steps
    showNextSteps(answers)
  } catch (error) {
    if (error.message === 'User cancelled') {
      console.log(chalk.yellow('\n⚠ Generation cancelled\n'))
    } else {
      console.error(chalk.red('\n✗ Error:'), error.message, '\n')
      process.exit(1)
    }
  }
}

/**
 * Show next steps after generation
 */
function showNextSteps(answers) {
  console.log(chalk.gray('\nNext steps:'))

  if (answers.template.includes('component')) {
    console.log(chalk.gray('  1. Import and use the component'))
    console.log(chalk.gray('  2. Write tests for the component'))
    console.log(chalk.gray('  3. Add to component index if needed'))
  }

  if (answers.template.includes('service')) {
    console.log(chalk.gray('  1. Configure API endpoints'))
    console.log(chalk.gray('  2. Set up error handling'))
    console.log(chalk.gray('  3. Add to service registry'))
  }

  if (answers.template.includes('test')) {
    console.log(chalk.gray('  1. Implement test cases'))
    console.log(chalk.gray('  2. Run tests to verify'))
    console.log(chalk.gray('  3. Add to test suite'))
  }

  console.log('')
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2)

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  // Check for version flag
  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require('../../../package.json')
    console.log(packageJson.version)
    return
  }

  // Parse command line arguments
  if (args.length > 0 && !args[0].startsWith('-')) {
    // Direct mode: generate <template> <output> [options]
    const template = args[0]
    const output = args[1]

    if (!output) {
      console.error(chalk.red('Error: Output path is required'))
      showHelp()
      process.exit(1)
    }

    const variables = {}
    const force = args.includes('--force') || args.includes('-f')

    // Parse variable flags
    for (let i = 2; i < args.length; i++) {
      if (args[i].startsWith('--') && i + 1 < args.length) {
        const key = args[i].slice(2)
        const value = args[i + 1]
        if (!value.startsWith('-')) {
          variables[key] = value
          i++ // Skip next argument
        }
      }
    }

    try {
      await generateFromTemplate({ template, output, variables, force })
    } catch (error) {
      process.exit(1)
    }
  } else {
    // Interactive mode
    await runInteractive()
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${chalk.cyan.bold('Template Generator')}

${chalk.bold('Usage:')}
  ${chalk.gray('$')} generate ${chalk.green('[template] [output] [options]')}
  ${chalk.gray('$')} generate ${chalk.gray('# Interactive mode')}

${chalk.bold('Arguments:')}
  template    Template to use (e.g., component/basic)
  output      Output file path

${chalk.bold('Options:')}
  --force, -f         Force overwrite existing files
  --help, -h          Show this help message
  --version, -v       Show version number
  --[variable] value  Set template variable

${chalk.bold('Examples:')}
  ${chalk.gray('$')} generate component/basic src/components/MyComponent.tsx
  ${chalk.gray('$')} generate service/api src/services/UserService.ts --ServiceName UserService
  ${chalk.gray('$')} generate test/unit src/components/__tests__/MyComponent.test.tsx
  ${chalk.gray('$')} generate ${chalk.gray('# Interactive mode')}

${chalk.bold('Available Templates:')}
  ${chalk.green('component/basic')}     Basic React component
  ${chalk.green('component/page')}      Page component with routing
  ${chalk.green('component/layout')}    Layout wrapper component
  ${chalk.green('component/hook')}      Custom React hook
  ${chalk.green('service/api')}         API service with error handling
  ${chalk.green('service/auth')}        Authentication service
  ${chalk.green('test/unit')}           Unit test with Vitest
  ${chalk.green('test/integration')}    Integration test
  ${chalk.green('test/e2e')}            End-to-end Playwright test
  `)
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  generateFromTemplate,
  mergeVariables,
  runInteractive,
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}
