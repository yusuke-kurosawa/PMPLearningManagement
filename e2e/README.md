# End-to-End Testing Directory

Playwright-based end-to-end testing suite for the PMP Learning Management application.

## Directory Structure

```
e2e/
├── fixtures/           # Test data and fixtures
├── tests/              # E2E test files
│   ├── accessibility.spec.js  # Accessibility testing
│   ├── home.spec.js           # Home page tests
│   └── navigation.spec.js     # Navigation tests
└── utils/              # Testing utilities and helpers
```

## Test Files

### accessibility.spec.js
- Tests WCAG compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

### home.spec.js
- Landing page functionality
- Core feature access
- Responsive design validation

### navigation.spec.js
- Menu navigation
- Route transitions
- Mobile navigation

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

## Test Configuration

E2E tests are configured via `config/build/playwright.config.js` and use:
- Chromium, Firefox, and WebKit browsers
- Mobile device emulation
- Accessibility testing with axe-core
- Screenshot and video capture on failures

## Best Practices

- Write tests from user perspective
- Use page object patterns for complex interactions
- Include accessibility checks in all test suites
- Test across multiple browsers and devices
- Maintain test data in fixtures directory