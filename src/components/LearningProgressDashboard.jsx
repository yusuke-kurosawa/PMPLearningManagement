import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle2,
  RefreshCw,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useProgress, processCategories, processGroups } from '../services/progressService';

const LearningProgressDashboard = () => {
  const navigate = useNavigate();
  const { progress, statistics, updateStudyTime, resetProgress } = useProgress();
  const [selectedView, setSelectedView] = useState('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // データがロード中または未初期化の場合のローディング表示
  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">進捗データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未開始';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-blue-600';
    if (percentage >= 40) return 'bg-yellow-600';
    if (percentage >= 20) return 'bg-orange-600';
    return 'bg-gray-400';
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetProgress();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              学習進捗ダッシュボード
            </h1>
            <button
              onClick={() => setSelectedView(selectedView === 'overview' ? 'detailed' : 'overview')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {selectedView === 'overview' ? '詳細表示' : '概要表示'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-600" />
                <span className={`text-2xl font-bold ${getProgressColor(statistics.overall.percentage).split(' ')[0]}`}>
                  {statistics.overall.percentage}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">全体進捗率</h3>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.overall.completed}/{statistics.overall.total} プロセス完了
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {statistics.overall.completed}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">完了プロセス</h3>
              <p className="text-xs text-gray-600 mt-1">
                残り {statistics.overall.total - statistics.overall.completed} プロセス
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-purple-600" />
                <span className="text-lg font-bold text-purple-600">
                  {formatStudyTime(statistics.studyTime)}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">総学習時間</h3>
              <p className="text-xs text-gray-600 mt-1">
                平均 {Math.round(statistics.studyTime / Math.max(statistics.overall.completed, 1))}分/プロセス
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">
                  {formatDate(statistics.lastUpdated).split(' ')[0]}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">最終更新</h3>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(statistics.lastUpdated).split(' ')[1]}
              </p>
            </div>
          </div>

          {selectedView === 'overview' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  知識エリア別進捗
                </h2>
                <div className="space-y-3">
                  {Object.entries(processCategories).map(([key, name]) => {
                    const stat = statistics.byCategory[key] || { completed: 0, total: 0 };
                    const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                    
                    return (
                      <div key={key} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{name}</span>
                          <span className="text-sm text-gray-600">
                            {stat.completed}/{stat.total} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  プロセス群別進捗
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(processGroups).map(([key, name]) => {
                    const stat = statistics.byGroup[key] || { completed: 0, total: 0 };
                    const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                    
                    return (
                      <div key={key} className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-2">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${percentage * 2.26} 226`}
                              className={getProgressBarColor(percentage)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold">{percentage}%</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-700">{name}</p>
                        <p className="text-xs text-gray-600">{stat.completed}/{stat.total}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">詳細進捗データ</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        完了数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        進捗率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(processCategories).map(([key, name]) => {
                      const stat = statistics.byCategory[key] || { completed: 0, total: 0 };
                      const percentage = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                      
                      return (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.completed} / {stat.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressBarColor(percentage)}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProgressColor(percentage)}`}>
                              {percentage === 100 ? '完了' : percentage >= 50 ? '進行中' : '開始'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/matrix')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                学習を続ける
              </button>
              <button
                onClick={() => navigate('/integrated')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                <Award className="w-4 h-4" />
                統合ビューで確認
              </button>
            </div>
            
            <button
              onClick={handleReset}
              onBlur={() => setTimeout(() => setShowResetConfirm(false), 200)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showResetConfirm 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {showResetConfirm ? '本当にリセットしますか？' : '進捗をリセット'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">学習のヒント</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">効率的な学習方法</h3>
              <p className="text-sm text-blue-700">
                知識エリアごとに集中して学習し、プロセス間の関係性を理解することが重要です。
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">ITTOの理解</h3>
              <p className="text-sm text-green-700">
                各プロセスのインプット、ツールと技法、アウトプットの流れを把握しましょう。
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">実践的な応用</h3>
              <p className="text-sm text-purple-700">
                学んだ知識を実際のプロジェクトに当てはめて考えることで、理解が深まります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LearningProgressDashboard);