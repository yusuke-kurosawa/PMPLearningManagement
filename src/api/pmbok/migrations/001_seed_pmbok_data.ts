/**
 * PMBOK Data Migration Script
 * Seeds the database with complete PMBOK 6th edition data
 */

import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'

/**
 * Logger for migration operations
 * Uses appropriate logging based on environment
 */
const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[MIGRATION INFO] ${message}`, ...args)
    }
    // In production, this could be replaced with a proper logging service
  },
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`[MIGRATION ERROR] ${message}`, error)
    } else {
      // In production, this could be replaced with error tracking service
      // e.g., Sentry, DataDog, etc.
      throw new Error(`Migration error: ${message}`)
    }
  },
}

interface MigrationContext {
  pool: Pool
  knowledgeAreaMap: Map<string, string>
  processGroupMap: Map<string, string>
  processMap: Map<string, string>
  ittoMap: Map<string, string>
}

export async function up(pool: Pool): Promise<void> {
  const context: MigrationContext = {
    pool,
    knowledgeAreaMap: new Map(),
    processGroupMap: new Map(),
    processMap: new Map(),
    ittoMap: new Map(),
  }

  logger.info('Starting PMBOK data migration...')

  try {
    await pool.query('BEGIN')

    // 1. Seed Process Groups
    await seedProcessGroups(context)

    // 2. Seed Knowledge Areas
    await seedKnowledgeAreas(context)

    // 3. Seed Processes
    await seedProcesses(context)

    // 4. Seed ITTO Items
    await seedITTOItems(context)

    // 5. Map Process ITTO
    await mapProcessITTO(context)

    // 6. Create Process Relationships
    await createProcessRelationships(context)

    // 7. Create Learning Paths
    await createLearningPaths(context)

    await pool.query('COMMIT')
    logger.info('PMBOK data migration completed successfully')
  } catch (error) {
    await pool.query('ROLLBACK')
    logger.error('Migration failed:', error)
    throw error
  }
}

async function seedProcessGroups(context: MigrationContext): Promise<void> {
  const processGroups = [
    {
      code: 'initiating',
      name: 'Initiating',
      order: 1,
      description: 'Process group for defining a new project or phase',
    },
    {
      code: 'planning',
      name: 'Planning',
      order: 2,
      description: 'Process group for establishing scope and defining objectives',
    },
    {
      code: 'executing',
      name: 'Executing',
      order: 3,
      description: 'Process group for completing work defined in the project management plan',
    },
    {
      code: 'monitoring_controlling',
      name: 'Monitoring and Controlling',
      order: 4,
      description: 'Process group for tracking, reviewing, and regulating progress',
    },
    {
      code: 'closing',
      name: 'Closing',
      order: 5,
      description: 'Process group for finalizing all activities',
    },
  ]

  for (const pg of processGroups) {
    const id = uuidv4()
    await context.pool.query(
      `INSERT INTO process_groups (id, code, name, description, display_order) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, pg.code, pg.name, pg.description, pg.order]
    )
    context.processGroupMap.set(pg.code, id)
  }

  logger.info(`Seeded ${processGroups.length} process groups`)
}

async function seedKnowledgeAreas(context: MigrationContext): Promise<void> {
  const knowledgeAreas = [
    {
      code: 'integration',
      name: 'Project Integration Management',
      description:
        'Processes and activities to identify, define, combine, unify, and coordinate various processes',
      color: '#4A90E2',
      icon: 'git-merge',
      order: 1,
    },
    {
      code: 'scope',
      name: 'Project Scope Management',
      description: 'Processes required to ensure the project includes all required work',
      color: '#7B68EE',
      icon: 'target',
      order: 2,
    },
    {
      code: 'schedule',
      name: 'Project Schedule Management',
      description: 'Processes required to manage timely completion of the project',
      color: '#50C878',
      icon: 'clock',
      order: 3,
    },
    {
      code: 'cost',
      name: 'Project Cost Management',
      description: 'Processes involved in planning, estimating, budgeting, and controlling costs',
      color: '#FFD700',
      icon: 'dollar-sign',
      order: 4,
    },
    {
      code: 'quality',
      name: 'Project Quality Management',
      description:
        'Processes for incorporating quality policy into project and product quality requirements',
      color: '#FF6B6B',
      icon: 'award',
      order: 5,
    },
    {
      code: 'resource',
      name: 'Project Resource Management',
      description:
        'Processes to identify, acquire, and manage resources needed for project completion',
      color: '#4ECDC4',
      icon: 'users',
      order: 6,
    },
    {
      code: 'communications',
      name: 'Project Communications Management',
      description:
        'Processes for timely and appropriate planning, management, and monitoring of communications',
      color: '#95E1D3',
      icon: 'message-circle',
      order: 7,
    },
    {
      code: 'risk',
      name: 'Project Risk Management',
      description:
        'Processes for conducting risk management planning, identification, and analysis',
      color: '#F38181',
      icon: 'alert-triangle',
      order: 8,
    },
    {
      code: 'procurement',
      name: 'Project Procurement Management',
      description: 'Processes to purchase or acquire products, services, or results',
      color: '#AA96DA',
      icon: 'shopping-cart',
      order: 9,
    },
    {
      code: 'stakeholder',
      name: 'Project Stakeholder Management',
      description: 'Processes to identify stakeholders and manage their engagement',
      color: '#FCBAD3',
      icon: 'user-check',
      order: 10,
    },
  ]

  for (const ka of knowledgeAreas) {
    const id = uuidv4()
    await context.pool.query(
      `INSERT INTO knowledge_areas (id, code, name, description, pmbok_version, color, icon, display_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, ka.code, ka.name, ka.description, '6', ka.color, ka.icon, ka.order]
    )
    context.knowledgeAreaMap.set(ka.code, id)
  }

  logger.info(`Seeded ${knowledgeAreas.length} knowledge areas`)
}

async function seedProcesses(context: MigrationContext): Promise<void> {
  const processes = [
    // Integration Management (7 processes)
    {
      code: 'develop_charter',
      name: 'Develop Project Charter',
      ka: 'integration',
      pg: 'initiating',
      description: 'Process of developing a document that formally authorizes a project',
      complexity: 'medium',
      time: 120,
    },
    {
      code: 'develop_pm_plan',
      name: 'Develop Project Management Plan',
      ka: 'integration',
      pg: 'planning',
      description: 'Process of defining, preparing, and coordinating all plan components',
      complexity: 'high',
      time: 240,
    },
    {
      code: 'direct_manage_work',
      name: 'Direct and Manage Project Work',
      ka: 'integration',
      pg: 'executing',
      description:
        'Process of leading and performing the work defined in the project management plan',
      complexity: 'high',
      time: 180,
    },
    {
      code: 'manage_knowledge',
      name: 'Manage Project Knowledge',
      ka: 'integration',
      pg: 'executing',
      description: 'Process of using existing knowledge and creating new knowledge',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'monitor_control_work',
      name: 'Monitor and Control Project Work',
      ka: 'integration',
      pg: 'monitoring_controlling',
      description: 'Process of tracking, reviewing, and reporting overall progress',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'integrated_change_control',
      name: 'Perform Integrated Change Control',
      ka: 'integration',
      pg: 'monitoring_controlling',
      description: 'Process of reviewing all change requests and managing changes',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'close_project',
      name: 'Close Project or Phase',
      ka: 'integration',
      pg: 'closing',
      description: 'Process of finalizing all activities for the project or phase',
      complexity: 'medium',
      time: 90,
    },

    // Scope Management (6 processes)
    {
      code: 'plan_scope_mgmt',
      name: 'Plan Scope Management',
      ka: 'scope',
      pg: 'planning',
      description: 'Process of creating a scope management plan',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'collect_requirements',
      name: 'Collect Requirements',
      ka: 'scope',
      pg: 'planning',
      description: 'Process of determining and documenting stakeholder needs',
      complexity: 'high',
      time: 180,
    },
    {
      code: 'define_scope',
      name: 'Define Scope',
      ka: 'scope',
      pg: 'planning',
      description: 'Process of developing a detailed description of the project and product',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'create_wbs',
      name: 'Create WBS',
      ka: 'scope',
      pg: 'planning',
      description: 'Process of subdividing project deliverables into smaller components',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'validate_scope',
      name: 'Validate Scope',
      ka: 'scope',
      pg: 'monitoring_controlling',
      description: 'Process of formalizing acceptance of completed deliverables',
      complexity: 'medium',
      time: 60,
    },
    {
      code: 'control_scope',
      name: 'Control Scope',
      ka: 'scope',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring project scope status and managing changes',
      complexity: 'medium',
      time: 90,
    },

    // Schedule Management (6 processes)
    {
      code: 'plan_schedule_mgmt',
      name: 'Plan Schedule Management',
      ka: 'schedule',
      pg: 'planning',
      description: 'Process of establishing policies and procedures for schedule management',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'define_activities',
      name: 'Define Activities',
      ka: 'schedule',
      pg: 'planning',
      description: 'Process of identifying specific actions to produce deliverables',
      complexity: 'medium',
      time: 120,
    },
    {
      code: 'sequence_activities',
      name: 'Sequence Activities',
      ka: 'schedule',
      pg: 'planning',
      description: 'Process of identifying relationships among project activities',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'estimate_activity_durations',
      name: 'Estimate Activity Durations',
      ka: 'schedule',
      pg: 'planning',
      description: 'Process of estimating time required to complete activities',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'develop_schedule',
      name: 'Develop Schedule',
      ka: 'schedule',
      pg: 'planning',
      description: 'Process of analyzing sequences, durations, and constraints to create schedule',
      complexity: 'high',
      time: 180,
    },
    {
      code: 'control_schedule',
      name: 'Control Schedule',
      ka: 'schedule',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring project status and managing schedule changes',
      complexity: 'high',
      time: 120,
    },

    // Cost Management (4 processes)
    {
      code: 'plan_cost_mgmt',
      name: 'Plan Cost Management',
      ka: 'cost',
      pg: 'planning',
      description: 'Process of defining how costs will be estimated, budgeted, and controlled',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'estimate_costs',
      name: 'Estimate Costs',
      ka: 'cost',
      pg: 'planning',
      description: 'Process of developing an approximation of monetary resources needed',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'determine_budget',
      name: 'Determine Budget',
      ka: 'cost',
      pg: 'planning',
      description: 'Process of aggregating costs to establish authorized cost baseline',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'control_costs',
      name: 'Control Costs',
      ka: 'cost',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring project status and managing cost baseline changes',
      complexity: 'high',
      time: 120,
    },

    // Quality Management (3 processes)
    {
      code: 'plan_quality_mgmt',
      name: 'Plan Quality Management',
      ka: 'quality',
      pg: 'planning',
      description: 'Process of identifying quality requirements and standards',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'manage_quality',
      name: 'Manage Quality',
      ka: 'quality',
      pg: 'executing',
      description: 'Process of translating quality management plan into executable activities',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'control_quality',
      name: 'Control Quality',
      ka: 'quality',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring and recording quality activity results',
      complexity: 'medium',
      time: 90,
    },

    // Resource Management (6 processes)
    {
      code: 'plan_resource_mgmt',
      name: 'Plan Resource Management',
      ka: 'resource',
      pg: 'planning',
      description: 'Process of defining how to estimate, acquire, and manage resources',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'estimate_activity_resources',
      name: 'Estimate Activity Resources',
      ka: 'resource',
      pg: 'planning',
      description: 'Process of estimating resources needed for activities',
      complexity: 'medium',
      time: 120,
    },
    {
      code: 'acquire_resources',
      name: 'Acquire Resources',
      ka: 'resource',
      pg: 'executing',
      description: 'Process of obtaining resources needed to complete project',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'develop_team',
      name: 'Develop Team',
      ka: 'resource',
      pg: 'executing',
      description: 'Process of improving competencies and team environment',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'manage_team',
      name: 'Manage Team',
      ka: 'resource',
      pg: 'executing',
      description: 'Process of tracking performance and managing changes',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'control_resources',
      name: 'Control Resources',
      ka: 'resource',
      pg: 'monitoring_controlling',
      description: 'Process of ensuring resources are available as planned',
      complexity: 'medium',
      time: 90,
    },

    // Communications Management (3 processes)
    {
      code: 'plan_communications_mgmt',
      name: 'Plan Communications Management',
      ka: 'communications',
      pg: 'planning',
      description: 'Process of developing approach for project communications',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'manage_communications',
      name: 'Manage Communications',
      ka: 'communications',
      pg: 'executing',
      description: 'Process of ensuring timely collection and distribution of information',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'monitor_communications',
      name: 'Monitor Communications',
      ka: 'communications',
      pg: 'monitoring_controlling',
      description: 'Process of ensuring information needs are met',
      complexity: 'low',
      time: 60,
    },

    // Risk Management (7 processes)
    {
      code: 'plan_risk_mgmt',
      name: 'Plan Risk Management',
      ka: 'risk',
      pg: 'planning',
      description: 'Process of defining how to conduct risk management activities',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'identify_risks',
      name: 'Identify Risks',
      ka: 'risk',
      pg: 'planning',
      description: 'Process of identifying individual project risks',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'qualitative_risk_analysis',
      name: 'Perform Qualitative Risk Analysis',
      ka: 'risk',
      pg: 'planning',
      description: 'Process of prioritizing risks by probability and impact',
      complexity: 'medium',
      time: 120,
    },
    {
      code: 'quantitative_risk_analysis',
      name: 'Perform Quantitative Risk Analysis',
      ka: 'risk',
      pg: 'planning',
      description: 'Process of numerically analyzing combined effect of risks',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'plan_risk_responses',
      name: 'Plan Risk Responses',
      ka: 'risk',
      pg: 'planning',
      description: 'Process of developing options to address project risks',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'implement_risk_responses',
      name: 'Implement Risk Responses',
      ka: 'risk',
      pg: 'executing',
      description: 'Process of implementing agreed-upon risk response plans',
      complexity: 'medium',
      time: 90,
    },
    {
      code: 'monitor_risks',
      name: 'Monitor Risks',
      ka: 'risk',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring implementation of risk plans',
      complexity: 'medium',
      time: 90,
    },

    // Procurement Management (3 processes)
    {
      code: 'plan_procurement_mgmt',
      name: 'Plan Procurement Management',
      ka: 'procurement',
      pg: 'planning',
      description: 'Process of documenting procurement decisions and approach',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'conduct_procurements',
      name: 'Conduct Procurements',
      ka: 'procurement',
      pg: 'executing',
      description: 'Process of obtaining seller responses and awarding contracts',
      complexity: 'high',
      time: 150,
    },
    {
      code: 'control_procurements',
      name: 'Control Procurements',
      ka: 'procurement',
      pg: 'monitoring_controlling',
      description: 'Process of managing procurement relationships and performance',
      complexity: 'medium',
      time: 90,
    },

    // Stakeholder Management (4 processes)
    {
      code: 'identify_stakeholders',
      name: 'Identify Stakeholders',
      ka: 'stakeholder',
      pg: 'initiating',
      description: 'Process of identifying people affected by the project',
      complexity: 'medium',
      time: 120,
    },
    {
      code: 'plan_stakeholder_engagement',
      name: 'Plan Stakeholder Engagement',
      ka: 'stakeholder',
      pg: 'planning',
      description: 'Process of developing approaches to involve stakeholders',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'manage_stakeholder_engagement',
      name: 'Manage Stakeholder Engagement',
      ka: 'stakeholder',
      pg: 'executing',
      description: 'Process of communicating with stakeholders to meet needs',
      complexity: 'high',
      time: 120,
    },
    {
      code: 'monitor_stakeholder_engagement',
      name: 'Monitor Stakeholder Engagement',
      ka: 'stakeholder',
      pg: 'monitoring_controlling',
      description: 'Process of monitoring stakeholder relationships',
      complexity: 'medium',
      time: 90,
    },
  ]

  let order = 1
  for (const process of processes) {
    const id = uuidv4()
    await context.pool.query(
      `INSERT INTO processes (
        id, code, name, knowledge_area_id, process_group_id, 
        description, complexity, estimated_learning_time, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        process.code,
        process.name,
        context.knowledgeAreaMap.get(process.ka),
        context.processGroupMap.get(process.pg),
        process.description,
        process.complexity,
        process.time,
        order++,
      ]
    )
    context.processMap.set(process.code, id)
  }

  logger.info(`Seeded ${processes.length} processes`)
}

async function seedITTOItems(context: MigrationContext): Promise<void> {
  const ittoItems = [
    // Common Inputs
    { name: 'Project Charter', type: 'input', category: 'Document' },
    { name: 'Project Management Plan', type: 'input', category: 'Document' },
    { name: 'Project Documents', type: 'input', category: 'Document' },
    {
      name: 'Enterprise Environmental Factors',
      type: 'input',
      category: 'Enterprise',
      isEnterprise: true,
    },
    {
      name: 'Organizational Process Assets',
      type: 'input',
      category: 'Organizational',
      isOrganizational: true,
    },
    { name: 'Work Performance Data', type: 'input', category: 'Performance' },
    { name: 'Work Performance Reports', type: 'input', category: 'Performance' },
    { name: 'Change Requests', type: 'input', category: 'Change' },
    { name: 'Approved Change Requests', type: 'input', category: 'Change' },
    { name: 'Business Documents', type: 'input', category: 'Business' },
    { name: 'Agreements', type: 'input', category: 'Contract' },
    { name: 'Procurement Documentation', type: 'input', category: 'Procurement' },
    { name: 'Requirements Documentation', type: 'input', category: 'Requirements' },
    { name: 'Risk Register', type: 'input', category: 'Risk' },
    { name: 'Stakeholder Register', type: 'input', category: 'Stakeholder' },

    // Common Tools & Techniques
    { name: 'Expert Judgment', type: 'tool', category: 'Analytical' },
    { name: 'Data Analysis', type: 'tool', category: 'Analytical' },
    { name: 'Decision Making', type: 'tool', category: 'Decision' },
    { name: 'Data Gathering', type: 'tool', category: 'Information' },
    { name: 'Meetings', type: 'tool', category: 'Communication' },
    { name: 'Project Management Information System', type: 'tool', category: 'System' },
    { name: 'Interpersonal and Team Skills', type: 'tool', category: 'Soft Skills' },
    { name: 'Communication Skills', type: 'tool', category: 'Soft Skills' },
    { name: 'Data Representation', type: 'tool', category: 'Visualization' },
    { name: 'Decomposition', type: 'tool', category: 'Planning' },
    { name: 'Rolling Wave Planning', type: 'tool', category: 'Planning' },
    { name: 'Analogous Estimating', type: 'tool', category: 'Estimation' },
    { name: 'Parametric Estimating', type: 'tool', category: 'Estimation' },
    { name: 'Three-Point Estimating', type: 'tool', category: 'Estimation' },
    { name: 'Bottom-Up Estimating', type: 'tool', category: 'Estimation' },
    { name: 'Monte Carlo Simulation', type: 'tool', category: 'Quantitative' },
    { name: 'Critical Path Method', type: 'tool', category: 'Scheduling' },
    { name: 'Resource Optimization', type: 'tool', category: 'Resource' },
    { name: 'Earned Value Analysis', type: 'tool', category: 'Performance' },
    { name: 'Variance Analysis', type: 'tool', category: 'Analysis' },
    { name: 'Trend Analysis', type: 'tool', category: 'Analysis' },
    { name: 'Root Cause Analysis', type: 'tool', category: 'Problem Solving' },
    { name: 'SWOT Analysis', type: 'tool', category: 'Strategic' },

    // Common Outputs
    { name: 'Project Charter', type: 'output', category: 'Document' },
    { name: 'Project Management Plan Updates', type: 'output', category: 'Document' },
    { name: 'Project Documents Updates', type: 'output', category: 'Document' },
    { name: 'Work Performance Information', type: 'output', category: 'Performance' },
    { name: 'Work Performance Reports', type: 'output', category: 'Performance' },
    { name: 'Change Requests', type: 'output', category: 'Change' },
    { name: 'Deliverables', type: 'output', category: 'Product' },
    { name: 'Accepted Deliverables', type: 'output', category: 'Product' },
    { name: 'Lessons Learned Register', type: 'output', category: 'Knowledge' },
    { name: 'Issue Log', type: 'output', category: 'Issues' },
    { name: 'Risk Register Updates', type: 'output', category: 'Risk' },
    { name: 'Schedule Baseline', type: 'output', category: 'Baseline' },
    { name: 'Cost Baseline', type: 'output', category: 'Baseline' },
    { name: 'Scope Baseline', type: 'output', category: 'Baseline' },
    { name: 'Quality Reports', type: 'output', category: 'Quality' },
    { name: 'Test and Evaluation Documents', type: 'output', category: 'Quality' },
    { name: 'Resource Calendars', type: 'output', category: 'Resource' },
    { name: 'Team Performance Assessments', type: 'output', category: 'Team' },
    { name: 'Communications', type: 'output', category: 'Communication' },
    { name: 'Procurement Agreements', type: 'output', category: 'Procurement' },
    { name: 'Stakeholder Engagement Plan', type: 'output', category: 'Stakeholder' },
  ]

  for (const item of ittoItems) {
    const id = uuidv4()
    await context.pool.query(
      `INSERT INTO itto_items (
        id, name, type, category, is_enterprise, is_organizational
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (name, type) DO UPDATE SET category = EXCLUDED.category
      RETURNING id`,
      [
        id,
        item.name,
        item.type,
        item.category,
        item.isEnterprise || false,
        item.isOrganizational || false,
      ]
    )

    const key = `${item.name}:${item.type}`
    context.ittoMap.set(key, id)
  }

  logger.info(`Seeded ${ittoItems.length} ITTO items`)
}

