var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports, v as useNavigate, w as useLocation } from "./react-vendor-Uy5hwzow.js";
import { d as cn, l as logger, S as SkipLinks } from "./index-CZZZnLRW.js";
import { B as Button } from "./button-C-u1QTim.js";
import { R as Root, T as Trigger, P as Portal, C as Content, a as Close, b as Title, D as Description, O as Overlay } from "./radix-dialog-BaBLP_7R.js";
import { b1 as cva } from "./vendor-iUsVqwEv.js";
import { X, a0 as Menu, W as Wifi, a as WifiOff, b1 as Smartphone, H as Home, G as Grid3x3, N as Network, l as Layers, n as BookOpen, v as BarChart3, o as Brain, p as GraduationCap, s as Users, D as Download, b2 as Share, b3 as Battery, B as Bell } from "./lucide-icons-B7slfWYt.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { S as Switch } from "./switch-CbteSnd0.js";
import "./radix-core-BMsYm0jb.js";
const Sheet = Root;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] })
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
__name(genId, "genId");
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = /* @__PURE__ */ __name((toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
}, "addToRemoveQueue");
const reducer = /* @__PURE__ */ __name((state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
}, "reducer");
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
__name(dispatch, "dispatch");
function toast({ ...props }) {
  const id = genId();
  const update = /* @__PURE__ */ __name((props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  }), "update");
  const dismiss = /* @__PURE__ */ __name(() => dispatch({ type: "DISMISS_TOAST", toastId: id }), "dismiss");
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: /* @__PURE__ */ __name((open) => {
        if (!open) {
          dismiss();
        }
      }, "onOpenChange")
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
__name(toast, "toast");
function useToast() {
  const [state, setState] = reactExports.useState(memoryState);
  reactExports.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: /* @__PURE__ */ __name((toastId) => dispatch({ type: "DISMISS_TOAST", toastId }), "dismiss")
  };
}
__name(useToast, "useToast");
const MobileOptimizedApp = /* @__PURE__ */ __name(({ children }) => {
  const { toast: toast2 } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [pwaCapabilities, setPwaCapabilities] = reactExports.useState({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: navigator.onLine,
    hasNotifications: "Notification" in window,
    hasPushNotifications: "PushManager" in window,
    hasBackgroundSync: "serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype,
    hasPeriodicBackgroundSync: "serviceWorker" in navigator && "periodicSync" in window.ServiceWorkerRegistration.prototype,
    supportsTouchGestures: "ontouchstart" in window,
    supportsVibration: "vibrate" in navigator,
    supportsBatteryAPI: "getBattery" in navigator,
    supportsNetworkInformation: "connection" in navigator
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = reactExports.useState(false);
  const [deviceInfo, setDeviceInfo] = reactExports.useState({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  });
  const [touchStart, setTouchStart] = reactExports.useState(null);
  const [activeGestures, setActiveGestures] = reactExports.useState([]);
  const swipeThreshold = 100;
  const longPressThreshold = 500;
  const [isDarkMode, setIsDarkMode] = reactExports.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = reactExports.useState(false);
  const [offlineMode, setOfflineMode] = reactExports.useState(false);
  const [installPromptEvent, setInstallPromptEvent] = reactExports.useState(
    null
  );
  const appRef = reactExports.useRef(null);
  const touchTimeoutRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    initializePWA();
    registerTouchGestures();
    monitorDeviceInfo();
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);
  const initializePWA = /* @__PURE__ */ __name(async () => {
    const isStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone || document.referrer.includes("android-app://");
    setPwaCapabilities((prev) => ({
      ...prev,
      isStandalone,
      isInstalled: isStandalone
    }));
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setPwaCapabilities((prev) => ({ ...prev, canInstall: true }));
    });
    window.addEventListener("appinstalled", () => {
      setPwaCapabilities((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
      toast2({
        title: "App Installed",
        description: "PMP Learning Management has been installed successfully!"
      });
    });
    window.addEventListener("online", () => {
      setPwaCapabilities((prev) => ({ ...prev, isOnline: true }));
      setOfflineMode(false);
      toast2({
        title: "Back Online",
        description: "Syncing your data..."
      });
    });
    window.addEventListener("offline", () => {
      setPwaCapabilities((prev) => ({ ...prev, isOnline: false }));
      setOfflineMode(true);
      toast2({
        title: "Offline Mode",
        description: "Your progress will be saved locally.",
        variant: "destructive"
      });
    });
    if ("Notification" in window && window.Notification) {
      if (Notification.permission === "default") {
        try {
          const permission = await Notification.requestPermission();
          setNotificationsEnabled(permission === "granted");
        } catch (_error) {
          setNotificationsEnabled(false);
        }
      } else {
        setNotificationsEnabled(Notification.permission === "granted");
      }
    } else {
      setNotificationsEnabled(false);
    }
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        if (false) ;
      } catch (error) {
      }
    }
  }, "initializePWA");
  const registerTouchGestures = /* @__PURE__ */ __name(() => {
    if (!appRef.current || !pwaCapabilities.supportsTouchGestures) {
      return;
    }
    const element = appRef.current;
    const handleTouchMove = /* @__PURE__ */ __name((_e) => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }, "handleTouchMove");
    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });
  }, "registerTouchGestures");
  const handleTouchStart = /* @__PURE__ */ __name((e) => {
    const touch = e.touches[0];
    const startTime = Date.now();
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: startTime
    });
    touchTimeoutRef.current = setTimeout(() => {
      if (pwaCapabilities.supportsVibration) {
        navigator.vibrate(50);
      }
      const gesture = {
        type: "longPress",
        startX: touch.clientX,
        startY: touch.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        duration: longPressThreshold,
        distance: 0
      };
      handleGesture(gesture);
    }, longPressThreshold);
  }, "handleTouchStart");
  const handleTouchEnd = /* @__PURE__ */ __name((e) => {
    if (!touchStart) {
      return;
    }
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - touchStart.time;
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (duration < 200 && distance < 10) {
      const gesture = {
        type: "tap",
        startX: touchStart.x,
        startY: touchStart.y,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance
      };
      handleGesture(gesture);
    } else if (distance > swipeThreshold) {
      let direction;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }
      const gesture = {
        type: "swipe",
        direction,
        startX: touchStart.x,
        startY: touchStart.y,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance
      };
      handleGesture(gesture);
    }
    setTouchStart(null);
  }, "handleTouchEnd");
  const handleGesture = /* @__PURE__ */ __name((gesture) => {
    setActiveGestures((prev) => [...prev.slice(-4), gesture]);
    switch (gesture.type) {
      case "swipe":
        if (gesture.direction === "right" && gesture.startX < 50) {
          setIsMobileMenuOpen(true);
        } else if (gesture.direction === "left" && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        break;
      case "longPress":
        if (pwaCapabilities.supportsVibration) {
          navigator.vibrate([100, 50, 100]);
        }
        break;
    }
  }, "handleGesture");
  const monitorDeviceInfo = /* @__PURE__ */ __name(() => {
    const handleResize = /* @__PURE__ */ __name(() => {
      setDeviceInfo((prev) => ({
        ...prev,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024,
        orientation: window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      }));
    }, "handleResize");
    const updateBatteryInfo = /* @__PURE__ */ __name(async () => {
      var _a;
      if ("getBattery" in navigator) {
        try {
          const extendedNavigator = navigator;
          const battery = await ((_a = extendedNavigator.getBattery) == null ? void 0 : _a.call(extendedNavigator));
          if (battery) {
            setDeviceInfo((prev) => ({
              ...prev,
              battery: {
                level: Math.round(battery.level * 100),
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
              }
            }));
          }
        } catch (_error) {
        }
      }
    }, "updateBatteryInfo");
    const updateNetworkInfo = /* @__PURE__ */ __name(() => {
      if ("connection" in navigator) {
        const extendedNavigator = navigator;
        const connection = extendedNavigator.connection;
        if (connection) {
          setDeviceInfo((prev) => ({
            ...prev,
            network: {
              effectiveType: connection.effectiveType,
              downlink: connection.downlink,
              saveData: connection.saveData
            }
          }));
        }
      }
    }, "updateNetworkInfo");
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    updateBatteryInfo();
    updateNetworkInfo();
    const interval = setInterval(() => {
      updateBatteryInfo();
      updateNetworkInfo();
    }, 6e4);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearInterval(interval);
    };
  }, "monitorDeviceInfo");
  const handleInstallApp = /* @__PURE__ */ __name(async () => {
    if (!installPromptEvent) {
      return;
    }
    try {
      const result = await installPromptEvent.prompt();
      if (false) ;
      setInstallPromptEvent(null);
      setPwaCapabilities((prev) => ({ ...prev, canInstall: false }));
    } catch (error) {
    }
  }, "handleInstallApp");
  const handleShareApp = /* @__PURE__ */ __name(async () => {
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: "PMP Learning Management",
          text: "Check out this awesome PMP study app!",
          url: window.location.href
        });
      } catch (error) {
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast2({
        title: "Link Copied",
        description: "App link copied to clipboard"
      });
    }
  }, "handleShareApp");
  const toggleNotifications = /* @__PURE__ */ __name(async () => {
    if (!notificationsEnabled && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      if (permission === "granted") {
        toast2({
          title: "Notifications Enabled",
          description: "You'll now receive study reminders and updates"
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  }, "toggleNotifications");
  const navigation = [
    { id: "home", label: "ホーム", icon: Home, href: "/" },
    { id: "matrix", label: "マトリックス", icon: Grid3x3, href: "/matrix" },
    { id: "network", label: "ネットワーク", icon: Network, href: "/network" },
    { id: "visualizations", label: "視覚化", icon: Layers, href: "/visualizations" },
    { id: "glossary", label: "用語集", icon: BookOpen, href: "/glossary" },
    { id: "progress", label: "進捗", icon: BarChart3, href: "/progress" },
    { id: "flashcards", label: "フラッシュカード", icon: Brain, href: "/flashcards" },
    { id: "mock-exam", label: "模擬試験", icon: GraduationCap, href: "/mock-exam" },
    { id: "collaboration", label: "コラボ", icon: Users, href: "/collaboration" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: appRef, className: `min-h-screen bg-gray-50 ${isDarkMode ? "dark" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SkipLinks, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "header",
      {
        id: "navigation",
        className: "sticky top-0 z-50 border-b border-gray-200 bg-white md:hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: isMobileMenuOpen, onOpenChange: setIsMobileMenuOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", "aria-label": "メニューを開く", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "w-80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "PMP Learning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Mobile Study App" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: pwaCapabilities.isOnline ? "default" : "destructive",
                      className: "flex items-center gap-1",
                      children: [
                        pwaCapabilities.isOnline ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-3 w-3" }),
                        pwaCapabilities.isOnline ? "Online" : "Offline"
                      ]
                    }
                  ),
                  pwaCapabilities.isInstalled && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3 w-3" }),
                    "Installed"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-2", children: navigation.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: location.pathname === item.href ? "secondary" : "ghost",
                    className: "w-full justify-start",
                    onClick: /* @__PURE__ */ __name(() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }, "onClick"),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "mr-3 h-4 w-4" }),
                      item.label
                    ]
                  },
                  item.id
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t pt-4", children: [
                  pwaCapabilities.canInstall && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: handleInstallApp, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
                    "Install App"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: handleShareApp, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "mr-2 h-4 w-4" }),
                    "Share App"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t pt-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Dark Mode" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isDarkMode, onCheckedChange: setIsDarkMode })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Notifications" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: notificationsEnabled, onCheckedChange: toggleNotifications })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 text-sm font-medium text-gray-700", children: "Device Info" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-gray-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Screen:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        deviceInfo.screenWidth,
                        " × ",
                        deviceInfo.screenHeight
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Orientation:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: deviceInfo.orientation })
                    ] }),
                    deviceInfo.battery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Battery:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Battery, { className: "h-3 w-3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          deviceInfo.battery.level,
                          "%"
                        ] })
                      ] })
                    ] }),
                    deviceInfo.network && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Network:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: deviceInfo.network.effectiveType })
                    ] })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold", children: "PMP Learning" }),
            !pwaCapabilities.isOnline && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "mr-1 h-3 w-3" }),
              "Offline"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            pwaCapabilities.canInstall && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handleInstallApp,
                "aria-label": "アプリをインストール",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", "aria-label": "通知", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { id: "main-content", className: `${deviceInfo.isMobile ? "pb-16" : ""}`, children }),
    deviceInfo.isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around py-2", children: navigation.slice(0, 4).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: location.pathname === item.href ? "secondary" : "ghost",
        size: "sm",
        className: "flex flex-col items-center gap-1 py-2",
        onClick: /* @__PURE__ */ __name(() => navigate(item.href), "onClick"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: item.label })
        ]
      },
      item.id
    )) }) }),
    offlineMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed left-0 right-0 top-0 z-50 bg-yellow-500 py-2 text-center text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-4 w-4" }),
      "You're offline - changes will sync when connection is restored"
    ] }) }),
    pwaCapabilities.canInstall && !pwaCapabilities.isInstalled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-16 left-4 right-4 z-40 rounded-lg bg-blue-600 p-4 text-white shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 text-sm font-semibold", children: "Install PMP Learning App" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs opacity-90", children: "Get quick access and offline functionality by installing our app" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", onClick: handleInstallApp, children: "Install" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "text-white hover:text-white",
              onClick: /* @__PURE__ */ __name(() => setPwaCapabilities((prev) => ({ ...prev, canInstall: false })), "onClick"),
              children: "Later"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "p-1 text-white hover:text-white",
          onClick: /* @__PURE__ */ __name(() => setPwaCapabilities((prev) => ({ ...prev, canInstall: false })), "onClick"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    false
  ] });
}, "MobileOptimizedApp");
export {
  MobileOptimizedApp as default
};
