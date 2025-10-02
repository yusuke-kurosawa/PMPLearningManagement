var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, v as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { u as useProgress } from "./progressService-B-LomPlh.js";
import { v as BarChart3, t as Target, aq as CheckCircle2, c as Clock, a7 as Calendar, n as BookOpen, T as TrendingUp, ar as Award, R as RefreshCw } from "./lucide-icons-B7slfWYt.js";
import { p as processCategories, a as processGroups } from "./progress-lm02eg8r.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
const LearningProgressDashboard = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  const { statistics, resetProgress } = useProgress();
  const [selectedView, setSelectedView] = reactExports.useState("overview");
  const [showResetConfirm, setShowResetConfirm] = reactExports.useState(false);
  if (!statistics) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "進捗データを読み込み中..." })
    ] }) });
  }
  const formatStudyTime = /* @__PURE__ */ __name((minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  }, "formatStudyTime");
  const formatDate = /* @__PURE__ */ __name((dateString) => {
    if (!dateString) {
      return "未開始";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, "formatDate");
  const getProgressColor = /* @__PURE__ */ __name((percentage) => {
    if (percentage >= 80) {
      return "text-green-600 bg-green-100";
    }
    if (percentage >= 60) {
      return "text-blue-600 bg-blue-100";
    }
    if (percentage >= 40) {
      return "text-yellow-600 bg-yellow-100";
    }
    if (percentage >= 20) {
      return "text-orange-600 bg-orange-100";
    }
    return "text-gray-600 bg-gray-100";
  }, "getProgressColor");
  const getProgressBarColor = /* @__PURE__ */ __name((percentage) => {
    if (percentage >= 80) {
      return "bg-green-600";
    }
    if (percentage >= 60) {
      return "bg-blue-600";
    }
    if (percentage >= 40) {
      return "bg-yellow-600";
    }
    if (percentage >= 20) {
      return "bg-orange-600";
    }
    return "bg-gray-400";
  }, "getProgressBarColor");
  const handleReset = /* @__PURE__ */ __name(() => {
    if (showResetConfirm) {
      resetProgress();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  }, "handleReset");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900 sm:text-3xl", children: "学習進捗ダッシュボード" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setSelectedView(selectedView === "overview" ? "detailed" : "overview"), "onClick"),
            className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: selectedView === "overview" ? "詳細表示" : "概要表示" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-8 w-8 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `text-2xl font-bold ${getProgressColor(statistics.overall.percentage).split(" ")[0]}`,
                children: [
                  statistics.overall.percentage,
                  "%"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700", children: "全体進捗率" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-600", children: [
            statistics.overall.completed,
            "/",
            statistics.overall.total,
            " プロセス完了"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-8 w-8 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-green-600", children: statistics.overall.completed })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700", children: "完了プロセス" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-600", children: [
            "残り ",
            statistics.overall.total - statistics.overall.completed,
            " プロセス"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 text-purple-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-purple-600", children: formatStudyTime(statistics.studyTime) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700", children: "総学習時間" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-600", children: [
            "平均 ",
            Math.round(statistics.studyTime / Math.max(statistics.overall.completed, 1)),
            "分/プロセス"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-8 w-8 text-orange-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-orange-600", children: formatDate(statistics.lastUpdated).split(" ")[0] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-700", children: "最終更新" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-600", children: formatDate(statistics.lastUpdated).split(" ")[1] })
        ] })
      ] }),
      selectedView === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5" }),
            "知識エリア別進捗"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(processCategories).map(([key, name]) => {
            const stat = statistics.byCategory[key] || { completed: 0, total: 0 };
            const percentage = stat.total > 0 ? Math.round(stat.completed / stat.total * 100) : 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [
                  stat.completed,
                  "/",
                  stat.total,
                  " (",
                  percentage,
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-2 rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`,
                  style: { width: `${percentage}%` }
                }
              ) })
            ] }, key);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }),
            "プロセス群別進捗"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5", children: Object.entries(processGroups).map(([key, name]) => {
            const stat = statistics.byGroup[key] || { completed: 0, total: 0 };
            const percentage = stat.total > 0 ? Math.round(stat.completed / stat.total * 100) : 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto mb-2 h-20 w-20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-20 w-20 -rotate-90 transform", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "circle",
                    {
                      cx: "40",
                      cy: "40",
                      r: "36",
                      stroke: "currentColor",
                      strokeWidth: "8",
                      fill: "none",
                      className: "text-gray-200"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "circle",
                    {
                      cx: "40",
                      cy: "40",
                      r: "36",
                      stroke: "currentColor",
                      strokeWidth: "8",
                      fill: "none",
                      strokeDasharray: `${percentage * 2.26} 226`,
                      className: getProgressBarColor(percentage)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold", children: [
                  percentage,
                  "%"
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-700", children: name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
                stat.completed,
                "/",
                stat.total
              ] })
            ] }, key);
          }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "詳細進捗データ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500", children: "カテゴリ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500", children: "完了数" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500", children: "進捗率" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500", children: "ステータス" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: Object.entries(processCategories).map(([key, name]) => {
            const stat = statistics.byCategory[key] || { completed: 0, total: 0 };
            const percentage = stat.total > 0 ? Math.round(stat.completed / stat.total * 100) : 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900", children: name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-gray-500", children: [
                stat.completed,
                " / ",
                stat.total
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 h-2 w-24 rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-2 rounded-full ${getProgressBarColor(percentage)}`,
                    style: { width: `${percentage}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  percentage,
                  "%"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getProgressColor(percentage)}`,
                  children: percentage === 100 ? "完了" : percentage >= 50 ? "進行中" : "開始"
                }
              ) })
            ] }, key);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => navigate("/matrix"), "onClick"),
              className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4" }),
                "学習を続ける"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => navigate("/integrated"), "onClick"),
              className: "flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
                "統合ビューで確認"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleReset,
            onBlur: /* @__PURE__ */ __name(() => setTimeout(() => setShowResetConfirm(false), 200), "onBlur"),
            className: `flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${showResetConfirm ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
              showResetConfirm ? "本当にリセットしますか？" : "進捗をリセット"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "学習のヒント" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-blue-900", children: "効率的な学習方法" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700", children: "知識エリアごとに集中して学習し、プロセス間の関係性を理解することが重要です。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-green-900", children: "ITTOの理解" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700", children: "各プロセスのインプット、ツールと技法、アウトプットの流れを把握しましょう。" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-purple-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-purple-900", children: "実践的な応用" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-purple-700", children: "学んだ知識を実際のプロジェクトに当てはめて考えることで、理解が深まります。" })
        ] })
      ] })
    ] })
  ] }) });
}, "LearningProgressDashboard");
const LearningProgressDashboard$1 = React.memo(LearningProgressDashboard);
export {
  LearningProgressDashboard$1 as default
};
