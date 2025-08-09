import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/layout/Navigation';
import PageTransition from './components/layout/PageTransition';
import CustomizationPanel from './components/shared/CustomizationPanel';

// Always-loaded components (critical for first paint)
import Home from './components/pages/Home';

// Lazy-loaded components (code splitting for better performance)
const PMBOKMatrix = React.lazy(() => import('./components/pages/PMBOKMatrix'));
const ITTOForceGraph = React.lazy(() => import('./components/visualizations/ITTOForceGraph'));
const IntegratedView = React.lazy(() => import('./components/visualizations/IntegratedView'));
const PMPGlossary = React.lazy(() => import('./components/learning/PMPGlossary'));
const VisualizationHub = React.lazy(() => import('./components/visualizations/VisualizationHub'));
const LearningProgressDashboard = React.lazy(() => import('./components/learning/LearningProgressDashboard'));
const FlashCardLearning = React.lazy(() => import('./components/learning/FlashCardLearning'));
const MockExam = React.lazy(() => import('./components/learning/MockExam'));
const ExamResults = React.lazy(() => import('./components/learning/ExamResults'));
const CollaborationHub = React.lazy(() => import('./components/collaboration/CollaborationHub'));
const DataManagement = React.lazy(() => import('./components/collaboration/DataManagement'));
const PMBOKVersionSelector = React.lazy(() => import('./components/shared/PMBOKVersionSelector'));

// Mobile Components
const MobileOptimizedApp = React.lazy(() => import('./components/mobile/MobileOptimizedApp'));

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">読み込み中...</p>
    </div>
  </div>
);

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth <= 768;
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileDevice || (isSmallScreen && hasTouchScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}

function App() {
  const isMobile = useIsMobile();

  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          {isMobile ? (
            // Mobile-optimized version with PWA features
            <MobileOptimizedApp>
              <PageTransition>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/matrix" element={
                      <div className="p-2 md:p-4">
                        <PMBOKMatrix />
                      </div>
                    } />
                    <Route path="/network" element={<ITTOForceGraph />} />
                    <Route path="/integrated" element={<IntegratedView />} />
                    <Route path="/glossary" element={<PMPGlossary />} />
                    <Route path="/visualizations" element={<VisualizationHub />} />
                    <Route path="/progress" element={<LearningProgressDashboard />} />
                    <Route path="/flashcards" element={<FlashCardLearning />} />
                    <Route path="/mock-exam" element={<MockExam />} />
                    <Route path="/exam-results" element={<ExamResults />} />
                    <Route path="/collaboration" element={<CollaborationHub />} />
                    <Route path="/data-management" element={<DataManagement />} />
                    <Route path="/pmbok-versions" element={<PMBOKVersionSelector />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </MobileOptimizedApp>
          ) : (
            // Desktop version with standard navigation
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navigation />
              <PageTransition>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/matrix" element={
                      <div className="p-2 md:p-4">
                        <PMBOKMatrix />
                      </div>
                    } />
                    <Route path="/network" element={<ITTOForceGraph />} />
                    <Route path="/integrated" element={<IntegratedView />} />
                    <Route path="/glossary" element={<PMPGlossary />} />
                    <Route path="/visualizations" element={<VisualizationHub />} />
                    <Route path="/progress" element={<LearningProgressDashboard />} />
                    <Route path="/flashcards" element={<FlashCardLearning />} />
                    <Route path="/mock-exam" element={<MockExam />} />
                    <Route path="/exam-results" element={<ExamResults />} />
                    <Route path="/collaboration" element={<CollaborationHub />} />
                    <Route path="/data-management" element={<DataManagement />} />
                    <Route path="/pmbok-versions" element={<PMBOKVersionSelector />} />
                  </Routes>
                </Suspense>
              </PageTransition>
              <CustomizationPanel />
            </div>
          )}
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;