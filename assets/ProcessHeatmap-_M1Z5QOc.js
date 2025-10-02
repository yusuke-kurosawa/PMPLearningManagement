var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { G as select, g as band, T as sequential, Y as YlOrRd, l as linear, U as axisBottom, V as format } from "./d3-core-DnNGvVRC.js";
import { D as Download } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const ProcessHeatmap = /* @__PURE__ */ __name(({ data, progressData }) => {
  const svgRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [dimensions, setDimensions] = reactExports.useState({ width: 1200, height: 800 });
  const [selectedMetric, setSelectedMetric] = reactExports.useState("complexity");
  const [hoveredCell, setHoveredCell] = reactExports.useState(null);
  const [showLegend, setShowLegend] = reactExports.useState(true);
  const metrics = {
    complexity: {
      name: "複雑度",
      description: "ITTOの数に基づくプロセスの複雑さ",
      calculate: /* @__PURE__ */ __name((process) => {
        if (!data) {
          return 0;
        }
        const links = data.links.filter(
          (l) => l.source === process.id || l.source.id === process.id || l.target === process.id || l.target.id === process.id
        );
        return links.length;
      }, "calculate")
    },
    progress: {
      name: "学習進捗",
      description: "各プロセスの学習完了度",
      calculate: /* @__PURE__ */ __name((process) => {
        if (!progressData) {
          return 0;
        }
        const progress = progressData[process.id];
        return progress ? progress.understandingLevel : 0;
      }, "calculate")
    },
    connectivity: {
      name: "接続性",
      description: "他のプロセスとの関連度",
      calculate: /* @__PURE__ */ __name((process) => {
        if (!data) {
          return 0;
        }
        const connectedProcesses = /* @__PURE__ */ new Set();
        data.links.forEach((link) => {
          if (link.source === process.id || link.source.id === process.id) {
            const target = data.nodes.find((n) => n.id === (link.target.id || link.target));
            if (target && target.type === "process") {
              connectedProcesses.add(target.id);
            }
          }
          if (link.target === process.id || link.target.id === process.id) {
            const source = data.nodes.find((n) => n.id === (link.source.id || link.source));
            if (source && source.type === "process") {
              connectedProcesses.add(source.id);
            }
          }
        });
        return connectedProcesses.size;
      }, "calculate")
    },
    importance: {
      name: "重要度",
      description: "PMP試験での出題頻度（推定）",
      calculate: /* @__PURE__ */ __name((process) => {
        const importanceMap = {
          プロジェクト憲章の作成: 10,
          プロジェクトマネジメント計画書の作成: 10,
          "プロジェクト作業の指揮・マネジメント": 9,
          "プロジェクト作業の監視・コントロール": 9,
          統合変更管理: 10,
          スコープの定義: 8,
          WBSの作成: 9,
          スケジュールの作成: 9,
          コストの見積り: 8,
          リスクの特定: 9,
          "リスク分析（定性的）": 8,
          ステークホルダーの特定: 9,
          コミュニケーションの管理: 8
        };
        return importanceMap[process.name] || 5;
      }, "calculate")
    }
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
  const heatmapData = reactExports.useMemo(() => {
    if (!data) {
      return null;
    }
    const processes = data.nodes.filter((n) => n.type === "process");
    const knowledgeAreas = [
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
    const processGroups = ["立ち上げ", "計画", "実行", "監視・コントロール", "終結"];
    const matrix = [];
    knowledgeAreas.forEach((area, areaIndex) => {
      processGroups.forEach((group, groupIndex) => {
        const process = processes.find((p) => p.area === area && p.group === group);
        if (process) {
          const value = metrics[selectedMetric].calculate(process);
          matrix.push({
            area,
            group,
            areaIndex,
            groupIndex,
            process,
            value
          });
        }
      });
    });
    return {
      matrix,
      knowledgeAreas,
      processGroups,
      maxValue: Math.max(...matrix.map((d) => d.value))
    };
  }, [data, progressData, selectedMetric]);
  reactExports.useEffect(() => {
    if (!heatmapData || !svgRef.current) {
      return;
    }
    const margin = { top: 120, right: 200, bottom: 60, left: 200 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xScale = band().domain(heatmapData.processGroups).range([0, width]).padding(0.1);
    const yScale = band().domain(heatmapData.knowledgeAreas).range([0, height]).padding(0.1);
    const colorScale = sequential().domain([0, heatmapData.maxValue]).interpolator(YlOrRd);
    const cells = g.selectAll(".cell").data(heatmapData.matrix).enter().append("g").attr("class", "cell");
    cells.append("rect").attr("x", (d) => xScale(d.group)).attr("y", (d) => yScale(d.area)).attr("width", xScale.bandwidth()).attr("height", yScale.bandwidth()).attr("fill", (d) => colorScale(d.value)).attr("stroke", "#fff").attr("stroke-width", 2).attr("rx", 4).attr("ry", 4).style("cursor", "pointer").on("mouseenter", (event, d) => {
      setHoveredCell(d);
      select(event.target).attr("stroke", "#333").attr("stroke-width", 3);
    }).on("mouseleave", (event) => {
      setHoveredCell(null);
      select(event.target).attr("stroke", "#fff").attr("stroke-width", 2);
    });
    cells.append("text").attr("x", (d) => xScale(d.group) + xScale.bandwidth() / 2).attr("y", (d) => yScale(d.area) + yScale.bandwidth() / 2).attr("text-anchor", "middle").attr("dy", ".35em").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", (d) => d.value > heatmapData.maxValue * 0.6 ? "#fff" : "#333").text((d) => d.value.toFixed(0)).style("pointer-events", "none");
    g.append("g").attr("transform", `translate(0,${-10})`).selectAll("text").data(heatmapData.processGroups).enter().append("text").attr("x", (d) => xScale(d) + xScale.bandwidth() / 2).attr("y", 0).attr("text-anchor", "middle").attr("font-size", "14px").attr("font-weight", "bold").text((d) => d);
    g.append("g").attr("transform", `translate(${-10},0)`).selectAll("text").data(heatmapData.knowledgeAreas).enter().append("text").attr("x", 0).attr("y", (d) => yScale(d) + yScale.bandwidth() / 2).attr("text-anchor", "end").attr("dy", ".35em").attr("font-size", "14px").attr("font-weight", "bold").text((d) => `${d}マネジメント`);
    svg.append("text").attr("x", dimensions.width / 2).attr("y", 40).attr("text-anchor", "middle").attr("font-size", "20px").attr("font-weight", "bold").text(`PMBOKプロセス ${metrics[selectedMetric].name}ヒートマップ`);
    if (showLegend) {
      const legendWidth = 300;
      const legendHeight = 20;
      const legendScale = linear().domain([0, heatmapData.maxValue]).range([0, legendWidth]);
      const legendAxis = axisBottom(legendScale).ticks(5).tickFormat(format(".0f"));
      const legend = svg.append("g").attr(
        "transform",
        `translate(${dimensions.width - margin.right - legendWidth - 50},${margin.top - 60})`
      );
      const gradient = svg.append("defs").append("linearGradient").attr("id", "legend-gradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        gradient.append("stop").attr("offset", `${i / numStops * 100}%`).attr("stop-color", colorScale(i / numStops * heatmapData.maxValue));
      }
      legend.append("rect").attr("width", legendWidth).attr("height", legendHeight).attr("fill", "url(#legend-gradient)").attr("stroke", "#ccc");
      legend.append("g").attr("transform", `translate(0,${legendHeight})`).call(legendAxis);
      legend.append("text").attr("x", legendWidth / 2).attr("y", -10).attr("text-anchor", "middle").attr("font-size", "12px").text(metrics[selectedMetric].name);
    }
  }, [heatmapData, dimensions, selectedMetric, showLegend]);
  const exportSVG = /* @__PURE__ */ __name(() => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pmbok-heatmap.svg";
    link.click();
    URL.revokeObjectURL(url);
  }, "exportSVG");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative h-full w-full bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-4 top-4 max-w-xs space-y-4 rounded-lg bg-white p-4 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-2 block text-sm font-medium text-gray-700", children: "表示メトリクス" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "-input",
            value: selectedMetric,
            onChange: /* @__PURE__ */ __name((e) => setSelectedMetric(e.target.value), "onChange"),
            className: "w-full rounded-md border border-gray-300 px-3 py-2",
            children: Object.entries(metrics).map(([key, metric]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: metric.name }, key))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-600", children: metrics[selectedMetric].description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            id: "showLegend",
            checked: showLegend,
            onChange: /* @__PURE__ */ __name((e) => setShowLegend(e.target.checked), "onChange"),
            className: "rounded"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "showLegend", className: "text-sm text-gray-700", children: "凡例を表示" })
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
    hoveredCell && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 max-w-sm rounded-lg bg-white p-4 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: hoveredCell.process.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "知識エリア: ",
        hoveredCell.area,
        "マネジメント"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "プロセス群: ",
        hoveredCell.group
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
          metrics[selectedMetric].name,
          ": ",
          hoveredCell.value.toFixed(1)
        ] }),
        selectedMetric === "progress" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "理解度: ",
          (hoveredCell.value * 10).toFixed(0),
          "%"
        ] })
      ] })
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
}, "ProcessHeatmap");
const ProcessHeatmap$1 = React.memo(ProcessHeatmap);
export {
  ProcessHeatmap$1 as default
};
