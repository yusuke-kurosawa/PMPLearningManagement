import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PageTransition from './components/PageTransition';
import Home from './components/Home';
import PMBOKMatrix from './components/PMBOKMatrix';
import ITTOForceGraph from './components/ITTOForceGraph';
import IntegratedView from './components/IntegratedView';
import PMPGlossary from './components/PMPGlossary';
import VisualizationHub from './components/VisualizationHub';
import LearningProgressDashboard from './components/LearningProgressDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
          </Routes>
        </PageTransition>
      </div>
    </Router>
  );
}

export default App;