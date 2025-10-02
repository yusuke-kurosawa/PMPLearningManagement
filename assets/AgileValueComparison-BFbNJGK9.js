var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { S as Slider } from "./slider-CwrF050w.js";
import { a as agileManifestoData } from "./agileManifestoData-Dl5TDcZS.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { ba as Scale, bb as PieChart, t as Target, v as BarChart3, j as RotateCcw, aX as Lightbulb, A as ArrowRight, s as Users, aR as Code, T as TrendingUp, av as CheckCircle, ai as AlertTriangle, bc as PlayCircle } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
const AgileValueComparison = /* @__PURE__ */ __name(() => {
  const [currentValues, setCurrentValues] = reactExports.useState(
    agileManifestoData.manifesto.values.map((value) => ({
      id: value.id,
      leftValue: 70,
      // Default Agile-recommended balance
      rightValue: 30
    }))
  );
  const [selectedScenario, setSelectedScenario] = reactExports.useState(null);
  const [isAnimating, setIsAnimating] = reactExports.useState(false);
  const [showImpact, setShowImpact] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState("balance");
  const scenarios = [
    {
      id: "startup",
      name: "スタートアップ開発",
      description: "小規模チームでの迅速なプロダクト開発",
      recommendedBalances: [
        { id: "value-1", leftValue: 85, rightValue: 15 },
        // 個人と対話 > プロセス
        { id: "value-2", leftValue: 90, rightValue: 10 },
        // 動くソフトウェア > ドキュメント
        { id: "value-3", leftValue: 95, rightValue: 5 },
        // 顧客協調 > 契約交渉
        { id: "value-4", leftValue: 80, rightValue: 20 }
        // 変化対応 > 計画
      ],
      context: "限られたリソースで迅速な市場投入が求められる環境",
      outcomes: [
        "迅速なフィードバックループ",
        "高い適応性",
        "最小限の官僚制",
        "顧客との密接な関係"
      ]
    },
    {
      id: "enterprise",
      name: "エンタープライズ開発",
      description: "大規模組織での規制要件がある開発",
      recommendedBalances: [
        { id: "value-1", leftValue: 60, rightValue: 40 },
        // バランス重視
        { id: "value-2", leftValue: 65, rightValue: 35 },
        // ドキュメントも重要
        { id: "value-3", leftValue: 70, rightValue: 30 },
        // 契約も必要
        { id: "value-4", leftValue: 55, rightValue: 45 }
        // 計画性重視
      ],
      context: "コンプライアンス要件と安定性が重視される環境",
      outcomes: [
        "適切なドキュメント管理",
        "リスク管理の強化",
        "ステークホルダーの合意",
        "継続的な改善"
      ]
    },
    {
      id: "research",
      name: "研究開発プロジェクト",
      description: "不確実性の高い革新的な開発",
      recommendedBalances: [
        { id: "value-1", leftValue: 80, rightValue: 20 },
        // 創造性重視
        { id: "value-2", leftValue: 75, rightValue: 25 },
        // 実験重視
        { id: "value-3", leftValue: 85, rightValue: 15 },
        // 密接な協力
        { id: "value-4", leftValue: 90, rightValue: 10 }
        // 高い適応性
      ],
      context: "未知の技術や市場での探索的な開発",
      outcomes: ["革新的なソリューション", "学習の最大化", "実験と失敗の許容", "創造的な問題解決"]
    }
  ];
  const values = agileManifestoData.manifesto.values;
  const updateValueBalance = /* @__PURE__ */ __name((valueId, newLeftValue) => {
    setCurrentValues(
      (prev) => prev.map(
        (value) => value.id === valueId ? { ...value, leftValue: newLeftValue, rightValue: 100 - newLeftValue } : value
      )
    );
  }, "updateValueBalance");
  const resetToDefault = /* @__PURE__ */ __name(() => {
    setIsAnimating(true);
    setCurrentValues(
      (prev) => prev.map((value) => ({
        ...value,
        leftValue: 70,
        rightValue: 30
      }))
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, "resetToDefault");
  const applyScenario = /* @__PURE__ */ __name((scenario) => {
    setIsAnimating(true);
    setCurrentValues(scenario.recommendedBalances);
    setSelectedScenario(scenario);
    setTimeout(() => setIsAnimating(false), 800);
  }, "applyScenario");
  const getValueIcon = /* @__PURE__ */ __name((index) => {
    const icons = [Users, Code, Users, TrendingUp];
    return icons[index];
  }, "getValueIcon");
  const getValueColor = /* @__PURE__ */ __name((index) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600"
    ];
    return colors[index];
  }, "getValueColor");
  const getBalanceDescription = /* @__PURE__ */ __name((leftValue) => {
    if (leftValue >= 80) {
      return "強くアジャイル寄り";
    }
    if (leftValue >= 60) {
      return "アジャイル寄り";
    }
    if (leftValue >= 40) {
      return "バランス型";
    }
    if (leftValue >= 20) {
      return "従来型寄り";
    }
    return "強く従来型";
  }, "getBalanceDescription");
  const getBalanceColor = /* @__PURE__ */ __name((leftValue) => {
    if (leftValue >= 80) {
      return "text-green-600 dark:text-green-400";
    }
    if (leftValue >= 60) {
      return "text-blue-600 dark:text-blue-400";
    }
    if (leftValue >= 40) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    if (leftValue >= 20) {
      return "text-orange-600 dark:text-orange-400";
    }
    return "text-red-600 dark:text-red-400";
  }, "getBalanceColor");
  const calculateOverallBalance = /* @__PURE__ */ __name(() => {
    const average = currentValues.reduce((sum, value) => sum + value.leftValue, 0) / currentValues.length;
    return Math.round(average);
  }, "calculateOverallBalance");
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-8 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
        className: "space-y-4 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-gradient-to-r from-purple-500 to-orange-600 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-8 w-8 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent", children: "アジャイル価値バランス分析" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-3xl text-xl text-muted-foreground", children: "4つのアジャイル価値のバランスを調整し、プロジェクト状況に応じた最適な重み付けを探る" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.3 },
        className: "mx-auto flex w-fit justify-center space-x-1 rounded-lg bg-muted p-1",
        children: [
          { key: "balance", label: "バランス調整", icon: Scale },
          { key: "radar", label: "レーダーチャート", icon: PieChart },
          { key: "scenarios", label: "シナリオ比較", icon: Target }
        ].map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: viewMode === key ? "default" : "ghost",
            size: "sm",
            onClick: /* @__PURE__ */ __name(() => setViewMode(key), "onClick"),
            className: "flex items-center space-x-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
            ]
          },
          key
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      viewMode === "balance" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "全体的なアジャイル度" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-bold text-primary", children: [
                  calculateOverallBalance(),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-lg font-medium ${getBalanceColor(calculateOverallBalance())}`,
                    children: getBalanceDescription(calculateOverallBalance())
                  }
                )
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: itemVariants, className: "flex justify-center space-x-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: resetToDefault,
                  variant: "outline",
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "デフォルトに戻す" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: /* @__PURE__ */ __name(() => setShowImpact(!showImpact), "onClick"),
                  variant: "outline",
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "影響分析を",
                      showImpact ? "隠す" : "表示"
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, className: "space-y-6", children: values.map((value, index) => {
              const currentBalance = currentValues.find((v) => v.id === value.id);
              const IconComponent = getValueIcon(index);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: `transition-all duration-500 ${isAnimating ? "scale-105" : "scale-100"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `rounded-xl bg-gradient-to-r p-3 ${getValueColor(index)}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-6 w-6 text-white" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: value.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: value.subtitle })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-right", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: `text-lg font-bold ${getBalanceColor((currentBalance == null ? void 0 : currentBalance.leftValue) || 70)}`,
                            children: [
                              (currentBalance == null ? void 0 : currentBalance.leftValue) || 70,
                              "% :",
                              " ",
                              (currentBalance == null ? void 0 : currentBalance.rightValue) || 30,
                              "%"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: getBalanceDescription((currentBalance == null ? void 0 : currentBalance.leftValue) || 70) })
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: value.leftSide.value }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-600", children: value.rightSide.value })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-8 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            motion.div,
                            {
                              className: "h-full bg-gradient-to-r from-green-500 to-blue-500",
                              initial: { width: "70%" },
                              animate: { width: `${(currentBalance == null ? void 0 : currentBalance.leftValue) || 70}%` },
                              transition: { duration: 0.5, ease: "easeInOut" }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-white" }) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Slider,
                          {
                            value: [(currentBalance == null ? void 0 : currentBalance.leftValue) || 70],
                            onValueChange: /* @__PURE__ */ __name((value2) => updateValueBalance(value2.id, value2[0]), "onValueChange"),
                            max: 100,
                            min: 0,
                            step: 5,
                            className: "w-full"
                          }
                        ) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 text-sm md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-3 dark:bg-green-950", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-medium text-green-800 dark:text-green-200", children: "重視する価値" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-green-700 dark:text-green-300", children: value.leftSide.explanation })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-3 dark:bg-gray-900", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-medium text-gray-800 dark:text-gray-200", children: "従来のアプローチ" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-700 dark:text-gray-300", children: value.rightSide.explanation })
                        ] })
                      ] })
                    ] })
                  ] })
                },
                value.id
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showImpact && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: 0 },
                transition: { duration: 0.5 },
                className: "overflow-hidden",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImpactAnalysis, { currentValues })
              }
            ) })
          ]
        },
        "balance"
      ),
      viewMode === "radar" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadarChart, { currentValues, values })
        },
        "radar"
      ),
      viewMode === "scenarios" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "プロジェクトシナリオ" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "異なるプロジェクト状況に応じた推奨バランスを確認できます" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: scenarios.map((scenario) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                ScenarioCard,
                {
                  scenario,
                  isSelected: (selectedScenario == null ? void 0 : selectedScenario.id) === scenario.id,
                  onApply: /* @__PURE__ */ __name(() => applyScenario(scenario), "onApply")
                },
                scenario.id
              )) }) })
            ] }) }),
            selectedScenario && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioDetail, { scenario: selectedScenario, currentValues }) })
          ]
        },
        "scenarios"
      )
    ] })
  ] });
}, "AgileValueComparison");
const ImpactAnalysis = /* @__PURE__ */ __name(({ currentValues }) => {
  const overallBalance = currentValues.reduce((sum, value) => sum + value.leftValue, 0) / currentValues.length;
  const getImpactAnalysis = /* @__PURE__ */ __name(() => {
    if (overallBalance >= 80) {
      return {
        style: "アジャイル重視型",
        strengths: ["迅速な価値提供", "高い適応性", "顧客満足度向上", "チームの自律性"],
        risks: ["ドキュメント不足", "プロセスの一貫性欠如", "スケーラビリティの課題"],
        recommendations: [
          "重要なドキュメントの最小限の維持",
          "チーム間の知識共有強化",
          "基本的なプロセス標準化"
        ]
      };
    } else if (overallBalance >= 60) {
      return {
        style: "バランス型",
        strengths: ["安定したデリバリー", "適度な文書化", "リスク管理", "継続的改善"],
        risks: ["意思決定の遅延", "オーバーヘッドの増加", "革新性の低下"],
        recommendations: [
          "定期的なバランス見直し",
          "コンテキストに応じた調整",
          "チームフィードバックの活用"
        ]
      };
    } else {
      return {
        style: "従来型重視",
        strengths: ["予測可能性", "詳細な文書化", "プロセス遵守", "リスク軽減"],
        risks: ["変化への対応遅れ", "顧客価値の見失い", "チームモチベーション低下"],
        recommendations: ["段階的なアジャイル導入", "顧客フィードバック強化", "チーム自律性の向上"]
      };
    }
  }, "getImpactAnalysis");
  const analysis = getImpactAnalysis();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "影響分析" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "現在の設定による影響と推奨事項" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "px-4 py-2 text-lg", children: analysis.style }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "強み" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: analysis.strengths.map((strength, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: strength })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-orange-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "リスク" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: analysis.risks.map((risk, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: risk })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-blue-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "推奨事項" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: analysis.recommendations.map((recommendation, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: recommendation })
          ] }, index)) })
        ] })
      ] })
    ] }) })
  ] });
}, "ImpactAnalysis");
const RadarChart = /* @__PURE__ */ __name(({ currentValues, values }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PieChart, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "バランス可視化" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-8", children: values.map((value, index) => {
      const balance = currentValues.find((v) => v.id === value.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: value.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-primary", children: [
            (balance == null ? void 0 : balance.leftValue) || 70,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full bg-gradient-to-r from-green-500 to-blue-500",
            style: { width: `${(balance == null ? void 0 : balance.leftValue) || 70}%` }
          }
        ) })
      ] }, value.id);
    }) }) })
  ] });
}, "RadarChart");
const ScenarioCard = /* @__PURE__ */ __name(({ scenario, isSelected, onApply }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: `cursor-pointer transition-all duration-300 ${isSelected ? "shadow-lg ring-2 ring-primary" : "hover:shadow-md"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: scenario.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm", children: scenario.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: scenario.context }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: onApply,
              size: "sm",
              className: "w-full",
              variant: isSelected ? "default" : "outline",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PlayCircle, { className: "mr-2 h-4 w-4" }),
                isSelected ? "適用済み" : "このシナリオを適用"
              ]
            }
          )
        ] }) })
      ]
    }
  );
}, "ScenarioCard");
const ScenarioDetail = /* @__PURE__ */ __name(({ scenario, currentValues }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
        scenario.name,
        "の詳細分析"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: scenario.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium", children: "コンテキスト" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: scenario.context })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium", children: "期待される成果" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: scenario.outcomes.map((outcome, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-1 h-4 w-4 flex-shrink-0 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: outcome })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium", children: "推奨バランス設定" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: scenario.recommendedBalances.map((balance, index) => {
          const value = agileManifestoData.manifesto.values.find((v) => v.id === balance.id);
          const current = currentValues.find((v) => v.id === balance.id);
          const isMatched = Math.abs(((current == null ? void 0 : current.leftValue) || 70) - balance.leftValue) <= 5;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between rounded-lg bg-muted p-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value == null ? void 0 : value.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                    "推奨: ",
                    balance.leftValue,
                    "% - 現在: ",
                    (current == null ? void 0 : current.leftValue) || 70,
                    "%"
                  ] }),
                  isMatched ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" })
                ] })
              ]
            },
            balance.id
          );
        }) })
      ] })
    ] })
  ] });
}, "ScenarioDetail");
export {
  AgileValueComparison as default
};
