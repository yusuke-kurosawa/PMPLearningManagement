# Documentation Reorganization Plan

## Overview

This document outlines the strategy to reorganize the project's documentation structure, centralizing all substantial documentation in the `docs/` directory while maintaining the `.claude/` directory as an efficient memory bank for Claude Code.

## Current State Analysis

### .claude/ Directory (44 MD files)
- Total content: Substantial documentation mixed with memory bank items
- Key categories:
  - Context files (project status, architecture)
  - Quick references (commands, file locations) 
  - Prompts and templates
  - Agent definitions (18 files)
  - Large reference files (500+ lines)

### docs/ Directory (81 MD files)
- Total content: Comprehensive project documentation
- Structure: Well-organized with categories and archives
- Issues: Missing cross-references to .claude/ content

## New Organization Strategy

### Principle: Single Source of Truth
- **docs/** = All substantial documentation (>100 lines, reference material)
- **.claude/** = Memory bank with links and essential context only (<50 lines per file)

## Implementation Plan

### Phase 1: Content Migration

#### Move to docs/
1. **Large reference files** from .claude/quick-ref/
   - `github-actions.md` (503 lines) → `docs/development/github-actions-reference.md`
   - `file-locations.md` (289 lines) → `docs/development/file-locations-reference.md`
   - `commands.md` (285 lines) → `docs/development/commands-reference.md`

2. **Substantial prompt files** from .claude/prompts/
   - `workflow-creation.md` (331 lines) → `docs/development/workflow-creation-guide.md`
   - `testing-guidelines.md` (281 lines) → `docs/development/testing-guidelines.md`
   - `architecture-review.md` (252 lines) → `docs/development/architecture-review-guide.md`
   - `code-review.md` (247 lines) → `docs/development/code-review-guide.md`

3. **Agent definitions** from .claude/agents/
   - All 18 agent files → `docs/development/agent-definitions/`

### Phase 2: Create New docs/ Structure

```
docs/
├── README.md                           # Main documentation index
├── organization/                       # Documentation organization
│   ├── DOCUMENTATION_REORGANIZATION_PLAN.md
│   └── NAVIGATION_GUIDE.md
├── development/                        # Development guides and references
│   ├── README.md                      # Development documentation index
│   ├── commands-reference.md          # From .claude/quick-ref/
│   ├── file-locations-reference.md    # From .claude/quick-ref/
│   ├── github-actions-reference.md    # From .claude/quick-ref/
│   ├── workflow-creation-guide.md     # From .claude/prompts/
│   ├── testing-guidelines.md          # From .claude/prompts/
│   ├── architecture-review-guide.md   # From .claude/prompts/
│   ├── code-review-guide.md          # From .claude/prompts/
│   └── agent-definitions/             # From .claude/agents/
│       ├── README.md
│       ├── development/
│       ├── qa/
│       ├── security/
│       └── devops/
├── project/                           # Project-specific documentation
│   ├── architecture/                 # Existing architecture docs
│   ├── planning/                      # Existing planning docs
│   ├── security/                      # Existing security docs
│   └── testing/                       # Existing testing docs
├── guides/                            # User and setup guides
└── archive/                           # Historical documentation
```

### Phase 3: Transform .claude/ to Memory Bank

#### New .claude/ Structure
```
.claude/
├── README.md                          # Memory bank overview
├── context/                           # Essential context only
│   ├── current-status.md             # Project status (links to docs/)
│   ├── quick-navigation.md           # Navigation shortcuts
│   └── recent-changes.md             # Recent changes summary
├── quick-ref/                        # Essential quick references
│   ├── commands.md                   # Key commands only (links to docs/)
│   ├── file-locations.md            # Essential locations (links to docs/)
│   └── navigation.md                 # Quick navigation links
├── prompts/                          # Minimal prompt templates
│   ├── README.md                     # Links to full guides in docs/
│   ├── code-review-template.md       # Brief template only
│   └── architecture-review-template.md # Brief template only
├── agents/                           # Agent summaries only
│   └── README.md                     # Links to full definitions in docs/
└── rules/                            # Essential rules and guidelines
    └── documentation-rules.md        # This reorganization rules
```

## Migration Execution

### Step 1: Create new docs/ structure
1. Create development/ directory and subdirectories
2. Create organization/ directory
3. Create agent-definitions/ structure

### Step 2: Move content with history preservation
1. Use git mv for content migration
2. Maintain git history where possible
3. Update all internal links

### Step 3: Replace .claude/ content with links
1. Replace large files with link-based summaries
2. Keep essential context information
3. Create navigation helpers

### Step 4: Update all references
1. Update CLAUDE.md references
2. Update package.json scripts
3. Update GitHub Actions workflows
4. Update README files

## Link Management Strategy

### Link Format
```markdown
# Quick Reference → [Full Documentation](../docs/development/commands-reference.md)

## Essential Commands
```bash
npm run dev    # Development server
npm run build  # Production build
```

**For complete command reference**: [Development Commands Guide](../docs/development/commands-reference.md)
```

### Cross-Reference System
- Each .claude/ file includes clear links to corresponding docs/ content
- Each docs/ file includes back-references to .claude/ context
- README files provide navigation maps

## Success Criteria

### Documentation Organization
- [ ] All substantial content (>100 lines) moved to docs/
- [ ] .claude/ files are concise (<50 lines each)
- [ ] Clear navigation between .claude/ and docs/
- [ ] No content duplication

### Functionality Preservation
- [ ] All existing links still work
- [ ] Git history preserved where possible
- [ ] Claude Code can still access all information efficiently
- [ ] Development workflow unchanged

### Maintainability
- [ ] Clear rules for future content placement
- [ ] Automated link checking possible
- [ ] Easy to find and update information
- [ ] Consistent file naming and organization

## Timeline

- **Phase 1** (Content Migration): 1-2 hours
- **Phase 2** (Structure Creation): 30 minutes  
- **Phase 3** (Link Transformation): 1-2 hours
- **Phase 4** (Testing & Updates): 30 minutes

**Total Estimated Time**: 3-5 hours

## Rollback Plan

If issues arise:
1. Restore original .claude/ content from git history
2. Move docs/ content back to original locations
3. Update links to original structure
4. All changes are tracked in git for easy reversal

---

*This plan ensures zero information loss while creating a more maintainable and organized documentation structure.*