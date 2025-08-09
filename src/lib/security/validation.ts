import { z } from 'zod';

// Common validation patterns
export const patterns = {
  // Safe text input (alphanumeric + common punctuation)
  safeText: /^[a-zA-Z0-9\s\-_.,'!?()[\]{}:;@#$%&*+=|\\/<>"]*$/,
  // Process ID format
  processId: /^[A-Z]{2,3}-\d{2}$/,
  // Knowledge area codes
  knowledgeAreaCode: /^[A-Z]{2,4}$/,
  // Version format
  version: /^\d+\.\d+\.\d+$/,
  // Safe filename
  safeFilename: /^[a-zA-Z0-9\-_.()[\] ]+$/,
  // Color hex codes
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  // Email format (basic validation)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Base schemas for common types
export const BaseSchemas = {
  id: z.string().min(1).max(100),
  userId: z.string().min(1).max(50),
  timestamp: z.number().positive(),
  version: z.string().regex(patterns.version),
  score: z.number().min(0).max(100),
  percentage: z.number().min(0).max(100),
  duration: z.number().min(0),
  safeText: z.string().max(1000).regex(patterns.safeText),
  safeShortText: z.string().max(100).regex(patterns.safeText),
  processId: z.string().regex(patterns.processId),
  knowledgeAreaCode: z.string().regex(patterns.knowledgeAreaCode)
};

// User input validation schemas
export const UserInputSchemas = {
  search: z.object({
    query: z.string().max(100).regex(patterns.safeText),
    filters: z.array(z.string().max(50)).max(10).optional(),
    limit: z.number().min(1).max(100).optional().default(20)
  }),

  progressUpdate: z.object({
    processId: BaseSchemas.processId,
    progress: BaseSchemas.percentage,
    studyTime: BaseSchemas.duration.optional(),
    confidence: z.number().min(1).max(5).optional(),
    notes: z.string().max(500).regex(patterns.safeText).optional()
  }),

  examAnswer: z.object({
    questionId: BaseSchemas.id,
    answer: z.union([z.string(), z.number()]).refine((val) => {
      if (typeof val === 'string') {
        return val.length <= 10 && patterns.safeText.test(val);
      }
      return val >= 0 && val <= 10;
    }),
    timeSpent: BaseSchemas.duration.optional(),
    bookmarked: z.boolean().optional()
  }),

  flashCardReview: z.object({
    processId: BaseSchemas.processId,
    confidence: z.number().min(1).max(5),
    reviewTime: BaseSchemas.duration,
    difficulty: z.enum(['easy', 'medium', 'hard']).optional()
  }),

  userSettings: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.enum(['ja', 'en']),
    notifications: z.object({
      enabled: z.boolean(),
      studyReminders: z.boolean(),
      examReminders: z.boolean(),
      achievementAlerts: z.boolean()
    }),
    privacy: z.object({
      analytics: z.boolean(),
      dataSharing: z.boolean()
    }),
    display: z.object({
      fontSize: z.enum(['small', 'medium', 'large']),
      colorScheme: z.string().regex(patterns.hexColor).optional(),
      animations: z.boolean()
    })
  }),

  exportRequest: z.object({
    format: z.enum(['json', 'csv', 'pdf']),
    dataTypes: z.array(z.enum(['progress', 'examResults', 'flashcards', 'settings'])).min(1),
    dateRange: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional()
    }).optional()
  }),

  importData: z.object({
    format: z.enum(['json', 'csv']),
    data: z.string().max(10000000), // 10MB limit
    overwrite: z.boolean().optional().default(false)
  })
};

// API request validation schemas
export const APISchemas = {
  bulkProgressUpdate: z.object({
    updates: z.array(UserInputSchemas.progressUpdate).max(100)
  }),

  examSession: z.object({
    examType: z.enum(['mock', 'practice', 'custom']),
    questionCount: z.number().min(10).max(180),
    timeLimit: z.number().min(600).max(14400), // 10 minutes to 4 hours
    knowledgeAreas: z.array(BaseSchemas.knowledgeAreaCode).min(1).max(10),
    processGroups: z.array(z.string()).max(5).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional()
  }),

  studyPlan: z.object({
    title: BaseSchemas.safeShortText,
    description: BaseSchemas.safeText.optional(),
    targetDate: z.string().datetime(),
    knowledgeAreas: z.array(BaseSchemas.knowledgeAreaCode),
    studyHoursPerWeek: z.number().min(1).max(100),
    priority: z.enum(['low', 'medium', 'high'])
  })
};

// Security validation functions
export class ValidationService {
  private static rateLimits = new Map<string, { count: number; resetTime: number }>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly DEFAULT_RATE_LIMIT = 100; // requests per window

  /**
   * Validate and sanitize user input
   */
  static validateUserInput<T>(schema: z.ZodSchema<T>, input: unknown): { 
    success: boolean; 
    data?: T; 
    errors?: string[] 
  } {
    try {
      const result = schema.safeParse(input);
      
      if (result.success) {
        return { 
          success: true, 
          data: result.data 
        };
      } else {
        return { 
          success: false, 
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Check rate limiting for a user/IP
   */
  static checkRateLimit(identifier: string, limit: number = this.DEFAULT_RATE_LIMIT): boolean {
    const now = Date.now();
    const rateLimitData = this.rateLimits.get(identifier);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      // Reset or initialize rate limit
      this.rateLimits.set(identifier, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (rateLimitData.count >= limit) {
      return false;
    }

    rateLimitData.count++;
    return true;
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    // Basic HTML sanitization - replace with a proper library like DOMPurify in production
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, options: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > options.maxSize) {
      errors.push(`File size ${file.size} exceeds maximum ${options.maxSize} bytes`);
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`);
    }

    // Check filename for malicious patterns
    if (!patterns.safeFilename.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  static validateURL(url: string, allowedDomains?: string[]): boolean {
    try {
      const urlObj = new URL(url);
      
      // Block private IP ranges and localhost
      const hostname = urlObj.hostname;
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.match(/^172\.(1[6-9]|2\d|3[01])\./)
      ) {
        return false;
      }

      // Check against allowed domains if provided
      if (allowedDomains && allowedDomains.length > 0) {
        return allowedDomains.some(domain => hostname.endsWith(domain));
      }

      // Only allow HTTPS
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clean up old rate limit data
   */
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, data] of this.rateLimits.entries()) {
      if (now > data.resetTime) {
        this.rateLimits.delete(key);
      }
    }
  }

  /**
   * Validate JSON structure to prevent prototype pollution
   */
  static validateJSON(jsonString: string, maxDepth: number = 10): { valid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      
      // Check for dangerous keys
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      if (this.containsDangerousKeys(data, dangerousKeys, maxDepth)) {
        return { valid: false, error: 'JSON contains potentially dangerous keys' };
      }

      return { valid: true, data };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON'
      };
    }
  }

  /**
   * Recursively check for dangerous keys in objects
   */
  private static containsDangerousKeys(obj: any, dangerousKeys: string[], depth: number): boolean {
    if (depth <= 0 || obj === null || typeof obj !== 'object') {
      return false;
    }

    if (Array.isArray(obj)) {
      return obj.some(item => this.containsDangerousKeys(item, dangerousKeys, depth - 1));
    }

    for (const key in obj) {
      if (dangerousKeys.includes(key)) {
        return true;
      }
      
      if (this.containsDangerousKeys(obj[key], dangerousKeys, depth - 1)) {
        return true;
      }
    }

    return false;
  }
}

// Cleanup interval for rate limits
setInterval(() => {
  ValidationService.cleanupRateLimits();
}, 60000); // Clean up every minute

export default ValidationService;