import { ValidationService } from './validation'

export interface SanitizationOptions {
  allowHTML?: boolean
  maxLength?: number
  stripWhitespace?: boolean
  normalizeUnicode?: boolean
  removeSQLInjection?: boolean
  allowedTags?: string[]
  allowedAttributes?: string[]
}

export interface SanitizationResult {
  sanitized: string
  original: string
  warnings: string[]
  modified: boolean
}

export class DataSanitizer {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\-\-|\;|\||&)/g,
    /(\/\*.*?\*\/)/g,
    /(\bOR\b.*?=.*?=|\bAND\b.*?=.*?=)/gi,
    /('.*?'|".*?")/g,
  ]

  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ]

  private static readonly ALLOWED_HTML_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ]

  private static readonly ALLOWED_ATTRIBUTES = ['class', 'id', 'style']

  /**
   * Sanitize text input with comprehensive cleaning
   */
  static sanitizeText(input: string, options: SanitizationOptions = {}): SanitizationResult {
    const original = input
    const warnings: string[] = []
    let sanitized = input
    let modified = false

    try {
      // Handle null/undefined input
      if (input == null) {
        sanitized = ''
        modified = true
      } else if (typeof input !== 'string') {
        sanitized = String(input)
        modified = true
        warnings.push('Input was converted to string')
      }

      // Apply length limit
      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength)
        modified = true
        warnings.push(`Text truncated to ${options.maxLength} characters`)
      }

      // Strip whitespace
      if (options.stripWhitespace !== false) {
        const trimmed = sanitized.trim()
        if (trimmed !== sanitized) {
          sanitized = trimmed
          modified = true
        }
      }

      // Normalize unicode
      if (options.normalizeUnicode !== false) {
        const normalized = sanitized.normalize('NFKC')
        if (normalized !== sanitized) {
          sanitized = normalized
          modified = true
        }
      }

      // Remove SQL injection patterns
      if (options.removeSQLInjection !== false) {
        for (const pattern of this.SQL_INJECTION_PATTERNS) {
          const cleaned = sanitized.replace(pattern, '')
          if (cleaned !== sanitized) {
            sanitized = cleaned
            modified = true
            warnings.push('Removed potential SQL injection pattern')
          }
        }
      }

      // Handle HTML content
      if (options.allowHTML) {
        sanitized = this.sanitizeHTML(sanitized, {
          allowedTags: options.allowedTags || this.ALLOWED_HTML_TAGS,
          allowedAttributes: options.allowedAttributes || this.ALLOWED_ATTRIBUTES,
        })
        if (sanitized !== input) {
          modified = true
          warnings.push('HTML content was sanitized')
        }
      } else {
        // Remove all HTML if not allowed
        const htmlRemoved = sanitized.replace(/<[^>]*>/g, '')
        if (htmlRemoved !== sanitized) {
          sanitized = htmlRemoved
          modified = true
          warnings.push('HTML tags were removed')
        }
      }

      // Remove XSS patterns
      for (const pattern of this.XSS_PATTERNS) {
        const cleaned = sanitized.replace(pattern, '')
        if (cleaned !== sanitized) {
          sanitized = cleaned
          modified = true
          warnings.push('Removed potential XSS pattern')
        }
      }

      // Final HTML entity encoding for safety
      if (!options.allowHTML) {
        sanitized = ValidationService.sanitizeHTML(sanitized)
      }

      return {
        sanitized,
        original,
        warnings,
        modified,
      }
    } catch (error) {
      warnings.push(
        `Sanitization error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return {
        sanitized: '',
        original,
        warnings,
        modified: true,
      }
    }
  }

  /**
   * Sanitize HTML content with allowed tags and attributes
   */
  private static sanitizeHTML(
    html: string,
    options: {
      allowedTags: string[]
      allowedAttributes: string[]
    }
  ): string {
    // Basic HTML sanitization - in production, use DOMPurify or similar library
    let sanitized = html

    // Remove all tags except allowed ones
    sanitized = sanitized.replace(
      /<(\/?)([\w-]+)([^>]*)>/g,
      (match, closing, tagName, attributes) => {
        const tag = tagName.toLowerCase()

        if (!options.allowedTags.includes(tag)) {
          return '' // Remove disallowed tags
        }

        // Clean attributes for allowed tags
        let cleanAttributes = ''
        if (attributes && !closing) {
          const attrMatches = attributes.match(/(\w+)=["']([^"']*)["']/g)
          if (attrMatches) {
            const allowedAttrs = attrMatches.filter((attr) => {
              const attrName = attr.split('=')[0].toLowerCase()
              return options.allowedAttributes.includes(attrName)
            })
            cleanAttributes = allowedAttrs.length > 0 ? ' ' + allowedAttrs.join(' ') : ''
          }
        }

        return `<${closing}${tag}${cleanAttributes}>`
      }
    )

    return sanitized
  }

  /**
   * Sanitize object properties recursively
   */
  static sanitizeObject(
    obj: any,
    options: SanitizationOptions = {}
  ): {
    sanitized: any
    warnings: string[]
    modified: boolean
  } {
    const warnings: string[] = []
    let modified = false

    const sanitizeValue = (value: any, key?: string): any => {
      if (typeof value === 'string') {
        const result = this.sanitizeText(value, options)
        if (result.modified) {
          modified = true
          warnings.push(...result.warnings.map((w) => `${key}: ${w}`))
        }
        return result.sanitized
      }

      if (Array.isArray(value)) {
        return value.map((item, index) => sanitizeValue(item, `${key}[${index}]`))
      }

      if (value && typeof value === 'object' && value.constructor === Object) {
        const sanitizedObj: any = {}
        for (const [objKey, objValue] of Object.entries(value)) {
          // Check for dangerous keys
          if (objKey === '__proto__' || objKey === 'constructor' || objKey === 'prototype') {
            modified = true
            warnings.push(`Removed dangerous key: ${objKey}`)
            continue
          }
          sanitizedObj[objKey] = sanitizeValue(objValue, `${key}.${objKey}`)
        }
        return sanitizedObj
      }

      return value
    }

    try {
      const sanitized = sanitizeValue(obj, 'root')
      return { sanitized, warnings, modified }
    } catch (error) {
      return {
        sanitized: {},
        warnings: [
          `Object sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        modified: true,
      }
    }
  }

  /**
   * Sanitize URL to prevent various attacks
   */
  static sanitizeURL(url: string): {
    sanitized: string
    valid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    try {
      // Remove potentially dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
      for (const protocol of dangerousProtocols) {
        if (url.toLowerCase().startsWith(protocol)) {
          return {
            sanitized: '',
            valid: false,
            warnings: [`Blocked dangerous protocol: ${protocol}`],
          }
        }
      }

      // Validate URL format
      const urlObj = new URL(url)

      // Only allow http and https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          sanitized: '',
          valid: false,
          warnings: [`Blocked non-HTTP protocol: ${urlObj.protocol}`],
        }
      }

      // Remove fragments and normalize
      urlObj.hash = ''
      const sanitized = urlObj.toString()

      return {
        sanitized,
        valid: true,
        warnings,
      }
    } catch (error) {
      return {
        sanitized: '',
        valid: false,
        warnings: [`Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  /**
   * Sanitize filename for safe file operations
   */
  static sanitizeFilename(filename: string): {
    sanitized: string
    warnings: string[]
  } {
    const warnings: string[] = []
    let sanitized = filename

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\./g, '')
    sanitized = sanitized.replace(/\//g, '')
    sanitized = sanitized.replace(/\\/g, '')

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_')

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[\.\s]+|[\.\s]+$/g, '')

    // Ensure filename is not empty
    if (sanitized.length === 0) {
      sanitized = 'unnamed_file'
      warnings.push('Generated default filename for empty input')
    }

    // Limit length
    if (sanitized.length > 255) {
      const extension = sanitized.split('.').pop()
      const basename = sanitized.substring(0, 250 - (extension?.length || 0))
      sanitized = extension ? `${basename}.${extension}` : basename
      warnings.push('Filename truncated to 255 characters')
    }

    // Check for reserved Windows filenames
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

    const basename = sanitized.split('.')[0].toUpperCase()
    if (reservedNames.includes(basename)) {
      sanitized = `_${sanitized}`
      warnings.push('Prefixed reserved filename')
    }

    if (sanitized !== filename) {
      warnings.push('Filename was modified for safety')
    }

    return { sanitized, warnings }
  }

  /**
   * Create sanitization middleware for form data
   */
  static createFormDataSanitizer(options: SanitizationOptions = {}) {
    return (formData: {
      [key: string]: any
    }): {
      sanitized: { [key: string]: any }
      warnings: string[]
    } => {
      const result = this.sanitizeObject(formData, options)
      return {
        sanitized: result.sanitized,
        warnings: result.warnings,
      }
    }
  }

  /**
   * Batch sanitize multiple strings
   */
  static batchSanitize(
    inputs: string[],
    options: SanitizationOptions = {}
  ): {
    sanitized: string[]
    warnings: { [index: number]: string[] }
    totalModified: number
  } {
    const sanitized: string[] = []
    const warnings: { [index: number]: string[] } = {}
    let totalModified = 0

    inputs.forEach((input, index) => {
      const result = this.sanitizeText(input, options)
      sanitized[index] = result.sanitized

      if (result.warnings.length > 0) {
        warnings[index] = result.warnings
      }

      if (result.modified) {
        totalModified++
      }
    })

    return { sanitized, warnings, totalModified }
  }
}

export default DataSanitizer
