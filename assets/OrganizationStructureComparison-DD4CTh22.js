var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { b as organizationalStructureTypes, s as structureComparison } from "./opmData-DAJKV6t_.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { v as BarChart3, ba as Scale, b5 as Radar, t as Target, aU as Filter, j as RotateCcw, av as CheckCircle, aB as XCircle, aL as Info } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const ComparisonTable = /* @__PURE__ */ __name(({ theme }) => {
  const [selectedRow, setSelectedRow] = reactExports.useState(null);
  const structureTypes = ["functional", "matrix", "projectized"];
  const typeNames = {
    functional: "機能型",
    matrix: "マトリックス型",
    projectized: "プロジェクト型"
  };
  const typeColors = {
    functional: theme === "dark" ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800",
    matrix: theme === "dark" ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800",
    projectized: theme === "dark" ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} overflow-hidden shadow-lg`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `border-b p-4 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h3",
          {
            className: `text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
            children: "組織構造タイプ比較表"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: theme === "dark" ? "bg-gray-700" : "bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "th",
              {
                className: `p-4 text-left font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                children: "比較観点"
              }
            ),
            structureTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: `p-4 text-center font-semibold`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-sm ${typeColors[type]}`, children: typeNames[type] }) }, type))
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: structureComparison.comparisonMatrix.map((row, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.tr,
            {
              className: `cursor-pointer border-b transition-colors ${theme === "dark" ? "border-gray-700" : "border-gray-200"} ${selectedRow === index ? theme === "dark" ? "bg-blue-900/20" : "bg-blue-50" : theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedRow(selectedRow === index ? null : index), "onClick"),
              whileHover: { scale: 1.01 },
              transition: { duration: 0.2 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: `p-4 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mr-2 h-4 w-4 text-blue-500" }),
                      row.criteria
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: `p-4 text-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: row.functional
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: `p-4 text-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: row.matrix
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    className: `p-4 text-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: row.projectized
                  }
                )
              ]
            },
            index
          )) })
        ] }) })
      ]
    }
  );
}, "ComparisonTable");
const AuthorityLevelChart = /* @__PURE__ */ __name(({ theme }) => {
  const authorityData = [
    { name: "機能型", level: 0, color: theme === "dark" ? "#ef4444" : "#dc2626" },
    { name: "弱いマトリックス", level: 1, color: theme === "dark" ? "#f97316" : "#ea580c" },
    { name: "バランス型マトリックス", level: 3, color: theme === "dark" ? "#3b82f6" : "#2563eb" },
    { name: "強いマトリックス", level: 4, color: theme === "dark" ? "#8b5cf6" : "#7c3aed" },
    { name: "プロジェクト型", level: 5, color: theme === "dark" ? "#10b981" : "#059669" }
  ];
  const maxLevel = 5;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h3",
      {
        className: `mb-6 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
        children: "PMの権限レベル比較"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: authorityData.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: index * 0.1 },
        className: "flex items-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `w-32 text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
              children: item.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mx-4 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-8 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "flex h-full items-center justify-end rounded-full pr-2",
                  style: { backgroundColor: item.color },
                  initial: { width: 0 },
                  animate: { width: `${item.level / maxLevel * 100}%` },
                  transition: { duration: 1, delay: index * 0.1 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-white", children: [
                    item.level,
                    "/",
                    maxLevel
                  ] })
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `w-16 text-right text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`,
              children: [
                Math.round(item.level / maxLevel * 100),
                "%"
              ]
            }
          )
        ]
      },
      item.name
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-6 rounded-lg p-4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "mr-2 h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
            children: "権限レベルの解説"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `space-y-1 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• レベル0-1: 機能部門が主導権を持つ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• レベル2-3: PMと機能部門が権限を分担" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• レベル4-5: PMが強い権限を持つ" })
          ]
        }
      )
    ] })
  ] });
}, "AuthorityLevelChart");
const RadarChart = /* @__PURE__ */ __name(({ selectedTypes, theme }) => {
  const characteristics = [
    { key: "flexibility", name: "柔軟性", maxValue: 5 },
    { key: "efficiency", name: "効率性", maxValue: 5 },
    { key: "specialization", name: "専門性", maxValue: 5 },
    { key: "integration", name: "統合性", maxValue: 5 },
    { key: "speed", name: "迅速性", maxValue: 5 },
    { key: "control", name: "統制力", maxValue: 5 }
  ];
  const typeValues = {
    functional: {
      flexibility: 2,
      efficiency: 4,
      specialization: 5,
      integration: 2,
      speed: 2,
      control: 5
    },
    matrix: {
      flexibility: 4,
      efficiency: 3,
      specialization: 4,
      integration: 4,
      speed: 3,
      control: 3
    },
    projectized: {
      flexibility: 5,
      efficiency: 3,
      specialization: 3,
      integration: 5,
      speed: 5,
      control: 4
    }
  };
  const typeColors = {
    functional: theme === "dark" ? "#ef4444" : "#dc2626",
    matrix: theme === "dark" ? "#3b82f6" : "#2563eb",
    projectized: theme === "dark" ? "#10b981" : "#059669"
  };
  const typeNames = {
    functional: "機能型",
    matrix: "マトリックス型",
    projectized: "プロジェクト型"
  };
  if (selectedTypes.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Radar,
        {
          className: `mx-auto mb-4 h-12 w-12 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${theme === "dark" ? "text-gray-400" : "text-gray-600"}`, children: "組織タイプを選択してレーダーチャートを表示" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h3",
      {
        className: `mb-6 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
        children: "組織特性レーダーチャート"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mx-auto aspect-square w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "100%", height: "100%", viewBox: "0 0 400 400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(200, 200)", children: [
      [1, 2, 3, 4, 5].map((level) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "polygon",
        {
          points: characteristics.map((_, i) => {
            const angle = i * 2 * Math.PI / characteristics.length - Math.PI / 2;
            const x = Math.cos(angle) * (level * 30);
            const y = Math.sin(angle) * (level * 30);
            return `${x},${y}`;
          }).join(" "),
          fill: "none",
          stroke: theme === "dark" ? "#374151" : "#e5e7eb",
          strokeWidth: "1"
        },
        level
      )),
      characteristics.map((_, i) => {
        const angle = i * 2 * Math.PI / characteristics.length - Math.PI / 2;
        const x = Math.cos(angle) * 150;
        const y = Math.sin(angle) * 150;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "0",
            y1: "0",
            x2: x,
            y2: y,
            stroke: theme === "dark" ? "#4b5563" : "#d1d5db",
            strokeWidth: "1"
          },
          i
        );
      }),
      characteristics.map((char, i) => {
        const angle = i * 2 * Math.PI / characteristics.length - Math.PI / 2;
        const x = Math.cos(angle) * 170;
        const y = Math.sin(angle) * 170;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "text",
          {
            x,
            y,
            textAnchor: "middle",
            dominantBaseline: "middle",
            className: `text-sm font-medium ${theme === "dark" ? "fill-gray-200" : "fill-gray-800"}`,
            children: char.name
          },
          i
        );
      }),
      selectedTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.polygon,
        {
          points: characteristics.map((char, i) => {
            const angle = i * 2 * Math.PI / characteristics.length - Math.PI / 2;
            const value = typeValues[type][char.key];
            const x = Math.cos(angle) * (value * 30);
            const y = Math.sin(angle) * (value * 30);
            return `${x},${y}`;
          }).join(" "),
          fill: typeColors[type],
          fillOpacity: "0.3",
          stroke: typeColors[type],
          strokeWidth: "2",
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { duration: 0.8, type: "spring" }
        },
        type
      )),
      selectedTypes.map(
        (type) => characteristics.map((char, i) => {
          const angle = i * 2 * Math.PI / characteristics.length - Math.PI / 2;
          const value = typeValues[type][char.key];
          const x = Math.cos(angle) * (value * 30);
          const y = Math.sin(angle) * (value * 30);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.circle,
            {
              cx: x,
              cy: y,
              r: "4",
              fill: typeColors[type],
              initial: { scale: 0 },
              animate: { scale: 1 },
              transition: { duration: 0.8, delay: i * 0.1 }
            },
            `${type}-${i}`
          );
        })
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap justify-center gap-4", children: selectedTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "mr-2 h-4 w-4 rounded",
          style: { backgroundColor: typeColors[type] }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`, children: typeNames[type] })
    ] }, type)) })
  ] });
}, "RadarChart");
const RecommendationEngine = /* @__PURE__ */ __name(({ theme }) => {
  const [projectComplexity, setProjectComplexity] = reactExports.useState("medium");
  const [projectDuration, setProjectDuration] = reactExports.useState("medium");
  const [resourceAvailability, setResourceAvailability] = reactExports.useState("shared");
  const [strategicImportance, setStrategicImportance] = reactExports.useState("important");
  const recommendation = reactExports.useMemo(() => {
    var _a;
    const criteria = structureComparison.selectionCriteria;
    const scores = {
      functional: 0,
      matrix: 0,
      projectized: 0
    };
    const complexityRec = criteria.projectComplexity[projectComplexity];
    const durationRec = criteria.projectDuration[projectDuration];
    const resourceRec = criteria.resourceAvailability[resourceAvailability];
    const importanceRec = criteria.strategicImportance[strategicImportance];
    [complexityRec, durationRec, resourceRec, importanceRec].forEach((rec) => {
      scores[rec]++;
    });
    const maxScore = Math.max(...Object.values(scores));
    const recommended = ((_a = Object.entries(scores).find(([_, score]) => score === maxScore)) == null ? void 0 : _a[0]) || "matrix";
    return {
      type: recommended,
      confidence: Math.round(maxScore / 4 * 100),
      scores
    };
  }, [projectComplexity, projectDuration, resourceAvailability, strategicImportance]);
  const typeNames = {
    functional: "機能型組織",
    matrix: "マトリックス型組織",
    projectized: "プロジェクト型組織"
  };
  const typeDescriptions = {
    functional: "安定した環境で専門性を重視する場合に適している",
    matrix: "柔軟性と専門性のバランスが必要な場合に適している",
    projectized: "重要なプロジェクトに集中的に取り組む場合に適している"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h3",
      {
        className: `mb-6 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
        children: "組織構造推奨エンジン"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: `font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`, children: "プロジェクト特性を選択" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: `mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              children: "プロジェクト複雑度"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: projectComplexity,
              onChange: /* @__PURE__ */ __name((e) => setProjectComplexity(e.target.value), "onChange"),
              className: `w-full rounded border p-2 ${theme === "dark" ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "低 - 定型的な作業" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "中 - 標準的なプロジェクト" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "高 - 複雑で革新的" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: `mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              children: "プロジェクト期間"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: projectDuration,
              onChange: /* @__PURE__ */ __name((e) => setProjectDuration(e.target.value), "onChange"),
              className: `w-full rounded border p-2 ${theme === "dark" ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "short", children: "短期 - 3ヶ月以下" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "中期 - 3-12ヶ月" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "long", children: "長期 - 12ヶ月以上" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: `mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              children: "リソース可用性"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: resourceAvailability,
              onChange: /* @__PURE__ */ __name((e) => setResourceAvailability(e.target.value), "onChange"),
              className: `w-full rounded border p-2 ${theme === "dark" ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "limited", children: "限定的 - リソース制約が厳しい" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "shared", children: "共有 - 複数プロジェクトで共有" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dedicated", children: "専任 - プロジェクト専任可能" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: `mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              children: "戦略的重要度"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: strategicImportance,
              onChange: /* @__PURE__ */ __name((e) => setStrategicImportance(e.target.value), "onChange"),
              className: `w-full rounded border p-2 ${theme === "dark" ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "routine", children: "定常業務 - 日常的な取り組み" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "important", children: "重要 - 事業に影響する" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "critical", children: "クリティカル - 戦略的に重要" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h4",
          {
            className: `mb-4 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
            children: "推奨結果"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            className: `rounded-lg border-2 p-4 ${theme === "dark" ? "border-green-600 bg-green-900/30" : "border-green-300 bg-green-100"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-5 w-5 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `font-semibold ${theme === "dark" ? "text-green-300" : "text-green-800"}`,
                    children: [
                      "推奨: ",
                      typeNames[recommendation.type]
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mb-3 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`, children: typeDescriptions[recommendation.type] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`, children: [
                "信頼度: ",
                recommendation.confidence,
                "%"
              ] })
            ]
          },
          recommendation.type
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h5",
            {
              className: `mb-2 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
              children: "各組織タイプのスコア"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(recommendation.scores).map(([type, score]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `w-24 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
                children: typeNames[type].split("組織")[0]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-2 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `h-2 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "h-full rounded bg-blue-500",
                    initial: { width: 0 },
                    animate: { width: `${score / 4 * 100}%` },
                    transition: { duration: 0.6 }
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`,
                children: [
                  score,
                  "/4"
                ]
              }
            )
          ] }, type)) })
        ] })
      ] })
    ] })
  ] });
}, "RecommendationEngine");
const OrganizationStructureComparison = /* @__PURE__ */ __name(() => {
  const [activeTab, setActiveTab] = reactExports.useState("comparison");
  const [selectedTypes, setSelectedTypes] = reactExports.useState([
    "functional",
    "matrix",
    "projectized"
  ]);
  const [theme, setTheme] = reactExports.useState("light");
  const toggleType = /* @__PURE__ */ __name((type) => {
    setSelectedTypes(
      (prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, "toggleType");
  const resetSelection = /* @__PURE__ */ __name(() => {
    setSelectedTypes(["functional", "matrix", "projectized"]);
  }, "resetSelection");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-6 py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            className: "mb-8 text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  className: `mb-4 text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
                  children: "組織構造タイプ比較"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `mx-auto max-w-3xl text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                  children: "機能型、マトリックス型、プロジェクト型組織の特徴を詳細に比較し、最適な組織構造を選択できます"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => setTheme(theme === "light" ? "dark" : "light"), "onClick"),
                  className: `rounded-lg px-4 py-2 transition-colors ${theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-100"}`,
                  children: theme === "light" ? "🌙 ダークモード" : "☀️ ライトモード"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `inline-flex rounded-xl p-1 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`,
            children: [
              { key: "comparison", label: "比較表", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5" }) },
              { key: "authority", label: "権限レベル", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-5 w-5" }) },
              { key: "radar", label: "レーダーチャート", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radar, { className: "h-5 w-5" }) },
              {
                key: "recommendation",
                label: "推奨エンジン",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" })
              }
            ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setActiveTab(tab.key), "onClick"),
                className: `flex items-center space-x-2 rounded-lg px-6 py-3 transition-all ${activeTab === tab.key ? theme === "dark" ? "bg-blue-600 text-white shadow-lg" : "bg-blue-500 text-white shadow-lg" : theme === "dark" ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`,
                children: [
                  tab.icon,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: tab.label })
                ]
              },
              tab.key
            ))
          }
        ) }),
        activeTab === "radar" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            className: `mb-6 rounded-xl p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Filter,
                  {
                    className: `h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: "比較する組織タイプ:"
                  }
                ),
                ["functional", "matrix", "projectized"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: selectedTypes.includes(type),
                      onChange: /* @__PURE__ */ __name(() => toggleType(type), "onChange"),
                      className: "mr-2"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
                      children: type === "functional" ? "機能型" : type === "matrix" ? "マトリックス型" : "プロジェクト型"
                    }
                  )
                ] }, type))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: resetSelection,
                  className: `flex items-center rounded px-3 py-1 text-sm transition-colors ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
                    "リセット"
                  ]
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
          activeTab === "comparison" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComparisonTable, { theme })
            },
            "comparison"
          ),
          activeTab === "authority" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthorityLevelChart, { theme })
            },
            "authority"
          ),
          activeTab === "radar" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadarChart, { selectedTypes, theme })
            },
            "radar"
          ),
          activeTab === "recommendation" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecommendationEngine, { theme })
            },
            "recommendation"
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.3 },
            className: "mt-12 grid grid-cols-1 gap-6 md:grid-cols-3",
            children: Object.entries(organizationalStructureTypes).map(([key, orgType]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    {
                      className: `mb-4 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
                      children: orgType.name
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mb-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`, children: orgType.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h4",
                        {
                          className: `font-medium text-green-600 ${theme === "dark" ? "text-green-400" : "text-green-600"}`,
                          children: "メリット"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: orgType.advantages.slice(0, 2).map((advantage, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "li",
                        {
                          className: `flex items-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-3 w-3 text-green-500" }),
                            advantage
                          ]
                        },
                        index
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h4",
                        {
                          className: `font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"}`,
                          children: "デメリット"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: orgType.disadvantages.slice(0, 2).map((disadvantage, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "li",
                        {
                          className: `flex items-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "mr-2 h-3 w-3 text-red-500" }),
                            disadvantage
                          ]
                        },
                        index
                      )) })
                    ] })
                  ] })
                ]
              },
              key
            ))
          }
        )
      ] })
    }
  );
}, "OrganizationStructureComparison");
export {
  OrganizationStructureComparison as default
};
