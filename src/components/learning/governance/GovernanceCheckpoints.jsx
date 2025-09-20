import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  XSquare,
  AlertTriangle,
  Clock,
  Target,
  FileCheck,
  Shield,
  TrendingUp,
  Settings,
  Eye,
  Download,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  Users,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Progress } from '../../ui/progress'
import { Checkbox } from '../../ui/checkbox'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts'

const GovernanceCheckpoints = () => {
  const [selectedPhase, setSelectedPhase] = useState('initiation')
  const [checklistProgress, setChecklistProgress] = useState({})
  const [expandedSections, setExpandedSections] = useState({})
  const [valueFlowData, setValueFlowData] = useState([])
  const [killPointAnalysis, setKillPointAnalysis] = useState(null)
  const [systemsThinkingView, setSystemsThinkingView] = useState(false)

  // プロジェクト・フェーズ定義
  const projectPhases = {
    initiation: {
      name: '立上げフェーズ',
      description: 'プロジェクトの承認と開始準備',
      color: 'bg-blue-100 text-blue-800',
      icon: Target,
      duration: '2-4週間',
    },
    planning: {
      name: '計画フェーズ',
      description: '詳細計画とベースライン確立',
      color: 'bg-green-100 text-green-800',
      icon: FileCheck,
      duration: '4-8週間',
    },
    execution: {
      name: '実行フェーズ',
      description: 'プロジェクト作業の実施',
      color: 'bg-orange-100 text-orange-800',
      icon: Activity,
      duration: '12-24週間',
    },
    closure: {
      name: '終結フェーズ',
      description: 'プロジェクト完了と引き渡し',
      color: 'bg-purple-100 text-purple-800',
      icon: CheckSquare,
      duration: '2-4週間',
    },
  }

  // チェックポイント・チェックリスト
  const checkpointChecklists = {
    initiation: {
      start: {
        title: 'フェーズ開始時チェックリスト',
        items: [
          {
            id: 'business_case',
            text: 'ビジネスケースの妥当性確認',
            category: 'strategic',
            weight: 3,
            description: '投資対効果とビジネス価値の再確認',
          },
          {
            id: 'stakeholder_identification',
            text: 'ステークホルダーの特定・分析完了',
            category: 'stakeholder',
            weight: 3,
            description: '影響力・関心度マトリックスによる分析',
          },
          {
            id: 'project_charter',
            text: 'プロジェクト憲章の承認',
            category: 'governance',
            weight: 2,
            description: '権限・責任・成功基準の明確化',
          },
          {
            id: 'initial_risks',
            text: '初期リスクの識別・評価',
            category: 'risk',
            weight: 2,
            description: '高レベルリスクの特定と対応方針',
          },
          {
            id: 'resource_availability',
            text: 'リソース確保状況の確認',
            category: 'resource',
            weight: 2,
            description: 'キーリソースの確保とスケジュール調整',
          },
        ],
      },
      end: {
        title: 'フェーズ終了時チェックリスト',
        items: [
          {
            id: 'charter_approved',
            text: 'プロジェクト憲章の正式承認',
            category: 'deliverable',
            weight: 3,
            description: 'スポンサーによる最終承認',
          },
          {
            id: 'team_assignment',
            text: 'プロジェクトチームの編成完了',
            category: 'resource',
            weight: 2,
            description: '役割・責任の明確化',
          },
          {
            id: 'governance_structure',
            text: 'ガバナンス構造の確立',
            category: 'governance',
            weight: 2,
            description: '意思決定プロセスとエスカレーション経路',
          },
          {
            id: 'next_phase_readiness',
            text: '計画フェーズ準備完了',
            category: 'transition',
            weight: 1,
            description: '計画作業に必要な前提条件の確認',
          },
        ],
      },
    },
    planning: {
      start: {
        title: 'フェーズ開始時チェックリスト',
        items: [
          {
            id: 'charter_review',
            text: 'プロジェクト憲章の再確認',
            category: 'foundation',
            weight: 2,
            description: '目標・制約・前提の確認',
          },
          {
            id: 'planning_approach',
            text: '計画作成アプローチの決定',
            category: 'methodology',
            weight: 2,
            description: 'ウォーターフォール/アジャイルの選択',
          },
          {
            id: 'requirement_gathering',
            text: '要求収集プロセスの準備',
            category: 'requirements',
            weight: 3,
            description: 'ステークホルダーとの要求収集計画',
          },
          {
            id: 'planning_team',
            text: '計画作成チームの確保',
            category: 'resource',
            weight: 2,
            description: 'SME・専門家の参画確保',
          },
        ],
      },
      end: {
        title: 'フェーズ終了時チェックリスト',
        items: [
          {
            id: 'scope_baseline',
            text: 'スコープ・ベースラインの確立',
            category: 'deliverable',
            weight: 3,
            description: 'WBS・要求仕様書の承認',
          },
          {
            id: 'schedule_baseline',
            text: 'スケジュール・ベースラインの確立',
            category: 'deliverable',
            weight: 3,
            description: 'マスタースケジュールの承認',
          },
          {
            id: 'budget_baseline',
            text: '予算ベースラインの確立',
            category: 'deliverable',
            weight: 3,
            description: 'コスト見積もりと予算の承認',
          },
          {
            id: 'risk_register',
            text: 'リスク登録簿の作成',
            category: 'risk',
            weight: 2,
            description: '特定・分析・対応計画の文書化',
          },
          {
            id: 'quality_plan',
            text: '品質マネジメント計画の策定',
            category: 'quality',
            weight: 2,
            description: '品質基準と保証プロセス',
          },
        ],
      },
    },
    execution: {
      start: {
        title: 'フェーズ開始時チェックリスト',
        items: [
          {
            id: 'baseline_approval',
            text: 'すべてのベースラインの承認確認',
            category: 'foundation',
            weight: 3,
            description: 'スコープ・スケジュール・コストベースライン',
          },
          {
            id: 'team_readiness',
            text: 'チームの実行準備完了',
            category: 'resource',
            weight: 3,
            description: 'キックオフとチーム育成の実施',
          },
          {
            id: 'infrastructure_ready',
            text: 'インフラストラクチャの準備完了',
            category: 'environment',
            weight: 2,
            description: '作業環境・ツール・設備の確保',
          },
          {
            id: 'vendor_contracts',
            text: 'ベンダー契約の締結',
            category: 'procurement',
            weight: 2,
            description: '外部リソースとの契約完了',
          },
        ],
      },
      end: {
        title: 'フェーズ終了時チェックリスト',
        items: [
          {
            id: 'deliverables_complete',
            text: 'すべての成果物の完成',
            category: 'deliverable',
            weight: 3,
            description: '品質基準を満たした成果物の確認',
          },
          {
            id: 'testing_complete',
            text: 'テスト・検証の完了',
            category: 'quality',
            weight: 3,
            description: '受入テスト・品質保証の完了',
          },
          {
            id: 'user_training',
            text: 'ユーザートレーニングの実施',
            category: 'transition',
            weight: 2,
            description: 'エンドユーザーの準備完了',
          },
          {
            id: 'documentation',
            text: 'プロジェクト文書の整備',
            category: 'knowledge',
            weight: 2,
            description: '運用・保守文書の作成',
          },
        ],
      },
    },
    closure: {
      start: {
        title: 'フェーズ開始時チェックリスト',
        items: [
          {
            id: 'deliverable_acceptance',
            text: '成果物の正式受入確認',
            category: 'acceptance',
            weight: 3,
            description: '顧客・スポンサーによる受入',
          },
          {
            id: 'closure_plan',
            text: '終結計画の策定',
            category: 'planning',
            weight: 2,
            description: '引き渡し・移行計画の詳細化',
          },
          {
            id: 'final_reporting',
            text: '最終報告の準備',
            category: 'reporting',
            weight: 2,
            description: 'プロジェクト成果と教訓の整理',
          },
        ],
      },
      end: {
        title: 'フェーズ終了時チェックリスト',
        items: [
          {
            id: 'administrative_closure',
            text: '管理的終結の完了',
            category: 'administration',
            weight: 3,
            description: '契約終了・支払い完了',
          },
          {
            id: 'lessons_learned',
            text: '教訓の文書化と共有',
            category: 'knowledge',
            weight: 2,
            description: '将来プロジェクトへの知識移転',
          },
          {
            id: 'resource_release',
            text: 'リソースの解放',
            category: 'resource',
            weight: 2,
            description: 'チームメンバーの他プロジェクトへの配置',
          },
          {
            id: 'success_celebration',
            text: '成功の祝賀・認知',
            category: 'culture',
            weight: 1,
            description: 'チームの貢献認知と祝賀',
          },
        ],
      },
    },
  }

  // キル・ポイント判定基準
  const killPointCriteria = {
    budget: {
      green: { min: 0, max: 5, label: '予算内' },
      yellow: { min: 5, max: 15, label: '軽度超過' },
      red: { min: 15, max: 100, label: '重大超過' },
    },
    schedule: {
      green: { min: 0, max: 5, label: 'スケジュール内' },
      yellow: { min: 5, max: 20, label: '軽度遅延' },
      red: { min: 20, max: 100, label: '重大遅延' },
    },
    quality: {
      green: { min: 90, max: 100, label: '品質良好' },
      yellow: { min: 70, max: 90, label: '品質課題あり' },
      red: { min: 0, max: 70, label: '品質不良' },
    },
    risk: {
      green: { min: 0, max: 0.3, label: '低リスク' },
      yellow: { min: 0.3, max: 0.7, label: '中リスク' },
      red: { min: 0.7, max: 1, label: '高リスク' },
    },
    stakeholder: {
      green: { min: 80, max: 100, label: '高満足度' },
      yellow: { min: 60, max: 80, label: '中満足度' },
      red: { min: 0, max: 60, label: '低満足度' },
    },
  }

  // システム思考による価値フロー
  const generateValueFlowData = () => {
    return [
      { phase: '立上げ', value: 10, effort: 15, complexity: 20 },
      { phase: '計画', value: 25, effort: 35, complexity: 40 },
      { phase: '実行', value: 80, effort: 75, complexity: 80 },
      { phase: '終結', value: 95, effort: 85, complexity: 30 },
    ]
  }

  const toggleChecklistItem = (phase, timing, itemId) => {
    const key = `${phase}_${timing}_${itemId}`
    setChecklistProgress((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const calculateProgress = (phase, timing) => {
    const items = checkpointChecklists[phase][timing].items
    const completed = items.filter(
      (item) => checklistProgress[`${phase}_${timing}_${item.id}`]
    ).length
    return Math.round((completed / items.length) * 100)
  }

  const calculateWeightedScore = (phase, timing) => {
    const items = checkpointChecklists[phase][timing].items
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    const completedWeight = items
      .filter((item) => checklistProgress[`${phase}_${timing}_${item.id}`])
      .reduce((sum, item) => sum + item.weight, 0)
    return Math.round((completedWeight / totalWeight) * 100)
  }

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const runKillPointAnalysis = () => {
    // サンプルプロジェクト状況
    const projectStatus = {
      budget: Math.random() * 30, // 0-30% 超過
      schedule: Math.random() * 40, // 0-40% 遅延
      quality: 60 + Math.random() * 40, // 60-100% 品質スコア
      risk: Math.random(), // 0-1 リスクスコア
      stakeholder: 50 + Math.random() * 50, // 50-100% 満足度
    }

    const getStatus = (metric, value) => {
      const criteria = killPointCriteria[metric]
      if (metric === 'quality' || metric === 'stakeholder') {
        if (value >= criteria.green.min) {
          return 'green'
        }
        if (value >= criteria.yellow.min) {
          return 'yellow'
        }
        return 'red'
      } else {
        if (value <= criteria.green.max) {
          return 'green'
        }
        if (value <= criteria.yellow.max) {
          return 'yellow'
        }
        return 'red'
      }
    }

    const analysis = Object.entries(projectStatus).map(([metric, value]) => ({
      metric,
      value: Math.round(value * 100) / 100,
      status: getStatus(metric, value),
      recommendation: getRecommendation(metric, getStatus(metric, value)),
    }))

    setKillPointAnalysis(analysis)
  }

  const getRecommendation = (metric, status) => {
    const recommendations = {
      budget: {
        green: '予算管理良好。現在の管理体制を維持。',
        yellow: '予算監視を強化し、追加承認プロセスを準備。',
        red: '緊急予算見直し。スコープ削減またはプロジェクト中止を検討。',
      },
      schedule: {
        green: 'スケジュール順調。リスク管理を継続。',
        yellow: 'スケジュール回復計画を策定。リソース追加を検討。',
        red: '重大遅延。プロジェクト継続可否を再評価。',
      },
      quality: {
        green: '品質基準達成。現在のプロセスを維持。',
        yellow: '品質改善活動を強化。追加テストを実施。',
        red: '品質不良。品質保証プロセスを見直し。',
      },
      risk: {
        green: 'リスク管理良好。定期監視を継続。',
        yellow: 'リスク対応策を強化。監視頻度を上げる。',
        red: '高リスク状態。緊急対応策を実施。',
      },
      stakeholder: {
        green: 'ステークホルダー満足度良好。関係維持。',
        yellow: 'ステークホルダー・エンゲージメントを強化。',
        red: 'ステークホルダー関係改善が急務。',
      },
    }
    return recommendations[metric][status]
  }

  useEffect(() => {
    setValueFlowData(generateValueFlowData())
  }, [])

  const getCategoryColor = (category) => {
    const colors = {
      strategic: 'bg-purple-100 text-purple-800',
      stakeholder: 'bg-blue-100 text-blue-800',
      governance: 'bg-indigo-100 text-indigo-800',
      risk: 'bg-red-100 text-red-800',
      resource: 'bg-green-100 text-green-800',
      deliverable: 'bg-orange-100 text-orange-800',
      quality: 'bg-yellow-100 text-yellow-800',
      transition: 'bg-teal-100 text-teal-800',
      foundation: 'bg-gray-100 text-gray-800',
      methodology: 'bg-cyan-100 text-cyan-800',
      requirements: 'bg-pink-100 text-pink-800',
      environment: 'bg-lime-100 text-lime-800',
      procurement: 'bg-amber-100 text-amber-800',
      acceptance: 'bg-emerald-100 text-emerald-800',
      planning: 'bg-sky-100 text-sky-800',
      reporting: 'bg-violet-100 text-violet-800',
      administration: 'bg-rose-100 text-rose-800',
      knowledge: 'bg-stone-100 text-stone-800',
      culture: 'bg-slate-100 text-slate-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800'
      case 'red':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-6'>
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckSquare className='h-5 w-5 text-green-600' />
            ガバナンス・チェックポイント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <p className='text-gray-600'>
              プロジェクトの各フェーズにおけるガバナンス・チェックポイントを通じて、
              プロジェクトの健全性を評価し、適切な意思決定を支援します。
            </p>

            <div className='flex gap-4'>
              <Button onClick={runKillPointAnalysis} className='flex items-center gap-2'>
                <Eye className='h-4 w-4' />
                キル・ポイント分析実行
              </Button>
              <Button
                variant='outline'
                onClick={() => setSystemsThinkingView(!systemsThinkingView)}
                className='flex items-center gap-2'
              >
                <Activity className='h-4 w-4' />
                {systemsThinkingView ? '標準ビュー' : 'システム思考ビュー'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='checklists' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='checklists'>チェックリスト</TabsTrigger>
          <TabsTrigger value='killpoints'>キル・ポイント</TabsTrigger>
          <TabsTrigger value='valueflow'>価値フロー</TabsTrigger>
          <TabsTrigger value='analysis'>分析・レポート</TabsTrigger>
        </TabsList>

        {/* チェックリスト */}
        <TabsContent value='checklists' className='space-y-4'>
          {/* フェーズ選択 */}
          <Card>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {Object.entries(projectPhases).map(([key, phase]) => {
                  const IconComponent = phase.icon
                  return (
                    <Button
                      key={key}
                      variant={selectedPhase === key ? 'default' : 'outline'}
                      onClick={() => setSelectedPhase(key)}
                      className='flex h-auto items-center gap-2 p-4'
                    >
                      <IconComponent className='h-5 w-5' />
                      <div className='text-left'>
                        <div className='font-medium'>{phase.name}</div>
                        <div className='text-xs opacity-70'>{phase.duration}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 選択されたフェーズのチェックリスト */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {['start', 'end'].map((timing) => {
              const checklist = checkpointChecklists[selectedPhase][timing]
              const progress = calculateProgress(selectedPhase, timing)
              const weightedScore = calculateWeightedScore(selectedPhase, timing)

              return (
                <Card key={timing}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>{checklist.title}</CardTitle>
                      <Badge
                        className={
                          progress === 100
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {progress}% 完了
                      </Badge>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='text-sm text-gray-600'>重み付けスコア: {weightedScore}%</div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {checklist.items.map((item) => {
                        const isChecked = checklistProgress[`${selectedPhase}_${timing}_${item.id}`]
                        return (
                          <div key={item.id} className='space-y-2'>
                            <div className='flex items-start gap-3'>
                              <Checkbox
                                id={item.id}
                                checked={isChecked}
                                onCheckedChange={() =>
                                  toggleChecklistItem(selectedPhase, timing, item.id)
                                }
                                className='mt-1'
                              />
                              <div className='flex-1 space-y-1'>
                                <label
                                  htmlFor={item.id}
                                  className={`cursor-pointer text-sm font-medium ${
                                    isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
                                  }`}
                                >
                                  {item.text}
                                </label>
                                <div className='flex items-center gap-2'>
                                  <Badge className={getCategoryColor(item.category)} size='sm'>
                                    {item.category}
                                  </Badge>
                                  <Badge variant='outline' size='sm'>
                                    重み: {item.weight}
                                  </Badge>
                                </div>
                                <p className='text-xs text-gray-600'>{item.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* キル・ポイント */}
        <TabsContent value='killpoints' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-red-600' />
                キル・ポイント判定システム
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p className='text-gray-600'>
                  プロジェクト継続の判断基準となる主要指標を評価し、 Go/No-Go決定を支援します。
                </p>

                {!killPointAnalysis ? (
                  <div className='py-8 text-center'>
                    <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                    <h3 className='mb-2 text-lg font-medium text-gray-900'>分析待機中</h3>
                    <p className='mb-4 text-gray-600'>
                      「キル・ポイント分析実行」ボタンをクリックして分析を開始してください。
                    </p>
                    <Button
                      onClick={runKillPointAnalysis}
                      className='mx-auto flex items-center gap-2'
                    >
                      <Eye className='h-4 w-4' />
                      分析実行
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* 総合判定 */}
                    <Card className='border-l-4 border-l-blue-500'>
                      <CardContent className='pt-4'>
                        <h3 className='mb-3 font-medium'>総合判定</h3>
                        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                          <div className='rounded-lg bg-green-50 p-3 text-center'>
                            <div className='text-2xl font-bold text-green-600'>
                              {killPointAnalysis.filter((item) => item.status === 'green').length}
                            </div>
                            <div className='text-sm text-green-700'>良好</div>
                          </div>
                          <div className='rounded-lg bg-yellow-50 p-3 text-center'>
                            <div className='text-2xl font-bold text-yellow-600'>
                              {killPointAnalysis.filter((item) => item.status === 'yellow').length}
                            </div>
                            <div className='text-sm text-yellow-700'>注意</div>
                          </div>
                          <div className='rounded-lg bg-red-50 p-3 text-center'>
                            <div className='text-2xl font-bold text-red-600'>
                              {killPointAnalysis.filter((item) => item.status === 'red').length}
                            </div>
                            <div className='text-sm text-red-700'>危険</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 詳細分析 */}
                    <div className='grid grid-cols-1 gap-4'>
                      {killPointAnalysis.map((item) => (
                        <Card key={item.metric} className='border-l-4 border-l-gray-300'>
                          <CardContent className='pt-4'>
                            <div className='mb-2 flex items-center justify-between'>
                              <h4 className='font-medium capitalize'>
                                {item.metric === 'stakeholder'
                                  ? 'ステークホルダー満足度'
                                  : item.metric === 'budget'
                                    ? '予算'
                                    : item.metric === 'schedule'
                                      ? 'スケジュール'
                                      : item.metric === 'quality'
                                        ? '品質'
                                        : 'リスク'}
                              </h4>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status === 'green'
                                  ? '良好'
                                  : item.status === 'yellow'
                                    ? '注意'
                                    : '危険'}
                              </Badge>
                            </div>
                            <div className='space-y-2'>
                              <div className='flex justify-between text-sm'>
                                <span>現在値:</span>
                                <span className='font-medium'>
                                  {item.metric === 'budget' || item.metric === 'schedule'
                                    ? `${item.value}% 超過/遅延`
                                    : item.metric === 'quality' || item.metric === 'stakeholder'
                                      ? `${item.value}%`
                                      : item.value.toFixed(2)}
                                </span>
                              </div>
                              <div className='text-sm text-gray-600'>
                                <span className='font-medium'>推奨対応:</span> {item.recommendation}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 価値フロー */}
        <TabsContent value='valueflow' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
                {systemsThinkingView ? 'システム思考による価値フロー' : 'プロジェクト価値フロー'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemsThinkingView ? (
                <div className='space-y-6'>
                  <p className='text-gray-600'>
                    システム思考の観点から、プロジェクト全体を通じた価値創造の流れと
                    各フェーズの相互関係を可視化します。
                  </p>

                  {/* レーダーチャート */}
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>価値・工数・複雑性バランス</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width='100%' height={300}>
                          <RadarChart data={valueFlowData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey='phase' />
                            <PolarRadiusAxis />
                            <Radar
                              name='価値'
                              dataKey='value'
                              stroke='#3B82F6'
                              fill='#3B82F6'
                              fillOpacity={0.3}
                            />
                            <Radar
                              name='工数'
                              dataKey='effort'
                              stroke='#10B981'
                              fill='#10B981'
                              fillOpacity={0.3}
                            />
                            <Radar
                              name='複雑性'
                              dataKey='complexity'
                              stroke='#F59E0B'
                              fill='#F59E0B'
                              fillOpacity={0.3}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>フェーズ別分析</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {valueFlowData.map((data, idx) => (
                            <div key={idx} className='space-y-2'>
                              <h4 className='font-medium'>{data.phase}</h4>
                              <div className='space-y-1'>
                                <div className='flex justify-between text-sm'>
                                  <span>価値創造:</span>
                                  <span className='font-medium'>{data.value}%</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                  <span>工数投入:</span>
                                  <span className='font-medium'>{data.effort}%</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                  <span>複雑性:</span>
                                  <span className='font-medium'>{data.complexity}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* システム思考の原則 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>システム思考の原則適用</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div className='space-y-3'>
                          <h4 className='font-medium text-blue-900'>全体最適の視点</h4>
                          <ul className='space-y-1 text-sm text-gray-600'>
                            <li>• フェーズ間の依存関係を重視</li>
                            <li>• 局所最適ではなく全体最適を追求</li>
                            <li>• 長期的な価値創造を優先</li>
                          </ul>
                        </div>

                        <div className='space-y-3'>
                          <h4 className='font-medium text-green-900'>フィードバック・ループ</h4>
                          <ul className='space-y-1 text-sm text-gray-600'>
                            <li>• 各フェーズからの学習を次に活用</li>
                            <li>• 継続的な改善サイクル</li>
                            <li>• ステークホルダーからの反応</li>
                          </ul>
                        </div>

                        <div className='space-y-3'>
                          <h4 className='font-medium text-purple-900'>創発特性</h4>
                          <ul className='space-y-1 text-sm text-gray-600'>
                            <li>• 部分の合計以上の価値創造</li>
                            <li>• 予期しない相乗効果</li>
                            <li>• 組織学習の促進</li>
                          </ul>
                        </div>

                        <div className='space-y-3'>
                          <h4 className='font-medium text-orange-900'>非線形性</h4>
                          <ul className='space-y-1 text-sm text-gray-600'>
                            <li>• 小さな変更が大きな影響</li>
                            <li>• 遅延と蓄積効果</li>
                            <li>• 閾値とティッピング・ポイント</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className='space-y-6'>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={valueFlowData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='phase' />
                      <YAxis />
                      <Tooltip />
                      <Line type='monotone' dataKey='value' stroke='#3B82F6' name='価値創造' />
                      <Line type='monotone' dataKey='effort' stroke='#10B981' name='工数投入' />
                      <Line type='monotone' dataKey='complexity' stroke='#F59E0B' name='複雑性' />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg text-blue-900'>価値創造</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='mb-3 text-sm text-gray-600'>
                          各フェーズでのビジネス価値の蓄積
                        </p>
                        <div className='space-y-2'>
                          {valueFlowData.map((data, idx) => (
                            <div key={idx} className='flex justify-between text-sm'>
                              <span>{data.phase}:</span>
                              <span className='font-medium'>{data.value}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg text-green-900'>工数投入</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='mb-3 text-sm text-gray-600'>リソース消費の累積パターン</p>
                        <div className='space-y-2'>
                          {valueFlowData.map((data, idx) => (
                            <div key={idx} className='flex justify-between text-sm'>
                              <span>{data.phase}:</span>
                              <span className='font-medium'>{data.effort}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg text-orange-900'>複雑性</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='mb-3 text-sm text-gray-600'>管理の複雑さと難易度</p>
                        <div className='space-y-2'>
                          {valueFlowData.map((data, idx) => (
                            <div key={idx} className='flex justify-between text-sm'>
                              <span>{data.phase}:</span>
                              <span className='font-medium'>{data.complexity}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析・レポート */}
        <TabsContent value='analysis' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* 進捗サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  チェックポイント進捗サマリー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Object.entries(projectPhases).map(([phaseKey, phase]) => {
                    const startProgress = calculateProgress(phaseKey, 'start')
                    const endProgress = calculateProgress(phaseKey, 'end')
                    const avgProgress = Math.round((startProgress + endProgress) / 2)

                    return (
                      <div key={phaseKey} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>{phase.name}</span>
                          <span className='text-sm text-gray-600'>{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} className='h-2' />
                        <div className='flex justify-between text-xs text-gray-500'>
                          <span>開始: {startProgress}%</span>
                          <span>終了: {endProgress}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* レポート生成 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileCheck className='h-5 w-5' />
                  レポート生成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-sm text-gray-600'>
                    ガバナンス・チェックポイントの評価結果をレポートとして出力できます。
                  </p>

                  <div className='space-y-2'>
                    <Button className='flex w-full items-center gap-2'>
                      <Download className='h-4 w-4' />
                      チェックポイント・レポート出力
                    </Button>
                    <Button variant='outline' className='flex w-full items-center gap-2'>
                      <Download className='h-4 w-4' />
                      キル・ポイント分析レポート
                    </Button>
                    <Button variant='outline' className='flex w-full items-center gap-2'>
                      <Download className='h-4 w-4' />
                      価値フロー分析レポート
                    </Button>
                  </div>

                  <div className='mt-4 text-xs text-gray-500'>
                    ※ レポートはPDF形式で出力されます
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 改善提案 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5 text-yellow-600' />
                改善提案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <div className='rounded-lg bg-blue-50 p-4'>
                  <h4 className='mb-2 font-medium text-blue-900'>プロセス改善</h4>
                  <p className='text-sm text-blue-700'>
                    チェックポイントの効率化と自動化を進め、
                    ガバナンス負荷を軽減しながら品質を向上。
                  </p>
                </div>

                <div className='rounded-lg bg-green-50 p-4'>
                  <h4 className='mb-2 font-medium text-green-900'>ツール活用</h4>
                  <p className='text-sm text-green-700'>
                    プロジェクト管理ツールとの統合により、
                    リアルタイムでのガバナンス状況把握を実現。
                  </p>
                </div>

                <div className='rounded-lg bg-purple-50 p-4'>
                  <h4 className='mb-2 font-medium text-purple-900'>組織学習</h4>
                  <p className='text-sm text-purple-700'>
                    チェックポイントの結果を組織の知識資産として蓄積し、
                    将来プロジェクトの成功確率を向上。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default React.memo(GovernanceCheckpoints)
