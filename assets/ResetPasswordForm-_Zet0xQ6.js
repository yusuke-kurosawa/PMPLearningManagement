var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { C as useSearchParams, v as useNavigate, r as reactExports, B as useForm, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { t, o as objectType, s as stringType } from "./validation-CGVxFmqx.js";
import { b as useAuth, c as authValidation } from "./index-CZZZnLRW.js";
import { B as Button } from "./button-C-u1QTim.js";
import { I as Input } from "./input-DOiCTpzp.js";
import { L as Label } from "./label-XIKEmFX2.js";
import { C as Card } from "./card-DxIMXhob.js";
import { av as CheckCircle, aw as AlertCircle, aI as Lock, ac as EyeOff, aa as Eye, L as Loader2 } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./radix-core-BMsYm0jb.js";
const resetPasswordSchema = objectType({
  password: stringType().min(8, "Password must be at least 8 characters").refine((password) => authValidation.isValidPassword(password).isValid, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  confirmPassword: stringType().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
const ResetPasswordForm = /* @__PURE__ */ __name(() => {
  var _a;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [passwordStrength, setPasswordStrength] = reactExports.useState(0);
  const [isPasswordReset, setIsPasswordReset] = reactExports.useState(false);
  const [isValidToken, setIsValidToken] = reactExports.useState(true);
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const type = searchParams.get("type");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: t(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
    mode: "onChange"
  });
  const watchPassword = watch("password");
  reactExports.useEffect(() => {
    if (watchPassword) {
      const strength = authValidation.getPasswordStrength(watchPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);
  reactExports.useEffect(() => {
    if (!accessToken || !refreshToken || type !== "recovery") {
      setIsValidToken(false);
    }
  }, [accessToken, refreshToken, type]);
  const onSubmit = /* @__PURE__ */ __name(async (data) => {
    var _a2, _b;
    try {
      clearError();
      clearErrors();
      await updatePassword(data.password);
      setIsPasswordReset(true);
    } catch (error2) {
      if ((_a2 = error2.message) == null ? void 0 : _a2.includes("Password should be at least")) {
        setError("password", {
          type: "manual",
          message: "Password is too weak. Please choose a stronger password."
        });
      } else if ((_b = error2.message) == null ? void 0 : _b.includes("Token expired")) {
        setError("root", {
          type: "manual",
          message: "The reset link has expired. Please request a new password reset."
        });
      } else {
        setError("root", {
          type: "manual",
          message: error2.message || "Failed to reset password. Please try again."
        });
      }
    }
  }, "onSubmit");
  const handleInputChange = /* @__PURE__ */ __name(() => {
    if (error || errors.root) {
      clearError();
      clearErrors();
    }
  }, "handleInputChange");
  const getPasswordStrengthColor = /* @__PURE__ */ __name(() => {
    if (passwordStrength < 30) {
      return "bg-red-500";
    }
    if (passwordStrength < 60) {
      return "bg-yellow-500";
    }
    if (passwordStrength < 80) {
      return "bg-blue-500";
    }
    return "bg-green-500";
  }, "getPasswordStrengthColor");
  const getPasswordStrengthText = /* @__PURE__ */ __name(() => {
    if (passwordStrength < 30) {
      return "Weak";
    }
    if (passwordStrength < 60) {
      return "Fair";
    }
    if (passwordStrength < 80) {
      return "Good";
    }
    return "Strong";
  }, "getPasswordStrengthText");
  if (isPasswordReset) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mx-auto w-full max-w-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mx-auto h-16 w-16 text-green-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Password Reset Successfully!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: "Your password has been updated. You can now sign in with your new password." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: /* @__PURE__ */ __name(() => navigate("/#/auth?mode=login"), "onClick"), className: "w-full", children: "Continue to Sign In" })
    ] }) }) });
  }
  if (!isValidToken) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mx-auto w-full max-w-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mx-auto h-16 w-16 text-red-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Invalid Reset Link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: "This password reset link is invalid or has expired. Please request a new password reset." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: /* @__PURE__ */ __name(() => navigate("/#/auth?mode=forgot-password"), "onClick"), className: "w-full", children: "Request New Reset Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: /* @__PURE__ */ __name(() => navigate("/#/auth?mode=login"), "onClick"),
            className: "w-full",
            children: "Back to Sign In"
          }
        )
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mx-auto w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Set New Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Choose a strong password for your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      (error || errors.root) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error || ((_a = errors.root) == null ? void 0 : _a.message) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-medium", children: "New Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "password",
              type: showPassword ? "text" : "password",
              placeholder: "Create a strong password",
              className: `pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`,
              ...register("password"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("password").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600",
              onClick: /* @__PURE__ */ __name(() => setShowPassword(!showPassword), "onClick"),
              disabled: loading || isSubmitting,
              children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        watchPassword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Password strength:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-xs font-medium ${passwordStrength >= 60 ? "text-green-600" : "text-red-600"}`,
                children: getPasswordStrengthText()
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`,
              style: { width: `${passwordStrength}%` }
            }
          ) })
        ] }),
        errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmPassword", className: "text-sm font-medium", children: "Confirm New Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "confirmPassword",
              type: showConfirmPassword ? "text" : "password",
              placeholder: "Confirm your new password",
              className: `pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`,
              ...register("confirmPassword"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("confirmPassword").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600",
              onClick: /* @__PURE__ */ __name(() => setShowConfirmPassword(!showConfirmPassword), "onClick"),
              disabled: loading || isSubmitting,
              children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.confirmPassword.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || isSubmitting, children: loading || isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Updating password..."
      ] }) : "Update Password" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Password Requirements:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• At least 8 characters long" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Contains at least one uppercase letter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Contains at least one lowercase letter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Contains at least one number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Special characters are recommended" })
      ] })
    ] })
  ] }) });
}, "ResetPasswordForm");
export {
  ResetPasswordForm as default
};
