var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { S as Separator } from "./separator-Cd8fry1p.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { a as agileManifestoData } from "./agileManifestoData-Dl5TDcZS.js";
import { G as Grid3x3, s as Users, aR as Code, T as TrendingUp, n as BookOpen, A as ArrowRight, N as Network, as as ChevronLeft, V as ChevronRight, av as CheckCircle, aX as Lightbulb, t as Target, ai as AlertTriangle, ar as Award } from "./lucide-icons-B7slfWYt.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
const AgilePrinciplesExplorer = /* @__PURE__ */ __name(() => {
  var _a;
  const [currentPrinciple, setCurrentPrinciple] = reactExports.useState(0);
  const [viewMode, setViewMode] = reactExports.useState("carousel");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("all");
  const [expandedSections, setExpandedSections] = reactExports.useState(/* @__PURE__ */ new Set());
  const principles = agileManifestoData.manifesto.principles;
  const categories2 = reactExports.useMemo(() => {
    [...new Set(principles.map((p) => p.category))];
    return [
      { key: "all", label: "すべて", icon: Grid3x3 },
      { key: "customer-collaboration", label: "顧客協調", icon: Users },
      { key: "working-software", label: "動くソフトウェア", icon: Code },
      { key: "team-dynamics", label: "チームダイナミクス", icon: Users },
      { key: "process-improvement", label: "プロセス改善", icon: TrendingUp }
    ];
  }, []);
  const filteredPrinciples = reactExports.useMemo(() => {
    if (selectedCategory === "all") {
      return principles;
    }
    return principles.filter((p) => p.category === selectedCategory);
  }, [principles, selectedCategory]);
  const toggleSection = /* @__PURE__ */ __name((section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  }, "toggleSection");
  const nextPrinciple = /* @__PURE__ */ __name(() => {
    setCurrentPrinciple((prev) => (prev + 1) % filteredPrinciples.length);
  }, "nextPrinciple");
  const prevPrinciple = /* @__PURE__ */ __name(() => {
    setCurrentPrinciple(
      (prev) => (prev - 1 + filteredPrinciples.length) % filteredPrinciples.length
    );
  }, "prevPrinciple");
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-8 w-8 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent", children: "アジャイル12原則" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-3xl text-xl text-muted-foreground", children: "アジャイル・マニフェストの背後にある原則を深く理解し、実践に活かす" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.3 },
        className: "flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-1 rounded-lg bg-muted p-1", children: [
            { key: "carousel", label: "カルーセル", icon: ArrowRight },
            { key: "grid", label: "グリッド", icon: Grid3x3 },
            { key: "network", label: "ネットワーク", icon: Network }
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
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: categories2.map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: selectedCategory === key ? "default" : "outline",
              size: "sm",
              onClick: /* @__PURE__ */ __name(() => setSelectedCategory(key), "onClick"),
              className: "flex items-center space-x-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
              ]
            },
            key
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      viewMode === "carousel" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "原則 ",
                  ((_a = filteredPrinciples[currentPrinciple]) == null ? void 0 : _a.number) || 1,
                  " / 12"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  Math.round((currentPrinciple + 1) / filteredPrinciples.length * 100),
                  "% 完了"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: (currentPrinciple + 1) / filteredPrinciples.length * 100 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  onClick: prevPrinciple,
                  disabled: filteredPrinciples.length <= 1,
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "前の原則" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-1", children: filteredPrinciples.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => setCurrentPrinciple(index), "onClick"),
                  className: `h-3 w-3 rounded-full transition-all ${index === currentPrinciple ? "scale-125 bg-primary" : "bg-muted hover:bg-muted-foreground/20"}`
                },
                index
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  onClick: nextPrinciple,
                  disabled: filteredPrinciples.length <= 1,
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "次の原則" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
                  ]
                }
              )
            ] }),
            filteredPrinciples[currentPrinciple] && /* @__PURE__ */ jsxRuntimeExports.jsx(
              PrincipleDetailCard,
              {
                principle: filteredPrinciples[currentPrinciple],
                expandedSections,
                onToggleSection: toggleSection
              }
            )
          ]
        },
        "carousel"
      ),
      viewMode === "grid" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
          children: filteredPrinciples.map((principle, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PrincipleGridCard, { principle }) }, principle.id))
        },
        "grid"
      ),
      viewMode === "network" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PrincipleNetworkView, { principles: filteredPrinciples })
        },
        "network"
      )
    ] })
  ] });
}, "AgilePrinciplesExplorer");
const PrincipleDetailCard = /* @__PURE__ */ __name(({ principle, expandedSections, onToggleSection }) => {
  var _a;
  const CategoryIcon = getCategoryIcon(principle.category);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-xl bg-gradient-to-r p-3 ${getCategoryColor(principle.category)}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { className: "h-6 w-6 text-white" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-2xl", children: [
                "原則 ",
                principle.number,
                ": ",
                principle.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-lg", children: principle.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-sm", children: (_a = categories.find((c) => c.key === principle.category)) == null ? void 0 : _a.label }) })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-blue-800 dark:text-blue-200", children: "日本語版" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700 dark:text-blue-300", children: principle.japaneseText })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-green-800 dark:text-green-200", children: "English" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm italic text-green-700 dark:text-green-300", children: principle.englishText })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CollapsibleSection,
            {
              title: "実践的応用",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
              isExpanded: expandedSections.has(`${principle.id}-applications`),
              onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-applications`), "onToggle"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: principle.practicalApplications.map((application, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-1 h-4 w-4 flex-shrink-0 text-green-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: application })
              ] }, index)) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CollapsibleSection,
            {
              title: "PMBOK第7版との関連性",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
              isExpanded: expandedSections.has(`${principle.id}-pmbok`),
              onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-pmbok`), "onToggle"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium", children: "パフォーマンスドメイン" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: principle.pmbokAlignment.performanceDomains.map((domain) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: domain }, domain)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "mb-2 font-medium", children: "PMBOK原則" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: principle.pmbokAlignment.principles.map((princ) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: princ }, princ)) })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CollapsibleSection,
            {
              title: "実装のヒント",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
              isExpanded: expandedSections.has(`${principle.id}-tips`),
              onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-tips`), "onToggle"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: principle.implementationTips.map((tip, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: tip })
              ] }, index)) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CollapsibleSection,
              {
                title: "測定指標",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                isExpanded: expandedSections.has(`${principle.id}-metrics`),
                onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-metrics`), "onToggle"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: principle.metrics.map((metric, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-muted-foreground", children: [
                  "• ",
                  metric
                ] }, index)) })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CollapsibleSection,
              {
                title: "アンチパターン",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                isExpanded: expandedSections.has(`${principle.id}-antipatterns`),
                onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-antipatterns`), "onToggle"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: principle.antiPatterns.map((pattern, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-red-600 dark:text-red-400", children: [
                  "• ",
                  pattern
                ] }, index)) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CollapsibleSection,
            {
              title: "成功事例",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
              isExpanded: expandedSections.has(`${principle.id}-success`),
              onToggle: /* @__PURE__ */ __name(() => onToggleSection(`${principle.id}-success`), "onToggle"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: principle.successStories.map((story, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-green-50 p-3 dark:bg-green-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-green-800 dark:text-green-200", children: story }) }, index)) })
            }
          )
        ] })
      ] })
    }
  );
}, "PrincipleDetailCard");
const PrincipleGridCard = /* @__PURE__ */ __name(({ principle }) => {
  var _a;
  const CategoryIcon = getCategoryIcon(principle.category);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group h-full cursor-pointer transition-all duration-300 hover:shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `rounded-lg bg-gradient-to-r p-2 ${getCategoryColor(principle.category)}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { className: "h-5 w-5 text-white" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg transition-colors group-hover:text-primary", children: [
          "原則 ",
          principle.number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm", children: principle.title })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: principle.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: (_a = categories.find((c) => c.key === principle.category)) == null ? void 0 : _a.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: principle.keyWords.slice(0, 3).map((keyword) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: keyword }, keyword)) })
      ] })
    ] })
  ] });
}, "PrincipleGridCard");
const PrincipleNetworkView = /* @__PURE__ */ __name(({ principles }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "原則間の関係性マップ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "アジャイル原則のカテゴリ別分類と相互関係" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: categories.slice(1).map(({ key, label, icon: Icon }) => {
      const categoryPrinciples = principles.filter((p) => p.category === key);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg bg-gradient-to-r p-2 ${getCategoryColor(key)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: categoryPrinciples.map((principle) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded bg-muted p-2 text-xs", children: [
          "原則 ",
          principle.number,
          ": ",
          principle.title
        ] }, principle.id)) })
      ] }, key);
    }) }) })
  ] });
}, "PrincipleNetworkView");
const CollapsibleSection = /* @__PURE__ */ __name(({ title, icon, children, isExpanded, onToggle }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "ghost",
        onClick: onToggle,
        className: "flex h-auto items-center space-x-2 p-0 font-medium hover:bg-transparent",
        children: [
          icon,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}` })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3 },
        className: "overflow-hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-6", children })
      }
    ) })
  ] });
}, "CollapsibleSection");
const categories = [
  { key: "all", label: "すべて", icon: Grid3x3 },
  { key: "customer-collaboration", label: "顧客協調", icon: Users },
  { key: "working-software", label: "動くソフトウェア", icon: Code },
  { key: "team-dynamics", label: "チームダイナミクス", icon: Users },
  { key: "process-improvement", label: "プロセス改善", icon: TrendingUp }
];
const getCategoryIcon = /* @__PURE__ */ __name((category) => {
  const categoryMap = {
    "customer-collaboration": Users,
    "working-software": Code,
    "team-dynamics": Users,
    "process-improvement": TrendingUp
  };
  return categoryMap[category] || Target;
}, "getCategoryIcon");
const getCategoryColor = /* @__PURE__ */ __name((category) => {
  const colorMap = {
    "customer-collaboration": "from-blue-500 to-blue-600",
    "working-software": "from-green-500 to-green-600",
    "team-dynamics": "from-purple-500 to-purple-600",
    "process-improvement": "from-orange-500 to-orange-600"
  };
  return colorMap[category] || "from-gray-500 to-gray-600";
}, "getCategoryColor");
export {
  AgilePrinciplesExplorer as default
};
