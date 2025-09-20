/**
 * Comprehensive Authentication Flow Tests for PMP Learning Management System
 * 
 * This test suite covers all authentication scenarios including:
 * - User registration with validation
 * - Login flows with various credential types
 * - Password reset and recovery
 * - Session management and persistence
 * - Social authentication integration
 * - Two-factor authentication
 * - Account security features
 * - Edge cases and error handling
 * 
 * @fileoverview Complete authentication flow test coverage
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { test, expect, type Page } from '@playwright/test'
import { HomePage } from '../../pages/home-page'
import { AuthPage } from '../../pages/auth-page'
import { TestDataGenerator } from '../../utils/test-data-generator'

test.describe('Authentication Flows', () => {
  let homePage: HomePage
  let authPage: AuthPage
  let testDataGenerator: TestDataGenerator
  
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    authPage = new AuthPage(page)
    testDataGenerator = new TestDataGenerator()
    
    // Navigate to home page
    await homePage.navigate()
  })

  test.describe('User Registration', () => {
    test('should register new user with valid credentials', async ({ page }) => {
      const userData = {
        name: 'Test User',
        email: 'test.newuser@pmp-test.local',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      // Navigate to registration
      await authPage.navigateToRegister()
      
      // Fill registration form
      await authPage.fillRegistrationForm(userData)
      
      // Submit registration
      await authPage.submitRegistration()
      
      // Verify successful registration
      await expect(page.getByText('Registration successful')).toBeVisible()
      
      // Verify email verification prompt
      await expect(page.getByText('Please check your email')).toBeVisible()
    })

    test('should validate email format during registration', async ({ page }) => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      await authPage.navigateToRegister()
      await authPage.fillRegistrationForm(userData)
      
      // Attempt to submit with invalid email
      await authPage.submitRegistration()
      
      // Verify email validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should validate password strength requirements', async ({ page }) => {
      const weakPasswords = [
        '123456',           // Too simple
        'password',         // Common word
        'Pass123',          // Too short
        'Password123',      // No special characters
        'Password!'         // No numbers
      ]

      for (const weakPassword of weakPasswords) {
        await authPage.navigateToRegister()
        
        const userData = {
          name: 'Test User',
          email: 'test@pmp-test.local',
          password: weakPassword,
          confirmPassword: weakPassword
        }
        
        await authPage.fillRegistrationForm(userData)
        await authPage.submitRegistration()
        
        // Verify password strength error
        await expect(page.getByText(/password must be/i)).toBeVisible()
        
        // Navigate back for next iteration
        await page.goBack()
      }
    })

    test('should validate password confirmation match', async ({ page }) => {
      const userData = {
        name: 'Test User',
        email: 'test@pmp-test.local',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!'
      }

      await authPage.navigateToRegister()
      await authPage.fillRegistrationForm(userData)
      await authPage.submitRegistration()
      
      // Verify password match error
      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('should prevent duplicate email registration', async ({ page }) => {
      const existingEmail = 'student.beginner@pmp-test.local'
      
      const userData = {
        name: 'Another User',
        email: existingEmail,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      await authPage.navigateToRegister()
      await authPage.fillRegistrationForm(userData)
      await authPage.submitRegistration()
      
      // Verify duplicate email error
      await expect(page.getByText('Email already registered')).toBeVisible()
    })

    test('should handle registration with special characters in name', async ({ page }) => {
      const userData = {
        name: 'José María González-Smith',
        email: 'jose.maria@pmp-test.local',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      await authPage.navigateToRegister()
      await authPage.fillRegistrationForm(userData)
      await authPage.submitRegistration()
      
      // Verify successful registration with special characters
      await expect(page.getByText('Registration successful')).toBeVisible()
    })
  })

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      const credentials = {
        email: 'student.intermediate@pmp-test.local',
        password: 'TestPass123!'
      }

      await authPage.navigateToLogin()
      await authPage.login(credentials.email, credentials.password)
      
      // Verify successful login - should redirect to dashboard
      await expect(page).toHaveURL(/.*#\/progress/)
      
      // Verify user is logged in
      await expect(page.getByTestId('user-profile')).toBeVisible()
      await expect(page.getByText('Test Student (Intermediate)')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      const credentials = {
        email: 'nonexistent@pmp-test.local',
        password: 'WrongPassword123!'
      }

      await authPage.navigateToLogin()
      await authPage.login(credentials.email, credentials.password)
      
      // Verify login error
      await expect(page.getByText('Invalid email or password')).toBeVisible()
    })

    test('should show error for incorrect password', async ({ page }) => {
      const credentials = {
        email: 'student.intermediate@pmp-test.local',
        password: 'WrongPassword123!'
      }

      await authPage.navigateToLogin()
      await authPage.login(credentials.email, credentials.password)
      
      // Verify password error
      await expect(page.getByText('Invalid email or password')).toBeVisible()
    })

    test('should handle login with unverified email', async ({ page }) => {
      // Create unverified user scenario
      const credentials = {
        email: 'unverified@pmp-test.local',
        password: 'TestPass123!'
      }

      await authPage.navigateToLogin()
      await authPage.login(credentials.email, credentials.password)
      
      // Verify email verification prompt
      await expect(page.getByText('Please verify your email')).toBeVisible()
      await expect(page.getByText('Resend verification email')).toBeVisible()
    })

    test('should implement rate limiting for failed attempts', async ({ page }) => {
      const credentials = {
        email: 'student.intermediate@pmp-test.local',
        password: 'WrongPassword123!'
      }

      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await authPage.navigateToLogin()
        await authPage.login(credentials.email, credentials.password)
        await page.waitForTimeout(500)
      }
      
      // Verify rate limiting message
      await expect(page.getByText(/too many attempts|rate limit/i)).toBeVisible()
    })

    test('should remember login state across sessions', async ({ page, context }) => {
      const credentials = {
        email: 'student.intermediate@pmp-test.local',
        password: 'TestPass123!'
      }

      // Login and verify
      await authPage.navigateToLogin()
      await authPage.login(credentials.email, credentials.password)
      await expect(page.getByTestId('user-profile')).toBeVisible()
      
      // Create new page in same context to test persistence
      const newPage = await context.newPage()
      await newPage.goto('/')
      
      // Verify user is still logged in
      await expect(newPage.getByTestId('user-profile')).toBeVisible()
    })

    test('should redirect to intended page after login', async ({ page }) => {
      const protectedUrl = '/#/mock-exam'
      
      // Try to access protected page while logged out
      await page.goto(protectedUrl)
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*auth.*login/)
      
      // Login
      const credentials = {
        email: 'student.advanced@pmp-test.local',
        password: 'TestPass123!'
      }
      
      await authPage.login(credentials.email, credentials.password)
      
      // Should redirect back to intended page
      await expect(page).toHaveURL(/.*mock-exam/)
    })
  })

  test.describe('Password Reset', () => {
    test('should initiate password reset with valid email', async ({ page }) => {
      await authPage.navigateToPasswordReset()
      
      const email = 'student.intermediate@pmp-test.local'
      await authPage.requestPasswordReset(email)
      
      // Verify reset email sent message
      await expect(page.getByText('Password reset email sent')).toBeVisible()
      await expect(page.getByText(email)).toBeVisible()
    })

    test('should handle password reset for non-existent email', async ({ page }) => {
      await authPage.navigateToPasswordReset()
      
      const email = 'nonexistent@pmp-test.local'
      await authPage.requestPasswordReset(email)
      
      // Should show generic message for security
      await expect(page.getByText('If an account exists, you will receive an email')).toBeVisible()
    })

    test('should complete password reset with valid token', async ({ page }) => {
      // Simulate having a reset token
      const resetToken = 'valid-reset-token-123'
      const newPassword = 'NewSecurePass123!'
      
      await page.goto(`/#/reset-password?token=${resetToken}`)
      
      await authPage.resetPasswordWithToken(newPassword, newPassword)
      
      // Verify successful reset
      await expect(page.getByText('Password reset successful')).toBeVisible()
      
      // Verify can login with new password
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', newPassword)
      await expect(page.getByTestId('user-profile')).toBeVisible()
    })

    test('should reject expired or invalid reset tokens', async ({ page }) => {
      const expiredToken = 'expired-token-456'
      
      await page.goto(`/#/reset-password?token=${expiredToken}`)
      
      // Verify token error
      await expect(page.getByText('Invalid or expired reset token')).toBeVisible()
    })

    test('should validate new password strength in reset', async ({ page }) => {
      const resetToken = 'valid-reset-token-123'
      const weakPassword = '123456'
      
      await page.goto(`/#/reset-password?token=${resetToken}`)
      
      await authPage.resetPasswordWithToken(weakPassword, weakPassword)
      
      // Verify password strength error
      await expect(page.getByText(/password must be/i)).toBeVisible()
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session during active use', async ({ page }) => {
      // Login
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Verify logged in
      await expect(page.getByTestId('user-profile')).toBeVisible()
      
      // Navigate through app to simulate activity
      await page.goto('/#/matrix')
      await page.waitForTimeout(1000)
      await page.goto('/#/glossary')
      await page.waitForTimeout(1000)
      
      // Verify still logged in
      await expect(page.getByTestId('user-profile')).toBeVisible()
    })

    test('should handle session expiration gracefully', async ({ page }) => {
      // Login
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Simulate session expiration by clearing storage
      await page.evaluate(() => {
        localStorage.removeItem('auth-token')
        sessionStorage.clear()
      })
      
      // Try to access protected resource
      await page.goto('/#/progress')
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*auth.*login/)
      await expect(page.getByText('Session expired')).toBeVisible()
    })

    test('should logout user completely', async ({ page, context }) => {
      // Login
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Verify logged in
      await expect(page.getByTestId('user-profile')).toBeVisible()
      
      // Logout
      await authPage.logout()
      
      // Verify logged out
      await expect(page.getByTestId('user-profile')).not.toBeVisible()
      await expect(page.getByText('Login')).toBeVisible()
      
      // Verify can't access protected pages
      await page.goto('/#/progress')
      await expect(page).toHaveURL(/.*auth.*login/)
    })

    test('should handle concurrent sessions', async ({ browser }) => {
      // Create two browser contexts to simulate concurrent sessions
      const context1 = await browser.newContext()
      const context2 = await browser.newContext()
      
      const page1 = await context1.newPage()
      const page2 = await context2.newPage()
      
      const authPage1 = new AuthPage(page1)
      const authPage2 = new AuthPage(page2)
      
      // Login from both contexts
      await authPage1.navigateToLogin()
      await authPage1.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      await authPage2.navigateToLogin()
      await authPage2.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Both should be logged in (depending on business rules)
      await expect(page1.getByTestId('user-profile')).toBeVisible()
      await expect(page2.getByTestId('user-profile')).toBeVisible()
      
      // Cleanup
      await context1.close()
      await context2.close()
    })
  })

  test.describe('Account Security', () => {
    test('should change password with current password verification', async ({ page }) => {
      // Login
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Navigate to profile/security settings
      await page.goto('/#/profile/security')
      
      const passwords = {
        current: 'TestPass123!',
        new: 'NewSecurePass123!',
        confirm: 'NewSecurePass123!'
      }
      
      await authPage.changePassword(passwords)
      
      // Verify password change success
      await expect(page.getByText('Password changed successfully')).toBeVisible()
      
      // Logout and verify new password works
      await authPage.logout()
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', passwords.new)
      
      await expect(page.getByTestId('user-profile')).toBeVisible()
    })

    test('should require current password for password change', async ({ page }) => {
      // Login and navigate to security settings
      await authPage.navigateToLogin()
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      await page.goto('/#/profile/security')
      
      const passwords = {
        current: 'WrongCurrentPassword!',
        new: 'NewSecurePass123!',
        confirm: 'NewSecurePass123!'
      }
      
      await authPage.changePassword(passwords)
      
      // Verify current password error
      await expect(page.getByText('Current password is incorrect')).toBeVisible()
    })

    test('should enable and use two-factor authentication', async ({ page }) => {
      // Login and navigate to security settings
      await authPage.navigateToLogin()
      await authPage.login('admin@pmp-test.local', 'TestPass123!')
      await page.goto('/#/profile/security')
      
      // Enable 2FA
      await authPage.enable2FA()
      
      // Verify 2FA setup
      await expect(page.getByText('Two-factor authentication enabled')).toBeVisible()
      
      // Logout and test 2FA login
      await authPage.logout()
      await authPage.navigateToLogin()
      await authPage.login('admin@pmp-test.local', 'TestPass123!')
      
      // Should prompt for 2FA code
      await expect(page.getByText('Enter verification code')).toBeVisible()
      
      // Simulate 2FA code entry
      await authPage.enter2FACode('123456')
      
      // Should complete login
      await expect(page.getByTestId('user-profile')).toBeVisible()
    })

    test('should show security audit log', async ({ page }) => {
      // Login as admin
      await authPage.navigateToLogin()
      await authPage.login('admin@pmp-test.local', 'TestPass123!')
      
      // Navigate to security audit
      await page.goto('/#/profile/security-audit')
      
      // Verify audit log elements
      await expect(page.getByText('Security Activity')).toBeVisible()
      await expect(page.getByText('Recent login')).toBeVisible()
      await expect(page.getByText(/IP address/i)).toBeVisible()
    })
  })

  test.describe('Social Authentication', () => {
    test('should initiate Google OAuth flow', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Mock Google OAuth
      await page.route('**/auth/google', route => {
        route.fulfill({
          status: 302,
          headers: {
            'Location': '/#/progress?auth=success'
          }
        })
      })
      
      await authPage.loginWithGoogle()
      
      // Verify OAuth initiation
      await expect(page).toHaveURL(/.*progress.*auth=success/)
    })

    test('should handle OAuth errors gracefully', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Mock OAuth error
      await page.route('**/auth/google', route => {
        route.fulfill({
          status: 400,
          json: { error: 'OAuth authentication failed' }
        })
      })
      
      await authPage.loginWithGoogle()
      
      // Verify error handling
      await expect(page.getByText('Authentication failed')).toBeVisible()
    })
  })

  test.describe('Accessibility and Usability', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Test keyboard navigation
      await page.keyboard.press('Tab') // Email field
      await page.keyboard.type('test@example.com')
      
      await page.keyboard.press('Tab') // Password field
      await page.keyboard.type('password123')
      
      await page.keyboard.press('Tab') // Login button
      await page.keyboard.press('Enter')
      
      // Should attempt login
      await expect(page.getByText('Invalid email or password')).toBeVisible()
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Verify accessibility attributes
      const emailField = page.getByRole('textbox', { name: /email/i })
      const passwordField = page.getByRole('textbox', { name: /password/i })
      const loginButton = page.getByRole('button', { name: /login/i })
      
      await expect(emailField).toBeVisible()
      await expect(passwordField).toBeVisible()
      await expect(loginButton).toBeVisible()
    })

    test('should show loading states during authentication', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Mock slow authentication
      await page.route('**/auth/login', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            json: { success: true, token: 'mock-token' }
          })
        }, 2000)
      })
      
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Verify loading state
      await expect(page.getByText('Signing in...')).toBeVisible()
      await expect(page.getByTestId('login-spinner')).toBeVisible()
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Mock network error
      await page.route('**/auth/login', route => {
        route.abort('failed')
      })
      
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Verify network error handling
      await expect(page.getByText('Network error. Please try again.')).toBeVisible()
    })

    test('should handle server errors appropriately', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Mock server error
      await page.route('**/auth/login', route => {
        route.fulfill({
          status: 500,
          json: { error: 'Internal server error' }
        })
      })
      
      await authPage.login('student.intermediate@pmp-test.local', 'TestPass123!')
      
      // Verify server error handling
      await expect(page.getByText('Server error. Please try again later.')).toBeVisible()
    })

    test('should validate input sanitization', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Test with potentially malicious input
      const maliciousInput = '<script>alert("xss")</script>'
      
      await authPage.login(maliciousInput, maliciousInput)
      
      // Verify input is sanitized (no script execution)
      const alerts = []
      page.on('dialog', dialog => {
        alerts.push(dialog.message())
        dialog.dismiss()
      })
      
      await page.waitForTimeout(1000)
      expect(alerts).toHaveLength(0)
    })

    test('should handle extremely long inputs', async ({ page }) => {
      await authPage.navigateToLogin()
      
      // Test with very long input
      const longEmail = 'a'.repeat(1000) + '@example.com'
      const longPassword = 'b'.repeat(1000)
      
      await authPage.login(longEmail, longPassword)
      
      // Should handle gracefully without crashing
      await expect(page.getByText(/invalid|error/i)).toBeVisible()
    })
  })
})

// Helper test utilities
test.describe('Test Data Management', () => {
  test('should reset test user data between tests', async ({ page }) => {
    // This test ensures our test data is properly managed
    const testDataGen = new TestDataGenerator()
    
    // Generate fresh test data
    const testData = await testDataGen.generateCompleteTestDataset()
    
    expect(testData.users.length).toBeGreaterThan(0)
    expect(testData.processes.length).toBe(49)
  })
})