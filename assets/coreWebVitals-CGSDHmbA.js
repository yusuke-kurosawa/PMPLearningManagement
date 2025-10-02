var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { b2 as x, b3 as S, b4 as L, b5 as E, b6 as $ } from "./vendor-iUsVqwEv.js";
import "./react-vendor-Uy5hwzow.js";
const { logger } = require("../../services/logger");
const _CoreWebVitalsOptimizer = class _CoreWebVitalsOptimizer {
  constructor() {
    this.metrics = /* @__PURE__ */ new Map();
    this.observers = [];
    this.isOptimizationEnabled = true;
    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4e3 },
      inp: { good: 200, needsImprovement: 500 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1800, needsImprovement: 3e3 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };
    this.initializeTracking();
  }
  initializeTracking() {
    if (typeof window === "undefined") {
      return;
    }
    logger.info("🚀 Core Web Vitals optimization system initialized");
    this.trackLCP();
    this.trackINP();
    this.trackCLS();
    this.trackFCP();
    this.trackTTFB();
    this.optimizeLCP();
    this.optimizeINP();
    this.optimizeCLS();
    this.setupAnalyticsReporting();
  }
  trackLCP() {
    x(
      (metric) => {
        this.metrics.set("lcp", metric);
        this.analyzeMetric("lcp", metric.value);
        this.sendToAnalytics("lcp", metric);
      },
      { reportAllChanges: true }
    );
  }
  trackINP() {
    S(
      (metric) => {
        this.metrics.set("inp", metric);
        this.analyzeMetric("inp", metric.value);
        this.sendToAnalytics("inp", metric);
      },
      { reportAllChanges: true }
    );
  }
  trackCLS() {
    L(
      (metric) => {
        this.metrics.set("cls", metric);
        this.analyzeMetric("cls", metric.value);
        this.sendToAnalytics("cls", metric);
      },
      { reportAllChanges: true }
    );
  }
  trackFCP() {
    E(
      (metric) => {
        this.metrics.set("fcp", metric);
        this.analyzeMetric("fcp", metric.value);
        this.sendToAnalytics("fcp", metric);
      },
      { reportAllChanges: true }
    );
  }
  trackTTFB() {
    $(
      (metric) => {
        this.metrics.set("ttfb", metric);
        this.analyzeMetric("ttfb", metric.value);
        this.sendToAnalytics("ttfb", metric);
      },
      { reportAllChanges: true }
    );
  }
  analyzeMetric(metricName, value) {
    const thresholds = this.thresholds[metricName];
    if (!thresholds) {
      return;
    }
    let status = "poor";
    if (value <= thresholds.good) {
      status = "good";
    } else if (value <= thresholds.needsImprovement) {
      status = "needs-improvement";
    }
    logger.info(
      `📊 ${metricName.toUpperCase()}: ${value}${metricName === "cls" ? "" : "ms"} (${status})`
    );
    if (status !== "good" && this.isOptimizationEnabled) {
      this.triggerOptimization(metricName, value, status);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  triggerOptimization(metricName, _value, _status) {
    const optimizations = {
      lcp: /* @__PURE__ */ __name(() => this.optimizeLCPDynamic(), "lcp"),
      inp: /* @__PURE__ */ __name(() => this.optimizeINPDynamic(), "inp"),
      cls: /* @__PURE__ */ __name(() => this.optimizeCLSDynamic(), "cls"),
      fcp: /* @__PURE__ */ __name(() => this.optimizeFCPDynamic(), "fcp"),
      ttfb: /* @__PURE__ */ __name(() => this.optimizeTTFBDynamic(), "ttfb")
    };
    if (optimizations[metricName]) {
      logger.info(`🔧 Triggering ${metricName.toUpperCase()} optimization...`);
      optimizations[metricName]();
    }
  }
  // LCP Optimization Strategies
  optimizeLCP() {
    this.preloadCriticalResources();
    this.optimizeImages();
    this.eliminateRenderBlocking();
  }
  optimizeLCPDynamic() {
    const largestElements = this.findLargestContentfulElements();
    largestElements.forEach((element) => {
      if (element.tagName === "IMG") {
        this.optimizeImageElement(element);
      } else if (element.tagName === "VIDEO") {
        this.optimizeVideoElement(element);
      }
    });
  }
  findLargestContentfulElements() {
    const elements = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.element) {
          elements.push(entry.element);
        }
      }
    });
    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      logger.warn("LCP observer not supported");
    }
    return elements;
  }
  preloadCriticalResources() {
    const criticalResources = [
      "/assets/css/critical.css",
      "/assets/fonts/inter-var.woff2",
      "/assets/js/critical.js"
    ];
    criticalResources.forEach((resource) => {
      if (!document.querySelector(`link[href="${resource}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = resource;
        if (resource.endsWith(".css")) {
          link.as = "style";
        } else if (resource.endsWith(".woff2")) {
          link.as = "font";
          link.type = "font/woff2";
          link.crossOrigin = "anonymous";
        } else if (resource.endsWith(".js")) {
          link.as = "script";
        }
        document.head.appendChild(link);
      }
    });
  }
  optimizeImages() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
              }
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: "50px"
        }
      );
      images.forEach((img) => imageObserver.observe(img));
    }
  }
  optimizeImageElement(img) {
    if (!img.srcset && img.src) {
      const baseSrc = img.src.replace(/\.[^/.]+$/, "");
      const ext = img.src.split(".").pop();
      img.srcset = [
        `${baseSrc}_400w.${ext} 400w`,
        `${baseSrc}_800w.${ext} 800w`,
        `${baseSrc}_1200w.${ext} 1200w`
      ].join(", ");
      img.sizes = "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px";
    }
    if (!img.loading) {
      img.loading = "lazy";
    }
    if (!img.decode) {
      img.decode = "async";
    }
  }
  eliminateRenderBlocking() {
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    nonCriticalCSS.forEach((link) => {
      const newLink = document.createElement("link");
      newLink.rel = "preload";
      newLink.as = "style";
      newLink.href = link.href;
      newLink.onload = function() {
        this.onload = null;
        this.rel = "stylesheet";
      };
      document.head.appendChild(newLink);
      link.remove();
    });
  }
  // INP Optimization Strategies
  optimizeINP() {
    this.breakUpLongTasks();
    this.delegateToWebWorkers();
    this.optimizeEventHandlers();
  }
  optimizeINPDynamic() {
    if ("PerformanceLongTaskTiming" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            logger.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });
      try {
        observer.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        logger.warn("Long task observer not supported");
      }
    }
  }
  breakUpLongTasks() {
    window.yieldToMain = function() {
      return new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    };
  }
  delegateToWebWorkers() {
    if (typeof Worker !== "undefined") {
      try {
        const workerBlob = new Blob(
          [
            `
          self.onmessage = function(e) {
            const { type, data } = e.data;
            
            switch(type) {
              case 'heavy-computation':
                // Perform heavy computation
                const result = performHeavyComputation(data);
                self.postMessage({ type: 'computation-result', result });
                break;
            }
          };
          
          function performHeavyComputation(data) {
            // Placeholder for heavy computation
            return data;
          }
        `
          ],
          { type: "application/javascript" }
        );
        this.worker = new Worker(URL.createObjectURL(workerBlob));
        this.worker.onmessage = (e) => {
          const { type } = e.data;
          if (type === "computation-result") {
            logger.info("Web worker computation completed");
          }
        };
      } catch (e) {
        logger.warn("Web worker creation failed:", e);
      }
    }
  }
  optimizeEventHandlers() {
    const passiveEvents = ["touchstart", "touchmove", "wheel", "scroll"];
    passiveEvents.forEach((_eventType) => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (passiveEvents.includes(type) && typeof options !== "object") {
          options = { passive: true };
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });
  }
  // CLS Optimization Strategies
  optimizeCLS() {
    this.setExplicitDimensions();
    this.preloadFonts();
    this.reserveSpaceForDynamicContent();
  }
  optimizeCLSDynamic() {
    if ("LayoutShift" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) {
            continue;
          }
          logger.warn(`Layout shift detected: ${entry.value}`);
          this.fixLayoutShift(entry);
        }
      });
      try {
        observer.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        logger.warn("Layout shift observer not supported");
      }
    }
  }
  setExplicitDimensions() {
    const images = document.querySelectorAll("img:not([width]):not([height])");
    images.forEach((img) => {
      img.style.aspectRatio = "16 / 9";
    });
    const dynamicContainers = document.querySelectorAll("[data-dynamic-content]");
    dynamicContainers.forEach((container) => {
      if (!container.style.minHeight) {
        container.style.minHeight = "200px";
      }
    });
  }
  preloadFonts() {
    const criticalFonts = ["/assets/fonts/inter-var.woff2", "/assets/fonts/inter-bold.woff2"];
    criticalFonts.forEach((fontUrl) => {
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "font";
        link.type = "font/woff2";
        link.crossOrigin = "anonymous";
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    });
  }
  reserveSpaceForDynamicContent() {
    const asyncComponents = document.querySelectorAll("[data-async-component]");
    asyncComponents.forEach((component) => {
      const placeholder = document.createElement("div");
      placeholder.style.height = component.dataset.expectedHeight || "300px";
      placeholder.style.backgroundColor = "#f0f0f0";
      placeholder.style.borderRadius = "4px";
      placeholder.className = "async-placeholder";
      component.parentNode.insertBefore(placeholder, component);
      const observer = new MutationObserver(() => {
        if (component.children.length > 0) {
          placeholder.remove();
          observer.disconnect();
        }
      });
      observer.observe(component, { childList: true });
    });
  }
  fixLayoutShift(entry) {
    entry.sources.forEach((source) => {
      if (source.node) {
        const element = source.node;
        if (!element.style.transition) {
          element.style.transition = "all 0.2s ease-out";
        }
      }
    });
  }
  // Analytics and Reporting
  setupAnalyticsReporting() {
    this.sendToGoogleAnalytics();
    this.sendToCustomDashboard();
  }
  sendToAnalytics(metricName, metric) {
    if (typeof gtag !== "undefined") {
      gtag("event", metricName, {
        event_category: "Core Web Vitals",
        event_label: metricName.toUpperCase(),
        value: Math.round(metric.value),
        custom_map: { metric_id: metric.id }
      });
    }
    this.sendToCustomAnalytics(metricName, metric);
  }
  sendToGoogleAnalytics() {
    if (typeof gtag !== "undefined") {
      gtag("config", "GA_MEASUREMENT_ID", {
        custom_map: {
          lcp: "largest_contentful_paint",
          inp: "interaction_to_next_paint",
          cls: "cumulative_layout_shift"
        }
      });
    }
  }
  sendToCustomAnalytics(metricName, metric) {
    var _a;
    const payload = {
      metric: metricName,
      value: metric.value,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: ((_a = navigator.connection) == null ? void 0 : _a.effectiveType) || "unknown"
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/core-web-vitals", JSON.stringify(payload));
    } else {
      fetch("/api/analytics/core-web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(console.error);
    }
  }
  sendToCustomDashboard() {
    setTimeout(() => {
      const allMetrics = {};
      this.metrics.forEach((metric, name) => {
        var _a, _b;
        allMetrics[name] = {
          value: metric.value,
          rating: this.getMetricRating(name, metric.value),
          timestamp: ((_b = (_a = metric.entries) == null ? void 0 : _a[0]) == null ? void 0 : _b.startTime) || Date.now()
        };
      });
      this.sendToDashboard(allMetrics);
    }, 5e3);
  }
  getMetricRating(metricName, value) {
    const thresholds = this.thresholds[metricName];
    if (!thresholds) {
      return "unknown";
    }
    if (value <= thresholds.good) {
      return "good";
    }
    if (value <= thresholds.needsImprovement) {
      return "needs-improvement";
    }
    return "poor";
  }
  sendToDashboard(metrics) {
    const payload = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
    fetch("/api/dashboard/core-web-vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(console.error);
  }
  // Optimization Features
  optimizeFCPDynamic() {
    this.removeUnusedCSS();
    this.optimizeCriticalRenderingPath();
  }
  optimizeTTFBDynamic() {
    this.optimizeServerResponse();
    this.optimizeCDN();
  }
  removeUnusedCSS() {
    logger.info("💡 Consider using PurgeCSS to remove unused CSS");
  }
  optimizeCriticalRenderingPath() {
    const criticalCSS = this.extractCriticalCSS();
    if (criticalCSS) {
      const style = document.createElement("style");
      style.textContent = criticalCSS;
      document.head.insertBefore(style, document.head.firstChild);
    }
  }
  extractCriticalCSS() {
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .critical { display: block; }
      .loader { animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
  }
  optimizeServerResponse() {
    logger.info("💡 Consider implementing server-side caching and CDN");
  }
  optimizeCDN() {
    logger.info("💡 Consider using a CDN for static assets");
  }
  // Cleanup
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
};
__name(_CoreWebVitalsOptimizer, "CoreWebVitalsOptimizer");
let CoreWebVitalsOptimizer = _CoreWebVitalsOptimizer;
const webVitalsOptimizer = new CoreWebVitalsOptimizer();
export {
  webVitalsOptimizer as default
};
