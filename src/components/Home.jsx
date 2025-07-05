import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Network, Layers, ArrowRight, BookOpen, Sparkles, TrendingUp, Brain, GraduationCap } from 'lucide-react';

const Home = () => {
  const features = [
    {
      title: 'PMBOKマトリックスビュー',
      description: '知識エリアとプロセス群別に整理された49のPMBOKプロセスを表示するインタラクティブなマトリックス。検索、フィルタリング、詳細なITTO情報表示機能を備えています。',
      icon: Grid,
      link: '/matrix',
      color: 'bg-blue-500'
    },
    {
      title: 'ネットワークダイアグラム',
      description: 'ITTO関係性の力学的グラフ視覚化。プロセス、インプット、ツール、アウトプット間の接続をインタラクティブなフィルタリングで探索できます。',
      icon: Network,
      link: '/network',
      color: 'bg-green-500'
    },
    {
      title: '統合ビュー',
      description: 'マトリックスとネットワークの両方の視覚化を組み合わせた分割画面表示。包括的な分析のための調整可能なレイアウトとフルスクリーンオプション。',
      icon: Layers,
      link: '/integrated',
      color: 'bg-purple-500'
    },
    {
      title: 'PMP用語集',
      description: 'PMP試験に必要な重要用語を網羅した検索可能な用語集。カテゴリ別フィルタリング、関連用語の表示、日英対応で効率的な学習をサポート。',
      icon: BookOpen,
      link: '/glossary',
      color: 'bg-orange-500'
    },
    {
      title: 'ビジュアライゼーションハブ',
      description: '新機能！プロセスフロー図、ヒートマップなど、様々な視点からPMBOKを理解できる強化されたビジュアライゼーション。',
      icon: Sparkles,
      link: '/visualizations',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      isNew: true
    },
    {
      title: '学習進捗ダッシュボード',
      description: '新機能！学習の進捗状況を可視化し、知識エリア別・プロセス群別の習熟度を管理。効率的な学習計画をサポート。',
      icon: TrendingUp,
      link: '/progress',
      color: 'bg-teal-500',
      isNew: true
    },
    {
      title: 'フラッシュカード学習',
      description: '新機能！ITTOを効率的に暗記するインタラクティブなフラッシュカード。間隔反復学習アルゴリズムで記憶の定着をサポート。',
      icon: Brain,
      link: '/flashcards',
      color: 'bg-indigo-500',
      isNew: true
    },
    {
      title: 'PMP模擬試験',
      description: '新機能！実際のPMP試験形式で練習。180問・230分のフル模擬試験で、詳細な結果分析と弱点把握が可能。',
      icon: GraduationCap,
      link: '/mock-exam',
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      isNew: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PMBOK第6版 学習管理システム
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            プロセス、インプット、ツールと技法、アウトプットのインタラクティブな視覚化を通じて、プロジェクトマネジメント知識体系（PMBOK）を探索・理解できます。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.link}
                to={feature.link}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 relative overflow-hidden"
              >
                {feature.isNew && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-4 py-1 transform rotate-45 translate-x-8 translate-y-4">
                    NEW
                  </div>
                )}
                <div className="p-6">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    <span>詳しく見る</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">PMBOK第6版の概要</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">学習のヒント</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>マトリックスビューを使用して、PMBOKプロセスの全体構造を理解しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>ネットワークダイアグラムを探索して、インプット、ツール、アウトプット間の関係を視覚化しましょう</span>
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
  );
};

export default Home;