/**
 * Student Insights Widget
 * Individual learner profiles, personalized recommendations, intervention alerts
 */

import React, { useMemo } from 'react'
import {
  User,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Brain,
  BookOpen,
  Award,
  Flame,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Button } from '../../ui/button'
import type { FilterSettings } from '../types/dashboard'

interface StudentInsightsWidgetProps {
  studentData: any
  filters: FilterSettings
  showTooltips?: boolean
  className?: string
}

const mockStudents = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: '/avatars/sarah.jpg',
    enrollmentDate: new Date('2024-01-15'),
    lastActive: new Date('2024-06-10'),
    studyStreak: 12,
    totalStudyTime: 2880, // minutes
    overallProgress: 78,
    riskScore: 15,
    preferredStudyTime: 'evening',
    learningStyle: 'visual',
    strongAreas: ['Integration Management', 'Quality Management'],
    weakAreas: ['Risk Management', 'Procurement Management'],
    achievements: 8,
    goals: 3,
    status: 'on-track',
    weeklyGoal: 300,
    weeklyActual: 280,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    avatar: '/avatars/marcus.jpg',
    enrollmentDate: new Date('2024-02-01'),
    lastActive: new Date('2024-06-08'),
    studyStreak: 3,
    totalStudyTime: 1920,
    overallProgress: 52,
    riskScore: 72,
    preferredStudyTime: 'morning',
    learningStyle: 'reading',
    strongAreas: ['Communications Management'],
    weakAreas: ['Schedule Management', 'Cost Management', 'Risk Management'],
    achievements: 4,
    goals: 2,
    status: 'at-risk',
    weeklyGoal: 360,
    weeklyActual: 180,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    avatar: '/avatars/elena.jpg',
    enrollmentDate: new Date('2024-01-08'),
    lastActive: new Date('2024-06-10'),
    studyStreak: 25,
    totalStudyTime: 3600,
    overallProgress: 92,
    riskScore: 5,
    preferredStudyTime: 'afternoon',
    learningStyle: 'kinesthetic',
    strongAreas: ['All Areas'],
    weakAreas: [],
    achievements: 15,
    goals: 1,
    status: 'excelling',
    weeklyGoal: 240,
    weeklyActual: 320,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    avatar: '/avatars/david.jpg',
    enrollmentDate: new Date('2024-03-01'),
    lastActive: new Date('2024-06-09'),
    studyStreak: 8,
    totalStudyTime: 1440,
    overallProgress: 65,
    riskScore: 35,
    preferredStudyTime: 'morning',
    learningStyle: 'auditory',
    strongAreas: ['Stakeholder Management', 'Communications Management'],
    weakAreas: ['Resource Management', 'Schedule Management'],
    achievements: 6,
    goals: 4,
    status: 'needs-attention',
    weeklyGoal: 300,
    weeklyActual: 240,
  },
]

const mockCohorts = [
  { name: 'Spring 2024 Cohort', students: 45, avgProgress: 73, completion: 68 },
  { name: 'Winter 2024 Cohort', students: 38, avgProgress: 85, completion: 82 },
  { name: 'Fall 2023 Cohort', students: 52, avgProgress: 91, completion: 95 },
]

const mockLearningPatterns = {
  studyTimes: [
    { time: 'Early Morning (6-9 AM)', count: 12, effectiveness: 92 },
    { time: 'Morning (9-12 PM)', count: 18, effectiveness: 88 },
    { time: 'Afternoon (12-6 PM)', count: 15, effectiveness: 85 },
    { time: 'Evening (6-9 PM)', count: 22, effectiveness: 90 },
    { time: 'Night (9-12 AM)', count: 8, effectiveness: 78 },
  ],
  devicePreferences: [
    { device: 'Desktop', percentage: 65, engagement: 95 },
    { device: 'Tablet', percentage: 25, engagement: 88 },
    { device: 'Mobile', percentage: 10, engagement: 72 },
  ],
  sessionLengths: [
    { duration: '15-30 min', count: 35, retention: 82 },
    { duration: '30-60 min', count: 28, retention: 91 },
    { duration: '60-90 min', count: 18, retention: 88 },
    { duration: '90+ min', count: 12, retention: 85 },
  ],
}

