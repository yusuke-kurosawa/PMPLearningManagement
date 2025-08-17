/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ export const mockPmbokProcesses = [
  {
    id: '4.1',
    name: 'Develop Project Charter',
    knowledgeArea: 'Integration Management',
    processGroup: 'Initiating',
    inputs: [
      'Business documents',
      'Agreements',
      'Enterprise environmental factors',
      'Organizational process assets',
    ],
    tools: ['Expert judgment', 'Data gathering', 'Interpersonal and team skills', 'Meetings'],
    outputs: ['Project charter', 'Assumption log'],
    description:
      'The process of developing a document that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
  },
  {
    id: '4.2',
    name: 'Develop Project Management Plan',
    knowledgeArea: 'Integration Management',
    processGroup: 'Planning',
    inputs: [
      'Project charter',
      'Outputs from other processes',
      'Enterprise environmental factors',
      'Organizational process assets',
    ],
    tools: ['Expert judgment', 'Data gathering', 'Interpersonal and team skills', 'Meetings'],
    outputs: ['Project management plan'],
    description:
      'The process of defining, preparing, and coordinating all subsidiary plans and integrating them into a comprehensive project management plan.',
  },
  {
    id: '5.1',
    name: 'Plan Scope Management',
    knowledgeArea: 'Scope Management',
    processGroup: 'Planning',
    inputs: [
      'Project charter',
      'Project management plan',
      'Enterprise environmental factors',
      'Organizational process assets',
    ],
    tools: ['Expert judgment', 'Data analysis', 'Meetings'],
    outputs: ['Scope management plan', 'Requirements management plan'],
    description:
      'The process of creating a scope management plan that documents how the project and product scope will be defined, validated, and controlled.',
  },
]

export const mockKnowledgeAreas = [
  'Integration Management',
  'Scope Management',
  'Schedule Management',
  'Cost Management',
  'Quality Management',
  'Resource Management',
  'Communications Management',
  'Risk Management',
  'Procurement Management',
  'Stakeholder Management',
]

export const mockProcessGroups = [
  'Initiating',
  'Planning',
  'Executing',
  'Monitoring and Controlling',
  'Closing',
]

export const mockGlossaryTerms = [
  {
    id: 'acceptance-criteria',
    term: 'Acceptance Criteria',
    definition: 'A set of conditions that is required to be met before deliverables are accepted.',
    category: 'Quality Management',
    relatedTerms: ['Definition of Done', 'Quality Requirements', 'Acceptance Testing'],
  },
  {
    id: 'activity',
    term: 'Activity',
    definition: 'A distinct, scheduled portion of work performed during the course of a project.',
    category: 'Schedule Management',
    relatedTerms: ['Task', 'Work Package', 'Schedule Activity'],
  },
  {
    id: 'agile',
    term: 'Agile',
    definition:
      'A term used to describe a mindset of values and principles as set forth in the Agile Manifesto.',
    category: 'Project Management Approach',
    relatedTerms: ['Scrum', 'Kanban', 'Iterative Development'],
  },
]

export const mockExamQuestions = [
  {
    id: 1,
    question: 'Which of the following is NOT one of the five process groups in PMBOK?',
    options: ['Initiating', 'Planning', 'Testing', 'Executing'],
    correct: 2,
    knowledgeArea: 'Integration Management',
    processGroup: 'General',
    explanation:
      'Testing is not one of the five process groups. The five process groups are: Initiating, Planning, Executing, Monitoring and Controlling, and Closing.',
  },
  {
    id: 2,
    question: 'What is the primary output of the Develop Project Charter process?',
    options: [
      'Project management plan',
      'Project charter',
      'Scope statement',
      'Work breakdown structure',
    ],
    correct: 1,
    knowledgeArea: 'Integration Management',
    processGroup: 'Initiating',
    explanation:
      'The primary output of the Develop Project Charter process is the Project Charter, which formally authorizes the existence of a project.',
  },
  {
    id: 3,
    question: 'Which knowledge area includes the Create WBS process?',
    options: [
      'Integration Management',
      'Scope Management',
      'Schedule Management',
      'Quality Management',
    ],
    correct: 1,
    knowledgeArea: 'Scope Management',
    processGroup: 'Planning',
    explanation:
      'Create WBS is part of the Scope Management knowledge area and involves subdividing project deliverables and project work into smaller, more manageable components.',
  },
]

export const mockProgressData = {
  totalProcesses: 49,
  completedProcesses: 3,
  knowledgeAreaProgress: {
    'Integration Management': { completed: 2, total: 7 },
    'Scope Management': { completed: 1, total: 6 },
    'Schedule Management': { completed: 0, total: 6 },
    'Cost Management': { completed: 0, total: 4 },
    'Quality Management': { completed: 0, total: 3 },
    'Resource Management': { completed: 0, total: 6 },
    'Communications Management': { completed: 0, total: 3 },
    'Risk Management': { completed: 0, total: 7 },
    'Procurement Management': { completed: 0, total: 3 },
    'Stakeholder Management': { completed: 0, total: 4 },
  },
  processGroupProgress: {
    Initiating: { completed: 1, total: 2 },
    Planning: { completed: 2, total: 24 },
    Executing: { completed: 0, total: 10 },
    'Monitoring and Controlling': { completed: 0, total: 12 },
    Closing: { completed: 0, total: 1 },
  },
  studyTime: 120, // minutes
  lastStudyDate: '2025-08-08T10:30:00Z',
}
