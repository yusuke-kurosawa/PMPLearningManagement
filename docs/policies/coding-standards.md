# 📝 Coding Standards Policy

## Document Information
- **Version**: 1.0.0
- **Last Updated**: 2025-08-15
- **Status**: Active
- **Compliance Level**: 🟡 Important (Mandatory for Production)
- **Owner**: DevOps Team
- **Review Cycle**: Quarterly

## 1. Purpose and Scope

This document establishes coding standards for the PMPLearningManagement project to ensure:
- Code consistency and maintainability
- Team productivity and collaboration
- Security and performance optimization
- Automated quality enforcement

## 2. General Principles

### 2.1 Core Values
- **Readability**: Code is written for humans first, machines second
- **Simplicity**: Favor simple solutions over complex ones
- **Consistency**: Follow established patterns throughout the codebase
- **Testability**: Write code that is easy to test
- **Performance**: Consider performance implications in critical paths

## 3. JavaScript/TypeScript Standards

### 3.1 Language Features
```javascript
// ✅ GOOD: Use modern ES6+ features
const processData = (items) => {
  return items
    .filter(item => item.isActive)
    .map(({ id, name }) => ({ id, name }));
};

// ❌ BAD: Avoid outdated patterns
var processData = function(items) {
  var result = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].isActive) {
      result.push(items[i]);
    }
  }
  return result;
};
```

### 3.2 Naming Conventions
```javascript
// Components: PascalCase
const UserProfile = () => { };

// Functions/Variables: camelCase
const calculateTotal = (items) => { };
const userAge = 25;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Private methods: underscore prefix
const _validateInput = (input) => { };

// File names
// Components: UserProfile.jsx, UserProfile.tsx
// Utilities: dateHelpers.js, apiClient.ts
// Tests: UserProfile.test.jsx, dateHelpers.test.js
```

### 3.3 Function Standards
```javascript
// ✅ GOOD: Single responsibility, clear naming
const calculateDiscount = (price, discountPercentage) => {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Invalid discount percentage');
  }
  return price * (1 - discountPercentage / 100);
};

// ✅ GOOD: Use default parameters
const fetchData = async (url, options = {}) => {
  const response = await fetch(url, options);
  return response.json();
};

// ✅ GOOD: Early returns for clarity
const validateUser = (user) => {
  if (!user) return false;
  if (!user.email) return false;
  if (!user.id) return false;
  return true;
};
```

### 3.4 Async/Await Pattern
```javascript
// ✅ GOOD: Use async/await for asynchronous code
const fetchUserData = async (userId) => {
  try {
    const user = await userService.getUser(userId);
    const permissions = await permissionService.getUserPermissions(userId);
    return { user, permissions };
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new UserDataError('Unable to fetch user data', { cause: error });
  }
};

// ❌ BAD: Avoid callback hell and promise chains
getUserData(userId, (err, user) => {
  if (err) {
    handleError(err);
  } else {
    getPermissions(user.id, (err, permissions) => {
      // Nested callbacks...
    });
  }
});
```

## 4. React Patterns

### 4.1 Component Structure
```jsx
// ✅ GOOD: Functional component with hooks
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/useAuth';
import styles from './UserProfile.module.css';

const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getUser(userId);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fullName = useMemo(() => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <EmptyState message="User not found" />;

  return (
    <div className={styles.container}>
      <h2>{fullName}</h2>
      {/* Component content */}
    </div>
  );
};

UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func
};

export default UserProfile;
```

### 4.2 Custom Hooks
```javascript
// ✅ GOOD: Custom hook with clear purpose
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
};
```

### 4.3 Performance Optimization
```jsx
// ✅ GOOD: Proper memoization
const ExpensiveComponent = React.memo(({ data, onSelect }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveComputation(item)
    }));
  }, [data]);

  const handleClick = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} {...item} onClick={handleClick} />
      ))}
    </div>
  );
});

// ✅ GOOD: Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyComponent />
  </Suspense>
);
```

## 5. Testing Standards

### 5.1 Test Structure
```javascript
// ✅ GOOD: Descriptive test structure
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user data when valid ID is provided', async () => {
      const userId = '123';
      const expectedUser = { id: userId, name: 'John Doe' };
      
      mockApi.get.mockResolvedValueOnce({ data: expectedUser });
      
      const result = await userService.getUser(userId);
      
      expect(result).toEqual(expectedUser);
      expect(mockApi.get).toHaveBeenCalledWith(`/users/${userId}`);
    });

    it('should throw error when user is not found', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('User not found'));
      
      await expect(userService.getUser('invalid')).rejects.toThrow('User not found');
    });
  });
});
```

### 5.2 React Component Testing
```jsx
// ✅ GOOD: Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      });
    });
  });
});
```

## 6. Code Quality Metrics

### 6.1 Required Thresholds
| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Test Coverage | ≥ 80% | CI/CD Pipeline |
| Cyclomatic Complexity | ≤ 10 | ESLint |
| Function Length | ≤ 50 lines | ESLint |
| File Length | ≤ 300 lines | ESLint |
| Duplication | ≤ 3% | SonarQube |
| Technical Debt | ≤ 5 days | SonarQube |

### 6.2 Performance Benchmarks
```javascript
// Performance budget configuration
export const performanceBudget = {
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 95,
    seo: 90
  },
  bundleSize: {
    main: '200kb',
    vendor: '300kb',
    total: '500kb'
  },
  metrics: {
    fcp: 1500,  // First Contentful Paint
    lcp: 2500,  // Largest Contentful Paint
    tti: 3500,  // Time to Interactive
    cls: 0.1    // Cumulative Layout Shift
  }
};
```

## 7. Documentation Standards

### 7.1 JSDoc Comments
```javascript
/**
 * Calculates the compound interest on an investment
 * @param {number} principal - Initial investment amount
 * @param {number} rate - Annual interest rate (as decimal)
 * @param {number} time - Investment period in years
 * @param {number} [frequency=1] - Compounding frequency per year
 * @returns {number} Final amount after compound interest
 * @throws {Error} If any parameter is negative
 * @example
 * // Returns 1102.50 for $1000 at 10% for 1 year, compounded annually
 * calculateCompoundInterest(1000, 0.10, 1);
 */
const calculateCompoundInterest = (principal, rate, time, frequency = 1) => {
  if (principal < 0 || rate < 0 || time < 0) {
    throw new Error('Parameters must be non-negative');
  }
  return principal * Math.pow(1 + rate / frequency, frequency * time);
};
```

### 7.2 Component Documentation
```jsx
/**
 * UserProfile Component
 * 
 * Displays comprehensive user profile information with edit capabilities.
 * Implements lazy loading for performance optimization.
 * 
 * @component
 * @example
 * <UserProfile 
 *   userId="123"
 *   onUpdate={(data) => console.log('Updated:', data)}
 *   editable={true}
 * />
 */
```

## 8. Security Standards

### 8.1 Input Validation
```javascript
// ✅ GOOD: Always validate and sanitize inputs
import DOMPurify from 'dompurify';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  name: z.string().min(1).max(100)
});

const validateAndSanitize = (input) => {
  // Validate structure
  const validated = userSchema.parse(input);
  
  // Sanitize strings
  return {
    ...validated,
    name: DOMPurify.sanitize(validated.name)
  };
};
```

### 8.2 Secure Coding Practices
```javascript
// ✅ GOOD: Use environment variables for sensitive data
const API_KEY = process.env.REACT_APP_API_KEY;

// ✅ GOOD: Implement rate limiting
const rateLimiter = new Map();
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userLimits = rateLimiter.get(userId) || [];
  const recentRequests = userLimits.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 100) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.set(userId, [...recentRequests, now]);
};

// ❌ BAD: Never store sensitive data in code
const API_KEY = 'sk-1234567890abcdef'; // NEVER DO THIS
```

## 9. Enforcement Mechanisms

### 9.1 Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint:staged && npm run test:staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### 9.2 ESLint Configuration
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended'
  ],
  rules: {
    'complexity': ['error', 10],
    'max-lines': ['error', 300],
    'max-lines-per-function': ['error', 50],
    'max-depth': ['error', 4],
    'max-params': ['error', 4],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'error',
    'react/prop-types': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

### 9.3 CI/CD Quality Gates
```yaml
# GitHub Actions quality check
quality-gates:
  - test-coverage: 80%
  - code-smells: 0
  - duplications: < 3%
  - security-hotspots: 0
  - complexity: < 10
  - maintainability-rating: A
```

## 10. Exceptions and Waivers

### 10.1 Exception Process
1. Document the reason for exception in code comments
2. Create an issue for tracking
3. Get approval from tech lead
4. Add to technical debt backlog

### 10.2 Acceptable Exceptions
- Third-party library integrations
- Performance-critical sections (with benchmarks)
- Legacy code under active refactoring
- Prototypes and POCs (marked clearly)

## 11. Code Review Checklist

### Pre-Review Checklist
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Test coverage ≥ 80%
- [ ] No security vulnerabilities (npm audit)
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Performance impact considered

### Review Focus Areas
- [ ] Business logic correctness
- [ ] Code readability and maintainability
- [ ] Security considerations
- [ ] Performance implications
- [ ] Test quality and coverage
- [ ] Documentation completeness
- [ ] Adherence to patterns

## 12. Continuous Improvement

### 12.1 Metrics Tracking
```bash
# Generate code quality report
npm run quality:report

# View trend analysis
npm run quality:trends

# Identify technical debt
npm run debt:analyze
```

### 12.2 Regular Reviews
- Monthly: Team retrospective on coding standards
- Quarterly: Standards revision and update
- Annually: Major version update and training

## 13. Training and Resources

### 13.1 Required Reading
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [JavaScript: The Good Parts](https://www.oreilly.com/library/view/javascript-the-good/9780596517748/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### 13.2 Internal Resources
- `/docs/examples/` - Code examples
- `/scripts/quality/` - Quality check scripts
- `/.github/workflows/` - CI/CD configurations

## 14. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-08-15 | Initial version | DevOps Team |

---

**Approval**: DevOps Team Lead  
**Effective Date**: 2025-08-15  
**Next Review**: 2025-11-15