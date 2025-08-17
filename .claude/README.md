# 🧠 .claude Directory - Memory Bank

> **Purpose**: Lightweight memory bank for Claude AI with quick access to essential project context

## 📋 Directory Structure & Purpose

```
.claude/
├── context/          # Essential project context (< 50 lines each)
├── agents/           # Agent definitions → links to docs
├── policies/         # Policy references → links to docs/policies/
├── prompts/          # Quick templates → links to docs/prompts/
├── quick-ref/        # Command shortcuts & file locations
├── rules/           # Claude behavior rules
└── scripts/         # Automation scripts
```

## 🎯 Memory Bank Philosophy

### Core Principles
1. **Lightweight References** - Files < 50 lines (exceptions for critical context)
2. **No Duplication** - Links to `/docs/` for full content
3. **Fast Access** - Quick navigation to essential information
4. **Context Preservation** - Maintain critical project state

### Content Strategy

| Directory | Purpose | Max Size | Links To |
|-----------|---------|----------|----------|
| `context/` | Project state & status | 50 lines | Self-contained |
| `agents/` | Agent overview | 30 lines | `/docs/development/agent-definitions/` |
| `policies/` | Policy index | Links only | `/docs/policies/` |
| `prompts/` | Quick templates | 200 lines | `/docs/prompts/` |
| `quick-ref/` | Commands & locations | 100 lines | `/docs/development/` |

## 🚀 Quick Access Points

### Development
- [Commands](quick-ref/commands.md) - Essential commands
- [File Locations](quick-ref/file-locations.md) - Key file paths
- [Current Status](context/current-status.md) - Project state

### Documentation
- [Full Docs](../docs/) - Complete documentation
- [Policies](../docs/policies/) - All policy documents
- [Prompts](../docs/prompts/) - Full prompt templates

## 📊 Memory Optimization Status

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Files | 50+ | 25 | 50% reduction |
| Avg File Size | 500 lines | 50 lines | 90% reduction |
| Large Files (>500) | 15 | 0 | 100% eliminated |
| Memory Usage | High | Low | Optimized |

## 🔄 Recent Optimizations (2025-08-17)

✅ **Completed**:
- Migrated policies to `/docs/policies/`
- Moved large prompts to `/docs/prompts/`
- Eliminated CLAUDE.md duplication
- Fixed broken links
- Optimized memory bank structure

## 📝 Usage Guidelines

### For Claude AI
- Start with `context/current-status.md` for project state
- Use `quick-ref/` for common operations
- Follow links to `/docs/` for detailed information

### For Developers
- Keep `.claude/` files minimal
- Add comprehensive docs to `/docs/`
- Update links when moving content
- Regular cleanup of outdated references

---
*Memory Bank optimized for efficient Claude AI context management*
*Last Updated: 2025-08-17*