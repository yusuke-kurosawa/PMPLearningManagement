var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import "./index-CZZZnLRW.js";
import { aw as AlertCircle, R as RefreshCw, o as Brain, t as Target, c as Clock, a7 as Calendar, v as BarChart3, ar as Award, av as CheckCircle, a3 as Star, aC as MessageSquare, aX as Lightbulb, A as ArrowRight } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const _AICoachingService = class _AICoachingService {
  constructor() {
    this.learningPatterns = /* @__PURE__ */ new Map();
    this.userProfiles = /* @__PURE__ */ new Map();
    this.knowledgeGraph = this.buildKnowledgeGraph();
  }
  /**
   * Build knowledge graph representing relationships between PMBOK processes
   */
  buildKnowledgeGraph() {
    return {
      // Integration Management dependencies
      integration: {
        foundational: ["p1", "p2"],
        // Charter, PM Plan
        critical: ["p6"],
        // Change Control
        related: ["スコープ", "スケジュール", "コスト"]
      },
      // Scope Management flow
      scope: {
        sequence: ["p8", "p9", "p10", "p11"],
        // Plan -> Collect -> Define -> Create WBS
        prerequisites: ["p1", "p2"],
        // Charter and PM Plan needed
        validates: ["p12"],
        // Validate Scope
        controls: ["p13"]
        // Control Scope
      },
      // Process group relationships
      processGroups: {
        initiation: {
          order: 1,
          critical: ["p1"],
          // Project Charter
          next: "planning"
        },
        planning: {
          order: 2,
          foundational: ["p2", "p8", "p9", "p10", "p11"],
          next: "execution"
        },
        execution: {
          order: 3,
          key: ["p3", "p4"],
          parallel: "monitoring"
        },
        monitoring: {
          order: 4,
          continuous: ["p5", "p6", "p12", "p13"],
          parallel: "execution"
        },
        closing: {
          order: 5,
          final: ["p7"]
        }
      }
    };
  }
  /**
   * Generate personalized learning path for user
   */
  generatePersonalizedPath(userId, userProgress, learningGoals = {}) {
    const profile = this.getUserProfile(userId);
    const weaknesses = this.identifyWeaknesses(userProgress);
    const strengths = this.identifyStrengths(userProgress);
    const learningPath = {
      userId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      profile,
      currentLevel: this.assessCurrentLevel(userProgress),
      targetDate: learningGoals.targetExamDate || this.calculateOptimalTargetDate(profile),
      // Personalized recommendations
      immediateActions: this.generateImmediateActions(weaknesses, profile),
      weeklySchedule: this.generateWeeklySchedule(profile, weaknesses, _learningGoals),
      studyPlan: this.generateStudyPlan(userProgress, weaknesses, strengths),
      // Adaptive elements
      difficultyAdjustments: this.getDifficultyAdjustments(profile),
      preferredLearningMethods: this.getPreferredMethods(profile),
      // Career integration
      careerAlignment: this.getCareerAlignment(_profile, __learningGoals),
      postCertificationPath: this.generatePostCertificationPath(_profile, __learningGoals)
    };
    this.updateLearningPattern(userId, learningPath);
    return learningPath;
  }
  /**
   * Identify knowledge gaps and weaknesses
   */
  identifyWeaknesses(userProgress) {
    const weaknesses = [];
    const thresholds = {
      critical: 0.6,
      // Below 60% is critical weakness
      moderate: 0.75,
      // Below 75% is moderate weakness
      processGroup: 0.7
      // Process group average threshold
    };
    const knowledgeAreas = this.groupProgressByKnowledgeArea(userProgress);
    Object.entries(knowledgeAreas).forEach(([area, processes]) => {
      const average = this.calculateAverage(processes.map((p) => p.masteryScore || 0));
      if (average < thresholds.critical) {
        weaknesses.push({
          type: "knowledge_area",
          area,
          severity: "critical",
          score: average,
          processes: processes.filter((p) => (p.masteryScore || 0) < thresholds.critical),
          recommendation: this.getKnowledgeAreaRecommendation(area, "critical")
        });
      } else if (average < thresholds.moderate) {
        weaknesses.push({
          type: "knowledge_area",
          area,
          severity: "moderate",
          score: average,
          processes: processes.filter((p) => (p.masteryScore || 0) < thresholds.moderate),
          recommendation: this.getKnowledgeAreaRecommendation(area, "moderate")
        });
      }
    });
    const processGroups = this.groupProgressByProcessGroup(userProgress);
    Object.entries(processGroups).forEach(([group, processes]) => {
      const average = this.calculateAverage(processes.map((p) => p.masteryScore || 0));
      if (average < thresholds.processGroup) {
        weaknesses.push({
          type: "process_group",
          group,
          severity: average < thresholds.critical ? "critical" : "moderate",
          score: average,
          processes: processes.filter((p) => (p.masteryScore || 0) < thresholds.processGroup),
          recommendation: this.getProcessGroupRecommendation(group, average)
        });
      }
    });
    const weakProcesses = Object.entries(userProgress).filter(([_processId, data]) => (data.masteryScore || 0) < thresholds.moderate).map(([processId, data]) => ({
      type: "process",
      processId,
      severity: data.masteryScore < thresholds.critical ? "critical" : "moderate",
      score: data.masteryScore || 0,
      attempts: data.attempts || 0,
      lastStudied: data.lastStudied,
      recommendation: this.getProcessRecommendation(processId, data)
    }));
    weaknesses.push(...weakProcesses);
    return weaknesses.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === "critical" ? -1 : 1;
      }
      return a.score - b.score;
    });
  }
  /**
   * Generate immediate actionable recommendations
   */
  generateImmediateActions(weaknesses, profile) {
    const actions = [];
    const criticalWeaknesses = weaknesses.filter((w) => w.severity === "critical");
    if (criticalWeaknesses.length > 0) {
      actions.push({
        priority: "urgent",
        type: "focus_study",
        title: "緊急: 重要な弱点に集中",
        description: `${criticalWeaknesses.length}個の重要な弱点が見つかりました。これらは試験成功の鍵となります。`,
        actions: criticalWeaknesses.slice(0, 3).map((w) => ({
          area: w.area || w.group || w.processId,
          recommendation: w.recommendation,
          estimatedTime: this.estimateStudyTime(w),
          resources: this.getRecommendedResources(w)
        })),
        timeline: "今週中"
      });
    }
    if (profile.strugglingAreas && profile.strugglingAreas.length > 0) {
      actions.push({
        priority: "high",
        type: "method_adjustment",
        title: "学習方法の最適化",
        description: "現在の学習方法を調整して効率を向上させましょう。",
        recommendations: this.getMethodAdjustments(profile),
        timeline: "今日から"
      });
    }
    if (profile.studyPattern && profile.studyPattern.consistency < 0.7) {
      actions.push({
        priority: "medium",
        type: "schedule_optimization",
        title: "学習スケジュールの改善",
        description: "一貫性のある学習習慣を構築しましょう。",
        suggestions: [
          "毎日決まった時間に30分間の短期学習を設定",
          "週末に2時間の集中復習セッションを計画",
          "モバイルアプリでスキマ時間を活用"
        ],
        timeline: "来週から"
      });
    }
    return actions;
  }
  /**
   * Generate weekly study schedule based on user preferences and weaknesses
   */
  generateWeeklySchedule(profile, weaknesses, _learningGoals2) {
    const availableHours = profile.availableStudyTime || 10;
    const schedule = {
      totalWeeklyHours: availableHours,
      dailyBreakdown: {},
      focusAreas: [],
      flexibilityOptions: []
    };
    const weeklyDistribution = this.distributeStudyTime(availableHours, weaknesses, profile);
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    ];
    daysOfWeek.forEach((day) => {
      var _a;
      const dayProfile = ((_a = profile.preferredStudyDays) == null ? void 0 : _a[day]) || {
        available: true,
        preferredTime: "evening"
      };
      if (dayProfile.available) {
        schedule.dailyBreakdown[day] = {
          duration: Math.round(weeklyDistribution.dailyAverage * 10) / 10,
          preferredTime: dayProfile.preferredTime,
          activities: this.generateDailyActivities(day, weeklyDistribution, weaknesses),
          backup: this.generateBackupActivities(day)
        };
      }
    });
    schedule.flexibilityOptions = [
      {
        name: "忙しい日用クイック学習",
        duration: 15,
        activities: ["フラッシュカード復習", "ITTO暗記", "用語確認"]
      },
      {
        name: "時間がある日の深掘り学習",
        duration: 90,
        activities: ["プロセス関係性の理解", "模擬問題セット", "弱点克服演習"]
      }
    ];
    return schedule;
  }
  /**
   * Get user learning profile with preferences and patterns
   */
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        learningStyle: "visual",
        // visual, auditory, kinesthetic, reading
        preferredDifficulty: "adaptive",
        availableStudyTime: 10,
        // hours per week
        consistencyScore: 0.5,
        retentionRate: 0.7,
        preferredStudyDays: {
          weekdays: { preferred: true, time: "evening" },
          weekends: { preferred: true, time: "morning" }
        },
        strugglingAreas: [],
        strongAreas: [],
        motivationFactors: ["certification", "career_growth"],
        lastActive: (/* @__PURE__ */ new Date()).toISOString(),
        adaptationHistory: []
      });
    }
    return this.userProfiles.get(userId);
  }
  /**
   * Provide real-time coaching feedback during study sessions
   */
  provideRealTimeCoaching(userId, currentActivity, performance) {
    const profile = this.getUserProfile(userId);
    const coaching = {
      sessionId: Date.now(),
      userId,
      activity: currentActivity,
      performance,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      feedback: [],
      adjustments: [],
      encouragement: ""
    };
    if (performance.accuracy < 0.6) {
      coaching.feedback.push({
        type: "improvement",
        message: "このトピックで苦戦していますね。基礎概念を復習してから応用問題に進むことをお勧めします。",
        actionable: true,
        resources: this.getTargetedResources(currentActivity.topic)
      });
      coaching.adjustments.push({
        type: "difficulty_reduction",
        description: "難易度を一時的に下げて基礎を固めます",
        duration: "2セッション"
      });
    } else if (performance.accuracy > 0.9) {
      coaching.feedback.push({
        type: "advancement",
        message: "素晴らしい理解度です！より挑戦的な問題に進んでみましょう。",
        actionable: true,
        nextLevel: this.getNextChallengeLevel(currentActivity)
      });
      coaching.adjustments.push({
        type: "difficulty_increase",
        description: "習熟度に応じて難易度を上げます",
        benefits: "試験により準備できます"
      });
    }
    const recentPattern = this.analyzeRecentPattern(userId, currentActivity);
    if (recentPattern.trend === "declining") {
      coaching.feedback.push({
        type: "pattern_alert",
        message: "最近のパフォーマンスが下降気味です。休憩を取るか、学習方法を変えてみませんか？",
        suggestions: [
          "10分間の休憩を取る",
          "フラッシュカードで軽く復習する",
          "関連する視覚的な図表を確認する"
        ]
      });
    }
    coaching.encouragement = this.generateEncouragement(profile, performance);
    this.updateLearningPattern(userId, {
      activity: currentActivity,
      performance,
      coaching,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return coaching;
  }
  /**
   * Generate post-certification career development path
   */
  generatePostCertificationPath(_profile2, __learningGoals2) {
    return {
      immediate: {
        title: "認定取得直後（1-3ヶ月）",
        goals: [
          "PMPコミュニティへの参加",
          "実際のプロジェクトでの知識適用",
          "継続教育クレジット(PDU)の収集開始"
        ],
        resources: [
          "PMI Local Chapter参加",
          "LinkedIn PMPグループ参加",
          "メンタリングプログラム参加"
        ]
      },
      shortTerm: {
        title: "成長期（3-12ヶ月）",
        goals: [
          "アジャイル/スクラム認定の取得",
          "プロジェクトマネジメントツールの習得",
          "リーダーシップスキルの向上"
        ],
        milestones: ["第1回プロジェクト成功完了", "年収20%向上の実現", "チームリード役の獲得"]
      },
      longTerm: {
        title: "専門化（1-2年）",
        goals: ["特定分野の専門知識深化", "上級認定の取得検討", "メンタリング・指導役への発展"],
        options: [
          "Program Management Professional (PgMP)",
          "Portfolio Management Professional (PfMP)",
          "PMI Agile Certified Practitioner (PMI-ACP)",
          "Business Analysis Professional (PMI-PBA)"
        ]
      }
    };
  }
  /**
   * Utility methods
   */
  calculateAverage(scores) {
    if (scores.length === 0) {
      return 0;
    }
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
  groupProgressByKnowledgeArea(_userProgress) {
    return {
      統合: [],
      スコープ: [],
      スケジュール: [],
      コスト: [],
      品質: [],
      資源: [],
      コミュニケーション: [],
      リスク: [],
      調達: [],
      ステークホルダー: []
    };
  }
  groupProgressByProcessGroup(_userProgress) {
    return {
      立ち上げ: [],
      計画: [],
      実行: [],
      "監視・コントロール": [],
      終結: []
    };
  }
  generateEncouragement(_profile2, _performance) {
    const encouragements = [
      "順調に進歩しています！この調子で続けましょう。",
      "挑戦的な問題にも取り組んでいて素晴らしいです！",
      "継続は力なり。毎日の積み重ねが大きな成果につながります。",
      "PMPの道のりは簡単ではありませんが、あなたなら必ず達成できます！"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
  updateLearningPattern(userId, data) {
    if (!this.learningPatterns.has(userId)) {
      this.learningPatterns.set(userId, []);
    }
    const patterns = this.learningPatterns.get(userId);
    patterns.push({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      data
    });
    if (patterns.length > 100) {
      patterns.shift();
    }
  }
  // Additional utility methods would be implemented here...
};
__name(_AICoachingService, "AICoachingService");
let AICoachingService = _AICoachingService;
const aiCoachingService = new AICoachingService();
const AICoachingDashboard = /* @__PURE__ */ __name(() => {
  var _a, _b, _c, _d, _e, _f;
  const [learningPath, setLearningPath] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeCoaching, setActiveCoaching] = reactExports.useState(null);
  const [, setUserProgress] = reactExports.useState({});
  const [selectedWeekness, setSelectedWeekness] = reactExports.useState(null);
  const userId = "user123";
  reactExports.useEffect(() => {
    loadAICoaching();
  }, []);
  const loadAICoaching = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const mockUserProgress = {
        p1: { masteryScore: 0.85, attempts: 5, lastStudied: "2024-01-15" },
        p2: { masteryScore: 0.45, attempts: 8, lastStudied: "2024-01-14" },
        p3: { masteryScore: 0.72, attempts: 3, lastStudied: "2024-01-13" },
        p8: { masteryScore: 0.35, attempts: 12, lastStudied: "2024-01-12" },
        p9: { masteryScore: 0.55, attempts: 6, lastStudied: "2024-01-11" }
      };
      const mockLearningGoals = {
        targetExamDate: "2024-03-15",
        intensity: "high",
        currentRole: "aspiring_pm",
        targetRole: "senior_pm"
      };
      setUserProgress(mockUserProgress);
      const path = aiCoachingService.generatePersonalizedPath(
        userId,
        mockUserProgress,
        mockLearningGoals
      );
      setLearningPath(path);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [userId]);
  const handleStartCoachingSession = reactExports.useCallback(
    async (activity) => {
      const coaching = aiCoachingService.provideRealTimeCoaching(userId, activity, {
        accuracy: 0.75,
        speed: 1.2,
        confidence: 0.8
      });
      setActiveCoaching(coaching);
    },
    [userId]
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6 dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-3", children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 rounded-lg bg-gray-200 dark:bg-gray-700" }, i)) })
    ] }) }) });
  }
  if (!learningPath) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mx-auto mb-4 h-12 w-12 text-red-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xl font-semibold text-gray-900 dark:text-white", children: "AIコーチングデータを読み込めませんでした" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: loadAICoaching,
          className: "mx-auto flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
            "再読み込み"
          ]
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6 dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "mr-3 h-8 w-8 text-purple-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "AIコーチング" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-2xl text-gray-600 dark:text-gray-300", children: "あなた専用のAIコーチが学習を分析し、最適化された学習パスと個別指導を提供します" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-5 w-5 text-green-500" }),
          "現在のレベル"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm text-gray-500 dark:text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-4 w-4" }),
          "最終更新: ",
          new Date(learningPath.generatedAt).toLocaleString("ja-JP")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
            learningPath.currentLevel,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: "総合習熟度" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: Math.ceil(
            (new Date(learningPath.targetDate) - /* @__PURE__ */ new Date()) / (1e3 * 60 * 60 * 24)
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: "試験まで残り日数" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [
            ((_a = learningPath.weeklySchedule) == null ? void 0 : _a.totalWeeklyHours) || 0,
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: "週間学習時間" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-900/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-600", children: "A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: "学習グレード" })
        ] })
      ] })
    ] }),
    learningPath.immediateActions && learningPath.immediateActions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mr-2 h-5 w-5 text-red-500" }),
        "今すぐ取り組むべきこと"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: learningPath.immediateActions.map((action, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `rounded-lg border-l-4 p-4 ${action.priority === "urgent" ? "border-red-500 bg-red-50 dark:bg-red-900/10" : action.priority === "high" ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold text-gray-900 dark:text-white", children: action.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-gray-600 dark:text-gray-300", children: action.description }),
              action.actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: action.actions.map((subAction, subIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between rounded bg-white p-2 dark:bg-gray-700",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: subAction.area }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: subAction.estimatedTime })
                  ]
                },
                subIndex
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4 text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs text-gray-500", children: action.timeline }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => handleStartCoachingSession({
                    type: action.type,
                    topic: action.title
                  }), "onClick"),
                  className: "rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700",
                  children: "開始"
                }
              )
            ] })
          ] })
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "mr-2 h-5 w-5 text-blue-500" }),
        "週間学習スケジュール"
      ] }),
      learningPath.weeklySchedule && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-7", children: Object.entries(learningPath.weeklySchedule.dailyBreakdown || {}).map(
        ([day, schedule]) => {
          var _a2;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border border-gray-200 p-4 dark:border-gray-600",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold capitalize text-gray-900 dark:text-white", children: day }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-sm text-gray-600 dark:text-gray-300", children: [
                  schedule.duration,
                  "時間"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: (_a2 = schedule.activities) == null ? void 0 : _a2.map((activity, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "rounded bg-blue-50 px-2 py-1 text-xs dark:bg-blue-900/20",
                    children: activity
                  },
                  index
                )) })
              ]
            },
            day
          );
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "mr-2 h-5 w-5 text-orange-500" }),
          "弱点分析"
        ] }),
        ((_b = learningPath.studyPlan) == null ? void 0 : _b.weaknesses) && learningPath.studyPlan.weaknesses.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: learningPath.studyPlan.weaknesses.slice(0, 5).map((weakness, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "cursor-pointer rounded border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700",
            onClick: /* @__PURE__ */ __name(() => setSelectedWeekness(selectedWeekness === index ? null : index), "onClick"),
            onKeyDown: /* @__PURE__ */ __name((e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedWeekness(selectedWeekness === index ? null : index);
              }
            }, "onKeyDown"),
            role: "button",
            tabIndex: 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `mr-2 h-3 w-3 rounded-full ${weakness.severity === "critical" ? "bg-red-500" : weakness.severity === "moderate" ? "bg-orange-500" : "bg-yellow-500"}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: weakness.area || weakness.group || weakness.processId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-500", children: [
                  Math.round((weakness.score || 0) * 100),
                  "%"
                ] })
              ] }),
              selectedWeekness === index && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 border-t border-gray-200 pt-2 dark:border-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-gray-600 dark:text-gray-300", children: weakness.recommendation }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700", children: "集中学習を開始" })
              ] })
            ]
          },
          index
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-gray-600 dark:text-gray-300", children: "重要な弱点は見つかりませんでした。順調に学習が進んでいます！" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "mr-2 h-5 w-5 text-purple-500" }),
          "キャリア発展パス"
        ] }),
        learningPath.postCertificationPath && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded bg-purple-50 p-3 dark:bg-purple-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold text-purple-900 dark:text-purple-100", children: (_c = learningPath.postCertificationPath.immediate) == null ? void 0 : _c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm text-purple-800 dark:text-purple-200", children: (_d = learningPath.postCertificationPath.immediate) == null ? void 0 : _d.goals.map((goal, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-3 w-3 flex-shrink-0" }),
              goal
            ] }, index)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded bg-blue-50 p-3 dark:bg-blue-900/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold text-blue-900 dark:text-blue-100", children: (_e = learningPath.postCertificationPath.shortTerm) == null ? void 0 : _e.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-800 dark:text-blue-200", children: [
              "主要マイルストーン:",
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 space-y-1", children: (_f = learningPath.postCertificationPath.shortTerm) == null ? void 0 : _f.milestones.map(
                (milestone, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-2 h-3 w-3 flex-shrink-0" }),
                  milestone
                ] }, index)
              ) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    activeCoaching && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-lg dark:from-purple-900/20 dark:to-blue-900/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mr-2 h-5 w-5 text-purple-500" }),
        "リアルタイムコーチング"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        activeCoaching.feedback.map((feedback, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `rounded-lg p-4 ${feedback.type === "improvement" ? "border-l-4 border-orange-500 bg-orange-100 dark:bg-orange-900/20" : feedback.type === "advancement" ? "border-l-4 border-green-500 bg-green-100 dark:bg-green-900/20" : "border-l-4 border-blue-500 bg-blue-100 dark:bg-blue-900/20"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 font-medium text-gray-900 dark:text-white", children: feedback.message }),
                feedback.suggestions && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300", children: feedback.suggestions.map((suggestion, suggestionIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mr-2 h-3 w-3 flex-shrink-0" }),
                  suggestion
                ] }, suggestionIndex)) })
              ] })
            ] })
          },
          index
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-lg font-medium text-gray-900 dark:text-white", children: activeCoaching.encouragement }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setActiveCoaching(null), "onClick"),
              className: "rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700",
              children: "次のセッションに進む"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}, "AICoachingDashboard");
export {
  AICoachingDashboard as default
};
