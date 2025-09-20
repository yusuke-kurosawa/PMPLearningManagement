import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { Checkbox } from '../ui/checkbox'
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Scale,
  BookOpen,
  Users,
  Target,
  Settings,
  TrendingUp,
  Globe,
  Building,
  Zap,
  ArrowRight,
  HelpCircle,
  ClipboardCheck,
  BarChart3,
  Eye,
  Star,
  Activity,
  Clock,
  Award,
  Search,
  Filter,
  Download,
  Upload,
} from 'lucide-react'

// 型定義
interface ComplianceRequirement {
  id: string
  name: string
  category: 'internal' | 'external'
  type: 'legal' | 'regulatory' | 'quality' | 'process' | 'security' | 'environmental'
  priority: 'high' | 'medium' | 'low'
  description: string
  examples: string[]
  impacts: string[]
  monitoring: string[]
  ecoScope: string[]
}

interface ComplianceThreat {
  id: string
  name: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  probability: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'
  impact: string[]
  mitigation: string[]
  investigation: string[]
}

interface BestPractice {
  id: string
  title: string
  description: string
  steps: string[]
  benefits: string[]
  tools: string[]
  examples: string[]
}

interface ComplianceRisk {
  id: string
  name: string
  category: string
  description: string
  impact: 'high' | 'medium' | 'low'
  probability: 'high' | 'medium' | 'low'
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored'
  owner: string
  mitigation: string
  dueDate: string
}

interface ProjectComplianceProps {
  className?: string
}

const ProjectCompliance: React.FC<ProjectComplianceProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [assessmentProgress, setAssessmentProgress] = useState(0)
  const [completedAssessments, setCompletedAssessments] = useState<Set<string>>(new Set())
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [complianceRisks, setComplianceRisks] = useState<ComplianceRisk[]>([])
  const [filterThreat, setFilterThreat] = useState('all')

  // コンプライアンス要件データ
  const complianceRequirements: ComplianceRequirement[] = [
    {
      id: 'legal-regulatory',
      name: '法的・規制要件',
      category: 'external',
      type: 'legal',
      priority: 'high',
      description: '政府機関や規制当局が定める法律、規制、基準への準拠',
      examples: [
        '個人情報保護法（GDPR、日本の個人情報保護法）',
        '金融規制（SOX法、金融商品取引法）',
        '労働基準法・労働安全衛生法',
        '環境規制（ISO14001、環境保護法）',
        '建築基準法・都市計画法',
        'セキュリティ規制（サイバーセキュリティ基本法）',
      ],
      impacts: ['法的責任の発生', '罰金・制裁措置', '事業許可の停止', '社会的信用の失墜'],
      monitoring: [
        '法令変更の定期チェック',
        '規制当局との連携',
        '法務部門との協議',
        '外部法律顧問の活用',
      ],
      ecoScope: ['3.1.1', '3.1.2'],
    },
    {
      id: 'quality-standards',
      name: '品質基準・標準',
      category: 'external',
      type: 'quality',
      priority: 'high',
      description: '業界標準、国際標準、品質管理システムへの準拠',
      examples: [
        'ISO 9001（品質マネジメントシステム）',
        'ISO 27001（情報セキュリティマネジメント）',
        'PMBOK、PRINCE2（プロジェクト管理標準）',
        'ITIL（ITサービス管理）',
        'IEEE標準（電気・電子工学）',
        'JIS（日本工業規格）',
      ],
      impacts: [
        '顧客満足度の向上',
        '品質の一貫性確保',
        '競争優位性の獲得',
        '認証取得による信頼性向上',
      ],
      monitoring: [
        '定期的な内部監査',
        '外部認証機関による審査',
        '品質指標の継続監視',
        '標準改訂への対応',
      ],
      ecoScope: ['3.1.1', '3.1.5'],
    },
    {
      id: 'internal-policies',
      name: '組織内部ポリシー',
      category: 'internal',
      type: 'process',
      priority: 'medium',
      description: '組織が独自に定める内部規程、ポリシー、手順書への準拠',
      examples: [
        'プロジェクト管理規程',
        '情報セキュリティポリシー',
        '人事・労務規程',
        '財務・会計規程',
        '調達・購買規程',
        'リスク管理ポリシー',
      ],
      impacts: ['組織の統制強化', 'リスクの最小化', '効率性の向上', 'ガバナンスの確保'],
      monitoring: [
        '内部監査の実施',
        'ポリシー遵守の定期確認',
        '教育・研修の実施',
        '違反事例の分析と改善',
      ],
      ecoScope: ['3.1.2'],
    },
    {
      id: 'stakeholder-agreements',
      name: 'ステークホルダー合意事項',
      category: 'internal',
      type: 'process',
      priority: 'medium',
      description: 'プロジェクトステークホルダーとの合意事項、契約条項への準拠',
      examples: [
        '顧客との契約条件',
        'サプライヤーとの調達契約',
        'パートナー企業との協定',
        '社内部門間の合意事項',
        'プロジェクト憲章の承認事項',
        'ステークホルダーとのコミット事項',
      ],
      impacts: [
        '信頼関係の維持',
        '契約違反リスクの回避',
        'プロジェクト成功の確保',
        'ステークホルダー満足度向上',
      ],
      monitoring: [
        '定期的な合意事項確認',
        'ステークホルダーレビュー',
        '契約履行状況の監視',
        '変更管理の適切な実施',
      ],
      ecoScope: ['3.1.1', '3.1.2'],
    },
    {
      id: 'security-compliance',
      name: 'セキュリティコンプライアンス',
      category: 'external',
      type: 'security',
      priority: 'high',
      description: 'サイバーセキュリティ、情報保護、物理的セキュリティへの準拠',
      examples: [
        'サイバーセキュリティフレームワーク（NIST）',
        '情報セキュリティ管理基準',
        'プライバシー保護規制',
        '機密情報管理規程',
        'アクセス制御基準',
        'インシデント対応手順',
      ],
      impacts: [
        '情報漏洩リスクの軽減',
        'サイバー攻撃への耐性向上',
        '顧客信頼の確保',
        '事業継続性の保持',
      ],
      monitoring: ['セキュリティ監査', '脆弱性評価', 'インシデント監視', 'セキュリティ教育の実施'],
      ecoScope: ['3.1.2', '3.1.5'],
    },
    {
      id: 'environmental-social',
      name: '環境・社会的責任',
      category: 'external',
      type: 'environmental',
      priority: 'medium',
      description: '環境保護、社会的責任、持続可能性への準拠',
      examples: [
        'ESG（環境・社会・ガバナンス）基準',
        'SDGs（持続可能な開発目標）',
        'カーボンニュートラル目標',
        '社会貢献活動基準',
        '人権尊重ガイドライン',
        'サプライチェーン責任基準',
      ],
      impacts: [
        '企業イメージの向上',
        '持続可能な事業運営',
        'ステークホルダーからの支持',
        '長期的競争優位性',
      ],
      monitoring: [
        'ESGスコアの追跡',
        'サステナビリティレポート',
        '第三者評価機関による評価',
        'ステークホルダーエンゲージメント',
      ],
      ecoScope: ['3.1.1', '3.1.5'],
    },
  ]

  // コンプライアンス脅威データ
  const complianceThreats: ComplianceThreat[] = [
    {
      id: 'regulatory-change',
      name: '規制変更リスク',
      description: '新しい法規制の導入や既存規制の改正によるコンプライアンス要件の変化',
      severity: 'high',
      probability: 'medium',
      impact: [
        'プロジェクト計画の大幅変更',
        '追加コストの発生',
        'スケジュール遅延',
        '再設計・再開発の必要性',
      ],
      mitigation: [
        '規制動向の継続的監視',
        '業界団体との情報共有',
        '柔軟性のある設計採用',
        '規制専門家との連携',
      ],
      investigation: [
        '規制当局からの公開情報確認',
        '業界専門家へのヒアリング',
        'パブリックコメントの分析',
        '他社の対応状況調査',
      ],
    },
    {
      id: 'compliance-violation',
      name: 'コンプライアンス違反',
      description: '意図的または意図せずに発生するコンプライアンス要件への違反',
      severity: 'critical',
      probability: 'medium',
      impact: ['法的制裁・罰金', '事業許可の停止', '顧客信頼の失墜', '競争優位性の喪失'],
      mitigation: [
        '定期的なコンプライアンス監査',
        '従業員教育の強化',
        '内部統制システムの構築',
        '違反報告制度の整備',
      ],
      investigation: [
        '内部監査による発見',
        '外部監査指摘事項',
        '従業員からの報告',
        '顧客・取引先からの指摘',
      ],
    },
    {
      id: 'documentation-gaps',
      name: '文書化不備',
      description: 'コンプライアンス要件への対応が適切に文書化されていない状況',
      severity: 'medium',
      probability: 'high',
      impact: ['監査時の説明困難', '一貫性のない対応', '知識の属人化', '改善活動の阻害'],
      mitigation: [
        '文書化基準の策定',
        '定期的な文書レビュー',
        '文書管理システムの導入',
        '責任者の明確化',
      ],
      investigation: [
        '文書管理状況の点検',
        'プロセス実行記録の確認',
        '担当者へのインタビュー',
        '業務フローの可視化',
      ],
    },
  ]

  // ベストプラクティスデータ
  const bestPractices: BestPractice[] = [
    {
      id: 'proactive-identification',
      title: 'プロアクティブな要件特定',
      description: 'プロジェクト初期段階でのコンプライアンス要件の網羅的特定',
      steps: [
        '業界標準・規制のリサーチ',
        'ステークホルダーとの要件確認',
        '専門家・法務部門との協議',
        'チェックリストの作成と活用',
        '定期的な要件見直し',
      ],
      benefits: [
        '後戻り工数の削減',
        'リスクの早期発見',
        'ステークホルダー信頼の確保',
        'プロジェクト成功率の向上',
      ],
      tools: [
        'コンプライアンスチェックリスト',
        '規制データベース',
        'ステークホルダーマップ',
        'リスクレジスター',
      ],
      examples: [
        '金融システム開発での規制調査',
        '医療機器開発での安全基準確認',
        '個人情報処理システムでのプライバシー要件',
        '国際プロジェクトでの各国法令調査',
      ],
    },
    {
      id: 'systematic-monitoring',
      title: '体系的なモニタリング',
      description: 'コンプライアンス状況の継続的監視と評価システムの構築',
      steps: [
        'KPIとメトリクスの設定',
        '監視ツールの導入',
        '定期レビューサイクルの確立',
        '異常検知アラートの設定',
        '改善アクションの実行',
      ],
      benefits: ['問題の早期発見', '継続的改善の実現', '客観的な評価', '予防的対策の実施'],
      tools: ['ダッシュボード', 'モニタリングツール', '監査システム', 'レポーティングツール'],
      examples: [
        'セキュリティコンプライアンスの自動監視',
        '品質基準への適合度測定',
        '契約条件の履行状況追跡',
        '規制変更の影響度評価',
      ],
    },
    {
      id: 'stakeholder-engagement',
      title: 'ステークホルダーエンゲージメント',
      description: 'コンプライアンス関連ステークホルダーとの効果的な連携',
      steps: [
        'ステークホルダーの特定と分析',
        'コミュニケーション計画の策定',
        '定期的な情報共有',
        'フィードバックの収集と活用',
        '関係性の継続的維持',
      ],
      benefits: ['要件理解の深化', '協力関係の構築', '問題解決の迅速化', '信頼関係の強化'],
      tools: [
        'ステークホルダーマップ',
        'コミュニケーション計画',
        '会議体の設置',
        'フィードバックシステム',
      ],
      examples: [
        '規制当局との定期対話',
        '顧客との要件確認会議',
        '法務部門との協議体制',
        '業界団体での情報交換',
      ],
    },
    {
      id: 'documentation-management',
      title: '文書化と記録管理',
      description: 'コンプライアンス対応の適切な文書化と記録の管理',
      steps: [
        '文書化基準の策定',
        'テンプレートの標準化',
        '承認プロセスの確立',
        'バージョン管理の実施',
        '定期的な文書レビュー',
      ],
      benefits: ['監査対応の円滑化', '知識の共有と継承', '一貫性のある対応', '改善活動の促進'],
      tools: ['文書管理システム', 'テンプレート集', 'バージョン管理ツール', 'レビューシステム'],
      examples: [
        'コンプライアンス対応記録',
        '監査報告書の管理',
        '手順書の標準化',
        '教育資料の整備',
      ],
    },
    {
      id: 'continuous-improvement',
      title: '継続的改善',
      description: 'コンプライアンス管理の継続的な改善と最適化',
      steps: [
        '現状分析と課題特定',
        '改善目標の設定',
        '改善計画の策定と実行',
        '効果測定と評価',
        '知見の組織的共有',
      ],
      benefits: ['コンプライアンス水準の向上', '効率性の改善', 'リスク低減', '組織能力の強化'],
      tools: ['改善管理システム', 'KPI監視ツール', 'ベンチマーキング', 'ナレッジベース'],
      examples: [
        'プロセス改善活動',
        'ツール導入による効率化',
        'ベストプラクティスの共有',
        '教育プログラムの改善',
      ],
    },
  ]

  // 初期のリスクレジスターデータ
  const initialComplianceRisks: ComplianceRisk[] = [
    {
      id: 'risk-001',
      name: '新規制への対応遅れ',
      category: '法的・規制要件',
      description: '新しいデータ保護規制の施行に対する対応が遅れるリスク',
      impact: 'high',
      probability: 'medium',
      status: 'identified',
      owner: '法務部門',
      mitigation: '規制動向の継続監視と早期対応体制の構築',
      dueDate: '2024-03-31',
    },
    {
      id: 'risk-002',
      name: 'セキュリティ基準の未充足',
      category: 'セキュリティコンプライアンス',
      description: 'ISO27001要求事項への対応が不十分なリスク',
      impact: 'medium',
      probability: 'high',
      status: 'assessed',
      owner: 'IT部門',
      mitigation: 'セキュリティ対策の強化と認証取得の推進',
      dueDate: '2024-06-30',
    },
  ]

  useEffect(() => {
    // 初期リスクデータの設定
    if (complianceRisks.length === 0) {
      setComplianceRisks(initialComplianceRisks)
    }

    // 進捗の計算
    const totalItems = complianceRequirements.length
    const progress = (completedAssessments.size / totalItems) * 100
    setAssessmentProgress(progress)
  }, [completedAssessments])

  // アセスメント完了の処理
  const markAssessmentComplete = (requirementId: string) => {
    setCompletedAssessments((prev) => new Set([...prev, requirementId]))
  }

  // チェックボックス処理
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }

  // カテゴリーフィルター
  const filteredRequirements = selectedCategory
    ? complianceRequirements.filter((req) => req.category === selectedCategory)
    : complianceRequirements

  // 脅威フィルター
  const filteredThreats =
    filterThreat === 'all'
      ? complianceThreats
      : complianceThreats.filter((threat) => threat.severity === filterThreat)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${className}`}>
      <div className='mx-auto max-w-7xl'>
        {/* ヘッダー */}
        <div className='mb-8 text-center'>
          <div className='mb-4 inline-flex items-center justify-center rounded-full bg-blue-600 p-3 text-white'>
            <Shield className='h-8 w-8' />
          </div>
          <h1 className='mb-2 text-4xl font-bold text-gray-900'>
            プロジェクトコンプライアンス学習
          </h1>
          <p className='mx-auto max-w-4xl text-lg text-gray-600'>
            プロジェクトにおけるコンプライアンス管理の理論と実践を学習し、
            効果的なコンプライアンス体制の構築方法を習得します。
          </p>

          {/* 進捗表示 */}
          <div className='mx-auto mt-6 max-w-md'>
            <div className='mb-2 flex justify-between text-sm text-gray-600'>
              <span>学習進捗</span>
              <span>{Math.round(assessmentProgress)}%</span>
            </div>
            <Progress value={assessmentProgress} className='h-2' />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='overview'>概要</TabsTrigger>
            <TabsTrigger value='requirements'>要件管理</TabsTrigger>
            <TabsTrigger value='threats'>脅威調査</TabsTrigger>
            <TabsTrigger value='practices'>ベストプラクティス</TabsTrigger>
            <TabsTrigger value='register'>リスクレジスター</TabsTrigger>
            <TabsTrigger value='assessment'>評価ツール</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value='overview' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5 text-blue-600' />
                  プロジェクトコンプライアンスとは
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <Alert>
                  <Scale className='h-4 w-4' />
                  <AlertDescription>
                    <strong>プロジェクトコンプライアンス：</strong>
                    プロジェクトの実行において、法的要件、規制、組織のポリシー、
                    ステークホルダーとの合意事項に準拠することを確保する活動です。
                  </AlertDescription>
                </Alert>

                <div className='grid gap-4 md:grid-cols-2'>
                  <Card className='border-blue-200'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg text-blue-700'>内部要件</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Building className='h-4 w-4 text-blue-600' />
                        <span className='text-sm'>組織のポリシーと手順</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-blue-600' />
                        <span className='text-sm'>ステークホルダー合意事項</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Target className='h-4 w-4 text-blue-600' />
                        <span className='text-sm'>プロジェクト目標との整合</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='border-green-200'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg text-green-700'>外部要件</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Scale className='h-4 w-4 text-green-600' />
                        <span className='text-sm'>法的・規制要件</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Star className='h-4 w-4 text-green-600' />
                        <span className='text-sm'>業界標準・品質基準</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Globe className='h-4 w-4 text-green-600' />
                        <span className='text-sm'>国際基準・認証要件</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>ECO学習範囲カバレッジ</h3>
                  <div className='grid gap-4 md:grid-cols-3'>
                    <Card className='border-purple-200'>
                      <CardContent className='p-4'>
                        <Badge className='mb-2' variant='secondary'>
                          ECO 3.1.1
                        </Badge>
                        <h4 className='font-medium'>ビジネス環境の評価</h4>
                        <p className='mt-1 text-sm text-gray-600'>
                          組織の内外環境におけるコンプライアンス要件の特定
                        </p>
                      </CardContent>
                    </Card>
                    <Card className='border-purple-200'>
                      <CardContent className='p-4'>
                        <Badge className='mb-2' variant='secondary'>
                          ECO 3.1.2
                        </Badge>
                        <h4 className='font-medium'>コンプライアンス要件管理</h4>
                        <p className='mt-1 text-sm text-gray-600'>
                          プロジェクトにおけるコンプライアンス要件の管理と監視
                        </p>
                      </CardContent>
                    </Card>
                    <Card className='border-purple-200'>
                      <CardContent className='p-4'>
                        <Badge className='mb-2' variant='secondary'>
                          ECO 3.1.5
                        </Badge>
                        <h4 className='font-medium'>リスクとコンプライアンス統合</h4>
                        <p className='mt-1 text-sm text-gray-600'>
                          リスク管理とコンプライアンスの統合的アプローチ
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 要件管理タブ */}
          <TabsContent value='requirements' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ClipboardCheck className='h-5 w-5 text-purple-600' />
                  コンプライアンス要件管理
                </CardTitle>
                <div className='mt-4 flex gap-2'>
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedCategory(null)}
                  >
                    すべて
                  </Button>
                  <Button
                    variant={selectedCategory === 'internal' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedCategory('internal')}
                  >
                    内部要件
                  </Button>
                  <Button
                    variant={selectedCategory === 'external' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedCategory('external')}
                  >
                    外部要件
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {filteredRequirements.map((requirement) => (
                    <Card key={requirement.id} className='transition-all hover:shadow-md'>
                      <CardContent className='p-6'>
                        <div className='mb-4 flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`rounded-lg p-2 ${
                                requirement.category === 'internal' ? 'bg-blue-100' : 'bg-green-100'
                              }`}
                            >
                              {requirement.category === 'internal' ? (
                                <Building className='h-5 w-5 text-blue-600' />
                              ) : (
                                <Globe className='h-5 w-5 text-green-600' />
                              )}
                            </div>
                            <div>
                              <h3 className='text-lg font-semibold'>{requirement.name}</h3>
                              <p className='text-gray-600'>{requirement.description}</p>
                            </div>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Badge
                              variant={
                                requirement.category === 'internal' ? 'default' : 'secondary'
                              }
                            >
                              {requirement.category === 'internal' ? '内部' : '外部'}
                            </Badge>
                            <Badge
                              variant={
                                requirement.priority === 'high'
                                  ? 'destructive'
                                  : requirement.priority === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {requirement.priority === 'high'
                                ? '高優先度'
                                : requirement.priority === 'medium'
                                  ? '中優先度'
                                  : '低優先度'}
                            </Badge>
                          </div>
                        </div>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <h4 className='mb-2 flex items-center font-medium'>
                              <FileText className='mr-2 h-4 w-4' />
                              具体例
                            </h4>
                            <ul className='space-y-1'>
                              {requirement.examples.slice(0, 3).map((example, index) => (
                                <li key={index} className='flex items-start gap-2'>
                                  <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                                  <span className='text-sm'>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className='mb-2 flex items-center font-medium'>
                              <AlertTriangle className='mr-2 h-4 w-4' />
                              影響
                            </h4>
                            <ul className='space-y-1'>
                              {requirement.impacts.slice(0, 3).map((impact, index) => (
                                <li key={index} className='flex items-start gap-2'>
                                  <ArrowRight className='mt-0.5 h-4 w-4 text-orange-500' />
                                  <span className='text-sm'>{impact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className='mt-4 flex items-center justify-between'>
                          <div className='flex gap-2'>
                            {requirement.ecoScope.map((scope) => (
                              <Badge key={scope} variant='outline' className='text-xs'>
                                ECO {scope}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant={
                              completedAssessments.has(requirement.id) ? 'default' : 'outline'
                            }
                            size='sm'
                            onClick={() => markAssessmentComplete(requirement.id)}
                            disabled={completedAssessments.has(requirement.id)}
                          >
                            {completedAssessments.has(requirement.id) ? '評価完了' : '評価実施'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 脅威調査タブ */}
          <TabsContent value='threats' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Search className='h-5 w-5 text-red-600' />
                  コンプライアンス脅威調査
                </CardTitle>
                <div className='mt-4 flex gap-2'>
                  <Button
                    variant={filterThreat === 'all' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setFilterThreat('all')}
                  >
                    すべて
                  </Button>
                  <Button
                    variant={filterThreat === 'critical' ? 'destructive' : 'outline'}
                    size='sm'
                    onClick={() => setFilterThreat('critical')}
                  >
                    重大
                  </Button>
                  <Button
                    variant={filterThreat === 'high' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setFilterThreat('high')}
                  >
                    高
                  </Button>
                  <Button
                    variant={filterThreat === 'medium' ? 'secondary' : 'outline'}
                    size='sm'
                    onClick={() => setFilterThreat('medium')}
                  >
                    中
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {filteredThreats.map((threat) => (
                    <Card
                      key={threat.id}
                      className={`border-l-4 ${
                        threat.severity === 'critical'
                          ? 'border-l-red-500'
                          : threat.severity === 'high'
                            ? 'border-l-orange-500'
                            : threat.severity === 'medium'
                              ? 'border-l-yellow-500'
                              : 'border-l-green-500'
                      }`}
                    >
                      <CardContent className='p-6'>
                        <div className='mb-4 flex items-start justify-between'>
                          <div>
                            <h3 className='text-lg font-semibold'>{threat.name}</h3>
                            <p className='mt-1 text-gray-600'>{threat.description}</p>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Badge
                              variant={
                                threat.severity === 'critical'
                                  ? 'destructive'
                                  : threat.severity === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {threat.severity === 'critical'
                                ? '重大'
                                : threat.severity === 'high'
                                  ? '高'
                                  : threat.severity === 'medium'
                                    ? '中'
                                    : '低'}
                            </Badge>
                            <Badge variant='outline'>
                              発生確率:{' '}
                              {threat.probability === 'very_high'
                                ? '非常に高'
                                : threat.probability === 'high'
                                  ? '高'
                                  : threat.probability === 'medium'
                                    ? '中'
                                    : threat.probability === 'low'
                                      ? '低'
                                      : '非常に低'}
                            </Badge>
                          </div>
                        </div>

                        <div className='grid gap-4 md:grid-cols-3'>
                          <div>
                            <h4 className='mb-2 flex items-center font-medium'>
                              <AlertTriangle className='mr-2 h-4 w-4 text-red-500' />
                              影響
                            </h4>
                            <ul className='space-y-1'>
                              {threat.impact.map((impact, index) => (
                                <li key={index} className='text-sm'>
                                  {impact}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className='mb-2 flex items-center font-medium'>
                              <Shield className='mr-2 h-4 w-4 text-blue-500' />
                              対策
                            </h4>
                            <ul className='space-y-1'>
                              {threat.mitigation.map((mitigation, index) => (
                                <li key={index} className='text-sm'>
                                  {mitigation}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className='mb-2 flex items-center font-medium'>
                              <Search className='mr-2 h-4 w-4 text-green-500' />
                              調査方法
                            </h4>
                            <ul className='space-y-1'>
                              {threat.investigation.map((method, index) => (
                                <li key={index} className='text-sm'>
                                  {method}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ベストプラクティスタブ */}
          <TabsContent value='practices' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Star className='h-5 w-5 text-yellow-600' />
                  コンプライアンス管理ベストプラクティス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {bestPractices.map((practice, index) => (
                    <Card key={practice.id} className='border-2 border-gray-200'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-3'>
                          <div className='rounded-full bg-yellow-100 p-2'>
                            <span className='font-bold text-yellow-600'>{index + 1}</span>
                          </div>
                          {practice.title}
                        </CardTitle>
                        <p className='text-gray-600'>{practice.description}</p>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <h4 className='mb-3 flex items-center font-medium'>
                              <Settings className='mr-2 h-4 w-4' />
                              実装ステップ
                            </h4>
                            <ol className='space-y-2'>
                              {practice.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className='flex items-start gap-2'>
                                  <span className='rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600'>
                                    {stepIndex + 1}
                                  </span>
                                  <span className='text-sm'>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <h4 className='mb-3 flex items-center font-medium'>
                              <TrendingUp className='mr-2 h-4 w-4' />
                              期待される効果
                            </h4>
                            <ul className='space-y-2'>
                              {practice.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className='flex items-start gap-2'>
                                  <CheckCircle className='mt-0.5 h-4 w-4 text-green-500' />
                                  <span className='text-sm'>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <div>
                            <h4 className='mb-3 flex items-center font-medium'>
                              <Zap className='mr-2 h-4 w-4' />
                              活用ツール
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {practice.tools.map((tool, toolIndex) => (
                                <Badge key={toolIndex} variant='outline'>
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className='mb-3 flex items-center font-medium'>
                              <FileText className='mr-2 h-4 w-4' />
                              適用例
                            </h4>
                            <div className='space-y-1'>
                              {practice.examples.slice(0, 2).map((example, exampleIndex) => (
                                <div key={exampleIndex} className='text-sm text-gray-600'>
                                  • {example}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* リスクレジスタータブ */}
          <TabsContent value='register' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 text-indigo-600' />
                  コンプライアンスリスクレジスター
                </CardTitle>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outline'>
                    <Upload className='mr-2 h-4 w-4' />
                    インポート
                  </Button>
                  <Button size='sm' variant='outline'>
                    <Download className='mr-2 h-4 w-4' />
                    エクスポート
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {complianceRisks.map((risk) => (
                    <Card key={risk.id} className='border-l-4 border-l-indigo-500'>
                      <CardContent className='p-4'>
                        <div className='mb-3 flex items-start justify-between'>
                          <div>
                            <h4 className='font-semibold'>{risk.name}</h4>
                            <p className='mt-1 text-sm text-gray-600'>{risk.description}</p>
                          </div>
                          <div className='flex flex-col gap-1'>
                            <Badge
                              variant={
                                risk.status === 'identified'
                                  ? 'secondary'
                                  : risk.status === 'assessed'
                                    ? 'default'
                                    : risk.status === 'mitigated'
                                      ? 'outline'
                                      : 'destructive'
                              }
                            >
                              {risk.status === 'identified'
                                ? '特定済み'
                                : risk.status === 'assessed'
                                  ? '評価済み'
                                  : risk.status === 'mitigated'
                                    ? '対策済み'
                                    : '監視中'}
                            </Badge>
                          </div>
                        </div>

                        <div className='grid gap-3 text-sm md:grid-cols-4'>
                          <div>
                            <span className='font-medium'>カテゴリー:</span>
                            <div>{risk.category}</div>
                          </div>
                          <div>
                            <span className='font-medium'>影響度:</span>
                            <Badge
                              variant={
                                risk.impact === 'high'
                                  ? 'destructive'
                                  : risk.impact === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {risk.impact === 'high'
                                ? '高'
                                : risk.impact === 'medium'
                                  ? '中'
                                  : '低'}
                            </Badge>
                          </div>
                          <div>
                            <span className='font-medium'>確率:</span>
                            <Badge
                              variant={
                                risk.probability === 'high'
                                  ? 'destructive'
                                  : risk.probability === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {risk.probability === 'high'
                                ? '高'
                                : risk.probability === 'medium'
                                  ? '中'
                                  : '低'}
                            </Badge>
                          </div>
                          <div>
                            <span className='font-medium'>担当者:</span>
                            <div>{risk.owner}</div>
                          </div>
                        </div>

                        <div className='mt-3 border-t border-gray-200 pt-3'>
                          <div className='grid gap-3 text-sm md:grid-cols-2'>
                            <div>
                              <span className='font-medium'>対策:</span>
                              <div className='text-gray-600'>{risk.mitigation}</div>
                            </div>
                            <div>
                              <span className='font-medium'>期限:</span>
                              <div className='flex items-center gap-2'>
                                <Clock className='h-3 w-3' />
                                {risk.dueDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 評価ツールタブ */}
          <TabsContent value='assessment' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5 text-green-600' />
                  コンプライアンス評価ツール
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <Alert>
                    <HelpCircle className='h-4 w-4' />
                    <AlertDescription>
                      以下のチェックリストを使用して、プロジェクトのコンプライアンス状況を評価してください。
                    </AlertDescription>
                  </Alert>

                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>コンプライアンスチェックリスト</h3>

                    {[
                      '適用される法的・規制要件をすべて特定している',
                      '業界標準・品質基準への準拠が確認されている',
                      '組織の内部ポリシーとの整合性が取れている',
                      'ステークホルダーとの合意事項が文書化されている',
                      'コンプライアンス違反リスクが評価されている',
                      '監視・モニタリング体制が構築されている',
                      '教育・研修プログラムが実施されている',
                      '違反時の対応手順が明確化されている',
                      '定期的なレビューサイクルが確立されている',
                      '継続的改善の仕組みがある',
                    ].map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center space-x-3 rounded-lg border p-3'
                      >
                        <Checkbox
                          id={`checklist-${index}`}
                          checked={checkedItems.has(`checklist-${index}`)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(`checklist-${index}`, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`checklist-${index}`}
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 rounded-lg bg-blue-50 p-4'>
                    <h4 className='mb-2 font-semibold text-blue-900'>評価結果</h4>
                    <div className='flex items-center gap-4'>
                      <div className='text-2xl font-bold text-blue-600'>{checkedItems.size}/10</div>
                      <div className='flex-1'>
                        <Progress value={(checkedItems.size / 10) * 100} className='h-2' />
                      </div>
                      <div className='text-sm text-blue-600'>
                        {Math.round((checkedItems.size / 10) * 100)}%
                      </div>
                    </div>
                    <p className='mt-2 text-sm text-blue-800'>
                      {checkedItems.size < 7
                        ? 'コンプライアンス体制の改善が必要です'
                        : checkedItems.size < 9
                          ? '良好なコンプライアンス体制ですが、さらなる改善余地があります'
                          : '優秀なコンプライアンス体制が構築されています'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProjectCompliance
