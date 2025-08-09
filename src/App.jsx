import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/layout/Navigation';
import PageTransition from './components/layout/PageTransition';
import CustomizationPanel from './components/shared/CustomizationPanel';
import Home from './components/pages/Home';
import PMBOKMatrix from './components/pages/PMBOKMatrix';
import ITTOForceGraph from './components/visualizations/ITTOForceGraph';
import IntegratedView from './components/visualizations/IntegratedView';
import PMPGlossary from './components/learning/PMPGlossary';
import VisualizationHub from './components/visualizations/VisualizationHub';
import LearningProgressDashboard from './components/learning/LearningProgressDashboard';
import FlashCardLearning from './components/learning/FlashCardLearning';
import MockExam from './components/learning/MockExam';
import ExamResults from './components/learning/ExamResults';
import CollaborationHub from './components/collaboration/CollaborationHub';
import DataManagement from './components/collaboration/DataManagement';
import PMBOKVersionSelector from './components/shared/PMBOKVersionSelector';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation />
          <PageTransition>
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
          </PageTransition>
          <CustomizationPanel />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;