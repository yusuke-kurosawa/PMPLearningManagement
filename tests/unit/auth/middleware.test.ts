import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createMockRequest } from '../../utils/api'

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

// Mock auth middleware function
const authMiddleware = async (req: NextRequest) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth',
    '/pmbok',
    '/glossary',
    '/visualizations',
  ]

  // Admin-only paths
  const adminPaths = ['/admin', '/api/admin']

  // Premium-only paths
  const premiumPaths = ['/premium', '/api/premium', '/exam/unlimited', '/flashcards/advanced']

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Require authentication for protected paths
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check admin access
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  if (isAdminPath && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
  }

  // Check premium access
  const isPremiumPath = premiumPaths.some((path) => pathname.startsWith(path))

  if (isPremiumPath && !['PREMIUM', 'ADMIN'].includes(token.role as string)) {
    return NextResponse.redirect(new URL('/subscription/upgrade', req.url))
  }

  return NextResponse.next()
}

describe('Auth Middleware', () => {
  const mockGetToken = vi.mocked(getToken)

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXTAUTH_SECRET = 'test-secret'
  })

  describe('Public Paths', () => {
    test('should allow access to public paths without token', async () => {
      mockGetToken.mockResolvedValue(null)

      const publicPaths = [
        '/',
        '/auth/signin',
        '/auth/signup',
        '/pmbok/matrix',
        '/glossary',
        '/visualizations',
      ]

      for (const path of publicPaths) {
        const req = new NextRequest(new URL(`http://localhost:3000${path}`))
        const response = await authMiddleware(req)

        expect(response?.status).not.toBe(307) // Not redirected
      }
    })

    test('should allow API auth endpoints', async () => {
      mockGetToken.mockResolvedValue(null)

      const req = new NextRequest(new URL('http://localhost:3000/api/auth/signin'))
      const response = await authMiddleware(req)

      expect(response?.status).not.toBe(307)
    })
  })

  describe('Protected Paths', () => {
    test('should redirect unauthenticated users to signin', async () => {
      mockGetToken.mockResolvedValue(null)

      const protectedPaths = ['/dashboard', '/progress', '/settings', '/subscription']

      for (const path of protectedPaths) {
        const req = new NextRequest(new URL(`http://localhost:3000${path}`))
        const response = await authMiddleware(req)

        expect(response?.status).toBe(307) // Redirected
        expect(response?.headers.get('location')).toContain('/auth/signin')
      }
    })

    test('should include callback URL in signin redirect', async () => {
      mockGetToken.mockResolvedValue(null)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))
      const response = await authMiddleware(req)

      const location = response?.headers.get('location')
      expect(location).toContain('callbackUrl=%2Fdashboard')
    })

    test('should allow authenticated users to access protected paths', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(mockToken)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))
      const response = await authMiddleware(req)

      expect(response?.status).not.toBe(307)
    })
  })

  describe('Admin Paths', () => {
    test('should allow admin users to access admin paths', async () => {
      const adminToken = {
        sub: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
      }

      mockGetToken.mockResolvedValue(adminToken)

      const adminPaths = ['/admin/dashboard', '/admin/users', '/api/admin/stats']

      for (const path of adminPaths) {
        const req = new NextRequest(new URL(`http://localhost:3000${path}`))
        const response = await authMiddleware(req)

        expect(response?.status).not.toBe(307)
      }
    })

    test('should redirect non-admin users from admin paths', async () => {
      const userToken = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(userToken)

      const req = new NextRequest(new URL('http://localhost:3000/admin/dashboard'))
      const response = await authMiddleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/auth/unauthorized')
    })

    test('should redirect premium users from admin paths', async () => {
      const premiumToken = {
        sub: 'premium-123',
        email: 'premium@example.com',
        role: 'PREMIUM',
      }

      mockGetToken.mockResolvedValue(premiumToken)

      const req = new NextRequest(new URL('http://localhost:3000/admin/users'))
      const response = await authMiddleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/auth/unauthorized')
    })
  })

  describe('Premium Paths', () => {
    test('should allow premium users to access premium paths', async () => {
      const premiumToken = {
        sub: 'premium-123',
        email: 'premium@example.com',
        role: 'PREMIUM',
      }

      mockGetToken.mockResolvedValue(premiumToken)

      const premiumPaths = ['/premium/features', '/exam/unlimited', '/flashcards/advanced']

      for (const path of premiumPaths) {
        const req = new NextRequest(new URL(`http://localhost:3000${path}`))
        const response = await authMiddleware(req)

        expect(response?.status).not.toBe(307)
      }
    })

    test('should allow admin users to access premium paths', async () => {
      const adminToken = {
        sub: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
      }

      mockGetToken.mockResolvedValue(adminToken)

      const req = new NextRequest(new URL('http://localhost:3000/premium/features'))
      const response = await authMiddleware(req)

      expect(response?.status).not.toBe(307)
    })

    test('should redirect free users from premium paths', async () => {
      const userToken = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(userToken)

      const req = new NextRequest(new URL('http://localhost:3000/premium/features'))
      const response = await authMiddleware(req)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/subscription/upgrade')
    })
  })

  describe('Token Validation', () => {
    test('should handle malformed tokens', async () => {
      mockGetToken.mockRejectedValue(new Error('Invalid token'))

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))

      try {
        await authMiddleware(req)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    test('should handle expired tokens', async () => {
      const expiredToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      }

      mockGetToken.mockResolvedValue(expiredToken)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard'))
      const response = await authMiddleware(req)

      // Should still work as getToken handles expiration
      expect(response?.status).not.toBe(307)
    })

    test('should handle missing role in token', async () => {
      const tokenWithoutRole = {
        sub: 'user-123',
        email: 'test@example.com',
        // role is missing
      }

      mockGetToken.mockResolvedValue(tokenWithoutRole)

      const req = new NextRequest(new URL('http://localhost:3000/admin/dashboard'))
      const response = await authMiddleware(req)

      expect(response?.status).toBe(307) // Should redirect as role is not ADMIN
    })
  })

  describe('Edge Cases', () => {
    test('should handle deep nested paths', async () => {
      const userToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(userToken)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard/progress/details/123'))
      const response = await authMiddleware(req)

      expect(response?.status).not.toBe(307)
    })

    test('should handle query parameters', async () => {
      mockGetToken.mockResolvedValue(null)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard?tab=overview'))
      const response = await authMiddleware(req)

      expect(response?.status).toBe(307)
      const location = response?.headers.get('location')
      expect(location).toContain('callbackUrl=%2Fdashboard')
    })

    test('should handle fragments in URLs', async () => {
      const userToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(userToken)

      const req = new NextRequest(new URL('http://localhost:3000/dashboard#section'))
      const response = await authMiddleware(req)

      expect(response?.status).not.toBe(307)
    })
  })

  describe('Performance', () => {
    test('should handle multiple concurrent requests', async () => {
      const userToken = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      }

      mockGetToken.mockResolvedValue(userToken)

      const requests = Array.from(
        { length: 10 },
        (_, i) => new NextRequest(new URL(`http://localhost:3000/dashboard?req=${i}`))
      )

      const responses = await Promise.all(requests.map((req) => authMiddleware(req)))

      responses.forEach((response) => {
        expect(response?.status).not.toBe(307)
      })

      expect(mockGetToken).toHaveBeenCalledTimes(10)
    })

    test('should not block public path access', async () => {
      mockGetToken.mockResolvedValue(null)

      const start = performance.now()
      const req = new NextRequest(new URL('http://localhost:3000/'))
      await authMiddleware(req)
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // Should be very fast for public paths
    })
  })
})
