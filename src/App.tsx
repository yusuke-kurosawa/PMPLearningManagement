import React, { useState, useEffect, Suspense } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ContextManagerProvider } from './contexts/ContextManagerContext'
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
        </AuthProvider>
      </ThemeProvider>
    </ContextManagerProvider>
  )
}

export default App
