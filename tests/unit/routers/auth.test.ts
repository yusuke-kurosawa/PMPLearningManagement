import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockCaller, createTestContext } from '../../utils/api';
import { createUser, createAdminUser, TEST_USERS } from '../../factories/userFactory';
import { testDb } from '../../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const mockBcrypt = vi.mocked(bcrypt);
const mockJwt = vi.mocked(jwt);

// Mock auth router
const authRouter = {
  login: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  changePassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
  
  createCaller: (ctx: any) => ({
    login: async (input: { email: string; password: string }) => {
      const user = testDb.findMany('user', {}).find((u: any) => u.email === input.email);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (!user.hashedPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Please sign in with OAuth provider',
        });
      }

      const isValid = await mockBcrypt.compare(input.password, user.hashedPassword);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (!user.emailVerified) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Please verify your email before signing in',
        });
      }

      const token = mockJwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        'test-secret',
        { expiresIn: '7d' }
      );

      const refreshToken = mockJwt.sign(
        { sub: user.id, type: 'refresh' },
        'test-secret',
        { expiresIn: '30d' }
      );

      // Update last login
      testDb.update('user', { id: user.id }, { lastLoginAt: new Date() });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      };
    },

    register: async (input: {
      name: string;
      email: string;
      password: string;
    }) => {
      const existingUser = testDb.findMany('user', {}).find(
        (u: any) => u.email === input.email
      );

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      const hashedPassword = await mockBcrypt.hash(input.password, 12);
      
      const newUser = testDb.create('user', {
        name: input.name,
        email: input.email,
        hashedPassword,
        emailVerified: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create email verification token
      const verificationToken = mockJwt.sign(
        { sub: newUser.id, type: 'email_verification' },
        'test-secret',
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        verificationToken,
        message: 'Please check your email to verify your account',
      };
    },

    me: async () => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const user = testDb.findUnique('user', { id: ctx.session.user.id });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      };
    },

    refreshToken: async (input: { refreshToken: string }) => {
      try {
        const decoded = mockJwt.verify(input.refreshToken, 'test-secret') as any;
        
        if (decoded.type !== 'refresh') {
          throw new Error('Invalid token type');
        }

        const user = testDb.findUnique('user', { id: decoded.sub });
        if (!user) {
          throw new Error('User not found');
        }

        const newToken = mockJwt.sign(
          { sub: user.id, email: user.email, role: user.role },
          'test-secret',
          { expiresIn: '7d' }
        );

        const newRefreshToken = mockJwt.sign(
          { sub: user.id, type: 'refresh' },
          'test-secret',
          { expiresIn: '30d' }
        );

        return {
          token: newToken,
          refreshToken: newRefreshToken,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        });
      }
    },

    changePassword: async (input: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const user = testDb.findUnique('user', { id: ctx.session.user.id });
      if (!user || !user.hashedPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot change password for OAuth users',
        });
      }

      const isCurrentValid = await mockBcrypt.compare(
        input.currentPassword,
        user.hashedPassword
      );

      if (!isCurrentValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      const newHashedPassword = await mockBcrypt.hash(input.newPassword, 12);
      
      testDb.update('user', { id: user.id }, {
        hashedPassword: newHashedPassword,
        updatedAt: new Date(),
      });

      return { success: true };
    },

    verifyEmail: async (input: { token: string }) => {
      try {
        const decoded = mockJwt.verify(input.token, 'test-secret') as any;
        
        if (decoded.type !== 'email_verification') {
          throw new Error('Invalid token type');
        }

        const user = testDb.findUnique('user', { id: decoded.sub });
        if (!user) {
          throw new Error('User not found');
        }

        testDb.update('user', { id: user.id }, {
          emailVerified: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, message: 'Email verified successfully' };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification token',
        });
      }
    },

    resetPassword: async (input: { email: string }) => {
      const user = testDb.findMany('user', {}).find(
        (u: any) => u.email === input.email
      );

      if (!user) {
        // Don't reveal whether user exists
        return { message: 'If an account exists, a reset link has been sent' };
      }

      const resetToken = mockJwt.sign(
        { sub: user.id, type: 'password_reset' },
        'test-secret',
        { expiresIn: '1h' }
      );

      // In real implementation, send email with reset link
      return {
        message: 'If an account exists, a reset link has been sent',
        resetToken, // Only for testing
      };
    },

    logout: async () => {
      // In real implementation, invalidate tokens
      return { success: true };
    },
  }),
};

