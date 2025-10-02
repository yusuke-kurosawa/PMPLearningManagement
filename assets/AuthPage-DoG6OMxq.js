var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, B as useForm, j as jsxRuntimeExports, R as React, C as useSearchParams, v as useNavigate } from "./react-vendor-Uy5hwzow.js";
import { b as useAuth, c as authValidation, R as ROLES } from "./index-CZZZnLRW.js";
import { t, o as objectType, s as stringType, b as booleanType, e as enumType } from "./validation-CGVxFmqx.js";
import { B as Button } from "./button-C-u1QTim.js";
import { I as Input } from "./input-DOiCTpzp.js";
import { L as Label } from "./label-XIKEmFX2.js";
import { C as Card } from "./card-DxIMXhob.js";
import { a$ as Mail, aI as Lock, ac as EyeOff, aa as Eye, L as Loader2, av as CheckCircle, U as User, at as ArrowLeft, a5 as Github } from "./lucide-icons-B7slfWYt.js";
import { m as motion, A as AnimatePresence } from "./framer-motion-f1HlQ5oK.js";
import "./vendor-iUsVqwEv.js";
import "./radix-core-BMsYm0jb.js";
const loginSchema = objectType({
  email: stringType().min(1, "Email is required").email("Please enter a valid email address").refine((email) => authValidation.isValidEmail(email), {
    message: "Please enter a valid email address"
  }),
  password: stringType().min(1, "Password is required")
});
const LoginForm = /* @__PURE__ */ __name(({ onToggleMode, onForgotPassword }) => {
  var _a;
  const { signIn, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [rememberMe, setRememberMe] = reactExports.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: t(loginSchema),
    defaultValues: {
      email: localStorage.getItem("pmp-remembered-email") || "",
      password: ""
    }
  });
  const onSubmit = /* @__PURE__ */ __name(async (data) => {
    var _a2, _b;
    try {
      clearError();
      clearErrors();
      await signIn({
        email: data.email,
        password: data.password
      });
      if (rememberMe) {
        localStorage.setItem("pmp-remembered-email", data.email);
      } else {
        localStorage.removeItem("pmp-remembered-email");
      }
    } catch (error2) {
      if ((_a2 = error2.message) == null ? void 0 : _a2.includes("Invalid login credentials")) {
        setError("root", {
          type: "manual",
          message: "Invalid email or password. Please check your credentials and try again."
        });
      } else if ((_b = error2.message) == null ? void 0 : _b.includes("Email not confirmed")) {
        setError("root", {
          type: "manual",
          message: "Please check your email and click the confirmation link before signing in."
        });
      } else {
        setError("root", {
          type: "manual",
          message: error2.message || "Failed to sign in. Please try again."
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mx-auto w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Welcome Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Sign in to your PMP Learning account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      (error || errors.root) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error || ((_a = errors.root) == null ? void 0 : _a.message) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-medium", children: "Email Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "Enter your email",
              className: `pl-10 ${errors.email ? "border-red-500" : ""}`,
              ...register("email"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("email").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          )
        ] }),
        errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.email.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-medium", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "password",
              type: showPassword ? "text" : "password",
              placeholder: "Enter your password",
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
              className: "absolute right-3 top-3 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              onClick: /* @__PURE__ */ __name(() => setShowPassword(!showPassword), "onClick"),
              disabled: loading || isSubmitting,
              "aria-label": showPassword ? "Hide password" : "Show password",
              "aria-pressed": showPassword,
              children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "remember-me",
              type: "checkbox",
              checked: rememberMe,
              onChange: /* @__PURE__ */ __name((e) => setRememberMe(e.target.checked), "onChange"),
              className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
              disabled: loading || isSubmitting
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "remember-me", className: "ml-2 text-sm text-gray-600 dark:text-gray-400", children: "Remember me" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onForgotPassword,
            className: "text-sm font-medium text-primary hover:text-primary/80",
            disabled: loading || isSubmitting,
            children: "Forgot password?"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || isSubmitting, children: loading || isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Signing in..."
      ] }) : "Sign In" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onToggleMode,
          className: "font-medium text-primary hover:text-primary/80",
          disabled: loading || isSubmitting,
          children: "Sign up for free"
        }
      )
    ] }) })
  ] });
}, "LoginForm");
const registerSchema = objectType({
  name: stringType().min(1, "Full name is required").min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").regex(/^[a-zA-Z\\s]+$/, "Name can only contain letters and spaces"),
  email: stringType().min(1, "Email is required").email("Please enter a valid email address").refine((email) => authValidation.isValidEmail(email), {
    message: "Please enter a valid email address"
  }),
  password: stringType().min(8, "Password must be at least 8 characters").refine((password) => authValidation.isValidPassword(password).isValid, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  confirmPassword: stringType().min(1, "Please confirm your password"),
  role: enumType([ROLES.STUDENT, ROLES.INSTRUCTOR], {
    required_error: "Please select a role"
  }),
  agreedToTerms: booleanType().refine((val) => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
const RegisterForm = /* @__PURE__ */ __name(({ onToggleMode }) => {
  var _a;
  const { signUp, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [passwordStrength, setPasswordStrength] = reactExports.useState(0);
  const [isRegistered, setIsRegistered] = reactExports.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: t(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: ROLES.STUDENT,
      agreedToTerms: false
    },
    mode: "onChange"
  });
  const watchPassword = watch("password");
  React.useEffect(() => {
    if (watchPassword) {
      const strength = authValidation.getPasswordStrength(watchPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);
  const onSubmit = /* @__PURE__ */ __name(async (data) => {
    var _a2, _b;
    try {
      clearError();
      clearErrors();
      const result = await signUp({
        email: data.email,
        password: data.password,
        userData: {
          name: data.name,
          full_name: data.name,
          role: data.role
        }
      });
      if (result.requiresConfirmation) {
        setIsRegistered(true);
      }
    } catch (error2) {
      if ((_a2 = error2.message) == null ? void 0 : _a2.includes("User already registered")) {
        setError("email", {
          type: "manual",
          message: "An account with this email already exists. Try signing in instead."
        });
      } else if ((_b = error2.message) == null ? void 0 : _b.includes("Password should be at least")) {
        setError("password", {
          type: "manual",
          message: "Password is too weak. Please choose a stronger password."
        });
      } else {
        setError("root", {
          type: "manual",
          message: error2.message || "Failed to create account. Please try again."
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
  if (isRegistered) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mx-auto w-full max-w-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mx-auto h-16 w-16 text-green-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Account Created!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: "We've sent a confirmation email to your inbox. Please click the link in the email to verify your account before signing in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onToggleMode, className: "w-full", children: "Go to Sign In" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mx-auto w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Create Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Start your PMP learning journey" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      (error || errors.root) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error || ((_a = errors.root) == null ? void 0 : _a.message) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "text-sm font-medium", children: "Full Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "name",
              type: "text",
              placeholder: "Enter your full name",
              className: `pl-10 ${errors.name ? "border-red-500" : ""}`,
              ...register("name"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("name").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          )
        ] }),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.name.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-medium", children: "Email Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "Enter your email",
              className: `pl-10 ${errors.email ? "border-red-500" : ""}`,
              ...register("email"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("email").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          )
        ] }),
        errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.email.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "I am a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "role-student",
                type: "radio",
                value: ROLES.STUDENT,
                ...register("role"),
                className: "h-4 w-4 border-gray-300 text-primary focus:ring-primary",
                disabled: loading || isSubmitting
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role-student", className: "ml-2 text-sm", children: "Student - Learning PMP concepts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "role-instructor",
                type: "radio",
                value: ROLES.INSTRUCTOR,
                ...register("role"),
                className: "h-4 w-4 border-gray-300 text-primary focus:ring-primary",
                disabled: loading || isSubmitting
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role-instructor", className: "ml-2 text-sm", children: "Instructor - Teaching PMP concepts" })
          ] })
        ] }),
        errors.role && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.role.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-medium", children: "Password" }),
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
              className: "absolute right-3 top-3 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              onClick: /* @__PURE__ */ __name(() => setShowPassword(!showPassword), "onClick"),
              disabled: loading || isSubmitting,
              "aria-label": showPassword ? "Hide password" : "Show password",
              "aria-pressed": showPassword,
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmPassword", className: "text-sm font-medium", children: "Confirm Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "confirmPassword",
              type: showConfirmPassword ? "text" : "password",
              placeholder: "Confirm your password",
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
              className: "absolute right-3 top-3 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              onClick: /* @__PURE__ */ __name(() => setShowConfirmPassword(!showConfirmPassword), "onClick"),
              disabled: loading || isSubmitting,
              "aria-label": showConfirmPassword ? "Hide confirm password" : "Show confirm password",
              "aria-pressed": showConfirmPassword,
              children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          )
        ] }),
        errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.confirmPassword.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "agreedToTerms",
              type: "checkbox",
              ...register("agreedToTerms"),
              className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
              disabled: loading || isSubmitting
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "agreedToTerms",
              className: "ml-2 text-sm text-gray-600 dark:text-gray-400",
              children: [
                "I agree to the",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#/terms", className: "text-primary underline hover:text-primary/80", children: "Terms of Service" }),
                " ",
                "and",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#/privacy", className: "text-primary underline hover:text-primary/80", children: "Privacy Policy" })
              ]
            }
          )
        ] }),
        errors.agreedToTerms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.agreedToTerms.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || isSubmitting, children: loading || isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Creating account..."
      ] }) : "Create Account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onToggleMode,
          className: "font-medium text-primary hover:text-primary/80",
          disabled: loading || isSubmitting,
          children: "Sign in"
        }
      )
    ] }) })
  ] });
}, "RegisterForm");
const forgotPasswordSchema = objectType({
  email: stringType().min(1, "Email is required").email("Please enter a valid email address").refine((email) => authValidation.isValidEmail(email), {
    message: "Please enter a valid email address"
  })
});
const ForgotPasswordForm = /* @__PURE__ */ __name(({ onBackToLogin }) => {
  var _a;
  const { resetPassword, loading, error, clearError } = useAuth();
  const [isEmailSent, setIsEmailSent] = reactExports.useState(false);
  const [userEmail, setUserEmail] = reactExports.useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: t(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });
  const onSubmit = /* @__PURE__ */ __name(async (data) => {
    var _a2, _b;
    try {
      clearError();
      clearErrors();
      await resetPassword(data.email);
      setUserEmail(data.email);
      setIsEmailSent(true);
    } catch (error2) {
      if ((_a2 = error2.message) == null ? void 0 : _a2.includes("User not found")) {
        setError("email", {
          type: "manual",
          message: "No account found with this email address. Please check and try again."
        });
      } else if ((_b = error2.message) == null ? void 0 : _b.includes("Email rate limit exceeded")) {
        setError("root", {
          type: "manual",
          message: "Too many password reset attempts. Please wait a few minutes before trying again."
        });
      } else {
        setError("root", {
          type: "manual",
          message: error2.message || "Failed to send password reset email. Please try again."
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
  if (isEmailSent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mx-auto w-full max-w-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mx-auto h-16 w-16 text-green-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-2xl font-bold text-gray-900 dark:text-white", children: "Check Your Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-6 text-sm text-gray-600 dark:text-gray-400", children: [
        "We've sent a password reset link to",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: userEmail }),
        ". Click the link in your email to reset your password."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onBackToLogin, className: "w-full", children: "Back to Sign In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setIsEmailSent(false), "onClick"),
            className: "w-full text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            children: "Didn't receive the email? Try again"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 dark:text-blue-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
        " The reset link will expire in 1 hour for security reasons. If you don't see the email, check your spam folder."
      ] }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mx-auto w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Reset Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Enter your email address and we'll send you a link to reset your password." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      (error || errors.root) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error || ((_a = errors.root) == null ? void 0 : _a.message) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-medium", children: "Email Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "Enter your email address",
              className: `pl-10 ${errors.email ? "border-red-500" : ""}`,
              ...register("email"),
              onChange: /* @__PURE__ */ __name((e) => {
                register("email").onChange(e);
                handleInputChange();
              }, "onChange"),
              disabled: loading || isSubmitting
            }
          )
        ] }),
        errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.email.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || isSubmitting, children: loading || isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Sending reset email..."
      ] }) : "Send Reset Email" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-medium text-gray-900 dark:text-white", children: "Having trouble?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Make sure you enter the email address associated with your account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Check your spam or junk folder if you don't receive the email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• The reset link expires in 1 hour for security" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Contact support if you continue to have issues" })
      ] })
    ] })
  ] });
}, "ForgotPasswordForm");
const AuthPage = /* @__PURE__ */ __name(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, signInWithOAuth, loading } = useAuth();
  const mode = searchParams.get("mode") || "login";
  const [currentMode, setCurrentMode] = reactExports.useState(mode);
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo") || "/";
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, searchParams]);
  const handleModeChange = /* @__PURE__ */ __name((newMode) => {
    setCurrentMode(newMode);
    setSearchParams({ mode: newMode });
  }, "handleModeChange");
  const handleOAuthSignIn = /* @__PURE__ */ __name(async (provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
    }
  }, "handleOAuthSignIn");
  const renderAuthForm = /* @__PURE__ */ __name(() => {
    switch (currentMode) {
      case "register":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterForm, { onToggleMode: /* @__PURE__ */ __name(() => handleModeChange("login"), "onToggleMode") });
      case "forgot-password":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPasswordForm, { onBackToLogin: /* @__PURE__ */ __name(() => handleModeChange("login"), "onBackToLogin") });
      case "login":
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          LoginForm,
          {
            onToggleMode: /* @__PURE__ */ __name(() => handleModeChange("register"), "onToggleMode"),
            onForgotPassword: /* @__PURE__ */ __name(() => handleModeChange("forgot-password"), "onForgotPassword")
          }
        );
    }
  }, "renderAuthForm");
  if (isAuthenticated) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    currentMode !== "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        className: "mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
        onClick: /* @__PURE__ */ __name(() => handleModeChange("login"), "onClick"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
          "Back to Sign In"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2 },
        children: renderAuthForm()
      },
      currentMode
    ) }),
    (currentMode === "login" || currentMode === "register") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 },
        className: "mt-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-gray-300 dark:border-gray-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white px-2 text-gray-500 dark:bg-gray-800", children: "Or continue with" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: /* @__PURE__ */ __name(() => handleOAuthSignIn("google"), "onClick"),
                disabled: loading,
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "mr-2 h-5 w-5", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        fill: "currentColor",
                        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        fill: "currentColor",
                        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        fill: "currentColor",
                        d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        fill: "currentColor",
                        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      }
                    )
                  ] }),
                  "Google"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                onClick: /* @__PURE__ */ __name(() => handleOAuthSignIn("github"), "onClick"),
                disabled: loading,
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "mr-2 h-5 w-5" }),
                  "GitHub"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.2 },
        className: "mt-8 text-center",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
          "By signing in, you agree to our",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#/terms", className: "text-primary underline hover:text-primary/80", children: "Terms of Service" }),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#/privacy", className: "text-primary underline hover:text-primary/80", children: "Privacy Policy" })
        ] })
      }
    )
  ] }) });
}, "AuthPage");
export {
  AuthPage as default
};
