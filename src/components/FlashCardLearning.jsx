import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Filter, Shuffle, Trophy, TrendingUp, Save } from 'lucide-react';
import FlashCard from './FlashCard';
import { processCategories, processGroups, progressService } from '../services/progressService';

const FlashCardLearning = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [studyMode, setStudyMode] = useState('sequential'); // sequential, random, spaced
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    startTime: Date.now()
  });
  const [cardAnswers, setCardAnswers] = useState({});

  // PMBOKMatrixからプロセスデータを取得
  const getAllProcesses = () => {
    const processes = [];
    const knowledgeAreas = [
      { id: 'integration', name: 'プロジェクト統合マネジメント' },
      { id: 'scope', name: 'プロジェクト・スコープ・マネジメント' },
      { id: 'schedule', name: 'プロジェクト・スケジュール・マネジメント' },
      { id: 'cost', name: 'プロジェクト・コスト・マネジメント' },
      { id: 'quality', name: 'プロジェクト品質マネジメント' },
      { id: 'resource', name: 'プロジェクト資源マネジメント' },
      { id: 'communications', name: 'プロジェクト・コミュニケーション・マネジメント' },
      { id: 'risk', name: 'プロジェクト・リスク・マネジメント' },
      { id: 'procurement', name: 'プロジェクト調達マネジメント' },
      { id: 'stakeholder', name: 'プロジェクト・ステークホルダー・マネジメント' }
    ];

    const processData = {
      integration: {
        '立上げ': ['プロジェクト憲章の作成'],
        '計画': ['プロジェクトマネジメント計画書の作成'],
        '実行': ['プロジェクト作業の指揮・マネジメント', 'プロジェクト知識のマネジメント'],
        '監視・コントロール': ['プロジェクト作業の監視・コントロール', '統合変更管理'],
        '終結': ['プロジェクトやフェーズの終結']
      },
      scope: {
        '計画': ['スコープ・マネジメントの計画', '要求事項の収集', 'スコープの定義', 'WBSの作成'],
        '監視・コントロール': ['スコープの妥当性確認', 'スコープのコントロール']
      },
      schedule: {
        '計画': ['スケジュール・マネジメントの計画', 'アクティビティの定義', 'アクティビティの順序設定', 'アクティビティの所要期間見積り', 'スケジュールの作成'],
        '監視・コントロール': ['スケジュールのコントロール']
      },
      cost: {
        '計画': ['コスト・マネジメントの計画', 'コストの見積り', '予算の設定'],
        '監視・コントロール': ['コストのコントロール']
      },
      quality: {
        '計画': ['品質マネジメントの計画'],
        '実行': ['品質のマネジメント'],
        '監視・コントロール': ['品質のコントロール']
      },
      resource: {
        '計画': ['資源マネジメントの計画', 'アクティビティ資源の見積り'],
        '実行': ['資源の獲得', 'チームの育成', 'チームのマネジメント'],
        '監視・コントロール': ['資源のコントロール']
      },
      communications: {
        '計画': ['コミュニケーション・マネジメントの計画'],
        '実行': ['コミュニケーションのマネジメント'],
        '監視・コントロール': ['コミュニケーションの監視']
      },
      risk: {
        '計画': ['リスク・マネジメントの計画', 'リスクの特定', '定性的リスク分析', '定量的リスク分析', 'リスク対応の計画'],
        '実行': ['リスク対応策の実行'],
        '監視・コントロール': ['リスクの監視']
      },
      procurement: {
        '計画': ['調達マネジメントの計画'],
        '実行': ['調達の実行'],
        '監視・コントロール': ['調達のコントロール']
      },
      stakeholder: {
        '立上げ': ['ステークホルダーの特定'],
        '計画': ['ステークホルダー・エンゲージメントの計画'],
        '実行': ['ステークホルダー・エンゲージメントのマネジメント'],
        '監視・コントロール': ['ステークホルダー・エンゲージメントの監視']
      }
    };

    // ITTOデータ（サンプル - 実際にはPMBOKMatrixから取得）
    const processDetails = {
      'プロジェクト憲章の作成': {
        inputs: ['ビジネス文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
        tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
        outputs: ['プロジェクト憲章', '前提条件ログ']
      }
      // 他のプロセスのITTOも同様に定義...
    };

    Object.entries(processData).forEach(([areaId, groups]) => {
      const area = knowledgeAreas.find(a => a.id === areaId);
      Object.entries(groups).forEach(([group, processList]) => {
        processList.forEach((processName, index) => {
          processes.push({
            id: `${areaId}-${group}-${index}`,
            name: processName,
            knowledgeArea: area.name,
            knowledgeAreaId: areaId,
            processGroup: group,
            ...processDetails[processName] || { inputs: [], tools: [], outputs: [] }
          });
        });
      });
    });

    return processes;
  };

  const allProcesses = useMemo(() => getAllProcesses(), []);

  const filteredProcesses = useMemo(() => {
    let filtered = allProcesses;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.knowledgeAreaId === selectedCategory);
    }

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(p => p.processGroup === selectedGroup);
    }

    if (studyMode === 'random') {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    } else if (studyMode === 'spaced') {
      // 間隔反復学習: 間違えたカードを優先的に表示
      filtered = [...filtered].sort((a, b) => {
        const aIncorrect = cardAnswers[a.id]?.incorrect || 0;
        const bIncorrect = cardAnswers[b.id]?.incorrect || 0;
        return bIncorrect - aIncorrect;
      });
    }

    return filtered;
  }, [allProcesses, selectedCategory, selectedGroup, studyMode, cardAnswers]);

  useEffect(() => {
    setSessionStats(prev => ({
      ...prev,
      totalCards: filteredProcesses.length
    }));
    setCurrentCardIndex(0);
  }, [filteredProcesses]);

  const handleNext = () => {
    if (currentCardIndex < filteredProcesses.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleAnswer = (processId, isCorrect) => {
    setCardAnswers(prev => ({
      ...prev,
      [processId]: {
        correct: (prev[processId]?.correct || 0) + (isCorrect ? 1 : 0),
        incorrect: (prev[processId]?.incorrect || 0) + (isCorrect ? 0 : 1),
        lastAnswered: Date.now()
      }
    }));

    setSessionStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1)
    }));
  };

  const getSessionDuration = () => {
    const duration = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}分${seconds}秒`;
  };

  const getAccuracy = () => {
    const total = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    if (total === 0) return 0;
    return Math.round((sessionStats.correctAnswers / total) * 100);
  };

  const handleEndSession = () => {
    if (sessionStats.correctAnswers + sessionStats.incorrectAnswers > 0) {
      progressService.recordFlashCardSession({
        duration: Math.floor((Date.now() - sessionStats.startTime) / 1000),
        totalCards: sessionStats.correctAnswers + sessionStats.incorrectAnswers,
        correctAnswers: sessionStats.correctAnswers,
        incorrectAnswers: sessionStats.incorrectAnswers,
        accuracy: getAccuracy(),
        category: selectedCategory,
        processGroup: selectedGroup,
        mode: studyMode
      });
    }
    navigate('/');
  };

  if (filteredProcesses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">選択した条件に該当するカードがありません。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                フラッシュカード学習
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>正解率: {getAccuracy()}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>{sessionStats.correctAnswers} / {sessionStats.correctAnswers + sessionStats.incorrectAnswers}</span>
                </div>
                <span className="text-gray-600">{getSessionDuration()}</span>
                <button
                  onClick={handleEndSession}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
                >
                  <Save className="w-3 h-3" />
                  終了
                </button>
              </div>
            </div>

            {/* フィルターコントロール */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  知識エリア
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  {Object.entries(processCategories).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロセス群
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  {Object.entries(processGroups).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学習モード
                </label>
                <select
                  value={studyMode}
                  onChange={(e) => setStudyMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sequential">順番に学習</option>
                  <option value="random">ランダム</option>
                  <option value="spaced">間隔反復学習</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* フラッシュカード */}
        <div className="card-flip-container">
          {filteredProcesses.length > 0 && (
            <FlashCard
              process={filteredProcesses[currentCardIndex]}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onAnswer={handleAnswer}
              currentIndex={currentCardIndex}
              totalCards={filteredProcesses.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FlashCardLearning);