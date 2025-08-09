import { ValidationService } from './validation';

export interface CSRFToken {
  token: string;
  expiresAt: number;
  userId?: string;
  sessionId?: string;
}

export interface CSRFConfig {
  tokenExpiry: number; // milliseconds
  cookieName: string;
  headerName: string;
  secretKey: string;
}

export class CSRFProtection {
  private config: CSRFConfig;
  private tokenStore: Map<string, CSRFToken> = new Map();
  private readonly DEFAULT_EXPIRY = 3600000; // 1 hour

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = {
      tokenExpiry: config.tokenExpiry || this.DEFAULT_EXPIRY,
      cookieName: config.cookieName || 'csrf-token',
      headerName: config.headerName || 'X-CSRF-Token',
      secretKey: config.secretKey || this.generateSecretKey()
    };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(userId?: string, sessionId?: string): string {
    const tokenValue = ValidationService.generateSecureToken(32);
    const expiresAt = Date.now() + this.config.tokenExpiry;
    
    const token: CSRFToken = {
      token: tokenValue,
      expiresAt,
      userId,
      sessionId
    };

    this.tokenStore.set(tokenValue, token);
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return tokenValue;
  }

  /**
   * Validate CSRF token
   */
  validateToken(tokenValue: string, userId?: string, sessionId?: string): boolean {
    if (!tokenValue || typeof tokenValue !== 'string') {
      return false;
    }

    const token = this.tokenStore.get(tokenValue);
    if (!token) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > token.expiresAt) {
      this.tokenStore.delete(tokenValue);
      return false;
    }

    // Validate user context if provided
    if (userId && token.userId && token.userId !== userId) {
      return false;
    }

    if (sessionId && token.sessionId && token.sessionId !== sessionId) {
      return false;
    }

    return true;
  }

  /**
   * Invalidate a token
   */
  invalidateToken(tokenValue: string): void {
    this.tokenStore.delete(tokenValue);
  }

  /**
   * Set CSRF token in cookie (browser environment)
   */
  setTokenCookie(tokenValue: string, options: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
    path?: string;
  } = {}): void {
    if (typeof document === 'undefined') {
      console.warn('Cannot set cookie in non-browser environment');
      return;
    }

    const cookieOptions = {
      secure: options.secure ?? true,
      sameSite: options.sameSite ?? 'strict',
      domain: options.domain,
      path: options.path ?? '/',
      maxAge: Math.floor(this.config.tokenExpiry / 1000)
    };

    let cookieString = `${this.config.cookieName}=${tokenValue}`;
    
    Object.entries(cookieOptions).forEach(([key, value]) => {
      if (value !== undefined) {
        cookieString += `; ${key}=${value}`;
      }
    });

    cookieString += '; HttpOnly; SameSite=' + cookieOptions.sameSite;

    document.cookie = cookieString;
  }

  /**
   * Get CSRF token from cookie (browser environment)
   */
  getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.config.cookieName}=`)
    );

    if (csrfCookie) {
      return csrfCookie.split('=')[1].trim();
    }

    return null;
  }

  /**
   * Create CSRF-protected fetch wrapper
   */
  createProtectedFetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
    return async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const method = init.method?.toUpperCase() || 'GET';
      
      // Only protect state-changing methods
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // Get current token
        let token = this.getTokenFromCookie();
        
        // Generate new token if none exists
        if (!token) {
          token = this.generateToken();
          this.setTokenCookie(token);
        }

        // Add CSRF token to headers
        const headers = new Headers(init.headers);
        headers.set(this.config.headerName, token);
        
        init.headers = headers;
      }

      return fetch(input, init);
    };
  }

  /**
   * Validate request for CSRF token
   */
  validateRequest(request: {
    method: string;
    headers: { [key: string]: string };
    cookies?: { [key: string]: string };
  }, userId?: string): { valid: boolean; error?: string } {
    const method = request.method.toUpperCase();
    
    // Only validate state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return { valid: true };
    }

    // Get token from header
    const tokenFromHeader = request.headers[this.config.headerName] || 
                           request.headers[this.config.headerName.toLowerCase()];

    if (!tokenFromHeader) {
      return { valid: false, error: 'CSRF token missing from header' };
    }

    // Validate token
    const isValid = this.validateToken(tokenFromHeader, userId);
    
    if (!isValid) {
      return { valid: false, error: 'Invalid or expired CSRF token' };
    }

    return { valid: true };
  }

  /**
   * Middleware for Express-like frameworks
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      // Add CSRF token generation method to request
      req.generateCSRFToken = (userId?: string) => {
        const token = this.generateToken(userId);
        res.cookie(this.config.cookieName, token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: this.config.tokenExpiry
        });
        return token;
      };

      // Skip validation for GET requests
      if (req.method === 'GET') {
        return next();
      }

      // Validate CSRF token for state-changing requests
      const validation = this.validateRequest({
        method: req.method,
        headers: req.headers,
        cookies: req.cookies
      }, req.user?.id);

      if (!validation.valid) {
        return res.status(403).json({
          error: 'CSRF validation failed',
          message: validation.error
        });
      }

      next();
    };
  }

  /**
   * Create form with CSRF token (for server-side rendering)
   */
  createFormWithToken(formHTML: string, userId?: string): string {
    const token = this.generateToken(userId);
    const hiddenInput = `<input type="hidden" name="csrf_token" value="${token}" />`;
    
    // Insert hidden input after opening form tag
    return formHTML.replace(/(<form[^>]*>)/i, `$1\n${hiddenInput}`);
  }

  /**
   * Verify form submission token
   */
  verifyFormToken(formData: { [key: string]: any }, userId?: string): boolean {
    const token = formData.csrf_token || formData._token;
    return this.validateToken(token, userId);
  }

  /**
   * Get token statistics
   */
  getTokenStats(): {
    totalTokens: number;
    expiredTokens: number;
    validTokens: number;
  } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const token of this.tokenStore.values()) {
      if (now > token.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalTokens: this.tokenStore.size,
      expiredTokens: expired,
      validTokens: valid
    };
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, token] of this.tokenStore.entries()) {
      if (now > token.expiresAt) {
        this.tokenStore.delete(key);
      }
    }
  }

  /**
   * Generate secret key for token signing
   */
  private generateSecretKey(): string {
    return ValidationService.generateSecureToken(64);
  }

  /**
   * Clear all tokens (for testing)
   */
  clearAllTokens(): void {
    this.tokenStore.clear();
  }

  /**
   * Configure automatic cleanup interval
   */
  startCleanupInterval(intervalMs: number = 300000): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupExpiredTokens();
    }, intervalMs);
  }
}

// Global CSRF protection instance
export const csrfProtection = new CSRFProtection();

// React hook for CSRF token management
export function useCSRFToken(userId?: string): {
  token: string | null;
  generateToken: () => string;
  validateToken: (token: string) => boolean;
  protectedFetch: typeof fetch;
} {
  const generateToken = (): string => {
    const token = csrfProtection.generateToken(userId);
    csrfProtection.setTokenCookie(token);
    return token;
  };

  const validateToken = (token: string): boolean => {
    return csrfProtection.validateToken(token, userId);
  };

  const protectedFetch = csrfProtection.createProtectedFetch();

  return {
    token: csrfProtection.getTokenFromCookie(),
    generateToken,
    validateToken,
    protectedFetch
  };
}

export default CSRFProtection;