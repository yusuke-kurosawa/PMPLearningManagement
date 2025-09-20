# Suggested Commands for PMP Learning Management

## Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Testing Commands
```bash
# Run unit tests
npm run test             # Interactive watch mode
npm run test:run         # Single run
npm run test:coverage    # With coverage report
npm run test:ui          # With UI

# Run E2E tests  
npm run test:e2e         # Basic E2E tests
npm run test:e2e:ui      # With Playwright UI
npm run test:e2e:headed  # Run in headed browser
npm run test:e2e:debug   # Debug mode
npm run test:e2e:auth    # Auth-specific tests
npm run test:e2e:learning # Learning module tests
npm run test:e2e:comprehensive # Full test suite

# Advanced testing
npm run test:mutation    # Mutation testing with Stryker
npm run test:advanced    # Mutation + coverage
npm run test:all         # All tests (unit + E2E)
npm run test:a11y        # Accessibility tests
```

## Code Quality Commands
```bash
# Linting
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting issues

# TypeScript type checking
npm run typecheck        # Check TypeScript types

# Formatting
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without changes

# PMP Terminology validation
npm run terminology:check     # Check PMP terminology usage
npm run terminology:validate  # Validate terminology database
npm run terminology:autofix   # Auto-fix terminology issues

# Header validation
npm run header:validate  # Validate file headers
npm run header:apply     # Apply file headers

# Security & Performance
npm run security:audit   # Security audit
npm run perf:check       # Check bundle size
```

## IDD (Issue-Driven Development) Commands
```bash
npm run idd:setup        # Setup IDD environment
npm run idd:hooks:install # Install Git hooks
npm run idd:check        # Check IDD compliance
npm run idd:status       # Display IDD status
npm run idd:report       # Generate IDD report
npm run idd:metrics      # Analyze IDD metrics
npm run idd:quality      # Quality check
```

## API Documentation Commands
```bash
npm run api-docs:build   # Build API documentation
npm run api-docs:validate # Validate API docs
npm run api-docs:serve   # Serve API docs locally
npm run api-docs:generate:typescript # Generate TypeScript SDK
```

## Utility Commands
```bash
# Clean
npm run clean            # Clean build artifacts
npm run clean:all        # Clean all including node_modules

# Documentation
npm run docs:consolidate # Consolidate documentation

# Quality & Reports
npm run quality:check    # Check content quality
npm run quality:dashboard # Generate quality dashboard
```

## Git Commands (Linux)
```bash
git status              # Check current branch status
git add .               # Stage all changes
git commit -m "type: message #issue" # Commit with IDD format
git push                # Push to remote
git pull                # Pull from remote
git checkout -b feature/branch-name # Create new branch
git log --oneline -10  # View recent commits
```

## System Commands (Linux)
```bash
ls -la                  # List files with details
cd <directory>          # Change directory
pwd                     # Print working directory
cat <file>              # Display file contents
grep -r "pattern" .     # Search in files
find . -name "*.ts"     # Find files by pattern
chmod +x <file>         # Make file executable
```

## Installation & Setup
```bash
# Initial setup
npm install             # Install dependencies
npm run idd:setup       # Setup IDD
npm run idd:hooks:install # Install Git hooks
playwright install      # Install Playwright browsers
```

## Important Notes
- Always run `npm run lint:fix` and `npm run format` before committing
- Include issue numbers in commit messages (e.g., `feat: add feature #123`)
- Run tests before pushing: `npm run test:run`
- Deploy only from main branch: `npm run deploy`