async function mapProcessITTO(context: MigrationContext): Promise<void> {
  // Sample ITTO mappings for key processes
  const mappings = [
    // Develop Project Charter
    {
      processCode: 'develop_charter',
      inputs: [
        'Business Documents',
        'Agreements',
        'Enterprise Environmental Factors',
        'Organizational Process Assets',
      ],
      tools: ['Expert Judgment', 'Data Gathering', 'Interpersonal and Team Skills', 'Meetings'],
      outputs: ['Project Charter'],
    },
    // Develop Project Management Plan
    {
      processCode: 'develop_pm_plan',
      inputs: [
        'Project Charter',
        'Project Documents',
        'Enterprise Environmental Factors',
        'Organizational Process Assets',
      ],
      tools: ['Expert Judgment', 'Data Gathering', 'Interpersonal and Team Skills', 'Meetings'],
      outputs: ['Project Management Plan Updates'],
    },
    // Direct and Manage Project Work
    {
      processCode: 'direct_manage_work',
      inputs: [
        'Project Management Plan',
        'Project Documents',
        'Approved Change Requests',
        'Enterprise Environmental Factors',
      ],
      tools: ['Expert Judgment', 'Project Management Information System', 'Meetings'],
      outputs: ['Deliverables', 'Work Performance Data', 'Issue Log', 'Change Requests'],
    },
    // Create WBS
    {
      processCode: 'create_wbs',
      inputs: [
        'Project Management Plan',
        'Project Documents',
        'Enterprise Environmental Factors',
        'Organizational Process Assets',
      ],
      tools: ['Expert Judgment', 'Decomposition'],
      outputs: ['Scope Baseline', 'Project Documents Updates'],
    },
    // Develop Schedule
    {
      processCode: 'develop_schedule',
      inputs: [
        'Project Management Plan',
        'Project Documents',
        'Agreements',
        'Enterprise Environmental Factors',
      ],
      tools: [
        'Critical Path Method',
        'Resource Optimization',
        'Data Analysis',
        'Project Management Information System',
      ],
      outputs: ['Schedule Baseline', 'Project Documents Updates', 'Change Requests'],
    },
  ]

  let order = 1
  for (const mapping of mappings) {
    const processId = context.processMap.get(mapping.processCode)
    if (!processId) {
      continue
    }

    // Map inputs
    for (const inputName of mapping.inputs) {
      const ittoId = context.ittoMap.get(`${inputName}:input`)
      if (ittoId) {
        await context.pool.query(
          `INSERT INTO process_itto (process_id, itto_item_id, itto_type, display_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [processId, ittoId, 'input', order++]
        )
      }
    }

    // Map tools
    for (const toolName of mapping.tools) {
      const ittoId = context.ittoMap.get(`${toolName}:tool`)
      if (ittoId) {
        await context.pool.query(
          `INSERT INTO process_itto (process_id, itto_item_id, itto_type, display_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [processId, ittoId, 'tool', order++]
        )
      }
    }

    // Map outputs
    for (const outputName of mapping.outputs) {
      const ittoId = context.ittoMap.get(`${outputName}:output`)
      if (ittoId) {
        await context.pool.query(
          `INSERT INTO process_itto (process_id, itto_item_id, itto_type, display_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [processId, ittoId, 'output', order++]
        )
      }
    }
  }

  logger.info('Mapped ITTO items to processes')
}

async function createProcessRelationships(context: MigrationContext): Promise<void> {
  const relationships = [
    // Charter must come before PM Plan
    {
      source: 'develop_charter',
      target: 'develop_pm_plan',
      type: 'prerequisite',
      strength: 1.0,
    },
    // PM Plan before executing
    {
      source: 'develop_pm_plan',
      target: 'direct_manage_work',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Requirements before scope
    {
      source: 'collect_requirements',
      target: 'define_scope',
      type: 'prerequisite',
      strength: 0.9,
    },
    // Scope before WBS
    {
      source: 'define_scope',
      target: 'create_wbs',
      type: 'prerequisite',
      strength: 1.0,
    },
    // WBS before activities
    {
      source: 'create_wbs',
      target: 'define_activities',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Activities before sequencing
    {
      source: 'define_activities',
      target: 'sequence_activities',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Sequencing before duration estimates
    {
      source: 'sequence_activities',
      target: 'estimate_activity_durations',
      type: 'prerequisite',
      strength: 0.8,
    },
    // Duration estimates before schedule
    {
      source: 'estimate_activity_durations',
      target: 'develop_schedule',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Cost estimates before budget
    {
      source: 'estimate_costs',
      target: 'determine_budget',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Identify risks before analysis
    {
      source: 'identify_risks',
      target: 'qualitative_risk_analysis',
      type: 'prerequisite',
      strength: 1.0,
    },
    // Qualitative before quantitative
    {
      source: 'qualitative_risk_analysis',
      target: 'quantitative_risk_analysis',
      type: 'dependency',
      strength: 0.7,
    },
    // Risk analysis before responses
    {
      source: 'qualitative_risk_analysis',
      target: 'plan_risk_responses',
      type: 'prerequisite',
      strength: 0.9,
    },
    // Identify stakeholders early
    {
      source: 'identify_stakeholders',
      target: 'plan_stakeholder_engagement',
      type: 'prerequisite',
      strength: 1.0,
    },
  ]

  for (const rel of relationships) {
    const sourceId = context.processMap.get(rel.source)
    const targetId = context.processMap.get(rel.target)

    if (sourceId && targetId) {
      await context.pool.query(
        `INSERT INTO process_relationships (
          source_process_id, target_process_id, relationship_type, strength
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING`,
        [sourceId, targetId, rel.type, rel.strength]
      )
    }
  }

  logger.info(`Created ${relationships.length} process relationships`)
}

async function createLearningPaths(context: MigrationContext): Promise<void> {
  const learningPaths = [
    {
      name: 'PMP Exam Preparation - Foundations',
      description: 'Essential processes for PMP exam success',
      difficulty: 'medium',
      duration: 40,
      processes: [
        'develop_charter',
        'identify_stakeholders',
        'develop_pm_plan',
        'collect_requirements',
        'define_scope',
        'create_wbs',
        'define_activities',
        'develop_schedule',
        'estimate_costs',
        'determine_budget',
        'plan_quality_mgmt',
        'plan_resource_mgmt',
        'plan_communications_mgmt',
        'identify_risks',
        'plan_risk_responses',
      ],
    },
    {
      name: 'Integration Management Mastery',
      description: 'Complete understanding of integration processes',
      difficulty: 'high',
      duration: 20,
      processes: [
        'develop_charter',
        'develop_pm_plan',
        'direct_manage_work',
        'manage_knowledge',
        'monitor_control_work',
        'integrated_change_control',
        'close_project',
      ],
    },
    {
      name: 'Risk Management Specialist',
      description: 'Comprehensive risk management processes',
      difficulty: 'high',
      duration: 15,
      processes: [
        'plan_risk_mgmt',
        'identify_risks',
        'qualitative_risk_analysis',
        'quantitative_risk_analysis',
        'plan_risk_responses',
        'implement_risk_responses',
        'monitor_risks',
      ],
    },
  ]

  for (const path of learningPaths) {
    const pathId = uuidv4()

    await context.pool.query(
      `INSERT INTO learning_paths (
        id, name, description, difficulty_level, estimated_duration
      ) VALUES ($1, $2, $3, $4, $5)`,
      [pathId, path.name, path.description, path.difficulty, path.duration]
    )

    // Add steps
    let stepOrder = 1
    for (const processCode of path.processes) {
      const processId = context.processMap.get(processCode)
      if (processId) {
        await context.pool.query(
          `INSERT INTO learning_path_steps (
            learning_path_id, process_id, step_order, estimated_time
          ) VALUES ($1, $2, $3, $4)`,
          [pathId, processId, stepOrder++, 90]
        )
      }
    }
  }

  logger.info(`Created ${learningPaths.length} learning paths`)
}

export async function down(pool: Pool): Promise<void> {
  await pool.query('BEGIN')

  try {
    // Delete in reverse order due to foreign key constraints
    await pool.query('DELETE FROM learning_path_steps')
    await pool.query('DELETE FROM learning_paths')
    await pool.query('DELETE FROM process_relationships')
    await pool.query('DELETE FROM process_itto')
    await pool.query('DELETE FROM processes')
    await pool.query('DELETE FROM itto_items')
    await pool.query('DELETE FROM knowledge_areas')
    await pool.query('DELETE FROM process_groups')

    await pool.query('COMMIT')
    logger.info('PMBOK data migration rolled back successfully')
  } catch (error) {
    await pool.query('ROLLBACK')
    logger.error('Rollback failed:', error)
    throw error
  }
}
