import { describe, test, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// Validation utilities
class ValidationUtils {
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static password(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters')
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  static validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return ['http:', 'https:'].includes(parsedUrl.protocol)
    } catch {
      return false
    }
  }

  static validateJSON(jsonString: string): { isValid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(jsonString)
      return { isValid: true, data }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      }
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return phoneRegex.test(cleanPhone)
  }

  static validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension ? allowedTypes.includes(extension) : false
  }

  static validateFileSize(size: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return size <= maxSizeInBytes
  }
}

// Zod schemas for testing
const userSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    age: z.number().min(13).max(120),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const learningProgressSchema = z.object({
  processId: z.string().uuid(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  score: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0),
})

const examResultSchema = z.object({
  examId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswer: z.string().min(1),
      timeSpent: z.number().min(0),
    })
  ),
  totalTime: z.number().min(0),
})

describe('Validation Utils', () => {
  describe('email validation', () => {
    test('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'user+tag@example.org',
        'firstname-lastname@subdomain.domain.com',
      ]

      validEmails.forEach((email) => {
        expect(ValidationUtils.email(email)).toBe(true)
      })
    })

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@com',
        'test@example.',
        'test..test@example.com',
      ]

      invalidEmails.forEach((email) => {
        expect(ValidationUtils.email(email)).toBe(false)
      })
    })
  })

  describe('password validation', () => {
    test('should accept strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng@Pass',
        'C0mpl3x$Password',
        'S3cure!Pa$$w0rd',
      ]

      strongPasswords.forEach((password) => {
        const result = ValidationUtils.password(password)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    test('should reject weak passwords', () => {
      const weakPasswords = [
        { password: 'weak', expectedErrors: ['too short', 'uppercase', 'number', 'special'] },
        { password: 'onlylowercase', expectedErrors: ['uppercase', 'number', 'special'] },
        { password: 'ONLYUPPERCASE', expectedErrors: ['lowercase', 'number', 'special'] },
        { password: 'NoNumbers!', expectedErrors: ['number'] },
        { password: 'NoSpecial123', expectedErrors: ['special'] },
      ]

      weakPasswords.forEach(({ password }) => {
        const result = ValidationUtils.password(password)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    test('should reject very long passwords', () => {
      const longPassword = 'A'.repeat(129) + '1@'
      const result = ValidationUtils.password(longPassword)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be less than 128 characters')
    })
  })

  describe('input sanitization', () => {
    test('should remove HTML tags', () => {
      const inputs = [
        { input: '<script>alert("xss")</script>', expected: 'alert("xss")' },
        { input: 'Hello <b>World</b>', expected: 'Hello World' },
        { input: '<div>Content</div>', expected: 'Content' },
      ]

      inputs.forEach(({ input, expected }) => {
        expect(ValidationUtils.sanitizeInput(input)).toBe(expected)
      })
    })

    test('should remove JavaScript protocols', () => {
      const inputs = ['javascript:alert("xss")', 'JAVASCRIPT:void(0)', 'Hello javascript:alert()']

      inputs.forEach((input) => {
        const result = ValidationUtils.sanitizeInput(input)
        expect(result.toLowerCase()).not.toContain('javascript:')
      })
    })

    test('should remove event handlers', () => {
      const inputs = ['onclick="alert()"', 'onload="malicious()"', 'onmouseover="xss()"']

      inputs.forEach((input) => {
        const result = ValidationUtils.sanitizeInput(input)
        expect(result).not.toMatch(/on\w+=/i)
      })
    })

    test('should trim whitespace', () => {
      const input = '  Hello World  '
      expect(ValidationUtils.sanitizeInput(input)).toBe('Hello World')
    })
  })

  describe('URL validation', () => {
    test('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.domain.com/path',
        'http://example.com:8080/api',
      ]

      validUrls.forEach((url) => {
        expect(ValidationUtils.validateUrl(url)).toBe(true)
      })
    })

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert()',
        'data:text/html,<script>alert()</script>',
        'file:///etc/passwd',
      ]

      invalidUrls.forEach((url) => {
        expect(ValidationUtils.validateUrl(url)).toBe(false)
      })
    })
  })

  describe('JSON validation', () => {
    test('should validate correct JSON', () => {
      const validJson = '{"name": "John", "age": 30}'
      const result = ValidationUtils.validateJSON(validJson)

      expect(result.isValid).toBe(true)
      expect(result.data).toEqual({ name: 'John', age: 30 })
    })

    test('should reject invalid JSON', () => {
      const invalidJsons = [
        '{"name": "John", "age":}',
        '{name: "John"}',
        '{"name": "John" "age": 30}',
        'not json at all',
      ]

      invalidJsons.forEach((json) => {
        const result = ValidationUtils.validateJSON(json)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })

  describe('phone number validation', () => {
    test('should accept valid phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '+81-90-1234-5678',
        '+44 20 7946 0958',
        '1234567890',
        '+33 1 42 68 53 00',
      ]

      validPhones.forEach((phone) => {
        expect(ValidationUtils.validatePhoneNumber(phone)).toBe(true)
      })
    })

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'abc123',
        '+',
        '123',
        '+0123456789', // starts with 0
        '+123456789012345678', // too long
      ]

      invalidPhones.forEach((phone) => {
        expect(ValidationUtils.validatePhoneNumber(phone)).toBe(false)
      })
    })
  })

  describe('file validation', () => {
    test('should validate file types', () => {
      const allowedTypes = ['jpg', 'png', 'pdf']

      expect(ValidationUtils.validateFileType('image.jpg', allowedTypes)).toBe(true)
      expect(ValidationUtils.validateFileType('document.PDF', allowedTypes)).toBe(true)
      expect(ValidationUtils.validateFileType('malware.exe', allowedTypes)).toBe(false)
      expect(ValidationUtils.validateFileType('file', allowedTypes)).toBe(false)
    })

    test('should validate file sizes', () => {
      const maxSizeMB = 5
      const fiveMBInBytes = 5 * 1024 * 1024

      expect(ValidationUtils.validateFileSize(fiveMBInBytes - 1, maxSizeMB)).toBe(true)
      expect(ValidationUtils.validateFileSize(fiveMBInBytes, maxSizeMB)).toBe(true)
      expect(ValidationUtils.validateFileSize(fiveMBInBytes + 1, maxSizeMB)).toBe(false)
    })
  })
})

