var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports } from "./react-vendor-Uy5hwzow.js";
import "./index-CZZZnLRW.js";
var __defProp2 = Object.defineProperty;
var __defNormalProp = /* @__PURE__ */ __name((obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value, "__defNormalProp");
var __publicField = /* @__PURE__ */ __name((obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value), "__publicField");
const STORAGE_KEY = "pmp_learning_progress";
const _ProgressService = class _ProgressService {
  /**
   * コンストラクタ
   * @description 進捗サービスの初期化
   */
  constructor() {
    __publicField(this, "initialized", false);
    __publicField(this, "processData");
    this.processData = this.initializeProcessData();
  }
  // ========================================
  // プライベートメソッド - 初期化
  // ========================================
  /**
   * プロセスデータの初期化
   * @description PMBOK第6版のプロセス定義を作成
   * @returns プロセスデータ構造
   * @private
   */
  initializeProcessData() {
    const knowledgeAreas = [
      { id: "integration", name: "統合マネジメント" },
      { id: "scope", name: "スコープ・マネジメント" },
      { id: "schedule", name: "スケジュール・マネジメント" },
      { id: "cost", name: "コスト・マネジメント" },
      { id: "quality", name: "品質マネジメント" },
      { id: "resource", name: "資源マネジメント" },
      { id: "communications", name: "コミュニケーション・マネジメント" },
      { id: "risk", name: "リスク・マネジメント" },
      { id: "procurement", name: "調達マネジメント" },
      { id: "stakeholder", name: "ステークホルダー・マネジメント" }
    ];
    const processGroups3 = [
      { id: "initiating", name: "立上げ" },
      { id: "planning", name: "計画" },
      { id: "executing", name: "実行" },
      { id: "monitoring", name: "監視・コントロール" },
      { id: "closing", name: "終結" }
    ];
    const processes = [
      // 統合マネジメント（7プロセス）
      {
        id: "p1",
        name: "プロジェクト憲章の作成",
        knowledgeArea: "integration",
        processGroup: "initiating"
      },
      {
        id: "p2",
        name: "プロジェクトマネジメント計画書の作成",
        knowledgeArea: "integration",
        processGroup: "planning"
      },
      {
        id: "p3",
        name: "プロジェクト作業の指揮・マネジメント",
        knowledgeArea: "integration",
        processGroup: "executing"
      },
      {
        id: "p4",
        name: "プロジェクト知識のマネジメント",
        knowledgeArea: "integration",
        processGroup: "executing"
      },
      {
        id: "p5",
        name: "プロジェクト作業の監視・コントロール",
        knowledgeArea: "integration",
        processGroup: "monitoring"
      },
      {
        id: "p6",
        name: "統合変更管理",
        knowledgeArea: "integration",
        processGroup: "monitoring"
      },
      {
        id: "p7",
        name: "プロジェクトやフェーズの終結",
        knowledgeArea: "integration",
        processGroup: "closing"
      },
      // スコープ・マネジメント（6プロセス）
      {
        id: "p8",
        name: "スコープ・マネジメントの計画",
        knowledgeArea: "scope",
        processGroup: "planning"
      },
      {
        id: "p9",
        name: "要求事項の収集",
        knowledgeArea: "scope",
        processGroup: "planning"
      },
      {
        id: "p10",
        name: "スコープの定義",
        knowledgeArea: "scope",
        processGroup: "planning"
      },
      {
        id: "p11",
        name: "WBSの作成",
        knowledgeArea: "scope",
        processGroup: "planning"
      },
      {
        id: "p12",
        name: "スコープの妥当性確認",
        knowledgeArea: "scope",
        processGroup: "monitoring"
      },
      {
        id: "p13",
        name: "スコープのコントロール",
        knowledgeArea: "scope",
        processGroup: "monitoring"
      }
      // 追加のプロセスは実際の実装時に完全版を追加
    ];
    return { knowledgeAreas, processGroups: processGroups3, processes };
  }
  // ========================================
  // 公開メソッド - データ読み書き
  // ========================================
  /**
   * 進捗データの読み込み
   * @returns 進捗データまたはデフォルトデータ
   */
  async loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
      return this.getDefaultProgress();
    } catch (error2) {
      return this.getDefaultProgress();
    }
  }
  /**
   * 進捗データの保存
   * @param progress - 保存する進捗データ
   * @returns 保存成功フラグ
   */
  async saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (error2) {
      return false;
    }
  }
  /**
   * デフォルト進捗データの取得
   * @returns 初期状態の進捗データ
   */
  getDefaultProgress() {
    return {
      knowledgeAreas: {},
      processGroups: {},
      processes: {},
      studySessions: [],
      flashCardSessions: [],
      examResults: [],
      goals: {},
      lastUpdated: null
    };
  }
  // ========================================
  // 公開メソッド - プロセス情報取得
  // ========================================
  /**
   * 知識エリア別プロセス取得
   * @param knowledgeAreaId - 知識エリアID
   * @returns 該当プロセス一覧
   */
  getProcessesByKnowledgeArea(knowledgeAreaId) {
    return this.processData.processes.filter((p) => p.knowledgeArea === knowledgeAreaId);
  }
  /**
   * プロセス群別プロセス取得
   * @param processGroupId - プロセス群ID
   * @returns 該当プロセス一覧
   */
  getProcessesByProcessGroup(processGroupId) {
    return this.processData.processes.filter((p) => p.processGroup === processGroupId);
  }
  /**
   * 全プロセス取得
   * @returns 全プロセス一覧
   */
  getAllProcesses() {
    return this.processData.processes;
  }
  /**
   * 知識エリア一覧取得
   * @returns 知識エリア定義一覧
   */
  getKnowledgeAreas() {
    return this.processData.knowledgeAreas;
  }
  /**
   * プロセス群一覧取得
   * @returns プロセス群定義一覧
   */
  getProcessGroups() {
    return this.processData.processGroups;
  }
  // ========================================
  // 公開メソッド - 個別進捗管理
  // ========================================
  /**
   * 特定プロセスの進捗取得
   * @param processId - プロセスID
   * @returns プロセス進捗情報
   */
  async getProcessProgress(processId) {
    var _a;
    const progress = await this.loadProgress();
    return ((_a = progress.processes) == null ? void 0 : _a[processId]) || {
      completed: false,
      understanding: 0,
      notes: "",
      lastStudied: null,
      studyCount: 0,
      difficulty: 3
    };
  }
  // ========================================
  // 公開メソッド - フラッシュカード管理
  // ========================================
  /**
   * フラッシュカード学習セッション記録
   * @param sessionData - セッションデータ
   */
  async recordFlashCardSession(sessionData) {
    const progress = await this.loadProgress();
    if (!progress.flashCardSessions) {
      progress.flashCardSessions = [];
    }
    progress.flashCardSessions.push({
      ...sessionData,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (progress.flashCardSessions.length > 100) {
      progress.flashCardSessions = progress.flashCardSessions.slice(-100);
    }
    await this.saveProgress(progress);
  }
  /**
   * フラッシュカード統計取得
   * @returns フラッシュカード学習統計
   */
  async getFlashCardStats() {
    const progress = await this.loadProgress();
    const sessions = progress.flashCardSessions || [];
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalCards: 0,
        averageAccuracy: 0,
        totalStudyTime: 0,
        lastSession: null
      };
    }
    const totalCards = sessions.reduce((sum, s) => sum + s.totalCards, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
      totalSessions: sessions.length,
      totalCards,
      averageAccuracy: Math.round(totalCorrect / totalCards * 100),
      totalStudyTime: totalTime,
      lastSession: sessions[sessions.length - 1].timestamp
    };
  }
  // ========================================
  // 公開メソッド - 模擬試験管理
  // ========================================
  /**
   * 模擬試験結果記録
   * @param examData - 試験結果データ
   */
  async recordExamResult(examData) {
    const progress = await this.loadProgress();
    if (!progress.examResults) {
      progress.examResults = [];
    }
    progress.examResults.push(examData);
    if (progress.examResults.length > 20) {
      progress.examResults = progress.examResults.slice(-20);
    }
    await this.saveProgress(progress);
  }
  /**
   * 模擬試験統計取得
   * @returns 模擬試験統計情報
   */
  async getExamStats() {
    const progress = await this.loadProgress();
    const examResults = progress.examResults || [];
    if (examResults.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        highestScore: 0,
        passCount: 0,
        passRate: 0,
        lastExam: null,
        recentScores: []
      };
    }
    const scores = examResults.map((r) => r.results.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const passCount = scores.filter((score) => score >= 61).length;
    return {
      totalExams: examResults.length,
      averageScore: Math.round(totalScore / examResults.length),
      highestScore: Math.max(...scores),
      passCount,
      passRate: Math.round(passCount / examResults.length * 100),
      lastExam: examResults[examResults.length - 1].timestamp,
      recentScores: examResults.slice(-5).map((r) => ({
        score: r.results.score,
        timestamp: r.timestamp
      }))
    };
  }
  // ========================================
  // 公開メソッド - 統計分析
  // ========================================
  /**
   * 学習統計の計算
   * @param studySessions - 学習セッション配列
   * @param period - 集計期間（'week' または 'month'）
   * @returns 学習統計情報
   */
  calculateStudyStats(studySessions, period = "week") {
    const now = /* @__PURE__ */ new Date();
    const periodDays = period === "week" ? 7 : 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1e3);
    const filteredSessions = studySessions.filter((session) => new Date(session.date) >= startDate);
    const dailyStats = {};
    filteredSessions.forEach((session) => {
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
  // ========================================
  // 公開メソッド - データ入出力
  // ========================================
  /**
   * 進捗データのエクスポート
   * @description JSON形式でファイルダウンロード
   */
  async exportProgress() {
    const progress = await this.loadProgress();
    const dataStr = JSON.stringify(progress, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `pmp-progress-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }
  /**
   * 進捗データのインポート
   * @param file - アップロードされたJSONファイル
   * @returns インポートされた進捗データ
   */
  async importProgress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        var _a;
        try {
          const result = (_a = e.target) == null ? void 0 : _a.result;
          if (typeof result !== "string") {
            throw new Error("Invalid file content");
          }
          const progress = JSON.parse(result);
          await this.saveProgress(progress);
          resolve(progress);
        } catch (_error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};
__name(_ProgressService, "ProgressService");
let ProgressService = _ProgressService;
const progressService = new ProgressService();
const useProgress = /* @__PURE__ */ __name(() => {
  const [progress, setProgress] = reactExports.useState(null);
  const [statistics, setStatistics] = reactExports.useState(null);
  const calculateStatistics = /* @__PURE__ */ __name((progressData) => {
    var _a;
    const processes = progressService.getAllProcesses();
    const completedCount = Object.values(progressData.processes || {}).filter(
      (p) => p.completed
    ).length;
    const categoryStats = {};
    Object.keys(processCategories).forEach((cat) => {
      const category = cat;
      const catProcesses = processes.filter((p) => p.knowledgeArea === category);
      const completed = catProcesses.filter((p) => {
        var _a2, _b;
        return (_b = (_a2 = progressData.processes) == null ? void 0 : _a2[p.id]) == null ? void 0 : _b.completed;
      }).length;
      categoryStats[category] = { total: catProcesses.length, completed };
    });
    const groupStats = {};
    Object.keys(processGroups).forEach((group) => {
      const processGroup = group;
      const groupProcesses = processes.filter((p) => p.processGroup === processGroup);
      const completed = groupProcesses.filter(
        (p) => {
          var _a2, _b;
          return (_b = (_a2 = progressData.processes) == null ? void 0 : _a2[p.id]) == null ? void 0 : _b.completed;
        }
      ).length;
      groupStats[processGroup] = { total: groupProcesses.length, completed };
    });
    const totalStudyTime = ((_a = progressData.studySessions) == null ? void 0 : _a.reduce((sum, s) => sum + (s.duration || 0), 0)) || 0;
    return {
      overall: {
        completed: completedCount,
        total: processes.length,
        percentage: Math.round(completedCount / processes.length * 100)
      },
      byCategory: categoryStats,
      byGroup: groupStats,
      studyTime: totalStudyTime,
      lastUpdated: progressData.lastUpdated
    };
  }, "calculateStatistics");
  reactExports.useEffect(() => {
    const loadData = /* @__PURE__ */ __name(async () => {
      try {
        const progressData = await progressService.loadProgress();
        setProgress(progressData);
        const stats = calculateStatistics(progressData);
        setStatistics(stats);
      } catch (error2) {
        const defaultData = progressService.getDefaultProgress();
        setProgress(defaultData);
        setStatistics(calculateStatistics(defaultData));
      }
    }, "loadData");
    loadData();
    const handleStorageChange = /* @__PURE__ */ __name(() => {
      loadData();
    }, "handleStorageChange");
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  const updateProgress = /* @__PURE__ */ __name(async (processId, progressData) => {
    const currentProgress = await progressService.loadProgress();
    if (!currentProgress.processes) {
      currentProgress.processes = {};
    }
    currentProgress.processes[processId] = {
      ...currentProgress.processes[processId],
      ...progressData,
      lastStudied: (/* @__PURE__ */ new Date()).toISOString()
    };
    currentProgress.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    const success = await progressService.saveProgress(currentProgress);
    if (success) {
      setProgress(currentProgress);
      setStatistics(calculateStatistics(currentProgress));
    }
    return success;
  }, "updateProgress");
  const updateStudyTime = /* @__PURE__ */ __name(async (minutes) => {
    const currentProgress = await progressService.loadProgress();
    if (!currentProgress.studySessions) {
      currentProgress.studySessions = [];
    }
    currentProgress.studySessions.push({
      date: (/* @__PURE__ */ new Date()).toISOString(),
      duration: minutes,
      processCount: 1
    });
    currentProgress.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    const success = await progressService.saveProgress(currentProgress);
    if (success) {
      setProgress(currentProgress);
      setStatistics(calculateStatistics(currentProgress));
    }
    return success;
  }, "updateStudyTime");
  const resetProgress = /* @__PURE__ */ __name(async () => {
    const defaultProgress = progressService.getDefaultProgress();
    const success = await progressService.saveProgress(defaultProgress);
    if (success) {
      setProgress(defaultProgress);
      setStatistics(calculateStatistics(defaultProgress));
    }
    return success;
  }, "resetProgress");
  return {
    progress,
    statistics,
    updateProgress,
    updateStudyTime,
    resetProgress
  };
}, "useProgress");
export {
  progressService as p,
  useProgress as u
};
