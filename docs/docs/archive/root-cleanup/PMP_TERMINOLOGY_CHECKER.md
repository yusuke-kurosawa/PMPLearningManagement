# 📚 PMP Terminology Consistency Checker

## Overview

The PMP Terminology Consistency Checker is an advanced automated system that ensures PMBOK-compliant terminology usage across the entire PMPLearningManagement codebase. It integrates AI-powered analysis, semantic understanding, and comprehensive reporting to maintain professional project management standards.

## 🎯 Key Features

### 1. **Comprehensive Terminology Database**
- Complete PMBOK 6th and 7th edition terminology
- 100+ critical PMP terms with context rules
- Deprecated terms detection and replacement suggestions
- Regional spelling variations (US/UK)
- Knowledge area and process group categorization

### 2. **AI-Powered Analysis Engine**
- Semantic analysis for context-aware validation
- Confidence scoring for each detection
- Multi-language support (TypeScript, JavaScript, Markdown)
- Smart false-positive filtering
- Learning mode for continuous improvement

### 3. **GitHub Actions Integration**
- Automated PR reviews with detailed comments
- Blocking/non-blocking severity levels
- Auto-fix capability for common issues
- Team metrics and performance tracking
- Artifact generation for historical analysis

### 4. **Developer Tools**
- Pre-commit hooks for local validation
- IDE integration support
- CLI commands for on-demand checking
- Interactive dashboard for metrics visualization
- API endpoints for custom integrations

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install pre-commit hook
npm run terminology:install-hook

# Verify installation
npm run terminology:check
```

### Basic Usage

#### Check Current Changes
```bash
# Check staged files (pre-commit)
npm run terminology:check

# Check all source files
npm run terminology:check:all
```

#### Validate Content
```bash
# Validate specific text
echo "The project lead will manage the work breakdown" | npm run terminology:validate

# Generate report
npm run terminology:report
```

#### View Dashboard
```bash
# Start development server with dashboard
npm run terminology:dashboard
```

## 📋 Terminology Rules

### Severity Levels

| Level | Description | Blocks PR | Auto-fix |
|-------|-------------|-----------|----------|
| **Error** | Critical terminology violations | ✅ | ✅ |
| **Warning** | Consistency issues | ❌ | ✅ |
| **Suggestion** | Best practice recommendations | ❌ | ❌ |
| **Info** | FYI notifications | ❌ | ❌ |

### Common Violations

#### ❌ Errors (Must Fix)
- "project lead" → "Project Manager"
- "work breakdown" → "Work Breakdown Structure"
- "stakeholder list" → "Stakeholder Register"
- "risk list" → "Risk Register"
- "change order" → "Change Request"
- "base plan" → "Baseline"

#### ⚠️ Warnings (Should Fix)
- "planning phase" → "Planning Process Group"
- "lessons learnt" → "Lessons Learned"
- "real cost" → "Actual Cost"
- "PMBoK" → "PMBOK"
- "pmi" → "PMI"

#### 💡 Suggestions
- Consider using official PMBOK terminology
- Expand acronyms on first use
- Use consistent capitalization

## 🔧 Configuration

### Project Configuration

Create `.terminology.json` in your project root:

```json
{
  "region": "US",
  "pmbokVersion": 7,
  "strictMode": false,
  "learningMode": true,
  "customRules": [],
  "ignorePaths": [
    "node_modules",
    "dist",
    "coverage"
  ],
  "fileExtensions": [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".md"
  ],
  "severity": {
    "blockOnError": true,
    "blockOnWarning": false
  }
}
```

### GitHub Actions Configuration

The workflow is configured in `.github/workflows/pmp-terminology-check.yml`:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  terminology-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: PMP Terminology Check
        run: npm run terminology:check
```

### Custom Rules

Add custom validation rules:

```javascript
// custom-rules.js
export const customRules = [
  {
    id: 'custom-001',
    pattern: /your pattern/gi,
    replacement: 'correct term',
    severity: 'warning',
    message: 'Custom rule message'
  }
];
```

## 📊 Metrics & Reporting

### Dashboard Features

The Terminology Dashboard provides:

