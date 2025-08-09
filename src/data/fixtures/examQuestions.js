// PMP模擬試験の問題バンク

export const questionTypes = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice'
};

export const examDomains = {
  PEOPLE: { id: 'people', name: 'People', weight: 0.42 },
  PROCESS: { id: 'process', name: 'Process', weight: 0.50 },
  BUSINESS_ENVIRONMENT: { id: 'business_environment', name: 'Business Environment', weight: 0.08 }
};

// サンプル問題データ（実際にはより多くの問題を追加）
export const questionBank = [
  // People Domain (42%)
  {
    id: 'q001',
    domain: 'people',
    knowledgeArea: 'resource',
    difficulty: 'medium',
    type: questionTypes.SINGLE_CHOICE,
    question: 'プロジェクトチームが分散環境で作業している場合、チームの結束力を高めるために最も効果的な方法は次のうちどれですか？',
    options: [
      'A. 定期的なビデオ会議を開催し、チームメンバー間のコミュニケーションを促進する',
      'B. 厳格な報告体制を確立し、進捗を細かく管理する',
      'C. 各メンバーに独立して作業させ、干渉を最小限にする',
      'D. メールのみでコミュニケーションを行い、記録を残す'
    ],
    correctAnswer: 'A',
    explanation: '分散チームでは、定期的なビデオ会議によってチームメンバー間の関係性を構築し、コミュニケーションを促進することが重要です。これにより、チームの結束力が高まり、プロジェクトの成功確率が向上します。',
    references: ['PMBOK第6版 9.4 チームの育成']
  },
  {
    id: 'q002',
    domain: 'people',
    knowledgeArea: 'stakeholder',
    difficulty: 'hard',
    type: questionTypes.SINGLE_CHOICE,
    question: 'ステークホルダーが頻繁に要求を変更し、プロジェクトの範囲が拡大している。プロジェクトマネージャーとして最初に取るべき行動は？',
    options: [
      'A. 変更管理プロセスを確立し、すべての変更要求を文書化する',
      'B. ステークホルダーとの会議を設定し、期待値を明確にする',
      'C. プロジェクトスポンサーに問題をエスカレーションする',
      'D. 追加の予算とリソースを要求する'
    ],
    correctAnswer: 'B',
    explanation: '頻繁な変更要求の根本原因は、多くの場合、ステークホルダーの期待値が不明確であることです。まず期待値を明確にし、合意を得ることが重要です。',
    references: ['PMBOK第6版 13.3 ステークホルダー・エンゲージメントのマネジメント']
  },
  
  // Process Domain (50%)
  {
    id: 'q003',
    domain: 'process',
    knowledgeArea: 'integration',
    difficulty: 'medium',
    type: questionTypes.SINGLE_CHOICE,
    question: 'プロジェクト憲章に含まれるべき内容として適切でないものは次のうちどれですか？',
    options: [
      'A. プロジェクトの目的と正当性',
      'B. 高レベルの要求事項',
      'C. 詳細なワーク・ブレークダウン・ストラクチャー（WBS）',
      'D. プロジェクトマネージャーの権限レベル'
    ],
    correctAnswer: 'C',
    explanation: 'プロジェクト憲章は高レベルの文書であり、詳細なWBSは含みません。WBSはプロジェクト計画フェーズで作成されます。',
    references: ['PMBOK第6版 4.1 プロジェクト憲章の作成']
  },
  {
    id: 'q004',
    domain: 'process',
    knowledgeArea: 'schedule',
    difficulty: 'medium',
    type: questionTypes.SINGLE_CHOICE,
    question: 'クリティカルパス法（CPM）を使用する主な目的は何ですか？',
    options: [
      'A. プロジェクトコストを最小化する',
      'B. プロジェクトの最短完了時間を特定する',
      'C. リソースの配分を最適化する',
      'D. プロジェクトリスクを軽減する'
    ],
    correctAnswer: 'B',
    explanation: 'クリティカルパス法は、プロジェクトの最短完了時間を特定し、どのアクティビティが遅延するとプロジェクト全体が遅延するかを明確にします。',
    references: ['PMBOK第6版 6.5 スケジュールの作成']
  },
  {
    id: 'q005',
    domain: 'process',
    knowledgeArea: 'risk',
    difficulty: 'hard',
    type: questionTypes.MULTIPLE_CHOICE,
    question: '定量的リスク分析で使用される技法として適切なものをすべて選択してください。',
    options: [
      'A. モンテカルロ・シミュレーション',
      'B. SWOT分析',
      'C. 感度分析',
      'D. デシジョンツリー分析'
    ],
    correctAnswers: ['A', 'C', 'D'],
    explanation: 'モンテカルロ・シミュレーション、感度分析、デシジョンツリー分析は定量的リスク分析の技法です。SWOT分析は定性的な分析手法です。',
    references: ['PMBOK第6版 11.4 定量的リスク分析']
  },
  
  // Business Environment Domain (8%)
  {
    id: 'q006',
    domain: 'business_environment',
    knowledgeArea: 'integration',
    difficulty: 'medium',
    type: questionTypes.SINGLE_CHOICE,
    question: '組織の戦略的目標とプロジェクトの成果物を整合させるために最も重要な文書は？',
    options: [
      'A. プロジェクト憲章',
      'B. ビジネスケース',
      'C. プロジェクトマネジメント計画書',
      'D. ステークホルダー登録簿'
    ],
    correctAnswer: 'B',
    explanation: 'ビジネスケースは、プロジェクトがどのように組織の戦略的目標を支援するかを文書化し、投資の正当性を示します。',
    references: ['PMBOK第6版 1.2.6 ビジネス文書']
  },
  {
    id: 'q007',
    domain: 'business_environment',
    knowledgeArea: 'stakeholder',
    difficulty: 'easy',
    type: questionTypes.SINGLE_CHOICE,
    question: '組織体の環境要因（EEF）に含まれないものは次のうちどれですか？',
    options: [
      'A. 組織の文化と構造',
      'B. 市場の状況',
      'C. プロジェクトマネジメント計画書のテンプレート',
      'D. 政府や業界の標準'
    ],
    correctAnswer: 'C',
    explanation: 'プロジェクトマネジメント計画書のテンプレートは組織のプロセス資産（OPA）に分類されます。EEFは組織が直接コントロールできない要因です。',
    references: ['PMBOK第6版 2.2 組織体の環境要因']
  }
];

