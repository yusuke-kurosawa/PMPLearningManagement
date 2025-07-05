import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import PageTransition from './components/PageTransition';
import CustomizationPanel from './components/CustomizationPanel';
import Home from './components/Home';
import PMBOKMatrix from './components/PMBOKMatrix';
import ITTOForceGraph from './components/ITTOForceGraph';
import IntegratedView from './components/IntegratedView';
import PMPGlossary from './components/PMPGlossary';
import VisualizationHub from './components/VisualizationHub';
import LearningProgressDashboard from './components/LearningProgressDashboard';
import FlashCardLearning from './components/FlashCardLearning';
import MockExam from './components/MockExam';
import ExamResults from './components/ExamResults';

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
            </Routes>
          </PageTransition>
          <CustomizationPanel />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;