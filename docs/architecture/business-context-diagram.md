# Business Context Diagram

## Overview

The Business Context Diagram provides a comprehensive, high-level view of the PMP Learning Management System's architecture, showing how the system interacts with external actors, systems, and services. This diagram is essential for understanding system boundaries, integration points, and data flows.

## Purpose

This diagram serves multiple purposes:

1. **Stakeholder Communication**: Provides a clear, visual representation of the system for non-technical stakeholders
2. **Architecture Documentation**: Documents the system's external dependencies and interfaces
3. **Integration Planning**: Identifies all external system integrations and their purposes
4. **Security Analysis**: Highlights authentication flows and data boundaries
5. **Development Guidance**: Helps developers understand the overall system context

## Component Access

The Business Context Diagram is implemented as an interactive React component located at:

**File**: `/home/kurosawa/PMPLearningManagement/src/components/architecture/BusinessContextDiagram.tsx`

### Features

- **Interactive SVG Diagram**: Fully interactive with zoom, pan, and element selection
- **Responsive Design**: Adapts to different screen sizes
- **Detailed Tooltips**: Hover over elements to see descriptions
- **Export Capability**: Export diagram as PNG for documentation
- **Element Details Panel**: Click elements to view comprehensive information
- **Visual Legend**: Clear legend explaining diagram symbols and colors

## System Actors

### Primary Users

#### 1. PMP Learner (Primary Actor)
- **Role**: Student studying for PMP certification
- **Interactions**:
  - Access learning content and materials
  - Take practice exams and flashcard quizzes
  - Track learning progress
  - Participate in study groups
  - Use AI coaching features
- **Authentication**: Required for progress tracking and collaboration
- **Permissions**: VIEW_CONTENT, TAKE_EXAMS, VIEW_PROGRESS, EXPORT_DATA, CREATE_STUDY_GROUPS, PARTICIPATE_DISCUSSIONS, SHARE_NOTES

#### 2. Administrator
- **Role**: System administrator managing platform
- **Interactions**:
  - Manage user accounts and permissions
  - Monitor system performance
  - Configure system settings
  - Manage content and exam questions
  - View analytics and reports
- **Authentication**: Required with elevated privileges
- **Permissions**: Full system access (all permissions)

#### 3. Mentor
- **Role**: Expert providing guidance to learners
- **Interactions**:
  - Provide mentorship and guidance
  - Create and share learning resources
  - Participate in discussions
  - Monitor mentee progress
  - Conduct coaching sessions
- **Authentication**: Required with instructor-level privileges
- **Permissions**: VIEW_CONTENT, TAKE_EXAMS, VIEW_PROGRESS, EXPORT_DATA, CREATE_STUDY_GROUPS, PARTICIPATE_DISCUSSIONS, SHARE_NOTES, CREATE_EXAMS, GRADE_EXAMS, MANAGE_COURSES, VIEW_ANALYTICS

## External Systems

### 1. Supabase
**Type**: Backend-as-a-Service
**Purpose**: Authentication and database backend

**Services Provided**:
- **Authentication**: User sign-up, sign-in, password reset, OAuth
- **Database**: PostgreSQL database for persistent storage
- **Realtime**: WebSocket connections for live updates
- **Storage**: File storage for user-generated content

**Integration Details**:
- **Protocol**: REST API + WebSocket
- **Authentication**: JWT tokens with refresh mechanism
- **Data Format**: JSON
- **Configuration**: Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Data Flows**:
- User authentication and session management
- Progress data persistence
- User profile information
- Collaboration data (study groups, notes, discussions)

### 2. Upstash Redis
**Type**: Serverless Redis Cache
**Purpose**: High-performance caching layer

**Services Provided**:
- **Session Caching**: User session data for fast access
- **Query Caching**: Frequently accessed data caching
- **Rate Limiting**: API rate limiting implementation
- **Temporary Storage**: Short-lived data storage

**Integration Details**:
- **Protocol**: Redis protocol over HTTP/HTTPS
- **Authentication**: Token-based authentication
- **Data Format**: Key-value pairs
- **TTL**: Configurable time-to-live for cached items

**Data Flows**:
- Cache read/write operations
- Session state management
- Temporary computation results

### 3. GitHub Pages
**Type**: Static Site Hosting
**Purpose**: Application hosting and deployment

**Services Provided**:
- **Static Hosting**: Serves compiled React application
- **CDN**: Global content delivery network
- **HTTPS**: Secure connections by default
- **Custom Domain**: Support for custom domain names

**Integration Details**:
- **Deployment**: GitHub Actions CI/CD pipeline
- **Build Process**: Vite build → gh-pages deployment
- **Routing**: HashRouter for client-side routing compatibility
- **Assets**: Optimized static assets with cache headers

**Data Flows**:
- CI/CD deployment pipeline
- Static asset delivery to users
- Application updates and versioning

### 4. Context7 MCP (Model Context Protocol)
**Type**: AI-Powered Documentation Service
**Purpose**: Documentation and library context retrieval

**Services Provided**:
- **Documentation Search**: Intelligent documentation retrieval
- **Library Context**: Up-to-date library and framework information
- **Code Examples**: Relevant code snippets and patterns
- **API Reference**: API documentation and usage examples

**Integration Details**:
- **Protocol**: MCP (Model Context Protocol)
- **Authentication**: API key-based
- **Data Format**: Structured JSON responses
- **Rate Limiting**: Request quota management

**Data Flows**:
- Documentation queries from AI coaching system
- Library information for learning recommendations
- Code example retrieval for tutorials

### 5. Serena MCP
**Type**: AI-Powered Code Analysis Service
**Purpose**: Code analysis and semantic search

**Services Provided**:
- **Code Analysis**: Static code analysis and insights
- **Semantic Search**: Intelligent code search capabilities
- **Symbol Mapping**: Code symbol and reference tracking
- **Refactoring Support**: Code transformation suggestions

**Integration Details**:
- **Protocol**: MCP (Model Context Protocol)
- **Authentication**: API key-based
- **Data Format**: Structured analysis results
- **Scope**: Project codebase analysis

**Data Flows**:
- Code analysis requests from development tools
- Search queries for code navigation
- Symbol reference lookups

## Internal Subsystems

### 1. Frontend Layer
**Technologies**: React 18, TypeScript 5.3, Tailwind CSS, Vite 7.1

**Responsibilities**:
- User interface rendering
- Client-side routing (HashRouter)
- State management (Zustand + React Context)
- User interaction handling
- Progressive Web App (PWA) features

**Key Components**:
- AppLayout: Main application layout
- Navigation: Route navigation and menu
- Theme System: Dark mode support
- PWA Manager: Service worker management

### 2. Learning Modules
**Technologies**: PMBOK Data, Progress Tracking, Flashcards, Mock Exams

**Responsibilities**:
- PMBOK content delivery (6th & 7th edition)
- Learning progress tracking
- Flashcard system for ITTO memorization
- Mock exam generation and grading
- Performance analytics

**Key Features**:
- 49 Processes (PMBOK 6th edition)
- 12 Principles (PMBOK 7th edition)
- 8 Performance Domains
- 180-question mock exams
- Spaced repetition algorithm

### 3. Visualization Engine
**Technologies**: D3.js, Force Graphs, Heatmaps, Sankey Diagrams

**Responsibilities**:
- Data visualization rendering
- Interactive graph generation
- Process relationship mapping
- Progress visualization
- Knowledge area heatmaps

**Visualization Types**:
1. **PMBOK Matrix View**: 10 knowledge areas × 5 process groups
2. **ITTO Network Graph**: Force-directed graph of process relationships
3. **Sankey Diagram**: Process flow visualization
4. **Mind Map View**: Hierarchical knowledge structure
5. **Process Heatmap**: Complexity and progress visualization
6. **Knowledge Area Heatmap**: Domain-specific metrics

### 4. Collaboration Hub
**Technologies**: Study Groups, Shared Notes, Discussions, Mentorship

**Responsibilities**:
- Study group management
- Collaborative note-taking
- Discussion threads
- Mentor-mentee connections
- Peer learning facilitation

**Features**:
- Real-time collaboration (planned with Supabase Realtime)
- Rich text editor for notes
- Thread-based discussions
- Mentorship matching
- Group activity tracking

### 5. AI Coaching
**Technologies**: AI Coach, Project Simulator, Adaptive Learning

**Responsibilities**:
- Personalized learning recommendations
- Project management scenario simulation
- Adaptive learning path generation
- Question generation
- Performance prediction

**Capabilities**:
- AI-powered study assistant
- Realistic project scenarios
- Contextual hints and explanations
- Learning gap identification
- Customized study plans

### 6. Service Layer
**Technologies**: Context Manager, Progress Service, Auth Service, Export/Import

**Responsibilities**:
- Business logic implementation
- Data persistence coordination
- Service orchestration
- Context management
- Import/export functionality

**Key Services**:
- **authService**: Authentication operations
- **progressService**: Progress tracking and analytics
- **contextManager**: Memory-optimized context management
- **collaborationService**: Collaboration features
- **exportService/importService**: Data portability

### 7. Infrastructure
**Technologies**: GitHub Actions, IDD Workflow, PWA Service Worker

