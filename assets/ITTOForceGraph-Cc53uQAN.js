var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, v as useNavigate, R as React, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { g as glossaryService } from "./glossaryService-DZ07_k-f.js";
import { G as GlossaryDialog } from "./GlossaryDialog-C_TOA3GO.js";
import { G as select, H as zoom, I as simulation, J as link, K as manyBody, L as center, M as collide, N as drag, O as identity } from "./d3-core-DnNGvVRC.js";
import { X, a0 as Menu, aU as Filter, aV as ZoomIn, aW as ZoomOut, j as RotateCcw } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
const useD3ForceSimulation = /* @__PURE__ */ __name((svgRef, nodes, links, config, callbacks) => {
  const simulationRef = reactExports.useRef(null);
  const zoomRef = reactExports.useRef(null);
  const renderSimulation = reactExports.useCallback(() => {
    if (!svgRef.current || nodes.length === 0) {
      return;
    }
    const {
      width,
      height,
      nodeRadius = 25,
      linkDistance = 100,
      chargeStrength = -300,
      collisionRadius = 30
    } = config;
    select(svgRef.current).selectAll("*").remove();
    const svg = select(svgRef.current).attr("viewBox", [0, 0, width, height]);
    const container = svg.append("g").attr("class", "simulation-container");
    const zoom$1 = zoom().scaleExtent([0.1, 4]).on("zoom", (event) => {
      container.attr("transform", event.transform.toString());
    });
    svg.call(zoom$1);
    zoomRef.current = zoom$1;
    const defs = svg.append("defs");
    defs.selectAll("marker").data(["arrow"]).join("marker").attr("id", "arrow").attr("viewBox", "0 -5 10 10").attr("refX", nodeRadius + 5).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("fill", "#999").attr("d", "M0,-5L10,0L0,5");
    const simulation$1 = simulation(nodes).force(
      "link",
      link(links).id((d) => d.id).distance(linkDistance)
    ).force("charge", manyBody().strength(chargeStrength)).force("center", center(width / 2, height / 2)).force("collision", collide().radius(collisionRadius));
    simulationRef.current = simulation$1;
    const linkSelection = container.append("g").attr("class", "links").selectAll("line").data(links).join("line").attr("stroke", (d) => {
      var _a, _b;
      return ((_b = (_a = callbacks == null ? void 0 : callbacks.onLinkStyle) == null ? void 0 : _a.call(callbacks, d)) == null ? void 0 : _b.stroke) || "#999";
    }).attr("stroke-opacity", 0.6).attr("stroke-width", (d) => {
      var _a, _b;
      return ((_b = (_a = callbacks == null ? void 0 : callbacks.onLinkStyle) == null ? void 0 : _a.call(callbacks, d)) == null ? void 0 : _b.strokeWidth) || 2;
    }).attr("stroke-dasharray", (d) => {
      var _a, _b;
      return ((_b = (_a = callbacks == null ? void 0 : callbacks.onLinkStyle) == null ? void 0 : _a.call(callbacks, d)) == null ? void 0 : _b.strokeDasharray) || "0";
    }).attr("marker-end", "url(#arrow)");
    const nodeSelection = container.append("g").attr("class", "nodes").selectAll("g").data(nodes).join("g").attr("class", "node").style("cursor", "pointer").call(createDragBehavior(simulation$1));
    nodeSelection.each(function(d) {
      var _a;
      const nodeGroup = select(this);
      if (callbacks == null ? void 0 : callbacks.onNodeShape) {
        callbacks.onNodeShape(d, nodeGroup);
      } else {
        nodeGroup.append("circle").attr("r", nodeRadius).attr("fill", ((_a = callbacks == null ? void 0 : callbacks.getNodeColor) == null ? void 0 : _a.call(callbacks, d)) || "#3B82F6");
      }
    });
    nodeSelection.append("text").text((d) => {
      var _a;
      return ((_a = callbacks == null ? void 0 : callbacks.getNodeLabel) == null ? void 0 : _a.call(callbacks, d)) || d.name;
    }).attr("x", 0).attr("y", nodeRadius + 15).attr("text-anchor", "middle").attr("class", "node-label").style("font-size", "12px").style("pointer-events", "none").style("user-select", "none");
    nodeSelection.append("title").text((d) => {
      if (d.type === "process") {
        return `${d.name}
プロセス群: ${d.group || "N/A"}
知識エリア: ${d.area || "N/A"}`;
      }
      return d.name;
    });
    if (callbacks == null ? void 0 : callbacks.onNodeClick) {
      nodeSelection.on("click", (event, d) => {
        event.stopPropagation();
        callbacks.onNodeClick(event, d);
      });
    }
    simulation$1.on("tick", () => {
      linkSelection.attr("x1", (d) => d.source.x ?? 0).attr("y1", (d) => d.source.y ?? 0).attr("x2", (d) => d.target.x ?? 0).attr("y2", (d) => d.target.y ?? 0);
      nodeSelection.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });
  }, [nodes, links, config, svgRef]);
  const createDragBehavior = reactExports.useCallback((simulation2) => {
    const dragStarted = /* @__PURE__ */ __name((event, d) => {
      if (!event.active) {
        simulation2.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    }, "dragStarted");
    const dragged = /* @__PURE__ */ __name((event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    }, "dragged");
    const dragEnded = /* @__PURE__ */ __name((event, d) => {
      if (!event.active) {
        simulation2.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }, "dragEnded");
    return drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded);
  }, []);
  const zoomIn = reactExports.useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  }, [svgRef]);
  const zoomOut = reactExports.useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  }, [svgRef]);
  const resetZoom = reactExports.useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, identity);
    }
  }, [svgRef]);
  const restartSimulation = reactExports.useCallback(() => {
    var _a;
    (_a = simulationRef.current) == null ? void 0 : _a.alpha(1).restart();
  }, []);
  const stopSimulation = reactExports.useCallback(() => {
    var _a;
    (_a = simulationRef.current) == null ? void 0 : _a.stop();
  }, []);
  const highlightConnectedNodes = reactExports.useCallback(
    (nodeId) => {
      if (!svgRef.current) {
        return;
      }
      const connectedNodes = /* @__PURE__ */ new Set([nodeId]);
      links.forEach((link2) => {
        const sourceId = typeof link2.source === "string" ? link2.source : link2.source.id;
        const targetId = typeof link2.target === "string" ? link2.target : link2.target.id;
        if (sourceId === nodeId) {
          connectedNodes.add(targetId);
        }
        if (targetId === nodeId) {
          connectedNodes.add(sourceId);
        }
      });
      const svg = select(svgRef.current);
      svg.selectAll(".node").style("opacity", (d) => connectedNodes.has(d.id) ? 1 : 0.3);
      svg.selectAll(".links line").style("opacity", (d) => {
        const sourceId = typeof d.source === "string" ? d.source : d.source.id;
        const targetId = typeof d.target === "string" ? d.target : d.target.id;
        return sourceId === nodeId || targetId === nodeId ? 1 : 0.1;
      });
    },
    [links, svgRef]
  );
  const clearHighlight = reactExports.useCallback(() => {
    if (!svgRef.current) {
      return;
    }
    const svg = select(svgRef.current);
    svg.selectAll(".node").style("opacity", 1);
    svg.selectAll(".links line").style("opacity", 0.6);
  }, [svgRef]);
  reactExports.useEffect(() => {
    renderSimulation();
    return () => {
      var _a;
      (_a = simulationRef.current) == null ? void 0 : _a.stop();
    };
  }, [renderSimulation]);
  return {
    zoomIn,
    zoomOut,
    resetZoom,
    restartSimulation,
    stopSimulation,
    highlightConnectedNodes,
    clearHighlight
  };
}, "useD3ForceSimulation");
function useWindowSize() {
  const [windowSize, setWindowSize] = reactExports.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768
  });
  reactExports.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    __name(handleResize, "handleResize");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}
