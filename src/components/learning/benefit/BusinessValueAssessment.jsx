import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Alert, AlertDescription } from '../../ui/alert'
import { Slider } from '../../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import {
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Calculator,
  Target,
  AlertTriangle,
} from 'lucide-react'

const BusinessValueAssessment = () => {
  const [assessmentData, setAssessmentData] = useState({
    financial: { impact: 50, confidence: 50, timeline: 'medium' },
    strategic: { impact: 50, confidence: 50, timeline: 'medium' },
    social: { impact: 50, confidence: 50, timeline: 'medium' },
    operational: { impact: 50, confidence: 50, timeline: 'medium' },
    compliance: { impact: 50, confidence: 50, timeline: 'medium' },
    market: { impact: 50, confidence: 50, timeline: 'medium' },
  })
  
  const [selectedStakeholder, setSelectedStakeholder] = useState('all')
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const valueCategories = [
    {
      id: 'financial',
      name: '財務的価値',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '収益増加、コスト削減、投資効率',
      metrics: ['ROI', 'NPV', 'IRR', '回収期間'],
    },
    {
      id: 'strategic',
      name: '戦略的価値',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '競争優位性、市場地位、ブランド価値',
      metrics: ['市場シェア', 'ブランド価値', '競争優位性', 'イノベーション指数'],
    },
    {
      id: 'social',
      name: '社会的価値',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'CSR、持続可能性、社会貢献',
      metrics: ['ESGスコア', 'カーボンフットプリント', '社会的インパクト', '従業員満足度'],
    },
    {
      id: 'operational',
      name: '運用価値',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: '業務効率、品質向上、プロセス改善',
      metrics: ['効率性比率', '品質スコア', '処理時間', 'エラー率'],
    },
    {
      id: 'compliance',
      name: 'コンプライアンス価値',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '規制遵守、リスク軽減、セキュリティ',
      metrics: ['準拠率', 'リスクスコア', 'セキュリティ指数', '監査結果'],
    },
    {
      id: 'market',
      name: '市場価値',
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: '顧客満足度、市場機会、競争力',
      metrics: ['顧客満足度', '市場機会', 'NPS', '顧客維持率'],
    },
  ]

  const stakeholders = [
    { id: 'all', name: '全体評価' },
    { id: 'executives', name: '経営陣' },
    { id: 'customers', name: '顧客' },
    { id: 'employees', name: '従業員' },
    { id: 'investors', name: '投資家' },
    { id: 'partners', name: 'パートナー' },
    { id: 'community', name: '地域社会' },
  ]

  const timelineOptions = [
    { value: 'short', label: '短期 (0-1年)', multiplier: 1.2 },
    { value: 'medium', label: '中期 (1-3年)', multiplier: 1.0 },
    { value: 'long', label: '長期 (3年以上)', multiplier: 0.8 },
  ]

  const updateAssessment = (category, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const calculateAssessment = () => {
    const results = {}
    let totalScore = 0
    let totalWeight = 0

    Object.entries(assessmentData).forEach(([category, data]) => {
      const timelineMultiplier = timelineOptions.find(t => t.value === data.timeline)?.multiplier || 1.0
      const categoryScore = (data.impact * data.confidence / 100) * timelineMultiplier
      const weight = data.impact / 100
      
      results[category] = {
        score: categoryScore,
        normalizedScore: Math.min(100, categoryScore),
        weight: weight,
        risk: 100 - data.confidence,
        timeline: data.timeline,
      }
      
      totalScore += categoryScore * weight
      totalWeight += weight
    })

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0
    const riskProfile = Object.values(results).reduce((acc, cat) => acc + cat.risk, 0) / 6

    setAssessmentResults({
      categories: results,
      overallScore: Math.min(100, overallScore),
      riskProfile,
      recommendation: getRecommendation(overallScore, riskProfile),
    })
    setShowResults(true)
  }

  const getRecommendation = (score, risk) => {
    if (score >= 80 && risk <= 30) {
      return {
        level: 'excellent',
        title: '優秀',
        description: '非常に魅力的なプロジェクト提案です。すぐに実行を推奨します。',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    } else if (score >= 60 && risk <= 50) {
      return {
        level: 'good',
        title: '良好',
        description: 'プロジェクトの実行を推奨しますが、リスク軽減策を検討してください。',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      }
    } else if (score >= 40) {
      return {
        level: 'moderate',
        title: '要検討',
        description: 'プロジェクトの価値提案を見直し、改善が必要です。',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      }
    } else {
      return {
        level: 'poor',
        title: '再検討',
        description: 'プロジェクトの大幅な見直しまたは中止を検討してください。',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }
  }

  const resetAssessment = () => {
    setAssessmentData({
      financial: { impact: 50, confidence: 50, timeline: 'medium' },
      strategic: { impact: 50, confidence: 50, timeline: 'medium' },
      social: { impact: 50, confidence: 50, timeline: 'medium' },
      operational: { impact: 50, confidence: 50, timeline: 'medium' },
      compliance: { impact: 50, confidence: 50, timeline: 'medium' },
      market: { impact: 50, confidence: 50, timeline: 'medium' },
    })
    setShowResults(false)
    setAssessmentResults(null)
  }

  const exportResults = () => {
    if (!assessmentResults) return

    const exportData = {
      timestamp: new Date().toISOString(),
      stakeholder: selectedStakeholder,
      assessmentData,
      results: assessmentResults,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-value-assessment-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          ビジネス価値評価ツール
        </CardTitle>
        <CardDescription>
          プロジェクトの多面的な価値を定量的に評価し、意思決定を支援
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ステークホルダー選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">評価視点</label>
          <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
            <SelectTrigger>
              <SelectValue placeholder="ステークホルダーを選択" />
            </SelectTrigger>
            <SelectContent>
              {stakeholders.map((stakeholder) => (
                <SelectItem key={stakeholder.id} value={stakeholder.id}>
                  {stakeholder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 価値カテゴリー評価 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">価値カテゴリー評価</h3>
          {valueCategories.map((category) => {
            const IconComponent = category.icon
            const data = assessmentData[category.id]
            
            return (
              <Card key={category.id} className={`${category.bgColor} border-l-4 border-l-current ${category.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${category.color}`} />
                    <div>
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                      <CardDescription className="text-xs">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* インパクト */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        インパクト: {data.impact}%
                      </label>
                      <Slider
                        value={[data.impact]}
                        onValueChange={(value) => updateAssessment(category.id, 'impact', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* 確信度 */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">
                        確信度: {data.confidence}%
                      </label>
                      <Slider
                        value={[data.confidence]}
                        onValueChange={(value) => updateAssessment(category.id, 'confidence', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    
                    {/* タイムライン */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">実現時期</label>
                      <Select
                        value={data.timeline}
                        onValueChange={(value) => updateAssessment(category.id, 'timeline', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timelineOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={calculateAssessment} className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            評価実行
          </Button>
          <Button variant="outline" onClick={resetAssessment} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            リセット
          </Button>
          {showResults && (
            <Button variant="outline" onClick={exportResults} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              結果エクスポート
            </Button>
          )}
        </div>

        {/* 評価結果 */}
        {showResults && assessmentResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">評価結果</h3>
            
            {/* 総合スコア */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>総合価値スコア</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {Math.round(assessmentResults.overallScore)}点
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={assessmentResults.overallScore} className="h-3 mb-4" />
                <Alert className={assessmentResults.recommendation.bgColor}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong className={assessmentResults.recommendation.color}>
                      {assessmentResults.recommendation.title}
                    </strong>
                    <br />
                    {assessmentResults.recommendation.description}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* カテゴリー別結果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  カテゴリー別スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(assessmentResults.categories).map(([categoryId, result]) => {
                    const category = valueCategories.find(c => c.id === categoryId)
                    const IconComponent = category.icon
                    
                    return (
                      <div key={categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-4 w-4 ${category.color}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress value={result.normalizedScore} className="h-2" />
                          </div>
                          <Badge variant="outline" className="min-w-12 text-center">
                            {Math.round(result.normalizedScore)}
                          </Badge>
                          {result.risk > 50 && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* リスクプロファイル */}
            <Card>
              <CardHeader>
                <CardTitle>リスクプロファイル</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={assessmentResults.riskProfile} className="flex-1 h-3" />
                  <Badge variant={assessmentResults.riskProfile > 60 ? "destructive" : assessmentResults.riskProfile > 30 ? "secondary" : "default"}>
                    {Math.round(assessmentResults.riskProfile)}% リスク
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {assessmentResults.riskProfile > 60 ? "高リスク - リスク軽減策の検討が必要" :
                   assessmentResults.riskProfile > 30 ? "中リスク - 慎重な監視が推奨" :
                   "低リスク - リスクは管理可能"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(BusinessValueAssessment)