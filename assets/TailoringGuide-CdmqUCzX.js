var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardDescription } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { t as tailoringFramework } from "./agileMindsetData-8VeBPcHe.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { e as Settings, t as Target, A as ArrowRight, aG as ChevronUp, a4 as ChevronDown, av as CheckCircle, aY as Building, R as RefreshCw, c as Clock, ai as AlertTriangle, aX as Lightbulb, bd as AlignLeft, be as Shuffle, bf as Minus, bg as PenSquare, ae as Plus } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const TailoringGuide = /* @__PURE__ */ __name(() => {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [selectedLevel, setSelectedLevel] = reactExports.useState(null);
  const [expandedAction, setExpandedAction] = reactExports.useState(null);
  const [projectContext, setProjectContext] = reactExports.useState({
    projectType: "",
    complexity: "medium",
    teamSize: "medium",
    stakeholderInvolvement: "moderate",
    requirements: "evolving",
    timeline: "medium",
    riskLevel: "medium"
  });
  const [showRecommendation, setShowRecommendation] = reactExports.useState(false);
  const [currentPhase, setCurrentPhase] = reactExports.useState(0);
  const { definition, continuousTailoring, levels } = tailoringFramework;
  const calculateRecommendation = reactExports.useCallback(() => {
    let agileScore = 0;
    let predictiveScore = 0;
    if (projectContext.requirements === "unclear" || projectContext.requirements === "evolving") {
      agileScore += 2;
    }
    if (projectContext.requirements === "stable") {
      predictiveScore += 2;
    }
    if (projectContext.complexity === "high") {
      agileScore += 1;
    }
    if (projectContext.complexity === "low") {
      predictiveScore += 1;
    }
    if (projectContext.stakeholderInvolvement === "high") {
      agileScore += 2;
    }
    if (projectContext.stakeholderInvolvement === "limited") {
      predictiveScore += 1;
    }
    if (projectContext.riskLevel === "high") {
      agileScore += 1;
    }
    if (projectContext.riskLevel === "low") {
      predictiveScore += 1;
    }
    if (projectContext.teamSize === "small") {
      agileScore += 1;
    }
    if (projectContext.teamSize === "large") {
      predictiveScore += 1;
    }
    const totalScore = agileScore + predictiveScore;
    const agilePercentage = totalScore > 0 ? agileScore / totalScore * 100 : 50;
    let approach;
    let confidence;
    let rationale;
    let keyConsiderations;
    let suggestedPractices;
    if (agilePercentage >= 70) {
      approach = "agile";
      confidence = agilePercentage;
      rationale = [
        "要求事項の変化が頻繁",
        "高いステークホルダー関与",
        "短いフィードバックサイクルが有効"
      ];
      keyConsiderations = [
        "チームのアジャイル経験確認",
        "ステークホルダーの継続的関与確保",
        "技術的自動化の投資"
      ];
      suggestedPractices = [
        "スプリント計画",
        "デイリースタンドアップ",
        "継続的統合・デプロイ",
        "レトロスペクティブ"
      ];
    } else if (agilePercentage <= 30) {
      approach = "predictive";
      confidence = 100 - agilePercentage;
      rationale = ["要求事項が明確で安定", "低リスクプロジェクト", "従来型プロセスが適合"];
      keyConsiderations = ["詳細な事前計画の重要性", "変更管理プロセスの確立", "品質保証活動の強化"];
      suggestedPractices = [
        "ウォーターフォール型フェーズ",
        "詳細な要求分析",
        "フォーマルなレビュープロセス",
        "包括的なテスト計画"
      ];
    } else {
      approach = "hybrid";
      confidence = 100 - Math.abs(50 - agilePercentage) * 2;
      rationale = ["部分的に予測可能な要求事項", "混合的なプロジェクト特性", "段階的な適応が最適"];
      keyConsiderations = [
        "フェーズ毎のアプローチ選択",
        "チーム能力の段階的向上",
        "ガバナンス要求との調整"
      ];
      suggestedPractices = [
        "予測型計画 + アジャイル実行",
        "段階的な価値提供",
        "リスクベースの意思決定",
        "適応的なガバナンス"
      ];
    }
    return {
      approach,
      confidence,
      rationale,
      keyConsiderations,
      suggestedPractices
    };
  }, [projectContext]);
  const handleRecommendationSubmit = /* @__PURE__ */ __name(() => {
    setShowRecommendation(true);
  }, "handleRecommendationSubmit");
  const toggleActionExpansion = /* @__PURE__ */ __name((actionId) => {
    setExpandedAction(expandedAction === actionId ? null : actionId);
  }, "toggleActionExpansion");
  const getActionIcon = /* @__PURE__ */ __name((action) => {
    switch (action) {
      case "追加 (Add)":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-green-600" });
      case "修正 (Modify)":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PenSquare, { className: "h-5 w-5 text-blue-600" });
      case "削除 (Remove)":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-5 w-5 text-red-600" });
      case "融合 (Combine)":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { className: "h-5 w-5 text-purple-600" });
      case "調整 (Align)":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AlignLeft, { className: "h-5 w-5 text-orange-600" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5" });
    }
  }, "getActionIcon");
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "mr-3 inline-block text-blue-600", size: 40 }),
            "テーラリング実践ガイド"
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
          children: "プロジェクト固有のコンテキストに合わせた最適なテーラリング戦略を学習しましょう"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "概要" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "levels", children: "3つのレベル" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "continuous", children: "継続的テーラリング" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "recommendation", children: "推奨エンジン" })
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 text-blue-600" }),
                "テーラリングとは"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-green-700 dark:text-green-300", children: "What - 何を" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: definition.what })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-blue-700 dark:text-blue-300", children: "Why - なぜ" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: definition.why })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-orange-700 dark:text-orange-300", children: "When - いつ" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: definition.when })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-purple-700 dark:text-purple-300", children: "Who - 誰が" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: definition.who })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "テーラリングの3つのレベル" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "段階的なテーラリングアプローチ" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: levels.map((level, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 },
                  className: "flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-blue-600", children: level.level }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold", children: level.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: level.description })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "text-gray-400", size: 20 })
                  ]
                },
                level.id
              )) }) })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "levels", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: levels.map((level, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.1 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `cursor-pointer transition-all duration-300 ${selectedLevel === level.level ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedLevel(selectedLevel === level.level ? null : level.level), "onClick"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mr-3", children: [
                        "レベル ",
                        level.level
                      ] }),
                      level.title
                    ] }),
                    selectedLevel === level.level ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: level.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedLevel === level.level && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                      level.level === 1 && level.components && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "プロダクトの知識" }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: level.components.productKnowledge.factors.map(
                              (factor, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  CheckCircle,
                                  {
                                    className: "mr-2 mt-0.5 text-green-500",
                                    size: 12
                                  }
                                ),
                                factor
                              ] }, idx)
                            ) }) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "デリバリー・ケイデンス" }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: level.components.deliveryCadence.factors.map(
                              (factor, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  CheckCircle,
                                  {
                                    className: "mr-2 mt-0.5 text-blue-500",
                                    size: 12
                                  }
                                ),
                                factor
                              ] }, idx)
                            ) }) })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "アプローチ選択マトリックス" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full table-auto", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold", children: "要因" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold text-orange-700", children: "予測型" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold text-green-700", children: "アジャイル" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold text-blue-700", children: "ハイブリッド" })
                            ] }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: level.components.selectionCriteria.decisionMatrix.map(
                              (row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "tr",
                                {
                                  className: "border-b hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: row.factor }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-sm", children: row.predictive }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-sm", children: row.agile }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-sm", children: row.hybrid })
                                  ]
                                },
                                idx
                              )
                            ) })
                          ] }) }) })
                        ] })
                      ] }),
                      level.level === 2 && level.tailoringActions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: level.tailoringActions.map((action, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          CardHeader,
                          {
                            className: "cursor-pointer",
                            onClick: /* @__PURE__ */ __name(() => toggleActionExpansion(`level2-action-${idx}`), "onClick"),
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between text-lg", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                                  getActionIcon(action.action),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: action.action })
                                ] }),
                                expandedAction === `level2-action-${idx}` ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: action.description })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: expandedAction === `level2-action-${idx}` && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          motion.div,
                          {
                            initial: { opacity: 0, height: 0 },
                            animate: { opacity: 1, height: "auto" },
                            exit: { opacity: 0, height: 0 },
                            transition: { duration: 0.3 },
                            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-semibold", children: "実例" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: action.examples.map((example, exIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "li",
                                  {
                                    className: "flex items-start text-sm",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        Badge,
                                        {
                                          variant: "outline",
                                          className: "mr-2 mt-0.5 text-xs",
                                          children: exIdx + 1
                                        }
                                      ),
                                      example
                                    ]
                                  },
                                  exIdx
                                )) })
                              ] }),
                              action.considerations && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-semibold", children: "考慮事項" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: action.considerations.map(
                                  (consideration, conIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "li",
                                    {
                                      className: "text-sm text-gray-600 dark:text-gray-400",
                                      children: [
                                        "• ",
                                        consideration
                                      ]
                                    },
                                    conIdx
                                  )
                                ) })
                              ] })
                            ] })
                          }
                        ) })
                      ] }, idx)) }),
                      level.level === 3 && level.tailoringDimensions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: level.tailoringDimensions.map((dimension, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "mr-2 text-purple-600", size: 20 }),
                          dimension.dimension
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                          dimension.adjustments && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold", children: "環境別調整例" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: dimension.adjustments.map((adjustment, adjIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              Card,
                              {
                                className: "border-l-4 border-l-blue-500",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: adjustment.factor }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: adjustment.practices.map(
                                    (practice, practiceIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "li",
                                      {
                                        className: "flex items-start text-xs",
                                        children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                                            CheckCircle,
                                            {
                                              className: "mr-1 mt-0.5 text-green-500",
                                              size: 10
                                            }
                                          ),
                                          practice
                                        ]
                                      },
                                      practiceIdx
                                    )
                                  ) }) })
                                ]
                              },
                              adjIdx
                            )) })
                          ] }),
                          dimension.adaptationStrategies && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold", children: "文化適応戦略" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: dimension.adaptationStrategies.map(
                              (strategy, stratIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                {
                                  className: "rounded border-l-4 border-l-purple-500 bg-purple-50 p-3 dark:bg-purple-900/20",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { className: "mb-2 text-sm font-medium", children: strategy.culture }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: strategy.strategies.map(
                                      (strategyItem, itemIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "li",
                                        {
                                          className: "text-xs text-gray-600 dark:text-gray-400",
                                          children: [
                                            "• ",
                                            strategyItem
                                          ]
                                        },
                                        itemIdx
                                      )
                                    ) })
                                  ]
                                },
                                stratIdx
                              )
                            ) })
                          ] })
                        ] })
                      ] }, idx)) })
                    ] })
                  }
                ) })
              ]
            }
          )
        },
        level.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "continuous", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 text-blue-600" }),
                continuousTailoring.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: continuousTailoring.description })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "テーラリングサイクル" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクト全体を通じた継続的適応プロセス" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex justify-center space-x-2", children: continuousTailoring.phases.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: currentPhase === index ? "default" : "outline",
                    size: "sm",
                    onClick: /* @__PURE__ */ __name(() => setCurrentPhase(index), "onClick"),
                    className: "h-10 w-10 rounded-full",
                    children: index + 1
                  },
                  index
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, x: 50 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -50 },
                    transition: { duration: 0.3 },
                    className: "space-y-4",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-2 text-blue-600", size: 20 }),
                          continuousTailoring.phases[currentPhase].phase
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
                          "タイミング: ",
                          continuousTailoring.phases[currentPhase].timing
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold", children: "主要活動" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: continuousTailoring.phases[currentPhase].activities.map(
                          (activity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 16 }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: activity })
                          ] }, idx)
                        ) })
                      ] })
                    ] })
                  },
                  currentPhase
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      onClick: /* @__PURE__ */ __name(() => setCurrentPhase(Math.max(0, currentPhase - 1)), "onClick"),
                      disabled: currentPhase === 0,
                      children: "前のフェーズ"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      onClick: /* @__PURE__ */ __name(() => setCurrentPhase(
                        Math.min(continuousTailoring.phases.length - 1, currentPhase + 1)
                      ), "onClick"),
                      disabled: currentPhase === continuousTailoring.phases.length - 1,
                      children: "次のフェーズ"
                    }
                  )
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 text-orange-600" }),
                  "テーラリングトリガー"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "テーラリングを実施すべき状況の指標" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: continuousTailoring.triggers.map((trigger, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.3, delay: index * 0.1 },
                  className: "rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 mt-0.5 text-orange-600", size: 16 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: trigger })
                  ] })
                },
                index
              )) }) })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "recommendation", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 text-blue-600" }),
                  "プロジェクト コンテキスト分析"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの特性を入力して、最適なテーラリングアプローチを決定しましょう" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "要求事項の安定性" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["stable", "evolving", "unclear"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.requirements === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({ ...prev, requirements: value })), "onClick"),
                          children: value === "stable" ? "安定" : value === "evolving" ? "進化" : "不明確"
                        },
                        value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "プロジェクト複雑度" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["low", "medium", "high"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.complexity === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({ ...prev, complexity: value })), "onClick"),
                          children: value === "low" ? "低" : value === "medium" ? "中" : "高"
                        },
                        value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "チームサイズ" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["small", "medium", "large"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.teamSize === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({ ...prev, teamSize: value })), "onClick"),
                          children: value === "small" ? "小" : value === "medium" ? "中" : "大"
                        },
                        value
                      )) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "ステークホルダー関与度" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["limited", "moderate", "high"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.stakeholderInvolvement === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({
                            ...prev,
                            stakeholderInvolvement: value
                          })), "onClick"),
                          children: value === "limited" ? "限定的" : value === "moderate" ? "適度" : "高い"
                        },
                        value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "リスクレベル" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["low", "medium", "high"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.riskLevel === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({ ...prev, riskLevel: value })), "onClick"),
                          children: value === "low" ? "低" : value === "medium" ? "中" : "高"
                        },
                        value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "タイムライン" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-x-2", children: ["short", "medium", "long"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: projectContext.timeline === value ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setProjectContext((prev) => ({ ...prev, timeline: value })), "onClick"),
                          children: value === "short" ? "短期" : value === "medium" ? "中期" : "長期"
                        },
                        value
                      )) })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleRecommendationSubmit, className: "w-full", children: "推奨アプローチを取得" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showRecommendation && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -30 },
                transition: { duration: 0.5 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 text-green-600" }),
                    "推奨テーラリングアプローチ"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-6", children: (() => {
                    const recommendation = calculateRecommendation();
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-blue-600", children: recommendation.approach === "agile" ? "アジャイル" : recommendation.approach === "predictive" ? "予測型" : "ハイブリッド" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg text-gray-600 dark:text-gray-400", children: [
                          "信頼度: ",
                          recommendation.confidence.toFixed(1),
                          "%"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: recommendation.confidence, className: "w-full" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-blue-700 dark:text-blue-300", children: "根拠" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: recommendation.rationale.map((reason, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CheckCircle,
                              {
                                className: "mr-2 mt-0.5 text-green-500",
                                size: 12
                              }
                            ),
                            reason
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-orange-700 dark:text-orange-300", children: "主要考慮事項" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: recommendation.keyConsiderations.map((consideration, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertTriangle,
                              {
                                className: "mr-2 mt-0.5 text-orange-500",
                                size: 12
                              }
                            ),
                            consideration
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-purple-700 dark:text-purple-300", children: "推奨プラクティス" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: recommendation.suggestedPractices.map((practice, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Lightbulb,
                              {
                                className: "mr-2 mt-0.5 text-purple-500",
                                size: 12
                              }
                            ),
                            practice
                          ] }, idx)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: /* @__PURE__ */ __name(() => setShowRecommendation(false), "onClick"),
                          variant: "outline",
                          className: "w-full",
                          children: "新しい分析を開始"
                        }
                      ) })
                    ] });
                  })() })
                ] })
              }
            ) })
          ]
        }
      ) })
    ] })
  ] });
}, "TailoringGuide");
export {
  TailoringGuide as default
};
