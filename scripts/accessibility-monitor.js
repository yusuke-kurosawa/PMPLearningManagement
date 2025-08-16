#!/usr/bin/env node

/**
 * Accessibility Monitoring Script
 * Automated accessibility compliance checking for WCAG 2.1 AA standards
 * Uses regex-based HTML analysis for zero-dependency implementation
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Configuration
const CONFIG = {
  siteUrl: 'https://yusuke-kurosawa.github.io/PMPLearningManagement/',
  wcagLevel: 'AA', // A, AA, AAA
  routes: [
    { path: '', name: 'Home', priority: 'high' },
    { path: '#/matrix', name: 'PMBOK Matrix', priority: 'high' },
    { path: '#/network', name: 'Network Graph', priority: 'medium' },
    { path: '#/integrated', name: 'Integrated View', priority: 'medium' },
    { path: '#/visualizations', name: 'Visualizations Hub', priority: 'medium' },
    { path: '#/glossary', name: 'PMP Glossary', priority: 'high' },
    { path: '#/progress', name: 'Progress Dashboard', priority: 'medium' },
    { path: '#/flashcards', name: 'Flash Cards', priority: 'high' }
  ],
  reportDir: './accessibility-reports',
  thresholds: {
    minContrastRatio: 4.5, // WCAG AA standard
    maxFontSize: 24,
    minTouchTarget: 44 // pixels
  }
}

class AccessibilityMonitor {
  constructor() {
    this.results = []
    this.violations = []
    this.warnings = []
    this.recommendations = []
    this.ensureReportDirectory()
  }

  ensureReportDirectory() {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true })
    }
  }

  async fetchPageContent(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = ''
        
        response.on('data', (chunk) => {
          data += chunk
        })
        
        response.on('end', () => {
          if (response.statusCode === 200) {
            resolve(data)
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${url}`))
          }
        })
      })
      
      request.on('error', (error) => {
        reject(error)
      })
      
      request.setTimeout(10000, () => {
        request.destroy()
        reject(new Error('Request timeout'))
      })
    })
  }

  analyzeHtmlStructure(html) {
    const checks = []
    
    // Check 1: Title tag presence and content
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    if (!titleMatch || !titleMatch[1].trim()) {
      checks.push({
        type: 'violation',
        severity: 'medium',
        rule: 'WCAG 2.4.2 - Page Titled',
        description: 'Page missing title or title is empty',
        impact: 'Users cannot identify page context',
        recommendation: 'Add descriptive page title',
        wcagLevel: 'A'
      })
    }

    // Check 2: Meta viewport for mobile accessibility
    const viewportMatch = html.match(/<meta[^>]*name=["\']viewport["\'][^>]*>/i)
    if (!viewportMatch) {
      checks.push({
        type: 'warning',
        severity: 'medium',
        rule: 'WCAG 1.4.10 - Reflow',
        description: 'Missing viewport meta tag',
        impact: 'May cause horizontal scrolling on mobile devices',
        recommendation: 'Add viewport meta tag for responsive design',
        wcagLevel: 'AA'
      })
    }

    // Check 3: Language declaration
    const langMatch = html.match(/<html[^>]*lang=["\']([^"\']*)["\'][^>]*>/i)
    if (!langMatch) {
      checks.push({
        type: 'violation',
        severity: 'medium',
        rule: 'WCAG 3.1.1 - Language of Page',
        description: 'HTML lang attribute missing',
        impact: 'Screen readers cannot determine page language',
        recommendation: 'Add lang attribute to html element',
        wcagLevel: 'A'
      })
    }

    // Check 4: Images without alt text (basic check)
    const imgMatches = html.match(/<img[^>]*>/gi)
    let imagesWithoutAlt = 0
    
    if (imgMatches) {
      imgMatches.forEach(imgTag => {
        if (!imgTag.match(/alt\s*=/i)) {
          imagesWithoutAlt++
        }
      })
    }
    
    if (imagesWithoutAlt > 0) {
      checks.push({
        type: 'violation',
        severity: 'high',
        rule: 'WCAG 1.1.1 - Non-text Content',
        description: `${imagesWithoutAlt} images missing alt text`,
        impact: 'Screen readers cannot describe these images',
        recommendation: 'Add descriptive alt attributes to all images',
        elements: imagesWithoutAlt,
        wcagLevel: 'A'
      })
    }

    // Check 5: Form inputs without labels (basic check)
    const inputMatches = html.match(/<input[^>]*>/gi)
    let inputsWithoutLabels = 0
    
    if (inputMatches) {
      inputMatches.forEach(inputTag => {
        // Check if input has aria-label, aria-labelledby, or title
        if (!inputTag.match(/aria-label\s*=/i) && 
            !inputTag.match(/aria-labelledby\s*=/i) && 
            !inputTag.match(/title\s*=/i)) {
          const idMatch = inputTag.match(/id\s*=\s*["\']([^"\']*)["\']/i)
          if (idMatch) {
            const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["\']${idMatch[1]}["\'][^>]*>`, 'i')
            if (!html.match(labelRegex)) {
              inputsWithoutLabels++
            }
          } else {
            inputsWithoutLabels++
          }
        }
      })
    }
    
    if (inputsWithoutLabels > 0) {
      checks.push({
        type: 'violation',
        severity: 'high',
        rule: 'WCAG 1.3.1 - Info and Relationships',
        description: `${inputsWithoutLabels} form inputs missing labels`,
        impact: 'Screen readers cannot identify form input purposes',
        recommendation: 'Add labels or aria-label attributes to all form inputs',
        elements: inputsWithoutLabels,
        wcagLevel: 'A'
      })
    }

    // Check 6: Heading structure
    const h1Matches = html.match(/<h1[^>]*>/gi)
    const h1Count = h1Matches ? h1Matches.length : 0
    
    if (h1Count === 0) {
      checks.push({
        type: 'violation',
        severity: 'medium',
        rule: 'WCAG 1.3.1 - Info and Relationships',
        description: 'Page missing H1 heading',
        impact: 'Page structure unclear to screen readers',
        recommendation: 'Add one H1 heading as page title',
        wcagLevel: 'A'
      })
    } else if (h1Count > 1) {
      checks.push({
        type: 'warning',
        severity: 'low',
        rule: 'WCAG 1.3.1 - Info and Relationships',
        description: `Multiple H1 headings found (${h1Count})`,
        impact: 'Page structure may be confusing',
        recommendation: 'Use only one H1 heading per page',
        elements: h1Count,
        wcagLevel: 'A'
      })
    }

    // Check 7: Main landmark
    const mainMatch = html.match(/<main[^>]*>|role\s*=\s*["\']main["\']>/i)
    if (!mainMatch) {
      checks.push({
        type: 'warning',
        severity: 'medium',
        rule: 'WCAG 1.3.1 - Info and Relationships',
        description: 'Page missing main landmark',
        impact: 'Screen reader users cannot quickly navigate to main content',
        recommendation: 'Add <main> element or role="main"',
        wcagLevel: 'A'
      })
    }

    // Check 8: Skip links
    const skipLinkMatch = html.match(/<a[^>]*href\s*=\s*["\'][^"\']*(?:#|main)[^"\']*["\'][^>]*>/i)
    if (!skipLinkMatch) {
      checks.push({
        type: 'warning',
        severity: 'low',
        rule: 'WCAG 2.4.1 - Bypass Blocks',
        description: 'No skip link found',
        impact: 'Keyboard users must tab through all navigation',
        recommendation: 'Add skip link to main content',
        wcagLevel: 'A'
      })
    }

    // Check 9: Color contrast (basic check for inline styles)
    const colorContrastIssues = this.checkBasicColorContrast(html)
    if (colorContrastIssues > 0) {
      checks.push({
        type: 'warning',
        severity: 'medium',
        rule: 'WCAG 1.4.3 - Contrast (Minimum)',
        description: `${colorContrastIssues} potential color contrast issues detected`,
        impact: 'Text may be difficult to read for users with vision impairments',
        recommendation: 'Ensure minimum 4.5:1 contrast ratio for normal text',
        elements: colorContrastIssues,
        wcagLevel: 'AA'
      })
    }

    // Check 10: ARIA attributes validation (basic)
    const ariaIssues = this.checkBasicARIA(html)
    if (ariaIssues > 0) {
      checks.push({
        type: 'warning',
        severity: 'medium',
        rule: 'WCAG 4.1.2 - Name, Role, Value',
        description: `${ariaIssues} potential ARIA usage issues detected`,
        impact: 'Assistive technologies may not understand element purposes correctly',
        recommendation: 'Review and validate ARIA attributes',
        elements: ariaIssues,
        wcagLevel: 'A'
      })
    }

    return checks
  }

  checkBasicColorContrast(html) {
    // Basic check for common low-contrast patterns in inline styles
    const lowContrastPatterns = [
      /color\s*:\s*#[0-9a-f]{3,6}[^;]*background[^;]*#[0-9a-f]{3,6}/gi,
      /background[^;]*#[0-9a-f]{3,6}[^;]*color\s*:\s*#[0-9a-f]{3,6}/gi
    ]
    
    let issues = 0
    lowContrastPatterns.forEach(pattern => {
      const matches = html.match(pattern)
      if (matches) {
        issues += matches.length
      }
    })
    
    return issues
  }

  checkBasicARIA(html) {
    // Check for common ARIA misuses
    let issues = 0
    
    // Check for aria-label on non-interactive elements
    const ariaLabelOnNonInteractive = html.match(/<(?:div|span|p)[^>]*aria-label[^>]*>/gi)
    if (ariaLabelOnNonInteractive) {
      issues += ariaLabelOnNonInteractive.length
    }
    
    // Check for missing aria-labelledby targets
    const ariaLabelledByMatches = html.match(/aria-labelledby\s*=\s*["\']([^"\']*)["\']/gi)
    if (ariaLabelledByMatches) {
      ariaLabelledByMatches.forEach(match => {
        const idMatch = match.match(/aria-labelledby\s*=\s*["\']([^"\']*)["\']/i)
        if (idMatch) {
          const targetId = idMatch[1]
          const targetExists = html.match(new RegExp(`id\\s*=\\s*["\']${targetId}["\']`, 'i'))
          if (!targetExists) {
            issues++
          }
        }
      })
    }
    
    return issues
  }

  async analyzeAccessibility(html, routeInfo) {
    const checks = this.analyzeHtmlStructure(html)
    
    return {
      route: routeInfo,
      checks,
      summary: {
        violations: checks.filter(c => c.type === 'violation').length,
        warnings: checks.filter(c => c.type === 'warning').length,
        totalIssues: checks.length,
        severity: this.calculateSeverity(checks)
      }
    }
  }

  calculateSeverity(checks) {
    const highSeverity = checks.filter(c => c.severity === 'high').length
    const mediumSeverity = checks.filter(c => c.severity === 'medium').length
    
    if (highSeverity > 0) return 'high'
    if (mediumSeverity > 0) return 'medium'
    return 'low'
  }

  calculateAccessibilityScore(results) {
    let totalScore = 100
    
    results.forEach(result => {
      result.checks.forEach(check => {
        const penalty = check.severity === 'high' ? 10 : check.severity === 'medium' ? 5 : 2
        totalScore -= penalty
      })
    })
    
    return Math.max(0, totalScore)
  }

  generateRecommendations(results) {
    const recommendations = []
    const issueTypes = {}
    
    // Collect and categorize issues
    results.forEach(result => {
      result.checks.forEach(check => {
        if (!issueTypes[check.rule]) {
          issueTypes[check.rule] = {
            count: 0,
            severity: check.severity,
            recommendation: check.recommendation,
            impact: check.impact,
            wcagLevel: check.wcagLevel,
            affectedRoutes: []
          }
        }
        issueTypes[check.rule].count += check.elements || 1
        issueTypes[check.rule].affectedRoutes.push(result.route.name)
      })
    })
    
    // Generate prioritized recommendations
    Object.entries(issueTypes)
      .sort(([,a], [,b]) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity] || b.count - a.count
      })
      .forEach(([rule, issue], index) => {
        recommendations.push({
          priority: index + 1,
          rule,
          severity: issue.severity,
          affectedElements: issue.count,
          affectedRoutes: [...new Set(issue.affectedRoutes)],
          recommendation: issue.recommendation,
          impact: issue.impact,
          wcagLevel: issue.wcagLevel,
          estimatedEffort: issue.severity === 'high' ? 'High' : issue.severity === 'medium' ? 'Medium' : 'Low'
        })
      })
    
    return recommendations
  }

  async run() {
    console.log('♿ Starting Accessibility Monitoring')
    console.log('===================================')
    console.log(`Site URL: ${CONFIG.siteUrl}`)
    console.log(`WCAG Level: ${CONFIG.wcagLevel}`)
    console.log(`Routes to check: ${CONFIG.routes.length}`)
    console.log('===================================\n')

    try {
      // Check each route
      for (const route of CONFIG.routes) {
        const url = CONFIG.siteUrl + route.path
        
        try {
          console.log(`🔍 Checking: ${route.name} (${route.priority} priority)`)
          
          const html = await this.fetchPageContent(url)
          const result = await this.analyzeAccessibility(html, route)
          
          this.results.push(result)
          
          const icon = result.summary.severity === 'high' ? '🚨' : 
                      result.summary.severity === 'medium' ? '⚠️' : '✅'
          console.log(`  ${icon} ${result.summary.violations} violations, ${result.summary.warnings} warnings`)
          
        } catch (error) {
          console.log(`  ❌ Error checking ${route.name}: ${error.message}`)
          this.results.push({
            route,
            error: error.message,
            checks: [],
            summary: { violations: 0, warnings: 0, totalIssues: 0, severity: 'unknown' }
          })
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Generate comprehensive report
      const accessibilityScore = this.calculateAccessibilityScore(this.results)
      const recommendations = this.generateRecommendations(this.results)
      
      const report = {
        timestamp: new Date().toISOString(),
        siteUrl: CONFIG.siteUrl,
        wcagLevel: CONFIG.wcagLevel,
        summary: {
          accessibilityScore,
          totalRoutes: CONFIG.routes.length,
          totalViolations: this.results.reduce((sum, r) => sum + r.summary.violations, 0),
          totalWarnings: this.results.reduce((sum, r) => sum + r.summary.warnings, 0),
          highPriorityIssues: recommendations.filter(r => r.severity === 'high').length,
          complianceLevel: accessibilityScore >= 95 ? 'Excellent' : 
                          accessibilityScore >= 85 ? 'Good' : 
                          accessibilityScore >= 70 ? 'Needs Improvement' : 'Poor'
        },
        results: this.results,
        recommendations,
        thresholds: CONFIG.thresholds
      }

      // Save report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const reportFile = path.join(CONFIG.reportDir, `accessibility-${timestamp}.json`)
      
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
      fs.writeFileSync(path.join(CONFIG.reportDir, 'latest-accessibility.json'), JSON.stringify(report, null, 2))
      
      // Print summary
      console.log('\n♿ Accessibility Monitoring Summary')
      console.log('==================================')
      console.log(`Accessibility Score: ${accessibilityScore}/100`)
      console.log(`Compliance Level: ${report.summary.complianceLevel}`)
      console.log(`Total Violations: ${report.summary.totalViolations}`)
      console.log(`Total Warnings: ${report.summary.totalWarnings}`)
      console.log(`High Priority Issues: ${report.summary.highPriorityIssues}`)
      console.log(`Report saved: ${reportFile}`)
      
      // Print top recommendations
      if (recommendations.length > 0) {
        console.log('\n🎯 Top Priority Recommendations:')
        recommendations.slice(0, 5).forEach((rec, index) => {
          const icon = rec.severity === 'high' ? '🚨' : rec.severity === 'medium' ? '⚠️' : 'ℹ️'
          console.log(`  ${index + 1}. ${icon} [${rec.wcagLevel}] ${rec.rule}`)
          console.log(`     ${rec.recommendation}`)
          console.log(`     Affected: ${rec.affectedElements} elements across ${rec.affectedRoutes.length} routes`)
        })
      } else {
        console.log('\n✅ No accessibility issues detected!')
      }
      
      console.log('\n🎉 Accessibility monitoring completed successfully!')
      
      return report
      
    } catch (error) {
      console.error('❌ Accessibility monitoring failed:', error)
      throw error
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const monitor = new AccessibilityMonitor()
  monitor.run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = AccessibilityMonitor