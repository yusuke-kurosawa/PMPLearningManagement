# Release and Iteration Planning System

## Quick Start

### Installation
All dependencies are already installed. The planning system uses:
- React 18.2
- TypeScript 5.3
- Recharts 2.10 (for visualizations)
- Tailwind CSS 3 (for styling)
- Lucide React (for icons)

### Usage

```jsx
// Import individual components
import { ReleasePlanningDashboard } from '@/components/planning/ReleasePlanningDashboard';
import { IterationPlanningDashboard } from '@/components/planning/IterationPlanningDashboard';
import { UserStoryBacklog } from '@/components/planning/UserStoryBacklog';

// Or import all at once
import {
  ReleasePlanningDashboard,
  IterationPlanningDashboard,
  UserStoryBacklog,
} from '@/components/planning';
```

### Adding Routes

Add these routes to your `App.jsx`:

```jsx
import {
  ReleasePlanningDashboard,
  IterationPlanningDashboard,
  UserStoryBacklog,
} from './components/planning';

// In your Routes component
<Route path="/planning/releases" element={<ReleasePlanningDashboard />} />
<Route path="/planning/sprints" element={<IterationPlanningDashboard />} />
<Route path="/planning/backlog" element={<UserStoryBacklog />} />
```

## Components Overview

### 1. Release Planning Dashboard
**Route**: `/planning/releases`

Strategic release management with:
- 4 releases over 12 months (Q1-Q4 2025)
- Timeline visualization with Gantt charts
- Feature breakdown by category
- Risk assessment and mitigation
- Burnup charts for progress tracking
- Health status indicators

**Use Cases**:
- Executive stakeholder presentations
- Quarterly planning sessions
- Feature roadmap communication
- Risk review meetings

### 2. Iteration Planning Dashboard
**Route**: `/planning/sprints`

Tactical sprint management with:
- 2-week sprint cycles
- Kanban board (4 columns)
- Velocity tracking and forecasting
- Team capacity planning
- Daily standup tracker
- Sprint burndown charts
- Performance metrics (radar chart)

**Use Cases**:
- Sprint planning meetings
- Daily standups
- Sprint reviews and retrospectives
- Velocity analysis

### 3. User Story Backlog
**Route**: `/planning/backlog`

Comprehensive backlog management with:
- Four views: List, Priority Matrix, INVEST Analysis, Planning Poker
- Advanced filtering and sorting
- Value vs Effort scatter plot
- INVEST criteria scoring
- Planning poker estimation tool

**Use Cases**:
- Backlog refinement sessions
- Story estimation (planning poker)
- Priority discussions
- Sprint planning preparation

## Data Structure

### Planning Data Location
- **Types**: `/src/types/planning.ts`
- **Mock Data**: `/src/data/planningData.ts`

### Key Data Files

**planningData.ts** contains:
- `releases`: 4 releases (R1-R4)
- `epics`: 11 epics across all releases
- `userStories`: 8 sample stories (expandable to 80+)
- `sprints`: 6 sprints for R1
- `teamMembers`: 5 team members with capacities
- `velocityHistory`: Historical velocity data
- `backlogItems`: Prioritization queue

### Extending Data

To add more user stories:

```typescript
// In planningData.ts
export const userStories: UserStory[] = [
  // Existing stories...
  {
    id: 'us9',
    epicId: 'e3',
    title: 'New Story Title',
    description: 'Story description',
    asA: 'user',
    iWant: 'feature',
    soThat: 'benefit',
    acceptanceCriteria: [
      { id: 'ac9-1', description: 'Criterion 1', isMet: false },
    ],
    storyPoints: 5,
    priority: 'High',
    status: 'Not Started',
    releaseId: 'r1',
    tasks: [],
    dependencies: [],
    createdDate: new Date('2025-02-15'),
    tags: ['backend', 'feature'],
  },
];
```

## Features by Component

### Release Planning Dashboard

#### Views
1. **Timeline View**
   - Bar chart comparing work progress vs time progress
   - Release burnup chart
   - Interactive data exploration

2. **Features View**
   - Pie chart of feature categories
   - Detailed feature cards with:
     - Priority badges
     - Category tags
     - Effort estimation
     - Value scoring
     - Dependency indicators

3. **Risks View**
   - Risk cards with color-coded severity
   - Probability and impact matrix
   - Mitigation strategies
   - Owner assignments

4. **Metrics View**
   - Effort distribution by category
   - Release goals checklist
   - Progress indicators

#### Metrics Displayed
- Overall progress percentage
- Feature completion (X/Y completed)
- Sprint completion rate
- Average velocity
- Active risks count
- Mitigated risks ratio

### Iteration Planning Dashboard

#### Views
1. **Sprint Board**
   - Kanban columns: Not Started, In Progress, Completed, Blocked
   - Story cards with:
     - ID and title
     - Story points
     - Assignee
     - Status indicator
     - Blocker alerts

2. **Velocity View**
   - Line chart: Planned vs Completed velocity
   - Area chart: Sprint burndown (Ideal vs Actual)
   - Historical trend analysis

3. **Capacity View**
   - Bar chart: Team capacity allocation
   - Individual workload distribution
   - Committed vs available hours
   - Radar chart: Team performance metrics

4. **Daily Standup**
   - Team member cards
   - Currently working on
   - Progress summary
   - Blocker identification

#### Metrics Displayed
- Story completion percentage
- Velocity (completed points)
- Capacity utilization
- Blocked stories count
- Days remaining
- Velocity trend (above/on-track/below)