// 問題をシャッフルして指定数取得する関数
export const generateExam = (questionCount = 180) => {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  
  // ドメインごとの問題数を計算
  const peopleCount = Math.round(questionCount * examDomains.PEOPLE.weight);
  const processCount = Math.round(questionCount * examDomains.PROCESS.weight);
  const businessCount = questionCount - peopleCount - processCount;
  
  const examQuestions = [];
  
  // 各ドメインから適切な数の問題を選択
  const peopleQuestions = shuffled.filter(q => q.domain === 'people').slice(0, peopleCount);
  const processQuestions = shuffled.filter(q => q.domain === 'process').slice(0, processCount);
  const businessQuestions = shuffled.filter(q => q.domain === 'business_environment').slice(0, businessCount);
  
  examQuestions.push(...peopleQuestions, ...processQuestions, ...businessQuestions);
  
  // 最終的にシャッフル
  return examQuestions.sort(() => Math.random() - 0.5).map((q, index) => ({
    ...q,
    questionNumber: index + 1
  }));
};

// 試験結果の分析
export const analyzeExamResults = (answers, questions) => {
  const results = {
    totalQuestions: questions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 0,
    score: 0,
    domainScores: {},
    knowledgeAreaScores: {},
    incorrectQuestions: []
  };
  
  // ドメインごとの初期化
  Object.keys(examDomains).forEach(domain => {
    results.domainScores[domain] = { correct: 0, total: 0, percentage: 0 };
  });
  
  questions.forEach(question => {
    const userAnswer = answers[question.id];
    const domain = question.domain;
    
    results.domainScores[domain].total++;
    
    if (!userAnswer) {
      results.unanswered++;
    } else if (
      (question.type === questionTypes.SINGLE_CHOICE && userAnswer === question.correctAnswer) ||
      (question.type === questionTypes.MULTIPLE_CHOICE && 
        JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswers.sort()))
    ) {
      results.correctAnswers++;
      results.domainScores[domain].correct++;
    } else {
      results.incorrectAnswers++;
      results.incorrectQuestions.push({
        ...question,
        userAnswer
      });
    }
    
    // 知識エリア別の集計
    if (question.knowledgeArea) {
      if (!results.knowledgeAreaScores[question.knowledgeArea]) {
        results.knowledgeAreaScores[question.knowledgeArea] = { correct: 0, total: 0 };
      }
      results.knowledgeAreaScores[question.knowledgeArea].total++;
      if (userAnswer && (
        (question.type === questionTypes.SINGLE_CHOICE && userAnswer === question.correctAnswer) ||
        (question.type === questionTypes.MULTIPLE_CHOICE && 
          JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswers.sort()))
      )) {
        results.knowledgeAreaScores[question.knowledgeArea].correct++;
      }
    }
  });
  
  // パーセンテージ計算
  results.score = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  
  Object.keys(results.domainScores).forEach(domain => {
    const domainScore = results.domainScores[domain];
    domainScore.percentage = domainScore.total > 0 
      ? Math.round((domainScore.correct / domainScore.total) * 100) 
      : 0;
  });
  
  Object.keys(results.knowledgeAreaScores).forEach(area => {
    const areaScore = results.knowledgeAreaScores[area];
    areaScore.percentage = areaScore.total > 0 
      ? Math.round((areaScore.correct / areaScore.total) * 100) 
      : 0;
  });
  
  return results;
};