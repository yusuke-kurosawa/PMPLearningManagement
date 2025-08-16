/**
 * Template Validators Module
 *
 * Validates templates, paths, and generated content
 *
 * @module generator/validators
 */

const fs = require('fs-extra')
const path = require('path')
const { ESLint } = require('eslint')
const typescript = require('typescript')
const config = require('./config.json')

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validate template file
 *
 * @param {string} templatePath - Path to template file
 * @returns {Promise<Object>} Validation result
 */
async function validateTemplate(templatePath) {
  const errors = []
  const warnings = []

  try {
    // Check if template exists
    if (!(await fs.pathExists(templatePath))) {
      errors.push(`Template file not found: ${templatePath}`)
      return { valid: false, errors, warnings }
    }

    // Check if it's a file
    const stat = await fs.stat(templatePath)
    if (!stat.isFile()) {
      errors.push(`Template path is not a file: ${templatePath}`)
      return { valid: false, errors, warnings }
    }

    // Read template content
    const content = await fs.readFile(templatePath, 'utf-8')

    // Validate template syntax
    const syntaxValidation = validateTemplateSyntax(content)
    errors.push(...syntaxValidation.errors)
    warnings.push(...syntaxValidation.warnings)

    // Check for required variables
    const variableValidation = validateTemplateVariables(content, templatePath)
    errors.push(...variableValidation.errors)
    warnings.push(...variableValidation.warnings)

    // Check template size
    if (content.length > 100000) {
      warnings.push('Template file is very large (>100KB)')
    }

    // Check for security issues
    const securityValidation = validateTemplateSecurity(content)
    errors.push(...securityValidation.errors)
    warnings.push(...securityValidation.warnings)
  } catch (error) {
    errors.push(`Failed to validate template: ${error.message}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate template syntax
 *
 * @param {string} content - Template content
 * @returns {Object} Validation result
 */
function validateTemplateSyntax(content) {
  const errors = []
  const warnings = []

  // Check for unclosed variable brackets
  const openBrackets = (content.match(/\{\{/g) || []).length
  const closeBrackets = (content.match(/\}\}/g) || []).length
  if (openBrackets !== closeBrackets) {
    errors.push(`Mismatched template brackets: ${openBrackets} opening, ${closeBrackets} closing`)
  }

  // Check for unclosed conditional blocks
  const ifBlocks = (content.match(/\{\{#if/g) || []).length
  const endIfBlocks = (content.match(/\{\{\/if\}\}/g) || []).length
  if (ifBlocks !== endIfBlocks) {
    errors.push(`Unclosed if blocks: ${ifBlocks} opening, ${endIfBlocks} closing`)
  }

  // Check for unclosed loop blocks
  const eachBlocks = (content.match(/\{\{#each/g) || []).length
  const endEachBlocks = (content.match(/\{\{\/each\}\}/g) || []).length
  if (eachBlocks !== endEachBlocks) {
    errors.push(`Unclosed each blocks: ${eachBlocks} opening, ${endEachBlocks} closing`)
  }

  // Check for invalid variable names
  const variablePattern = /\{\{([^}]+)\}\}/g
  let match
  while ((match = variablePattern.exec(content)) !== null) {
    const variable = match[1].trim()
    if (!/^[a-zA-Z_$@][\w$@.-]*(\s*\|\s*\w+)?$/.test(variable)) {
      warnings.push(`Potentially invalid variable syntax: {{${variable}}}`)
    }
  }

  return { errors, warnings }
}

/**
 * Validate template variables
 *
 * @param {string} content - Template content
 * @param {string} templatePath - Template file path
 * @returns {Object} Validation result
 */
function validateTemplateVariables(content, templatePath) {
  const errors = []
  const warnings = []

  // Extract all variables from template
  const variables = new Set()
  const variablePattern = /\{\{([a-zA-Z_$][\w$]*)\}\}/g
  let match
  while ((match = variablePattern.exec(content)) !== null) {
    variables.add(match[1])
  }

  // Get template configuration
  const templateName = path.basename(templatePath, '.template')
  const templateConfig = findTemplateConfig(templateName)

  if (templateConfig) {
    // Check required variables
    for (const required of templateConfig.requiredVariables || []) {
      if (!variables.has(required)) {
        warnings.push(`Template might be missing required variable: ${required}`)
      }
    }

    // Check for undefined variables
    const allExpectedVariables = [
      ...(templateConfig.requiredVariables || []),
      ...(templateConfig.optionalVariables || []),
      'Date',
      'Author',
      'Timestamp',
      'Year', // Common variables
    ]

    for (const variable of variables) {
      if (
        !allExpectedVariables.includes(variable) &&
        !variable.startsWith('kebab-') &&
        !variable.startsWith('camelCase') &&
        !variable.startsWith('PascalCase')
      ) {
        warnings.push(`Unknown variable in template: ${variable}`)
      }
    }
  }

  return { errors, warnings }
}

/**
 * Validate template security
 *
 * @param {string} content - Template content
 * @returns {Object} Validation result
 */
function validateTemplateSecurity(content) {
  const errors = []
  const warnings = []

  // Check for potential code injection
  const dangerousPatterns = [
    /eval\s*\(/,
    /new\s+Function\s*\(/,
    /setTimeout\s*\([^,]+,/,
    /setInterval\s*\(/,
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      warnings.push(`Potentially dangerous pattern detected: ${pattern}`)
    }
  }

  // Check for file system operations in templates
  const fsPatterns = [/require\s*\(\s*['"]fs['"]\s*\)/, /import.*from\s+['"]fs['"]/, /fs\.\w+/]

  for (const pattern of fsPatterns) {
    if (pattern.test(content)) {
      errors.push(`File system operations not allowed in templates: ${pattern}`)
    }
  }

  return { errors, warnings }
}

// ============================================================================
// Output Path Validation
// ============================================================================

/**
 * Validate output path
 *
 * @param {string} outputPath - Proposed output path
 * @returns {Promise<Object>} Validation result
 */
async function validateOutputPath(outputPath) {
  const errors = []
  const warnings = []

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/
  if (invalidChars.test(outputPath)) {
    errors.push(`Output path contains invalid characters: ${outputPath}`)
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ]

  const basename = path.basename(outputPath, path.extname(outputPath))
  if (reservedNames.includes(basename.toUpperCase())) {
    errors.push(`Output filename is a reserved name: ${basename}`)
  }

  // Check if parent directory exists
  const parentDir = path.dirname(outputPath)
  if (!(await fs.pathExists(parentDir))) {
    warnings.push(`Parent directory does not exist and will be created: ${parentDir}`)
  }

  // Check if path is within project
  const projectRoot = path.join(__dirname, '../../..')
  const absolutePath = path.isAbsolute(outputPath) ? outputPath : path.join(projectRoot, outputPath)

  if (!absolutePath.startsWith(projectRoot)) {
    errors.push('Output path must be within the project directory')
  }

  // Check for protected paths
  const protectedPaths = ['node_modules', '.git', '.github', 'dist', 'build', 'coverage']

  for (const protected of protectedPaths) {
    if (outputPath.includes(protected)) {
      warnings.push(`Output path is in a protected directory: ${protected}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// Content Validation
// ============================================================================

/**
 * Validate generated content
 *
 * @param {string} content - Generated content
 * @param {string} filePath - Output file path
 * @returns {Promise<Object>} Validation result
 */
async function validateGeneratedContent(content, filePath) {
  const errors = []
  const warnings = []
  const ext = path.extname(filePath)

  // Validate based on file type
  switch (ext) {
    case '.ts':
    case '.tsx':
      const tsValidation = await validateTypeScript(content, filePath)
      errors.push(...tsValidation.errors)
      warnings.push(...tsValidation.warnings)
      break

    case '.js':
    case '.jsx':
      const jsValidation = await validateJavaScript(content, filePath)
      errors.push(...jsValidation.errors)
      warnings.push(...jsValidation.warnings)
      break

    case '.json':
      const jsonValidation = validateJSON(content)
      errors.push(...jsonValidation.errors)
      warnings.push(...jsonValidation.warnings)
      break

    case '.md':
      const mdValidation = validateMarkdown(content)
      errors.push(...mdValidation.errors)
      warnings.push(...mdValidation.warnings)
      break
  }

  // Check for remaining template variables
  const unreplacedPattern = /\{\{[^}]+\}\}/g
  const unreplaced = content.match(unreplacedPattern)
  if (unreplaced) {
    warnings.push(`Unreplaced template variables found: ${unreplaced.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate TypeScript content
 */
async function validateTypeScript(content, filePath) {
  const errors = []
  const warnings = []

  try {
    const result = typescript.transpileModule(content, {
      compilerOptions: {
        target: typescript.ScriptTarget.ES2020,
        module: typescript.ModuleKind.ESNext,
        jsx: filePath.endsWith('.tsx') ? typescript.JsxEmit.React : typescript.JsxEmit.None,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    })

    if (result.diagnostics && result.diagnostics.length > 0) {
      for (const diagnostic of result.diagnostics) {
        const message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, '\n')

        if (diagnostic.category === typescript.DiagnosticCategory.Error) {
          errors.push(`TypeScript: ${message}`)
        } else {
          warnings.push(`TypeScript: ${message}`)
        }
      }
    }
  } catch (error) {
    errors.push(`TypeScript validation failed: ${error.message}`)
  }

  return { errors, warnings }
}

/**
 * Validate JavaScript content
 */
async function validateJavaScript(content, filePath) {
  const errors = []
  const warnings = []

  try {
    const eslint = new ESLint({
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: filePath.endsWith('.jsx'),
          },
        },
        rules: {
          'no-undef': 'error',
          'no-unused-vars': 'warn',
          'no-console': 'warn',
        },
      },
    })

    const results = await eslint.lintText(content, { filePath })

    for (const result of results) {
      for (const message of result.messages) {
        if (message.severity === 2) {
          errors.push(`ESLint: ${message.message} (${message.ruleId})`)
        } else {
          warnings.push(`ESLint: ${message.message} (${message.ruleId})`)
        }
      }
    }
  } catch (error) {
    warnings.push(`ESLint validation skipped: ${error.message}`)
  }

  return { errors, warnings }
}

/**
 * Validate JSON content
 */
function validateJSON(content) {
  const errors = []
  const warnings = []

  try {
    JSON.parse(content)
  } catch (error) {
    errors.push(`Invalid JSON: ${error.message}`)
  }

  return { errors, warnings }
}

/**
 * Validate Markdown content
 */
function validateMarkdown(content) {
  const errors = []
  const warnings = []

  // Check for broken links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  while ((match = linkPattern.exec(content)) !== null) {
    const url = match[2]
    if (url.startsWith('#') || url.startsWith('http')) {
      continue // Skip anchors and external links
    }
    // Could check if local file exists
  }

  // Check for empty sections
  const headingPattern = /^#{1,6}\s+(.+)$/gm
  const headings = content.match(headingPattern) || []
  if (headings.length === 0) {
    warnings.push('Markdown file has no headings')
  }

  return { errors, warnings }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find template configuration
 */
function findTemplateConfig(templateName) {
  for (const category of Object.values(config.templates)) {
    for (const [key, tmpl] of Object.entries(category)) {
      if (key === templateName || tmpl.name === templateName) {
        return tmpl
      }
    }
  }
  return null
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  validateTemplate,
  validateOutputPath,
  validateGeneratedContent,
  validateTemplateSyntax,
  validateTemplateVariables,
  validateTemplateSecurity,
}
