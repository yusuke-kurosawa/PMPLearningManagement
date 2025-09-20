/**
 * Customizable Dashboard Widget
 * Drag-and-drop widgets, personalized layouts, saved views
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface CustomizableDashboardProps {
  className?: string
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Customizable Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Drag-and-drop dashboard customization will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomizableDashboard
