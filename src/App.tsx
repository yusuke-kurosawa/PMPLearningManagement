import React, { useState, useEffect, Suspense } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ContextManagerProvider } from './contexts/ContextManagerContext'
import { OfflineProvider } from './contexts/OfflineContext'
import { ROLES, PERMISSIONS } from './lib/auth/supabase'
import AppLayout from './components/layout/AppLayout'
import PageTransition from './components/layout/PageTransition'
import CustomizationPanel from './components/shared/CustomizationPanel'
import {
  LoadingSpinner,
  MatrixLoader,
  NetworkLoader,
  ExamLoader,
  FlashcardLoader,
} from './components/layout/LoadingStates'

// Always-loaded components (critical for first paint)
import Home from './components/pages/Home'

// Lazy-loaded components (code splitting for better performance)
const PMBOKMatrix = React.lazy(() => import('./components/pages/PMBOKMatrix'))
const ITTOForceGraph = React.lazy(() => import('./components/visualizations/ITTOForceGraph'))
const IntegratedView = React.lazy(() => import('./components/visualizations/IntegratedView'))
const PMPGlossary = React.lazy(() => import('./components/learning/PMPGlossary'))
const VisualizationHub = React.lazy(() => import('./components/visualizations/VisualizationHub'))
const LearningProgressDashboard = React.lazy(
  () => import('./components/learning/LearningProgressDashboard')
)
const FlashCardLearning = React.lazy(() => import('./components/learning/FlashCardLearning'))
const MockExam = React.lazy(() => import('./components/learning/MockExam'))
const ExamResults = React.lazy(() => import('./components/learning/ExamResults'))
const CollaborationHub = React.lazy(() => import('./components/collaboration/CollaborationHub'))
const DataManagement = React.lazy(() => import('./components/collaboration/DataManagement'))
const PMBOKVersionSelector = React.lazy(() => import('./components/shared/PMBOKVersionSelector'))
const AICoachingDashboard = React.lazy(() => import('./components/coaching/AICoachingDashboard'))
const ProjectSimulator = React.lazy(() => import('./components/simulator/ProjectSimulator'))
const MentorshipHub = React.lazy(() => import('./components/mentorship/MentorshipHub'))

// Authentication Components
const AuthPage = React.lazy(() => import('./components/auth/AuthPage'))
const AuthCallback = React.lazy(() => import('./components/auth/AuthCallback'))
const ResetPasswordForm = React.lazy(() => import('./components/auth/ResetPasswordForm'))
const UserProfile = React.lazy(() => import('./components/auth/UserProfile'))
const ProtectedRoute = React.lazy(() => import('./components/auth/ProtectedRoute'))

// Mobile Components
const MobileOptimizedApp = React.lazy(() => import('./components/mobile/MobileOptimizedApp'))

// Context Management Dashboard - temporarily disabled
// const ContextManagerDashboard = React.lazy(() => import('./components/ContextManagerDashboard'))

// PWA Optimization Dashboard
const PWAOptimizationDashboard = React.lazy(() => import('./components/PWAOptimizationDashboard'))

// PMO Learning Hub
const PMOLearningHub = React.lazy(() => import('./components/learning/PMOLearningHub'))

// OPM Learning Components
const OPMLearningHub = React.lazy(() => import('./components/learning/OPMLearningHub'))
const OrganizationStructureComparison = React.lazy(
  () => import('./components/learning/OrganizationStructureComparison')
)
const OPMHierarchyDiagram = React.lazy(
  () => import('./components/visualizations/OPMHierarchyDiagram')
)

// Agile Learning Components
const AgileManifestoHub = React.lazy(() => import('./components/learning/AgileManifestoHub'))
const AgilePrinciplesExplorer = React.lazy(
  () => import('./components/learning/AgilePrinciplesExplorer')
)
const AgilePracticesLibrary = React.lazy(
  () => import('./components/learning/AgilePracticesLibrary')
)
const AgileValueComparison = React.lazy(
  () => import('./components/visualizations/AgileValueComparison')
)

// Agile Mindset & Tailoring Components
const AgileMindsetExplorer = React.lazy(() => import('./components/learning/AgileMindsetExplorer'))
const TailoringGuide = React.lazy(() => import('./components/learning/TailoringGuide'))
const AgileHybridIntegration = React.lazy(
  () => import('./components/learning/AgileHybridIntegration')
)
const ECOMappingDashboard = React.lazy(() => import('./components/learning/ECOMappingDashboard'))

// PMI Talent Triangle and Strategic Alignment Components
const PMITalentTriangle = React.lazy(() => import('./components/learning/PMITalentTriangle'))
const StrategicAlignment = React.lazy(() => import('./components/learning/StrategicAlignment'))
const BusinessEnvironmentAnalysis = React.lazy(
  () => import('./components/learning/BusinessEnvironmentAnalysis')
)
const StrategicAlignmentToolkit = React.lazy(
  () => import('./components/learning/StrategicAlignmentToolkit')
)

