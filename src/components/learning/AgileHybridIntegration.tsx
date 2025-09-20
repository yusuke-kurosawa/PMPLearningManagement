/**
 * アジャイル・ハイブリッド統合学習コンポーネント
 * アジャイルとPMBOKの統合、ハイブリッドアプローチの学習
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import {
  GitMerge,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  Target,
  Workflow,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  Scale,
  Zap,
  Shield,
  Compass,
  Brain,
  Layers,
} from 'lucide-react'

interface ProjectScenario {
  id: string
  name: string
  description: string
  characteristics: string[]
  recommendedApproach: 'predictive' | 'agile' | 'hybrid'
  rationale: string[]
  implementationTips: string[]
  challenges: string[]
  successFactors: string[]
}

interface HybridPattern {
  id: string
  name: string
  description: string
  structure: string
  benefits: string[]
  challenges: string[]
  suitableFor: string[]
  implementationSteps: string[]
}

const AgileHybridIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comparison')
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  // プロジェクトシナリオデータ
  const projectScenarios: ProjectScenario[] = [
    {
      id: 'enterprise-software',
      name: '企業基幹システム開発',
      description: '大規模企業の基幹システムの新規開発・移行プロジェクト',
      characteristics: [
        '複雑な業務要件',
        '厳格な規制要求',
        '多数のステークホルダー',
        '段階的移行の必要性',
        '既存システムとの統合',
      ],
      recommendedApproach: 'hybrid',
      rationale: [
        '要求分析と設計フェーズでは予測型が適切',
        '開発・テストフェーズではアジャイルが効果的',
        'リスク管理には予測型の計画性が必要',
        'ユーザーフィードバックにはアジャイルの柔軟性が重要',
      ],
      implementationTips: [
        '段階的な要求固定化',
        'マイルストーン毎のアプローチ見直し',
        'ガバナンスとアジリティのバランス',
        '適応的な品質保証プロセス',
      ],
      challenges: [
        'アプローチ切り替え時の混乱',
        'チームスキルの多様性要求',
        'ガバナンス複雑化',
        'コミュニケーションオーバーヘッド',
      ],
      successFactors: [
        '明確なアプローチ選択基準',
        'チームトレーニング',
        '段階的な適用',
        '継続的なレトロスペクティブ',
      ],
    },
    {
      id: 'mobile-app',
      name: 'モバイルアプリ開発',
      description: 'ユーザー向けモバイルアプリケーションの開発',
      characteristics: [
        '頻繁な要求変更',
        '迅速な市場投入が必要',
        'ユーザーフィードバックが重要',
        '技術的イノベーション',
        '継続的なアップデート',
      ],
      recommendedApproach: 'agile',
      rationale: [
        'ユーザーニーズの変化が激しい',
        '早期リリースによる市場検証が重要',
        '継続的な改善が競争優位性',
        'チーム規模が小さく意思決定が迅速',
      ],
      implementationTips: [
        'MVP（最小実用プロダクト）アプローチ',
        'ユーザーテストの継続実施',
        'デプロイ自動化の徹底',
        'A/Bテストによる機能検証',
      ],
      challenges: [
        '技術的負債の蓄積',
        '品質とスピードのバランス',
        'スケーラビリティの確保',
        'セキュリティリスク管理',
      ],
      successFactors: [
        '自動化テストの充実',
        'DevOpsプラクティス',
        'ユーザー中心設計',
        '継続的パフォーマンス監視',
      ],
    },
    {
      id: 'infrastructure',
      name: 'インフラストラクチャ構築',
      description: '大規模なITインフラストラクチャの構築・更新プロジェクト',
      characteristics: [
        '明確な技術要件',
        '安全性・可用性が最優先',
        '長期間の計画性が必要',
        '規制・コンプライアンス要求',
        '大規模な投資',
      ],
      recommendedApproach: 'predictive',
      rationale: [
        '技術仕様が明確で変更が少ない',
        '安全性確保のため詳細な計画が必要',
        '大規模投資のため予算管理が重要',
        '段階的構築による リスク軽減',
      ],
      implementationTips: [
        '詳細な技術仕様策定',
        'リスクアセスメントの徹底',
        '段階的な構築・検証',
        '変更管理プロセスの確立',
      ],
      challenges: [
        '長期プロジェクトでの要求変化',
        '技術進歩への対応',
        '複雑な依存関係管理',
        'ベンダー管理',
      ],
      successFactors: [
        '包括的な事前調査',
        '専門技術チーム',
        '厳格な品質管理',
        '継続的なリスク監視',
      ],
    },
  ]

  // ハイブリッドパターン
  const hybridPatterns: HybridPattern[] = [
    {
      id: 'phased-agile',
      name: 'フェーズド・アジャイル',
      description: 'プロジェクトフェーズ毎に予測型とアジャイルを使い分け',
      structure: '分析・設計（予測型） → 開発・テスト（アジャイル） → デプロイ（予測型）',
      benefits: [
        'フェーズ特性に最適化',
        'リスク管理の強化',
        'ガバナンス要求への対応',
        '段階的価値提供',
      ],
      challenges: [
        'フェーズ間の調整',
        'アプローチ切り替え時の混乱',
        'チームスキルの多様性要求',
        'プロセス複雑化',
      ],
      suitableFor: [
        '大規模企業プロジェクト',
        '規制要求があるプロジェクト',
        '複雑な技術統合',
        '段階的リリースが必要',
      ],
      implementationSteps: [
        'フェーズ毎のアプローチ定義',
        'チームトレーニング計画',
        'ガバナンス調整',
        'メトリクス設定',
        '継続的改善プロセス',
      ],
    },
    {
      id: 'agile-at-scale',
      name: 'スケールド・アジャイル',
      description: 'アジャイルベースで予測型要素を統合',
      structure: 'アジャイル開発 + 予測型計画・ガバナンス + 段階的統合',
      benefits: [
        'アジャイルの柔軟性維持',
        '企業ガバナンス要求対応',
        'スケーラビリティ確保',
        '継続的価値提供',
      ],
      challenges: [
        'ガバナンスオーバーヘッド',
        'チーム間調整',
        '複雑な依存関係管理',
        'メトリクス統合',
      ],
      suitableFor: ['大規模ソフトウェア開発', '複数チーム協働', '継続的デリバリー', 'DevOps環境'],
      implementationSteps: [
        'スケーリングフレームワーク選択',
        'チーム構造設計',
        'プロセス標準化',
        'ツール統合',
        'メトリクス ダッシュボード構築',
      ],
    },
    {
      id: 'lean-hybrid',
      name: 'リーン・ハイブリッド',
      description: 'リーン原則ベースで予測型とアジャイルを組み合わせ',
      structure: 'バリューストリーム最適化 + 適応的計画 + 継続的改善',
      benefits: ['無駄の排除', '価値フロー最適化', '学習サイクル高速化', '顧客価値最大化'],
      challenges: ['バリューストリーム可視化', '組織文化変革', 'メトリクス設計', '継続的改善文化'],
      suitableFor: ['プロダクト開発', '製造業でのソフトウェア', 'サービス改善', 'プロセス最適化'],
      implementationSteps: [
        'バリューストリームマッピング',
        'ボトルネック特定',
        '改善施策設計',
        'メトリクス定義',
        '継続的モニタリング',
      ],
    },
  ]

  // アプローチ比較データ
  const approachComparison = {
    dimensions: [
      {
        name: '計画性',
        predictive: 90,
        agile: 30,
        hybrid: 70,
        description: '事前計画の詳細度と固定性',
      },
      {
        name: '柔軟性',
        predictive: 20,
        agile: 95,
        hybrid: 75,
        description: '変化への対応力',
      },
      {
        name: 'リスク管理',
        predictive: 85,
        agile: 60,
        hybrid: 80,
        description: 'リスクの事前特定と管理',
      },
      {
        name: '価値提供速度',
        predictive: 40,
        agile: 90,
        hybrid: 70,
        description: '早期価値提供の頻度',
      },
      {
        name: 'ガバナンス',
        predictive: 95,
        agile: 45,
        hybrid: 80,
        description: '統制・管理の体系性',
      },
      {
        name: 'ステークホルダー参加',
        predictive: 35,
        agile: 90,
        hybrid: 70,
        description: 'ステークホルダーの継続的関与',
      },
    ],
  }

  // シミュレーション実行
  const runSimulation = useCallback(() => {
    setIsSimulating(true)
    setSimulationProgress(0)

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSimulating(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* ヘッダー */}
      <div className='space-y-4 text-center'>
        <motion.h1
          className='text-4xl font-bold text-gray-900 dark:text-white'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GitMerge className='mr-3 inline-block text-blue-600' size={40} />
          アジャイル・ハイブリッド統合学習
        </motion.h1>
        <motion.p
          className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          アジャイルとPMBOKの統合アプローチを学び、最適なハイブリッド戦略を習得しましょう
        </motion.p>
      </div>

      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='comparison'>アプローチ比較</TabsTrigger>
          <TabsTrigger value='scenarios'>実践シナリオ</TabsTrigger>
          <TabsTrigger value='patterns'>ハイブリッドパターン</TabsTrigger>
          <TabsTrigger value='simulation'>統合シミュレーション</TabsTrigger>
        </TabsList>

        {/* アプローチ比較 */}
        <TabsContent value='comparison' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='mr-2 text-blue-600' />
                  予測型 vs アジャイル vs ハイブリッド比較
                </CardTitle>
                <CardDescription>各アプローチの特性を多次元で比較分析</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {approachComparison.dimensions.map((dimension, index) => (
                  <motion.div
                    key={dimension.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className='space-y-3'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='font-semibold'>{dimension.name}</h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {dimension.description}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-4'>
                        <span className='w-16 text-sm text-orange-700 dark:text-orange-300'>
                          予測型
                        </span>
                        <div className='flex-1'>
                          <Progress value={dimension.predictive} className='h-3' />
                        </div>
                        <span className='w-8 text-sm font-medium'>{dimension.predictive}%</span>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <span className='w-16 text-sm text-green-700 dark:text-green-300'>
                          アジャイル
                        </span>
                        <div className='flex-1'>
                          <Progress value={dimension.agile} className='h-3' />
                        </div>
                        <span className='w-8 text-sm font-medium'>{dimension.agile}%</span>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <span className='w-16 text-sm text-blue-700 dark:text-blue-300'>
                          ハイブリッド
                        </span>
                        <div className='flex-1'>
                          <Progress value={dimension.hybrid} className='h-3' />
                        </div>
                        <span className='w-8 text-sm font-medium'>{dimension.hybrid}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* 統合の利点 */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <Scale className='mr-2 text-blue-600' size={20} />
                    バランスの取れたアプローチ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      予測型の計画性とアジャイルの柔軟性を両立
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      プロジェクト特性に応じた最適化
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      リスクとイノベーションのバランス
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <Layers className='mr-2 text-purple-600' size={20} />
                    段階的適用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      フェーズ毎の最適アプローチ選択
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      組織の成熟度に応じた導入
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      継続的な改善と適応
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-lg'>
                    <Brain className='mr-2 text-emerald-600' size={20} />
                    組織学習の促進
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      多様なスキルセットの開発
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      状況判断能力の向上
                    </li>
                    <li className='flex items-start'>
                      <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                      適応的思考の育成
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* 実践シナリオ */}
        <TabsContent value='scenarios' className='space-y-6'>
          <div className='space-y-6'>
            {projectScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedScenario === scenario.id
                      ? 'shadow-lg ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)
                  }
                >
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Compass className='mr-2 text-blue-600' size={20} />
                        {scenario.name}
                        <Badge
                          variant='outline'
                          className={`ml-3 ${
                            scenario.recommendedApproach === 'agile'
                              ? 'border-green-500 text-green-700'
                              : scenario.recommendedApproach === 'predictive'
                                ? 'border-orange-500 text-orange-700'
                                : 'border-blue-500 text-blue-700'
                          }`}
                        >
                          {scenario.recommendedApproach === 'agile'
                            ? 'アジャイル'
                            : scenario.recommendedApproach === 'predictive'
                              ? '予測型'
                              : 'ハイブリッド'}
                        </Badge>
                      </span>
                      {selectedScenario === scenario.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>

                  <AnimatePresence>
                    {selectedScenario === scenario.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className='space-y-6'>
                          <div>
                            <h5 className='mb-3 font-semibold'>プロジェクト特性</h5>
                            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                              {scenario.characteristics.map((char, idx) => (
                                <div key={idx} className='flex items-center'>
                                  <CheckCircle className='mr-2 text-blue-500' size={14} />
                                  <span className='text-sm'>{char}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div>
                              <h5 className='mb-3 font-semibold text-green-700 dark:text-green-300'>
                                推奨理由
                              </h5>
                              <ul className='space-y-2'>
                                {scenario.rationale.map((reason, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <Lightbulb className='mr-2 mt-0.5 text-yellow-500' size={12} />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className='mb-3 font-semibold text-blue-700 dark:text-blue-300'>
                                実装のコツ
                              </h5>
                              <ul className='space-y-2'>
                                {scenario.implementationTips.map((tip, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <Target className='mr-2 mt-0.5 text-blue-500' size={12} />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div>
                              <h5 className='mb-3 font-semibold text-orange-700 dark:text-orange-300'>
                                課題・リスク
                              </h5>
                              <ul className='space-y-2'>
                                {scenario.challenges.map((challenge, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <AlertTriangle
                                      className='mr-2 mt-0.5 text-orange-500'
                                      size={12}
                                    />
                                    {challenge}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className='mb-3 font-semibold text-purple-700 dark:text-purple-300'>
                                成功要因
                              </h5>
                              <ul className='space-y-2'>
                                {scenario.successFactors.map((factor, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ハイブリッドパターン */}
        <TabsContent value='patterns' className='space-y-6'>
          <div className='space-y-6'>
            {hybridPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPattern === pattern.id
                      ? 'shadow-lg ring-2 ring-purple-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)
                  }
                >
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Workflow className='mr-2 text-purple-600' size={20} />
                        {pattern.name}
                      </span>
                      {selectedPattern === pattern.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                    <div className='mt-2'>
                      <Badge variant='outline' className='text-xs'>
                        {pattern.structure}
                      </Badge>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {selectedPattern === pattern.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className='space-y-6'>
                          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div>
                              <h5 className='mb-3 font-semibold text-green-700 dark:text-green-300'>
                                メリット
                              </h5>
                              <ul className='space-y-2'>
                                {pattern.benefits.map((benefit, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className='mb-3 font-semibold text-orange-700 dark:text-orange-300'>
                                課題
                              </h5>
                              <ul className='space-y-2'>
                                {pattern.challenges.map((challenge, idx) => (
                                  <li key={idx} className='flex items-start text-sm'>
                                    <AlertTriangle
                                      className='mr-2 mt-0.5 text-orange-500'
                                      size={12}
                                    />
                                    {challenge}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h5 className='mb-3 font-semibold text-blue-700 dark:text-blue-300'>
                              適用シーン
                            </h5>
                            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                              {pattern.suitableFor.map((scenario, idx) => (
                                <div key={idx} className='flex items-center'>
                                  <Target className='mr-2 text-blue-500' size={14} />
                                  <span className='text-sm'>{scenario}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className='mb-3 font-semibold text-purple-700 dark:text-purple-300'>
                              実装ステップ
                            </h5>
                            <div className='space-y-3'>
                              {pattern.implementationSteps.map((step, idx) => (
                                <div key={idx} className='flex items-start'>
                                  <Badge variant='outline' className='mr-3 mt-0.5'>
                                    {idx + 1}
                                  </Badge>
                                  <span className='text-sm'>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 統合シミュレーション */}
        <TabsContent value='simulation' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Zap className='mr-2 text-blue-600' />
                  アジャイル・ハイブリッド統合シミュレーション
                </CardTitle>
                <CardDescription>
                  仮想的なプロジェクトシナリオでハイブリッドアプローチの効果を体験
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <Alert>
                  <Lightbulb className='h-4 w-4' />
                  <AlertDescription>
                    このシミュレーションでは、企業基幹システム開発プロジェクトにおいて、
                    ハイブリッドアプローチがどのように段階的に適用されるかを体験できます。
                  </AlertDescription>
                </Alert>

                <div className='space-y-4'>
                  <h4 className='font-semibold'>シミュレーション設定</h4>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded border p-4'>
                      <h5 className='mb-2 font-medium'>プロジェクト</h5>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        企業基幹システム更新
                        <br />
                        期間: 18ヶ月
                        <br />
                        チーム: 50名
                      </p>
                    </div>
                    <div className='rounded border p-4'>
                      <h5 className='mb-2 font-medium'>アプローチ</h5>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        フェーズド・ハイブリッド
                        <br />
                        計画 → アジャイル開発 → 統合
                      </p>
                    </div>
                    <div className='rounded border p-4'>
                      <h5 className='mb-2 font-medium'>成功指標</h5>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        納期遵守: 95%
                        <br />
                        品質目標: 99%
                        <br />
                        ステークホルダー満足度: 90%
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold'>シミュレーション進行</h4>
                    <Button onClick={runSimulation} disabled={isSimulating} className='w-32'>
                      {isSimulating ? '実行中...' : '開始'}
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>進行状況</span>
                      <span>{simulationProgress}%</span>
                    </div>
                    <Progress value={simulationProgress} className='w-full' />
                  </div>

                  <AnimatePresence>
                    {simulationProgress > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='space-y-4'
                      >
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                          <Card className={simulationProgress >= 33 ? 'border-green-500' : ''}>
                            <CardHeader className='pb-2'>
                              <CardTitle className='text-lg'>フェーズ 1: 分析・設計</CardTitle>
                              <CardDescription className='text-sm'>
                                予測型アプローチ
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {simulationProgress >= 33 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className='space-y-2'
                                >
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-green-500' size={14} />
                                    要求分析完了
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-green-500' size={14} />
                                    アーキテクチャ設計完了
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-green-500' size={14} />
                                    詳細設計完了
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className={simulationProgress >= 66 ? 'border-blue-500' : ''}>
                            <CardHeader className='pb-2'>
                              <CardTitle className='text-lg'>フェーズ 2: 開発・テスト</CardTitle>
                              <CardDescription className='text-sm'>
                                アジャイルアプローチ
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {simulationProgress >= 66 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className='space-y-2'
                                >
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-blue-500' size={14} />
                                    スプリント 1-6 完了
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-blue-500' size={14} />
                                    継続的統合実装
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-blue-500' size={14} />
                                    ユーザーフィードバック統合
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className={simulationProgress >= 100 ? 'border-purple-500' : ''}>
                            <CardHeader className='pb-2'>
                              <CardTitle className='text-lg'>フェーズ 3: 統合・展開</CardTitle>
                              <CardDescription className='text-sm'>
                                ハイブリッドアプローチ
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {simulationProgress >= 100 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className='space-y-2'
                                >
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-purple-500' size={14} />
                                    システム統合完了
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-purple-500' size={14} />
                                    段階的移行完了
                                  </div>
                                  <div className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 text-purple-500' size={14} />
                                    本格運用開始
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {simulationProgress === 100 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Alert>
                              <CheckCircle className='h-4 w-4' />
                              <AlertDescription>
                                <strong>シミュレーション完了！</strong>
                                <br />
                                ハイブリッドアプローチにより、計画性と柔軟性を両立し、
                                予定通りの納期で高品質なシステムを構築できました。
                                ステークホルダー満足度: 92%、品質目標達成率: 98%
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AgileHybridIntegration
