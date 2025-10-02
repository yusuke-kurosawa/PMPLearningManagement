var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { e as enterpriseEnvironmentalFactors, o as organizationalProcessAssets } from "./strategicAlignmentData-RqBj5YN8.js";
import { aY as Building, aH as Globe, F as FileText, aO as HelpCircle, e as Settings, n as BookOpen, q as Shield, A as ArrowRight, av as CheckCircle, aX as Lightbulb, t as Target, T as TrendingUp, Z as Zap, s as Users, ai as AlertTriangle } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
import "./index-CZZZnLRW.js";
import "./radix-core-BMsYm0jb.js";
import "./radix-tabs-BR3qU-T4.js";
const BusinessEnvironmentAnalysis = /* @__PURE__ */ __name(({
  className = ""
}) => {
  const [selectedTab, setSelectedTab] = reactExports.useState("eef");
  const [selectedEEF, setSelectedEEF] = reactExports.useState(null);
  const [selectedOPA, setSelectedOPA] = reactExports.useState(null);
  const [practiceMode, setPracticeMode] = reactExports.useState(false);
  const [currentQuestion, setCurrentQuestion] = reactExports.useState(0);
  const [practiceResults, setPracticeResults] = reactExports.useState({});
  const practiceQuestions = [
    {
      id: "q1",
      scenario: "あなたのプロジェクトチームは、新しい製品開発プロジェクトを開始しようとしています。しかし、組織には類似のプロジェクト経験が少なく、業界の技術標準も急速に変化しています。",
      question: "この状況で最も重要なEEF（企業環境要因）は何ですか？",
      options: ["組織文化と構造", "技術動向", "リソースの可用性", "規制・法的環境"],
      correct: 1,
      explanation: "急速に変化する技術標準は外部の技術動向として分類され、プロジェクトの技術選択や実装方法に大きな影響を与えるため、最も重要なEEFです。"
    },
    {
      id: "q2",
      scenario: "ITシステム更新プロジェクトで、社内には過去5年間の類似プロジェクトの詳細な記録と、失敗・成功要因の分析結果があります。",
      question: "これはどのタイプのOPA（組織プロセス資産）に該当しますか？",
      options: [
        "プロセスとガイドライン",
        "知識とナレッジベース",
        "テンプレートとフォーム",
        "ガバナンス・ガイドライン"
      ],
      correct: 1,
      explanation: "過去のプロジェクト記録と分析結果は、組織の知識とナレッジベースに分類される貴重なOPAです。これらの情報は今後のプロジェクト計画に活用できます。"
    },
    {
      id: "q3",
      scenario: "国際的なプロジェクトで、複数の国の法規制に準拠する必要があり、各国の政治情勢も不安定な状況です。",
      question: "この場合、プロジェクトマネージャーが最も注意すべきEEFのカテゴリーは？",
      options: ["内部要因", "外部要因", "どちらも同程度", "判断できない"],
      correct: 1,
      explanation: "国際的な法規制と政治情勢は組織外部の環境要因であり、プロジェクトマネージャーが直接制御できない外部要因として管理する必要があります。"
    },
    {
      id: "q4",
      scenario: "プロジェクト開始時に、組織の標準的なプロジェクト憲章テンプレートと承認プロセスを使用することになりました。",
      question: "これらは主にどのようなOPAに分類されますか？",
      options: [
        "テンプレートとフォーム、プロセスとガイドライン",
        "知識とナレッジベース",
        "ガバナンス・ガイドライン",
        "人事ポリシー"
      ],
      correct: 0,
      explanation: "プロジェクト憲章テンプレートは「テンプレートとフォーム」、承認プロセスは「プロセスとガイドライン」に分類される複合的なOPAです。"
    },
    {
      id: "q5",
      scenario: "組織のリスク許容度が非常に低く、すべてのプロジェクト決定に複数レベルの承認が必要です。",
      question: "これは主にどのEEFに関連しますか？",
      options: [
        "インフラストラクチャ",
        "ステークホルダーのリスク許容度",
        "市場状況",
        "リソースの可用性"
      ],
      correct: 1,
      explanation: "組織のリスク許容度の低さと多重承認システムは、ステークホルダーのリスク許容度というEEFに直接関連し、プロジェクト運営方法に影響します。"
    }
  ];
  const startPractice = /* @__PURE__ */ __name(() => {
    setPracticeMode(true);
    setCurrentQuestion(0);
    setPracticeResults({});
  }, "startPractice");
  const handleAnswer = /* @__PURE__ */ __name((answerIndex) => {
    const question = practiceQuestions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    setPracticeResults((prev) => ({
      ...prev,
      [question.id]: isCorrect
    }));
  }, "handleAnswer");
  const nextQuestion = /* @__PURE__ */ __name(() => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctCount = Object.values(practiceResults).filter(Boolean).length;
      alert(`練習完了！ ${correctCount}/${practiceQuestions.length} 問正解しました。`);
      setPracticeMode(false);
    }
  }, "nextQuestion");
  const EEFDetail = /* @__PURE__ */ __name(({ eef }) => {
    eef.category === "internal" ? Building : Globe;
    const impactColor = eef.impact === "high" ? "text-red-600" : eef.impact === "medium" ? "text-orange-600" : "text-green-600";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("categoryIcon", { className: "h-6 w-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: eef.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: eef.category === "internal" ? "default" : "secondary", children: eef.category === "internal" ? "内部要因" : "外部要因" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: impactColor, children: [
          "影響度: ",
          eef.impact === "high" ? "高" : eef.impact === "medium" ? "中" : "低"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: eef.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4" }),
            "具体例"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: eef.examples.map((example, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-0.5 h-4 w-4 text-green-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: example })
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4" }),
            "影響するプロジェクトフェーズ"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: eef.projectPhases.map((phase, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: phase }, index)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mr-2 h-4 w-4" }),
            "管理のヒント"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: eef.managementTips.map((tip, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: tip })
          ] }, index)) })
        ] })
      ] })
    ] });
  }, "EEFDetail");
  const OPADetail = /* @__PURE__ */ __name(({ opa }) => {
    const typeIcons = {
      processes: Settings,
      knowledge: BookOpen,
      guidelines: Shield,
      templates: FileText
    };
    const TypeIcon = typeIcons[opa.type];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TypeIcon, { className: "h-6 w-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opa.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", children: [
          opa.type === "processes" && "プロセス",
          opa.type === "knowledge" && "ナレッジ",
          opa.type === "guidelines" && "ガイドライン",
          opa.type === "templates" && "テンプレート"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: opa.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4" }),
              "具体例"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: opa.examples.map((example, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-0.5 h-4 w-4 text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: example })
            ] }, index)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-3 flex items-center font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-2 h-4 w-4" }),
              "メリット"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: opa.benefits.map((benefit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "mt-0.5 h-4 w-4 text-blue-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: benefit })
            ] }, index)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "責任者:" }),
              " ",
              opa.owner
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "更新頻度:" }),
              " ",
              opa.updateFrequency
            ] })
          ] })
        ] })
      ] })
    ] });
  }, "OPADetail");
  const PracticeQuestion = /* @__PURE__ */ __name(() => {
    const question = practiceQuestions[currentQuestion];
    const [selectedAnswer, setSelectedAnswer] = reactExports.useState(null);
    const [showExplanation, setShowExplanation] = reactExports.useState(false);
    const handleAnswerSelect = /* @__PURE__ */ __name((answerIndex) => {
      setSelectedAnswer(answerIndex);
      handleAnswer(answerIndex);
      setShowExplanation(true);
    }, "handleAnswerSelect");
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mx-auto w-full max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "EEF・OPA 識別練習" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          currentQuestion + 1,
          " / ",
          practiceQuestions.length
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "シナリオ:" }),
            " ",
            question.scenario
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: question.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: question.options.map((option, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: showExplanation ? index === question.correct ? "default" : selectedAnswer === index ? "destructive" : "outline" : selectedAnswer === index ? "secondary" : "outline",
              className: "h-auto w-full justify-start p-4 text-left",
              onClick: /* @__PURE__ */ __name(() => !showExplanation && handleAnswerSelect(index), "onClick"),
              disabled: showExplanation,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: String.fromCharCode(65 + index) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option }),
                showExplanation && index === question.correct && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "ml-auto h-5 w-5 text-green-500" })
              ] })
            },
            index
          )) })
        ] }),
        showExplanation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "解説:" }),
            " ",
            question.explanation
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: /* @__PURE__ */ __name(() => setPracticeMode(false), "onClick"), children: "練習を終了" }),
          showExplanation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: nextQuestion, children: [
            currentQuestion < practiceQuestions.length - 1 ? "次の問題" : "練習完了",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] })
        ] })
      ] })
    ] });
  }, "PracticeQuestion");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "ビジネス環境分析" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-4xl text-lg text-gray-600", children: "企業環境要因（EEF）と組織プロセス資産（OPA）を理解し、 プロジェクト環境の分析と活用方法を学習します。" })
    ] }),
    practiceMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(PracticeQuestion, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-6 w-6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ビジネス環境の構成要素" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 grid grid-cols-1 gap-6 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-blue-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-8 w-8 text-blue-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "企業環境要因（EEF）" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Enterprise Environmental Factors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm", children: "プロジェクトの計画と実行に影響を与える、組織内外の環境条件。 プロジェクトチームが制御できない要因。" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", children: [
                  "内部要因:",
                  " ",
                  enterpriseEnvironmentalFactors.filter((e) => e.category === "internal").length,
                  "個"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                  "外部要因:",
                  " ",
                  enterpriseEnvironmentalFactors.filter((e) => e.category === "external").length,
                  "個"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-green-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-green-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "組織プロセス資産（OPA）" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Organizational Process Assets" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm", children: "組織が蓄積した計画、プロセス、ポリシー、手順、知識。 プロジェクトの実行を支援する資産。" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", children: [
                "総数: ",
                organizationalProcessAssets.length,
                "個"
              ] }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startPractice, size: "lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HelpCircle, { className: "mr-2 h-4 w-4" }),
            "EEF・OPA 識別練習を開始"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "詳細解説" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "eef", children: "企業環境要因（EEF）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "opa", children: "組織プロセス資産（OPA）" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "eef", className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: enterpriseEnvironmentalFactors.map((eef) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: `cursor-pointer transition-all duration-200 ${selectedEEF === eef.id ? "ring-2 ring-blue-500" : ""}`,
                onClick: /* @__PURE__ */ __name(() => setSelectedEEF(eef.id), "onClick"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `rounded-lg p-2 ${eef.category === "internal" ? "bg-blue-100" : "bg-green-100"}`,
                      children: eef.category === "internal" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-5 w-5 text-blue-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-green-600" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: eef.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-600", children: eef.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: eef.category === "internal" ? "default" : "secondary",
                          className: "text-xs",
                          children: eef.category === "internal" ? "内部" : "外部"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "outline",
                          className: `text-xs ${eef.impact === "high" ? "text-red-600" : eef.impact === "medium" ? "text-orange-600" : "text-green-600"}`,
                          children: eef.impact === "high" ? "高影響" : eef.impact === "medium" ? "中影響" : "低影響"
                        }
                      )
                    ] })
                  ] })
                ] }) })
              },
              eef.id
            )) }),
            selectedEEF && /* @__PURE__ */ jsxRuntimeExports.jsx(
              EEFDetail,
              {
                eef: enterpriseEnvironmentalFactors.find((e) => e.id === selectedEEF)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "opa", className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-2", children: organizationalProcessAssets.map((opa) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: `cursor-pointer transition-all duration-200 ${selectedOPA === opa.id ? "ring-2 ring-green-500" : ""}`,
                onClick: /* @__PURE__ */ __name(() => setSelectedOPA(opa.id), "onClick"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-100 p-2", children: [
                    opa.type === "processes" && /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5 text-green-600" }),
                    opa.type === "knowledge" && /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5 text-green-600" }),
                    opa.type === "guidelines" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-green-600" }),
                    opa.type === "templates" && /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-green-600" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: opa.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: opa.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", children: [
                        opa.type === "processes" && "プロセス",
                        opa.type === "knowledge" && "ナレッジ",
                        opa.type === "guidelines" && "ガイドライン",
                        opa.type === "templates" && "テンプレート"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-gray-400" })
                    ] })
                  ] })
                ] }) })
              },
              opa.id
            )) }),
            selectedOPA && /* @__PURE__ */ jsxRuntimeExports.jsx(
              OPADetail,
              {
                opa: organizationalProcessAssets.find((o) => o.id === selectedOPA)
              }
            )
          ] })
        ] }) })
      ] })
    ] })
  ] });
}, "BusinessEnvironmentAnalysis");
export {
  BusinessEnvironmentAnalysis as default
};
