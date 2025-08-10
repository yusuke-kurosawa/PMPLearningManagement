import React, { useState, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Settings,
  Lightbulb,
  Star,
  BarChart3,
} from 'lucide-react'

const ProjectSimulator = () => {
  const [currentScenario, setCurrentScenario] = useState(null)
  const [simulationState, setSimulationState] = useState('menu') // menu, running, paused, complete
  const [projectMetrics, setProjectMetrics] = useState({
    budget: 100000,
    timeline: 100, // days
    teamSatisfaction: 80,
    stakeholderSatisfaction: 75,
    qualityScore: 85,
    riskLevel: 'medium',
  })
  const [decisions, setDecisions] = useState([])
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [experience, setExperience] = useState(0)
  const [badges, setBadges] = useState([])
  const [timeElapsed, setTimeElapsed] = useState(0)

  const scenarios = [
    {
      id: 'it-migration',
      title: 'ITシステム移行プロジェクト',
      description: '大規模企業の基幹システムをクラウドに移行する6ヶ月プロジェクト',
      difficulty: 'intermediate',
      industry: 'IT',
      duration: 180, // days
      budget: 500000,
      teamSize: 12,
      stakeholders: ['CTO', 'IT部門', 'エンドユーザー', 'ベンダー'],
      risks: ['技術的複雑性', 'データ移行', 'ユーザー抵抗', 'スケジュール圧縮'],
      learningObjectives: [
        '統合管理プロセスの実践',
        'リスク管理の重要性',
        'ステークホルダー管理',
        '品質管理計画',
      ],
      icon: '🖥️',
    },
    {
      id: 'product-launch',
      title: '新商品開発・発売プロジェクト',
      description: '消費者向け新製品の開発から市場投入まで',
      difficulty: 'advanced',
      industry: 'Manufacturing',
      duration: 365,
      budget: 1000000,
      teamSize: 20,
      stakeholders: ['CEO', 'マーケティング', '開発', '製造', '営業'],
      risks: ['市場変動', '競合他社', '規制変更', '供給チェーン'],
      learningObjectives: [
        'スコープ管理の重要性',
        '品質管理プロセス',
        '調達マネジメント',
        'コミュニケーション計画',
      ],
      icon: '📱',
    },
    {
      id: 'office-relocation',
      title: 'オフィス移転プロジェクト',
      description: '本社オフィスの移転と新拠点セットアップ',
      difficulty: 'beginner',
      industry: 'General',
      duration: 90,
      budget: 200000,
      teamSize: 8,
      stakeholders: ['経営陣', 'HR', 'IT', '総務', '全社員'],
      risks: ['業務中断', '機器故障', '契約遅延', '従業員不満'],
      learningObjectives: [
        'プロジェクト憲章の作成',
        'WBS作成の実践',
        '資源マネジメント',
        '変更管理',
      ],
      icon: '🏢',
    },
  ]

  const challenges = {
    'budget-overrun': {
      title: '予算超過の危険',
      description: '現在のペースでは予算を20%超過する見込みです。どのように対処しますか？',
      options: [
        {
          text: 'スコープを縮小する',
          impact: { budget: +15, timeline: +5, quality: -10, stakeholder: -5 },
          pmbokProcess: 'スコープの定義',
          explanation:
            'スコープ縮小により予算内収束を図る。ステークホルダーへの影響を考慮する必要がある。',
        },
        {
          text: '追加予算を要求する',
          impact: { budget: +25, timeline: -5, quality: +5, stakeholder: -15 },
          pmbokProcess: '統合変更管理',
          explanation: '正式な変更管理プロセスを通じて予算増額を要求。承認リスクあり。',
        },
        {
          text: 'チーム効率を向上させる',
          impact: { budget: +10, timeline: +10, quality: 0, team: +5 },
          pmbokProcess: '資源のマネジメント',
          explanation: 'チームトレーニングやツール導入で効率化。時間はかかるが長期的効果あり。',
        },
      ],
      timeLimit: 180, // seconds
    },
    'stakeholder-conflict': {
      title: 'ステークホルダー間の対立',
      description: 'マーケティング部門と開発部門の間で要求事項に関する対立が発生しています。',
      options: [
        {
          text: '合同会議を開催し、要求事項を調整する',
          impact: { timeline: -10, stakeholder: +15, team: +5, quality: +10 },
          pmbokProcess: 'ステークホルダー・エンゲージメントのマネジメント',
          explanation: 'コンフリクト解決のための正式な会議。時間はかかるが合意形成に有効。',
        },
        {
          text: 'プロジェクトマネージャーが優先順位を決定する',
          impact: { timeline: +5, stakeholder: -10, team: -5, quality: 0 },
          pmbokProcess: '統合変更管理',
          explanation: '迅速な意思決定だが、一部ステークホルダーの不満が残る可能性。',
        },
        {
          text: 'プロトタイプを作成して検証する',
          impact: { timeline: -15, budget: -10, stakeholder: +10, quality: +15 },
          pmbokProcess: '要求事項の収集',
          explanation: '実際のプロトタイプで要求事項を検証。コストと時間はかかるが効果的。',
        },
      ],
      timeLimit: 300,
    },
    'quality-issues': {
      title: '品質問題の発生',
      description: 'テスト段階で重要な品質問題が発見されました。リリースまで2週間です。',
      options: [
        {
          text: 'リリースを延期して品質修正に集中する',
          impact: { timeline: -20, quality: +20, stakeholder: -10, budget: -5 },
          pmbokProcess: '品質管理',
          explanation: '品質を優先した判断。長期的な信頼性を重視。',
        },
        {
          text: '最小限の修正でリリースを強行する',
          impact: { timeline: +10, quality: -15, stakeholder: +5, risk: +20 },
          pmbokProcess: 'リスクのモニタリング',
          explanation: 'スケジュール優先だが、品質リスクが増大。',
        },
        {
          text: '段階的リリースに変更する',
          impact: { timeline: 0, quality: +10, stakeholder: +5, scope: -10 },
          pmbokProcess: 'スコープの定義',
          explanation: 'スコープを調整した柔軟なアプローチ。リスクを分散。',
        },
      ],
      timeLimit: 240,
    },
  }

  useEffect(() => {
    let interval
    if (simulationState === 'running') {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)

        // Random challenges
        if (Math.random() < 0.1 && !currentChallenge) {
          const challengeKeys = Object.keys(challenges)
          const randomChallenge = challengeKeys[Math.floor(Math.random() * challengeKeys.length)]
          setCurrentChallenge({
            id: randomChallenge,
            ...challenges[randomChallenge],
            startTime: Date.now(),
          })
        }

        // Update metrics gradually
        setProjectMetrics((prev) => ({
          ...prev,
          timeline: Math.max(0, prev.timeline - 0.5),
          teamSatisfaction: prev.teamSatisfaction + (Math.random() - 0.5) * 2,
          stakeholderSatisfaction: prev.stakeholderSatisfaction + (Math.random() - 0.5) * 1.5,
        }))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [simulationState, currentChallenge])

  const startSimulation = useCallback((scenario) => {
    setCurrentScenario(scenario)
    setSimulationState('running')
    setTimeElapsed(0)
    setDecisions([])
    setProjectMetrics({
      budget: scenario.budget,
      timeline: scenario.duration,
      teamSatisfaction: 80,
      stakeholderSatisfaction: 75,
      qualityScore: 85,
      riskLevel: 'medium',
    })
  }, [])

  const pauseSimulation = useCallback(() => {
    setSimulationState((prev) => (prev === 'running' ? 'paused' : 'running'))
  }, [])

  const resetSimulation = useCallback(() => {
    setSimulationState('menu')
    setCurrentScenario(null)
    setCurrentChallenge(null)
    setDecisions([])
    setTimeElapsed(0)
  }, [])

  const handleDecision = useCallback(
    (option) => {
      const newDecision = {
        id: Date.now(),
        challenge: currentChallenge.title,
        option: option.text,
        pmbokProcess: option.pmbokProcess,
        impact: option.impact,
        explanation: option.explanation,
        timestamp: timeElapsed,
      }

      setDecisions((prev) => [...prev, newDecision])

      // Apply impact to metrics
      setProjectMetrics((prev) => ({
        budget: Math.max(0, Math.min(200000, prev.budget + (option.impact.budget || 0) * 1000)),
        timeline: Math.max(0, prev.timeline + (option.impact.timeline || 0)),
        teamSatisfaction: Math.max(
          0,
          Math.min(100, prev.teamSatisfaction + (option.impact.team || 0))
        ),
        stakeholderSatisfaction: Math.max(
          0,
          Math.min(100, prev.stakeholderSatisfaction + (option.impact.stakeholder || 0))
        ),
        qualityScore: Math.max(0, Math.min(100, prev.qualityScore + (option.impact.quality || 0))),
        riskLevel: prev.riskLevel, // Update based on impact
      }))

      // Award experience
      setExperience((prev) => prev + 50)

      // Clear current challenge
      setCurrentChallenge(null)
    },
    [currentChallenge, timeElapsed]
  )

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100'
      case 'advanced':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getMetricColor = (value, type) => {
    if (type === 'timeline') {
      return value > 80 ? 'text-green-600' : value > 50 ? 'text-yellow-600' : 'text-red-600'
    }
    return value > 80 ? 'text-green-600' : value > 60 ? 'text-yellow-600' : 'text-red-600'
  }

  if (simulationState === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              リアルプロジェクト・シミュレーター
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              実際のプロジェクトシナリオでPMBOK知識を実践的に学習。リアルタイムの意思決定で本物のPMスキルを身につけましょう。
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Trophy className="mr-1 h-4 w-4" />
                経験値: {experience}
              </div>
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4" />
                バッジ: {badges.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-3xl">{scenario.icon}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {scenario.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    {scenario.description}
                  </p>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {scenario.duration}日
                    </div>
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="mr-1 h-3 w-3" />¥{scenario.budget.toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="mr-1 h-3 w-3" />
                      {scenario.teamSize}名
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Target className="mr-1 h-3 w-3" />
                      {scenario.industry}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      学習目標:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      {scenario.learningObjectives.slice(0, 3).map((objective, index) => (
                        <li key={index} className="flex items-center">
                          <BookOpen className="mr-1 h-3 w-3 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => startSimulation(scenario)}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    シミュレーション開始
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Simulation Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentScenario?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{currentScenario?.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={pauseSimulation}
                className={`rounded-lg p-2 ${
                  simulationState === 'running'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {simulationState === 'running' ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={resetSimulation}
                className="rounded-lg bg-gray-600 p-2 text-white hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Time and Status */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                経過時間: {Math.floor(timeElapsed / 60)}分{timeElapsed % 60}秒
              </div>
              <div
                className={`rounded px-2 py-1 ${
                  simulationState === 'running'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {simulationState === 'running' ? '実行中' : '一時停止'}
              </div>
            </div>
            <div className="font-medium text-blue-600">経験値: {experience} XP</div>
          </div>
        </div>

        {/* Current Challenge */}
        {currentChallenge && (
          <div className="mb-6 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-6 dark:bg-orange-900/20">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-orange-900 dark:text-orange-100">
                  🚨 {currentChallenge.title}
                </h2>
                <p className="text-orange-800 dark:text-orange-200">
                  {currentChallenge.description}
                </p>
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-300">
                制限時間: {currentChallenge.timeLimit}秒
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {currentChallenge.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleDecision(option)}
                  className="rounded-lg border-2 border-transparent bg-white p-4 text-left hover:border-blue-500 dark:bg-gray-700"
                >
                  <div className="mb-2 font-medium text-gray-900 dark:text-white">
                    {option.text}
                  </div>
                  <div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                    📋 {option.pmbokProcess}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.explanation}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600">
              ¥{Math.round(projectMetrics.budget / 1000)}K
            </div>
            <div className="text-sm text-gray-500">残予算</div>
          </div>
          <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <div
              className={`text-2xl font-bold ${getMetricColor(projectMetrics.timeline, 'timeline')}`}
            >
              {Math.round(projectMetrics.timeline)}日
            </div>
            <div className="text-sm text-gray-500">残日数</div>
          </div>
          <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <div
              className={`text-2xl font-bold ${getMetricColor(projectMetrics.teamSatisfaction)}`}
            >
              {Math.round(projectMetrics.teamSatisfaction)}%
            </div>
            <div className="text-sm text-gray-500">チーム満足度</div>
          </div>
          <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <div
              className={`text-2xl font-bold ${getMetricColor(projectMetrics.stakeholderSatisfaction)}`}
            >
              {Math.round(projectMetrics.stakeholderSatisfaction)}%
            </div>
            <div className="text-sm text-gray-500">ステークホルダー満足度</div>
          </div>
          <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <div className={`text-2xl font-bold ${getMetricColor(projectMetrics.qualityScore)}`}>
              {Math.round(projectMetrics.qualityScore)}%
            </div>
            <div className="text-sm text-gray-500">品質スコア</div>
          </div>
        </div>

        {/* Decision History */}
        {decisions.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <BarChart3 className="mr-2 h-5 w-5" />
              意思決定履歴
            </h2>
            <div className="max-h-60 space-y-4 overflow-y-auto">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {decision.challenge}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {Math.floor(decision.timestamp / 60)}:
                      {(decision.timestamp % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                    選択: {decision.option}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    PMBOKプロセス: {decision.pmbokProcess}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectSimulator
