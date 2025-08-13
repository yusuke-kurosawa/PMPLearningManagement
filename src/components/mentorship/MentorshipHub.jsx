import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Star,
  MessageSquare,
  _Calendar,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  Search,
  Heart,
  Trophy,
  Award,
  _BookOpen,
  Video,
  _Phone,
  _Mail,
  CheckCircle,
  AlertCircle,
  _User,
  Target,
  TrendingUp,
  Globe,
  _Languages,
  Building,
} from 'lucide-react'

const MentorshipHub = () => {
  const [connections, setConnections] = useState([])
  const [activeTab, setActiveTab] = useState('find-mentor') // find-mentor, my-connections, become-mentor
  const [mentors, setMentors] = useState([])
  const [filteredMentors, setFilteredMentors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    industry: '',
    experience: '',
    location: '',
    availability: '',
    language: '',
  })
  //   const [userProfile, setUserProfile] = useState({ // TODO: Will be used in future
  //     role: 'learner',
  //     experience: 'beginner',
  //     goals: [],
  //     industry: '',
  //     location: '',
  //   })
  //   const [connections, setConnections] = useState([]) // TODO: Will be used in future
  const [mentorshipRequests, setMentorshipRequests] = useState([])

  // Mock mentor data
  const mockMentors = [
    {
      id: 'm1',
      name: '田中 健太郎',
      title: 'シニアプロジェクトマネージャー',
      company: 'テックイノベーション株式会社',
      experience: 12,
      industry: ['IT', 'フィンテック'],
      location: '東京',
      languages: ['日本語', '英語'],
      rating: 4.9,
      reviewCount: 127,
      specialties: ['アジャイル開発', 'デジタル変革', 'チームマネジメント'],
      certifications: ['PMP', 'CSM', 'SAFe'],
      menteeCount: 45,
      successRate: 94,
      availability: 'weekends',
      priceRange: '無料',
      bio: '12年間のIT業界経験を持ち、特にアジャイル開発とデジタル変革プロジェクトを専門としています。これまで50以上のプロジェクトを成功に導き、現在はメンタリングを通じて次世代のPMを育成しています。',
      achievements: [
        '年間最優秀PMアワード受賞（2023）',
        'Fortune 500企業でのプロジェクト成功率95%',
        'メンティの平均年収向上率35%',
      ],
      communicationStyle: 'practical',
      avatar: '🧑‍💼',
      status: 'available',
      lastActive: '2時間前',
      responseTime: '通常2時間以内',
      sessionTypes: ['1対1メンタリング', 'グループセッション', 'プロジェクトレビュー'],
    },
    {
      id: 'm2',
      name: '佐藤 美恵',
      title: 'グローバル PMO ディレクター',
      company: '国際コンサルティング',
      experience: 15,
      industry: ['コンサルティング', '製造業', 'ヘルスケア'],
      location: '大阪',
      languages: ['日本語', '英語', '中国語'],
      rating: 4.8,
      reviewCount: 89,
      specialties: ['プロジェクトポートフォリオ', '国際プロジェクト', 'PMO構築'],
      certifications: ['PMP', 'PgMP', 'PfMP'],
      menteeCount: 32,
      successRate: 91,
      availability: 'evenings',
      priceRange: '¥5,000-10,000/時',
      bio: '15年間でグローバル企業のPMOを複数立ち上げ、国際的なプロジェクトマネジメントのエキスパートとして活動。特に多文化チームでのプロジェクト運営に強み。',
      achievements: ['PMI Global Award受賞', '3つの国でPMO設立', 'メンティの海外赴任成功率80%'],
      communicationStyle: 'structured',
      avatar: '👩‍💼',
      status: 'busy',
      lastActive: '30分前',
      responseTime: '通常4時間以内',
      sessionTypes: ['戦略セッション', 'キャリア相談', '国際プロジェクト指導'],
    },
    {
      id: 'm3',
      name: 'マイケル・ジョンソン',
      title: 'シニア・テクニカルPM',
      company: 'グローバルテック',
      experience: 8,
      industry: ['AI/ML', 'クラウド', 'セキュリティ'],
      location: 'リモート（米国）',
      languages: ['英語', '日本語'],
      rating: 4.7,
      reviewCount: 156,
      specialties: ['テクニカルPM', 'AI/MLプロジェクト', 'クラウド移行'],
      certifications: ['PMP', 'AWS Certified', 'Google Cloud Professional'],
      menteeCount: 28,
      successRate: 89,
      availability: 'flexible',
      priceRange: '$50-100/時',
      bio: 'Silicon ValleyでAI/MLプロジェクトを多数手掛けるテクニカルPM。日本企業との協業経験も豊富で、技術とビジネスの架け橋として活動。',
      achievements: [
        'テック企業でのプロダクト成功率92%',
        'AI関連特許3件保有',
        'カンファレンス登壇50回以上',
      ],
      communicationStyle: 'technical',
      avatar: '👨‍💻',
      status: 'available',
      lastActive: '1時間前',
      responseTime: '通常6時間以内（時差あり）',
      sessionTypes: ['テクニカル指導', 'プロダクト戦略', 'キャリア相談'],
    },
  ]

  useEffect(() => {
    setMentors(mockMentors)
    setFilteredMentors(mockMentors)
  }, [])

  useEffect(() => {
    let filtered = mentors

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          mentor.industry.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filters
    if (filters.industry) {
      filtered = filtered.filter((mentor) => mentor.industry.includes(filters.industry))
    }

    if (filters.experience) {
      const expMap = { junior: [0, 5], mid: [6, 10], senior: [11, 20] }
      const [min, max] = expMap[filters.experience] || [0, 100]
      filtered = filtered.filter((mentor) => mentor.experience >= min && mentor.experience <= max)
    }

    if (filters.availability) {
      filtered = filtered.filter((mentor) => mentor.availability === filters.availability)
    }

    if (filters.language) {
      filtered = filtered.filter((mentor) => mentor.languages.includes(filters.language))
    }

    setFilteredMentors(filtered)
  }, [mentors, searchQuery, filters])

  const sendMentorshipRequest = useCallback(
    async (mentorId) => {
      // Mock request sending
      const newRequest = {
        id: Date.now(),
        mentorId,
        mentorName: mentors.find((m) => m.id === mentorId)?.name,
        status: 'pending',
        message: '',
        timestamp: new Date().toISOString(),
        proposedTime: null,
      }

      setMentorshipRequests((prev) => [...prev, newRequest])

      // Show success message
      alert('メンタリング申請を送信しました。メンターからの返信をお待ちください。')
    },
    [mentors]
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100'
      case 'busy':
        return 'text-yellow-600 bg-yellow-100'
      case 'offline':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getCommunicationStyleIcon = (style) => {
    switch (style) {
      case 'practical':
        return '🎯'
      case 'structured':
        return '📋'
      case 'technical':
        return '⚙️'
      default:
        return '💬'
    }
  }

  const renderFindMentor = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="メンター、スキル、業界で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Filter className="mr-2 h-4 w-4" />
            フィルター
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <select
            value={filters.industry}
            onChange={(e) => setFilters((prev) => ({ ...prev, industry: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">業界</option>
            <option value="IT">IT</option>
            <option value="コンサルティング">コンサルティング</option>
            <option value="製造業">製造業</option>
            <option value="ヘルスケア">ヘルスケア</option>
          </select>

          <select
            value={filters.experience}
            onChange={(e) => setFilters((prev) => ({ ...prev, experience: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">経験年数</option>
            <option value="junior">5年以下</option>
            <option value="mid">6-10年</option>
            <option value="senior">11年以上</option>
          </select>

          <select
            value={filters.availability}
            onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">対応時間</option>
            <option value="weekdays">平日</option>
            <option value="weekends">週末</option>
            <option value="evenings">夜間</option>
            <option value="flexible">柔軟</option>
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">言語</option>
            <option value="日本語">日本語</option>
            <option value="英語">英語</option>
            <option value="中国語">中国語</option>
          </select>

          <button
            onClick={() =>
              setFilters({
                industry: '',
                experience: '',
                location: '',
                availability: '',
                language: '',
              })
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            クリア
          </button>
        </div>
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center">
                  <div className="mr-3 text-4xl">{mentor.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{mentor.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{mentor.title}</p>
                  </div>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(mentor.status)}`}
                >
                  {mentor.status === 'available'
                    ? '対応可能'
                    : mentor.status === 'busy'
                      ? '多忙'
                      : 'オフライン'}
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Building className="mr-1 h-4 w-4" />
                  {mentor.company}
                </div>
                <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {mentor.experience}年の経験 • {mentor.industry.join(', ')}
                </div>
                <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="mr-1 h-4 w-4" />
                  {mentor.location} • {mentor.languages.join(', ')}
                </div>
              </div>

              <div className="mb-4 flex items-center">
                <div className="mr-4 flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                  <span className="ml-1 text-xs text-gray-500">({mentor.reviewCount})</span>
                </div>
                <div className="mr-4 flex items-center">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="ml-1 text-sm">{mentor.menteeCount}人指導</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm">{mentor.successRate}%成功率</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {mentor.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4 line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
                {mentor.bio}
              </div>

              <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {mentor.responseTime}
                </div>
                <div className="flex items-center">
                  <span>
                    {getCommunicationStyleIcon(mentor.communicationStyle)}
                    {mentor.communicationStyle === 'practical'
                      ? '実践型'
                      : mentor.communicationStyle === 'structured'
                        ? '構造型'
                        : '技術型'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => sendMentorshipRequest(mentor.id)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  メンタリング申請
                </button>
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            条件に合うメンターが見つかりません
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            検索条件を調整するか、フィルターをクリアしてください
          </p>
        </div>
      )}
    </div>
  )

  const renderMyConnections = () => (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          進行中のメンタリング
        </h2>

        {connections.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">
              まだメンタリングセッションがありません。メンターを探してみましょう。
            </p>
            <button
              onClick={() => setActiveTab('find-mentor')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              メンターを探す
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">{connection.avatar}</div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {connection.nextSession}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                      <Video className="mr-1 inline h-4 w-4" />
                      セッション開始
                    </button>
                    <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Requests */}
      {mentorshipRequests.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            メンタリング申請状況
          </h2>
          <div className="space-y-3">
            {mentorshipRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {request.mentorName}
                  </span>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">への申請</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">承認待ち</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderBecomeMentor = () => (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-8 shadow dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="mb-6 text-center">
          <Award className="mx-auto mb-4 h-16 w-16 text-purple-600" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            メンターになりませんか？
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            あなたの経験とスキルで次世代のPMを育成しましょう
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">追加収入</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                月5-20万円の副収入を得られます
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <Heart className="mx-auto mb-2 h-8 w-8 text-red-600" />
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">やりがい</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                次世代PMの成長を直接サポート
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <Globe className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">ネットワーク</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                業界のリーダーとの繋がり構築
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-medium text-white hover:bg-purple-700">
            メンター申請する
          </button>
          <p className="mt-2 text-sm text-gray-500">申請から審査完了まで通常3-5営業日</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">メンター要件</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">必須要件</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                PMP認定資格保有
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                5年以上のPM実務経験
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                過去3年以内のプロジェクト成功実績
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                メンタリング経験（推奨）
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">期待する活動</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Target className="mr-2 h-4 w-4 text-blue-500" />
                月2-4時間のメンタリングセッション
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Target className="mr-2 h-4 w-4 text-blue-500" />
                学習者からの質問への回答
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Target className="mr-2 h-4 w-4 text-blue-500" />
                キャリア相談とガイダンス
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Target className="mr-2 h-4 w-4 text-blue-500" />
                プロジェクト課題の相談対応
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">メンターシップハブ</h1>
          </div>
          <p className="mx-auto max-w-3xl text-gray-600 dark:text-gray-300">
            経験豊富なプロジェクトマネージャーとのマンツーマン指導で、実践的なスキルと深い洞察を身につけましょう
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('find-mentor')}
                className={`border-b-2 px-2 py-4 text-sm font-medium ${
                  activeTab === 'find-mentor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Search className="mr-1 inline h-4 w-4" />
                メンターを探す
              </button>
              <button
                onClick={() => setActiveTab('my-connections')}
                className={`border-b-2 px-2 py-4 text-sm font-medium ${
                  activeTab === 'my-connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="mr-1 inline h-4 w-4" />
                マイメンタリング
                {mentorshipRequests.length > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                    {mentorshipRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('become-mentor')}
                className={`border-b-2 px-2 py-4 text-sm font-medium ${
                  activeTab === 'become-mentor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Award className="mr-1 inline h-4 w-4" />
                メンターになる
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'find-mentor' && renderFindMentor()}
            {activeTab === 'my-connections' && renderMyConnections()}
            {activeTab === 'become-mentor' && renderBecomeMentor()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorshipHub
