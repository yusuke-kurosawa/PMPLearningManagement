/**
 * Example Prompts and Conversational Flows
 * Templates and examples for AI-powered learning interactions
 */

export interface ConversationExample {
  id: string
  category: string
  userQuery: string
  expectedIntent: string
  aiResponse: string
  followUpQuestions?: string[]
  metadata?: {
    difficulty?: string
    topics?: string[]
    learningObjective?: string
  }
}

export const conversationExamples: ConversationExample[] = [
  // PMBOK Knowledge Queries
  {
    id: 'pmbok-1',
    category: 'PMBOK Concepts',
    userQuery: 'What is the difference between project risk and an issue?',
    expectedIntent: 'definition',
    aiResponse: `Great question! Let me explain the key differences between project risks and issues:

**Risk** 🎲
- An uncertain event or condition that, if it occurs, has a positive or negative effect on project objectives
- **Future-focused**: Hasn't happened yet
- **Can be positive** (opportunities) or negative (threats)
- **Managed through**: Risk Management processes
- **Example**: "There's a 30% chance our key supplier might delay delivery"

**Issue** ⚠️
- A current problem or concern that is impacting the project
- **Present-focused**: Already happening
- **Always negative**: Requires immediate attention
- **Managed through**: Issue logs and corrective actions
- **Example**: "Our key supplier has just informed us of a 2-week delay"

**Key Takeaway**: Risks are "what might happen," while issues are "what is happening." Effective project management involves identifying risks early to prevent them from becoming issues.

Would you like me to explain the Risk Management processes or share examples of how to convert risks into issues in the risk register?`,
    followUpQuestions: [
      'How do I create a risk register?',
      'What are the Risk Management processes?',
      'Can you give me more examples of risks vs issues?',
    ],
    metadata: {
      difficulty: 'intermediate',
      topics: ['Risk Management', 'Project Management Basics'],
      learningObjective: 'Distinguish between risks and issues',
    },
  },
  {
    id: 'pmbok-2',
    category: 'PMBOK Processes',
    userQuery: 'Walk me through the inputs, tools, and outputs of Develop Project Charter',
    expectedIntent: 'itto',
    aiResponse: `Let's break down the **Develop Project Charter** process (Integration Management, Initiating Process Group):

📥 **INPUTS:**
1. **Business Case**: Justifies the project investment
2. **Benefits Management Plan**: How and when benefits will be delivered
3. **Agreements**: Contracts, MOUs, SLAs, etc.
4. **Enterprise Environmental Factors (EEFs)**: Organizational culture, market conditions
5. **Organizational Process Assets (OPAs)**: Templates, historical information

🔧 **TOOLS & TECHNIQUES:**
1. **Expert Judgment**: Leverage organizational expertise
2. **Data Gathering**:
   - Brainstorming
   - Focus groups
   - Interviews
3. **Interpersonal and Team Skills**:
   - Conflict management
   - Facilitation
   - Meeting management
4. **Meetings**: Kick-off and planning meetings

📤 **OUTPUTS:**
1. **Project Charter**: The key document that formally authorizes the project
2. **Assumption Log**: Documents all assumptions and constraints

💡 **Pro Tip**: The Project Charter is your "license to operate" as a PM. It gives you the authority to apply resources to project activities.

**Memory Aid**: Think "BBAEO" for inputs (Business case, Benefits, Agreements, EEFs, OPAs)

Would you like me to explain what should be included in the Project Charter document itself?`,
    followUpQuestions: [
      'What exactly goes into a Project Charter?',
      'Who signs the Project Charter?',
      "What happens if we don't have a Project Charter?",
    ],
    metadata: {
      difficulty: 'intermediate',
      topics: ['Integration Management', 'Initiating', 'ITTO'],
      learningObjective: 'Master the Develop Project Charter process',
    },
  },

  // Study Planning Queries
  {
    id: 'plan-1',
    category: 'Study Planning',
    userQuery:
      'I have my PMP exam in 2 months and can study 2 hours per day. What should my study plan look like?',
    expectedIntent: 'study_plan',
    aiResponse: `Based on your 2-month timeline with 2 hours daily (approximately 120 total hours), here's your personalized PMP study plan:

📅 **Phase 1: Foundation (Weeks 1-3)**
- **Focus**: Understanding PMBOK framework and all 49 processes
- **Daily**: 1.5 hrs reading + 0.5 hr flashcards
- **Goal**: Complete overview of all Knowledge Areas

📚 **Phase 2: Deep Dive (Weeks 4-6)**
- **Focus**: Master ITTOs and process interactions
- **Daily**: 1 hr focused study + 1 hr practice questions
- **Goal**: 70%+ accuracy on practice questions

🎯 **Phase 3: Practice & Refine (Week 7)**
- **Focus**: Full mock exams and weak area improvement
- **Daily**: 2 hrs mock exams or targeted practice
- **Goal**: Consistent 75%+ on mock exams

✨ **Phase 4: Final Sprint (Week 8)**
- **Focus**: Review, confidence building, exam strategy
- **Daily**: 1 hr review + 1 hr light practice
- **Goal**: Mental preparation and strategy refinement

**Weekly Milestones:**
- Week 2: Complete Integration & Scope Management
- Week 4: First mock exam (baseline score)
- Week 6: All ITTOs memorized
- Week 7: Two full mock exams above 75%

**Daily Routine Suggestion:**
- First hour: New content or weak areas
- Second hour: Practice questions or review
- Last 10 min: Quick flashcard review

Would you like me to create a detailed week-by-week breakdown or focus on specific knowledge areas you're concerned about?`,
    followUpQuestions: [
      'Which knowledge areas should I prioritize?',
      'What study materials do you recommend?',
      'How many practice questions should I do daily?',
    ],
    metadata: {
      difficulty: 'beginner',
      topics: ['Study Planning', 'Exam Preparation'],
      learningObjective: 'Create effective study plan',
    },
  },

  // Progress Analysis Queries
  {
    id: 'progress-1',
    category: 'Progress Analysis',
    userQuery: 'I keep failing questions about Earned Value Management. How can I improve?',
    expectedIntent: 'weakness_analysis',
    aiResponse: `I understand EVM can be challenging! Let's break it down and create a targeted improvement plan:

📊 **Why EVM is Challenging:**
- Multiple formulas to memorize
- Concepts can be abstract
- Questions often combine multiple calculations

🎯 **Targeted Improvement Strategy:**

**Step 1: Master the Basics (2-3 days)**
- **PV** (Planned Value): Budgeted cost of work scheduled
- **EV** (Earned Value): Budgeted cost of work performed  
- **AC** (Actual Cost): Actual cost of work performed
- Memory trick: "PEA" - Plan, Earned, Actual

**Step 2: Learn the Variances (2 days)**
- **CV** (Cost Variance) = EV - AC
  - Positive = under budget, Negative = over budget
- **SV** (Schedule Variance) = EV - PV
  - Positive = ahead, Negative = behind
- Memory trick: "Remove Actual for Cost, Remove Plan for Schedule"

**Step 3: Master the Indices (2 days)**
- **CPI** (Cost Performance Index) = EV / AC
  - >1 = good, <1 = bad
- **SPI** (Schedule Performance Index) = EV / PV
  - >1 = good, <1 = bad
- Memory trick: "Indices are divisions, Variances are subtractions"

**Step 4: Forecasting Formulas (3 days)**
- **EAC** = BAC / CPI (most common)
- **ETC** = EAC - AC
- **VAC** = BAC - EAC

**Practice Plan:**
1. Start with simple, single-formula questions
2. Draw diagrams for each problem
3. Create a formula sheet and use it daily
4. Do 10 EVM questions daily for a week
5. Time yourself - aim for 2 minutes per question

**Visual Learning Aid:**
Create a chart with PV, EV, and AC curves - this helps visualize variances

Would you like me to walk through some example EVM calculations or provide practice questions with detailed explanations?`,
    followUpQuestions: [
      'Can you give me some EVM practice problems?',
      'What are the most common EVM questions on the exam?',
      'How do I remember all these formulas?',
    ],
    metadata: {
      difficulty: 'advanced',
      topics: ['Cost Management', 'Earned Value Management'],
      learningObjective: 'Master EVM calculations',
    },
  },

  // Interactive Learning Queries
  {
    id: 'quiz-1',
    category: 'Practice Questions',
    userQuery: 'Quiz me on Risk Management',
    expectedIntent: 'generate_quiz',
    aiResponse: `Let's test your Risk Management knowledge! Here's a practice question:

**Question 1:**
During a project team meeting, a team member identifies that a new government regulation might be enacted that would require significant changes to the project deliverables. The regulation has a 40% probability of being enacted within the project timeline. 

What should the project manager do FIRST?

A) Update the issue log with this information
B) Document this in the risk register
C) Develop a contingency plan immediately  
D) Escalate to the project sponsor

🤔 Take a moment to think about your answer...

**Answer: B) Document this in the risk register**

**Explanation:**
This is a classic risk (uncertain future event), not an issue. The FIRST step in risk management is always to identify and document the risk in the risk register. After documentation, you would then:
1. Perform qualitative/quantitative risk analysis
2. Plan risk responses (including contingency plans if needed)
3. Communicate with stakeholders as appropriate

**Why other options are incorrect:**
- A) Issue log is for current problems, not future uncertainties
- C) You need to analyze the risk before planning responses
- D) Escalation comes after risk assessment, not before

**Key Takeaway:** Follow the Risk Management process flow: Identify → Analyze → Plan Responses → Implement → Monitor

Ready for another question, or would you like me to explain more about risk registers?`,
    followUpQuestions: [
      'Give me another Risk Management question',
      'What exactly goes in a risk register?',
      "What's the difference between qualitative and quantitative risk analysis?",
    ],
    metadata: {
      difficulty: 'intermediate',
      topics: ['Risk Management', 'Risk Register'],
      learningObjective: 'Apply risk management concepts',
    },
  },

  // Conceptual Understanding
  {
    id: 'concept-1',
    category: 'Conceptual',
    userQuery:
      "I don't understand the difference between Rolling Wave Planning and Progressive Elaboration",
    expectedIntent: 'explanation',
    aiResponse: `Great question! These two concepts are related but distinct. Let me clarify:

🌊 **Rolling Wave Planning**
- **What**: A planning technique where you plan in detail for the near term and at a high level for the far term
- **When**: Used during planning and throughout project execution
- **Focus**: WHEN and HOW you plan
- **Example**: Planning next month's sprint in detail while having only high-level plans for sprints 3 months out
- **Key Point**: It's about the TIMING of planning

📈 **Progressive Elaboration**
- **What**: The iterative process of increasing the level of detail as more information becomes available
- **When**: Throughout the entire project lifecycle
- **Focus**: WHAT you know and the level of detail
- **Example**: Starting with "Build a website" → "E-commerce site" → "E-commerce with payment gateway, inventory system, and customer portal"
- **Key Point**: It's about REFINING information

**How They Work Together:**
- Progressive Elaboration provides the information
- Rolling Wave Planning determines when to apply that information to detailed planning

**Analogy:**
Think of planning a road trip:
- **Progressive Elaboration**: As you research, you learn more about attractions, hotels, restaurants
- **Rolling Wave Planning**: You book hotels for the first few days but leave later days flexible

**Exam Tip:** 
- See "near-term detailed, long-term high-level" → Rolling Wave
- See "increasing detail over time" → Progressive Elaboration

Does this distinction make sense? Would you like examples from specific project scenarios?`,
    followUpQuestions: [
      'Can you give me more examples?',
      'How does this relate to Agile planning?',
      'When would I use each technique?',
    ],
    metadata: {
      difficulty: 'intermediate',
      topics: ['Scope Management', 'Planning Techniques'],
      learningObjective: 'Distinguish planning concepts',
    },
  },
]

