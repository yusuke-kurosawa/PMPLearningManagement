#!/usr/bin/env node

/**
 * Mock Exam Import Utility
 * Imports exam questions from various formats (JSON, CSV, PDF text extraction)
 *
 * Usage:
 *   node import-mock-exam.js --format json --file questions.json
 *   node import-mock-exam.js --format csv --file questions.csv
 *   node import-mock-exam.js --format pdf-text --file extracted_text.txt
 */

const fs = require('fs').promises
const path = require('path')
const { Pool } = require('pg')
const csv = require('csv-parse/sync')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pmp_learning',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

// Command line arguments
const argv = yargs(hideBin(process.argv))
  .option('format', {
    alias: 'f',
    type: 'string',
    description: 'Input file format',
    choices: ['json', 'csv', 'pdf-text'],
    demandOption: true,
  })
  .option('file', {
    alias: 'i',
    type: 'string',
    description: 'Input file path',
    demandOption: true,
  })
  .option('validate', {
    alias: 'v',
    type: 'boolean',
    description: 'Validate only without importing',
    default: false,
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Perform dry run without database changes',
    default: false,
  })
  .help().argv

/**
 * Question validation schema
 */
const questionSchema = {
  required: ['question_text', 'question_type', 'options', 'correct_answer'],
  optional: [
    'question_domain',
    'question_category',
    'difficulty_level',
    'explanation',
    'references',
    'tags',
    'scenario_context',
    'time_estimate_seconds',
    'is_calculation',
    'pmbok_version',
  ],
  domains: ['people', 'process', 'business_environment'],
  categories: [
    'agile_adaptive',
    'predictive_waterfall',
    'hybrid',
    'leadership',
    'team_performance',
    'communication',
    'risk_management',
    'quality_management',
    'resource_management',
    'stakeholder_engagement',
    'integration_management',
    'scope_management',
    'schedule_management',
    'cost_management',
    'procurement_management',
    'ethics_professional_conduct',
  ],
  questionTypes: ['single', 'multiple', 'situational'],
}

/**
 * Main import function
 */
