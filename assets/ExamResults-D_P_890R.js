var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, w as useLocation, v as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { e as examDomains } from "./examQuestions-B-oJTG--.js";
import "./progressService-B-LomPlh.js";
import { au as Trophy, aB as XCircle, av as CheckCircle, aw as AlertCircle, R as RefreshCw, H as Home, v as BarChart3, T as TrendingUp, n as BookOpen } from "./lucide-icons-B7slfWYt.js";
import { p as processCategories } from "./progress-lm02eg8r.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
const ExamResults = /* @__PURE__ */ __name(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, examQuestions, answers } = location.state || {};
  const [showIncorrectOnly, setShowIncorrectOnly] = reactExports.useState(false);
  if (!results) {
    navigate("/mock-exam");
    return null;
  }
  const isPassed = results.score >= 61;
  const getScoreColor = /* @__PURE__ */ __name((percentage) => {
    if (percentage >= 80) {
      return "text-green-600";
    }
    if (percentage >= 61) {
      return "text-blue-600";
    }
    if (percentage >= 40) {
      return "text-yellow-600";
    }
    return "text-red-600";
  }, "getScoreColor");
  const getScoreBgColor = /* @__PURE__ */ __name((percentage) => {
    if (percentage >= 80) {
      return "bg-green-100";
    }
    if (percentage >= 61) {
      return "bg-blue-100";
    }
    if (percentage >= 40) {
      return "bg-yellow-100";
    }
    return "bg-red-100";
  }, "getScoreBgColor");
  const questionsToShow = showIncorrectOnly ? results.incorrectQuestions : examQuestions;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
        isPassed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-10 w-10 text-green-600" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "h-10 w-10 text-red-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900", children: isPassed ? "合格おめでとうございます！" : "今回は不合格でした" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `inline-flex items-center gap-2 rounded-full px-6 py-3 ${getScoreBgColor(results.score)} mb-4`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-4xl font-bold ${getScoreColor(results.score)}`, children: [
                results.score,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600", children: [
                "(",
                results.correctAnswers,
                "/",
                results.totalQuestions,
                ")"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: isPassed ? "PMP試験の合格基準（61%）を達成しました。" : "もう少しで合格です。苦手分野を重点的に復習しましょう。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "正解数" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: results.correctAnswers })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "h-5 w-5 text-red-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "不正解数" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: results.incorrectAnswers })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-gray-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "未回答" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-600", children: results.unanswered })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center gap-4 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => navigate("/mock-exam"), "onClick"),
            className: "flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-5 w-5" }),
              "もう一度挑戦"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => navigate("/"), "onClick"),
            className: "flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Home, { className: "h-5 w-5" }),
              "ホームに戻る"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-xl font-bold text-gray-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-6 w-6" }),
        "ドメイン別分析"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: Object.entries(examDomains).map(([key, domain]) => {
        const domainScore = results.domainScores[key];
        if (!domainScore || domainScore.total === 0) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: domain.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-sm text-gray-600", children: [
                "(",
                domainScore.correct,
                "/",
                domainScore.total,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${getScoreColor(domainScore.percentage)}`, children: [
              domainScore.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-2 rounded-full transition-all duration-500 ${domainScore.percentage >= 80 ? "bg-green-600" : domainScore.percentage >= 61 ? "bg-blue-600" : domainScore.percentage >= 40 ? "bg-yellow-600" : "bg-red-600"}`,
              style: { width: `${domainScore.percentage}%` }
            }
          ) })
        ] }, key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-4 flex items-center gap-2 text-xl font-bold text-gray-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6" }),
        "知識エリア別分析"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: Object.entries(results.knowledgeAreaScores).map(([area, score]) => {
        const areaName = processCategories[area] || area;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: areaName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${getScoreColor(score.percentage)}`, children: [
              score.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-1.5 rounded-full transition-all duration-500 ${score.percentage >= 80 ? "bg-green-600" : score.percentage >= 61 ? "bg-blue-600" : score.percentage >= 40 ? "bg-yellow-600" : "bg-red-600"}`,
              style: { width: `${score.percentage}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-gray-600", children: [
            score.correct,
            "/",
            score.total,
            " 問正解"
          ] })
        ] }, area);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-xl font-bold text-gray-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-6 w-6" }),
          "問題と解答の詳細"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: showIncorrectOnly,
              onChange: /* @__PURE__ */ __name((e) => setShowIncorrectOnly(e.target.checked), "onChange"),
              className: "h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "不正解のみ表示" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: questionsToShow.map((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = question.type === "single_choice" && userAnswer === question.correctAnswer || question.type === "multiple_choice" && JSON.stringify((userAnswer || []).sort()) === JSON.stringify(question.correctAnswers.sort());
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isCorrect ? "bg-green-100" : "bg-red-100"}`,
              children: isCorrect ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "h-6 w-6 text-red-600" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                "問題 ",
                question.questionNumber || index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-gray-100 px-2 py-1 text-xs text-gray-700", children: question.domain.toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-gray-900", children: question.question }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 space-y-2", children: question.options.map((option) => {
              const optionLetter = option.charAt(0);
              const isUserAnswer = question.type === "single_choice" ? userAnswer === optionLetter : (userAnswer || []).includes(optionLetter);
              const isCorrectAnswer = question.type === "single_choice" ? question.correctAnswer === optionLetter : question.correctAnswers.includes(optionLetter);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `rounded-lg p-3 ${isCorrectAnswer ? "border border-green-300 bg-green-50" : isUserAnswer && !isCorrectAnswer ? "border border-red-300 bg-red-50" : "bg-gray-50"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                    isCorrectAnswer && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" }),
                    isUserAnswer && !isCorrectAnswer && /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${isCorrectAnswer ? "font-medium" : ""}`, children: option })
                  ] })
                },
                option
              );
            }) }),
            !isCorrect && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-blue-900", children: "解説" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800", children: question.explanation }),
              question.references && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-blue-700", children: [
                "参考: ",
                question.references.join(", ")
              ] })
            ] })
          ] })
        ] }) }, question.id);
      }) })
    ] })
  ] }) });
}, "ExamResults");
const ExamResults$1 = React.memo(ExamResults);
export {
  ExamResults$1 as default
};
