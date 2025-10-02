var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { o as opmFramework, a as opmBenefits, i as implementationRoadmap } from "./opmData-DAJKV6t_.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { l as Layers, T as TrendingUp, av as CheckCircle, c as Clock, aG as ChevronUp, a4 as ChevronDown, v as BarChart3, b8 as ArrowDown, b9 as ArrowUp, r as Building2, t as Target, aX as Lightbulb, e as Settings, E as DollarSign } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const HierarchyCard = /* @__PURE__ */ __name(({
  level,
  index,
  isSelected,
  onSelect,
  theme
}) => {
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  const hierarchyIcons = [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-8 w-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-8 w-8" })
  ];
  const hierarchyColors = [
    "bg-purple-100 border-purple-300 text-purple-700",
    "bg-blue-100 border-blue-300 text-blue-700",
    "bg-green-100 border-green-300 text-green-700"
  ];
  const hierarchyColorsDark = [
    "bg-purple-900/30 border-purple-600 text-purple-300",
    "bg-blue-900/30 border-blue-600 text-blue-300",
    "bg-green-900/30 border-green-600 text-green-300"
  ];
  const colorClass = theme === "dark" ? hierarchyColorsDark[index] : hierarchyColors[index];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      layout: true,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.1 },
      className: `relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${isSelected ? `${colorClass} scale-105 shadow-lg` : theme === "dark" ? "border-gray-600 bg-gray-800 hover:border-gray-500" : "border-gray-200 bg-white hover:border-gray-300"}`,
      onClick: /* @__PURE__ */ __name(() => onSelect(level.id), "onClick"),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-lg p-3 ${isSelected ? "bg-white/20" : theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`,
                children: hierarchyIcons[index]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h3",
                {
                  className: `text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
                  children: level.name
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`, children: [
                "レベル ",
                level.level
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name((e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }, "onClick"),
              className: `rounded-lg p-2 transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`,
              children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mb-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`, children: level.definition }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
            children: [
              "主要フォーカス: ",
              level.primaryFocus
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.3 },
            className: "mt-4 space-y-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h4",
                  {
                    className: `mb-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: "主要特徴"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.keyCharacteristics.map((characteristic, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: `flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
                      characteristic
                    ]
                  },
                  idx
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h4",
                  {
                    className: `mb-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: "主要成果物"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.deliverables.map((deliverable, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: `text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: [
                      "• ",
                      deliverable
                    ]
                  },
                  idx
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h4",
                  {
                    className: `mb-2 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: "主要メトリクス"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: level.metrics.map((metric, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: `text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "mr-2 inline h-4 w-4" }),
                      metric
                    ]
                  },
                  idx
                )) })
              ] })
            ]
          }
        ) })
      ]
    }
  );
}, "HierarchyCard");
const ValueFlowVisualization = /* @__PURE__ */ __name(({ theme }) => {
  const valueFlow = opmFramework.relationships.value_flow;
  const strategicAlignment = opmFramework.relationships.strategic_alignment;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `mb-6 text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`, children: "OPM価値実現システム" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "mr-2 h-5 w-5 text-blue-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: `font-semibold ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`, children: "戦略的整合性（Top-Down）" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: strategicAlignment.flow.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: index * 0.2 },
            className: `rounded-lg border p-3 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-blue-200 bg-blue-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`,
                    children: index + 1
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: theme === "dark" ? "text-gray-200" : "text-gray-800", children: item })
              ] }),
              index < strategicAlignment.flow.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4 text-blue-500" }) })
            ]
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "mr-2 h-5 w-5 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h4",
            {
              className: `font-semibold ${theme === "dark" ? "text-green-300" : "text-green-700"}`,
              children: "価値の流れ（Bottom-Up）"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: valueFlow.flow.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: index * 0.2 },
            className: `rounded-lg border p-3 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-green-200 bg-green-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${theme === "dark" ? "bg-green-600 text-white" : "bg-green-500 text-white"}`,
                    children: index + 1
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: theme === "dark" ? "text-gray-200" : "text-gray-800", children: item })
              ] }),
              index < valueFlow.flow.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4 text-green-500" }) })
            ]
          },
          index
        )) })
      ] })
    ] })
  ] });
}, "ValueFlowVisualization");
const BenefitsOverview = /* @__PURE__ */ __name(({ theme }) => {
  const benefitIcons = {
    organizational: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }),
    financial: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-6 w-6" }),
    operational: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6" }),
    strategic: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-6 w-6" })
  };
  const benefitColors = {
    organizational: theme === "dark" ? "bg-purple-900/30 border-purple-600" : "bg-purple-100 border-purple-300",
    financial: theme === "dark" ? "bg-green-900/30 border-green-600" : "bg-green-100 border-green-300",
    operational: theme === "dark" ? "bg-blue-900/30 border-blue-600" : "bg-blue-100 border-blue-300",
    strategic: theme === "dark" ? "bg-orange-900/30 border-orange-600" : "bg-orange-100 border-orange-300"
  };
  const benefitNames = {
    organizational: "組織的効果",
    financial: "財務的効果",
    operational: "運用的効果",
    strategic: "戦略的効果"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `mb-6 text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`, children: "OPM導入効果" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: Object.entries(opmBenefits).map(([category, benefits]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
        className: `rounded-lg border-2 p-4 ${benefitColors[category]}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `mr-3 rounded-lg p-2 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`,
                children: benefitIcons[category]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: `font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`, children: benefitNames[category] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: benefits.map((benefit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: `flex items-start text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" }),
                benefit
              ]
            },
            index
          )) })
        ]
      },
      category
    )) })
  ] });
}, "BenefitsOverview");
const ImplementationRoadmapComponent = /* @__PURE__ */ __name(({ theme }) => {
  const [selectedPhase, setSelectedPhase] = reactExports.useState(null);
  const phaseColors = [
    theme === "dark" ? "bg-blue-900/30 border-blue-600" : "bg-blue-100 border-blue-300",
    theme === "dark" ? "bg-purple-900/30 border-purple-600" : "bg-purple-100 border-purple-300",
    theme === "dark" ? "bg-green-900/30 border-green-600" : "bg-green-100 border-green-300"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `mb-6 text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`, children: "実装ロードマップ" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: Object.entries(implementationRoadmap).map(([phaseKey, phase], index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: index * 0.1 },
        className: `cursor-pointer rounded-lg border-2 p-4 transition-all ${selectedPhase === phaseKey ? `${phaseColors[index]} shadow-lg` : theme === "dark" ? "border-gray-600 bg-gray-700 hover:border-gray-500" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`,
        onClick: /* @__PURE__ */ __name(() => setSelectedPhase(selectedPhase === phaseKey ? null : phaseKey), "onClick"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `mr-4 flex h-10 w-10 items-center justify-center rounded-full font-bold ${theme === "dark" ? "bg-gray-600 text-white" : "bg-white text-gray-800"}`,
                  children: index + 1
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h4",
                  {
                    className: `font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`,
                    children: phase.name
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-4 w-4 text-gray-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`,
                      children: phase.duration
                    }
                  )
                ] })
              ] })
            ] }),
            selectedPhase === phaseKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`, children: phase.focus }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedPhase === phaseKey && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.3 },
              className: "mt-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h5",
                  {
                    className: `mb-2 font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`,
                    children: "主要活動:"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: phase.activities.map((activity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: `flex items-center text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
                      activity
                    ]
                  },
                  idx
                )) })
              ]
            }
          ) })
        ]
      },
      phaseKey
    )) })
  ] });
}, "ImplementationRoadmapComponent");
const OPMLearningHub = /* @__PURE__ */ __name(() => {
  const [selectedHierarchy, setSelectedHierarchy] = reactExports.useState("portfolio");
  const [activeTab, setActiveTab] = reactExports.useState(
    "hierarchy"
  );
  const [theme, setTheme] = reactExports.useState("light");
  const hierarchyLevels = [
    opmFramework.hierarchy.portfolio,
    opmFramework.hierarchy.program,
    opmFramework.hierarchy.project
  ];
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
                  children: "OPM学習ハブ"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `mx-auto max-w-3xl text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`,
                  children: opmFramework.definition.description
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
              { key: "hierarchy", label: "階層構造", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-5 w-5" }) },
              { key: "flow", label: "価値の流れ", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }) },
              { key: "benefits", label: "導入効果", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5" }) },
              { key: "roadmap", label: "ロードマップ", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" }) }
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
          activeTab === "hierarchy" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              className: "grid grid-cols-1 gap-8 lg:grid-cols-3",
              children: hierarchyLevels.map((level, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                HierarchyCard,
                {
                  level,
                  index,
                  isSelected: selectedHierarchy === level.id,
                  onSelect: setSelectedHierarchy,
                  theme
                },
                level.id
              ))
            },
            "hierarchy"
          ),
          activeTab === "flow" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ValueFlowVisualization, { theme })
            },
            "flow"
          ),
          activeTab === "benefits" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(BenefitsOverview, { theme })
            },
            "benefits"
          ),
          activeTab === "roadmap" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 },
              transition: { duration: 0.3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImplementationRoadmapComponent, { theme })
            },
            "roadmap"
          )
        ] })
      ] })
    }
  );
}, "OPMLearningHub");
export {
  OPMLearningHub as default
};