async function importQuestions() {
  try {
    console.log(`🚀 Starting import from ${argv.file} (format: ${argv.format})`)

    // Read and parse input file
    const questions = await parseInputFile(argv.file, argv.format)
    console.log(`📝 Parsed ${questions.length} questions`)

    // Validate questions
    const validation = validateQuestions(questions)
    if (!validation.valid) {
      console.error('❌ Validation failed:')
      validation.errors.forEach((error) => console.error(`  - ${error}`))
      process.exit(1)
    }
    console.log('✅ All questions validated successfully')

    if (argv.validate) {
      console.log('📋 Validation complete (--validate flag set)')
      process.exit(0)
    }

    // Import to database
    if (argv.dryRun) {
      console.log('🔍 Dry run mode - no database changes will be made')
      questions.forEach((q, i) => {
        console.log(`  Question ${i + 1}: ${q.question_text.substring(0, 50)}...`)
      })
    } else {
      await importToDatabase(questions)
    }

    console.log('✨ Import completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

/**
 * Parse input file based on format
 */
async function parseInputFile(filePath, format) {
  const fileContent = await fs.readFile(filePath, 'utf-8')

  switch (format) {
    case 'json':
      return parseJSON(fileContent)
    case 'csv':
      return parseCSV(fileContent)
    case 'pdf-text':
      return parsePDFText(fileContent)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Parse JSON format
 * Expected structure:
 * [
 *   {
 *     "question_text": "...",
 *     "question_type": "single",
 *     "options": [
 *       { "text": "Option A", "is_correct": false },
 *       { "text": "Option B", "is_correct": true }
 *     ],
 *     "explanation": "...",
 *     ...
 *   }
 * ]
 */
function parseJSON(content) {
  try {
    const data = JSON.parse(content)

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of questions')
    }

    return data.map((q) => ({
      question_text: q.question_text || q.question,
      question_type: q.question_type || 'single',
      question_domain: q.question_domain || q.domain || 'process',
      question_category: q.question_category || q.category,
      difficulty_level: q.difficulty_level || q.difficulty || 3,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      references: q.references,
      tags: q.tags || [],
      scenario_context: q.scenario_context,
      time_estimate_seconds: q.time_estimate_seconds || 90,
      is_calculation: q.is_calculation || false,
      pmbok_version: q.pmbok_version || 6,
    }))
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`)
  }
}

/**
 * Parse CSV format
 * Expected columns:
 * question_text, option_a, option_b, option_c, option_d, correct_answer,
 * explanation, domain, category, difficulty
 */
function parseCSV(content) {
  try {
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    return records.map((row) => {
      const options = []

      // Extract options from columns
      ;['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
        const optionKey = `option_${letter}`
        if (row[optionKey]) {
          options.push({
            text: row[optionKey],
            is_correct: row.correct_answer?.toLowerCase().includes(letter),
          })
        }
      })

      return {
        question_text: row.question_text || row.question,
        question_type: row.question_type || 'single',
        question_domain: mapDomain(row.domain || row.question_domain),
        question_category: mapCategory(row.category || row.question_category),
        difficulty_level: parseInt(row.difficulty || row.difficulty_level) || 3,
        options,
        correct_answer: row.correct_answer,
        explanation: row.explanation,
        references: row.references ? row.references.split(';') : [],
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
        scenario_context: row.scenario_context,
        time_estimate_seconds: parseInt(row.time_estimate) || 90,
        is_calculation: row.is_calculation === 'true' || row.is_calculation === '1',
        pmbok_version: parseInt(row.pmbok_version) || 6,
      }
    })
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`)
  }
}

/**
 * Parse PDF text extraction format
 * Expected format:
 * Question 1: [Question text]
 * A. [Option A]
 * B. [Option B]
 * C. [Option C]
 * D. [Option D]
 * Answer: B
 * Explanation: [Explanation text]
 * ---
 */
function parsePDFText(content) {
  const questions = []
  const blocks = content.split(/---+/)

  for (const block of blocks) {
    if (!block.trim()) continue

    const lines = block.trim().split('\n')
    const question = {
      options: [],
      tags: [],
    }

    let currentSection = null

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Question text
      if (trimmedLine.match(/^Question\s+\d+:/i)) {
        question.question_text = trimmedLine.replace(/^Question\s+\d+:/i, '').trim()
        currentSection = 'question'
      }
      // Options
      else if (trimmedLine.match(/^[A-E]\./)) {
        const optionLetter = trimmedLine[0].toUpperCase()
        const optionText = trimmedLine.substring(2).trim()
        question.options.push({
          text: optionText,
          letter: optionLetter,
          is_correct: false,
        })
        currentSection = 'options'
      }
      // Answer
      else if (trimmedLine.match(/^Answer:/i)) {
        const answer = trimmedLine.replace(/^Answer:/i, '').trim()
        question.correct_answer = answer
        // Mark correct option
        question.options.forEach((opt) => {
          if (opt.letter === answer.toUpperCase()) {
            opt.is_correct = true
          }
        })
      }
      // Explanation
      else if (trimmedLine.match(/^Explanation:/i)) {
        question.explanation = trimmedLine.replace(/^Explanation:/i, '').trim()
        currentSection = 'explanation'
      }
      // Domain
      else if (trimmedLine.match(/^Domain:/i)) {
        question.question_domain = mapDomain(trimmedLine.replace(/^Domain:/i, '').trim())
      }
      // Category
      else if (trimmedLine.match(/^Category:/i)) {
        question.question_category = mapCategory(trimmedLine.replace(/^Category:/i, '').trim())
      }
      // Difficulty
      else if (trimmedLine.match(/^Difficulty:/i)) {
        const diff = trimmedLine
          .replace(/^Difficulty:/i, '')
          .trim()
          .toLowerCase()
        question.difficulty_level = mapDifficulty(diff)
      }
      // References
      else if (trimmedLine.match(/^References?:/i)) {
        question.references = trimmedLine
          .replace(/^References?:/i, '')
          .trim()
          .split(';')
      }
      // Continuation of previous section
      else if (trimmedLine && currentSection) {
        if (currentSection === 'question') {
          question.question_text += ' ' + trimmedLine
        } else if (currentSection === 'explanation') {
          question.explanation += ' ' + trimmedLine
        }
      }
    }

    // Set defaults
    question.question_type = question.question_type || 'single'
    question.question_domain = question.question_domain || 'process'
    question.difficulty_level = question.difficulty_level || 3
    question.time_estimate_seconds = 90
    question.is_calculation = false
    question.pmbok_version = 6

    if (question.question_text && question.options.length > 0) {
      questions.push(question)
    }
  }

  return questions
}

/**
 * Validate questions against schema
 */
function validateQuestions(questions) {
  const errors = []

  questions.forEach((q, index) => {
    const questionNum = index + 1

    // Check required fields
    questionSchema.required.forEach((field) => {
      if (!q[field]) {
        errors.push(`Question ${questionNum}: Missing required field '${field}'`)
      }
    })

    // Validate question type
    if (q.question_type && !questionSchema.questionTypes.includes(q.question_type)) {
      errors.push(`Question ${questionNum}: Invalid question type '${q.question_type}'`)
    }

    // Validate domain
    if (q.question_domain && !questionSchema.domains.includes(q.question_domain)) {
      errors.push(`Question ${questionNum}: Invalid domain '${q.question_domain}'`)
    }

    // Validate category
    if (q.question_category && !questionSchema.categories.includes(q.question_category)) {
      errors.push(`Question ${questionNum}: Invalid category '${q.question_category}'`)
    }

    // Validate difficulty
    if (q.difficulty_level && (q.difficulty_level < 1 || q.difficulty_level > 5)) {
      errors.push(`Question ${questionNum}: Difficulty must be between 1 and 5`)
    }

    // Validate options
    if (q.options) {
      if (q.options.length < 2) {
        errors.push(`Question ${questionNum}: Must have at least 2 options`)
      }

      const correctOptions = q.options.filter((o) => o.is_correct)
      if (q.question_type === 'single' && correctOptions.length !== 1) {
        errors.push(
          `Question ${questionNum}: Single choice question must have exactly 1 correct answer`
        )
      }
      if (q.question_type === 'multiple' && correctOptions.length < 1) {
        errors.push(
          `Question ${questionNum}: Multiple choice question must have at least 1 correct answer`
        )
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Import questions to database
 */
async function importToDatabase(questions) {
  const client = await pool.connect()
  let imported = 0
  let failed = 0

  try {
    await client.query('BEGIN')

    for (const question of questions) {
      try {
        // Insert question
        const questionResult = await client.query(
          `
          INSERT INTO exam_questions (
            question_text,
            question_type,
            question_domain,
            question_category,
            difficulty_level,
            explanation,
            references,
            pmbok_version,
            time_estimate_seconds,
            tags,
            scenario_context,
            is_calculation,
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
          RETURNING id
        `,
          [
            question.question_text,
            question.question_type,
            question.question_domain,
            question.question_category,
            question.difficulty_level,
            question.explanation,
            question.references ? question.references.join('; ') : null,
            question.pmbok_version,
            question.time_estimate_seconds,
            question.tags,
            question.scenario_context,
            question.is_calculation,
          ]
        )

        const questionId = questionResult.rows[0].id

        // Insert options
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i]
          await client.query(
            `
            INSERT INTO question_options (
              question_id,
              option_text,
              is_correct,
              explanation,
              display_order
            ) VALUES ($1, $2, $3, $4, $5)
          `,
            [questionId, option.text, option.is_correct, option.explanation || null, i + 1]
          )
        }

        imported++
        console.log(
          `✅ Imported question ${imported}: ${question.question_text.substring(0, 50)}...`
        )
      } catch (error) {
        failed++
        console.error(`❌ Failed to import question: ${error.message}`)
        console.error(`   Question: ${question.question_text.substring(0, 50)}...`)
      }
    }

    await client.query('COMMIT')
    console.log(`\n📊 Import Summary:`)
    console.log(`   Successfully imported: ${imported}`)
    console.log(`   Failed: ${failed}`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Helper function to map domain strings
 */
function mapDomain(domain) {
  const domainMap = {
    people: 'people',
    process: 'process',
    business: 'business_environment',
    'business environment': 'business_environment',
    business_environment: 'business_environment',
    environment: 'business_environment',
  }

  const normalized = domain?.toLowerCase().trim()
  return domainMap[normalized] || 'process'
}

/**
 * Helper function to map category strings
 */
function mapCategory(category) {
  const categoryMap = {
    agile: 'agile_adaptive',
    waterfall: 'predictive_waterfall',
    hybrid: 'hybrid',
    leadership: 'leadership',
    team: 'team_performance',
    communication: 'communication',
    risk: 'risk_management',
    quality: 'quality_management',
    resource: 'resource_management',
    stakeholder: 'stakeholder_engagement',
    integration: 'integration_management',
    scope: 'scope_management',
    schedule: 'schedule_management',
    cost: 'cost_management',
    procurement: 'procurement_management',
    ethics: 'ethics_professional_conduct',
  }

  const normalized = category?.toLowerCase().trim()

  // Try exact match first
  if (categoryMap[normalized]) {
    return categoryMap[normalized]
  }

  // Try partial match
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized?.includes(key)) {
      return value
    }
  }

  return 'integration_management' // default
}

/**
 * Helper function to map difficulty strings
 */
function mapDifficulty(difficulty) {
  const difficultyMap = {
    'very easy': 1,
    easy: 2,
    medium: 3,
    moderate: 3,
    hard: 4,
    difficult: 4,
    'very hard': 5,
    'very difficult': 5,
    expert: 5,
  }

  const normalized = difficulty?.toLowerCase().trim()

  // Try exact match
  if (difficultyMap[normalized]) {
    return difficultyMap[normalized]
  }

  // Try numeric
  const numeric = parseInt(difficulty)
  if (numeric >= 1 && numeric <= 5) {
    return numeric
  }

  return 3 // default to medium
}

// Run the import
importQuestions().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