### User Story Backlog

#### Views
1. **List View**
   - Filterable story cards
   - Detailed sidebar for selected story
   - Quick access to all story details

2. **Priority Matrix**
   - Scatter plot: Value vs Effort
   - Four quadrants:
     - Quick Wins (prioritize)
     - Major Projects (plan carefully)
     - Fill-Ins (use for capacity)
     - Time Sinks (avoid)
   - Interactive tooltips

3. **INVEST Analysis**
   - Score each story on 6 criteria
   - Progress bars showing readiness
   - Color-coded scores:
     - Green: 80-100% (Ready)
     - Yellow: 60-79% (Needs Work)
     - Orange: 0-59% (Not Ready)

4. **Planning Poker**
   - Story details view
   - Fibonacci estimation cards (1, 2, 3, 5, 8, 13, 21)
   - Unestimated stories queue
   - Estimation confirmation

#### Metrics Displayed
- Total stories count
- Total story points
- Average story points
- Not started count
- Sprint-ready stories count

## Customization

### Color Schemes

```typescript
// Priority Colors
const PRIORITY_COLORS = {
  'Critical': '#ef4444',  // Red
  'High': '#f97316',      // Orange
  'Medium': '#eab308',    // Yellow
  'Low': '#22c55e',       // Green
};

// Status Colors
const STATUS_COLORS = {
  'Not Started': '#94a3b8',  // Gray
  'In Progress': '#3b82f6',  // Blue
  'Completed': '#10b981',    // Green
  'Blocked': '#ef4444',      // Red
  'On Hold': '#f59e0b',      // Amber
};
```

### Story Point Sizes

Fibonacci sequence: `[1, 2, 3, 5, 8, 13, 21]`

Guidance:
- 1-2: Simple changes
- 3-5: Standard features
- 8-13: Complex features
- 21+: Should be split into smaller stories

### Team Capacity

Standard capacity calculation:
- 5 team members
- 8 hours per day
- 10 working days per sprint
- 80% productive time (accounting for meetings, support)

Total capacity: `5 × 8 × 10 × 0.8 = 320 hours` or `~80 story points` (at 4 hours/point)

## Best Practices

### Release Planning
1. Plan 3-6 months ahead
2. Keep releases to 2-4 month cycles
3. Limit features per release to 10-15
4. Maintain 20% buffer for emergencies
5. Review and adjust quarterly

### Sprint Planning
1. Use historical velocity for commitment
2. Don't overcommit (aim for 80-90% capacity)
3. Include time for bugs, tech debt, and support
4. Keep sprint goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
5. Protect the sprint from scope creep

### Backlog Management
1. Groom weekly (1-2 hours)
2. Keep top 2 sprints refined and ready
3. Use INVEST criteria for all stories
4. Estimate as a team (planning poker)
5. Prioritize ruthlessly (top 20% = 80% value)

## Performance Optimization

All components use:
- `useMemo` for expensive calculations
- `useCallback` for event handlers
- Recharts' built-in optimization
- Lazy loading (can be added)

## Integration Points

### Current System
- Auth: Use `ProtectedRoute` for planning routes
- Theme: Fully dark mode compatible
- Navigation: Add planning section to nav menu

### Future Enhancements
- Real-time collaboration (WebSocket)
- Drag-and-drop story cards (DnD Kit)
- Export to PDF/CSV
- Integration with project management tools (Jira, Linear)
- AI-powered estimation and forecasting

## Troubleshooting

### Common Issues

**Issue**: Charts not rendering
**Solution**: Ensure Recharts is installed: `npm install recharts`

**Issue**: Type errors
**Solution**: Run `npm run typecheck` and fix any issues in `planning.ts`

**Issue**: Data not displaying
**Solution**: Check that `planningData.ts` is properly exported and imported

**Issue**: Styling looks broken
**Solution**: Ensure Tailwind CSS is properly configured and PostCSS is running

## API Integration (Future)

When backend is ready, replace mock data with API calls:

```typescript
// Example API integration
import { trpc } from '@/lib/trpc';

const ReleasePlanningDashboard = () => {
  const { data: releases, isLoading } = trpc.releases.getAll.useQuery();

  if (isLoading) return <LoadingSpinner />;

  // Use releases from API instead of mock data
  return <Dashboard releases={releases} />;
};
```

## Testing

### Unit Tests
```bash
npm run test -- planning
```

### E2E Tests
```bash
npm run test:e2e -- planning
```

### Manual Testing Checklist
- [ ] All three dashboards load without errors
- [ ] Filters and sorting work correctly
- [ ] Charts render properly
- [ ] Dark mode works across all views
- [ ] Mobile responsive layout
- [ ] Data updates reflect in UI
- [ ] Story selection works in backlog
- [ ] Planning poker estimation works

## Documentation

- **Full Documentation**: `/docs/planning/release-iteration-planning.md`
- **Type Definitions**: `/src/types/planning.ts`
- **Mock Data**: `/src/data/planningData.ts`

## Contributing

When adding features:
1. Update type definitions in `planning.ts`
2. Add mock data in `planningData.ts`
3. Update component logic
4. Add documentation
5. Write tests
6. Update this README

## License

MIT - Part of PMP Learning Management System

## Support

For questions or issues:
1. Check documentation: `/docs/planning/`
2. Review code comments in components
3. Open an issue on GitHub
4. Contact: yusuke-kurosawa

---

**Version**: 1.0.0
**Last Updated**: 2025-01-28
**Status**: Ready for use (mock data) | Backend integration pending