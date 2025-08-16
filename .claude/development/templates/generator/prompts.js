/**
 * Interactive Prompts Module
 *
 * Handles user input for template generation
 *
 * @module generator/prompts
 */

const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const config = require('./config.json')

// ============================================================================
// Main Prompts Function
// ============================================================================

/**
 * Get user input through interactive prompts
 *
 * @returns {Promise<Object>} User answers
 */
async function prompts() {
  const answers = {}

  // Step 1: Template Selection
  const templateChoice = await selectTemplate()
  if (!templateChoice) throw new Error('User cancelled')

  answers.template = templateChoice.template
  const templateConfig = getTemplateConfig(templateChoice.template)

  // Step 2: Get template-specific variables
  const variables = await getTemplateVariables(templateConfig)
  if (!variables) throw new Error('User cancelled')

  Object.assign(answers, variables)

  // Step 3: Output path
  const outputPath = await getOutputPath(templateConfig, variables)
  if (!outputPath) throw new Error('User cancelled')

  answers.output = outputPath

  // Step 4: Additional options
  const options = await getAdditionalOptions(answers.output)
  Object.assign(answers, options)

  // Step 5: Confirmation
  if (config.settings.interactive.confirmBeforeGenerate) {
    const confirmed = await confirmGeneration(answers)
    if (!confirmed) throw new Error('User cancelled')
  }

  return answers
}

// ============================================================================
// Template Selection
// ============================================================================

/**
 * Select template through interactive menu
 *
 * @returns {Promise<Object>} Selected template
 */
async function selectTemplate() {
  const categories = Object.keys(config.templates)

  // First, select category
  const categoryAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'What type of template do you want to generate?',
      choices: categories.map((cat) => ({
        name: `${getCategoryIcon(cat)} ${capitalize(cat)}`,
        value: cat,
      })),
      pageSize: 10,
    },
  ])

  if (!categoryAnswer.category) return null

  // Then, select specific template
  const templates = Object.keys(config.templates[categoryAnswer.category])
  const templateAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: `Select ${categoryAnswer.category} template:`,
      choices: templates.map((tmpl) => {
        const tmplConfig = config.templates[categoryAnswer.category][tmpl]
        return {
          name: `${tmplConfig.name} - ${chalk.gray(tmplConfig.description)}`,
          value: `${categoryAnswer.category}/${tmpl}`,
        }
      }),
      pageSize: 10,
    },
  ])

  return templateAnswer
}

// ============================================================================
// Variable Input
// ============================================================================

/**
 * Get template-specific variables from user
 *
 * @param {Object} templateConfig - Template configuration
 * @returns {Promise<Object>} Template variables
 */
async function getTemplateVariables(templateConfig) {
  const questions = []
  const variables = {}

  // Required variables
  for (const variable of templateConfig.requiredVariables || []) {
    questions.push({
      type: 'input',
      name: variable,
      message: `Enter ${formatVariableName(variable)}:`,
      validate: (input) => validateVariable(variable, input),
    })
  }

  // Optional variables with defaults
  const optionalQuestions = []
  for (const variable of templateConfig.optionalVariables || []) {
    optionalQuestions.push({
      type: 'input',
      name: variable,
      message: `Enter ${formatVariableName(variable)} (optional):`,
      default: getDefaultValue(variable),
    })
  }

  // Ask if user wants to set optional variables
  if (optionalQuestions.length > 0) {
    const setOptional = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setOptional',
        message: 'Do you want to set optional variables?',
        default: false,
      },
    ])

    if (setOptional.setOptional) {
      questions.push(...optionalQuestions)
    }
  }

  const answers = await inquirer.prompt(questions)
  Object.assign(variables, answers)

  return variables
}

// ============================================================================
// Output Path
// ============================================================================

/**
 * Get output path from user
 *
 * @param {Object} templateConfig - Template configuration
 * @param {Object} variables - Template variables
 * @returns {Promise<string>} Output path
 */
async function getOutputPath(templateConfig, variables) {
  const suggestedPath = generateSuggestedPath(templateConfig, variables)

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'output',
      message: 'Output path:',
      default: suggestedPath,
      validate: (input) => {
        if (!input) return 'Output path is required'
        if (input.includes(' ')) return 'Path cannot contain spaces'
        return true
      },
      filter: (input) => {
        // Expand relative paths
        if (!path.isAbsolute(input)) {
          return path.join(templateConfig.outputDir || 'src', input)
        }
        return input
      },
    },
  ])

  return answer.output
}

// ============================================================================
// Additional Options
// ============================================================================

/**
 * Get additional generation options
 *
 * @param {string} outputPath - Output file path
 * @returns {Promise<Object>} Additional options
 */
