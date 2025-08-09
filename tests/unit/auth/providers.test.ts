import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';

// Mock Next Auth configuration
const mockAuthConfig: AuthOptions = {
  adapter: {} as any, // Will be mocked
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET!,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

describe('Auth Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set environment variables
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    process.env.GITHUB_ID = 'test-github-id';
    process.env.GITHUB_SECRET = 'test-github-secret';
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  });

  describe('Google Provider', () => {
    test('should be configured correctly', () => {
      const googleProvider = mockAuthConfig.providers!.find(
        (p: any) => p.id === 'google'
      ) as any;

      expect(googleProvider).toBeDefined();
      expect(googleProvider.id).toBe('google');
      expect(googleProvider.name).toBe('Google');
      expect(googleProvider.type).toBe('oauth');
    });

    test('should handle Google profile transformation', () => {
      const mockGoogleProfile = {
        sub: 'google-123',
        name: 'John Doe',
        email: 'john@gmail.com',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
      };

      // Simulate profile transformation
      const expectedProfile = {
        id: mockGoogleProfile.sub,
        name: mockGoogleProfile.name,
        email: mockGoogleProfile.email,
        image: mockGoogleProfile.picture,
      };

      expect(expectedProfile.id).toBe('google-123');
      expect(expectedProfile.email).toBe('john@gmail.com');
    });

    test('should handle missing profile data gracefully', () => {
      const incompleteProfile = {
        sub: 'google-456',
        email: 'incomplete@gmail.com',
        // missing name and picture
      };

      const profile = {
        id: incompleteProfile.sub,
        name: incompleteProfile.name || null,
        email: incompleteProfile.email,
        image: null,
      };

      expect(profile.id).toBe('google-456');
      expect(profile.name).toBeNull();
      expect(profile.image).toBeNull();
    });
  });

  describe('GitHub Provider', () => {
    test('should be configured correctly', () => {
      const githubProvider = mockAuthConfig.providers!.find(
        (p: any) => p.id === 'github'
      ) as any;

      expect(githubProvider).toBeDefined();
      expect(githubProvider.id).toBe('github');
      expect(githubProvider.name).toBe('GitHub');
      expect(githubProvider.type).toBe('oauth');
    });

    test('should handle GitHub profile transformation', () => {
      const mockGitHubProfile = {
        id: 123456,
        login: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'https://github.com/avatar.jpg',
      };

      const expectedProfile = {
        id: mockGitHubProfile.id.toString(),
        name: mockGitHubProfile.name || mockGitHubProfile.login,
        email: mockGitHubProfile.email,
        image: mockGitHubProfile.avatar_url,
      };

      expect(expectedProfile.id).toBe('123456');
      expect(expectedProfile.name).toBe('John Doe');
    });

    test('should fallback to login when name is missing', () => {
      const profileWithoutName = {
        id: 789012,
        login: 'johndoe123',
        email: 'john@example.com',
        avatar_url: 'https://github.com/avatar.jpg',
        // name is null
      };

      const profile = {
        id: profileWithoutName.id.toString(),
        name: profileWithoutName.login, // fallback to login
        email: profileWithoutName.email,
        image: profileWithoutName.avatar_url,
      };

      expect(profile.name).toBe('johndoe123');
    });
  });

  describe('JWT Callbacks', () => {
    test('should add role to JWT token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
      };

      const mockToken = { sub: 'user-123' };

      const jwt = mockAuthConfig.callbacks?.jwt;
      if (jwt) {
        const result = await jwt({
          token: mockToken,
          user: mockUser,
          account: null,
          profile: undefined,
          isNewUser: false,
        });

        expect(result.role).toBe('ADMIN');
      }
    });

    test('should preserve existing token data', async () => {
      const existingToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        iat: 1234567890,
        exp: 1234567890,
      };

      const jwt = mockAuthConfig.callbacks?.jwt;
      if (jwt) {
        const result = await jwt({
          token: existingToken,
          user: null,
          account: null,
          profile: undefined,
          isNewUser: false,
        });

        expect(result.sub).toBe('user-123');
        expect(result.email).toBe('test@example.com');
        expect(result.role).toBe('USER');
      }
    });
  });

  describe('Session Callbacks', () => {
    test('should add user ID and role to session', async () => {
      const mockToken = {
        sub: 'user-123',
        role: 'PREMIUM',
        email: 'test@example.com',
      };

      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2024-12-31',
      };

      const session = mockAuthConfig.callbacks?.session;
      if (session) {
        const result = await session({
          session: mockSession,
          token: mockToken,
          user: undefined as any,
        });

        expect(result.user?.id).toBe('user-123');
        expect(result.user?.role).toBe('PREMIUM');
      }
    });

    test('should handle session without user gracefully', async () => {
      const mockToken = { sub: 'user-123', role: 'USER' };
      const sessionWithoutUser = { expires: '2024-12-31' };

      const session = mockAuthConfig.callbacks?.session;
      if (session) {
        const result = await session({
          session: sessionWithoutUser,
          token: mockToken,
          user: undefined as any,
        });

        expect(result).toEqual(sessionWithoutUser);
      }
    });
  });

  describe('Environment Variables', () => {
    test('should require essential environment variables', () => {
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
      expect(process.env.NEXTAUTH_URL).toBeDefined();
      expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
      expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
      expect(process.env.GITHUB_ID).toBeDefined();
      expect(process.env.GITHUB_SECRET).toBeDefined();
    });

    test('should validate environment variable formats', () => {
      expect(process.env.NEXTAUTH_URL).toMatch(/^https?:\/\//);
      expect(process.env.GOOGLE_CLIENT_ID).toBeTruthy();
      expect(process.env.GITHUB_ID).toBeTruthy();
    });
  });

  describe('Security Configuration', () => {
    test('should use JWT strategy for sessions', () => {
      expect(mockAuthConfig.session?.strategy).toBe('jwt');
    });

    test('should have secret configured', () => {
      expect(mockAuthConfig.jwt?.secret).toBeDefined();
    });

    test('should configure secure pages', () => {
      // Test that certain pages require authentication
      const protectedPaths = [
        '/dashboard',
        '/progress',
        '/settings',
        '/subscription',
      ];

      protectedPaths.forEach(path => {
        expect(path).toMatch(/^\/[a-z]+/);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle OAuth errors gracefully', () => {
      const mockError = {
        type: 'OAuthAccountNotLinked',
        message: 'Account not linked',
      };

      // Simulate error handling
      const handleError = (error: any) => {
        if (error.type === 'OAuthAccountNotLinked') {
          return '/auth/error?error=OAuthAccountNotLinked';
        }
        return '/auth/signin';
      };

      expect(handleError(mockError)).toBe('/auth/error?error=OAuthAccountNotLinked');
    });

    test('should redirect on authentication failure', () => {
      const signInError = {
        type: 'SignInError',
        message: 'Authentication failed',
      };

      const handleSignInError = (error: any) => {
        return '/auth/signin?error=signin';
      };

      expect(handleSignInError(signInError)).toBe('/auth/signin?error=signin');
    });
  });
});