// Project Benefit Learning Components
const ProjectBenefitLearning = React.lazy(
  () => import('./components/learning/benefit/ProjectBenefitLearning')
)
const IncrementalValueVisualization = React.lazy(
  () => import('./components/learning/benefit/IncrementalValueVisualization')
)

// Project Governance Learning Components
const ProjectGovernanceLearning = React.lazy(
  () => import('./components/learning/governance/ProjectGovernanceLearning')
)

// Feature-specific loading components
const MatrixLoading = () => <MatrixLoader />
const NetworkLoading = () => <NetworkLoader />
const ExamLoading = () => <ExamLoader />
const FlashcardLoading = () => <FlashcardLoader />

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = [
        'android',
        'webos',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
      ]
      const isMobileDevice = mobileKeywords.some((keyword) => userAgent.includes(keyword))
      const isSmallScreen = window.innerWidth <= 768
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setIsMobile(isMobileDevice || (isSmallScreen && hasTouchScreen))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return isMobile
}

function App() {
  const isMobile = useIsMobile()

  return (
    <ContextManagerProvider>
      <ThemeProvider>
        <AuthProvider>
          <OfflineProvider
            showIndicator={true}
            showBanner={true}
            enableAutoSync={true}
            syncInterval={60000}
          >
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                {isMobile ? (
                  // Mobile-optimized version with PWA features
                  <MobileOptimizedApp>
                    <PageTransition>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path='/' element={<Home />} />
                          <Route
                            path='/matrix'
                            element={
                              <div className='p-2 md:p-4'>
                                <PMBOKMatrix />
                              </div>
                            }
                          />
                          <Route path='/network' element={<ITTOForceGraph />} />
                          <Route path='/integrated' element={<IntegratedView />} />
                          <Route path='/glossary' element={<PMPGlossary />} />
                          <Route path='/visualizations' element={<VisualizationHub />} />
                          <Route
                            path='/progress'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.VIEW_PROGRESS]}
                              >
                                <LearningProgressDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path='/flashcards' element={<FlashCardLearning />} />
                          <Route path='/pmo-learning' element={<PMOLearningHub />} />
                          <Route path='/opm-learning' element={<OPMLearningHub />} />
                          <Route
                            path='/organization-structure'
                            element={<OrganizationStructureComparison />}
                          />
                          <Route path='/opm-hierarchy' element={<OPMHierarchyDiagram />} />
                          <Route path='/agile-manifesto' element={<AgileManifestoHub />} />
                          <Route path='/agile-principles' element={<AgilePrinciplesExplorer />} />
                          <Route path='/agile-practices' element={<AgilePracticesLibrary />} />
                          <Route path='/agile-values' element={<AgileValueComparison />} />
                          <Route path='/agile-mindset' element={<AgileMindsetExplorer />} />
                          <Route path='/tailoring-guide' element={<TailoringGuide />} />
                          <Route path='/agile-hybrid' element={<AgileHybridIntegration />} />
                          <Route path='/eco-mapping' element={<ECOMappingDashboard />} />
                          <Route
                            path='/mock-exam'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.TAKE_EXAMS]}
                              >
                                <MockExam />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path='/exam-results'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.VIEW_PROGRESS, PERMISSIONS.TAKE_EXAMS]}
                              >
                                <ExamResults />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path='/collaboration'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.PARTICIPATE_DISCUSSIONS]}
                              >
                                <CollaborationHub />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path='/data-management'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}
                              >
                                <DataManagement />
                              </ProtectedRoute>
                            }
                          />
                          <Route path='/pmbok-versions' element={<PMBOKVersionSelector />} />

                          {/* PMI Talent Triangle and Strategic Alignment Routes */}
                          <Route path='/talent-triangle' element={<PMITalentTriangle />} />
                          <Route path='/strategic-alignment' element={<StrategicAlignment />} />
                          <Route
                            path='/business-environment'
                            element={<BusinessEnvironmentAnalysis />}
                          />
                          <Route
                            path='/strategic-toolkit'
                            element={<StrategicAlignmentToolkit />}
                          />

                          {/* Project Benefit and Value Learning Routes */}
                          <Route path='/project-benefits' element={<ProjectBenefitLearning />} />
                          <Route
                            path='/incremental-value'
                            element={<IncrementalValueVisualization />}
                          />

                          {/* Project Governance Learning Routes */}
                          <Route path='/governance' element={<ProjectGovernanceLearning />} />

                          <Route
                            path='/ai-coaching'
                            element={
                              <ProtectedRoute requireAuth={true}>
                                <AICoachingDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path='/project-simulator'
                            element={
                              <ProtectedRoute requireAuth={true}>
                                <ProjectSimulator />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path='/mentorship'
                            element={
                              <ProtectedRoute
                                requireAuth={true}
                                roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}
                              >
                                <MentorshipHub />
                              </ProtectedRoute>
                            }
                          />

                          {/* Authentication Routes */}
                          <Route
                            path='/auth'
                            element={
                              <Suspense fallback={<LoadingSpinner />}>
                                <AuthPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/auth/callback'
                            element={
                              <Suspense fallback={<LoadingSpinner />}>
                                <AuthCallback />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/auth/reset-password'
                            element={
                              <Suspense fallback={<LoadingSpinner />}>
                                <ResetPasswordForm />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/profile'
                            element={
                              <Suspense fallback={<LoadingSpinner />}>
                                <UserProfile />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/pwa-dashboard'
                            element={
                              <Suspense fallback={<LoadingSpinner />}>
                                <ProtectedRoute
                                  requireAuth={true}
                                  roles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}
                                >
                                  <PWAOptimizationDashboard />
                                </ProtectedRoute>
                              </Suspense>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </PageTransition>
                  </MobileOptimizedApp>
                ) : (
                  // Desktop version with app shell architecture
                  <AppLayout>
                    <PageTransition>
                      <Routes>
                        <Route path='/' element={<Home />} />
                        <Route
                          path='/matrix'
                          element={
                            <Suspense fallback={<MatrixLoading />}>
                              <div className='p-2 md:p-4'>
                                <PMBOKMatrix />
                              </div>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/network'
                          element={
                            <Suspense fallback={<NetworkLoading />}>
                              <ITTOForceGraph />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/integrated'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <IntegratedView />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/glossary'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PMPGlossary />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/visualizations'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <VisualizationHub />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/progress'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.VIEW_PROGRESS]}
                              >
                                <LearningProgressDashboard />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/flashcards'
                          element={
                            <Suspense fallback={<FlashcardLoading />}>
                              <FlashCardLearning />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/pmo-learning'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PMOLearningHub />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/opm-learning'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <OPMLearningHub />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/organization-structure'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <OrganizationStructureComparison />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/opm-hierarchy'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <OPMHierarchyDiagram />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-manifesto'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgileManifestoHub />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-principles'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgilePrinciplesExplorer />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-practices'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgilePracticesLibrary />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-values'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgileValueComparison />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-mindset'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgileMindsetExplorer />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/tailoring-guide'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <TailoringGuide />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/agile-hybrid'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AgileHybridIntegration />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/eco-mapping'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ECOMappingDashboard />
                            </Suspense>
                          }
                        />

                        {/* PMI Talent Triangle and Strategic Alignment Routes */}
                        <Route
                          path='/talent-triangle'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PMITalentTriangle />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/strategic-alignment'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <StrategicAlignment />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/business-environment'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <BusinessEnvironmentAnalysis />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/strategic-toolkit'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <StrategicAlignmentToolkit />
                            </Suspense>
                          }
                        />

                        {/* Project Benefit and Value Learning Routes */}
                        <Route
                          path='/project-benefits'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProjectBenefitLearning />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/incremental-value'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <IncrementalValueVisualization />
                            </Suspense>
                          }
                        />

                        {/* Project Governance Learning Routes */}
                        <Route
                          path='/governance'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProjectGovernanceLearning />
                            </Suspense>
                          }
                        />

                        <Route
                          path='/mock-exam'
                          element={
                            <Suspense fallback={<ExamLoading />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.TAKE_EXAMS]}
                              >
                                <MockExam />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/exam-results'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.VIEW_PROGRESS, PERMISSIONS.TAKE_EXAMS]}
                              >
                                <ExamResults />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/collaboration'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permissions={[PERMISSIONS.PARTICIPATE_DISCUSSIONS]}
                              >
                                <CollaborationHub />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/data-management'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}
                              >
                                <DataManagement />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/pmbok-versions'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PMBOKVersionSelector />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/ai-coaching'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute requireAuth={true}>
                                <AICoachingDashboard />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/project-simulator'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute requireAuth={true}>
                                <ProjectSimulator />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path='/mentorship'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}
                              >
                                <MentorshipHub />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />

                        {/* Authentication Routes */}
                        <Route
                          path='/auth'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AuthPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/auth/callback'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AuthCallback />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/auth/reset-password'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ResetPasswordForm />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/profile'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <UserProfile />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/pwa-dashboard'
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ProtectedRoute
                                requireAuth={true}
                                roles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}
                              >
                                <PWAOptimizationDashboard />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                      </Routes>
                    </PageTransition>
                    <CustomizationPanel />
                  </AppLayout>
                )}
              </Suspense>
            </Router>
          </OfflineProvider>
        </AuthProvider>
      </ThemeProvider>
    </ContextManagerProvider>
  )
}

export default App
