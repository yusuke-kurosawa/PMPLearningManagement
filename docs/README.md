# Project Documentation

Comprehensive project documentation organized by type and audience. This is the **single source of truth** for all substantial project documentation.

> **Memory Bank**: For quick access to essential information, see [.claude/](../.claude/) directory which contains links to this documentation.

## Directory Structure

```
docs/
├── development/        # 🔧 Development guides and references
│   ├── commands-reference.md        # Complete command guide
│   ├── file-locations-reference.md  # File and directory structure
│   ├── github-actions-reference.md  # CI/CD workflow documentation
│   ├── code-review-guide.md         # Code review standards
│   ├── architecture-review-guide.md # Architecture review process
│   ├── testing-guidelines.md        # Testing standards
│   ├── workflow-creation-guide.md   # GitHub Actions workflow creation
│   └── agent-definitions/           # AI agent specifications
│       ├── development/             # Development agents
│       ├── qa/                      # Quality assurance agents
│       ├── security/                # Security auditing agents
│       ├── devops/                  # DevOps and infrastructure agents
│       ├── architecture/            # Architecture agents
│       ├── coordination/            # Project coordination agents
│       └── management/              # Management agents
├── organization/       # 📋 Documentation organization
│   ├── DOCUMENTATION_REORGANIZATION_PLAN.md
│   └── NAVIGATION_GUIDE.md
├── project/           # 📊 Project-specific documentation
│   ├── IDD_IMPLEMENTATION_STATUS.md
│   ├── IDD_AGENT_GUIDELINES.md
│   ├── CLAUDE_USAGE_GUIDE.md
│   └── architecture/               # Existing architecture docs
├── guides/            # 📚 User and setup guides
├── archive/           # 📁 Historical documentation
└── consolidated/      # 📋 Consolidated documentation (existing)
```

### Quick Access

- **Development workflow**: [development/README.md](development/README.md)
- **Navigation guide**: [organization/NAVIGATION_GUIDE.md](organization/NAVIGATION_GUIDE.md)
- **Memory bank**: [../.claude/context/quick-navigation.md](../.claude/context/quick-navigation.md)

## Document Categories

### 🔧 Development Documentation
- **Reference Guides**: Commands, file locations, GitHub Actions
- **Process Guides**: Code review, architecture review, testing
- **Agent Definitions**: AI agent specifications for different roles
- **Workflow Guides**: Creating and managing GitHub Actions workflows

### 📋 Organization Documentation
- **Navigation Guides**: How to find and use documentation
- **Reorganization Plans**: Documentation structure evolution
- **Maintenance Rules**: How to maintain organized documentation

### 📊 Project Documentation  
- **IDD Documentation**: Issue-Driven Development implementation
- **Claude Integration**: AI integration guides and usage
- **Architecture**: System design and technical specifications
- **Historical**: Legacy planning and design documents

### 🔗 Cross-Reference System
- **Memory Bank Links**: Quick access via [.claude/](../.claude/) directory
- **Bidirectional Navigation**: Links between quick refs and full docs
- **Context Preservation**: Essential information readily accessible

## Documentation Standards

### Content Organization
- **Single Source of Truth**: All substantial content (>100 lines) in `docs/`
- **Memory Bank**: Essential context and links in [.claude/](../.claude/)
- **Cross-References**: Clear links between related documents
- **Back-References**: Links from docs back to memory bank context

### Format Standards
- All documents in Markdown format
- Table of contents for longer documents (>50 lines)
- Consistent heading structure (H1 for title, H2 for main sections)
- Examples and code blocks for technical content
- Clear link formatting with descriptive text

### Maintenance
- Keep documents synchronized with code changes
- Update cross-references when moving or renaming files
- Follow [Documentation Rules](../.claude/rules/documentation-rules.md)
- Regular review and cleanup of outdated content

## Related Resources

- **Memory Bank**: [.claude/](../.claude/) - Quick access and navigation
- **Development Guide**: [development/README.md](development/README.md) - Development documentation hub
- **Navigation Guide**: [organization/NAVIGATION_GUIDE.md](organization/NAVIGATION_GUIDE.md) - How to navigate docs
- **Documentation Rules**: [../.claude/rules/documentation-rules.md](../.claude/rules/documentation-rules.md) - Organization rules
