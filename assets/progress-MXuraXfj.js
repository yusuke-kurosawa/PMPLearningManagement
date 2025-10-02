import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { n as Root, o as Indicator } from "./radix-core-BMsYm0jb.js";
import { d as cn } from "./index-CZZZnLRW.js";
const Progress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = Root.displayName;
export {
  Progress as P
};
