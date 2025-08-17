# Documentation Navigation Guide

This guide helps you navigate the reorganized documentation structure efficiently.

## Quick Start

### For Developers
1. **Essential Commands**: [Development Commands](../development/commands-reference.md)
2. **File Locations**: [File Locations Reference](../development/file-locations-reference.md)
3. **Current Status**: [Project Status](../../.claude/context/current-status.md)

### For Claude Code Users
- **Memory Bank**: [.claude/context/](../../.claude/context/) - Essential project context
- **Quick References**: [.claude/quick-ref/](../../.claude/quick-ref/) - Links to full documentation

## Documentation Structure

### Primary Documentation (`docs/`)
```
docs/
├── development/          # Development guides and references
├── organization/         # Documentation organization guides
├── project/              # Project-specific documentation
├── guides/               # User and setup guides
└── archive/              # Historical documentation
```

### Memory Bank (`.claude/`)
```
.claude/
├── context/              # Essential project context
├── quick-ref/            # Quick references with links
├── prompts/              # Minimal templates
└── rules/                # Essential rules
```

## Navigation Patterns

### From Memory Bank to Documentation
- Memory bank files contain **links** to full documentation
- Quick references provide **essential info + links**
- Context files provide **current status + navigation**

### From Documentation to Memory Bank
- Full documentation includes **back-references** to context
- README files provide **navigation maps**
- Cross-reference system maintains **bidirectional links**

## Common Workflows

### Finding Development Information
1. Start: [Development README](../development/README.md)
2. Commands: [Commands Reference](../development/commands-reference.md)
3. Quick access: [.claude/quick-ref/commands.md](../../.claude/quick-ref/commands.md)

### Understanding Project Architecture
1. Overview: [Architecture Summary](../../.claude/context/architecture-summary.md)
2. Details: [Architecture Documentation](../archive/architecture/)
3. Decisions: [Key Decisions](../../.claude/context/key-decisions.md)

### Working with Agents
1. Overview: [Agent Overview](../../.claude/agents/README.md)
2. Definitions: [Agent Definitions](../development/agent-definitions/)
3. Templates: [Agent Templates](../../.claude/prompts/)

## Link Format Standards

### Memory Bank Links
```markdown
## Quick Reference → [Full Documentation](../docs/path/to/full-doc.md)

Essential info here...

**Complete guide**: [Full Documentation Title](../docs/path/to/full-doc.md)
```

### Documentation Back-References
```markdown
> **Memory Bank**: [Quick Reference](../../.claude/quick-ref/related-topic.md)
> **Context**: [Current Status](../../.claude/context/current-status.md)
```

## Maintenance Guidelines

### Adding New Documentation
- **Substantial content (>100 lines)**: Place in `docs/`
- **Quick reference/context**: Place in `.claude/`
- **Always update** both README files
- **Create cross-references** between related files

### Updating Existing Content
- **Update source** in appropriate location (`docs/` or `.claude/`)
- **Update links** in referencing files
- **Maintain consistency** between quick refs and full docs
- **Test navigation** after changes

## Search Strategies

### Finding Specific Information
1. **By topic**: Check development/ README for navigation
2. **By file type**: Use directory structure (development/, project/, etc.)
3. **By agent**: Check agent-definitions/ directory
4. **Quick access**: Start with .claude/quick-ref/

### Using Claude Code
- **Current context**: Start with .claude/context/current-status.md
- **Quick command**: Use .claude/quick-ref/ for immediate needs
- **Full details**: Follow links to docs/ for comprehensive info

---

*This navigation system ensures efficient access to information while maintaining clear organization and avoiding duplication.*