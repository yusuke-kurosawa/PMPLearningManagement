var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, B as useForm, R as React, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { t, o as objectType, s as stringType } from "./validation-CGVxFmqx.js";
import { b as useAuth, c as authValidation, R as ROLES } from "./index-CZZZnLRW.js";
import { B as Button } from "./button-C-u1QTim.js";
import { I as Input } from "./input-DOiCTpzp.js";
import { L as Label } from "./label-XIKEmFX2.js";
import { C as Card } from "./card-DxIMXhob.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import ProtectedRoute from "./ProtectedRoute-BIt928BV.js";
import { av as CheckCircle, aw as AlertCircle, U as User, aI as Lock, e as Settings, b0 as Camera, a$ as Mail, q as Shield, L as Loader2, f as Save, ac as EyeOff, aa as Eye } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
import "./framer-motion-f1HlQ5oK.js";
const profileSchema = objectType({
  name: stringType().min(1, "Full name is required").min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").regex(/^[a-zA-Z\\s]+$/, "Name can only contain letters and spaces"),
  email: stringType().min(1, "Email is required").email("Please enter a valid email address").refine((email) => authValidation.isValidEmail(email), {
    message: "Please enter a valid email address"
  })
});
const passwordSchema = objectType({
  currentPassword: stringType().min(1, "Current password is required"),
  newPassword: stringType().min(8, "Password must be at least 8 characters").refine((password) => authValidation.isValidPassword(password).isValid, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  confirmPassword: stringType().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
const UserProfile = /* @__PURE__ */ __name(() => {
  var _a, _b, _c, _d;
  const { user, role, updateProfile, updatePassword, loading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = reactExports.useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = reactExports.useState(false);
  const [showNewPassword, setShowNewPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [passwordStrength, setPasswordStrength] = reactExports.useState(0);
  const [avatarPreview, setAvatarPreview] = reactExports.useState(null);
  const [successMessage, setSuccessMessage] = reactExports.useState("");
  const profileForm = useForm({
    resolver: t(profileSchema),
    defaultValues: {
      name: ((_a = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a.name) || ((_b = user == null ? void 0 : user.user_metadata) == null ? void 0 : _b.full_name) || "",
      email: (user == null ? void 0 : user.email) || ""
    }
  });
  const passwordForm = useForm({
    resolver: t(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  const watchNewPassword = passwordForm.watch("newPassword");
  React.useEffect(() => {
    if (watchNewPassword) {
      const strength = authValidation.getPasswordStrength(watchNewPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [watchNewPassword]);
  const onProfileSubmit = /* @__PURE__ */ __name(async (data) => {
    try {
      clearError();
      setSuccessMessage("");
      await updateProfile({
        name: data.name,
        full_name: data.name
      });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3e3);
    } catch (error2) {
    }
  }, "onProfileSubmit");
  const onPasswordSubmit = /* @__PURE__ */ __name(async (data) => {
    try {
      clearError();
      setSuccessMessage("");
      await updatePassword(data.newPassword);
      setSuccessMessage("Password updated successfully!");
      passwordForm.reset();
      setTimeout(() => setSuccessMessage(""), 3e3);
    } catch (error2) {
    }
  }, "onPasswordSubmit");
  const handleAvatarChange = /* @__PURE__ */ __name((event) => {
    var _a2;
    const file = (_a2 = event.target.files) == null ? void 0 : _a2[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a3;
        setAvatarPreview((_a3 = e.target) == null ? void 0 : _a3.result);
      };
      reader.readAsDataURL(file);
    }
  }, "handleAvatarChange");
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
  const getRoleDisplayName = /* @__PURE__ */ __name((role2) => {
    const roleNames = {
      [ROLES.ADMIN]: "Administrator",
      [ROLES.INSTRUCTOR]: "Instructor",
      [ROLES.STUDENT]: "Student",
      [ROLES.GUEST]: "Guest"
    };
    return roleNames[role2] || role2;
  }, "getRoleDisplayName");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requireAuth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-4xl p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "User Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: "Manage your account settings and preferences" })
    ] }),
    successMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-5 w-5 text-green-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700 dark:text-green-300", children: successMessage })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mr-2 h-5 w-5 text-red-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: error })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "profile", className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Profile" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "security", className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Security" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "settings", className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Settings" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", children: avatarPreview || ((_c = user == null ? void 0 : user.user_metadata) == null ? void 0 : _c.avatar_url) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: avatarPreview || ((_d = user == null ? void 0 : user.user_metadata) == null ? void 0 : _d.avatar_url),
                alt: "Profile",
                className: "h-full w-full object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-12 w-12 text-gray-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "avatar-upload",
                className: "absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white hover:bg-primary/90",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "avatar-upload",
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: handleAvatarChange,
                      disabled: loading
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: "Profile Picture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Upload a new profile picture. Max size: 5MB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: profileForm.handleSubmit(onProfileSubmit), className: "space-y-4", children: [
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
                  className: `pl-10 ${profileForm.formState.errors.name ? "border-red-500" : ""}`,
                  ...profileForm.register("name"),
                  disabled: loading
                }
              )
            ] }),
            profileForm.formState.errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: profileForm.formState.errors.name.message })
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
                  className: "bg-gray-50 pl-10 dark:bg-gray-800",
                  ...profileForm.register("email"),
                  disabled: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Email address cannot be changed. Contact support if you need to update it." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "text",
                  className: "bg-gray-50 pl-10 dark:bg-gray-800",
                  value: getRoleDisplayName(role),
                  disabled: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full sm:w-auto", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Updating..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
            "Save Profile"
          ] }) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "security", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-medium text-gray-900 dark:text-white", children: "Change Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Update your password to keep your account secure" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: passwordForm.handleSubmit(onPasswordSubmit), className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currentPassword", className: "text-sm font-medium", children: "Current Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "currentPassword",
                  type: showCurrentPassword ? "text" : "password",
                  placeholder: "Enter your current password",
                  className: `pl-10 pr-10 ${passwordForm.formState.errors.currentPassword ? "border-red-500" : ""}`,
                  ...passwordForm.register("currentPassword"),
                  disabled: loading
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600",
                  onClick: /* @__PURE__ */ __name(() => setShowCurrentPassword(!showCurrentPassword), "onClick"),
                  disabled: loading,
                  children: showCurrentPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            passwordForm.formState.errors.currentPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: passwordForm.formState.errors.currentPassword.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "newPassword", className: "text-sm font-medium", children: "New Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "newPassword",
                  type: showNewPassword ? "text" : "password",
                  placeholder: "Enter your new password",
                  className: `pl-10 pr-10 ${passwordForm.formState.errors.newPassword ? "border-red-500" : ""}`,
                  ...passwordForm.register("newPassword"),
                  disabled: loading
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600",
                  onClick: /* @__PURE__ */ __name(() => setShowNewPassword(!showNewPassword), "onClick"),
                  disabled: loading,
                  children: showNewPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            watchNewPassword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
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
            passwordForm.formState.errors.newPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: passwordForm.formState.errors.newPassword.message })
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
                  className: `pl-10 pr-10 ${passwordForm.formState.errors.confirmPassword ? "border-red-500" : ""}`,
                  ...passwordForm.register("confirmPassword"),
                  disabled: loading
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "absolute right-3 top-3 text-gray-400 hover:text-gray-600",
                  onClick: /* @__PURE__ */ __name(() => setShowConfirmPassword(!showConfirmPassword), "onClick"),
                  disabled: loading,
                  children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            passwordForm.formState.errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: passwordForm.formState.errors.confirmPassword.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full sm:w-auto", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Updating..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
            "Update Password"
          ] }) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-medium text-gray-900 dark:text-white", children: "Account Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Additional settings and account information" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Account Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: (user == null ? void 0 : user.created_at) ? new Date(user.created_at).toLocaleDateString() : "Unknown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Last Sign In" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: (user == null ? void 0 : user.last_sign_in_at) ? new Date(user.last_sign_in_at).toLocaleDateString() : "Unknown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Email Confirmed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: (user == null ? void 0 : user.email_confirmed_at) ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "User ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-all font-mono text-sm text-gray-600 dark:text-gray-400", children: user == null ? void 0 : user.id })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-gray-50 p-4 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-gray-600 dark:text-gray-400", children: "More settings will be available here in the future." }) })
      ] }) }) })
    ] })
  ] }) });
}, "UserProfile");
export {
  UserProfile as default
};