__name(useWindowSize, "useWindowSize");
const PROCESS_GROUPS = ["立ち上げ", "計画", "実行", "監視・コントロール", "終結"];
const KNOWLEDGE_AREAS = [
  "統合",
  "スコープ",
  "スケジュール",
  "コスト",
  "品質",
  "資源",
  "コミュニケーション",
  "リスク",
  "調達",
  "ステークホルダー"
];
const KNOWLEDGE_AREA_COLORS = {
  統合: "#8B5CF6",
  スコープ: "#3B82F6",
  スケジュール: "#06B6D4",
  コスト: "#10B981",
  品質: "#F59E0B",
  資源: "#EF4444",
  コミュニケーション: "#EC4899",
  リスク: "#6366F1",
  調達: "#84CC16",
  ステークホルダー: "#F97316"
};
const NODE_TYPE_COLORS = {
  process: /* @__PURE__ */ __name((area) => KNOWLEDGE_AREA_COLORS[area] || "#gray", "process"),
  input: "#3B82F6",
  tool: "#10B981",
  output: "#F59E0B"
};
const MOBILE_BREAKPOINT = 768;
const Legend = reactExports.memo(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 md:mb-6", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold md:text-base", children: "凡例" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-xs md:space-y-2 md:text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-4 w-4 flex-shrink-0 rounded-full bg-blue-500 md:h-6 md:w-6",
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "プロセス（知識エリア別）" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-4 w-4 flex-shrink-0 rotate-45 transform bg-blue-500 md:h-6 md:w-6",
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "インプット" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 flex-shrink-0 bg-green-500 md:h-6 md:w-6", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ツールと技法" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-0 w-0 flex-shrink-0 border-b-[14px] border-l-[8px] border-r-[8px] border-b-amber-500 border-l-transparent border-r-transparent md:border-b-[20px] md:border-l-[12px] md:border-r-[12px]",
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "アウトプット" })
    ] })
  ] })
] }));
Legend.displayName = "Legend";
const FilterSection = reactExports.memo(({ selectedFilters, onFilterChange }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 md:mb-6", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 flex items-center gap-2 text-sm font-semibold md:text-base", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-3 w-3 md:h-4 md:w-4", "aria-hidden": "true" }),
    "フィルター"
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "mb-3 md:mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-2 text-xs font-medium md:text-sm", children: "プロセス群" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: PROCESS_GROUPS.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: "flex cursor-pointer items-center gap-2 rounded p-1 text-xs hover:bg-gray-50 md:text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: selectedFilters.processGroups.includes(group),
              onChange: /* @__PURE__ */ __name(() => onFilterChange("processGroups", group), "onChange"),
              className: "h-3 w-3 rounded md:h-4 md:w-4",
              "aria-label": `${group}プロセス群をフィルタリング`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: group })
        ]
      },
      group
    )) })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-2 text-xs font-medium md:text-sm", children: "知識エリア" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: KNOWLEDGE_AREAS.map((area) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: "flex cursor-pointer items-center gap-2 rounded p-1 text-xs hover:bg-gray-50 md:text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: selectedFilters.knowledgeAreas.includes(area),
              onChange: /* @__PURE__ */ __name(() => onFilterChange("knowledgeAreas", area), "onChange"),
              className: "h-3 w-3 rounded md:h-4 md:w-4",
              "aria-label": `${area}知識エリアをフィルタリング`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 md:gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-2 w-2 flex-shrink-0 rounded-full md:h-3 md:w-3",
                style: { backgroundColor: KNOWLEDGE_AREA_COLORS[area] },
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: area })
          ] })
        ]
      },
      area
    )) })
  ] })
] }));
FilterSection.displayName = "FilterSection";
const ZoomControls = reactExports.memo(({ onZoomIn, onZoomOut, onReset, isMobile }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 md:pt-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold md:text-base", children: "コントロール" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onZoomIn,
        className: "flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm",
        "aria-label": "グラフを拡大",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-3 w-3 md:h-4 md:w-4", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "拡大" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onZoomOut,
        className: "flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm",
        "aria-label": "グラフを縮小",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "h-3 w-3 md:h-4 md:w-4", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "縮小" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onReset,
        className: "flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm",
        "aria-label": "ズームをリセット",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3 md:h-4 md:w-4", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "リセット" })
        ]
      }
    )
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-gray-600", children: [
    "• ノードを",
    isMobile ? "タッチ" : "クリック",
    "してフォーカス",
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "• ノードをドラッグして位置変更",
    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
    "• ",
    isMobile ? "ピンチでズーム、ドラッグでパン" : "スクロールでズーム、ドラッグでパン"
  ] })
] }));
ZoomControls.displayName = "ZoomControls";
const useGraphData = /* @__PURE__ */ __name(() => {
  const [graphData, setGraphData] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const data = {
        nodes: [
          // Integration Management Processes
          {
            id: "p1",
            name: "プロジェクト憲章の作成",
            type: "process",
            group: "立ち上げ",
            area: "統合"
          },
          {
            id: "p2",
            name: "プロジェクトマネジメント計画書の作成",
            type: "process",
            group: "計画",
            area: "統合"
          },
          {
            id: "p3",
            name: "プロジェクト作業の指揮・マネジメント",
            type: "process",
            group: "実行",
            area: "統合"
          },
          {
            id: "p4",
            name: "プロジェクト知識のマネジメント",
            type: "process",
            group: "実行",
            area: "統合"
          },
          {
            id: "p5",
            name: "プロジェクト作業の監視・コントロール",
            type: "process",
            group: "監視・コントロール",
            area: "統合"
          },
          {
            id: "p6",
            name: "統合変更管理",
            type: "process",
            group: "監視・コントロール",
            area: "統合"
          },
          {
            id: "p7",
            name: "プロジェクトやフェーズの終結",
            type: "process",
            group: "終結",
            area: "統合"
          },
          // Scope Management Processes
          {
            id: "p8",
            name: "スコープ・マネジメントの計画",
            type: "process",
            group: "計画",
            area: "スコープ"
          },
          { id: "p9", name: "要求事項の収集", type: "process", group: "計画", area: "スコープ" },
          { id: "p10", name: "スコープの定義", type: "process", group: "計画", area: "スコープ" },
          { id: "p11", name: "WBSの作成", type: "process", group: "計画", area: "スコープ" },
          {
            id: "p12",
            name: "スコープの妥当性確認",
            type: "process",
            group: "監視・コントロール",
            area: "スコープ"
          },
          {
            id: "p13",
            name: "スコープのコントロール",
            type: "process",
            group: "監視・コントロール",
            area: "スコープ"
          },
          // Stakeholder Management Processes
          {
            id: "p14",
            name: "ステークホルダーの特定",
            type: "process",
            group: "立ち上げ",
            area: "ステークホルダー"
          },
          {
            id: "p15",
            name: "ステークホルダー・エンゲージメントの計画",
            type: "process",
            group: "計画",
            area: "ステークホルダー"
          },
          {
            id: "p16",
            name: "ステークホルダー・エンゲージメントのマネジメント",
            type: "process",
            group: "実行",
            area: "ステークホルダー"
          },
          {
            id: "p17",
            name: "ステークホルダー・エンゲージメントの監視",
            type: "process",
            group: "監視・コントロール",
            area: "ステークホルダー"
          },
          // Key Inputs
          { id: "i1", name: "ビジネス文書", type: "input" },
          { id: "i2", name: "合意書", type: "input" },
          { id: "i3", name: "組織体の環境要因", type: "input" },
          { id: "i4", name: "組織のプロセス資産", type: "input" },
          { id: "i5", name: "プロジェクト憲章", type: "input" },
          { id: "i6", name: "プロジェクトマネジメント計画書", type: "input" },
          { id: "i7", name: "プロジェクト文書", type: "input" },
          { id: "i8", name: "作業パフォーマンス・データ", type: "input" },
          { id: "i9", name: "作業パフォーマンス報告書", type: "input" },
          { id: "i10", name: "変更要求", type: "input" },
          // Key Tools
          { id: "t1", name: "専門家の判断", type: "tool" },
          { id: "t2", name: "データ収集", type: "tool" },
          { id: "t3", name: "データ分析", type: "tool" },
          { id: "t4", name: "意思決定", type: "tool" },
          { id: "t5", name: "会議", type: "tool" },
          { id: "t6", name: "人間関係とチームに関するスキル", type: "tool" },
          { id: "t7", name: "プロジェクトマネジメント情報システム", type: "tool" },
          { id: "t8", name: "要素分解", type: "tool" },
          // Key Outputs
          { id: "o1", name: "プロジェクト憲章", type: "output" },
          { id: "o2", name: "プロジェクトマネジメント計画書", type: "output" },
          { id: "o3", name: "成果物", type: "output" },
          { id: "o4", name: "作業パフォーマンス・データ", type: "output" },
          { id: "o5", name: "作業パフォーマンス報告書", type: "output" },
          { id: "o6", name: "変更要求", type: "output" },
          { id: "o7", name: "プロジェクト文書更新版", type: "output" },
          { id: "o8", name: "ステークホルダー登録簿", type: "output" },
          { id: "o9", name: "要求事項文書", type: "output" },
          { id: "o10", name: "スコープ・ベースライン", type: "output" }
        ],
        links: [
          // Develop Project Charter
          { source: "i1", target: "p1", type: "input" },
          { source: "i2", target: "p1", type: "input" },
          { source: "t1", target: "p1", type: "tool" },
          { source: "t2", target: "p1", type: "tool" },
          { source: "p1", target: "o1", type: "output" },
          // Identify Stakeholders
          { source: "i1", target: "p14", type: "input" },
          { source: "i5", target: "p14", type: "input" },
          { source: "t1", target: "p14", type: "tool" },
          { source: "t2", target: "p14", type: "tool" },
          { source: "p14", target: "o8", type: "output" },
          // Develop Project Management Plan
          { source: "i5", target: "p2", type: "input" },
          { source: "i3", target: "p2", type: "input" },
          { source: "t1", target: "p2", type: "tool" },
          { source: "t5", target: "p2", type: "tool" },
          { source: "p2", target: "o2", type: "output" },
          // Direct and Manage Project Work
          { source: "i6", target: "p3", type: "input" },
          { source: "i7", target: "p3", type: "input" },
          { source: "t1", target: "p3", type: "tool" },
          { source: "t7", target: "p3", type: "tool" },
          { source: "p3", target: "o3", type: "output" },
          { source: "p3", target: "o4", type: "output" },
          { source: "p3", target: "o6", type: "output" },
          // Collect Requirements
          { source: "i5", target: "p9", type: "input" },
          { source: "i6", target: "p9", type: "input" },
          { source: "o8", target: "p9", type: "input" },
          { source: "t1", target: "p9", type: "tool" },
          { source: "t2", target: "p9", type: "tool" },
          { source: "t6", target: "p9", type: "tool" },
          { source: "p9", target: "o9", type: "output" },
          // Define Scope
          { source: "i5", target: "p10", type: "input" },
          { source: "i6", target: "p10", type: "input" },
          { source: "o9", target: "p10", type: "input" },
          { source: "t1", target: "p10", type: "tool" },
          { source: "t3", target: "p10", type: "tool" },
          { source: "p10", target: "o10", type: "output" },
          // Create WBS
          { source: "i6", target: "p11", type: "input" },
          { source: "o10", target: "p11", type: "input" },
          { source: "t1", target: "p11", type: "tool" },
          { source: "t8", target: "p11", type: "tool" },
          { source: "p11", target: "o10", type: "output" },
          // Process interconnections
          { source: "o1", target: "i5", type: "flow" },
          { source: "o2", target: "i6", type: "flow" },
          { source: "o4", target: "i8", type: "flow" },
          { source: "o5", target: "i9", type: "flow" },
          { source: "o6", target: "i10", type: "flow" }
        ]
      };
      setGraphData(data);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  return { graphData, isLoading };
}, "useGraphData");
const ITTOForceGraph = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  const svgRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [selectedFilters, setSelectedFilters] = reactExports.useState({
    processGroups: [],
    knowledgeAreas: []
  });
  const [focusedNode, setFocusedNode] = reactExports.useState(null);
  const [isPanelOpen, setIsPanelOpen] = reactExports.useState(true);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = reactExports.useState(null);
  const { graphData, isLoading } = useGraphData();
  const { width, height } = useWindowSize();
  const isMobile = width <= MOBILE_BREAKPOINT;
  const nodeRadius = isMobile ? 15 : 25;
  const { filteredNodes, filteredLinks } = reactExports.useMemo(() => {
    if (!graphData) {
      return { filteredNodes: [], filteredLinks: [] };
    }
    let nodes = [...graphData.nodes];
    let links = [...graphData.links];
    if (selectedFilters.processGroups.length > 0 || selectedFilters.knowledgeAreas.length > 0) {
      const processNodeIds = new Set(
        graphData.nodes.filter(
          (n) => n.type === "process" && (selectedFilters.processGroups.length === 0 || selectedFilters.processGroups.includes(n.group)) && (selectedFilters.knowledgeAreas.length === 0 || selectedFilters.knowledgeAreas.includes(n.area))
        ).map((n) => n.id)
      );
      const relatedNodeIds = new Set(processNodeIds);
      graphData.links.forEach((link2) => {
        const sourceId = typeof link2.source === "string" ? link2.source : link2.source.id;
        const targetId = typeof link2.target === "string" ? link2.target : link2.target.id;
        if (processNodeIds.has(sourceId) || processNodeIds.has(targetId)) {
          relatedNodeIds.add(sourceId);
          relatedNodeIds.add(targetId);
        }
      });
      nodes = graphData.nodes.filter((n) => relatedNodeIds.has(n.id));
      links = graphData.links.filter((l) => {
        const sourceId = typeof l.source === "string" ? l.source : l.source.id;
        const targetId = typeof l.target === "string" ? l.target : l.target.id;
        return relatedNodeIds.has(sourceId) && relatedNodeIds.has(targetId);
      });
    }
    return { filteredNodes: nodes, filteredLinks: links };
  }, [graphData, selectedFilters]);
  const simulationConfig = reactExports.useMemo(
    () => {
      var _a, _b;
      return {
        width: ((_a = containerRef.current) == null ? void 0 : _a.clientWidth) || 1200,
        height: ((_b = containerRef.current) == null ? void 0 : _b.clientHeight) || 800,
        nodeRadius,
        linkDistance: isMobile ? 60 : 100,
        chargeStrength: isMobile ? -200 : -300,
        collisionRadius: nodeRadius + 5
      };
    },
    [nodeRadius, isMobile]
  );
  const renderCallbacks = reactExports.useMemo(
    () => ({
      onNodeClick: /* @__PURE__ */ __name((event, node) => {
        setFocusedNode(node.id);
        const term = glossaryService.getTermByName(node.name);
        if (term) {
          setSelectedGlossaryTerm(term);
        }
        simulationControls.highlightConnectedNodes(node.id);
      }, "onNodeClick"),
      onNodeShape: /* @__PURE__ */ __name((node, nodeGroup) => {
        if (node.type === "process") {
          nodeGroup.append("circle").attr("r", nodeRadius).attr("fill", NODE_TYPE_COLORS.process(node.area || ""));
        } else if (node.type === "input") {
          const size = nodeRadius * 1.6;
          nodeGroup.append("rect").attr("width", size).attr("height", size).attr("x", -size / 2).attr("y", -size / 2).attr("transform", "rotate(45)").attr("fill", NODE_TYPE_COLORS.input);
        } else if (node.type === "tool") {
          const size = nodeRadius * 1.6;
          nodeGroup.append("rect").attr("width", size).attr("height", size).attr("x", -size / 2).attr("y", -size / 2).attr("fill", NODE_TYPE_COLORS.tool);
        } else if (node.type === "output") {
          const scale = nodeRadius / 25;
          nodeGroup.append("polygon").attr(
            "points",
            `0,${-25 * scale} ${22 * scale},${12 * scale} ${-22 * scale},${12 * scale}`
          ).attr("fill", NODE_TYPE_COLORS.output);
        }
      }, "onNodeShape"),
      onLinkStyle: /* @__PURE__ */ __name((link2) => ({
        stroke: "#999",
        strokeWidth: link2.type === "flow" ? 3 : 2,
        strokeDasharray: link2.type === "flow" ? "5,5" : "0"
      }), "onLinkStyle"),
      getNodeLabel: /* @__PURE__ */ __name((node) => {
        if (isMobile && node.name.length > 15) {
          return node.name.substring(0, 15) + "...";
        }
        return node.name;
      }, "getNodeLabel")
    }),
    [nodeRadius, isMobile]
  );
  const simulationControls = useD3ForceSimulation(
    svgRef,
    filteredNodes,
    filteredLinks,
    simulationConfig,
    renderCallbacks
  );
  const handleFilterChange = reactExports.useCallback((type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((v) => v !== value) : [...prev[type], value]
    }));
  }, []);
  const togglePanel = reactExports.useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);
  const handleGlossaryNavigate = reactExports.useCallback(
    (termId) => {
      navigate("/glossary", { state: { selectedTermId: termId } });
    },
    [navigate]
  );
  React.useEffect(() => {
    setIsPanelOpen(!isMobile);
  }, [isMobile]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-screen w-full items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "ITTO ビジュアライゼーションを読み込み中..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-screen w-full", children: [
    isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: togglePanel,
        className: "absolute left-4 top-4 z-20 rounded-lg bg-white p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
        "aria-label": isPanelOpen ? "メニューを閉じる" : "メニューを開く",
        "aria-expanded": isPanelOpen,
        children: isPanelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-6 w-6" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "aside",
      {
        className: `${isMobile ? `absolute inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "-translate-x-full"}` : "w-80"} overflow-y-auto bg-white shadow-lg`,
        "aria-label": "コントロールパネル",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-lg font-bold md:text-xl", children: "PMBOK ITTOフォースグラフ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { selectedFilters, onFilterChange: handleFilterChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ZoomControls,
            {
              onZoomIn: simulationControls.zoomIn,
              onZoomOut: simulationControls.zoomOut,
              onReset: simulationControls.resetZoom,
              isMobile
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "main",
      {
        ref: containerRef,
        className: "relative flex-1 bg-gray-50",
        role: "main",
        "aria-label": "フォースグラフ",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            ref: svgRef,
            className: "h-full w-full",
            role: "img",
            "aria-label": "PMBOK ITTO 関係性を示すフォースグラフ"
          }
        )
      }
    ),
    selectedGlossaryTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GlossaryDialog,
      {
        term: selectedGlossaryTerm,
        onClose: /* @__PURE__ */ __name(() => setSelectedGlossaryTerm(null), "onClose"),
        onNavigateToGlossary: handleGlossaryNavigate
      }
    )
  ] });
}, "ITTOForceGraph");
ITTOForceGraph.displayName = "ITTOForceGraph";
const ITTOForceGraph$1 = reactExports.memo(ITTOForceGraph);
export {
  ITTOForceGraph$1 as default
};
