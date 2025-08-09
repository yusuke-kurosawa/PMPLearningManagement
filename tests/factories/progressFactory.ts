import { faker } from '@faker-js/faker';

// Knowledge areas and process groups from PMBOK
export const KNOWLEDGE_AREAS = [
  'INTEGRATION',
  'SCOPE',
  'SCHEDULE',
  'COST',
  'QUALITY',
  'RESOURCE',
  'COMMUNICATION',
  'RISK',
  'PROCUREMENT',
  'STAKEHOLDER',
] as const;

export const PROCESS_GROUPS = [
  'INITIATING',
  'PLANNING',
  'EXECUTING',
  'MONITORING_CONTROLLING',
  'CLOSING',
] as const;

export const LEARNING_STATUS = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'MASTERED',
] as const;

// Learning progress factory
export function createLearningProgress(overrides?: any) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    processId: faker.string.uuid(),
    processName: faker.lorem.words(3),
    knowledgeArea: faker.helpers.arrayElement(KNOWLEDGE_AREAS),
    processGroup: faker.helpers.arrayElement(PROCESS_GROUPS),
    status: faker.helpers.arrayElement(LEARNING_STATUS),
    progress: faker.number.int({ min: 0, max: 100 }),
    score: faker.number.int({ min: 0, max: 100 }),
    timeSpent: faker.number.int({ min: 0, max: 3600 }),
    attempts: faker.number.int({ min: 1, max: 10 }),
    lastAccessedAt: faker.date.recent(),
    completedAt: faker.datatype.boolean() ? faker.date.recent() : null,
    notes: faker.lorem.paragraph(),
    bookmarked: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Exam result factory
export function createExamResult(overrides?: any) {
  const totalQuestions = 180;
  const correctAnswers = faker.number.int({ min: 0, max: totalQuestions });
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    examId: faker.string.uuid(),
    examType: faker.helpers.arrayElement(['PRACTICE', 'MOCK', 'FINAL']),
    score,
    passed: score >= 61, // PMP passing score
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    unanswered: faker.number.int({ min: 0, max: 10 }),
    timeSpent: faker.number.int({ min: 1800, max: 14400 }), // 30min to 4hrs
    startedAt: faker.date.recent(),
    completedAt: faker.date.recent(),
    knowledgeAreaScores: generateKnowledgeAreaScores(),
    processGroupScores: generateProcessGroupScores(),
    flaggedQuestions: generateFlaggedQuestions(),
    answers: generateExamAnswers(totalQuestions),
    feedback: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Generate knowledge area scores
function generateKnowledgeAreaScores() {
  return KNOWLEDGE_AREAS.reduce((acc, area) => {
    acc[area] = {
      total: faker.number.int({ min: 10, max: 30 }),
      correct: faker.number.int({ min: 5, max: 30 }),
      percentage: faker.number.float({ min: 40, max: 100, multipleOf: 0.1 }),
    };
    return acc;
  }, {} as Record<string, any>);
}

// Generate process group scores
function generateProcessGroupScores() {
  return PROCESS_GROUPS.reduce((acc, group) => {
    acc[group] = {
      total: faker.number.int({ min: 20, max: 50 }),
      correct: faker.number.int({ min: 10, max: 50 }),
      percentage: faker.number.float({ min: 40, max: 100, multipleOf: 0.1 }),
    };
    return acc;
  }, {} as Record<string, any>);
}

// Generate flagged questions
function generateFlaggedQuestions(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    questionId: `q-${i + 1}`,
    flaggedAt: faker.date.recent(),
  }));
}

// Generate exam answers
function generateExamAnswers(totalQuestions: number) {
  return Array.from({ length: totalQuestions }, (_, i) => ({
    questionId: `q-${i + 1}`,
    selectedAnswer: faker.helpers.arrayElement(['A', 'B', 'C', 'D', null]),
    correctAnswer: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
    isCorrect: faker.datatype.boolean(),
    timeSpent: faker.number.int({ min: 30, max: 300 }),
    confidence: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
  }));
}

