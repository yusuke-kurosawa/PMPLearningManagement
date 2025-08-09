/**
 * 複雑ビジネスルール高度テスト
 * チーム1: コアロジック・アルゴリズム担当（2名）
 * 
 * 目標: 100%エラーパス、境界値網羅
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';

interface BusinessRule {
  id: string;
  name: string;
  conditions: Condition[];
  actions: Action[];
  priority: number;
  isActive: boolean;
}

interface Condition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface Action {
  type: 'SET_FIELD' | 'CALCULATE' | 'VALIDATE' | 'NOTIFY' | 'LOG' | 'BLOCK';
  target: string;
  value: any;
  parameters?: Record<string, any>;
}

interface RuleContext {
  user: UserData;
  session: SessionData;
  progress: ProgressData;
  environment: EnvironmentData;
  timestamp: Date;
}

interface UserData {
  id: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  completedProcesses: string[];
  averageScore: number;
  studyStreak: number;
  lastActivity: Date;
  preferences: UserPreferences;
}

interface SessionData {
  sessionId: string;
  startTime: Date;
  duration: number;
  actions: string[];
  score: number;
  completed: boolean;
}

interface ProgressData {
  totalHours: number;
  weeklyGoal: number;
  monthlyProgress: number;
  knowledgeAreaScores: Record<string, number>;
  certificationProgress: number;
}

interface EnvironmentData {
  platform: 'web' | 'mobile' | 'tablet';
  timezone: string;
  locale: string;
  isOfflineMode: boolean;
}

interface UserPreferences {
  studyReminders: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningPath: string;
  notificationSettings: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

class BusinessRuleEngine {
  private rules: Map<string, BusinessRule> = new Map();
  private executionHistory: Array<{ ruleId: string; timestamp: Date; result: any }> = [];

  addRule(rule: BusinessRule): void {
    if (!this.validateRule(rule)) {
      throw new Error(`Invalid business rule: ${rule.id}`);
    }
    this.rules.set(rule.id, rule);
  }

  executeRules(context: RuleContext): RuleExecutionResult {
    const applicableRules = this.findApplicableRules(context);
    const sortedRules = this.sortRulesByPriority(applicableRules);
    
    const results: Array<{ ruleId: string; success: boolean; result: any; error?: Error }> = [];
    const modifications: Record<string, any> = {};

    for (const rule of sortedRules) {
      try {
        const ruleResult = this.executeRule(rule, context);
        results.push({ ruleId: rule.id, success: true, result: ruleResult });
        
        // Apply modifications to context for subsequent rules
        if (ruleResult.modifications) {
          Object.assign(modifications, ruleResult.modifications);
          this.applyModifications(context, ruleResult.modifications);
        }
      } catch (error) {
        results.push({ 
          ruleId: rule.id, 
          success: false, 
          result: null, 
          error: error as Error 
        });
        
        // Log execution failure
        this.logExecution(rule.id, false, error);
      }
    }

    return {
      executedRules: results.length,
      successfulExecutions: results.filter(r => r.success).length,
      failedExecutions: results.filter(r => !r.success).length,
      results,
      finalContext: context,
      modifications
    };
  }

  private validateRule(rule: BusinessRule): boolean {
    // Complex rule validation logic
    if (!rule.id || !rule.name) return false;
    if (!rule.conditions || rule.conditions.length === 0) return false;
    if (!rule.actions || rule.actions.length === 0) return false;
    if (typeof rule.priority !== 'number') return false;

    // Validate conditions
    for (const condition of rule.conditions) {
      if (!this.validateCondition(condition)) return false;
    }

    // Validate actions
    for (const action of rule.actions) {
      if (!this.validateAction(action)) return false;
    }

    return true;
  }

  private validateCondition(condition: Condition): boolean {
    const validOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'regex'];
    const validLogicalOperators = ['AND', 'OR'];

    if (!condition.field || !validOperators.includes(condition.operator)) {
      return false;
    }

    if (condition.logicalOperator && !validLogicalOperators.includes(condition.logicalOperator)) {
      return false;
    }

    // Value-specific validations
    if (condition.operator === 'regex' && typeof condition.value !== 'string') {
      return false;
    }

    if (['in', 'nin'].includes(condition.operator) && !Array.isArray(condition.value)) {
      return false;
    }

    return true;
  }

  private validateAction(action: Action): boolean {
    const validActionTypes = ['SET_FIELD', 'CALCULATE', 'VALIDATE', 'NOTIFY', 'LOG', 'BLOCK'];
    
    if (!validActionTypes.includes(action.type) || !action.target) {
      return false;
    }

    // Type-specific validations
    if (action.type === 'CALCULATE' && !action.parameters?.formula) {
      return false;
    }

    if (action.type === 'VALIDATE' && !action.parameters?.validator) {
      return false;
    }

    return true;
  }

  private findApplicableRules(context: RuleContext): BusinessRule[] {
    const applicableRules: BusinessRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.isActive) continue;

      if (this.evaluateConditions(rule.conditions, context)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  private evaluateConditions(conditions: Condition[], context: RuleContext): boolean {
    if (conditions.length === 0) return false;

    let result = true;
    let currentLogicalOp: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (currentLogicalOp === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOp = condition.logicalOperator;
      }
    }

    return result;
  }

  private evaluateCondition(condition: Condition, context: RuleContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    const { operator, value } = condition;

    try {
      switch (operator) {
        case 'eq':
          return fieldValue === value;
        case 'ne':
          return fieldValue !== value;
        case 'gt':
          return Number(fieldValue) > Number(value);
        case 'gte':
          return Number(fieldValue) >= Number(value);
        case 'lt':
          return Number(fieldValue) < Number(value);
        case 'lte':
          return Number(fieldValue) <= Number(value);
        case 'in':
          return Array.isArray(value) && value.includes(fieldValue);
        case 'nin':
          return Array.isArray(value) && !value.includes(fieldValue);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
        case 'regex':
          const regex = new RegExp(value);
          return regex.test(String(fieldValue));
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    } catch (error) {
      // Log evaluation error and return false
      console.error(`Condition evaluation failed: ${condition.field} ${operator} ${value}`, error);
      return false;
    }
  }

  private getFieldValue(field: string, context: RuleContext): any {
    const fieldParts = field.split('.');
    let value: any = context;

    for (const part of fieldParts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }

    return value;
  }

  private sortRulesByPriority(rules: BusinessRule[]): BusinessRule[] {
    return rules.sort((a, b) => b.priority - a.priority);
  }

  private executeRule(rule: BusinessRule, context: RuleContext): RuleResult {
    const modifications: Record<string, any> = {};
    const notifications: string[] = [];
    const validationErrors: string[] = [];
    let isBlocked = false;

    for (const action of rule.actions) {
      const actionResult = this.executeAction(action, context);
      
      if (actionResult.modifications) {
        Object.assign(modifications, actionResult.modifications);
      }
      
      if (actionResult.notifications) {
        notifications.push(...actionResult.notifications);
      }
      
      if (actionResult.validationErrors) {
        validationErrors.push(...actionResult.validationErrors);
      }
      
      if (actionResult.blocked) {
        isBlocked = true;
      }
    }

    const result: RuleResult = {
      ruleId: rule.id,
      executed: true,
      modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
      notifications: notifications.length > 0 ? notifications : undefined,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      blocked: isBlocked
    };

    this.logExecution(rule.id, true, result);
    return result;
  }

  private executeAction(action: Action, context: RuleContext): ActionResult {
    const result: ActionResult = {};

    try {
      switch (action.type) {
        case 'SET_FIELD':
          result.modifications = { [action.target]: action.value };
          break;

        case 'CALCULATE':
          const calculatedValue = this.performCalculation(action, context);
          result.modifications = { [action.target]: calculatedValue };
          break;

        case 'VALIDATE':
          const validationResult = this.performValidation(action, context);
          if (!validationResult.isValid) {
            result.validationErrors = [validationResult.error];
          }
          break;

        case 'NOTIFY':
          result.notifications = [this.generateNotification(action, context)];
          break;

        case 'LOG':
          console.log(`Business Rule Log: ${action.target}`, action.value);
          break;

        case 'BLOCK':
          result.blocked = true;
          result.notifications = [`Action blocked: ${action.target}`];
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      result.validationErrors = [`Action execution failed: ${(error as Error).message}`];
    }

    return result;
  }

  private performCalculation(action: Action, context: RuleContext): number {
    const formula = action.parameters?.formula;
    if (!formula) throw new Error('No formula provided for calculation');

    // Simple formula evaluation (in real implementation, use a secure parser)
    const variables = this.extractVariablesFromFormula(formula);
    let evaluableFormula = formula;

    for (const variable of variables) {
      const value = this.getFieldValue(variable, context);
      evaluableFormula = evaluableFormula.replace(
        new RegExp(`\\b${variable}\\b`, 'g'),
        String(value || 0)
      );
    }

    // Basic arithmetic evaluation (unsafe - for demo only)
    try {
      return Function(`"use strict"; return (${evaluableFormula})`)();
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${formula}`);
    }
  }

  private extractVariablesFromFormula(formula: string): string[] {
    const variableRegex = /\b[a-zA-Z][a-zA-Z0-9_.]*\b/g;
    const matches = formula.match(variableRegex) || [];
    return [...new Set(matches)].filter(match => 
      !['Math', 'parseInt', 'parseFloat', 'Number'].includes(match)
    );
  }

  private performValidation(action: Action, context: RuleContext): ValidationResult {
    const validator = action.parameters?.validator;
    const targetValue = this.getFieldValue(action.target, context);

    switch (validator) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(String(targetValue)),
          error: emailRegex.test(String(targetValue)) ? '' : 'Invalid email format'
        };

      case 'range':
        const min = action.parameters?.min || 0;
        const max = action.parameters?.max || 100;
        const numValue = Number(targetValue);
        const inRange = numValue >= min && numValue <= max;
        return {
          isValid: inRange,
          error: inRange ? '' : `Value must be between ${min} and ${max}`
        };

      case 'required':
        const isRequired = targetValue !== null && targetValue !== undefined && targetValue !== '';
        return {
          isValid: isRequired,
          error: isRequired ? '' : 'Field is required'
        };

      default:
        return { isValid: true, error: '' };
    }
  }

  private generateNotification(action: Action, context: RuleContext): string {
    const template = action.value as string;
    let notification = template;

    // Simple template variable replacement
    const variableRegex = /\{\{([^}]+)\}\}/g;
    notification = notification.replace(variableRegex, (match, variable) => {
      const value = this.getFieldValue(variable.trim(), context);
      return String(value || '');
    });

    return notification;
  }

  private applyModifications(context: RuleContext, modifications: Record<string, any>): void {
    for (const [field, value] of Object.entries(modifications)) {
      this.setFieldValue(field, value, context);
    }
  }

  private setFieldValue(field: string, value: any, context: RuleContext): void {
    const fieldParts = field.split('.');
    let target: any = context;

    for (let i = 0; i < fieldParts.length - 1; i++) {
      const part = fieldParts[i];
      if (!(part in target)) {
        target[part] = {};
      }
      target = target[part];
    }

    target[fieldParts[fieldParts.length - 1]] = value;
  }

  private logExecution(ruleId: string, success: boolean, result: any): void {
    this.executionHistory.push({
      ruleId,
      timestamp: new Date(),
      result: { success, data: result }
    });
  }

  getExecutionHistory(): Array<{ ruleId: string; timestamp: Date; result: any }> {
    return [...this.executionHistory];
  }

  clearExecutionHistory(): void {
    this.executionHistory = [];
  }
}

interface RuleExecutionResult {
  executedRules: number;
  successfulExecutions: number;
  failedExecutions: number;
  results: Array<{ ruleId: string; success: boolean; result: any; error?: Error }>;
  finalContext: RuleContext;
  modifications: Record<string, any>;
}

interface RuleResult {
  ruleId: string;
  executed: boolean;
  modifications?: Record<string, any>;
  notifications?: string[];
  validationErrors?: string[];
  blocked?: boolean;
}

interface ActionResult {
  modifications?: Record<string, any>;
  notifications?: string[];
  validationErrors?: string[];
  blocked?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error: string;
}

describe('Complex Business Rules Engine - Advanced Testing', () => {
  let engine: BusinessRuleEngine;
  let mockContext: RuleContext;

  beforeEach(() => {
    engine = new BusinessRuleEngine();
    
    mockContext = {
      user: {
        id: 'user123',
        subscriptionTier: 'premium',
        completedProcesses: ['PROC_001', 'PROC_002'],
        averageScore: 85.5,
        studyStreak: 7,
        lastActivity: new Date('2024-01-15'),
        preferences: {
          studyReminders: true,
          difficultyLevel: 'intermediate',
          learningPath: 'standard',
          notificationSettings: {
            email: true,
            push: false,
            sms: false,
            frequency: 'weekly'
          }
        }
      },
      session: {
        sessionId: 'session456',
        startTime: new Date('2024-01-15T09:00:00'),
        duration: 120,
        actions: ['VIEW_PROCESS', 'COMPLETE_QUIZ'],
        score: 88,
        completed: true
      },
      progress: {
        totalHours: 45.5,
        weeklyGoal: 10,
        monthlyProgress: 0.75,
        knowledgeAreaScores: {
          'Integration': 92,
          'Scope': 78,
          'Schedule': 85
        },
        certificationProgress: 0.65
      },
      environment: {
        platform: 'web',
        timezone: 'Asia/Tokyo',
        locale: 'ja-JP',
        isOfflineMode: false
      },
      timestamp: new Date('2024-01-15T10:00:00')
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property-Based Testing: ルール実行の数学的不変条件
   */
  it('property: rule execution should maintain system invariants', () => {
    fc.assert(
      fc.property(
        fc.record({
          subscriptionTier: fc.constantFrom('free', 'premium', 'enterprise'),
          averageScore: fc.float({ min: 0, max: 100 }),
          studyStreak: fc.integer({ min: 0, max: 365 }),
          sessionScore: fc.integer({ min: 0, max: 100 }),
          totalHours: fc.float({ min: 0, max: 1000 }),
          certificationProgress: fc.float({ min: 0, max: 1 })
        }),
        (testData) => {
          const testContext = {
            ...mockContext,
            user: {
              ...mockContext.user,
              subscriptionTier: testData.subscriptionTier,
              averageScore: testData.averageScore,
              studyStreak: testData.studyStreak
            },
            session: {
              ...mockContext.session,
              score: testData.sessionScore
            },
            progress: {
              ...mockContext.progress,
              totalHours: testData.totalHours,
              certificationProgress: testData.certificationProgress
            }
          };

          // Add test rules
          engine.addRule({
            id: 'SCORE_VALIDATION',
            name: 'Validate Score Range',
            conditions: [
              { field: 'session.score', operator: 'gte', value: 0 },
              { field: 'session.score', operator: 'lte', value: 100, logicalOperator: 'AND' }
            ],
            actions: [
              { type: 'VALIDATE', target: 'session.score', value: null, parameters: { validator: 'range', min: 0, max: 100 } }
            ],
            priority: 100,
            isActive: true
          });

          const result = engine.executeRules(testContext);

          // Invariant: execution count should be non-negative
          expect(result.executedRules).toBeGreaterThanOrEqual(0);
          expect(result.successfulExecutions).toBeGreaterThanOrEqual(0);
          expect(result.failedExecutions).toBeGreaterThanOrEqual(0);
          
          // Invariant: successful + failed should equal total
          expect(result.successfulExecutions + result.failedExecutions).toBe(result.executedRules);

          // Invariant: context should remain well-formed
          expect(result.finalContext).toBeDefined();
          expect(result.finalContext.user).toBeDefined();
          expect(result.finalContext.session).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Complex Conditional Logic Testing
   */
  describe('Complex Conditional Logic', () => {
    it('should handle nested AND/OR conditions correctly', () => {
      engine.addRule({
        id: 'COMPLEX_ELIGIBILITY',
        name: 'Complex Eligibility Check',
        conditions: [
          { field: 'user.subscriptionTier', operator: 'in', value: ['premium', 'enterprise'] },
          { field: 'user.averageScore', operator: 'gte', value: 80, logicalOperator: 'AND' },
          { field: 'progress.certificationProgress', operator: 'lt', value: 0.9, logicalOperator: 'OR' },
          { field: 'user.studyStreak', operator: 'gte', value: 5, logicalOperator: 'AND' }
        ],
        actions: [
          { type: 'SET_FIELD', target: 'user.eligible', value: true }
        ],
        priority: 50,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      expect(result.successfulExecutions).toBeGreaterThan(0);
      expect(mockContext.user.eligible).toBe(true);
    });

    it('should handle regex conditions properly', () => {
      engine.addRule({
        id: 'EMAIL_VALIDATION',
        name: 'Email Format Validation',
        conditions: [
          { field: 'user.id', operator: 'regex', value: '^[a-zA-Z0-9]+$' }
        ],
        actions: [
          { type: 'VALIDATE', target: 'user.id', value: null, parameters: { validator: 'email' } }
        ],
        priority: 90,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      expect(result.executedRules).toBeGreaterThan(0);
    });

    it('should handle contains operations with case sensitivity', () => {
      engine.addRule({
        id: 'ACTION_FILTER',
        name: 'Filter Session Actions',
        conditions: [
          { field: 'session.actions', operator: 'contains', value: 'QUIZ' }
        ],
        actions: [
          { type: 'SET_FIELD', target: 'session.hasQuiz', value: true }
        ],
        priority: 60,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      expect((result.finalContext.session as any).hasQuiz).toBe(true);
    });
  });

  /**
   * Action Execution Edge Cases
   */
  describe('Action Execution', () => {
    it('should perform complex calculations', () => {
      engine.addRule({
        id: 'SCORE_CALCULATION',
        name: 'Calculate Weighted Score',
        conditions: [
          { field: 'session.completed', operator: 'eq', value: true }
        ],
        actions: [
          {
            type: 'CALCULATE',
            target: 'session.weightedScore',
            value: null,
            parameters: {
              formula: 'session.score * 0.7 + user.averageScore * 0.3'
            }
          }
        ],
        priority: 80,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      const expectedScore = mockContext.session.score * 0.7 + mockContext.user.averageScore * 0.3;
      expect((result.finalContext.session as any).weightedScore).toBeCloseTo(expectedScore, 2);
    });

    it('should handle validation failures gracefully', () => {
      engine.addRule({
        id: 'INVALID_VALIDATION',
        name: 'Invalid Validation Test',
        conditions: [
          { field: 'user.id', operator: 'eq', value: 'user123' }
        ],
        actions: [
          {
            type: 'VALIDATE',
            target: 'user.averageScore',
            value: null,
            parameters: { validator: 'range', min: 0, max: 50 } // This should fail
          }
        ],
        priority: 70,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      const ruleResult = result.results.find(r => r.ruleId === 'INVALID_VALIDATION');
      expect(ruleResult?.result.validationErrors).toBeDefined();
      expect(ruleResult?.result.validationErrors[0]).toContain('must be between 0 and 50');
    });

    it('should generate template-based notifications', () => {
      engine.addRule({
        id: 'NOTIFICATION_TEMPLATE',
        name: 'Template Notification',
        conditions: [
          { field: 'user.studyStreak', operator: 'gte', value: 7 }
        ],
        actions: [
          {
            type: 'NOTIFY',
            target: 'streak_achievement',
            value: 'Congratulations {{user.id}}! You have maintained a {{user.studyStreak}}-day study streak!'
          }
        ],
        priority: 40,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      const ruleResult = result.results.find(r => r.ruleId === 'NOTIFICATION_TEMPLATE');
      expect(ruleResult?.result.notifications[0]).toContain('user123');
      expect(ruleResult?.result.notifications[0]).toContain('7-day');
    });

    it('should handle blocking actions', () => {
      engine.addRule({
        id: 'ACCESS_BLOCK',
        name: 'Block Access Rule',
        conditions: [
          { field: 'user.subscriptionTier', operator: 'eq', value: 'free' }
        ],
        actions: [
          { type: 'BLOCK', target: 'advanced_features', value: 'Premium subscription required' }
        ],
        priority: 100,
        isActive: true
      });

      // Modify context to trigger blocking
      const freeUserContext = {
        ...mockContext,
        user: { ...mockContext.user, subscriptionTier: 'free' as const }
      };

      const result = engine.executeRules(freeUserContext);
      const ruleResult = result.results.find(r => r.ruleId === 'ACCESS_BLOCK');
      expect(ruleResult?.result.blocked).toBe(true);
    });
  });

  /**
   * Error Path Testing: 例外処理の完全カバレッジ
   */
  describe('Error Handling', () => {
    it('should reject invalid rules during addition', () => {
      const invalidRule = {
        id: '',  // Invalid: empty ID
        name: 'Invalid Rule',
        conditions: [],  // Invalid: no conditions
        actions: [],     // Invalid: no actions
        priority: 'high' as any,  // Invalid: non-numeric priority
        isActive: true
      };

      expect(() => engine.addRule(invalidRule)).toThrow('Invalid business rule');
    });

    it('should handle malformed conditions gracefully', () => {
      engine.addRule({
        id: 'MALFORMED_CONDITION',
        name: 'Test Malformed Condition',
        conditions: [
          { field: 'nonexistent.field', operator: 'eq', value: 'test' }
        ],
        actions: [
          { type: 'LOG', target: 'test', value: 'Test log' }
        ],
        priority: 50,
        isActive: true
      });

      // Should not throw, but condition should evaluate to false
      const result = engine.executeRules(mockContext);
      expect(result.executedRules).toBe(0); // Rule not executed due to false condition
    });

    it('should handle calculation errors in formulas', () => {
      engine.addRule({
        id: 'BAD_CALCULATION',
        name: 'Bad Calculation Test',
        conditions: [
          { field: 'user.id', operator: 'eq', value: 'user123' }
        ],
        actions: [
          {
            type: 'CALCULATE',
            target: 'test.result',
            value: null,
            parameters: {
              formula: 'nonexistent.field / 0'  // This will cause an error
            }
          }
        ],
        priority: 50,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      const ruleResult = result.results.find(r => r.ruleId === 'BAD_CALCULATION');
      expect(ruleResult?.success).toBe(false);
      expect(ruleResult?.error).toBeDefined();
    });

    it('should handle circular field references', () => {
      engine.addRule({
        id: 'CIRCULAR_REF',
        name: 'Circular Reference Test',
        conditions: [
          { field: 'user.id', operator: 'eq', value: 'user123' }
        ],
        actions: [
          { type: 'SET_FIELD', target: 'test.a', value: '{{test.b}}' },
          { type: 'SET_FIELD', target: 'test.b', value: '{{test.a}}' }
        ],
        priority: 50,
        isActive: true
      });

      // Should handle gracefully without infinite loop
      expect(() => engine.executeRules(mockContext)).not.toThrow();
    });
  });

  /**
   * Boundary Value Testing
   */
  describe('Boundary Values', () => {
    it('should handle extreme numeric values', () => {
      const extremeContext = {
        ...mockContext,
        user: {
          ...mockContext.user,
          averageScore: Number.MAX_SAFE_INTEGER
        },
        progress: {
          ...mockContext.progress,
          totalHours: Number.MIN_SAFE_INTEGER
        }
      };

      engine.addRule({
        id: 'EXTREME_VALUES',
        name: 'Test Extreme Values',
        conditions: [
          { field: 'user.averageScore', operator: 'gt', value: 0 }
        ],
        actions: [
          {
            type: 'CALCULATE',
            target: 'test.result',
            value: null,
            parameters: {
              formula: 'user.averageScore + progress.totalHours'
            }
          }
        ],
        priority: 50,
        isActive: true
      });

      const result = engine.executeRules(extremeContext);
      expect(result.executedRules).toBeGreaterThan(0);
    });

    it('should handle empty and null values', () => {
      const nullContext = {
        ...mockContext,
        user: {
          ...mockContext.user,
          completedProcesses: [],
          averageScore: 0
        },
        session: {
          ...mockContext.session,
          actions: []
        }
      };

      engine.addRule({
        id: 'NULL_VALUES',
        name: 'Test Null Values',
        conditions: [
          { field: 'user.completedProcesses', operator: 'eq', value: [] }
        ],
        actions: [
          { type: 'SET_FIELD', target: 'user.isNewbie', value: true }
        ],
        priority: 50,
        isActive: true
      });

      const result = engine.executeRules(nullContext);
      expect((result.finalContext.user as any).isNewbie).toBe(true);
    });

    it('should handle very large rule sets', () => {
      // Add 100 rules to test performance
      for (let i = 0; i < 100; i++) {
        engine.addRule({
          id: `PERF_RULE_${i}`,
          name: `Performance Test Rule ${i}`,
          conditions: [
            { field: 'user.studyStreak', operator: 'gte', value: i % 10 }
          ],
          actions: [
            { type: 'LOG', target: `test_${i}`, value: `Rule ${i} executed` }
          ],
          priority: i,
          isActive: i % 2 === 0  // Only half are active
        });
      }

      const startTime = performance.now();
      const result = engine.executeRules(mockContext);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.executedRules).toBeLessThanOrEqual(50); // Only active rules
    });
  });

  /**
   * Rule Priority and Execution Order Testing
   */
  describe('Rule Priority and Order', () => {
    it('should execute rules in correct priority order', () => {
      const executionOrder: string[] = [];

      engine.addRule({
        id: 'LOW_PRIORITY',
        name: 'Low Priority Rule',
        conditions: [{ field: 'user.id', operator: 'eq', value: 'user123' }],
        actions: [{
          type: 'LOG',
          target: 'execution_order',
          value: 'LOW_PRIORITY',
          parameters: { callback: () => executionOrder.push('LOW_PRIORITY') }
        }],
        priority: 10,
        isActive: true
      });

      engine.addRule({
        id: 'HIGH_PRIORITY',
        name: 'High Priority Rule',
        conditions: [{ field: 'user.id', operator: 'eq', value: 'user123' }],
        actions: [{
          type: 'LOG',
          target: 'execution_order',
          value: 'HIGH_PRIORITY',
          parameters: { callback: () => executionOrder.push('HIGH_PRIORITY') }
        }],
        priority: 100,
        isActive: true
      });

      engine.addRule({
        id: 'MEDIUM_PRIORITY',
        name: 'Medium Priority Rule',
        conditions: [{ field: 'user.id', operator: 'eq', value: 'user123' }],
        actions: [{
          type: 'LOG',
          target: 'execution_order',
          value: 'MEDIUM_PRIORITY',
          parameters: { callback: () => executionOrder.push('MEDIUM_PRIORITY') }
        }],
        priority: 50,
        isActive: true
      });

      engine.executeRules(mockContext);

      // Manual verification since we can't actually intercept the log calls
      // In a real implementation, we'd use dependency injection for logging
      const history = engine.getExecutionHistory();
      const executedRuleIds = history.map(h => h.ruleId);
      
      expect(executedRuleIds.indexOf('HIGH_PRIORITY')).toBeLessThan(
        executedRuleIds.indexOf('MEDIUM_PRIORITY')
      );
      expect(executedRuleIds.indexOf('MEDIUM_PRIORITY')).toBeLessThan(
        executedRuleIds.indexOf('LOW_PRIORITY')
      );
    });
  });

  /**
   * Rule Modification and Context Mutation Testing
   */
  describe('Context Modification', () => {
    it('should apply modifications to context for subsequent rules', () => {
      engine.addRule({
        id: 'MODIFIER_RULE',
        name: 'Rule that modifies context',
        conditions: [{ field: 'user.id', operator: 'eq', value: 'user123' }],
        actions: [{ type: 'SET_FIELD', target: 'user.modified', value: true }],
        priority: 100,
        isActive: true
      });

      engine.addRule({
        id: 'DEPENDENT_RULE',
        name: 'Rule that depends on modification',
        conditions: [{ field: 'user.modified', operator: 'eq', value: true }],
        actions: [{ type: 'SET_FIELD', target: 'user.dependent', value: true }],
        priority: 50,
        isActive: true
      });

      const result = engine.executeRules(mockContext);
      
      expect((result.finalContext.user as any).modified).toBe(true);
      expect((result.finalContext.user as any).dependent).toBe(true);
      expect(result.successfulExecutions).toBe(2);
    });
  });
});