export const StudentInsightsWidget: React.FC<StudentInsightsWidgetProps> = ({
  studentData,
  filters,
  showTooltips = true,
  className = '',
}) => {
  const analytics = useMemo(() => {
    const totalStudents = mockStudents.length
    const atRiskStudents = mockStudents.filter((s) => s.status === 'at-risk').length
    const excellingStudents = mockStudents.filter((s) => s.status === 'excelling').length
    const avgProgress = Math.round(
      mockStudents.reduce((sum, s) => sum + s.overallProgress, 0) / totalStudents
    )
    const avgStudyTime = Math.round(
      mockStudents.reduce((sum, s) => sum + s.totalStudyTime, 0) / totalStudents
    )

    return {
      totalStudents,
      atRiskStudents,
      excellingStudents,
      avgProgress,
      avgStudyTime: Math.floor(avgStudyTime / 60) + 'h ' + (avgStudyTime % 60) + 'm',
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelling':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'on-track':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'at-risk':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excelling':
        return <TrendingUp className='h-3 w-3' />
      case 'on-track':
        return <Target className='h-3 w-3' />
      case 'needs-attention':
        return <Clock className='h-3 w-3' />
      case 'at-risk':
        return <AlertTriangle className='h-3 w-3' />
      default:
        return <User className='h-3 w-3' />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-50 p-2'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Students</p>
                <p className='text-xl font-bold'>{analytics.totalStudents}</p>
                <p className='text-xs text-green-600'>+3 this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-50 p-2'>
                <TrendingUp className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Excelling</p>
                <p className='text-xl font-bold'>{analytics.excellingStudents}</p>
                <p className='text-xs text-muted-foreground'>
                  {Math.round((analytics.excellingStudents / analytics.totalStudents) * 100)}% of
                  total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-red-50 p-2'>
                <AlertTriangle className='h-5 w-5 text-red-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>At Risk</p>
                <p className='text-xl font-bold'>{analytics.atRiskStudents}</p>
                <p className='text-xs text-red-600'>Need intervention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-purple-50 p-2'>
                <Target className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Avg Progress</p>
                <p className='text-xl font-bold'>{analytics.avgProgress}%</p>
                <Progress value={analytics.avgProgress} className='mt-1 h-1' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='individual' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='individual'>Individual Profiles</TabsTrigger>
          <TabsTrigger value='cohorts'>Cohort Analysis</TabsTrigger>
          <TabsTrigger value='patterns'>Learning Patterns</TabsTrigger>
          <TabsTrigger value='interventions'>Interventions</TabsTrigger>
        </TabsList>

        {/* Individual Profiles */}
        <TabsContent value='individual' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {mockStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className='text-lg'>{student.name}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(student.status)} flex items-center gap-1`}>
                      {getStatusIcon(student.status)}
                      {student.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Progress Overview */}
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-2xl font-bold text-blue-600'>{student.overallProgress}%</p>
                      <p className='text-xs text-muted-foreground'>Progress</p>
                    </div>
                    <div>
                      <p className='text-2xl font-bold text-green-600'>{student.studyStreak}</p>
                      <p className='text-xs text-muted-foreground'>Day Streak</p>
                    </div>
                    <div>
                      <p className='text-2xl font-bold text-purple-600'>{student.achievements}</p>
                      <p className='text-xs text-muted-foreground'>Achievements</p>
                    </div>
                  </div>

                  {/* Weekly Goal Progress */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Weekly Goal</span>
                      <span>
                        {student.weeklyActual}/{student.weeklyGoal}min
                      </span>
                    </div>
                    <Progress value={(student.weeklyActual / student.weeklyGoal) * 100} />
                  </div>

                  {/* Quick Stats */}
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Total Study:</span>
                      <span className='font-medium'>
                        {Math.floor(student.totalStudyTime / 60)}h {student.totalStudyTime % 60}m
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Brain className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Style:</span>
                      <span className='font-medium capitalize'>{student.learningStyle}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Prefers:</span>
                      <span className='font-medium capitalize'>{student.preferredStudyTime}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Goals:</span>
                      <span className='font-medium'>{student.goals} active</span>
                    </div>
                  </div>

                  {/* Strong/Weak Areas */}
                  <div className='space-y-2'>
                    <div>
                      <p className='mb-1 text-sm font-medium text-green-700'>Strong Areas:</p>
                      <div className='flex flex-wrap gap-1'>
                        {student.strongAreas.slice(0, 2).map((area, index) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='border-green-200 text-xs text-green-700'
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {student.weakAreas.length > 0 && (
                      <div>
                        <p className='mb-1 text-sm font-medium text-orange-700'>Needs Attention:</p>
                        <div className='flex flex-wrap gap-1'>
                          {student.weakAreas.slice(0, 2).map((area, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='border-orange-200 text-xs text-orange-700'
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <Button size='sm' variant='outline' className='flex-1'>
                      View Profile
                    </Button>
                    {student.status === 'at-risk' && (
                      <Button size='sm' variant='destructive' className='flex-1'>
                        <MessageCircle className='mr-1 h-3 w-3' />
                        Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cohort Analysis */}
        <TabsContent value='cohorts' className='space-y-4'>
          <div className='grid gap-4'>
            {mockCohorts.map((cohort, index) => (
              <Card key={index}>
                <CardContent className='p-6'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold'>{cohort.name}</h3>
                      <p className='text-sm text-muted-foreground'>{cohort.students} students</p>
                    </div>
                    <Badge
                      variant={
                        cohort.completion >= 90
                          ? 'default'
                          : cohort.completion >= 80
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {cohort.completion}% completion
                    </Badge>
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded-lg bg-blue-50 p-4 text-center'>
                      <p className='text-2xl font-bold text-blue-600'>{cohort.students}</p>
                      <p className='text-sm text-muted-foreground'>Total Students</p>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4 text-center'>
                      <p className='text-2xl font-bold text-green-600'>{cohort.avgProgress}%</p>
                      <p className='text-sm text-muted-foreground'>Avg Progress</p>
                    </div>
                    <div className='rounded-lg bg-purple-50 p-4 text-center'>
                      <p className='text-2xl font-bold text-purple-600'>{cohort.completion}%</p>
                      <p className='text-sm text-muted-foreground'>Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learning Patterns */}
        <TabsContent value='patterns' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Study Time Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Study Time Preferences</CardTitle>
                <CardDescription>When students are most effective</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {mockLearningPatterns.studyTimes.map((time, index) => (
                    <div key={index} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{time.time}</span>
                        <span>{time.effectiveness}% effective</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Progress value={(time.count / 22) * 100} className='h-2 flex-1' />
                        <span className='w-8 text-xs text-muted-foreground'>{time.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Device Usage</CardTitle>
                <CardDescription>Preferred learning devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {mockLearningPatterns.devicePreferences.map((device, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='h-4 w-4 rounded bg-blue-500' />
                        <span className='font-medium'>{device.device}</span>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold'>{device.percentage}%</p>
                        <p className='text-xs text-muted-foreground'>
                          {device.engagement}% engagement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Lengths */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Session Lengths</CardTitle>
                <CardDescription>Optimal study session duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {mockLearningPatterns.sessionLengths.map((session, index) => (
                    <div key={index} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{session.duration}</span>
                        <span>{session.retention}% retention</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Progress value={(session.count / 35) * 100} className='h-2 flex-1' />
                        <span className='w-8 text-xs text-muted-foreground'>{session.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interventions */}
        <TabsContent value='interventions' className='space-y-4'>
          <div className='space-y-4'>
            {/* At-Risk Students */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-red-700'>
                  <AlertTriangle className='h-5 w-5' />
                  Students Requiring Intervention
                </CardTitle>
                <CardDescription>
                  Students identified as at-risk based on engagement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {mockStudents
                    .filter((s) => s.status === 'at-risk' || s.status === 'needs-attention')
                    .map((student) => (
                      <div
                        key={student.id}
                        className='rounded-lg border border-orange-200 bg-orange-50 p-4'
                      >
                        <div className='mb-3 flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='text-xs'>
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-semibold'>{student.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                Risk Score: {student.riskScore}%
                              </p>
                            </div>
                          </div>
                          <Badge variant='destructive'>{student.status.replace('-', ' ')}</Badge>
                        </div>

                        <div className='space-y-2'>
                          <p className='text-sm'>
                            <strong>Issues:</strong>
                          </p>
                          <ul className='ml-4 space-y-1 text-sm text-muted-foreground'>
                            {student.weeklyActual < student.weeklyGoal * 0.7 && (
                              <li>
                                • Behind on weekly study goals ({student.weeklyActual}/
                                {student.weeklyGoal} min)
                              </li>
                            )}
                            {student.studyStreak < 5 && (
                              <li>• Low study streak ({student.studyStreak} days)</li>
                            )}
                            {student.weakAreas.length > 2 && (
                              <li>
                                • Multiple weak knowledge areas ({student.weakAreas.length} areas)
                              </li>
                            )}
                          </ul>

                          <div className='mt-3 flex gap-2'>
                            <Button size='sm' variant='outline' className='flex-1'>
                              Send Reminder
                            </Button>
                            <Button size='sm' variant='outline' className='flex-1'>
                              Schedule Check-in
                            </Button>
                            <Button size='sm' className='flex-1'>
                              Contact Student
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Brain className='h-5 w-5 text-blue-600' />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                    <p className='font-medium text-blue-900'>Personalized Learning Paths</p>
                    <p className='mt-1 text-sm text-blue-700'>
                      23 students would benefit from adaptive learning paths based on their
                      performance patterns.
                    </p>
                    <Button size='sm' className='mt-2' variant='outline'>
                      Enable Auto-Recommendations
                    </Button>
                  </div>

                  <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
                    <p className='font-medium text-green-900'>Study Group Formation</p>
                    <p className='mt-1 text-sm text-green-700'>
                      Form study groups pairing strong performers with students needing support.
                    </p>
                    <Button size='sm' className='mt-2' variant='outline'>
                      Create Study Groups
                    </Button>
                  </div>

                  <div className='rounded-lg border border-purple-200 bg-purple-50 p-3'>
                    <p className='font-medium text-purple-900'>Content Optimization</p>
                    <p className='mt-1 text-sm text-purple-700'>
                      Risk Management content shows low engagement - consider adding interactive
                      elements.
                    </p>
                    <Button size='sm' className='mt-2' variant='outline'>
                      Review Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentInsightsWidget
