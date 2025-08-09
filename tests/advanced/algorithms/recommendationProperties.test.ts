/**
 * 高度推奨エンジンProperty-Based Testing
 * チーム1: コアロジック・アルゴリズム担当（2名）
 * 
 * 目標: 90%+カバレッジ、Mutation score 85%+
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';
import { when } from 'jest-when';
import * as sinon from 'sinon';

// 推奨エンジンサービス（仮実装）
interface UserLearningProfile {
  userId: string;
  completedProcesses: string[];
  timeSpentPerKnowledgeArea: Record<string, number>;
  performanceScores: Record<string, number>;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced';
  studyTimeAvailable: number; // minutes per day
  examDate?: Date;
}

interface LearningRecommendation {
  processIds: string[];
  studyOrder: string[];
  estimatedTime: number;
  confidence: number;
  reasoning: string[];
}

class RecommendationEngine {
  constructor(
    private knowledgeGraph: Map<string, string[]>,
    private processComplexity: Map<string, number>
  ) {}

  generateRecommendations(profile: UserLearningProfile): LearningRecommendation {
    // 複雑なアルゴリズムロジック
    const incompleteProcesses = this.getIncompleteProcesses(profile);
    const prioritizedProcesses = this.prioritizeByPerformance(incompleteProcesses, profile);
    const optimizedOrder = this.optimizeStudyOrder(prioritizedProcesses, profile);
    
    return {
      processIds: prioritizedProcesses,
      studyOrder: optimizedOrder,
      estimatedTime: this.calculateEstimatedTime(optimizedOrder, profile),
      confidence: this.calculateConfidence(profile),
      reasoning: this.generateReasoning(optimizedOrder, profile)
    };
  }

  private getIncompleteProcesses(profile: UserLearningProfile): string[] {
    const allProcesses = Array.from(this.processComplexity.keys());
    return allProcesses.filter(id => !profile.completedProcesses.includes(id));
  }

  private prioritizeByPerformance(processes: string[], profile: UserLearningProfile): string[] {
    return processes.sort((a, b) => {
      const scoreA = profile.performanceScores[a] || 0;
      const scoreB = profile.performanceScores[b] || 0;
      return scoreA - scoreB; // 低スコアを優先
    });
  }

  private optimizeStudyOrder(processes: string[], profile: UserLearningProfile): string[] {
    // 複雑な最適化アルゴリズム
    const dependencies = this.buildDependencyGraph(processes);
    return this.topologicalSort(dependencies, profile);
  }

  private buildDependencyGraph(processes: string[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    processes.forEach(process => {
      graph.set(process, this.knowledgeGraph.get(process) || []);
    });
    return graph;
  }

  private topologicalSort(graph: Map<string, string[]>, profile: UserLearningProfile): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const visiting = new Set<string>();

    const visit = (node: string): void => {
      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected: ${node}`);
      }
      if (visited.has(node)) return;

      visiting.add(node);
      const dependencies = graph.get(node) || [];
      dependencies.forEach(dep => visit(dep));
      visiting.delete(node);
      visited.add(node);
      result.push(node);
    };

    Array.from(graph.keys()).forEach(node => visit(node));
    return result;
  }

  private calculateEstimatedTime(processes: string[], profile: UserLearningProfile): number {
    const totalComplexity = processes.reduce((sum, id) => {
      return sum + (this.processComplexity.get(id) || 1);
    }, 0);
    
    // 学習スタイルによる時間調整
    const styleMultiplier = this.getStyleMultiplier(profile.learningStyle);
    return Math.round(totalComplexity * styleMultiplier * 60); // minutes
  }

  private getStyleMultiplier(style: UserLearningProfile['learningStyle']): number {
    const multipliers = {
      visual: 0.8,
      auditory: 1.0,
      kinesthetic: 1.2,
      reading: 0.9
    };
    return multipliers[style];
  }

  private calculateConfidence(profile: UserLearningProfile): number {
    const completionRate = profile.completedProcesses.length / 49; // 49 PMBOK processes
    const avgScore = Object.values(profile.performanceScores).reduce((a, b) => a + b, 0) / 
                     Object.keys(profile.performanceScores).length;
    
    return Math.min(0.95, (completionRate * 0.6 + (avgScore / 100) * 0.4));
  }

  private generateReasoning(processes: string[], profile: UserLearningProfile): string[] {
    return [
      `Based on ${profile.completedProcesses.length} completed processes`,
      `Optimized for ${profile.learningStyle} learning style`,
      `Targeted ${profile.difficultyPreference} difficulty level`,
      `Estimated ${Math.round(profile.studyTimeAvailable / 60)} hours available daily`
    ];
  }
}

describe('Recommendation Engine - Property-Based Testing', () => {
  let engine: RecommendationEngine;
  let mockKnowledgeGraph: Map<string, string[]>;
  let mockProcessComplexity: Map<string, number>;

  beforeEach(() => {
    // モックデータセットアップ
    mockKnowledgeGraph = new Map([
      ['PROC_001', ['PROC_002', 'PROC_003']],
      ['PROC_002', []],
      ['PROC_003', ['PROC_002']],
      ['PROC_004', ['PROC_001']],
      ['PROC_005', ['PROC_003', 'PROC_004']]
    ]);

    mockProcessComplexity = new Map([
      ['PROC_001', 3],
      ['PROC_002', 1],
      ['PROC_003', 2],
      ['PROC_004', 4],
      ['PROC_005', 5]
    ]);

    engine = new RecommendationEngine(mockKnowledgeGraph, mockProcessComplexity);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sinon.restore();
  });

  /**
   * Property 1: 推奨は常に有効な学習プロファイルに基づく
   */
  it('property: should always return valid recommendations for any valid learning profile', () => {
    fc.assert(
      fc.property(
        // Property-based test用のジェネレータ
        fc.record({
          userId: fc.string({ minLength: 1, maxLength: 36 }),
          completedProcesses: fc.array(fc.constantFrom('PROC_001', 'PROC_002', 'PROC_003', 'PROC_004', 'PROC_005'), { maxLength: 5 }),
          timeSpentPerKnowledgeArea: fc.record({
            'Integration': fc.integer({ min: 0, max: 1000 }),
            'Scope': fc.integer({ min: 0, max: 1000 }),
            'Schedule': fc.integer({ min: 0, max: 1000 })
          }),
          performanceScores: fc.record({
            'PROC_001': fc.integer({ min: 0, max: 100 }),
            'PROC_002': fc.integer({ min: 0, max: 100 }),
            'PROC_003': fc.integer({ min: 0, max: 100 }),
            'PROC_004': fc.integer({ min: 0, max: 100 }),
            'PROC_005': fc.integer({ min: 0, max: 100 })
          }),
          learningStyle: fc.constantFrom('visual', 'auditory', 'kinesthetic', 'reading'),
          difficultyPreference: fc.constantFrom('beginner', 'intermediate', 'advanced'),
          studyTimeAvailable: fc.integer({ min: 15, max: 480 })
        }),
        (profile: UserLearningProfile) => {
          const recommendation = engine.generateRecommendations(profile);

          // 不変条件の検証
          expect(recommendation).toBeDefined();
          expect(recommendation.processIds).toBeInstanceOf(Array);
          expect(recommendation.studyOrder).toBeInstanceOf(Array);
          expect(recommendation.estimatedTime).toBeGreaterThanOrEqual(0);
          expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
          expect(recommendation.confidence).toBeLessThanOrEqual(1);
          expect(recommendation.reasoning).toBeInstanceOf(Array);
          expect(recommendation.reasoning.length).toBeGreaterThan(0);

          // 推奨プロセスは未完了プロセスのサブセットである
          const incompleteProcesses = Array.from(mockProcessComplexity.keys())
            .filter(id => !profile.completedProcesses.includes(id));
          recommendation.processIds.forEach(processId => {
            expect(incompleteProcesses).toContain(processId);
          });

          // 学習順序は推奨プロセスと同じ要素を含む
          expect(recommendation.studyOrder.sort()).toEqual(recommendation.processIds.sort());
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });

  /**
   * Property 2: 依存関係は常に正しい順序で解決される
   */
  it('property: should always respect dependency order in study recommendations', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.string({ minLength: 1 }),
          completedProcesses: fc.array(fc.constantFrom('PROC_001', 'PROC_002'), { maxLength: 2 }),
          timeSpentPerKnowledgeArea: fc.record({ 'Integration': fc.integer({ min: 0, max: 1000 }) }),
          performanceScores: fc.record({
            'PROC_003': fc.integer({ min: 0, max: 100 }),
            'PROC_004': fc.integer({ min: 0, max: 100 }),
            'PROC_005': fc.integer({ min: 0, max: 100 })
          }),
          learningStyle: fc.constantFrom('visual', 'auditory', 'kinesthetic', 'reading'),
          difficultyPreference: fc.constantFrom('beginner', 'intermediate', 'advanced'),
          studyTimeAvailable: fc.integer({ min: 30, max: 240 })
        }),
        (profile: UserLearningProfile) => {
          const recommendation = engine.generateRecommendations(profile);

          // 依存関係の検証
          const studyOrder = recommendation.studyOrder;
          
          studyOrder.forEach((processId, index) => {
            const dependencies = mockKnowledgeGraph.get(processId) || [];
            dependencies.forEach(dep => {
              if (studyOrder.includes(dep)) {
                const depIndex = studyOrder.indexOf(dep);
                expect(depIndex).toBeLessThan(index);
              }
            });
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: 推定時間は学習スタイルに基づいて調整される
   */
  it('property: should adjust estimated time based on learning style consistently', () => {
    const baseProfile: UserLearningProfile = {
      userId: 'test-user',
      completedProcesses: [],
      timeSpentPerKnowledgeArea: { 'Integration': 100 },
      performanceScores: { 'PROC_001': 50, 'PROC_002': 60 },
      difficultyPreference: 'intermediate',
      studyTimeAvailable: 120
    };

    fc.assert(
      fc.property(
        fc.constantFrom('visual', 'auditory', 'kinesthetic', 'reading'),
        (learningStyle: UserLearningProfile['learningStyle']) => {
          const profile = { ...baseProfile, learningStyle };
          const recommendation = engine.generateRecommendations(profile);

          // 学習スタイル別の時間調整の検証
          const expectedMultipliers = {
            visual: 0.8,
            auditory: 1.0,
            kinesthetic: 1.2,
            reading: 0.9
          };

          const otherStyles = Object.keys(expectedMultipliers).filter(s => s !== learningStyle) as Array<UserLearningProfile['learningStyle']>;
          otherStyles.forEach(otherStyle => {
            const otherProfile = { ...baseProfile, learningStyle: otherStyle };
            const otherRecommendation = engine.generateRecommendations(otherProfile);

            const multiplierRatio = expectedMultipliers[learningStyle] / expectedMultipliers[otherStyle];
            const timeRatio = recommendation.estimatedTime / otherRecommendation.estimatedTime;

            // 誤差範囲内での比較（浮動小数点精度考慮）
            expect(Math.abs(timeRatio - multiplierRatio)).toBeLessThan(0.1);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4: 信頼度は完了率とパフォーマンススコアに基づく
   */
  it('property: should calculate confidence based on completion rate and performance scores', () => {
    fc.assert(
      fc.property(
        fc.record({
          completionRate: fc.float({ min: 0, max: 1 }),
          avgPerformanceScore: fc.integer({ min: 0, max: 100 })
        }),
        ({ completionRate, avgPerformanceScore }) => {
          const totalProcesses = 5;
          const completedCount = Math.floor(totalProcesses * completionRate);
          const completedProcesses = Array.from({ length: completedCount }, (_, i) => `PROC_00${i + 1}`);

          const performanceScores: Record<string, number> = {};
          for (let i = 1; i <= totalProcesses; i++) {
            performanceScores[`PROC_00${i}`] = avgPerformanceScore;
          }

          const profile: UserLearningProfile = {
            userId: 'test-user',
            completedProcesses,
            timeSpentPerKnowledgeArea: { 'Integration': 100 },
            performanceScores,
            learningStyle: 'visual',
            difficultyPreference: 'intermediate',
            studyTimeAvailable: 120
          };

          const recommendation = engine.generateRecommendations(profile);
          const expectedConfidence = Math.min(0.95, (completionRate * 0.6 + (avgPerformanceScore / 100) * 0.4));

          expect(Math.abs(recommendation.confidence - expectedConfidence)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge Case Testing: 境界値とエッジケース
   */
  describe('Edge Cases', () => {
    it('should handle empty completed processes', () => {
      const profile: UserLearningProfile = {
        userId: 'test-user',
        completedProcesses: [],
        timeSpentPerKnowledgeArea: {},
        performanceScores: {},
        learningStyle: 'visual',
        difficultyPreference: 'beginner',
        studyTimeAvailable: 60
      };

      const recommendation = engine.generateRecommendations(profile);
      expect(recommendation.processIds.length).toBeGreaterThan(0);
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle all processes completed', () => {
      const allProcesses = Array.from(mockProcessComplexity.keys());
      const profile: UserLearningProfile = {
        userId: 'test-user',
        completedProcesses: allProcesses,
        timeSpentPerKnowledgeArea: { 'Integration': 1000 },
        performanceScores: Object.fromEntries(allProcesses.map(id => [id, 90])),
        learningStyle: 'reading',
        difficultyPreference: 'advanced',
        studyTimeAvailable: 240
      };

      const recommendation = engine.generateRecommendations(profile);
      expect(recommendation.processIds).toHaveLength(0);
      expect(recommendation.studyOrder).toHaveLength(0);
      expect(recommendation.confidence).toBeCloseTo(0.95, 2);
    });

    it('should handle circular dependency gracefully', () => {
      // 循環依存を持つナレッジグラフをテスト
      const circularGraph = new Map([
        ['PROC_A', ['PROC_B']],
        ['PROC_B', ['PROC_C']],
        ['PROC_C', ['PROC_A']]
      ]);

      const complexityMap = new Map([
        ['PROC_A', 1],
        ['PROC_B', 2],
        ['PROC_C', 3]
      ]);

      const circularEngine = new RecommendationEngine(circularGraph, complexityMap);
      
      const profile: UserLearningProfile = {
        userId: 'test-user',
        completedProcesses: [],
        timeSpentPerKnowledgeArea: {},
        performanceScores: { 'PROC_A': 50, 'PROC_B': 60, 'PROC_C': 70 },
        learningStyle: 'auditory',
        difficultyPreference: 'intermediate',
        studyTimeAvailable: 120
      };

      expect(() => circularEngine.generateRecommendations(profile))
        .toThrow('Circular dependency detected');
    });
  });

  /**
   * Performance Testing: アルゴリズムのパフォーマンステスト
   */
  describe('Performance', () => {
    it('should complete recommendation generation within acceptable time limits', async () => {
      const largeProfile: UserLearningProfile = {
        userId: 'perf-test-user',
        completedProcesses: faker.helpers.arrayElements(
          Array.from(mockProcessComplexity.keys()), 
          faker.number.int({ min: 0, max: 3 })
        ),
        timeSpentPerKnowledgeArea: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [`KA_${i}`, faker.number.int({ min: 0, max: 1000 })])
        ),
        performanceScores: Object.fromEntries(
          Array.from(mockProcessComplexity.keys()).map(id => [id, faker.number.int({ min: 0, max: 100 })])
        ),
        learningStyle: faker.helpers.arrayElement(['visual', 'auditory', 'kinesthetic', 'reading']),
        difficultyPreference: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
        studyTimeAvailable: faker.number.int({ min: 30, max: 480 })
      };

      const startTime = performance.now();
      const recommendation = engine.generateRecommendations(largeProfile);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // 100ms以下
      expect(recommendation).toBeDefined();
    });
  });

  /**
   * Mutation Testing Support: 異常値に対する堅牢性テスト
   */
  describe('Mutation Resistance', () => {
    it('should handle invalid performance scores', () => {
      const profile: UserLearningProfile = {
        userId: 'mutation-test',
        completedProcesses: ['PROC_001'],
        timeSpentPerKnowledgeArea: { 'Integration': 100 },
        performanceScores: {
          'PROC_002': -50,  // 負の値
          'PROC_003': 150,  // 範囲外
          'PROC_004': NaN,  // NaN
          'PROC_005': Infinity // 無限大
        },
        learningStyle: 'visual',
        difficultyPreference: 'intermediate',
        studyTimeAvailable: 120
      };

      expect(() => engine.generateRecommendations(profile)).not.toThrow();
      const recommendation = engine.generateRecommendations(profile);
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle extreme study time values', () => {
      const profile: UserLearningProfile = {
        userId: 'extreme-test',
        completedProcesses: [],
        timeSpentPerKnowledgeArea: {},
        performanceScores: { 'PROC_001': 75 },
        learningStyle: 'kinesthetic',
        difficultyPreference: 'advanced',
        studyTimeAvailable: 0 // ゼロ時間
      };

      const recommendation = engine.generateRecommendations(profile);
      expect(recommendation.estimatedTime).toBeGreaterThanOrEqual(0);
      
      // 極端に大きな値でのテスト
      profile.studyTimeAvailable = Number.MAX_SAFE_INTEGER;
      const extremeRecommendation = engine.generateRecommendations(profile);
      expect(extremeRecommendation.estimatedTime).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
  });
});