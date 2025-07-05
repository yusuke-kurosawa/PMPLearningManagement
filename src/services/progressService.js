// progressService.js - 学習進捗の永続化とデータ管理
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pmp_learning_progress';

export const processCategories = {
  integration: '統合管理',
  scope: 'スコープ管理',
  schedule: 'スケジュール管理',
  cost: 'コスト管理',
  quality: '品質管理',
  resource: '資源管理',
  communications: 'コミュニケーション管理',
  risk: 'リスク管理',
  procurement: '調達管理',
  stakeholder: 'ステークホルダー管理'
};

export const processGroups = {
  initiating: '立ち上げ',
  planning: '計画',
  executing: '実行',
  monitoring: '監視・コントロール',
  closing: '終結'
};

class ProgressService {
  constructor() {
    this.initialized = false;
    this.processData = this.initializeProcessData();
  }

  // プロセスデータの初期化
  initializeProcessData() {
    const knowledgeAreas = [
      { id: 'integration', name: '統合マネジメント' },
      { id: 'scope', name: 'スコープ・マネジメント' },
      { id: 'schedule', name: 'スケジュール・マネジメント' },
      { id: 'cost', name: 'コスト・マネジメント' },
      { id: 'quality', name: '品質マネジメント' },
      { id: 'resource', name: '資源マネジメント' },
      { id: 'communications', name: 'コミュニケーション・マネジメント' },
      { id: 'risk', name: 'リスク・マネジメント' },
      { id: 'procurement', name: '調達マネジメント' },
      { id: 'stakeholder', name: 'ステークホルダー・マネジメント' }
    ];

    const processGroups = [
      { id: 'initiating', name: '立上げ' },
      { id: 'planning', name: '計画' },
      { id: 'executing', name: '実行' },
      { id: 'monitoring', name: '監視・コントロール' },
      { id: 'closing', name: '終結' }
    ];

    // 簡略化されたプロセスリスト（実際のPMBOKプロセス）
    const processes = [
      // 統合マネジメント
      { id: 'p1', name: 'プロジェクト憲章の作成', knowledgeArea: 'integration', processGroup: 'initiating' },
      { id: 'p2', name: 'プロジェクトマネジメント計画書の作成', knowledgeArea: 'integration', processGroup: 'planning' },
      { id: 'p3', name: 'プロジェクト作業の指揮・マネジメント', knowledgeArea: 'integration', processGroup: 'executing' },
      { id: 'p4', name: 'プロジェクト知識のマネジメント', knowledgeArea: 'integration', processGroup: 'executing' },
      { id: 'p5', name: 'プロジェクト作業の監視・コントロール', knowledgeArea: 'integration', processGroup: 'monitoring' },
      { id: 'p6', name: '統合変更管理', knowledgeArea: 'integration', processGroup: 'monitoring' },
      { id: 'p7', name: 'プロジェクトやフェーズの終結', knowledgeArea: 'integration', processGroup: 'closing' },
      // スコープ・マネジメント
      { id: 'p8', name: 'スコープ・マネジメントの計画', knowledgeArea: 'scope', processGroup: 'planning' },
      { id: 'p9', name: '要求事項の収集', knowledgeArea: 'scope', processGroup: 'planning' },
      { id: 'p10', name: 'スコープの定義', knowledgeArea: 'scope', processGroup: 'planning' },
      { id: 'p11', name: 'WBSの作成', knowledgeArea: 'scope', processGroup: 'planning' },
      { id: 'p12', name: 'スコープの妥当性確認', knowledgeArea: 'scope', processGroup: 'monitoring' },
      { id: 'p13', name: 'スコープのコントロール', knowledgeArea: 'scope', processGroup: 'monitoring' },
      // 他のプロセスも同様に追加...
    ];

    return { knowledgeAreas, processGroups, processes };
  }

