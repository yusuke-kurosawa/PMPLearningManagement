# Planning System Integration Guide

## Quick Integration (5 Minutes)

### Step 1: Add Routes to App.jsx

Open `/src/App.jsx` and add these imports:

```jsx
import {
  ReleasePlanningDashboard,
  IterationPlanningDashboard,
  UserStoryBacklog,
} from './components/planning';
```

Add routes inside your `<Routes>` component:

```jsx
{/* Planning System Routes */}
<Route path="/planning/releases" element={<ReleasePlanningDashboard />} />
<Route path="/planning/sprints" element={<IterationPlanningDashboard />} />
<Route path="/planning/backlog" element={<UserStoryBacklog />} />
```

### Step 2: Update Navigation

Open your navigation component (e.g., `/src/components/layout/Navigation.jsx`) and add:

```jsx
<NavLink
  to="/planning/releases"
  className="nav-link"
>
  Release Planning
</NavLink>

<NavLink
  to="/planning/sprints"
  className="nav-link"
>
  Sprint Planning
</NavLink>

<NavLink
  to="/planning/backlog"
  className="nav-link"
>
  Backlog
</NavLink>
```

### Step 3: Test

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/#/planning/releases`
3. Verify all three dashboards load correctly
4. Test switching between views
5. Check dark mode compatibility

## Full Integration Example

### Complete App.jsx with Planning Routes

```jsx
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Existing lazy-loaded components
const Home = lazy(() => import('./components/pages/Home'));
const PMBOKMatrix = lazy(() => import('./components/pages/PMBOKMatrix'));
// ... other imports

// Planning System Components (can be lazy loaded)
const ReleasePlanningDashboard = lazy(() =>
  import('./components/planning/ReleasePlanningDashboard')
);
const IterationPlanningDashboard = lazy(() =>
  import('./components/planning/IterationPlanningDashboard')
);
const UserStoryBacklog = lazy(() =>
  import('./components/planning/UserStoryBacklog')
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                {/* Existing routes */}
                <Route index element={<Home />} />
                <Route path="matrix" element={<PMBOKMatrix />} />
                {/* ... other routes */}

                {/* Planning System Routes */}
                <Route path="planning">
                  <Route path="releases" element={<ReleasePlanningDashboard />} />
                  <Route path="sprints" element={<IterationPlanningDashboard />} />
                  <Route path="backlog" element={<UserStoryBacklog />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
```

### Navigation with Dropdown

```jsx
// In Navigation.jsx
import { Calendar, Target, Layers } from 'lucide-react';

const PlanningDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-button"
      >
        <Calendar className="w-5 h-5" />
        Planning
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <NavLink
            to="/planning/releases"
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Calendar className="w-4 h-4" />
            Release Planning
          </NavLink>
          <NavLink
            to="/planning/sprints"
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Target className="w-4 h-4" />
            Sprint Planning
          </NavLink>
          <NavLink
            to="/planning/backlog"
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Layers className="w-4 h-4" />
            Backlog
          </NavLink>
        </div>
      )}
    </div>
  );
};
```

## Customization Options

### 1. Customize Colors

Edit color constants in each component:

```jsx
// In ReleasePlanningDashboard.tsx
const PRIORITY_COLORS = {
  'Critical': '#dc2626',  // Change to your brand color
  'High': '#ea580c',
  'Medium': '#ca8a04',
  'Low': '#16a34a',
};
```

### 2. Customize Data

Edit `/src/data/planningData.ts`:

```typescript
// Update team members
export const teamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Your Name',
    role: 'Your Role',
    capacity: 40,  // hours per sprint
    skills: ['React', 'TypeScript'],
  },
  // Add more team members
];

// Update releases
export const releases: Release[] = [
  {
    id: 'r1',
    name: 'Your Release Name',
    version: '1.0.0',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-04-30'),
    // ... other properties
  },
];
```

### 3. Add Custom Metrics

```jsx
// In ReleasePlanningDashboard.tsx
const customMetrics = useMemo(() => {
  // Your custom metric calculations
  const avgVelocity = sprints.reduce((acc, s) => acc + s.velocity, 0) / sprints.length;
  const predictedCompletion = totalPoints / avgVelocity;

  return {
    avgVelocity,
    predictedCompletion,
    // Add more custom metrics
  };
}, [sprints, totalPoints]);
```

## Advanced Integrations

### 1. Add Authentication Protection

```jsx
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route path="planning">
  <Route path="releases" element={
    <ProtectedRoute>
      <ReleasePlanningDashboard />
    </ProtectedRoute>
  } />
  {/* Same for other planning routes */}
</Route>
```

### 2. Add Analytics Tracking

```jsx
import { useEffect } from 'react';
import { trackPageView } from './services/analytics';

const ReleasePlanningDashboard = () => {
  useEffect(() => {
    trackPageView('Release Planning Dashboard');
  }, []);

  // Rest of component
};
```

### 3. Add Export Functionality

```jsx
import { exportToPDF, exportToCSV } from './services/export';

const handleExport = (format) => {
  const data = {
    releases,
    epics,
    userStories,
  };

  if (format === 'pdf') {
    exportToPDF(data, 'release-plan.pdf');
  } else if (format === 'csv') {
    exportToCSV(data, 'release-plan.csv');
  }
};

// In component UI
<button onClick={() => handleExport('pdf')}>Export PDF</button>
<button onClick={() => handleExport('csv')}>Export CSV</button>
```

### 4. Real-time Collaboration (Future)

