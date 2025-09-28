/**
 * Prototype Feedback Form
 * プロトタイプフィードバック収集フォーム
 *
 * 評価項目:
 * - タスク完了率
 * - ユーザビリティ（1-5段階）
 * - 満足度（NPS、CSAT）
 * - 自由記述フィードバック
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Star, Send, CheckCircle2, MessageSquare, BarChart3, Heart, ThumbsUp } from 'lucide-react'

interface FeedbackData {
  // 基本情報
  name: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  testDate: string

  // 1. バンドルサイズ最適化
  bundleOptimization: {
    tasksCompleted: string[]
    loadSpeed: number
    uiClarity: number
    satisfaction: number
    comments: string
  }

  // 2. PWAオフライン機能
  offlineMode: {
    tasksCompleted: string[]
    experience: number
    notificationClarity: number
    satisfaction: number
    comments: string
  }

  // 3. AIコーチング
  aiCoaching: {
    tasksCompleted: string[]
    planAccuracy: number
    feedbackQuality: number
    learningEffectiveness: number
    comments: string
  }

  // 総合評価
  overall: {
    nps: number
    priorityFeature: string
    additionalComments: string
  }
}

import { logger } from '@/utils/logger'
const PrototypeFeedbackForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [currentSection, setCurrentSection] = useState(1)

  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    name: '',
    experienceLevel: 'beginner',
    testDate: new Date().toISOString().split('T')[0],
    bundleOptimization: {
      tasksCompleted: [],
      loadSpeed: 0,
      uiClarity: 0,
      satisfaction: 0,
      comments: '',
    },
    offlineMode: {
      tasksCompleted: [],
      experience: 0,
      notificationClarity: 0,
      satisfaction: 0,
      comments: '',
    },
    aiCoaching: {
      tasksCompleted: [],
      planAccuracy: 0,
      feedbackQuality: 0,
      learningEffectiveness: 0,
      comments: '',
    },
    overall: {
      nps: 0,
      priorityFeature: '',
      additionalComments: '',
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logger.info('Prototype feedback submitted', {
      component: 'PrototypeFeedbackForm',
      experienceLevel: feedbackData.experienceLevel,
      nps: feedbackData.overall.nps,
      sectionsCompleted: currentSection,
    })
    setSubmitted(true)

    // 実際の実装ではAPIに送信
    // await submitFeedback(feedbackData)
  }

  const StarRating: React.FC<{
    value: number
    onChange: (value: number) => void
    label: string
  }> = ({ value, onChange, label }) => (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='flex space-x-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => onChange(star)}
            className='transition-transform hover:scale-110'
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 dark:from-gray-900 dark:to-gray-800'>
        <div className='mx-auto max-w-2xl'>
          <Card className='text-center'>
            <CardContent className='p-12'>
              <CheckCircle2 className='mx-auto mb-6 h-20 w-20 text-green-500' />
              <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                フィードバックありがとうございました！
              </h2>
              <p className='mb-6 text-gray-600 dark:text-gray-300'>
                あなたの貴重なご意見は、プロトタイプの改善に活用させていただきます。
              </p>
              <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  フィードバック概要:
                </p>
                <div className='mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-200'>
                  <p>
                    バンドルサイズ最適化:{' '}
                    {feedbackData.bundleOptimization.satisfaction > 0
                      ? `${feedbackData.bundleOptimization.satisfaction}/5`
                      : '未評価'}
                  </p>
                  <p>
                    PWAオフライン機能:{' '}
                    {feedbackData.offlineMode.satisfaction > 0
                      ? `${feedbackData.offlineMode.satisfaction}/5`
                      : '未評価'}
                  </p>
                  <p>
                    AIコーチング:{' '}
                    {feedbackData.aiCoaching.learningEffectiveness > 0
                      ? `${feedbackData.aiCoaching.learningEffectiveness}/5`
                      : '未評価'}
                  </p>
                  <p>NPS: {feedbackData.overall.nps > 0 ? feedbackData.overall.nps : '未評価'}</p>
                </div>
              </div>
              <Button onClick={() => window.location.reload()}>新しいフィードバックを送信</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* ヘッダー */}
        <div className='text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            プロトタイプフィードバックフォーム
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            プロトタイプの評価にご協力ください（所要時間: 約10分）
          </p>
        </div>

        {/* 進捗インジケーター */}
        <div className='flex items-center justify-center space-x-2'>
          {[1, 2, 3, 4, 5].map((section) => (
            <div
              key={section}
              className={`h-2 w-16 rounded-full ${
                section <= currentSection ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* セクション1: 基本情報 */}
          {currentSection === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <MessageSquare className='mr-2 h-5 w-5 text-blue-500' />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='name'>氏名（任意）</Label>
                  <Input
                    id='name'
                    value={feedbackData.name}
                    onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                    placeholder='山田太郎'
                  />
                </div>

                <div>
                  <Label>経験レベル</Label>
                  <RadioGroup
                    value={feedbackData.experienceLevel}
                    onValueChange={(value) =>
                      setFeedbackData({
                        ...feedbackData,
                        experienceLevel: value as FeedbackData['experienceLevel'],
                      })
                    }
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='beginner' id='beginner' />
                      <Label htmlFor='beginner'>初学者（PMP学習開始前〜3ヶ月）</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='intermediate' id='intermediate' />
                      <Label htmlFor='intermediate'>学習中（3ヶ月〜試験前）</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='advanced' id='advanced' />
                      <Label htmlFor='advanced'>再受験者・合格者</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor='testDate'>テスト実施日</Label>
                  <Input
                    id='testDate'
                    type='date'
                    value={feedbackData.testDate}
                    onChange={(e) => setFeedbackData({ ...feedbackData, testDate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* セクション2: バンドルサイズ最適化 */}
          {currentSection === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BarChart3 className='mr-2 h-5 w-5 text-green-500' />
                  1. バンドルサイズ最適化
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='mb-3 block'>タスク完了状況</Label>
                  <div className='space-y-2'>
                    {[
                      '初回アクセスで基本機能を利用できた',
                      'プログレッシブローディングが理解できた',
                      'ロード時間は許容範囲だった',
                    ].map((task, idx) => (
                      <div key={idx} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`bundle-task-${idx}`}
                          checked={feedbackData.bundleOptimization.tasksCompleted.includes(task)}
                          onCheckedChange={(checked) => {
                            const tasks = checked
                              ? [...feedbackData.bundleOptimization.tasksCompleted, task]
                              : feedbackData.bundleOptimization.tasksCompleted.filter(
                                  (t) => t !== task
                                )
                            setFeedbackData({
                              ...feedbackData,
                              bundleOptimization: {
                                ...feedbackData.bundleOptimization,
                                tasksCompleted: tasks,
                              },
                            })
                          }}
                        />
                        <Label htmlFor={`bundle-task-${idx}`} className='font-normal'>
                          {task}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <StarRating
                  label='ロード速度'
                  value={feedbackData.bundleOptimization.loadSpeed}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      bundleOptimization: {
                        ...feedbackData.bundleOptimization,
                        loadSpeed: value,
                      },
                    })
                  }
                />

                <StarRating
                  label='UI分かりやすさ'
                  value={feedbackData.bundleOptimization.uiClarity}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      bundleOptimization: {
                        ...feedbackData.bundleOptimization,
                        uiClarity: value,
                      },
                    })
                  }
                />

                <StarRating
                  label='全体満足度'
                  value={feedbackData.bundleOptimization.satisfaction}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      bundleOptimization: {
                        ...feedbackData.bundleOptimization,
                        satisfaction: value,
                      },
                    })
                  }
                />

                <div>
                  <Label htmlFor='bundle-comments'>自由記述</Label>
                  <Textarea
                    id='bundle-comments'
                    value={feedbackData.bundleOptimization.comments}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        bundleOptimization: {
                          ...feedbackData.bundleOptimization,
                          comments: e.target.value,
                        },
                      })
                    }
                    placeholder='困ったこと、良かったこと、改善提案など'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* セクション3: PWAオフライン機能 */}
          {currentSection === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ThumbsUp className='mr-2 h-5 w-5 text-purple-500' />
                  2. PWAオフライン機能
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='mb-3 block'>タスク完了状況</Label>
                  <div className='space-y-2'>
                    {[
                      'オフライン状態に気づいた',
                      'オフラインでも学習できた',
                      '同期処理が理解できた',
                    ].map((task, idx) => (
                      <div key={idx} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`offline-task-${idx}`}
                          checked={feedbackData.offlineMode.tasksCompleted.includes(task)}
                          onCheckedChange={(checked) => {
                            const tasks = checked
                              ? [...feedbackData.offlineMode.tasksCompleted, task]
                              : feedbackData.offlineMode.tasksCompleted.filter((t) => t !== task)
                            setFeedbackData({
                              ...feedbackData,
                              offlineMode: {
                                ...feedbackData.offlineMode,
                                tasksCompleted: tasks,
                              },
                            })
                          }}
                        />
                        <Label htmlFor={`offline-task-${idx}`} className='font-normal'>
                          {task}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <StarRating
                  label='オフライン体験'
                  value={feedbackData.offlineMode.experience}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      offlineMode: { ...feedbackData.offlineMode, experience: value },
                    })
                  }
                />

                <StarRating
                  label='通知の明瞭性'
                  value={feedbackData.offlineMode.notificationClarity}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      offlineMode: {
                        ...feedbackData.offlineMode,
                        notificationClarity: value,
                      },
                    })
                  }
                />

                <StarRating
                  label='全体満足度'
                  value={feedbackData.offlineMode.satisfaction}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      offlineMode: { ...feedbackData.offlineMode, satisfaction: value },
                    })
                  }
                />

                <div>
                  <Label htmlFor='offline-comments'>自由記述</Label>
                  <Textarea
                    id='offline-comments'
                    value={feedbackData.offlineMode.comments}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        offlineMode: { ...feedbackData.offlineMode, comments: e.target.value },
                      })
                    }
                    placeholder='困ったこと、良かったこと、改善提案など'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* セクション4: AIコーチング */}
          {currentSection === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Heart className='mr-2 h-5 w-5 text-red-500' />
                  3. AIコーチング
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='mb-3 block'>タスク完了状況</Label>
                  <div className='space-y-2'>
                    {['個別プランが理解できた', 'フィードバックが役立った', '継続して使いたい'].map(
                      (task, idx) => (
                        <div key={idx} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`ai-task-${idx}`}
                            checked={feedbackData.aiCoaching.tasksCompleted.includes(task)}
                            onCheckedChange={(checked) => {
                              const tasks = checked
                                ? [...feedbackData.aiCoaching.tasksCompleted, task]
                                : feedbackData.aiCoaching.tasksCompleted.filter((t) => t !== task)
                              setFeedbackData({
                                ...feedbackData,
                                aiCoaching: { ...feedbackData.aiCoaching, tasksCompleted: tasks },
                              })
                            }}
                          />
                          <Label htmlFor={`ai-task-${idx}`} className='font-normal'>
                            {task}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <StarRating
                  label='プランの的確性'
                  value={feedbackData.aiCoaching.planAccuracy}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      aiCoaching: { ...feedbackData.aiCoaching, planAccuracy: value },
                    })
                  }
                />

                <StarRating
                  label='フィードバック品質'
                  value={feedbackData.aiCoaching.feedbackQuality}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      aiCoaching: { ...feedbackData.aiCoaching, feedbackQuality: value },
                    })
                  }
                />

                <StarRating
                  label='学習効果'
                  value={feedbackData.aiCoaching.learningEffectiveness}
                  onChange={(value) =>
                    setFeedbackData({
                      ...feedbackData,
                      aiCoaching: { ...feedbackData.aiCoaching, learningEffectiveness: value },
                    })
                  }
                />

                <div>
                  <Label htmlFor='ai-comments'>自由記述</Label>
                  <Textarea
                    id='ai-comments'
                    value={feedbackData.aiCoaching.comments}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        aiCoaching: { ...feedbackData.aiCoaching, comments: e.target.value },
                      })
                    }
                    placeholder='困ったこと、良かったこと、改善提案など'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* セクション5: 総合評価 */}
          {currentSection === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Star className='mr-2 h-5 w-5 text-amber-500' />
                  総合評価
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='mb-3 block'>
                    NPS（推奨度）: この製品を友人に勧めますか？（0-10）
                  </Label>
                  <div className='flex space-x-1'>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type='button'
                        onClick={() =>
                          setFeedbackData({
                            ...feedbackData,
                            overall: { ...feedbackData.overall, nps: score },
                          })
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition ${
                          feedbackData.overall.nps === score
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className='mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-300'>
                    <span>全く勧めない</span>
                    <span>非常に勧める</span>
                  </div>
                </div>

                <div>
                  <Label>最も改善してほしい機能</Label>
                  <RadioGroup
                    value={feedbackData.overall.priorityFeature}
                    onValueChange={(value) =>
                      setFeedbackData({
                        ...feedbackData,
                        overall: { ...feedbackData.overall, priorityFeature: value },
                      })
                    }
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='bundle' id='priority-bundle' />
                      <Label htmlFor='priority-bundle'>バンドルサイズ最適化</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='offline' id='priority-offline' />
                      <Label htmlFor='priority-offline'>PWAオフライン機能</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='ai' id='priority-ai' />
                      <Label htmlFor='priority-ai'>AIコーチング</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor='additional-comments'>その他ご意見・ご要望</Label>
                  <Textarea
                    id='additional-comments'
                    value={feedbackData.overall.additionalComments}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        overall: { ...feedbackData.overall, additionalComments: e.target.value },
                      })
                    }
                    placeholder='全体を通してのご意見、追加で欲しい機能など'
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ナビゲーションボタン */}
          <div className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
              disabled={currentSection === 1}
            >
              前へ
            </Button>

            {currentSection < 5 ? (
              <Button type='button' onClick={() => setCurrentSection(currentSection + 1)}>
                次へ
              </Button>
            ) : (
              <Button type='submit' className='bg-green-600 hover:bg-green-700'>
                <Send className='mr-2 h-4 w-4' />
                送信
              </Button>
            )}
          </div>
        </form>

        {/* プロトタイプ情報 */}
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
          <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>
            フィードバックの活用について
          </h3>
          <p className='text-sm text-blue-700 dark:text-blue-200'>
            いただいたフィードバックは、プロトタイプの改善と優先順位付けに使用されます。
            個人を特定する情報は収集しておらず、統計的な分析のみに利用されます。
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrototypeFeedbackForm
