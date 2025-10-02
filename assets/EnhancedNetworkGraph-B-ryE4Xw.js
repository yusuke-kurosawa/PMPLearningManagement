var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { W as group, G as select, H as zoom, I as simulation, J as link, K as manyBody, L as center, M as collide, N as drag } from "./d3-core-DnNGvVRC.js";
import { al as Maximize2, D as Download } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const EnhancedNetworkGraph = /* @__PURE__ */ __name(({ data, onNodeClick }) => {
  const svgRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [selectedLayout, setSelectedLayout] = reactExports.useState("force");
  const [selectedTheme, setSelectedTheme] = reactExports.useState("default");
  const [animationSpeed, setAnimationSpeed] = reactExports.useState(1);
  const [showLabels, setShowLabels] = reactExports.useState(true);
  const [nodeSize, setNodeSize] = reactExports.useState(1);
  const [linkStrength] = reactExports.useState(1);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [dimensions, setDimensions] = reactExports.useState({ width: 1200, height: 800 });
  const [selectedNodes, setSelectedNodes] = reactExports.useState(/* @__PURE__ */ new Set());
  const [hoveredNode, setHoveredNode] = reactExports.useState(null);
  const layouts = {
    force: "力学モデル",
    hierarchical: "階層型",
    circular: "円形",
    radial: "放射状",
    grid: "グリッド"
  };
  const themes = {
    default: {
      name: "デフォルト",
      process: "#8B5CF6",
      input: "#3B82F6",
      tool: "#10B981",
      output: "#F59E0B",
      link: "#999",
      background: "#f3f4f6"
    },
    dark: {
      name: "ダーク",
      process: "#A78BFA",
      input: "#60A5FA",
      tool: "#34D399",
      output: "#FBBF24",
      link: "#666",
      background: "#1f2937"
    },
    colorblind: {
      name: "カラーブラインド対応",
      process: "#E69F00",
      input: "#56B4E9",
      tool: "#009E73",
      output: "#F0E442",
      link: "#999",
      background: "#f3f4f6"
    }
  };
  reactExports.useEffect(() => {
    const updateDimensions = /* @__PURE__ */ __name(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || 1200,
          height: isFullscreen ? window.innerHeight - 100 : height || 800
        });
      }
    }, "updateDimensions");
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isFullscreen]);
  const applyLayout = reactExports.useCallback(
    (nodes, _links) => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
      switch (selectedLayout) {
        case "hierarchical": {
          const levels = {};
          nodes.forEach((node) => {
            const level = node.type === "process" ? 0 : node.type === "input" ? -1 : node.type === "output" ? 1 : 0;
            if (!levels[level]) {
              levels[level] = [];
            }
            levels[level].push(node);
          });
          Object.entries(levels).forEach(([level, levelNodes]) => {
            const levelY = centerY + parseInt(level) * 150;
            levelNodes.forEach((node, i) => {
              node.fx = (i + 1) * dimensions.width / (levelNodes.length + 1);
              node.fy = levelY;
            });
          });
          break;
        }
        case "circular":
          nodes.forEach((node, i) => {
            const angle = i / nodes.length * 2 * Math.PI;
            node.fx = centerX + radius * Math.cos(angle);
            node.fy = centerY + radius * Math.sin(angle);
          });
          break;
        case "radial": {
          const typeGroups = group(nodes, (d) => d.type);
          let angleOffset = 0;
          typeGroups.forEach((groupNodes, type) => {
            const angleStep = 2 * Math.PI / typeGroups.size;
            groupNodes.forEach((node, i) => {
              const r = type === "process" ? 0 : radius * (0.5 + i * 0.1);
              const angle = angleOffset + i / groupNodes.length * angleStep;
              node.fx = centerX + r * Math.cos(angle);
              node.fy = centerY + r * Math.sin(angle);
            });
            angleOffset += angleStep;
          });
          break;
        }
        case "grid": {
          const cols = Math.ceil(Math.sqrt(nodes.length));
          nodes.forEach((node, i) => {
            node.fx = (i % cols + 1) * dimensions.width / (cols + 1);
            node.fy = (Math.floor(i / cols) + 1) * dimensions.height / (Math.ceil(nodes.length / cols) + 1);
          });
          break;
        }
        default:
          nodes.forEach((node) => {
            node.fx = null;
            node.fy = null;
          });
      }
    },
    [selectedLayout, dimensions]
  );
  reactExports.useEffect(() => {
    if (!data || !svgRef.current) {
      return;
    }
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    const theme = themes[selectedTheme];
    svg.style("background-color", theme.background);
    const g = svg.append("g");
    const zoom$1 = zoom().scaleExtent([0.1, 10]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom$1);
    const nodes = data.nodes.map((d) => ({ ...d }));
    const links = data.links.map((d) => ({ ...d }));
    const simulation$1 = simulation(nodes).force(
      "link",
      link(links).id((d) => d.id).distance(100).strength(linkStrength)
    ).force("charge", manyBody().strength(-300)).force("center", center(dimensions.width / 2, dimensions.height / 2)).force(
      "collision",
      collide().radius((d) => getNodeSize(d) + 5)
    );
    applyLayout(nodes, links);
    const link$1 = g.append("g").selectAll("line").data(links).join("line").attr("stroke", theme.link).attr("stroke-opacity", 0.6).attr("stroke-width", (d) => Math.sqrt(d.value || 1));
    const node = g.append("g").selectAll("g").data(nodes).join("g").call(drag$1(simulation$1));
    node.each(function(d) {
      const nodeGroup = select(this);
      const size = getNodeSize(d) * nodeSize;
      const color = getNodeColor(d, theme);
      switch (d.type) {
        case "process":
          nodeGroup.append("circle").attr("r", size).attr("fill", color);
          break;
        case "input":
          nodeGroup.append("rect").attr("x", -size).attr("y", -size).attr("width", size * 2).attr("height", size * 2).attr("transform", "rotate(45)").attr("fill", color);
          break;
        case "tool":
          nodeGroup.append("rect").attr("x", -size).attr("y", -size).attr("width", size * 2).attr("height", size * 2).attr("fill", color);
          break;
        case "output":
          nodeGroup.append("polygon").attr("points", `0,-${size} ${size},${size} -${size},${size}`).attr("fill", color);
          break;
      }
      if (showLabels) {
        nodeGroup.append("text").text(d.name).attr("x", 0).attr("y", size + 15).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", theme.background === "#1f2937" ? "#fff" : "#333");
      }
    });
    node.on("mouseenter", function(event, d) {
      setHoveredNode(d);
      select(this).select("circle, rect, polygon").transition().duration(200).attr("opacity", 0.8).attr("transform", "scale(1.2)");
    }).on("mouseleave", function() {
      setHoveredNode(null);
      select(this).select("circle, rect, polygon").transition().duration(200).attr("opacity", 1).attr("transform", "scale(1)");
    }).on("click", (event, d) => {
      if (onNodeClick) {
        onNodeClick(d);
      }
      if (event.shiftKey) {
        const newSelected = new Set(selectedNodes);
        if (newSelected.has(d.id)) {
          newSelected.delete(d.id);
        } else {
          newSelected.add(d.id);
        }
        setSelectedNodes(newSelected);
      }
    });
    simulation$1.on("tick", () => {
      link$1.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
    simulation$1.alphaDecay(0.02 / animationSpeed);
    function drag$1(simulation2) {
      function dragstarted(event) {
        if (!event.active) {
          simulation2.alphaTarget(0.3).restart();
        }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      __name(dragstarted, "dragstarted");
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      __name(dragged, "dragged");
      function dragended(event) {
        if (!event.active) {
          simulation2.alphaTarget(0);
        }
        if (selectedLayout === "force") {
          event.subject.fx = null;
          event.subject.fy = null;
        }
      }
      __name(dragended, "dragended");
      return drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
    __name(drag$1, "drag$1");
    return () => {
      simulation$1.stop();
    };
  }, [
    data,
    dimensions,
    selectedLayout,
    selectedTheme,
    animationSpeed,
    showLabels,
    nodeSize,
    linkStrength
  ]);
  const getNodeSize = /* @__PURE__ */ __name((node) => {
    const baseSize = node.type === "process" ? 20 : 15;
    return baseSize;
  }, "getNodeSize");
  const getNodeColor = /* @__PURE__ */ __name((node, theme) => {
    return theme[node.type] || "#999";
  }, "getNodeColor");
  const exportSVG = /* @__PURE__ */ __name(() => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link2 = document.createElement("a");
    link2.href = url;
    link2.download = "network-graph.svg";
    link2.click();
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 top-4 max-w-xs space-y-4 rounded-lg bg-white p-4 shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-2 block text-sm font-medium text-gray-700", children: "レイアウト" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "-input",
                value: selectedLayout,
                onChange: /* @__PURE__ */ __name((e) => setSelectedLayout(e.target.value), "onChange"),
                className: "w-full rounded-md border border-gray-300 px-3 py-2",
                children: Object.entries(layouts).map(([key, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: name }, key))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-2 block text-sm font-medium text-gray-700", children: "カラーテーマ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                id: "-input",
                value: selectedTheme,
                onChange: /* @__PURE__ */ __name((e) => setSelectedTheme(e.target.value), "onChange"),
                className: "w-full rounded-md border border-gray-300 px-3 py-2",
                children: Object.entries(themes).map(([key, theme]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: theme.name }, key))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-2 block text-sm font-medium text-gray-700", children: "アニメーション速度" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "-input",
                type: "range",
                min: "0.5",
                max: "2",
                step: "0.1",
                value: animationSpeed,
                onChange: /* @__PURE__ */ __name((e) => setAnimationSpeed(parseFloat(e.target.value)), "onChange"),
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-2 block text-sm font-medium text-gray-700", children: "ノードサイズ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "-input",
                type: "range",
                min: "0.5",
                max: "2",
                step: "0.1",
                value: nodeSize,
                onChange: /* @__PURE__ */ __name((e) => setNodeSize(parseFloat(e.target.value)), "onChange"),
                className: "w-full"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "showLabels",
                checked: showLabels,
                onChange: /* @__PURE__ */ __name((e) => setShowLabels(e.target.checked), "onChange"),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "showLabels", className: "text-sm text-gray-700", children: "ラベルを表示" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: toggleFullscreen,
                className: "flex-1 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "mx-auto h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: exportSVG,
                className: "flex-1 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mx-auto h-4 w-4" })
              }
            )
          ] })
        ] }),
        hoveredNode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 max-w-sm rounded-lg bg-white p-4 shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: hoveredNode.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "タイプ: ",
            hoveredNode.type
          ] }),
          hoveredNode.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-700", children: hoveredNode.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            ref: svgRef,
            width: dimensions.width,
            height: dimensions.height,
            className: "h-full w-full"
          }
        )
      ]
    }
  );
}, "EnhancedNetworkGraph");
const EnhancedNetworkGraph$1 = React.memo(EnhancedNetworkGraph);
export {
  EnhancedNetworkGraph$1 as default
};
