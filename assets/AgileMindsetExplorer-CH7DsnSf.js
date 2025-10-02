var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { a as agileMindsetConcepts, b as agileMindsetElements } from "./agileMindsetData-8VeBPcHe.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { w as Heart, A as ArrowRight, av as CheckCircle, ai as AlertTriangle, T as TrendingUp, aX as Lightbulb, aG as ChevronUp, a4 as ChevronDown, t as Target, n as BookOpen, R as RefreshCw } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const AgileMindsetExplorer = /* @__PURE__ */ __name(() => {
  const [activeTab, setActiveTab] = reactExports.useState("comparison");
  const [selectedElement, setSelectedElement] = reactExports.useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = reactExports.useState({});
  const [showAssessmentResult, setShowAssessmentResult] = reactExports.useState(false);
  const [expandedSection, setExpandedSection] = reactExports.useState(null);
  const assessmentQuestions = [
    {
      id: "q1",
      question: "変化する要求に対してどの程度柔軟に対応できますか？",
      category: "flexibility"
    },
    {
      id: "q2",
      question: "失敗を学習機会として捉えることができますか？",
      category: "learning"
    },
    {
      id: "q3",
      question: "チームメンバーとのコラボレーションを重視しますか？",
      category: "collaboration"
    },
    {
      id: "q4",
      question: "継続的な改善に取り組んでいますか？",
      category: "improvement"
    },
    {
      id: "q5",
      question: "顧客価値の提供を最優先に考えますか？",
      category: "customer-focus"
    },
    {
      id: "q6",
      question: "プロセスよりも個人と対話を重視しますか？",
      category: "values"
    },
    {
      id: "q7",
      question: "計画に固執せず、変化に対応できますか？",
      category: "adaptability"
    },
    {
      id: "q8",
      question: "フィードバックを積極的に求めますか？",
      category: "feedback"
    }
  ];
  const calculateAssessment = reactExports.useCallback(() => {
    const totalScore = Object.values(assessmentAnswers).reduce((sum, score) => sum + score, 0);
    const maxScore = assessmentQuestions.length * 5;
    const percentage = totalScore / maxScore * 100;
    let level;
    let recommendations;
    let strengths;
    let areasForImprovement;
    if (percentage >= 80) {
      level = "アジャイル・チャンピオン";
      strengths = ["アジャイル価値観の深い理解", "優れた適応能力", "強力なコラボレーションスキル"];
      recommendations = [
        "他のチームメンバーをメンター",
        "アジャイル・コーチングの役割を検討",
        "組織レベルでの変革推進"
      ];
      areasForImprovement = ["継続的な自己反省", "知識の共有"];
    } else if (percentage >= 60) {
      level = "アジャイル・プラクティショナー";
      strengths = ["アジャイル原則の理解", "実践的なスキル", "チームワークの重視"];
      recommendations = [
        "より深いアジャイル原則の学習",
        "リーダーシップスキルの向上",
        "継続的な実践とフィードバック"
      ];
      areasForImprovement = ["変化への対応力", "フィードバック活用"];
    } else if (percentage >= 40) {
      level = "アジャイル・学習者";
      strengths = ["基本的な理解", "学習意欲", "改善への取り組み"];
      recommendations = [
        "アジャイル基礎の体系的学習",
        "小さな実践から始める",
        "メンターやコーチとの連携"
      ];
      areasForImprovement = ["実践的スキル", "チームコラボレーション"];
    } else {
      level = "アジャイル・初心者";
      strengths = ["学習への意欲", "成長の可能性"];
      recommendations = [
        "アジャイル・マニフェストの理解",
        "基本的なアジャイル手法の学習",
        "実践的なトレーニング参加"
      ];
      areasForImprovement = ["基本概念の理解", "マインドセットの変革"];
    }
    return {
      score: percentage,
      level,
      recommendations,
      strengths,
      areasForImprovement
    };
  }, [assessmentAnswers, assessmentQuestions.length]);
  const handleAssessmentSubmit = /* @__PURE__ */ __name(() => {
    if (Object.keys(assessmentAnswers).length === assessmentQuestions.length) {
      setShowAssessmentResult(true);
    }
  }, "handleAssessmentSubmit");
  const { doingVsBeing } = agileMindsetConcepts;
  const { elements } = agileMindsetElements;
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "mr-3 inline-block text-blue-600", size: 40 }),
            "アジャイル・マインドセット エクスプローラー"
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
          children: "アジャイル・マインドセットの本質を理解し、自分のマインドセットレベルを評価しましょう"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: "Doing vs Being" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "elements", children: "マインドセット要素" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "characteristics", children: "アジャイル特徴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "assessment", children: "自己診断" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comparison", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.5 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mr-2 text-blue-600" }),
                doingVsBeing.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: doingVsBeing.description })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, x: -30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.5, delay: 0.2 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-orange-200 dark:border-orange-800", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-orange-700 dark:text-orange-300", children: doingVsBeing.doingAgile.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: doingVsBeing.doingAgile.description })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 flex items-center font-semibold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-green-600", size: 16 }),
                          "特徴"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: doingVsBeing.doingAgile.characteristics.map((char, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-2 mt-0.5 text-xs", children: index + 1 }),
                          char
                        ] }, index)) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 flex items-center font-semibold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 text-yellow-600", size: 16 }),
                          "制限事項"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: doingVsBeing.doingAgile.limitations.map((limit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                          "• ",
                          limit
                        ] }, index)) })
                      ] })
                    ] })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, x: 30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.5, delay: 0.4 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-green-200 dark:border-green-800", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-green-700 dark:text-green-300", children: doingVsBeing.beingAgile.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: doingVsBeing.beingAgile.description })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 flex items-center font-semibold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-green-600", size: 16 }),
                          "特徴"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: doingVsBeing.beingAgile.characteristics.map((char, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-2 mt-0.5 text-xs", children: index + 1 }),
                          char
                        ] }, index)) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 flex items-center font-semibold", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-2 text-blue-600", size: 16 }),
                          "メリット"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: doingVsBeing.beingAgile.benefits.map((benefit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                          "• ",
                          benefit
                        ] }, index)) })
                      ] })
                    ] })
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "主要な違い" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full table-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold", children: "観点" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold text-orange-700 dark:text-orange-300", children: "Doing Agile" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold text-green-700 dark:text-green-300", children: "Being Agile" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: doingVsBeing.keyDifferences.map((diff, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.tr,
                  {
                    className: "border-b hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.3, delay: index * 0.1 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: diff.aspect }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-gray-600 dark:text-gray-400", children: diff.doing }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-gray-600 dark:text-gray-400", children: diff.being })
                    ]
                  },
                  index
                )) })
              ] }) }) })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "elements", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: elements.map((element, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.1 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `cursor-pointer transition-all duration-300 ${selectedElement === element.id ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedElement(selectedElement === element.id ? null : element.id), "onClick"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 text-blue-600", size: 20 }),
                      element.title
                    ] }),
                    selectedElement === element.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: element.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedElement === element.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold", children: "実践方法" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: element.practices.map((practice, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-2 mt-0.5 text-xs", children: idx + 1 }),
                          practice
                        ] }, idx)) })
                      ] }),
                      element.benefits && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-green-700 dark:text-green-300", children: "メリット" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: element.benefits.map((benefit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "li",
                          {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: [
                              "• ",
                              benefit
                            ]
                          },
                          idx
                        )) })
                      ] }),
                      element.challenges && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-orange-700 dark:text-orange-300", children: "課題" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: element.challenges.map((challenge, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "li",
                          {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: [
                              "• ",
                              challenge
                            ]
                          },
                          idx
                        )) })
                      ] })
                    ] })
                  }
                ) })
              ]
            }
          )
        },
        element.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "characteristics", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "より短いイテレーション" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "短期間での価値提供とフィードバック獲得" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "1-4週間の短いサイクルでの開発とデリバリーにより、早期の価値提供と迅速なフィードバック獲得を実現" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-green-700 dark:text-green-300", children: "メリット" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 早期の価値提供" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 迅速なフィードバック獲得" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• リスクの早期発見" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 学習サイクルの高速化" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• ステークホルダーエンゲージメントの向上" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-blue-700 dark:text-blue-300", children: "実装プラクティス" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• スプリント計画" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• デイリースタンドアップ" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• スプリントレビュー" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• スプリントレトロスペクティブ" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 継続的統合・デプロイ" })
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "ステークホルダーのフィードバックに基づくプロダクトの進化" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "継続的なフィードバックによるプロダクトの適応的改善" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-purple-700 dark:text-purple-300", children: "フィードバック源" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• エンドユーザー" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• プロダクトオーナー" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• ビジネスステークホルダー" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 内部チームメンバー" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 技術専門家" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 規制当局" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-cyan-700 dark:text-cyan-300", children: "フィードバック手法" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• デモセッション" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• ユーザビリティテスト" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• プロトタイプレビュー" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• ベータ版リリース" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• A/Bテスト" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 顧客インタビュー" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-emerald-700 dark:text-emerald-300", children: "進化プロセス" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "1. フィードバックの収集" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "2. 優先順位付け" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "3. バックログへの反映" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "4. 次イテレーションでの実装" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "5. 結果の検証" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "6. 継続的な調整" })
                  ] })
                ] })
              ] }) })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "assessment", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mr-2 text-blue-600" }),
                  "アジャイル・マインドセット自己診断"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "以下の質問に答えて、あなたのアジャイル・マインドセットレベルを評価してください" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                assessmentQuestions.map((question, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -30 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.3, delay: index * 0.1 },
                    className: "space-y-3",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium", children: [
                        index + 1,
                        ". ",
                        question.question
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map((score) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: assessmentAnswers[question.id] === score ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => setAssessmentAnswers((prev) => ({ ...prev, [question.id]: score })), "onClick"),
                          className: "h-12 w-12",
                          children: score
                        },
                        score
                      )) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "全く当てはまらない" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "非常に当てはまる" })
                      ] })
                    ]
                  },
                  question.id
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleAssessmentSubmit,
                    disabled: Object.keys(assessmentAnswers).length !== assessmentQuestions.length,
                    className: "w-full",
                    children: "診断結果を表示"
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showAssessmentResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -30 },
                transition: { duration: 0.5 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 text-green-600" }),
                    "診断結果"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-6", children: (() => {
                    const result = calculateAssessment();
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [
                          result.score.toFixed(1),
                          "%"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold", children: result.level }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: result.score, className: "w-full" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-green-700 dark:text-green-300", children: "強み" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: result.strengths.map((strength, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CheckCircle,
                              {
                                className: "mr-2 mt-0.5 text-green-500",
                                size: 12
                              }
                            ),
                            strength
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-blue-700 dark:text-blue-300", children: "推奨事項" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: result.recommendations.map((rec, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 mt-0.5 text-blue-500", size: 12 }),
                            rec
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-orange-700 dark:text-orange-300", children: "改善領域" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: result.areasForImprovement.map((area, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              RefreshCw,
                              {
                                className: "mr-2 mt-0.5 text-orange-500",
                                size: 12
                              }
                            ),
                            area
                          ] }, idx)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: /* @__PURE__ */ __name(() => {
                            setAssessmentAnswers({});
                            setShowAssessmentResult(false);
                          }, "onClick"),
                          variant: "outline",
                          className: "w-full",
                          children: "再診断する"
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
}, "AgileMindsetExplorer");
export {
  AgileMindsetExplorer as default
};
