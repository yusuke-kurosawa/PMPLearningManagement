import React, { createContext, useContext, useState, useEffect } from 'react';
import { progressService } from '../services/progressService';

const LearningProgressContext = createContext();

export const useLearningProgress = () => {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within a LearningProgressProvider');
  }
  return context;
};

export const LearningProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({
    knowledgeAreas: {},
    processGroups: {},
    processes: {},
    studySessions: [],
    goals: {},
    lastUpdated: null
  });

  const [loading, setLoading] = useState(true);

  // 初期化
  useEffect(() => {
    loadProgress();
  }, []);

  // 進捗データの読み込み
  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await progressService.loadProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // 進捗データの保存
  const saveProgress = async (newProgress) => {
    try {
      const updatedProgress = {
        ...newProgress,
        lastUpdated: new Date().toISOString()
      };
      await progressService.saveProgress(updatedProgress);
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // プロセスの学習状態を更新
  const updateProcessProgress = async (processId, status) => {
    const newProgress = {
      ...progress,
      processes: {
        ...progress.processes,
        [processId]: {
          ...progress.processes[processId],
          status,
          lastStudied: new Date().toISOString(),
          studyCount: (progress.processes[processId]?.studyCount || 0) + 1
        }
      }
    };
    await saveProgress(newProgress);
  };

  // 学習セッションの記録
  const recordStudySession = async (session) => {
    const newProgress = {
      ...progress,
      studySessions: [...progress.studySessions, {
        ...session,
        id: Date.now().toString(),
        date: new Date().toISOString()
      }]
    };
    await saveProgress(newProgress);
  };

  // 知識エリアの進捗計算
  const calculateKnowledgeAreaProgress = (knowledgeAreaId) => {
    const processes = progressService.getProcessesByKnowledgeArea(knowledgeAreaId);
    if (!processes.length) return 0;

    const completedCount = processes.filter(
      p => progress.processes[p.id]?.status === 'completed'
    ).length;

    return (completedCount / processes.length) * 100;
  };

  // プロセス群の進捗計算
  const calculateProcessGroupProgress = (processGroupId) => {
    const processes = progressService.getProcessesByProcessGroup(processGroupId);
    if (!processes.length) return 0;

    const completedCount = processes.filter(
      p => progress.processes[p.id]?.status === 'completed'
    ).length;

    return (completedCount / processes.length) * 100;
  };

  // 全体の進捗計算
  const calculateOverallProgress = () => {
    const allProcesses = progressService.getAllProcesses();
    const completedCount = allProcesses.filter(
      p => progress.processes[p.id]?.status === 'completed'
    ).length;

    return (completedCount / allProcesses.length) * 100;
  };

  // 学習統計の取得
  const getStudyStats = (period = 'week') => {
    return progressService.calculateStudyStats(progress.studySessions, period);
  };

  // 目標の設定
  const setGoal = async (goalType, target, deadline) => {
    const newProgress = {
      ...progress,
      goals: {
        ...progress.goals,
        [goalType]: {
          target,
          deadline,
          created: new Date().toISOString()
        }
      }
    };
    await saveProgress(newProgress);
  };

  // 進捗のリセット
  const resetProgress = async () => {
    const emptyProgress = {
      knowledgeAreas: {},
      processGroups: {},
      processes: {},
      studySessions: [],
      goals: {},
      lastUpdated: new Date().toISOString()
    };
    await saveProgress(emptyProgress);
  };

  const value = {
    progress,
    loading,
    updateProcessProgress,
    recordStudySession,
    calculateKnowledgeAreaProgress,
    calculateProcessGroupProgress,
    calculateOverallProgress,
    getStudyStats,
    setGoal,
    resetProgress,
    loadProgress
  };

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
};