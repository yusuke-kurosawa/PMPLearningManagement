/**
 * PMOComparisonChart.tsx
 * PMOタイプの比較を視覚化するコンポーネント
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  Users,
  Shield,
  Command,
  Zap,
  TrendingUp,
  BarChart3,
  RadarIcon,
  Table,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

// UIコンポーネント
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'

// 型定義
import type { PMOComparison } from '../../data/schemas/pmbok/pmoTypes'

// PMOタイプの設定
const PMO_COLORS = {
  supportive: '#3B82F6', // blue
  controlling: '#F59E0B', // yellow
  directive: '#EF4444', // red
  acoe: '#10B981', // green
}

const PMO_ICONS = {
  supportive: Users,
  controlling: Shield,
  directive: Command,
  acoe: Zap,
}

interface PMOComparisonChartProps {
  data: PMOComparison[]
  className?: string
}

const PMOComparisonChart: React.FC<PMOComparisonChartProps> = ({ data, className = '' }) => {
  const [viewMode, setViewMode] = useState<'table' | 'radar' | 'bar'>('table')
  const [selectedCriteria, setSelectedCriteria] = useState<string>('all')

  // レーダーチャート用のデータ変換
  const radarData = useMemo(() => {
    const criteriaScores = {
      管理レベル: { supportive: 1, controlling: 3, directive: 5, acoe: 1 },
      PM自律性: { supportive: 5, controlling: 3, directive: 1, acoe: 5 },
      標準化レベル: { supportive: 2, controlling: 4, directive: 5, acoe: 3 },
      組織への影響: { supportive: 2, controlling: 3, directive: 5, acoe: 4 },
      コスト: { supportive: 5, controlling: 3, directive: 1, acoe: 3 },
      実装期間: { supportive: 5, controlling: 3, directive: 1, acoe: 3 },
    }

    return Object.entries(criteriaScores).map(([criteria, scores]) => ({
      criteria,
      supportive: scores.supportive,
      controlling: scores.controlling,
      directive: scores.directive,
      acoe: scores.acoe,
    }))
  }, [])

  // 棒グラフ用のデータ変換
  const barData = useMemo(() => {
    if (selectedCriteria === 'all') {
      return radarData
    }

    return radarData.filter((item) =>
      item.criteria.toLowerCase().includes(selectedCriteria.toLowerCase())
    )
  }, [radarData, selectedCriteria])

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800'>
          <p className='font-semibold'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}/5`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // PMOタイプの推奨度判定
  const getRecommendationLevel = (criteria: string, pmoType: string, value: string) => {
    // 簡単な推奨度ロジック
    const highValue = ['非常に高い', '最大限', '強制', '大きい', '高い', '長期']
    const lowValue = ['最小限', '低い', '推奨', '短期']

    if (highValue.some((val) => value.includes(val))) {
      return 'high'
    } else if (lowValue.some((val) => value.includes(val))) {
      return 'low'
    }
    return 'medium'
  }

  // 推奨度バッジの色
  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (!data || data.length === 0) {
    return (
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>比較データを読み込み中です...</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center'
      >
        <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>PMOタイプ比較分析</h2>
        <p className='text-gray-600 dark:text-gray-300'>
          4つのPMOタイプを多角的に比較し、最適な選択をサポートします
        </p>
      </motion.div>

      {/* 表示モード選択 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='flex items-center justify-between'
      >
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value='table' className='flex items-center space-x-2'>
              <Table className='h-4 w-4' />
              <span>テーブル</span>
            </TabsTrigger>
            <TabsTrigger value='radar' className='flex items-center space-x-2'>
              <RadarIcon className='h-4 w-4' />
              <span>レーダー</span>
            </TabsTrigger>
            <TabsTrigger value='bar' className='flex items-center space-x-2'>
              <BarChart3 className='h-4 w-4' />
              <span>棒グラフ</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === 'bar' && (
          <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='条件を選択' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>すべての条件</SelectItem>
              {data.map((item) => (
                <SelectItem key={item.criteria} value={item.criteria}>
                  {item.criteria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* メインコンテンツ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              {viewMode === 'table' && <Table className='h-5 w-5' />}
              {viewMode === 'radar' && <RadarIcon className='h-5 w-5' />}
              {viewMode === 'bar' && <BarChart3 className='h-5 w-5' />}
              <span>
                {viewMode === 'table' && 'テーブル比較'}
                {viewMode === 'radar' && 'レーダーチャート比較'}
                {viewMode === 'bar' && '棒グラフ比較'}
              </span>
            </CardTitle>
            <CardDescription>PMOタイプの特性を視覚的に比較します</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode='wait'>
              {/* テーブル表示 */}
              {viewMode === 'table' && (
                <motion.div
                  key='table'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className='overflow-x-auto'
                >
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='p-3 text-left font-semibold'>比較項目</th>
                        <th className='p-3 text-center font-semibold'>
                          <div className='flex items-center justify-center space-x-2'>
                            <Users className='h-4 w-4 text-blue-500' />
                            <span>支援型</span>
                          </div>
                        </th>
                        <th className='p-3 text-center font-semibold'>
                          <div className='flex items-center justify-center space-x-2'>
                            <Shield className='h-4 w-4 text-yellow-500' />
                            <span>コントロール型</span>
                          </div>
                        </th>
                        <th className='p-3 text-center font-semibold'>
                          <div className='flex items-center justify-center space-x-2'>
                            <Command className='h-4 w-4 text-red-500' />
                            <span>指令型</span>
                          </div>
                        </th>
                        <th className='p-3 text-center font-semibold'>
                          <div className='flex items-center justify-center space-x-2'>
                            <Zap className='h-4 w-4 text-green-500' />
                            <span>ACoE</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => (
                        <motion.tr
                          key={row.criteria}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className='border-b hover:bg-gray-50 dark:hover:bg-gray-800'
                        >
                          <td className='p-3 font-medium'>{row.criteria}</td>
                          <td className='p-3 text-center'>
                            <div className='space-y-1'>
                              <div className='text-sm'>{row.supportive}</div>
                              <Badge
                                className={getRecommendationColor(
                                  getRecommendationLevel(row.criteria, 'supportive', row.supportive)
                                )}
                                variant='secondary'
                              >
                                {getRecommendationLevel(row.criteria, 'supportive', row.supportive)}
                              </Badge>
                            </div>
                          </td>
                          <td className='p-3 text-center'>
                            <div className='space-y-1'>
                              <div className='text-sm'>{row.controlling}</div>
                              <Badge
                                className={getRecommendationColor(
                                  getRecommendationLevel(
                                    row.criteria,
                                    'controlling',
                                    row.controlling
                                  )
                                )}
                                variant='secondary'
                              >
                                {getRecommendationLevel(
                                  row.criteria,
                                  'controlling',
                                  row.controlling
                                )}
                              </Badge>
                            </div>
                          </td>
                          <td className='p-3 text-center'>
                            <div className='space-y-1'>
                              <div className='text-sm'>{row.directive}</div>
                              <Badge
                                className={getRecommendationColor(
                                  getRecommendationLevel(row.criteria, 'directive', row.directive)
                                )}
                                variant='secondary'
                              >
                                {getRecommendationLevel(row.criteria, 'directive', row.directive)}
                              </Badge>
                            </div>
                          </td>
                          <td className='p-3 text-center'>
                            <div className='space-y-1'>
                              <div className='text-sm'>{row.acoe}</div>
                              <Badge
                                className={getRecommendationColor(
                                  getRecommendationLevel(row.criteria, 'acoe', row.acoe)
                                )}
                                variant='secondary'
                              >
                                {getRecommendationLevel(row.criteria, 'acoe', row.acoe)}
                              </Badge>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {/* レーダーチャート表示 */}
              {viewMode === 'radar' && (
                <motion.div
                  key='radar'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className='space-y-6'
                >
                  <div className='h-96'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey='criteria' className='text-sm' />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 5]}
                          className='text-xs'
                          tickCount={6}
                        />
                        <Radar
                          name='支援型PMO'
                          dataKey='supportive'
                          stroke={PMO_COLORS.supportive}
                          fill={PMO_COLORS.supportive}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name='コントロール型PMO'
                          dataKey='controlling'
                          stroke={PMO_COLORS.controlling}
                          fill={PMO_COLORS.controlling}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name='指令型PMO'
                          dataKey='directive'
                          stroke={PMO_COLORS.directive}
                          fill={PMO_COLORS.directive}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Radar
                          name='ACoE'
                          dataKey='acoe'
                          stroke={PMO_COLORS.acoe}
                          fill={PMO_COLORS.acoe}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* レーダーチャートの説明 */}
                  <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                    <div className='flex items-start space-x-2'>
                      <Info className='mt-0.5 h-5 w-5 text-blue-500' />
                      <div>
                        <h4 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>
                          レーダーチャート読み方
                        </h4>
                        <ul className='space-y-1 text-sm text-blue-700 dark:text-blue-200'>
                          <li>• 外側ほど高い値を示します（1-5スケール）</li>
                          <li>• 各PMOタイプの特性が一目で比較できます</li>
                          <li>• 組織のニーズに合った形状のPMOタイプを選択してください</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 棒グラフ表示 */}
              {viewMode === 'bar' && (
                <motion.div
                  key='bar'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='space-y-6'
                >
                  <div className='h-96'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='criteria'
                          className='text-sm'
                          angle={-45}
                          textAnchor='end'
                          height={80}
                        />
                        <YAxis domain={[0, 5]} className='text-sm' />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey='supportive'
                          fill={PMO_COLORS.supportive}
                          name='支援型PMO'
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey='controlling'
                          fill={PMO_COLORS.controlling}
                          name='コントロール型PMO'
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey='directive'
                          fill={PMO_COLORS.directive}
                          name='指令型PMO'
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey='acoe'
                          fill={PMO_COLORS.acoe}
                          name='ACoE'
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 選択中の条件の詳細情報 */}
                  {selectedCriteria !== 'all' && (
                    <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
                      <h4 className='mb-2 font-semibold'>選択中の比較項目: {selectedCriteria}</h4>
                      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                        {['supportive', 'controlling', 'directive', 'acoe'].map((pmoType) => {
                          const pmoData = data.find((d) => d.criteria === selectedCriteria)
                          const value = pmoData?.[pmoType as keyof PMOComparison] as string
                          const Icon = PMO_ICONS[pmoType as keyof typeof PMO_ICONS]

                          return (
                            <div key={pmoType} className='text-center'>
                              <div className='mb-2 flex items-center justify-center space-x-2'>
                                <Icon
                                  className='h-4 w-4'
                                  style={{ color: PMO_COLORS[pmoType as keyof typeof PMO_COLORS] }}
                                />
                                <span className='text-sm font-medium'>
                                  {pmoType === 'supportive' && '支援型'}
                                  {pmoType === 'controlling' && 'コントロール型'}
                                  {pmoType === 'directive' && '指令型'}
                                  {pmoType === 'acoe' && 'ACoE'}
                                </span>
                              </div>
                              <p className='text-xs text-gray-600 dark:text-gray-400'>{value}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* 比較サマリー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <TrendingUp className='h-5 w-5' />
              <span>比較サマリー</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {[
                {
                  type: 'supportive',
                  name: '支援型PMO',
                  icon: Users,
                  color: 'blue',
                  characteristics: ['最小限の管理', '高い自律性', '低コスト', '短期実装'],
                },
                {
                  type: 'controlling',
                  name: 'コントロール型PMO',
                  icon: Shield,
                  color: 'yellow',
                  characteristics: ['中程度の管理', '標準化重視', 'バランス型', '中期実装'],
                },
                {
                  type: 'directive',
                  name: '指令型PMO',
                  icon: Command,
                  color: 'red',
                  characteristics: ['強力な管理', '厳格な統制', '高い影響力', '長期実装'],
                },
                {
                  type: 'acoe',
                  name: 'ACoE',
                  icon: Zap,
                  color: 'green',
                  characteristics: ['アジャイル特化', '価値重視', '変革的', '文化醸成'],
                },
              ].map((pmo, index) => (
                <motion.div
                  key={pmo.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className={`border-l-4 border-l-${pmo.color}-500`}>
                    <CardContent className='p-4'>
                      <div className='mb-3 flex items-center space-x-2'>
                        <pmo.icon className={`h-5 w-5 text-${pmo.color}-500`} />
                        <h4 className='font-semibold'>{pmo.name}</h4>
                      </div>
                      <ul className='space-y-1'>
                        {pmo.characteristics.map((char, i) => (
                          <li key={i} className='flex items-center space-x-2'>
                            <CheckCircle className={`h-3 w-3 text-${pmo.color}-500`} />
                            <span className='text-xs'>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default PMOComparisonChart
