# PMPLearningManagement

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml)
[![PR Validation](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/pr-validation.yml)
[![Performance Monitoring](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/performance-monitoring.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/performance-monitoring.yml)
[![Security Scan](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/security-scan.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/security-scan.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PMBOK Learning Management System - Interactive Web Application for Project Management Education

## 🌐 Live Demo

[View Application](https://yusuke-kurosawa.github.io/PMPLearningManagement/)

## 📋 Overview

An interactive web application for learning PMBOK (Project Management Body of Knowledge) 6th Edition. This tool provides visual representations of all 49 processes, their relationships, and the ITTO (Inputs, Tools & Techniques, Outputs) framework.

## ✨ Features

- **PMBOK Matrix View**: Interactive table displaying all 49 processes organized by 10 knowledge areas and 5 process groups
- **ITTO Network Diagram**: Force-directed graph visualization to explore process relationships
- **Integrated View**: Split-screen interface combining both visualizations
- **Responsive Design**: Optimized for desktop and mobile devices
- **Search & Filter**: Quickly find processes and filter by knowledge area or process group

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ Technology Stack

### Frontend
- React 18.2
- React Router v6
- D3.js v7 (Data visualizations)
- Tailwind CSS v3 (Styling)
- Vite v5 (Build tool)
- TypeScript (Type safety)

### Development & Testing
- Vitest (Unit testing)
- Playwright (E2E testing)
- ESLint + Prettier (Code quality)
- Husky (Git hooks)
- Jest-axe (Accessibility testing)

### CI/CD & Deployment
- GitHub Actions (CI/CD)
- GitHub Pages (Hosting)
- Lighthouse CI (Performance monitoring)
- Bundle size monitoring

## 📱 Mobile Support

The application is fully responsive with:
- Touch-friendly interfaces
- Collapsible navigation
- Optimized visualizations for small screens
- Mobile-specific view switching

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run typecheck       # Check TypeScript types

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run E2E tests
npm run test:a11y       # Run accessibility tests

# Deployment
npm run deploy          # Deploy to GitHub Pages
```

### CI/CD Pipeline

Our automated pipeline includes:

1. **Code Quality Checks**
   - ESLint for code quality
   - TypeScript compilation
   - Prettier formatting verification

2. **Security Audit**
   - npm audit for vulnerabilities
   - Dependency security checks

3. **Testing**
   - Unit tests with Vitest
   - E2E tests with Playwright
   - Accessibility tests with axe
   - Performance tests with Lighthouse

4. **Build & Deploy**
   - Production build optimization
   - Bundle size analysis
   - Automated GitHub Pages deployment

### Branch Protection

- Main branch requires PR reviews
- All status checks must pass
- No direct pushes to main branch
- Automatic deployments on main branch merge

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Ensure accessibility compliance
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Based on PMBOK® Guide 6th Edition by PMI
- Icons by Lucide React
- Visualization powered by D3.js