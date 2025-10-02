var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { b as mockSprints, m as mockUserStories, c as mockTeamMembers } from "./backlogData-ClQ0VLoj.js";
import { t as Target, aq as CheckCircle2, c as Clock, a7 as Calendar, ai as AlertTriangle, bl as TrendingDown, s as Users, ae as Plus, I as Activity } from "./lucide-icons-B7slfWYt.js";
import { R as ResponsiveContainer, h as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, g as Line } from "./recharts-D6bUNjjp.js";
import "./vendor-iUsVqwEv.js";
import "./d3-core-DnNGvVRC.js";
const SprintBacklogBoard = /* @__PURE__ */ __name(() => {
  const [selectedSprint, setSelectedSprint] = reactExports.useState(mockSprints[0]);
  const [showBurndown, setShowBurndown] = reactExports.useState(true);
  const sprintStories = reactExports.useMemo(() => {
    return mockUserStories.filter((story) => selectedSprint.storyIds.includes(story.id));
  }, [selectedSprint]);
  const [tasks, setTasks] = reactExports.useState([
    {
      id: "task1",
      storyId: "story1",
      title: "Set up tRPC router configuration",
      description: "Configure tRPC with authentication middleware",
      status: "In Progress",
      assignee: "tm3",
      estimatedHours: 8,
      actualHours: 5,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-22T15:30:00Z"
    },
    {
      id: "task2",
      storyId: "story1",
      title: "Create API endpoints for user management",
      description: "Implement CRUD operations for users",
      status: "To Do",
      assignee: "tm3",
      estimatedHours: 12,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-20T10:00:00Z"
    },
    {
      id: "task3",
      storyId: "story1",
      title: "Add error handling middleware",
      description: "Global error handling and validation",
      status: "To Do",
      assignee: "tm7",
      estimatedHours: 6,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-20T10:00:00Z"
    },
    {
      id: "task4",
      storyId: "story2",
      title: "Design Prisma schema",
      description: "Create database schema for all entities",
      status: "Done",
      assignee: "tm3",
      estimatedHours: 8,
      actualHours: 7,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-21T16:00:00Z"
    },
    {
      id: "task5",
      storyId: "story2",
      title: "Create migration scripts",
      description: "Generate and test migration scripts",
      status: "In Progress",
      assignee: "tm3",
      estimatedHours: 4,
      actualHours: 3,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-22T11:00:00Z"
    },
    {
      id: "task6",
      storyId: "story2",
      title: "Add seed data",
      description: "Create seed data for development",
      status: "Review",
      assignee: "tm7",
      estimatedHours: 3,
      actualHours: 3,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-22T14:00:00Z"
    },
    {
      id: "task7",
      storyId: "story3",
      title: "Implement JWT token generation",
      description: "Create JWT auth service",
      status: "To Do",
      assignee: "tm4",
      estimatedHours: 6,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-20T10:00:00Z"
    },
    {
      id: "task8",
      storyId: "story3",
      title: "Add refresh token mechanism",
      description: "Implement token refresh flow",
      status: "To Do",
      assignee: "tm4",
      estimatedHours: 4,
      createdAt: "2025-09-20T10:00:00Z",
      updatedAt: "2025-09-20T10:00:00Z"
    }
  ]);
  const burndownData = reactExports.useMemo(() => {
    const sprintStart = new Date(selectedSprint.startDate);
    const sprintEnd = new Date(selectedSprint.endDate);
    const totalDays = Math.ceil(
      (sprintEnd.getTime() - sprintStart.getTime()) / (1e3 * 60 * 60 * 24)
    );
    const data = [];
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(sprintStart.getTime() + i * 24 * 60 * 60 * 1e3);
      const ideal = selectedSprint.commitment * (1 - i / totalDays);
      const actual = i <= 2 ? selectedSprint.commitment - i * 2 : selectedSprint.commitment - i * 2 - Math.random() * 3;
      data.push({
        day: `Day ${i + 1}`,
        date: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ideal: Math.max(0, ideal),
        actual: Math.max(0, actual)
      });
    }
    return data;
  }, [selectedSprint]);
  const sprintMetrics = reactExports.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;
    const donePoints = sprintStories.filter((s) => s.status === "Done").reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const remainingPoints = selectedSprint.commitment - donePoints;
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      remainingPoints,
      donePoints
    };
  }, [tasks, sprintStories, selectedSprint]);
  const getTasksByStatus = /* @__PURE__ */ __name((status) => {
    return tasks.filter((task) => task.status === status);
  }, "getTasksByStatus");
  const getTeamMemberName = /* @__PURE__ */ __name((id) => {
    if (!id) {
      return "Unassigned";
    }
    const member = mockTeamMembers.find((m) => m.id === id);
    return member ? member.name : "Unknown";
  }, "getTeamMemberName");
  const getStoryForTask = /* @__PURE__ */ __name((task) => {
    return sprintStories.find((s) => s.id === task.storyId);
  }, "getStoryForTask");
  const handleDragStart = /* @__PURE__ */ __name((e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  }, "handleDragStart");
  const handleDragOver = /* @__PURE__ */ __name((e) => {
    e.preventDefault();
  }, "handleDragOver");
  const handleDrop = /* @__PURE__ */ __name((e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setTasks(
      (prevTasks) => prevTasks.map(
        (task) => task.id === taskId ? { ...task, status: newStatus, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : task
      )
    );
  }, "handleDrop");
  const columns = [
    {
      status: "To Do",
      color: "bg-gray-100 border-gray-300",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-gray-600" })
    },
    {
      status: "In Progress",
      color: "bg-blue-100 border-blue-300",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5 text-blue-600" })
    },
    {
      status: "Review",
      color: "bg-yellow-100 border-yellow-300",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" })
    },
    {
      status: "Done",
      color: "bg-green-100 border-green-300",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-5 w-5 text-green-600" })
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1800px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900", children: selectedSprint.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: selectedSprint.goal })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: selectedSprint.id,
          onChange: /* @__PURE__ */ __name((e) => {
            const sprint = mockSprints.find((s) => s.id === e.target.value);
            if (sprint) {
              setSelectedSprint(sprint);
            }
          }, "onChange"),
          className: "rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none",
          children: mockSprints.map((sprint) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: sprint.id, children: sprint.name }, sprint.id))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid gap-4 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
          "Sprint Progress"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [
          sprintMetrics.donePoints,
          "/",
          selectedSprint.commitment
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Story Points" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-2 rounded-full bg-blue-600 transition-all",
            style: {
              width: `${sprintMetrics.donePoints / selectedSprint.commitment * 100}%`
            }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
          "Tasks Completed"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [
          sprintMetrics.completedTasks,
          "/",
          sprintMetrics.totalTasks
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
          sprintMetrics.completionRate.toFixed(1),
          "% Complete"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
          "Time Spent"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [
          sprintMetrics.totalActualHours,
          "/",
          sprintMetrics.totalEstimatedHours,
          "h"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Actual vs Estimated" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          "Sprint Duration"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-gray-900", children: [
          new Date(selectedSprint.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }),
          " ",
          "-",
          " ",
          new Date(selectedSprint.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "2 weeks" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
          "Impediments"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-600", children: selectedSprint.impediments.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Active Blockers" })
      ] })
    ] }),
    showBurndown && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-5 w-5 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Sprint Burndown Chart" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setShowBurndown(false), "onClick"),
            className: "text-sm text-gray-600 hover:text-gray-800",
            children: "Hide Chart"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: burndownData, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            label: {
              value: "Story Points",
              angle: -90,
              position: "insideLeft",
              fontSize: 12
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "ideal",
            stroke: "#9ca3af",
            strokeWidth: 2,
            name: "Ideal",
            strokeDasharray: "5 5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "actual",
            stroke: "#3b82f6",
            strokeWidth: 2,
            name: "Actual"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-4", children: columns.map(({ status, color, icon }) => {
      const columnTasks = getTasksByStatus(status);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-3 rounded-lg border-2 p-3 ${color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            icon,
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-white px-2 py-0.5 text-sm font-semibold", children: columnTasks.length })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex-1 space-y-3",
            onDragOver: handleDragOver,
            onDrop: /* @__PURE__ */ __name((e) => handleDrop(e, status), "onDrop"),
            children: [
              columnTasks.map((task) => {
                const story = getStoryForTask(task);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    draggable: true,
                    onDragStart: /* @__PURE__ */ __name((e) => handleDragStart(e, task.id), "onDragStart"),
                    className: "cursor-move rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-lg",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
                        story && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 text-xs font-medium text-blue-600", children: [
                          story.title.substring(0, 30),
                          "..."
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900", children: task.title })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-gray-600", children: task.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                            task.actualHours || 0,
                            "h / ",
                            task.estimatedHours,
                            "h"
                          ] }),
                          (story == null ? void 0 : story.storyPoints) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800", children: [
                            story.storyPoints,
                            " pts"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3 text-gray-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: getTeamMemberName(task.assignee) })
                        ] }),
                        task.actualHours && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: "h-1.5 rounded-full bg-blue-600 transition-all",
                            style: {
                              width: `${Math.min(100, task.actualHours / task.estimatedHours * 100)}%`
                            }
                          }
                        ) })
                      ] })
                    ]
                  },
                  task.id
                );
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                "Add Task"
              ] })
            ]
          }
        )
      ] }, status);
    }) }),
    selectedSprint.impediments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-red-50 p-6 shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-red-900", children: "Active Impediments" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: selectedSprint.impediments.map((impediment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `rounded px-2 py-1 text-xs font-semibold ${impediment.severity === "High" ? "bg-red-100 text-red-800" : impediment.severity === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`,
              children: impediment.severity
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
            "Reported by ",
            getTeamMemberName(impediment.reportedBy)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: impediment.description })
      ] }, impediment.id)) })
    ] })
  ] }) });
}, "SprintBacklogBoard");
export {
  SprintBacklogBoard,
  SprintBacklogBoard as default
};
