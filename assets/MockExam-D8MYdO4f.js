var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, v as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { a as analyzeExamResults, q as questionTypes, g as generateExam } from "./examQuestions-B-oJTG--.js";
import { p as progressService } from "./progressService-B-LomPlh.js";
import { c as Clock, av as CheckCircle, aw as AlertCircle, aj as Play, ax as Pause, ay as List, az as Flag, as as ChevronLeft, V as ChevronRight, aA as Send } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
const MockExam = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  const [examQuestions, setExamQuestions] = reactExports.useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = reactExports.useState(0);
  const [answers, setAnswers] = reactExports.useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = reactExports.useState(/* @__PURE__ */ new Set());
  const [examState, setExamState] = reactExports.useState("not_started");
  const [timeRemaining, setTimeRemaining] = reactExports.useState(230 * 60);
  const [showQuestionList, setShowQuestionList] = reactExports.useState(false);
  const [isPaused, setIsPaused] = reactExports.useState(false);
  const intervalRef = reactExports.useRef(null);
  const startExam = /* @__PURE__ */ __name(() => {
    const questions = generateExam(10);
    setExamQuestions(questions);
    setExamState("in_progress");
    setTimeRemaining(230 * 60);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setBookmarkedQuestions(/* @__PURE__ */ new Set());
  }, "startExam");
  reactExports.useEffect(() => {
    if (examState === "in_progress" && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examState, isPaused]);
  const formatTime = /* @__PURE__ */ __name((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, "formatTime");
  const handleAnswer = /* @__PURE__ */ __name((answer) => {
    const question = examQuestions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer
    }));
  }, "handleAnswer");
  const handleMultipleAnswer = /* @__PURE__ */ __name((option) => {
    const question = examQuestions[currentQuestionIndex];
    const currentAnswers = answers[question.id] || [];
    if (currentAnswers.includes(option)) {
      handleAnswer(currentAnswers.filter((a) => a !== option));
    } else {
      handleAnswer([...currentAnswers, option]);
    }
  }, "handleMultipleAnswer");
  const toggleBookmark = /* @__PURE__ */ __name(() => {
    const question = examQuestions[currentQuestionIndex];
    const newBookmarks = new Set(bookmarkedQuestions);
    if (newBookmarks.has(question.id)) {
      newBookmarks.delete(question.id);
    } else {
      newBookmarks.add(question.id);
    }
    setBookmarkedQuestions(newBookmarks);
  }, "toggleBookmark");
  const goToQuestion = /* @__PURE__ */ __name((index) => {
    setCurrentQuestionIndex(index);
    setShowQuestionList(false);
  }, "goToQuestion");
  const submitExam = /* @__PURE__ */ __name(() => {
    setExamState("completed");
    const results = analyzeExamResults(answers, examQuestions);
    progressService.recordExamResult({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration: 230 * 60 - timeRemaining,
      results,
      bookmarkedQuestions: Array.from(bookmarkedQuestions)
    });
    navigate("/exam-results", { state: { results, examQuestions, answers } });
  }, "submitExam");
  if (examState === "not_started") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-6 text-3xl font-bold text-gray-900", children: "PMP模擬試験" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-gray-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "試験時間: 230分（3時間50分）" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5 text-gray-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "問題数: 180問（デモ: 10問）" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-gray-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "合格基準: 正答率61%以上" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold text-blue-900", children: "試験の構成" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• People (42%): チーム管理、リーダーシップ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Process (50%): プロジェクト管理プロセス" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Business Environment (8%): ビジネス戦略との整合" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: startExam,
            className: "flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700",
            children: "試験を開始する"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => navigate(-1), "onClick"),
            className: "rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50",
            children: "戻る"
          }
        )
      ] })
    ] }) });
  }
  if (examState === "completed") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "試験完了 - 結果ページへ自動遷移します..." });
  }
  const currentQuestion = examQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isBookmarked = bookmarkedQuestions.has(currentQuestion.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", role: "main", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sr-only", "aria-live": "polite", "aria-atomic": "true", children: [
      "Question ",
      currentQuestionIndex + 1,
      " of ",
      examQuestions.length,
      ". Time remaining:",
      " ",
      formatTime(timeRemaining),
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold", children: "PMP模擬試験" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", "aria-label": "Progress indicator", children: [
          "問題 ",
          currentQuestionIndex + 1,
          " / ",
          examQuestions.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gray-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `font-mono text-lg ${timeRemaining < 600 ? "text-red-600" : "text-gray-900"}`,
              children: formatTime(timeRemaining)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setIsPaused(!isPaused), "onClick"),
            className: "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "aria-label": isPaused ? "Resume exam timer" : "Pause exam timer",
            "aria-pressed": isPaused,
            children: isPaused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setShowQuestionList(!showQuestionList), "onClick"),
            className: "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "aria-label": "Show question list",
            "aria-expanded": showQuestionList,
            "aria-controls": "question-list-sidebar",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-5 w-5" })
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "section",
        {
          className: "mb-4 rounded-lg bg-white p-6 shadow-lg",
          "aria-labelledby": "current-question",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-blue-100 px-2 py-1 text-xs text-blue-700", children: currentQuestion.domain.toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-gray-100 px-2 py-1 text-xs text-gray-700", children: currentQuestion.difficulty === "easy" ? "易" : currentQuestion.difficulty === "medium" ? "中" : "難" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h2",
                  {
                    id: "current-question",
                    className: "text-lg font-medium leading-relaxed text-gray-900",
                    children: currentQuestion.question
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: toggleBookmark,
                  className: `rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${isBookmarked ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" : "text-gray-400 hover:bg-gray-100"}`,
                  "aria-label": isBookmarked ? "Remove bookmark from this question" : "Bookmark this question",
                  "aria-pressed": isBookmarked,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-5 w-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "sr-only", children: currentQuestion.type === questionTypes.SINGLE_CHOICE ? "Select one answer" : "Select multiple answers" }),
              currentQuestion.options.map((option) => {
                const optionLetter = option.charAt(0);
                const isSelected = currentQuestion.type === questionTypes.SINGLE_CHOICE ? currentAnswer === optionLetter : (currentAnswer || []).includes(optionLetter);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => {
                      if (currentQuestion.type === questionTypes.SINGLE_CHOICE) {
                        handleAnswer(optionLetter);
                      } else {
                        handleMultipleAnswer(optionLetter);
                      }
                    }, "onClick"),
                    className: `w-full rounded-lg border-2 p-4 text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`,
                          children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4 text-white" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-800", children: option })
                    ] })
                  },
                  option
                );
              })
            ] }),
            currentQuestion.type === questionTypes.MULTIPLE_CHOICE && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-gray-600", children: "※ 複数選択問題です。該当するものをすべて選択してください。" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)), "onClick"),
            disabled: currentQuestionIndex === 0,
            className: "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
              "前の問題"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: Array.from({ length: Math.min(5, examQuestions.length) }, (_, i) => {
          const index = Math.max(
            0,
            Math.min(currentQuestionIndex - 2 + i, examQuestions.length - 1)
          );
          const question = examQuestions[index];
          const hasAnswer = !!answers[question.id];
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => goToQuestion(index), "onClick"),
              className: `h-10 w-10 rounded-lg font-medium transition-colors ${index === currentQuestionIndex ? "bg-blue-600 text-white" : hasAnswer ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: index + 1
            },
            index
          );
        }) }),
        currentQuestionIndex < examQuestions.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setCurrentQuestionIndex(currentQuestionIndex + 1), "onClick"),
            className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700",
            children: [
              "次の問題",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: submitExam,
            className: "flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
              "試験を提出"
            ]
          }
        )
      ] })
    ] }),
    showQuestionList && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto bg-white shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "問題一覧" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setShowQuestionList(false), "onClick"),
            className: "rounded p-1 hover:bg-gray-100",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2", children: examQuestions.map((question, index) => {
          const hasAnswer = !!answers[question.id];
          const isBookmarked2 = bookmarkedQuestions.has(question.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => goToQuestion(index), "onClick"),
              className: `relative rounded-lg p-3 text-sm font-medium transition-colors ${index === currentQuestionIndex ? "bg-blue-600 text-white" : hasAnswer ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: [
                index + 1,
                isBookmarked2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "absolute right-0 top-0 h-3 w-3 text-yellow-500" })
              ]
            },
            index
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded bg-green-100" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "回答済み (",
              Object.keys(answers).length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded bg-gray-100" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "未回答 (",
              examQuestions.length - Object.keys(answers).length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-4 w-4 text-yellow-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "ブックマーク (",
              bookmarkedQuestions.size,
              ")"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}, "MockExam");
const MockExam$1 = React.memo(MockExam);
export {
  MockExam$1 as default
};
