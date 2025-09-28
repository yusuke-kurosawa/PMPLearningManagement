# Backlog Management System - Integration Example

## Complete Integration Guide

### 1. Add Routes to Your Application

```tsx
// src/App.tsx or main router file
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  ProductBacklogManager,
  SprintBacklogBoard,
  BacklogRefinementWorkshop,
  ProductOwnerDashboard,
} from './components/backlog';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Backlog Management Routes */}
          <Route path="/backlog" element={<ProductBacklogManager />} />
          <Route path="/sprint" element={<SprintBacklogBoard />} />
          <Route path="/refinement" element={<BacklogRefinementWorkshop />} />
          <Route path="/po-dashboard" element={<ProductOwnerDashboard />} />

          {/* Redirect /backlog as default */}
          <Route path="/" element={<Navigate to="/backlog" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
```

### 2. Add Navigation Menu

```tsx
// src/components/BacklogNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, Calendar, GitBranch, BarChart3 } from 'lucide-react';

export const BacklogNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/backlog', label: 'Product Backlog', icon: List },
    { path: '/sprint', label: 'Sprint Board', icon: Calendar },
    { path: '/refinement', label: 'Refinement', icon: GitBranch },
    { path: '/po-dashboard', label: 'PO Dashboard', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex space-x-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition-colors ${
                location.pathname === path
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
```

### 3. Complete App with Navigation

```tsx
// src/App.tsx - Complete example
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  ProductBacklogManager,
  SprintBacklogBoard,
  BacklogRefinementWorkshop,
  ProductOwnerDashboard,
} from './components/backlog';
import { BacklogNavigation } from './components/BacklogNavigation';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="text-3xl font-bold">PMP Learning Management</h1>
            <p className="text-blue-100">Backlog Management System</p>
          </div>
        </header>

        {/* Navigation */}
        <BacklogNavigation />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/backlog" element={<ProductBacklogManager />} />
            <Route path="/sprint" element={<SprintBacklogBoard />} />
            <Route path="/refinement" element={<BacklogRefinementWorkshop />} />
            <Route path="/po-dashboard" element={<ProductOwnerDashboard />} />
            <Route path="/" element={<Navigate to="/backlog" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
```

### 4. With Existing Navigation System

If you already have a navigation system, just add the routes:

```tsx
// In your existing router setup
import {
  ProductBacklogManager,
  SprintBacklogBoard,
  BacklogRefinementWorkshop,
  ProductOwnerDashboard,
} from './components/backlog';

// Add to your existing Routes
<Route path="/backlog" element={<ProductBacklogManager />} />
<Route path="/sprint" element={<SprintBacklogBoard />} />
<Route path="/refinement" element={<BacklogRefinementWorkshop />} />
<Route path="/po-dashboard" element={<ProductOwnerDashboard />} />
```

### 5. Add to Existing Menu/Sidebar

```tsx
// In your navigation component
const menuItems = [
  // ... existing items
  {
    section: 'Backlog Management',
    items: [
      { path: '/backlog', label: 'Product Backlog', icon: 'List' },
      { path: '/sprint', label: 'Sprint Board', icon: 'Calendar' },
      { path: '/refinement', label: 'Refinement', icon: 'GitBranch' },
      { path: '/po-dashboard', label: 'PO Dashboard', icon: 'BarChart3' },
    ],
  },
];
```

## Integration with Authentication

```tsx
// src/App.tsx with auth
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  ProductBacklogManager,
  SprintBacklogBoard,
  BacklogRefinementWorkshop,
  ProductOwnerDashboard,
} from './components/backlog';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public access */}
        <Route path="/backlog" element={<ProductBacklogManager />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/sprint"
          element={
            <ProtectedRoute>
              <SprintBacklogBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refinement"
          element={
            <ProtectedRoute roles={['developer', 'product-owner', 'scrum-master']}>
              <BacklogRefinementWorkshop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/po-dashboard"
          element={
            <ProtectedRoute roles={['product-owner', 'stakeholder']}>
              <ProductOwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
```

## Integration with Existing Layout

```tsx
// src/pages/BacklogPage.tsx
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ProductBacklogManager } from '../components/backlog';

export const BacklogPage: React.FC = () => {
  return (
    <AppLayout title="Product Backlog">
      <ProductBacklogManager />
    </AppLayout>
  );
};

// Then in your router
<Route path="/backlog" element={<BacklogPage />} />
```

## With State Management (Zustand)

```tsx
// src/stores/backlogStore.ts
import { create } from 'zustand';
import { UserStory, Sprint } from '../types/backlog';

interface BacklogStore {
  stories: UserStory[];
  currentSprint: Sprint | null;
  setStories: (stories: UserStory[]) => void;
  setCurrentSprint: (sprint: Sprint) => void;
}

export const useBacklogStore = create<BacklogStore>((set) => ({
  stories: [],
  currentSprint: null,
  setStories: (stories) => set({ stories }),
  setCurrentSprint: (sprint) => set({ currentSprint: sprint }),
}));

// Use in components
import { useBacklogStore } from '../stores/backlogStore';

function ProductBacklogManager() {
  const { stories, setStories } = useBacklogStore();
  // ... rest of component
}
```

