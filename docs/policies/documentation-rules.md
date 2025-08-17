# Documentation Organization Rules

## Core Principle: Single Source of Truth

**All substantial documentation belongs in `docs/`**
**`.claude/` serves as memory bank with links to `docs/`**

## Content Placement Rules

### Place in `docs/` (Single Source of Truth)
- **Substantial content** (>100 lines)
- **Reference documentation** (commands, file locations, workflows)
- **Comprehensive guides** (testing, architecture, code review)
- **Agent definitions** (detailed specifications)
- **Historical documentation** (archive)
- **Project documentation** (architecture, planning, security)

### Place in `.claude/` (Memory Bank)
- **Essential context** (<50 lines per file)
- **Quick references** with links to full docs
- **Navigation shortcuts** 
- **Minimal templates** with links to full guides
- **Current project status**
- **Recent changes summary**

## File Content Guidelines

### `.claude/` Files Should:
- Be **concise** (<50 lines)
- Include **links** to comprehensive documentation
- Provide **essential information** for immediate use
- Serve as **navigation aids**
- Maintain **current context**

### `docs/` Files Should:
- Be **comprehensive** and detailed
- Include **back-references** to related `.claude/` context
- Follow **standard documentation practices**
- Be **self-contained** and complete

## Link Format Standards

### From Memory Bank to Documentation
```markdown
# Quick Reference → [Full Documentation](../../docs/path/to/full-doc.md)

Essential info here...

**For complete guide**: [Full Documentation Title](../../docs/path/to/full-doc.md)
```

### From Documentation to Memory Bank  
```markdown
> **Memory Bank**: [Quick Reference](../../.claude/quick-ref/related-topic.md)
> **Context**: [Current Status](../../.claude/context/current-status.md)
```

## Directory Structure Rules

### `.claude/` Structure
```
.claude/
├── context/           # Essential project context only
├── quick-ref/         # Quick references with links
├── prompts/           # Minimal templates with links  
├── agents/            # Agent overview with links
├── rules/             # Essential rules and guidelines
└── scripts/           # Automation scripts
```

### `docs/` Structure
```
docs/
├── development/       # Development guides and references
├── organization/      # Documentation organization guides
├── project/           # Project-specific documentation
├── guides/            # User and setup guides
└── archive/           # Historical documentation
```

## Maintenance Rules

### When Adding New Content
1. **Determine size**: >100 lines → `docs/`, <50 lines → `.claude/`
2. **Create in appropriate location**
3. **Add cross-references** between related files
4. **Update README files** in affected directories
5. **Test all links**

### When Updating Existing Content
1. **Update source file** in appropriate location
2. **Update links** in referencing files  
3. **Maintain consistency** between quick refs and full docs
4. **Verify navigation** still works

### When Removing Content
1. **Remove source file**
2. **Update all referencing files**
3. **Remove broken links**
4. **Update navigation files**

## Violation Prevention

### Common Mistakes to Avoid
- **Content duplication** between `.claude/` and `docs/`
- **Large files** in `.claude/` directory
- **Broken links** between directories
- **Missing back-references** in documentation
- **Outdated quick references**

### Quality Checks
- [ ] All `.claude/` files are <50 lines
- [ ] All links work correctly
- [ ] No content duplication
- [ ] Back-references exist
- [ ] README files are updated

## Emergency Procedures

### If Rules Are Violated
1. **Identify violation** (large files, duplication, broken links)
2. **Move content** to appropriate location
3. **Create/update links** as needed
4. **Test navigation** thoroughly
5. **Update referencing files**

### Rollback Process
1. **Use git history** to restore previous state
2. **Move content back** if needed
3. **Restore original links**
4. **Test full navigation**

---

*These rules ensure efficient information access while maintaining clear organization and preventing duplication.*