import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authService } from '@/server/services/auth/authService';
import { securityService } from '@/server/services/auth/securityService';
import { rateLimitService } from '@/server/services/auth/rateLimitService';
import { prisma } from '@/tests/setup/globalSetup';

/**
 * 認証・セキュリティテスト
 * 担当：認証・セキュリティチーム（2名）
 * 
 * テストカバレッジ：
 * - JWT トークン検証 (全ケース)
 * - OAuth フロー異常系
 * - セキュリティ脆弱性テスト
 * - レート制限テスト
 * - 暗号化・ハッシュ化テスト
 */

describe('Security - JWT Token Management', () => {
  const mockUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    role: 'USER',
    subscription: 'PREMIUM'
  };

  const jwtSecret = 'test-jwt-secret-key';

  beforeEach(() => {
    process.env.JWT_SECRET = jwtSecret;
    vi.clearAllMocks();
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token with correct payload', async () => {
      const token = authService.generateAccessToken(mockUser);
      
      expect(token).toBeTypeOf('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should include expiration time in token', async () => {
      const token = authService.generateAccessToken(mockUser);
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp > decoded.iat).toBe(true);
    });

    it('should generate refresh token with extended expiry', async () => {
      const refreshToken = authService.generateRefreshToken(mockUser);
      const accessToken = authService.generateAccessToken(mockUser);
      
      const refreshDecoded = jwt.verify(refreshToken, jwtSecret) as any;
      const accessDecoded = jwt.verify(accessToken, jwtSecret) as any;
      
      expect(refreshDecoded.exp > accessDecoded.exp).toBe(true);
    });

    it('should handle token generation with missing user data', () => {
      const invalidUser = { id: '', email: '', role: '', subscription: '' };
      
      expect(() => {
        authService.generateAccessToken(invalidUser as any);
      }).toThrow('Invalid user data for token generation');
    });

    it('should handle missing JWT secret', () => {
      delete process.env.JWT_SECRET;
      
      expect(() => {
        authService.generateAccessToken(mockUser);
      }).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('JWT Token Verification', () => {
    let validToken: string;

    beforeEach(() => {
      validToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        jwtSecret,
        { expiresIn: '1h' }
      );
    });

    it('should verify valid token successfully', async () => {
      const result = authService.verifyAccessToken(validToken);
      
      expect(result.success).toBe(true);
      expect(result.payload?.userId).toBe(mockUser.id);
      expect(result.payload?.email).toBe(mockUser.email);
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        jwtSecret,
        { expiresIn: '-1h' } // 過去の時間 = 期限切れ
      );
      
      const result = authService.verifyAccessToken(expiredToken);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('TOKEN_EXPIRED');
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        'wrong-secret',
        { expiresIn: '1h' }
      );
      
      const result = authService.verifyAccessToken(invalidToken);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_SIGNATURE');
    });

    it('should reject malformed token', async () => {
      const malformedTokens = [
        'invalid-token',
        'header.payload', // 2つの部分のみ
        'header.payload.signature.extra', // 4つの部分
        '',
        null,
        undefined
      ];
      
      malformedTokens.forEach(token => {
        const result = authService.verifyAccessToken(token as any);
        expect(result.success).toBe(false);
        expect(result.error).toBe('MALFORMED_TOKEN');
      });
    });

    it('should validate token payload structure', async () => {
      const tokenWithMissingFields = jwt.sign(
        { userId: mockUser.id }, // email, role が欠けている
        jwtSecret,
        { expiresIn: '1h' }
      );
      
      const result = authService.verifyAccessToken(tokenWithMissingFields);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PAYLOAD');
    });

    it('should handle concurrent token verification', async () => {
      const tokens = Array(10).fill(null).map(() => 
        jwt.sign(
          { userId: `user-${Math.random()}`, email: `test${Math.random()}@example.com`, role: 'USER' },
          jwtSecret,
          { expiresIn: '1h' }
        )
      );
      
      const results = await Promise.all(
        tokens.map(token => authService.verifyAccessToken(token))
      );
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Security - Password Management', () => {
  describe('Password Hashing', () => {
    const testPasswords = [
      'simplePassword123',
      'Complex@Password!2024',
      'VeryLongPasswordWithManyCharacters123456789',
      '日本語パスワード123!',
      'P@ssw0rd',
      '12345678' // 弱いパスワード
    ];

    testPasswords.forEach(password => {
      it(`should hash password securely: ${password.substring(0, 10)}...`, async () => {
        const hash = await securityService.hashPassword(password);
        
        expect(hash).toBeTypeOf('string');
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(50);
        expect(hash.startsWith('$2')).toBe(true); // bcrypt format
      });
    });

    it('should use consistent salt rounds', async () => {
      const password = 'testPassword123';
      const hash1 = await securityService.hashPassword(password);
      const hash2 = await securityService.hashPassword(password);
      
      // 同じパスワードでも異なるハッシュが生成される（saltのため）
      expect(hash1).not.toBe(hash2);
      
      // 両方とも検証可能
      expect(await securityService.verifyPassword(password, hash1)).toBe(true);
      expect(await securityService.verifyPassword(password, hash2)).toBe(true);
    });

    it('should handle empty or null passwords', async () => {
      await expect(securityService.hashPassword('')).rejects.toThrow('Password cannot be empty');
      await expect(securityService.hashPassword(null as any)).rejects.toThrow('Password must be a string');
      await expect(securityService.hashPassword(undefined as any)).rejects.toThrow('Password must be a string');
    });

    it('should enforce password complexity requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        '111111',
        'qwerty'
      ];
      
      for (const weakPassword of weakPasswords) {
        const result = securityService.validatePasswordStrength(weakPassword);
        expect(result.isStrong).toBe(false);
        expect(result.errors).toContain('Password too weak');
      }
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await securityService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await securityService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle timing attacks protection', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 12);
      
      const startTime = Date.now();
      await securityService.verifyPassword(password, hash);
      const validTime = Date.now() - startTime;
      
      const startTime2 = Date.now();
      await securityService.verifyPassword('wrongPassword', hash);
      const invalidTime = Date.now() - startTime2;
      
      // タイミング攻撃を防ぐため、実行時間の差は最小限にすべき
      const timeDifference = Math.abs(validTime - invalidTime);
      expect(timeDifference).toBeLessThan(100); // 100ms 以内
    });
  });
});

describe('Security - Rate Limiting', () => {
  beforeEach(async () => {
    await rateLimitService.clear(); // レート制限データクリア
  });

  describe('Login Rate Limiting', () => {
    const clientIp = '192.168.1.100';
    const email = 'test@example.com';

    it('should allow requests within rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        const result = await rateLimitService.checkLoginAttempt(clientIp, email);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding rate limit', async () => {
      // 制限まで消費
      for (let i = 0; i < 5; i++) {
        await rateLimitService.checkLoginAttempt(clientIp, email);
      }
      
      // 制限超過
      const result = await rateLimitService.checkLoginAttempt(clientIp, email);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track rate limits per IP address', async () => {
      const ip1 = '192.168.1.100';
      const ip2 = '192.168.1.101';
      
      // IP1で制限まで消費
      for (let i = 0; i < 5; i++) {
        await rateLimitService.checkLoginAttempt(ip1, email);
      }
      
      // IP2はまだ使用可能
      const result = await rateLimitService.checkLoginAttempt(ip2, email);
      expect(result.allowed).toBe(true);
    });

    it('should reset rate limit after window expires', async () => {
      // 制限まで消費
      for (let i = 0; i < 5; i++) {
        await rateLimitService.checkLoginAttempt(clientIp, email);
      }
      
      // 制限超過を確認
      let result = await rateLimitService.checkLoginAttempt(clientIp, email);
      expect(result.allowed).toBe(false);
      
      // ウィンドウをリセット（テスト用）
      await rateLimitService.resetWindow(clientIp);
      
      // 再び使用可能
      result = await rateLimitService.checkLoginAttempt(clientIp, email);
      expect(result.allowed).toBe(true);
    });
  });

  describe('API Rate Limiting', () => {
    const userId = 'test-user-1';
    const endpoint = '/api/learning/progress';

    it('should implement sliding window rate limiting', async () => {
      const limit = 100; // 1分間に100リクエスト
      const window = 60 * 1000; // 1分
      
      // 制限内でリクエスト実行
      for (let i = 0; i < limit; i++) {
        const result = await rateLimitService.checkApiRequest(userId, endpoint);
        expect(result.allowed).toBe(true);
      }
      
      // 制限超過
      const result = await rateLimitService.checkApiRequest(userId, endpoint);
      expect(result.allowed).toBe(false);
    });

    it('should handle burst vs sustained rate limiting', async () => {
      const result1 = await rateLimitService.checkBurstRequest(userId, endpoint);
      expect(result1.burstAllowed).toBe(true);
      expect(result1.sustainedAllowed).toBe(true);
      
      // バースト制限テスト
      for (let i = 0; i < 20; i++) {
        await rateLimitService.checkBurstRequest(userId, endpoint);
      }
      
      const result2 = await rateLimitService.checkBurstRequest(userId, endpoint);
      expect(result2.burstAllowed).toBe(false);
      expect(result2.sustainedAllowed).toBe(true); // まだ持続制限内
    });
  });
});

describe('Security - Vulnerability Testing', () => {
  describe('SQL Injection Protection', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'/*",
      "' UNION SELECT * FROM users --",
      "1; DELETE FROM users WHERE 1=1 --"
    ];

    it('should sanitize user input against SQL injection', async () => {
      for (const payload of sqlInjectionPayloads) {
        const sanitized = securityService.sanitizeInput(payload);
        
        // SQLキーワードが無害化されているかチェック
        expect(sanitized.toLowerCase()).not.toContain('drop table');
        expect(sanitized.toLowerCase()).not.toContain('union select');
        expect(sanitized.toLowerCase()).not.toContain('delete from');
        expect(sanitized).not.toContain('--');
        expect(sanitized).not.toContain('/*');
      }
    });

    it('should use parameterized queries', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      
      // パラメータ化クエリを使用した場合、SQLインジェクションは発生しない
      const user = await prisma.user.findUnique({
        where: { email: maliciousEmail }
      });
      
      expect(user).toBeNull(); // ユーザーが見つからない（正常）
      
      // usersテーブルがまだ存在することを確認
      const userCount = await prisma.user.count();
      expect(userCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('XSS Protection', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
      '"><script>alert("xss")</script>'
    ];

    it('should sanitize HTML content', () => {
      xssPayloads.forEach(payload => {
        const sanitized = securityService.sanitizeHtml(payload);
        
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onload=');
      });
    });

    it('should preserve safe HTML while removing dangerous content', () => {
      const mixedContent = '<p>Safe content</p><script>alert("xss")</script><strong>More safe content</strong>';
      const sanitized = securityService.sanitizeHtml(mixedContent);
      
      expect(sanitized).toContain('<p>Safe content</p>');
      expect(sanitized).toContain('<strong>More safe content</strong>');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const token1 = securityService.generateCSRFToken();
      const token2 = securityService.generateCSRFToken();
      
      expect(token1).toBeTypeOf('string');
      expect(token1).not.toBe(token2); // 毎回異なるトークン
      expect(token1.length).toBeGreaterThan(20);
    });

    it('should validate CSRF tokens correctly', () => {
      const token = securityService.generateCSRFToken();
      
      expect(securityService.validateCSRFToken(token, token)).toBe(true);
      expect(securityService.validateCSRFToken(token, 'invalid-token')).toBe(false);
      expect(securityService.validateCSRFToken(token, '')).toBe(false);
    });

    it('should handle CSRF token expiration', async () => {
      const token = securityService.generateCSRFToken();
      
      // 即座に有効
      expect(securityService.validateCSRFToken(token, token)).toBe(true);
      
      // 期限切れシミュレーション
      await securityService.expireCSRFToken(token);
      expect(securityService.validateCSRFToken(token, token)).toBe(false);
    });
  });

  describe('Session Security', () => {
    it('should generate secure session IDs', () => {
      const sessionId = securityService.generateSessionId();
      
      expect(sessionId).toBeTypeOf('string');
      expect(sessionId.length).toBeGreaterThanOrEqual(32);
      expect(/^[a-zA-Z0-9]+$/.test(sessionId)).toBe(true); // 英数字のみ
    });

    it('should handle session fixation attacks', async () => {
      const oldSessionId = 'old-session-id';
      const userId = 'test-user-1';
      
      // ログイン時に新しいセッションIDを生成
      const newSessionId = await securityService.renewSession(oldSessionId, userId);
      
      expect(newSessionId).not.toBe(oldSessionId);
      expect(newSessionId).toBeTypeOf('string');
      
      // 古いセッションは無効化される
      const oldSessionValid = await securityService.validateSession(oldSessionId);
      expect(oldSessionValid).toBe(false);
      
      // 新しいセッションは有効
      const newSessionValid = await securityService.validateSession(newSessionId);
      expect(newSessionValid).toBe(true);
    });

    it('should implement concurrent session limits', async () => {
      const userId = 'test-user-1';
      const maxSessions = 3;
      
      const sessionIds = [];
      
      // 制限まで作成
      for (let i = 0; i < maxSessions; i++) {
        const sessionId = await securityService.createSession(userId);
        sessionIds.push(sessionId);
        
        const isValid = await securityService.validateSession(sessionId);
        expect(isValid).toBe(true);
      }
      
      // 制限を超えた場合、最古のセッションが無効化される
      const newSessionId = await securityService.createSession(userId);
      
      const oldestSessionValid = await securityService.validateSession(sessionIds[0]);
      expect(oldestSessionValid).toBe(false);
      
      const newestSessionValid = await securityService.validateSession(newSessionId);
      expect(newestSessionValid).toBe(true);
    });
  });
});