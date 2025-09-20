import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Progress } from '../../ui/progress'
import { Alert, AlertDescription } from '../../ui/alert'
import {
  Shield,
  Building,
  Users,
  Settings,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Target,
  Activity,
  Clock,
  Award,
  BarChart3,
  Lightbulb,
  Zap,
  FileText,
  GitBranch,
  Eye,
  TrendingUp,
} from 'lucide-react'
import GovernanceFramework from './GovernanceFramework'
import PhaseGateManagement from './PhaseGateManagement'

const ProjectGovernanceLearning = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSections, setCompletedSections] = useState(new Set())
  const [selectedGovernanceType, setSelectedGovernanceType] = useState('prescriptive')
  const [learningProgress, setLearningProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('introduction')

  // ガバナンス学習モジュール
  const learningModules = [
    {
      id: 'introduction',
      title: 'プロジェクト・ガバナンスの基礎',
      description: 'ガバナンスの概念と重要性を理解する',
      duration: '20分',
      topics: [
        'ガバナンスとマネジメントの違い',
        'プロジェクト成功へのガバナンスの影響',
        'ステークホルダーの期待管理',
        '透明性と説明責任の重要性',
      ],
    },
    {
      id: 'components',
      title: 'ガバナンス構成要素（13要素）',
      description: '効果的なガバナンスを構築する13の要素',
      duration: '30分',
      topics: [
        'ガバナンス構造・プロセス・意思決定',
        '監督・管理・統制機能',
        'レポーティング・透明性・説明責任',
        'リスク管理・品質管理・価値実現',
        'ステークホルダー関与',
      ],
    },
    {
      id: 'types',
      title: '予測型 vs 適応型ガバナンス',
      description: 'プロジェクトタイプに応じたガバナンスアプローチ',
      duration: '25分',
      topics: [
        '予測型ガバナンスの特徴と適用場面',
        '適応型ガバナンスの特徴と適用場面',
        'ハイブリッドアプローチの選択',
        'ガバナンス強度の調整',
      ],
    },
  ]

  // ガバナンス13構成要素
  const governanceComponents = [
    { id: 'structure', name: 'ガバナンス構造', icon: Building, category: 'foundation' },
    { id: 'processes', name: 'ガバナンスプロセス', icon: Settings, category: 'foundation' },
    { id: 'decisions', name: '意思決定フレームワーク', icon: Target, category: 'foundation' },
    { id: 'oversight', name: '監督機能', icon: Eye, category: 'control' },
    { id: 'management', name: '管理機能', icon: Users, category: 'control' },
    { id: 'control', name: '統制機能', icon: Shield, category: 'control' },
    { id: 'reporting', name: 'レポーティング', icon: BarChart3, category: 'transparency' },
    { id: 'transparency', name: '透明性', icon: FileText, category: 'transparency' },
    { id: 'accountability', name: '説明責任', icon: Award, category: 'transparency' },
    { id: 'risk', name: 'リスク管理', icon: Activity, category: 'value' },
    { id: 'quality', name: '品質管理', icon: CheckCircle2, category: 'value' },
    { id: 'value', name: '価値実現', icon: TrendingUp, category: 'value' },
    { id: 'stakeholder', name: 'ステークホルダー関与', icon: Users, category: 'value' },
  ]

  // ガバナンスタイプ比較
  const governanceTypes = {
    prescriptive: {
      name: '予測型ガバナンス',
      description: '詳細な計画と厳格な統制に基づく従来的アプローチ',
      characteristics: [
        '事前の詳細計画',
        '段階的なフェーズゲート',
        '厳格な変更管理',
        '包括的な文書化',
        '階層的な意思決定',
      ],
      suitableFor: [
        '規制の厳しい業界',
        '大規模インフラプロジェクト',
        '高リスクプロジェクト',
        '要件が明確なプロジェクト',
      ],
      color: 'blue',
    },
    adaptive: {
      name: '適応型ガバナンス',
      description: '柔軟性と反復的改善を重視する現代的アプローチ',
      characteristics: [
        '反復的な計画策定',
        '頻繁なレビューポイント',
        '迅速な意思決定',
        '軽量な文書化',
        '分散的な権限',
      ],
      suitableFor: [
        'イノベーションプロジェクト',
        'ソフトウェア開発',
        '不確実性の高いプロジェクト',
        '短期間での価値提供',
      ],
      color: 'green',
    },
  }

  useEffect(() => {
    // 進捗計算
    const totalSections = learningModules.length
    const progress = (completedSections.size / totalSections) * 100
    setLearningProgress(progress)
  }, [completedSections])

  const markSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]))
  }

  const CategoryBadge = ({ category }) => {
    const categoryStyles = {
      foundation: 'bg-blue-100 text-blue-800',
      control: 'bg-purple-100 text-purple-800',
      transparency: 'bg-amber-100 text-amber-800',
      value: 'bg-green-100 text-green-800',
    }
    
    const categoryNames = {
      foundation: '基盤',
      control: '統制',
      transparency: '透明性',
      value: '価値',
    }

    return (
      <Badge variant="secondary" className={categoryStyles[category]}>
        {categoryNames[category]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-600 p-3 text-white">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            プロジェクト・ガバナンス学習ハブ
          </h1>
          <p className="text-lg text-gray-600">
            効果的なプロジェクトガバナンスの理論と実践を学習
          </p>
          
          {/* 進捗表示 */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>学習進捗</span>
              <span>{Math.round(learningProgress)}%</span>
            </div>
            <Progress value={learningProgress} className="h-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="introduction">基礎概念</TabsTrigger>
            <TabsTrigger value="components">構成要素</TabsTrigger>
            <TabsTrigger value="comparison">タイプ比較</TabsTrigger>
            <TabsTrigger value="framework">フレームワーク</TabsTrigger>
            <TabsTrigger value="gates">ゲート管理</TabsTrigger>
          </TabsList>

          {/* 基礎概念タブ */}
          <TabsContent value="introduction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  プロジェクト・ガバナンスとは
                </CardTitle>
                <CardDescription>
                  プロジェクトガバナンスの基本概念と重要性を理解しましょう
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ガバナンス vs マネジメント：</strong>
                    ガバナンスは「何をすべきか」を決定し、マネジメントは「どのように実行するか」を担当します。
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-700">ガバナンスの役割</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">戦略的方向性の設定</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">監督と統制</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">リスク管理</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">説明責任の確保</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-700">マネジメントの役割</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-green-600" />
                        <span className="text-sm">日常的な運営管理</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm">チーム管理</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-sm">プロセス実行</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">進捗監視</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">学習モジュール</h3>
                  <div className="grid gap-4">
                    {learningModules.map((module, index) => (
                      <Card key={module.id} className={`transition-all ${completedSections.has(module.id) ? 'border-green-500 bg-green-50' : 'hover:shadow-md'}`}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${completedSections.has(module.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {completedSections.has(module.id) ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-sm text-gray-600">{module.description}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {module.duration}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={completedSections.has(module.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => markSectionComplete(module.id)}
                            disabled={completedSections.has(module.id)}
                          >
                            {completedSections.has(module.id) ? '完了' : '学習開始'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 構成要素タブ */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  ガバナンス構成要素（13要素）
                </CardTitle>
                <CardDescription>
                  効果的なプロジェクトガバナンスを構築する13の重要要素
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {governanceComponents.map((component) => {
                    const IconComponent = component.icon
                    return (
                      <Card key={component.id} className="transition-transform hover:scale-105">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <IconComponent className="h-6 w-6 text-purple-600" />
                            <CategoryBadge category={component.category} />
                          </div>
                          <h3 className="font-medium text-gray-900">{component.name}</h3>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">基盤要素</CardTitle>
                      <CardDescription>ガバナンスの土台となる構造とプロセス</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">組織構造とロール定義</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">標準化されたプロセス</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">明確な意思決定権限</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-purple-700">統制要素</CardTitle>
                      <CardDescription>プロジェクトの監督と管理機能</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">継続的な監督機能</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">効果的な管理体制</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">適切な統制メカニズム</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-amber-700">透明性要素</CardTitle>
                      <CardDescription>情報共有と説明責任の確保</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">定期的なレポーティング</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">情報の透明性</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">明確な説明責任</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">価値要素</CardTitle>
                      <CardDescription>価値実現とステークホルダー満足</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-sm">プロアクティブなリスク管理</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">継続的な品質確保</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">価値実現の最大化</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* タイプ比較タブ */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-indigo-600" />
                  予測型 vs 適応型ガバナンス
                </CardTitle>
                <CardDescription>
                  プロジェクトの性質に応じて最適なガバナンスアプローチを選択
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex justify-center">
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <Button
                      variant={selectedGovernanceType === 'prescriptive' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedGovernanceType('prescriptive')}
                      className="rounded-md"
                    >
                      予測型
                    </Button>
                    <Button
                      variant={selectedGovernanceType === 'adaptive' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedGovernanceType('adaptive')}
                      className="rounded-md"
                    >
                      適応型
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {Object.entries(governanceTypes).map(([key, type]) => (
                    <Card 
                      key={key} 
                      className={`transition-all ${selectedGovernanceType === key ? `border-${type.color}-500 shadow-lg` : 'border-gray-200'}`}
                    >
                      <CardHeader>
                        <CardTitle className={`text-${type.color}-700`}>{type.name}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">主な特徴</h4>
                          <div className="space-y-2">
                            {type.characteristics.map((char, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle2 className={`h-4 w-4 text-${type.color}-600`} />
                                <span className="text-sm">{char}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-2 font-medium">適用場面</h4>
                          <div className="space-y-2">
                            {type.suitableFor.map((situation, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <ArrowRight className={`h-4 w-4 text-${type.color}-600`} />
                                <span className="text-sm">{situation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert className="mt-6">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ハイブリッドアプローチ：</strong>
                    実際のプロジェクトでは、予測型と適応型の要素を組み合わせることが多く、
                    プロジェクトの段階や領域に応じてガバナンスの強度を調整することが重要です。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* フレームワークタブ */}
          <TabsContent value="framework">
            <GovernanceFramework />
          </TabsContent>

          {/* ゲート管理タブ */}
          <TabsContent value="gates">
            <PhaseGateManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProjectGovernanceLearning