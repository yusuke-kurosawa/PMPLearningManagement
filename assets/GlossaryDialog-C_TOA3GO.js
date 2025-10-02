var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { e as glossaryCategories } from "./index-CZZZnLRW.js";
import { X, am as Tag, a6 as ExternalLink } from "./lucide-icons-B7slfWYt.js";
const GlossaryDialog = /* @__PURE__ */ __name(({ term, onClose, onNavigateToGlossary }) => {
  if (!term) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-white shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 border-b bg-white p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-800", children: term.term }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600", children: term.japanese })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 transition-colors hover:text-gray-600",
          "aria-label": "閉じる",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "説明" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: term.description })
      ] }),
      term.categories && term.categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "カテゴリー" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: term.categories.map((catId) => {
          const category = glossaryCategories.find((c) => c.id === catId);
          if (!category) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${category.color} text-white`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "mr-1 h-4 w-4" }),
                category.name
              ]
            },
            catId
          );
        }) })
      ] }),
      term.relatedTerms && term.relatedTerms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "関連用語" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: term.relatedTerms.map((relatedTerm, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700",
            children: relatedTerm
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => {
            onNavigateToGlossary(term.id);
            onClose();
          }, "onClick"),
          className: "inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800",
          children: [
            "用語集で詳細を見る",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-1 h-4 w-4" })
          ]
        }
      ) })
    ] })
  ] }) });
}, "GlossaryDialog");
export {
  GlossaryDialog as G
};
