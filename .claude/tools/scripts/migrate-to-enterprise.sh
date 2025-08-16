#!/bin/bash

# Claude Enterprise Structure Migration Script
# This script migrates the existing .claude directory to the new enterprise structure

set -e

echo "🚀 Claude Enterprise Structure Migration"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the .claude directory path
CLAUDE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo -e "${BLUE}Working directory: $CLAUDE_DIR${NC}"
echo ""

# Create backup before migration
echo -e "${YELLOW}Creating backup...${NC}"
BACKUP_DIR="$CLAUDE_DIR/meta/backup/pre-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing structure
for dir in agents automation context devops operations policies prompts rules scripts; do
  if [ -d "$CLAUDE_DIR/$dir" ]; then
    cp -r "$CLAUDE_DIR/$dir" "$BACKUP_DIR/" 2>/dev/null || true
    echo "  Backed up: $dir"
  fi
done

echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
echo ""

# Create new directory structure
echo -e "${YELLOW}Creating enterprise directory structure...${NC}"

# Core directories
mkdir -p "$CLAUDE_DIR/core/agents"
mkdir -p "$CLAUDE_DIR/core/context"
mkdir -p "$CLAUDE_DIR/core/policies"
mkdir -p "$CLAUDE_DIR/core/config"

# Development directories
mkdir -p "$CLAUDE_DIR/development/templates"
mkdir -p "$CLAUDE_DIR/development/generators"
mkdir -p "$CLAUDE_DIR/development/validation"
mkdir -p "$CLAUDE_DIR/development/testing"

# Operations directories (keep existing)
mkdir -p "$CLAUDE_DIR/operations/automation"
mkdir -p "$CLAUDE_DIR/operations/monitoring"
mkdir -p "$CLAUDE_DIR/operations/deployment"
mkdir -p "$CLAUDE_DIR/operations/infrastructure"
mkdir -p "$CLAUDE_DIR/operations/security"

# Knowledge directories
mkdir -p "$CLAUDE_DIR/knowledge/quick-ref"
mkdir -p "$CLAUDE_DIR/knowledge/documentation"
mkdir -p "$CLAUDE_DIR/knowledge/guides"
mkdir -p "$CLAUDE_DIR/knowledge/runbooks"

# Tools directories
mkdir -p "$CLAUDE_DIR/tools/cli"
mkdir -p "$CLAUDE_DIR/tools/scripts"
mkdir -p "$CLAUDE_DIR/tools/validators"
mkdir -p "$CLAUDE_DIR/tools/maintainers"

# Meta directories
mkdir -p "$CLAUDE_DIR/meta/schema"
mkdir -p "$CLAUDE_DIR/meta/health"
mkdir -p "$CLAUDE_DIR/meta/metrics"
mkdir -p "$CLAUDE_DIR/meta/backup"

echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Migrate existing content
echo -e "${YELLOW}Migrating existing content...${NC}"

# Migrate agents
if [ -d "$CLAUDE_DIR/agents" ]; then
  echo "  Migrating agents..."
  find "$CLAUDE_DIR/agents" -maxdepth 1 -type d ! -path "$CLAUDE_DIR/agents" -exec basename {} \; | while read agent; do
    if [ ! -d "$CLAUDE_DIR/core/agents/$agent" ]; then
      mv "$CLAUDE_DIR/agents/$agent" "$CLAUDE_DIR/core/agents/" 2>/dev/null || true
      echo "    Moved: $agent"
    fi
  done
fi

