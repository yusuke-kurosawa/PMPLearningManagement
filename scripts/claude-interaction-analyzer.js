#!/usr/bin/env node

/**
 * Claude Code Interaction Analyzer
 * 
 * Analyzes Claude interactions, detects patterns, and provides insights
 * for better development workflow optimization.
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

class ClaudeInteractionAnalyzer {
  constructor(token, owner, repo) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Fetch all Claude-related issues
   */
  async fetchClaudeIssues() {
    try {
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        labels: 'claude-code',
        state: 'all',
        per_page: 100
      });

      return issues;
    } catch (error) {
      console.error('Error fetching issues:', error.message);
      return [];
    }
  }

  /**
   * Analyze interaction patterns
   */
  analyzePatterns(issues) {
    const analysis = {
      total: issues.length,
      byType: {},
      byPriority: {},
      byMonth: {},
      avgResolutionTime: 0,
      topKeywords: {},
      trendsOverTime: []
    };

    issues.forEach(issue => {
      // Extract metadata from labels
      const typeLabel = issue.labels.find(l => l.name.startsWith('type:'));
      const priorityLabel = issue.labels.find(l => l.name.startsWith('priority:'));
      
      if (typeLabel) {
        const type = typeLabel.name.replace('type:', '');
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;
      }

      if (priorityLabel) {
        const priority = priorityLabel.name.replace('priority:', '');
        analysis.byPriority[priority] = (analysis.byPriority[priority] || 0) + 1;
      }

      // Analyze by month
      const month = new Date(issue.created_at).toISOString().slice(0, 7);
      analysis.byMonth[month] = (analysis.byMonth[month] || 0) + 1;

      // Extract keywords from titles and body
      const text = `${issue.title} ${issue.body}`.toLowerCase();
      const keywords = text.match(/\b\w{4,}\b/g) || [];
      keywords.forEach(word => {
        if (!this.isStopWord(word)) {
          analysis.topKeywords[word] = (analysis.topKeywords[word] || 0) + 1;
        }
      });
    });

    // Sort top keywords
    analysis.topKeywords = Object.entries(analysis.topKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

    return analysis;
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(analysis) {
    const insights = [];

    // Most active development areas
    const topTypes = Object.entries(analysis.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    insights.push({
      type: 'development_focus',
      title: 'Primary Development Areas',
      description: `Most activity: ${topTypes.map(([type, count]) => `${type} (${count})`).join(', ')}`,
      recommendation: 'Consider creating specialized workflows for frequently used interaction types.'
    });

    // Priority distribution
    const highPriority = (analysis.byPriority.critical || 0) + (analysis.byPriority.high || 0);
    const totalPriority = Object.values(analysis.byPriority).reduce((a, b) => a + b, 0);
    const highPriorityRate = (highPriority / totalPriority * 100).toFixed(1);

    insights.push({
      type: 'priority_analysis',
      title: 'Priority Distribution',
      description: `${highPriorityRate}% of interactions are high/critical priority`,
      recommendation: highPriorityRate > 50 
        ? 'High urgency rate - consider improving planning and proactive development'
        : 'Good balance of priorities - maintain current workflow'
    });

    // Growth trends
    const recentMonths = Object.entries(analysis.byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3);

    if (recentMonths.length >= 2) {
      const trend = recentMonths[0][1] > recentMonths[1][1] ? 'increasing' : 'decreasing';
      insights.push({
        type: 'activity_trend',
        title: 'Recent Activity Trend',
        description: `Development activity is ${trend}`,
        recommendation: trend === 'increasing' 
          ? 'Consider scaling automation and documentation processes'
          : 'Focus on consolidating and optimizing existing features'
      });
    }

    return insights;
  }

  /**
   * Check if word is a common stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
      'will', 'one', 'use', 'her', 'was', 'she', 'now', 'his', 'has', 'have',
      'this', 'that', 'with', 'from', 'they', 'been', 'said', 'each', 'which',
      'their', 'time', 'what', 'about', 'would', 'there', 'could', 'other',
      'issue', 'claude', 'code', 'interaction', 'implementation', 'system'
    ]);
    return stopWords.has(word);
  }

  /**
   * Generate markdown report
   */
  generateReport(analysis, insights) {
    const report = `# Claude Code Interaction Analysis Report

Generated: ${new Date().toISOString()}

## 📊 Overview

- **Total Interactions:** ${analysis.total}
- **Analysis Period:** ${Object.keys(analysis.byMonth).sort().join(' to ')}

## 📈 Interaction Types

| Type | Count | Percentage |
|------|-------|------------|
${Object.entries(analysis.byType)
  .sort(([,a], [,b]) => b - a)
  .map(([type, count]) => 
    `| ${type} | ${count} | ${(count/analysis.total*100).toFixed(1)}% |`
  ).join('\n')}

## 🎯 Priority Distribution

| Priority | Count | Percentage |
|----------|-------|------------|
${Object.entries(analysis.byPriority)
  .sort(([,a], [,b]) => b - a)
  .map(([priority, count]) => 
    `| ${priority} | ${count} | ${(count/analysis.total*100).toFixed(1)}% |`
  ).join('\n')}

## 📅 Monthly Activity

\`\`\`
${Object.entries(analysis.byMonth)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([month, count]) => `${month}: ${'█'.repeat(Math.max(1, Math.floor(count/2)))} (${count})`)
  .join('\n')}
\`\`\`

## 🔍 Top Keywords

${Object.entries(analysis.topKeywords)
  .slice(0, 10)
  .map(([word, count]) => `- **${word}**: ${count} mentions`)
  .join('\n')}

## 💡 Insights & Recommendations

${insights.map(insight => `
### ${insight.title}

${insight.description}

**Recommendation:** ${insight.recommendation}
`).join('\n')}

## 🚀 Next Steps

1. **Process Optimization:** Focus on high-frequency interaction types
2. **Automation Enhancement:** Reduce manual overhead in common scenarios
3. **Knowledge Management:** Improve searchability and categorization
4. **Quality Metrics:** Implement success rate tracking for interactions

---
*Generated by Claude Interaction Analyzer*
`;

    return report;
  }

  /**
   * Run full analysis
   */
  async analyze() {
    console.log('🔍 Fetching Claude interaction issues...');
    const issues = await this.fetchClaudeIssues();
    
    if (issues.length === 0) {
      console.log('No Claude interaction issues found.');
      return;
    }

    console.log(`📊 Analyzing ${issues.length} interactions...`);
    const analysis = this.analyzePatterns(issues);
    
    console.log('💡 Generating insights...');
    const insights = this.generateInsights(analysis);
    
    console.log('📝 Creating report...');
    const report = this.generateReport(analysis, insights);
    
    // Save report
    const reportPath = path.join(process.cwd(), 'docs', 'claude-interaction-analysis.md');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);
    
    console.log(`✅ Analysis complete! Report saved to: ${reportPath}`);
    
    // Output summary
    console.log('\n🎯 Quick Summary:');
    console.log(`- Total interactions: ${analysis.total}`);
    console.log(`- Most common type: ${Object.entries(analysis.byType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`);
    console.log(`- High priority rate: ${((analysis.byPriority.critical || 0) + (analysis.byPriority.high || 0)) / analysis.total * 100}%`);
    
    return { analysis, insights, report };
  }
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'yusuke-kurosawa';
  const repo = process.env.GITHUB_REPO || 'PMPLearningManagement';

  if (!token) {
    console.error('Please set GITHUB_TOKEN environment variable');
    process.exit(1);
  }

  const analyzer = new ClaudeInteractionAnalyzer(token, owner, repo);
  analyzer.analyze().catch(console.error);
}

export { ClaudeInteractionAnalyzer };