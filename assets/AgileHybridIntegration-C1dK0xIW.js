var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { S as Separator } from "./separator-Cd8fry1p.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { x as GitMerge, v as BarChart3, ba as Scale, av as CheckCircle, l as Layers, o as Brain, aN as Compass, aG as ChevronUp, a4 as ChevronDown, aX as Lightbulb, t as Target, ai as AlertTriangle, ao as Workflow, Z as Zap } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const AgileHybridIntegration = /* @__PURE__ */ __name(() => {
  const [activeTab, setActiveTab] = reactExports.useState("comparison");
  const [selectedScenario, setSelectedScenario] = reactExports.useState(null);
  const [selectedPattern, setSelectedPattern] = reactExports.useState(null);
  const [expandedSection, setExpandedSection] = reactExports.useState(null);
  const [simulationProgress, setSimulationProgress] = reactExports.useState(0);
  const [isSimulating, setIsSimulating] = reactExports.useState(false);
  const projectScenarios = [
    {
      id: "enterprise-software",
      name: "企業基幹システム開発",
      description: "大規模企業の基幹システムの新規開発・移行プロジェクト",
      characteristics: [
        "複雑な業務要件",
        "厳格な規制要求",
        "多数のステークホルダー",
        "段階的移行の必要性",
        "既存システムとの統合"
      ],
      recommendedApproach: "hybrid",
      rationale: [
        "要求分析と設計フェーズでは予測型が適切",
        "開発・テストフェーズではアジャイルが効果的",
        "リスク管理には予測型の計画性が必要",
        "ユーザーフィードバックにはアジャイルの柔軟性が重要"
      ],
      implementationTips: [
        "段階的な要求固定化",
        "マイルストーン毎のアプローチ見直し",
        "ガバナンスとアジリティのバランス",
        "適応的な品質保証プロセス"
      ],
      challenges: [
        "アプローチ切り替え時の混乱",
        "チームスキルの多様性要求",
        "ガバナンス複雑化",
        "コミュニケーションオーバーヘッド"
      ],
      successFactors: [
        "明確なアプローチ選択基準",
        "チームトレーニング",
        "段階的な適用",
        "継続的なレトロスペクティブ"
      ]
    },
    {
      id: "mobile-app",
      name: "モバイルアプリ開発",
      description: "ユーザー向けモバイルアプリケーションの開発",
      characteristics: [
        "頻繁な要求変更",
        "迅速な市場投入が必要",
        "ユーザーフィードバックが重要",
        "技術的イノベーション",
        "継続的なアップデート"
      ],
      recommendedApproach: "agile",
      rationale: [
        "ユーザーニーズの変化が激しい",
        "早期リリースによる市場検証が重要",
        "継続的な改善が競争優位性",
        "チーム規模が小さく意思決定が迅速"
      ],
      implementationTips: [
        "MVP（最小実用プロダクト）アプローチ",
        "ユーザーテストの継続実施",
        "デプロイ自動化の徹底",
        "A/Bテストによる機能検証"
      ],
      challenges: [
        "技術的負債の蓄積",
        "品質とスピードのバランス",
        "スケーラビリティの確保",
        "セキュリティリスク管理"
      ],
      successFactors: [
        "自動化テストの充実",
        "DevOpsプラクティス",
        "ユーザー中心設計",
        "継続的パフォーマンス監視"
      ]
    },
    {
      id: "infrastructure",
      name: "インフラストラクチャ構築",
      description: "大規模なITインフラストラクチャの構築・更新プロジェクト",
      characteristics: [
        "明確な技術要件",
        "安全性・可用性が最優先",
        "長期間の計画性が必要",
        "規制・コンプライアンス要求",
        "大規模な投資"
      ],
      recommendedApproach: "predictive",
      rationale: [
        "技術仕様が明確で変更が少ない",
        "安全性確保のため詳細な計画が必要",
        "大規模投資のため予算管理が重要",
        "段階的構築による リスク軽減"
      ],
      implementationTips: [
        "詳細な技術仕様策定",
        "リスクアセスメントの徹底",
        "段階的な構築・検証",
        "変更管理プロセスの確立"
      ],
      challenges: [
        "長期プロジェクトでの要求変化",
        "技術進歩への対応",
        "複雑な依存関係管理",
        "ベンダー管理"
      ],
      successFactors: [
        "包括的な事前調査",
        "専門技術チーム",
        "厳格な品質管理",
        "継続的なリスク監視"
      ]
    }
  ];
  const hybridPatterns = [
    {
      id: "phased-agile",
      name: "フェーズド・アジャイル",
      description: "プロジェクトフェーズ毎に予測型とアジャイルを使い分け",
      structure: "分析・設計（予測型） → 開発・テスト（アジャイル） → デプロイ（予測型）",
      benefits: [
        "フェーズ特性に最適化",
        "リスク管理の強化",
        "ガバナンス要求への対応",
        "段階的価値提供"
      ],
      challenges: [
        "フェーズ間の調整",
        "アプローチ切り替え時の混乱",
        "チームスキルの多様性要求",
        "プロセス複雑化"
      ],
      suitableFor: [
        "大規模企業プロジェクト",
        "規制要求があるプロジェクト",
        "複雑な技術統合",
        "段階的リリースが必要"
      ],
      implementationSteps: [
        "フェーズ毎のアプローチ定義",
        "チームトレーニング計画",
        "ガバナンス調整",
        "メトリクス設定",
        "継続的改善プロセス"
      ]
    },
    {
      id: "agile-at-scale",
      name: "スケールド・アジャイル",
      description: "アジャイルベースで予測型要素を統合",
      structure: "アジャイル開発 + 予測型計画・ガバナンス + 段階的統合",
      benefits: [
        "アジャイルの柔軟性維持",
        "企業ガバナンス要求対応",
        "スケーラビリティ確保",
        "継続的価値提供"
      ],
      challenges: [
        "ガバナンスオーバーヘッド",
        "チーム間調整",
        "複雑な依存関係管理",
        "メトリクス統合"
      ],
      suitableFor: ["大規模ソフトウェア開発", "複数チーム協働", "継続的デリバリー", "DevOps環境"],
      implementationSteps: [
        "スケーリングフレームワーク選択",
        "チーム構造設計",
        "プロセス標準化",
        "ツール統合",
        "メトリクス ダッシュボード構築"
      ]
    },
    {
      id: "lean-hybrid",
      name: "リーン・ハイブリッド",
      description: "リーン原則ベースで予測型とアジャイルを組み合わせ",
      structure: "バリューストリーム最適化 + 適応的計画 + 継続的改善",
      benefits: ["無駄の排除", "価値フロー最適化", "学習サイクル高速化", "顧客価値最大化"],
      challenges: ["バリューストリーム可視化", "組織文化変革", "メトリクス設計", "継続的改善文化"],
      suitableFor: ["プロダクト開発", "製造業でのソフトウェア", "サービス改善", "プロセス最適化"],
      implementationSteps: [
        "バリューストリームマッピング",
        "ボトルネック特定",
        "改善施策設計",
        "メトリクス定義",
        "継続的モニタリング"
      ]
    }
  ];
  const approachComparison = {
    dimensions: [
      {
        name: "計画性",
        predictive: 90,
        agile: 30,
        hybrid: 70,
        description: "事前計画の詳細度と固定性"
      },
      {
        name: "柔軟性",
        predictive: 20,
        agile: 95,
        hybrid: 75,
        description: "変化への対応力"
      },
      {
        name: "リスク管理",
        predictive: 85,
        agile: 60,
        hybrid: 80,
        description: "リスクの事前特定と管理"
      },
      {
        name: "価値提供速度",
        predictive: 40,
        agile: 90,
        hybrid: 70,
        description: "早期価値提供の頻度"
      },
      {
        name: "ガバナンス",
        predictive: 95,
        agile: 45,
        hybrid: 80,
        description: "統制・管理の体系性"
      },
      {
        name: "ステークホルダー参加",
        predictive: 35,
        agile: 90,
        hybrid: 70,
        description: "ステークホルダーの継続的関与"
      }
    ]
  };
  const runSimulation = reactExports.useCallback(() => {
    setIsSimulating(true);
    setSimulationProgress(0);
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(GitMerge, { className: "mr-3 inline-block text-blue-600", size: 40 }),
            "アジャイル・ハイブリッド統合学習"
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
          children: "アジャイルとPMBOKの統合アプローチを学び、最適なハイブリッド戦略を習得しましょう"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: "アプローチ比較" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "scenarios", children: "実践シナリオ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "patterns", children: "ハイブリッドパターン" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "simulation", children: "統合シミュレーション" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comparison", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "mr-2 text-blue-600" }),
                  "予測型 vs アジャイル vs ハイブリッド比較"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "各アプローチの特性を多次元で比較分析" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-6", children: approachComparison.dimensions.map((dimension, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 },
                  className: "space-y-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: dimension.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: dimension.description })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-sm text-orange-700 dark:text-orange-300", children: "予測型" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: dimension.predictive, className: "h-3" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-sm font-medium", children: [
                          dimension.predictive,
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-sm text-green-700 dark:text-green-300", children: "アジャイル" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: dimension.agile, className: "h-3" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-sm font-medium", children: [
                          dimension.agile,
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-16 text-sm text-blue-700 dark:text-blue-300", children: "ハイブリッド" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: dimension.hybrid, className: "h-3" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-sm font-medium", children: [
                          dimension.hybrid,
                          "%"
                        ] })
                      ] })
                    ] })
                  ]
                },
                dimension.name
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center text-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "mr-2 text-blue-600", size: 20 }),
                  "バランスの取れたアプローチ"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "予測型の計画性とアジャイルの柔軟性を両立"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "プロジェクト特性に応じた最適化"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "リスクとイノベーションのバランス"
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center text-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "mr-2 text-purple-600", size: 20 }),
                  "段階的適用"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "フェーズ毎の最適アプローチ選択"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "組織の成熟度に応じた導入"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "継続的な改善と適応"
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center text-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "mr-2 text-emerald-600", size: 20 }),
                  "組織学習の促進"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "多様なスキルセットの開発"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "状況判断能力の向上"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                    "適応的思考の育成"
                  ] })
                ] }) })
              ] })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "scenarios", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: projectScenarios.map((scenario, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.1 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `cursor-pointer transition-all duration-300 ${selectedScenario === scenario.id ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id), "onClick"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "mr-2 text-blue-600", size: 20 }),
                      scenario.name,
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "outline",
                          className: `ml-3 ${scenario.recommendedApproach === "agile" ? "border-green-500 text-green-700" : scenario.recommendedApproach === "predictive" ? "border-orange-500 text-orange-700" : "border-blue-500 text-blue-700"}`,
                          children: scenario.recommendedApproach === "agile" ? "アジャイル" : scenario.recommendedApproach === "predictive" ? "予測型" : "ハイブリッド"
                        }
                      )
                    ] }),
                    selectedScenario === scenario.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: scenario.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedScenario === scenario.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold", children: "プロジェクト特性" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: scenario.characteristics.map((char, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-blue-500", size: 14 }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: char })
                        ] }, idx)) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-green-700 dark:text-green-300", children: "推奨理由" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: scenario.rationale.map((reason, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 mt-0.5 text-yellow-500", size: 12 }),
                            reason
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-blue-700 dark:text-blue-300", children: "実装のコツ" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: scenario.implementationTips.map((tip, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 mt-0.5 text-blue-500", size: 12 }),
                            tip
                          ] }, idx)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-orange-700 dark:text-orange-300", children: "課題・リスク" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: scenario.challenges.map((challenge, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertTriangle,
                              {
                                className: "mr-2 mt-0.5 text-orange-500",
                                size: 12
                              }
                            ),
                            challenge
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-purple-700 dark:text-purple-300", children: "成功要因" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: scenario.successFactors.map((factor, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                            factor
                          ] }, idx)) })
                        ] })
                      ] })
                    ] })
                  }
                ) })
              ]
            }
          )
        },
        scenario.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "patterns", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: hybridPatterns.map((pattern, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.1 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `cursor-pointer transition-all duration-300 ${selectedPattern === pattern.id ? "shadow-lg ring-2 ring-purple-500" : "hover:shadow-md"}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id), "onClick"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "mr-2 text-purple-600", size: 20 }),
                      pattern.name
                    ] }),
                    selectedPattern === pattern.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: pattern.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: pattern.structure }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedPattern === pattern.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-green-700 dark:text-green-300", children: "メリット" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: pattern.benefits.map((benefit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 text-green-500", size: 12 }),
                            benefit
                          ] }, idx)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-orange-700 dark:text-orange-300", children: "課題" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: pattern.challenges.map((challenge, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start text-sm", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertTriangle,
                              {
                                className: "mr-2 mt-0.5 text-orange-500",
                                size: 12
                              }
                            ),
                            challenge
                          ] }, idx)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-blue-700 dark:text-blue-300", children: "適用シーン" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: pattern.suitableFor.map((scenario, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 text-blue-500", size: 14 }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: scenario })
                        ] }, idx)) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-3 font-semibold text-purple-700 dark:text-purple-300", children: "実装ステップ" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: pattern.implementationSteps.map((step, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mr-3 mt-0.5", children: idx + 1 }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: step })
                        ] }, idx)) })
                      ] })
                    ] })
                  }
                ) })
              ]
            }
          )
        },
        pattern.id
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "simulation", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "space-y-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "mr-2 text-blue-600" }),
                "アジャイル・ハイブリッド統合シミュレーション"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "仮想的なプロジェクトシナリオでハイブリッドアプローチの効果を体験" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "このシミュレーションでは、企業基幹システム開発プロジェクトにおいて、 ハイブリッドアプローチがどのように段階的に適用されるかを体験できます。" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "シミュレーション設定" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium", children: "プロジェクト" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                      "企業基幹システム更新",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "期間: 18ヶ月",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "チーム: 50名"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium", children: "アプローチ" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                      "フェーズド・ハイブリッド",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "計画 → アジャイル開発 → 統合"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium", children: "成功指標" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                      "納期遵守: 95%",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "品質目標: 99%",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "ステークホルダー満足度: 90%"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "シミュレーション進行" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: runSimulation, disabled: isSimulating, className: "w-32", children: isSimulating ? "実行中..." : "開始" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "進行状況" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      simulationProgress,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: simulationProgress, className: "w-full" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: simulationProgress > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 },
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: simulationProgress >= 33 ? "border-green-500" : "", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "フェーズ 1: 分析・設計" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm", children: "予測型アプローチ" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: simulationProgress >= 33 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            motion.div,
                            {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              className: "space-y-2",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-green-500", size: 14 }),
                                  "要求分析完了"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-green-500", size: 14 }),
                                  "アーキテクチャ設計完了"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-green-500", size: 14 }),
                                  "詳細設計完了"
                                ] })
                              ]
                            }
                          ) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: simulationProgress >= 66 ? "border-blue-500" : "", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "フェーズ 2: 開発・テスト" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm", children: "アジャイルアプローチ" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: simulationProgress >= 66 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            motion.div,
                            {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              className: "space-y-2",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-blue-500", size: 14 }),
                                  "スプリント 1-6 完了"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-blue-500", size: 14 }),
                                  "継続的統合実装"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-blue-500", size: 14 }),
                                  "ユーザーフィードバック統合"
                                ] })
                              ]
                            }
                          ) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: simulationProgress >= 100 ? "border-purple-500" : "", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "フェーズ 3: 統合・展開" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm", children: "ハイブリッドアプローチ" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: simulationProgress >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            motion.div,
                            {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              className: "space-y-2",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-purple-500", size: 14 }),
                                  "システム統合完了"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-purple-500", size: 14 }),
                                  "段階的移行完了"
                                ] }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 text-purple-500", size: 14 }),
                                  "本格運用開始"
                                ] })
                              ]
                            }
                          ) })
                        ] })
                      ] }),
                      simulationProgress === 100 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          initial: { opacity: 0, scale: 0.9 },
                          animate: { opacity: 1, scale: 1 },
                          transition: { duration: 0.5 },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "シミュレーション完了！" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                              "ハイブリッドアプローチにより、計画性と柔軟性を両立し、 予定通りの納期で高品質なシステムを構築できました。 ステークホルダー満足度: 92%、品質目標達成率: 98%"
                            ] })
                          ] })
                        }
                      )
                    ]
                  }
                ) })
              ] })
            ] })
          ] })
        }
      ) })
    ] })
  ] });
}, "AgileHybridIntegration");
export {
  AgileHybridIntegration as default
};
