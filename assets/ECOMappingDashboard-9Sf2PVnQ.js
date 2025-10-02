var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { S as Separator } from "./separator-Cd8fry1p.js";
import { e as ecoMapping, l as learningSupport } from "./agileMindsetData-8VeBPcHe.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { n as BookOpen, t as Target, o as Brain, ar as Award, l as Layers, av as CheckCircle, y as Bookmark, a3 as Star, ai as AlertTriangle, aG as ChevronUp, a4 as ChevronDown, S as Search, aU as Filter, a7 as Calendar, D as Download, R as RefreshCw, v as BarChart3, T as TrendingUp } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const ECOMappingDashboard = /* @__PURE__ */ __name(() => {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [selectedDomain, setSelectedDomain] = reactExports.useState(null);
  const [expandedTopic, setExpandedTopic] = reactExports.useState(null);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filterPriority, setFilterPriority] = reactExports.useState("all");
  const [showAnalytics, setShowAnalytics] = reactExports.useState(false);
  const [learningProgress] = reactExports.useState([
    {
      domainId: "fundamentals",
      coveragePercentage: 85,
      completedTopics: [
        "アジャイル・マインドセットの理解",
        "プロジェクトライフサイクルの選択",
        "テーラリングの基本概念"
      ],
      studyTime: 15,
      lastAccessed: /* @__PURE__ */ new Date("2024-01-15"),
      confidence: 80
    },
    {
      domainId: "principles",
      coveragePercentage: 70,
      completedTopics: ["アジャイル原則の適用", "継続的改善"],
      studyTime: 12,
      lastAccessed: /* @__PURE__ */ new Date("2024-01-10"),
      confidence: 75
    },
    {
      domainId: "agile-mindset",
      coveragePercentage: 90,
      completedTopics: ["アジャイル価値観と原則", "アジャイル思考法", "継続的価値提供"],
      studyTime: 20,
      lastAccessed: /* @__PURE__ */ new Date("2024-01-18"),
      confidence: 85
    },
    {
      domainId: "tailoring",
      coveragePercentage: 60,
      completedTopics: ["ライフサイクル選択", "プロセス適応"],
      studyTime: 8,
      lastAccessed: /* @__PURE__ */ new Date("2024-01-08"),
      confidence: 65
    }
  ]);
  const [studyPlans] = reactExports.useState([
    {
      id: "plan-1",
      title: "ハイブリッドアプローチ深化",
      estimatedHours: 8,
      priority: "high",
      topics: ["ハイブリッド・アプローチの設計", "プロセス統合", "組織要因の考慮"],
      deadline: /* @__PURE__ */ new Date("2024-02-01"),
      status: "in-progress"
    },
    {
      id: "plan-2",
      title: "アジャイル・コーチング",
      estimatedHours: 12,
      priority: "medium",
      topics: ["サーバントリーダーシップ", "自己組織化チーム", "ファシリテーション"],
      deadline: /* @__PURE__ */ new Date("2024-02-15"),
      status: "not-started"
    },
    {
      id: "plan-3",
      title: "テーラリング実践",
      estimatedHours: 6,
      priority: "high",
      topics: ["実務慣行の調整", "組織文化との整合"],
      status: "not-started"
    }
  ]);
  const { domains } = ecoMapping;
  const { keyLearningPoints, commonMisconceptions } = learningSupport;
  const overallProgress = reactExports.useMemo(() => {
    const totalCoverage = learningProgress.reduce(
      (sum, progress) => sum + progress.coveragePercentage,
      0
    );
    const averageCoverage = totalCoverage / learningProgress.length;
    const totalStudyTime = learningProgress.reduce((sum, progress) => sum + progress.studyTime, 0);
    const averageConfidence = learningProgress.reduce((sum, progress) => sum + progress.confidence, 0) / learningProgress.length;
    return {
      averageCoverage: Math.round(averageCoverage),
      totalStudyTime,
      averageConfidence: Math.round(averageConfidence),
      completedDomains: learningProgress.filter((p) => p.coveragePercentage >= 80).length,
      totalDomains: learningProgress.length
    };
  }, [learningProgress]);
  const filteredStudyPlans = reactExports.useMemo(() => {
    return studyPlans.filter((plan) => {
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || plan.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPriority = filterPriority === "all" || plan.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [studyPlans, searchTerm, filterPriority]);
  const handleDomainSelect = reactExports.useCallback(
    (domainName) => {
      setSelectedDomain(selectedDomain === domainName ? null : domainName);
    },
    [selectedDomain]
  );
  reactExports.useCallback(
    (topicId) => {
      setExpandedTopic(expandedTopic === topicId ? null : topicId);
    },
    [expandedTopic]
  );
  const getDomainProgress = reactExports.useCallback(
    (domainName) => {
      const domainKey = domainName.toLowerCase().replace(/[^a-z]/g, "-");
      return learningProgress.find((p) => p.domainId.includes(domainKey.split("-")[0]));
    },
    [learningProgress]
  );
  const getPriorityColor = /* @__PURE__ */ __name((priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 border-red-200";
      case "medium":
        return "text-yellow-600 border-yellow-200";
      case "low":
        return "text-green-600 border-green-200";
      default:
        return "text-gray-600 border-gray-200";
    }
  }, "getPriorityColor");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.h1,
        {
          className: "text-4xl font-bold text-gray-900 dark:text-white",
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mr-3 inline-block text-blue-600", size: 40 }),
            "ECO マッピングダッシュボード"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          className: "mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.2 },
          children: "PMP試験内容とアジャイル学習の対応関係を分析し、効率的な学習計画を立てましょう"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "grid grid-cols-1 gap-4 md:grid-cols-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "text-blue-600", size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [
                overallProgress.averageCoverage,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "全体カバレッジ" })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "text-green-600", size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-600", children: [
                overallProgress.totalStudyTime,
                "h"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "総学習時間" })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "text-purple-600", size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [
                overallProgress.averageConfidence,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "平均理解度" })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "text-orange-600", size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-orange-600", children: [
                overallProgress.completedDomains,
                "/",
                overallProgress.totalDomains
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "完了ドメイン" })
            ] })
          ] }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "概要" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "domains", children: "ドメイン分析" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "study-plan", children: "学習計画" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "analytics", children: "分析レポート" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "mr-2 text-blue-600" }),
                  "ECOドメイン概要"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "PMP試験の各ドメインとカバレッジ状況" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: domains.map((domain, index) => {
                const progress = getDomainProgress(domain.domain);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -30 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.3, delay: index * 0.1 },
                    className: "rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold", children: domain.domain }),
                        progress && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Badge,
                          {
                            variant: "outline",
                            className: progress.coveragePercentage >= 80 ? "border-green-500 text-green-700" : "border-orange-500 text-orange-700",
                            children: [
                              progress.coveragePercentage,
                              "%"
                            ]
                          }
                        )
                      ] }),
                      progress && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.coveragePercentage, className: "h-2" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 text-sm md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium text-blue-700 dark:text-blue-300", children: "学習カバレッジ" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: domain.coverage.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 dark:text-gray-400", children: item })
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium text-purple-700 dark:text-purple-300", children: "試験トピック" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1", children: [
                            domain.examTopics.slice(0, 3).map((topic, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "mr-2 mt-0.5 text-purple-500", size: 12 }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 dark:text-gray-400", children: topic })
                            ] }, idx)),
                            domain.examTopics.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "ml-5 text-xs text-gray-500", children: [
                              "+",
                              domain.examTopics.length - 3,
                              " その他"
                            ] })
                          ] })
                        ] })
                      ] })
                    ]
                  },
                  index
                );
              }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-2 text-yellow-600" }),
                "重要学習ポイント"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: keyLearningPoints.map((point, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 },
                  className: "space-y-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-blue-700 dark:text-blue-300", children: point.topic }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: point.points.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
                    ] }, idx)) })
                  ]
                },
                index
              )) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 text-orange-600" }),
                "よくある誤解と正しい理解"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: commonMisconceptions.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 },
                  className: "space-y-2 border-l-4 border-l-orange-500 pl-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded bg-red-50 p-3 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-red-700 dark:text-red-300", children: [
                      "❌ 誤解: ",
                      item.misconception
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded bg-green-50 p-3 dark:bg-green-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-green-700 dark:text-green-300", children: [
                      "✅ 正解: ",
                      item.correction
                    ] }) })
                  ]
                },
                index
              )) }) })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "domains", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: domains.map((domain, index) => {
        const progress = getDomainProgress(domain.domain);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: index * 0.1 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              {
                className: `cursor-pointer transition-all duration-300 ${selectedDomain === domain.domain ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"}`,
                onClick: /* @__PURE__ */ __name(() => handleDomainSelect(domain.domain), "onClick"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 text-blue-600", size: 20 }),
                        domain.domain,
                        progress && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "ml-3", children: [
                          "進捗: ",
                          progress.coveragePercentage,
                          "%"
                        ] })
                      ] }),
                      selectedDomain === domain.domain ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                    ] }),
                    progress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.coveragePercentage, className: "h-2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-gray-600 dark:text-gray-400", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "学習時間: ",
                          progress.studyTime,
                          "時間"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "理解度: ",
                          progress.confidence,
                          "%"
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedDomain === domain.domain && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      initial: { opacity: 0, height: 0 },
                      animate: { opacity: 1, height: "auto" },
                      exit: { opacity: 0, height: 0 },
                      transition: { duration: 0.3 },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold text-green-700 dark:text-green-300", children: "学習カバレッジ" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: domain.coverage.map((item, idx) => {
                              const isCompleted = progress == null ? void 0 : progress.completedTopics.includes(item);
                              return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  CheckCircle,
                                  {
                                    className: `mr-2 mt-0.5 ${isCompleted ? "text-green-500" : "text-gray-300"}`,
                                    size: 14
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "span",
                                  {
                                    className: `text-sm ${isCompleted ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`,
                                    children: item
                                  }
                                )
                              ] }, idx);
                            }) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold text-purple-700 dark:text-purple-300", children: "試験トピック" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: domain.examTopics.map((topic, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "mr-2 mt-0.5 text-purple-500", size: 14 }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: topic })
                            ] }, idx)) })
                          ] })
                        ] }),
                        progress && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [
                              progress.coveragePercentage,
                              "%"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "カバレッジ" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-600", children: [
                              progress.studyTime,
                              "h"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "学習時間" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [
                              progress.confidence,
                              "%"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "理解度" })
                          ] })
                        ] }) })
                      ] })
                    }
                  ) })
                ]
              }
            )
          },
          index
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "study-plan", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: "学習計画を検索...",
                    value: searchTerm,
                    onChange: /* @__PURE__ */ __name((e) => setSearchTerm(e.target.value), "onChange"),
                    className: "w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: filterPriority,
                    onChange: /* @__PURE__ */ __name((e) => setFilterPriority(e.target.value), "onChange"),
                    className: "rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "全ての優先度" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "高優先度" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "中優先度" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "低優先度" })
                    ]
                  }
                )
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filteredStudyPlans.map((plan, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, x: -30 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.3, delay: index * 0.1 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `border-l-4 ${getPriorityColor(plan.priority)}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "mr-2 text-blue-600", size: 20 }),
                        plan.title,
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Badge,
                          {
                            variant: "outline",
                            className: `ml-3 ${getPriorityColor(plan.priority)}`,
                            children: [
                              plan.priority === "high" ? "高" : plan.priority === "medium" ? "中" : "低",
                              "優先度"
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: plan.status === "completed" ? "default" : plan.status === "in-progress" ? "secondary" : "outline",
                          children: plan.status === "completed" ? "完了" : plan.status === "in-progress" ? "進行中" : "未開始"
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
                      "推定時間: ",
                      plan.estimatedHours,
                      "時間",
                      plan.deadline && ` | 期限: ${plan.deadline.toLocaleDateString("ja-JP")}`
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-semibold", children: "学習トピック" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: plan.topics.map((topic, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mr-2 text-blue-500", size: 14 }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: topic })
                      ] }, idx)) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-end space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "編集" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          variant: plan.status === "not-started" ? "default" : "secondary",
                          children: plan.status === "not-started" ? "開始" : plan.status === "in-progress" ? "続行" : "復習"
                        }
                      )
                    ] })
                  ] })
                ] })
              },
              plan.id
            )) }),
            filteredStudyPlans.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "条件に一致する学習計画が見つかりません" })
            ] }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "analytics", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold", children: "学習分析レポート" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
                  "エクスポート"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
                  "更新"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "mr-2 text-blue-600" }),
                  "ドメイン別進捗"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: learningProgress.map((progress, index) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ((_a = domains.find(
                        (d) => d.domain.toLowerCase().includes(progress.domainId.split("-")[0])
                      )) == null ? void 0 : _a.domain) || progress.domainId }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        progress.coveragePercentage,
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.coveragePercentage, className: "h-2" })
                  ] }, index);
                }) }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-2 text-green-600" }),
                  "学習トレンド"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-blue-600", children: overallProgress.totalStudyTime }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "総学習時間" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-green-600", children: overallProgress.completedDomains }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: "完了ドメイン" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-semibold text-purple-600", children: [
                        overallProgress.averageConfidence,
                        "%"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: "平均理解度" })
                    ] })
                  ] })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 text-yellow-600" }),
                "学習推奨事項"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                learningProgress.filter((p) => p.coveragePercentage < 70).map((progress, index) => {
                  const domain = domains.find(
                    (d) => d.domain.toLowerCase().includes(progress.domainId.split("-")[0])
                  );
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: domain == null ? void 0 : domain.domain }),
                      "の学習を強化することをお勧めします。 現在の進捗: ",
                      progress.coveragePercentage,
                      "% （目標: 80%以上）"
                    ] })
                  ] }, index);
                }),
                learningProgress.every((p) => p.coveragePercentage >= 70) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "素晴らしい進捗です！全てのドメインで70%以上の学習進捗を達成しています。 より深い理解のため、実践問題や模擬試験に挑戦してみましょう。" })
                ] })
              ] }) })
            ] })
          ]
        }
      ) })
    ] })
  ] });
}, "ECOMappingDashboard");
export {
  ECOMappingDashboard as default
};