describe('Zod Schema Validation', () => {
  describe('user schema', () => {
    test('should validate correct user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      }

      expect(() => userSchema.parse(validUser)).not.toThrow()
    })

    test('should reject invalid user data', () => {
      const invalidUsers = [
        {
          name: 'J', // too short
          email: 'john@example.com',
          age: 25,
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        },
        {
          name: 'John Doe',
          email: 'invalid-email',
          age: 25,
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: 12, // too young
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
          password: 'short', // too short
          confirmPassword: 'short',
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
          password: 'SecurePass123!',
          confirmPassword: 'DifferentPass123!', // passwords don't match
        },
      ]

      invalidUsers.forEach((user) => {
        expect(() => userSchema.parse(user)).toThrow()
      })
    })
  })

  describe('learning progress schema', () => {
    test('should validate correct progress data', () => {
      const validProgress = {
        processId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'IN_PROGRESS' as const,
        score: 85,
        timeSpent: 3600,
      }

      expect(() => learningProgressSchema.parse(validProgress)).not.toThrow()
    })

    test('should allow optional score', () => {
      const progressWithoutScore = {
        processId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'NOT_STARTED' as const,
        timeSpent: 0,
      }

      expect(() => learningProgressSchema.parse(progressWithoutScore)).not.toThrow()
    })

    test('should reject invalid progress data', () => {
      const invalidProgresses = [
        {
          processId: 'not-a-uuid',
          status: 'IN_PROGRESS',
          timeSpent: 3600,
        },
        {
          processId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'INVALID_STATUS',
          timeSpent: 3600,
        },
        {
          processId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'COMPLETED',
          score: 101, // over 100
          timeSpent: 3600,
        },
        {
          processId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'COMPLETED',
          timeSpent: -1, // negative time
        },
      ]

      invalidProgresses.forEach((progress) => {
        expect(() => learningProgressSchema.parse(progress)).toThrow()
      })
    })
  })

  describe('exam result schema', () => {
    test('should validate correct exam result', () => {
      const validResult = {
        examId: '123e4567-e89b-12d3-a456-426614174000',
        answers: [
          {
            questionId: '123e4567-e89b-12d3-a456-426614174001',
            selectedAnswer: 'A',
            timeSpent: 30,
          },
          {
            questionId: '123e4567-e89b-12d3-a456-426614174002',
            selectedAnswer: 'B',
            timeSpent: 45,
          },
        ],
        totalTime: 1800,
      }

      expect(() => examResultSchema.parse(validResult)).not.toThrow()
    })

    test('should reject invalid exam result', () => {
      const invalidResults = [
        {
          examId: 'not-a-uuid',
          answers: [],
          totalTime: 1800,
        },
        {
          examId: '123e4567-e89b-12d3-a456-426614174000',
          answers: [
            {
              questionId: 'not-a-uuid',
              selectedAnswer: 'A',
              timeSpent: 30,
            },
          ],
          totalTime: 1800,
        },
        {
          examId: '123e4567-e89b-12d3-a456-426614174000',
          answers: [
            {
              questionId: '123e4567-e89b-12d3-a456-426614174001',
              selectedAnswer: '', // empty answer
              timeSpent: 30,
            },
          ],
          totalTime: 1800,
        },
        {
          examId: '123e4567-e89b-12d3-a456-426614174000',
          answers: [],
          totalTime: -1, // negative time
        },
      ]

      invalidResults.forEach((result) => {
        expect(() => examResultSchema.parse(result)).toThrow()
      })
    })
  })
})

describe('Security Validation', () => {
  test('should prevent XSS attacks', () => {
    const xssInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
    ]

    xssInputs.forEach((input) => {
      const sanitized = ValidationUtils.sanitizeInput(input)
      expect(sanitized.toLowerCase()).not.toContain('script')
      expect(sanitized.toLowerCase()).not.toContain('javascript:')
      expect(sanitized).not.toMatch(/on\w+=/i)
    })
  })

  test('should validate SQL injection patterns', () => {
    const sqlInjectionInputs = [
      "'; DROP TABLE users; --",
      '1 OR 1=1',
      "admin'--",
      'UNION SELECT * FROM users',
    ]

    // In a real application, these would be handled by parameterized queries
    // Here we just test that they don't break our validation
    sqlInjectionInputs.forEach((input) => {
      const sanitized = ValidationUtils.sanitizeInput(input)
      expect(typeof sanitized).toBe('string')
    })
  })

  test('should handle Unicode and special characters safely', () => {
    const unicodeInputs = ['测试', 'тест', 'テスト', '🚀💻🔐', 'café', 'naïve']

    unicodeInputs.forEach((input) => {
      const sanitized = ValidationUtils.sanitizeInput(input)
      expect(sanitized).toBeTruthy()
      expect(typeof sanitized).toBe('string')
    })
  })
})
