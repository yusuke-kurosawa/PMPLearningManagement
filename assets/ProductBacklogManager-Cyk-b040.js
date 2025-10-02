var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { m as mockUserStories, a as mockEpics } from "./backlogData-ClQ0VLoj.js";
import { S as Search, aU as Filter, ay as List, aG as ChevronUp, a4 as ChevronDown, am as Tag, a3 as Star, T as TrendingUp, s as Users, aw as AlertCircle, c as Clock, aC as MessageSquare, ab as PenLine, bj as Copy, bk as Move, aE as Trash2, t as Target } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const ProductBacklogManager = /* @__PURE__ */ __name(() => {
  const [stories, setStories] = reactExports.useState(mockUserStories);
  const [epics] = reactExports.useState(mockEpics);
  const [selectedEpic, setSelectedEpic] = reactExports.useState("all");
  const [selectedPriority, setSelectedPriority] = reactExports.useState("all");
  const [selectedStatus, setSelectedStatus] = reactExports.useState("all");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [sortField, setSortField] = reactExports.useState("priority");
  const [sortDirection, setSortDirection] = reactExports.useState("desc");
  const [viewMode, setViewMode] = reactExports.useState("list");
  const [selectedStory, setSelectedStory] = reactExports.useState(null);
  const [draggedStory, setDraggedStory] = reactExports.useState(null);
  const getPriorityScore = /* @__PURE__ */ __name((priority) => {
    const scores = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return scores[priority];
  }, "getPriorityScore");
  const getValueScore = /* @__PURE__ */ __name((story) => {
    return story.businessValue + story.userValue;
  }, "getValueScore");
  const filteredStories = reactExports.useMemo(() => {
    return stories.filter((story) => {
      const matchesEpic = selectedEpic === "all" || story.epicId === selectedEpic;
      const matchesPriority = selectedPriority === "all" || story.priority === selectedPriority;
      const matchesStatus = selectedStatus === "all" || story.status === selectedStatus;
      const matchesSearch = searchQuery === "" || story.title.toLowerCase().includes(searchQuery.toLowerCase()) || story.description.toLowerCase().includes(searchQuery.toLowerCase()) || story.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesEpic && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [stories, selectedEpic, selectedPriority, selectedStatus, searchQuery]);
  const sortedStories = reactExports.useMemo(() => {
    const sorted = [...filteredStories].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "priority":
          comparison = getPriorityScore(b.priority) - getPriorityScore(a.priority);
          break;
        case "value":
          comparison = getValueScore(b) - getValueScore(a);
          break;
        case "effort":
          comparison = a.effort - b.effort;
          break;
        case "votes":
          comparison = b.votes - a.votes;
          break;
        case "created":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? -comparison : comparison;
    });
    return sorted;
  }, [filteredStories, sortField, sortDirection]);
  const handleSort = /* @__PURE__ */ __name((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }, "handleSort");
  const handleDragStart = /* @__PURE__ */ __name((storyId) => {
    setDraggedStory(storyId);
  }, "handleDragStart");
  const handleDragOver = /* @__PURE__ */ __name((e) => {
    e.preventDefault();
  }, "handleDragOver");
  const handleDrop = /* @__PURE__ */ __name((targetStoryId) => {
    if (!draggedStory || draggedStory === targetStoryId) {
      return;
    }
    const newStories = [...stories];
    const draggedIndex = newStories.findIndex((s) => s.id === draggedStory);
    const targetIndex = newStories.findIndex((s) => s.id === targetStoryId);
    const [removed] = newStories.splice(draggedIndex, 1);
    newStories.splice(targetIndex, 0, removed);
    setStories(newStories);
    setDraggedStory(null);
  }, "handleDrop");
  const getPriorityColor = /* @__PURE__ */ __name((priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-800 border-red-300",
      High: "bg-orange-100 text-orange-800 border-orange-300",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Low: "bg-green-100 text-green-800 border-green-300"
    };
    return colors[priority];
  }, "getPriorityColor");
  const getStatusColor = /* @__PURE__ */ __name((status) => {
    const colors = {
      New: "bg-gray-100 text-gray-800",
      Refined: "bg-blue-100 text-blue-800",
      Ready: "bg-green-100 text-green-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Review: "bg-yellow-100 text-yellow-800",
      Done: "bg-emerald-100 text-emerald-800",
      Blocked: "bg-red-100 text-red-800"
    };
    return colors[status];
  }, "getStatusColor");
  const getEpic = /* @__PURE__ */ __name((epicId) => {
    return epics.find((e) => e.id === epicId);
  }, "getEpic");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900", children: "Product Backlog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Prioritized list of work items for PMP Learning Management System" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 grid gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search stories, tags, descriptions...",
              value: searchQuery,
              onChange: /* @__PURE__ */ __name((e) => setSearchQuery(e.target.value), "onChange"),
              className: "w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedEpic,
            onChange: /* @__PURE__ */ __name((e) => setSelectedEpic(e.target.value), "onChange"),
            className: "rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Epics" }),
              epics.map((epic) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: epic.id, children: epic.title }, epic.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedPriority,
            onChange: /* @__PURE__ */ __name((e) => setSelectedPriority(e.target.value), "onChange"),
            className: "rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Priorities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Critical", children: "Critical" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", children: "High" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", children: "Medium" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", children: "Low" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Status:" }),
          ["all", "New", "Refined", "Ready", "In Progress", "Blocked"].map(
            (status) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setSelectedStatus(status), "onClick"),
                className: `rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                children: status === "all" ? "All" : status
              },
              status
            )
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
          "Showing ",
          sortedStories.length,
          " of ",
          stories.length,
          " stories"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-5 w-5 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Sort by:" }),
      [
        { field: "priority", label: "Priority" },
        { field: "value", label: "Value" },
        { field: "effort", label: "Effort" },
        { field: "votes", label: "Votes" },
        { field: "created", label: "Created" }
      ].map(({ field, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => handleSort(field), "onClick"),
          className: `flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition-colors ${sortField === field ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: [
            label,
            sortField === field && (sortDirection === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }))
          ]
        },
        field
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sortedStories.map((story, index) => {
      const epic = getEpic(story.epicId);
      const valueScore = getValueScore(story);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          draggable: true,
          onDragStart: /* @__PURE__ */ __name(() => handleDragStart(story.id), "onDragStart"),
          onDragOver: handleDragOver,
          onDrop: /* @__PURE__ */ __name(() => handleDrop(story.id), "onDrop"),
          onClick: /* @__PURE__ */ __name(() => setSelectedStory(story), "onClick"),
          className: `cursor-move rounded-lg bg-white p-5 shadow transition-shadow hover:shadow-lg ${draggedStory === story.id ? "opacity-50" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-500", children: [
                    "#",
                    index + 1
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `rounded border px-2 py-0.5 text-xs font-semibold ${getPriorityColor(
                        story.priority
                      )}`,
                      children: story.priority
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `rounded px-2 py-0.5 text-xs font-semibold ${getStatusColor(story.status)}`,
                      children: story.status
                    }
                  ),
                  story.storyPoints && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800", children: [
                    story.storyPoints,
                    " pts"
                  ] }),
                  epic && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800", children: epic.title })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold text-gray-900", children: story.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-gray-700", children: story.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 rounded-lg bg-blue-50 p-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "As a" }),
                  " ",
                  story.asA,
                  ",",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "I want" }),
                  " ",
                  story.iWant,
                  ",",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "so that" }),
                  " ",
                  story.soThat
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 text-xs font-semibold text-gray-700", children: [
                    "Acceptance Criteria (",
                    story.acceptanceCriteria.filter((ac) => ac.completed).length,
                    "/",
                    story.acceptanceCriteria.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    story.acceptanceCriteria.slice(0, 2).map((ac) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-xs text-gray-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: ac.completed,
                          readOnly: true,
                          className: "mt-0.5"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ac.description })
                    ] }, ac.id)),
                    story.acceptanceCriteria.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                      "+",
                      story.acceptanceCriteria.length - 2,
                      " more criteria..."
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: story.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3 w-3" }),
                      tag
                    ]
                  },
                  tag
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4 flex flex-col items-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1 text-xs text-gray-500", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
                    "Value"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-blue-600", children: [
                    valueScore,
                    "/20"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1 text-xs text-gray-500", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                    "Effort"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold text-orange-600", children: [
                    story.effort,
                    "/10"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 rounded bg-purple-50 px-2 py-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-purple-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-purple-700", children: story.votes })
                ] }),
                story.dependencies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-amber-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-4 w-4" }),
                  story.dependencies.length,
                  " deps"
                ] }),
                story.blockers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-red-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-4 w-4" }),
                  story.blockers.length,
                  " blockers"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                  "Created ",
                  new Date(story.createdAt).toLocaleDateString()
                ] }),
                story.assignee && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  "Assigned"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }),
                  story.comments.length
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Move, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] })
            ] })
          ]
        },
        story.id
      );
    }) }),
    sortedStories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-12 text-center shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold text-gray-900", children: "No stories found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Try adjusting your filters or create a new story" })
    ] })
  ] }) });
}, "ProductBacklogManager");
export {
  ProductBacklogManager,
  ProductBacklogManager as default
};
