/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ import React from 'react'
import { Link } from 'react-router-dom'
import {
  Grid,
  Network,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  Brain,
  GraduationCap,
  Users,
  Play,
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      title: 'PMBOKマトリックスビュー',
      description:
        '知識エリアとプロセス群別に整理された49のPMBOKプロセスを表示するインタラクティブなマトリックス。検索、フィルタリング、詳細なITTO情報表示機能を備えています。',
      icon: Grid,
      link: '/matrix',
      color: 'bg-blue-500',
    },
    {
      title: 'ネットワークダイアグラム',
      description:
        'ITTO関係性の力学的グラフ視覚化。プロセス、インプット、ツール、アウトプット間の接続をインタラクティブなフィルタリングで探索できます。',
      icon: Network,
      link: '/network',
      color: 'bg-green-500',
    },
    {
      title: '統合ビュー',
      description:
        'マトリックスとネットワークの両方の視覚化を組み合わせた分割画面表示。包括的な分析のための調整可能なレイアウトとフルスクリーンオプション。',
      icon: Layers,
      link: '/integrated',
      color: 'bg-purple-500',
    },
    {
      title: 'PMP用語集',
      description:
        'PMP試験に必要な重要用語を網羅した検索可能な用語集。カテゴリ別フィルタリング、関連用語の表示、日英対応で効率的な学習をサポート。',
      icon: BookOpen,
      link: '/glossary',
      color: 'bg-orange-500',
    },
    {
      title: 'ビジュアライゼーションハブ',
      description:
        '新機能！プロセスフロー図、ヒートマップなど、様々な視点からPMBOKを理解できる強化されたビジュアライゼーション。',
      icon: Sparkles,
      link: '/visualizations',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      isNew: true,
    },
    {
      title: '学習進捗ダッシュボード',
      description:
        '新機能！学習の進捗状況を可視化し、知識エリア別・プロセス群別の習熟度を管理。効率的な学習計画をサポート。',
      icon: TrendingUp,
      link: '/progress',
      color: 'bg-teal-500',
      isNew: true,
    },
    {
      title: 'フラッシュカード学習',
      description:
        '新機能！ITTOを効率的に暗記するインタラクティブなフラッシュカード。間隔反復学習アルゴリズムで記憶の定着をサポート。',
      icon: Brain,
      link: '/flashcards',
      color: 'bg-indigo-500',
      isNew: true,
    },
    {
      title: 'PMP模擬試験',
      description:
        '新機能！実際のPMP試験形式で練習。180問・230分のフル模擬試験で、詳細な結果分析と弱点把握が可能。',
      icon: GraduationCap,
      link: '/mock-exam',
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      isNew: true,
    },
    {
      title: 'AIコーチング',
      description:
        '革新機能！あなた専用のAIコーチが学習を分析し、最適化された個別学習パスと継続的な指導を提供。PMP合格から長期キャリア成功まで完全サポート。',
      icon: Brain,
      link: '/ai-coaching',
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      isNew: true,
      highlight: true,
    },
    {
      title: 'リアルプロジェクト・シミュレーター',
      description:
        '革新機能！実際のプロジェクトシナリオでPMBOK知識を実践的に学習。リアルタイムの意思決定で本物のPMスキルを身につけましょう。',
      icon: Play,
      link: '/project-simulator',
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      isNew: true,
      highlight: true,
    },
    {
      title: 'メンターシップハブ',
      description:
        '革新機能！経験豊富なプロジェクトマネージャーとのマンツーマン指導。業界エキスパートから直接学び、実践的なスキルと深い洞察を身につけましょう。',
      icon: Users,
      link: '/mentorship',
      color: 'bg-gradient-to-r from-emerald-500 to-green-600',
      isNew: true,
      highlight: true,
    },
    {
      title: 'コラボレーション',
      description:
        '新機能！他の学習者と知識を共有。学習ノート、ディスカッション、学習グループで一緒に学習を進めましょう。',
      icon: Users,
      link: '/collaboration',
      color: 'bg-gradient-to-r from-pink-500 to-rose-500',
      isNew: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 transition-colors dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            PMBOK第6版 学習管理システム
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            プロセス、インプット、ツールと技法、アウトプットのインタラクティブな視覚化を通じて、プロジェクトマネジメント知識体系（PMBOK）を探索・理解できます。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.link}
                to={feature.link}
                className={`relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/50 ${
                  feature.highlight
                    ? 'ring-2 ring-purple-300 ring-offset-2 dark:ring-purple-500'
                    : ''
                }`}
              >
                {feature.isNew && (
                  <div
                    className={`absolute right-0 top-0 translate-x-8 translate-y-4 rotate-45 transform px-4 py-1 text-xs text-white ${
                      feature.highlight ? 'bg-purple-500' : 'bg-red-500'
                    }`}
                  >
                    {feature.highlight ? 'AI' : 'NEW'}
                  </div>
                )}
                <div className="p-6">
                  <div
                    className={`${feature.color} mb-4 flex h-12 w-12 items-center justify-center rounded-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold dark:text-white">{feature.title}</h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">{feature.description}</p>
                  <div className="flex items-center font-medium text-blue-600 dark:text-blue-400">
                    <span>詳しく見る</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <h2 className="mb-6 text-center text-2xl font-semibold dark:text-white">
            PMBOK第6版の概要
          </h2>
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-blue-600">49</div>
              <div className="text-gray-600 dark:text-gray-300">プロセス</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10</div>
              <div className="text-gray-600 dark:text-gray-300">知識エリア</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">5</div>
              <div className="text-gray-600 dark:text-gray-300">プロセス群</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">ITTO</div>
              <div className="text-gray-600 dark:text-gray-300">フレームワーク</div>
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h3 className="mb-3 text-lg font-semibold dark:text-white">学習のヒント</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>マトリックスビューを使用して、PMBOKプロセスの全体構造を理解しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                ネットワークダイアグラムを探索して、インプット、ツール、アウトプット間の関係を視覚化しましょう
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>統合ビューでは、より深い理解のために両方の視点を同時に確認できます</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>プロセスをクリックして詳細なITTO情報を確認し、依存関係を理解しましょう</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
