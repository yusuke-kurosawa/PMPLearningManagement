var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { v as useNavigate, C as useSearchParams, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { b as useAuth, s as supabase } from "./index-CZZZnLRW.js";
import { C as Card } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { L as Loader2, aw as AlertCircle, av as CheckCircle } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./radix-core-BMsYm0jb.js";
const AuthCallback = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = reactExports.useState("processing");
  const [message, setMessage] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handleAuthCallback = /* @__PURE__ */ __name(async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");
        const error2 = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (error2) {
          setStatus("error");
          setError(errorDescription || error2);
          setMessage("Authentication failed. Please try again.");
          return;
        }
        switch (type) {
          case "signup":
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (sessionError) {
                throw sessionError;
              }
              setStatus("success");
              setMessage("Email confirmed successfully! You can now access your account.");
              setTimeout(() => {
                navigate("/");
              }, 2e3);
            } else {
              setStatus("success");
              setMessage("Email confirmed! Please sign in to continue.");
              setTimeout(() => {
                navigate("/#/auth?mode=login");
              }, 2e3);
            }
            break;
          case "recovery":
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (sessionError) {
                throw sessionError;
              }
              navigate(
                `/#/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=recovery`
              );
            } else {
              throw new Error("Invalid password reset link");
            }
            break;
          default: {
            const { data, error: authError } = await supabase.auth.getSession();
            if (authError) {
              throw authError;
            }
            if (data.session) {
              setStatus("success");
              setMessage("Successfully authenticated! Redirecting to dashboard...");
              const returnTo = sessionStorage.getItem("auth_return_to") || "/";
              sessionStorage.removeItem("auth_return_to");
              setTimeout(() => {
                navigate(returnTo);
              }, 1e3);
            } else {
              setStatus("success");
              setMessage("Authentication completed! Please sign in to continue.");
              setTimeout(() => {
                navigate("/#/auth?mode=login");
              }, 2e3);
            }
            break;
          }
        }
      } catch (error2) {
        setStatus("error");
        setError(error2.message);
        setMessage("Authentication failed. Please try again.");
      }
    }, "handleAuthCallback");
    handleAuthCallback();
  }, [navigate, searchParams]);
  reactExports.useEffect(() => {
    if (isAuthenticated && user && status === "processing") {
      const returnTo = sessionStorage.getItem("auth_return_to") || "/";
      sessionStorage.removeItem("auth_return_to");
      navigate(returnTo);
    }
  }, [isAuthenticated, user, status, navigate]);
  const renderContent = /* @__PURE__ */ __name(() => {
    switch (status) {
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mx-auto h-16 w-16 text-green-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Success!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 animate-spin rounded-full border-b-2 border-primary" }) })
        ] });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mx-auto h-16 w-16 text-red-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Authentication Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: message }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-600 dark:text-red-400", children: [
            "Error: ",
            error
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: /* @__PURE__ */ __name(() => navigate("/#/auth?mode=login"), "onClick"), className: "w-full", children: "Back to Sign In" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => window.location.reload(), "onClick"),
                className: "w-full text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
                children: "Try Again"
              }
            )
          ] })
        ] });
      case "processing":
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mx-auto h-16 w-16 animate-spin text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Processing..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Please wait while we complete your authentication." })
        ] });
    }
  }, "renderContent");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mx-auto w-full max-w-md p-6", children: renderContent() }) });
}, "AuthCallback");
export {
  AuthCallback as default
};