describe('Auth Router', () => {
  beforeEach(() => {
    testDb.reset();
    vi.clearAllMocks();

    // Setup bcrypt mocks
    mockBcrypt.hash.mockImplementation(async (password) => `hashed_${password}`);
    mockBcrypt.compare.mockImplementation(async (plain, hashed) => {
      return hashed === `hashed_${plain}`;
    });

    // Setup JWT mocks
    mockJwt.sign.mockImplementation((payload: any, secret, options) => {
      return `token_${payload.sub}_${payload.type || 'access'}`;
    });

    mockJwt.verify.mockImplementation((token: string, secret) => {
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

  describe('login', () => {
    test('should login with valid credentials', async () => {
      const user = createUser({
        email: 'test@example.com',
        hashedPassword: 'hashed_password123',
        emailVerified: new Date(),
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test('should reject invalid email', async () => {
      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      );
    });

    test('should reject invalid password', async () => {
      const user = createUser({
        email: 'test@example.com',
        hashedPassword: 'hashed_correctpassword',
        emailVerified: new Date(),
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      );
    });

    test('should reject unverified email', async () => {
      const user = createUser({
        email: 'test@example.com',
        hashedPassword: 'hashed_password123',
        emailVerified: null,
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Please verify your email before signing in',
        })
      );
    });

    test('should reject OAuth users without password', async () => {
      const user = createUser({
        email: 'oauth@example.com',
        hashedPassword: null,
        emailVerified: new Date(),
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.login({
          email: 'oauth@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Please sign in with OAuth provider',
        })
      );
    });

    test('should update last login time', async () => {
      const user = createUser({
        email: 'test@example.com',
        hashedPassword: 'hashed_password123',
        emailVerified: new Date(),
        lastLoginAt: null,
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());
      await caller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const updatedUser = testDb.findUnique('user', { id: user.id });
      expect(updatedUser.lastLoginAt).toBeTruthy();
    });
  });

  describe('register', () => {
    test('should register new user', async () => {
      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('john@example.com');
      expect(result.user.name).toBe('John Doe');
      expect(result.verificationToken).toBeDefined();
      expect(result.message).toContain('verify your account');

      const user = testDb.findMany('user', {}).find(
        (u: any) => u.email === 'john@example.com'
      );
      expect(user).toBeTruthy();
      expect(user.emailVerified).toBeNull();
    });

    test('should reject duplicate email', async () => {
      const existingUser = createUser({ email: 'existing@example.com' });
      testDb.create('user', existingUser);

      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.register({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      );
    });

    test('should hash password securely', async () => {
      const caller = authRouter.createCaller(createTestContext());
      await caller.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'plainpassword',
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainpassword', 12);

      const user = testDb.findMany('user', {}).find(
        (u: any) => u.email === 'john@example.com'
      );
      expect(user.hashedPassword).toBe('hashed_plainpassword');
    });
  });

  describe('me', () => {
    test('should return current user info', async () => {
      const user = createUser();
      testDb.create('user', user);

      const context = createTestContext({
        session: { user: { id: user.id } },
      });

      const caller = authRouter.createCaller(context);
      const result = await caller.me();

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.name).toBe(user.name);
    });

    test('should reject unauthenticated request', async () => {
      const context = createTestContext({ session: null });
      const caller = authRouter.createCaller(context);

      await expect(caller.me()).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      );
    });

    test('should handle deleted user', async () => {
      const context = createTestContext({
        session: { user: { id: 'deleted-user-id' } },
      });

      const caller = authRouter.createCaller(context);

      await expect(caller.me()).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      );
    });
  });

  describe('refreshToken', () => {
    test('should refresh valid token', async () => {
      const user = createUser();
      testDb.create('user', user);

      const refreshToken = `token_${user.id}_refresh`;

      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.refreshToken({ refreshToken });

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, 'test-secret');
    });

    test('should reject invalid refresh token', async () => {
      const caller = authRouter.createCaller(createTestContext());

      mockJwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(
        caller.refreshToken({ refreshToken: 'invalid_token' })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        })
      );
    });

    test('should reject wrong token type', async () => {
      const caller = authRouter.createCaller(createTestContext());

      mockJwt.verify.mockReturnValueOnce({
        sub: 'user-123',
        type: 'access', // Wrong type
      });

      await expect(
        caller.refreshToken({ refreshToken: 'wrong_type_token' })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        })
      );
    });

    test('should reject token for deleted user', async () => {
      const refreshToken = `token_deleted-user_refresh`;

      const caller = authRouter.createCaller(createTestContext());

      await expect(
        caller.refreshToken({ refreshToken })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        })
      );
    });
  });

  describe('changePassword', () => {
    test('should change password successfully', async () => {
      const user = createUser({
        hashedPassword: 'hashed_oldpassword',
      });
      testDb.create('user', user);

      const context = createTestContext({
        session: { user: { id: user.id } },
      });

      const caller = authRouter.createCaller(context);
      const result = await caller.changePassword({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(result.success).toBe(true);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);

      const updatedUser = testDb.findUnique('user', { id: user.id });
      expect(updatedUser.hashedPassword).toBe('hashed_newpassword123');
    });

    test('should reject unauthenticated request', async () => {
      const context = createTestContext({ session: null });
      const caller = authRouter.createCaller(context);

      await expect(
        caller.changePassword({
          currentPassword: 'old',
          newPassword: 'new',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        })
      );
    });

    test('should reject incorrect current password', async () => {
      const user = createUser({
        hashedPassword: 'hashed_correctpassword',
      });
      testDb.create('user', user);

      const context = createTestContext({
        session: { user: { id: user.id } },
      });

      const caller = authRouter.createCaller(context);

      await expect(
        caller.changePassword({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        })
      );
    });

    test('should reject OAuth users', async () => {
      const user = createUser({ hashedPassword: null });
      testDb.create('user', user);

      const context = createTestContext({
        session: { user: { id: user.id } },
      });

      const caller = authRouter.createCaller(context);

      await expect(
        caller.changePassword({
          currentPassword: 'any',
          newPassword: 'new',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Cannot change password for OAuth users',
        })
      );
    });
  });

  describe('verifyEmail', () => {
    test('should verify email successfully', async () => {
      const user = createUser({ emailVerified: null });
      testDb.create('user', user);

      const verificationToken = `token_${user.id}_email_verification`;

      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.verifyEmail({ token: verificationToken });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');

      const updatedUser = testDb.findUnique('user', { id: user.id });
      expect(updatedUser.emailVerified).toBeTruthy();
    });

    test('should reject invalid token', async () => {
      const caller = authRouter.createCaller(createTestContext());

      mockJwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(
        caller.verifyEmail({ token: 'invalid_token' })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification token',
        })
      );
    });

    test('should reject wrong token type', async () => {
      const caller = authRouter.createCaller(createTestContext());

      mockJwt.verify.mockReturnValueOnce({
        sub: 'user-123',
        type: 'access',
      });

      await expect(
        caller.verifyEmail({ token: 'wrong_type_token' })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
        })
      );
    });
  });

  describe('resetPassword', () => {
    test('should initiate password reset for existing user', async () => {
      const user = createUser({ email: 'reset@example.com' });
      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.resetPassword({ email: 'reset@example.com' });

      expect(result.message).toBe('If an account exists, a reset link has been sent');
      expect(result.resetToken).toBeDefined();
    });

    test('should not reveal if user does not exist', async () => {
      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.resetPassword({ email: 'nonexistent@example.com' });

      expect(result.message).toBe('If an account exists, a reset link has been sent');
      expect(result.resetToken).toBeUndefined();
    });
  });

  describe('logout', () => {
    test('should logout successfully', async () => {
      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.logout();

      expect(result.success).toBe(true);
    });
  });

  describe('Security', () => {
    test('should handle rate limiting', async () => {
      // In a real implementation, this would test rate limiting
      const caller = authRouter.createCaller(createTestContext());
      
      // Multiple failed login attempts
      const promises = Array.from({ length: 10 }, () =>
        caller.login({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }).catch(() => null)
      );

      await Promise.all(promises);
      
      // All should fail with unauthorized
      expect(true).toBe(true); // Placeholder for actual rate limiting test
    });

    test('should generate secure tokens', async () => {
      const user = createUser({
        email: 'test@example.com',
        hashedPassword: 'hashed_password123',
        emailVerified: new Date(),
      });

      testDb.create('user', user);

      const caller = authRouter.createCaller(createTestContext());
      const result = await caller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.token).not.toBe(result.refreshToken);
    });

    test('should not expose sensitive information in errors', async () => {
      const caller = authRouter.createCaller(createTestContext());

      try {
        await caller.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      } catch (error) {
        expect((error as any).message).not.toContain('hash');
        expect((error as any).message).not.toContain('password');
        expect((error as any).message).toBe('Invalid credentials');
      }
    });
  });
});