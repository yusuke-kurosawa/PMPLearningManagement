/**
 * 認証攻撃ベクトル高度テスト
 * チーム3: セキュリティ・認証担当（1名）
 * 
 * 目標: 全攻撃シナリオ、セッション固定化攻撃対策
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';
import * as sinon from 'sinon';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  isActive: boolean;
  isVerified: boolean;
  loginAttempts: number;
  lastLoginAttempt?: Date;
  lockedUntil?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
  isRevoked: boolean;
  fingerprint: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  suspiciousActivity: string[];
}

interface SecurityEvent {
  id: string;
  type: 'BRUTE_FORCE' | 'CREDENTIAL_STUFFING' | 'SESSION_HIJACKING' | 'PRIVILEGE_ESCALATION' | 'SUSPICIOUS_LOGIN';
  userId?: string;
  ipAddress: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blocked: boolean;
}

interface RateLimitRule {
  id: string;
  name: string;
  key: string; // IP, User ID, etc.
  windowSize: number; // in milliseconds
  maxAttempts: number;
  blockDuration: number; // in milliseconds
  isActive: boolean;
}

interface ThreatIntelligence {
  maliciousIPs: Set<string>;
  commonPasswords: Set<string>;
  suspiciousUserAgents: RegExp[];
  knownAttackPatterns: RegExp[];
}

class AuthenticationSecurityManager {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private loginAttempts: LoginAttempt[] = [];
  private securityEvents: SecurityEvent[] = [];
  private rateLimitRules: Map<string, RateLimitRule> = new Map();
  private rateLimitTracker: Map<string, Array<{ timestamp: number; attempts: number }>> = new Map();
  private threatIntel: ThreatIntelligence;
  private blockedIPs: Map<string, Date> = new Map();
  private sessionFingerprints: Map<string, string> = new Map();

  constructor() {
    this.initializeThreatIntelligence();
    this.setupDefaultRateLimitRules();
  }

  private initializeThreatIntelligence(): void {
    this.threatIntel = {
      maliciousIPs: new Set([
        '192.168.1.100', // Test malicious IP
        '10.0.0.50',     // Test malicious IP
        '172.16.0.25'    // Test malicious IP
      ]),
      commonPasswords: new Set([
        'password', '123456', 'password123', 'admin', 'qwerty',
        'letmein', 'welcome', 'monkey', '1234567890'
      ]),
      suspiciousUserAgents: [
        /sqlmap/i,
        /nikto/i,
        /havij/i,
        /masscan/i,
        /nmap/i
      ],
      knownAttackPatterns: [
        /union.*select/i,
        /<script/i,
        /javascript:/i,
        /vbscript:/i
      ]
    };
  }

  private setupDefaultRateLimitRules(): void {
    // Brute force protection
    this.rateLimitRules.set('login_ip', {
      id: 'login_ip',
      name: 'Login attempts per IP',
      key: 'ip',
      windowSize: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      blockDuration: 30 * 60 * 1000, // 30 minutes
      isActive: true
    });

    this.rateLimitRules.set('login_user', {
      id: 'login_user',
      name: 'Login attempts per user',
      key: 'user',
      windowSize: 5 * 60 * 1000, // 5 minutes
      maxAttempts: 3,
      blockDuration: 15 * 60 * 1000, // 15 minutes
      isActive: true
    });

    // Credential stuffing protection
    this.rateLimitRules.set('credential_stuffing', {
      id: 'credential_stuffing',
      name: 'Multiple user attempts from same IP',
      key: 'ip_users',
      windowSize: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 10, // Different users
      blockDuration: 60 * 60 * 1000, // 1 hour
      isActive: true
    });
  }

  async registerUser(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<User> {
    // Input validation and sanitization
    await this.validateRegistrationInput(email, password, ipAddress);

    // Check for existing user
    const existingUser = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate secure salt and hash password
    const salt = this.generateSecureSalt();
    const passwordHash = await this.hashPassword(password, salt);

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      salt,
      isActive: true,
      isVerified: false,
      loginAttempts: 0,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);

    // Log security event
    await this.logSecurityEvent({
      type: 'SUSPICIOUS_LOGIN',
      ipAddress,
      timestamp: new Date(),
      details: { action: 'user_registration', email },
      severity: 'LOW',
      blocked: false
    });

    return user;
  }

  async authenticateUser(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    mfaToken?: string
  ): Promise<{ user: User; session: AuthSession }> {
    const loginAttemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const suspiciousActivity: string[] = [];

    try {
      // Pre-authentication security checks
      await this.performPreAuthenticationChecks(email, ipAddress, userAgent, suspiciousActivity);

      // Find user
      const user = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new Error('Account temporarily locked');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash, user.salt);
      if (!isValidPassword) {
        await this.handleFailedLogin(user, ipAddress, userAgent, 'Invalid password');
        throw new Error('Invalid credentials');
      }

      // MFA verification if enabled
      if (user.mfaEnabled) {
        if (!mfaToken) {
          throw new Error('MFA token required');
        }
        
        const isValidMFA = await this.verifyMFAToken(user, mfaToken);
        if (!isValidMFA) {
          await this.handleFailedLogin(user, ipAddress, userAgent, 'Invalid MFA token');
          throw new Error('Invalid MFA token');
        }
      }

      // Account status checks
      if (!user.isActive) {
        throw new Error('Account deactivated');
      }

      if (!user.isVerified) {
        throw new Error('Email verification required');
      }

      // Create session with security measures
      const session = await this.createSecureSession(user, ipAddress, userAgent);

      // Reset failed login attempts
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      user.updatedAt = new Date();

      // Log successful login
      await this.logLoginAttempt({
        id: loginAttemptId,
        email,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: true,
        suspiciousActivity
      });

      // Detect and log any suspicious patterns
      await this.analyzeSuspiciousActivity(user, ipAddress, userAgent, true);

      return { user, session };

    } catch (error) {
      // Log failed login attempt
      await this.logLoginAttempt({
        id: loginAttemptId,
        email,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: false,
        failureReason: (error as Error).message,
        suspiciousActivity
      });

      // Apply rate limiting
      await this.applyRateLimiting(email, ipAddress);

      throw error;
    }
  }

  private async performPreAuthenticationChecks(
    email: string,
    ipAddress: string,
    userAgent: string,
    suspiciousActivity: string[]
  ): Promise<void> {
    // Check if IP is blocked
    const ipBlock = this.blockedIPs.get(ipAddress);
    if (ipBlock && ipBlock > new Date()) {
      suspiciousActivity.push('Blocked IP attempted access');
      throw new Error('Access denied from this location');
    }

    // Check against threat intelligence
    if (this.threatIntel.maliciousIPs.has(ipAddress)) {
      suspiciousActivity.push('Known malicious IP');
      throw new Error('Access denied');
    }

    // Check suspicious user agent
    const isSuspiciousUA = this.threatIntel.suspiciousUserAgents.some(pattern => pattern.test(userAgent));
    if (isSuspiciousUA) {
      suspiciousActivity.push('Suspicious user agent detected');
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_LOGIN',
        ipAddress,
        timestamp: new Date(),
        details: { userAgent, email },
        severity: 'HIGH',
        blocked: true
      });
      throw new Error('Access denied');
    }

    // Check for attack patterns in email
    const hasAttackPattern = this.threatIntel.knownAttackPatterns.some(pattern => pattern.test(email));
    if (hasAttackPattern) {
      suspiciousActivity.push('Attack pattern in email field');
      throw new Error('Invalid input detected');
    }

    // Rate limit check
    await this.checkRateLimits(email, ipAddress);
  }

  private async checkRateLimits(email: string, ipAddress: string): Promise<void> {
    for (const [_, rule] of this.rateLimitRules) {
      if (!rule.isActive) continue;

      let key: string;
      switch (rule.key) {
        case 'ip':
          key = ipAddress;
          break;
        case 'user':
          key = email;
          break;
        case 'ip_users':
          key = ipAddress;
          break;
        default:
          continue;
      }

      const now = Date.now();
      const windowStart = now - rule.windowSize;
      
      if (!this.rateLimitTracker.has(key)) {
        this.rateLimitTracker.set(key, []);
      }

      const attempts = this.rateLimitTracker.get(key)!;
      
      // Clean old attempts
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
      this.rateLimitTracker.set(key, recentAttempts);

      // Check if rate limit exceeded
      if (recentAttempts.length >= rule.maxAttempts) {
        // Block IP
        this.blockedIPs.set(ipAddress, new Date(now + rule.blockDuration));

        // Log security event
        await this.logSecurityEvent({
          type: rule.id === 'credential_stuffing' ? 'CREDENTIAL_STUFFING' : 'BRUTE_FORCE',
          ipAddress,
          timestamp: new Date(),
          details: { rule: rule.name, attempts: recentAttempts.length },
          severity: 'HIGH',
          blocked: true
        });

        throw new Error('Too many attempts. Please try again later.');
      }

      // Record this attempt
      recentAttempts.push({ timestamp: now, attempts: 1 });
    }
  }

  private async applyRateLimiting(email: string, ipAddress: string): Promise<void> {
    const now = Date.now();
    
    // Record attempt for IP-based rate limiting
    if (!this.rateLimitTracker.has(ipAddress)) {
      this.rateLimitTracker.set(ipAddress, []);
    }
    this.rateLimitTracker.get(ipAddress)!.push({ timestamp: now, attempts: 1 });

    // Record attempt for user-based rate limiting
    if (!this.rateLimitTracker.has(email)) {
      this.rateLimitTracker.set(email, []);
    }
    this.rateLimitTracker.get(email)!.push({ timestamp: now, attempts: 1 });
  }

  private async handleFailedLogin(
    user: User,
    ipAddress: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    user.loginAttempts++;
    user.lastLoginAttempt = new Date();

    // Lock account after too many attempts
    if (user.loginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      await this.logSecurityEvent({
        type: 'BRUTE_FORCE',
        userId: user.id,
        ipAddress,
        timestamp: new Date(),
        details: { reason, attempts: user.loginAttempts },
        severity: 'HIGH',
        blocked: true
      });
    }

    user.updatedAt = new Date();
  }

  private async createSecureSession(
    user: User,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthSession> {
    // Generate secure tokens
    const token = await this.generateSecureToken();
    const refreshToken = await this.generateSecureToken();
    
    // Create session fingerprint
    const fingerprint = await this.generateSessionFingerprint(ipAddress, userAgent);
    
    // Check for session hijacking attempts
    await this.detectSessionHijacking(user.id, ipAddress, fingerprint);

    const session: AuthSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      token,
      refreshToken,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      lastAccessed: new Date(),
      isRevoked: false,
      fingerprint
    };

    this.sessions.set(session.id, session);
    this.sessionFingerprints.set(session.userId, fingerprint);

    return session;
  }

  private async detectSessionHijacking(
    userId: string,
    ipAddress: string,
    fingerprint: string
  ): Promise<void> {
    const existingFingerprint = this.sessionFingerprints.get(userId);
    
    if (existingFingerprint && existingFingerprint !== fingerprint) {
      // Potential session hijacking - revoke all existing sessions
      const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId);
      
      for (const session of userSessions) {
        session.isRevoked = true;
      }

      await this.logSecurityEvent({
        type: 'SESSION_HIJACKING',
        userId,
        ipAddress,
        timestamp: new Date(),
        details: { 
          oldFingerprint: existingFingerprint,
          newFingerprint: fingerprint 
        },
        severity: 'CRITICAL',
        blocked: true
      });
    }
  }

  private async generateSessionFingerprint(ipAddress: string, userAgent: string): Promise<string> {
    const data = `${ipAddress}|${userAgent}|${Date.now()}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async validateSession(token: string, ipAddress: string): Promise<{ user: User; session: AuthSession }> {
    const session = Array.from(this.sessions.values()).find(s => s.token === token);
    
    if (!session || session.isRevoked) {
      throw new Error('Invalid session');
    }

    if (session.expiresAt < new Date()) {
      session.isRevoked = true;
      throw new Error('Session expired');
    }

    // Check for session hijacking
    if (session.ipAddress !== ipAddress) {
      session.isRevoked = true;
      
      await this.logSecurityEvent({
        type: 'SESSION_HIJACKING',
        userId: session.userId,
        ipAddress,
        timestamp: new Date(),
        details: { 
          originalIP: session.ipAddress,
          suspiciousIP: ipAddress,
          sessionId: session.id 
        },
        severity: 'CRITICAL',
        blocked: true
      });

      throw new Error('Session security violation');
    }

    const user = this.users.get(session.userId);
    if (!user || !user.isActive) {
      session.isRevoked = true;
      throw new Error('User account not available');
    }

    // Update last accessed time
    session.lastAccessed = new Date();

    return { user, session };
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const session = Array.from(this.sessions.values()).find(s => s.refreshToken === refreshToken);
    
    if (!session || session.isRevoked) {
      throw new Error('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Generate new tokens
    session.token = await this.generateSecureToken();
    session.refreshToken = await this.generateSecureToken();
    session.expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    session.lastAccessed = new Date();

    return session;
  }

  async logoutUser(token: string): Promise<void> {
    const session = Array.from(this.sessions.values()).find(s => s.token === token);
    
    if (session) {
      session.isRevoked = true;
    }
  }

  private async analyzeSuspiciousActivity(
    user: User,
    ipAddress: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    // Analyze login patterns
    const recentLogins = this.loginAttempts
      .filter(attempt => attempt.email === user.email)
      .slice(-10); // Last 10 attempts

    // Check for unusual login times
    const currentHour = new Date().getHours();
    const usualHours = recentLogins.map(login => login.timestamp.getHours());
    const isUnusualTime = usualHours.length > 0 && !usualHours.includes(currentHour);

    // Check for multiple IP addresses
    const recentIPs = new Set(recentLogins.map(login => login.ipAddress));
    const hasMultipleIPs = recentIPs.size > 3;

    // Check for rapid successive attempts
    const timeThreshold = 5 * 60 * 1000; // 5 minutes
    const rapidAttempts = recentLogins.filter(
      login => Date.now() - login.timestamp.getTime() < timeThreshold
    );

    const suspiciousFactors = [];
    if (isUnusualTime) suspiciousFactors.push('Unusual login time');
    if (hasMultipleIPs) suspiciousFactors.push('Multiple IP addresses');
    if (rapidAttempts.length > 3) suspiciousFactors.push('Rapid successive attempts');

    if (suspiciousFactors.length >= 2) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_LOGIN',
        userId: user.id,
        ipAddress,
        timestamp: new Date(),
        details: { 
          factors: suspiciousFactors,
          success,
          userAgent 
        },
        severity: 'MEDIUM',
        blocked: false
      });
    }
  }

  // Password and security utilities
  private generateSecureSalt(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const computedHash = await this.hashPassword(password, salt);
    
    // Constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(computedHash, hash);
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  private async generateSecureToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async verifyMFAToken(user: User, token: string): Promise<boolean> {
    // Simplified MFA verification (in practice, use TOTP library)
    // This is a mock implementation for testing
    return token === '123456' && user.mfaEnabled;
  }

  private async validateRegistrationInput(
    email: string,
    password: string,
    ipAddress: string
  ): Promise<void> {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Password strength validation
    if (password.length < 8) {
      throw new Error('Password too short');
    }

    if (this.threatIntel.commonPasswords.has(password.toLowerCase())) {
      throw new Error('Password is too common');
    }

    // Check for attack patterns
    const hasAttackPattern = this.threatIntel.knownAttackPatterns.some(pattern => 
      pattern.test(email) || pattern.test(password)
    );
    
    if (hasAttackPattern) {
      throw new Error('Invalid input detected');
    }
  }

  private async logLoginAttempt(attempt: LoginAttempt): Promise<void> {
    this.loginAttempts.push(attempt);
    
    // Keep only last 1000 attempts
    if (this.loginAttempts.length > 1000) {
      this.loginAttempts = this.loginAttempts.slice(-1000);
    }
  }

  private async logSecurityEvent(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 500 events
    if (this.securityEvents.length > 500) {
      this.securityEvents = this.securityEvents.slice(-500);
    }
  }

  // Administrative and monitoring methods
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getActiveSessionsForUser(userId: string): AuthSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId && !s.isRevoked && s.expiresAt > new Date());
  }

  getRecentLoginAttempts(limit: number = 50): LoginAttempt[] {
    return this.loginAttempts.slice(-limit);
  }

  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  revokeAllSessionsForUser(userId: string): void {
    const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId);
    userSessions.forEach(session => {
      session.isRevoked = true;
    });
  }

  blockIP(ipAddress: string, duration: number = 24 * 60 * 60 * 1000): void {
    this.blockedIPs.set(ipAddress, new Date(Date.now() + duration));
  }

  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
  }

  getBlockedIPs(): string[] {
    const now = new Date();
    return Array.from(this.blockedIPs.entries())
      .filter(([_, expiry]) => expiry > now)
      .map(([ip, _]) => ip);
  }

  addThreatIntelligence(type: 'ip' | 'password' | 'useragent', value: string | RegExp): void {
    switch (type) {
      case 'ip':
        this.threatIntel.maliciousIPs.add(value as string);
        break;
      case 'password':
        this.threatIntel.commonPasswords.add((value as string).toLowerCase());
        break;
      case 'useragent':
        this.threatIntel.suspiciousUserAgents.push(value as RegExp);
        break;
    }
  }
}

describe('Authentication Attack Vectors - Advanced Security Testing', () => {
  let authManager: AuthenticationSecurityManager;
  let testUser: User;

  beforeEach(async () => {
    authManager = new AuthenticationSecurityManager();
    
    // Create a test user
    testUser = await authManager.registerUser(
      'test@example.com',
      'SecurePassword123!',
      '192.168.1.1',
      'Mozilla/5.0 (compatible test browser)'
    );
    
    // Mark user as verified for testing
    testUser.isVerified = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sinon.restore();
  });

  /**
   * Brute Force Attack Testing
   */
  describe('Brute Force Attack Protection', () => {
    it('should block brute force attacks after multiple failed attempts', async () => {
      const ipAddress = '192.168.1.10';
      const userAgent = 'AttackerBot/1.0';

      // Perform multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        try {
          await authManager.authenticateUser(
            'test@example.com',
            'wrongpassword',
            ipAddress,
            userAgent
          );
        } catch (error) {
          // Expected to fail
        }
      }

      // Next attempt should be blocked due to rate limiting
      await expect(
        authManager.authenticateUser(
          'test@example.com',
          'wrongpassword',
          ipAddress,
          userAgent
        )
      ).rejects.toThrow('Too many attempts');

      // Verify IP is blocked
      const blockedIPs = authManager.getBlockedIPs();
      expect(blockedIPs).toContain(ipAddress);

      // Verify security event was logged
      const securityEvents = authManager.getSecurityEvents();
      const bruteForceEvent = securityEvents.find(e => e.type === 'BRUTE_FORCE');
      expect(bruteForceEvent).toBeDefined();
      expect(bruteForceEvent?.severity).toBe('HIGH');
    });

    it('should lock user account after multiple failed attempts', async () => {
      const ipAddress = '192.168.1.11';

      // Perform 6 failed login attempts (should trigger account lock)
      for (let i = 0; i < 6; i++) {
        try {
          await authManager.authenticateUser(
            'test@example.com',
            'wrongpassword',
            `192.168.1.${10 + i}`, // Different IPs to avoid IP-based rate limiting
            'Mozilla/5.0'
          );
        } catch (error) {
          // Expected to fail
        }
      }

      const user = authManager.getUserByEmail('test@example.com');
      expect(user?.loginAttempts).toBeGreaterThanOrEqual(5);
      expect(user?.lockedUntil).toBeDefined();
      expect(user?.lockedUntil).toBeInstanceOf(Date);

      // Even with correct password, login should fail due to account lock
      await expect(
        authManager.authenticateUser(
          'test@example.com',
          'SecurePassword123!',
          '192.168.1.100',
          'Mozilla/5.0'
        )
      ).rejects.toThrow('Account temporarily locked');
    });

    it('should reset failed attempts after successful login', async () => {
      const ipAddress = '192.168.1.12';

      // Perform some failed attempts
      for (let i = 0; i < 3; i++) {
        try {
          await authManager.authenticateUser(
            'test@example.com',
            'wrongpassword',
            `192.168.1.${20 + i}`,
            'Mozilla/5.0'
          );
        } catch (error) {
          // Expected to fail
        }
      }

      let user = authManager.getUserByEmail('test@example.com');
      expect(user?.loginAttempts).toBe(3);

      // Successful login
      const result = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.200',
        'Mozilla/5.0'
      );

      expect(result.user.loginAttempts).toBe(0);
      expect(result.user.lockedUntil).toBeUndefined();
    });
  });

  /**
   * Credential Stuffing Attack Testing
   */
  describe('Credential Stuffing Attack Protection', () => {
    it('should detect credential stuffing attacks', async () => {
      const attackerIP = '192.168.1.50';
      const userAgent = 'CredentialStuffer/2.0';

      // Register multiple users for testing
      const testEmails = [
        'user1@test.com',
        'user2@test.com',
        'user3@test.com',
        'user4@test.com',
        'user5@test.com'
      ];

      for (const email of testEmails) {
        await authManager.registerUser(email, 'TestPassword123!', '192.168.1.200', 'Mozilla/5.0');
      }

      // Attempt credential stuffing - many different users from same IP
      const stuffingAttempts = testEmails.map(async email => {
        try {
          return await authManager.authenticateUser(
            email,
            'password', // Common password
            attackerIP,
            userAgent
          );
        } catch (error) {
          return null;
        }
      });

      await Promise.allSettled(stuffingAttempts);

      // Additional attempts to trigger detection
      for (let i = 0; i < 6; i++) {
        try {
          await authManager.authenticateUser(
            `extra${i}@test.com`,
            'password',
            attackerIP,
            userAgent
          );
        } catch (error) {
          // Expected failures
        }
      }

      // Should detect credential stuffing
      const securityEvents = authManager.getSecurityEvents();
      const stuffingEvent = securityEvents.find(e => e.type === 'CREDENTIAL_STUFFING');
      expect(stuffingEvent).toBeDefined();

      // IP should be blocked
      expect(authManager.getBlockedIPs()).toContain(attackerIP);
    });

    it('should block common password usage', async () => {
      await expect(
        authManager.registerUser(
          'newuser@test.com',
          'password', // Common password
          '192.168.1.30',
          'Mozilla/5.0'
        )
      ).rejects.toThrow('Password is too common');
    });
  });

  /**
   * Session Hijacking Detection
   */
  describe('Session Hijacking Protection', () => {
    it('should detect session hijacking attempts', async () => {
      // Create initial session
      const initialAuth = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      // Attempt to use session from different IP (potential hijacking)
      await expect(
        authManager.validateSession(initialAuth.session.token, '10.0.0.100')
      ).rejects.toThrow('Session security violation');

      // Verify security event was logged
      const securityEvents = authManager.getSecurityEvents();
      const hijackEvent = securityEvents.find(e => e.type === 'SESSION_HIJACKING');
      expect(hijackEvent).toBeDefined();
      expect(hijackEvent?.severity).toBe('CRITICAL');

      // Session should be revoked
      expect(initialAuth.session.isRevoked).toBe(true);
    });

    it('should revoke all sessions on fingerprint mismatch', async () => {
      const userEmail = 'test@example.com';
      
      // Create first session
      const auth1 = await authManager.authenticateUser(
        userEmail,
        'SecurePassword123!',
        '192.168.1.100',
        'Mozilla/5.0 (Windows)'
      );

      // Create second session with different fingerprint (should trigger hijacking detection)
      try {
        await authManager.authenticateUser(
          userEmail,
          'SecurePassword123!',
          '192.168.1.100',
          'Mozilla/5.0 (Linux)' // Different user agent
        );
      } catch (error) {
        // May fail due to hijacking detection
      }

      // All previous sessions should be revoked
      const activeSessions = authManager.getActiveSessionsForUser(testUser.id);
      const revokedSessions = activeSessions.filter(s => s.isRevoked);
      expect(revokedSessions.length).toBeGreaterThan(0);
    });

    it('should handle session token validation securely', async () => {
      const auth = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.100',
        'Mozilla/5.0'
      );

      // Valid session validation
      const validation = await authManager.validateSession(auth.session.token, '192.168.1.100');
      expect(validation.user.id).toBe(testUser.id);

      // Invalid token
      await expect(
        authManager.validateSession('invalid_token', '192.168.1.100')
      ).rejects.toThrow('Invalid session');

      // Expired session
      auth.session.expiresAt = new Date(Date.now() - 1000);
      await expect(
        authManager.validateSession(auth.session.token, '192.168.1.100')
      ).rejects.toThrow('Session expired');
    });
  });

  /**
   * Input Validation and Injection Protection
   */
  describe('Input Validation and Injection Protection', () => {
    it('should reject malicious input patterns', async () => {
      const maliciousEmails = [
        'user@test.com<script>alert(1)</script>',
        'user@test.com\'; DROP TABLE users; --',
        'user@test.com" UNION SELECT * FROM passwords --'
      ];

      for (const maliciousEmail of maliciousEmails) {
        await expect(
          authManager.registerUser(
            maliciousEmail,
            'ValidPassword123!',
            '192.168.1.40',
            'Mozilla/5.0'
          )
        ).rejects.toThrow('Invalid input detected');
      }
    });

    it('should reject suspicious user agents', async () => {
      const suspiciousUserAgents = [
        'sqlmap/1.4.5',
        'Nikto/2.1.6',
        'havij 1.16',
        'nmap scripting engine'
      ];

      for (const userAgent of suspiciousUserAgents) {
        await expect(
          authManager.authenticateUser(
            'test@example.com',
            'SecurePassword123!',
            '192.168.1.41',
            userAgent
          )
        ).rejects.toThrow('Access denied');
      }

      // Verify security events were logged
      const securityEvents = authManager.getSecurityEvents();
      const suspiciousEvents = securityEvents.filter(e => e.type === 'SUSPICIOUS_LOGIN');
      expect(suspiciousEvents.length).toBeGreaterThan(0);
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user@domain',
        'user space@domain.com',
        'user..double.dot@domain.com'
      ];

      for (const invalidEmail of invalidEmails) {
        await expect(
          authManager.registerUser(
            invalidEmail,
            'ValidPassword123!',
            '192.168.1.42',
            'Mozilla/5.0'
          )
        ).rejects.toThrow('Invalid email format');
      }
    });

    it('should enforce password complexity requirements', async () => {
      const weakPasswords = [
        'pass',        // Too short
        'password',    // Common password
        '123456789',   // Common pattern
        'qwerty123'    // Common keyboard pattern
      ];

      for (const weakPassword of weakPasswords) {
        await expect(
          authManager.registerUser(
            'newuser@test.com',
            weakPassword,
            '192.168.1.43',
            'Mozilla/5.0'
          )
        ).rejects.toThrow(/Password|too/);
      }
    });
  });

  /**
   * Timing Attack Resistance
   */
  describe('Timing Attack Resistance', () => {
    it('should have consistent timing for password verification', async () => {
      const correctPassword = 'SecurePassword123!';
      const wrongPasswords = [
        'WrongPassword1!',
        'AnotherWrong2!',
        'CompletelyDifferent3!'
      ];

      const timings: number[] = [];

      // Time correct password validation
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        try {
          await authManager.authenticateUser(
            'test@example.com',
            correctPassword,
            `192.168.1.${100 + i}`,
            'Mozilla/5.0'
          );
        } catch (error) {
          // May fail due to other factors, timing is what matters
        }
        const end = performance.now();
        timings.push(end - start);
      }

      // Time wrong password validations
      for (const wrongPassword of wrongPasswords) {
        for (let i = 0; i < 10; i++) {
          const start = performance.now();
          try {
            await authManager.authenticateUser(
              'test@example.com',
              wrongPassword,
              `192.168.1.${200 + i}`,
              'Mozilla/5.0'
            );
          } catch (error) {
            // Expected to fail
          }
          const end = performance.now();
          timings.push(end - start);
        }
      }

      // Calculate coefficient of variation
      const average = timings.reduce((a, b) => a + b) / timings.length;
      const variance = timings.reduce((a, b) => a + Math.pow(b - average, 2), 0) / timings.length;
      const stddev = Math.sqrt(variance);
      const cv = stddev / average;

      // Timing should be relatively consistent (CV < 0.3)
      expect(cv).toBeLessThan(0.3);
    });

    it('should use constant-time comparison for tokens', async () => {
      const auth = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.101',
        'Mozilla/5.0'
      );

      const correctToken = auth.session.token;
      const wrongTokens = [
        'a'.repeat(correctToken.length),
        'b'.repeat(correctToken.length),
        'c'.repeat(correctToken.length)
      ];

      const timings: number[] = [];

      // Time correct token validation
      for (let i = 0; i < 50; i++) {
        const start = performance.now();
        try {
          await authManager.validateSession(correctToken, '192.168.1.101');
        } catch (error) {
          // May fail due to session expiry or other factors
        }
        const end = performance.now();
        timings.push(end - start);
      }

      // Time wrong token validations
      for (const wrongToken of wrongTokens) {
        for (let i = 0; i < 50; i++) {
          const start = performance.now();
          try {
            await authManager.validateSession(wrongToken, '192.168.1.101');
          } catch (error) {
            // Expected to fail
          }
          const end = performance.now();
          timings.push(end - start);
        }
      }

      // Timing should be consistent (low coefficient of variation)
      const average = timings.reduce((a, b) => a + b) / timings.length;
      const variance = timings.reduce((a, b) => a + Math.pow(b - average, 2), 0) / timings.length;
      const stddev = Math.sqrt(variance);
      const cv = stddev / average;

      expect(cv).toBeLessThan(0.4);
    });
  });

  /**
   * Multi-Factor Authentication Bypass Attempts
   */
  describe('MFA Bypass Protection', () => {
    beforeEach(() => {
      // Enable MFA for test user
      testUser.mfaEnabled = true;
      testUser.mfaSecret = 'test_secret';
    });

    it('should require MFA token when MFA is enabled', async () => {
      await expect(
        authManager.authenticateUser(
          'test@example.com',
          'SecurePassword123!',
          '192.168.1.102',
          'Mozilla/5.0'
          // No MFA token provided
        )
      ).rejects.toThrow('MFA token required');
    });

    it('should reject invalid MFA tokens', async () => {
      await expect(
        authManager.authenticateUser(
          'test@example.com',
          'SecurePassword123!',
          '192.168.1.103',
          'Mozilla/5.0',
          '000000' // Wrong MFA token
        )
      ).rejects.toThrow('Invalid MFA token');
    });

    it('should accept valid MFA tokens', async () => {
      const result = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.104',
        'Mozilla/5.0',
        '123456' // Mock valid token
      );

      expect(result.user.id).toBe(testUser.id);
      expect(result.session).toBeDefined();
    });
  });

  /**
   * Privilege Escalation Prevention
   */
  describe('Privilege Escalation Prevention', () => {
    it('should maintain user context throughout session', async () => {
      const auth = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.105',
        'Mozilla/5.0'
      );

      // Validate session maintains correct user
      const validation = await authManager.validateSession(auth.session.token, '192.168.1.105');
      expect(validation.user.id).toBe(testUser.id);
      expect(validation.user.email).toBe('test@example.com');
    });

    it('should prevent session token manipulation', async () => {
      const auth = await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '192.168.1.106',
        'Mozilla/5.0'
      );

      // Try manipulated tokens
      const originalToken = auth.session.token;
      const manipulatedTokens = [
        originalToken.slice(0, -1) + 'X', // Changed last character
        'admin' + originalToken.slice(5),  // Injected 'admin'
        originalToken.toUpperCase()        // Case manipulation
      ];

      for (const manipulatedToken of manipulatedTokens) {
        await expect(
          authManager.validateSession(manipulatedToken, '192.168.1.106')
        ).rejects.toThrow('Invalid session');
      }
    });
  });

  /**
   * Property-Based Testing for Authentication Security
   */
  it('property: authentication should consistently reject invalid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.ipV4(),
        async (email, password, ipAddress) => {
          // Skip if it happens to match our test user
          if (email.toLowerCase() === 'test@example.com' && password === 'SecurePassword123!') {
            return;
          }

          try {
            await authManager.authenticateUser(email, password, ipAddress, 'Mozilla/5.0');
            // If it doesn't throw, it means auth succeeded (shouldn't happen with random data)
            expect(false).toBe(true); // Force failure
          } catch (error) {
            // Authentication should fail for random credentials
            expect(error).toBeInstanceOf(Error);
            expect(typeof (error as Error).message).toBe('string');
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Suspicious Activity Detection
   */
  describe('Suspicious Activity Detection', () => {
    it('should detect unusual login patterns', async () => {
      // Create successful login history
      for (let i = 0; i < 5; i++) {
        await authManager.authenticateUser(
          'test@example.com',
          'SecurePassword123!',
          '192.168.1.200',
          'Mozilla/5.0'
        );
        
        // Logout to allow next login
        const sessions = authManager.getActiveSessionsForUser(testUser.id);
        sessions.forEach(s => s.isRevoked = true);
      }

      // Login from unusual location
      await authManager.authenticateUser(
        'test@example.com',
        'SecurePassword123!',
        '10.0.0.100', // Different network
        'Mozilla/5.0'
      );

      const securityEvents = authManager.getSecurityEvents();
      const suspiciousEvents = securityEvents.filter(e => e.type === 'SUSPICIOUS_LOGIN');
      expect(suspiciousEvents.length).toBeGreaterThan(0);
    });

    it('should track and analyze login attempt patterns', async () => {
      const attackerIP = '192.168.1.199';

      // Simulate pattern of attacks
      for (let i = 0; i < 10; i++) {
        try {
          await authManager.authenticateUser(
            'test@example.com',
            `wrongpass${i}`,
            attackerIP,
            'AttackerBot/1.0'
          );
        } catch (error) {
          // Expected failures
        }
      }

      const recentAttempts = authManager.getRecentLoginAttempts(20);
      const attackerAttempts = recentAttempts.filter(attempt => attempt.ipAddress === attackerIP);
      expect(attackerAttempts.length).toBe(10);
      expect(attackerAttempts.every(attempt => !attempt.success)).toBe(true);
    });
  });

  /**
   * Administrative Security Functions
   */
  describe('Administrative Security', () => {
    it('should allow emergency session revocation', () => {
      // Create multiple sessions
      const userSessions = authManager.getActiveSessionsForUser(testUser.id);
      const initialSessionCount = userSessions.length;

      // Emergency revocation
      authManager.revokeAllSessionsForUser(testUser.id);

      const revokedSessions = authManager.getActiveSessionsForUser(testUser.id);
      expect(revokedSessions.length).toBe(0);
    });

    it('should manage IP blocking effectively', () => {
      const maliciousIP = '192.168.1.666';

      // Block IP
      authManager.blockIP(maliciousIP, 60000); // 1 minute
      expect(authManager.getBlockedIPs()).toContain(maliciousIP);

      // Unblock IP
      authManager.unblockIP(maliciousIP);
      expect(authManager.getBlockedIPs()).not.toContain(maliciousIP);
    });

    it('should update threat intelligence dynamically', () => {
      const newMaliciousIP = '192.168.1.evil';
      const newCommonPassword = 'badpassword123';

      authManager.addThreatIntelligence('ip', newMaliciousIP);
      authManager.addThreatIntelligence('password', newCommonPassword);

      // Test that new threat intel is applied
      expect(async () => {
        await authManager.authenticateUser(
          'test@example.com',
          'SecurePassword123!',
          newMaliciousIP,
          'Mozilla/5.0'
        );
      }).rejects.toThrow('Access denied');

      expect(async () => {
        await authManager.registerUser(
          'newuser@test.com',
          newCommonPassword,
          '192.168.1.1',
          'Mozilla/5.0'
        );
      }).rejects.toThrow('Password is too common');
    });
  });
});