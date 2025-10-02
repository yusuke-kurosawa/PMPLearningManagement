var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { m as mockUserStories, a as mockEpics, d as mockVelocityData } from "./backlogData-ClQ0VLoj.js";
import { t as Target, aq as CheckCircle2, I as Activity, aw as AlertCircle, Z as Zap, a3 as Star, v as BarChart3, bb as PieChart, T as TrendingUp, E as DollarSign } from "./lucide-icons-B7slfWYt.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, e as Bar, j as PieChart$1, k as Pie, l as Cell, h as LineChart, g as Line, S as ScatterChart, Z as ZAxis, m as Scatter } from "./recharts-D6bUNjjp.js";
import "./vendor-iUsVqwEv.js";
import "./d3-core-DnNGvVRC.js";
const ProductOwnerDashboard = /* @__PURE__ */ __name(() => {
  const backlogMetrics = reactExports.useMemo(() => {
    const total = mockUserStories.length;
    const byStatus = {
      new: mockUserStories.filter((s) => s.status === "New").length,
      refined: mockUserStories.filter((s) => s.status === "Refined").length,
      ready: mockUserStories.filter((s) => s.status === "Ready").length,
      inProgress: mockUserStories.filter((s) => s.status === "In Progress").length,
      done: mockUserStories.filter((s) => s.status === "Done").length,
      blocked: mockUserStories.filter((s) => s.status === "Blocked").length
    };
    const totalPoints = mockUserStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const avgPoints = totalPoints / mockUserStories.filter((s) => s.storyPoints).length;
    const totalBusinessValue = mockUserStories.reduce((sum, s) => sum + s.businessValue, 0);
    const totalUserValue = mockUserStories.reduce((sum, s) => sum + s.userValue, 0);
    const refinementRate = (byStatus.refined + byStatus.ready) / total * 100;
    return {
      total,
      byStatus,
      totalPoints,
      avgPoints,
      totalBusinessValue,
      totalUserValue,
      refinementRate
    };
  }, []);
  const epicProgressData = reactExports.useMemo(() => {
    return mockEpics.map((epic) => {
      const epicStories = mockUserStories.filter((s) => s.epicId === epic.id);
      const completedStories = epicStories.filter((s) => s.status === "Done").length;
      const totalStories = epicStories.length;
      const progress = totalStories > 0 ? completedStories / totalStories * 100 : 0;
      return {
        name: epic.title.substring(0, 25) + "...",
        completed: completedStories,
        total: totalStories,
        progress,
        businessValue: epic.businessValue
      };
    });
  }, []);
  const statusDistribution = reactExports.useMemo(() => {
    return [
      { name: "New", value: backlogMetrics.byStatus.new, color: "#9ca3af" },
      { name: "Refined", value: backlogMetrics.byStatus.refined, color: "#3b82f6" },
      { name: "Ready", value: backlogMetrics.byStatus.ready, color: "#10b981" },
      { name: "In Progress", value: backlogMetrics.byStatus.inProgress, color: "#8b5cf6" },
      { name: "Done", value: backlogMetrics.byStatus.done, color: "#059669" },
      { name: "Blocked", value: backlogMetrics.byStatus.blocked, color: "#ef4444" }
    ].filter((item) => item.value > 0);
  }, [backlogMetrics]);
  const priorityDistribution = reactExports.useMemo(() => {
    return [
      {
        name: "Critical",
        value: mockUserStories.filter((s) => s.priority === "Critical").length,
        color: "#ef4444"
      },
      {
        name: "High",
        value: mockUserStories.filter((s) => s.priority === "High").length,
        color: "#f97316"
      },
      {
        name: "Medium",
        value: mockUserStories.filter((s) => s.priority === "Medium").length,
        color: "#eab308"
      },
      {
        name: "Low",
        value: mockUserStories.filter((s) => s.priority === "Low").length,
        color: "#22c55e"
      }
    ];
  }, []);
  const valueEffortData = reactExports.useMemo(() => {
    return mockUserStories.slice(0, 30).map((story) => ({
      name: story.title.substring(0, 20),
      value: story.businessValue + story.userValue,
      effort: story.effort,
      points: story.storyPoints || 5
    }));
  }, []);
  const roiData = reactExports.useMemo(() => {
    return mockEpics.map((epic) => {
      const epicStories = mockUserStories.filter((s) => s.epicId === epic.id);
      const totalValue = epicStories.reduce((sum, s) => sum + s.businessValue + s.userValue, 0);
      const totalEffort = epicStories.reduce((sum, s) => sum + s.effort, 0);
      const roi = totalEffort > 0 ? totalValue / totalEffort * 100 : 0;
      return {
        name: epic.title.substring(0, 20),
        value: totalValue,
        effort: totalEffort,
        roi: roi.toFixed(1),
        category: epic.category
      };
    });
  }, []);
  const healthIndicators = reactExports.useMemo(() => {
    const readyForSprint = mockUserStories.filter((s) => s.status === "Ready").length;
    const blockedItems = mockUserStories.filter((s) => s.blockers.length > 0).length;
    const dependenciesIssues = mockUserStories.filter((s) => s.dependencies.length > 3).length;
    const oldStories = mockUserStories.filter((s) => {
      const daysSinceCreation = (Date.now() - new Date(s.createdAt).getTime()) / (1e3 * 60 * 60 * 24);
      return daysSinceCreation > 90 && s.status === "New";
    }).length;
    return {
      readyForSprint,
      blockedItems,
      dependenciesIssues,
      oldStories,
      refinementRate: backlogMetrics.refinementRate
    };
  }, [backlogMetrics]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1800px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900", children: "Product Owner Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Backlog health, value delivery tracking, and strategic metrics" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid gap-4 md:grid-cols-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
          "Total Stories"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-gray-900", children: backlogMetrics.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
          backlogMetrics.totalPoints,
          " points"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Ready Stories"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: backlogMetrics.byStatus.ready }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "For next sprint" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
          "In Progress"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-purple-600", children: backlogMetrics.byStatus.inProgress }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Active work" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-4 w-4" }),
          "Blocked"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: healthIndicators.blockedItems }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Need attention" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
          "Refinement Rate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
          backlogMetrics.refinementRate.toFixed(0),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Stories refined" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }),
          "Avg Story Points"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-indigo-600", children: backlogMetrics.avgPoints.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Per story" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Epic Progress" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: epicProgressData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            XAxis,
            {
              dataKey: "name",
              tick: { fontSize: 11 },
              angle: -45,
              textAnchor: "end",
              height: 100
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "completed", fill: "#10b981", name: "Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "total", fill: "#e5e7eb", name: "Total" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PieChart, { className: "h-5 w-5 text-purple-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Story Status Distribution" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart$1, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pie,
            {
              data: statusDistribution,
              cx: "50%",
              cy: "50%",
              labelLine: false,
              label: /* @__PURE__ */ __name(({ name, value }) => `${name}: ${value}`, "label"),
              outerRadius: 100,
              fill: "#8884d8",
              dataKey: "value",
              children: statusDistribution.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-green-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Velocity Trend" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: mockVelocityData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "sprintName", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { label: { value: "Story Points", angle: -90, position: "insideLeft" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Line,
            {
              type: "monotone",
              dataKey: "committed",
              stroke: "#3b82f6",
              strokeWidth: 2,
              name: "Committed"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Line,
            {
              type: "monotone",
              dataKey: "completed",
              stroke: "#10b981",
              strokeWidth: 2,
              name: "Completed"
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-orange-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Priority Distribution" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: priorityDistribution.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", style: { color: item.color }, children: [
              item.value,
              " stories"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-3 rounded-full transition-all",
              style: {
                width: `${item.value / backlogMetrics.total * 100}%`,
                backgroundColor: item.color
              }
            }
          ) })
        ] }, item.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-white p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-green-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Value vs Effort Analysis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: "(Top 30 stories)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 400, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ScatterChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          XAxis,
          {
            type: "number",
            dataKey: "effort",
            name: "Effort",
            label: { value: "Effort", position: "insideBottom", offset: -5 },
            domain: [0, 10]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            type: "number",
            dataKey: "value",
            name: "Value",
            label: { value: "Value", angle: -90, position: "insideLeft" },
            domain: [0, 20]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZAxis, { type: "number", dataKey: "points", range: [50, 400], name: "Story Points" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: { strokeDasharray: "3 3" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scatter, { data: valueEffortData, fill: "#3b82f6" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-green-800", children: "High Value, Low Effort (Quick Wins)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-green-700", children: "Prioritize these stories first" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-blue-800", children: "High Value, High Effort (Major Projects)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-blue-700", children: "Strategic investments" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-yellow-50 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-yellow-800", children: "Low Value, Low Effort (Fill-ins)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-yellow-700", children: "Quick wins but lower impact" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-red-800", children: "Low Value, High Effort (Avoid)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-700", children: "Reconsider or eliminate" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-white p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-emerald-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "ROI Projections by Epic" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b-2 border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-left text-sm font-semibold text-gray-700", children: "Epic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-left text-sm font-semibold text-gray-700", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-right text-sm font-semibold text-gray-700", children: "Total Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-right text-sm font-semibold text-gray-700", children: "Total Effort" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-right text-sm font-semibold text-gray-700", children: "ROI %" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: roiData.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi)).map((epic, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-sm text-gray-900", children: epic.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800", children: epic.category }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right text-sm font-semibold text-gray-900", children: epic.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right text-sm text-gray-700", children: epic.effort }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `rounded px-2 py-1 text-sm font-bold ${parseFloat(epic.roi) > 200 ? "bg-green-100 text-green-800" : parseFloat(epic.roi) > 150 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`,
              children: [
                epic.roi,
                "%"
              ]
            }
          ) })
        ] }, index)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-white p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Backlog Health Alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        healthIndicators.readyForSprint < 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-amber-900", children: "Low Ready Story Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-800", children: [
            "Only ",
            healthIndicators.readyForSprint,
            " stories ready for next sprint. Recommend having 15-20."
          ] })
        ] }),
        healthIndicators.blockedItems > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-l-4 border-red-500 bg-red-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-red-900", children: "High Blocker Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-red-800", children: [
            healthIndicators.blockedItems,
            " stories are blocked. Address impediments immediately."
          ] })
        ] }),
        healthIndicators.oldStories > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-purple-900", children: "Stale Stories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-purple-800", children: [
            healthIndicators.oldStories,
            " stories are over 90 days old. Review and update or remove."
          ] })
        ] }),
        healthIndicators.refinementRate < 60 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-blue-900", children: "Low Refinement Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-800", children: [
            "Only ",
            healthIndicators.refinementRate.toFixed(0),
            "% of stories are refined. Schedule refinement sessions."
          ] })
        ] })
      ] })
    ] })
  ] }) });
}, "ProductOwnerDashboard");
export {
  ProductOwnerDashboard,
  ProductOwnerDashboard as default
};
