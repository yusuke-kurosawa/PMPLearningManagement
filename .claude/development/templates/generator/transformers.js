/**
 * Template Transformers Module
 *
 * Handles template variable replacement and transformations
 *
 * @module generator/transformers
 */

const path = require('path')

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * Transform template content by replacing variables
 *
 * @param {string} content - Template content
 * @param {Object} variables - Variables to replace
 * @returns {string} Transformed content
 */
function transformTemplate(content, variables) {
  let transformed = content

  // Apply transformations in order
  transformed = replaceVariables(transformed, variables)
  transformed = processConditionals(transformed, variables)
  transformed = processLoops(transformed, variables)
  transformed = processIncludes(transformed, variables)
  transformed = cleanupEmptyLines(transformed)

  return transformed
}

// ============================================================================
// Variable Replacement
// ============================================================================

/**
 * Replace template variables with values
 *
 * @param {string} content - Template content
 * @param {Object} variables - Variables to replace
 * @returns {string} Content with replaced variables
 */
function replaceVariables(content, variables) {
  let result = content

  // Sort variables by length (longest first) to avoid partial replacements
  const sortedVariables = Object.entries(variables).sort(([a], [b]) => b.length - a.length)

  for (const [key, value] of sortedVariables) {
    // Handle different variable syntaxes
    const patterns = [
      new RegExp(`\\{\\{${key}\\}\\}`, 'g'), // {{variable}}
      new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), // {{ variable }}
      new RegExp(`\\$\\{${key}\\}`, 'g'), // ${variable}
      new RegExp(`<%=\\s*${key}\\s*%>`, 'g'), // <%= variable %>
    ]

    for (const pattern of patterns) {
      result = result.replace(pattern, value)
    }
  }

  // Apply filters
  result = applyFilters(result, variables)

  // Apply default values for undefined variables
  result = applyDefaults(result)

  return result
}

// ============================================================================
// Conditional Processing
// ============================================================================

/**
 * Process conditional blocks in template
 *
 * @param {string} content - Template content
 * @param {Object} variables - Variables for conditions
 * @returns {string} Content with processed conditionals
 */
function processConditionals(content, variables) {
  let result = content

  // Process if blocks: {{#if condition}}...{{/if}}
  const ifPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g
  result = result.replace(ifPattern, (match, condition, block) => {
    if (evaluateCondition(condition, variables)) {
      return block
    }
    return ''
  })

  // Process if-else blocks: {{#if condition}}...{{else}}...{{/if}}
  const ifElsePattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g
  result = result.replace(ifElsePattern, (match, condition, ifBlock, elseBlock) => {
    if (evaluateCondition(condition, variables)) {
      return ifBlock
    }
    return elseBlock
  })

  // Process unless blocks: {{#unless condition}}...{{/unless}}
  const unlessPattern = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g
  result = result.replace(unlessPattern, (match, condition, block) => {
    if (!evaluateCondition(condition, variables)) {
      return block
    }
    return ''
  })

  return result
}

/**
 * Evaluate condition expression
 *
 * @param {string} condition - Condition to evaluate
 * @param {Object} variables - Variables context
 * @returns {boolean} Evaluation result
 */
