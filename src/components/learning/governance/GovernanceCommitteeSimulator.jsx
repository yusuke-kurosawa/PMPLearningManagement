import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Alert, AlertDescription } from '../../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Textarea } from '../../ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Progress } from '../../ui/progress'
import {
  Users,
  Crown,
  Shield,
  User,
  Vote,
  MessageSquare,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Activity,
  Target,
  Lightbulb,
  Info,
  Eye,
  Calendar,
  Bell,
  BookOpen,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'

const GovernanceCommitteeSimulator = () => {
  const [activeTab, setActiveTab] = useState('setup')
  const [committeeMembers, setCommitteeMembers] = useState([
    {
      id: 1,
      name: '田中 太郎',
      role: 'エグゼクティブスポンサー',
      authority: 'strategic',
      votingWeight: 30,
      expertise: ['戦略', 'ファイナンス'],
      avatar: '/api/placeholder/32/32',
      present: true,
    },
    {
      id: 2,
      name: '佐藤 花子',
      role: 'PMOディレクター',
      authority: 'tactical',
      votingWeight: 25,
      expertise: ['プロセス', '品質管理'],
      avatar: '/api/placeholder/32/32',
      present: true,
    },
    {
      id: 3,
      name: '鈴木 一郎',
      role: 'ITディレクター',
      authority: 'technical',
      votingWeight: 20,
      expertise: ['技術', 'アーキテクチャ'],
      avatar: '/api/placeholder/32/32',
      present: true,
    },
    {
      id: 4,
      name: '山田 次郎',
      role: 'ビジネスリード',
      authority: 'business',
      votingWeight: 15,
      expertise: ['ビジネス', '要件'],
      avatar: '/api/placeholder/32/32',
      present: false,
    },
    {
      id: 5,
      name: '高橋 三郎',
      role: 'リスクマネージャー',
      authority: 'risk',
      votingWeight: 10,
      expertise: ['リスク', 'コンプライアンス'],
      avatar: '/api/placeholder/32/32',
      present: true,
    },
  ])

  const [currentMeeting, setCurrentMeeting] = useState(null)
  const [meetingInProgress, setMeetingInProgress] = useState(false)
  const [decisions, setDecisions] = useState([])
  const [currentDecision, setCurrentDecision] = useState(null)
  const [votingResults, setVotingResults] = useState({})

  // 意思決定項目テンプレート
  const decisionTemplates = [
    {
      id: 1,
      title: 'プロジェクト継続可否の判定',
      description: '予算超過により、プロジェクトの継続可否を決定する必要があります',
      type: 'go-no-go',
      priority: 'critical',
      options: ['継続', '一時停止', '中止'],
      requiredQuorum: 75,
      backgroundInfo: '現在の予算超過率は25%、スケジュール遅延は30日です。',
    },
    {
      id: 2,
      title: 'スコープ変更の承認',
      description: '新たな機能要求に対するスコープ変更の承認',
      type: 'scope-change',
      priority: 'high',
      options: ['承認', '条件付き承認', '却下'],
      requiredQuorum: 60,
      backgroundInfo: 'ステークホルダーから新機能の追加要求があり、期間延長が必要です。',
    },
    {
      id: 3,
      title: 'リソース追加配分の承認',
      description: '品質向上のための追加リソース配分',
      type: 'resource-allocation',
      priority: 'medium',
      options: ['承認', '部分承認', '却下'],
      requiredQuorum: 50,
      backgroundInfo: '品質基準を満たすため、追加のテストエンジニアが必要です。',
    },
    {
      id: 4,
      title: 'フェーズゲート通過の承認',
      description: '次フェーズへの移行可否の判定',
      type: 'phase-gate',
      priority: 'high',
      options: ['承認', '条件付き承認', '却下'],
      requiredQuorum: 70,
      backgroundInfo: '成果物の90%が完成し、品質基準を満たしています。',
    },
  ]

  // 会議履歴データ
  const meetingHistory = useMemo(() => [
    { month: '1月', meetings: 4, decisions: 12, approval: 85 },
    { month: '2月', meetings: 3, decisions: 9, approval: 78 },
    { month: '3月', meetings: 5, decisions: 15, approval: 92 },
    { month: '4月', meetings: 4, decisions: 11, approval: 88 },
    { month: '5月', meetings: 3, decisions: 8, approval: 75 },
    { month: '6月', meetings: 4, decisions: 13, approval: 90 },
  ], [])

  // 決定分布データ
  const decisionDistribution = useMemo(() => [
    { name: '承認', value: 68, color: '#22c55e' },
    { name: '条件付き承認', value: 22, color: '#f59e0b' },
    { name: '却下', value: 10, color: '#ef4444' },
  ], [])

  const startMeeting = (template) => {
    const meeting = {
      ...template,
      id: Date.now(),
      startTime: new Date(),
      attendees: committeeMembers.filter(member => member.present),
      quorumMet: calculateQuorum() >= template.requiredQuorum,
      phase: 'discussion',
    }
    setCurrentMeeting(meeting)
    setMeetingInProgress(true)
    setCurrentDecision(null)
    setVotingResults({})
  }

  const calculateQuorum = () => {
    const presentMembers = committeeMembers.filter(member => member.present)
    const totalWeight = presentMembers.reduce((sum, member) => sum + member.votingWeight, 0)
    const totalPossibleWeight = committeeMembers.reduce((sum, member) => sum + member.votingWeight, 0)
    return Math.round((totalWeight / totalPossibleWeight) * 100)
  }

  const moveToVoting = () => {
    if (currentMeeting) {
      setCurrentMeeting(prev => ({ ...prev, phase: 'voting' }))
    }
  }

  const castVote = (memberId, vote) => {
    setVotingResults(prev => ({
      ...prev,
      [memberId]: vote
    }))
  }

  const finalizeDecision = () => {
    const attendees = currentMeeting.attendees
    const totalWeight = attendees.reduce((sum, member) => sum + member.votingWeight, 0)
    
    const voteCount = currentMeeting.options.reduce((acc, option) => {
      acc[option] = 0
      return acc
    }, {})

    attendees.forEach(member => {
      const vote = votingResults[member.id]
      if (vote) {
        voteCount[vote] += member.votingWeight
      }
    })

    const percentages = Object.entries(voteCount).map(([option, weight]) => ({
      option,
      weight,
      percentage: Math.round((weight / totalWeight) * 100)
    }))

    const winningOption = percentages.reduce((max, current) => 
      current.weight > max.weight ? current : max
    )

    const decision = {
      ...currentMeeting,
      id: Date.now(),
      endTime: new Date(),
      votingResults: percentages,
      finalDecision: winningOption.option,
      passed: winningOption.percentage >= 50,
      completedAt: new Date().toISOString(),
    }

    setDecisions(prev => [decision, ...prev])
    setCurrentMeeting(prev => ({ ...prev, phase: 'completed', finalDecision: decision }))
    setMeetingInProgress(false)
  }

  const endMeeting = () => {
    setCurrentMeeting(null)
    setMeetingInProgress(false)
    setVotingResults({})
  }

  const toggleMemberPresence = (memberId) => {
    setCommitteeMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, present: !member.present }
          : member
      )
    )
  }

  const getAuthorityIcon = (authority) => {
    switch (authority) {
      case 'strategic': return <Crown className="h-4 w-4" />
      case 'tactical': return <Shield className="h-4 w-4" />
      case 'technical': return <Settings className="h-4 w-4" />
      case 'business': return <Target className="h-4 w-4" />
      case 'risk': return <AlertTriangle className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getAuthorityColor = (authority) => {
    switch (authority) {
      case 'strategic': return 'text-purple-600 bg-purple-100'
      case 'tactical': return 'text-blue-600 bg-blue-100'
      case 'technical': return 'text-green-600 bg-green-100'
      case 'business': return 'text-orange-600 bg-orange-100'
      case 'risk': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            ガバナンス委員会シミュレーター
          </CardTitle>
          <CardDescription>
            プロジェクトガバナンス委員会の意思決定プロセスを実演・学習
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">委員会設定</TabsTrigger>
              <TabsTrigger value="meeting">会議シミュレーション</TabsTrigger>
              <TabsTrigger value="decisions">決定履歴</TabsTrigger>
              <TabsTrigger value="analytics">パフォーマンス分析</TabsTrigger>
            </TabsList>

            {/* 委員会設定 */}
            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    委員会メンバー構成
                  </CardTitle>
                  <CardDescription>
                    ガバナンス委員会のメンバーと権限を設定
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {committeeMembers.map((member) => (
                      <Card key={member.id} className={`border-2 ${member.present ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-medium">投票権重</div>
                                <div className="text-lg font-bold text-blue-600">{member.votingWeight}%</div>
                              </div>
                              <Badge className={getAuthorityColor(member.authority)}>
                                {getAuthorityIcon(member.authority)}
                                <span className="ml-1">{member.authority}</span>
                              </Badge>
                              <Button
                                onClick={() => toggleMemberPresence(member.id)}
                                variant={member.present ? "default" : "outline"}
                                size="sm"
                              >
                                {member.present ? '出席' : '欠席'}
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs text-gray-600 mb-1">専門分野:</div>
                            <div className="flex gap-1">
                              {member.expertise.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert className={calculateQuorum() >= 50 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      <strong>現在の定足数: {calculateQuorum()}%</strong>
                      {calculateQuorum() >= 50 ? ' (会議開催可能)' : ' (定足数不足 - 50%以上必要)'}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 会議シミュレーション */}
            <TabsContent value="meeting" className="space-y-6">
              {!meetingInProgress ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      会議テンプレート選択
                    </CardTitle>
                    <CardDescription>
                      シミュレーションする意思決定シナリオを選択
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {decisionTemplates.map((template) => (
                        <Card key={template.id} className="border-2 border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                              </div>
                              <Badge className={getPriorityColor(template.priority)}>
                                {template.priority}
                              </Badge>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-gray-600">
                                必要定足数: {template.requiredQuorum}%
                              </div>
                              <div className="text-xs text-gray-600">
                                選択肢: {template.options.join(', ')}
                              </div>
                            </div>
                            <Button 
                              onClick={() => startMeeting(template)}
                              disabled={calculateQuorum() < template.requiredQuorum}
                              className="w-full"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              会議開始
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      会議進行中: {currentMeeting.title}
                    </CardTitle>
                    <CardDescription>
                      フェーズ: {currentMeeting.phase === 'discussion' ? '議論' : currentMeeting.phase === 'voting' ? '投票' : '完了'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>背景情報:</strong> {currentMeeting.backgroundInfo}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">出席者</h3>
                        <div className="space-y-2">
                          {currentMeeting.attendees.map((member) => (
                            <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{member.name}</span>
                              <Badge variant="outline" className="text-xs ml-auto">
                                {member.votingWeight}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">決定事項</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">{currentMeeting.description}</p>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">選択肢:</div>
                            {currentMeeting.options.map((option, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {currentMeeting.phase === 'discussion' && (
                      <div className="flex justify-center">
                        <Button onClick={moveToVoting} size="lg">
                          <Vote className="h-4 w-4 mr-2" />
                          投票に進む
                        </Button>
                      </div>
                    )}

                    {currentMeeting.phase === 'voting' && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">投票</h3>
                        {currentMeeting.attendees.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.votingWeight}%
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {currentMeeting.options.map((option) => (
                                <Button
                                  key={option}
                                  onClick={() => castVote(member.id, option)}
                                  variant={votingResults[member.id] === option ? "default" : "outline"}
                                  size="sm"
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-center gap-4">
                          <Button 
                            onClick={finalizeDecision}
                            disabled={Object.keys(votingResults).length < currentMeeting.attendees.length}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            決定確定
                          </Button>
                          <Button onClick={endMeeting} variant="outline">
                            <XCircle className="h-4 w-4 mr-2" />
                            会議終了
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentMeeting.phase === 'completed' && (
                      <div className="space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            <strong>決定結果:</strong> {currentMeeting.finalDecision.finalDecision}
                            {currentMeeting.finalDecision.passed ? ' (可決)' : ' (否決)'}
                          </AlertDescription>
                        </Alert>

                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">投票結果詳細</h3>
                          <div className="space-y-2">
                            {currentMeeting.finalDecision.votingResults.map((result, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{result.option}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={result.percentage} className="w-20" />
                                  <span className="text-sm font-medium">{result.percentage}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button onClick={endMeeting}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            新しい会議
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 決定履歴 */}
            <TabsContent value="decisions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    決定履歴
                  </CardTitle>
                  <CardDescription>
                    過去の委員会決定とその結果
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {decisions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      まだ決定履歴がありません。
                      <br />
                      会議シミュレーションを実行して決定履歴を作成してください。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {decisions.map((decision) => (
                        <Card key={decision.id} className="border-2 border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-medium text-gray-900">{decision.title}</h3>
                                <p className="text-sm text-gray-600">{decision.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={decision.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {decision.passed ? '可決' : '否決'}
                                </Badge>
                                <Badge className={getPriorityColor(decision.priority)}>
                                  {decision.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">最終決定:</div>
                                <div className="font-medium">{decision.finalDecision}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 mb-1">決定日時:</div>
                                <div className="text-sm">{new Date(decision.completedAt).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="text-xs text-gray-600 mb-2">投票結果:</div>
                              <div className="space-y-1">
                                {decision.votingResults.map((result, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span>{result.option}</span>
                                    <span className="font-medium">{result.percentage}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* パフォーマンス分析 */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    委員会パフォーマンス分析
                  </CardTitle>
                  <CardDescription>
                    委員会の意思決定効率と傾向の分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">月次活動履歴</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={meetingHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="meetings" stroke="#3b82f6" name="会議数" />
                          <Line type="monotone" dataKey="decisions" stroke="#10b981" name="決定数" />
                          <Line type="monotone" dataKey="approval" stroke="#f59e0b" name="承認率%" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">決定結果分布</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={decisionDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {decisionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">月間会議数</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">4.2</div>
                        <div className="text-xs text-blue-600">平均</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">承認率</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">86%</div>
                        <div className="text-xs text-green-600">6ヶ月平均</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">平均出席率</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">92%</div>
                        <div className="text-xs text-purple-600">定足数達成</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">平均会議時間</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">1.8h</div>
                        <div className="text-xs text-orange-600">前月比 -15%</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>改善提案:</strong> 承認率が86%と良好ですが、月間会議数が4.2回と多めです。
                      定期会議の頻度見直しと事前審査プロセスの導入を検討してください。
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default GovernanceCommitteeSimulator