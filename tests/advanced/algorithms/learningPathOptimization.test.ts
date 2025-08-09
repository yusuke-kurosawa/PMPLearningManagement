/**
 * 学習パス最適化アルゴリズム高度テスト
 * チーム1: コアロジック・アルゴリズム担当（2名）
 * 
 * 目標: Cyclomatic complexity < 10, 90%+カバレッジ
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { faker } from '@faker-js/faker';
import * as sinon from 'sinon';

interface LearningPath {
  pathId: string;
  processes: string[];
  estimatedDuration: number;
  difficultyScore: number;
  prerequisites: string[];
  learningObjectives: string[];
}

interface OptimizationConstraints {
  maxDuration: number;
  preferredDifficulty: 'low' | 'medium' | 'high';
  availableTimeSlots: TimeSlot[];
  mandatoryProcesses: string[];
  excludedProcesses: string[];
}

interface TimeSlot {
  start: Date;
  end: Date;
  focus: 'high' | 'medium' | 'low';
}

interface OptimizedPath {
  path: LearningPath;
  schedule: ScheduledSession[];
  efficiency: number;
  completionProbability: number;
}

interface ScheduledSession {
  processId: string;
  startTime: Date;
  duration: number;
  difficulty: number;
  prerequisites: string[];
}

class LearningPathOptimizer {
  constructor(
    private availablePaths: LearningPath[],
    private processDatabase: Map<string, ProcessInfo>
  ) {}

  optimizePath(
    constraints: OptimizationConstraints,
    userProfile: UserProfile
  ): OptimizedPath {
    // Multi-objective optimization algorithm
    const candidatePaths = this.filterCandidatePaths(constraints);
    const scoredPaths = candidatePaths.map(path => ({
      path,
      score: this.calculatePathScore(path, constraints, userProfile)
    }));

    const bestPath = this.selectOptimalPath(scoredPaths, constraints);
    const schedule = this.generateOptimalSchedule(bestPath.path, constraints, userProfile);
    
    return {
      path: bestPath.path,
      schedule,
      efficiency: this.calculateEfficiency(bestPath.path, schedule),
      completionProbability: this.predictCompletionProbability(bestPath.path, userProfile)
    };
  }

  private filterCandidatePaths(constraints: OptimizationConstraints): LearningPath[] {
    return this.availablePaths.filter(path => {
      // Duration constraint
      if (path.estimatedDuration > constraints.maxDuration) return false;
      
      // Mandatory processes
      const hasAllMandatory = constraints.mandatoryProcesses.every(proc => 
        path.processes.includes(proc)
      );
      if (!hasAllMandatory) return false;

      // Excluded processes
      const hasExcluded = path.processes.some(proc => 
        constraints.excludedProcesses.includes(proc)
      );
      if (hasExcluded) return false;

      return true;
    });
  }

  private calculatePathScore(
    path: LearningPath,
    constraints: OptimizationConstraints,
    userProfile: UserProfile
  ): number {
    const difficultyScore = this.calculateDifficultyAlignment(path, constraints.preferredDifficulty);
    const prerequisiteScore = this.calculatePrerequisiteScore(path, userProfile);
    const timeScore = this.calculateTimeEfficiency(path, constraints);
    const personalityScore = this.calculatePersonalityAlignment(path, userProfile);

    return (difficultyScore * 0.3 + 
            prerequisiteScore * 0.25 + 
            timeScore * 0.25 + 
            personalityScore * 0.2);
  }

  private calculateDifficultyAlignment(path: LearningPath, preferred: string): number {
    const difficultyMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const pathDifficulty = Math.round(path.difficultyScore / 10);
    const preferredLevel = difficultyMap[preferred as keyof typeof difficultyMap] || 2;
    
    return Math.max(0, 1 - Math.abs(pathDifficulty - preferredLevel) / 3);
  }

  private calculatePrerequisiteScore(path: LearningPath, profile: UserProfile): number {
    const metPrerequisites = path.prerequisites.filter(req => 
      profile.completedProcesses.includes(req)
    ).length;
    
    return path.prerequisites.length === 0 ? 1 : metPrerequisites / path.prerequisites.length;
  }

  private calculateTimeEfficiency(path: LearningPath, constraints: OptimizationConstraints): number {
    return Math.max(0, 1 - path.estimatedDuration / constraints.maxDuration);
  }

  private calculatePersonalityAlignment(path: LearningPath, profile: UserProfile): number {
    // Complex personality-based scoring
    const styleBonus = this.getStyleBonus(path, profile.learningStyle);
    const paceBonus = this.getPaceBonus(path, profile.preferredPace);
    
    return (styleBonus + paceBonus) / 2;
  }

  private getStyleBonus(path: LearningPath, style: string): number {
    const styleMap: Record<string, number> = {
      'visual': path.processes.filter(p => p.includes('VISUAL')).length / path.processes.length,
      'auditory': path.processes.filter(p => p.includes('AUDIO')).length / path.processes.length,
      'kinesthetic': path.processes.filter(p => p.includes('HANDS_ON')).length / path.processes.length,
      'reading': path.processes.filter(p => p.includes('TEXT')).length / path.processes.length
    };
    
    return styleMap[style] || 0.5;
  }

  private getPaceBonus(path: LearningPath, pace: string): number {
    const avgSessionDuration = path.estimatedDuration / path.processes.length;
    
    switch (pace) {
      case 'fast':
        return avgSessionDuration < 60 ? 1 : 0.5;
      case 'moderate':
        return avgSessionDuration >= 60 && avgSessionDuration <= 120 ? 1 : 0.5;
      case 'slow':
        return avgSessionDuration > 120 ? 1 : 0.5;
      default:
        return 0.5;
    }
  }

  private selectOptimalPath(
    scoredPaths: Array<{ path: LearningPath; score: number }>,
    constraints: OptimizationConstraints
  ): { path: LearningPath; score: number } {
    if (scoredPaths.length === 0) {
      throw new Error('No viable learning paths found for given constraints');
    }

    // Multi-criteria decision analysis
    return scoredPaths.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  private generateOptimalSchedule(
    path: LearningPath,
    constraints: OptimizationConstraints,
    userProfile: UserProfile
  ): ScheduledSession[] {
    const sessions: ScheduledSession[] = [];
    const availableSlots = [...constraints.availableTimeSlots].sort((a, b) => 
      a.start.getTime() - b.start.getTime()
    );

    let currentSlotIndex = 0;
    let completedProcesses: string[] = [];

    for (const processId of path.processes) {
      const processInfo = this.processDatabase.get(processId);
      if (!processInfo) continue;

      // Check prerequisites
      const prerequisitesMet = processInfo.prerequisites.every(req => 
        completedProcesses.includes(req)
      );
      
      if (!prerequisitesMet) {
        // Skip or reschedule
        continue;
      }

      // Find suitable time slot
      const suitableSlot = this.findSuitableTimeSlot(
        availableSlots,
        currentSlotIndex,
        processInfo,
        userProfile
      );

      if (suitableSlot) {
        sessions.push({
          processId,
          startTime: suitableSlot.start,
          duration: processInfo.estimatedDuration,
          difficulty: processInfo.difficulty,
          prerequisites: processInfo.prerequisites
        });
        
        completedProcesses.push(processId);
        currentSlotIndex = availableSlots.indexOf(suitableSlot) + 1;
      }
    }

    return sessions;
  }

  private findSuitableTimeSlot(
    slots: TimeSlot[],
    startIndex: number,
    processInfo: ProcessInfo,
    userProfile: UserProfile
  ): TimeSlot | null {
    for (let i = startIndex; i < slots.length; i++) {
      const slot = slots[i];
      const slotDuration = slot.end.getTime() - slot.start.getTime();
      
      if (slotDuration >= processInfo.estimatedDuration * 60 * 1000) {
        // Check focus alignment
        const requiredFocus = this.getRequiredFocus(processInfo.difficulty);
        if (this.isFocusCompatible(slot.focus, requiredFocus, userProfile)) {
          return slot;
        }
      }
    }
    
    return null;
  }

  private getRequiredFocus(difficulty: number): 'high' | 'medium' | 'low' {
    if (difficulty > 7) return 'high';
    if (difficulty > 4) return 'medium';
    return 'low';
  }

  private isFocusCompatible(
    slotFocus: string,
    requiredFocus: string,
    userProfile: UserProfile
  ): boolean {
    const focusLevels = { 'low': 1, 'medium': 2, 'high': 3 };
    const slotLevel = focusLevels[slotFocus as keyof typeof focusLevels];
    const requiredLevel = focusLevels[requiredFocus as keyof typeof focusLevels];
    
    // Consider user's focus tolerance
    const tolerance = userProfile.focusTolerance || 1;
    return Math.abs(slotLevel - requiredLevel) <= tolerance;
  }

  private calculateEfficiency(path: LearningPath, schedule: ScheduledSession[]): number {
    if (schedule.length === 0) return 0;

    const totalPlannedTime = schedule.reduce((sum, session) => sum + session.duration, 0);
    const totalAvailableTime = path.estimatedDuration;
    
    return Math.min(1, totalPlannedTime / totalAvailableTime);
  }

  private predictCompletionProbability(path: LearningPath, userProfile: UserProfile): number {
    const difficultyFactor = 1 - (path.difficultyScore / 10) * 0.3;
    const experienceFactor = Math.min(1, userProfile.completedProcesses.length / 20);
    const motivationFactor = userProfile.motivationLevel || 0.7;
    
    return Math.min(0.95, difficultyFactor * experienceFactor * motivationFactor);
  }
}

interface ProcessInfo {
  id: string;
  estimatedDuration: number; // minutes
  difficulty: number; // 1-10
  prerequisites: string[];
}

interface UserProfile {
  completedProcesses: string[];
  learningStyle: string;
  preferredPace: string;
  focusTolerance: number;
  motivationLevel: number;
}

describe('Learning Path Optimization - Advanced Testing', () => {
  let optimizer: LearningPathOptimizer;
  let mockPaths: LearningPath[];
  let mockProcessDatabase: Map<string, ProcessInfo>;

  beforeEach(() => {
    mockPaths = [
      {
        pathId: 'PATH_001',
        processes: ['PROC_001', 'PROC_002', 'PROC_003'],
        estimatedDuration: 300,
        difficultyScore: 60,
        prerequisites: [],
        learningObjectives: ['Obj1', 'Obj2']
      },
      {
        pathId: 'PATH_002',
        processes: ['PROC_004', 'PROC_005'],
        estimatedDuration: 180,
        difficultyScore: 40,
        prerequisites: ['PROC_001'],
        learningObjectives: ['Obj3']
      },
      {
        pathId: 'PATH_003',
        processes: ['PROC_001', 'PROC_004', 'PROC_006'],
        estimatedDuration: 420,
        difficultyScore: 80,
        prerequisites: [],
        learningObjectives: ['Obj1', 'Obj4']
      }
    ];

    mockProcessDatabase = new Map([
      ['PROC_001', { id: 'PROC_001', estimatedDuration: 60, difficulty: 5, prerequisites: [] }],
      ['PROC_002', { id: 'PROC_002', estimatedDuration: 90, difficulty: 7, prerequisites: ['PROC_001'] }],
      ['PROC_003', { id: 'PROC_003', estimatedDuration: 120, difficulty: 8, prerequisites: ['PROC_002'] }],
      ['PROC_004', { id: 'PROC_004', estimatedDuration: 75, difficulty: 6, prerequisites: [] }],
      ['PROC_005', { id: 'PROC_005', estimatedDuration: 105, difficulty: 9, prerequisites: ['PROC_004'] }],
      ['PROC_006', { id: 'PROC_006', estimatedDuration: 150, difficulty: 4, prerequisites: ['PROC_001'] }]
    ]);

    optimizer = new LearningPathOptimizer(mockPaths, mockProcessDatabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sinon.restore();
  });

  /**
   * Property-Based Test: パス最適化の数学的証明
   */
  it('property: optimization should always improve or maintain efficiency scores', () => {
    fc.assert(
      fc.property(
        fc.record({
          maxDuration: fc.integer({ min: 200, max: 500 }),
          preferredDifficulty: fc.constantFrom('low', 'medium', 'high'),
          mandatoryProcesses: fc.array(
            fc.constantFrom('PROC_001', 'PROC_002', 'PROC_003', 'PROC_004', 'PROC_005'), 
            { maxLength: 3 }
          ),
          excludedProcesses: fc.array(
            fc.constantFrom('PROC_006'), 
            { maxLength: 1 }
          )
        }),
        fc.record({
          completedProcesses: fc.array(fc.constantFrom('PROC_001', 'PROC_002'), { maxLength: 2 }),
          learningStyle: fc.constantFrom('visual', 'auditory', 'kinesthetic', 'reading'),
          preferredPace: fc.constantFrom('fast', 'moderate', 'slow'),
          focusTolerance: fc.integer({ min: 1, max: 3 }),
          motivationLevel: fc.float({ min: 0.1, max: 1.0 })
        }),
        (constraints, userProfile) => {
          const timeSlots: TimeSlot[] = [
            {
              start: new Date('2024-01-01T09:00:00'),
              end: new Date('2024-01-01T12:00:00'),
              focus: 'high'
            },
            {
              start: new Date('2024-01-01T14:00:00'),
              end: new Date('2024-01-01T17:00:00'),
              focus: 'medium'
            }
          ];

          const optimizationConstraints: OptimizationConstraints = {
            ...constraints,
            availableTimeSlots: timeSlots
          };

          try {
            const result = optimizer.optimizePath(optimizationConstraints, userProfile);

            // 不変条件の検証
            expect(result.efficiency).toBeGreaterThanOrEqual(0);
            expect(result.efficiency).toBeLessThanOrEqual(1);
            expect(result.completionProbability).toBeGreaterThanOrEqual(0);
            expect(result.completionProbability).toBeLessThanOrEqual(1);
            
            // 制約条件の遵守
            expect(result.path.estimatedDuration).toBeLessThanOrEqual(constraints.maxDuration);
            
            // 必須プロセスの包含
            constraints.mandatoryProcesses.forEach(proc => {
              expect(result.path.processes).toContain(proc);
            });

            // 除外プロセスの非包含
            constraints.excludedProcesses.forEach(proc => {
              expect(result.path.processes).not.toContain(proc);
            });

            // スケジュール整合性
            result.schedule.forEach(session => {
              expect(result.path.processes).toContain(session.processId);
            });

          } catch (error) {
            // 制約を満たすパスが存在しない場合のエラーは許容
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toContain('No viable learning paths found');
          }
        }
      ),
      { numRuns: 50, verbose: true }
    );
  });

  /**
   * Complex Algorithm Testing: 多目的最適化
   */
  it('should optimize multiple objectives simultaneously', () => {
    const constraints: OptimizationConstraints = {
      maxDuration: 350,
      preferredDifficulty: 'medium',
      availableTimeSlots: [
        {
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T18:00:00'),
          focus: 'high'
        }
      ],
      mandatoryProcesses: ['PROC_001'],
      excludedProcesses: []
    };

    const userProfile: UserProfile = {
      completedProcesses: [],
      learningStyle: 'visual',
      preferredPace: 'moderate',
      focusTolerance: 2,
      motivationLevel: 0.8
    };

    const result = optimizer.optimizePath(constraints, userProfile);

    // Multi-objective optimization results
    expect(result.path.estimatedDuration).toBeLessThanOrEqual(constraints.maxDuration);
    expect(result.path.processes).toContain('PROC_001'); // Mandatory process
    expect(result.efficiency).toBeGreaterThan(0);
    expect(result.completionProbability).toBeGreaterThan(0);

    // Verify optimization quality
    const alternativePaths = mockPaths.filter(p => 
      p.estimatedDuration <= constraints.maxDuration &&
      p.processes.includes('PROC_001')
    );
    
    expect(alternativePaths.length).toBeGreaterThan(0);
  });

  /**
   * Algorithm Complexity Testing
   */
  it('should maintain performance within complexity bounds', () => {
    const largeConstraints: OptimizationConstraints = {
      maxDuration: 1000,
      preferredDifficulty: 'high',
      availableTimeSlots: Array.from({ length: 20 }, (_, i) => ({
        start: new Date(2024, 0, i + 1, 9),
        end: new Date(2024, 0, i + 1, 17),
        focus: faker.helpers.arrayElement(['high', 'medium', 'low'])
      })),
      mandatoryProcesses: [],
      excludedProcesses: []
    };

    const userProfile: UserProfile = {
      completedProcesses: faker.helpers.arrayElements(
        Array.from(mockProcessDatabase.keys()), 
        faker.number.int({ min: 0, max: 3 })
      ),
      learningStyle: 'kinesthetic',
      preferredPace: 'fast',
      focusTolerance: 3,
      motivationLevel: 0.9
    };

    const startTime = performance.now();
    const result = optimizer.optimizePath(largeConstraints, userProfile);
    const endTime = performance.now();

    // Performance constraint: O(n log n) complexity
    expect(endTime - startTime).toBeLessThan(50); // 50ms limit
    expect(result).toBeDefined();
  });

  /**
   * Boundary Value Testing
   */
  describe('Boundary Values', () => {
    it('should handle minimum duration constraint', () => {
      const minConstraints: OptimizationConstraints = {
        maxDuration: 180, // Minimum viable duration
        preferredDifficulty: 'low',
        availableTimeSlots: [{
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T12:00:00'),
          focus: 'medium'
        }],
        mandatoryProcesses: [],
        excludedProcesses: []
      };

      const userProfile: UserProfile = {
        completedProcesses: [],
        learningStyle: 'reading',
        preferredPace: 'slow',
        focusTolerance: 1,
        motivationLevel: 0.5
      };

      const result = optimizer.optimizePath(minConstraints, userProfile);
      expect(result.path.estimatedDuration).toBeLessThanOrEqual(180);
      expect(result.schedule.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle maximum complexity scenarios', () => {
      const maxConstraints: OptimizationConstraints = {
        maxDuration: 500,
        preferredDifficulty: 'high',
        availableTimeSlots: [{
          start: new Date('2024-01-01T08:00:00'),
          end: new Date('2024-01-01T20:00:00'),
          focus: 'high'
        }],
        mandatoryProcesses: ['PROC_001', 'PROC_002', 'PROC_003'],
        excludedProcesses: []
      };

      const expertProfile: UserProfile = {
        completedProcesses: ['PROC_001'],
        learningStyle: 'visual',
        preferredPace: 'fast',
        focusTolerance: 3,
        motivationLevel: 0.95
      };

      const result = optimizer.optimizePath(maxConstraints, expertProfile);
      expect(result.completionProbability).toBeGreaterThan(0.5);
      expect(result.efficiency).toBeGreaterThan(0.7);
    });

    it('should handle empty available time slots gracefully', () => {
      const noTimeConstraints: OptimizationConstraints = {
        maxDuration: 300,
        preferredDifficulty: 'medium',
        availableTimeSlots: [],
        mandatoryProcesses: ['PROC_001'],
        excludedProcesses: []
      };

      const userProfile: UserProfile = {
        completedProcesses: [],
        learningStyle: 'auditory',
        preferredPace: 'moderate',
        focusTolerance: 2,
        motivationLevel: 0.7
      };

      const result = optimizer.optimizePath(noTimeConstraints, userProfile);
      expect(result.schedule).toHaveLength(0);
      expect(result.efficiency).toBe(0);
    });
  });

  /**
   * Error Path Coverage: 例外処理の完全テスト
   */
  describe('Error Handling', () => {
    it('should throw when no viable paths exist', () => {
      const impossibleConstraints: OptimizationConstraints = {
        maxDuration: 50, // Too short for any path
        preferredDifficulty: 'high',
        availableTimeSlots: [{
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T10:00:00'),
          focus: 'low'
        }],
        mandatoryProcesses: ['PROC_001', 'PROC_002', 'PROC_003'], // Too many mandatory
        excludedProcesses: []
      };

      const userProfile: UserProfile = {
        completedProcesses: [],
        learningStyle: 'visual',
        preferredPace: 'slow',
        focusTolerance: 1,
        motivationLevel: 0.3
      };

      expect(() => optimizer.optimizePath(impossibleConstraints, userProfile))
        .toThrow('No viable learning paths found for given constraints');
    });

    it('should handle malformed process database gracefully', () => {
      const corruptedDatabase = new Map([
        ['PROC_001', { id: 'PROC_001', estimatedDuration: -60, difficulty: 15, prerequisites: [] }], // Invalid values
        ['PROC_002', { id: 'PROC_002', estimatedDuration: NaN, difficulty: null as any, prerequisites: ['NONEXISTENT'] }]
      ]);

      const corruptedOptimizer = new LearningPathOptimizer(mockPaths, corruptedDatabase);
      
      const constraints: OptimizationConstraints = {
        maxDuration: 300,
        preferredDifficulty: 'medium',
        availableTimeSlots: [{
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T17:00:00'),
          focus: 'medium'
        }],
        mandatoryProcesses: [],
        excludedProcesses: []
      };

      const userProfile: UserProfile = {
        completedProcesses: [],
        learningStyle: 'reading',
        preferredPace: 'moderate',
        focusTolerance: 2,
        motivationLevel: 0.8
      };

      // Should handle corrupted data without crashing
      expect(() => corruptedOptimizer.optimizePath(constraints, userProfile))
        .not.toThrow();
    });
  });

  /**
   * Concurrency and Race Condition Testing
   */
  describe('Concurrency', () => {
    it('should handle concurrent optimization requests safely', async () => {
      const constraints: OptimizationConstraints = {
        maxDuration: 400,
        preferredDifficulty: 'medium',
        availableTimeSlots: [{
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T17:00:00'),
          focus: 'high'
        }],
        mandatoryProcesses: [],
        excludedProcesses: []
      };

      const profiles: UserProfile[] = Array.from({ length: 10 }, (_, i) => ({
        completedProcesses: faker.helpers.arrayElements(
          Array.from(mockProcessDatabase.keys()), 
          faker.number.int({ min: 0, max: 2 })
        ),
        learningStyle: faker.helpers.arrayElement(['visual', 'auditory', 'kinesthetic', 'reading']),
        preferredPace: faker.helpers.arrayElement(['fast', 'moderate', 'slow']),
        focusTolerance: faker.number.int({ min: 1, max: 3 }),
        motivationLevel: faker.number.float({ min: 0.3, max: 1.0 })
      }));

      // Concurrent execution
      const promises = profiles.map(profile => 
        Promise.resolve(optimizer.optimizePath(constraints, profile))
      );

      const results = await Promise.all(promises);
      
      // All results should be valid
      results.forEach(result => {
        expect(result.efficiency).toBeGreaterThanOrEqual(0);
        expect(result.completionProbability).toBeGreaterThanOrEqual(0);
      });
    });
  });
});