/**
 * System prompts for different interaction modes
 */
export const systemPrompts = {
  tutor: `You are an expert PMP tutor with deep knowledge of PMBOK 6th and 7th editions. Your role is to:
- Explain concepts clearly with real-world examples
- Use analogies and memory aids to help retention
- Break down complex topics into manageable pieces
- Provide encouragement and maintain motivation
- Adapt explanations to the user's level of understanding
- Always reference specific PMBOK processes and knowledge areas`,

  coach: `You are a supportive PMP exam coach. Your role is to:
- Analyze learning patterns and provide personalized guidance
- Identify strengths and areas for improvement
- Create actionable study plans and strategies
- Provide motivation and confidence building
- Share exam-taking strategies and time management tips
- Celebrate progress and milestones`,

  examiner: `You are a PMP exam simulator. Your role is to:
- Generate realistic exam-style questions
- Provide detailed explanations for correct and incorrect answers
- Focus on the user's weak areas while maintaining variety
- Explain the reasoning process for selecting answers
- Highlight common traps and distractors
- Reference PMBOK concepts in explanations`,

  mentor: `You are an experienced project manager mentoring someone for PMP certification. Your role is to:
- Share real-world project experiences and examples
- Connect theory to practical application
- Provide career guidance and professional development advice
- Discuss how PMP concepts apply in different industries
- Offer insights on project management best practices
- Help develop professional project management mindset`,
}

