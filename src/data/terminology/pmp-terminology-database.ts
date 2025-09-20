/**
 * PMP Terminology Database
 * Complete PMBOK 6th and 7th Edition terminology with context rules and validation patterns
 */

export interface TerminologyEntry {
  id: string
  term: string
  canonical: string // The correct, official term
  aliases: string[] // Alternative acceptable terms
  deprecated: string[] // Terms that should not be used
  acronym?: string
  expansion?: string // Full form of acronym
  definition: string
  context: TermContext[]
  pmbok6?: boolean
  pmbok7?: boolean
  knowledgeArea?: string[]
  processGroup?: string[]
  severity: 'error' | 'warning' | 'suggestion'
  autofix: boolean
  pattern?: RegExp // Pattern for detection
  excludePattern?: RegExp // Pattern to exclude false positives
}

export interface TermContext {
  type: 'code' | 'documentation' | 'comment' | 'ui' | 'api'
  required: boolean
  example: string
  antiPattern?: string
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  pattern: RegExp
  replacement?: string
  context?: string[]
  fileTypes: string[]
}

// Complete PMP Terminology Database
export const pmpTerminologyDatabase: TerminologyEntry[] = [
  // Project Management Fundamentals
  {
    id: 'pm-001',
    term: 'Project',
    canonical: 'Project',
    aliases: [],
    deprecated: ['job', 'task', 'assignment'],
    definition: 'A temporary endeavor undertaken to create a unique product, service, or result',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The project aims to deliver a new learning management system',
        antiPattern: 'The job aims to deliver...',
      },
      {
        type: 'code',
        required: true,
        example: 'const projectData = { name: "PMP Learning", ... }',
        antiPattern: 'const jobData = { name: "PMP Learning", ... }',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'error',
    autofix: true,
    pattern: /\b(job|task|assignment)\b(?![\w-])/gi,
    excludePattern:
      /\b(job[\s-]?(title|description|role)|task[\s-]?(list|manager)|assignment[\s-]?operator)\b/gi,
  },
  {
    id: 'pm-002',
    term: 'Project Management',
    canonical: 'Project Management',
    aliases: ['PM'],
    deprecated: ['project administration', 'project coordination'],
    acronym: 'PM',
    expansion: 'Project Management',
    definition:
      'The application of knowledge, skills, tools, and techniques to project activities to meet project requirements',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Project Management involves planning, executing, and controlling',
        antiPattern: 'Project administration involves...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\bproject\s+(administration|coordination)\b/gi,
  },
  {
    id: 'pm-003',
    term: 'Project Manager',
    canonical: 'Project Manager',
    aliases: ['PM', 'PjM'],
    deprecated: ['project coordinator', 'project lead', 'project admin'],
    acronym: 'PM',
    expansion: 'Project Manager',
    definition:
      'The person assigned by the performing organization to lead the team responsible for achieving project objectives',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Project Manager is responsible for overall project success',
        antiPattern: 'The project coordinator is responsible...',
      },
      {
        type: 'code',
        required: false,
        example: 'role: "Project Manager"',
        antiPattern: 'role: "project lead"',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\bproject\s+(coordinator|lead|admin)\b/gi,
  },

  // PMBOK and PMI Terms
  {
    id: 'pmi-001',
    term: 'PMBOK',
    canonical: 'PMBOK® Guide',
    aliases: ['PMBOK Guide', 'Project Management Body of Knowledge'],
    deprecated: ['PMBOK standard', 'PMBoK', 'pmbok'],
    acronym: 'PMBOK',
    expansion: 'Project Management Body of Knowledge',
    definition: 'A Guide to the Project Management Body of Knowledge published by PMI',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'According to the PMBOK® Guide',
        antiPattern: 'According to PMBOK standard',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\b(PMBoK|pmbok(?!\s+Guide)|PMBOK\s+standard)\b/g,
  },
  {
    id: 'pmi-002',
    term: 'PMI',
    canonical: 'PMI',
    aliases: ['Project Management Institute'],
    deprecated: ['pmi', 'Pmi'],
    acronym: 'PMI',
    expansion: 'Project Management Institute',
    definition:
      'Project Management Institute - the leading professional association for project management',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'PMI standards and certifications',
        antiPattern: 'pmi standards',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\b(pmi|Pmi)\b(?![A-Z])/g,
  },

  // Knowledge Areas
  {
    id: 'ka-001',
    term: 'Knowledge Area',
    canonical: 'Knowledge Area',
    aliases: [],
    deprecated: ['knowledge domain', 'subject area'],
    definition: 'An identified area of project management defined by its knowledge requirements',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The ten Knowledge Areas in PMBOK',
        antiPattern: 'The ten knowledge domains',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    severity: 'error',
    autofix: true,
    pattern: /\bknowledge\s+(domain|subject\s+area)s?\b/gi,
  },
  {
    id: 'ka-002',
    term: 'Project Integration Management',
    canonical: 'Project Integration Management',
    aliases: ['Integration Management'],
    deprecated: ['project integration', 'integration area'],
    definition:
      'Includes the processes and activities to identify, define, combine, unify, and coordinate various processes',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Project Integration Management ensures coordination',
        antiPattern: 'Project integration ensures...',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    knowledgeArea: ['integration'],
    severity: 'warning',
    autofix: true,
    pattern: /\bproject\s+integration(?!\s+management)\b/gi,
  },
  {
    id: 'ka-003',
    term: 'Project Scope Management',
    canonical: 'Project Scope Management',
    aliases: ['Scope Management'],
    deprecated: ['scope planning', 'scope area'],
    definition:
      'Includes the processes required to ensure the project includes all the work required',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Project Scope Management defines boundaries',
        antiPattern: 'Scope planning defines...',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    knowledgeArea: ['scope'],
    severity: 'warning',
    autofix: true,
    pattern: /\b(?<!project\s)scope\s+(planning|area)\b/gi,
  },

  // Process Groups
  {
    id: 'pg-001',
    term: 'Process Group',
    canonical: 'Process Group',
    aliases: [],
    deprecated: ['process phase', 'process stage'],
    definition:
      'A logical grouping of project management processes to achieve specific project objectives',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The five Process Groups',
        antiPattern: 'The five process phases',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    severity: 'error',
    autofix: true,
    pattern: /\bprocess\s+(phase|stage)s?\b/gi,
  },
  {
    id: 'pg-002',
    term: 'Initiating',
    canonical: 'Initiating Process Group',
    aliases: ['Initiating'],
    deprecated: ['initiation', 'startup', 'kick-off phase'],
    definition: 'Processes performed to define a new project or a new phase of an existing project',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'During the Initiating Process Group',
        antiPattern: 'During the initiation phase',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    processGroup: ['initiating'],
    severity: 'warning',
    autofix: true,
    pattern: /\b(initiation|startup|kick-?off)\s+phase\b/gi,
  },
  {
    id: 'pg-003',
    term: 'Planning',
    canonical: 'Planning Process Group',
    aliases: ['Planning'],
    deprecated: ['planning phase', 'design phase'],
    definition: 'Processes required to establish the scope and define the course of action',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Planning Process Group establishes baselines',
        antiPattern: 'The planning phase establishes...',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    processGroup: ['planning'],
    severity: 'warning',
    autofix: true,
    pattern: /\b(planning|design)\s+phase\b/gi,
  },

  // Common ITTO Terms
  {
    id: 'itto-001',
    term: 'ITTO',
    canonical: 'ITTO',
    aliases: ['Inputs, Tools and Techniques, and Outputs'],
    deprecated: ['ITTOs', 'itto', 'I.T.T.O'],
    acronym: 'ITTO',
    expansion: 'Inputs, Tools and Techniques, and Outputs',
    definition: 'The inputs, tools and techniques, and outputs of each process',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Understanding ITTO is crucial',
        antiPattern: 'Understanding ITTOs is crucial',
      },
    ],
    pmbok6: true,
    pmbok7: false,
    severity: 'warning',
    autofix: true,
    pattern: /\b(ITTOs|itto|I\.T\.T\.O)\b/g,
  },
  {
    id: 'itto-002',
    term: 'Work Breakdown Structure',
    canonical: 'Work Breakdown Structure',
    aliases: ['WBS'],
    deprecated: ['work breakdown', 'task breakdown', 'activity list'],
    acronym: 'WBS',
    expansion: 'Work Breakdown Structure',
    definition: 'A hierarchical decomposition of the total scope of work',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Create the Work Breakdown Structure (WBS)',
        antiPattern: 'Create the work breakdown',
      },
      {
        type: 'code',
        required: false,
        example: 'const wbs = createWBS(project)',
        antiPattern: 'const taskBreakdown = ...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['scope'],
    severity: 'error',
    autofix: true,
    pattern: /\b(work\s+breakdown(?!\s+structure)|task\s+breakdown|activity\s+list)\b/gi,
  },

  // Earned Value Management Terms
  {
    id: 'evm-001',
    term: 'Earned Value',
    canonical: 'Earned Value',
    aliases: ['EV'],
    deprecated: ['earned', 'value earned', 'work value'],
    acronym: 'EV',
    expansion: 'Earned Value',
    definition: 'The measure of work performed expressed in terms of the budget authorized',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Calculate the Earned Value (EV)',
        antiPattern: 'Calculate the value earned',
      },
      {
        type: 'code',
        required: true,
        example: 'const earnedValue = calculateEV()',
        antiPattern: 'const earned = calculateEV()',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['cost'],
    severity: 'error',
    autofix: true,
    pattern: /\b(?<!earned\s)(earned|value\s+earned|work\s+value)\b(?!\s+value)/gi,
  },
  {
    id: 'evm-002',
    term: 'Planned Value',
    canonical: 'Planned Value',
    aliases: ['PV'],
    deprecated: ['planned', 'budgeted value', 'scheduled value'],
    acronym: 'PV',
    expansion: 'Planned Value',
    definition: 'The authorized budget assigned to scheduled work',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Compare Planned Value (PV) with Earned Value',
        antiPattern: 'Compare budgeted value with...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['cost'],
    severity: 'error',
    autofix: true,
    pattern: /\b(budgeted\s+value|scheduled\s+value)\b/gi,
  },
  {
    id: 'evm-003',
    term: 'Actual Cost',
    canonical: 'Actual Cost',
    aliases: ['AC'],
    deprecated: ['actual', 'real cost', 'incurred cost'],
    acronym: 'AC',
    expansion: 'Actual Cost',
    definition: 'The realized cost incurred for the work performed',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Actual Cost (AC) exceeded budget',
        antiPattern: 'The real cost exceeded...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['cost'],
    severity: 'warning',
    autofix: true,
    pattern: /\b(real\s+cost|incurred\s+cost)\b/gi,
  },
  {
    id: 'evm-004',
    term: 'Cost Performance Index',
    canonical: 'Cost Performance Index',
    aliases: ['CPI'],
    deprecated: ['cost index', 'performance index', 'cost efficiency'],
    acronym: 'CPI',
    expansion: 'Cost Performance Index',
    definition: 'A measure of the cost efficiency of budgeted resources (EV/AC)',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Cost Performance Index (CPI) is 0.95',
        antiPattern: 'The cost efficiency is 0.95',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['cost'],
    severity: 'error',
    autofix: true,
    pattern: /\b(?<!cost\s+performance\s)(cost\s+index|performance\s+index|cost\s+efficiency)\b/gi,
  },
  {
    id: 'evm-005',
    term: 'Schedule Performance Index',
    canonical: 'Schedule Performance Index',
    aliases: ['SPI'],
    deprecated: ['schedule index', 'time performance', 'schedule efficiency'],
    acronym: 'SPI',
    expansion: 'Schedule Performance Index',
    definition: 'A measure of schedule efficiency (EV/PV)',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Schedule Performance Index (SPI) indicates progress',
        antiPattern: 'The schedule efficiency indicates...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['schedule'],
    severity: 'error',
    autofix: true,
    pattern:
      /\b(?<!schedule\s+performance\s)(schedule\s+index|time\s+performance|schedule\s+efficiency)\b/gi,
  },

  // Risk Management Terms
  {
    id: 'risk-001',
    term: 'Risk',
    canonical: 'Risk',
    aliases: [],
    deprecated: ['issue', 'problem', 'concern'],
    definition:
      'An uncertain event or condition that, if it occurs, has a positive or negative effect on project objectives',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Identify project risks early',
        antiPattern: 'Identify project issues early',
      },
      {
        type: 'code',
        required: false,
        example: 'const riskRegister = []',
        antiPattern: 'const issuesList = []',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['risk'],
    severity: 'warning',
    autofix: false,
    pattern: /\b(issues?|problems?|concerns?)\b(?!\s+(log|tracker|management))/gi,
  },
  {
    id: 'risk-002',
    term: 'Risk Register',
    canonical: 'Risk Register',
    aliases: [],
    deprecated: ['risk list', 'risk log', 'risk database'],
    definition:
      'A document in which the results of risk analysis and risk response planning are recorded',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Update the Risk Register regularly',
        antiPattern: 'Update the risk list regularly',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['risk'],
    severity: 'error',
    autofix: true,
    pattern: /\brisk\s+(list|log|database)\b/gi,
  },
  {
    id: 'risk-003',
    term: 'Risk Response',
    canonical: 'Risk Response',
    aliases: ['Risk Response Strategy'],
    deprecated: ['risk mitigation', 'risk action', 'risk treatment'],
    definition:
      'The process of developing strategic options and actions to enhance opportunities and reduce threats',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Develop appropriate Risk Response strategies',
        antiPattern: 'Develop risk mitigation strategies',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['risk'],
    severity: 'warning',
    autofix: true,
    pattern: /\brisk\s+(mitigation|action|treatment)(?!\s+strategy)\b/gi,
  },

  // Quality Management Terms
  {
    id: 'quality-001',
    term: 'Quality Assurance',
    canonical: 'Quality Assurance',
    aliases: ['QA'],
    deprecated: ['quality check', 'quality testing'],
    acronym: 'QA',
    expansion: 'Quality Assurance',
    definition:
      'The process of auditing quality requirements and results to ensure appropriate quality standards',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Perform Quality Assurance activities',
        antiPattern: 'Perform quality testing activities',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['quality'],
    severity: 'warning',
    autofix: true,
    pattern: /\bquality\s+(check|testing)(?!\s+assurance)\b/gi,
  },
  {
    id: 'quality-002',
    term: 'Quality Control',
    canonical: 'Quality Control',
    aliases: ['QC'],
    deprecated: ['quality inspection', 'quality verification'],
    acronym: 'QC',
    expansion: 'Quality Control',
    definition: 'The process of monitoring and recording results of executing quality activities',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Quality Control measurements show improvement',
        antiPattern: 'Quality inspection shows...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['quality'],
    severity: 'warning',
    autofix: true,
    pattern: /\bquality\s+(inspection|verification)(?!\s+control)\b/gi,
  },

  // Stakeholder Management Terms
  {
    id: 'sh-001',
    term: 'Stakeholder',
    canonical: 'Stakeholder',
    aliases: [],
    deprecated: ['interested party', 'participant', 'involved party'],
    definition:
      'An individual, group, or organization that may affect or be affected by project decisions',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Engage stakeholders throughout the project',
        antiPattern: 'Engage interested parties...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['stakeholder'],
    severity: 'error',
    autofix: true,
    pattern: /\b(interested\s+part(y|ies)|participant|involved\s+part(y|ies))\b/gi,
  },
  {
    id: 'sh-002',
    term: 'Stakeholder Register',
    canonical: 'Stakeholder Register',
    aliases: [],
    deprecated: ['stakeholder list', 'stakeholder database'],
    definition: 'A project document that contains information about project stakeholders',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Maintain an updated Stakeholder Register',
        antiPattern: 'Maintain a stakeholder list',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['stakeholder'],
    severity: 'error',
    autofix: true,
    pattern: /\bstakeholder\s+(list|database)\b/gi,
  },

  // Agile and Adaptive Terms (PMBOK 7)
  {
    id: 'agile-001',
    term: 'Sprint',
    canonical: 'Sprint',
    aliases: [],
    deprecated: ['iteration', 'cycle', 'phase'],
    definition: 'A timeboxed iteration in Scrum framework',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Each Sprint lasts two weeks',
        antiPattern: 'Each iteration lasts...',
      },
      {
        type: 'code',
        required: false,
        example: 'const currentSprint = 5',
        antiPattern: 'const currentIteration = 5',
      },
    ],
    pmbok6: false,
    pmbok7: true,
    severity: 'suggestion',
    autofix: false,
    pattern: /\b(iteration|cycle)(?!\s+time)\b/gi,
  },
  {
    id: 'agile-002',
    term: 'Product Backlog',
    canonical: 'Product Backlog',
    aliases: [],
    deprecated: ['feature list', 'requirements list', 'wish list'],
    definition: 'An emergent, ordered list of what is needed to improve the product',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Prioritize the Product Backlog',
        antiPattern: 'Prioritize the feature list',
      },
    ],
    pmbok6: false,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\b(feature\s+list|requirements\s+list|wish\s+list)\b/gi,
  },
  {
    id: 'agile-003',
    term: 'User Story',
    canonical: 'User Story',
    aliases: [],
    deprecated: ['requirement', 'feature request', 'use case'],
    definition: 'A short description of functionality told from the user perspective',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Write User Stories for each feature',
        antiPattern: 'Write requirements for each feature',
      },
    ],
    pmbok6: false,
    pmbok7: true,
    severity: 'suggestion',
    autofix: false,
    pattern: /\b(feature\s+request|use\s+case)s?\b/gi,
  },

  // PMBOK 7 Performance Domains
  {
    id: 'pd-001',
    term: 'Performance Domain',
    canonical: 'Performance Domain',
    aliases: [],
    deprecated: ['knowledge area', 'domain', 'performance area'],
    definition: 'A group of related activities that are critical for effective project delivery',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The eight Performance Domains in PMBOK 7',
        antiPattern: 'The eight knowledge areas in PMBOK 7',
      },
    ],
    pmbok6: false,
    pmbok7: true,
    severity: 'error',
    autofix: true,
    pattern: /\b(knowledge\s+area|performance\s+area)s?\b(?!.*PMBOK\s*6)/gi,
  },
  {
    id: 'pd-002',
    term: 'Stakeholder Performance Domain',
    canonical: 'Stakeholder Performance Domain',
    aliases: [],
    deprecated: ['stakeholder management', 'stakeholder area'],
    definition: 'Performance domain dealing with stakeholder engagement and collaboration',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'The Stakeholder Performance Domain focuses on engagement',
        antiPattern: 'Stakeholder management focuses on...',
      },
    ],
    pmbok6: false,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\bstakeholder\s+(management|area)(?!.*PMBOK\s*6)/gi,
  },

  // Common Misused Terms
  {
    id: 'common-001',
    term: 'Deliverable',
    canonical: 'Deliverable',
    aliases: [],
    deprecated: ['output', 'result', 'product'],
    definition: 'Any unique and verifiable product, result, or capability to perform a service',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Project deliverables must be verified',
        antiPattern: 'Project outputs must be...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: false,
    pattern: /\b(outputs?|results?)(?!\s+of)\b/gi,
  },
  {
    id: 'common-002',
    term: 'Baseline',
    canonical: 'Baseline',
    aliases: [],
    deprecated: ['base plan', 'original plan', 'initial plan'],
    definition:
      'The approved version of a work product that can only be changed through formal change control',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Compare actual performance against the baseline',
        antiPattern: 'Compare against the original plan',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'error',
    autofix: true,
    pattern: /\b(base\s+plan|original\s+plan|initial\s+plan)\b/gi,
  },
  {
    id: 'common-003',
    term: 'Lessons Learned',
    canonical: 'Lessons Learned',
    aliases: [],
    deprecated: ['lessons learnt', 'project learnings', 'retrospective notes'],
    definition: 'Knowledge gained during a project which shows how project events were addressed',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Document Lessons Learned throughout the project',
        antiPattern: 'Document lessons learnt...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'warning',
    autofix: true,
    pattern: /\b(lessons\s+learnt|project\s+learnings|retrospective\s+notes)\b/gi,
  },
  {
    id: 'common-004',
    term: 'Change Request',
    canonical: 'Change Request',
    aliases: ['CR'],
    deprecated: ['change order', 'modification request', 'alteration request'],
    acronym: 'CR',
    expansion: 'Change Request',
    definition: 'A formal proposal to modify any document, deliverable, or baseline',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Submit a Change Request for scope modification',
        antiPattern: 'Submit a change order for...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    severity: 'error',
    autofix: true,
    pattern: /\b(change\s+order|modification\s+request|alteration\s+request)\b/gi,
  },
  {
    id: 'common-005',
    term: 'Work Package',
    canonical: 'Work Package',
    aliases: [],
    deprecated: ['task package', 'work unit', 'activity package'],
    definition: 'The work defined at the lowest level of the WBS',
    context: [
      {
        type: 'documentation',
        required: true,
        example: 'Each Work Package has a unique identifier',
        antiPattern: 'Each task package has...',
      },
    ],
    pmbok6: true,
    pmbok7: true,
    knowledgeArea: ['scope'],
    severity: 'error',
    autofix: true,
    pattern: /\b(task\s+package|work\s+unit|activity\s+package)\b/gi,
  },
]

// Validation Rules for Different Contexts
export const validationRules: ValidationRule[] = [
  {
    id: 'rule-001',
    name: 'Consistent Acronym Usage',
    description: 'Ensure acronyms are consistently capitalized',
    severity: 'warning',
    pattern: /\b(pm|pmi|pmp|wbs|evm|qa|qc)\b(?![a-z])/gi,
    fileTypes: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.md'],
  },
  {
    id: 'rule-002',
    name: 'Process Group vs Phase',
    description: 'Use "Process Group" not "Phase" for PMBOK processes',
    severity: 'error',
    pattern: /\b(initiating|planning|executing|monitoring|closing)\s+phase\b/gi,
    replacement: '$1 Process Group',
    fileTypes: ['*.md', '*.tsx', '*.ts'],
  },
  {
    id: 'rule-003',
    name: 'PMBOK Version Consistency',
    description: 'Specify PMBOK version when referencing version-specific content',
    severity: 'info',
    pattern: /\bPMBOK(?!\s*(6th|7th|Guide|®))/g,
    context: ['documentation'],
    fileTypes: ['*.md'],
  },
  {
    id: 'rule-004',
    name: 'Registered Trademark Usage',
    description: 'Use registered trademark symbol for PMI terms',
    severity: 'info',
    pattern: /\b(PMP|PMBOK|PMI|CAPM|PgMP)(?!®)/g,
    context: ['documentation'],
    fileTypes: ['*.md'],
  },
  {
    id: 'rule-005',
    name: 'Hyphenation Consistency',
    description: 'Ensure consistent hyphenation in compound terms',
    severity: 'warning',
    pattern: /\b(kick\s+off|sign\s+off|hand\s+off)\b/gi,
    replacement: '$1-$2',
    fileTypes: ['*.md', '*.tsx', '*.ts'],
  },
]

// Context-Specific Rules
export const contextRules = {
  code: {
    variableNaming: [
      { pattern: /\b(proj|prj|projct)\b/gi, replacement: 'project' },
      { pattern: /\b(mgr|mngr|manager)\b/gi, replacement: 'manager' },
      { pattern: /\b(sched|schdl)\b/gi, replacement: 'schedule' },
    ],
    classNaming: [
      { pattern: /ProjectMgr/g, replacement: 'ProjectManager' },
      { pattern: /WrkPackage/g, replacement: 'WorkPackage' },
    ],
  },
  documentation: {
    formalTerms: [
      { pattern: /\bgonna\b/gi, replacement: 'going to' },
      { pattern: /\bwanna\b/gi, replacement: 'want to' },
      { pattern: /\bgotta\b/gi, replacement: 'have to' },
    ],
    consistency: [
      { pattern: /\bproject manager\b/g, replacement: 'Project Manager' },
      { pattern: /\bwork breakdown structure\b/g, replacement: 'Work Breakdown Structure' },
    ],
  },
  ui: {
    labels: [
      {
        pattern: /\bPM\b(?!\s*[:\-])/g,
        context: 'Should expand PM to Project Manager in UI labels',
      },
      { pattern: /\bWBS\b(?!\s*[:\-])/g, context: 'Should expand WBS in UI for clarity' },
    ],
  },
}

// Severity Levels and Actions
export const severityConfig = {
  error: {
    blockMerge: true,
    requireFix: true,
    autofix: true,
    message: '❌ PMP Terminology Error: Must be fixed before merge',
  },
  warning: {
    blockMerge: false,
    requireFix: false,
    autofix: true,
    message: '⚠️ PMP Terminology Warning: Should be fixed for consistency',
  },
  suggestion: {
    blockMerge: false,
    requireFix: false,
    autofix: false,
    message: '💡 PMP Terminology Suggestion: Consider using standard terminology',
  },
  info: {
    blockMerge: false,
    requireFix: false,
    autofix: false,
    message: 'ℹ️ PMP Terminology Note: FYI - standard usage recommendation',
  },
}

// Regional Variations
export const regionalVariations = {
  US: {
    spelling: [
      { uk: 'organisation', us: 'organization' },
      { uk: 'realise', us: 'realize' },
      { uk: 'optimise', us: 'optimize' },
      { uk: 'analyse', us: 'analyze' },
    ],
  },
  UK: {
    spelling: [
      { us: 'organization', uk: 'organisation' },
      { us: 'realize', uk: 'realise' },
      { us: 'optimize', uk: 'optimise' },
      { us: 'analyze', uk: 'analyse' },
    ],
  },
}

// Learning Resources Mapping
export const learningResources = {
  'Project Management': {
    glossaryIds: [1, 2, 3],
    links: [
      'https://www.pmi.org/learning/library/project-management-fundamentals',
      '/glossary#project-management',
    ],
    suggestedReading: ['PMBOK Guide Chapter 1', 'Agile Practice Guide Introduction'],
  },
  'Earned Value Management': {
    glossaryIds: [10, 11, 12],
    links: ['https://www.pmi.org/learning/library/earned-value-management', '/learning/evm-basics'],
    suggestedReading: ['PMBOK Guide Section 7.4', 'Practice Standard for EVM'],
  },
  'Risk Management': {
    glossaryIds: [16, 17, 18],
    links: ['https://www.pmi.org/learning/library/risk-management', '/learning/risk-management'],
    suggestedReading: ['PMBOK Guide Chapter 11', 'Practice Standard for Risk Management'],
  },
}

// Export utility functions
export function getTermById(id: string): TerminologyEntry | undefined {
  return pmpTerminologyDatabase.find((term) => term.id === id)
}

export function getTermsByKnowledgeArea(area: string): TerminologyEntry[] {
  return pmpTerminologyDatabase.filter(
    (term) => term.knowledgeArea && term.knowledgeArea.includes(area)
  )
}

export function getTermsByProcessGroup(group: string): TerminologyEntry[] {
  return pmpTerminologyDatabase.filter(
    (term) => term.processGroup && term.processGroup.includes(group)
  )
}

export function getDeprecatedTerms(): TerminologyEntry[] {
  return pmpTerminologyDatabase.filter((term) => term.deprecated && term.deprecated.length > 0)
}

export function getPMBOK6Terms(): TerminologyEntry[] {
  return pmpTerminologyDatabase.filter((term) => term.pmbok6)
}

export function getPMBOK7Terms(): TerminologyEntry[] {
  return pmpTerminologyDatabase.filter((term) => term.pmbok7)
}
