# Project Structure

## Root Directory Structure
```
PMPLearningManagement/
├── src/                    # Source code
├── public/                 # Static assets
├── docs/                   # Project documentation
├── scripts/                # Automation scripts
├── e2e/                    # End-to-end tests
├── backend/                # Backend code (in development)
├── prisma/                 # Database schema (prepared)
├── supabase/              # Supabase configuration
├── tests/                  # Additional test files
├── .github/               # GitHub Actions workflows
├── .claude/               # Claude AI context management
├── .husky/                # Git hooks
├── .serena/               # Serena MCP configuration
└── config files...        # Various configuration files
```

## Source Code Structure (`/src`)

### Components (`/src/components/`)
Organized by feature domain:
- `auth/` - Authentication components (Login, Register, etc.)
- `coaching/` - AI coaching features
- `collaboration/` - Collaboration tools (StudyGroups, SharedNotes, etc.)
- `layout/` - Layout components (AppLayout, Navigation, Footer)
- `learning/` - Learning features (MockExam, FlashCards, etc.)
- `mentorship/` - Mentorship features
- `mobile/` - Mobile-specific components
- `pages/` - Page-level components
- `shared/` - Shared/common components
- `simulator/` - Project simulator
- `visualizations/` - Data visualization components (D3-based)
- `ui/` - Base UI components (Radix UI wrappers)
- `experiments/` - Experimental features
- `analytics/` - Analytics components
- `ai/` - AI-related components
- `terminology/` - PMP terminology components
- `offline/` - Offline mode components

### Services (`/src/services/`)
Business logic and API services:
- `authService.ts` - Authentication logic
- `progressService.ts` - Learning progress tracking
- `contextManager.js` - Context management
- `offlineManager.js` - Offline functionality
- AI/ML services in subdirectories
- Various other service modules

### Contexts (`/src/contexts/`)
React Context providers:
- `AuthContext.tsx` - Authentication state
- `ThemeContext.tsx` - Theme management
- `OfflineContext.tsx` - Offline state
- `ContextManagerContext.jsx` - Memory management

### Hooks (`/src/hooks/`)
Custom React hooks:
- `useAuth.ts` - Authentication hook
- `useDebounce.ts` - Debounce utility
- `useOffline.ts` - Offline detection
- `useProgress.ts` - Progress tracking
- Various other utility hooks

### Data (`/src/data/`)
Static data and schemas:
- `pmbok/` - PMBOK-related data
- `schemas/` - Data type definitions
- `terminology/` - PMP terminology database
- Glossaries and reference data

### API (`/src/api/`)
API integration code:
- API clients
- Type definitions
- SDK configurations

### Utils (`/src/utils/`)
Utility functions:
- Performance monitoring
- Helper functions
- Common utilities

### Types (`/src/types/`)
TypeScript type definitions

### Stores (`/src/stores/`)
Zustand state stores

### Styles (`/src/styles/`)
Global styles and CSS modules

## Entry Points
- `/src/main.tsx` - Application entry point
- `/src/App.tsx` - Main application component
- `/index.html` - HTML template

## Key Configuration Files
- `vite.config.mjs` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Prettier formatting
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration

## Documentation Structure (`/docs`)
- Development guides
- API documentation
- Architecture documentation
- IDD (Issue-Driven Development) documentation

## GitHub Actions (`/.github`)
- `workflows/` - CI/CD pipelines
- `ISSUE_TEMPLATE/` - Issue templates
- `hooks/` - Git hooks

## Claude Context Management (`/.claude`)
- `context/` - Project context files
- `agents/` - Agent definitions
- `prompts/` - Prompt templates
- `quick-ref/` - Quick references
- `scripts/` - Automation scripts

## Important Files to Know
- `CLAUDE.md` - AI assistant instructions
- `README.md` - Project overview
- `package.json` - All available scripts
- `.env.example` - Environment variables template
- Development roadmaps and reports in root

## File Naming Conventions
- React components: PascalCase (e.g., `UserProfile.tsx`)
- Services: camelCase with suffix (e.g., `authService.ts`)
- Utils: camelCase or kebab-case
- Config files: lowercase with dots
- Test files: `*.test.ts` or `*.spec.ts`