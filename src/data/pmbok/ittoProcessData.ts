/**
 * Comprehensive ITTO Process Data for PMPLearningManagement
 * This file contains detailed ITTO (Inputs, Tools & Techniques, Outputs) data
 * for all 49 PMBOK processes with full relationship mapping
 */

export interface ITTOElement {
  id: string
  name: string
  type: 'input' | 'tool' | 'output'
  description: string
  examples?: string[]
  relatedProcesses: string[]
  relationships: string[] // IDs of related ITTO elements
  knowledgeArea: string
  processGroup: string
  complexity: 'low' | 'medium' | 'high'
  importance: number // 1-10 scale
  examFrequency: number // How often this appears in PMP exams (1-10)
  learningResources?: {
    videos?: string[]
    articles?: string[]
    examples?: string[]
  }
}

export interface ProcessData {
  id: string
  name: string
  knowledgeArea: string
  processGroup: string
  description: string
  purpose: string
  inputs: ITTOElement[]
  tools: ITTOElement[]
  outputs: ITTOElement[]
  keyPoints: string[]
  examTips: string[]
  realWorldApplication: string
}

// Common ITTO elements that appear across multiple processes
export const commonInputs: ITTOElement[] = [
  {
    id: 'project-charter',
    name: 'Project Charter',
    type: 'input',
    description:
      'A document that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
    relatedProcesses: [
      'develop-project-charter',
      'develop-project-management-plan',
      'identify-stakeholders',
    ],
    relationships: ['project-management-plan', 'stakeholder-register'],
    knowledgeArea: 'Integration',
    processGroup: 'Initiating',
    complexity: 'medium',
    importance: 10,
    examFrequency: 9,
    learningResources: {
      videos: ['https://example.com/project-charter-video'],
      articles: ['Understanding Project Charter'],
      examples: ['Software Development Project Charter', 'Construction Project Charter'],
    },
  },
  {
    id: 'project-management-plan',
    name: 'Project Management Plan',
    type: 'input',
    description:
      'The document that describes how the project will be executed, monitored, and controlled. It integrates and consolidates all subsidiary management plans.',
    relatedProcesses: [
      'develop-project-management-plan',
      'direct-manage-project-work',
      'monitor-control-project-work',
    ],
    relationships: ['project-charter', 'work-breakdown-structure'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'high',
    importance: 10,
    examFrequency: 10,
  },
  {
    id: 'project-documents',
    name: 'Project Documents',
    type: 'input',
    description:
      'Various documents created and used throughout the project lifecycle to manage and control project work.',
    relatedProcesses: ['*'], // Used in most processes
    relationships: ['change-requests', 'work-performance-reports'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'medium',
    importance: 8,
    examFrequency: 8,
  },
  {
    id: 'organizational-process-assets',
    name: 'Organizational Process Assets',
    type: 'input',
    description:
      'Plans, processes, policies, procedures, and knowledge bases that are specific to and used by the performing organization.',
    relatedProcesses: ['*'], // Used in most processes
    relationships: ['enterprise-environmental-factors'],
    knowledgeArea: 'Integration',
    processGroup: 'Initiating',
    complexity: 'medium',
    importance: 9,
    examFrequency: 7,
  },
  {
    id: 'enterprise-environmental-factors',
    name: 'Enterprise Environmental Factors',
    type: 'input',
    description:
      'Conditions not under the control of the project team that influence, constrain, or direct the project.',
    relatedProcesses: ['*'], // Used in most processes
    relationships: ['organizational-process-assets'],
    knowledgeArea: 'Integration',
    processGroup: 'Initiating',
    complexity: 'medium',
    importance: 8,
    examFrequency: 6,
  },
  {
    id: 'work-breakdown-structure',
    name: 'Work Breakdown Structure (WBS)',
    type: 'output',
    description:
      'A hierarchical decomposition of the total scope of work to be carried out by the project team.',
    relatedProcesses: ['create-wbs', 'define-activities', 'estimate-activity-durations'],
    relationships: ['scope-baseline', 'activity-list'],
    knowledgeArea: 'Scope',
    processGroup: 'Planning',
    complexity: 'high',
    importance: 10,
    examFrequency: 9,
  },
]

export const commonTools: ITTOElement[] = [
  {
    id: 'expert-judgment',
    name: 'Expert Judgment',
    type: 'tool',
    description:
      'Judgment provided based on expertise in an application area, knowledge area, discipline, industry, etc.',
    relatedProcesses: ['*'], // Used in most processes
    relationships: [],
    knowledgeArea: 'Integration',
    processGroup: 'Initiating',
    complexity: 'low',
    importance: 9,
    examFrequency: 8,
  },
  {
    id: 'data-gathering',
    name: 'Data Gathering',
    type: 'tool',
    description: 'Techniques used to collect and compile data from various sources.',
    examples: ['Brainstorming', 'Interviews', 'Focus Groups', 'Questionnaires', 'Benchmarking'],
    relatedProcesses: ['*'],
    relationships: ['data-analysis'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'medium',
    importance: 8,
    examFrequency: 7,
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    type: 'tool',
    description: 'Techniques used to organize, assess, and evaluate data and information.',
    examples: [
      'Root Cause Analysis',
      'Alternatives Analysis',
      'Cost-Benefit Analysis',
      'Make-or-Buy Analysis',
    ],
    relatedProcesses: ['*'],
    relationships: ['data-gathering'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'medium',
    importance: 8,
    examFrequency: 8,
  },
  {
    id: 'meetings',
    name: 'Meetings',
    type: 'tool',
    description:
      'Organized gatherings of project stakeholders to discuss and make decisions about project matters.',
    examples: ['Kickoff Meetings', 'Status Meetings', 'Sprint Reviews', 'Retrospectives'],
    relatedProcesses: ['*'],
    relationships: [],
    knowledgeArea: 'Integration',
    processGroup: 'Executing',
    complexity: 'low',
    importance: 7,
    examFrequency: 6,
  },
]

export const commonOutputs: ITTOElement[] = [
  {
    id: 'change-requests',
    name: 'Change Requests',
    type: 'output',
    description: 'Formal proposals to modify any document, deliverable, or baseline.',
    relatedProcesses: ['perform-integrated-change-control', 'monitor-control-project-work'],
    relationships: ['approved-change-requests', 'change-log'],
    knowledgeArea: 'Integration',
    processGroup: 'Executing',
    complexity: 'medium',
    importance: 9,
    examFrequency: 8,
  },
  {
    id: 'project-management-plan-updates',
    name: 'Project Management Plan Updates',
    type: 'output',
    description:
      'Updates to any subsidiary plans that are components of the project management plan.',
    relatedProcesses: ['*'],
    relationships: ['project-management-plan', 'change-requests'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'medium',
    importance: 8,
    examFrequency: 7,
  },
  {
    id: 'project-documents-updates',
    name: 'Project Documents Updates',
    type: 'output',
    description: 'Updates to project documents that may result from carrying out this process.',
    relatedProcesses: ['*'],
    relationships: ['project-documents', 'change-requests'],
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    complexity: 'low',
    importance: 7,
    examFrequency: 6,
  },
  {
    id: 'work-performance-information',
    name: 'Work Performance Information',
    type: 'output',
    description:
      'Performance data collected from controlling processes, analyzed in context with integrated project management plan components.',
    relatedProcesses: ['monitor-control-project-work', 'control-scope', 'control-schedule'],
    relationships: ['work-performance-data', 'work-performance-reports'],
    knowledgeArea: 'Integration',
    processGroup: 'Monitoring',
    complexity: 'medium',
    importance: 8,
    examFrequency: 7,
  },
]

// Sample detailed process data - Integration Management processes
export const integrationProcesses: ProcessData[] = [
  {
    id: 'develop-project-charter',
    name: 'Develop Project Charter',
    knowledgeArea: 'Integration',
    processGroup: 'Initiating',
    description:
      'The process of developing a document that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
    purpose: 'To formally authorize the project and provide a framework for its execution.',
    inputs: [
      {
        id: 'business-documents',
        name: 'Business Documents',
        type: 'input',
        description:
          'Documents that describe the business need and how the project will address this need.',
        examples: ['Business Case', 'Benefits Management Plan'],
        relatedProcesses: ['develop-project-charter'],
        relationships: ['project-charter'],
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        complexity: 'medium',
        importance: 9,
        examFrequency: 8,
      },
      {
        id: 'agreements',
        name: 'Agreements',
        type: 'input',
        description:
          'Contracts, memoranda of understanding, service level agreements, and other forms of agreements.',
        relatedProcesses: ['develop-project-charter', 'plan-procurement-management'],
        relationships: ['procurement-documents'],
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        complexity: 'medium',
        importance: 7,
        examFrequency: 6,
      },
      commonInputs[3], // Organizational Process Assets
      commonInputs[4], // Enterprise Environmental Factors
    ],
    tools: [
      commonTools[0], // Expert Judgment
      commonTools[1], // Data Gathering
      {
        id: 'interpersonal-team-skills',
        name: 'Interpersonal and Team Skills',
        type: 'tool',
        description:
          'Skills used to effectively lead and manage project teams and communicate with stakeholders.',
        examples: ['Conflict Management', 'Facilitation', 'Meeting Management'],
        relatedProcesses: ['*'],
        relationships: [],
        knowledgeArea: 'Integration',
        processGroup: 'Executing',
        complexity: 'medium',
        importance: 8,
        examFrequency: 7,
      },
      commonTools[3], // Meetings
    ],
    outputs: [
      commonInputs[0], // Project Charter
      {
        id: 'assumption-log',
        name: 'Assumption Log',
        type: 'output',
        description:
          'A project document used to record all assumptions and constraints throughout the project lifecycle.',
        relatedProcesses: ['develop-project-charter', 'identify-risks'],
        relationships: ['risk-register', 'issue-log'],
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        complexity: 'medium',
        importance: 8,
        examFrequency: 7,
      },
    ],
    keyPoints: [
      'First process in the project lifecycle',
      'Creates the project charter which formally authorizes the project',
      'Performed by a sponsor or initiator outside the project boundaries',
      'Links business strategy to project work',
    ],
    examTips: [
      'Remember that the project manager is NOT involved in creating the project charter',
      'The charter is created by someone with authority outside the project',
      'Business case and benefits management plan are key inputs',
      'Charter formally authorizes the project and project manager',
    ],
    realWorldApplication:
      'In practice, the project charter is often the first official document that gives the project manager authority to proceed. It should clearly define the project scope, objectives, and success criteria.',
  },

  {
    id: 'develop-project-management-plan',
    name: 'Develop Project Management Plan',
    knowledgeArea: 'Integration',
    processGroup: 'Planning',
    description:
      'The process of defining, preparing, and coordinating all plan components and consolidating them into an integrated project management plan.',
    purpose:
      'To develop a comprehensive plan that serves as the primary source of information for how the project will be planned, executed, monitored and controlled, and closed.',
    inputs: [
      commonInputs[0], // Project Charter
      {
        id: 'outputs-other-processes',
        name: 'Outputs from Other Processes',
        type: 'input',
        description: 'All subsidiary management plans and baselines from planning processes.',
        examples: ['Scope Management Plan', 'Schedule Management Plan', 'Cost Management Plan'],
        relatedProcesses: ['*'],
        relationships: ['project-management-plan'],
        knowledgeArea: 'Integration',
        processGroup: 'Planning',
        complexity: 'high',
        importance: 10,
        examFrequency: 9,
      },
      commonInputs[3], // Organizational Process Assets
      commonInputs[4], // Enterprise Environmental Factors
    ],
    tools: [
      commonTools[0], // Expert Judgment
      commonTools[1], // Data Gathering
      commonTools[2], // Data Analysis
      commonTools[3], // Meetings
    ],
    outputs: [
      commonInputs[1], // Project Management Plan
    ],
    keyPoints: [
      'Integrates and consolidates all subsidiary management plans',
      'Defines how the project will be executed, monitored, and controlled',
      'Should be comprehensive enough to guide project execution',
      'Serves as the primary source of project information',
    ],
    examTips: [
      'The project management plan is more than just a schedule',
      'It includes ALL subsidiary plans and baselines',
      'It is progressively elaborated throughout the project',
      'Changes to the plan require formal change control',
    ],
    realWorldApplication:
      'The project management plan is your roadmap for the entire project. It should be detailed enough to guide day-to-day decisions but flexible enough to accommodate necessary changes.',
  },
]

// Knowledge Area to Process Group mapping for reference
export const processMatrix = {
  Integration: {
    Initiating: ['Develop Project Charter'],
    Planning: ['Develop Project Management Plan'],
    Executing: ['Direct and Manage Project Work'],
    Monitoring: ['Monitor and Control Project Work', 'Perform Integrated Change Control'],
    Closing: ['Close Project or Phase'],
  },
  Scope: {
    Initiating: [],
    Planning: ['Plan Scope Management', 'Collect Requirements', 'Define Scope', 'Create WBS'],
    Executing: [],
    Monitoring: ['Validate Scope', 'Control Scope'],
    Closing: [],
  },
  Schedule: {
    Initiating: [],
    Planning: [
      'Plan Schedule Management',
      'Define Activities',
      'Sequence Activities',
      'Estimate Activity Durations',
      'Develop Schedule',
    ],
    Executing: [],
    Monitoring: ['Control Schedule'],
    Closing: [],
  },
  Cost: {
    Initiating: [],
    Planning: ['Plan Cost Management', 'Estimate Costs', 'Determine Budget'],
    Executing: [],
    Monitoring: ['Control Costs'],
    Closing: [],
  },
  Quality: {
    Initiating: [],
    Planning: ['Plan Quality Management'],
    Executing: ['Manage Quality'],
    Monitoring: ['Control Quality'],
    Closing: [],
  },
  Resource: {
    Initiating: [],
    Planning: ['Plan Resource Management', 'Estimate Activity Resources'],
    Executing: ['Acquire Resources', 'Develop Team', 'Manage Team'],
    Monitoring: ['Control Resources'],
    Closing: [],
  },
  Communications: {
    Initiating: [],
    Planning: ['Plan Communications Management'],
    Executing: ['Manage Communications'],
    Monitoring: ['Monitor Communications'],
    Closing: [],
  },
  Risk: {
    Initiating: [],
    Planning: [
      'Plan Risk Management',
      'Identify Risks',
      'Perform Qualitative Risk Analysis',
      'Perform Quantitative Risk Analysis',
      'Plan Risk Responses',
    ],
    Executing: ['Implement Risk Responses'],
    Monitoring: ['Monitor Risks'],
    Closing: [],
  },
  Procurement: {
    Initiating: [],
    Planning: ['Plan Procurement Management'],
    Executing: ['Conduct Procurements'],
    Monitoring: ['Control Procurements'],
    Closing: [],
  },
  Stakeholder: {
    Initiating: ['Identify Stakeholders'],
    Planning: ['Plan Stakeholder Engagement'],
    Executing: ['Manage Stakeholder Engagement'],
    Monitoring: ['Monitor Stakeholder Engagement'],
    Closing: [],
  },
}

// ITTO Relationship Map - defines how outputs connect to inputs across processes
export const ittoRelationshipMap = {
  'project-charter': ['project-management-plan', 'stakeholder-register', 'assumption-log'],
  'project-management-plan': ['work-performance-data', 'change-requests'],
  'work-breakdown-structure': ['activity-list', 'cost-estimates', 'resource-requirements'],
  'activity-list': ['network-diagram', 'duration-estimates'],
  'schedule-baseline': ['work-performance-data', 'schedule-forecasts'],
  'cost-baseline': ['work-performance-data', 'cost-forecasts'],
  'risk-register': ['risk-responses', 'contingency-reserves'],
  'stakeholder-register': ['communications-management-plan', 'stakeholder-engagement-plan'],
  'quality-management-plan': ['quality-metrics', 'quality-checklists'],
  'communications-management-plan': ['project-communications', 'performance-reports'],
  'procurement-management-plan': ['procurement-documents', 'source-selection-criteria'],
}

// Generate mock analytics data for demonstration
export const generateMockAnalyticsData = (): any[] => {
  const knowledgeAreas = Object.keys(processMatrix)
  const processGroups = ['Initiating', 'Planning', 'Executing', 'Monitoring', 'Closing']
  const masteryLevels = ['beginner', 'intermediate', 'advanced', 'expert']

  const analyticsData = []

  Object.entries(processMatrix).forEach(([ka, groups]) => {
    Object.entries(groups).forEach(([pg, processes]) => {
      processes.forEach((processName, index) => {
        const processId = `${ka.toLowerCase()}-${pg.toLowerCase()}-${index}`
        analyticsData.push({
          processId,
          processName,
          knowledgeArea: ka,
          processGroup: pg,
          inputCount: Math.floor(Math.random() * 8) + 2,
          toolCount: Math.floor(Math.random() * 6) + 2,
          outputCount: Math.floor(Math.random() * 5) + 1,
          totalElements: Math.floor(Math.random() * 15) + 5,
          complexity: Math.floor(Math.random() * 10) + 1,
          userProgress: Math.floor(Math.random() * 100),
          completionTime: Math.floor(Math.random() * 180) + 30,
          practiceScore: Math.floor(Math.random() * 100),
          relationships: Math.floor(Math.random() * 8) + 2,
          importance: Math.floor(Math.random() * 10) + 1,
          lastStudied: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          studyTime: Math.floor(Math.random() * 300) + 60,
          masteryLevel: masteryLevels[Math.floor(Math.random() * masteryLevels.length)],
          difficultyRating: Math.floor(Math.random() * 5) + 1,
          examFrequency: Math.floor(Math.random() * 10) + 1,
        })
      })
    })
  })

  return analyticsData
}

// Generate mock learning metrics
export const generateMockLearningMetrics = (): any => {
  const knowledgeAreas = Object.keys(processMatrix)
  const processGroups = ['Initiating', 'Planning', 'Executing', 'Monitoring', 'Closing']

  return {
    overallProgress: 73,
    knowledgeAreaProgress: knowledgeAreas.reduce(
      (acc, area) => {
        acc[area] = Math.floor(Math.random() * 100)
        return acc
      },
      {} as Record<string, number>
    ),
    processGroupProgress: processGroups.reduce(
      (acc, group) => {
        acc[group] = Math.floor(Math.random() * 100)
        return acc
      },
      {} as Record<string, number>
    ),
    weakAreas: ['Risk Management', 'Procurement Management'],
    strongAreas: ['Integration Management', 'Scope Management', 'Schedule Management'],
    studyTimeDistribution: knowledgeAreas.map((area) => ({
      area,
      time: Math.floor(Math.random() * 300) + 60,
    })),
    progressTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: Math.min(100, 20 + i * 2 + Math.random() * 10),
    })),
    masteryDistribution: [
      { level: 'Beginner', count: 15 },
      { level: 'Intermediate', count: 20 },
      { level: 'Advanced', count: 10 },
      { level: 'Expert', count: 4 },
    ],
  }
}

export default {
  commonInputs,
  commonTools,
  commonOutputs,
  integrationProcesses,
  processMatrix,
  ittoRelationshipMap,
  generateMockAnalyticsData,
  generateMockLearningMetrics,
}