/**
 * Conversation flow templates
 */
export const conversationFlows = {
  initialAssessment: [
    {
      assistant:
        "Welcome! I'm here to help you prepare for your PMP certification. Let's start by understanding your current situation. When is your exam scheduled?",
      expectedResponse: 'date or timeframe',
      followUp: 'Great! And how many hours per day can you dedicate to studying?',
    },
    {
      assistant: "What's your project management experience level?",
      options: ['Beginner (< 2 years)', 'Intermediate (2-5 years)', 'Advanced (5+ years)'],
      followUp: 'Perfect! This helps me tailor the content to your experience level.',
    },
    {
      assistant: 'Which knowledge areas do you feel least confident about?',
      multiSelect: true,
      options: [
        'Integration',
        'Scope',
        'Schedule',
        'Cost',
        'Quality',
        'Resource',
        'Communications',
        'Risk',
        'Procurement',
        'Stakeholder',
      ],
      followUp: "I'll make sure we focus extra attention on these areas.",
    },
  ],

  dailyCheckIn: [
    {
      assistant: 'Welcome back! How did your last study session go?',
      sentiment: 'analyze',
      followUp: {
        positive: "Excellent! Let's build on that momentum.",
        neutral: 'Good to see you staying consistent.',
        negative: "No worries, let's identify what we can adjust to help.",
      },
    },
    {
      assistant: 'What would you like to focus on today?',
      options: [
        'Continue where I left off',
        'Review weak areas',
        'Take a practice quiz',
        'Learn something new',
      ],
      dynamic: true,
    },
  ],

  conceptExplanation: {
    structure: [
      'definition',
      'context',
      'example',
      'commonMistakes',
      'examTips',
      'practiceQuestion',
    ],
    template: {
      definition: 'Start with a clear, concise definition',
      context: 'Explain where this fits in PMBOK framework',
      example: 'Provide a real-world scenario',
      commonMistakes: 'Highlight what students often confuse',
      examTips: 'Share how this appears on the exam',
      practiceQuestion: 'Test understanding with a question',
    },
  },
}

/**
 * Adaptive response strategies based on user performance
 */
export const adaptiveStrategies = {
  struggling: {
    approach: 'Break down into smaller pieces',
    encouragement: 'High',
    examples: 'Multiple, varied',
    pace: 'Slower',
    reinforcement: 'Frequent',
  },
  progressing: {
    approach: 'Build on existing knowledge',
    encouragement: 'Moderate',
    examples: 'Targeted',
    pace: 'Moderate',
    reinforcement: 'Regular',
  },
  advanced: {
    approach: 'Challenge with complex scenarios',
    encouragement: 'Minimal',
    examples: 'Edge cases',
    pace: 'Faster',
    reinforcement: 'On-demand',
  },
}

/**
 * Question generation templates
 */
export const questionTemplates = {
  situational: {
    structure:
      'You are managing [project type] when [situation]. [Complication]. What should you do [FIRST/NEXT]?',
    components: {
      projectTypes: [
        'software development',
        'construction',
        'pharmaceutical research',
        'marketing campaign',
        'product launch',
      ],
      situations: [
        'stakeholder conflict',
        'scope change request',
        'risk materialization',
        'resource constraint',
        'quality issue',
      ],
      complications: [
        'limited budget',
        'tight deadline',
        'regulatory requirement',
        'team member absence',
        'sponsor pressure',
      ],
    },
  },

  definition: {
    structure: 'Which of the following BEST describes [concept]?',
    components: {
      concepts: [
        'Critical Path',
        'Work Package',
        'Scope Baseline',
        'Risk Register',
        'Stakeholder Register',
      ],
    },
  },

  calculation: {
    structure: 'Given [values], calculate [metric]',
    components: {
      values: ['PV = $100,000, EV = $90,000, AC = $95,000'],
      metrics: ['CPI', 'SPI', 'EAC', 'VAC', 'TCPI'],
    },
  },

  process: {
    structure: 'Which process [produces/uses/includes] [element]?',
    components: {
      actions: ['produces', 'uses as input', 'includes the tool'],
      elements: ['Risk Register', 'Change Requests', 'Expert Judgment', 'Work Performance Data'],
    },
  },
}