1. **Compliance Score**: Overall terminology compliance percentage
2. **Issue Distribution**: Breakdown by severity level
3. **Common Mistakes**: Most frequent terminology errors
4. **Knowledge Gaps**: Areas requiring team training
5. **Trend Analysis**: Compliance improvement over time
6. **Team Metrics**: Individual contributor performance

### API Endpoints

```javascript
// Validate content
POST /api/terminology/validate
{
  "content": "string",
  "options": {
    "pmbokVersion": 7,
    "region": "US"
  }
}

// Get team metrics
GET /api/terminology/metrics?startDate=2024-01-01&endDate=2024-12-31

// Search terms
GET /api/terminology/search?query=risk&knowledgeArea=risk

// Get learning resources
GET /api/terminology/learning/risk-management
```

## 🎓 Learning Integration

### Automatic Learning Path Generation

Based on detected issues, the system generates personalized learning paths:

1. **Identified Knowledge Gaps**: Areas with most errors
2. **Recommended Resources**: Links to relevant documentation
3. **Glossary Terms**: Related terminology to study
4. **Estimated Time**: Learning duration estimates

### Example Learning Path

```json
{
  "topic": "Risk Management",
  "resources": [
    "https://www.pmi.org/learning/library/risk-management",
    "/glossary#risk-management"
  ],
  "glossaryTerms": [16, 17, 18],
  "estimatedTime": "30-60 minutes"
}
```

## 🔄 CI/CD Integration

### Pre-commit Hook

Automatically installed with:
```bash
npm run terminology:install-hook
```

Checks staged files before commit and blocks on errors.

### GitHub Actions Workflow

Automated PR reviews include:
- Line-by-line annotations
- Summary report as PR comment
- Auto-fix commits when possible
- Metrics collection for analytics

### Build Pipeline Integration

```yaml
# Example pipeline integration
steps:
  - name: Checkout
    uses: actions/checkout@v4
    
  - name: Terminology Check
    run: npm run terminology:check
    
  - name: Generate Report
    if: always()
    run: npm run terminology:report
    
  - name: Upload Report
    uses: actions/upload-artifact@v4
    with:
      name: terminology-report
      path: terminology-report.json
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. False Positives
- Check if the context is being properly detected
- Add exclusion patterns for specific cases
- Update context rules in the database

#### 2. Performance Issues
- Enable caching: `useCache: true`
- Limit file size checks
- Use incremental checking for large codebases

#### 3. Auto-fix Not Working
- Ensure file permissions are correct
- Check if the term has an auto-fix rule
- Verify replacement patterns are valid

### Debug Mode

Enable debug logging:
```bash
DEBUG=terminology:* npm run terminology:check
```

## 📈 Best Practices

### For Developers

1. **Run checks locally** before pushing code
2. **Review auto-fixes** to ensure meaning is preserved
3. **Learn from mistakes** - use dashboard insights
4. **Contribute rules** for project-specific terms
5. **Keep terminology database updated** with new PMBOK versions

### For Teams

1. **Regular training** based on metrics
2. **Establish team standards** for terminology usage
3. **Monitor trends** to identify systemic issues
4. **Celebrate improvements** in compliance scores
5. **Share knowledge** through documentation

## 🤝 Contributing

### Adding New Terms

1. Edit `src/data/terminology/pmp-terminology-database.ts`
2. Add comprehensive test cases
3. Update documentation
4. Submit PR with examples

### Improving Analysis Engine

1. Enhance semantic analysis algorithms
2. Add new context detection rules
3. Improve confidence scoring
4. Optimize performance

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [PMBOK Guide 7th Edition](https://www.pmi.org/pmbok-guide-standards/foundational/pmbok)
- [PMI Lexicon of Project Management Terms](https://www.pmi.org/lexicon)
- [Project Management Glossary](https://www.projectmanagement.com/glossary/)
- [PMP Exam Content Outline](https://www.pmi.org/certifications/project-management-pmp/exam-content-outline)

## 📞 Support

For issues or questions:
- Create an issue in the GitHub repository
- Check the FAQ section
- Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintained By**: PMPLearningManagement Team