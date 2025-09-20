/**
 * Study Plan Generator Tool
 * Creates personalized study plans based on user goals and progress
 */

import { Tool } from '@langchain/core/tools'
import { z } from 'zod'

const InputSchema = z.object({
  userId: z.string(),
  examDate: z.string(),
  targetScore: z.number(),
  availableHoursPerDay: z.number(),
  currentScore: z.number(),
  weakAreas: z.array(z.string()),
  learningStyle: z.enum(['visual', 'textual', 'practical', 'mixed']),
})

export class StudyPlanGenerator extends Tool {
  name = 'study_plan_generator'
  description = `Generate a personalized study plan based on exam date, target score, and current progress.
    Input should be JSON with userId, examDate, targetScore, availableHoursPerDay, currentScore, weakAreas, learningStyle`

  schema = InputSchema

  protected async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input)
      const validated = InputSchema.parse(params)

      const plan = this.generateStudyPlan(validated)
      return this.formatStudyPlan(plan)
    } catch (error) {
      return `Error generating study plan: ${error.message}`
    }
  }

  private generateStudyPlan(params: z.infer<typeof InputSchema>): any {
    const examDate = new Date(params.examDate)
    const today = new Date()
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const totalAvailableHours = daysUntilExam * params.availableHoursPerDay
    const scoreGap = params.targetScore - params.currentScore

    // Calculate phases
    const phases = this.calculatePhases(daysUntilExam, scoreGap)

    // Generate weekly schedule
    const weeklySchedule = this.generateWeeklySchedule(
      params.weakAreas,
      params.availableHoursPerDay,
      params.learningStyle
    )

    // Create milestones
    const milestones = this.createMilestones(daysUntilExam, params.currentScore, params.targetScore)

    // Resource allocation
    const resourceAllocation = this.allocateResources(
      params.weakAreas,
      totalAvailableHours,
      params.learningStyle
    )

    return {
      daysUntilExam,
      totalAvailableHours,
      phases,
      weeklySchedule,
      milestones,
      resourceAllocation,
      dailyRoutine: this.createDailyRoutine(params.availableHoursPerDay, params.learningStyle),
    }
  }

  private calculatePhases(daysUntilExam: number, scoreGap: number): any[] {
    const phases = []

    if (daysUntilExam > 60) {
      phases.push({
        name: 'Foundation Building',
        duration: Math.floor(daysUntilExam * 0.3),
        focus: 'Understanding core concepts and PMBOK framework',
        intensity: 'Moderate',
      })
      phases.push({
        name: 'Deep Dive',
        duration: Math.floor(daysUntilExam * 0.4),
        focus: 'Detailed study of processes, ITTO, and weak areas',
        intensity: 'High',
      })
      phases.push({
        name: 'Practice & Refinement',
        duration: Math.floor(daysUntilExam * 0.2),
        focus: 'Mock exams and targeted practice',
        intensity: 'High',
      })
      phases.push({
        name: 'Final Review',
        duration: Math.floor(daysUntilExam * 0.1),
        focus: 'Review, confidence building, and exam strategy',
        intensity: 'Moderate',
      })
    } else if (daysUntilExam > 30) {
      phases.push({
        name: 'Intensive Study',
        duration: Math.floor(daysUntilExam * 0.6),
        focus: 'Focus on weak areas and core concepts',
        intensity: 'Very High',
      })
      phases.push({
        name: 'Practice & Review',
        duration: Math.floor(daysUntilExam * 0.4),
        focus: 'Mock exams and final preparation',
        intensity: 'High',
      })
    } else {
      phases.push({
        name: 'Crash Course',
        duration: daysUntilExam,
        focus: 'High-impact topics and exam techniques',
        intensity: 'Maximum',
      })
    }

    return phases
  }

  private generateWeeklySchedule(
    weakAreas: string[],
    hoursPerDay: number,
    learningStyle: string
  ): any {
    const schedule = {
      monday: this.createDayPlan('Knowledge Areas Review', hoursPerDay, learningStyle),
      tuesday: this.createDayPlan('Process Groups & ITTO', hoursPerDay, learningStyle),
      wednesday: this.createDayPlan('Weak Areas Focus', hoursPerDay, learningStyle, weakAreas[0]),
      thursday: this.createDayPlan('Practice Questions', hoursPerDay, 'practical'),
      friday: this.createDayPlan('Weak Areas Focus', hoursPerDay, learningStyle, weakAreas[1]),
      saturday: this.createDayPlan('Mock Exam/Quiz', Math.min(hoursPerDay * 1.5, 4), 'practical'),
      sunday: this.createDayPlan('Review & Planning', Math.min(hoursPerDay, 2), 'mixed'),
    }

    return schedule
  }

  private createDayPlan(focus: string, hours: number, style: string, specificTopic?: string): any {
    const activities = []

    // Warm-up (15% of time)
    activities.push({
      type: 'warm-up',
      duration: Math.round(hours * 0.15 * 60),
      activity: 'Review flashcards or previous notes',
    })

    // Main study (60% of time)
    const mainActivity = this.getMainActivity(focus, style, specificTopic)
    activities.push({
      type: 'main',
      duration: Math.round(hours * 0.6 * 60),
      activity: mainActivity,
    })

    // Practice (20% of time)
    activities.push({
      type: 'practice',
      duration: Math.round(hours * 0.2 * 60),
      activity: "Practice questions on today's topics",
    })

    // Review (5% of time)
    activities.push({
      type: 'review',
      duration: Math.round(hours * 0.05 * 60),
      activity: 'Summarize key learnings',
    })

    return {
      focus,
      totalMinutes: hours * 60,
      activities,
    }
  }

  private getMainActivity(focus: string, style: string, topic?: string): string {
    const topicStr = topic ? ` (${topic})` : ''

    const activities = {
      visual: {
        'Knowledge Areas Review': `Watch video tutorials and create mind maps${topicStr}`,
        'Process Groups & ITTO': `Use visual ITTO diagrams and process flow charts${topicStr}`,
        'Weak Areas Focus': `Create visual summaries and diagrams for ${topic || 'weak areas'}`,
        'Practice Questions': 'Solve questions with visual explanations',
        'Mock Exam/Quiz': 'Take timed practice exam',
        'Review & Planning': 'Review visual notes and plan next week',
      },
      textual: {
        'Knowledge Areas Review': `Read PMBOK chapters and take detailed notes${topicStr}`,
        'Process Groups & ITTO': `Study ITTO tables and process descriptions${topicStr}`,
        'Weak Areas Focus': `Deep reading and note-taking on ${topic || 'weak areas'}`,
        'Practice Questions': 'Solve text-based practice questions',
        'Mock Exam/Quiz': 'Take full-length mock exam',
        'Review & Planning': 'Review notes and create summaries',
      },
      practical: {
        'Knowledge Areas Review': `Work through case studies and scenarios${topicStr}`,
        'Process Groups & ITTO': `Practice ITTO matching exercises${topicStr}`,
        'Weak Areas Focus': `Hands-on exercises for ${topic || 'weak areas'}`,
        'Practice Questions': 'Solve situation-based questions',
        'Mock Exam/Quiz': 'Take simulation exam',
        'Review & Planning': 'Analyze practice results and adjust plan',
      },
      mixed: {
        'Knowledge Areas Review': `Combine reading, videos, and exercises${topicStr}`,
        'Process Groups & ITTO': `Mixed media study of processes${topicStr}`,
        'Weak Areas Focus': `Multi-modal learning for ${topic || 'weak areas'}`,
        'Practice Questions': 'Varied question types and formats',
        'Mock Exam/Quiz': 'Complete practice exam',
        'Review & Planning': 'Comprehensive review and planning',
      },
    }

    return activities[style]?.[focus] || activities.mixed[focus]
  }

  private createMilestones(
    daysUntilExam: number,
    currentScore: number,
    targetScore: number
  ): any[] {
    const milestones = []
    const scoreIncrement = (targetScore - currentScore) / 4

    const intervals = [
      { week: Math.floor((daysUntilExam * 0.25) / 7), label: 'Foundation Check' },
      { week: Math.floor((daysUntilExam * 0.5) / 7), label: 'Mid-point Assessment' },
      { week: Math.floor((daysUntilExam * 0.75) / 7), label: 'Pre-final Check' },
      { week: Math.floor((daysUntilExam * 0.9) / 7), label: 'Final Readiness' },
    ]

    intervals.forEach((interval, index) => {
      milestones.push({
        week: interval.week,
        label: interval.label,
        targetScore: Math.round(currentScore + scoreIncrement * (index + 1)),
        assessment: index % 2 === 0 ? 'Full mock exam' : 'Topic-wise quiz',
        successCriteria: `Achieve ${Math.round(currentScore + scoreIncrement * (index + 1))}% overall score`,
      })
    })

    return milestones
  }

  private allocateResources(weakAreas: string[], totalHours: number, learningStyle: string): any {
    const allocation = {
      weakAreas: Math.round(totalHours * 0.4),
      strongAreas: Math.round(totalHours * 0.15),
      practice: Math.round(totalHours * 0.25),
      mockExams: Math.round(totalHours * 0.15),
      review: Math.round(totalHours * 0.05),
    }

    const resources = {
      primary: this.getPrimaryResources(learningStyle),
      supplementary: this.getSupplementaryResources(learningStyle),
      practice: [
        'PMP exam simulator',
        'Topic-wise question banks',
        'Flashcard system',
        'ITTO matching games',
      ],
    }

    return {
      timeAllocation: allocation,
      resources,
      focusOrder: weakAreas,
    }
  }

  private getPrimaryResources(style: string): string[] {
    const resources = {
      visual: ['Video courses', 'Mind mapping tools', 'Process diagrams', 'Infographics'],
      textual: ['PMBOK Guide', 'Study guides', 'Written notes', 'Articles'],
      practical: ['Case studies', 'Simulations', 'Practice projects', 'Workshops'],
      mixed: ['PMBOK Guide', 'Video courses', 'Practice questions', 'Study groups'],
    }

    return resources[style] || resources.mixed
  }

  private getSupplementaryResources(style: string): string[] {
    return [
      'PMP prep mobile app',
      'Study group or forum',
      'Quick reference sheets',
      'Exam tips and tricks guides',
    ]
  }

  private createDailyRoutine(hoursPerDay: number, learningStyle: string): any {
    const routine = []

    if (hoursPerDay >= 3) {
      routine.push({
        time: 'Morning (30 min)',
        activity: 'Review flashcards and key concepts',
        type: 'revision',
      })
      routine.push({
        time: `Main session (${hoursPerDay - 1} hours)`,
        activity: 'Deep study based on weekly schedule',
        type: 'learning',
      })
      routine.push({
        time: 'Evening (30 min)',
        activity: 'Practice questions and review',
        type: 'practice',
      })
    } else if (hoursPerDay >= 1) {
      routine.push({
        time: `Study session (${hoursPerDay * 60} min)`,
        activity: 'Focused study on daily topic',
        type: 'learning',
      })
    } else {
      routine.push({
        time: `Quick session (${hoursPerDay * 60} min)`,
        activity: 'Flashcards and quick review',
        type: 'revision',
      })
    }

    return routine
  }

  private formatStudyPlan(plan: any): string {
    return `
📅 **Personalized PMP Study Plan**

**Timeline Overview:**
- Days until exam: ${plan.daysUntilExam}
- Total study hours available: ${plan.totalAvailableHours}
- Average daily commitment: ${Math.round(plan.totalAvailableHours / plan.daysUntilExam)} hours

**Study Phases:**
${plan.phases
  .map(
    (phase) => `
**${phase.name}** (${phase.duration} days)
- Focus: ${phase.focus}
- Intensity: ${phase.intensity}
`
  )
  .join('\n')}

**Weekly Schedule Template:**
${Object.entries(plan.weeklySchedule)
  .map(
    ([day, dayPlan]: [string, any]) => `
**${day.charAt(0).toUpperCase() + day.slice(1)}:** ${dayPlan.focus}
${dayPlan.activities.map((a) => `  - ${a.activity} (${a.duration} min)`).join('\n')}
`
  )
  .join('\n')}

**Key Milestones:**
${plan.milestones
  .map(
    (m) => `
Week ${m.week}: ${m.label}
- Target Score: ${m.targetScore}%
- Assessment: ${m.assessment}
- Success Criteria: ${m.successCriteria}
`
  )
  .join('\n')}

**Resource Allocation:**
- Weak Areas: ${plan.resourceAllocation.timeAllocation.weakAreas} hours (40%)
- Strong Areas: ${plan.resourceAllocation.timeAllocation.strongAreas} hours (15%)
- Practice Questions: ${plan.resourceAllocation.timeAllocation.practice} hours (25%)
- Mock Exams: ${plan.resourceAllocation.timeAllocation.mockExams} hours (15%)
- Review & Revision: ${plan.resourceAllocation.timeAllocation.review} hours (5%)

**Recommended Resources:**
Primary: ${plan.resourceAllocation.resources.primary.join(', ')}
Supplementary: ${plan.resourceAllocation.resources.supplementary.join(', ')}

**Daily Routine:**
${plan.dailyRoutine.map((r) => `- ${r.time}: ${r.activity}`).join('\n')}

**Success Tips:**
1. Stick to the schedule but be flexible with topics based on progress
2. Take breaks every 45-60 minutes during study sessions
3. Review previous day's learning before starting new topics
4. Track your progress and adjust intensity as needed
5. Join study groups for motivation and discussion
    `.trim()
  }
}
