import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Alert, AlertDescription } from '../../ui/alert'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import {
  Target,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  BarChart3,
  Trophy,
  Lightbulb,
  Users,
  Star,
} from 'lucide-react'

const OKRManagement = () => {
  const [okrs, setOkrs] = useState([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingOkr, setEditingOkr] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2024')
  const [newObjective, setNewObjective] = useState('')
  const [newKeyResults, setNewKeyResults] = useState([''])

  // サンプルOKRデータ
  useEffect(() => {
    setOkrs([
      {
        id: 1,
        objective: 'プロジェクト管理能力の向上による組織効率性の最大化',
        description: 'PMPスキルを活用してプロジェクト成功率を向上させ、組織全体の生産性を高める',
        period: 'Q1-2024',
        status: 'active',
        progress: 75,
        keyResults: [
          {
            id: 1,
            description: 'プロジェクト成功率を85%に向上',
            target: 85,
            current: 78,
            unit: '%',
            deadline: '2024-03-31',
            status: 'on-track',
          },
          {
            id: 2,
            description: 'プロジェクト完了時間を平均20%短縮',
            target: 20,
            current: 15,
            unit: '%',
            deadline: '2024-03-31',
            status: 'on-track',
          },
          {
            id: 3,
            description: 'ステークホルダー満足度を90%以上に向上',
            target: 90,
            current: 85,
            unit: '%',
            deadline: '2024-03-31',
            status: 'on-track',
          },
        ],
      },
      {
        id: 2,
        objective: 'イノベーション駆動型プロジェクトの推進',
        description: '新技術と創造的アプローチを活用してビジネス価値を創出する',
        period: 'Q1-2024',
        status: 'active',
        progress: 60,
        keyResults: [
          {
            id: 4,
            description: '新規技術を活用したプロジェクトを3件以上実施',
            target: 3,
            current: 2,
            unit: '件',
            deadline: '2024-03-31',
            status: 'on-track',
          },
          {
            id: 5,
            description: '革新的アイデアの提案数を50%増加',
            target: 50,
            current: 25,
            unit: '%',
            deadline: '2024-03-31',
            status: 'at-risk',
          },
        ],
      },
    ])
  }, [])

  const periods = [
    'Q1-2024',
    'Q2-2024',
    'Q3-2024',
    'Q4-2024',
    'Q1-2025',
    'Q2-2025',
    'Q3-2025',
    'Q4-2025',
  ]

  const statusConfig = {
    'on-track': {
      label: '順調',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
    },
    'at-risk': {
      label: 'リスク',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: AlertCircle,
    },
    'off-track': { label: '遅延', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle },
    completed: { label: '完了', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Trophy },
  }

  const addKeyResult = () => {
    setNewKeyResults([...newKeyResults, ''])
  }

  const removeKeyResult = (index) => {
    setNewKeyResults(newKeyResults.filter((_, i) => i !== index))
  }

  const updateKeyResult = (index, value) => {
    const updated = [...newKeyResults]
    updated[index] = value
    setNewKeyResults(updated)
  }

  const saveOkr = () => {
    if (!newObjective.trim() || newKeyResults.some((kr) => !kr.trim())) {
      return
    }

    const newOkr = {
      id: Date.now(),
      objective: newObjective,
      description: '',
      period: selectedPeriod,
      status: 'active',
      progress: 0,
      keyResults: newKeyResults
        .filter((kr) => kr.trim())
        .map((kr, index) => ({
          id: Date.now() + index,
          description: kr,
          target: 100,
          current: 0,
          unit: '%',
          deadline: getQuarterEndDate(selectedPeriod),
          status: 'on-track',
        })),
    }

    setOkrs([...okrs, newOkr])
    setNewObjective('')
    setNewKeyResults([''])
    setShowAddDialog(false)
  }

  const getQuarterEndDate = (period) => {
    const [quarter, year] = period.split('-')
    const quarterEndMonths = { Q1: 3, Q2: 6, Q3: 9, Q4: 12 }
    const month = quarterEndMonths[quarter]
    return `${year}-${month.toString().padStart(2, '0')}-31`
  }

  const updateKeyResultProgress = (okrId, keyResultId, newProgress) => {
    setOkrs(
      okrs.map((okr) => {
        if (okr.id === okrId) {
          const updatedKeyResults = okr.keyResults.map((kr) => {
            if (kr.id === keyResultId) {
              const progressPercent = (newProgress / kr.target) * 100
              return {
                ...kr,
                current: newProgress,
                status:
                  progressPercent >= 100
                    ? 'completed'
                    : progressPercent >= 70
                      ? 'on-track'
                      : progressPercent >= 40
                        ? 'at-risk'
                        : 'off-track',
              }
            }
            return kr
          })

          const overallProgress =
            updatedKeyResults.reduce((acc, kr) => acc + (kr.current / kr.target) * 100, 0) /
            updatedKeyResults.length

          return {
            ...okr,
            keyResults: updatedKeyResults,
            progress: Math.min(100, overallProgress),
          }
        }
        return okr
      })
    )
  }

  const deleteOkr = (okrId) => {
    setOkrs(okrs.filter((okr) => okr.id !== okrId))
  }

  const filteredOkrs = okrs.filter((okr) => okr.period === selectedPeriod)

  const calculatePeriodStats = () => {
    if (filteredOkrs.length === 0) {
      return { avgProgress: 0, completed: 0, onTrack: 0, atRisk: 0 }
    }

    const avgProgress =
      filteredOkrs.reduce((acc, okr) => acc + okr.progress, 0) / filteredOkrs.length
    const statusCounts = filteredOkrs.reduce(
      (acc, okr) => {
        const mainStatus =
          okr.progress >= 100 ? 'completed' : okr.progress >= 70 ? 'onTrack' : 'atRisk'
        acc[mainStatus]++
        return acc
      },
      { completed: 0, onTrack: 0, atRisk: 0 }
    )

    return { avgProgress, ...statusCounts }
  }

  const stats = calculatePeriodStats()

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='h-6 w-6 text-purple-600' />
          OKR設定・管理ツール
        </CardTitle>
        <CardDescription>
          目標と主要成果を設定・追跡し、プロジェクトの価値実現を可視化
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 期間選択とサマリー */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>評価期間</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className='flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                新しいOKR
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>新しいOKRを作成</DialogTitle>
                <DialogDescription>
                  明確で測定可能な目標と主要成果を設定してください
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>目標 (Objective)</label>
                  <Textarea
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder='達成したい具体的な目標を記述してください...'
                    className='mt-1'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    主要成果 (Key Results)
                  </label>
                  <div className='mt-1 space-y-2'>
                    {newKeyResults.map((kr, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          value={kr}
                          onChange={(e) => updateKeyResult(index, e.target.value)}
                          placeholder={`主要成果 ${index + 1}を記述してください...`}
                        />
                        {newKeyResults.length > 1 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => removeKeyResult(index)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={addKeyResult}
                      className='flex items-center gap-2'
                    >
                      <Plus className='h-3 w-3' />
                      主要成果を追加
                    </Button>
                  </div>
                </div>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setShowAddDialog(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={saveOkr}>OKRを作成</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 期間サマリー */}
        {filteredOkrs.length > 0 && (
          <Card className='bg-gradient-to-r from-purple-50 to-blue-50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <BarChart3 className='h-5 w-5' />
                {selectedPeriod} サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {Math.round(stats.avgProgress)}%
                  </div>
                  <div className='text-sm text-gray-600'>平均進捗</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>{stats.completed}</div>
                  <div className='text-sm text-gray-600'>完了</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>{stats.onTrack}</div>
                  <div className='text-sm text-gray-600'>順調</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-yellow-600'>{stats.atRisk}</div>
                  <div className='text-sm text-gray-600'>要注意</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OKRリスト */}
        {filteredOkrs.length === 0 ? (
          <Card className='p-8 text-center'>
            <Target className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>OKRが設定されていません</h3>
            <p className='mb-4 text-gray-500'>新しいOKRを作成して価値実現を追跡しましょう</p>
            <Button onClick={() => setShowAddDialog(true)}>最初のOKRを作成</Button>
          </Card>
        ) : (
          <div className='space-y-4'>
            {filteredOkrs.map((okr) => (
              <Card key={okr.id} className='border-l-4 border-l-purple-500'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='mb-2 text-lg'>{okr.objective}</CardTitle>
                      {okr.description && <CardDescription>{okr.description}</CardDescription>}
                      <div className='mt-3 flex items-center gap-4'>
                        <Progress value={okr.progress} className='h-2 flex-1' />
                        <Badge variant='outline' className='min-w-16 text-center'>
                          {Math.round(okr.progress)}%
                        </Badge>
                      </div>
                    </div>
                    <div className='ml-4 flex items-center gap-2'>
                      <Button variant='ghost' size='sm'>
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => deleteOkr(okr.id)}>
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <h4 className='flex items-center gap-2 text-sm font-medium text-gray-900'>
                      <Star className='h-4 w-4 text-yellow-500' />
                      主要成果 (Key Results)
                    </h4>
                    {okr.keyResults.map((kr) => {
                      const StatusIcon = statusConfig[kr.status]?.icon || CheckCircle2
                      const progressPercent = (kr.current / kr.target) * 100

                      return (
                        <div key={kr.id} className='space-y-2 rounded-lg bg-gray-50 p-3'>
                          <div className='flex items-start justify-between'>
                            <p className='flex-1 text-sm text-gray-700'>{kr.description}</p>
                            <Badge
                              variant='outline'
                              className={`ml-2 ${statusConfig[kr.status]?.color} ${statusConfig[kr.status]?.bgColor}`}
                            >
                              <StatusIcon className='mr-1 h-3 w-3' />
                              {statusConfig[kr.status]?.label}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-3'>
                            <Progress value={progressPercent} className='h-2 flex-1' />
                            <div className='min-w-20 text-right text-xs text-gray-600'>
                              {kr.current}/{kr.target} {kr.unit}
                            </div>
                          </div>
                          <div className='flex items-center justify-between text-xs text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              期限: {kr.deadline}
                            </div>
                            <div className='flex items-center gap-2'>
                              <label>進捗:</label>
                              <Input
                                type='number'
                                value={kr.current}
                                onChange={(e) =>
                                  updateKeyResultProgress(okr.id, kr.id, Number(e.target.value))
                                }
                                className='h-6 w-16 text-xs'
                                min='0'
                                max={kr.target}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* OKRベストプラクティス */}
        <Card className='bg-blue-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-blue-900'>
              <Lightbulb className='h-5 w-5' />
              OKR設定のベストプラクティス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Alert>
                <Users className='h-4 w-4' />
                <AlertDescription>
                  <strong>SMART原則</strong>
                  <br />
                  具体的、測定可能、達成可能、関連性、期限を明確にした目標設定
                </AlertDescription>
              </Alert>
              <Alert>
                <TrendingUp className='h-4 w-4' />
                <AlertDescription>
                  <strong>適度な挑戦</strong>
                  <br />
                  60-70%の達成率を目指す野心的だが現実的な目標設定
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default React.memo(OKRManagement)
