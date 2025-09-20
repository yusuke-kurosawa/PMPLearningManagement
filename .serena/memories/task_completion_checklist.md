# Task Completion Checklist

When completing any development task in the PMP Learning Management project, follow these steps:

## 1. Code Quality Checks

### Linting & Formatting
```bash
# Fix any linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Verify no remaining issues
npm run lint
```

### TypeScript Validation
```bash
# Check for type errors
npm run typecheck
```

## 2. Testing

### Run Relevant Tests
```bash
# Run unit tests
npm run test:run

# If UI changes, run E2E tests
npm run test:e2e

# For accessibility changes
npm run test:a11y
```

### Coverage Check (for significant changes)
```bash
npm run test:coverage
```

## 3. PMP Terminology Validation

For content-related changes:
```bash
# Check terminology usage
npm run terminology:check

# Auto-fix if needed
npm run terminology:autofix
```

## 4. Build Verification

```bash
# Ensure build succeeds
npm run build

# Check bundle size hasn't increased significantly
npm run perf:check
```

## 5. Git Commit

### IDD Compliance Check
```bash
# Verify IDD compliance before committing
npm run idd:check
```

### Commit with Issue Reference
```bash
# Stage changes
git add .

# Commit with proper format
git commit -m "type: description #issue-number"
```

Examples:
- `feat: add new visualization component #123`
- `fix: resolve navigation bug #456`
- `docs: update API documentation #789`

## 6. Pre-Push Verification

Before pushing to remote:
```bash
# Run comprehensive tests
npm run test:all

# Security audit
npm run security:audit
```

## 7. Documentation Updates

If the changes affect:
- **API**: Update API documentation
- **Components**: Update component documentation
- **Features**: Update CLAUDE.md if needed
- **Configuration**: Update relevant config docs

## 8. PR Creation

When creating a Pull Request:
- Reference the issue number
- Include test results
- Add screenshots for UI changes
- List breaking changes if any
- Request code review

## Critical Requirements

### MUST DO:
- ✅ Run `npm run lint:fix` and `npm run format`
- ✅ Include issue number in commit message
- ✅ Ensure all tests pass
- ✅ Verify TypeScript compilation

### SHOULD DO:
- 📋 Update documentation
- 🧪 Add tests for new features
- 📊 Check bundle size impact
- 🔒 Run security audit

### AVOID:
- ❌ Committing without issue reference
- ❌ Pushing failing tests
- ❌ Leaving console.log statements
- ❌ Committing sensitive information

## Quick Verification Script

For a complete check before committing:
```bash
# All-in-one verification
npm run lint:fix && \
npm run format && \
npm run typecheck && \
npm run test:run && \
npm run build && \
npm run idd:check
```

## Notes
- The project uses IDD (Issue-Driven Development) - all commits must reference an issue
- Git hooks are installed to enforce these checks automatically
- If a check fails, fix the issue before proceeding
- For urgent hotfixes, ensure at minimum that linting and tests pass