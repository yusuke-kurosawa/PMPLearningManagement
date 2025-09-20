import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Slider } from '../../ui/slider'
import { Checkbox } from '../../ui/checkbox'
import { Alert, AlertDescription } from '../../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import {
  Settings,
  Download,
  Save,
  RefreshCw,
  Building,
  Shield,
  Users,
  Target,
  Activity,
  BarChart3,
  FileText,
  Award,
  Eye,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Info,
} from 'lucide-react'

const GovernanceFramework = () => {
  const [governanceStrength, setGovernanceStrength] = useState([50])
  const [selectedComponents, setSelectedComponents] = useState(new Set())
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customFramework, setCustomFramework] = useState({
    name: '',
    description: '',
    projectType: '',
  })
  const [activeTemplate, setActiveTemplate] = useState('software')

  // ガバナンス構成要素（詳細版）
  const governanceComponents = [
    {
      id: 'structure',
      name: 'ガバナンス構造',
      icon: Building,
      category: 'foundation',
      description: '組織構造、役割、責任の明確化',
      required: true,
      strength: {
        light: '基本的な役割分担',
        medium: '明確な階層と権限',
        heavy: '詳細な組織図と責任マトリックス',
      },
    },
    {
      id: 'processes',
      name: 'ガバナンスプロセス',
      icon: Settings,
      category: 'foundation',
      description: '標準化されたプロセスと手順',
      required: true,
      strength: {
        light: '基本的なプロセス',
        medium: '標準化されたワークフロー',
        heavy: '詳細なプロセス文書化',
      },
    },
    {
      id: 'decisions',
      name: '意思決定フレームワーク',
      icon: Target,
      category: 'foundation',
      description: '意思決定権限と承認プロセス',
      required: true,
      strength: {
        light: '基本的な承認ライン',
        medium: 'RACI マトリックス',
        heavy: '詳細な意思決定ツリー',
      },
    },
    {
      id: 'oversight',
      name: '監督機能',
      icon: Eye,
      category: 'control',
      description: 'プロジェクトの監督と指導',
      required: false,
      strength: {
        light: '月次レビュー',
        medium: '週次レビューと指導',
        heavy: '日次監督と詳細分析',
      },
    },
    {
      id: 'management',
      name: '管理機能',
      icon: Users,
      category: 'control',
      description: 'チームとリソースの管理',
      required: true,
      strength: {
        light: '基本的なチーム管理',
        medium: 'リソース最適化',
        heavy: '詳細なパフォーマンス管理',
      },
    },
    {
      id: 'control',
      name: '統制機能',
      icon: Shield,
      category: 'control',
      description: '品質とコンプライアンスの統制',
      required: false,
      strength: {
        light: '基本的な品質チェック',
        medium: '定期的な監査',
        heavy: '継続的な統制とモニタリング',
      },
    },
    {
      id: 'reporting',
      name: 'レポーティング',
      icon: BarChart3,
      category: 'transparency',
      description: '進捗と成果の報告',
      required: true,
      strength: {
        light: '基本的な進捗報告',
        medium: 'ダッシュボードと分析',
        heavy: 'リアルタイム監視と詳細レポート',
      },
    },
    {
      id: 'transparency',
      name: '透明性',
      icon: FileText,
      category: 'transparency',
      description: '情報の可視性と共有',
      required: true,
      strength: {
        light: '基本的な情報共有',
        medium: '構造化された情報管理',
        heavy: '完全な透明性と追跡可能性',
      },
    },
    {
      id: 'accountability',
      name: '説明責任',
      icon: Award,
      category: 'transparency',
      description: '責任の明確化と説明',
      required: true,
      strength: {
        light: '基本的な責任分担',
        medium: '明確な説明責任',
        heavy: '詳細な説明責任フレームワーク',
      },
    },
    {
      id: 'risk',
      name: 'リスク管理',
      icon: Activity,
      category: 'value',
      description: 'リスクの識別と対応',
      required: true,
      strength: {
        light: '基本的なリスク識別',
        medium: 'リスクレジスターと対応策',
        heavy: '包括的なリスク管理システム',
      },
    },
    {
      id: 'quality',
      name: '品質管理',
      icon: CheckCircle2,
      category: 'value',
      description: '品質基準と品質保証',
      required: true,
      strength: {
        light: '基本的な品質チェック',
        medium: '品質管理計画',
        heavy: '継続的品質改善',
      },
    },
    {
      id: 'value',
      name: '価値実現',
      icon: TrendingUp,
      category: 'value',
      description: 'ビジネス価値の最大化',
      required: true,
      strength: {
        light: '基本的な価値測定',
        medium: '価値実現計画',
        heavy: '継続的価値最適化',
      },
    },
    {
      id: 'stakeholder',
      name: 'ステークホルダー関与',
      icon: Users,
      category: 'value',
      description: 'ステークホルダーの参画と満足',
      required: true,
      strength: {
        light: '基本的なコミュニケーション',
        medium: 'ステークホルダー管理計画',
        heavy: '継続的エンゲージメント',
      },
    },
  ]

  // プロジェクトタイプ別テンプレート
  const templates = {
    software: {
      name: 'ソフトウェア開発プロジェクト',
      description: 'アジャイル・DevOps環境に適した軽量ガバナンス',
      strength: 30,
      components: [
        'structure',
        'processes',
        'decisions',
        'management',
        'reporting',
        'transparency',
        'accountability',
        'risk',
        'quality',
        'value',
        'stakeholder',
      ],
      characteristics: ['反復的開発', '頻繁なリリース', '自己組織化チーム', '継続的フィードバック'],
    },
    infrastructure: {
      name: 'インフラストラクチャプロジェクト',
      description: '大規模・長期プロジェクトに適した厳格ガバナンス',
      strength: 80,
      components: [
        'structure',
        'processes',
        'decisions',
        'oversight',
        'management',
        'control',
        'reporting',
        'transparency',
        'accountability',
        'risk',
        'quality',
        'value',
        'stakeholder',
      ],
      characteristics: ['段階的実行', '詳細な計画', '厳格な変更管理', '包括的な文書化'],
    },
    innovation: {
      name: 'イノベーションプロジェクト',
      description: '実験的・探索的プロジェクトに適した柔軟ガバナンス',
      strength: 25,
      components: ['structure', 'decisions', 'management', 'reporting', 'value', 'stakeholder'],
      characteristics: ['実験と学習', '迅速な意思決定', '失敗許容', '価値発見重視'],
    },
    compliance: {
      name: 'コンプライアンスプロジェクト',
      description: '規制対応に特化した統制重視ガバナンス',
      strength: 90,
      components: [
        'structure',
        'processes',
        'decisions',
        'oversight',
        'management',
        'control',
        'reporting',
        'transparency',
        'accountability',
        'risk',
        'quality',
      ],
      characteristics: ['厳格な統制', '完全な追跡可能性', '包括的な文書化', 'リスク最小化'],
    },
  }

  useEffect(() => {
    // テンプレート選択時の自動設定
    if (selectedTemplate && templates[selectedTemplate]) {
      const template = templates[selectedTemplate]
      setGovernanceStrength([template.strength])
      setSelectedComponents(new Set(template.components))
    }
  }, [selectedTemplate])

  const getStrengthLevel = (strength) => {
    if (strength < 33) {
      return 'light'
    }
    if (strength < 67) {
      return 'medium'
    }
    return 'heavy'
  }

  const getStrengthLabel = (strength) => {
    if (strength < 33) {
      return '軽量（Light）'
    }
    if (strength < 67) {
      return '中程度（Medium）'
    }
    return '重厚（Heavy）'
  }

  const getStrengthColor = (strength) => {
    if (strength < 33) {
      return 'text-green-600'
    }
    if (strength < 67) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const toggleComponent = (componentId) => {
    const newSelected = new Set(selectedComponents)
    if (newSelected.has(componentId)) {
      newSelected.delete(componentId)
    } else {
      newSelected.add(componentId)
    }
    setSelectedComponents(newSelected)
  }

  const exportFramework = () => {
    const framework = {
      name: customFramework.name || 'カスタムガバナンスフレームワーク',
      description: customFramework.description || 'プロジェクト固有のガバナンスフレームワーク',
      strength: governanceStrength[0],
      strengthLabel: getStrengthLabel(governanceStrength[0]),
      components: Array.from(selectedComponents).map((id) => {
        const component = governanceComponents.find((c) => c.id === id)
        return {
          id: component.id,
          name: component.name,
          description: component.description,
          implementation: component.strength[getStrengthLevel(governanceStrength[0])],
        }
      }),
      createdAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(framework, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `governance-framework-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
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
      <Badge variant='secondary' className={categoryStyles[category]}>
        {categoryNames[category]}
      </Badge>
    )
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5 text-blue-600' />
            ガバナンスフレームワーク設計ツール
          </CardTitle>
          <CardDescription>
            プロジェクトの特性に応じて最適なガバナンスフレームワークを設計
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className='space-y-6'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='software'>ソフトウェア</TabsTrigger>
              <TabsTrigger value='infrastructure'>インフラ</TabsTrigger>
              <TabsTrigger value='innovation'>イノベーション</TabsTrigger>
              <TabsTrigger value='compliance'>コンプライアンス</TabsTrigger>
            </TabsList>

            {Object.entries(templates).map(([key, template]) => (
              <TabsContent key={key} value={key} className='space-y-6'>
                <Card className='border-blue-200'>
                  <CardHeader>
                    <CardTitle className='text-lg text-blue-700'>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-2 md:grid-cols-2'>
                      {template.characteristics.map((char, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-blue-600' />
                          <span className='text-sm'>{char}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => setSelectedTemplate(key)}
                      variant='outline'
                      className='w-full'
                    >
                      このテンプレートを適用
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* ガバナンス強度設定 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5 text-purple-600' />
            ガバナンス強度の設定
          </CardTitle>
          <CardDescription>
            プロジェクトの複雑さとリスクに応じてガバナンスの強度を調整
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>ガバナンス強度</span>
              <span className={`text-sm font-medium ${getStrengthColor(governanceStrength[0])}`}>
                {getStrengthLabel(governanceStrength[0])} ({governanceStrength[0]}%)
              </span>
            </div>
            <Slider
              value={governanceStrength}
              onValueChange={setGovernanceStrength}
              max={100}
              step={1}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-gray-500'>
              <span>軽量（敏捷性重視）</span>
              <span>中程度（バランス）</span>
              <span>重厚（統制重視）</span>
            </div>
          </div>

          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              <strong>推奨設定：</strong>
              {governanceStrength[0] < 33 && ' 短期間・低リスクのアジャイルプロジェクトに適用'}
              {governanceStrength[0] >= 33 &&
                governanceStrength[0] < 67 &&
                ' 中規模・中リスクのハイブリッドプロジェクトに適用'}
              {governanceStrength[0] >= 67 && ' 大規模・高リスクの従来型プロジェクトに適用'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 構成要素選択 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building className='h-5 w-5 text-green-600' />
            ガバナンス構成要素の選択
          </CardTitle>
          <CardDescription>プロジェクトに必要なガバナンス要素を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {governanceComponents.map((component) => {
              const IconComponent = component.icon
              const isSelected = selectedComponents.has(component.id)
              const strengthLevel = getStrengthLevel(governanceStrength[0])

              return (
                <Card
                  key={component.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${component.required ? 'ring-2 ring-yellow-200' : ''}`}
                  onClick={() => !component.required && toggleComponent(component.id)}
                >
                  <CardContent className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => !component.required && toggleComponent(component.id)}
                          disabled={component.required}
                        />
                        <IconComponent className='h-5 w-5 text-blue-600' />
                      </div>
                      <div className='flex gap-1'>
                        <CategoryBadge category={component.category} />
                        {component.required && (
                          <Badge variant='destructive' className='text-xs'>
                            必須
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className='mb-2 font-medium text-gray-900'>{component.name}</h3>
                    <p className='mb-3 text-xs text-gray-600'>{component.description}</p>
                    {isSelected && (
                      <div className='rounded-md bg-white p-2'>
                        <p className='text-xs font-medium text-gray-700'>
                          実装内容：{component.strength[strengthLevel]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              選択済み：{selectedComponents.size} / {governanceComponents.length} 要素
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setSelectedComponents(new Set())} size='sm'>
                <RefreshCw className='mr-1 h-4 w-4' />
                リセット
              </Button>
              <Button onClick={exportFramework} disabled={selectedComponents.size === 0} size='sm'>
                <Download className='mr-1 h-4 w-4' />
                エクスポート
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フレームワーク詳細 */}
      {selectedComponents.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-indigo-600' />
              フレームワーク概要
            </CardTitle>
            <CardDescription>設計されたガバナンスフレームワークの詳細</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-lg bg-blue-50 p-4'>
                <div className='text-2xl font-bold text-blue-700'>{selectedComponents.size}</div>
                <div className='text-sm text-blue-600'>選択要素数</div>
              </div>
              <div className='rounded-lg bg-purple-50 p-4'>
                <div className={`text-2xl font-bold ${getStrengthColor(governanceStrength[0])}`}>
                  {governanceStrength[0]}%
                </div>
                <div className='text-sm text-purple-600'>ガバナンス強度</div>
              </div>
              <div className='rounded-lg bg-green-50 p-4'>
                <div className='text-2xl font-bold text-green-700'>
                  {
                    Array.from(selectedComponents).filter(
                      (id) => governanceComponents.find((c) => c.id === id)?.required
                    ).length
                  }
                </div>
                <div className='text-sm text-green-600'>必須要素数</div>
              </div>
            </div>

            <Alert>
              <Lightbulb className='h-4 w-4' />
              <AlertDescription>
                このフレームワークは{getStrengthLabel(governanceStrength[0])}
                レベルのガバナンスを提供し、
                {selectedComponents.size}個の要素を含んでいます。
                プロジェクトの進行に合わせて要素の追加や調整を検討してください。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GovernanceFramework
