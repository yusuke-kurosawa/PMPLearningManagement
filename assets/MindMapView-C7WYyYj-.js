var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { G as select, H as zoom, X as tree, Z as hierarchy, _ as ordinal, $ as linkRadial, O as identity } from "./d3-core-DnNGvVRC.js";
import { aV as ZoomIn, aW as ZoomOut, j as RotateCcw, ak as Minimize2, al as Maximize2, D as Download } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const MindMapView = /* @__PURE__ */ __name(({ data }) => {
  const svgRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [dimensions, setDimensions] = reactExports.useState({ width: 1200, height: 800 });
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [selectedNode, setSelectedNode] = reactExports.useState(null);
  const [expandedNodes, setExpandedNodes] = reactExports.useState(/* @__PURE__ */ new Set(["root"]));
  reactExports.useEffect(() => {
    const updateDimensions = /* @__PURE__ */ __name(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || 1200,
          height: isFullscreen ? window.innerHeight : height || 800
        });
      }
    }, "updateDimensions");
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isFullscreen]);
  const mindMapData = reactExports.useMemo(() => {
    if (!data) {
      return null;
    }
    const root = {
      id: "root",
      name: "PMBOK第6版",
      children: []
    };
    const knowledgeAreas = {};
    const processes = data.nodes.filter((n) => n.type === "process");
    processes.forEach((process) => {
      if (!knowledgeAreas[process.area]) {
        knowledgeAreas[process.area] = {
          id: `area_${process.area}`,
          name: `${process.area}マネジメント`,
          area: process.area,
          children: []
        };
      }
      let processGroupNode = knowledgeAreas[process.area].children.find(
        (pg) => pg.name === process.group
      );
      if (!processGroupNode) {
        processGroupNode = {
          id: `${process.area}_${process.group}`,
          name: process.group,
          group: process.group,
          children: []
        };
        knowledgeAreas[process.area].children.push(processGroupNode);
      }
      const processNode = {
        id: process.id,
        name: process.name,
        type: "process",
        area: process.area,
        group: process.group,
        children: []
      };
      const ittoCategories = {
        inputs: { name: "インプット", items: [] },
        tools: { name: "ツールと技法", items: [] },
        outputs: { name: "アウトプット", items: [] }
      };
      data.links.forEach((link) => {
        if (link.source === process.id || link.source.id === process.id) {
          const target = data.nodes.find((n) => n.id === (link.target.id || link.target));
          if (target) {
            if (link.type === "input" && target.type === "input") {
              ittoCategories.inputs.items.push(target.name);
            } else if (link.type === "tool" && target.type === "tool") {
              ittoCategories.tools.items.push(target.name);
            } else if (link.type === "output" && target.type === "output") {
              ittoCategories.outputs.items.push(target.name);
            }
          }
        }
      });
      Object.entries(ittoCategories).forEach(([key, category]) => {
        if (category.items.length > 0) {
          const categoryNode = {
            id: `${process.id}_${key}`,
            name: `${category.name} (${category.items.length})`,
            type: "category",
            children: category.items.slice(0, 5).map((item, idx) => ({
              id: `${process.id}_${key}_${idx}`,
              name: item,
              type: key.slice(0, -1)
            }))
          };
          processNode.children.push(categoryNode);
        }
      });
      processGroupNode.children.push(processNode);
    });
    root.children = Object.values(knowledgeAreas).sort((a, b) => a.name.localeCompare(b.name));
    return root;
  }, [data]);
  reactExports.useEffect(() => {
    if (!mindMapData || !svgRef.current) {
      return;
    }
    const width = dimensions.width;
    const height = dimensions.height;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const zoom$1 = zoom().scaleExtent([0.1, 4]).on("zoom", (event) => {
      g.attr("transform", `translate(${width / 2},${height / 2}) scale(${event.transform.k})`);
    });
    svg.call(zoom$1);
    const tree$1 = tree().size([2 * Math.PI, Math.min(width, height) / 2 - 150]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    const hierarchyData = hierarchy(mindMapData);
    hierarchyData.each((node2) => {
      if (!expandedNodes.has(node2.data.id) && node2.children) {
        node2._children = node2.children;
        node2.children = null;
      }
    });
    const treeData = tree$1(hierarchyData);
    const nodes = treeData.descendants();
    const links = treeData.links();
    const colorScale = ordinal().domain([
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
    ]).range([
      "#8B5CF6",
      "#3B82F6",
      "#06B6D4",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#6366F1",
      "#84CC16",
      "#F97316"
    ]);
    const processGroupColors = {
      立ち上げ: "#9333ea",
      計画: "#2563eb",
      実行: "#059669",
      "監視・コントロール": "#d97706",
      終結: "#dc2626"
    }.selectAll(".link").data(links).enter().append("path").attr("class", "link").attr(
      "d",
      linkRadial().angle((d) => d.x).radius((d) => d.y)
    ).attr("fill", "none").attr("stroke", "#ccc").attr("stroke-width", 2);
    const node = g.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").attr(
      "transform",
      (d) => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `
    );
    node.append("circle").attr("r", (d) => {
      if (d.depth === 0) {
        return 30;
      }
      if (d.depth === 1) {
        return 20;
      }
      if (d.depth === 2) {
        return 15;
      }
      if (d.depth === 3) {
        return 10;
      }
      return 5;
    }).attr("fill", (d) => {
      if (d.depth === 0) {
        return "#6366f1";
      }
      if (d.depth === 1) {
        return colorScale(d.data.area);
      }
      if (d.depth === 2) {
        return processGroupColors[d.data.group] || "#94a3b8";
      }
      if (d.depth === 3) {
        return "#e5e7eb";
      }
      return "#f3f4f6";
    }).attr("stroke", (d) => {
      if (d.children || d._children) {
        return "#333";
      }
      return "none";
    }).attr("stroke-width", 2).attr("cursor", "pointer").on("click", (event, d) => {
      event.stopPropagation();
      if (d.children || d._children) {
        const newExpanded = new Set(expandedNodes);
        if (d.children) {
          d._children = d.children;
          d.children = null;
          newExpanded.delete(d.data.id);
        } else {
          d.children = d._children;
          d._children = null;
          newExpanded.add(d.data.id);
        }
        setExpandedNodes(newExpanded);
      }
      setSelectedNode(d.data);
    });
    node.append("text").attr("dy", ".31em").attr("x", (d) => d.x < Math.PI === !d.children ? 6 : -6).attr("text-anchor", (d) => d.x < Math.PI === !d.children ? "start" : "end").attr("transform", (d) => d.x >= Math.PI ? "rotate(180)" : null).attr("font-size", (d) => {
      if (d.depth === 0) {
        return "16px";
      }
      if (d.depth === 1) {
        return "14px";
      }
      if (d.depth === 2) {
        return "12px";
      }
      return "10px";
    }).attr("font-weight", (d) => d.depth <= 1 ? "bold" : "normal").text((d) => {
      if (d.data.name.length > 20) {
        return d.data.name.substring(0, 20) + "...";
      }
      return d.data.name;
    }).style("cursor", "pointer");
    node.filter((d) => d.children || d._children).append("text").attr("x", (d) => d.x < Math.PI === !d.children ? -15 : 15).attr("dy", ".31em").attr("text-anchor", "middle").attr("font-size", "12px").attr("font-weight", "bold").text((d) => d.children ? "−" : "+").style("cursor", "pointer");
    window.zoomIn = () => {
      svg.transition().call(zoom$1.scaleBy, 1.3);
    };
    window.zoomOut = () => {
      svg.transition().call(zoom$1.scaleBy, 0.7);
    };
    window.resetZoom = () => {
      svg.transition().call(zoom$1.transform, identity);
    };
  }, [mindMapData, dimensions, expandedNodes]);
  const exportSVG = /* @__PURE__ */ __name(() => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pmbok-mindmap.svg";
    link.click();
    URL.revokeObjectURL(url);
  }, "exportSVG");
  const toggleFullscreen = /* @__PURE__ */ __name(() => {
    setIsFullscreen(!isFullscreen);
  }, "toggleFullscreen");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: `relative ${isFullscreen ? "fixed inset-0 z-50 bg-white" : "h-full w-full"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 top-4 space-y-2 rounded-lg bg-white p-4 shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.zoomIn && window.zoomIn(), "onClick"),
                className: "rounded-md bg-gray-100 p-2 hover:bg-gray-200",
                title: "拡大",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.zoomOut && window.zoomOut(), "onClick"),
                className: "rounded-md bg-gray-100 p-2 hover:bg-gray-200",
                title: "縮小",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.resetZoom && window.resetZoom(), "onClick"),
                className: "rounded-md bg-gray-100 p-2 hover:bg-gray-200",
                title: "リセット",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: toggleFullscreen,
                className: "rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700",
                title: isFullscreen ? "通常表示" : "フルスクリーン",
                children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: exportSVG,
                className: "rounded-md bg-green-600 p-2 text-white hover:bg-green-700",
                title: "エクスポート",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-gray-600", children: [
            "• ノードをクリックして展開/折りたたみ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "• ドラッグでパン、スクロールでズーム"
          ] })
        ] }),
        selectedNode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 max-w-sm rounded-lg bg-white p-4 shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: selectedNode.name }),
          selectedNode.area && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "知識エリア: ",
            selectedNode.area
          ] }),
          selectedNode.group && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "プロセス群: ",
            selectedNode.group
          ] }),
          selectedNode.type && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "タイプ: ",
            selectedNode.type
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            ref: svgRef,
            width: dimensions.width,
            height: dimensions.height,
            className: "h-full w-full",
            style: { background: "#f9fafb" }
          }
        )
      ]
    }
  );
}, "MindMapView");
const MindMapView$1 = React.memo(MindMapView);
export {
  MindMapView$1 as default
};