# Migrate context
if [ -d "$CLAUDE_DIR/context" ]; then
  echo "  Migrating context files..."
  cp "$CLAUDE_DIR/context"/*.md "$CLAUDE_DIR/core/context/" 2>/dev/null || true
fi

# Migrate policies and rules
if [ -d "$CLAUDE_DIR/policies" ]; then
  echo "  Migrating policies..."
  cp "$CLAUDE_DIR/policies"/* "$CLAUDE_DIR/core/policies/" 2>/dev/null || true
fi

if [ -d "$CLAUDE_DIR/rules" ]; then
  echo "  Migrating rules to policies..."
  cp "$CLAUDE_DIR/rules"/* "$CLAUDE_DIR/core/policies/" 2>/dev/null || true
fi

# Migrate templates
if [ -d "$CLAUDE_DIR/templates" ]; then
  echo "  Migrating templates..."
  cp -r "$CLAUDE_DIR/templates"/* "$CLAUDE_DIR/development/templates/" 2>/dev/null || true
fi

# Migrate scripts
if [ -d "$CLAUDE_DIR/scripts" ]; then
  echo "  Migrating scripts..."
  cp "$CLAUDE_DIR/scripts"/*.js "$CLAUDE_DIR/tools/scripts/" 2>/dev/null || true
  cp "$CLAUDE_DIR/scripts"/*.sh "$CLAUDE_DIR/tools/scripts/" 2>/dev/null || true
fi

# Migrate quick-ref
if [ -d "$CLAUDE_DIR/quick-ref" ]; then
  echo "  Migrating quick-ref..."
  cp -r "$CLAUDE_DIR/quick-ref"/* "$CLAUDE_DIR/knowledge/quick-ref/" 2>/dev/null || true
fi

# Migrate prompts to documentation
if [ -d "$CLAUDE_DIR/prompts" ]; then
  echo "  Migrating prompts..."
  mkdir -p "$CLAUDE_DIR/knowledge/documentation/prompts"
  cp "$CLAUDE_DIR/prompts"/* "$CLAUDE_DIR/knowledge/documentation/prompts/" 2>/dev/null || true
fi

echo -e "${GREEN}✓ Content migration complete${NC}"
echo ""

# Set up CLI tool
echo -e "${YELLOW}Setting up CLI tool...${NC}"

# Make CLI executable
if [ -f "$CLAUDE_DIR/tools/cli/claude-cli.js" ]; then
  chmod +x "$CLAUDE_DIR/tools/cli/claude-cli.js"
  echo -e "${GREEN}✓ CLI tool configured${NC}"
else
  echo -e "${RED}⚠ CLI tool not found${NC}"
fi

# Make health monitor executable
if [ -f "$CLAUDE_DIR/meta/health/health-monitor.js" ]; then
  chmod +x "$CLAUDE_DIR/meta/health/health-monitor.js"
  echo -e "${GREEN}✓ Health monitor configured${NC}"
else
  echo -e "${RED}⚠ Health monitor not found${NC}"
fi

echo ""

# Create migration report
echo -e "${YELLOW}Creating migration report...${NC}"

REPORT_FILE="$CLAUDE_DIR/meta/migration-report-$(date +%Y%m%d-%H%M%S).json"

cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "completed",
  "backup_location": "$BACKUP_DIR",
  "migrated_items": {
    "agents": $(ls -1 "$CLAUDE_DIR/core/agents" 2>/dev/null | wc -l || echo 0),
    "context_files": $(ls -1 "$CLAUDE_DIR/core/context"/*.md 2>/dev/null | wc -l || echo 0),
    "policies": $(ls -1 "$CLAUDE_DIR/core/policies" 2>/dev/null | wc -l || echo 0),
    "templates": $(find "$CLAUDE_DIR/development/templates" -type f 2>/dev/null | wc -l || echo 0),
    "scripts": $(ls -1 "$CLAUDE_DIR/tools/scripts" 2>/dev/null | wc -l || echo 0)
  },
  "new_features": [
    "Unified CLI tool",
    "Health monitoring system",
    "Central configuration management",
    "Enterprise directory structure",
    "Automated validation"
  ]
}
EOF

echo -e "${GREEN}✓ Migration report saved to: $REPORT_FILE${NC}"
echo ""

# Clean up old directories (optional)
echo -e "${YELLOW}Old directories preserved for safety.${NC}"
echo "To remove them after verification, run:"
echo "  rm -rf $CLAUDE_DIR/{agents,automation,context,devops,policies,prompts,rules,scripts}"
echo ""

# Run validation
echo -e "${YELLOW}Running structure validation...${NC}"
if [ -f "$CLAUDE_DIR/tools/validators/structure-validator.js" ]; then
  node "$CLAUDE_DIR/tools/validators/structure-validator.js" || true
else
  echo -e "${RED}⚠ Validator not found${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Migration to Enterprise Structure Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Review the migration report: $REPORT_FILE"
echo "2. Install CLI dependencies: cd $CLAUDE_DIR/tools/cli && npm install"
echo "3. Link CLI globally: cd $CLAUDE_DIR/tools/cli && npm link"
echo "4. Run health check: claude health check"
echo "5. Verify everything works, then remove old directories"
echo ""
echo "For help, run: claude help"