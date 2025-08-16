#!/usr/bin/env node

/**
 * Template Generator CLI
 *
 * Command-line interface for template generation
 *
 * @module cli/generate
 */

const { program } = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const path = require('path')
const fs = require('fs-extra')
const { generateFromTemplate, runInteractive } = require('../generator')
const packageJson = require('../../../package.json')

// ============================================================================
// CLI Configuration
// ============================================================================

program
  .name('generate')
  .description('Generate files from templates')
  .version(packageJson.version)
  .usage('[options] [template] [output]')
  .option('-f, --force', 'Force overwrite existing files')
  .option('-s, --silent', 'Silent mode - minimal output')
  .option('-d, --dry-run', 'Dry run - show what would be generated')
  .option('-i, --interactive', 'Interactive mode (default when no args)')
  .option('-c, --config <path>', 'Custom config file path')
  .option('-t, --template <name>', 'Template to use')
  .option('-o, --output <path>', 'Output file path')
  .option('-v, --variables <json>', 'Variables as JSON string')
  .option('--list', 'List available templates')
  .option('--describe <template>', 'Describe a template')
  .option('--validate', 'Validate templates')
  .option('--init', 'Initialize template system')

// Custom variable options
program.option('--component-name <name>', 'Component name')
program.option('--page-name <name>', 'Page name')
program.option('--service-name <name>', 'Service name')
program.option('--hook-name <name>', 'Hook name')
program.option('--description <text>', 'Description')
program.option('--author <name>', 'Author name')
program.option('--route <path>', 'Route path')

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * List available templates
 */
async function listTemplates() {
  const config = require('../generator/config.json')

  console.log(chalk.cyan.bold('\n📄 Available Templates\n'))

  for (const [category, templates] of Object.entries(config.templates)) {
    console.log(chalk.yellow.bold(`\n${capitalize(category)}:`))

    for (const [key, template] of Object.entries(templates)) {
      const path = `${category}/${key}`
      console.log(`  ${chalk.green(path.padEnd(25))} ${chalk.gray(template.description)}`)

      if (template.requiredVariables?.length > 0) {
        console.log(
          `  ${' '.repeat(25)} ${chalk.gray(`Required: ${template.requiredVariables.join(', ')}`)}`
        )
      }
    }
  }

  console.log('\n' + chalk.gray('Use: generate <template> <output> [options]'))
  console.log(chalk.gray('Or run without arguments for interactive mode\n'))
}

/**
 * Describe a specific template
 */
async function describeTemplate(templateName) {
  const config = require('../generator/config.json')
  const [category, template] = templateName.split('/')

  const templateConfig = config.templates[category]?.[template]
  if (!templateConfig) {
    console.error(chalk.red(`Template not found: ${templateName}`))
    process.exit(1)
  }

  console.log(chalk.cyan.bold(`\n📄 Template: ${templateName}\n`))
  console.log(chalk.white(`Name: ${templateConfig.name}`))
  console.log(chalk.white(`Description: ${templateConfig.description}`))
  console.log(chalk.white(`Output Directory: ${templateConfig.outputDir}`))
  console.log(chalk.white(`File Extension: ${templateConfig.fileExtension}`))

  if (templateConfig.requiredVariables?.length > 0) {
    console.log(chalk.yellow('\nRequired Variables:'))
    templateConfig.requiredVariables.forEach((v) => {
      console.log(`  - ${v}`)
    })
  }

  if (templateConfig.optionalVariables?.length > 0) {
    console.log(chalk.gray('\nOptional Variables:'))
    templateConfig.optionalVariables.forEach((v) => {
      console.log(`  - ${v}`)
    })
  }

  // Show template preview
  const templatePath = path.join(__dirname, '..', category, template)
  const templateFiles = await findTemplateFiles(templatePath)

  if (templateFiles.length > 0) {
    console.log(chalk.cyan('\nTemplate Files:'))
    templateFiles.forEach((file) => {
      console.log(`  - ${path.relative(templatePath, file)}`)
    })
  }

  console.log('')
}

/**
 * Validate all templates
 */
async function validateTemplates() {
  const spinner = ora('Validating templates...').start()
  const { validateTemplate } = require('../generator/validators')

  const results = []
  const templatesDir = path.join(__dirname, '..')

  // Find all template files
  const templateFiles = await findAllTemplateFiles(templatesDir)

  for (const file of templateFiles) {
    const result = await validateTemplate(file)
    results.push({
      file: path.relative(templatesDir, file),
      ...result,
    })
  }

  spinner.stop()

  // Display results
  const valid = results.filter((r) => r.valid)
  const invalid = results.filter((r) => !r.valid)

  console.log(chalk.cyan.bold('\n📋 Template Validation Results\n'))

  if (valid.length > 0) {
    console.log(chalk.green(`✓ ${valid.length} templates valid`))
  }

  if (invalid.length > 0) {
    console.log(chalk.red(`✗ ${invalid.length} templates with errors:\n`))

    for (const result of invalid) {
      console.log(chalk.red(`  ${result.file}:`))
      result.errors.forEach((error) => {
        console.log(chalk.red(`    - ${error}`))
      })
    }
  }

  // Show warnings
  const withWarnings = results.filter((r) => r.warnings && r.warnings.length > 0)
  if (withWarnings.length > 0) {
    console.log(chalk.yellow(`\n⚠ ${withWarnings.length} templates with warnings`))
  }

  console.log('')
  process.exit(invalid.length > 0 ? 1 : 0)
}

/**
 * Initialize template system
 */
