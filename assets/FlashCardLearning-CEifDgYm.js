var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports, v as useNavigate } from "./react-vendor-Uy5hwzow.js";
import { j as RotateCcw, as as ChevronLeft, X, af as Check, V as ChevronRight, at as ArrowLeft, o as Brain, au as Trophy, T as TrendingUp, f as Save } from "./lucide-icons-B7slfWYt.js";
import { p as progressService } from "./progressService-B-LomPlh.js";
import { p as processCategories, a as processGroups } from "./progress-lm02eg8r.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
const FlashCard = /* @__PURE__ */ __name(({ process, onNext, onPrevious, onAnswer, currentIndex, totalCards }) => {
  var _a, _b, _c;
  const [isFlipped, setIsFlipped] = reactExports.useState(false);
  const [showAnswer, setShowAnswer] = reactExports.useState(false);
  const handleFlip = /* @__PURE__ */ __name(() => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  }, "handleFlip");
  const handleKeyDown = /* @__PURE__ */ __name((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleFlip();
    }
  }, "handleKeyDown");
  const handleAnswer = /* @__PURE__ */ __name((isCorrect) => {
    onAnswer(process.id, isCorrect);
    setIsFlipped(false);
    setShowAnswer(false);
    onNext();
  }, "handleAnswer");
  const handleNavigate = /* @__PURE__ */ __name((direction) => {
    setIsFlipped(false);
    setShowAnswer(false);
    if (direction === "next") {
      onNext();
    } else {
      onPrevious();
    }
  }, "handleNavigate");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-2xl", role: "main", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sr-only", "aria-live": "polite", "aria-atomic": "true", children: isFlipped ? `Answer shown for ${process.name}` : `Question shown for ${process.name}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-700", children: [
        "カード ",
        currentIndex + 1,
        " / ",
        totalCards
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: process.knowledgeArea }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "•" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: process.processGroup })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mb-6 h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `preserve-3d absolute inset-0 h-full w-full transform-gpu cursor-pointer transition-all duration-500 ${isFlipped ? "rotate-y-180" : ""}`,
        onClick: handleFlip,
        onKeyDown: handleKeyDown,
        tabIndex: 0,
        role: "button",
        "aria-label": isFlipped ? "Card showing answer. Press Enter or Space to show question again" : "Card showing question. Press Enter or Space to flip and see answer",
        "aria-pressed": isFlipped,
        style: { transformStyle: "preserve-3d" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "backface-hidden absolute inset-0 h-full w-full rounded-lg shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-center text-2xl font-bold text-gray-800", children: process.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-600", children: "このプロセスのITTO（インプット、ツールと技法、アウトプット）は？" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "aria-label": "Flip card to see answer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                  "答えを見る"
                ]
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "backface-hidden rotate-y-180 absolute inset-0 h-full w-full rounded-lg shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full w-full overflow-y-auto rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-center text-xl font-bold text-gray-800", children: process.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-gray-700", children: "インプット" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc space-y-1 text-sm text-gray-600", children: (_a = process.inputs) == null ? void 0 : _a.map((input, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: input }, idx)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-gray-700", children: "ツールと技法" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc space-y-1 text-sm text-gray-600", children: (_b = process.tools) == null ? void 0 : _b.map((tool, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: tool }, idx)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold text-gray-700", children: "アウトプット" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc space-y-1 text-sm text-gray-600", children: (_c = process.outputs) == null ? void 0 : _c.map((output, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: output }, idx)) })
              ] })
            ] })
          ] }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => handleNavigate("previous"), "onClick"),
          className: "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          disabled: currentIndex === 0,
          "aria-label": "Previous flashcard",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6" })
        }
      ),
      showAnswer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleAnswer(false), "onClick"),
            className: "flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "aria-label": "Mark as not remembered",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
              "まだ覚えていない"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleAnswer(true), "onClick"),
            className: "flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
            "aria-label": "Mark as remembered",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
              "覚えた！"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => handleNavigate("next"), "onClick"),
          className: "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          disabled: currentIndex === totalCards - 1,
          "aria-label": "Next flashcard",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6" })
        }
      )
    ] })
  ] });
}, "FlashCard");
const FlashCard$1 = React.memo(FlashCard);
const FlashCardLearning = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = reactExports.useState(0);
  const [selectedCategory, setSelectedCategory] = reactExports.useState("all");
  const [selectedGroup, setSelectedGroup] = reactExports.useState("all");
  const [studyMode, setStudyMode] = reactExports.useState("sequential");
  const [sessionStats, setSessionStats] = reactExports.useState({
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    startTime: Date.now()
  });
  const [cardAnswers, setCardAnswers] = reactExports.useState({});
  const getAllProcesses = /* @__PURE__ */ __name(() => {
    const processes = [];
    const knowledgeAreas = [
      { id: "integration", name: "プロジェクト統合マネジメント" },
      { id: "scope", name: "プロジェクト・スコープ・マネジメント" },
      { id: "schedule", name: "プロジェクト・スケジュール・マネジメント" },
      { id: "cost", name: "プロジェクト・コスト・マネジメント" },
      { id: "quality", name: "プロジェクト品質マネジメント" },
      { id: "resource", name: "プロジェクト資源マネジメント" },
      { id: "communications", name: "プロジェクト・コミュニケーション・マネジメント" },
      { id: "risk", name: "プロジェクト・リスク・マネジメント" },
      { id: "procurement", name: "プロジェクト調達マネジメント" },
      { id: "stakeholder", name: "プロジェクト・ステークホルダー・マネジメント" }
    ];
    const processData = {
      integration: {
        立上げ: ["プロジェクト憲章の作成"],
        計画: ["プロジェクトマネジメント計画書の作成"],
        実行: ["プロジェクト作業の指揮・マネジメント", "プロジェクト知識のマネジメント"],
        "監視・コントロール": ["プロジェクト作業の監視・コントロール", "統合変更管理"],
        終結: ["プロジェクトやフェーズの終結"]
      },
      scope: {
        計画: ["スコープ・マネジメントの計画", "要求事項の収集", "スコープの定義", "WBSの作成"],
        "監視・コントロール": ["スコープの妥当性確認", "スコープのコントロール"]
      },
      schedule: {
        計画: [
          "スケジュール・マネジメントの計画",
          "アクティビティの定義",
          "アクティビティの順序設定",
          "アクティビティの所要期間見積り",
          "スケジュールの作成"
        ],
        "監視・コントロール": ["スケジュールのコントロール"]
      },
      cost: {
        計画: ["コスト・マネジメントの計画", "コストの見積り", "予算の設定"],
        "監視・コントロール": ["コストのコントロール"]
      },
      quality: {
        計画: ["品質マネジメントの計画"],
        実行: ["品質のマネジメント"],
        "監視・コントロール": ["品質のコントロール"]
      },
      resource: {
        計画: ["資源マネジメントの計画", "アクティビティ資源の見積り"],
        実行: ["資源の獲得", "チームの育成", "チームのマネジメント"],
        "監視・コントロール": ["資源のコントロール"]
      },
      communications: {
        計画: ["コミュニケーション・マネジメントの計画"],
        実行: ["コミュニケーションのマネジメント"],
        "監視・コントロール": ["コミュニケーションの監視"]
      },
      risk: {
        計画: [
          "リスク・マネジメントの計画",
          "リスクの特定",
          "定性的リスク分析",
          "定量的リスク分析",
          "リスク対応の計画"
        ],
        実行: ["リスク対応策の実行"],
        "監視・コントロール": ["リスクの監視"]
      },
      procurement: {
        計画: ["調達マネジメントの計画"],
        実行: ["調達の実行"],
        "監視・コントロール": ["調達のコントロール"]
      },
      stakeholder: {
        立上げ: ["ステークホルダーの特定"],
        計画: ["ステークホルダー・エンゲージメントの計画"],
        実行: ["ステークホルダー・エンゲージメントのマネジメント"],
        "監視・コントロール": ["ステークホルダー・エンゲージメントの監視"]
      }
    };
    const processDetails = {
      プロジェクト憲章の作成: {
        inputs: ["ビジネス文書", "合意書", "組織体の環境要因", "組織のプロセス資産"],
        tools: ["専門家の判断", "データ収集", "対人関係とチームに関するスキル", "会議"],
        outputs: ["プロジェクト憲章", "前提条件ログ"]
      }
      // 他のプロセスのITTOも同様に定義...
    };
    Object.entries(processData).forEach(([areaId, groups]) => {
      const area = knowledgeAreas.find((a) => a.id === areaId);
      Object.entries(groups).forEach(([group, processList]) => {
        processList.forEach((processName, index) => {
          processes.push({
            id: `${areaId}-${group}-${index}`,
            name: processName,
            knowledgeArea: area.name,
            knowledgeAreaId: areaId,
            processGroup: group,
            ...processDetails[processName] || { inputs: [], tools: [], outputs: [] }
          });
        });
      });
    });
    return processes;
  }, "getAllProcesses");
  const allProcesses = reactExports.useMemo(() => getAllProcesses(), []);
  const filteredProcesses = reactExports.useMemo(() => {
    let filtered = allProcesses;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.knowledgeAreaId === selectedCategory);
    }
    if (selectedGroup !== "all") {
      filtered = filtered.filter((p) => p.processGroup === selectedGroup);
    }
    if (studyMode === "random") {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    } else if (studyMode === "spaced") {
      filtered = [...filtered].sort((a, b) => {
        var _a, _b;
        const aIncorrect = ((_a = cardAnswers[a.id]) == null ? void 0 : _a.incorrect) || 0;
        const bIncorrect = ((_b = cardAnswers[b.id]) == null ? void 0 : _b.incorrect) || 0;
        return bIncorrect - aIncorrect;
      });
    }
    return filtered;
  }, [allProcesses, selectedCategory, selectedGroup, studyMode, cardAnswers]);
  reactExports.useEffect(() => {
    setSessionStats((prev) => ({
      ...prev,
      totalCards: filteredProcesses.length
    }));
    setCurrentCardIndex(0);
  }, [filteredProcesses]);
  const handleNext = /* @__PURE__ */ __name(() => {
    if (currentCardIndex < filteredProcesses.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  }, "handleNext");
  const handlePrevious = /* @__PURE__ */ __name(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  }, "handlePrevious");
  const handleAnswer = /* @__PURE__ */ __name((processId, isCorrect) => {
    setCardAnswers((prev) => {
      var _a, _b;
      return {
        ...prev,
        [processId]: {
          correct: (((_a = prev[processId]) == null ? void 0 : _a.correct) || 0) + (isCorrect ? 1 : 0),
          incorrect: (((_b = prev[processId]) == null ? void 0 : _b.incorrect) || 0) + (isCorrect ? 0 : 1),
          lastAnswered: Date.now()
        }
      };
    });
    setSessionStats((prev) => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1)
    }));
  }, "handleAnswer");
  const getSessionDuration = /* @__PURE__ */ __name(() => {
    const duration = Math.floor((Date.now() - sessionStats.startTime) / 1e3);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}分${seconds}秒`;
  }, "getSessionDuration");
  const getAccuracy = /* @__PURE__ */ __name(() => {
    const total = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    if (total === 0) {
      return 0;
    }
    return Math.round(sessionStats.correctAnswers / total * 100);
  }, "getAccuracy");
  const handleEndSession = /* @__PURE__ */ __name(() => {
    if (sessionStats.correctAnswers + sessionStats.incorrectAnswers > 0) {
      progressService.recordFlashCardSession({
        duration: Math.floor((Date.now() - sessionStats.startTime) / 1e3),
        totalCards: sessionStats.correctAnswers + sessionStats.incorrectAnswers,
        correctAnswers: sessionStats.correctAnswers,
        incorrectAnswers: sessionStats.incorrectAnswers,
        accuracy: getAccuracy(),
        category: selectedCategory,
        processGroup: selectedGroup,
        mode: studyMode
      });
    }
    navigate("/");
  }, "handleEndSession");
  if (filteredProcesses.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => navigate(-1), "onClick"),
          className: "mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            "戻る"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-white p-8 text-center shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "選択した条件に該当するカードがありません。" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => navigate(-1), "onClick"),
          className: "mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            "戻る"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-2xl font-bold text-gray-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-6 w-6 text-blue-600" }),
            "フラッシュカード学習"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-yellow-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "正解率: ",
                getAccuracy(),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                sessionStats.correctAnswers,
                " /",
                " ",
                sessionStats.correctAnswers + sessionStats.incorrectAnswers
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: getSessionDuration() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleEndSession,
                className: "flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
                  "終了"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium text-gray-700", children: "知識エリア" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "-input",
                value: selectedCategory,
                onChange: /* @__PURE__ */ __name((e) => setSelectedCategory(e.target.value), "onChange"),
                className: "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "すべて" }),
                  Object.entries(processCategories).map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium text-gray-700", children: "プロセス群" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "-input",
                value: selectedGroup,
                onChange: /* @__PURE__ */ __name((e) => setSelectedGroup(e.target.value), "onChange"),
                className: "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "すべて" }),
                  Object.entries(processGroups).map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium text-gray-700", children: "学習モード" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "-input",
                value: studyMode,
                onChange: /* @__PURE__ */ __name((e) => setStudyMode(e.target.value), "onChange"),
                className: "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sequential", children: "順番に学習" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "random", children: "ランダム" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "spaced", children: "間隔反復学習" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-flip-container", children: filteredProcesses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FlashCard$1,
      {
        process: filteredProcesses[currentCardIndex],
        onNext: handleNext,
        onPrevious: handlePrevious,
        onAnswer: handleAnswer,
        currentIndex: currentCardIndex,
        totalCards: filteredProcesses.length
      }
    ) })
  ] }) });
}, "FlashCardLearning");
const FlashCardLearning$1 = React.memo(FlashCardLearning);
export {
  FlashCardLearning$1 as default
};