async function getAdditionalOptions(outputPath) {
  const options = {}

  // Check if file exists
  const projectRoot = path.join(__dirname, '../../..')
  const fullPath = path.isAbsolute(outputPath) ? outputPath : path.join(projectRoot, outputPath)

  if (await fs.pathExists(fullPath)) {
    const overwrite = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'force',
        message: chalk.yellow(`File already exists: ${outputPath}\nOverwrite?`),
        default: false,
      },
    ])

    options.force = overwrite.force

    if (!overwrite.force) {
      throw new Error('User cancelled - file exists')
    }
  }

  // Ask about additional actions
  const actions = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'actions',
      message: 'Additional actions:',
      choices: [
        { name: 'Create test file', value: 'createTest' },
        { name: 'Create documentation', value: 'createDocs' },
        { name: 'Add to index/barrel export', value: 'addToIndex' },
        { name: 'Open in editor', value: 'openInEditor' },
      ],
    },
  ])

  options.actions = actions.actions

  return options
}

// ============================================================================
// Confirmation
// ============================================================================

/**
 * Confirm generation with user
 *
 * @param {Object} answers - All user answers
 * @returns {Promise<boolean>} Confirmation result
 */
async function confirmGeneration(answers) {
  console.log('\n' + chalk.cyan('Generation Summary:'))
  console.log(chalk.gray('─'.repeat(40)))
  console.log('Template:', chalk.green(answers.template))
  console.log('Output:', chalk.green(answers.output))

  // Show variables
  const variables = Object.keys(answers)
    .filter((key) => !['template', 'output', 'force', 'actions'].includes(key))
    .filter((key) => answers[key])

  if (variables.length > 0) {
    console.log('\nVariables:')
    variables.forEach((key) => {
      console.log(`  ${key}:`, chalk.yellow(answers[key]))
    })
  }

  if (answers.actions && answers.actions.length > 0) {
    console.log('\nAdditional actions:', chalk.yellow(answers.actions.join(', ')))
  }

  console.log(chalk.gray('─'.repeat(40)))

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with generation?',
      default: true,
    },
  ])

  return confirm.proceed
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate user answers
 *
 * @param {Object} answers - User answers
 * @returns {Object} Validation result
 */
function validateAnswers(answers) {
  const errors = []

  // Validate template
  if (!answers.template) {
    errors.push('Template is required')
  }

  // Validate output
  if (!answers.output) {
    errors.push('Output path is required')
  }

  // Validate required variables based on template
  const [category, template] = (answers.template || '').split('/')
  if (category && template && config.templates[category]?.[template]) {
    const templateConfig = config.templates[category][template]

    for (const variable of templateConfig.requiredVariables || []) {
      if (!answers[variable]) {
        errors.push(`${variable} is required for this template`)
      }

      // Apply specific validation rules
      const validationRule = config.validation[lowerFirst(variable)]
      if (validationRule && answers[variable]) {
        const regex = new RegExp(validationRule.pattern)
        if (!regex.test(answers[variable])) {
          errors.push(validationRule.message)
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    error: errors.join('; '),
  }
}

/**
 * Validate individual variable
 *
 * @param {string} variable - Variable name
 * @param {string} value - Variable value
 * @returns {boolean|string} Validation result
 */
function validateVariable(variable, value) {
  if (!value) return `${variable} is required`

  const validationKey = lowerFirst(variable)
  const validationRule = config.validation[validationKey]

  if (validationRule) {
    const regex = new RegExp(validationRule.pattern)
    if (!regex.test(value)) {
      return validationRule.message
    }
  }

  return true
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get template configuration
 */
function getTemplateConfig(templatePath) {
  const [category, template] = templatePath.split('/')
  return config.templates[category]?.[template] || {}
}

/**
 * Generate suggested output path
 */
function generateSuggestedPath(templateConfig, variables) {
  let filename = ''

  if (variables.ComponentName) {
    filename = `${variables.ComponentName}${templateConfig.fileExtension}`
  } else if (variables.PageName) {
    filename = `${variables.PageName}${templateConfig.fileExtension}`
  } else if (variables.ServiceName) {
    filename = `${variables.ServiceName}${templateConfig.fileExtension}`
  } else if (variables.HookName) {
    filename = `${variables.HookName}${templateConfig.fileExtension}`
  } else {
    filename = `NewFile${templateConfig.fileExtension}`
  }

  return path.join(templateConfig.outputDir || 'src', filename)
}

/**
 * Get default value for optional variable
 */
function getDefaultValue(variable) {
  const defaults = {
    Description: 'TODO: Add description',
    Author: process.env.USER || 'Developer',
    Date: new Date().toISOString().split('T')[0],
    RequiresAuth: false,
    ShowSidebar: true,
    ShowFooter: true,
    ShowMobileNav: true,
    ValueType: 'unknown',
    DefaultValue: 'null',
    Route: '/new-route',
    Provider: 'supabase',
    StorageType: 'localStorage',
    Version: '1.0.0',
  }

  return defaults[variable] || ''
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    component: '⚛️',
    service: '🔧',
    test: '🧪',
    documentation: '📚',
    config: '⚙️',
  }

  return icons[category] || '📄'
}

/**
 * Format variable name for display
 */
function formatVariableName(variable) {
  return variable
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^./, (str) => str.toUpperCase())
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Lower first letter
 */
function lowerFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  prompts,
  validateAnswers,
  validateVariable,
}
