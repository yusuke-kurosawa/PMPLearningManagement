var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { m as mockUserStories } from "./backlogData-ClQ0VLoj.js";
import { aq as CheckCircle2, bh as Circle, bm as Split, t as Target, ba as Scale, aC as MessageSquare, bn as ThumbsUp, F as FileText } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const INVEST_CRITERIA = [
  { key: "independent", label: "Independent", description: "Can be developed independently" },
  { key: "negotiable", label: "Negotiable", description: "Details can be negotiated" },
  { key: "valuable", label: "Valuable", description: "Delivers value to users/stakeholders" },
  { key: "estimable", label: "Estimable", description: "Can be estimated by the team" },
  { key: "small", label: "Small", description: "Can be completed in one sprint" },
  { key: "testable", label: "Testable", description: "Has clear acceptance criteria" }
];
const SPLITTING_PATTERNS = [
  {
    pattern: "workflow-steps",
    label: "Workflow Steps",
    description: "Split by steps in a workflow",
    example: "Register → Verify Email → Complete Profile"
  },
  {
    pattern: "business-rules",
    label: "Business Rules",
    description: "Split by different business rules",
    example: "Basic user → Premium user → Enterprise user"
  },
  {
    pattern: "happy-sad-paths",
    label: "Happy/Sad Paths",
    description: "Split by success and error scenarios",
    example: "Success case → Error handling → Edge cases"
  },
  {
    pattern: "simple-complex",
    label: "Simple/Complex",
    description: "Start with simple version, add complexity",
    example: "Basic search → Advanced filters → AI suggestions"
  },
  {
    pattern: "data-variations",
    label: "Data Variations",
    description: "Split by data types or sources",
    example: "Text data → Images → Video → Files"
  },
  {
    pattern: "operations-crud",
    label: "CRUD Operations",
    description: "Split by Create, Read, Update, Delete",
    example: "View → Create → Edit → Delete"
  },
  {
    pattern: "defer-performance",
    label: "Defer Performance",
    description: "Start with working solution, optimize later",
    example: "Working solution → Performance optimization"
  },
  {
    pattern: "spike-implementation",
    label: "Spike + Implementation",
    description: "Research spike before implementation",
    example: "Technical spike → Implementation"
  }
];
const BacklogRefinementWorkshop = /* @__PURE__ */ __name(() => {
  const [selectedStory, setSelectedStory] = reactExports.useState(mockUserStories[0]);
  const [investChecks, setInvestChecks] = reactExports.useState({});
  const [readinessChecks, setReadinessChecks] = reactExports.useState({});
  const [selectedPattern, setSelectedPattern] = reactExports.useState(null);
  const [newAcceptanceCriteria, setNewAcceptanceCriteria] = reactExports.useState("");
  const [estimationVotes, setEstimationVotes] = reactExports.useState({});
  const readinessScore = useMemo(() => {
    if (!selectedStory) {
      return 0;
    }
    const checks = [
      selectedStory.description.length > 20,
      selectedStory.acceptanceCriteria.length >= 3,
      selectedStory.storyPoints !== void 0,
      selectedStory.priority !== void 0,
      selectedStory.dependencies.length === 0 || selectedStory.dependencies.every((d) => d !== ""),
      Object.values(investChecks).filter(Boolean).length >= 4
    ];
    return checks.filter(Boolean).length / checks.length * 100;
  }, [selectedStory, investChecks]);
  const investScore = useMemo(() => {
    const total = INVEST_CRITERIA.length;
    const checked = Object.values(investChecks).filter(Boolean).length;
    return checked / total * 100;
  }, [investChecks]);
  const toggleInvestCheck = /* @__PURE__ */ __name((key) => {
    setInvestChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, "toggleInvestCheck");
  const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21];
  const voteEstimation = /* @__PURE__ */ __name((memberId, points) => {
    setEstimationVotes((prev) => ({ ...prev, [memberId]: points }));
  }, "voteEstimation");
  const averageEstimation = useMemo(() => {
    const votes = Object.values(estimationVotes);
    if (votes.length === 0) {
      return 0;
    }
    return Math.round(votes.reduce((sum, v) => sum + v, 0) / votes.length);
  }, [estimationVotes]);
  if (!selectedStory) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900", children: "Backlog Refinement Workshop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Collaborative story refinement with INVEST criteria and Definition of Ready" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-4 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Select Story to Refine" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: selectedStory.id,
          onChange: /* @__PURE__ */ __name((e) => {
            const story = mockUserStories.find((s) => s.id === e.target.value);
            if (story) {
              setSelectedStory(story);
              setInvestChecks({});
              setEstimationVotes({});
            }
          }, "onChange"),
          className: "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none",
          children: mockUserStories.slice(0, 10).map((story) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: story.id, children: [
            story.title,
            " - ",
            story.status
          ] }, story.id))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-gray-900", children: selectedStory.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 rounded-lg bg-blue-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "As a" }),
            " ",
            selectedStory.asA,
            ",",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "I want" }),
            " ",
            selectedStory.iWant,
            ",",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "so that" }),
            " ",
            selectedStory.soThat
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: selectedStory.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "INVEST Criteria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
                investScore.toFixed(0),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Score" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: INVEST_CRITERIA.map((criterion) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => toggleInvestCheck(criterion.key), "onClick"),
                    className: "mt-0.5 flex-shrink-0",
                    children: investChecks[criterion.key] ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-6 w-6 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-6 w-6 text-gray-400" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-gray-900", children: criterion.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: criterion.description })
                ] })
              ]
            },
            criterion.key
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Acceptance Criteria" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 space-y-2", children: selectedStory.acceptanceCriteria.map((ac) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-start gap-3 rounded-lg border border-gray-200 p-3",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: ac.completed, readOnly: true, className: "mt-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm text-gray-700", children: ac.description })
              ]
            },
            ac.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Add new acceptance criterion...",
                value: newAcceptanceCriteria,
                onChange: /* @__PURE__ */ __name((e) => setNewAcceptanceCriteria(e.target.value), "onChange"),
                className: "flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Add" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Split, { className: "h-5 w-5 text-purple-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Story Splitting Patterns" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-gray-600", children: "If the story is too large, use these patterns to split it into smaller stories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: SPLITTING_PATTERNS.map((pattern) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setSelectedPattern(pattern.pattern), "onClick"),
              className: `rounded-lg border-2 p-4 text-left transition-colors ${selectedPattern === pattern.pattern ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-semibold text-gray-900", children: pattern.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs text-gray-600", children: pattern.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-purple-700", children: [
                  "Example: ",
                  pattern.example
                ] })
              ]
            },
            pattern.pattern
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "Definition of Ready" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 text-5xl font-bold", children: [
            readinessScore.toFixed(0),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-2 rounded-full bg-white transition-all",
              style: { width: `${readinessScore}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectedStory.description.length > 20 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "Clear description"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectedStory.acceptanceCriteria.length >= 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "Acceptance criteria (3+)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectedStory.storyPoints ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "Story points estimated"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectedStory.priority ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "Priority assigned"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              selectedStory.dependencies.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "No blocking dependencies"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              investScore >= 66 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
              "INVEST criteria met"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-5 w-5 text-orange-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Planning Poker" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-gray-600", children: "Team members vote on story point estimation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 grid grid-cols-4 gap-2", children: fibonacciSequence.map((points) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => voteEstimation("currentUser", points), "onClick"),
              className: `rounded-lg border-2 py-3 font-bold transition-colors ${estimationVotes["currentUser"] === points ? "border-orange-600 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"}`,
              children: points
            },
            points
          )) }),
          Object.keys(estimationVotes).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-orange-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold text-gray-700", children: "Team Votes:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex gap-2", children: Object.values(estimationVotes).map((vote, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "rounded bg-orange-200 px-2 py-1 text-sm font-bold text-orange-800",
                children: vote
              },
              i
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Consensus Estimate:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-orange-700", children: [
                averageEstimation,
                " points"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Discussion Notes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              placeholder: "Add refinement discussion notes...",
              rows: 6,
              className: "w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-5 w-5" }),
            "Mark as Ready for Sprint"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }),
            "Create Technical Spike"
          ] })
        ] })
      ] })
    ] })
  ] }) });
}, "BacklogRefinementWorkshop");
export {
  BacklogRefinementWorkshop,
  BacklogRefinementWorkshop as default
};