async function initializeTemplates() {
  const spinner = ora('Initializing template system...').start()

  try {
    // Install required dependencies
    const deps = ['inquirer', 'chalk', 'ora', 'commander', 'fs-extra']

    spinner.text = 'Checking dependencies...'
    const missing = []

    for (const dep of deps) {
      try {
        require.resolve(dep)
      } catch {
        missing.push(dep)
      }
    }

    if (missing.length > 0) {
      spinner.text = `Installing dependencies: ${missing.join(', ')}`
      const { execSync } = require('child_process')
      execSync(`npm install --save-dev ${missing.join(' ')}`, { stdio: 'ignore' })
    }

    // Add npm scripts
    spinner.text = 'Adding npm scripts...'
    const packageJsonPath = path.join(__dirname, '../../../package.json')
    const pkg = await fs.readJson(packageJsonPath)

    if (!pkg.scripts) pkg.scripts = {}

    pkg.scripts['generate'] = 'node .claude/templates/cli/generate.js'
    pkg.scripts['generate:component'] = 'node .claude/templates/cli/generate.js component/basic'
    pkg.scripts['generate:service'] = 'node .claude/templates/cli/generate.js service/api'
    pkg.scripts['generate:test'] = 'node .claude/templates/cli/generate.js test/unit'
    pkg.scripts['templates:list'] = 'node .claude/templates/cli/generate.js --list'
    pkg.scripts['templates:validate'] = 'node .claude/templates/cli/generate.js --validate'

    await fs.writeJson(packageJsonPath, pkg, { spaces: 2 })

    spinner.succeed('Template system initialized successfully!')

    console.log(chalk.cyan('\n📋 Available Commands:\n'))
    console.log('  npm run generate              - Interactive template generation')
    console.log('  npm run generate:component    - Generate a React component')
    console.log('  npm run generate:service      - Generate an API service')
    console.log('  npm run generate:test         - Generate a test file')
    console.log('  npm run templates:list        - List all templates')
    console.log('  npm run templates:validate    - Validate templates\n')
  } catch (error) {
    spinner.fail(`Initialization failed: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Generate from template (main command)
 */
async function generate(template, output, options) {
  // Collect variables from options
  const variables = {}

  // Parse JSON variables if provided
  if (options.variables) {
    try {
      Object.assign(variables, JSON.parse(options.variables))
    } catch (error) {
      console.error(chalk.red('Invalid JSON in --variables option'))
      process.exit(1)
    }
  }

  // Add individual variable options
  if (options.componentName) variables.ComponentName = options.componentName
  if (options.pageName) variables.PageName = options.pageName
  if (options.serviceName) variables.ServiceName = options.serviceName
  if (options.hookName) variables.HookName = options.hookName
  if (options.description) variables.Description = options.description
  if (options.author) variables.Author = options.author
  if (options.route) variables.Route = options.route

  // Dry run mode
  if (options.dryRun) {
    console.log(chalk.cyan.bold('\n🔍 Dry Run Mode\n'))
    console.log('Would generate:')
    console.log('  Template:', chalk.green(template))
    console.log('  Output:', chalk.green(output))
    console.log('  Variables:', variables)
    console.log('  Force:', options.force || false)
    console.log('')
    return
  }

  // Generate with spinner
  const spinner = ora('Generating from template...').start()

  try {
    const result = await generateFromTemplate({
      template,
      output,
      variables,
      force: options.force,
    })

    spinner.succeed(`Generated: ${chalk.green(result)}`)

    if (!options.silent) {
      console.log(chalk.gray('\nNext steps:'))
      console.log(chalk.gray('  1. Review the generated file'))
      console.log(chalk.gray('  2. Customize as needed'))
      console.log(chalk.gray('  3. Add tests if applicable\n'))
    }
  } catch (error) {
    spinner.fail(`Generation failed: ${error.message}`)
    process.exit(1)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find template files in directory
 */
async function findTemplateFiles(dir) {
  const files = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isFile() && entry.name.endsWith('.template')) {
        files.push(fullPath)
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subFiles = await findTemplateFiles(fullPath)
        files.push(...subFiles)
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }

  return files
}

/**
 * Find all template files
 */
async function findAllTemplateFiles(dir) {
  const files = []
  const categories = ['component', 'service', 'test', 'documentation', 'config']

  for (const category of categories) {
    const categoryDir = path.join(dir, category)
    const categoryFiles = await findTemplateFiles(categoryDir)
    files.push(...categoryFiles)
  }

  return files
}

/**
 * Capitalize string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  program.parse(process.argv)
  const options = program.opts()

  // Handle special commands
  if (options.list) {
    await listTemplates()
    return
  }

  if (options.describe) {
    await describeTemplate(options.describe)
    return
  }

  if (options.validate) {
    await validateTemplates()
    return
  }

  if (options.init) {
    await initializeTemplates()
    return
  }

  // Get template and output from options or arguments
  const args = program.args
  const template = options.template || args[0]
  const output = options.output || args[1]

  // If no arguments, run interactive mode
  if (!template && !output) {
    if (!options.silent) {
      console.log(chalk.cyan.bold('📄 Template Generator - Interactive Mode\n'))
    }

    try {
      await runInteractive()
    } catch (error) {
      if (error.message !== 'User cancelled') {
        console.error(chalk.red(`Error: ${error.message}`))
        process.exit(1)
      }
    }
    return
  }

  // Validate required arguments
  if (!template) {
    console.error(chalk.red('Error: Template is required'))
    program.help()
    process.exit(1)
  }

  if (!output) {
    console.error(chalk.red('Error: Output path is required'))
    program.help()
    process.exit(1)
  }

  // Generate from template
  await generate(template, output, options)
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red(`Fatal error: ${error.message}`))
    process.exit(1)
  })
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  listTemplates,
  describeTemplate,
  validateTemplates,
  initializeTemplates,
  generate,
}
