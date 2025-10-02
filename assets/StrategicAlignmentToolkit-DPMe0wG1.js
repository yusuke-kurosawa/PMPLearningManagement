var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { e as Settings, aN as Compass, a8 as Calculator, aX as Lightbulb, av as CheckCircle, ai as AlertTriangle, v as BarChart3, t as Target } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
const StrategicAlignmentToolkit = /* @__PURE__ */ __name(({
  className = ""
}) => {
  const [currentTool, setCurrentTool] = reactExports.useState("swot-analyzer");
  const [swotAnalysis, setSWOTAnalysis] = reactExports.useState({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });
  const [selectedScenario, setSelectedScenario] = reactExports.useState(null);
  const [alignmentScore, setAlignmentScore] = reactExports.useState(null);
  const projectScenarios = [
    {
      id: "digital-transformation",
      title: "デジタル変革プロジェクト",
      description: "全社的なDXを推進し、業務プロセスのデジタル化と新サービス創出を目指すプロジェクト",
      industry: "manufacturing",
      complexity: "high",
      duration: "24ヶ月",
      budget: "5億円",
      stakeholders: ["経営陣", "IT部門", "各事業部", "外部ベンダー", "顧客", "従業員"],
      challenges: [
        "既存システムとの統合",
        "従業員のスキル不足",
        "変革への抵抗",
        "技術選定の困難さ",
        "ROI測定の複雑さ"
      ]
    },
    {
      id: "new-product-launch",
      title: "新製品開発・市場投入",
      description: "市場ニーズに基づく革新的な製品開発と効果的な市場投入戦略の実行",
      industry: "technology",
      complexity: "medium",
      duration: "18ヶ月",
      budget: "2億円",
      stakeholders: ["R&D部門", "マーケティング", "営業", "製造", "品質保証"],
      challenges: [
        "市場ニーズの変化",
        "競合他社の動向",
        "技術的リスク",
        "製造コスト管理",
        "タイムトゥマーケット"
      ]
    },
    {
      id: "infrastructure-upgrade",
      title: "ITインフラ刷新",
      description: "老朽化したITインフラの刷新とクラウド移行によるコスト削減と性能向上",
      industry: "finance",
      complexity: "high",
      duration: "12ヶ月",
      budget: "3億円",
      stakeholders: ["IT部門", "セキュリティ部門", "各事業部", "クラウドベンダー"],
      challenges: [
        "システム移行リスク",
        "セキュリティ要件",
        "ダウンタイム最小化",
        "既存データ移行",
        "法規制遵守"
      ]
    }
  ];
  const SWOTAnalyzer = /* @__PURE__ */ __name(() => {
    var _a;
    const [newItem, setNewItem] = reactExports.useState("");
    const [selectedCategory, setSelectedCategory] = reactExports.useState("strengths");
    const addItem = /* @__PURE__ */ __name(() => {
      if (newItem.trim()) {
        setSWOTAnalysis((prev) => ({
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], newItem.trim()]
        }));
        setNewItem("");
      }
    }, "addItem");
    const removeItem = /* @__PURE__ */ __name((category, index) => {
      setSWOTAnalysis((prev) => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    }, "removeItem");
    const generateInsights = /* @__PURE__ */ __name(() => {
      const insights = [];
      if (swotAnalysis.strengths.length > swotAnalysis.weaknesses.length) {
        insights.push("強みが弱みを上回っており、ポジティブな基盤があります。");
      }
      if (swotAnalysis.opportunities.length > swotAnalysis.threats.length) {
        insights.push("機会が脅威を上回っており、成長の可能性が高いです。");
      }
      if (swotAnalysis.strengths.length > 0 && swotAnalysis.opportunities.length > 0) {
        insights.push("SO戦略（強みを活かして機会を捉える）が有効です。");
      }
      if (swotAnalysis.weaknesses.length > 0 && swotAnalysis.threats.length > 0) {
        insights.push("WT戦略（弱みを改善し脅威を回避する）が重要です。");
      }
      return insights;
    }, "generateInsights");
    const categories = [
      {
        key: "strengths",
        label: "強み (Strengths)",
        color: "bg-green-100 text-green-800",
        icon: "💪"
      },
      {
        key: "weaknesses",
        label: "弱み (Weaknesses)",
        color: "bg-red-100 text-red-800",
        icon: "⚠️"
      },
      {
        key: "opportunities",
        label: "機会 (Opportunities)",
        color: "bg-blue-100 text-blue-800",
        icon: "🚀"
      },
      {
        key: "threats",
        label: "脅威 (Threats)",
        color: "bg-orange-100 text-orange-800",
        icon: "⚡"
      }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "SWOT分析ツール" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "プロジェクトや組織の内部・外部環境を分析します" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "項目追加" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex space-x-2", children: categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: selectedCategory === category.key ? "default" : "outline",
              className: "flex-1",
              onClick: /* @__PURE__ */ __name(() => setSelectedCategory(category.key), "onClick"),
              children: [
                category.icon,
                " ",
                category.label.split(" ")[0]
              ]
            },
            category.key
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: newItem,
                onChange: /* @__PURE__ */ __name((e) => setNewItem(e.target.value), "onChange"),
                placeholder: `${(_a = categories.find((c) => c.key === selectedCategory)) == null ? void 0 : _a.label}を入力...`,
                className: "flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                onKeyPress: /* @__PURE__ */ __name((e) => e.key === "Enter" && addItem(), "onKeyPress")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addItem, children: "追加" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: `rounded-lg p-3 text-center ${category.color}`, children: [
          category.icon,
          " ",
          category.label
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[200px] space-y-2", children: [
          swotAnalysis[category.key].map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between rounded bg-gray-50 p-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: item }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    onClick: /* @__PURE__ */ __name(() => removeItem(category.key, index), "onClick"),
                    children: "×"
                  }
                )
              ]
            },
            index
          )),
          swotAnalysis[category.key].length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-gray-400", children: "項目を追加してください" })
        ] }) })
      ] }, category.key)) }),
      generateInsights().length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "分析結果と推奨アクション" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: generateInsights().map((insight, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: insight })
        ] }, index)) }) })
      ] })
    ] });
  }, "SWOTAnalyzer");
  const ProjectEvaluator = /* @__PURE__ */ __name(() => {
    const [evaluationScores, setEvaluationScores] = reactExports.useState({});
    const evaluationCriteria = [
      {
        id: "strategic-fit",
        name: "戦略適合性",
        description: "組織戦略との整合性",
        weight: 0.25
      },
      {
        id: "business-value",
        name: "ビジネス価値",
        description: "期待される事業価値",
        weight: 0.3
      },
      {
        id: "feasibility",
        name: "実現可能性",
        description: "技術・リソース面での実現性",
        weight: 0.2
      },
      {
        id: "risk-level",
        name: "リスクレベル",
        description: "プロジェクトリスクの大きさ（逆転スコア）",
        weight: 0.15
      },
      {
        id: "urgency",
        name: "緊急性",
        description: "実施の緊急度",
        weight: 0.1
      }
    ];
    const updateScore = /* @__PURE__ */ __name((criteriaId, score) => {
      setEvaluationScores((prev) => ({
        ...prev,
        [criteriaId]: score
      }));
    }, "updateScore");
    const calculateOverallScore = /* @__PURE__ */ __name(() => {
      if (Object.keys(evaluationScores).length !== evaluationCriteria.length) {
        return 0;
      }
      return evaluationCriteria.reduce((total, criteria) => {
        const score = evaluationScores[criteria.id] || 0;
        const adjustedScore = criteria.id === "risk-level" ? 6 - score : score;
        return total + adjustedScore * criteria.weight * 20;
      }, 0);
    }, "calculateOverallScore");
    const getScoreCategory = /* @__PURE__ */ __name((score) => {
      if (score >= 80) {
        return { label: "優先度: 高", color: "text-green-600" };
      }
      if (score >= 60) {
        return { label: "優先度: 中", color: "text-blue-600" };
      }
      if (score >= 40) {
        return { label: "優先度: 低", color: "text-orange-600" };
      }
      return { label: "優先度: 要検討", color: "text-red-600" };
    }, "getScoreCategory");
    const overallScore = calculateOverallScore();
    const scoreCategory = getScoreCategory(overallScore);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "プロジェクト優先度評価" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "複数の評価軸からプロジェクトの優先度を評価します" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "評価対象プロジェクト" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: projectScenarios.map((scenario) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `cursor-pointer transition-all ${(selectedScenario == null ? void 0 : selectedScenario.id) === scenario.id ? "ring-2 ring-blue-500" : ""}`,
            onClick: /* @__PURE__ */ __name(() => setSelectedScenario(scenario), "onClick"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold", children: scenario.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-gray-600", children: scenario.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "期間:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: scenario.duration })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "予算:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: scenario.budget })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    variant: scenario.complexity === "high" ? "destructive" : scenario.complexity === "medium" ? "default" : "secondary",
                    className: "text-xs",
                    children: [
                      "複雑度: ",
                      scenario.complexity
                    ]
                  }
                )
              ] })
            ] })
          },
          scenario.id
        )) }) })
      ] }),
      selectedScenario && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
            selectedScenario.title,
            " - 詳細情報"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "主要ステークホルダー" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: selectedScenario.stakeholders.map((stakeholder, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: stakeholder }, index)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "主要な課題" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: selectedScenario.challenges.map((challenge, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 h-3 w-3 text-orange-500" }),
                challenge
              ] }, index)) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "評価項目" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: evaluationCriteria.map((criteria) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: criteria.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: criteria.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                "重み: ",
                (criteria.weight * 100).toFixed(0),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map((score) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: evaluationScores[criteria.id] === score ? "default" : "outline",
                className: "flex-1",
                onClick: /* @__PURE__ */ __name(() => updateScore(criteria.id, score), "onClick"),
                children: score
              },
              score
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex justify-between text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1: 非常に低い" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "3: 普通" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "5: 非常に高い" })
            ] })
          ] }, criteria.id)) }) })
        ] }),
        overallScore > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "評価結果" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold text-blue-600", children: overallScore.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600", children: "総合スコア (100点満点)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: overallScore, className: "w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-semibold ${scoreCategory.color}`, children: scoreCategory.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "項目別スコア" }),
              evaluationCriteria.map((criteria) => {
                const score = evaluationScores[criteria.id] || 0;
                const adjustedScore = criteria.id === "risk-level" ? 6 - score : score;
                const weightedScore = adjustedScore * criteria.weight * 20;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: criteria.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
                      weightedScore.toFixed(1),
                      "点"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: weightedScore, className: "h-2 w-20" })
                  ] })
                ] }, criteria.id);
              })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "推奨アクション" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                overallScore >= 80 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "高優先度プロジェクトです。早期実行を推奨します。" })
                ] }),
                overallScore >= 60 && overallScore < 80 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "中優先度プロジェクトです。リソース状況を考慮して実行タイミングを決定してください。" })
                ] }),
                overallScore < 60 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "低優先度または要検討プロジェクトです。計画の見直しや改善を検討してください。" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] });
  }, "ProjectEvaluator");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "戦略適合ツールキット" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-4xl text-lg text-gray-600", children: "実践的なツールを使って戦略分析とプロジェクト評価を体験します。" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "分析ツール選択" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `cursor-pointer transition-all ${currentTool === "swot-analyzer" ? "ring-2 ring-blue-500" : ""}`,
            onClick: /* @__PURE__ */ __name(() => setCurrentTool("swot-analyzer"), "onClick"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "mx-auto mb-4 h-12 w-12 text-blue-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "SWOT分析ツール" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "強み・弱み・機会・脅威を分析し、戦略的洞察を得ます" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: `cursor-pointer transition-all ${currentTool === "project-evaluator" ? "ring-2 ring-blue-500" : ""}`,
            onClick: /* @__PURE__ */ __name(() => setCurrentTool("project-evaluator"), "onClick"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "mx-auto mb-4 h-12 w-12 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "プロジェクト評価ツール" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "複数の評価軸からプロジェクトの優先度を定量的に評価します" })
            ] })
          }
        )
      ] }) })
    ] }),
    currentTool === "swot-analyzer" && /* @__PURE__ */ jsxRuntimeExports.jsx(SWOTAnalyzer, {}),
    currentTool === "project-evaluator" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectEvaluator, {})
  ] });
}, "StrategicAlignmentToolkit");
export {
  StrategicAlignmentToolkit as default
};
