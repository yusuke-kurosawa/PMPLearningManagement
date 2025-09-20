/**
 * Question Quality Assessment Framework
 * Comprehensive evaluation system for AI-generated and human-created questions
 */

import natural from 'natural'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import type { GeneratedQuestion } from './questionGenerationAgent'

// Quality dimensions based on educational assessment theory
export interface QualityDimensions {
  clarity: QualityScore // How clear and unambiguous the question is
  relevance: QualityScore // Alignment with learning objectives
  difficulty: QualityScore // Appropriate difficulty level
  discrimination: QualityScore // Ability to differentiate skill levels
  validity: QualityScore // Measures what it intends to measure
  reliability: QualityScore // Consistency of measurement
  fairness: QualityScore // Free from bias and accessible
  engagement: QualityScore // Interesting and motivating
  distractors: QualityScore // Quality of wrong answer options
  feedback: QualityScore // Quality of explanation/feedback
}

export interface QualityScore {
  score: number // 0-1 scale
  confidence: number // Confidence in the assessment
  issues: string[] // Specific issues identified
  suggestions: string[] // Improvement suggestions
}

// Detailed quality report
export interface QualityReport {
  overallScore: number
  dimensions: QualityDimensions
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  readabilityMetrics: ReadabilityMetrics
  biasAnalysis: BiasAnalysis
  technicalValidity: TechnicalValidity
  pedagogicalValue: PedagogicalValue
  automatedChecks: AutomatedChecks
  timestamp: Date
}

export interface ReadabilityMetrics {
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
  automatedReadabilityIndex: number
  colemanLiauIndex: number
  smogIndex: number
  averageSentenceLength: number
  averageWordLength: number
  complexWordPercentage: number
}

export interface BiasAnalysis {
  culturalBias: BiasScore
  genderBias: BiasScore
  socioeconomicBias: BiasScore
  geographicBias: BiasScore
  languageBias: BiasScore
  overallBiasScore: number
  flaggedTerms: string[]
}

export interface BiasScore {
  detected: boolean
  severity: 'none' | 'low' | 'medium' | 'high'
  examples: string[]
  mitigation: string[]
}

export interface TechnicalValidity {
  pmbokAlignment: boolean
  accurateTerminology: boolean
  correctFormulas: boolean
  validScenarios: boolean
  currentStandards: boolean
  referencesValid: boolean
  issues: string[]
}

export interface PedagogicalValue {
  bloomsTaxonomyLevel: string
  learningObjectiveAlignment: number
  constructiveAlignment: boolean
  assessmentType: 'formative' | 'summative'
  cognitiveLoad: 'low' | 'medium' | 'high'
  scaffoldingPresent: boolean
  transferPotential: number
}

export interface AutomatedChecks {
  grammarErrors: number
  spellingErrors: number
  punctuationErrors: number
  formatIssues: number
  lengthAppropriate: boolean
  optionsBalanced: boolean
  answerKeyValid: boolean
  duplicateContent: boolean
}

export class QuestionQualityAssessment {
  private tokenizer: any
  private sentenceTokenizer: any
  private llm: ChatOpenAI
  private biasWordLists: Map<string, Set<string>>
  private technicalTerms: Set<string>
  private pmbokProcesses: Set<string>

