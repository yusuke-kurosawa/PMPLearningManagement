# GitHub Actions Quick Reference → [Full Documentation](../../docs/development/github-actions-reference.md)

## Active Workflows

```bash
# Main Workflows
.github/workflows/deploy.yml                    # Production deployment
.github/workflows/issue-driven-development.yml # IDD compliance
.github/workflows/idd-compliance.yml           # PR compliance check
.github/workflows/idd-metrics-collector.yml    # Metrics collection
```

## Essential Commands

```bash
# Trigger workflows
gh workflow run deploy.yml
gh workflow run idd-compliance.yml

# Check workflow status
gh run list --workflow=deploy.yml
gh run list --workflow=idd-compliance.yml

# View workflow logs
gh run view [run-id] --log
```

## Quick Status Check

```bash
# IDD compliance status
npm run idd:status

# Recent workflow runs
gh run list --limit 5
```

**For complete GitHub Actions reference, troubleshooting, and advanced workflows**:
📖 [GitHub Actions Reference](../../docs/development/github-actions-reference.md)

---
*Memory Bank: Essential GitHub Actions info for immediate use. See full documentation for comprehensive workflow details.*