# Contributing to PMP Learning Management System

Thank you for your interest in contributing to the PMP Learning Management System! This document provides guidelines and instructions for contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Issue-Driven Development (IDD)](#issue-driven-development-idd)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate in your communication
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Git
- A GitHub account

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PMPLearningManagement.git
   cd PMPLearningManagement
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up IDD hooks:
   ```bash
   npm run idd:setup
   npm run idd:hooks:install
   ```

5. Create a `.env.local` file based on `.env.example`

6. Start the development server:
   ```bash
   npm run dev
   ```

## How to Contribute

### Types of Contributions

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or translate documentation
- **Testing**: Write tests or improve test coverage
- **Design**: Propose UI/UX improvements

### Finding Issues to Work On

1. Check the [Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues) page
2. Look for issues labeled:
   - `good first issue` - Great for newcomers
   - `help wanted` - We need help with these
   - `bug` - Bug fixes needed
   - `enhancement` - Feature improvements

## Development Workflow

### 1. Create or Select an Issue

Every contribution must be linked to an issue:

```bash
# If no existing issue, create one first on GitHub
# Reference the issue number in your branch and commits
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/issue-123-brief-description
# or
git checkout -b fix/issue-456-bug-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow our code style guidelines
- Add/update tests as needed
- Update documentation if required

### 4. Commit Your Changes

Follow IDD commit message format:

```bash
git commit -m "feat: add new visualization component #123"
git commit -m "fix: resolve memory leak in context manager #456"
git commit -m "docs: update API documentation #789"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/issue-123-brief-description
```

Then create a Pull Request on GitHub.

## Issue-Driven Development (IDD)

This project follows strict IDD practices with 99% compliance:

### Requirements

1. **Every commit must reference an issue**: Use `#123` format
2. **Every PR must link to an issue**: Use "Closes #123" in PR description
3. **Branch names must include issue number**: `feature/issue-123-description`

### IDD Commands

```bash
# Check IDD compliance
npm run idd:check

# View IDD status
npm run idd:status

# Generate IDD report
npm run idd:report
```

## Code Style Guidelines

### JavaScript/TypeScript

- Use functional components with hooks (React)
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for functions
- Maximum line length: 100 characters

### File Organization

```
src/
├── components/     # React components
├── services/       # Business logic
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions**: camelCase (e.g., `calculateProgress()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Files**: kebab-case for non-components (e.g., `auth-service.ts`)

## Testing Requirements

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage

# All tests
npm run test:all
```

### Test Guidelines

- Write tests for new features
- Maintain or improve test coverage (target: 80%+)
- Test both success and error cases
- Use descriptive test names

Example:
```javascript
describe('AuthService', () => {
  it('should successfully authenticate valid credentials', () => {
    // test implementation
  });
  
  it('should reject invalid credentials with appropriate error', () => {
    // test implementation
  });
});
```

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**:
   ```bash
   npm run lint:fix
   npm run format
   npm run test
   npm run build
   ```

3. **Check IDD compliance**:
   ```bash
   npm run idd:check
   ```

### PR Requirements

Your PR must:

1. **Reference an issue**: Use "Closes #123" in the description
2. **Pass all CI checks**: Tests, linting, build
3. **Include tests**: For new features or bug fixes
4. **Update documentation**: If behavior changes
5. **Follow commit conventions**: IDD-compliant messages
6. **Be focused**: One feature/fix per PR

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] IDD compliant
```

### Review Process

1. Maintainers will review your PR within 2-3 business days
2. Address any requested changes
3. Once approved, your PR will be merged

## Questions?

If you have questions:

1. Check existing [documentation](./docs)
2. Search [closed issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues?q=is%3Aissue+is%3Aclosed)
3. Create a new issue with the `question` label
4. Join discussions in existing issues

## Recognition

Contributors are recognized in:
- The project README
- Release notes
- Our contributors page

Thank you for contributing to PMP Learning Management System!

---

Last Updated: 2025-08-16