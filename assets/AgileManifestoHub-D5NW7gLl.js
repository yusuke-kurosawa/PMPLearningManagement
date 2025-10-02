var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { B as Button } from "./button-C-u1QTim.js";
import { S as Separator } from "./separator-Cd8fry1p.js";
import { a as agileManifestoData } from "./agileManifestoData-Dl5TDcZS.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import { n as BookOpen, t as Target, a7 as Calendar, aX as Lightbulb, V as ChevronRight, A as ArrowRight, aZ as MapPin, s as Users, av as CheckCircle, ai as AlertTriangle, aR as Code, T as TrendingUp } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
const AgileManifestoHub = /* @__PURE__ */ __name(() => {
  const [selectedValue, setSelectedValue] = reactExports.useState(null);
  const [activeSection, setActiveSection] = reactExports.useState("values");
  const getValueIcon = /* @__PURE__ */ __name((index) => {
    const icons = [Users, Code, Users, TrendingUp];
    const IconComponent = icons[index];
    return /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-6 w-6" });
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-8 w-8 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent", children: "アジャイル・マニフェスト" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-3xl text-xl text-muted-foreground", children: "ソフトウェア開発のより良い方法を発見するための価値観と原則" })
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
          { key: "values", label: "4つの価値", icon: Target },
          { key: "background", label: "歴史的背景", icon: Calendar },
          { key: "details", label: "詳細分析", icon: Lightbulb }
        ].map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: activeSection === key ? "default" : "ghost",
            size: "sm",
            onClick: /* @__PURE__ */ __name(() => setActiveSection(key), "onClick"),
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
      activeSection === "values" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950 dark:to-purple-950", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl", children: "アジャイル・ソフトウェア開発宣言" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "text-lg", children: [
                "私たちは、ソフトウェア開発の実践と他の人々の支援を通じて、",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "より良い開発方法を見つけ出そうとしている。"
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: agileManifestoData.manifesto.values.map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                whileHover: { scale: 1.02 },
                whileTap: { scale: 0.98 },
                className: "cursor-pointer",
                onClick: /* @__PURE__ */ __name(() => setSelectedValue(value), "onClick"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-2 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-blue-300 dark:from-gray-900 dark:to-gray-800 dark:hover:border-blue-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl bg-gradient-to-r p-3 ${getValueColor(index)}`, children: [
                      getValueIcon(index),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "sr-only", children: [
                        "価値 ",
                        index + 1
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: value.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-sm text-muted-foreground", children: value.subtitle })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: value.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-green-800 dark:text-green-200", children: value.leftSide.value }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 dark:text-green-400", children: "重視する価値" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "mx-2 h-4 w-4 text-green-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-right", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-600 dark:text-gray-400", children: value.rightSide.value }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "従来のアプローチ" })
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: value.pmbokConnection.performanceDomains.map((domain) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: domain }, domain)) })
                  ] }) })
                ] })
              },
              value.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950 dark:to-orange-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-medium text-amber-800 dark:text-amber-200", children: [
              "これらの価値は、右側の項目にも価値があることを認めながら、",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "左側の項目により価値を置くことを表明しています。"
            ] }) }) }) })
          ]
        },
        "values"
      ),
      activeSection === "background" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "歴史的背景" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: agileManifestoData.manifesto.background.history }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "日程" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: agileManifestoData.manifesto.background.date })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "場所" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: agileManifestoData.manifesto.background.location })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "署名者" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "17名の開発者" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium", children: "背景と動機" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: agileManifestoData.manifesto.background.context })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium", children: "署名者（Agile Alliance 創設メンバー）" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 md:grid-cols-3", children: agileManifestoData.manifesto.background.authors.map((author, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-blue-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: author })
                ] }, index)) })
              ] })
            ] })
          ] }) })
        },
        "background"
      ),
      activeSection === "details" && selectedValue && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible",
          exit: "hidden",
          className: "space-y-6",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: itemVariants, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-3", children: [
                getValueIcon(
                  agileManifestoData.manifesto.values.findIndex(
                    (v) => v.id === selectedValue.id
                  )
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedValue.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: selectedValue.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "重要なポイント" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: selectedValue.keyPoints.map((point, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-1 h-4 w-4 flex-shrink-0 text-green-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: point })
                ] }, index)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "実践例" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-2", children: selectedValue.practicalExamples.map((example, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-50 p-3 dark:bg-blue-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: example }) }, index)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-green-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "利点" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: selectedValue.benefits.map((benefit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: benefit })
                  ] }, index)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-orange-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "課題" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: selectedValue.challenges.map((challenge, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: challenge })
                  ] }, index)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center space-x-2 font-medium text-red-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "よくある誤解" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedValue.commonMisunderstandings.map((misunderstanding, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-red-800 dark:text-red-200", children: misunderstanding })
                  },
                  index
                )) })
              ] })
            ] })
          ] }) })
        },
        "details"
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: selectedValue && activeSection === "values" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 md:hidden",
        onClick: /* @__PURE__ */ __name(() => setSelectedValue(null), "onClick"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: "max-h-96 max-w-lg overflow-y-auto rounded-lg bg-background p-6",
            onClick: /* @__PURE__ */ __name((e) => e.stopPropagation(), "onClick"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: selectedValue.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: /* @__PURE__ */ __name(() => setSelectedValue(null), "onClick"), children: "×" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: selectedValue.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: /* @__PURE__ */ __name(() => setActiveSection("details"), "onClick"), className: "w-full", children: "詳細を見る" })
            ]
          }
        )
      }
    ) })
  ] });
}, "AgileManifestoHub");
export {
  AgileManifestoHub as default
};
