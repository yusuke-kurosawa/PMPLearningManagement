/**
 * Value Engineering
 * Function analysis (FAST diagram), cost-value relationships, and alternative solutions
 */

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { TrendingUp, DollarSign, Zap } from 'lucide-react'

interface ValueFunction {
  name: string
  type: 'basic' | 'secondary' | 'supporting'
  verb: string
  noun: string
  costAllocation: number
  valueContribution: number
  valueIndex: number
}

interface Alternative {
  id: string
  feature: string
  current: string
  alternative: string
  costSaving: number
  valueLoss: number
  netBenefit: number
  recommendation: 'implement' | 'consider' | 'reject'
}

export const ValueEngineering: React.FC = () => {
  const valueFunctions: ValueFunction[] = useMemo(
    () => [
      {
        name: 'Enable Learning',
        type: 'basic',
        verb: 'Enable',
        noun: 'Learning',
        costAllocation: 35,
        valueContribution: 45,
        valueIndex: 1.29,
      },
      {
        name: 'Facilitate Practice',
        type: 'basic',
        verb: 'Facilitate',
        noun: 'Practice',
        costAllocation: 25,
        valueContribution: 30,
        valueIndex: 1.2,
      },
      {
        name: 'Track Progress',
        type: 'secondary',
        verb: 'Track',
        noun: 'Progress',
        costAllocation: 15,
        valueContribution: 15,
        valueIndex: 1.0,
      },
      {
        name: 'Visualize Data',
        type: 'secondary',
        verb: 'Visualize',
        noun: 'Data',
        costAllocation: 10,
        valueContribution: 5,
        valueIndex: 0.5,
      },
      {
        name: 'Enable Collaboration',
        type: 'supporting',
        verb: 'Enable',
        noun: 'Collaboration',
        costAllocation: 8,
        valueContribution: 3,
        valueIndex: 0.38,
      },
      {
        name: 'Provide Coaching',
        type: 'supporting',
        verb: 'Provide',
        noun: 'Coaching',
        costAllocation: 7,
        valueContribution: 2,
        valueIndex: 0.29,
      },
    ],
    []
  )

  const alternatives: Alternative[] = useMemo(
    () => [
      {
        id: 'ALT-001',
        feature: 'D3.js Visualizations',
        current: 'D3.js library',
        alternative: 'Chart.js lightweight',
        costSaving: 400,
        valueLoss: 15,
        netBenefit: 385,
        recommendation: 'consider',
      },
      {
        id: 'ALT-002',
        feature: 'Real-time Features',
        current: 'WebSocket',
        alternative: 'Polling',
        costSaving: 200,
        valueLoss: 30,
        netBenefit: 170,
        recommendation: 'reject',
      },
      {
        id: 'ALT-003',
        feature: 'Image Optimization',
        current: 'Manual',
        alternative: 'Automated CDN',
        costSaving: -50,
        valueLoss: -20,
        netBenefit: -30,
        recommendation: 'implement',
      },
      {
        id: 'ALT-004',
        feature: 'State Management',
        current: 'Zustand + Context',
        alternative: 'Redux Toolkit',
        costSaving: -100,
        valueLoss: 5,
        netBenefit: -105,
        recommendation: 'reject',
      },
      {
        id: 'ALT-005',
        feature: 'Testing Framework',
        current: 'Vitest + Playwright',
        alternative: 'Jest + Cypress',
        costSaving: 0,
        valueLoss: 10,
        netBenefit: -10,
        recommendation: 'reject',
      },
      {
        id: 'ALT-006',
        feature: 'Code Splitting',
        current: 'Manual',
        alternative: 'Automatic',
        costSaving: 150,
        valueLoss: 0,
        netBenefit: 150,
        recommendation: 'implement',
      },
      {
        id: 'ALT-007',
        feature: 'Authentication',
        current: 'Supabase',
        alternative: 'Custom JWT',
        costSaving: 300,
        valueLoss: 40,
        netBenefit: 260,
        recommendation: 'reject',
      },
      {
        id: 'ALT-008',
        feature: 'CSS Framework',
        current: 'Tailwind',
        alternative: 'Bootstrap',
        costSaving: 0,
        valueLoss: 25,
        netBenefit: -25,
        recommendation: 'reject',
      },
    ],
    []
  )

  const roiData = useMemo(
    () => [
      { feature: 'Core Learning', investment: 10000, value: 35000, roi: 250 },
      { feature: 'Mock Exams', investment: 5000, value: 15000, roi: 200 },
      { feature: 'Visualizations', investment: 8000, value: 12000, roi: 50 },
      { feature: 'AI Coaching', investment: 7000, value: 18000, roi: 157 },
      { feature: 'Collaboration', investment: 4000, value: 6000, roi: 50 },
      { feature: 'Analytics', investment: 3000, value: 8000, roi: 167 },
    ],
    []
  )

  const valueIndexData = useMemo(
    () =>
      valueFunctions.map((f) => ({
        name: f.name,
        cost: f.costAllocation,
        value: f.valueContribution,
        index: f.valueIndex * 10,
      })),
    [valueFunctions]
  )

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'implement':
        return 'bg-green-100 text-green-800'
      case 'consider':
        return 'bg-yellow-100 text-yellow-800'
      case 'reject':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Value Engineering Analysis</CardTitle>
          <CardDescription>
            Function analysis, cost-value relationships, and optimization alternatives
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Function Analysis (FAST)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {valueFunctions.map((func) => (
                  <div key={func.name} className='flex items-center gap-4 rounded-lg border p-3'>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <span className='font-medium'>{func.name}</span>
                        <Badge variant='outline'>{func.type}</Badge>
                        <span className='text-sm text-muted-foreground'>
                          ({func.verb} {func.noun})
                        </span>
                      </div>
                      <div className='grid grid-cols-3 gap-2 text-sm'>
                        <div>
                          <span className='text-muted-foreground'>Cost: </span>
                          <span className='font-medium'>{func.costAllocation}%</span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Value: </span>
                          <span className='font-medium'>{func.valueContribution}%</span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Index: </span>
                          <span
                            className={`font-medium ${func.valueIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {func.valueIndex.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Cost-Value Relationship</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' dataKey='cost' name='Cost Allocation %' />
                  <YAxis type='number' dataKey='value' name='Value Contribution %' />
                  <ZAxis type='number' dataKey='index' name='Value Index' range={[50, 500]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name='Functions' data={valueIndexData} fill='#3b82f6' />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>ROI by Feature Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='feature' angle={-45} textAnchor='end' height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='roi' fill='#10b981' name='ROI %' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Alternative Solutions Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {alternatives.map((alt) => (
                  <div key={alt.id} className='rounded-lg border p-3'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='font-medium'>{alt.feature}</div>
                        <div className='mt-1 text-sm text-muted-foreground'>
                          Current: <span className='font-medium'>{alt.current}</span> → Alternative:{' '}
                          <span className='font-medium'>{alt.alternative}</span>
                        </div>
                      </div>
                      <Badge className={getRecommendationColor(alt.recommendation)}>
                        {alt.recommendation}
                      </Badge>
                    </div>
                    <div className='grid grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>Cost Saving: </span>
                        <span
                          className={`font-medium ${alt.costSaving >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          ${alt.costSaving}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Value Loss: </span>
                        <span
                          className={`font-medium ${alt.valueLoss <= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {alt.valueLoss}%
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>Net Benefit: </span>
                        <span
                          className={`font-medium ${alt.netBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          ${alt.netBenefit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='border-blue-200 bg-blue-50'>
            <CardHeader>
              <CardTitle className='text-blue-900'>Value Engineering Insights</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-blue-800'>
              <p>
                • Core learning functions show excellent value index (1.29), justifying resource
                allocation
              </p>
              <p>
                • Visualization features have lower value index (0.50), indicating optimization
                opportunity
              </p>
              <p>
                • Recommended: Implement automated code splitting (+$150 net benefit, 0% value loss)
              </p>
              <p>
                • Recommended: Consider lightweight chart library (+$385 net benefit, 15% value loss
                acceptable)
              </p>
              <p>• Core Learning and Mock Exams deliver highest ROI (250% and 200% respectively)</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

export default ValueEngineering
