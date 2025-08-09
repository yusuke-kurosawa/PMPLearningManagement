import { vi } from 'vitest';
import { Session, User } from 'next-auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Auth test utilities
export const TEST_SECRET = 'test-secret-key';

// User factory
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    image: null,
    emailVerified: new Date(),
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

// Admin user factory
export function createAdminUser(overrides?: Partial<User>): User {
  return createTestUser({
    role: 'ADMIN',
    email: 'admin@example.com',
    name: 'Admin User',
    ...overrides,
  });
}

// Session factory with JWT
export function createSessionWithToken(
  user: User,
  overrides?: Partial<Session>
): { session: Session; token: string } {
  const session: Session = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  } as Session;
  
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
    TEST_SECRET
  );
  
  return { session, token };
}

// Mock NextAuth
export function mockNextAuth(session?: Session | null) {
  vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
      update: vi.fn(),
    })),
    signIn: vi.fn().mockResolvedValue({ ok: true }),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token'),
    getProviders: vi.fn().mockResolvedValue({
      google: { id: 'google', name: 'Google' },
      github: { id: 'github', name: 'GitHub' },
    }),
    SessionProvider: ({ children }: any) => children,
  }));
  
  vi.mock('next-auth', () => ({
    getServerSession: vi.fn().mockResolvedValue(session),
  }));
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Token utilities
export function generateAccessToken(userId: string, role: string = 'USER'): string {
  return jwt.sign(
    {
      sub: userId,
      role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    },
    TEST_SECRET
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
    },
    TEST_SECRET
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, TEST_SECRET);
}

// RBAC test helpers
export const TEST_PERMISSIONS = {
  USER: [
    'profile:read',
    'profile:update',
    'learning:read',
    'learning:update',
  ],
  PREMIUM: [
    'profile:read',
    'profile:update',
    'learning:read',
    'learning:update',
    'exam:unlimited',
    'flashcards:advanced',
  ],
  ADMIN: [
    'profile:read',
    'profile:update',
    'profile:delete',
    'learning:read',
    'learning:update',
    'learning:delete',
    'exam:unlimited',
    'flashcards:advanced',
    'users:manage',
    'content:manage',
    'system:manage',
  ],
};

export function hasPermission(
  role: string,
  permission: string
): boolean {
  const permissions = TEST_PERMISSIONS[role as keyof typeof TEST_PERMISSIONS];
  return permissions ? permissions.includes(permission) : false;
}

// Mock auth middleware
export function createAuthMiddleware(requiredRole?: string) {
  return vi.fn((req: any, res: any, next: any) => {
    const authHeader = req.headers?.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });
}

// OAuth mock responses
export const MOCK_OAUTH_PROVIDERS = {
  google: {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    authorization: {
      params: {
        prompt: 'consent',
        access_type: 'offline',
        response_type: 'code',
      },
    },
    profile(profile: any) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
  },
  github: {
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    profile(profile: any) {
      return {
        id: profile.id.toString(),
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
      };
    },
  },
};

// Session validation
export function isValidSession(session: any): boolean {
  if (!session) return false;
  if (!session.user) return false;
  if (!session.expires) return false;
  
  const expiresAt = new Date(session.expires);
  if (expiresAt < new Date()) return false;
  
  return true;
}

// Mock auth hooks
export const mockUseSession = (session?: Session | null) => ({
  data: session,
  status: session ? 'authenticated' : 'unauthenticated' as const,
  update: vi.fn(),
});

export const mockSignIn = vi.fn().mockImplementation(
  async (provider?: string, options?: any) => {
    return {
      error: undefined,
      status: 200,
      ok: true,
      url: options?.callbackUrl || '/',
    };
  }
);

export const mockSignOut = vi.fn().mockImplementation(
  async (options?: any) => {
    return {
      url: options?.callbackUrl || '/',
    };
  }
);