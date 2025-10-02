var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { R as React, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import PMBOKMatrix from "./PMBOKMatrix-CPuS4mLf.js";
import ITTOForceGraph from "./ITTOForceGraph-Cc53uQAN.js";
import "./index-CZZZnLRW.js";
import { j as RotateCcw, ak as Minimize2, al as Maximize2, ad as Grip } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./GlossaryDialog-C_TOA3GO.js";
import "./progressService-B-LomPlh.js";
import "./glossaryService-DZ07_k-f.js";
import "./d3-core-DnNGvVRC.js";
function throttle(func, limit, options) {
  let waiting = false;
  let lastArgs = null;
  let lastThis = null;
  const later = /* @__PURE__ */ __name(() => {
    if (lastArgs) {
      func.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
      setTimeout(later, limit);
    } else {
      waiting = false;
      lastArgs = lastThis = null;
    }
  }, "later");
  return function(...args) {
    if (!waiting) {
      {
        func.apply(this, args);
      }
      waiting = true;
      setTimeout(later, limit);
    } else {
      lastArgs = args;
      lastThis = this;
    }
  };
}
__name(throttle, "throttle");
const IntegratedView = React.memo(() => {
  const [splitRatio, setSplitRatio] = reactExports.useState(50);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [fullscreenView, setFullscreenView] = reactExports.useState(null);
  const [windowWidth, setWindowWidth] = reactExports.useState(window.innerWidth);
  reactExports.useEffect(() => {
    const handleResize = /* @__PURE__ */ __name(() => setWindowWidth(window.innerWidth), "handleResize");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  const handleMouseDown = reactExports.useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleMouseMove = reactExports.useCallback(
    throttle((e) => {
      if (isDragging) {
        const container = e.currentTarget.closest(".split-container");
        if (!container) {
          return;
        }
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newRatio = x / rect.width * 100;
        setSplitRatio(Math.max(20, Math.min(80, newRatio)));
      }
    }, 16),
    [isDragging]
  );
  const handleMouseUp = reactExports.useCallback((...args) => {
    setIsDragging(false);
  }, []);
  const resetSplit = /* @__PURE__ */ __name(() => {
    setSplitRatio(50);
    setFullscreenView(null);
  }, "resetSplit");
  const toggleFullscreen = reactExports.useCallback((view) => {
    setFullscreenView((prev) => prev === view ? null : view);
  }, []);
  const setMobileView = reactExports.useCallback((view) => {
    setFullscreenView(view === "matrix" ? null : "network");
  }, []);
  reactExports.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = /* @__PURE__ */ __name((e) => handleMouseMove(e), "handleGlobalMouseMove");
      const handleGlobalMouseUp = /* @__PURE__ */ __name(() => handleMouseUp(), "handleGlobalMouseUp");
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  reactExports.useEffect(() => {
    if (isMobile && fullscreenView === null) {
      setFullscreenView(null);
    }
  }, [isMobile, fullscreenView]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b bg-white px-2 py-2 sm:px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold sm:text-lg", children: "Integrated View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: resetSplit,
          className: "flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 sm:px-3 sm:text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Reset Layout" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "split-container relative flex flex-1",
        onMouseMove: handleMouseMove,
        style: { cursor: isDragging ? "col-resize" : "default" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `${fullscreenView === "network" ? "hidden" : ""} custom-scrollbar relative overflow-auto bg-gray-50`,
              style: {
                width: isMobile ? "100%" : fullscreenView === "matrix" ? "100%" : `${splitRatio}%`,
                display: fullscreenView === "network" ? "none" : "block"
              },
              children: [
                !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => toggleFullscreen("matrix"), "onClick"),
                    className: "rounded bg-white p-1.5 shadow transition-colors hover:bg-gray-100 sm:p-2",
                    title: fullscreenView === "matrix" ? "Exit fullscreen" : "Fullscreen",
                    children: fullscreenView === "matrix" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-3 w-3 sm:h-4 sm:w-4" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  React.Suspense,
                  {
                    fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: "読み込み中..." }),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(PMBOKMatrix, {})
                  }
                )
              ]
            }
          ),
          !fullscreenView && !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "group relative w-1 cursor-col-resize bg-gray-300 transition-colors hover:bg-blue-500 sm:w-2",
              onMouseDown: handleMouseDown,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-1/2 flex h-16 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grip, { className: "h-4 w-4 text-gray-500 transition-colors group-hover:text-white" }) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `${fullscreenView === "matrix" || isMobile && fullscreenView !== "network" ? "hidden" : ""} relative flex-1 overflow-hidden`,
              style: {
                display: fullscreenView === "matrix" || isMobile && fullscreenView !== "network" ? "none" : "block"
              },
              children: [
                !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-2 top-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => toggleFullscreen("network"), "onClick"),
                    className: "rounded bg-white p-1.5 shadow transition-colors hover:bg-gray-100 sm:p-2",
                    title: fullscreenView === "network" ? "Exit fullscreen" : "Fullscreen",
                    children: fullscreenView === "network" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-3 w-3 sm:h-4 sm:w-4" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  React.Suspense,
                  {
                    fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: "読み込み中..." }),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ITTOForceGraph, {})
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t bg-gray-100 px-2 py-1 text-xs text-gray-600 sm:px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Split: ",
        Math.round(splitRatio),
        "% / ",
        Math.round(100 - splitRatio),
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Drag the divider to adjust the view sizes" })
    ] }) }),
    isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-t bg-white p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setMobileView("matrix"), "onClick"),
          className: `flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${fullscreenView !== "network" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`,
          children: "Matrix View"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setMobileView("network"), "onClick"),
          className: `flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${fullscreenView === "network" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`,
          children: "Network View"
        }
      )
    ] })
  ] });
});
IntegratedView.displayName = "IntegratedView";
export {
  IntegratedView as default
};