  constructor() {
    // Initialize NLP tools
    this.tokenizer = new natural.WordTokenizer()
    this.sentenceTokenizer = new natural.SentenceTokenizer()

    // Initialize LLM for advanced analysis
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      maxTokens: 1000,
    })

    // Initialize bias detection word lists
    this.initializeBiasWordLists()

    // Initialize technical validation sets
    this.initializeTechnicalTerms()
    this.initializePMBOKProcesses()
  }

  /**
   * Comprehensive quality assessment
   */
  async assessQuestion(question: GeneratedQuestion): Promise<QualityReport> {
    // Run all assessment dimensions in parallel for efficiency
    const [
      dimensions,
      readabilityMetrics,
      biasAnalysis,
      technicalValidity,
      pedagogicalValue,
      automatedChecks,
    ] = await Promise.all([
      this.assessAllDimensions(question),
      this.calculateReadabilityMetrics(question.question),
      this.analyzeBias(question),
      this.validateTechnical(question),
      this.assessPedagogicalValue(question),
      this.runAutomatedChecks(question),
    ])

    // Calculate overall score
    const overallScore = this.calculateOverallScore(dimensions)

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(dimensions)

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      dimensions,
      biasAnalysis,
      technicalValidity,
      pedagogicalValue,
      automatedChecks
    )

    return {
      overallScore,
      dimensions,
      strengths,
      weaknesses,
      recommendations,
      readabilityMetrics,
      biasAnalysis,
      technicalValidity,
      pedagogicalValue,
      automatedChecks,
      timestamp: new Date(),
    }
  }

  /**
   * Assess all quality dimensions
   */
  private async assessAllDimensions(question: GeneratedQuestion): Promise<QualityDimensions> {
    const [
      clarity,
      relevance,
      difficulty,
      discrimination,
      validity,
      reliability,
      fairness,
      engagement,
      distractors,
      feedback,
    ] = await Promise.all([
      this.assessClarity(question),
      this.assessRelevance(question),
      this.assessDifficulty(question),
      this.assessDiscrimination(question),
      this.assessValidity(question),
      this.assessReliability(question),
      this.assessFairness(question),
      this.assessEngagement(question),
      this.assessDistractors(question),
      this.assessFeedback(question),
    ])

    return {
      clarity,
      relevance,
      difficulty,
      discrimination,
      validity,
      reliability,
      fairness,
      engagement,
      distractors,
      feedback,
    }
  }

  /**
   * Clarity Assessment
   */
  private async assessClarity(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check for ambiguous language
    const ambiguousTerms = ['might', 'could', 'possibly', 'sometimes', 'usually', 'generally']
    const questionLower = question.question.toLowerCase()
    const foundAmbiguous = ambiguousTerms.filter((term) => questionLower.includes(term))

    if (foundAmbiguous.length > 0) {
      score -= 0.2
      issues.push(`Contains ambiguous terms: ${foundAmbiguous.join(', ')}`)
      suggestions.push('Replace ambiguous terms with specific language')
    }

    // Check for double negatives
    const negatives = ['not', 'no', 'never', 'neither', 'nor', "n't"]
    const negativeCount = negatives.filter((neg) => questionLower.includes(neg)).length

    if (negativeCount > 1) {
      score -= 0.3
      issues.push('Contains double negatives')
      suggestions.push('Rephrase to use positive language')
    }

    // Check sentence complexity
    const sentences = this.sentenceTokenizer.tokenize(question.question)
    const avgWordsPerSentence = question.question.split(' ').length / sentences.length

    if (avgWordsPerSentence > 30) {
      score -= 0.2
      issues.push('Sentences are too long and complex')
      suggestions.push('Break down into shorter, clearer sentences')
    }

    // Check for clear question structure
    if (
      !question.question.includes('?') &&
      !question.question.match(/which|what|how|when|where|who|why/i)
    ) {
      score -= 0.1
      issues.push('Question structure is unclear')
      suggestions.push('Ensure the question clearly asks what needs to be answered')
    }

    // Use LLM for advanced clarity assessment
    const llmAssessment = await this.assessClarityWithLLM(question.question)
    score = (score + llmAssessment.score) / 2
    issues.push(...llmAssessment.issues)
    suggestions.push(...llmAssessment.suggestions)

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.85,
      issues,
      suggestions,
    }
  }

  /**
   * Relevance Assessment
   */
  private async assessRelevance(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check PMBOK alignment
    if (!question.references || question.references.length === 0) {
      score -= 0.3
      issues.push('No PMBOK references provided')
      suggestions.push('Add relevant PMBOK references')
    }

    // Check domain appropriateness
    const validDomains = ['people', 'process', 'business_environment']
    if (!validDomains.includes(question.domain)) {
      score -= 0.2
      issues.push('Invalid or missing domain classification')
      suggestions.push('Classify into correct PMP exam domain')
    }

    // Check learning objective presence
    if (!question.learningObjective) {
      score -= 0.2
      issues.push('No learning objective specified')
      suggestions.push('Define clear learning objective')
    }

    // Check for real-world applicability
    if (question.type === 'scenario' && !question.contextScenario) {
      score -= 0.2
      issues.push('Scenario question lacks context')
      suggestions.push('Add realistic project scenario context')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.9,
      issues,
      suggestions,
    }
  }

  /**
   * Difficulty Assessment
   */
  private async assessDifficulty(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check difficulty alignment with complexity
    const factors = question.difficultyFactors
    if (factors) {
      const expectedComplexity = {
        easy: [0.1, 0.4],
        medium: [0.4, 0.7],
        hard: [0.7, 1.0],
      }

      const range = expectedComplexity[question.difficulty]
      if (factors.conceptComplexity < range[0] || factors.conceptComplexity > range[1]) {
        score -= 0.3
        issues.push("Difficulty level doesn't match question complexity")
        suggestions.push('Adjust difficulty classification or question complexity')
      }
    }

    // Check Bloom's taxonomy alignment
    const bloomsDifficulty = {
      remember: 'easy',
      understand: 'easy',
      apply: 'medium',
      analyze: 'medium',
      evaluate: 'hard',
      create: 'hard',
    }

    const expectedDifficulty = bloomsDifficulty[question.bloomsLevel]
    if (expectedDifficulty !== question.difficulty) {
      score -= 0.2
      issues.push(
        `Bloom's level (${question.bloomsLevel}) doesn't align with difficulty (${question.difficulty})`
      )
      suggestions.push('Align difficulty with cognitive level required')
    }

    // Check time estimate appropriateness
    const expectedTime = {
      easy: [30, 90],
      medium: [60, 120],
      hard: [90, 180],
    }

    const timeRange = expectedTime[question.difficulty]
    if (question.estimatedTime < timeRange[0] || question.estimatedTime > timeRange[1]) {
      score -= 0.1
      issues.push("Time estimate doesn't match difficulty")
      suggestions.push('Adjust time estimate for difficulty level')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.8,
      issues,
      suggestions,
    }
  }

  /**
   * Discrimination Assessment
   */
  private async assessDiscrimination(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 0.7 // Start with neutral score

    // Check for ceiling/floor effects
    if (question.difficulty === 'easy' && question.difficultyFactors?.conceptComplexity < 0.2) {
      score -= 0.2
      issues.push('Question may be too easy (ceiling effect)')
      suggestions.push('Increase complexity to better differentiate abilities')
    }

    if (question.difficulty === 'hard' && question.difficultyFactors?.conceptComplexity > 0.9) {
      score -= 0.2
      issues.push('Question may be too hard (floor effect)')
      suggestions.push('Reduce complexity to avoid frustration')
    }

    // Check for appropriate cognitive demand
    if (question.bloomsLevel === 'remember' || question.bloomsLevel === 'understand') {
      score -= 0.1
      issues.push('Lower cognitive levels have limited discrimination power')
      suggestions.push('Consider higher-order thinking questions')
    }

    // Bonus for good discrimination features
    if (question.type === 'scenario' || question.type === 'calculation') {
      score += 0.2
      // These types typically discriminate better
    }

    if (question.difficultyFactors?.multiStepReasoning) {
      score += 0.1
      // Multi-step reasoning improves discrimination
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.75,
      issues,
      suggestions,
    }
  }

  /**
   * Validity Assessment
   */
  private async assessValidity(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Content validity - does it measure PMP knowledge?
    if (!question.knowledgeArea || question.knowledgeArea.length === 0) {
      score -= 0.3
      issues.push('No knowledge area specified')
      suggestions.push('Map to specific PMBOK knowledge area')
    }

    // Construct validity - does it measure the intended construct?
    if (question.type === 'calculation' && !question.difficultyFactors?.calculationRequired) {
      score -= 0.2
      issues.push('Question type mismatch')
      suggestions.push('Ensure question type matches content')
    }

    // Criterion validity - predictive of PMP success?
    if (!question.learningObjective) {
      score -= 0.2
      issues.push('No clear connection to PMP competencies')
      suggestions.push('Link to specific PMP exam objectives')
    }

    // Face validity - does it appear valid?
    if (question.options.length < 4) {
      score -= 0.2
      issues.push('Insufficient answer options for PMP format')
      suggestions.push('Provide 4 answer options as per PMP standard')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.85,
      issues,
      suggestions,
    }
  }

  /**
   * Reliability Assessment
   */
  private async assessReliability(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check for consistency in language
    const optionLengths = question.options.map((opt) => opt.length)
    const avgLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length
    const variance =
      optionLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) /
      optionLengths.length

    if (Math.sqrt(variance) > avgLength * 0.5) {
      score -= 0.2
      issues.push('Inconsistent option lengths may affect reliability')
      suggestions.push('Balance option lengths for consistency')
    }

    // Check for clear correct answer
    if (!question.correctAnswer) {
      score -= 0.5
      issues.push('No correct answer specified')
      suggestions.push('Clearly define the correct answer')
    }

    // Check explanation quality
    if (!question.explanation || question.explanation.length < 50) {
      score -= 0.2
      issues.push('Insufficient explanation')
      suggestions.push('Provide detailed explanation for reliability')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.8,
      issues,
      suggestions,
    }
  }

  /**
   * Fairness Assessment
   */
  private async assessFairness(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check for cultural references
    const culturalTerms = ['western', 'eastern', 'american', 'european', 'asian']
    const foundCultural = culturalTerms.filter((term) =>
      question.question.toLowerCase().includes(term)
    )

    if (foundCultural.length > 0) {
      score -= 0.3
      issues.push(`Contains cultural references: ${foundCultural.join(', ')}`)
      suggestions.push('Use culturally neutral examples')
    }

    // Check for gender bias
    const genderTerms = [' he ', ' she ', ' his ', ' her ', ' him ']
    const foundGender = genderTerms.filter((term) => question.question.toLowerCase().includes(term))

    if (foundGender.length > 0) {
      score -= 0.2
      issues.push('Contains gender-specific language')
      suggestions.push('Use gender-neutral language (they/them)')
    }

    // Check for accessibility
    if (question.type === 'drag_drop') {
      score -= 0.1
      issues.push('Drag-drop may have accessibility issues')
      suggestions.push('Ensure keyboard navigation support')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.9,
      issues,
      suggestions,
    }
  }

  /**
   * Engagement Assessment
   */
  private async assessEngagement(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 0.5 // Start neutral

    // Scenario-based questions are more engaging
    if (question.type === 'scenario' && question.contextScenario) {
      score += 0.3
    } else if (question.type === 'scenario') {
      issues.push('Scenario lacks context')
      suggestions.push('Add realistic project context')
    }

    // Real-world application increases engagement
    if (question.difficultyFactors?.realWorldApplication) {
      score += 0.2
    }

    // Check for variety in question format
    if (question.type === 'multiple' || question.type === 'drag_drop') {
      score += 0.1
      // Different formats increase engagement
    }

    // Progressive hints add engagement
    if (question.hints && question.hints.length > 0) {
      score += 0.1
    }

    // Too long questions reduce engagement
    if (question.question.length > 500) {
      score -= 0.2
      issues.push('Question is too lengthy')
      suggestions.push('Condense question while maintaining clarity')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.7,
      issues,
      suggestions,
    }
  }

  /**
   * Distractor Assessment
   */
  private async assessDistractors(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check number of distractors
    const correctCount = Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 1
    const distractorCount = question.options.length - correctCount

    if (distractorCount < 3) {
      score -= 0.3
      issues.push('Insufficient distractors')
      suggestions.push('Add more plausible wrong answers')
    }

    // Check distractor quality
    if (question.distractors) {
      const withReasoning = question.distractors.filter((d) => d.reasoning).length
      if (withReasoning < question.distractors.length) {
        score -= 0.2
        issues.push('Some distractors lack reasoning')
        suggestions.push('Explain why each distractor is plausible but incorrect')
      }
    } else {
      score -= 0.2
      issues.push('No distractor analysis provided')
      suggestions.push('Add distractor reasoning for quality assurance')
    }

    // Check for obvious wrong answers
    const obviousPatterns = ['all of the above', 'none of the above', 'both a and b']
    const hasObvious = question.options.some((opt) =>
      obviousPatterns.some((pattern) => opt.toLowerCase().includes(pattern))
    )

    if (hasObvious) {
      score -= 0.2
      issues.push('Contains obvious pattern answers')
      suggestions.push('Replace with substantive distractors')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.85,
      issues,
      suggestions,
    }
  }

  /**
   * Feedback Assessment
   */
  private async assessFeedback(question: GeneratedQuestion): Promise<QualityScore> {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 1.0

    // Check explanation presence and quality
    if (!question.explanation) {
      score -= 0.5
      issues.push('No explanation provided')
      suggestions.push('Add detailed explanation')
    } else if (question.explanation.length < 100) {
      score -= 0.3
      issues.push('Explanation is too brief')
      suggestions.push('Provide more detailed explanation')
    }

    // Check for references
    if (!question.references || question.references.length === 0) {
      score -= 0.2
      issues.push('No references provided')
      suggestions.push('Add PMBOK or other authoritative references')
    }

    // Check for common mistakes guidance
    if (question.commonMistakes && question.commonMistakes.length > 0) {
      score += 0.1 // Bonus for including common mistakes
    } else {
      suggestions.push('Consider adding common mistakes students make')
    }

    // Check for progressive hints
    if (question.hints && question.hints.length >= 2) {
      score += 0.1 // Bonus for hints
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      confidence: 0.9,
      issues,
      suggestions,
    }
  }

  /**
   * Calculate readability metrics
   */
  private async calculateReadabilityMetrics(text: string): Promise<ReadabilityMetrics> {
    const sentences = this.sentenceTokenizer.tokenize(text)
    const words = this.tokenizer.tokenize(text)
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0)

    const sentenceCount = sentences.length || 1
    const wordCount = words.length || 1
    const avgSentenceLength = wordCount / sentenceCount
    const avgSyllablesPerWord = syllables / wordCount
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount

    // Complex words (3+ syllables)
    const complexWords = words.filter((word) => this.countSyllables(word) >= 3).length
    const complexWordPercentage = (complexWords / wordCount) * 100

    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59

    // Gunning Fog Index
    const gunningFog = 0.4 * (avgSentenceLength + complexWordPercentage)

    // Automated Readability Index
    const automatedReadabilityIndex = 4.71 * avgWordLength + 0.5 * avgSentenceLength - 21.43

    // Coleman-Liau Index
    const avgLettersPerWord = avgWordLength
    const avgSentencesPer100Words = (sentenceCount / wordCount) * 100
    const colemanLiauIndex =
      0.0588 * avgLettersPerWord * 100 - 0.296 * avgSentencesPer100Words - 15.8

    // SMOG Index
    const smogIndex = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291

    return {
      fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
      fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
      gunningFog,
      automatedReadabilityIndex,
      colemanLiauIndex,
      smogIndex,
      averageSentenceLength: avgSentenceLength,
      averageWordLength: avgWordLength,
      complexWordPercentage,
    }
  }

  /**
   * Analyze bias in question
   */
  private async analyzeBias(question: GeneratedQuestion): Promise<BiasAnalysis> {
    const culturalBias = this.detectCulturalBias(question)
    const genderBias = this.detectGenderBias(question)
    const socioeconomicBias = this.detectSocioeconomicBias(question)
    const geographicBias = this.detectGeographicBias(question)
    const languageBias = this.detectLanguageBias(question)

    const biasScores = [culturalBias, genderBias, socioeconomicBias, geographicBias, languageBias]
    const overallBiasScore =
      biasScores.reduce((sum, bias) => {
        const weight =
          bias.severity === 'high'
            ? 1
            : bias.severity === 'medium'
              ? 0.6
              : bias.severity === 'low'
                ? 0.3
                : 0
        return sum + weight
      }, 0) / biasScores.length

    const flaggedTerms = [
      ...culturalBias.examples,
      ...genderBias.examples,
      ...socioeconomicBias.examples,
      ...geographicBias.examples,
      ...languageBias.examples,
    ]

    return {
      culturalBias,
      genderBias,
      socioeconomicBias,
      geographicBias,
      languageBias,
      overallBiasScore,
      flaggedTerms,
    }
  }

  /**
   * Helper methods for quality assessment
   */

  private countSyllables(word: string): number {
    word = word.toLowerCase()
    let count = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiouy'.includes(word[i])
      if (isVowel && !previousWasVowel) {
        count++
      }
      previousWasVowel = isVowel
    }

    // Adjust for silent e
    if (word.endsWith('e')) {
      count--
    }

    // Ensure at least 1 syllable
    return Math.max(1, count)
  }

  private async assessClarityWithLLM(questionText: string): Promise<{
    score: number
    issues: string[]
    suggestions: string[]
  }> {
    const prompt = PromptTemplate.fromTemplate(`
      Assess the clarity of this exam question on a scale of 0-1:
      
      Question: {question}
      
      Evaluate:
      1. Is the question unambiguous?
      2. Is the language clear and precise?
      3. Is it obvious what is being asked?
      
      Provide:
      - Score (0-1)
      - List of clarity issues
      - Specific suggestions for improvement
      
      Format as JSON.
    `)

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        score: z.number().min(0).max(1),
        issues: z.array(z.string()),
        suggestions: z.array(z.string()),
      })
    )

    try {
      const response = await prompt.pipe(this.llm).pipe(parser).invoke({
        question: questionText,
      })
      return response
    } catch (error) {
      // Fallback if LLM fails
      return {
        score: 0.7,
        issues: [],
        suggestions: [],
      }
    }
  }

  private detectCulturalBias(question: GeneratedQuestion): BiasScore {
    const culturalTerms = this.biasWordLists.get('cultural') || new Set()
    const found: string[] = []
    const text = `${question.question} ${question.options.join(' ')}`.toLowerCase()

    culturalTerms.forEach((term) => {
      if (text.includes(term)) {
        found.push(term)
      }
    })

    return {
      detected: found.length > 0,
      severity: found.length > 2 ? 'high' : found.length > 0 ? 'medium' : 'none',
      examples: found,
      mitigation:
        found.length > 0
          ? ['Use culturally neutral examples', 'Avoid region-specific references']
          : [],
    }
  }

  private detectGenderBias(question: GeneratedQuestion): BiasScore {
    const genderTerms = this.biasWordLists.get('gender') || new Set()
    const found: string[] = []
    const text = `${question.question} ${question.options.join(' ')}`.toLowerCase()

    genderTerms.forEach((term) => {
      if (text.includes(term)) {
        found.push(term)
      }
    })

    return {
      detected: found.length > 0,
      severity: found.length > 1 ? 'medium' : found.length > 0 ? 'low' : 'none',
      examples: found,
      mitigation: found.length > 0 ? ['Use gender-neutral pronouns', 'Diversify examples'] : [],
    }
  }

  private detectSocioeconomicBias(question: GeneratedQuestion): BiasScore {
    const socioeconomicTerms = this.biasWordLists.get('socioeconomic') || new Set()
    const found: string[] = []
    const text = `${question.question} ${question.options.join(' ')}`.toLowerCase()

    socioeconomicTerms.forEach((term) => {
      if (text.includes(term)) {
        found.push(term)
      }
    })

    return {
      detected: found.length > 0,
      severity: found.length > 0 ? 'medium' : 'none',
      examples: found,
      mitigation:
        found.length > 0 ? ['Avoid assumptions about resources', 'Use inclusive examples'] : [],
    }
  }

  private detectGeographicBias(question: GeneratedQuestion): BiasScore {
    const geographicTerms = this.biasWordLists.get('geographic') || new Set()
    const found: string[] = []
    const text = `${question.question} ${question.options.join(' ')}`.toLowerCase()

    geographicTerms.forEach((term) => {
      if (text.includes(term)) {
        found.push(term)
      }
    })

    return {
      detected: found.length > 0,
      severity: found.length > 2 ? 'medium' : found.length > 0 ? 'low' : 'none',
      examples: found,
      mitigation:
        found.length > 0 ? ['Use global context', 'Avoid location-specific references'] : [],
    }
  }

  private detectLanguageBias(question: GeneratedQuestion): BiasScore {
    // Check for idioms, colloquialisms, and complex language
    const issues: string[] = []
    const text = question.question.toLowerCase()

    // Common idioms that might not translate well
    const idioms = ['piece of cake', 'ballpark figure', 'bottom line', 'low-hanging fruit']
    const foundIdioms = idioms.filter((idiom) => text.includes(idiom))

    if (foundIdioms.length > 0) {
      issues.push(...foundIdioms)
    }

    // Check readability for ESL students
    const readability = this.calculateReadabilityMetrics(question.question)
    if (readability.fleschKincaidGrade > 12) {
      issues.push('High reading level')
    }

    return {
      detected: issues.length > 0,
      severity: issues.length > 2 ? 'medium' : issues.length > 0 ? 'low' : 'none',
      examples: issues,
      mitigation:
        issues.length > 0
          ? ['Simplify language', 'Avoid idioms', 'Use clear, direct language']
          : [],
    }
  }

  private async validateTechnical(question: GeneratedQuestion): Promise<TechnicalValidity> {
    const issues: string[] = []

    // Check PMBOK alignment
    const pmbokAlignment =
      question.references?.some((ref) => ref.toLowerCase().includes('pmbok')) || false

    // Check terminology
    const questionWords = this.tokenizer.tokenize(question.question.toLowerCase())
    const technicalTermsUsed = questionWords.filter((word) => this.technicalTerms.has(word))
    const accurateTerminology = technicalTermsUsed.length > 0

    // Check formulas (for calculation questions)
    const correctFormulas =
      question.type !== 'calculation' ||
      (question.explanation && question.explanation.includes('='))

    // Check scenarios
    const validScenarios =
      question.type !== 'scenario' ||
      (question.contextScenario && question.contextScenario.length > 50)

    // Assume current standards (would need external validation in production)
    const currentStandards = true

    // Check references
    const referencesValid = question.references && question.references.length > 0

    if (!pmbokAlignment) {
      issues.push('No PMBOK alignment')
    }
    if (!accurateTerminology) {
      issues.push('Limited technical terminology')
    }
    if (!correctFormulas && question.type === 'calculation') {
      issues.push('Missing formula explanation')
    }
    if (!validScenarios && question.type === 'scenario') {
      issues.push('Insufficient scenario context')
    }
    if (!referencesValid) {
      issues.push('No references provided')
    }

    return {
      pmbokAlignment,
      accurateTerminology,
      correctFormulas,
      validScenarios,
      currentStandards,
      referencesValid,
      issues,
    }
  }

  private async assessPedagogicalValue(question: GeneratedQuestion): Promise<PedagogicalValue> {
    // Determine assessment type based on context
    const assessmentType = question.hints && question.hints.length > 0 ? 'formative' : 'summative'

    // Calculate learning objective alignment
    const learningObjectiveAlignment = question.learningObjective ? 0.8 : 0.3

    // Check constructive alignment
    const constructiveAlignment =
      question.bloomsLevel && question.learningObjective && question.explanation

    // Assess cognitive load
    let cognitiveLoad: 'low' | 'medium' | 'high' = 'medium'
    if (question.difficultyFactors) {
      const complexity = question.difficultyFactors.conceptComplexity
      cognitiveLoad = complexity < 0.3 ? 'low' : complexity > 0.7 ? 'high' : 'medium'
    }

    // Check for scaffolding
    const scaffoldingPresent =
      (question.hints && question.hints.length > 0) ||
      (question.contextScenario && question.contextScenario.length > 0)

    // Assess transfer potential
    const transferPotential =
      question.type === 'scenario' || question.type === 'calculation' ? 0.8 : 0.5

    return {
      bloomsTaxonomyLevel: question.bloomsLevel,
      learningObjectiveAlignment,
      constructiveAlignment,
      assessmentType,
      cognitiveLoad,
      scaffoldingPresent,
      transferPotential,
    }
  }

  private async runAutomatedChecks(question: GeneratedQuestion): Promise<AutomatedChecks> {
    // Simplified checks - in production, use proper grammar/spell checkers
    const text = `${question.question} ${question.options.join(' ')} ${question.explanation}`

    // Basic grammar patterns
    const grammarErrors = this.checkGrammar(text)

    // Basic spelling (would use dictionary in production)
    const spellingErrors = 0 // Placeholder

    // Punctuation checks
    const punctuationErrors = this.checkPunctuation(question.question)

    // Format issues
    const formatIssues = this.checkFormat(question)

    // Length checks
    const lengthAppropriate = question.question.length > 20 && question.question.length < 500

    // Options balanced
    const optionLengths = question.options.map((opt) => opt.length)
    const avgLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length
    const optionsBalanced = optionLengths.every(
      (len) => Math.abs(len - avgLength) < avgLength * 0.5
    )

    // Answer key valid
    const answerKeyValid = !!question.correctAnswer

    // Check for duplicate content
    const duplicateContent = new Set(question.options).size !== question.options.length

    return {
      grammarErrors,
      spellingErrors,
      punctuationErrors,
      formatIssues,
      lengthAppropriate,
      optionsBalanced,
      answerKeyValid,
      duplicateContent,
    }
  }

  private checkGrammar(text: string): number {
    let errors = 0

    // Check for subject-verb agreement issues (simplified)
    if (text.match(/\b(is|was)\s+\w+ing\b/)) {
      errors++
    }
    if (text.match(/\b(are|were)\s+\w+s\b/)) {
      errors++
    }

    // Check for sentence fragments
    const sentences = this.sentenceTokenizer.tokenize(text)
    sentences.forEach((sentence) => {
      if (sentence.split(' ').length < 3) {
        errors++
      }
    })

    return errors
  }

  private checkPunctuation(text: string): number {
    let errors = 0

    // Check for missing question mark
    if (!text.includes('?') && text.toLowerCase().includes('what')) {
      errors++
    }

    // Check for double punctuation
    if (text.match(/[.,:;!?]{2,}/)) {
      errors++
    }

    // Check for missing periods
    if (text.match(/[a-z]\s+[A-Z]/)) {
      errors++
    }

    return errors
  }

  private checkFormat(question: GeneratedQuestion): number {
    let issues = 0

    // Check option format
    question.options.forEach((option) => {
      if (!option.match(/^[A-D]\.\s/)) {
        issues++
      }
    })

    // Check for consistent capitalization
    if (question.question[0] !== question.question[0].toUpperCase()) {
      issues++
    }

    return issues
  }

  private calculateOverallScore(dimensions: QualityDimensions): number {
    const weights = {
      clarity: 0.15,
      relevance: 0.15,
      difficulty: 0.1,
      discrimination: 0.1,
      validity: 0.15,
      reliability: 0.1,
      fairness: 0.1,
      engagement: 0.05,
      distractors: 0.05,
      feedback: 0.05,
    }

    let totalScore = 0
    for (const [dimension, weight] of Object.entries(weights)) {
      const dimensionScore = dimensions[dimension as keyof QualityDimensions].score
      totalScore += dimensionScore * weight
    }

    return totalScore
  }

  private identifyStrengthsWeaknesses(dimensions: QualityDimensions): {
    strengths: string[]
    weaknesses: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []

    for (const [name, dimension] of Object.entries(dimensions)) {
      if (dimension.score >= 0.8) {
        strengths.push(`Strong ${name}: ${(dimension.score * 100).toFixed(0)}%`)
      } else if (dimension.score < 0.5) {
        weaknesses.push(`Weak ${name}: ${(dimension.score * 100).toFixed(0)}%`)
      }
    }

    return { strengths, weaknesses }
  }

  private generateRecommendations(
    dimensions: QualityDimensions,
    biasAnalysis: BiasAnalysis,
    technicalValidity: TechnicalValidity,
    pedagogicalValue: PedagogicalValue,
    automatedChecks: AutomatedChecks
  ): string[] {
    const recommendations: string[] = []

    // Collect all suggestions from dimensions
    for (const dimension of Object.values(dimensions)) {
      recommendations.push(...dimension.suggestions)
    }

    // Add bias-related recommendations
    if (biasAnalysis.overallBiasScore > 0.3) {
      recommendations.push('Review and address identified bias issues')
    }

    // Add technical validity recommendations
    if (technicalValidity.issues.length > 0) {
      recommendations.push('Address technical validity concerns')
    }

    // Add pedagogical recommendations
    if (!pedagogicalValue.scaffoldingPresent) {
      recommendations.push('Consider adding scaffolding elements')
    }

    // Add automated check recommendations
    if (automatedChecks.grammarErrors > 0) {
      recommendations.push('Fix grammar errors')
    }

    // Remove duplicates and prioritize
    return [...new Set(recommendations)].slice(0, 5)
  }

  private initializeBiasWordLists() {
    this.biasWordLists = new Map()

    this.biasWordLists.set(
      'cultural',
      new Set([
        'western',
        'eastern',
        'american',
        'european',
        'asian',
        'african',
        'christmas',
        'thanksgiving',
        'halloween',
      ])
    )

    this.biasWordLists.set(
      'gender',
      new Set([
        ' he ',
        ' she ',
        ' his ',
        ' her ',
        ' him ',
        ' man ',
        ' woman ',
        'businessman',
        'businesswoman',
        'chairman',
        'chairwoman',
      ])
    )

    this.biasWordLists.set(
      'socioeconomic',
      new Set([
        'wealthy',
        'poor',
        'luxury',
        'expensive',
        'cheap',
        'privileged',
        'disadvantaged',
        'elite',
        'upper class',
        'lower class',
      ])
    )

    this.biasWordLists.set(
      'geographic',
      new Set([
        'new york',
        'london',
        'tokyo',
        'silicon valley',
        'wall street',
        'downtown',
        'suburb',
        'rural',
        'urban',
        'metropolitan',
      ])
    )
  }

  private initializeTechnicalTerms() {
    this.technicalTerms = new Set([
      'scope',
      'schedule',
      'cost',
      'quality',
      'risk',
      'procurement',
      'stakeholder',
      'integration',
      'resource',
      'communications',
      'wbs',
      'critical path',
      'earned value',
      'baseline',
      'milestone',
      'deliverable',
      'constraint',
      'assumption',
      'dependency',
      'variance',
    ])
  }

  private initializePMBOKProcesses() {
    this.pmbokProcesses = new Set([
      'initiating',
      'planning',
      'executing',
      'monitoring and controlling',
      'closing',
      'develop project charter',
      'develop project management plan',
      'direct and manage project work',
      'monitor and control project work',
      'perform integrated change control',
      'close project or phase',
    ])
  }
}

export default QuestionQualityAssessment
