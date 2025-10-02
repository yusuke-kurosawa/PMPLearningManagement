var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { a as analysisFrameworks, s as strategicAlignmentCriteria } from "./strategicAlignmentData-RqBj5YN8.js";
import { e as Settings, t as Target, v as BarChart3, aX as Lightbulb, av as CheckCircle, ai as AlertTriangle, a3 as Star } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const StrategicAlignment = /* @__PURE__ */ __name(({ className = "" }) => {
  const [selectedFramework, setSelectedFramework] = reactExports.useState(analysisFrameworks[0].id);
  const [assessmentMode, setAssessmentMode] = reactExports.useState(false);
  const [projectAssessment, setProjectAssessment] = reactExports.useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = reactExports.useState({});
  const selectedFrameworkData = analysisFrameworks.find((fw) => fw.id === selectedFramework);
  const startAssessment = /* @__PURE__ */ __name(() => {
    setAssessmentMode(true);
    setAssessmentAnswers({});
  }, "startAssessment");
  const answerCriteria = /* @__PURE__ */ __name((criteriaId, score) => {
    setAssessmentAnswers((prev) => ({
      ...prev,
      [criteriaId]: score
    }));
  }, "answerCriteria");
  const completeAssessment = /* @__PURE__ */ __name(() => {
    const criteriaEntries = Object.entries(strategicAlignmentCriteria);
    const alignmentAreas = criteriaEntries.map(([key, criteria]) => {
      const score = assessmentAnswers[key] || 0;
      return {
        area: criteria.name,
        score: score * 20,
        // 5点スケールを100点スケールに変換
        comments: getScoreComment(score)
      };
    });
    const overallScore = alignmentAreas.reduce((sum, area) => {
      var _a;
      const weight = ((_a = strategicAlignmentCriteria[area.area.toLowerCase().replace(/[^a-z]/g, "")]) == null ? void 0 : _a.weight) || 0.2;
      return sum + area.score * weight;
    }, 0);
    const assessment = {
      id: `assessment-${Date.now()}`,
      projectId: "current-project",
      organizationStrategy: "デジタル変革とイノベーション推進",
      alignmentScore: overallScore,
      alignmentAreas,
      recommendations: generateRecommendations(alignmentAreas),
      riskFactors: generateRiskFactors(alignmentAreas),
      successFactors: generateSuccessFactors(alignmentAreas)
    };
    setProjectAssessment(assessment);
    setAssessmentMode(false);
  }, "completeAssessment");
  const getScoreComment = /* @__PURE__ */ __name((score) => {
    if (score >= 4) {
      return "非常に良好";
    }
    if (score >= 3) {
      return "良好";
    }
    if (score >= 2) {
      return "改善の余地あり";
    }
    return "大幅な改善が必要";
  }, "getScoreComment");
  const generateRecommendations = /* @__PURE__ */ __name((areas) => {
    const recommendations = [];
    areas.forEach((area) => {
      if (area.score < 60) {
        recommendations.push(`${area.area}の強化: 具体的な改善計画の策定と実行が必要です。`);
      }
    });
    if (recommendations.length === 0) {
      recommendations.push("現在の戦略適合性は良好です。継続的なモニタリングを行ってください。");
    }
    return recommendations;
  }, "generateRecommendations");
  const generateRiskFactors = /* @__PURE__ */ __name((areas) => {
    const riskFactors = [];
    areas.forEach((area) => {
      if (area.score < 40) {
        riskFactors.push(`${area.area}の低評価により、プロジェクト成功に重大なリスクがあります。`);
      }
    });
    return riskFactors;
  }, "generateRiskFactors");
  const generateSuccessFactors = /* @__PURE__ */ __name((areas) => {
    const successFactors = [];
    areas.forEach((area) => {
      if (area.score >= 80) {
        successFactors.push(`${area.area}の高い適合性がプロジェクト成功を支援します。`);
      }
    });
    return successFactors;
  }, "generateSuccessFactors");
  const FrameworkDetail = /* @__PURE__ */ __name(({ framework }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "目的:" }),
          " ",
          framework.purpose
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "構成要素" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: framework.components.map((component, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold", children: component.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-gray-600", children: component.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-xs font-medium text-gray-500", children: "例:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-xs text-gray-600", children: component.examples.slice(0, 3).map((example, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2 h-1 w-1 rounded-full bg-blue-500" }),
              example
            ] }, i)) })
          ] })
        ] }) }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4" }),
            "メリット"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: framework.pros.map((pro, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-3 w-3 text-green-500" }),
            pro
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold text-orange-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 h-4 w-4" }),
            "注意点"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: framework.cons.map((con, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 h-3 w-3 text-orange-500" }),
            con
          ] }, index)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "適用ステップ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: framework.applicationSteps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800", children: index + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: step })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-semibold", children: "最適な使用場面" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: framework.bestUseCases.map((useCase, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-blue-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: useCase })
        ] }) }) }, index)) })
      ] })
    ] });
  }, "FrameworkDetail");
  const AlignmentAssessment = /* @__PURE__ */ __name(() => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xl font-semibold", children: "戦略適合性評価" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "各評価項目について、現在のプロジェクトの状況を評価してください。" })
      ] }),
      Object.entries(strategicAlignmentCriteria).map(([key, criteria]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: criteria.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: criteria.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            "重要度: ",
            Math.round(criteria.weight * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "評価基準:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm text-gray-600", children: criteria.criteria.map((criterion, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2 h-1 w-1 rounded-full bg-gray-400" }),
            criterion
          ] }, index)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-medium", children: "評価スコア:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map((score) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: assessmentAnswers[key] === score ? "default" : "outline",
                className: "flex-1",
                onClick: /* @__PURE__ */ __name(() => answerCriteria(key, score), "onClick"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: score }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                    score === 1 && "低い",
                    score === 2 && "やや低い",
                    score === 3 && "普通",
                    score === 4 && "高い",
                    score === 5 && "非常に高い"
                  ] })
                ] })
              },
              score
            )) })
          ] })
        ] }) })
      ] }, key)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: /* @__PURE__ */ __name(() => setAssessmentMode(false), "onClick"), children: "キャンセル" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: completeAssessment, children: "評価完了" })
      ] })
    ] });
  }, "AlignmentAssessment");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "戦略適合とビジネス分析" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-4xl text-lg text-gray-600", children: "プロジェクトを組織戦略に適合させ、ビジネス環境を分析するためのフレームワークと評価ツールを学習します。" })
    ] }),
    assessmentMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-4xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlignmentAssessment, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "戦略分析フレームワーク" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: analysisFrameworks.map((framework) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              className: `cursor-pointer transition-all duration-200 ${selectedFramework === framework.id ? "ring-2 ring-blue-500" : ""}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedFramework(framework.id), "onClick"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: framework.acronym }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: framework.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: framework.description })
              ] }) })
            },
            framework.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startAssessment, size: "lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4" }),
            "戦略適合性評価を開始"
          ] }) })
        ] })
      ] }),
      selectedFrameworkData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl", children: [
            selectedFrameworkData.name,
            "（",
            selectedFrameworkData.acronym,
            "）"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: selectedFrameworkData.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FrameworkDetail, { framework: selectedFrameworkData }) })
      ] }),
      projectAssessment && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-6 w-6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "戦略適合性評価結果" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-blue-600", children: Math.round(projectAssessment.alignmentScore) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "総合スコア" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: projectAssessment.alignmentScore, className: "mt-2" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-green-600", children: projectAssessment.alignmentScore >= 80 ? "優秀" : projectAssessment.alignmentScore >= 60 ? "良好" : projectAssessment.alignmentScore >= 40 ? "注意" : "要改善" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "評価レベル" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-orange-600", children: projectAssessment.riskFactors.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "リスク要因" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold text-purple-600", children: projectAssessment.successFactors.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "成功要因" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "areas", className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "areas", children: "領域別評価" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "recommendations", children: "推奨事項" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "factors", children: "要因分析" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "areas", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: projectAssessment.alignmentAreas.map((area, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: area.area }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Badge,
                  {
                    variant: area.score >= 80 ? "default" : area.score >= 60 ? "secondary" : "destructive",
                    children: [
                      Math.round(area.score),
                      "点"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: area.score, className: "mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: area.comments })
            ] }) }, index)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "recommendations", className: "space-y-4", children: projectAssessment.recommendations.map((rec, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: rec })
            ] }, index)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "factors", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold text-green-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4" }),
                  "成功要因"
                ] }),
                projectAssessment.successFactors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: projectAssessment.successFactors.map((factor, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-green-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: factor })
                ] }, index)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "現在、特筆すべき成功要因は特定されていません。" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold text-red-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "mr-2 h-4 w-4" }),
                  "リスク要因"
                ] }),
                projectAssessment.riskFactors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: projectAssessment.riskFactors.map((factor, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-red-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: factor })
                ] }, index)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "現在、重大なリスク要因は特定されていません。" })
              ] })
            ] }) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}, "StrategicAlignment");
export {
  StrategicAlignment as default
};
