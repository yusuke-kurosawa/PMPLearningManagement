var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { B as Button } from "./button-C-u1QTim.js";
import { I as Input } from "./input-DOiCTpzp.js";
import { L as Label } from "./label-XIKEmFX2.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CYArGpXK.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { aL as Info, b4 as Table, b5 as Radar, v as BarChart3, s as Users, q as Shield, b as Command, Z as Zap, T as TrendingUp, av as CheckCircle, aY as Building, b6 as Puzzle, b7 as Factory, a3 as Star, aX as Lightbulb, F as FileText, j as RotateCcw, as as ChevronLeft, t as Target, V as ChevronRight, S as Search, A as ArrowRight } from "./lucide-icons-B7slfWYt.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { R as ResponsiveContainer, a as RadarChart, P as PolarGrid, b as PolarAngleAxis, c as PolarRadiusAxis, d as Radar$1, L as Legend, T as Tooltip, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, e as Bar } from "./recharts-D6bUNjjp.js";
import { S as Separator } from "./separator-Cd8fry1p.js";
import "./vendor-iUsVqwEv.js";
import "./radix-core-BMsYm0jb.js";
import "./index-CZZZnLRW.js";
import "./radix-tabs-BR3qU-T4.js";
import "./d3-core-DnNGvVRC.js";
const PMO_COLORS = {
  supportive: "#3B82F6",
  // blue
  controlling: "#F59E0B",
  // yellow
  directive: "#EF4444",
  // red
  acoe: "#10B981"
  // green
};
const PMO_ICONS = {
  supportive: Users,
  controlling: Shield,
  directive: Command,
  acoe: Zap
};
const PMOComparisonChart = /* @__PURE__ */ __name(({ data, className = "" }) => {
  const [viewMode, setViewMode] = reactExports.useState("table");
  const [selectedCriteria, setSelectedCriteria] = reactExports.useState("all");
  const radarData = reactExports.useMemo(() => {
    const criteriaScores = {
      管理レベル: { supportive: 1, controlling: 3, directive: 5, acoe: 1 },
      PM自律性: { supportive: 5, controlling: 3, directive: 1, acoe: 5 },
      標準化レベル: { supportive: 2, controlling: 4, directive: 5, acoe: 3 },
      組織への影響: { supportive: 2, controlling: 3, directive: 5, acoe: 4 },
      コスト: { supportive: 5, controlling: 3, directive: 1, acoe: 3 },
      実装期間: { supportive: 5, controlling: 3, directive: 1, acoe: 3 }
    };
    return Object.entries(criteriaScores).map(([criteria, scores]) => ({
      criteria,
      supportive: scores.supportive,
      controlling: scores.controlling,
      directive: scores.directive,
      acoe: scores.acoe
    }));
  }, []);
  const barData = reactExports.useMemo(() => {
    if (selectedCriteria === "all") {
      return radarData;
    }
    return radarData.filter(
      (item) => item.criteria.toLowerCase().includes(selectedCriteria.toLowerCase())
    );
  }, [radarData, selectedCriteria]);
  const CustomTooltip = /* @__PURE__ */ __name(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: label }),
        payload.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: entry.color }, children: `${entry.dataKey}: ${entry.value}/5` }, index))
      ] });
    }
    return null;
  }, "CustomTooltip");
  const getRecommendationLevel = /* @__PURE__ */ __name((criteria, pmoType, value) => {
    const highValue = ["非常に高い", "最大限", "強制", "大きい", "高い", "長期"];
    const lowValue = ["最小限", "低い", "推奨", "短期"];
    if (highValue.some((val) => value.includes(val))) {
      return "high";
    } else if (lowValue.some((val) => value.includes(val))) {
      return "low";
    }
    return "medium";
  }, "getRecommendationLevel");
  const getRecommendationColor = /* @__PURE__ */ __name((level) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  }, "getRecommendationColor");
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "比較データを読み込み中です..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "PMOタイプ比較分析" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "4つのPMOタイプを多角的に比較し、最適な選択をサポートします" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 },
        className: "flex items-center justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: viewMode, onValueChange: /* @__PURE__ */ __name((value) => setViewMode(value), "onValueChange"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "table", className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "テーブル" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "radar", className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radar, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "レーダー" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "bar", className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "棒グラフ" })
            ] })
          ] }) }),
          viewMode === "bar" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedCriteria, onValueChange: setSelectedCriteria, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "条件を選択" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "すべての条件" }),
              data.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: item.criteria, children: item.criteria }, item.criteria))
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
              viewMode === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "h-5 w-5" }),
              viewMode === "radar" && /* @__PURE__ */ jsxRuntimeExports.jsx(Radar, { className: "h-5 w-5" }),
              viewMode === "bar" && /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                viewMode === "table" && "テーブル比較",
                viewMode === "radar" && "レーダーチャート比較",
                viewMode === "bar" && "棒グラフ比較"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "PMOタイプの特性を視覚的に比較します" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
            viewMode === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 20 },
                className: "overflow-x-auto",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-left font-semibold", children: "比較項目" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-blue-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "支援型" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-yellow-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "コントロール型" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Command, { className: "h-4 w-4 text-red-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "指令型" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-green-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ACoE" })
                    ] }) })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.tr,
                    {
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: index * 0.1 },
                      className: "border-b hover:bg-gray-50 dark:hover:bg-gray-800",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: row.criteria }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: row.supportive }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: getRecommendationColor(
                                getRecommendationLevel(row.criteria, "supportive", row.supportive)
                              ),
                              variant: "secondary",
                              children: getRecommendationLevel(row.criteria, "supportive", row.supportive)
                            }
                          )
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: row.controlling }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: getRecommendationColor(
                                getRecommendationLevel(
                                  row.criteria,
                                  "controlling",
                                  row.controlling
                                )
                              ),
                              variant: "secondary",
                              children: getRecommendationLevel(
                                row.criteria,
                                "controlling",
                                row.controlling
                              )
                            }
                          )
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: row.directive }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: getRecommendationColor(
                                getRecommendationLevel(row.criteria, "directive", row.directive)
                              ),
                              variant: "secondary",
                              children: getRecommendationLevel(row.criteria, "directive", row.directive)
                            }
                          )
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: row.acoe }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              className: getRecommendationColor(
                                getRecommendationLevel(row.criteria, "acoe", row.acoe)
                              ),
                              variant: "secondary",
                              children: getRecommendationLevel(row.criteria, "acoe", row.acoe)
                            }
                          )
                        ] }) })
                      ]
                    },
                    row.criteria
                  )) })
                ] })
              },
              "table"
            ),
            viewMode === "radar" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.9 },
                className: "space-y-6",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadarChart, { data: radarData, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PolarGrid, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PolarAngleAxis, { dataKey: "criteria", className: "text-sm" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      PolarRadiusAxis,
                      {
                        angle: 90,
                        domain: [0, 5],
                        className: "text-xs",
                        tickCount: 6
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Radar$1,
                      {
                        name: "支援型PMO",
                        dataKey: "supportive",
                        stroke: PMO_COLORS.supportive,
                        fill: PMO_COLORS.supportive,
                        fillOpacity: 0.1,
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Radar$1,
                      {
                        name: "コントロール型PMO",
                        dataKey: "controlling",
                        stroke: PMO_COLORS.controlling,
                        fill: PMO_COLORS.controlling,
                        fillOpacity: 0.1,
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Radar$1,
                      {
                        name: "指令型PMO",
                        dataKey: "directive",
                        stroke: PMO_COLORS.directive,
                        fill: PMO_COLORS.directive,
                        fillOpacity: 0.1,
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Radar$1,
                      {
                        name: "ACoE",
                        dataKey: "acoe",
                        stroke: PMO_COLORS.acoe,
                        fill: PMO_COLORS.acoe,
                        fillOpacity: 0.1,
                        strokeWidth: 2
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) })
                  ] }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mt-0.5 h-5 w-5 text-blue-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-blue-900 dark:text-blue-100", children: "レーダーチャート読み方" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm text-blue-700 dark:text-blue-200", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 外側ほど高い値を示します（1-5スケール）" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 各PMOタイプの特性が一目で比較できます" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• 組織のニーズに合った形状のPMOタイプを選択してください" })
                      ] })
                    ] })
                  ] }) })
                ]
              },
              "radar"
            ),
            viewMode === "bar" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -20 },
                className: "space-y-6",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: barData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      XAxis,
                      {
                        dataKey: "criteria",
                        className: "text-sm",
                        angle: -45,
                        textAnchor: "end",
                        height: 80
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 5], className: "text-sm" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Bar,
                      {
                        dataKey: "supportive",
                        fill: PMO_COLORS.supportive,
                        name: "支援型PMO",
                        radius: [2, 2, 0, 0]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Bar,
                      {
                        dataKey: "controlling",
                        fill: PMO_COLORS.controlling,
                        name: "コントロール型PMO",
                        radius: [2, 2, 0, 0]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Bar,
                      {
                        dataKey: "directive",
                        fill: PMO_COLORS.directive,
                        name: "指令型PMO",
                        radius: [2, 2, 0, 0]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Bar,
                      {
                        dataKey: "acoe",
                        fill: PMO_COLORS.acoe,
                        name: "ACoE",
                        radius: [2, 2, 0, 0]
                      }
                    )
                  ] }) }) }),
                  selectedCriteria !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-4 dark:bg-gray-800", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 font-semibold", children: [
                      "選択中の比較項目: ",
                      selectedCriteria
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: ["supportive", "controlling", "directive", "acoe"].map((pmoType) => {
                      const pmoData2 = data.find((d) => d.criteria === selectedCriteria);
                      const value = pmoData2 == null ? void 0 : pmoData2[pmoType];
                      const Icon = PMO_ICONS[pmoType];
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-center space-x-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Icon,
                            {
                              className: "h-4 w-4",
                              style: { color: PMO_COLORS[pmoType] }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
                            pmoType === "supportive" && "支援型",
                            pmoType === "controlling" && "コントロール型",
                            pmoType === "directive" && "指令型",
                            pmoType === "acoe" && "ACoE"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: value })
                      ] }, pmoType);
                    }) })
                  ] })
                ]
              },
              "bar"
            )
          ] }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.3 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "比較サマリー" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
            {
              type: "supportive",
              name: "支援型PMO",
              icon: Users,
              color: "blue",
              characteristics: ["最小限の管理", "高い自律性", "低コスト", "短期実装"]
            },
            {
              type: "controlling",
              name: "コントロール型PMO",
              icon: Shield,
              color: "yellow",
              characteristics: ["中程度の管理", "標準化重視", "バランス型", "中期実装"]
            },
            {
              type: "directive",
              name: "指令型PMO",
              icon: Command,
              color: "red",
              characteristics: ["強力な管理", "厳格な統制", "高い影響力", "長期実装"]
            },
            {
              type: "acoe",
              name: "ACoE",
              icon: Zap,
              color: "green",
              characteristics: ["アジャイル特化", "価値重視", "変革的", "文化醸成"]
            }
          ].map((pmo, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.4 + index * 0.1 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-l-4 border-l-${pmo.color}-500`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(pmo.icon, { className: `h-5 w-5 text-${pmo.color}-500` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: pmo.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: pmo.characteristics.map((char, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: `h-3 w-3 text-${pmo.color}-500` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: char })
                ] }, i)) })
              ] }) })
            },
            pmo.type
          )) }) })
        ] })
      }
    )
  ] });
}, "PMOComparisonChart");
const PMOType = {
  SUPPORTIVE: "supportive",
  CONTROLLING: "controlling",
  DIRECTIVE: "directive",
  ACOE: "acoe"
};
const PMOControlLevel = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high"
};
const supportivePMO = {
  type: PMOType.SUPPORTIVE,
  name: "Supportive PMO",
  japanName: "支援型PMO",
  description: "プロジェクトマネジメントの支援機能を提供し、ベストプラクティス、テンプレート、レッスン・ラーンドを共有する。プロジェクトに対する管理権限は最小限で、プロジェクト・マネジャーの自律性を尊重する。",
  controlLevel: PMOControlLevel.LOW,
  characteristics: {
    managementStyle: "助言型・コンサルティング型",
    autonomyLevel: "高い（プロジェクト・マネジャーの裁量を重視）",
    supportLevel: "要求に応じた支援提供",
    standardizationLevel: "推奨レベル（強制ではない）"
  },
  responsibilities: [
    {
      id: "sp_001",
      title: "ベストプラクティスの開発と共有",
      description: "組織全体で使用可能なプロジェクトマネジメントのベストプラクティスを開発し、ナレッジベースとして維持管理する",
      category: "methodology",
      priority: "high"
    },
    {
      id: "sp_002",
      title: "テンプレートとツールの提供",
      description: "プロジェクト憲章、WBS、リスク登録簿などの標準的なテンプレートとツールを開発・提供する",
      category: "support",
      priority: "high"
    },
    {
      id: "sp_003",
      title: "コーチングとメンタリング",
      description: "プロジェクト・マネジャーに対する個別指導、スキル向上支援、問題解決のサポートを提供する",
      category: "coaching",
      priority: "high"
    },
    {
      id: "sp_004",
      title: "トレーニングプログラムの提供",
      description: "プロジェクトマネジメント手法、ツール使用法、ソフトスキルに関するトレーニングを企画・実施する",
      category: "training",
      priority: "medium"
    },
    {
      id: "sp_005",
      title: "レッスン・ラーンドの収集と活用",
      description: "プロジェクトから得られた教訓を体系的に収集し、将来のプロジェクトで活用できる形で整理・共有する",
      category: "methodology",
      priority: "medium"
    }
  ],
  bestPractices: [
    {
      id: "bp_sp_001",
      title: "オンデマンド支援体制の構築",
      description: "プロジェクト・マネジャーが必要な時に迅速に支援を受けられる体制を整備する",
      implementation: [
        "ヘルプデスク機能の設置",
        "専門家プールの維持",
        "Q&Aデータベースの構築",
        "24時間以内の回答保証"
      ],
      benefits: ["プロジェクト・マネジャーの自主性維持", "迅速な問題解決", "組織全体の知識向上"],
      challenges: ["支援要求の変動への対応", "専門知識の幅広いカバー", "リソース配分の最適化"],
      applicableContexts: [
        "成熟したプロジェクト組織",
        "経験豊富なPM が多い環境",
        "多様なプロジェクトタイプ"
      ]
    },
    {
      id: "bp_sp_002",
      title: "コミュニティ・オブ・プラクティスの運営",
      description: "プロジェクト・マネジャー同士の知識共有と相互学習を促進するコミュニティを運営する",
      implementation: [
        "定期的な勉強会の開催",
        "オンラインフォーラムの提供",
        "ケーススタディ共有会",
        "メンタリングプログラム"
      ],
      benefits: ["実践的な知識の共有", "ネットワーク構築", "組織文化の醸成"],
      challenges: ["参加意欲の維持", "時間確保の困難", "知識の標準化"],
      applicableContexts: [
        "学習志向の組織文化",
        "地理的に分散したチーム",
        "知識集約型プロジェクト"
      ]
    }
  ],
  advantages: [
    "プロジェクト・マネジャーの自律性と創造性を維持",
    "低いコストで運営可能",
    "組織の変化に柔軟に対応",
    "プロジェクト固有の要求に適応しやすい",
    "実装が比較的容易"
  ],
  disadvantages: [
    "標準化の進展が遅い",
    "プロジェクト間の一貫性確保が困難",
    "品質のばらつきが発生しやすい",
    "ガバナンスが弱い",
    "組織全体の可視性が低い"
  ],
  applicableScenarios: [
    "組織のプロジェクトマネジメント成熟度が高い",
    "プロジェクト・マネジャーが経験豊富",
    "プロジェクトの多様性が高い",
    "創新性とスピードが重視される",
    "組織文化が自律性を重視している"
  ],
  successFactors: [
    "高品質な支援サービスの提供",
    "プロジェクト・マネジャーとの信頼関係構築",
    "実用的で価値のあるツール・テンプレートの開発",
    "組織のニーズに応じた柔軟なサービス提供",
    "継続的な改善とイノベーション"
  ],
  keyMetrics: [
    {
      id: "metric_sp_001",
      name: "PMO サービス利用率",
      description: "PMOが提供するサービス・ツールの利用頻度",
      category: "performance",
      measurementMethod: "月次利用回数 / 総プロジェクト数",
      targetValue: "80%以上",
      frequency: "monthly"
    },
    {
      id: "metric_sp_002",
      name: "PM満足度スコア",
      description: "PMOサービスに対するプロジェクト・マネジャーの満足度",
      category: "satisfaction",
      measurementMethod: "四半期ごとの満足度調査",
      targetValue: "4.0/5.0以上",
      frequency: "quarterly"
    },
    {
      id: "metric_sp_003",
      name: "ベストプラクティス採用率",
      description: "PMOが推奨するベストプラクティスの採用率",
      category: "quality",
      measurementMethod: "プロジェクト監査による確認",
      targetValue: "70%以上",
      frequency: "quarterly"
    }
  ],
  tools: [
    {
      id: "tool_sp_001",
      name: "プロジェクト憲章テンプレート",
      description: "標準的なプロジェクト憲章の作成テンプレート",
      type: "template",
      category: "initiation",
      usageScenario: ["新規プロジェクト立ち上げ", "ステークホルダー合意形成"]
    },
    {
      id: "tool_sp_002",
      name: "リスク管理フレームワーク",
      description: "リスクの特定、分析、対応計画の包括的フレームワーク",
      type: "framework",
      category: "risk_management",
      usageScenario: ["リスク計画", "定期的なリスク評価"]
    },
    {
      id: "tool_sp_003",
      name: "レッスン・ラーンド収集テンプレート",
      description: "プロジェクト終了時の教訓収集用標準テンプレート",
      type: "template",
      category: "closure",
      usageScenario: ["プロジェクト終了", "中間振り返り"]
    }
  ],
  organizationalImpact: {
    cultural: ["学習文化の促進", "知識共有の習慣化", "自律性と責任感の向上"],
    structural: ["最小限の組織変更", "既存の報告構造を維持", "柔軟なサポート体制"],
    operational: ["プロセスの標準化（推奨レベル）", "品質向上の緩やかな促進", "効率化の間接的支援"]
  },
  implementationGuidelines: {
    prerequisites: [
      "経営陣のサポート確保",
      "適切な専門知識を持つスタッフの確保",
      "基本的なPMツール・インフラの整備"
    ],
    phases: [
      "フェーズ1: PMOチーム編成とサービス設計（2-3ヶ月）",
      "フェーズ2: 基本ツール・テンプレートの開発（3-4ヶ月）",
      "フェーズ3: パイロットサービス提供開始（2-3ヶ月）",
      "フェーズ4: 全面展開と継続改善（継続）"
    ],
    timeline: "6-12ヶ月",
    resources: [
      "PMOマネジャー（1名）",
      "シニアPM/コンサルタント（2-3名）",
      "アドミニストレーター（1名）"
    ],
    risks: ["サービス利用率の低迷", "PM からの抵抗", "リソース不足", "サービス品質の不安定"],
    mitigationStrategies: [
      "積極的なマーケティングとコミュニケーション",
      "PM のニーズに基づくサービス設計",
      "段階的な展開によるリソース配分調整",
      "継続的なフィードバック収集と改善"
    ]
  }
};
const controllingPMO = {
  type: PMOType.CONTROLLING,
  name: "Controlling PMO",
  japanName: "コントロール型PMO",
  description: "プロジェクトマネジメント標準、方針、手続き、テンプレートの順守状況を監視し、一定レベルの統制を行う。支援機能に加えて監査・監視機能を持つ。",
  controlLevel: PMOControlLevel.MODERATE,
  characteristics: {
    managementStyle: "監視型・ガバナンス重視型",
    autonomyLevel: "中程度（標準への準拠を要求）",
    supportLevel: "支援と監視の両立",
    standardizationLevel: "必須レベル（準拠義務あり）"
  },
  responsibilities: [
    {
      id: "cp_001",
      title: "PMO標準・方針の策定と維持",
      description: "組織全体で使用するプロジェクトマネジメント標準、方針、手続きを策定し、定期的に更新・維持する",
      category: "governance",
      priority: "high"
    },
    {
      id: "cp_002",
      title: "プロジェクト監査の実施",
      description: "プロジェクトが定められた標準や手続きに準拠しているかを定期的に監査し、改善指導を行う",
      category: "governance",
      priority: "high"
    },
    {
      id: "cp_003",
      title: "プロジェクト状況の監視と報告",
      description: "全プロジェクトの進捗、リスク、課題を監視し、経営陣に定期的に報告する",
      category: "governance",
      priority: "high"
    },
    {
      id: "cp_004",
      title: "ゲートレビューの実施",
      description: "プロジェクトの主要マイルストーンで品質ゲートレビューを実施し、次段階への進行可否を判断する",
      category: "governance",
      priority: "high"
    },
    {
      id: "cp_005",
      title: "プロジェクト・ポートフォリオの管理",
      description: "組織のプロジェクト・ポートフォリオ全体を監視し、優先順位付けと資源配分を支援する",
      category: "coordination",
      priority: "medium"
    }
  ],
  bestPractices: [
    {
      id: "bp_cp_001",
      title: "リスクベース監査アプローチ",
      description: "プロジェクトのリスクレベルに応じて監査頻度と深度を調整する",
      implementation: [
        "リスク評価マトリクスの作成",
        "高リスクプロジェクトの頻繁な監査",
        "リスクに応じた監査チェックリスト",
        "是正措置の追跡システム"
      ],
      benefits: ["効率的な監査リソース活用", "高リスクプロジェクトの早期発見", "的確な支援提供"],
      challenges: ["リスク評価の客観性確保", "監査負荷の適正化", "PM との良好な関係維持"],
      applicableContexts: [
        "多数のプロジェクトを抱える組織",
        "リスク許容度が低い業界",
        "規制要件が厳しい環境"
      ]
    },
    {
      id: "bp_cp_002",
      title: "ダッシュボードによる可視化",
      description: "プロジェクト状況をリアルタイムで可視化するダッシュボードを構築する",
      implementation: [
        "KPI ダッシュボードの開発",
        "自動データ収集システム",
        "アラート機能の実装",
        "役職別ビューのカスタマイズ"
      ],
      benefits: ["リアルタイムな状況把握", "意思決定の迅速化", "透明性の向上"],
      challenges: ["データ品質の確保", "システム開発・維持コスト", "情報過多への対応"],
      applicableContexts: [
        "デジタル化が進んだ組織",
        "地理的に分散したプロジェクト",
        "データドリブンな意思決定文化"
      ]
    }
  ],
  advantages: [
    "プロジェクト品質の安定化",
    "組織全体の可視性向上",
    "リスクの早期発見・対処",
    "標準化による効率向上",
    "経営陣への適切な情報提供"
  ],
  disadvantages: [
    "PM の自律性が制限される",
    "監査・監視コストが高い",
    "官僚的になりがち",
    "創新性を阻害する可能性",
    "PM との関係が対立的になるリスク"
  ],
  applicableScenarios: [
    "組織のPM成熟度が中程度",
    "品質と一貫性が重要視される",
    "リスク管理が重要な業界",
    "複数の大規模プロジェクトが並行",
    "規制要件への準拠が必要"
  ],
  successFactors: [
    "明確で実用的な標準・手続きの策定",
    "PM との協力的関係の構築",
    "効率的な監査プロセスの確立",
    "価値あるフィードバックの提供",
    "継続的改善の文化醸成"
  ],
  keyMetrics: [
    {
      id: "metric_cp_001",
      name: "プロジェクト標準準拠率",
      description: "PMO標準に準拠しているプロジェクトの割合",
      category: "quality",
      measurementMethod: "監査結果による準拠プロジェクト数 / 総プロジェクト数",
      targetValue: "90%以上",
      frequency: "quarterly"
    },
    {
      id: "metric_cp_002",
      name: "プロジェクト成功率",
      description: "スコープ・スケジュール・予算内で完了したプロジェクトの割合",
      category: "performance",
      measurementMethod: "成功プロジェクト数 / 完了プロジェクト数",
      targetValue: "85%以上",
      frequency: "quarterly"
    },
    {
      id: "metric_cp_003",
      name: "監査指摘事項解決率",
      description: "監査で指摘された事項の期限内解決率",
      category: "efficiency",
      measurementMethod: "期限内解決事項数 / 総指摘事項数",
      targetValue: "95%以上",
      frequency: "monthly"
    }
  ],
  tools: [
    {
      id: "tool_cp_001",
      name: "プロジェクト監査チェックリスト",
      description: "標準的な監査項目を網羅したチェックリスト",
      type: "checklist",
      category: "governance",
      usageScenario: ["定期監査", "ゲートレビュー"]
    },
    {
      id: "tool_cp_002",
      name: "プロジェクト・ダッシュボード",
      description: "リアルタイムなプロジェクト状況監視ツール",
      type: "tool",
      category: "monitoring",
      usageScenario: ["日常監視", "経営報告"]
    },
    {
      id: "tool_cp_003",
      name: "ガバナンス・フレームワーク",
      description: "プロジェクトガバナンスの包括的フレームワーク",
      type: "framework",
      category: "governance",
      usageScenario: ["標準策定", "PM教育"]
    }
  ],
  organizationalImpact: {
    cultural: ["品質意識の向上", "標準化への理解促進", "透明性の重視"],
    structural: ["明確な報告ライン確立", "ガバナンス体制の強化", "監査機能の制度化"],
    operational: ["プロセスの標準化推進", "品質管理の向上", "効率化の組織的推進"]
  },
  implementationGuidelines: {
    prerequisites: [
      "経営陣の強いコミット",
      "PM への十分な説明と合意形成",
      "ガバナンス体制の設計",
      "監査スキルを持つ人材確保"
    ],
    phases: [
      "フェーズ1: ガバナンス体制設計（3-4ヶ月）",
      "フェーズ2: 標準・手続きの策定（4-6ヶ月）",
      "フェーズ3: 監視システム構築（3-4ヶ月）",
      "フェーズ4: 全面展開と継続改善（継続）"
    ],
    timeline: "12-18ヶ月",
    resources: [
      "PMOディレクター（1名）",
      "PMOマネジャー（2-3名）",
      "監査スペシャリスト（2-3名）",
      "BI/データアナリスト（1名）"
    ],
    risks: ["PM からの抵抗", "過度な官僚化", "監査負荷の過大", "システム構築の遅延"],
    mitigationStrategies: [
      "段階的導入とパイロット実施",
      "実用性重視の標準策定",
      "PM へのメリット明示",
      "継続的なコミュニケーション"
    ]
  }
};
const directivePMO = {
  type: PMOType.DIRECTIVE,
  name: "Directive PMO",
  japanName: "指令型PMO",
  description: "プロジェクトを直接管理し、資源配分、プロジェクト間調整、統一的な管理を行う。最も高い管理権限を持ち、組織のプロジェクト戦略を実行する。",
  controlLevel: PMOControlLevel.HIGH,
  characteristics: {
    managementStyle: "指揮命令型・中央集権型",
    autonomyLevel: "低い（PMO が直接管理）",
    supportLevel: "包括的な管理とサポート",
    standardizationLevel: "強制レベル（厳格な準拠義務）"
  },
  responsibilities: [
    {
      id: "dp_001",
      title: "プロジェクト・マネジャーの任命と管理",
      description: "プロジェクト・マネジャーの選任、評価、育成、異動を直接管理し、組織のPM リソースを統括する",
      category: "governance",
      priority: "high"
    },
    {
      id: "dp_002",
      title: "共有資源の管理と配分",
      description: "組織の人的・物的資源をプロジェクト間で最適に配分し、リソース競合を調整する",
      category: "coordination",
      priority: "high"
    },
    {
      id: "dp_003",
      title: "プロジェクト間のコミュニケーション調整",
      description: "関連するプロジェクト間の依存関係を管理し、コミュニケーションと調整を促進する",
      category: "coordination",
      priority: "high"
    },
    {
      id: "dp_004",
      title: "ポートフォリオ戦略の実行",
      description: "組織の戦略に基づいてプロジェクト・ポートフォリオを管理し、価値最大化を図る",
      category: "governance",
      priority: "high"
    },
    {
      id: "dp_005",
      title: "プロジェクト成果の統合管理",
      description: "個別プロジェクトの成果を統合し、組織全体の目標達成に向けて調整する",
      category: "coordination",
      priority: "high"
    }
  ],
  bestPractices: [
    {
      id: "bp_dp_001",
      title: "リソース・プール管理",
      description: "組織の専門スキルを持つ人材をプールとして管理し、プロジェクト需要に応じて配分する",
      implementation: [
        "スキル・インベントリの構築",
        "リソース需給予測システム",
        "柔軟な配置転換制度",
        "クロストレーニング・プログラム"
      ],
      benefits: ["リソース活用の最適化", "スキル不足の解消", "プロジェクト間の知識移転"],
      challenges: ["個人のキャリア希望との調整", "リソース争奪の調停", "スキル評価の客観性"],
      applicableContexts: ["大規模組織", "マトリクス組織構造", "高度な専門スキルが必要"]
    },
    {
      id: "bp_dp_002",
      title: "プログラム管理アプローチ",
      description: "関連するプロジェクトをプログラムとして統合管理し、シナジー効果を最大化する",
      implementation: [
        "プログラム構造の設計",
        "依存関係マップの作成",
        "統合スケジュール管理",
        "ベネフィット実現管理"
      ],
      benefits: ["プロジェクト間シナジー", "リスクの統合管理", "戦略目標の確実な達成"],
      challenges: ["複雑性の管理", "変更影響の波及", "ステークホルダー調整"],
      applicableContexts: [
        "戦略的変革プロジェクト",
        "複数部門にまたがる取組み",
        "長期的な価値実現が目標"
      ]
    }
  ],
  advantages: [
    "組織資源の最適活用",
    "戦略的目標の確実な実行",
    "プロジェクト間シナジーの実現",
    "統一された品質とアプローチ",
    "強力なガバナンスとコントロール"
  ],
  disadvantages: [
    "PM の自律性とモチベーション低下",
    "高いPMO運営コスト",
    "官僚的で非効率になるリスク",
    "創新性とスピードの阻害",
    "組織的な抵抗が強い"
  ],
  applicableScenarios: [
    "大規模で複雑なプロジェクト群",
    "戦略的変革が重要な局面",
    "資源制約が厳しい環境",
    "リスク許容度が非常に低い",
    "組織のPM成熟度が低い"
  ],
  successFactors: [
    "経営陣の強力なサポート",
    "優秀なPMO スタッフの確保",
    "効率的なプロセスと仕組み",
    "PM との信頼関係構築",
    "価値創造への明確なフォーカス"
  ],
  keyMetrics: [
    {
      id: "metric_dp_001",
      name: "ポートフォリオROI",
      description: "プロジェクト・ポートフォリオ全体の投資収益率",
      category: "value",
      measurementMethod: "(総ベネフィット - 総投資) / 総投資",
      targetValue: "15%以上",
      frequency: "quarterly"
    },
    {
      id: "metric_dp_002",
      name: "リソース稼働率",
      description: "PMO管理下のリソースの有効活用率",
      category: "efficiency",
      measurementMethod: "実稼働時間 / 総利用可能時間",
      targetValue: "85%以上",
      frequency: "monthly"
    },
    {
      id: "metric_dp_003",
      name: "戦略目標達成率",
      description: "プロジェクトを通じた戦略目標の達成率",
      category: "performance",
      measurementMethod: "達成した戦略目標数 / 総戦略目標数",
      targetValue: "90%以上",
      frequency: "annually"
    }
  ],
  tools: [
    {
      id: "tool_dp_001",
      name: "ポートフォリオ管理システム",
      description: "プロジェクト・ポートフォリオの統合管理ツール",
      type: "tool",
      category: "portfolio_management",
      usageScenario: ["戦略計画", "リソース配分"]
    },
    {
      id: "tool_dp_002",
      name: "リソース最適化アルゴリズム",
      description: "リソース配分の最適化を支援するアルゴリズム",
      type: "tool",
      category: "resource_management",
      usageScenario: ["リソース計画", "配置最適化"]
    },
    {
      id: "tool_dp_003",
      name: "統合プロジェクト・ダッシュボード",
      description: "PMO視点での包括的なプロジェクト監視ツール",
      type: "tool",
      category: "monitoring",
      usageScenario: ["経営報告", "意思決定支援"]
    }
  ],
  organizationalImpact: {
    cultural: ["中央集権的文化の強化", "効率性と統制の重視", "戦略実行への集中"],
    structural: ["強力なPMO組織の確立", "マトリクス組織の強化", "明確な権限と責任体系"],
    operational: ["プロセスの完全標準化", "厳格な品質管理", "効率性の大幅向上"]
  },
  implementationGuidelines: {
    prerequisites: [
      "CEO レベルの強力なスポンサーシップ",
      "組織全体の合意と理解",
      "高度なPMO スキルを持つリーダー",
      "包括的なPMツールとシステム"
    ],
    phases: [
      "フェーズ1: 戦略・体制設計（4-6ヶ月）",
      "フェーズ2: システム・プロセス構築（6-9ヶ月）",
      "フェーズ3: パイロット実装（3-6ヶ月）",
      "フェーズ4: 全面展開（6-12ヶ月）"
    ],
    timeline: "18-24ヶ月",
    resources: [
      "PMOディレクター（1名）",
      "ポートフォリオマネジャー（2-3名）",
      "プログラムマネジャー（3-5名）",
      "リソースマネジャー（2-3名）",
      "PMO アナリスト（3-4名）"
    ],
    risks: [
      "組織的な強い抵抗",
      "実装の複雑性とコスト",
      "PM のモチベーション低下",
      "過度な中央集権化"
    ],
    mitigationStrategies: [
      "段階的で慎重な導入",
      "PM へのキャリアパス提示",
      "成果の早期実現と共有",
      "継続的な組織文化の醸成"
    ]
  }
};
const agileCoE = {
  type: PMOType.ACOE,
  name: "Agile Center of Excellence (ACoE)",
  japanName: "アジャイル・センター・オブ・エクセレンス（ACoE）/ 価値実現オフィス（VDO）",
  description: "アジャイルのマインドセット、スキル、能力を組織全体に育成し、チームの自律性を支援しながら価値実現を最大化する。従来のPMOとは異なり、管理よりも支援とコーチングに重点を置く。",
  controlLevel: PMOControlLevel.LOW,
  characteristics: {
    managementStyle: "コーチング型・エンパワーメント型",
    autonomyLevel: "非常に高い（チームの自己組織化を重視）",
    supportLevel: "アジャイル変革に特化した支援",
    standardizationLevel: "プラクティスレベル（原則重視、柔軟な適用）"
  },
  responsibilities: [
    {
      id: "acoe_001",
      title: "アジャイル・チームのコーチング",
      description: "スクラムマスター、プロダクトオーナー、開発チームに対するアジャイル実践のコーチングを提供する",
      category: "coaching",
      priority: "high"
    },
    {
      id: "acoe_002",
      title: "アジャイル・マインドセットの育成",
      description: "組織全体にアジャイルの価値観、原則、マインドセットを浸透させるための活動を行う",
      category: "training",
      priority: "high"
    },
    {
      id: "acoe_003",
      title: "スポンサーとプロダクトオーナーのメンタリング",
      description: "エグゼクティブスポンサーやプロダクトオーナーにアジャイル環境での効果的なリーダーシップを指導する",
      category: "coaching",
      priority: "high"
    },
    {
      id: "acoe_004",
      title: "価値実現の支援と測定",
      description: "プロジェクトやプロダクトが生み出すビジネス価値の実現を支援し、継続的に測定・改善する",
      category: "support",
      priority: "high"
    },
    {
      id: "acoe_005",
      title: "アジャイル実践の改善促進",
      description: "組織のアジャイル実践を継続的に評価し、改善のための提案と支援を行う",
      category: "methodology",
      priority: "medium"
    }
  ],
  bestPractices: [
    {
      id: "bp_acoe_001",
      title: "エンベデッド・コーチング",
      description: "チームに直接参加してリアルタイムでコーチングを提供する",
      implementation: [
        "チームでの日常的な作業参加",
        "スプリント・イベントでのファシリテーション",
        "リアルタイムなフィードバック提供",
        "個別メンタリング・セッション"
      ],
      benefits: ["実践的なスキル習得", "即座な問題解決", "チーム文化の醸成"],
      challenges: ["コーチングリソースの確保", "チームへの受け入れ", "依存関係の管理"],
      applicableContexts: ["アジャイル導入初期", "高度な変革が必要", "チームスキルが不足"]
    },
    {
      id: "bp_acoe_002",
      title: "コミュニティ・オブ・プラクティス運営",
      description: "アジャイル実践者のコミュニティを形成し、知識共有と相互学習を促進する",
      implementation: [
        "ギルド・チャプターの組織",
        "定期的な振り返り会",
        "ベストプラクティスの共有",
        "イノベーション・タイムの設定"
      ],
      benefits: ["組織学習の加速", "イノベーションの促進", "文化変革の推進"],
      challenges: ["参加意欲の維持", "時間確保の困難", "成果の可視化"],
      applicableContexts: ["大規模アジャイル変革", "複数チームの協調", "継続的改善文化"]
    }
  ],
  advantages: [
    "チームの自律性と創造性の最大化",
    "迅速な価値提供の実現",
    "変化への適応力向上",
    "従業員エンゲージメントの向上",
    "イノベーション文化の醸成"
  ],
  disadvantages: [
    "ガバナンスが弱くなりがち",
    "一貫性の確保が困難",
    "伝統的な管理者からの抵抗",
    "成果測定の複雑さ",
    "組織全体の変革時間が長い"
  ],
  applicableScenarios: [
    "アジャイル変革を推進中",
    "不確実性の高い環境",
    "イノベーションが重要",
    "顧客価値の迅速な提供が必要",
    "従来のプロジェクト管理が機能しない"
  ],
  successFactors: [
    "経営陣のアジャイル理解とサポート",
    "優秀なアジャイル・コーチの確保",
    "チームの自律性への信頼",
    "価値重視の組織文化",
    "継続的学習と改善の仕組み"
  ],
  keyMetrics: [
    {
      id: "metric_acoe_001",
      name: "チーム・ベロシティ",
      description: "アジャイル・チームの開発速度の改善率",
      category: "performance",
      measurementMethod: "現在のベロシティ / ベースラインベロシティ",
      targetValue: "20%改善以上",
      frequency: "monthly"
    },
    {
      id: "metric_acoe_002",
      name: "価値実現までの時間",
      description: "アイデアから価値提供までのリードタイム",
      category: "value",
      measurementMethod: "価値実現日 - アイデア着想日の平均",
      targetValue: "30%短縮以上",
      frequency: "quarterly"
    },
    {
      id: "metric_acoe_003",
      name: "チーム成熟度スコア",
      description: "アジャイル実践に関するチームの成熟度",
      category: "quality",
      measurementMethod: "アジャイル成熟度評価フレームワーク",
      targetValue: "レベル4（管理された）以上",
      frequency: "quarterly"
    }
  ],
  tools: [
    {
      id: "tool_acoe_001",
      name: "アジャイル成熟度評価ツール",
      description: "チームとプロダクトのアジャイル成熟度を評価するツール",
      type: "tool",
      category: "assessment",
      usageScenario: ["チーム評価", "改善計画策定"]
    },
    {
      id: "tool_acoe_002",
      name: "価値ストリームマッピング・テンプレート",
      description: "価値の流れを可視化し、ムダを特定するテンプレート",
      type: "template",
      category: "value_stream",
      usageScenario: ["プロセス改善", "価値最適化"]
    },
    {
      id: "tool_acoe_003",
      name: "チーム・ヘルスチェック・キット",
      description: "チームの健全性を定期的にチェックするツールセット",
      type: "tool",
      category: "team_health",
      usageScenario: ["定期振り返り", "課題特定"]
    }
  ],
  organizationalImpact: {
    cultural: ["アジャイル・マインドセットの浸透", "実験と学習の文化", "顧客価値中心の思考"],
    structural: ["フラットな組織構造", "クロスファンクショナル・チーム", "権限の現場への委譲"],
    operational: ["短いフィードバック・ループ", "継続的デリバリー", "データドリブンな意思決定"]
  },
  implementationGuidelines: {
    prerequisites: [
      "アジャイル変革への組織コミット",
      "経験豊富なアジャイル・コーチ",
      "パイロット・チームの選定",
      "基本的なアジャイル・ツール環境"
    ],
    phases: [
      "フェーズ1: ACoE設立とパイロット開始（3-4ヶ月）",
      "フェーズ2: コーチング・プログラム展開（6-9ヶ月）",
      "フェーズ3: 組織全体への拡大（9-12ヶ月）",
      "フェーズ4: 継続的改善と文化定着（継続）"
    ],
    timeline: "12-18ヶ月",
    resources: [
      "ACoE リード（1名）",
      "シニア・アジャイル・コーチ（3-4名）",
      "プロダクト・コーチ（2-3名）",
      "チェンジ・マネジメント・スペシャリスト（1-2名）"
    ],
    risks: [
      "伝統的管理層からの抵抗",
      "アジャイル理解の不足",
      "短期的な生産性低下",
      "文化変革の遅れ"
    ],
    mitigationStrategies: [
      "エグゼクティブ・レベルの教育",
      "スモール・ウィンの創出と共有",
      "段階的なスケーリング",
      "継続的なコミュニケーション"
    ]
  }
};
const pmoComparisonMatrix = [
  {
    criteria: "管理レベル",
    supportive: "最小限（推奨レベル）",
    controlling: "中程度（監視レベル）",
    directive: "最大限（指揮レベル）",
    acoe: "最小限（支援レベル）"
  },
  {
    criteria: "PM自律性",
    supportive: "非常に高い",
    controlling: "中程度",
    directive: "低い",
    acoe: "非常に高い"
  },
  {
    criteria: "標準化レベル",
    supportive: "推奨（任意）",
    controlling: "必須（監査あり）",
    directive: "強制（厳格）",
    acoe: "プラクティス（原則重視）"
  },
  {
    criteria: "組織への影響",
    supportive: "最小限",
    controlling: "中程度",
    directive: "大きい",
    acoe: "変革的"
  },
  {
    criteria: "コスト",
    supportive: "低い",
    controlling: "中程度",
    directive: "高い",
    acoe: "中程度"
  },
  {
    criteria: "実装期間",
    supportive: "短期（6-12ヶ月）",
    controlling: "中期（12-18ヶ月）",
    directive: "長期（18-24ヶ月）",
    acoe: "中期（12-18ヶ月）"
  },
  {
    criteria: "適用組織",
    supportive: "成熟組織",
    controlling: "中程度成熟度",
    directive: "大規模・複雑",
    acoe: "アジャイル志向"
  }
];
const pmoMaturityLevels = [
  {
    level: 1,
    name: "初期レベル（Initial）",
    description: "プロジェクトマネジメントは場当たり的で、成功は個人の能力に依存",
    characteristics: [
      "非公式なプロジェクト管理",
      "標準プロセスの不在",
      "成功は偶然に依存",
      "高いプロジェクト失敗率"
    ],
    capabilities: ["基本的なプロジェクト実行", "個人的な経験に基づく管理"],
    nextLevelRequirements: ["基本的なPM標準の策定", "PMOの設立検討", "PM教育の開始"]
  },
  {
    level: 2,
    name: "反復可能レベル（Repeatable）",
    description: "基本的なプロジェクト管理プロセスが確立され、成功プロジェクトの再現が可能",
    characteristics: [
      "基本的なPMプロセス",
      "プロジェクト計画の標準化",
      "進捗監視の仕組み",
      "支援型PMOの存在"
    ],
    capabilities: ["標準的なプロジェクト計画", "基本的な監視・制御", "テンプレート・ツールの活用"],
    nextLevelRequirements: ["プロセスの文書化", "監査機能の追加", "PM能力の向上"]
  },
  {
    level: 3,
    name: "定義レベル（Defined）",
    description: "組織標準のプロジェクト管理プロセスが定義され、一貫して適用される",
    characteristics: [
      "標準PMプロセス",
      "品質基準の確立",
      "コントロール型PMO",
      "監査・評価システム"
    ],
    capabilities: ["統合プロジェクト管理", "品質保証システム", "リスク管理の標準化"],
    nextLevelRequirements: ["メトリクス収集の開始", "プロセス改善の制度化", "組織的な学習機能"]
  },
  {
    level: 4,
    name: "管理レベル（Managed）",
    description: "プロジェクトパフォーマンスが測定され、データに基づく管理が行われる",
    characteristics: [
      "定量的プロセス管理",
      "パフォーマンス測定",
      "指令型PMOの機能",
      "ポートフォリオ管理"
    ],
    capabilities: ["データドリブンな意思決定", "リソース最適化", "予測可能なプロジェクト成果"],
    nextLevelRequirements: ["継続的改善の文化", "イノベーション促進", "アジャイル能力の獲得"]
  },
  {
    level: 5,
    name: "最適化レベル（Optimizing）",
    description: "継続的な改善により、プロジェクト管理能力が常に最適化される",
    characteristics: [
      "継続的プロセス改善",
      "イノベーションの推進",
      "ACoE的な機能",
      "価値実現の最大化"
    ],
    capabilities: ["自己適応する組織", "価値中心の思考", "変化への俊敏な対応"],
    nextLevelRequirements: ["継続的な卓越性の追求", "業界リーダーシップ", "新たなパラダイムの創造"]
  }
];
const pmoData = {
  pmoTypes: [supportivePMO, controllingPMO, directivePMO, agileCoE],
  comparisonMatrix: pmoComparisonMatrix,
  maturityModel: pmoMaturityLevels
};
function recommendPMOType(assessment) {
  const { organizationSize, projectComplexity, organizationalMaturity, industryType } = assessment;
  if (organizationalMaturity === "initial" || organizationalMaturity === "developing") {
    return {
      recommendedPMOType: PMOType.SUPPORTIVE,
      reasoning: [
        "組織成熟度が低いため、まず支援機能から開始",
        "PM の自律性を維持しながら能力向上を図る",
        "段階的なアプローチが適切"
      ],
      implementationRoadmap: [
        "1. 支援型PMO設立（6-12ヶ月）",
        "2. 基本的なPMプロセス確立",
        "3. 成熟度向上後にコントロール型へ移行検討"
      ]
    };
  }
  if (projectComplexity === "high" && organizationSize === "large") {
    return {
      recommendedPMOType: PMOType.DIRECTIVE,
      reasoning: [
        "大規模で複雑なプロジェクト群の統制が必要",
        "リソース調整と戦略実行が重要",
        "強力なガバナンスが求められる"
      ],
      implementationRoadmap: [
        "1. 戦略・体制設計（4-6ヶ月）",
        "2. システム・プロセス構築（6-9ヶ月）",
        "3. 段階的展開と定着（12-18ヶ月）"
      ]
    };
  }
  if (industryType.includes("テクノロジー") || industryType.includes("ソフトウェア")) {
    return {
      recommendedPMOType: PMOType.ACOE,
      reasoning: [
        "変化の激しい環境での俊敏性が重要",
        "価値実現の速度が競争優位の源泉",
        "イノベーション文化の醸成が必要"
      ],
      implementationRoadmap: [
        "1. ACoE設立とパイロット開始（3-4ヶ月）",
        "2. アジャイル能力の組織展開（6-9ヶ月）",
        "3. 文化変革の定着（12-18ヶ月）"
      ]
    };
  }
  return {
    recommendedPMOType: PMOType.CONTROLLING,
    reasoning: ["標準化と自律性のバランスが適切", "段階的な管理強化が可能", "多くの組織に適用可能"],
    implementationRoadmap: [
      "1. ガバナンス体制設計（3-4ヶ月）",
      "2. 標準・監視システム構築（6-9ヶ月）",
      "3. 全面展開と継続改善（12-18ヶ月）"
    ]
  };
}
__name(recommendPMOType, "recommendPMOType");
function getAllPMOTypes() {
  return pmoData.pmoTypes;
}
__name(getAllPMOTypes, "getAllPMOTypes");
function getPMOComparison() {
  return pmoData.comparisonMatrix;
}
__name(getPMOComparison, "getPMOComparison");
function getPMOMaturityModel() {
  return pmoData.maturityModel;
}
__name(getPMOMaturityModel, "getPMOMaturityModel");
const PMO_CONFIG$1 = {
  supportive: {
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200",
    textColor: "text-blue-700 dark:text-blue-300",
    name: "支援型PMO"
  },
  controlling: {
    icon: Shield,
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700 dark:text-yellow-300",
    name: "コントロール型PMO"
  },
  directive: {
    icon: Command,
    color: "bg-red-500",
    lightColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200",
    textColor: "text-red-700 dark:text-red-300",
    name: "指令型PMO"
  },
  acoe: {
    icon: Zap,
    color: "bg-green-500",
    lightColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200",
    textColor: "text-green-700 dark:text-green-300",
    name: "アジャイル・センター・オブ・エクセレンス（ACoE）"
  }
};
const ASSESSMENT_QUESTIONS = [
  {
    id: "organizationSize",
    title: "組織規模",
    description: "あなたの組織の規模を選択してください",
    icon: Building,
    options: [
      { value: "small", label: "小規模（50名未満）", description: "スタートアップや小規模企業" },
      { value: "medium", label: "中規模（50-500名）", description: "成長企業や中小企業" },
      { value: "large", label: "大規模（500-5000名）", description: "大企業や上場企業" },
      {
        value: "enterprise",
        label: "超大規模（5000名以上）",
        description: "多国籍企業や大手企業グループ"
      }
    ]
  },
  {
    id: "projectComplexity",
    title: "プロジェクト複雑度",
    description: "主に扱うプロジェクトの複雑度はどの程度ですか？",
    icon: Puzzle,
    options: [
      { value: "low", label: "低複雑度", description: "単発プロジェクト、明確な要件" },
      { value: "medium", label: "中複雑度", description: "複数部門関与、一定の不確実性" },
      {
        value: "high",
        label: "高複雑度",
        description: "大規模変革、高い不確実性、多数のステークホルダー"
      }
    ]
  },
  {
    id: "organizationalMaturity",
    title: "プロジェクトマネジメント成熟度",
    description: "組織のプロジェクトマネジメント成熟度を評価してください",
    icon: TrendingUp,
    options: [
      { value: "initial", label: "初期段階", description: "場当たり的、成功は個人の能力に依存" },
      { value: "developing", label: "発展段階", description: "基本的なプロセスは存在、一部標準化" },
      { value: "defined", label: "定義段階", description: "標準化されたプロセス、一貫した適用" },
      { value: "managed", label: "管理段階", description: "定量的管理、データによる意思決定" },
      { value: "optimizing", label: "最適化段階", description: "継続的改善、イノベーション文化" }
    ]
  },
  {
    id: "industryType",
    title: "業界・業種",
    description: "あなたの組織が属する主要な業界を選択してください",
    icon: Factory,
    options: [
      {
        value: "technology",
        label: "テクノロジー・IT",
        description: "ソフトウェア開発、IT サービス"
      },
      { value: "manufacturing", label: "製造業", description: "自動車、機械、電子機器" },
      { value: "finance", label: "金融・保険", description: "銀行、証券、保険会社" },
      { value: "healthcare", label: "ヘルスケア", description: "医療機器、製薬、病院" },
      {
        value: "consulting",
        label: "コンサルティング",
        description: "経営コンサルティング、システム導入"
      },
      { value: "construction", label: "建設・インフラ", description: "土木、建築、公共事業" },
      { value: "retail", label: "小売・消費財", description: "小売業、消費者向け製品" },
      { value: "other", label: "その他", description: "上記以外の業界" }
    ]
  }
];
const PMOTypeSelector = /* @__PURE__ */ __name(({ className = "", onComplete }) => {
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [answers, setAnswers] = reactExports.useState({});
  const [isCompleted, setIsCompleted] = reactExports.useState(false);
  const [recommendation, setRecommendation] = reactExports.useState(null);
  const progress = reactExports.useMemo(() => {
    return (currentStep + 1) / ASSESSMENT_QUESTIONS.length * 100;
  }, [currentStep]);
  const currentQuestion = ASSESSMENT_QUESTIONS[currentStep];
  const handleAnswer = /* @__PURE__ */ __name((value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  }, "handleAnswer");
  const handleNext = /* @__PURE__ */ __name(() => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, "handleNext");
  const handlePrevious = /* @__PURE__ */ __name(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, "handlePrevious");
  const handleComplete = /* @__PURE__ */ __name(() => {
    const assessment = {
      organizationSize: answers.organizationSize,
      projectComplexity: answers.projectComplexity,
      organizationalMaturity: answers.organizationalMaturity,
      industryType: answers.industryType
    };
    const result = recommendPMOType(assessment);
    setRecommendation(result);
    setIsCompleted(true);
    if (onComplete) {
      onComplete(result);
    }
  }, "handleComplete");
  const handleRestart = /* @__PURE__ */ __name(() => {
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
    setRecommendation(null);
  }, "handleRestart");
  const isAnswered = answers[currentQuestion == null ? void 0 : currentQuestion.id] !== void 0;
  if (isCompleted && recommendation) {
    const config = PMO_CONFIG$1[recommendation.recommendedPMOType];
    const IconComponent = config.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: `space-y-6 ${className}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `${config.lightColor} ${config.borderColor} border-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full p-4 ${config.color} text-white`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-8 w-8" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl", children: "評価完了!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "あなたの組織に最適なPMOタイプを推奨します" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `inline-flex items-center space-x-2 rounded-full px-4 py-2 ${config.color} text-lg font-semibold text-white`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "推奨: ",
                    config.name
                  ] })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center space-x-2 text-lg font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "推奨理由" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: recommendation.reasoning.map((reason, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-1 h-4 w-4 flex-shrink-0 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: reason })
              ] }, index)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center space-x-2 text-lg font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "実装ロードマップ" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: recommendation.implementationRoadmap.map((phase, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-6 w-6 rounded-full ${config.color} flex items-center justify-center text-sm font-bold text-white`,
                    children: index + 1
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: phase }) })
              ] }, index)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-lg font-semibold", children: "あなたの回答サマリー" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: ASSESSMENT_QUESTIONS.map((question) => {
                const answer = answers[question.id];
                const option = question.options.find((opt) => opt.value === answer);
                const QuestionIcon = question.icon;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-start space-x-3 rounded-lg bg-white p-3 dark:bg-gray-800",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(QuestionIcon, { className: "mt-0.5 h-5 w-5 text-gray-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: question.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: option == null ? void 0 : option.label })
                      ] })
                    ]
                  },
                  question.id
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center space-x-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: handleRestart,
                className: "flex items-center space-x-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "もう一度評価" })
                ]
              }
            ) })
          ] })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "PMOタイプ選択ウィザード" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "組織の特性に基づいて最適なPMOタイプを推奨します" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "進捗" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              currentStep + 1,
              " / ",
              ASSESSMENT_QUESTIONS.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress, className: "h-2" })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(currentQuestion.icon, { className: "h-6 w-6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentQuestion.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: currentQuestion.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: currentQuestion.options.map((option, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: index * 0.1 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex cursor-pointer items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "radio",
                    id: option.value,
                    name: currentQuestion.id,
                    value: option.value,
                    checked: answers[currentQuestion.id] === option.value,
                    onChange: /* @__PURE__ */ __name(() => handleAnswer(option.value), "onChange"),
                    className: "mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: option.value, className: "flex-1 cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: option.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: option.description })
                ] })
              ] })
            },
            option.value
          )) }) })
        ] })
      },
      currentStep
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
        className: "flex justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: handlePrevious,
              disabled: currentStep === 0,
              className: "flex items-center space-x-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "前へ" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleNext, disabled: !isAnswered, className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentStep === ASSESSMENT_QUESTIONS.length - 1 ? "結果を見る" : "次へ" }),
            currentStep === ASSESSMENT_QUESTIONS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.3 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ヒント:" }),
            " ",
            "各質問に正直に答えることで、より正確な推奨結果を得ることができます。 組織の現状を客観的に評価してください。"
          ] })
        ] })
      }
    )
  ] });
}, "PMOTypeSelector");
const PMO_CONFIG = {
  supportive: {
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    gradient: "from-blue-500 to-blue-600"
  },
  controlling: {
    icon: Shield,
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    gradient: "from-yellow-500 to-yellow-600"
  },
  directive: {
    icon: Command,
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    gradient: "from-red-500 to-red-600"
  },
  acoe: {
    icon: Zap,
    color: "bg-green-500",
    lightColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    gradient: "from-green-500 to-green-600"
  }
};
const PMOLearningHub = /* @__PURE__ */ __name(({ className = "" }) => {
  const [selectedPMOType, setSelectedPMOType] = reactExports.useState("supportive");
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("all");
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [learningProgress, setLearningProgress] = reactExports.useState({});
  const pmoTypes = reactExports.useMemo(() => getAllPMOTypes(), []);
  const comparisonData = reactExports.useMemo(() => getPMOComparison(), []);
  const maturityModel = reactExports.useMemo(() => getPMOMaturityModel(), []);
  const selectedPMO = reactExports.useMemo(
    () => pmoTypes.find((pmo) => pmo.type === selectedPMOType),
    [pmoTypes, selectedPMOType]
  );
  const filteredResponsibilities = reactExports.useMemo(() => {
    if (!selectedPMO) {
      return [];
    }
    let filtered = selectedPMO.responsibilities;
    if (searchTerm) {
      filtered = filtered.filter(
        (resp) => resp.title.toLowerCase().includes(searchTerm.toLowerCase()) || resp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((resp) => resp.category === selectedCategory);
    }
    return filtered;
  }, [selectedPMO, searchTerm, selectedCategory]);
  const toggleProgress = /* @__PURE__ */ __name((itemId) => {
    setLearningProgress((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, "toggleProgress");
  const categories = reactExports.useMemo(() => {
    if (!selectedPMO) {
      return [];
    }
    const cats = [...new Set(selectedPMO.responsibilities.map((r) => r.category))];
    return cats;
  }, [selectedPMO]);
  const progressPercentage = reactExports.useMemo(() => {
    if (!selectedPMO) {
      return 0;
    }
    const totalItems = selectedPMO.responsibilities.length;
    const completedItems = selectedPMO.responsibilities.filter((r) => learningProgress[r.id]).length;
    return totalItems > 0 ? completedItems / totalItems * 100 : 0;
  }, [selectedPMO, learningProgress]);
  if (!selectedPMO) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "PMOデータの読み込み中です..." })
    ] });
  }
  const config = PMO_CONFIG[selectedPMO.type];
  const IconComponent = config.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "space-y-4 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full p-3 ${config.color} text-white`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-8 w-8" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "PMO学習ハブ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "PMOタイプとACoEの包括的学習プラットフォーム" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "学習進捗" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                Math.round(progressPercentage),
                "%完了"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progressPercentage, className: "h-2" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "PMOタイプ選択" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "学習したいPMOタイプを選択してください" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", children: pmoTypes.map((pmo) => {
            const pmoConfig = PMO_CONFIG[pmo.type];
            const PmoIcon = pmoConfig.icon;
            const isSelected = selectedPMOType === pmo.type;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                whileHover: { scale: 1.02 },
                whileTap: { scale: 0.98 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    className: `cursor-pointer transition-all duration-200 ${isSelected ? `${pmoConfig.borderColor} border-2 ${pmoConfig.lightColor}` : "border hover:border-gray-300 dark:hover:border-gray-600"}`,
                    onClick: /* @__PURE__ */ __name(() => setSelectedPMOType(pmo.type), "onClick"),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `mx-auto mb-3 w-fit rounded-full p-3 ${pmoConfig.color} text-white`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PmoIcon, { className: "h-6 w-6" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 text-sm font-semibold", children: pmo.japanName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs leading-relaxed text-gray-600 dark:text-gray-400", children: [
                        pmo.description.slice(0, 80),
                        "..."
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isSelected ? "default" : "secondary", className: "mt-2", children: pmo.controlLevel })
                    ] })
                  }
                )
              },
              pmo.type
            );
          }) }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "概要" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "responsibilities", children: "責任・役割" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "best-practices", children: "ベストプラクティス" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: "比較" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "maturity", children: "成熟度モデル" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "selector", children: "推奨選択" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                selectedPMO.japanName,
                " - 概要"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "leading-relaxed text-gray-700 dark:text-gray-300", children: selectedPMO.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "主要特性" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: Object.entries(selectedPMO.characteristics).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-start space-x-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium capitalize", children: key.replace(/([A-Z])/g, " $1").trim() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: value })
                      ] })
                    ]
                  },
                  key
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold text-green-700 dark:text-green-400", children: "メリット" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: selectedPMO.advantages.map((advantage, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-1 h-4 w-4 flex-shrink-0 text-green-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: advantage })
                  ] }, index)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold text-orange-700 dark:text-orange-400", children: "デメリット・課題" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: selectedPMO.disadvantages.map((disadvantage, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mt-1 h-4 w-4 flex-shrink-0 text-orange-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: disadvantage })
                  ] }, index)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "適用シナリオ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", children: selectedPMO.applicableScenarios.map((scenario, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "justify-start p-2", children: scenario }, index)) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "responsibilities", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "責任・役割" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
                selectedPMO.japanName,
                "の主要な責任と役割を学習します"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "search", children: "検索" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "search",
                        placeholder: "責任・役割を検索...",
                        value: searchTerm,
                        onChange: /* @__PURE__ */ __name((e) => setSearchTerm(e.target.value), "onChange"),
                        className: "pl-10"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "カテゴリ" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "カテゴリを選択" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "すべて" }),
                      categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: category, children: category }, category))
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filteredResponsibilities.map((responsibility, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: 20 },
                  transition: { delay: index * 0.1 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "transition-shadow hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        onClick: /* @__PURE__ */ __name(() => toggleProgress(responsibility.id), "onClick"),
                        className: `p-1 ${learningProgress[responsibility.id] ? "text-green-600" : "text-gray-400"}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold", children: responsibility.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 leading-relaxed text-gray-600 dark:text-gray-400", children: responsibility.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center space-x-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: responsibility.category }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            variant: responsibility.priority === "high" ? "destructive" : responsibility.priority === "medium" ? "default" : "outline",
                            children: responsibility.priority
                          }
                        )
                      ] })
                    ] })
                  ] }) }) }) }) })
                },
                responsibility.id
              )) }) }),
              filteredResponsibilities.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-gray-500 dark:text-gray-400", children: "検索条件に一致する項目が見つかりません" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "best-practices", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "ベストプラクティス" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
                selectedPMO.japanName,
                "の実装と運用のベストプラクティス"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: selectedPMO.bestPractices.map((practice, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    className: "border-l-4",
                    style: { borderLeftColor: config.color.replace("bg-", "#") },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-xl font-semibold", children: practice.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 leading-relaxed text-gray-700 dark:text-gray-300", children: practice.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold text-green-700 dark:text-green-400", children: "実装方法" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: practice.implementation.map((impl, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: impl })
                          ] }, i)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold text-blue-700 dark:text-blue-400", children: "期待効果" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: practice.benefits.map((benefit, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: benefit })
                          ] }, i)) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 border-t pt-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold text-gray-700 dark:text-gray-300", children: "適用コンテキスト" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: practice.applicableContexts.map((context, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: context }, i)) })
                      ] })
                    ] })
                  }
                )
              },
              practice.id
            )) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comparison", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PMOComparisonChart, { data: comparisonData }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "maturity", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "PMO成熟度モデル" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "組織のプロジェクトマネジメント成熟度レベルと発展段階" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: maturityModel.map((level, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: index * 0.1 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    className: `border-l-4 ${level.level === 1 ? "border-l-red-400" : level.level === 2 ? "border-l-orange-400" : level.level === 3 ? "border-l-yellow-400" : level.level === 4 ? "border-l-blue-400" : "border-l-green-400"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center space-x-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${level.level === 1 ? "bg-red-400" : level.level === 2 ? "bg-orange-400" : level.level === 3 ? "bg-yellow-400" : level.level === 4 ? "bg-blue-400" : "bg-green-400"}`,
                            children: level.level
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold", children: level.name })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 leading-relaxed text-gray-700 dark:text-gray-300", children: level.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "特徴" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.characteristics.map((char, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                            "• ",
                            char
                          ] }, i)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "能力" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.capabilities.map((cap, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                            "• ",
                            cap
                          ] }, i)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "次レベルへの要件" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.nextLevelRequirements.map((req, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                            "• ",
                            req
                          ] }, i)) })
                        ] })
                      ] })
                    ] })
                  }
                )
              },
              level.level
            )) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "selector", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PMOTypeSelector, {}) })
        ] })
      }
    )
  ] });
}, "PMOLearningHub");
export {
  PMOLearningHub as default
};