// Flashcard progress factory
export function createFlashcardProgress(overrides?: any) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    flashcardId: faker.string.uuid(),
    processId: faker.string.uuid(),
    category: faker.helpers.arrayElement(['INPUT', 'TOOL', 'OUTPUT']),
    status: faker.helpers.arrayElement(['NEW', 'LEARNING', 'REVIEW', 'MASTERED']),
    easeFactor: faker.number.float({ min: 1.3, max: 2.5, multipleOf: 0.1 }),
    interval: faker.number.int({ min: 1, max: 365 }),
    repetitions: faker.number.int({ min: 0, max: 20 }),
    lastReviewedAt: faker.date.recent(),
    nextReviewAt: faker.date.future(),
    correctCount: faker.number.int({ min: 0, max: 50 }),
    incorrectCount: faker.number.int({ min: 0, max: 20 }),
    averageResponseTime: faker.number.int({ min: 1000, max: 30000 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Study session factory
export function createStudySession(overrides?: any) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: faker.helpers.arrayElement(['READING', 'FLASHCARD', 'EXAM', 'VIDEO']),
    startedAt: faker.date.recent(),
    endedAt: faker.date.recent(),
    duration: faker.number.int({ min: 300, max: 7200 }), // 5min to 2hrs
    processesStudied: faker.number.int({ min: 1, max: 10 }),
    flashcardsReviewed: faker.number.int({ min: 0, max: 100 }),
    questionsAnswered: faker.number.int({ min: 0, max: 50 }),
    correctAnswers: faker.number.int({ min: 0, max: 50 }),
    focusArea: faker.helpers.arrayElement(KNOWLEDGE_AREAS),
    notes: faker.lorem.paragraph(),
    productivity: faker.number.int({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Learning goal factory
export function createLearningGoal(overrides?: any) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']),
    target: {
      processesToComplete: faker.number.int({ min: 1, max: 10 }),
      studyTime: faker.number.int({ min: 1800, max: 14400 }),
      flashcardsToReview: faker.number.int({ min: 10, max: 100 }),
      examScore: faker.number.int({ min: 70, max: 100 }),
    },
    progress: {
      processesCompleted: faker.number.int({ min: 0, max: 10 }),
      studyTimeCompleted: faker.number.int({ min: 0, max: 14400 }),
      flashcardsReviewed: faker.number.int({ min: 0, max: 100 }),
      currentExamScore: faker.number.int({ min: 0, max: 100 }),
    },
    startDate: faker.date.recent(),
    endDate: faker.date.future(),
    completed: faker.datatype.boolean(),
    completedAt: faker.datatype.boolean() ? faker.date.recent() : null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Achievement factory
export function createAchievement(overrides?: any) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: faker.helpers.arrayElement([
      'FIRST_LOGIN',
      'FIRST_PROCESS',
      'ALL_PROCESSES',
      'PERFECT_EXAM',
      'STUDY_STREAK',
      'FLASHCARD_MASTER',
    ]),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    icon: faker.helpers.arrayElement(['🏆', '🎯', '⭐', '🚀', '💪', '🎓']),
    unlockedAt: faker.date.recent(),
    progress: faker.number.int({ min: 0, max: 100 }),
    requirement: faker.number.int({ min: 1, max: 100 }),
    points: faker.number.int({ min: 10, max: 1000 }),
    rarity: faker.helpers.arrayElement(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

// Progress statistics factory
export function createProgressStatistics(userId: string) {
  const totalProcesses = 49;
  const completedProcesses = faker.number.int({ min: 0, max: totalProcesses });
  
  return {
    userId,
    totalProcesses,
    completedProcesses,
    progressPercentage: Math.round((completedProcesses / totalProcesses) * 100),
    knowledgeAreaProgress: KNOWLEDGE_AREAS.reduce((acc, area) => {
      acc[area] = faker.number.int({ min: 0, max: 100 });
      return acc;
    }, {} as Record<string, number>),
    processGroupProgress: PROCESS_GROUPS.reduce((acc, group) => {
      acc[group] = faker.number.int({ min: 0, max: 100 });
      return acc;
    }, {} as Record<string, number>),
    totalStudyTime: faker.number.int({ min: 0, max: 100000 }),
    averageScore: faker.number.float({ min: 60, max: 100, multipleOf: 0.1 }),
    examsTaken: faker.number.int({ min: 0, max: 50 }),
    examsPassed: faker.number.int({ min: 0, max: 50 }),
    currentStreak: faker.number.int({ min: 0, max: 365 }),
    longestStreak: faker.number.int({ min: 0, max: 365 }),
    lastActivityDate: faker.date.recent(),
    estimatedCompletionDate: faker.date.future(),
  };
}

// Batch create progress records
export function createProgressBatch(userId: string, count: number) {
  return Array.from({ length: count }, () => 
    createLearningProgress({ userId })
  );
}

// Create complete user progress
export function createCompleteUserProgress(userId: string) {
  return {
    learningProgress: createProgressBatch(userId, 49),
    examResults: Array.from({ length: 5 }, () => createExamResult({ userId })),
    flashcardProgress: Array.from({ length: 100 }, () => 
      createFlashcardProgress({ userId })
    ),
    studySessions: Array.from({ length: 20 }, () => 
      createStudySession({ userId })
    ),
    goals: Array.from({ length: 3 }, () => createLearningGoal({ userId })),
    achievements: Array.from({ length: 10 }, () => createAchievement({ userId })),
    statistics: createProgressStatistics(userId),
  };
}