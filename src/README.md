# Source Code Directory Structure

This directory contains the main React application source code organized by domain and functionality.

## Directory Structure

```
src/
├── components/          # React components organized by domain
│   ├── collaboration/   # Team collaboration features
│   ├── layout/         # Layout and navigation components  
│   ├── learning/       # Learning and assessment features
│   ├── pages/          # Main page components
│   ├── shared/         # Reusable shared components
│   ├── visualizations/ # Data visualization components
│   └── __tests__/      # Component unit tests
├── contexts/           # React contexts for state management
├── data/               # Data schemas, fixtures, and mocks
│   ├── fixtures/       # Static data for the application
│   ├── mock/           # Mock data for testing
│   └── schemas/        # Data structure definitions
├── hooks/              # Custom React hooks
├── services/           # Business logic and API services
├── styles/             # CSS and styling files
│   ├── components/     # Component-specific styles
│   ├── themes/         # Theme configurations
│   └── utilities/      # Utility CSS classes
├── test/               # Test utilities and configuration
└── utils/              # General utility functions
```

## Import Guidelines

- Use barrel exports (index.js files) to simplify imports
- Import from the top-level component directories when possible
- Example: `import { Navigation, PageTransition } from 'components/layout'`

## Component Organization

Components are organized by functional domain:

- **layout**: Navigation, page transitions, layout components
- **pages**: Full page components (Home, PMBOKMatrix, etc.)
- **visualizations**: D3.js charts and data visualizations
- **learning**: Educational components (flashcards, exams, progress)
- **collaboration**: Team features (discussion, notes, groups)
- **shared**: Reusable components used across domains