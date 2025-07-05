# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMPLearningManagement is an interactive web application for PMBOK (Project Management Body of Knowledge) 6th Edition learning. It provides visual tools to understand the 49 processes, their relationships, and ITTO (Inputs, Tools & Techniques, Outputs) framework.

### Key Features
- **PMBOK Matrix View**: Interactive table showing all 49 processes organized by 10 knowledge areas and 5 process groups
- **ITTO Network Diagram**: Force-directed graph visualization using D3.js to explore process relationships
- **Integrated View**: Split-screen interface combining both visualizations
- **Responsive Design**: Fully optimized for desktop and mobile devices
- **GitHub Pages Deployment**: Automatically deployed via GitHub Actions

## Technology Stack

- **Frontend Framework**: React 18.2 with React Router v6
- **Visualization**: D3.js v7 for network diagrams
- **Styling**: Tailwind CSS v3 with custom utilities
- **Build Tool**: Vite v5
- **Deployment**: GitHub Pages with HashRouter
- **Package Manager**: npm
- **Icons**: Lucide React

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 8+

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Environment
- Development server runs on http://localhost:3000
- Production URL: https://yusuke-kurosawa.github.io/PMPLearningManagement/

## Project Structure

```
PMPLearningManagement/
├── src/
│   ├── components/
│   │   ├── PMBOKMatrix.jsx         # Main matrix view component
│   │   ├── ITTOForceGraph.jsx      # D3.js network diagram
│   │   ├── ITTONetworkDiagram.jsx  # Alternative network view
│   │   ├── IntegratedView.jsx      # Split-screen container
│   │   ├── Navigation.jsx          # Top navigation bar
│   │   ├── Home.jsx                # Landing page
│   │   └── PageTransition.jsx      # Page animation wrapper
│   ├── hooks/
│   │   └── useDebounce.js          # Debounce hook for search
│   ├── utils/
│   │   └── performance.js          # Performance utilities
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles & Tailwind
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Dependencies & scripts
```

## Architecture Decisions

### Routing
- Uses **HashRouter** for GitHub Pages compatibility
- Routes:
  - `/` - Home page
  - `/matrix` - PMBOK Matrix view
  - `/network` - Force-directed network diagram
  - `/integrated` - Split-screen view

### State Management
- Local component state with React hooks
- No global state management needed currently
- Performance optimized with React.memo and useMemo

### Styling Approach
- Tailwind CSS for utility-first styling
- Custom CSS animations in index.css
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

### Performance Optimizations
- React.memo on all major components
- Throttled drag operations in IntegratedView
- Debounced search inputs
- Lazy loading with React.Suspense
- Virtual scrolling utilities (prepared for future use)

## Component Guidelines

### PMBOKMatrix Component
- Displays all 49 PMBOK processes
- Features: search, expand/collapse, process details modal
- Mobile: horizontal scroll, abbreviated text
- Performance: memoized filtering, loading states

### ITTOForceGraph Component
- D3.js force simulation for process relationships
- Node types: processes (circles), inputs (diamonds), tools (squares), outputs (triangles)
- Mobile: collapsible control panel, touch gestures
- Filters by process group and knowledge area

### IntegratedView Component
- Resizable split-screen layout
- Mobile: toggle between views
- Desktop: drag divider to resize
- Fullscreen mode for each panel

## Mobile Considerations

- Touch-friendly tap targets (minimum 44px)
- Collapsible navigation and panels
- Responsive text sizing
- Optimized force graph for touch devices
- View switching for integrated view on mobile

## Deployment

### GitHub Pages Setup
- Base path: `/PMPLearningManagement/`
- Build output: `dist/` directory
- Automatic deployment on push to main branch
- Manual deployment: `npm run deploy`

### GitHub Actions Workflow
- Triggers on push to main branch
- Builds and deploys to gh-pages branch
- Uses Node.js 18
- Caches npm dependencies

## Code Style Guidelines

- Use functional components with hooks
- Implement React.memo for performance-critical components
- Use semantic HTML elements
- Follow Tailwind CSS best practices
- Keep components focused and single-purpose
- Add loading states for better UX
- Implement proper error boundaries (future enhancement)

## Future Enhancements

1. **Data Management**
   - External data source for ITTO information
   - User preferences persistence
   - Export/import functionality

2. **Features**
   - Process dependencies visualization
   - Study mode with flashcards
   - Progress tracking
   - Multi-language support

3. **Technical**
   - Progressive Web App (PWA) support
   - Offline functionality
   - Advanced search with filters
   - Keyboard shortcuts

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js 18+ is installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for ES module syntax in config files

2. **GitHub Pages 404**
   - Wait 2-5 minutes for deployment propagation
   - Ensure GitHub Pages is enabled in repository settings
   - Check base path in vite.config.js

3. **D3.js Performance**
   - Limit number of visible nodes on mobile
   - Use throttling for drag operations
   - Consider WebGL renderer for large datasets

## Important Notes

- Always use HashRouter for GitHub Pages deployment
- Test mobile responsiveness before deploying
- Keep bundle size under control (current: ~85KB gzipped)
- Maintain accessibility standards (WCAG 2.1)
- Document any breaking changes in commits