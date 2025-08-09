#!/usr/bin/env node

/**
 * Claude Code AI - Issue Batch Processing Tool
 * 
 * This script provides batch processing capabilities for GitHub Issues
 * with AI-powered analysis and automation features.
 * 
 * Features:
 * - Batch issue analysis and classification
 * - Priority-based sorting and assignment
 * - Epic breakdown and task management
 * - Automated labeling and categorization
 * - Relationship detection and linking
 * 
 * Usage:
 *   node scripts/claude-batch-process.js --action=classify --state=open
 *   node scripts/claude-batch-process.js --action=priority-review --days=7
 *   node scripts/claude-batch-process.js --action=epic-breakdown --issue=123
 * 
 * @author Claude Code AI Assistant
 * @version 1.0.0
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Configuration
const CONFIG = {
  owner: process.env.GITHUB_REPOSITORY_OWNER || 'yusuke-kurosawa',
  repo: process.env.GITHUB_REPOSITORY_NAME || 'PMPLearningManagement',
  token: process.env.GITHUB_TOKEN,
  maxConcurrent: 5,
  delayBetweenRequests: 1000,
  dryRun: false
};

// Issue classification rules
const CLASSIFICATION_RULES = {
  bug: {
    keywords: ['bug', 'error', 'fix', 'broken', 'crash', 'issue', 'problem'],
    priority: 'high',
    labels: ['bug', 'needs-triage']
  },
  feature: {
    keywords: ['feature', 'enhancement', 'add', 'implement', 'new'],
    priority: 'medium',
    labels: ['enhancement', 'needs-analysis']
  },
  security: {
    keywords: ['security', 'vulnerability', 'exploit', 'xss', 'csrf', 'auth'],
    priority: 'critical',
    labels: ['security', 'critical']
  },
  performance: {
    keywords: ['performance', 'slow', 'optimization', 'speed', 'memory'],
    priority: 'high',
    labels: ['performance', 'optimization']
  },
  documentation: {
    keywords: ['documentation', 'docs', 'readme', 'guide'],
    priority: 'low',
    labels: ['documentation']
  },
  epic: {
    keywords: ['epic', 'large', 'project', 'initiative'],
    priority: 'high',
    labels: ['epic', 'needs-breakdown', 'planning']
  }
};

// Component mapping
const COMPONENT_MAPPING = {
  'mobile': ['mobile', 'responsive', 'touch', 'ios', 'android'],
  'pwa': ['pwa', 'offline', 'service worker', 'push notification'],
  'visualization': ['d3', 'chart', 'graph', 'diagram', 'visual'],
  'authentication': ['auth', 'login', 'user', 'session'],
  'database': ['database', 'postgres', 'redis', 'migration'],
  'testing': ['test', 'spec', 'coverage', 'e2e'],
  'performance': ['performance', 'optimization', 'speed', 'memory']
};

class ClaudeBatchProcessor {
  constructor(options = {}) {
    this.config = { ...CONFIG, ...options };
    this.octokit = new Octokit({
      auth: this.config.token
    });
    this.processed = 0;
    this.errors = [];
    this.report = {
      startTime: new Date(),
      processed: [],
      errors: [],
      summary: {}
    };
  }

  async run(action, options = {}) {
    console.log(`🤖 Claude Batch Processor Starting...`);
    console.log(`Action: ${action}`);
    console.log(`Options:`, options);
    console.log(`Dry Run: ${this.config.dryRun ? 'Yes' : 'No'}`);
    console.log('');

    try {
      switch (action) {
        case 'classify':
          await this.classifyIssues(options);
          break;
        case 'priority-review':
          await this.reviewPriorities(options);
          break;
        case 'epic-breakdown':
          await this.breakdownEpic(options);
          break;
        case 'relationship-analysis':
          await this.analyzeRelationships(options);
          break;
        case 'stale-cleanup':
          await this.cleanupStaleIssues(options);
          break;
        case 'metrics-collection':
          await this.collectMetrics(options);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      await this.generateReport();
      console.log('🎉 Batch processing completed successfully!');
    } catch (error) {
      console.error('❌ Batch processing failed:', error.message);
      throw error;
    }
  }

  async classifyIssues(options) {
    console.log('📋 Starting issue classification...');
    
    const issues = await this.getIssues({
      state: options.state || 'open',
      labels: options.labels ? options.labels.split(',') : undefined
    });

    console.log(`Found ${issues.length} issues to classify`);

    for (const issue of issues) {
      await this.delay(this.config.delayBetweenRequests);
      await this.classifyIssue(issue);
    }

    this.report.summary.classified = this.processed;
  }

  async classifyIssue(issue) {
    try {
      const analysis = this.analyzeIssueContent(issue);
      
      if (!this.config.dryRun) {
        // Apply labels
        if (analysis.recommendedLabels.length > 0) {
          await this.octokit.issues.addLabels({
            owner: this.config.owner,
            repo: this.config.repo,
            issue_number: issue.number,
            labels: analysis.recommendedLabels
          });
        }

        // Add classification comment
        const comment = this.generateClassificationComment(analysis);
        await this.octokit.issues.createComment({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: issue.number,
          body: comment
        });
      }

      this.report.processed.push({
        number: issue.number,
        title: issue.title,
        action: 'classify',
        analysis,
        timestamp: new Date()
      });

      this.processed++;
      console.log(`✅ Classified issue #${issue.number}: ${analysis.type} (${analysis.priority})`);
    } catch (error) {
      console.error(`❌ Failed to classify issue #${issue.number}:`, error.message);
      this.errors.push({ issue: issue.number, error: error.message });
    }
  }

  analyzeIssueContent(issue) {
    const title = issue.title.toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const content = `${title} ${body}`;

    let analysis = {
      type: 'general',
      priority: 'medium',
      complexity: 'medium',
      recommendedLabels: [],
      relatedComponents: [],
      confidence: 0
    };

    // Classify by type
    for (const [type, rules] of Object.entries(CLASSIFICATION_RULES)) {
      const matches = rules.keywords.filter(keyword => 
        content.includes(keyword)
      ).length;
      
      if (matches > 0) {
        const confidence = matches / rules.keywords.length;
        if (confidence > analysis.confidence) {
          analysis.type = type;
          analysis.priority = rules.priority;
          analysis.recommendedLabels = [...rules.labels];
          analysis.confidence = confidence;
        }
      }
    }

    // Detect related components
    for (const [component, keywords] of Object.entries(COMPONENT_MAPPING)) {
      const matches = keywords.filter(keyword => content.includes(keyword));
      if (matches.length > 0) {
        analysis.relatedComponents.push(component);
        analysis.recommendedLabels.push(component);
      }
    }

    // Determine complexity
    const complexityIndicators = [
      content.includes('architecture'),
      content.includes('refactor'),
      content.includes('migration'),
      content.includes('breaking'),
      body.length > 1000,
      analysis.relatedComponents.length > 2
    ].filter(Boolean).length;

    if (complexityIndicators >= 3) {
      analysis.complexity = 'high';
    } else if (complexityIndicators >= 1) {
      analysis.complexity = 'medium';
    } else {
      analysis.complexity = 'low';
    }

    // Add priority label
    analysis.recommendedLabels.push(`priority:${analysis.priority}`);
    
    // Remove duplicates
    analysis.recommendedLabels = [...new Set(analysis.recommendedLabels)];

    return analysis;
  }

  generateClassificationComment(analysis) {
    return `🤖 **Automated Classification Complete**

**Analysis Results**:
- **Type**: ${analysis.type.toUpperCase()}
- **Priority**: ${analysis.priority.toUpperCase()}  
- **Complexity**: ${analysis.complexity.toUpperCase()}
- **Confidence**: ${Math.round(analysis.confidence * 100)}%

**Applied Labels**: ${analysis.recommendedLabels.join(', ')}
${analysis.relatedComponents.length > 0 ? `**Related Components**: ${analysis.relatedComponents.join(', ')}` : ''}

**Next Steps**:
${analysis.type === 'epic' ? '- Use `@claude breakdown` to decompose into smaller tasks' : ''}
${analysis.type === 'security' ? '- Immediate security review required' : ''}
${analysis.priority === 'critical' ? '- Escalate for immediate attention' : ''}
${analysis.complexity === 'high' ? '- Consider breaking into smaller issues' : ''}
- Use \`@claude implement\` for detailed implementation guidance

*Automated classification by Claude AI Assistant*`;
  }

  async reviewPriorities(options) {
    console.log('🔍 Starting priority review...');
    
    const days = options.days || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const issues = await this.getIssues({
      state: 'open',
      sort: 'updated',
      direction: 'asc'
    });

    const staleIssues = issues.filter(issue => 
      new Date(issue.updated_at) < cutoffDate
    );

    console.log(`Found ${staleIssues.length} issues requiring priority review`);

    for (const issue of staleIssues) {
      await this.delay(this.config.delayBetweenRequests);
      await this.reviewIssuePriority(issue, days);
    }

    this.report.summary.priorityReviewed = this.processed;
  }

  async reviewIssuePriority(issue, staleDays) {
    try {
      const analysis = this.analyzeIssueContent(issue);
      const ageInDays = Math.floor((new Date() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24));
      
      let recommendation = 'maintain';
      let reason = '';

      // Priority review logic
      if (analysis.type === 'security' && ageInDays > 3) {
        recommendation = 'escalate';
        reason = 'Security issue overdue';
      } else if (analysis.type === 'bug' && ageInDays > 14) {
        recommendation = 'escalate';
        reason = 'Bug fix overdue';
      } else if (ageInDays > 30 && !issue.assignee) {
        recommendation = 'stale';
        reason = 'No activity or assignment for 30+ days';
      }

      if (!this.config.dryRun && recommendation !== 'maintain') {
        const comment = `🔍 **Priority Review Alert**

**Issue Age**: ${ageInDays} days
**Last Updated**: ${staleDays} days ago
**Current Priority**: ${analysis.priority}
**Recommendation**: ${recommendation.toUpperCase()}

**Reason**: ${reason}

**Suggested Actions**:
${recommendation === 'escalate' ? '- Immediate attention required\n- Assign to appropriate team member\n- Set clear timeline for resolution' : ''}
${recommendation === 'stale' ? '- Consider closing if no longer relevant\n- Update with current status\n- Add "stale" label for tracking' : ''}

Use \`@claude analyze\` for detailed impact assessment.

*Priority review by Claude AI Assistant*`;

        await this.octokit.issues.createComment({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: issue.number,
          body: comment
        });

        if (recommendation === 'stale') {
          await this.octokit.issues.addLabels({
            owner: this.config.owner,
            repo: this.config.repo,
            issue_number: issue.number,
            labels: ['stale']
          });
        }
      }

      this.report.processed.push({
        number: issue.number,
        title: issue.title,
        action: 'priority-review',
        recommendation,
        reason,
        ageInDays,
        timestamp: new Date()
      });

      this.processed++;
      console.log(`✅ Reviewed priority for issue #${issue.number}: ${recommendation}`);
    } catch (error) {
      console.error(`❌ Failed to review issue #${issue.number}:`, error.message);
      this.errors.push({ issue: issue.number, error: error.message });
    }
  }

  async breakdownEpic(options) {
    console.log('📚 Starting epic breakdown...');
    
    if (!options.issue) {
      throw new Error('Issue number is required for epic breakdown');
    }

    const issue = await this.getIssue(options.issue);
    
    if (!issue.labels.some(label => label.name === 'epic')) {
      throw new Error(`Issue #${options.issue} is not labeled as an epic`);
    }

    await this.processEpicBreakdown(issue);
    this.report.summary.epicsProcessed = 1;
  }

  async processEpicBreakdown(epic) {
    try {
      const breakdown = this.analyzeEpicBreakdown(epic);
      
      if (!this.config.dryRun) {
        const comment = this.generateEpicBreakdownComment(breakdown);
        await this.octokit.issues.createComment({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: epic.number,
          body: comment
        });

        // Create sub-issues if requested
        if (breakdown.createSubIssues) {
          for (const phase of breakdown.phases) {
            for (const task of phase.tasks) {
              await this.createSubIssue(epic, phase, task);
            }
          }
        }
      }

      this.report.processed.push({
        number: epic.number,
        title: epic.title,
        action: 'epic-breakdown',
        breakdown,
        timestamp: new Date()
      });

      this.processed++;
      console.log(`✅ Processed epic breakdown for #${epic.number}`);
    } catch (error) {
      console.error(`❌ Failed to breakdown epic #${epic.number}:`, error.message);
      this.errors.push({ issue: epic.number, error: error.message });
    }
  }

  analyzeEpicBreakdown(epic) {
    const title = epic.title.toLowerCase();
    const body = epic.body || '';

    // Determine epic type and generate breakdown
    let breakdown = {
      type: 'general',
      estimatedDuration: '3-6 months',
      phases: [],
      createSubIssues: false
    };

    // Analyze epic content to determine type
    if (title.includes('pmbok') || title.includes('7版')) {
      breakdown.type = 'pmbok-upgrade';
      breakdown.phases = [
        {
          name: 'Phase 1: Data & Architecture',
          duration: '6 weeks',
          tasks: [
            'PMBOK 7th edition data model design',
            'Database schema extension',
            'API endpoint updates',
            'Data migration planning'
          ]
        },
        {
          name: 'Phase 2: Core Implementation',
          duration: '8 weeks',
          tasks: [
            'Performance domain visualization',
            'Version switching functionality',
            'Learning progress adaptation',
            'Content comparison features'
          ]
        },
        {
          name: 'Phase 3: Testing & Integration',
          duration: '4 weeks',
          tasks: [
            'Comprehensive testing suite',
            'User acceptance testing',
            'Performance optimization',
            'Security validation'
          ]
        }
      ];
    } else if (title.includes('mobile') || title.includes('pwa')) {
      breakdown.type = 'mobile-enhancement';
      breakdown.phases = [
        {
          name: 'Phase 1: Foundation',
          duration: '4 weeks',
          tasks: [
            'Mobile-first component redesign',
            'Touch gesture implementation',
            'Responsive layout optimization',
            'Performance profiling'
          ]
        },
        {
          name: 'Phase 2: PWA Features',
          duration: '6 weeks',
          tasks: [
            'Service Worker optimization',
            'Offline functionality',
            'Push notification system',
            'App store deployment'
          ]
        }
      ];
    }

    return breakdown;
  }

  generateEpicBreakdownComment(breakdown) {
    const phasesMarkdown = breakdown.phases.map(phase => 
      `### ${phase.name} (${phase.duration})
${phase.tasks.map(task => `- [ ] ${task}`).join('\n')}`
    ).join('\n\n');

    return `📚 **Epic Breakdown Analysis**

**Epic Type**: ${breakdown.type}
**Estimated Duration**: ${breakdown.estimatedDuration}

## Recommended Implementation Phases

${phasesMarkdown}

## Project Management Recommendations

- **Team Size**: 4-6 developers
- **Delivery Method**: Agile sprints (2-week cycles)
- **Risk Management**: Weekly progress reviews
- **Quality Gates**: Phase completion criteria

## Next Steps

1. Review and refine the breakdown based on team capacity
2. Create detailed technical specifications for each phase
3. Set up project tracking and milestone monitoring
4. Use \`@claude estimate\` for detailed effort estimation

*Epic breakdown by Claude AI Assistant*`;
  }

  async analyzeRelationships(options) {
    console.log('🔗 Starting relationship analysis...');
    
    const issues = await this.getIssues({ state: 'open' });
    console.log(`Analyzing relationships for ${issues.length} issues`);

    const relationships = [];

    for (let i = 0; i < issues.length; i++) {
      for (let j = i + 1; j < issues.length; j++) {
        const relationship = this.detectRelationship(issues[i], issues[j]);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }

    console.log(`Found ${relationships.length} potential relationships`);

    if (!this.config.dryRun) {
      await this.createRelationshipComments(relationships);
    }

    this.report.summary.relationshipsFound = relationships.length;
  }

  detectRelationship(issue1, issue2) {
    const title1 = issue1.title.toLowerCase();
    const title2 = issue2.title.toLowerCase();
    const body1 = (issue1.body || '').toLowerCase();
    const body2 = (issue2.body || '').toLowerCase();

    // Extract keywords
    const keywords1 = this.extractKeywords(title1 + ' ' + body1);
    const keywords2 = this.extractKeywords(title2 + ' ' + body2);

    // Calculate similarity
    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);

    if (similarity > 0.3) {
      return {
        issue1: issue1.number,
        issue2: issue2.number,
        type: this.determineRelationshipType(issue1, issue2),
        similarity,
        commonKeywords
      };
    }

    return null;
  }

  extractKeywords(text) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return text
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !stopWords.includes(word))
      .slice(0, 10); // Top 10 keywords
  }

  determineRelationshipType(issue1, issue2) {
    const labels1 = issue1.labels.map(l => l.name);
    const labels2 = issue2.labels.map(l => l.name);

    if (labels1.includes('epic') || labels2.includes('epic')) {
      return 'parent-child';
    }
    if (labels1.includes('bug') && labels2.includes('bug')) {
      return 'related-bugs';
    }
    if (labels1.some(l => labels2.includes(l))) {
      return 'same-component';
    }
    return 'related';
  }

  async getIssues(options = {}) {
    const params = {
      owner: this.config.owner,
      repo: this.config.repo,
      state: options.state || 'open',
      per_page: 100,
      ...options
    };

    const { data } = await this.octokit.issues.listForRepo(params);
    return data.filter(issue => !issue.pull_request);
  }

  async getIssue(number) {
    const { data } = await this.octokit.issues.get({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: number
    });
    return data;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    this.report.endTime = new Date();
    this.report.duration = this.report.endTime - this.report.startTime;
    this.report.errors = this.errors;

    const reportPath = path.join(
      __dirname,
      `../reports/claude-batch-${Date.now()}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));

    console.log('');
    console.log('📊 Batch Processing Report:');
    console.log(`Duration: ${Math.round(this.report.duration / 1000)}s`);
    console.log(`Processed: ${this.processed} items`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Report saved: ${reportPath}`);
  }
}

// CLI Interface
const argv = yargs(hideBin(process.argv))
  .command('classify', 'Classify issues automatically', (yargs) => {
    yargs
      .option('state', {
        describe: 'Issue state to process',
        default: 'open',
        choices: ['open', 'closed', 'all']
      })
      .option('labels', {
        describe: 'Comma-separated list of labels to filter',
        type: 'string'
      });
  })
  .command('priority-review', 'Review issue priorities', (yargs) => {
    yargs
      .option('days', {
        describe: 'Days since last update',
        default: 7,
        type: 'number'
      });
  })
  .command('epic-breakdown', 'Break down epic into tasks', (yargs) => {
    yargs
      .option('issue', {
        describe: 'Epic issue number',
        type: 'number',
        demandOption: true
      });
  })
  .command('relationship-analysis', 'Analyze issue relationships')
  .command('stale-cleanup', 'Clean up stale issues', (yargs) => {
    yargs
      .option('days', {
        describe: 'Days to consider stale',
        default: 14,
        type: 'number'
      });
  })
  .option('dry-run', {
    describe: 'Run without making changes',
    type: 'boolean',
    default: false
  })
  .option('verbose', {
    describe: 'Verbose output',
    type: 'boolean',
    default: false
  })
  .demandCommand(1, 'Please specify an action')
  .help()
  .argv;

// Main execution
if (require.main === module) {
  const processor = new ClaudeBatchProcessor({
    dryRun: argv.dryRun,
    verbose: argv.verbose
  });

  const [action] = argv._;
  const options = { ...argv };
  delete options._;

  processor.run(action, options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ClaudeBatchProcessor;