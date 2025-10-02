var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { S as Slider } from "./slider-CwrF050w.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CYArGpXK.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { T as TrendingUp, t as Target, Z as Zap, e as Settings, j as RotateCcw, I as Activity, aq as CheckCircle2, c as Clock, v as BarChart3, aw as AlertCircle, ar as Award, bi as MessageCircle, aX as Lightbulb, a8 as Calculator } from "./lucide-icons-B7slfWYt.js";
import { R as ResponsiveContainer, i as ComposedChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, f as Area, g as Line, e as Bar, B as BarChart, h as LineChart, A as AreaChart } from "./recharts-D6bUNjjp.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
import "./d3-core-DnNGvVRC.js";
const IncrementalValueVisualization = /* @__PURE__ */ __name(() => {
  var _a, _b;
  const [sprintCount, setSprintCount] = reactExports.useState([8]);
  const [sprintDuration, setSprintDuration] = reactExports.useState([2]);
  const [teamVelocity, setTeamVelocity] = reactExports.useState([75]);
  const [valuePerSprint, setValuePerSprint] = reactExports.useState([12]);
  const [selectedScenario, setSelectedScenario] = reactExports.useState("balanced");
  const [activeTab, setActiveTab] = reactExports.useState("timeline");
  const [animationEnabled, setAnimationEnabled] = reactExports.useState(true);
  const [customSprintValues, setCustomSprintValues] = reactExports.useState([]);
  const [feedbackImpact, setFeedbackImpact] = reactExports.useState([15]);
  const scenarios = {
    conservative: {
      name: "保守的アプローチ",
      description: "慎重な段階的リリース",
      color: "#8b5cf6",
      valuePattern: [8, 10, 12, 14, 16, 18, 20, 22],
      riskReduction: 0.8,
      feedbackValue: 10
    },
    balanced: {
      name: "バランス型",
      description: "適度なリスクテイク",
      color: "#06b6d4",
      valuePattern: [10, 12, 15, 18, 20, 22, 25, 28],
      riskReduction: 0.6,
      feedbackValue: 15
    },
    aggressive: {
      name: "アグレッシブ",
      description: "早期価値最大化",
      color: "#10b981",
      valuePattern: [15, 18, 22, 25, 28, 30, 32, 35],
      riskReduction: 0.4,
      feedbackValue: 20
    }
  };
  const timelineData = reactExports.useMemo(() => {
    const sprints = sprintCount[0];
    const scenario = scenarios[selectedScenario];
    const customValues = customSprintValues.length > 0 ? customSprintValues : scenario.valuePattern;
    const data = [];
    let cumulativeAgile = 0;
    const waterfallDelay = Math.ceil(sprints * 0.6);
    for (let i = 0; i <= sprints; i++) {
      const week = i * sprintDuration[0];
      const sprintValue = i === 0 ? 0 : customValues[i - 1] || valuePerSprint[0];
      const feedbackBonus = i > 2 ? (i - 2) * (feedbackImpact[0] / 100) : 0;
      const adjustedValue = sprintValue * (1 + feedbackBonus);
      cumulativeAgile += adjustedValue;
      const waterfallValue = i >= waterfallDelay ? cumulativeAgile * 1.2 : 0;
      data.push({
        week,
        sprint: i,
        sprintValue: adjustedValue,
        cumulativeAgile,
        waterfallValue,
        riskLevel: Math.max(100 - i * 10, 20),
        mvpReadiness: Math.min(i / 3 * 100, 100)
      });
    }
    return data;
  }, [
    sprintCount,
    sprintDuration,
    valuePerSprint,
    selectedScenario,
    customSprintValues,
    feedbackImpact
  ]);
  const mvpMilestones = reactExports.useMemo(() => {
    const sprints = sprintCount[0];
    return [
      { sprint: 2, name: "MVP Alpha", value: 20, description: "基本機能完成" },
      {
        sprint: Math.ceil(sprints * 0.4),
        name: "MVP Beta",
        value: 50,
        description: "コア機能統合"
      },
      {
        sprint: Math.ceil(sprints * 0.7),
        name: "MVP Release",
        value: 80,
        description: "市場投入準備"
      },
      { sprint: sprints, name: "Full Product", value: 100, description: "全機能完成" }
    ];
  }, [sprintCount]);
  const roiComparisonData = reactExports.useMemo(() => {
    var _a2;
    const totalAgileValue = ((_a2 = timelineData[timelineData.length - 1]) == null ? void 0 : _a2.cumulativeAgile) || 0;
    const totalWaterfallValue = totalAgileValue * 1.2;
    const investment = 100;
    return [
      {
        approach: "ウォーターフォール",
        roi: ((totalWaterfallValue - investment) / investment * 100).toFixed(1),
        timeToValue: sprintCount[0] * sprintDuration[0] * 0.6,
        risk: "High",
        flexibility: "Low",
        value: totalWaterfallValue
      },
      {
        approach: "アジャイル",
        roi: ((totalAgileValue - investment) / investment * 100).toFixed(1),
        timeToValue: sprintDuration[0] * 2,
        risk: "Low",
        flexibility: "High",
        value: totalAgileValue
      }
    ];
  }, [timelineData, sprintCount, sprintDuration]);
  const valuePatternData = reactExports.useMemo(() => {
    return Object.entries(scenarios).map(([key, scenario]) => ({
      name: scenario.name,
      earlyValue: scenario.valuePattern.slice(0, 3).reduce((a, b) => a + b, 0),
      midValue: scenario.valuePattern.slice(3, 6).reduce((a, b) => a + b, 0),
      lateValue: scenario.valuePattern.slice(6).reduce((a, b) => a + b, 0),
      totalValue: scenario.valuePattern.reduce((a, b) => a + b, 0),
      risk: scenario.riskReduction,
      color: scenario.color
    }));
  }, []);
  const feedbackLoopData = reactExports.useMemo(() => {
    const data = [];
    for (let i = 1; i <= sprintCount[0]; i++) {
      const baseFeedback = 50;
      const improvementRate = feedbackImpact[0] / 100;
      const cumulativeImprovement = (i - 1) * improvementRate * 10;
      data.push({
        sprint: i,
        userFeedback: baseFeedback + Math.random() * 30 - 15,
        qualityImprovement: Math.min(baseFeedback + cumulativeImprovement, 95),
        featureAdoption: Math.min(i / sprintCount[0] * 100, 90),
        iteration: i
      });
    }
    return data;
  }, [sprintCount, feedbackImpact]);
  const resetToDefaults = /* @__PURE__ */ __name(() => {
    setSprintCount([8]);
    setSprintDuration([2]);
    setTeamVelocity([75]);
    setValuePerSprint([12]);
    setSelectedScenario("balanced");
    setFeedbackImpact([15]);
    setCustomSprintValues([]);
  }, "resetToDefaults");
  const customTooltip = /* @__PURE__ */ __name(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-300 bg-white p-3 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: `スプリント ${label}` }),
        payload.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: entry.color }, children: `${entry.name}: ${typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}` }, index))
      ] });
    }
    return null;
  }, "customTooltip");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-3xl font-bold text-gray-900 sm:text-4xl", children: "漸進型価値実現の視覚化" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-lg text-gray-600", children: "アジャイル開発における段階的な価値提供とビジネスインパクトの分析" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-1 h-3 w-3" }),
          "継続的価値提供"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-1 h-3 w-3" }),
          "リスク軽減"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-purple-50 text-purple-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "mr-1 h-3 w-3" }),
          "早期フィードバック"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5 text-blue-600" }),
          "シミュレーション設定"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトパラメータを調整して価値実現パターンを分析" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium", children: [
              "スプリント数: ",
              sprintCount[0]
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Slider,
              {
                value: sprintCount,
                onValueChange: setSprintCount,
                max: 12,
                min: 4,
                step: 1,
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium", children: [
              "スプリント期間: ",
              sprintDuration[0],
              "週"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Slider,
              {
                value: sprintDuration,
                onValueChange: setSprintDuration,
                max: 4,
                min: 1,
                step: 1,
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium", children: [
              "価値/スプリント: ",
              valuePerSprint[0]
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Slider,
              {
                value: valuePerSprint,
                onValueChange: setValuePerSprint,
                max: 30,
                min: 5,
                step: 1,
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium", children: [
              "フィードバック効果: ",
              feedbackImpact[0],
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Slider,
              {
                value: feedbackImpact,
                onValueChange: setFeedbackImpact,
                max: 50,
                min: 0,
                step: 5,
                className: "w-full"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "実現シナリオ:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedScenario, onValueChange: setSelectedScenario, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(scenarios).map(([key, scenario]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: key, children: scenario.name }, key)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: resetToDefaults, variant: "outline", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-2 h-4 w-4" }),
            "リセット"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "timeline", children: "価値タイムライン" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: "比較分析" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mvp", children: "MVP進捗" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "feedback", children: "フィードバックループ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "roi", children: "ROI分析" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "timeline", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-6 w-6 text-blue-600" }),
              "累積価値実現タイムライン"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "アジャイル vs ウォーターフォールの価値提供パターン比較" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: timelineData, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "week",
                label: { value: "週", position: "insideBottom", offset: -5 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { label: { value: "累積価値", angle: -90, position: "insideLeft" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: customTooltip }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Area,
              {
                type: "monotone",
                dataKey: "cumulativeAgile",
                stroke: "#06b6d4",
                fill: "#06b6d4",
                fillOpacity: 0.3,
                name: "アジャイル (累積)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: "waterfallValue",
                stroke: "#ef4444",
                strokeWidth: 3,
                name: "ウォーターフォール",
                strokeDasharray: "5 5"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                dataKey: "sprintValue",
                fill: "#10b981",
                name: "スプリント価値",
                fillOpacity: 0.7
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6 text-green-600" }),
            "価値実現マイルストーン"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: mvpMilestones.map((milestone, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${milestone.sprint <= sprintCount[0] ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`,
                  children: milestone.sprint <= sprintCount[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-6 w-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-6 w-6" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: milestone.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-gray-600", children: milestone.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: milestone.sprint <= sprintCount[0] ? "default" : "secondary",
                children: [
                  "スプリント ",
                  milestone.sprint
                ]
              }
            )
          ] }) }, index)) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "comparison", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-6 w-6 text-purple-600" }),
              "価値実現パターン比較"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: valuePatternData, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "earlyValue", stackId: "a", fill: "#10b981", name: "初期価値" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "midValue", stackId: "a", fill: "#06b6d4", name: "中期価値" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "lateValue", stackId: "a", fill: "#8b5cf6", name: "後期価値" })
            ] }) }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-6 w-6 text-orange-600" }),
              "リスク軽減効果"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: timelineData, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "sprint" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: "riskLevel",
                  stroke: "#ef4444",
                  strokeWidth: 3,
                  name: "リスクレベル (%)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: "mvpReadiness",
                  stroke: "#10b981",
                  strokeWidth: 3,
                  name: "MVP準備度 (%)"
                }
              )
            ] }) }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "開発アプローチ比較" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "アプローチ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "ROI (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "価値実現開始" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "リスク" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "柔軟性" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "総価値" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: roiComparisonData.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 font-medium", children: row.approach }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2", children: [
                row.roi,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2", children: [
                row.timeToValue,
                "週"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: row.risk === "High" ? "destructive" : "default", children: row.risk }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: row.flexibility === "High" ? "default" : "secondary", children: row.flexibility }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: row.value.toFixed(1) })
            ] }, index)) })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "mvp", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6 text-yellow-600" }),
              "MVP段階的構築プロセス"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Minimum Viable Productの段階的な価値向上" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: timelineData, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "sprint" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Area,
              {
                type: "monotone",
                dataKey: "mvpReadiness",
                stroke: "#f59e0b",
                fill: "#f59e0b",
                fillOpacity: 0.3,
                name: "MVP準備度 (%)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                dataKey: "sprintValue",
                fill: "#10b981",
                name: "スプリント価値",
                fillOpacity: 0.7
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "MVP価値マップ" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
            {
              phase: "Alpha",
              features: ["基本ユーザー登録", "コア機能", "シンプルUI"],
              value: 25
            },
            {
              phase: "Beta",
              features: ["統合テスト完了", "パフォーマンス最適化", "フィードバック収集"],
              value: 60
            },
            {
              phase: "Release",
              features: ["本番環境準備", "ドキュメント完備", "運用監視"],
              value: 100
            }
          ].map((mvp, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg", children: [
              "MVP ",
              mvp.phase
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-bold text-white", children: [
                mvp.value,
                "%"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: mvp.features.map((feature, fIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-3 w-3 text-green-500" }),
                feature
              ] }, fIndex)) })
            ] })
          ] }, index)) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "feedback", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-6 w-6 text-green-600" }),
              "フィードバックループ効果"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "継続的フィードバックによる品質とユーザー満足度の向上" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: feedbackLoopData, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "sprint" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: "userFeedback",
                stroke: "#06b6d4",
                strokeWidth: 2,
                name: "ユーザーフィードバック"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: "qualityImprovement",
                stroke: "#10b981",
                strokeWidth: 2,
                name: "品質改善"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: "featureAdoption",
                stroke: "#8b5cf6",
                strokeWidth: 2,
                name: "機能採用率"
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "早期フィードバック" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-3xl font-bold text-green-600", children: [
                  "+",
                  feedbackImpact[0],
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "価値向上効果" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "早期のユーザーフィードバックにより、機能の価値と使いやすさが向上" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "継続的改善" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-3xl font-bold text-blue-600", children: [
                  Math.round(feedbackImpact[0] / 100 * sprintCount[0] * 10),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "品質向上率" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "スプリントごとの改善により、最終品質が大幅に向上" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "市場適応性" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-3xl font-bold text-purple-600", children: "90%" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "市場ニーズ適合" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "継続的な市場フィードバックにより、ニーズに合致した製品を開発" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "roi", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-6 w-6 text-blue-600" }),
              "投資対効果（ROI）分析"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "漸進型開発による財務的メリットの詳細分析" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "累積ROI推移" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: timelineData, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "sprint" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Area,
                    {
                      type: "monotone",
                      dataKey: "cumulativeAgile",
                      stroke: "#10b981",
                      fill: "#10b981",
                      fillOpacity: 0.3,
                      name: "累積価値"
                    }
                  )
                ] }) }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "価値実現速度" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "アジャイル" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-600", children: (((_a = timelineData[Math.ceil(timelineData.length / 2)]) == null ? void 0 : _a.cumulativeAgile) || 0).toFixed(1) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "中間点での価値実現" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "ウォーターフォール" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: "0" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "中間点での価値実現" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
                  (_b = roiComparisonData[1]) == null ? void 0 : _b.roi,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "アジャイルROI" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
                  sprintDuration[0] * 2,
                  "週"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "初期価値実現" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-purple-50 p-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [
                  100 - Math.round(scenarios[selectedScenario].riskReduction * 100),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "リスク軽減" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "主要財務メトリクス" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "アジャイル開発のメリット" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
                  "早期の収益化開始"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
                  "キャッシュフロー改善"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
                  "市場リスクの軽減"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
                  "投資効率の最適化"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "価値実現の要因" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-yellow-500" }),
                  "短いサイクルでの価値提供"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-blue-500" }),
                  "継続的な市場フィードバック"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-purple-500" }),
                  "適応的な開発プロセス"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }),
                  "学習による価値向上"
                ] })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-6 w-6 text-yellow-600" }),
        "漸進型価値実現の学習ポイント"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "早期価値実現" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "短いサイクルで価値を提供し、早期にビジネス成果を実現する"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "リスク軽減" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "段階的な開発により、プロジェクトリスクを継続的に軽減する"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "継続的改善" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "フィードバックループにより製品品質と市場適合性を向上させる"
          ] })
        ] })
      ] }) })
    ] })
  ] }) });
}, "IncrementalValueVisualization");
const IncrementalValueVisualization$1 = React.memo(IncrementalValueVisualization);
export {
  IncrementalValueVisualization$1 as default
};
