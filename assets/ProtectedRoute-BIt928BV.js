var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { j as jsxRuntimeExports, w as useLocation, N as Navigate } from "./react-vendor-Uy5hwzow.js";
import { b as useAuth } from "./index-CZZZnLRW.js";
import { m as motion } from "./framer-motion-f1HlQ5oK.js";
import { L as Loader2, aI as Lock, aw as AlertCircle } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const ProtectedRoute = /* @__PURE__ */ __name(({
  children,
  requireAuth = true,
  requiredRole = null,
  requiredPermission = null,
  roles: _roles = [],
  permissions: _permissions = [],
  redirectTo = "/login",
  fallback = null
}) => {
  const location = useLocation();
  const { isAuthenticated, loading, hasRole, hasPermission } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
        className: "text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading..." })
        ]
      }
    ) });
  }
  if (requireAuth && !isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: redirectTo, state: { from: location }, replace: true });
  }
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return fallback;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "w-full max-w-md px-4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-8 text-center shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8 text-red-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-6 text-gray-600", children: [
            "You don't have permission to access this page. Required role: ",
            requiredRole
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => window.history.back(), "onClick"),
              className: "rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-150 hover:bg-blue-700",
              children: "Go Back"
            }
          )
        ] })
      }
    ) });
  }
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return fallback;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "w-full max-w-md px-4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-8 text-center shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-8 w-8 text-yellow-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900", children: "Insufficient Permissions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-gray-600", children: "You need additional permissions to access this feature." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.history.back(), "onClick"),
                className: "w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-150 hover:bg-blue-700",
                children: "Go Back"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.location.href = "/profile/permissions", "onClick"),
                className: "w-full rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition duration-150 hover:bg-gray-300",
                children: "Request Access"
              }
            )
          ] })
        ] })
      }
    ) });
  }
  return children;
}, "ProtectedRoute");
const withProtectedRoute = /* @__PURE__ */ __name((Component, options = {}) => {
  const WrappedComponent = /* @__PURE__ */ __name((props) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { ...options, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Component, { ...props }) }), "WrappedComponent");
  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  return WrappedComponent;
}, "withProtectedRoute");
const AdminRoute = /* @__PURE__ */ __name(({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requiredRole: "admin", ...props, children }), "AdminRoute");
const InstructorRoute = /* @__PURE__ */ __name(({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requiredRole: "instructor", ...props, children }), "InstructorRoute");
const StudentRoute = /* @__PURE__ */ __name(({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requiredRole: "student", ...props, children }), "StudentRoute");
export {
  AdminRoute,
  InstructorRoute,
  StudentRoute,
  ProtectedRoute as default,
  withProtectedRoute
};
