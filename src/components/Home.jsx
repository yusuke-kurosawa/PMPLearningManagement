import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Network, Layers, ArrowRight } from 'lucide-react';

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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PMBOK第6版 学習管理システム
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            プロセス、インプット、ツールと技法、アウトプットのインタラクティブな視覚化を通じて、プロジェクトマネジメント知識体系（PMBOK）を探索・理解できます。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.link}
                to={feature.link}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>詳しく見る</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">PMBOK第6版の概要</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">49</div>
              <div className="text-gray-600">プロセス</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10</div>
              <div className="text-gray-600">知識エリア</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">5</div>
              <div className="text-gray-600">プロセス群</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">ITTO</div>
              <div className="text-gray-600">フレームワーク</div>
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">学習のヒント</h3>
          <ul className="space-y-2 text-sm text-gray-700">
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