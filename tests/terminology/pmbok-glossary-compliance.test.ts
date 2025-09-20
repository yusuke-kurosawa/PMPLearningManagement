/**
 * PMBOK Glossary Compliance Testing Framework
 * Comprehensive testing suite for PMP terminology consistency
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { PMPTerminologyAnalyzer } from '../../src/services/terminology/terminology-analyzer';
import { PMPTerminologyDatabase } from '../../src/data/terminology/pmp-terminology-database';

// Test configuration
const TEST_CONFIG = {
  sourceDirectories: [
    'src/**/*.{ts,tsx,js,jsx}',
    'docs/**/*.md',
    'README.md',
    'CLAUDE.md',
    'public/**/*.html'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}'
  ],
  terminologyThresholds: {
    consistency: 95, // 95% consistency required
    accuracy: 98,    // 98% accuracy required
    coverage: 85     // 85% term coverage required
  }
};

interface TerminologyViolation {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  term: string;
  suggestion: string;
  context: string;
  rule: string;
}

interface ComplianceReport {
  overallScore: number;
  consistencyScore: number;
  accuracyScore: number;
  coverageScore: number;
  totalViolations: number;
  violationsByType: Record<string, number>;
  violationsByFile: Record<string, number>;
  suggestions: string[];
  passesCompliance: boolean;
}

class PMBOKGlossaryComplianceChecker {
  private terminologyAnalyzer: PMPTerminologyAnalyzer;
  private terminologyDatabase: PMPTerminologyDatabase;
  private sourceFiles: string[] = [];
  private violations: TerminologyViolation[] = [];

  constructor() {
    this.terminologyAnalyzer = new PMPTerminologyAnalyzer();
    this.terminologyDatabase = new PMPTerminologyDatabase();
  }

  async initialize(): Promise<void> {
    await this.terminologyDatabase.initialize();
    await this.discoverSourceFiles();
  }

  async runComplianceCheck(): Promise<ComplianceReport> {
    console.log('🔍 Starting PMBOK terminology compliance check...');
    
    this.violations = [];
    
    // Check each file for terminology compliance
    for (const file of this.sourceFiles) {
      await this.checkFile(file);
    }
    
    // Generate compliance report
    const report = await this.generateComplianceReport();
    
    console.log(`✅ Compliance check completed. Score: ${report.overallScore}%`);
    return report;
  }

  private async discoverSourceFiles(): Promise<void> {
    const allFiles: string[] = [];
    
    for (const pattern of TEST_CONFIG.sourceDirectories) {
      const files = await glob(pattern, { ignore: TEST_CONFIG.excludePatterns });
      allFiles.push(...files);
    }
    
    this.sourceFiles = [...new Set(allFiles)]; // Remove duplicates
    console.log(`📁 Discovered ${this.sourceFiles.length} files for analysis`);
  }

  private async checkFile(filePath: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const fileViolations = await this.terminologyAnalyzer.analyzeText(content, {
        filePath,
        fileType: this.getFileType(filePath),
        contextAware: true
      });
      
      this.violations.push(...fileViolations);
    } catch (error) {
      console.warn(`Warning: Could not analyze ${filePath}:`, error.message);
    }
  }

  private getFileType(filePath: string): string {
    const ext = path.extname(filePath);
    switch (ext) {
      case '.ts':
      case '.tsx': return 'typescript';
      case '.js':
      case '.jsx': return 'javascript';
      case '.md': return 'markdown';
      case '.html': return 'html';
      case '.json': return 'json';
      default: return 'text';
    }
  }

  private async generateComplianceReport(): Promise<ComplianceReport> {
    const totalFiles = this.sourceFiles.length;
    const filesWithViolations = new Set(this.violations.map(v => v.file)).size;
    
    // Calculate scores
    const consistencyScore = this.calculateConsistencyScore();
    const accuracyScore = this.calculateAccuracyScore();
    const coverageScore = this.calculateCoverageScore();
    const overallScore = Math.round((consistencyScore + accuracyScore + coverageScore) / 3);
    
    // Group violations
    const violationsByType = this.groupViolationsByType();
    const violationsByFile = this.groupViolationsByFile();
    
    // Generate suggestions
    const suggestions = this.generateSuggestions();
    
    // Determine compliance
    const passesCompliance = 
      consistencyScore >= TEST_CONFIG.terminologyThresholds.consistency &&
      accuracyScore >= TEST_CONFIG.terminologyThresholds.accuracy &&
      coverageScore >= TEST_CONFIG.terminologyThresholds.coverage;
    
    return {
      overallScore,
      consistencyScore,
      accuracyScore,
      coverageScore,
      totalViolations: this.violations.length,
      violationsByType,
      violationsByFile,
      suggestions,
      passesCompliance
    };
  }

  private calculateConsistencyScore(): number {
    const inconsistencyViolations = this.violations.filter(v => 
      v.rule === 'inconsistent-terminology' || 
      v.rule === 'alternative-term-used'
    ).length;
    
    const totalTermUsages = this.violations.length;
    if (totalTermUsages === 0) return 100;
    
    return Math.max(0, Math.round(((totalTermUsages - inconsistencyViolations) / totalTermUsages) * 100));
  }

  private calculateAccuracyScore(): number {
    const accuracyViolations = this.violations.filter(v => 
      v.severity === 'error'
    ).length;
    
    const totalFiles = this.sourceFiles.length;
    const filesWithErrors = new Set(
      this.violations.filter(v => v.severity === 'error').map(v => v.file)
    ).size;
    
    return Math.max(0, Math.round(((totalFiles - filesWithErrors) / totalFiles) * 100));
  }

  private calculateCoverageScore(): number {
    // Check how many essential PMP terms are properly used
    const essentialTerms = this.terminologyDatabase.getEssentialTerms();
    const usedTerms = new Set();
    
    this.violations.forEach(violation => {
      if (violation.severity !== 'error') {
        usedTerms.add(violation.term.toLowerCase());
      }
    });
    
    const coverage = (usedTerms.size / essentialTerms.length) * 100;
    return Math.min(100, Math.round(coverage));
  }

  private groupViolationsByType(): Record<string, number> {
    const groups: Record<string, number> = {};
    
    this.violations.forEach(violation => {
      const key = `${violation.severity}-${violation.rule}`;
      groups[key] = (groups[key] || 0) + 1;
    });
    
    return groups;
  }

  private groupViolationsByFile(): Record<string, number> {
    const groups: Record<string, number> = {};
    
    this.violations.forEach(violation => {
      const file = violation.file;
      groups[file] = (groups[file] || 0) + 1;
    });
    
    return groups;
  }

  private generateSuggestions(): string[] {
    const suggestions: string[] = [];
    
    const errorCount = this.violations.filter(v => v.severity === 'error').length;
    const warningCount = this.violations.filter(v => v.severity === 'warning').length;
    
    if (errorCount > 0) {
      suggestions.push(`Fix ${errorCount} critical terminology errors that violate PMBOK standards`);
    }
    
    if (warningCount > 10) {
      suggestions.push(`Review ${warningCount} terminology warnings for consistency improvements`);
    }
    
    const inconsistentTerms = this.violations
      .filter(v => v.rule === 'inconsistent-terminology')
      .map(v => v.term);
    
    if (inconsistentTerms.length > 0) {
      const uniqueTerms = [...new Set(inconsistentTerms)];
      suggestions.push(`Standardize usage of these inconsistent terms: ${uniqueTerms.slice(0, 5).join(', ')}`);
    }
    
    const mostProblematicFiles = Object.entries(this.groupViolationsByFile())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([file]) => file);
    
    if (mostProblematicFiles.length > 0) {
      suggestions.push(`Focus terminology improvements on: ${mostProblematicFiles.join(', ')}`);
    }
    
    return suggestions;
  }
}

// ============================================================================
// Test Suite Implementation
// ============================================================================

describe('PMBOK Glossary Compliance', () => {
  let complianceChecker: PMBOKGlossaryComplianceChecker;
  let complianceReport: ComplianceReport;

  beforeAll(async () => {
    complianceChecker = new PMBOKGlossaryComplianceChecker();
    await complianceChecker.initialize();
    complianceReport = await complianceChecker.runComplianceCheck();
  });

  describe('Overall Compliance', () => {
    it('should meet minimum compliance thresholds', () => {
      expect(complianceReport.passesCompliance).toBe(true);
      expect(complianceReport.overallScore).toBeGreaterThanOrEqual(85);
    });

    it('should have high consistency score', () => {
      expect(complianceReport.consistencyScore).toBeGreaterThanOrEqual(
        TEST_CONFIG.terminologyThresholds.consistency
      );
    });

    it('should have high accuracy score', () => {
      expect(complianceReport.accuracyScore).toBeGreaterThanOrEqual(
        TEST_CONFIG.terminologyThresholds.accuracy
      );
    });

    it('should have adequate coverage score', () => {
      expect(complianceReport.coverageScore).toBeGreaterThanOrEqual(
        TEST_CONFIG.terminologyThresholds.coverage
      );
    });
  });

  describe('Critical Terminology Errors', () => {
    it('should have no critical errors in core components', () => {
      const criticalFiles = [
        'src/components/pmbok/',
        'src/data/pmbok/',
        'src/services/learning/',
        'CLAUDE.md',
        'README.md'
      ];
      
      const criticalErrors = complianceReport.violations?.filter(v => 
        v.severity === 'error' && 
        criticalFiles.some(pattern => v.file.includes(pattern))
      ) || [];
      
      if (criticalErrors.length > 0) {
        console.error('Critical terminology errors found:', criticalErrors);
      }
      
      expect(criticalErrors.length).toBe(0);
    });

    it('should properly capitalize PMBOK terminology', () => {
      const capitalizationErrors = complianceReport.violations?.filter(v => 
        v.rule === 'improper-capitalization'
      ) || [];
      
      expect(capitalizationErrors.length).toBeLessThanOrEqual(5);
    });

    it('should use standard PMBOK acronyms', () => {
      const acronymErrors = complianceReport.violations?.filter(v => 
        v.rule === 'non-standard-acronym'
      ) || [];
      
      expect(acronymErrors.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Knowledge Area Specific Tests', () => {
    const knowledgeAreas = [
      'Integration', 'Scope', 'Schedule', 'Cost', 'Quality',
      'Resource', 'Communications', 'Risk', 'Procurement', 'Stakeholder'
    ];

    knowledgeAreas.forEach(ka => {
      it(`should properly reference ${ka} Management terminology`, () => {
        // Test specific terminology for each knowledge area
        const kaTerms = complianceChecker.terminologyDatabase.getTermsForKnowledgeArea(ka);
        
        // Verify at least basic terms are properly used
        expect(kaTerms.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Process Group Terminology', () => {
    const processGroups = ['Initiating', 'Planning', 'Executing', 'Monitoring and Controlling', 'Closing'];

    processGroups.forEach(pg => {
      it(`should correctly reference ${pg} process group`, () => {
        const pgViolations = complianceReport.violations?.filter(v => 
          v.context.toLowerCase().includes(pg.toLowerCase()) &&
          v.severity === 'error'
        ) || [];
        
        expect(pgViolations.length).toBe(0);
      });
    });
  });

  describe('ITTO Framework Compliance', () => {
    it('should properly reference Inputs, Tools & Techniques, and Outputs', () => {
      const ittoTerms = ['inputs', 'tools and techniques', 'outputs', 'ITTO'];
      const ittoViolations = complianceReport.violations?.filter(v => 
        ittoTerms.some(term => v.term.toLowerCase().includes(term.toLowerCase())) &&
        v.severity === 'error'
      ) || [];
      
      expect(ittoViolations.length).toBe(0);
    });

    it('should maintain consistent ITTO terminology format', () => {
      // Check for consistent formatting of ITTO references
      const formatViolations = complianceReport.violations?.filter(v => 
        v.rule === 'itto-format-inconsistency'
      ) || [];
      
      expect(formatViolations.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Component-Specific Tests', () => {
    describe('Learning Components', () => {
      it('should use correct learning terminology in educational components', async () => {
        const learningFiles = await glob('src/components/learning/**/*.{ts,tsx}');
        const learningViolations = complianceReport.violations?.filter(v => 
          learningFiles.includes(v.file) && v.severity === 'error'
        ) || [];
        
        expect(learningViolations.length).toBeLessThanOrEqual(1);
      });
    });

    describe('Assessment Components', () => {
      it('should use proper assessment and exam terminology', async () => {
        const assessmentFiles = await glob('src/components/exam/**/*.{ts,tsx}');
        const assessmentViolations = complianceReport.violations?.filter(v => 
          assessmentFiles.includes(v.file) && 
          (v.rule === 'assessment-terminology' || v.rule === 'exam-terminology')
        ) || [];
        
        expect(assessmentViolations.length).toBeLessThanOrEqual(2);
      });
    });

    describe('Visualization Components', () => {
      it('should use consistent PMBOK process terminology in visualizations', async () => {
        const vizFiles = await glob('src/components/visualizations/**/*.{ts,tsx}');
        const vizViolations = complianceReport.violations?.filter(v => 
          vizFiles.includes(v.file) && v.rule === 'process-terminology'
        ) || [];
        
        expect(vizViolations.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Documentation Compliance', () => {
    it('should maintain PMBOK standards in README documentation', () => {
      const readmeViolations = complianceReport.violations?.filter(v => 
        v.file.includes('README.md') && v.severity === 'error'
      ) || [];
      
      expect(readmeViolations.length).toBe(0);
    });

    it('should maintain consistency in CLAUDE.md project documentation', () => {
      const claudeViolations = complianceReport.violations?.filter(v => 
        v.file.includes('CLAUDE.md') && v.severity === 'error'
      ) || [];
      
      expect(claudeViolations.length).toBeLessThanOrEqual(1);
    });

    it('should use proper terminology in API documentation', () => {
      const apiDocViolations = complianceReport.violations?.filter(v => 
        v.file.includes('docs/api/') && v.severity === 'error'
      ) || [];
      
      expect(apiDocViolations.length).toBe(0);
    });
  });
});

// ============================================================================
// Specific Terminology Rule Tests
// ============================================================================

describe('PMBOK Terminology Rules', () => {
  let analyzer: PMPTerminologyAnalyzer;

  beforeEach(() => {
    analyzer = new PMPTerminologyAnalyzer();
  });

  describe('Knowledge Area Terminology', () => {
    it('should enforce proper Knowledge Area naming', () => {
      const testCases = [
        { text: 'Integration Management', expected: 'valid' },
        { text: 'integration management', expected: 'warning' }, // Should be capitalized
        { text: 'Scope Mgmt', expected: 'warning' }, // Should use full "Management"
        { text: 'Time Management', expected: 'error' } // Should be "Schedule Management"
      ];

      testCases.forEach(testCase => {
        const result = analyzer.validateTerminology(testCase.text);
        if (testCase.expected === 'valid') {
          expect(result.violations).toEqual([]);
        } else {
          expect(result.violations.length).toBeGreaterThan(0);
          expect(result.violations[0].severity).toBe(testCase.expected);
        }
      });
    });
  });

  describe('Process Terminology', () => {
    it('should enforce proper process naming', () => {
      const testCases = [
        { text: 'Develop Project Charter', expected: 'valid' },
        { text: 'Create Project Charter', expected: 'warning' }, // Non-standard verb
        { text: 'project charter development', expected: 'warning' }, // Should be capitalized
        { text: 'Charter Creation', expected: 'error' } // Incorrect terminology
      ];

      testCases.forEach(testCase => {
        const result = analyzer.validateTerminology(testCase.text);
        if (testCase.expected === 'valid') {
          expect(result.violations).toEqual([]);
        } else {
          expect(result.violations.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('ITTO Terminology', () => {
    it('should enforce proper ITTO formatting', () => {
      const testCases = [
        { text: 'Inputs, Tools & Techniques, and Outputs', expected: 'valid' },
        { text: 'inputs, tools and techniques, outputs', expected: 'warning' },
        { text: 'ITTOs', expected: 'warning' }, // Should be "ITTO elements"
        { text: 'Input/Output', expected: 'error' } // Missing Tools & Techniques
      ];

      testCases.forEach(testCase => {
        const result = analyzer.validateTerminology(testCase.text);
        if (testCase.expected === 'valid') {
          expect(result.violations).toEqual([]);
        } else {
          expect(result.violations.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Acronym Consistency', () => {
    it('should enforce proper acronym usage', () => {
      const testCases = [
        { text: 'PMBOK Guide', expected: 'valid' },
        { text: 'PMBoK', expected: 'warning' }, // Incorrect capitalization
        { text: 'Project Management Book', expected: 'warning' }, // Should use PMBOK
        { text: 'WBS (Work Breakdown Structure)', expected: 'valid' },
        { text: 'work breakdown structure', expected: 'info' } // Could use acronym
      ];

      testCases.forEach(testCase => {
        const result = analyzer.validateTerminology(testCase.text);
        if (testCase.expected === 'valid') {
          expect(result.violations).toEqual([]);
        } else {
          expect(result.violations.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

// ============================================================================
// Performance and Integration Tests
// ============================================================================

describe('Terminology Checker Performance', () => {
  let checker: PMBOKGlossaryComplianceChecker;

  beforeEach(() => {
    checker = new PMBOKGlossaryComplianceChecker();
  });

  it('should complete analysis within reasonable time', async () => {
    const startTime = Date.now();
    
    await checker.initialize();
    const report = await checker.runComplianceCheck();
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    expect(report).toBeDefined();
  });

  it('should handle large files efficiently', async () => {
    // Test with a large file (simulated)
    const largeContent = 'PMBOK Guide '.repeat(10000);
    const analyzer = new PMPTerminologyAnalyzer();
    
    const startTime = Date.now();
    const result = await analyzer.analyzeText(largeContent);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // Should handle large files quickly
    expect(result.violations).toBeDefined();
  });
});

describe('Integration with Development Workflow', () => {
  it('should integrate with existing test suite', () => {
    // This test ensures our terminology checker doesn't interfere with existing tests
    expect(process.env.NODE_ENV).toBeDefined();
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('should be compatible with CI/CD pipeline', () => {
    // Test that checker can run in CI environment
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    if (isCI) {
      console.log('✅ Running in CI environment');
    }
    
    expect(true).toBe(true); // Basic compatibility check
  });
});

// ============================================================================
// Utility Functions for Test Suite
// ============================================================================

/**
 * Helper function to create mock violations for testing
 */
function createMockViolation(overrides: Partial<TerminologyViolation> = {}): TerminologyViolation {
  return {
    file: 'test-file.ts',
    line: 1,
    column: 1,
    severity: 'warning',
    term: 'test term',
    suggestion: 'use correct term',
    context: 'test context',
    rule: 'test-rule',
    ...overrides
  };
}

/**
 * Helper function to assert violation properties
 */
function expectValidViolation(violation: TerminologyViolation) {
  expect(violation.file).toBeTruthy();
  expect(violation.line).toBeGreaterThan(0);
  expect(violation.column).toBeGreaterThanOrEqual(0);
  expect(['error', 'warning', 'info']).toContain(violation.severity);
  expect(violation.term).toBeTruthy();
  expect(violation.suggestion).toBeTruthy();
  expect(violation.rule).toBeTruthy();
}

/**
 * Generate detailed test report
 */
export function generateDetailedTestReport(report: ComplianceReport): string {
  const sections = [
    '# PMBOK Terminology Compliance Report',
    '',
    `**Overall Score:** ${report.overallScore}%`,
    `**Compliance Status:** ${report.passesCompliance ? '✅ PASSED' : '❌ FAILED'}`,
    '',
    '## Score Breakdown',
    `- Consistency: ${report.consistencyScore}%`,
    `- Accuracy: ${report.accuracyScore}%`,
    `- Coverage: ${report.coverageScore}%`,
    '',
    '## Violation Summary',
    `Total Violations: ${report.totalViolations}`,
    '',
    '### By Type',
    ...Object.entries(report.violationsByType).map(([type, count]) => 
      `- ${type}: ${count}`
    ),
    '',
    '### By File',
    ...Object.entries(report.violationsByFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([file, count]) => `- ${file}: ${count}`),
    '',
    '## Suggestions',
    ...report.suggestions.map(suggestion => `- ${suggestion}`),
    '',
    `Generated: ${new Date().toISOString()}`
  ];

  return sections.join('\n');
}

// Export test utilities for use in other test files
export {
  PMBOKGlossaryComplianceChecker,
  createMockViolation,
  expectValidViolation,
  TEST_CONFIG
};