import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  FileText,
  Users,
  Star,
  ArrowRight,
  Settings,
} from 'lucide-react'
import {
  analysisFrameworks,
  strategicAlignmentCriteria,
  StrategicAlignment as StrategicAlignmentType,
} from '../../data/pmbok/strategicAlignmentData'

interface StrategicAlignmentProps {
  className?: string
}

const StrategicAlignment: React.FC<StrategicAlignmentProps> = ({ className = '' }) => {
  const [selectedFramework, setSelectedFramework] = useState(analysisFrameworks[0].id)
  const [assessmentMode, setAssessmentMode] = useState(false)
  const [projectAssessment, setProjectAssessment] =
    useState<Partial<StrategicAlignmentType> | null>(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: string]: number }>({})

  const selectedFrameworkData = analysisFrameworks.find((fw) => fw.id === selectedFramework)

  // 戦略適合性評価の開始
  const startAssessment = () => {
    setAssessmentMode(true)
    setAssessmentAnswers({})
  }

  // 評価質問への回答
  const answerCriteria = (criteriaId: string, score: number) => {
    setAssessmentAnswers((prev) => ({
      ...prev,
      [criteriaId]: score,
    }))
  }

  // 評価完了処理
  const completeAssessment = () => {
    const criteriaEntries = Object.entries(strategicAlignmentCriteria)
    const alignmentAreas = criteriaEntries.map(([key, criteria]) => {
      const score = assessmentAnswers[key] || 0
      return {
        area: criteria.name,
        score: score * 20, // 5点スケールを100点スケールに変換
        comments: getScoreComment(score),
      }
    })

    const overallScore = alignmentAreas.reduce((sum, area) => {
      const weight =
        strategicAlignmentCriteria[
          area.area.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof strategicAlignmentCriteria
        ]?.weight || 0.2
      return sum + area.score * weight
    }, 0)

    const assessment: StrategicAlignmentType = {
      id: `assessment-${Date.now()}`,
      projectId: 'current-project',
      organizationStrategy: 'デジタル変革とイノベーション推進',
      alignmentScore: overallScore,
      alignmentAreas,
      recommendations: generateRecommendations(alignmentAreas),
      riskFactors: generateRiskFactors(alignmentAreas),
      successFactors: generateSuccessFactors(alignmentAreas),
    }

    setProjectAssessment(assessment)
    setAssessmentMode(false)
  }

  const getScoreComment = (score: number): string => {
    if (score >= 4) {
      return '非常に良好'
    }
    if (score >= 3) {
      return '良好'
    }
    if (score >= 2) {
      return '改善の余地あり'
    }
    return '大幅な改善が必要'
  }

  const generateRecommendations = (areas: any[]): string[] => {
    const recommendations: string[] = []
    areas.forEach((area) => {
      if (area.score < 60) {
        recommendations.push(`${area.area}の強化: 具体的な改善計画の策定と実行が必要です。`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('現在の戦略適合性は良好です。継続的なモニタリングを行ってください。')
    }

    return recommendations
  }

  const generateRiskFactors = (areas: any[]): string[] => {
    const riskFactors: string[] = []
    areas.forEach((area) => {
      if (area.score < 40) {
        riskFactors.push(`${area.area}の低評価により、プロジェクト成功に重大なリスクがあります。`)
      }
    })
    return riskFactors
  }

  const generateSuccessFactors = (areas: any[]): string[] => {
    const successFactors: string[] = []
    areas.forEach((area) => {
      if (area.score >= 80) {
        successFactors.push(`${area.area}の高い適合性がプロジェクト成功を支援します。`)
      }
    })
    return successFactors
  }

  // フレームワーク詳細表示コンポーネント
  const FrameworkDetail: React.FC<{ framework: any }> = ({ framework }) => {
    return (
      <div className='space-y-6'>
        <Alert>
          <Target className='h-4 w-4' />
          <AlertDescription>
            <strong>目的:</strong> {framework.purpose}
          </AlertDescription>
        </Alert>

        <div>
          <h3 className='mb-4 text-lg font-semibold'>構成要素</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {framework.components.map((component: any, index: number) => (
              <Card key={index}>
                <CardContent className='p-4'>
                  <h4 className='mb-2 font-semibold'>{component.name}</h4>
                  <p className='mb-3 text-sm text-gray-600'>{component.description}</p>
                  <div>
                    <p className='mb-1 text-xs font-medium text-gray-500'>例:</p>
                    <ul className='space-y-1 text-xs text-gray-600'>
                      {component.examples.slice(0, 3).map((example: string, i: number) => (
                        <li key={i} className='flex items-center'>
                          <span className='mr-2 h-1 w-1 rounded-full bg-blue-500'></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div>
            <h4 className='mb-3 flex items-center font-semibold text-green-600'>
              <CheckCircle className='mr-2 h-4 w-4' />
              メリット
            </h4>
            <ul className='space-y-2'>
              {framework.pros.map((pro: string, index: number) => (
                <li key={index} className='flex items-center text-sm'>
                  <CheckCircle className='mr-2 h-3 w-3 text-green-500' />
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='mb-3 flex items-center font-semibold text-orange-600'>
              <AlertTriangle className='mr-2 h-4 w-4' />
              注意点
            </h4>
            <ul className='space-y-2'>
              {framework.cons.map((con: string, index: number) => (
                <li key={index} className='flex items-center text-sm'>
                  <AlertTriangle className='mr-2 h-3 w-3 text-orange-500' />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-semibold'>適用ステップ</h4>
          <div className='space-y-3'>
            {framework.applicationSteps.map((step: string, index: number) => (
              <div key={index} className='flex items-start space-x-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800'>
                  {index + 1}
                </div>
                <p className='text-sm'>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-semibold'>最適な使用場面</h4>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {framework.bestUseCases.map((useCase: string, index: number) => (
              <Card key={index} className='bg-blue-50'>
                <CardContent className='p-3'>
                  <div className='flex items-center space-x-2'>
                    <Star className='h-4 w-4 text-blue-600' />
                    <span className='text-sm'>{useCase}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 戦略適合性評価コンポーネント
  const AlignmentAssessment: React.FC = () => {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <h3 className='mb-2 text-xl font-semibold'>戦略適合性評価</h3>
          <p className='text-gray-600'>
            各評価項目について、現在のプロジェクトの状況を評価してください。
          </p>
        </div>

        {Object.entries(strategicAlignmentCriteria).map(([key, criteria]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className='text-lg'>{criteria.name}</CardTitle>
              <p className='text-sm text-gray-600'>{criteria.description}</p>
              <Badge variant='secondary'>重要度: {Math.round(criteria.weight * 100)}%</Badge>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <p className='text-sm font-medium'>評価基準:</p>
                <ul className='space-y-1 text-sm text-gray-600'>
                  {criteria.criteria.map((criterion, index) => (
                    <li key={index} className='flex items-center'>
                      <span className='mr-2 h-1 w-1 rounded-full bg-gray-400'></span>
                      {criterion}
                    </li>
                  ))}
                </ul>

                <div className='pt-4'>
                  <p className='mb-3 text-sm font-medium'>評価スコア:</p>
                  <div className='flex space-x-2'>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        variant={assessmentAnswers[key] === score ? 'default' : 'outline'}
                        className='flex-1'
                        onClick={() => answerCriteria(key, score)}
                      >
                        <div className='text-center'>
                          <div className='font-bold'>{score}</div>
                          <div className='text-xs'>
                            {score === 1 && '低い'}
                            {score === 2 && 'やや低い'}
                            {score === 3 && '普通'}
                            {score === 4 && '高い'}
                            {score === 5 && '非常に高い'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className='flex justify-center space-x-4'>
          <Button variant='outline' onClick={() => setAssessmentMode(false)}>
            キャンセル
          </Button>
          <Button onClick={completeAssessment}>評価完了</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className='space-y-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>戦略適合とビジネス分析</h1>
        <p className='mx-auto max-w-4xl text-lg text-gray-600'>
          プロジェクトを組織戦略に適合させ、ビジネス環境を分析するためのフレームワークと評価ツールを学習します。
        </p>
      </div>

      {assessmentMode ? (
        <div className='mx-auto max-w-4xl'>
          <AlignmentAssessment />
        </div>
      ) : (
        <>
          {/* フレームワーク選択と概要 */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Settings className='h-6 w-6' />
                <span>戦略分析フレームワーク</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {analysisFrameworks.map((framework) => (
                  <Card
                    key={framework.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedFramework === framework.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedFramework(framework.id)}
                  >
                    <CardContent className='p-4'>
                      <div className='space-y-2 text-center'>
                        <h3 className='text-lg font-bold'>{framework.acronym}</h3>
                        <h4 className='font-semibold'>{framework.name}</h4>
                        <p className='text-sm text-gray-600'>{framework.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className='text-center'>
                <Button onClick={startAssessment} size='lg'>
                  <Target className='mr-2 h-4 w-4' />
                  戦略適合性評価を開始
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 選択されたフレームワークの詳細 */}
          {selectedFrameworkData && (
            <Card className='w-full'>
              <CardHeader>
                <CardTitle className='text-xl'>
                  {selectedFrameworkData.name}（{selectedFrameworkData.acronym}）
                </CardTitle>
                <p className='text-gray-600'>{selectedFrameworkData.description}</p>
              </CardHeader>
              <CardContent>
                <FrameworkDetail framework={selectedFrameworkData} />
              </CardContent>
            </Card>
          )}

          {/* 評価結果表示 */}
          {projectAssessment && (
            <div className='space-y-6'>
              {/* 総合スコア */}
              <Card className='w-full'>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <BarChart3 className='h-6 w-6' />
                    <span>戦略適合性評価結果</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
                    <Card className='text-center'>
                      <CardContent className='p-4'>
                        <div className='text-3xl font-bold text-blue-600'>
                          {Math.round(projectAssessment.alignmentScore)}
                        </div>
                        <p className='text-sm text-gray-600'>総合スコア</p>
                        <Progress value={projectAssessment.alignmentScore} className='mt-2' />
                      </CardContent>
                    </Card>

                    <Card className='text-center'>
                      <CardContent className='p-4'>
                        <div className='text-lg font-semibold text-green-600'>
                          {projectAssessment.alignmentScore >= 80
                            ? '優秀'
                            : projectAssessment.alignmentScore >= 60
                              ? '良好'
                              : projectAssessment.alignmentScore >= 40
                                ? '注意'
                                : '要改善'}
                        </div>
                        <p className='text-sm text-gray-600'>評価レベル</p>
                      </CardContent>
                    </Card>

                    <Card className='text-center'>
                      <CardContent className='p-4'>
                        <div className='text-lg font-semibold text-orange-600'>
                          {projectAssessment.riskFactors.length}
                        </div>
                        <p className='text-sm text-gray-600'>リスク要因</p>
                      </CardContent>
                    </Card>

                    <Card className='text-center'>
                      <CardContent className='p-4'>
                        <div className='text-lg font-semibold text-purple-600'>
                          {projectAssessment.successFactors.length}
                        </div>
                        <p className='text-sm text-gray-600'>成功要因</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 詳細分析 */}
                  <Tabs defaultValue='areas' className='w-full'>
                    <TabsList className='grid w-full grid-cols-3'>
                      <TabsTrigger value='areas'>領域別評価</TabsTrigger>
                      <TabsTrigger value='recommendations'>推奨事項</TabsTrigger>
                      <TabsTrigger value='factors'>要因分析</TabsTrigger>
                    </TabsList>

                    <TabsContent value='areas' className='space-y-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {projectAssessment.alignmentAreas.map((area, index) => (
                          <Card key={index}>
                            <CardContent className='p-4'>
                              <div className='mb-2 flex items-center justify-between'>
                                <h4 className='font-semibold'>{area.area}</h4>
                                <Badge
                                  variant={
                                    area.score >= 80
                                      ? 'default'
                                      : area.score >= 60
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                >
                                  {Math.round(area.score)}点
                                </Badge>
                              </div>
                              <Progress value={area.score} className='mb-2' />
                              <p className='text-sm text-gray-600'>{area.comments}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value='recommendations' className='space-y-4'>
                      {projectAssessment.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <Lightbulb className='h-4 w-4' />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </TabsContent>

                    <TabsContent value='factors' className='space-y-4'>
                      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div>
                          <h4 className='mb-3 flex items-center font-semibold text-green-600'>
                            <CheckCircle className='mr-2 h-4 w-4' />
                            成功要因
                          </h4>
                          {projectAssessment.successFactors.length > 0 ? (
                            <div className='space-y-2'>
                              {projectAssessment.successFactors.map((factor, index) => (
                                <Alert key={index} className='border-green-200'>
                                  <CheckCircle className='h-4 w-4' />
                                  <AlertDescription>{factor}</AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          ) : (
                            <p className='text-sm text-gray-600'>
                              現在、特筆すべき成功要因は特定されていません。
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className='mb-3 flex items-center font-semibold text-red-600'>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            リスク要因
                          </h4>
                          {projectAssessment.riskFactors.length > 0 ? (
                            <div className='space-y-2'>
                              {projectAssessment.riskFactors.map((factor, index) => (
                                <Alert key={index} className='border-red-200'>
                                  <AlertTriangle className='h-4 w-4' />
                                  <AlertDescription>{factor}</AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          ) : (
                            <p className='text-sm text-gray-600'>
                              現在、重大なリスク要因は特定されていません。
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StrategicAlignment