## With React Query (API Integration)

```tsx
// src/hooks/useBacklogData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserStory } from '../types/backlog';

export const useBacklogData = () => {
  const queryClient = useQueryClient();

  // Fetch stories
  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const response = await fetch('/api/stories');
      return response.json() as Promise<UserStory[]>;
    },
  });

  // Update story
  const updateStory = useMutation({
    mutationFn: async (story: UserStory) => {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PUT',
        body: JSON.stringify(story),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  return { stories, isLoading, updateStory };
};

// Use in component
import { useBacklogData } from '../hooks/useBacklogData';

function ProductBacklogManager() {
  const { stories, isLoading, updateStory } = useBacklogData();

  if (isLoading) return <div>Loading...</div>;

  // ... rest of component
}
```

## Customization Examples

### Custom Theme Colors

```tsx
// Modify component to use custom colors
const getPriorityColor = (priority: Priority): string => {
  const colors = {
    Critical: 'bg-red-500 text-white',      // Your brand red
    High: 'bg-orange-500 text-white',       // Your brand orange
    Medium: 'bg-yellow-500 text-white',     // Your brand yellow
    Low: 'bg-green-500 text-white',         // Your brand green
  };
  return colors[priority];
};
```

### Custom Story Fields

```tsx
// Extend UserStory type
interface CustomUserStory extends UserStory {
  customerId?: string;
  contractValue?: number;
  deadline?: string;
}

// Use in component
const story: CustomUserStory = {
  ...baseStory,
  customerId: 'CUST-001',
  contractValue: 50000,
  deadline: '2025-12-31',
};
```

### Custom Metrics

```tsx
// Add custom metric calculation
const customMetric = useMemo(() => {
  return stories.reduce((sum, story) => {
    // Your custom calculation
    return sum + (story.businessValue * story.storyPoints || 0);
  }, 0);
}, [stories]);
```

## Testing Integration

```tsx
// tests/integration/BacklogSystem.test.tsx
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { ProductBacklogManager } from '../../components/backlog';

describe('Backlog Management System', () => {
  test('renders product backlog', () => {
    render(
      <HashRouter>
        <ProductBacklogManager />
      </HashRouter>
    );

    expect(screen.getByText('Product Backlog')).toBeInTheDocument();
  });
});
```

## Performance Optimization

```tsx
// Lazy load components
import { lazy, Suspense } from 'react';

const ProductBacklogManager = lazy(() =>
  import('./components/backlog').then((m) => ({ default: m.ProductBacklogManager }))
);
const SprintBacklogBoard = lazy(() =>
  import('./components/backlog').then((m) => ({ default: m.SprintBacklogBoard }))
);

// In Routes
<Route
  path="/backlog"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ProductBacklogManager />
    </Suspense>
  }
/>
```

## Deployment Checklist

- [ ] Verify all routes work with HashRouter
- [ ] Test drag-and-drop functionality
- [ ] Check responsive design on mobile
- [ ] Verify charts render correctly
- [ ] Test with real data (if available)
- [ ] Check performance with large datasets
- [ ] Verify authentication integration
- [ ] Test error states
- [ ] Validate accessibility
- [ ] Check browser compatibility

## Quick Start Commands

```bash
# Navigate to project
cd PMPLearningManagement

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Open browser and navigate to:
# http://localhost:5173/#/backlog
# http://localhost:5173/#/sprint
# http://localhost:5173/#/refinement
# http://localhost:5173/#/po-dashboard

# Build for production
npm run build

# Deploy
npm run deploy
```

## Troubleshooting

### Charts not rendering
```bash
# Verify recharts is installed
npm list recharts

# Reinstall if needed
npm install recharts@^2.10.3
```

### Routes not working
```tsx
// Make sure you're using HashRouter, not BrowserRouter
import { HashRouter } from 'react-router-dom';

// For GitHub Pages
<HashRouter>
  {/* routes */}
</HashRouter>
```

### TypeScript errors
```bash
# Rebuild type definitions
npm run typecheck

# Fix any type errors in components
```

## Support

For issues or questions:
1. Check the full documentation: `docs/backlog/backlog-management.md`
2. Review type definitions: `src/types/backlog.ts`
3. Examine mock data: `src/data/backlogData.ts`
4. See implementation summary: `docs/backlog/IMPLEMENTATION_SUMMARY.md`

---

**Ready to Use**: All components are production-ready and fully functional with mock data.
**Backend Optional**: Works perfectly as a static site; backend integration is optional for enhanced features.

**Happy Backlog Managing! 🚀**