  // 進捗データの読み込み
  async loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultProgress();
    } catch (error) {
      console.error('Error loading progress:', error);
      return this.getDefaultProgress();
    }
  }

  // 進捗データの保存
  async saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  // デフォルトの進捗データ
  getDefaultProgress() {
    return {
      knowledgeAreas: {},
      processGroups: {},
      processes: {},
      studySessions: [],
      goals: {},
      lastUpdated: null
    };
  }

  // 知識エリア別のプロセス取得
  getProcessesByKnowledgeArea(knowledgeAreaId) {
    return this.processData.processes.filter(
      p => p.knowledgeArea === knowledgeAreaId
    );
  }

  // プロセス群別のプロセス取得
  getProcessesByProcessGroup(processGroupId) {
    return this.processData.processes.filter(
      p => p.processGroup === processGroupId
    );
  }

  // 全プロセスの取得
  getAllProcesses() {
    return this.processData.processes;
  }

  // 知識エリア一覧の取得
  getKnowledgeAreas() {
    return this.processData.knowledgeAreas;
  }

  // プロセス群一覧の取得
  getProcessGroups() {
    return this.processData.processGroups;
  }

  // 特定のプロセスの進捗を取得
  getProcessProgress(processId) {
    const progress = this.loadProgress();
    return progress.processes?.[processId] || {
      completed: false,
      understanding: 0,
      notes: '',
      lastStudied: null
    };
  }

  // 学習統計の計算
  calculateStudyStats(studySessions, period = 'week') {
    const now = new Date();
    const periodDays = period === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const filteredSessions = studySessions.filter(
      session => new Date(session.date) >= startDate
    );

    // 日別の学習時間集計
    const dailyStats = {};
    filteredSessions.forEach(session => {
      const date = new Date(session.date).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = {
          duration: 0,
          processCount: 0,
          sessions: []
        };
      }
      dailyStats[date].duration += session.duration || 0;
      dailyStats[date].processCount += session.processCount || 0;
      dailyStats[date].sessions.push(session);
    });

    // 統計サマリー
    const totalDuration = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalProcesses = filteredSessions.reduce((sum, s) => sum + (s.processCount || 0), 0);
    const averageDuration = filteredSessions.length > 0 ? totalDuration / filteredSessions.length : 0;
    const studyDays = Object.keys(dailyStats).length;

    return {
      totalDuration,
      totalProcesses,
      averageDuration,
      studyDays,
      dailyStats,
      sessions: filteredSessions
    };
  }

  // 進捗データのエクスポート
  exportProgress() {
    const progress = this.loadProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pmp-progress-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // 進捗データのインポート
  async importProgress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const progress = JSON.parse(e.target.result);
          await this.saveProgress(progress);
          resolve(progress);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export const progressService = new ProgressService();

// カスタムフック
export const useProgress = () => {
  const [progress, setProgress] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const progressData = await progressService.loadProgress();
        setProgress(progressData);
        
        // 統計情報の計算
        const stats = calculateStatistics(progressData);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading progress data:', error);
        // エラーの場合もデフォルトデータで初期化
        const defaultProgress = progressService.getDefaultProgress();
        setProgress(defaultProgress);
        setStatistics(calculateStatistics(defaultProgress));
      }
    };
    
    loadData();
    
    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateStatistics = (progressData) => {
    const processes = progressService.getAllProcesses();
    const completedCount = Object.values(progressData.processes || {}).filter(p => p.completed).length;
    
    const categoryStats = {};
    Object.keys(processCategories).forEach(cat => {
      const catProcesses = processes.filter(p => p.knowledgeArea === cat);
      const completed = catProcesses.filter(p => progressData.processes?.[p.id]?.completed).length;
      categoryStats[cat] = { total: catProcesses.length, completed };
    });

    const groupStats = {};
    Object.keys(processGroups).forEach(group => {
      const groupProcesses = processes.filter(p => p.processGroup === group);
      const completed = groupProcesses.filter(p => progressData.processes?.[p.id]?.completed).length;
      groupStats[group] = { total: groupProcesses.length, completed };
    });

    const totalStudyTime = progressData.studySessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;

    return {
      overall: {
        completed: completedCount,
        total: processes.length,
        percentage: Math.round((completedCount / processes.length) * 100)
      },
      byCategory: categoryStats,
      byGroup: groupStats,
      studyTime: totalStudyTime,
      lastUpdated: progressData.lastUpdated
    };
  };

  const updateProgress = async (processId, progressData) => {
    const currentProgress = await progressService.loadProgress();
    if (!currentProgress.processes) {
      currentProgress.processes = {};
    }
    
    currentProgress.processes[processId] = {
      ...currentProgress.processes[processId],
      ...progressData,
      lastStudied: new Date().toISOString()
    };
    
    currentProgress.lastUpdated = new Date().toISOString();
    
    const success = await progressService.saveProgress(currentProgress);
    if (success) {
      setProgress(currentProgress);
      setStatistics(calculateStatistics(currentProgress));
    }
    return success;
  };

  const updateStudyTime = async (minutes) => {
    const currentProgress = await progressService.loadProgress();
    if (!currentProgress.studySessions) {
      currentProgress.studySessions = [];
    }
    
    currentProgress.studySessions.push({
      date: new Date().toISOString(),
      duration: minutes,
      processCount: 1
    });
    
    currentProgress.lastUpdated = new Date().toISOString();
    
    const success = await progressService.saveProgress(currentProgress);
    if (success) {
      setProgress(currentProgress);
      setStatistics(calculateStatistics(currentProgress));
    }
    return success;
  };

  const resetProgress = async () => {
    const defaultProgress = progressService.getDefaultProgress();
    const success = await progressService.saveProgress(defaultProgress);
    if (success) {
      setProgress(defaultProgress);
      setStatistics(calculateStatistics(defaultProgress));
    }
    return success;
  };

  return {
    progress,
    statistics,
    updateProgress,
    updateStudyTime,
    resetProgress
  };
};