import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Settings,
  Users,
  TrendingUp,
  CheckCircle,
  Circle,
  Star,
  BookOpen,
  Target,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Award,
} from 'lucide-react'
import {
  talentTriangleData,
  analyzeTalentTriangleBalance,
  TalentTriangleAssessment,
} from '../../data/pmbok/pmiTalentTriangleData'

interface PMITalentTriangleProps {
  className?: string
}

const PMITalentTriangle: React.FC<PMITalentTriangleProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState(talentTriangleData[0].id)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [userAssessment, setUserAssessment] = useState<Partial<TalentTriangleAssessment> | null>(
    null
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [assessmentMode, setAssessmentMode] = useState(false)
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: string]: number }>({})

  const iconMap = {
    Settings: Settings,
    Users: Users,
    TrendingUp: TrendingUp,
  }

  const selectedCategoryData = talentTriangleData.find((cat) => cat.id === selectedCategory)
  const selectedSkillData = selectedCategoryData?.skills.find((skill) => skill.id === selectedSkill)

  // 自己評価の開始
  const startAssessment = () => {
    setAssessmentMode(true)
    setCurrentQuestionIndex(0)
    setAssessmentAnswers({})
  }

  // 評価質問への回答
  const answerQuestion = (skillId: string, questionIndex: number, score: number) => {
    const key = `${skillId}-${questionIndex}`
    setAssessmentAnswers((prev) => ({
      ...prev,
      [key]: score,
    }))
  }

  // 評価完了処理
  const completeAssessment = () => {
    // 簡易的な評価結果生成
    const categoryScores = talentTriangleData.map((category) => {
      const skillScores = category.skills.map((skill) => {
        const skillAnswers = skill.assessment.questions.map((_, index) => {
          const key = `${skill.id}-${index}`
          return assessmentAnswers[key] || 0
        })
        const avgScore = skillAnswers.reduce((sum, score) => sum + score, 0) / skillAnswers.length
        return {
          skillId: skill.id,
          level: avgScore >= 4 ? '上級' : avgScore >= 3 ? '中級' : '初級',
          score: avgScore * 20, // 5点スケールを100点スケールに変換
          strengthAreas: [],
          developmentAreas: [],
        }
      })

      const categoryScore =
        skillScores.reduce((sum, skill) => sum + skill.score, 0) / skillScores.length

      return {
        categoryId: category.id,
        score: categoryScore,
        skills: skillScores,
      }
    })

    const overallScore =
      categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length

    const assessment: TalentTriangleAssessment = {
      userId: 'current-user',
      assessmentDate: new Date(),
      overallScore,
      categories: categoryScores,
      developmentPlan: [],
    }

    setUserAssessment(assessment)
    setAssessmentMode(false)
  }

  // 三角形の視覚化コンポーネント
  const TriangleVisualization: React.FC<{ assessment?: TalentTriangleAssessment }> = ({
    assessment,
  }) => {
    const size = 300
    const centerX = size / 2
    const centerY = size / 2
    const radius = 120

    // 三角形の頂点座標
    const points = [
      { x: centerX, y: centerY - radius }, // 上（働き方）
      { x: centerX - radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }, // 左下（パワースキル）
      { x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }, // 右下（ビジネス感覚）
    ]

    // スコアに基づく内側の三角形
    const getInnerPoint = (index: number, score: number) => {
      const center = { x: centerX, y: centerY }
      const outerPoint = points[index]
      const factor = score / 100
      return {
        x: center.x + (outerPoint.x - center.x) * factor,
        y: center.y + (outerPoint.y - center.y) * factor,
      }
    }

    return (
      <div className='flex justify-center'>
        <svg width={size} height={size} className='drop-shadow-md'>
          {/* 外側の三角形 */}
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill='none'
            stroke='#e5e7eb'
            strokeWidth='2'
            className='opacity-50'
          />

          {/* スコアがある場合の内側の三角形 */}
          {assessment && (
            <polygon
              points={points
                .map((_, index) => {
                  const score = assessment.categories[index]?.score || 0
                  const point = getInnerPoint(index, score)
                  return `${point.x},${point.y}`
                })
                .join(' ')}
              fill='rgba(59, 130, 246, 0.3)'
              stroke='#3b82f6'
              strokeWidth='2'
            />
          )}

          {/* カテゴリーラベル */}
          {talentTriangleData.map((category, index) => {
            const point = points[index]
            const labelOffset = 30
            const Icon = iconMap[category.icon as keyof typeof iconMap]

            let labelX = point.x
            let labelY = point.y

            if (index === 0) {
              labelY -= labelOffset
            } // 上
            else if (index === 1) {
              // 左下
              labelX -= labelOffset
              labelY += labelOffset
            } else {
              // 右下
              labelX += labelOffset
              labelY += labelOffset
            }

            const score = assessment?.categories[index]?.score

            return (
              <g key={category.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r='20'
                  fill={category.color}
                  className='cursor-pointer'
                  onClick={() => setSelectedCategory(category.id)}
                />
                <Icon x={point.x - 8} y={point.y - 8} width='16' height='16' fill='white' />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor='middle'
                  className='text-sm font-medium'
                  fill='#374151'
                >
                  {category.name}
                </text>
                {score && (
                  <text
                    x={labelX}
                    y={labelY + 15}
                    textAnchor='middle'
                    className='text-xs'
                    fill='#6b7280'
                  >
                    {Math.round(score)}点
                  </text>
                )}
              </g>
            )
          })}

          {/* 中央のスコア表示 */}
          {assessment && (
            <g>
              <circle
                cx={centerX}
                cy={centerY}
                r='25'
                fill='white'
                stroke='#e5e7eb'
                strokeWidth='2'
              />
              <text
                x={centerX}
                y={centerY - 5}
                textAnchor='middle'
                className='text-sm font-bold'
                fill='#374151'
              >
                総合
              </text>
              <text
                x={centerX}
                y={centerY + 10}
                textAnchor='middle'
                className='text-xs'
                fill='#6b7280'
              >
                {Math.round(assessment.overallScore)}点
              </text>
            </g>
          )}
        </svg>
      </div>
    )
  }

  // 評価質問コンポーネント
  const AssessmentQuestion: React.FC<{
    skill: any
    questionIndex: number
    onAnswer: (score: number) => void
  }> = ({ skill, questionIndex, onAnswer }) => {
    const question = skill.assessment.questions[questionIndex]
    const [selectedScore, setSelectedScore] = useState<number | null>(null)

    const handleScoreSelect = (score: number) => {
      setSelectedScore(score)
      onAnswer(score)
    }

    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-lg'>{skill.name} - 自己評価</CardTitle>
          <p className='text-sm text-gray-600'>
            質問 {questionIndex + 1} / {skill.assessment.questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <p className='mb-6 text-base'>{question}</p>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-700'>
              あなたの現在のレベルに最も近いものを選択してください：
            </p>
            <div className='grid grid-cols-1 gap-2'>
              {[1, 2, 3, 4, 5].map((score) => (
                <Button
                  key={score}
                  variant={selectedScore === score ? 'default' : 'outline'}
                  className='h-auto justify-start p-4 text-left'
                  onClick={() => handleScoreSelect(score)}
                >
                  <div className='flex items-center space-x-3'>
                    <span className='font-bold'>{score}</span>
                    <span>
                      {score === 1 && '全くできない'}
                      {score === 2 && 'あまりできない'}
                      {score === 3 && '普通'}
                      {score === 4 && 'よくできる'}
                      {score === 5 && '非常によくできる'}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className='space-y-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>PMI タレント・トライアングル</h1>
        <p className='mx-auto max-w-4xl text-lg text-gray-600'>
          プロジェクトマネジメントプロフェッショナルに必要な3つの重要なスキル領域を理解し、
          バランスの取れたスキル開発を実現しましょう。
        </p>
      </div>

      {/* 評価モード */}
      {assessmentMode ? (
        <div className='mx-auto max-w-4xl'>
          <div className='space-y-6'>
            {talentTriangleData.map((category) => (
              <div key={category.id}>
                <h3 className='mb-4 text-xl font-bold' style={{ color: category.color }}>
                  {category.name}（{category.englishName}）
                </h3>
                {category.skills.map((skill) => (
                  <div key={skill.id} className='mb-6'>
                    <h4 className='mb-3 text-lg font-semibold'>{skill.name}</h4>
                    {skill.assessment.questions.map((question, qIndex) => {
                      const key = `${skill.id}-${qIndex}`
                      return (
                        <div key={qIndex} className='mb-4'>
                          <p className='mb-2'>{question}</p>
                          <div className='flex space-x-2'>
                            {[1, 2, 3, 4, 5].map((score) => (
                              <Button
                                key={score}
                                size='sm'
                                variant={assessmentAnswers[key] === score ? 'default' : 'outline'}
                                onClick={() => answerQuestion(skill.id, qIndex, score)}
                              >
                                {score}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
            <div className='flex justify-center space-x-4'>
              <Button variant='outline' onClick={() => setAssessmentMode(false)}>
                キャンセル
              </Button>
              <Button onClick={completeAssessment}>評価完了</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 三角形の視覚化 */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Target className='h-6 w-6' />
                <span>タレント・トライアングル概要</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                <div>
                  <TriangleVisualization assessment={userAssessment} />
                  <div className='mt-4 text-center'>
                    <Button onClick={startAssessment} className='mb-4'>
                      <Award className='mr-2 h-4 w-4' />
                      自己評価を開始
                    </Button>
                    {userAssessment && (
                      <p className='text-sm text-gray-600'>
                        最終評価日: {userAssessment.assessmentDate?.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold'>3つのスキル領域</h3>
                  {talentTriangleData.map((category) => {
                    const Icon = iconMap[category.icon as keyof typeof iconMap]
                    const categoryAssessment = userAssessment?.categories.find(
                      (c) => c.categoryId === category.id
                    )

                    return (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-start space-x-3'>
                            <div
                              className='rounded-lg p-2'
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <Icon className='h-6 w-6' style={{ color: category.color }} />
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold'>{category.name}</h4>
                              <p className='mb-2 text-sm text-gray-600'>{category.description}</p>
                              <div className='flex items-center justify-between'>
                                <Badge variant='secondary'>推奨比率: {category.percentage}%</Badge>
                                {categoryAssessment && (
                                  <div className='text-right'>
                                    <p className='text-sm font-medium'>
                                      {Math.round(categoryAssessment.score)}点
                                    </p>
                                    <Progress
                                      value={categoryAssessment.score}
                                      className='h-2 w-20'
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 詳細タブ */}
          {selectedCategoryData && (
            <Card className='w-full'>
              <CardHeader>
                <CardTitle style={{ color: selectedCategoryData.color }}>
                  {selectedCategoryData.name}の詳細
                </CardTitle>
                <p className='text-gray-600'>{selectedCategoryData.coreMessage}</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='overview' className='w-full'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='overview'>概要</TabsTrigger>
                    <TabsTrigger value='skills'>スキル詳細</TabsTrigger>
                    <TabsTrigger value='development'>開発計画</TabsTrigger>
                  </TabsList>

                  <TabsContent value='overview' className='space-y-4'>
                    <Alert>
                      <Lightbulb className='h-4 w-4' />
                      <AlertDescription>{selectedCategoryData.description}</AlertDescription>
                    </Alert>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {selectedCategoryData.skills.map((skill) => (
                        <Card
                          key={skill.id}
                          className='cursor-pointer transition-shadow hover:shadow-md'
                          onClick={() => setSelectedSkill(skill.id)}
                        >
                          <CardContent className='p-4'>
                            <h4 className='mb-2 font-semibold'>{skill.name}</h4>
                            <p className='text-sm text-gray-600'>{skill.description}</p>
                            <ArrowRight className='mt-2 h-4 w-4 text-gray-400' />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value='skills' className='space-y-4'>
                    {selectedSkillData && (
                      <div className='space-y-6'>
                        <div>
                          <h3 className='mb-3 text-xl font-semibold'>{selectedSkillData.name}</h3>
                          <p className='mb-4 text-gray-600'>{selectedSkillData.importance}</p>

                          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div>
                              <h4 className='mb-3 flex items-center font-semibold'>
                                <BookOpen className='mr-2 h-4 w-4' />
                                主要領域
                              </h4>
                              <ul className='space-y-2'>
                                {selectedSkillData.keyAreas.map((area, index) => (
                                  <li key={index} className='flex items-center text-sm'>
                                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className='mb-3 flex items-center font-semibold'>
                                <Star className='mr-2 h-4 w-4' />
                                実践例
                              </h4>
                              <ul className='space-y-2'>
                                {selectedSkillData.examples.map((example, index) => (
                                  <li key={index} className='flex items-center text-sm'>
                                    <Circle className='mr-2 h-2 w-2 fill-current text-blue-500' />
                                    {example}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className='mb-3 font-semibold'>スキルレベル評価基準</h4>
                          <div className='space-y-3'>
                            {selectedSkillData.assessment.levels.map((level, index) => (
                              <Card key={index}>
                                <CardContent className='p-4'>
                                  <div className='mb-2 flex items-center space-x-3'>
                                    <Badge
                                      variant={
                                        level.level === '初級'
                                          ? 'secondary'
                                          : level.level === '中級'
                                            ? 'default'
                                            : 'destructive'
                                      }
                                    >
                                      {level.level}
                                    </Badge>
                                    <span className='font-medium'>{level.description}</span>
                                  </div>
                                  <ul className='space-y-1 text-sm text-gray-600'>
                                    {level.indicators.map((indicator, i) => (
                                      <li key={i} className='flex items-center'>
                                        <CheckCircle className='mr-2 h-3 w-3 text-green-500' />
                                        {indicator}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='development' className='space-y-4'>
                    {selectedSkillData && (
                      <div>
                        <h3 className='mb-4 text-xl font-semibold'>開発のヒント</h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          {selectedSkillData.developmentTips.map((tip, index) => (
                            <Card key={index}>
                              <CardContent className='p-4'>
                                <div className='flex items-start space-x-3'>
                                  <div className='rounded-lg bg-blue-100 p-2'>
                                    <Lightbulb className='h-4 w-4 text-blue-600' />
                                  </div>
                                  <p className='text-sm'>{tip}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* 評価結果とバランス分析 */}
          {userAssessment && (
            <Card className='w-full'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <BarChart3 className='h-6 w-6' />
                  <span>バランス分析と推奨事項</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const analysis = analyzeTalentTriangleBalance(userAssessment)
                  return (
                    <div className='space-y-6'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <Card>
                          <CardContent className='p-4 text-center'>
                            <div className='text-2xl font-bold text-blue-600'>
                              {Math.round(analysis.balance * 100)}%
                            </div>
                            <p className='text-sm text-gray-600'>バランススコア</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className='p-4 text-center'>
                            <div className='text-lg font-semibold text-green-600'>
                              {
                                talentTriangleData.find((c) => c.id === analysis.strongestArea)
                                  ?.name
                              }
                            </div>
                            <p className='text-sm text-gray-600'>最も強い領域</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className='p-4 text-center'>
                            <div className='text-lg font-semibold text-orange-600'>
                              {talentTriangleData.find((c) => c.id === analysis.weakestArea)?.name}
                            </div>
                            <p className='text-sm text-gray-600'>改善が必要な領域</p>
                          </CardContent>
                        </Card>
                      </div>

                      {analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className='mb-3 font-semibold'>推奨事項</h4>
                          <div className='space-y-2'>
                            {analysis.recommendations.map((rec, index) => (
                              <Alert key={index}>
                                <Lightbulb className='h-4 w-4' />
                                <AlertDescription>{rec}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default PMITalentTriangle
