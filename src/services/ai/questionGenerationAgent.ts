/**
 * Advanced PMP Question Generation Agent with LangChain
 * Implements multi-model support and intelligent question generation
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOllama } from '@langchain/ollama'
import { AIMessage, BaseMessage } from '@langchain/core/messages'
import {
  PromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
  FewShotChatMessagePromptTemplate,
} from '@langchain/core/prompts'
import {
  StructuredOutputParser,
  OutputFixingParser,
  JsonOutputParser,
} from '@langchain/core/output_parsers'
import { z } from 'zod'
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// Question schema with comprehensive metadata
const questionSchema = z.object({
  id: z.string(),
  question: z.string().describe('The main question text'),
  options: z.array(z.string()).describe('Array of answer options'),
  correctAnswer: z.union([z.string(), z.array(z.string())]).describe('Correct answer(s)'),
  explanation: z.string().describe('Detailed explanation of the correct answer'),
  domain: z.enum(['people', 'process', 'business_environment']).describe('PMP exam domain'),
  knowledgeArea: z.string().describe('Specific PMBOK knowledge area'),
  process: z.string().optional().describe('PMBOK process if applicable'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Question difficulty level'),
  type: z
    .enum(['single', 'multiple', 'scenario', 'calculation', 'drag_drop'])
    .describe('Question type'),
  bloomsLevel: z
    .enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
    .describe("Bloom's taxonomy level"),
  estimatedTime: z.number().describe('Estimated time to answer in seconds'),
  tags: z.array(z.string()).describe('Relevant tags for the question'),
  references: z.array(z.string()).describe('PMBOK or other references'),
  distractors: z
    .array(
      z.object({
        text: z.string(),
        reasoning: z.string().describe('Why this is a plausible but incorrect answer'),
      })
    )
    .optional(),
  contextScenario: z.string().optional().describe('Real-world project scenario context'),
  learningObjective: z.string().describe('What the student should learn from this question'),
  commonMistakes: z.array(z.string()).optional().describe('Common mistakes students make'),
  hints: z.array(z.string()).optional().describe('Progressive hints for learning mode'),
  relatedConcepts: z.array(z.string()).describe('Related PMBOK concepts'),
  difficultyFactors: z
    .object({
      conceptComplexity: z.number().min(0).max(1),
      calculationRequired: z.boolean(),
      multiStepReasoning: z.boolean(),
      realWorldApplication: z.boolean(),
      ambiguityLevel: z.number().min(0).max(1),
    })
    .optional(),
})

export type GeneratedQuestion = z.infer<typeof questionSchema>

// Question generation templates for different types
const questionTemplates = {
  scenario: `You are an expert PMP exam question creator specializing in scenario-based questions.
Create a realistic project management scenario question that tests understanding of {domain} concepts.

Requirements:
- The scenario should reflect real-world project situations
- Include enough context to make the situation clear
- Test practical application, not just memorization
- Include 4 plausible options with clear distractors
- Focus on {knowledgeArea} within the {process} process
- Target difficulty: {difficulty}
- Bloom's level: {bloomsLevel}

Context for this question:
{context}

Previous similar questions to avoid duplication:
{similarQuestions}

Generate a complete question following the exact schema.`,

  calculation: `You are an expert PMP exam question creator specializing in calculation questions.
Create a calculation-based question testing {knowledgeArea} concepts.

Requirements:
- Include all necessary data for calculations
- Use realistic project values and scenarios
- Test understanding of formulas and their application
- Provide 4 answer options with common calculation errors as distractors
- Include step-by-step explanation in the answer
- Target difficulty: {difficulty}

Formulas that might be relevant:
{relevantFormulas}

Generate a complete question following the exact schema.`,

  conceptual: `You are an expert PMP exam question creator specializing in conceptual understanding.
Create a question that tests deep understanding of {knowledgeArea} concepts.

Requirements:
- Test understanding, not memorization
- Focus on "why" and "how" rather than "what"
- Include scenarios where the concept applies
- Create meaningful distractors based on common misconceptions
- Target Bloom's level: {bloomsLevel}
- Difficulty: {difficulty}

Key concepts to test:
{keyConcepts}

Common misconceptions to address:
{misconceptions}

Generate a complete question following the exact schema.`,

  integration: `You are an expert PMP exam question creator specializing in integration questions.
Create a question that tests understanding of how {knowledgeArea} integrates with other knowledge areas.

Requirements:
- Show relationships between different PMBOK processes
- Test systems thinking and holistic understanding
- Include impacts across multiple knowledge areas
- Create options that test understanding of dependencies
- Target difficulty: {difficulty}

Integration points to consider:
{integrationPoints}

Generate a complete question following the exact schema.`,
}

// Few-shot examples for better generation
const fewShotExamples = [
  {
    input: {
      domain: 'people',
      knowledgeArea: 'resource',
      difficulty: 'medium',
      bloomsLevel: 'apply',
    },
    output: {
      question:
        'A project manager is leading a virtual team across three time zones. Team members are reporting communication challenges and decreased productivity. What should the project manager do FIRST to address this issue?',
      options: [
        'A. Schedule all meetings during overlapping work hours and require mandatory attendance',
        'B. Conduct a team assessment to understand specific communication preferences and challenges',
        'C. Implement a new project management tool with better collaboration features',
        'D. Request co-location of team members to improve communication',
      ],
      correctAnswer: 'B',
      explanation:
        'Before implementing any solution, the project manager should first understand the root cause of the communication challenges. Conducting a team assessment will reveal specific issues, preferences, and constraints that can inform the best solution. This follows the principle of understanding before acting.',
      domain: 'people',
      knowledgeArea: 'resource',
      difficulty: 'medium',
      bloomsLevel: 'apply',
    },
  },
]

// Model configuration for different providers
export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'azure'
  modelName: string
  temperature?: number
  maxTokens?: number
  apiKey?: string
  baseUrl?: string
}

export class QuestionGenerationAgent {
  private model: ChatOpenAI | ChatAnthropic | ChatOllama
  private embeddings: OpenAIEmbeddings
  private vectorStore: HNSWLib | null = null
  private outputParser: StructuredOutputParser<GeneratedQuestion>
  private outputFixingParser: OutputFixingParser<GeneratedQuestion>
  private questionHistory: GeneratedQuestion[] = []
  private performanceMetrics: Map<string, QuestionPerformanceMetrics> = new Map()

  constructor(config: ModelConfig) {
    // Initialize the appropriate model
    this.model = this.initializeModel(config)

    // Initialize embeddings for semantic similarity
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    })

    // Initialize output parser with schema
    this.outputParser = StructuredOutputParser.fromZodSchema(questionSchema)

    // Initialize output fixing parser for error recovery
    this.outputFixingParser = OutputFixingParser.fromLLM(this.model, this.outputParser)
  }

  private initializeModel(config: ModelConfig): ChatOpenAI | ChatAnthropic | ChatOllama {
    switch (config.provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: config.modelName || 'gpt-4-turbo-preview',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
        })

      case 'anthropic':
        return new ChatAnthropic({
          modelName: config.modelName || 'claude-3-sonnet-20240229',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          anthropicApiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
        })

      case 'ollama':
        return new ChatOllama({
          model: config.modelName || 'llama3',
          temperature: config.temperature || 0.7,
          baseUrl: config.baseUrl || 'http://localhost:11434',
        })

      default:
        throw new Error(`Unsupported model provider: ${config.provider}`)
    }
  }

  /**
   * Initialize vector store for semantic similarity checking
   */
  async initializeVectorStore(existingQuestions: GeneratedQuestion[] = []) {
    const documents = existingQuestions.map(
      (q) =>
        new Document({
          pageContent: q.question,
          metadata: {
            id: q.id,
            domain: q.domain,
            knowledgeArea: q.knowledgeArea,
            difficulty: q.difficulty,
            type: q.type,
          },
        })
    )

    if (documents.length > 0) {
      this.vectorStore = await HNSWLib.fromDocuments(documents, this.embeddings)
    } else {
      this.vectorStore = await HNSWLib.fromTexts(
        ['Initial document'],
        [{ id: 'init' }],
        this.embeddings
      )
    }

    this.questionHistory = existingQuestions
  }

  /**
   * Generate a single question based on parameters
   */
  async generateQuestion(params: {
    domain: 'people' | 'process' | 'business_environment'
    knowledgeArea: string
    process?: string
    difficulty: 'easy' | 'medium' | 'hard'
    type?: 'single' | 'multiple' | 'scenario' | 'calculation' | 'drag_drop'
    bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
    context?: string
    avoidSimilarTo?: string[]
  }): Promise<GeneratedQuestion> {
    // Determine question type if not specified
    const questionType = params.type || this.determineQuestionType(params)

    // Get similar questions to avoid duplication
    const similarQuestions = await this.findSimilarQuestions(params.context || '', 5)

    // Select appropriate template
    const template = this.selectTemplate(questionType)

    // Create the prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', template],
      ['human', '{input}'],
      ['ai', '{format_instructions}'],
    ])

    // Create the chain
    const chain = RunnableSequence.from([
      {
        domain: () => params.domain,
        knowledgeArea: () => params.knowledgeArea,
        process: () => params.process || 'N/A',
        difficulty: () => params.difficulty,
        bloomsLevel: () => params.bloomsLevel || this.determineBloomsLevel(params.difficulty),
        context: () => params.context || 'General PMP exam context',
        similarQuestions: () => this.formatSimilarQuestions(similarQuestions),
        relevantFormulas: () => this.getRelevantFormulas(params.knowledgeArea),
        keyConcepts: () => this.getKeyConcepts(params.knowledgeArea),
        misconceptions: () => this.getCommonMisconceptions(params.knowledgeArea),
        integrationPoints: () => this.getIntegrationPoints(params.knowledgeArea),
        input: () => 'Generate a high-quality PMP exam question',
        format_instructions: () => this.outputParser.getFormatInstructions(),
      },
      prompt,
      this.model,
      this.outputFixingParser,
    ])

    // Generate the question
    const generatedQuestion = await chain.invoke({})

    // Enhance the question with additional metadata
    const enhancedQuestion = await this.enhanceQuestion(generatedQuestion)

    // Validate the question quality
    const qualityScore = await this.assessQuestionQuality(enhancedQuestion)

    if (qualityScore < 0.7) {
      // Regenerate if quality is too low
      return this.regenerateWithFeedback(enhancedQuestion, qualityScore)
    }

    // Add to vector store for future similarity checks
    await this.addToVectorStore(enhancedQuestion)

    // Store in history
    this.questionHistory.push(enhancedQuestion)

    return enhancedQuestion
  }

  /**
   * Generate multiple questions with diversity
   */
  async generateQuestionSet(params: {
    count: number
    domainDistribution?: Record<string, number>
    difficultyDistribution?: Record<string, number>
    ensureCoverage?: string[] // Knowledge areas to ensure coverage
  }): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = []

    // Calculate distribution
    const domainCounts = this.calculateDistribution(
      params.count,
      params.domainDistribution || {
        people: 0.42,
        process: 0.5,
        business_environment: 0.08,
      }
    )

    const difficultyCounts = this.calculateDistribution(
      params.count,
      params.difficultyDistribution || {
        easy: 0.2,
        medium: 0.6,
        hard: 0.2,
      }
    )

    // Generate questions for each domain and difficulty
    for (const [domain, count] of Object.entries(domainCounts)) {
      for (let i = 0; i < count; i++) {
        const difficulty = this.selectDifficulty(difficultyCounts)
        const knowledgeArea = this.selectKnowledgeArea(domain, params.ensureCoverage)

        const question = await this.generateQuestion({
          domain: domain as any,
          knowledgeArea,
          difficulty: difficulty as any,
          avoidSimilarTo: questions.map((q) => q.id),
        })

        questions.push(question)
      }
    }

    // Shuffle for randomness
    return this.shuffleArray(questions)
  }

  /**
   * Find similar questions using semantic search
   */
  private async findSimilarQuestions(query: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      return []
    }

    const results = await this.vectorStore.similaritySearch(query, k)
    return results
  }

  /**
   * Enhance question with additional metadata
   */
  private async enhanceQuestion(question: GeneratedQuestion): Promise<GeneratedQuestion> {
    // Calculate estimated time based on complexity
    const estimatedTime = this.calculateEstimatedTime(question)

    // Generate progressive hints if not provided
    const hints = question.hints || (await this.generateHints(question))

    // Identify related concepts
    const relatedConcepts = await this.identifyRelatedConcepts(question)

    // Add difficulty factors
    const difficultyFactors = this.analyzeDifficultyFactors(question)

    return {
      ...question,
      id: this.generateQuestionId(),
      estimatedTime,
      hints,
      relatedConcepts,
      difficultyFactors,
    }
  }

  /**
   * Assess question quality using multiple criteria
   */
  async assessQuestionQuality(question: GeneratedQuestion): Promise<number> {
    const criteria = {
      clarity: await this.assessClarity(question),
      relevance: await this.assessRelevance(question),
      distractorQuality: await this.assessDistractors(question),
      difficultyAlignment: this.assessDifficultyAlignment(question),
      technicalAccuracy: await this.assessTechnicalAccuracy(question),
      bias: await this.assessBias(question),
      answerability: await this.assessAnswerability(question),
    }

    // Weighted average of all criteria
    const weights = {
      clarity: 0.2,
      relevance: 0.2,
      distractorQuality: 0.15,
      difficultyAlignment: 0.15,
      technicalAccuracy: 0.15,
      bias: 0.1,
      answerability: 0.05,
    }

    const totalScore = Object.entries(criteria).reduce((score, [key, value]) => {
      return score + value * weights[key as keyof typeof weights]
    }, 0)

    return totalScore
  }

  /**
   * Regenerate question with feedback
   */
  private async regenerateWithFeedback(
    originalQuestion: GeneratedQuestion,
    qualityScore: number
  ): Promise<GeneratedQuestion> {
    const feedback = this.generateQualityFeedback(originalQuestion, qualityScore)

    const improvePrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are an expert at improving PMP exam questions. Review the following question and feedback, then generate an improved version.',
      ],
      [
        'human',
        `Original question: {question}\n\nQuality score: {score}\n\nFeedback: {feedback}\n\nGenerate an improved version following the schema.`,
      ],
      ['ai', '{format_instructions}'],
    ])

    const chain = RunnableSequence.from([
      {
        question: () => JSON.stringify(originalQuestion),
        score: () => qualityScore.toString(),
        feedback: () => feedback,
        format_instructions: () => this.outputParser.getFormatInstructions(),
      },
      improvePrompt,
      this.model,
      this.outputFixingParser,
    ])

    return await chain.invoke({})
  }

  /**
   * Helper methods
   */

  private determineQuestionType(params: any): string {
    // Logic to determine best question type based on parameters
    if (params.knowledgeArea.includes('cost') || params.knowledgeArea.includes('schedule')) {
      return 'calculation'
    }
    if (params.bloomsLevel === 'apply' || params.bloomsLevel === 'analyze') {
      return 'scenario'
    }
    if (params.knowledgeArea.includes('integration')) {
      return 'integration'
    }
    return 'conceptual'
  }

  private determineBloomsLevel(difficulty: string): string {
    const mapping = {
      easy: 'understand',
      medium: 'apply',
      hard: 'analyze',
    }
    return mapping[difficulty as keyof typeof mapping] || 'understand'
  }

  private selectTemplate(type: string): string {
    return questionTemplates[type as keyof typeof questionTemplates] || questionTemplates.conceptual
  }

  private formatSimilarQuestions(questions: Document[]): string {
    return questions.map((q) => q.pageContent).join('\n')
  }

  private getRelevantFormulas(knowledgeArea: string): string {
    const formulas: Record<string, string[]> = {
      cost: ['EV = PV × % Complete', 'CV = EV - AC', 'CPI = EV / AC', 'EAC = BAC / CPI'],
      schedule: ['SV = EV - PV', 'SPI = EV / PV', 'ETC = EAC - AC'],
      risk: ['EMV = Probability × Impact', 'Risk Score = Probability × Impact'],
      procurement: [
        'Point of Total Assumption = ((Ceiling Price - Target Price) / Buyer Share) + Target Cost',
      ],
    }
    return formulas[knowledgeArea]?.join('\n') || ''
  }

  private getKeyConcepts(knowledgeArea: string): string {
    const concepts: Record<string, string[]> = {
      integration: ['Project charter', 'Change control', 'Project closure'],
      scope: ['WBS', 'Scope creep', 'Requirements gathering'],
      schedule: ['Critical path', 'Fast tracking', 'Crashing'],
      cost: ['Earned value', 'Budget baseline', 'Cost of quality'],
      quality: ['Quality assurance', 'Quality control', 'Cost of quality'],
      resource: ['Team development', 'Conflict resolution', 'Resource leveling'],
      communications: ['Communication channels', 'Stakeholder engagement'],
      risk: ['Risk register', 'Risk response strategies', 'Contingency reserves'],
      procurement: ['Contract types', 'Make or buy', 'Source selection'],
      stakeholder: ['Stakeholder analysis', 'Engagement assessment', 'Power/interest grid'],
    }
    return concepts[knowledgeArea]?.join(', ') || ''
  }

  private getCommonMisconceptions(knowledgeArea: string): string {
    const misconceptions: Record<string, string[]> = {
      integration: ['Project charter can be changed anytime', 'PM has full authority'],
      scope: ['Gold plating is good', 'All changes are scope creep'],
      schedule: ['Crashing always works', 'Critical path never changes'],
      cost: ['Cheapest is best', 'Contingency is padding'],
      quality: ['Quality = Gold plating', 'Testing ensures quality'],
      resource: ['More resources = faster completion', 'Conflict is bad'],
      risk: ['All risks are negative', 'Risk can be eliminated'],
      procurement: ['Fixed price = no risk', 'Lowest bid wins'],
      stakeholder: ['Customer is always right', 'Ignore negative stakeholders'],
    }
    return misconceptions[knowledgeArea]?.join(', ') || ''
  }

  private getIntegrationPoints(knowledgeArea: string): string {
    const integrations: Record<string, string[]> = {
      integration: ['All knowledge areas', 'Change control affects all'],
      scope: ['Schedule (WBS → activities)', 'Cost (WBS → cost estimates)'],
      schedule: ['Cost (schedule compression)', 'Resource (resource availability)'],
      cost: ['Schedule (cost-schedule trade-offs)', 'Quality (cost of quality)'],
      quality: ['Cost (prevention vs inspection)', 'Risk (quality risks)'],
      resource: ['Communications (team communication)', 'Schedule (resource availability)'],
      communications: ['Stakeholder (engagement)', 'Risk (communication risks)'],
      risk: ['All knowledge areas', 'Cost (reserves)', 'Schedule (buffers)'],
      procurement: ['Risk (contract risks)', 'Cost (procurement costs)'],
      stakeholder: ['Communications (engagement strategy)', 'Risk (stakeholder risks)'],
    }
    return integrations[knowledgeArea]?.join(', ') || ''
  }

  private calculateEstimatedTime(question: GeneratedQuestion): number {
    let baseTime = 90 // Base time in seconds

    // Adjust based on question type
    const typeMultipliers: Record<string, number> = {
      single: 1.0,
      multiple: 1.3,
      scenario: 1.5,
      calculation: 2.0,
      drag_drop: 1.8,
    }

    baseTime *= typeMultipliers[question.type] || 1.0

    // Adjust based on difficulty
    const difficultyMultipliers: Record<string, number> = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.3,
    }

    baseTime *= difficultyMultipliers[question.difficulty] || 1.0

    // Adjust based on question length
    const wordCount = question.question.split(' ').length
    if (wordCount > 50) {
      baseTime *= 1.2
    }
    if (wordCount > 100) {
      baseTime *= 1.4
    }

    return Math.round(baseTime)
  }

  private async generateHints(question: GeneratedQuestion): Promise<string[]> {
    const hintPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Generate 3 progressive hints for this PMP exam question. Each hint should provide more information than the previous one.',
      ],
      ['human', 'Question: {question}\nCorrect Answer: {answer}\nExplanation: {explanation}'],
    ])

    const chain = hintPrompt.pipe(this.model).pipe(new StringOutputParser())

    const hintsText = await chain.invoke({
      question: question.question,
      answer: question.correctAnswer,
      explanation: question.explanation,
    })

    return hintsText
      .split('\n')
      .filter((h) => h.trim())
      .slice(0, 3)
  }

  private async identifyRelatedConcepts(question: GeneratedQuestion): Promise<string[]> {
    // Use embeddings to find related concepts
    const concepts = [
      'Project Integration Management',
      'Project Scope Management',
      'Project Schedule Management',
      'Project Cost Management',
      'Project Quality Management',
      'Project Resource Management',
      'Project Communications Management',
      'Project Risk Management',
      'Project Procurement Management',
      'Project Stakeholder Management',
    ]

    // For now, return concepts based on knowledge area
    // In production, use embeddings for semantic similarity
    return concepts.filter((c) => c.toLowerCase().includes(question.knowledgeArea.toLowerCase()))
  }

  private analyzeDifficultyFactors(question: GeneratedQuestion): any {
    return {
      conceptComplexity: this.calculateConceptComplexity(question),
      calculationRequired: question.type === 'calculation',
      multiStepReasoning: question.question.includes('first') || question.question.includes('then'),
      realWorldApplication: question.type === 'scenario',
      ambiguityLevel: this.calculateAmbiguity(question),
    }
  }

  private calculateConceptComplexity(question: GeneratedQuestion): number {
    // Simple heuristic based on knowledge area and Bloom's level
    const bloomsComplexity: Record<string, number> = {
      remember: 0.1,
      understand: 0.3,
      apply: 0.5,
      analyze: 0.7,
      evaluate: 0.85,
      create: 1.0,
    }
    return bloomsComplexity[question.bloomsLevel] || 0.5
  }

  private calculateAmbiguity(question: GeneratedQuestion): number {
    // Check for ambiguous words
    const ambiguousWords = ['might', 'could', 'possibly', 'sometimes', 'usually', 'often']
    const wordCount = question.question.split(' ').length
    const ambiguousCount = ambiguousWords.filter((w) =>
      question.question.toLowerCase().includes(w)
    ).length

    return Math.min(ambiguousCount / wordCount, 0.3)
  }

  private async assessClarity(question: GeneratedQuestion): Promise<number> {
    // Use readability metrics and clarity assessment
    // Simplified version - in production, use more sophisticated metrics
    const hasContext = question.contextScenario ? 0.2 : 0
    const hasClearQuestion = question.question.includes('?') ? 0.2 : 0
    const appropriateLength =
      question.question.length > 50 && question.question.length < 500 ? 0.3 : 0.1
    const noAmbiguity = 1 - (question.difficultyFactors?.ambiguityLevel || 0)

    return hasContext + hasClearQuestion + appropriateLength + noAmbiguity * 0.3
  }

  private async assessRelevance(question: GeneratedQuestion): Promise<number> {
    // Check relevance to PMP exam objectives
    const hasReferences = question.references.length > 0 ? 0.3 : 0
    const hasLearningObjective = question.learningObjective ? 0.3 : 0
    const appropriateDomain = ['people', 'process', 'business_environment'].includes(
      question.domain
    )
      ? 0.4
      : 0

    return hasReferences + hasLearningObjective + appropriateDomain
  }

  private async assessDistractors(question: GeneratedQuestion): Promise<number> {
    // Assess quality of wrong answer options
    if (!question.distractors || question.distractors.length === 0) {
      return 0.5 // Default if no explicit distractor analysis
    }

    const hasReasoning = question.distractors.every((d) => d.reasoning) ? 0.5 : 0
    const appropriateCount = question.distractors.length >= 3 ? 0.5 : 0.25

    return hasReasoning + appropriateCount
  }

  private assessDifficultyAlignment(question: GeneratedQuestion): number {
    // Check if question difficulty aligns with stated difficulty
    const factors = question.difficultyFactors
    if (!factors) {
      return 0.5
    }

    const expectedComplexity = {
      easy: 0.3,
      medium: 0.6,
      hard: 0.9,
    }

    const actualComplexity = factors.conceptComplexity || 0.5
    const expected = expectedComplexity[question.difficulty]
    const difference = Math.abs(actualComplexity - expected)

    return Math.max(0, 1 - difference)
  }

  private async assessTechnicalAccuracy(question: GeneratedQuestion): Promise<number> {
    // In production, validate against PMBOK standards
    // For now, check basic requirements
    const hasCorrectAnswer = question.correctAnswer ? 0.5 : 0
    const hasExplanation = question.explanation ? 0.3 : 0
    const hasReferences = question.references.length > 0 ? 0.2 : 0

    return hasCorrectAnswer + hasExplanation + hasReferences
  }

  private async assessBias(question: GeneratedQuestion): Promise<number> {
    // Check for cultural, gender, or other biases
    // Simplified check - in production, use more sophisticated bias detection
    const biasWords = ['he', 'she', 'his', 'her', 'western', 'eastern']
    const containsBias = biasWords.some((word) => question.question.toLowerCase().includes(word))

    return containsBias ? 0.7 : 1.0
  }

  private async assessAnswerability(question: GeneratedQuestion): Promise<number> {
    // Check if question can be answered with given information
    const hasAllOptions = question.options.length >= 4 ? 0.5 : 0
    const hasUniqueAnswer = question.correctAnswer ? 0.5 : 0

    return hasAllOptions + hasUniqueAnswer
  }

  private generateQualityFeedback(question: GeneratedQuestion, score: number): string {
    const feedback: string[] = []

    if (score < 0.3) {
      feedback.push('Question quality is very low and needs major revision')
    } else if (score < 0.6) {
      feedback.push('Question needs improvement in several areas')
    } else if (score < 0.8) {
      feedback.push('Question is good but could be enhanced')
    }

    // Specific feedback based on factors
    if (
      question.difficultyFactors?.ambiguityLevel &&
      question.difficultyFactors.ambiguityLevel > 0.2
    ) {
      feedback.push('Reduce ambiguous language for clarity')
    }

    if (!question.contextScenario && question.type === 'scenario') {
      feedback.push('Add more context for the scenario')
    }

    if (question.options.length < 4) {
      feedback.push('Add more answer options (minimum 4)')
    }

    return feedback.join('. ')
  }

  private async addToVectorStore(question: GeneratedQuestion) {
    if (!this.vectorStore) {
      return
    }

    const document = new Document({
      pageContent: question.question,
      metadata: {
        id: question.id,
        domain: question.domain,
        knowledgeArea: question.knowledgeArea,
        difficulty: question.difficulty,
        type: question.type,
      },
    })

    await this.vectorStore.addDocuments([document])
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateDistribution(
    total: number,
    distribution: Record<string, number>
  ): Record<string, number> {
    const result: Record<string, number> = {}
    let remaining = total

    const entries = Object.entries(distribution)
    entries.forEach(([key, percentage], index) => {
      if (index === entries.length - 1) {
        result[key] = remaining
      } else {
        const count = Math.round(total * percentage)
        result[key] = count
        remaining -= count
      }
    })

    return result
  }

  private selectDifficulty(difficultyCounts: Record<string, number>): string {
    for (const [difficulty, count] of Object.entries(difficultyCounts)) {
      if (count > 0) {
        difficultyCounts[difficulty]--
        return difficulty
      }
    }
    return 'medium'
  }

  private selectKnowledgeArea(domain: string, ensureCoverage?: string[]): string {
    const knowledgeAreas: Record<string, string[]> = {
      people: ['resource', 'stakeholder', 'communications'],
      process: ['integration', 'scope', 'schedule', 'cost', 'quality', 'risk', 'procurement'],
      business_environment: ['integration', 'stakeholder'],
    }

    const areas = knowledgeAreas[domain] || ['integration']

    if (ensureCoverage && ensureCoverage.length > 0) {
      const uncovered = ensureCoverage.filter((area) => areas.includes(area))
      if (uncovered.length > 0) {
        return uncovered[0]
      }
    }

    return areas[Math.floor(Math.random() * areas.length)]
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Store performance metrics for continuous improvement
   */
  storePerformanceMetrics(questionId: string, metrics: QuestionPerformanceMetrics) {
    this.performanceMetrics.set(questionId, metrics)
  }

  /**
   * Get performance insights for question improvement
   */
  getPerformanceInsights(questionId: string): QuestionPerformanceMetrics | undefined {
    return this.performanceMetrics.get(questionId)
  }
}

// Performance metrics interface
export interface QuestionPerformanceMetrics {
  questionId: string
  timesAnswered: number
  correctRate: number
  averageTimeSpent: number
  discriminationIndex: number // How well the question differentiates between high and low performers
  difficultyIndex: number // Actual difficulty based on performance
  studentFeedback: {
    clarity: number
    relevance: number
    difficulty: number
  }
  flaggedForReview: boolean
  lastUpdated: Date
}