function evaluateCondition(condition, variables) {
  // Simple variable check
  if (variables.hasOwnProperty(condition)) {
    const value = variables[condition]
    return value && value !== 'false' && value !== '0'
  }

  // Comparison operators
  const comparisonMatch = condition.match(/(\w+)\s*(==|!=|>|<|>=|<=)\s*(.+)/)
  if (comparisonMatch) {
    const [, left, operator, right] = comparisonMatch
    const leftValue = variables[left] || left
    const rightValue = variables[right] || right.replace(/['"]/g, '')

    switch (operator) {
      case '==':
        return leftValue == rightValue
      case '!=':
        return leftValue != rightValue
      case '>':
        return leftValue > rightValue
      case '<':
        return leftValue < rightValue
      case '>=':
        return leftValue >= rightValue
      case '<=':
        return leftValue <= rightValue
    }
  }

  return false
}

// ============================================================================
// Loop Processing
// ============================================================================

/**
 * Process loop blocks in template
 *
 * @param {string} content - Template content
 * @param {Object} variables - Variables for loops
 * @returns {string} Content with processed loops
 */
function processLoops(content, variables) {
  let result = content

  // Process each blocks: {{#each items}}...{{/each}}
  const eachPattern = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g
  result = result.replace(eachPattern, (match, arrayName, block) => {
    const array = variables[arrayName]
    if (!Array.isArray(array)) return ''

    return array
      .map((item, index) => {
        let itemBlock = block

        // Replace special loop variables
        itemBlock = itemBlock.replace(/\{\{@index\}\}/g, index)
        itemBlock = itemBlock.replace(/\{\{@first\}\}/g, index === 0)
        itemBlock = itemBlock.replace(/\{\{@last\}\}/g, index === array.length - 1)
        itemBlock = itemBlock.replace(/\{\{this\}\}/g, item)

        // Replace item properties if item is an object
        if (typeof item === 'object' && item !== null) {
          for (const [key, value] of Object.entries(item)) {
            itemBlock = itemBlock.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
          }
        }

        return itemBlock
      })
      .join('')
  })

  return result
}

// ============================================================================
// Include Processing
// ============================================================================

/**
 * Process include statements in template
 *
 * @param {string} content - Template content
 * @param {Object} variables - Variables context
 * @returns {string} Content with processed includes
 */
function processIncludes(content, variables) {
  let result = content

  // Process include statements: {{> partial}}
  const includePattern = /\{\{>\s*([\w/.-]+)\s*\}\}/g
  result = result.replace(includePattern, (match, partialPath) => {
    // In a real implementation, you would read the partial file
    // For now, return a placeholder
    return `<!-- Include: ${partialPath} -->`
  })

  return result
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Apply filters to variables
 *
 * @param {string} content - Content with filter syntax
 * @param {Object} variables - Variables context
 * @returns {string} Content with applied filters
 */
function applyFilters(content, variables) {
  let result = content

  // Process filter syntax: {{variable | filter}}
  const filterPattern = /\{\{(\w+)\s*\|\s*(\w+)\}\}/g
  result = result.replace(filterPattern, (match, variable, filter) => {
    const value = variables[variable]
    if (value === undefined) return match

    return applyFilter(value, filter)
  })

  return result
}

/**
 * Apply specific filter to value
 *
 * @param {any} value - Value to filter
 * @param {string} filter - Filter name
 * @returns {string} Filtered value
 */
function applyFilter(value, filter) {
  const filters = {
    // String filters
    uppercase: (v) => String(v).toUpperCase(),
    lowercase: (v) => String(v).toLowerCase(),
    capitalize: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
    camelCase: (v) => toCamelCase(String(v)),
    pascalCase: (v) => toPascalCase(String(v)),
    kebabCase: (v) => toKebabCase(String(v)),
    snakeCase: (v) => toSnakeCase(String(v)),

    // Number filters
    number: (v) => Number(v),
    round: (v) => Math.round(Number(v)),
    floor: (v) => Math.floor(Number(v)),
    ceil: (v) => Math.ceil(Number(v)),

    // Date filters
    date: (v) => new Date(v).toLocaleDateString(),
    time: (v) => new Date(v).toLocaleTimeString(),
    datetime: (v) => new Date(v).toLocaleString(),
    iso: (v) => new Date(v).toISOString(),

    // Array filters
    length: (v) => (Array.isArray(v) ? v.length : String(v).length),
    first: (v) => (Array.isArray(v) ? v[0] : v),
    last: (v) => (Array.isArray(v) ? v[v.length - 1] : v),
    join: (v) => (Array.isArray(v) ? v.join(', ') : v),

    // Boolean filters
    boolean: (v) => Boolean(v),
    not: (v) => !v,

    // Utility filters
    default: (v) => v || 'N/A',
    json: (v) => JSON.stringify(v, null, 2),
    escape: (v) =>
      String(v).replace(
        /[<>"'&]/g,
        (m) =>
          ({
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;',
          })[m]
      ),
  }

  const filterFn = filters[filter]
  return filterFn ? filterFn(value) : value
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Apply default values for undefined variables
 *
 * @param {string} content - Template content
 * @returns {string} Content with defaults applied
 */
function applyDefaults(content) {
  let result = content

  // Replace remaining undefined variables with defaults
  const undefinedPattern = /\{\{(\w+)(?:\s*\|\s*default\s*:\s*"([^"]*)")?\}\}/g
  result = result.replace(undefinedPattern, (match, variable, defaultValue) => {
    return defaultValue || `[${variable}]`
  })

  return result
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clean up empty lines and extra whitespace
 *
 * @param {string} content - Content to clean
 * @returns {string} Cleaned content
 */
function cleanupEmptyLines(content) {
  let result = content

  // Remove multiple consecutive empty lines
  result = result.replace(/\n{3,}/g, '\n\n')

  // Remove trailing whitespace
  result = result.replace(/[ \t]+$/gm, '')

  // Ensure single newline at end of file
  result = result.replace(/\n*$/, '\n')

  return result
}

// ============================================================================
// Case Conversion Utilities
// ============================================================================

function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  transformTemplate,
  replaceVariables,
  processConditionals,
  processLoops,
  processIncludes,
  applyFilters,
  applyDefaults,
  cleanupEmptyLines,
}