**Responsibilities**:
- Continuous integration/deployment
- Issue-driven development workflow
- Service worker management
- Performance monitoring
- Automated testing

**IDD Workflow**:
- 99% IDD compliance rate
- Automated Git hooks (pre-commit, commit-msg, pre-push)
- GitHub Actions workflows
- Metrics collection and reporting
- Quality gates

### 8. Security Layer
**Technologies**: JWT, RBAC, OAuth, Session Management

**Responsibilities**:
- User authentication
- Role-based access control
- Session management
- Security token handling
- OAuth integration

**Security Features**:
- JWT with refresh tokens
- PKCE flow for OAuth
- Role-based permissions (4 roles, 14 permissions)
- Secure password requirements
- Session timeout handling

## Data Flows

### Authentication Flow
1. User enters credentials → Frontend
2. Frontend → Security Layer: Authentication request
3. Security Layer → Supabase: Verify credentials
4. Supabase → Security Layer: JWT tokens (access + refresh)
5. Security Layer → Frontend: Authenticated session
6. Frontend stores tokens in localStorage

### Learning Progress Flow
1. User completes learning activity → Frontend
2. Frontend → Learning Modules: Activity completion
3. Learning Modules → Services: Progress update
4. Services → Upstash: Cache progress data
5. Services → Supabase: Persist progress data
6. Supabase → Services: Confirmation
7. Services → Frontend: Updated progress

### Collaboration Flow
1. User creates/joins study group → Frontend
2. Frontend → Collaboration Hub: Group action
3. Collaboration Hub → Services: Data sync request
4. Services → Supabase: Persist group data
5. Supabase Realtime → All group members: Live updates
6. Frontend updates UI for all participants

### AI Coaching Flow
1. User requests learning assistance → Frontend
2. Frontend → AI Coaching: Query with context
3. AI Coaching → Services: Context retrieval
4. Services → Context7 MCP: Documentation lookup
5. Services → Serena MCP: Code analysis (if needed)
6. AI Coaching generates response
7. AI Coaching → Frontend: Personalized guidance

### Deployment Flow
1. Developer commits code → GitHub
2. GitHub Actions: Run tests and builds
3. GitHub Actions: Execute IDD compliance checks
4. Build passes → GitHub Actions: Deploy to gh-pages branch
5. GitHub Pages: Serve updated application
6. CDN distributes to global edge locations

## System Boundaries

### Internal System
Everything within the dashed boundary box in the diagram:
- Frontend Layer
- Learning Modules
- Visualization Engine
- Collaboration Hub
- AI Coaching
- Service Layer
- Infrastructure
- Security Layer

### External Dependencies
Everything outside the system boundary:
- User actors (Learner, Admin, Mentor)
- Supabase (authentication & database)
- Upstash Redis (caching)
- GitHub Pages (hosting)
- Context7 MCP (documentation)
- Serena MCP (code analysis)

### Integration Points

#### API Integrations
- **Supabase REST API**: CRUD operations, authentication
- **Supabase Realtime**: WebSocket for live updates
- **Upstash Redis API**: Cache operations via HTTP
- **Context7 MCP**: Documentation queries
- **Serena MCP**: Code analysis requests

#### Data Integrations
- **LocalStorage**: Client-side persistence
- **IndexedDB**: Offline data storage (planned)
- **Service Worker**: PWA caching and offline support

#### Deployment Integrations
- **GitHub Actions**: CI/CD pipeline
- **gh-pages**: Automated deployment
- **Vite Build**: Asset optimization and bundling

## Technology Stack Summary

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI
- **Visualization**: D3.js v7
- **State Management**: Zustand v4 + React Context
- **Animation**: Framer Motion v12

### Backend Services
- **BaaS**: Supabase (PostgreSQL + Auth + Realtime)
- **Cache**: Upstash Redis
- **Hosting**: GitHub Pages
- **CDN**: GitHub's global CDN

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

### AI/ML Services
- **Context7 MCP**: Documentation and library context
- **Serena MCP**: Code analysis and semantic search

## Security Considerations

### Authentication Security
- PKCE (Proof Key for Code Exchange) flow for OAuth
- JWT tokens with short expiration (1 hour)
- Refresh tokens with long expiration (30 days)
- Secure token storage in localStorage with custom key
- Automatic token refresh mechanism

### Authorization Security
- Role-Based Access Control (RBAC)
- 4 roles: Admin, Instructor, Student, Guest
- 14 fine-grained permissions
- Permission checks at component and route level
- Server-side permission validation (Supabase RLS)

### Data Security
- HTTPS-only connections
- Environment variable configuration
- No sensitive data in client code
- Secure password requirements (min 8 chars, mixed case, numbers)
- XSS protection via React
- CSRF protection via JWT

### Infrastructure Security
- GitHub repository security (branch protection)
- Secret management via GitHub Secrets
- No hardcoded credentials
- Automated security scanning (Dependabot)
- Regular dependency updates

## Performance Optimization

### Frontend Performance
- **Code Splitting**: React.lazy for all major components
- **Tree Shaking**: Vite automatically removes unused code
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Size**: ~1.3MB gzipped
- **Lighthouse Score**: 97/100

### Caching Strategy
- **Browser Cache**: Service worker caching for static assets
- **Redis Cache**: Frequently accessed data (sessions, queries)
- **CDN Cache**: GitHub Pages CDN for global distribution
- **Memory Cache**: LRU cache in context manager (50 items)

### Network Optimization
- **HTTP/2**: Multiplexing and server push
- **Compression**: Gzip/Brotli compression
- **Request Batching**: Combine multiple API calls
- **Debouncing**: Search and input debouncing (300ms)

## Scalability Considerations

### Horizontal Scaling
- **Stateless Frontend**: Easily replicated across CDN
- **Serverless Backend**: Supabase and Upstash auto-scale
- **Global Distribution**: GitHub Pages CDN

### Vertical Scaling
- **Database**: Supabase can scale database resources
- **Cache**: Upstash provides elastic scaling
- **Compute**: Serverless eliminates compute scaling concerns

### Data Scaling
- **Pagination**: Implemented for large datasets
- **Virtual Scrolling**: For long lists (planned)
- **Lazy Loading**: Images and components
- **Data Compression**: Context manager compresses large objects

## Monitoring and Observability

### Application Monitoring
- **Error Tracking**: Console logging with log levels
- **Performance Metrics**: Lighthouse and Core Web Vitals
- **User Analytics**: (Planned integration)
- **Build Metrics**: GitHub Actions timing and success rates

### Infrastructure Monitoring
- **GitHub Actions**: Workflow execution metrics
- **Supabase**: Database and auth metrics
- **Upstash**: Cache hit rate and latency
- **CDN**: GitHub Pages serving metrics

### IDD Metrics
- **Compliance Rate**: 99% IDD adherence
- **Commit Quality**: Automated checks
- **Issue Tracking**: Comprehensive issue workflow
- **KPI Dashboard**: Real-time development metrics

## Future Enhancements

### Planned Integrations
1. **Analytics Service**: Google Analytics or Plausible
2. **Payment Gateway**: Stripe for premium features
3. **Email Service**: SendGrid for notifications
4. **Video Hosting**: YouTube or Vimeo for video content
5. **CDN**: Cloudflare for enhanced performance

### Architecture Evolution
1. **Microservices**: Consider splitting backend services
2. **Event Sourcing**: Implement for audit trail
3. **GraphQL**: Migrate from REST to GraphQL
4. **Real-time Collaboration**: Full WebSocket integration
5. **Edge Computing**: Move some compute to edge

### Technology Upgrades
1. **React Server Components**: When stable
2. **Suspense for Data**: React 19 features
3. **WebAssembly**: Performance-critical computations
4. **Web Workers**: Background processing
5. **HTTP/3**: When widely supported

## Diagram Usage Guide

### Navigation
- **Pan**: Click and drag to move the diagram
- **Zoom**: Use zoom controls or mouse wheel
- **Select**: Click any element to view details
- **Hover**: Hover over elements for tooltips
- **Reset**: Click reset button to return to default view

### Element Types
- **Circles**: Represent actors (users and external systems)
- **Rectangles**: Represent internal subsystems
- **Arrows**: Represent data flows
- **Dashed Box**: System boundary

### Color Coding
- **Blue**: Users and data flows
- **Red**: Administrators and authentication flows
- **Green**: Mentors and caching flows
- **Purple**: API calls and integrations
- **Orange**: Deployment flows
- **Gray**: Infrastructure components

### Export Options
- Click the "Export" button to download as PNG
- Suitable for presentations and documentation
- High-resolution output (1200x900px)

## Related Documentation

- [Architecture Summary](/.claude/context/architecture-summary.md)
- [Implementation Status](/.claude/context/implementation-status.md)
- [IDD Implementation Status](/docs/IDD_IMPLEMENTATION_STATUS.md)
- [Quick Navigation Guide](/.claude/context/quick-navigation.md)

## Maintenance

This diagram should be updated when:
1. New external systems are integrated
2. Major architectural changes occur
3. New subsystems are added
4. Integration patterns change
5. Security architecture evolves

**Last Updated**: 2025-09-28
**Version**: 1.0.0
**Maintainer**: Architecture Team