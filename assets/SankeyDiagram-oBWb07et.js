var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { G as select, P as color } from "./d3-core-DnNGvVRC.js";
import { S as Sankey, j as justify, c as center, r as right, l as left, s as sankeyLinkHorizontal } from "./d3-sankey-CM7JSbMD.js";
import { bo as AlignJustify, bp as AlignCenter, bq as AlignRight, bd as AlignLeft, D as Download } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const SankeyDiagram = /* @__PURE__ */ __name(({ data }) => {
  const svgRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [selectedTheme, setSelectedTheme] = reactExports.useState("default");
  const [selectedAlignment, setSelectedAlignment] = reactExports.useState("justify");
  const [nodeWidth, setNodeWidth] = reactExports.useState(15);
  const [nodePadding, setNodePadding] = reactExports.useState(10);
  const [dimensions, setDimensions] = reactExports.useState({ width: 1200, height: 800 });
  const [hoveredNode, setHoveredNode] = reactExports.useState(null);
  const [hoveredLink, setHoveredLink] = reactExports.useState(null);
  const themes = {
    default: {
      name: "デフォルト",
      processGroup: {
        立ち上げ: "#8B5CF6",
        計画: "#3B82F6",
        実行: "#10B981",
        "監視・コントロール": "#F59E0B",
        終結: "#EF4444"
      },
      link: "#e0e0e0",
      linkHover: "#999",
      text: "#333",
      background: "#f9fafb"
    },
    ocean: {
      name: "オーシャン",
      processGroup: {
        立ち上げ: "#0891b2",
        計画: "#0e7490",
        実行: "#155e75",
        "監視・コントロール": "#164e63",
        終結: "#134e4a"
      },
      link: "#cbd5e1",
      linkHover: "#64748b",
      text: "#1e293b",
      background: "#f0f9ff"
    },
    sunset: {
      name: "サンセット",
      processGroup: {
        立ち上げ: "#f97316",
        計画: "#ea580c",
        実行: "#dc2626",
        "監視・コントロール": "#b91c1c",
        終結: "#991b1b"
      },
      link: "#fed7aa",
      linkHover: "#fb923c",
      text: "#451a03",
      background: "#fff7ed"
    }
  };
  const alignments = {
    left: { name: "左寄せ", icon: AlignLeft, func: left },
    right: { name: "右寄せ", icon: AlignRight, func: right },
    center: { name: "中央", icon: AlignCenter, func: center },
    justify: { name: "均等", icon: AlignJustify, func: justify }
  };
  reactExports.useEffect(() => {
    const updateDimensions = /* @__PURE__ */ __name(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width || 1200,
          height: height || 800
        });
      }
    }, "updateDimensions");
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  const sankeyData = reactExports.useMemo(() => {
    if (!data) {
      return null;
    }
    const nodes = [];
    const nodeMap = /* @__PURE__ */ new Map();
    let nodeIndex = 0;
    const processGroups = ["立ち上げ", "計画", "実行", "監視・コントロール", "終結"];
    processGroups.forEach((group) => {
      const node = { id: `pg_${group}`, name: group, type: "processGroup", index: nodeIndex++ };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });
    const processNodes = data.nodes.filter((n) => n.type === "process");
    const knowledgeAreas = [...new Set(processNodes.map((p) => p.area))];
    knowledgeAreas.forEach((area) => {
      const areaProcesses = processNodes.filter((p) => p.area === area);
      areaProcesses.forEach((process) => {
        const node = {
          id: process.id,
          name: process.name,
          type: "process",
          area: process.area,
          group: process.group,
          index: nodeIndex++
        };
        nodes.push(node);
        nodeMap.set(node.id, node);
      });
    });
    const majorOutputs = [
      "プロジェクト憲章",
      "プロジェクトマネジメント計画書",
      "成果物",
      "作業パフォーマンス・データ",
      "作業パフォーマンス報告書",
      "変更要求",
      "最終報告書"
    ];
    majorOutputs.forEach((outputName) => {
      const outputNode = data.nodes.find((n) => n.type === "output" && n.name === outputName);
      if (outputNode) {
        const node = {
          id: outputNode.id,
          name: outputNode.name,
          type: "output",
          index: nodeIndex++
        };
        nodes.push(node);
        nodeMap.set(node.id, node);
      }
    });
    const links = [];
    processNodes.forEach((process) => {
      const sourceId = `pg_${process.group}`;
      if (nodeMap.has(sourceId) && nodeMap.has(process.id)) {
        links.push({
          source: nodeMap.get(sourceId).index,
          target: nodeMap.get(process.id).index,
          value: 1,
          type: "group-to-process"
        });
      }
    });
    data.links.forEach((link) => {
      if (link.type === "output") {
        const sourceNode = nodeMap.get(link.source.id || link.source);
        const targetNode = nodeMap.get(link.target.id || link.target);
        if (sourceNode && targetNode && targetNode.type === "output") {
          links.push({
            source: sourceNode.index,
            target: targetNode.index,
            value: 1,
            type: "process-to-output",
            originalLink: link
          });
        }
      }
    });
    return { nodes, links };
  }, [data]);
  reactExports.useEffect(() => {
    if (!sankeyData || !svgRef.current) {
      return;
    }
    const theme = themes[selectedTheme];
    const margin = { top: 40, right: 150, bottom: 40, left: 150 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    svg.style("background-color", theme.background);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const sankeyGenerator = Sankey().nodeId((d) => d.index).nodeAlign(alignments[selectedAlignment].func).nodeWidth(nodeWidth).nodePadding(nodePadding).extent([
      [0, 0],
      [width, height]
    ]);
    const graph = sankeyGenerator({
      nodes: sankeyData.nodes.map((d) => ({ ...d })),
      links: sankeyData.links.map((d) => ({ ...d }))
    });
    const link = g.append("g").attr("fill", "none").selectAll("g").data(graph.links).join("g").style("mix-blend-mode", "multiply");
    link.append("path").attr("d", sankeyLinkHorizontal()).attr("stroke", (d) => {
      if (d.type === "group-to-process") {
        const targetNode = graph.nodes[d.target];
        return theme.processGroup[targetNode.group] || theme.link;
      }
      return theme.link;
    }).attr("stroke-width", (d) => Math.max(1, d.width)).attr("opacity", 0.5).on("mouseenter", function(event, d) {
      setHoveredLink(d);
      select(this).attr("stroke", theme.linkHover).attr("opacity", 0.8);
    }).on("mouseleave", function(event, d) {
      setHoveredLink(null);
      select(this).attr(
        "stroke",
        d.type === "group-to-process" ? theme.processGroup[graph.nodes[d.target].group] || theme.link : theme.link
      ).attr("opacity", 0.5);
    });
    const node = g.append("g").selectAll("g").data(graph.nodes).join("g");
    node.append("rect").attr("x", (d) => d.x0).attr("y", (d) => d.y0).attr("height", (d) => d.y1 - d.y0).attr("width", (d) => d.x1 - d.x0).attr("fill", (d) => {
      if (d.type === "processGroup") {
        return theme.processGroup[d.name];
      } else if (d.type === "process") {
        return color(theme.processGroup[d.group]).brighter(0.5);
      } else {
        return "#94a3b8";
      }
    }).attr(
      "stroke",
      (d) => color(
        d.type === "processGroup" ? theme.processGroup[d.name] : d.type === "process" ? theme.processGroup[d.group] : "#64748b"
      ).darker(0.5)
    ).attr("stroke-width", 1).on("mouseenter", function(event, d) {
      setHoveredNode(d);
      select(this).attr("opacity", 0.8);
    }).on("mouseleave", function() {
      setHoveredNode(null);
      select(this).attr("opacity", 1);
    });
    node.append("text").attr("x", (d) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6).attr("y", (d) => (d.y1 + d.y0) / 2).attr("dy", "0.35em").attr("text-anchor", (d) => d.x0 < width / 2 ? "start" : "end").attr("font-size", (d) => d.type === "processGroup" ? "14px" : "12px").attr("font-weight", (d) => d.type === "processGroup" ? "bold" : "normal").attr("fill", theme.text).text((d) => d.name).append("tspan").attr("fill", "#666").attr("font-size", "10px").attr("dy", "1.2em").attr("x", (d) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6).text((d) => d.type === "process" ? `(${d.area})` : "");
    svg.append("text").attr("x", dimensions.width / 2).attr("y", 20).attr("text-anchor", "middle").attr("font-size", "18px").attr("font-weight", "bold").attr("fill", theme.text).text("PMBOKプロセスフロー サンキーダイアグラム");
  }, [sankeyData, dimensions, selectedTheme, selectedAlignment, nodeWidth, nodePadding]);
  const exportSVG = /* @__PURE__ */ __name(() => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pmbok-sankey-diagram.svg";
    link.click();
    URL.revokeObjectURL(url);
  }, "exportSVG");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative h-full w-full bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 top-4 max-w-xs space-y-4 rounded-lg bg-white p-4 shadow-lg", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "", className: "mb-2 block text-sm font-medium text-gray-700", children: "ノード配置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(alignments).map(([key, alignment]) => {
          const Icon = alignment.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setSelectedAlignment(key), "onClick"),
              className: `flex items-center justify-center gap-2 rounded-md px-3 py-2 ${selectedAlignment === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: alignment.name })
              ]
            },
            key
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            htmlFor: "nodewidth-px-input",
            className: "mb-2 block text-sm font-medium text-gray-700",
            children: [
              "ノード幅: ",
              nodeWidth,
              "px"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "nodewidth-px-input",
            type: "range",
            min: "5",
            max: "30",
            value: nodeWidth,
            onChange: /* @__PURE__ */ __name((e) => setNodeWidth(Number(e.target.value)), "onChange"),
            className: "w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            htmlFor: "nodepadding-px-input",
            className: "mb-2 block text-sm font-medium text-gray-700",
            children: [
              "ノード間隔: ",
              nodePadding,
              "px"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "nodepadding-px-input",
            type: "range",
            min: "5",
            max: "30",
            value: nodePadding,
            onChange: /* @__PURE__ */ __name((e) => setNodePadding(Number(e.target.value)), "onChange"),
            className: "w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: exportSVG,
          className: "flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            "SVGエクスポート"
          ]
        }
      )
    ] }),
    (hoveredNode || hoveredLink) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 max-w-sm rounded-lg bg-white p-4 shadow-lg", children: [
      hoveredNode && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: hoveredNode.name }),
        hoveredNode.type === "process" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "プロセス群: ",
            hoveredNode.group
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "知識エリア: ",
            hoveredNode.area
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "タイプ:",
          " ",
          hoveredNode.type === "processGroup" ? "プロセス群" : hoveredNode.type === "process" ? "プロセス" : "アウトプット"
        ] })
      ] }),
      hoveredLink && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "接続:",
        " ",
        hoveredLink.type === "group-to-process" ? "プロセス群 → プロセス" : "プロセス → アウトプット"
      ] }) })
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
  ] });
}, "SankeyDiagram");
const SankeyDiagram$1 = React.memo(SankeyDiagram);
export {
  SankeyDiagram$1 as default
};
