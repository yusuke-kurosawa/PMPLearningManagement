var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { aW as ZoomOut, aV as ZoomIn, al as Maximize2, D as Download, s as Users, q as Shield, n as BookOpen, z as Database, Z as Zap, u as GitBranch, o as Brain, aR as Code, aL as Info, A as ArrowRight } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
const BusinessContextDiagram = /* @__PURE__ */ __name(() => {
  const [zoom, setZoom] = reactExports.useState(1);
  const [pan, setPan] = reactExports.useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = reactExports.useState(null);
  const [hoveredElement, setHoveredElement] = reactExports.useState(null);
  const svgRef = reactExports.useRef(null);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [dragStart, setDragStart] = reactExports.useState({ x: 0, y: 0 });
  const actors = [
    {
      id: "learner",
      name: "PMP Learner",
      type: "user",
      icon: Users,
      description: "Primary user studying for PMP certification",
      color: "#3B82F6",
      position: { x: 100, y: 200 }
    },
    {
      id: "admin",
      name: "Administrator",
      type: "user",
      icon: Shield,
      description: "System administrator managing content and users",
      color: "#EF4444",
      position: { x: 100, y: 350 }
    },
    {
      id: "mentor",
      name: "Mentor",
      type: "user",
      icon: BookOpen,
      description: "Expert providing guidance to learners",
      color: "#10B981",
      position: { x: 100, y: 500 }
    }
  ];
  const externalSystems = [
    {
      id: "supabase",
      name: "Supabase",
      type: "system",
      icon: Database,
      description: "Authentication & database backend",
      color: "#3ECF8E",
      position: { x: 900, y: 150 }
    },
    {
      id: "upstash",
      name: "Upstash Redis",
      type: "system",
      icon: Zap,
      description: "Serverless caching layer",
      color: "#00E9A3",
      position: { x: 900, y: 300 }
    },
    {
      id: "github",
      name: "GitHub Pages",
      type: "system",
      icon: GitBranch,
      description: "Static site hosting & deployment",
      color: "#24292E",
      position: { x: 900, y: 450 }
    },
    {
      id: "context7",
      name: "Context7 MCP",
      type: "service",
      icon: Brain,
      description: "Documentation & library context",
      color: "#8B5CF6",
      position: { x: 900, y: 600 }
    },
    {
      id: "serena",
      name: "Serena MCP",
      type: "service",
      icon: Code,
      description: "Code analysis & semantic search",
      color: "#EC4899",
      position: { x: 900, y: 750 }
    }
  ];
  const subsystems = [
    {
      id: "frontend",
      name: "Frontend Layer",
      description: "React PWA with interactive UI",
      technologies: ["React 18", "TypeScript", "Tailwind CSS", "Vite"],
      color: "#3B82F6",
      position: { x: 300, y: 100 },
      width: 250,
      height: 120
    },
    {
      id: "learning",
      name: "Learning Modules",
      description: "Core learning functionality",
      technologies: ["PMBOK Data", "Progress Tracking", "Flashcards", "Mock Exams"],
      color: "#10B981",
      position: { x: 300, y: 250 },
      width: 250,
      height: 120
    },
    {
      id: "visualization",
      name: "Visualization Engine",
      description: "Data visualization components",
      technologies: ["D3.js", "Force Graphs", "Heatmaps", "Sankey Diagrams"],
      color: "#F59E0B",
      position: { x: 300, y: 400 },
      width: 250,
      height: 120
    },
    {
      id: "collaboration",
      name: "Collaboration Hub",
      description: "Social learning features",
      technologies: ["Study Groups", "Shared Notes", "Discussions", "Mentorship"],
      color: "#8B5CF6",
      position: { x: 300, y: 550 },
      width: 250,
      height: 120
    },
    {
      id: "ai",
      name: "AI Coaching",
      description: "Intelligent learning assistance",
      technologies: ["AI Coach", "Project Simulator", "Adaptive Learning"],
      color: "#EC4899",
      position: { x: 300, y: 700 },
      width: 250,
      height: 120
    },
    {
      id: "services",
      name: "Service Layer",
      description: "Business logic & data management",
      technologies: ["Context Manager", "Progress Service", "Auth Service", "Export/Import"],
      color: "#6366F1",
      position: { x: 600, y: 250 },
      width: 250,
      height: 180
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      description: "Deployment & monitoring",
      technologies: ["GitHub Actions", "IDD Workflow", "PWA Service Worker"],
      color: "#64748B",
      position: { x: 600, y: 470 },
      width: 250,
      height: 120
    },
    {
      id: "security",
      name: "Security Layer",
      description: "Authentication & authorization",
      technologies: ["JWT", "RBAC", "OAuth", "Session Management"],
      color: "#DC2626",
      position: { x: 600, y: 630 },
      width: 250,
      height: 120
    }
  ];
  const dataFlows = [
    // User to Frontend
    { id: "flow1", from: "learner", to: "frontend", label: "User Interactions", type: "data" },
    { id: "flow2", from: "admin", to: "frontend", label: "Admin Actions", type: "data" },
    { id: "flow3", from: "mentor", to: "frontend", label: "Mentorship", type: "data" },
    // Frontend to Learning Modules
    { id: "flow4", from: "frontend", to: "learning", label: "Learning Requests", type: "data" },
    { id: "flow5", from: "frontend", to: "visualization", label: "Viz Requests", type: "data" },
    { id: "flow6", from: "frontend", to: "collaboration", label: "Social Actions", type: "data" },
    { id: "flow7", from: "frontend", to: "ai", label: "AI Queries", type: "api" },
    // Internal module connections
    { id: "flow8", from: "learning", to: "services", label: "Progress Updates", type: "data" },
    { id: "flow9", from: "collaboration", to: "services", label: "Data Sync", type: "data" },
    { id: "flow10", from: "ai", to: "services", label: "Learning Analytics", type: "data" },
    { id: "flow11", from: "visualization", to: "services", label: "Data Queries", type: "data" },
    // Services to external systems
    {
      id: "flow12",
      from: "services",
      to: "supabase",
      label: "Data Persistence",
      type: "data",
      bidirectional: true
    },
    {
      id: "flow13",
      from: "services",
      to: "upstash",
      label: "Caching",
      type: "cache",
      bidirectional: true
    },
    // Security layer
    {
      id: "flow14",
      from: "frontend",
      to: "security",
      label: "Auth Requests",
      type: "auth"
    },
    {
      id: "flow15",
      from: "security",
      to: "supabase",
      label: "Auth Verification",
      type: "auth",
      bidirectional: true
    },
    // Infrastructure
    {
      id: "flow16",
      from: "infrastructure",
      to: "github",
      label: "CI/CD Deploy",
      type: "deploy"
    },
    // MCP services
    {
      id: "flow17",
      from: "services",
      to: "context7",
      label: "Doc Context",
      type: "api"
    },
    {
      id: "flow18",
      from: "services",
      to: "serena",
      label: "Code Analysis",
      type: "api"
    }
  ];
  const handleZoomIn = /* @__PURE__ */ __name(() => setZoom(Math.min(zoom + 0.2, 3)), "handleZoomIn");
  const handleZoomOut = /* @__PURE__ */ __name(() => setZoom(Math.max(zoom - 0.2, 0.5)), "handleZoomOut");
  const handleResetView = /* @__PURE__ */ __name(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, "handleResetView");
  const handleMouseDown = /* @__PURE__ */ __name((e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, "handleMouseDown");
  const handleMouseMove = /* @__PURE__ */ __name((e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, "handleMouseMove");
  const handleMouseUp = /* @__PURE__ */ __name(() => {
    setIsDragging(false);
  }, "handleMouseUp");
  const handleExport = /* @__PURE__ */ __name(() => {
    if (!svgRef.current) {
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = 1200;
    canvas.height = 900;
    img.onload = () => {
      ctx == null ? void 0 : ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "pmp-business-context-diagram.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, "handleExport");
  const renderActor = /* @__PURE__ */ __name((actor) => {
    const Icon = actor.icon;
    const isSelected = selectedElement === actor.id;
    const isHovered = hoveredElement === actor.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "g",
      {
        transform: `translate(${actor.position.x}, ${actor.position.y})`,
        onMouseEnter: /* @__PURE__ */ __name(() => setHoveredElement(actor.id), "onMouseEnter"),
        onMouseLeave: /* @__PURE__ */ __name(() => setHoveredElement(null), "onMouseLeave"),
        onClick: /* @__PURE__ */ __name(() => setSelectedElement(actor.id), "onClick"),
        className: "cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "43", r: "35", fill: "rgba(0,0,0,0.1)", filter: "blur(3px)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: "40",
              cy: "40",
              r: "35",
              fill: isSelected || isHovered ? actor.color : "white",
              stroke: actor.color,
              strokeWidth: isSelected ? 4 : 2,
              className: "transition-all duration-200"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("foreignObject", { x: "15", y: "15", width: "50", height: "50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              size: 24,
              color: isSelected || isHovered ? "white" : actor.color,
              strokeWidth: 2
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "40", y: "95", textAnchor: "middle", className: "text-sm font-semibold", fill: "#1F2937", children: actor.name }),
          isHovered && /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(40, -30)", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "-80", y: "-25", width: "160", height: "40", rx: "6", fill: "#1F2937", opacity: "0.95" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "0", y: "-5", textAnchor: "middle", className: "text-xs", fill: "white", children: actor.description })
          ] })
        ]
      },
      actor.id
    );
  }, "renderActor");
  const renderSubsystem = /* @__PURE__ */ __name((subsystem) => {
    const isSelected = selectedElement === subsystem.id;
    const isHovered = hoveredElement === subsystem.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "g",
      {
        transform: `translate(${subsystem.position.x}, ${subsystem.position.y})`,
        onMouseEnter: /* @__PURE__ */ __name(() => setHoveredElement(subsystem.id), "onMouseEnter"),
        onMouseLeave: /* @__PURE__ */ __name(() => setHoveredElement(null), "onMouseLeave"),
        onClick: /* @__PURE__ */ __name(() => setSelectedElement(subsystem.id), "onClick"),
        className: "cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "rect",
            {
              x: "3",
              y: "3",
              width: subsystem.width,
              height: subsystem.height,
              rx: "8",
              fill: "rgba(0,0,0,0.1)",
              filter: "blur(3px)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "rect",
            {
              x: "0",
              y: "0",
              width: subsystem.width,
              height: subsystem.height,
              rx: "8",
              fill: "white",
              stroke: subsystem.color,
              strokeWidth: isSelected ? 3 : 2,
              className: "transition-all duration-200"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "rect",
            {
              x: "0",
              y: "0",
              width: subsystem.width,
              height: "35",
              rx: "8",
              fill: subsystem.color,
              opacity: isHovered ? 1 : 0.9
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: subsystem.width / 2,
              y: "23",
              textAnchor: "middle",
              className: "text-sm font-bold",
              fill: "white",
              children: subsystem.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "10", y: "55", className: "text-xs", fill: "#4B5563", children: subsystem.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("foreignObject", { x: "10", y: "70", width: subsystem.width - 20, height: subsystem.height - 80, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: subsystem.technologies.map((tech, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700", children: tech }, i)) }) })
        ]
      },
      subsystem.id
    );
  }, "renderSubsystem");
  const renderDataFlow = /* @__PURE__ */ __name((flow) => {
    const allElements = [...actors, ...externalSystems, ...subsystems];
    const source = allElements.find((e) => e.id === flow.from);
    const target = allElements.find((e) => e.id === flow.to);
    if (!source || !target) {
      return null;
    }
    const sourcePos = "width" in source ? { x: source.position.x + source.width / 2, y: source.position.y + source.height / 2 } : { x: source.position.x + 40, y: source.position.y + 40 };
    const targetPos = "width" in target ? { x: target.position.x + target.width / 2, y: target.position.y + target.height / 2 } : { x: target.position.x + 40, y: target.position.y + 40 };
    const colors = {
      data: "#3B82F6",
      auth: "#EF4444",
      api: "#8B5CF6",
      cache: "#10B981",
      deploy: "#F59E0B"
    };
    const color = colors[flow.type];
    const isHovered = hoveredElement === flow.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "g",
      {
        onMouseEnter: /* @__PURE__ */ __name(() => setHoveredElement(flow.id), "onMouseEnter"),
        onMouseLeave: /* @__PURE__ */ __name(() => setHoveredElement(null), "onMouseLeave"),
        className: "cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: sourcePos.x,
              y1: sourcePos.y,
              x2: targetPos.x,
              y2: targetPos.y,
              stroke: color,
              strokeWidth: isHovered ? 3 : 2,
              strokeDasharray: flow.type === "api" ? "5,5" : "none",
              markerEnd: `url(#arrowhead-${flow.type})`,
              opacity: isHovered ? 1 : 0.6,
              className: "transition-all duration-200"
            }
          ),
          flow.bidirectional && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: sourcePos.x,
              y1: sourcePos.y,
              x2: targetPos.x,
              y2: targetPos.y,
              stroke: color,
              strokeWidth: isHovered ? 3 : 2,
              markerStart: `url(#arrowhead-${flow.type})`,
              opacity: 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "rect",
            {
              x: (sourcePos.x + targetPos.x) / 2 - 50,
              y: (sourcePos.y + targetPos.y) / 2 - 12,
              width: "100",
              height: "24",
              rx: "4",
              fill: "white",
              stroke: color,
              strokeWidth: "1",
              opacity: isHovered ? 1 : 0.8
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: (sourcePos.x + targetPos.x) / 2,
              y: (sourcePos.y + targetPos.y) / 2 + 4,
              textAnchor: "middle",
              className: "text-xs font-medium",
              fill: color,
              children: flow.label
            }
          )
        ]
      },
      flow.id
    );
  }, "renderDataFlow");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full w-full flex-col bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-gray-200 bg-white px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Business Context Diagram" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "PMP Learning Management System - Architecture Overview" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleZoomOut, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 text-sm font-medium", children: [
          Math.round(zoom * 100),
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleZoomIn, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleResetView, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleExport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
          "Export"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "svg",
        {
          ref: svgRef,
          width: "100%",
          height: "100%",
          className: "bg-white",
          onMouseDown: handleMouseDown,
          onMouseMove: handleMouseMove,
          onMouseUp: handleMouseUp,
          onMouseLeave: handleMouseUp,
          style: { cursor: isDragging ? "grabbing" : "grab" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: Object.entries({
              data: "#3B82F6",
              auth: "#EF4444",
              api: "#8B5CF6",
              cache: "#10B981",
              deploy: "#F59E0B"
            }).map(([type, color]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "marker",
              {
                id: `arrowhead-${type}`,
                markerWidth: "10",
                markerHeight: "10",
                refX: "9",
                refY: "3",
                orient: "auto",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "0 0, 10 3, 0 6", fill: color })
              },
              type
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "rect",
                {
                  x: "280",
                  y: "80",
                  width: "590",
                  height: "690",
                  rx: "12",
                  fill: "none",
                  stroke: "#9CA3AF",
                  strokeWidth: "2",
                  strokeDasharray: "10,5"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "575", y: "60", textAnchor: "middle", className: "text-lg font-bold", fill: "#4B5563", children: "PMP Learning Management System" }),
              dataFlows.map(renderDataFlow),
              subsystems.map(renderSubsystem),
              [...actors, ...externalSystems].map(renderActor)
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "absolute bottom-4 right-4 w-64 p-4 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
          "Legend"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded-full border-2 border-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Users" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded border-2 border-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subsystems" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Data Flow" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Authentication" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-4 border-t-2 border-dashed border-purple-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "API Call" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Caching" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Deployment" })
          ] })
        ] })
      ] }),
      selectedElement && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "absolute left-4 top-4 w-80 p-4 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Element Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setSelectedElement(null), "onClick"),
              className: "text-gray-400 hover:text-gray-600",
              children: "✕"
            }
          )
        ] }),
        (() => {
          const element = [...actors, ...externalSystems, ...subsystems].find(
            (e) => e.id === selectedElement
          );
          if (!element) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: "mb-2",
                  style: { borderColor: element.color },
                  children: "type" in element ? element.type : "subsystem"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold", children: element.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "description" in element ? element.description : "" })
            ] }),
            "technologies" in element && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-xs font-semibold text-gray-700", children: "Technologies:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: element.technologies.map((tech, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: tech }, i)) })
            ] })
          ] });
        })()
      ] })
    ] })
  ] });
}, "BusinessContextDiagram");
export {
  BusinessContextDiagram as default
};
