var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { l as logger } from "./index-CZZZnLRW.js";
import "./vendor-iUsVqwEv.js";
import "./react-vendor-Uy5hwzow.js";
import "./lucide-icons-B7slfWYt.js";
var __defProp2 = Object.defineProperty;
var __defNormalProp = /* @__PURE__ */ __name((obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value, "__defNormalProp");
var __publicField = /* @__PURE__ */ __name((obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value), "__publicField");
const _PerformanceMonitor = class _PerformanceMonitor {
  constructor() {
    __publicField(this, "metrics", {});
    __publicField(this, "observers", /* @__PURE__ */ new Map());
  }
  /**
   * Web Vitalsの監視開始
   */
  startMonitoring() {
    if (typeof window === "undefined") {
      return;
    }
    this.observePaint();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.measureTTFB();
    this.observeINP();
    this.monitorMemory();
    this.monitorBundleSize();
  }
  /**
   * Paint系メトリクスの観測
   */
  observePaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            this.metrics.FCP = Math.round(entry.startTime);
            this.reportMetric("FCP", this.metrics.FCP);
          }
        }
      });
      observer.observe({ entryTypes: ["paint"] });
      this.observers.set("paint", observer);
    } catch (_e) {
      logger.debug("Paint observer not supported");
    }
  }
  /**
   * Largest Contentful Paintの観測
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.LCP = Math.round(lastEntry.startTime);
          this.reportMetric("LCP", this.metrics.LCP);
        }
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.set("lcp", observer);
    } catch (_e) {
      logger.debug("LCP observer not supported");
    }
  }
  /**
   * First Input Delayの観測
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-input") {
            const fidEntry = entry;
            this.metrics.FID = Math.round(fidEntry.processingStart - fidEntry.startTime);
            this.reportMetric("FID", this.metrics.FID);
          }
        }
      });
      observer.observe({ entryTypes: ["first-input"] });
      this.observers.set("fid", observer);
    } catch (_e) {
      logger.debug("FID observer not supported");
    }
  }
  /**
   * Cumulative Layout Shiftの観測
   */
  observeCLS() {
    try {
      let clsValue = 0;
      const clsEntries = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            clsEntries.push(entry);
          }
        }
      });
      observer.observe({ entryTypes: ["layout-shift"] });
      this.observers.set("cls", observer);
      window.addEventListener("beforeunload", () => {
        this.metrics.CLS = Math.round(clsValue * 1e3) / 1e3;
        this.reportMetric("CLS", this.metrics.CLS);
      });
    } catch (_e) {
      logger.debug("CLS observer not supported");
    }
  }
  /**
   * Time to First Byteの計測
   */
  measureTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType(
        "navigation"
      )[0];
      if (navigationEntry) {
        this.metrics.TTFB = Math.round(navigationEntry.responseStart - navigationEntry.fetchStart);
        this.reportMetric("TTFB", this.metrics.TTFB);
      }
    } catch (_e) {
      logger.debug("TTFB measurement not supported");
    }
  }
  /**
   * Interaction to Next Paintの観測
   */
  observeINP() {
    try {
      let maxINP = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const eventEntry = entry;
          if (eventEntry.interactionId) {
            const inp = eventEntry.duration;
            if (inp > maxINP) {
              maxINP = inp;
              this.metrics.INP = Math.round(inp);
              this.reportMetric("INP", this.metrics.INP);
            }
          }
        }
      });
      observer.observe({ entryTypes: ["event"] });
      this.observers.set("inp", observer);
    } catch (_e) {
      logger.debug("INP observer not supported");
    }
  }
  /**
   * メモリ使用量の監視
   */
  monitorMemory() {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMemoryMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        if (usedMemoryMB > totalMemoryMB * 0.8) {
          logger.warn(`High memory usage: ${usedMemoryMB}MB / ${totalMemoryMB}MB`);
        }
      }, 3e4);
    }
  }
  /**
   * バンドルサイズの監視
   */
  monitorBundleSize() {
    const resources = performance.getEntriesByType("resource");
    const jsResources = resources.filter((r) => r.name.endsWith(".js"));
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
    if (totalSizeMB > 1) {
      logger.warn(`Large bundle size detected: ${totalSizeMB}MB`);
    }
  }
  /**
   * メトリクスのレポート
   */
  reportMetric(name, value) {
    if (typeof window !== "undefined" && "gtag" in window) {
      window.gtag("event", name, {
        value: Math.round(value),
        metric_value: value,
        metric_delta: value
      });
    }
  }
  /**
   * メトリクスの評価
   */
  getRating(metric, value) {
    const thresholds = {
      FCP: { good: 1800, needs_improvement: 3e3 },
      LCP: { good: 2500, needs_improvement: 4e3 },
      FID: { good: 100, needs_improvement: 300 },
      CLS: { good: 0.1, needs_improvement: 0.25 },
      TTFB: { good: 800, needs_improvement: 1800 },
      INP: { good: 200, needs_improvement: 500 }
    };
    const threshold = thresholds[metric];
    if (!threshold) {
      return "unknown";
    }
    if (value <= threshold.good) {
      return "good";
    }
    if (value <= threshold.needs_improvement) {
      return "needs improvement";
    }
    return "poor";
  }
  /**
   * 現在のメトリクスを取得
   */
  getMetrics() {
    return { ...this.metrics };
  }
  /**
   * 監視を停止
   */
  stopMonitoring() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
};
__name(_PerformanceMonitor, "PerformanceMonitor");
let PerformanceMonitor = _PerformanceMonitor;
const performanceMonitor = new PerformanceMonitor();
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      performanceMonitor.startMonitoring();
    });
  } else {
    performanceMonitor.startMonitoring();
  }
}
export {
  performanceMonitor as default,
  performanceMonitor
};