```jsx
import { useWebSocket } from './hooks/useWebSocket';

const IterationPlanningDashboard = () => {
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      socket.on('story-updated', (story) => {
        // Update local state
        updateStory(story);
      });

      socket.on('sprint-changed', (sprint) => {
        // Update sprint data
        updateSprint(sprint);
      });
    }
  }, [socket, isConnected]);

  // Rest of component
};
```

## Mobile Optimization

### Add Responsive Breakpoints

```jsx
import { useIsMobile } from './hooks/useIsMobile';

const ReleasePlanningDashboard = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Adjust layout based on screen size */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-6`}>
        {/* Content */}
      </div>
    </div>
  );
};
```

### Mobile Navigation

```jsx
// Mobile bottom navigation
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t">
  <div className="flex justify-around p-2">
    <Link to="/planning/releases" className="flex flex-col items-center">
      <Calendar className="w-5 h-5" />
      <span className="text-xs">Releases</span>
    </Link>
    <Link to="/planning/sprints" className="flex flex-col items-center">
      <Target className="w-5 h-5" />
      <span className="text-xs">Sprints</span>
    </Link>
    <Link to="/planning/backlog" className="flex flex-col items-center">
      <Layers className="w-5 h-5" />
      <span className="text-xs">Backlog</span>
    </Link>
  </div>
</nav>
```

## Backend Integration (When Ready)

### 1. Setup tRPC Client

```typescript
// In lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/routers';

export const trpc = createTRPCReact<AppRouter>();
```

### 2. Replace Mock Data

```jsx
// Before (mock data)
import { releases } from '../../data/planningData';

// After (API data)
const { data: releases, isLoading } = trpc.releases.getAll.useQuery();

if (isLoading) return <LoadingSpinner />;
```

### 3. Add Mutations

```jsx
const updateStoryMutation = trpc.stories.update.useMutation();

const handleStoryUpdate = async (storyId, updates) => {
  try {
    await updateStoryMutation.mutateAsync({
      id: storyId,
      ...updates,
    });
    // Refetch or update cache
  } catch (error) {
    console.error('Failed to update story:', error);
  }
};
```

## Performance Optimization

### 1. Lazy Load Components

Already implemented in the example above using `React.lazy()`.

### 2. Memoize Expensive Calculations

Already implemented with `useMemo` in all components.

### 3. Virtualize Long Lists

```jsx
import { FixedSizeList } from 'react-window';

const VirtualizedStoryList = ({ stories }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={stories.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {renderStoryCard(stories[index])}
        </div>
      )}
    </FixedSizeList>
  );
};
```

## Troubleshooting

### Charts Not Rendering

**Problem**: Charts show as blank
**Solution**:
1. Check that Recharts is installed: `npm install recharts`
2. Verify ResponsiveContainer has proper height
3. Check data format matches expected structure

### Type Errors

**Problem**: TypeScript errors in planning components
**Solution**:
1. Run `npm run typecheck`
2. Ensure all imports use correct types
3. Check that `planning.ts` exports are correct

### Styling Issues

**Problem**: Components look unstyled or broken
**Solution**:
1. Verify Tailwind CSS is configured
2. Check that PostCSS is running
3. Ensure dark mode classes are working
4. Clear browser cache and rebuild

### Data Not Updating

**Problem**: Changes to planningData.ts don't reflect
**Solution**:
1. Restart dev server
2. Clear browser cache
3. Check for import errors in console
4. Verify file paths are correct

## Testing Integration

### 1. Manual Testing

```bash
# Start dev server
npm run dev

# Test routes
# Visit: http://localhost:5173/#/planning/releases
# Visit: http://localhost:5173/#/planning/sprints
# Visit: http://localhost:5173/#/planning/backlog
```

### 2. Automated Tests

```jsx
// In __tests__/planning/ReleasePlanningDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { ReleasePlanningDashboard } from '@/components/planning';

describe('ReleasePlanningDashboard', () => {
  it('renders release metrics', () => {
    render(<ReleasePlanningDashboard />);
    expect(screen.getByText(/Overall Progress/i)).toBeInTheDocument();
  });

  it('switches between views', () => {
    render(<ReleasePlanningDashboard />);
    const featuresTab = screen.getByText(/Features/i);
    fireEvent.click(featuresTab);
    expect(screen.getByText(/Feature Breakdown/i)).toBeInTheDocument();
  });
});
```

## Success Checklist

After integration, verify:

- [ ] All three dashboards are accessible via routes
- [ ] Navigation menu includes planning links
- [ ] Components render without errors
- [ ] All charts display correctly
- [ ] Dark mode works properly
- [ ] Mobile responsive layout works
- [ ] Filtering and sorting functions work
- [ ] Story selection in backlog works
- [ ] Planning poker estimation works
- [ ] All metrics calculate correctly
- [ ] Performance is acceptable (< 2s load)
- [ ] No console errors or warnings

## Next Steps After Integration

1. **Customize data** in `planningData.ts` for your actual roadmap
2. **Add more user stories** (expand from 8 to 80+)
3. **Implement drag-and-drop** for Kanban board
4. **Add export functionality** (PDF, CSV)
5. **Integrate with backend** when API is ready
6. **Add real-time collaboration** via WebSocket
7. **Implement automated forecasting** with ML
8. **Create custom reports** for stakeholders

## Support

If you encounter issues:
1. Check console for errors
2. Review type definitions in `planning.ts`
3. Verify data structure in `planningData.ts`
4. Check documentation in `/docs/planning/`
5. Open an issue on GitHub

---

**Integration Time**: ~10 minutes
**Difficulty**: Easy
**Prerequisites**: Basic React and routing knowledge
**Status**: Ready for immediate integration