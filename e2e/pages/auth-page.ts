/**
 * Authentication Page Object Model for PMP Learning Management System
 * 
 * This page object handles all authentication-related interactions:
 * - Login and logout functionality
 * - User registration and validation
 * - Password reset and recovery
 * - Profile and security settings
 * - Two-factor authentication
 * - Social authentication flows
 * - Session management
 * 
 * @fileoverview Authentication Page Object Model
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type Page, type Locator } from '@playwright/test'
import { BasePage } from './base-page'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms?: boolean
}

export interface PasswordChangeData {
  current: string
  new: string
  confirm: string
}

export class AuthPage extends BasePage {
  // Authentication form selectors
  private readonly selectors = {
    // Login form
    loginForm: '[data-testid="login-form"]',
    emailField: '[data-testid="email-field"]',
    passwordField: '[data-testid="password-field"]',
    loginButton: '[data-testid="login-button"]',
    loginSpinner: '[data-testid="login-spinner"]',
    rememberMeCheckbox: '[data-testid="remember-me"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    
    // Registration form
    registrationForm: '[data-testid="registration-form"]',
    nameField: '[data-testid="name-field"]',
    emailFieldRegister: '[data-testid="email-field-register"]',
    passwordFieldRegister: '[data-testid="password-field-register"]',
    confirmPasswordField: '[data-testid="confirm-password-field"]',
    termsCheckbox: '[data-testid="terms-checkbox"]',
    registerButton: '[data-testid="register-button"]',
    
    // Password reset
    resetForm: '[data-testid="password-reset-form"]',
    resetEmailField: '[data-testid="reset-email-field"]',
    resetSubmitButton: '[data-testid="reset-submit-button"]',
    resetTokenField: '[data-testid="reset-token-field"]',
    newPasswordField: '[data-testid="new-password-field"]',
    confirmNewPasswordField: '[data-testid="confirm-new-password-field"]',
    
    // Social authentication
    googleLoginButton: '[data-testid="google-login-button"]',
    facebookLoginButton: '[data-testid="facebook-login-button"]',
    linkedinLoginButton: '[data-testid="linkedin-login-button"]',
    
    // Two-factor authentication
    twoFactorForm: '[data-testid="2fa-form"]',
    twoFactorCodeField: '[data-testid="2fa-code-field"]',
    twoFactorSubmitButton: '[data-testid="2fa-submit-button"]',
    enableTwoFactorButton: '[data-testid="enable-2fa-button"]',
    qrCodeImage: '[data-testid="qr-code"]',
    
    // User profile and security
    userProfile: '[data-testid="user-profile"]',
    profileDropdown: '[data-testid="profile-dropdown"]',
    logoutButton: '[data-testid="logout-button"]',
    securitySettingsLink: '[data-testid="security-settings-link"]',
    changePasswordForm: '[data-testid="change-password-form"]',
    currentPasswordField: '[data-testid="current-password-field"]',
    newPasswordFieldChange: '[data-testid="new-password-field-change"]',
    confirmPasswordFieldChange: '[data-testid="confirm-password-field-change"]',
    
    // Navigation links
    loginLink: '[data-testid="login-link"]',
    registerLink: '[data-testid="register-link"]',
    backToLoginLink: '[data-testid="back-to-login-link"]',
    
    // Error and success messages
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    validationError: '[data-testid="validation-error"]',
    
    // Loading states
    loadingIndicator: '[data-testid="loading-indicator"]',
    formDisabled: '[data-testid="form-disabled"]'
  }

  constructor(page: Page) {
    super(page)
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/#/auth/login')
    await this.waitForElement(this.selectors.loginForm)
  }

  /**
   * Navigate to registration page
   */
  async navigateToRegister(): Promise<void> {
    await this.navigate('/#/auth/register')
    await this.waitForElement(this.selectors.registrationForm)
  }

  /**
   * Navigate to password reset page
   */
  async navigateToPasswordReset(): Promise<void> {
    await this.navigate('/#/auth/reset-password')
    await this.waitForElement(this.selectors.resetForm)
  }

  /**
   * Perform user login
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.waitForElement(this.selectors.loginForm)
    
    // Fill login form
    await this.fillInput(this.selectors.emailField, email, { clear: true })
    await this.fillInput(this.selectors.passwordField, password, { clear: true })
    
    // Handle remember me option
    if (rememberMe) {
      await this.clickElement(this.selectors.rememberMeCheckbox)
    }
    
    // Submit form
    await this.clickElement(this.selectors.loginButton)
    
    // Wait for login process to complete
    await this.waitForLoginCompletion()
  }

  /**
   * Fill and submit registration form
   */
  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    await this.waitForElement(this.selectors.registrationForm)
    
    // Fill form fields
    await this.fillInput(this.selectors.nameField, data.name, { clear: true })
    await this.fillInput(this.selectors.emailFieldRegister, data.email, { clear: true })
    await this.fillInput(this.selectors.passwordFieldRegister, data.password, { clear: true })
    await this.fillInput(this.selectors.confirmPasswordField, data.confirmPassword, { clear: true })
    
    // Accept terms if required
    if (data.acceptTerms !== false) {
      const termsCheckbox = await this.getElement(this.selectors.termsCheckbox)
      const isChecked = await termsCheckbox.isChecked()
      
      if (!isChecked) {
        await this.clickElement(this.selectors.termsCheckbox)
      }
    }
  }

  /**
   * Submit registration form
   */
  async submitRegistration(): Promise<void> {
    await this.clickElement(this.selectors.registerButton)
    
    // Wait for registration process
    await this.waitForRegistrationCompletion()
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.waitForElement(this.selectors.resetForm)
    
    await this.fillInput(this.selectors.resetEmailField, email, { clear: true })
    await this.clickElement(this.selectors.resetSubmitButton)
    
    // Wait for reset request completion
    await this.waitForElement(this.selectors.successMessage, 'visible', 10000)
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(newPassword: string, confirmPassword: string): Promise<void> {
    // Fill new password fields
    await this.fillInput(this.selectors.newPasswordField, newPassword, { clear: true })
    await this.fillInput(this.selectors.confirmNewPasswordField, confirmPassword, { clear: true })
    
    // Submit reset
    await this.clickElement(this.selectors.resetSubmitButton)
    
    // Wait for reset completion
    await this.waitForPasswordResetCompletion()
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<void> {
    await this.clickElement(this.selectors.googleLoginButton)
    
    // Handle OAuth popup or redirect
    await this.handleOAuthFlow('google')
  }

  /**
   * Login with Facebook OAuth
   */
  async loginWithFacebook(): Promise<void> {
    await this.clickElement(this.selectors.facebookLoginButton)
    await this.handleOAuthFlow('facebook')
  }

  /**
   * Enter two-factor authentication code
   */
  async enter2FACode(code: string): Promise<void> {
    await this.waitForElement(this.selectors.twoFactorForm)
    
    await this.fillInput(this.selectors.twoFactorCodeField, code, { clear: true })
    await this.clickElement(this.selectors.twoFactorSubmitButton)
    
    // Wait for 2FA verification
    await this.waitFor2FACompletion()
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(): Promise<void> {
    await this.clickElement(this.selectors.enableTwoFactorButton)
    
    // Wait for QR code to appear
    await this.waitForElement(this.selectors.qrCodeImage)
    
    // In a real test, you would scan the QR code or get the secret key
    // For testing purposes, we'll simulate entering a verification code
    const testCode = '123456'
    await this.enter2FACode(testCode)
  }

  /**
   * Change password in security settings
   */
  async changePassword(passwords: PasswordChangeData): Promise<void> {
    await this.waitForElement(this.selectors.changePasswordForm)
    
    // Fill password change form
    await this.fillInput(this.selectors.currentPasswordField, passwords.current, { clear: true })
    await this.fillInput(this.selectors.newPasswordFieldChange, passwords.new, { clear: true })
    await this.fillInput(this.selectors.confirmPasswordFieldChange, passwords.confirm, { clear: true })
    
    // Submit password change
    await this.clickElement('[data-testid="change-password-submit"]')
    
    // Wait for completion
    await this.waitForElement(this.selectors.successMessage, 'visible', 10000)
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Check if user is logged in
    const userProfileExists = await this.elementExists(this.selectors.userProfile, 2000)
    
    if (userProfileExists) {
      // Open profile dropdown
      await this.clickElement(this.selectors.userProfile)
      await this.waitForElement(this.selectors.profileDropdown)
      
      // Click logout
      await this.clickElement(this.selectors.logoutButton)
      
      // Wait for logout completion
      await this.waitForLogoutCompletion()
    }
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.elementExists(this.selectors.userProfile, 2000)
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<{ name: string; email: string } | null> {
    if (!(await this.isLoggedIn())) {
      return null
    }
    
    try {
      await this.clickElement(this.selectors.userProfile)
      await this.waitForElement(this.selectors.profileDropdown)
      
      const name = await this.getTextContent('[data-testid="user-name"]')
      const email = await this.getTextContent('[data-testid="user-email"]')
      
      // Close dropdown
      await this.clickElement(this.selectors.userProfile)
      
      return { name, email }
    } catch (error) {
      console.warn('Could not get current user info:', error)
      return null
    }
  }

  /**
   * Verify password strength indicator
   */
  async checkPasswordStrength(password: string): Promise<string> {
    // This would interact with password strength indicator
    const strengthIndicator = '[data-testid="password-strength"]'
    
    // Clear and type password
    await this.fillInput(this.selectors.passwordFieldRegister, password, { clear: true })
    
    // Wait for strength calculation
    await this.page.waitForTimeout(500)
    
    try {
      await this.waitForElement(strengthIndicator, 'visible', 2000)
      return await this.getTextContent(strengthIndicator)
    } catch {
      return 'unknown'
    }
  }

  /**
   * Get validation errors from form
   */
  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = []
    
    try {
      const errorElements = await this.page.locator(this.selectors.validationError).all()
      
      for (const element of errorElements) {
        const text = await element.textContent()
        if (text && text.trim()) {
          errors.push(text.trim())
        }
      }
    } catch (error) {
      console.debug('No validation errors found')
    }
    
    return errors
  }

  /**
   * Wait for email verification
   */
  async waitForEmailVerification(): Promise<void> {
    await this.waitForElement('[data-testid="email-verification-message"]', 'visible', 10000)
  }

  /**
   * Simulate email verification click
   */
  async simulateEmailVerification(token: string): Promise<void> {
    await this.navigate(`/#/auth/verify-email?token=${token}`)
    await this.waitForElement('[data-testid="verification-success"]', 'visible', 10000)
  }

  /**
   * Test keyboard navigation within forms
   */
  async testKeyboardNavigation(): Promise<boolean> {
    await this.navigateToLogin()
    
    try {
      // Test tab navigation
      await this.page.keyboard.press('Tab') // Email field
      const emailFocused = await this.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid') === 'email-field'
      })
      
      await this.page.keyboard.press('Tab') // Password field
      const passwordFocused = await this.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid') === 'password-field'
      })
      
      await this.page.keyboard.press('Tab') // Login button
      const buttonFocused = await this.page.evaluate(() => {
        return document.activeElement?.getAttribute('data-testid') === 'login-button'
      })
      
      return emailFocused && passwordFocused && buttonFocused
    } catch (error) {
      console.error('Keyboard navigation test failed:', error)
      return false
    }
  }

  // Private helper methods
  private async waitForLoginCompletion(): Promise<void> {
    try {
      // Wait for loading to disappear
      await this.waitForElement(this.selectors.loginSpinner, 'detached', 5000)
    } catch {
      // Spinner might not appear for fast logins
    }
    
    // Wait for either success (redirect) or error message
    await Promise.race([
      this.waitForPageLoad(), // Successful login
      this.waitForElement(this.selectors.errorMessage, 'visible', 10000) // Error
    ])
  }

  private async waitForRegistrationCompletion(): Promise<void> {
    try {
      // Wait for loading to complete
      await this.waitForElement('[data-testid="registration-loading"]', 'detached', 10000)
    } catch {
      // Loading might not be visible
    }
    
    // Wait for success or error message
    await Promise.race([
      this.waitForElement(this.selectors.successMessage, 'visible', 10000),
      this.waitForElement(this.selectors.errorMessage, 'visible', 10000)
    ])
  }

  private async waitForPasswordResetCompletion(): Promise<void> {
    await Promise.race([
      this.waitForElement(this.selectors.successMessage, 'visible', 10000),
      this.waitForElement(this.selectors.errorMessage, 'visible', 10000)
    ])
  }

  private async waitFor2FACompletion(): Promise<void> {
    // Wait for 2FA form to disappear (success) or error message
    await Promise.race([
      this.waitForElement(this.selectors.twoFactorForm, 'detached', 10000),
      this.waitForElement(this.selectors.errorMessage, 'visible', 10000)
    ])
  }

  private async waitForLogoutCompletion(): Promise<void> {
    // Wait for user profile to disappear
    await this.waitForElement(this.selectors.userProfile, 'detached', 5000)
    
    // Wait for login elements to appear
    await this.waitForElement(this.selectors.loginLink, 'visible', 5000)
  }

  private async handleOAuthFlow(provider: string): Promise<void> {
    // In a real implementation, this would handle OAuth popup/redirect
    // For testing, we'll wait for the expected result
    
    try {
      // Wait for OAuth completion (redirect back to app)
      await this.page.waitForURL(/.*oauth.*callback/, { timeout: 15000 })
      
      // Wait for authentication to complete
      await this.waitForPageLoad()
      
    } catch (error) {
      // Handle OAuth errors
      console.warn(`OAuth flow for ${provider} failed or timed out:`, error)
      
      // Check for error messages
      const errorExists = await this.elementExists(this.selectors.errorMessage, 2000)
      if (errorExists) {
        const errorText = await this.getTextContent(this.selectors.errorMessage)
        console.error(`OAuth error: ${errorText}`)
      }
    }
  }
}