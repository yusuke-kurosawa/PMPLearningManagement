import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { testDb, mockPrismaClient } from '../utils/db';
import { createUser, createAdminUser } from '../factories/userFactory';
import { createTestContext } from '../utils/api';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const mockBcrypt = vi.mocked(bcrypt);
const mockJwt = vi.mocked(jwt);

// Integrated auth flow service
class AuthFlowService {
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    // Check if user already exists
    const existingUser = testDb.findMany('user', {}).find(
      (u: any) => u.email === userData.email
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await mockBcrypt.hash(userData.password, 12);

    // Create user
    const user = testDb.create('user', {
      name: userData.name,
      email: userData.email,
      hashedPassword,
      emailVerified: null,
      role: 'USER',
      createdAt: new Date(),
    });

    // Generate email verification token
    const verificationToken = mockJwt.sign(
      { sub: user.id, type: 'email_verification' },
      'test-secret',
      { expiresIn: '24h' }
    );

    // Create initial learning progress
    testDb.create('learningProgress', {
      userId: user.id,
      totalStudyTime: 0,
      completedProcesses: [],
      currentStreak: 0,
    });

    // Create user settings
    testDb.create('userSettings', {
      userId: user.id,
      theme: 'light',
      notifications: {
        email: true,
        push: false,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      verificationToken,
    };
  }

  async verifyEmail(token: string) {
    const decoded = mockJwt.verify(token, 'test-secret') as any;
    
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    const user = testDb.findUnique('user', { id: decoded.sub });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify email
    testDb.update('user', { id: user.id }, {
      emailVerified: new Date(),
    });

    return { success: true };
  }

  async login(credentials: { email: string; password: string }) {
    const user = testDb.findMany('user', {}).find(
      (u: any) => u.email === credentials.email
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    const isValidPassword = await mockBcrypt.compare(
      credentials.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = mockJwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      'test-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = mockJwt.sign(
      { sub: user.id, type: 'refresh' },
      'test-secret',
      { expiresIn: '7d' }
    );

    // Update last login
    testDb.update('user', { id: user.id }, {
      lastLoginAt: new Date(),
    });

    // Create session
    testDb.create('session', {
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const decoded = mockJwt.verify(refreshToken, 'test-secret') as any;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = testDb.findUnique('user', { id: decoded.sub });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if refresh token exists and is not expired
    const session = testDb.findMany('session', { userId: user.id })[0];
    if (!session || session.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = mockJwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      'test-secret',
      { expiresIn: '15m' }
    );

    const newRefreshToken = mockJwt.sign(
      { sub: user.id, type: 'refresh' },
      'test-secret',
      { expiresIn: '7d' }
    );

    // Update session
    testDb.update('session', { userId: user.id }, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    // Remove all sessions for user
    const sessions = testDb.findMany('session', { userId });
    sessions.forEach((session: any) => {
      testDb.delete('session', { id: session.id });
    });

    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = testDb.findUnique('user', { id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await mockBcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const newHashedPassword = await mockBcrypt.hash(newPassword, 12);

    // Update password
    testDb.update('user', { id: userId }, {
      hashedPassword: newHashedPassword,
    });

    // Invalidate all sessions
    await this.logout(userId);

    return { success: true };
  }

  async resetPassword(email: string) {
    const user = testDb.findMany('user', {}).find(
      (u: any) => u.email === email
    );

    if (!user) {
      // Don't reveal if user exists
      return { message: 'Reset link sent if account exists' };
    }

    // Generate reset token
    const resetToken = mockJwt.sign(
      { sub: user.id, type: 'password_reset' },
      'test-secret',
      { expiresIn: '1h' }
    );

    // Store reset token
    testDb.create('passwordReset', {
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    return { resetToken }; // In real app, send via email
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const decoded = mockJwt.verify(token, 'test-secret') as any;
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    // Check if reset token is valid and not expired
    const resetRecord = testDb.findMany('passwordReset', { userId: decoded.sub })
      .find((r: any) => r.token === token);

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await mockBcrypt.hash(newPassword, 12);

    // Update password
    testDb.update('user', { id: decoded.sub }, {
      hashedPassword,
    });

    // Remove reset token
    testDb.delete('passwordReset', { id: resetRecord.id });

    // Invalidate all sessions
    await this.logout(decoded.sub);

    return { success: true };
  }
}

describe('Authentication Flow Integration', () => {
  let authService: AuthFlowService;

  beforeEach(() => {
    testDb.reset();
    authService = new AuthFlowService();
    vi.clearAllMocks();

    // Setup bcrypt mocks
    mockBcrypt.hash.mockImplementation(async (password) => `hashed_${password}`);
    mockBcrypt.compare.mockImplementation(async (plain, hashed) => {
      return hashed === `hashed_${plain}`;
    });

    // Setup JWT mocks
    mockJwt.sign.mockImplementation((payload: any) => {
      return `token_${payload.sub}_${payload.type || 'access'}`;
    });

    mockJwt.verify.mockImplementation((token: string) => {
      const [, userId, type] = token.split('_');
      return {
        sub: userId,
        type: type === 'access' ? undefined : type,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Registration Flow', () => {
    test('should complete full registration process', async () => {
      // Step 1: Register user
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const registrationResult = await authService.register(registrationData);

      expect(registrationResult.user.email).toBe('john@example.com');
      expect(registrationResult.verificationToken).toBeDefined();

      // Step 2: Verify email
      const verificationResult = await authService.verifyEmail(
        registrationResult.verificationToken
      );

      expect(verificationResult.success).toBe(true);

      // Step 3: Login after verification
      const loginResult = await authService.login({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(loginResult.user.email).toBe('john@example.com');
      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.refreshToken).toBeDefined();

      // Verify user data was created properly
      const user = testDb.findMany('user', {}).find(
        (u: any) => u.email === 'john@example.com'
      );

      expect(user.emailVerified).toBeTruthy();
      expect(user.lastLoginAt).toBeTruthy();

      // Verify supporting records were created
      const progress = testDb.findMany('learningProgress', { userId: user.id });
      expect(progress).toHaveLength(1);

      const settings = testDb.findMany('userSettings', { userId: user.id });
      expect(settings).toHaveLength(1);
    });

    test('should prevent login before email verification', async () => {
      // Register user
      const registrationResult = await authService.register({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'SecurePass123!',
      });

      // Try to login before verification
      await expect(
        authService.login({
          email: 'unverified@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow('Email not verified');
    });

    test('should prevent duplicate registrations', async () => {
      // Register first user
      await authService.register({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      });

      // Try to register with same email
      await expect(
        authService.register({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'DifferentPass123!',
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('Token Refresh Flow', () => {
    test('should refresh tokens successfully', async () => {
      // Setup: Register, verify, and login
      const registrationResult = await authService.register({
        name: 'Token User',
        email: 'token@example.com',
        password: 'SecurePass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      const loginResult = await authService.login({
        email: 'token@example.com',
        password: 'SecurePass123!',
      });

      // Refresh token
      const refreshResult = await authService.refreshToken(
        loginResult.refreshToken
      );

      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.accessToken).not.toBe(loginResult.accessToken);
      expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);

      // Verify session was updated
      const user = testDb.findMany('user', {}).find(
        (u: any) => u.email === 'token@example.com'
      );
      const session = testDb.findMany('session', { userId: user.id })[0];

      expect(session.accessToken).toBe(refreshResult.accessToken);
      expect(session.refreshToken).toBe(refreshResult.refreshToken);
    });

    test('should reject invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid_token')
      ).rejects.toThrow();
    });

    test('should reject wrong token type', async () => {
      mockJwt.verify.mockReturnValueOnce({
        sub: 'user-123',
        type: 'email_verification', // Wrong type
      });

      await expect(
        authService.refreshToken('wrong_type_token')
      ).rejects.toThrow('Invalid token type');
    });
  });

  describe('Password Management Flow', () => {
    test('should change password successfully', async () => {
      // Setup user
      const registrationResult = await authService.register({
        name: 'Password User',
        email: 'password@example.com',
        password: 'OldPass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      const loginResult = await authService.login({
        email: 'password@example.com',
        password: 'OldPass123!',
      });

      // Change password
      const changeResult = await authService.changePassword(
        loginResult.user.id,
        'OldPass123!',
        'NewPass123!'
      );

      expect(changeResult.success).toBe(true);

      // Verify old password no longer works
      await expect(
        authService.login({
          email: 'password@example.com',
          password: 'OldPass123!',
        })
      ).rejects.toThrow('Invalid credentials');

      // Verify new password works
      const newLoginResult = await authService.login({
        email: 'password@example.com',
        password: 'NewPass123!',
      });

      expect(newLoginResult.user.email).toBe('password@example.com');

      // Verify all sessions were invalidated
      const sessionsAfterChange = testDb.findMany('session', { 
        userId: loginResult.user.id 
      });
      expect(sessionsAfterChange).toHaveLength(1); // Only the new login session
    });

    test('should reject incorrect current password', async () => {
      const registrationResult = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'CorrectPass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'CorrectPass123!',
      });

      await expect(
        authService.changePassword(
          loginResult.user.id,
          'WrongPass123!',
          'NewPass123!'
        )
      ).rejects.toThrow('Invalid current password');
    });
  });

  describe('Password Reset Flow', () => {
    test('should complete password reset process', async () => {
      // Setup user
      const registrationResult = await authService.register({
        name: 'Reset User',
        email: 'reset@example.com',
        password: 'OldPass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      // Request password reset
      const resetRequestResult = await authService.resetPassword('reset@example.com');
      expect(resetRequestResult.resetToken).toBeDefined();

      // Complete password reset
      const resetResult = await authService.confirmPasswordReset(
        resetRequestResult.resetToken,
        'NewPass123!'
      );

      expect(resetResult.success).toBe(true);

      // Verify old password no longer works
      await expect(
        authService.login({
          email: 'reset@example.com',
          password: 'OldPass123!',
        })
      ).rejects.toThrow('Invalid credentials');

      // Verify new password works
      const loginResult = await authService.login({
        email: 'reset@example.com',
        password: 'NewPass123!',
      });

      expect(loginResult.user.email).toBe('reset@example.com');

      // Verify reset token was consumed
      const resetTokens = testDb.findMany('passwordReset', {});
      expect(resetTokens).toHaveLength(0);
    });

    test('should not reveal if user exists during reset request', async () => {
      const result = await authService.resetPassword('nonexistent@example.com');
      expect(result.message).toBe('Reset link sent if account exists');
      expect(result.resetToken).toBeUndefined();
    });

    test('should reject expired reset tokens', async () => {
      const user = createUser();
      testDb.create('user', user);

      // Create expired reset token
      const expiredToken = 'expired_token';
      testDb.create('passwordReset', {
        userId: user.id,
        token: expiredToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      });

      mockJwt.verify.mockReturnValueOnce({
        sub: user.id,
        type: 'password_reset',
      });

      await expect(
        authService.confirmPasswordReset(expiredToken, 'NewPass123!')
      ).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('Session Management', () => {
    test('should handle multiple concurrent sessions', async () => {
      const registrationResult = await authService.register({
        name: 'Multi Session User',
        email: 'multisession@example.com',
        password: 'SecurePass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      // Login multiple times (simulating different devices)
      const login1 = await authService.login({
        email: 'multisession@example.com',
        password: 'SecurePass123!',
      });

      // Clear sessions to simulate new login
      await authService.logout(login1.user.id);

      const login2 = await authService.login({
        email: 'multisession@example.com',
        password: 'SecurePass123!',
      });

      expect(login1.accessToken).not.toBe(login2.accessToken);
    });

    test('should invalidate all sessions on logout', async () => {
      const registrationResult = await authService.register({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'SecurePass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      const loginResult = await authService.login({
        email: 'logout@example.com',
        password: 'SecurePass123!',
      });

      // Logout
      const logoutResult = await authService.logout(loginResult.user.id);
      expect(logoutResult.success).toBe(true);

      // Verify sessions were removed
      const sessions = testDb.findMany('session', { userId: loginResult.user.id });
      expect(sessions).toHaveLength(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed tokens gracefully', async () => {
      const malformedTokens = [
        'not-a-jwt-token',
        'malformed.jwt.token',
        '',
        null,
        undefined,
      ];

      for (const token of malformedTokens) {
        mockJwt.verify.mockImplementationOnce(() => {
          throw new Error('Invalid token');
        });

        await expect(
          authService.refreshToken(token as string)
        ).rejects.toThrow();
      }
    });

    test('should handle database errors during registration', async () => {
      // Mock database error
      vi.spyOn(testDb, 'create').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      await expect(
        authService.register({
          name: 'Error User',
          email: 'error@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle bcrypt errors', async () => {
      mockBcrypt.hash.mockRejectedValueOnce(new Error('Hashing failed'));

      await expect(
        authService.register({
          name: 'Hash Error User',
          email: 'hasherror@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow('Hashing failed');
    });

    test('should handle concurrent login attempts', async () => {
      const registrationResult = await authService.register({
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        password: 'SecurePass123!',
      });

      await authService.verifyEmail(registrationResult.verificationToken);

      // Simulate concurrent login attempts
      const loginPromises = Array.from({ length: 3 }, () =>
        authService.login({
          email: 'concurrent@example.com',
          password: 'SecurePass123!',
        })
      );

      const results = await Promise.all(loginPromises);
      
      // All should succeed with different tokens
      results.forEach((result, index) => {
        expect(result.user.email).toBe('concurrent@example.com');
        expect(result.accessToken).toBeDefined();
        
        // Each login should have different tokens
        results.slice(index + 1).forEach(otherResult => {
          expect(result.accessToken).not.toBe(otherResult.accessToken);
        });
      });
    });
  });
});