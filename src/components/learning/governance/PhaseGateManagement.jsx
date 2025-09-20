import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Alert, AlertDescription } from '../../ui/alert'
import { Progress } from '../../ui/progress'
import { Textarea } from '../../ui/textarea'
import { Input } from '../../ui/input'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  Clock,
  Target,
  Users,
  FileText,
  Activity,
  TrendingUp,
  Shield,
  Eye,
  Settings,
  ArrowRight,
  RefreshCw,
  Calendar,
  DollarSign,
  BarChart3,
  Lightbulb,
  Info,
} from 'lucide-react'

const PhaseGateManagement = () => {
  const [activeApproach, setActiveApproach] = useState('predictive')
  const [selectedPhase, setSelectedPhase] = useState(0)
  const [gateDecisions, setGateDecisions] = useState({})
  const [definitionOfDone, setDefinitionOfDone] = useState({})
  const [customDodItems, setCustomDodItems] = useState([])

  // 予測型フェーズゲート
  const predictiveGates = [
    {
      id: 'concept',
      name: '概念フェーズ',
      phase: 'コンセプト',
      gate: 'ゲート1：プロジェクト承認',
      description: 'プロジェクトの実行可能性と戦略的適合性を評価',
      criteria: [
        'ビジネスケースの妥当性',
        '初期予算とスケジュールの合理性',
        'リスクアセスメントの完了',
        'ステークホルダーの合意',
        '組織の戦略的適合性',
      ],
      deliverables: [
        'プロジェクト憲章',
        'ビジネスケース',
        '初期リスクレジスター',
        'ステークホルダーレジスター',
        '概念設計書',
      ],
      decisions: ['継続', '修正', '中止'],
      keyQuestions: [
        'このプロジェクトは組織戦略に適合するか？',
        '投資対効果は妥当か？',
        'リスクは許容可能な範囲か？',
        '必要なリソースは確保可能か？',
      ],
    },
    {
      id: 'definition',
      name: '定義フェーズ',
      phase: 'デフィニション',
      gate: 'ゲート2：実行承認',
      description: 'プロジェクト要件と実行計画の詳細化と承認',
      criteria: [
        '詳細要件の定義完了',
        '実行計画の詳細化',
        'チーム編成の完了',
        '予算配分の確定',
        '品質基準の設定',
      ],
      deliverables: [
        '要件定義書',
        'プロジェクト管理計画書',
        'WBS（作業分解構造）',
        '詳細スケジュール',
        '品質管理計画',
      ],
      decisions: ['継続', '修正', '中止'],
      keyQuestions: [
        '要件は明確で実行可能か？',
        '計画は現実的で詳細か？',
        'チームは適切に編成されているか？',
        '品質基準は適切に設定されているか？',
      ],
    },
    {
      id: 'execution',
      name: '実行フェーズ',
      phase: 'エグゼキューション',
      gate: 'ゲート3：実装承認',
      description: 'プロジェクト成果物の開発と実装の評価',
      criteria: [
        '成果物の品質確認',
        'スケジュール遵守状況',
        '予算執行状況',
        'リスク管理状況',
        'ステークホルダー満足度',
      ],
      deliverables: [
        'プロジェクト成果物',
        '品質監査レポート',
        '進捗レポート',
        '変更管理ログ',
        'リスク更新レジスター',
      ],
      decisions: ['継続', '修正', '中止'],
      keyQuestions: [
        '成果物は品質基準を満たしているか？',
        'スケジュールは守られているか？',
        '予算は適切に管理されているか？',
        'リスクは適切に管理されているか？',
      ],
    },
    {
      id: 'closure',
      name: '終結フェーズ',
      phase: 'クロージャー',
      gate: 'ゲート4：プロジェクト完了',
      description: 'プロジェクトの正式な完了と教訓の収集',
      criteria: [
        '全成果物の検収完了',
        'ステークホルダー受け入れ',
        '契約の正式終了',
        'チームの解散',
        '教訓の文書化',
      ],
      deliverables: [
        '最終成果物',
        'プロジェクト完了報告書',
        '教訓学習レポート',
        '契約終了証明書',
        'アーカイブ文書',
      ],
      decisions: ['完了', '延長'],
      keyQuestions: [
        '全ての成果物は受け入れられたか？',
        'プロジェクト目標は達成されたか？',
        '教訓は適切に文書化されたか？',
        'チームは適切に解散されたか？',
      ],
    },
  ]

  // 適応型イテレーション
  const adaptiveIterations = [
    {
      id: 'sprint1',
      name: 'スプリント 1',
      phase: 'イテレーション',
      gate: 'スプリントレビュー',
      description: '最初の価値増分の開発と検証',
      criteria: [
        'スプリント目標の達成',
        '動作する製品増分の完成',
        'Definition of Done の遵守',
        'ステークホルダーフィードバック',
        'ベロシティの測定',
      ],
      deliverables: [
        '動作する製品増分',
        'スプリントレビュー結果',
        'レトロスペクティブ結果',
        '更新されたプロダクトバックログ',
        'ベロシティチャート',
      ],
      decisions: ['継続', 'ピボット', '停止'],
      keyQuestions: [
        'スプリント目標は達成されたか？',
        '製品増分は動作するか？',
        'ステークホルダーは満足しているか？',
        '次のスプリントに向けた改善点は何か？',
      ],
    },
    {
      id: 'sprint2',
      name: 'スプリント 2',
      phase: 'イテレーション',
      gate: 'スプリントレビュー',
      description: '機能拡張と品質向上の実現',
      criteria: [
        '前回フィードバックの反映',
        '新機能の追加',
        'テストカバレッジの向上',
        'パフォーマンスの最適化',
        'チーム学習の継続',
      ],
      deliverables: [
        '拡張された製品増分',
        '改善されたテストスイート',
        'パフォーマンステストレポート',
        '学習記録',
        '適応計画',
      ],
      decisions: ['継続', 'ピボット', '停止'],
      keyQuestions: [
        '前回のフィードバックは適切に反映されたか？',
        '新機能は期待通りに動作するか？',
        'チームの生産性は向上しているか？',
        '技術的品質は維持されているか？',
      ],
    },
    {
      id: 'sprint3',
      name: 'スプリント 3',
      phase: 'イテレーション',
      gate: 'スプリントレビュー',
      description: '統合とリリース準備の実施',
      criteria: [
        'システム統合の完了',
        'リリース基準の達成',
        'ユーザー受け入れテスト',
        'デプロイメント準備',
        'サポート体制の確立',
      ],
      deliverables: [
        'リリース可能な製品',
        '統合テスト結果',
        'ユーザー受け入れテスト結果',
        'デプロイメントガイド',
        'サポートドキュメント',
      ],
      decisions: ['リリース', '継続開発', '停止'],
      keyQuestions: [
        '製品はリリース可能な状態か？',
        'ユーザーは製品を受け入れているか？',
        'デプロイメント準備は完了しているか？',
        'サポート体制は確立されているか？',
      ],
    },
  ]

  // Definition of Done テンプレート
  const dodTemplates = {
    software: {
      name: 'ソフトウェア開発',
      items: [
        '機能が要件を満たしている',
        'コードレビューが完了している',
        '単体テストが作成され成功している',
        '統合テストが成功している',
        'UIテストが成功している',
        'ドキュメントが更新されている',
        'セキュリティチェックが完了している',
        'パフォーマンステストが成功している',
        'ステークホルダーの承認を得ている',
        'プロダクトオーナーが受け入れている',
      ],
    },
    infrastructure: {
      name: 'インフラストラクチャ',
      items: [
        '設計仕様を満たしている',
        '品質検査が完了している',
        '安全基準をクリアしている',
        '環境影響評価が完了している',
        '運用マニュアルが作成されている',
        'メンテナンス計画が策定されている',
        'ステークホルダーの承認を得ている',
        '法的要件を満たしている',
        '予算内で完了している',
        '引き渡し準備が完了している',
      ],
    },
    research: {
      name: '研究開発',
      items: [
        '研究目標が達成されている',
        'データが収集・分析されている',
        '結果が検証されている',
        '論文・レポートが作成されている',
        'ピアレビューが完了している',
        '知的財産が保護されている',
        '倫理審査をクリアしている',
        '研究データが適切に管理されている',
        '成果が共有されている',
        'フォローアップ計画が策定されている',
      ],
    },
  }

  const makeGateDecision = (gateId, decision) => {
    setGateDecisions((prev) => ({
      ...prev,
      [gateId]: {
        decision,
        timestamp: new Date().toISOString(),
        rationale: '',
      },
    }))
  }

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case '継続':
      case 'リリース':
      case '完了':
        return <CheckCircle2 className='h-4 w-4 text-green-600' />
      case '修正':
      case 'ピボット':
      case '継続開発':
      case '延長':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />
      case '中止':
      case '停止':
        return <XCircle className='h-4 w-4 text-red-600' />
      default:
        return <Clock className='h-4 w-4 text-gray-400' />
    }
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case '継続':
      case 'リリース':
      case '完了':
        return 'border-green-500 bg-green-50'
      case '修正':
      case 'ピボット':
      case '継続開発':
      case '延長':
        return 'border-yellow-500 bg-yellow-50'
      case '中止':
      case '停止':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const addCustomDodItem = () => {
    setCustomDodItems((prev) => [...prev, ''])
  }

  const updateCustomDodItem = (index, value) => {
    setCustomDodItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const removeCustomDodItem = (index) => {
    setCustomDodItems((prev) => prev.filter((_, i) => i !== index))
  }

  const currentGates = activeApproach === 'predictive' ? predictiveGates : adaptiveIterations

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GitBranch className='h-5 w-5 text-indigo-600' />
            フェーズゲート管理システム
          </CardTitle>
          <CardDescription>
            プロジェクトの進捗と品質を管理するゲートレビューシステム
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeApproach} onValueChange={setActiveApproach} className='space-y-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='predictive'>予測型フェーズゲート</TabsTrigger>
              <TabsTrigger value='adaptive'>適応型イテレーション</TabsTrigger>
            </TabsList>

            <TabsContent value='predictive' className='space-y-6'>
              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  <strong>予測型アプローチ：</strong>
                  段階的なフェーズゲートレビューにより、プロジェクトの進行可否を厳格に判定します。
                  各ゲートで承認を得てから次のフェーズに進みます。
                </AlertDescription>
              </Alert>

              <div className='grid gap-4'>
                {predictiveGates.map((gate, index) => (
                  <Card
                    key={gate.id}
                    className={`transition-all ${
                      gateDecisions[gate.id]
                        ? getDecisionColor(gateDecisions[gate.id].decision)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              gateDecisions[gate.id]
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {gate.name}
                        </CardTitle>
                        {gateDecisions[gate.id] && (
                          <Badge variant='outline' className='flex items-center gap-1'>
                            {getDecisionIcon(gateDecisions[gate.id].decision)}
                            {gateDecisions[gate.id].decision}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{gate.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>ゲート判定基準</h4>
                        <div className='grid gap-2 md:grid-cols-2'>
                          {gate.criteria.map((criterion, idx) => (
                            <div key={idx} className='flex items-center gap-2'>
                              <CheckCircle2 className='h-4 w-4 text-blue-600' />
                              <span className='text-sm'>{criterion}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>主要成果物</h4>
                        <div className='grid gap-2 md:grid-cols-2'>
                          {gate.deliverables.map((deliverable, idx) => (
                            <div key={idx} className='flex items-center gap-2'>
                              <FileText className='h-4 w-4 text-green-600' />
                              <span className='text-sm'>{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>重要な質問</h4>
                        <div className='space-y-1'>
                          {gate.keyQuestions.map((question, idx) => (
                            <div key={idx} className='flex items-start gap-2'>
                              <Target className='mt-0.5 h-4 w-4 text-purple-600' />
                              <span className='text-sm'>{question}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='border-t pt-4'>
                        <h4 className='mb-3 font-medium text-gray-900'>ゲート判定</h4>
                        <div className='flex gap-2'>
                          {gate.decisions.map((decision) => (
                            <Button
                              key={decision}
                              variant={
                                gateDecisions[gate.id]?.decision === decision
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={() => makeGateDecision(gate.id, decision)}
                              className='flex items-center gap-1'
                            >
                              {getDecisionIcon(decision)}
                              {decision}
                            </Button>
                          ))}
                        </div>
                        {gateDecisions[gate.id] && (
                          <div className='mt-3'>
                            <Textarea
                              placeholder='判定理由を入力してください...'
                              className='h-20'
                              value={gateDecisions[gate.id].rationale || ''}
                              onChange={(e) =>
                                setGateDecisions((prev) => ({
                                  ...prev,
                                  [gate.id]: {
                                    ...prev[gate.id],
                                    rationale: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='adaptive' className='space-y-6'>
              <Alert>
                <Lightbulb className='h-4 w-4' />
                <AlertDescription>
                  <strong>適応型アプローチ：</strong>
                  短いイテレーションごとにレビューを実施し、継続的なフィードバックと改善を通じて
                  価値を早期に提供します。
                </AlertDescription>
              </Alert>

              <div className='grid gap-4'>
                {adaptiveIterations.map((iteration, index) => (
                  <Card
                    key={iteration.id}
                    className={`transition-all ${
                      gateDecisions[iteration.id]
                        ? getDecisionColor(gateDecisions[iteration.id].decision)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              gateDecisions[iteration.id]
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                          {iteration.name}
                        </CardTitle>
                        {gateDecisions[iteration.id] && (
                          <Badge variant='outline' className='flex items-center gap-1'>
                            {getDecisionIcon(gateDecisions[iteration.id].decision)}
                            {gateDecisions[iteration.id].decision}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{iteration.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>レビュー基準</h4>
                        <div className='grid gap-2 md:grid-cols-2'>
                          {iteration.criteria.map((criterion, idx) => (
                            <div key={idx} className='flex items-center gap-2'>
                              <Activity className='h-4 w-4 text-green-600' />
                              <span className='text-sm'>{criterion}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>主要成果物</h4>
                        <div className='grid gap-2 md:grid-cols-2'>
                          {iteration.deliverables.map((deliverable, idx) => (
                            <div key={idx} className='flex items-center gap-2'>
                              <TrendingUp className='h-4 w-4 text-blue-600' />
                              <span className='text-sm'>{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>レビュー質問</h4>
                        <div className='space-y-1'>
                          {iteration.keyQuestions.map((question, idx) => (
                            <div key={idx} className='flex items-start gap-2'>
                              <Eye className='mt-0.5 h-4 w-4 text-indigo-600' />
                              <span className='text-sm'>{question}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='border-t pt-4'>
                        <h4 className='mb-3 font-medium text-gray-900'>レビュー結果</h4>
                        <div className='flex gap-2'>
                          {iteration.decisions.map((decision) => (
                            <Button
                              key={decision}
                              variant={
                                gateDecisions[iteration.id]?.decision === decision
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={() => makeGateDecision(iteration.id, decision)}
                              className='flex items-center gap-1'
                            >
                              {getDecisionIcon(decision)}
                              {decision}
                            </Button>
                          ))}
                        </div>
                        {gateDecisions[iteration.id] && (
                          <div className='mt-3'>
                            <Textarea
                              placeholder='レビュー結果と改善点を入力してください...'
                              className='h-20'
                              value={gateDecisions[iteration.id].rationale || ''}
                              onChange={(e) =>
                                setGateDecisions((prev) => ({
                                  ...prev,
                                  [iteration.id]: {
                                    ...prev[iteration.id],
                                    rationale: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Definition of Done管理 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            Definition of Done (完了の定義) 管理
          </CardTitle>
          <CardDescription>品質基準と完了条件の明確化と管理</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-3'>
            {Object.entries(dodTemplates).map(([key, template]) => (
              <Card key={key} className='border-blue-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg text-blue-700'>{template.name}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='space-y-2'>
                    {template.items.slice(0, 5).map((item, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                        <span className='text-sm'>{item}</span>
                      </div>
                    ))}
                    {template.items.length > 5 && (
                      <div className='text-sm text-gray-500'>+{template.items.length - 5} 項目</div>
                    )}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setDefinitionOfDone((prev) => ({
                        ...prev,
                        [key]: new Set(template.items),
                      }))
                    }
                    className='w-full'
                  >
                    このテンプレートを使用
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='border-dashed border-gray-300'>
            <CardHeader>
              <CardTitle className='text-lg'>カスタム Definition of Done</CardTitle>
              <CardDescription>プロジェクト固有の完了基準を追加できます</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                {customDodItems.map((item, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Input
                      value={item}
                      onChange={(e) => updateCustomDodItem(index, e.target.value)}
                      placeholder='完了基準を入力...'
                      className='flex-1'
                    />
                    <Button variant='outline' size='sm' onClick={() => removeCustomDodItem(index)}>
                      <XCircle className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant='outline' onClick={addCustomDodItem} className='w-full'>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                基準を追加
              </Button>
            </CardContent>
          </Card>

          <Alert>
            <Shield className='h-4 w-4' />
            <AlertDescription>
              <strong>Definition of Done の重要性：</strong>
              明確な完了基準により、品質の一貫性を保ち、ステークホルダー間の期待値を
              合わせることができます。各イテレーションやフェーズでこの基準を確認しましょう。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* プロジェクト進捗概要 */}
      {Object.keys(gateDecisions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-purple-600' />
              ゲートレビュー進捗概要
            </CardTitle>
            <CardDescription>プロジェクトのゲートレビュー状況と判定結果</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-blue-50 p-4'>
                <div className='text-2xl font-bold text-blue-700'>
                  {Object.keys(gateDecisions).length}
                </div>
                <div className='text-sm text-blue-600'>レビュー完了</div>
              </div>
              <div className='rounded-lg bg-green-50 p-4'>
                <div className='text-2xl font-bold text-green-700'>
                  {
                    Object.values(gateDecisions).filter((d) =>
                      ['継続', 'リリース', '完了'].includes(d.decision)
                    ).length
                  }
                </div>
                <div className='text-sm text-green-600'>承認済み</div>
              </div>
              <div className='rounded-lg bg-yellow-50 p-4'>
                <div className='text-2xl font-bold text-yellow-700'>
                  {
                    Object.values(gateDecisions).filter((d) =>
                      ['修正', 'ピボット', '継続開発', '延長'].includes(d.decision)
                    ).length
                  }
                </div>
                <div className='text-sm text-yellow-600'>要修正</div>
              </div>
              <div className='rounded-lg bg-red-50 p-4'>
                <div className='text-2xl font-bold text-red-700'>
                  {
                    Object.values(gateDecisions).filter((d) =>
                      ['中止', '停止'].includes(d.decision)
                    ).length
                  }
                </div>
                <div className='text-sm text-red-600'>中止・停止</div>
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium'>最近の判定</h4>
              {Object.entries(gateDecisions)
                .sort(([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 3)
                .map(([gateId, decision]) => {
                  const gate = currentGates.find((g) => g.id === gateId)
                  return gate ? (
                    <div
                      key={gateId}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        {getDecisionIcon(decision.decision)}
                        <div>
                          <div className='font-medium'>{gate.name}</div>
                          <div className='text-sm text-gray-600'>
                            {new Date(decision.timestamp).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                      <Badge variant='outline'>{decision.decision}</Badge>
                    </div>
                  ) : null
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PhaseGateManagement
