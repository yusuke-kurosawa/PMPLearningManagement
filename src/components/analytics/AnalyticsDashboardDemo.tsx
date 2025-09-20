/**
 * Analytics Dashboard Demo
 * Demonstration component showing the real-time learning analytics dashboard
 */

import React from 'react'
import { RealTimeLearningAnalyticsDashboard } from './RealTimeLearningAnalyticsDashboard'

export const AnalyticsDashboardDemo: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <RealTimeLearningAnalyticsDashboard />
    </div>
  )
}

export default AnalyticsDashboardDemo
