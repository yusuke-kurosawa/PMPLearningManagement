var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DxIMXhob.js";
import { B as Button } from "./button-C-u1QTim.js";
import { B as Badge } from "./badge-ClOHT5Zy.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bn9R5Z4U.js";
import { P as Progress } from "./progress-MXuraXfj.js";
import { A as Alert, a as AlertDescription } from "./alert-BaWcGUxI.js";
import { S as Slider } from "./slider-CwrF050w.js";
import { K as Checkbox$1, M as CheckboxIndicator } from "./radix-core-BMsYm0jb.js";
import { d as cn } from "./index-CZZZnLRW.js";
import { af as Check, e as Settings, aq as CheckCircle2, t as Target, aL as Info, aY as Building, aa as Eye, s as Users, q as Shield, v as BarChart3, F as FileText, ar as Award, I as Activity, T as TrendingUp, R as RefreshCw, D as Download, aX as Lightbulb, u as GitBranch, aB as XCircle, c as Clock, ai as AlertTriangle, n as BookOpen, A as ArrowRight, Z as Zap } from "./lucide-icons-B7slfWYt.js";
import { T as Textarea } from "./textarea-DDx319EQ.js";
import { I as Input } from "./input-DOiCTpzp.js";
import "./vendor-iUsVqwEv.js";
import "./radix-tabs-BR3qU-T4.js";
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
const GovernanceFramework = /* @__PURE__ */ __name(() => {
  const [governanceStrength, setGovernanceStrength] = reactExports.useState([50]);
  const [selectedComponents, setSelectedComponents] = reactExports.useState(/* @__PURE__ */ new Set());
  const [selectedTemplate, setSelectedTemplate] = reactExports.useState("");
  const [customFramework, setCustomFramework] = reactExports.useState({
    name: "",
    description: "",
    projectType: ""
  });
  const [activeTemplate, setActiveTemplate] = reactExports.useState("software");
  const governanceComponents = [
    {
      id: "structure",
      name: "ガバナンス構造",
      icon: Building,
      category: "foundation",
      description: "組織構造、役割、責任の明確化",
      required: true,
      strength: {
        light: "基本的な役割分担",
        medium: "明確な階層と権限",
        heavy: "詳細な組織図と責任マトリックス"
      }
    },
    {
      id: "processes",
      name: "ガバナンスプロセス",
      icon: Settings,
      category: "foundation",
      description: "標準化されたプロセスと手順",
      required: true,
      strength: {
        light: "基本的なプロセス",
        medium: "標準化されたワークフロー",
        heavy: "詳細なプロセス文書化"
      }
    },
    {
      id: "decisions",
      name: "意思決定フレームワーク",
      icon: Target,
      category: "foundation",
      description: "意思決定権限と承認プロセス",
      required: true,
      strength: {
        light: "基本的な承認ライン",
        medium: "RACI マトリックス",
        heavy: "詳細な意思決定ツリー"
      }
    },
    {
      id: "oversight",
      name: "監督機能",
      icon: Eye,
      category: "control",
      description: "プロジェクトの監督と指導",
      required: false,
      strength: {
        light: "月次レビュー",
        medium: "週次レビューと指導",
        heavy: "日次監督と詳細分析"
      }
    },
    {
      id: "management",
      name: "管理機能",
      icon: Users,
      category: "control",
      description: "チームとリソースの管理",
      required: true,
      strength: {
        light: "基本的なチーム管理",
        medium: "リソース最適化",
        heavy: "詳細なパフォーマンス管理"
      }
    },
    {
      id: "control",
      name: "統制機能",
      icon: Shield,
      category: "control",
      description: "品質とコンプライアンスの統制",
      required: false,
      strength: {
        light: "基本的な品質チェック",
        medium: "定期的な監査",
        heavy: "継続的な統制とモニタリング"
      }
    },
    {
      id: "reporting",
      name: "レポーティング",
      icon: BarChart3,
      category: "transparency",
      description: "進捗と成果の報告",
      required: true,
      strength: {
        light: "基本的な進捗報告",
        medium: "ダッシュボードと分析",
        heavy: "リアルタイム監視と詳細レポート"
      }
    },
    {
      id: "transparency",
      name: "透明性",
      icon: FileText,
      category: "transparency",
      description: "情報の可視性と共有",
      required: true,
      strength: {
        light: "基本的な情報共有",
        medium: "構造化された情報管理",
        heavy: "完全な透明性と追跡可能性"
      }
    },
    {
      id: "accountability",
      name: "説明責任",
      icon: Award,
      category: "transparency",
      description: "責任の明確化と説明",
      required: true,
      strength: {
        light: "基本的な責任分担",
        medium: "明確な説明責任",
        heavy: "詳細な説明責任フレームワーク"
      }
    },
    {
      id: "risk",
      name: "リスク管理",
      icon: Activity,
      category: "value",
      description: "リスクの識別と対応",
      required: true,
      strength: {
        light: "基本的なリスク識別",
        medium: "リスクレジスターと対応策",
        heavy: "包括的なリスク管理システム"
      }
    },
    {
      id: "quality",
      name: "品質管理",
      icon: CheckCircle2,
      category: "value",
      description: "品質基準と品質保証",
      required: true,
      strength: {
        light: "基本的な品質チェック",
        medium: "品質管理計画",
        heavy: "継続的品質改善"
      }
    },
    {
      id: "value",
      name: "価値実現",
      icon: TrendingUp,
      category: "value",
      description: "ビジネス価値の最大化",
      required: true,
      strength: {
        light: "基本的な価値測定",
        medium: "価値実現計画",
        heavy: "継続的価値最適化"
      }
    },
    {
      id: "stakeholder",
      name: "ステークホルダー関与",
      icon: Users,
      category: "value",
      description: "ステークホルダーの参画と満足",
      required: true,
      strength: {
        light: "基本的なコミュニケーション",
        medium: "ステークホルダー管理計画",
        heavy: "継続的エンゲージメント"
      }
    }
  ];
  const templates = {
    software: {
      name: "ソフトウェア開発プロジェクト",
      description: "アジャイル・DevOps環境に適した軽量ガバナンス",
      strength: 30,
      components: [
        "structure",
        "processes",
        "decisions",
        "management",
        "reporting",
        "transparency",
        "accountability",
        "risk",
        "quality",
        "value",
        "stakeholder"
      ],
      characteristics: ["反復的開発", "頻繁なリリース", "自己組織化チーム", "継続的フィードバック"]
    },
    infrastructure: {
      name: "インフラストラクチャプロジェクト",
      description: "大規模・長期プロジェクトに適した厳格ガバナンス",
      strength: 80,
      components: [
        "structure",
        "processes",
        "decisions",
        "oversight",
        "management",
        "control",
        "reporting",
        "transparency",
        "accountability",
        "risk",
        "quality",
        "value",
        "stakeholder"
      ],
      characteristics: ["段階的実行", "詳細な計画", "厳格な変更管理", "包括的な文書化"]
    },
    innovation: {
      name: "イノベーションプロジェクト",
      description: "実験的・探索的プロジェクトに適した柔軟ガバナンス",
      strength: 25,
      components: ["structure", "decisions", "management", "reporting", "value", "stakeholder"],
      characteristics: ["実験と学習", "迅速な意思決定", "失敗許容", "価値発見重視"]
    },
    compliance: {
      name: "コンプライアンスプロジェクト",
      description: "規制対応に特化した統制重視ガバナンス",
      strength: 90,
      components: [
        "structure",
        "processes",
        "decisions",
        "oversight",
        "management",
        "control",
        "reporting",
        "transparency",
        "accountability",
        "risk",
        "quality"
      ],
      characteristics: ["厳格な統制", "完全な追跡可能性", "包括的な文書化", "リスク最小化"]
    }
  };
  reactExports.useEffect(() => {
    if (selectedTemplate && templates[selectedTemplate]) {
      const template = templates[selectedTemplate];
      setGovernanceStrength([template.strength]);
      setSelectedComponents(new Set(template.components));
    }
  }, [selectedTemplate]);
  const getStrengthLevel = /* @__PURE__ */ __name((strength) => {
    if (strength < 33) {
      return "light";
    }
    if (strength < 67) {
      return "medium";
    }
    return "heavy";
  }, "getStrengthLevel");
  const getStrengthLabel = /* @__PURE__ */ __name((strength) => {
    if (strength < 33) {
      return "軽量（Light）";
    }
    if (strength < 67) {
      return "中程度（Medium）";
    }
    return "重厚（Heavy）";
  }, "getStrengthLabel");
  const getStrengthColor = /* @__PURE__ */ __name((strength) => {
    if (strength < 33) {
      return "text-green-600";
    }
    if (strength < 67) {
      return "text-yellow-600";
    }
    return "text-red-600";
  }, "getStrengthColor");
  const toggleComponent = /* @__PURE__ */ __name((componentId) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(componentId)) {
      newSelected.delete(componentId);
    } else {
      newSelected.add(componentId);
    }
    setSelectedComponents(newSelected);
  }, "toggleComponent");
  const exportFramework = /* @__PURE__ */ __name(() => {
    const framework = {
      name: customFramework.name || "カスタムガバナンスフレームワーク",
      description: customFramework.description || "プロジェクト固有のガバナンスフレームワーク",
      strength: governanceStrength[0],
      strengthLabel: getStrengthLabel(governanceStrength[0]),
      components: Array.from(selectedComponents).map((id) => {
        const component = governanceComponents.find((c) => c.id === id);
        return {
          id: component.id,
          name: component.name,
          description: component.description,
          implementation: component.strength[getStrengthLevel(governanceStrength[0])]
        };
      }),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(framework, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `governance-framework-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, "exportFramework");
  const CategoryBadge = /* @__PURE__ */ __name(({ category }) => {
    const categoryStyles = {
      foundation: "bg-blue-100 text-blue-800",
      control: "bg-purple-100 text-purple-800",
      transparency: "bg-amber-100 text-amber-800",
      value: "bg-green-100 text-green-800"
    };
    const categoryNames = {
      foundation: "基盤",
      control: "統制",
      transparency: "透明性",
      value: "価値"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: categoryStyles[category], children: categoryNames[category] });
  }, "CategoryBadge");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5 text-blue-600" }),
          "ガバナンスフレームワーク設計ツール"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの特性に応じて最適なガバナンスフレームワークを設計" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTemplate, onValueChange: setActiveTemplate, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "software", children: "ソフトウェア" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "infrastructure", children: "インフラ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "innovation", children: "イノベーション" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "compliance", children: "コンプライアンス" })
        ] }),
        Object.entries(templates).map(([key, template]) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: key, className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-blue-700", children: template.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: template.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: template.characteristics.map((char, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-blue-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: char })
            ] }, index)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: /* @__PURE__ */ __name(() => setSelectedTemplate(key), "onClick"),
                variant: "outline",
                className: "w-full",
                children: "このテンプレートを適用"
              }
            )
          ] })
        ] }) }, key))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-purple-600" }),
          "ガバナンス強度の設定"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの複雑さとリスクに応じてガバナンスの強度を調整" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "ガバナンス強度" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-medium ${getStrengthColor(governanceStrength[0])}`, children: [
              getStrengthLabel(governanceStrength[0]),
              " (",
              governanceStrength[0],
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              value: governanceStrength,
              onValueChange: setGovernanceStrength,
              max: 100,
              step: 1,
              className: "w-full"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "軽量（敏捷性重視）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "中程度（バランス）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "重厚（統制重視）" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "推奨設定：" }),
            governanceStrength[0] < 33 && " 短期間・低リスクのアジャイルプロジェクトに適用",
            governanceStrength[0] >= 33 && governanceStrength[0] < 67 && " 中規模・中リスクのハイブリッドプロジェクトに適用",
            governanceStrength[0] >= 67 && " 大規模・高リスクの従来型プロジェクトに適用"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-5 w-5 text-green-600" }),
          "ガバナンス構成要素の選択"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトに必要なガバナンス要素を選択してください" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: governanceComponents.map((component) => {
          const IconComponent = component.icon;
          const isSelected = selectedComponents.has(component.id);
          const strengthLevel = getStrengthLevel(governanceStrength[0]);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              className: `cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300"} ${component.required ? "ring-2 ring-yellow-200" : ""}`,
              onClick: /* @__PURE__ */ __name(() => !component.required && toggleComponent(component.id), "onClick"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Checkbox,
                      {
                        checked: isSelected,
                        onChange: /* @__PURE__ */ __name(() => !component.required && toggleComponent(component.id), "onChange"),
                        disabled: component.required
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-5 w-5 text-blue-600" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: component.category }),
                    component.required && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "必須" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-medium text-gray-900", children: component.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-gray-600", children: component.description }),
                isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-white p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-gray-700", children: [
                  "実装内容：",
                  component.strength[strengthLevel]
                ] }) })
              ] })
            },
            component.id
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            "選択済み：",
            selectedComponents.size,
            " / ",
            governanceComponents.length,
            " 要素"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: /* @__PURE__ */ __name(() => setSelectedComponents(/* @__PURE__ */ new Set()), "onClick"), size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-4 w-4" }),
              "リセット"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportFramework, disabled: selectedComponents.size === 0, size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
              "エクスポート"
            ] })
          ] })
        ] })
      ] })
    ] }),
    selectedComponents.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-indigo-600" }),
          "フレームワーク概要"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "設計されたガバナンスフレームワークの詳細" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-700", children: selectedComponents.size }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-blue-600", children: "選択要素数" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-purple-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-2xl font-bold ${getStrengthColor(governanceStrength[0])}`, children: [
              governanceStrength[0],
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-purple-600", children: "ガバナンス強度" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-700", children: Array.from(selectedComponents).filter(
              (id) => {
                var _a;
                return (_a = governanceComponents.find((c) => c.id === id)) == null ? void 0 : _a.required;
              }
            ).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-green-600", children: "必須要素数" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            "このフレームワークは",
            getStrengthLabel(governanceStrength[0]),
            "レベルのガバナンスを提供し、",
            selectedComponents.size,
            "個の要素を含んでいます。 プロジェクトの進行に合わせて要素の追加や調整を検討してください。"
          ] })
        ] })
      ] })
    ] })
  ] });
}, "GovernanceFramework");
const PhaseGateManagement = /* @__PURE__ */ __name(() => {
  const [activeApproach, setActiveApproach] = reactExports.useState("predictive");
  const [selectedPhase, setSelectedPhase] = reactExports.useState(0);
  const [gateDecisions, setGateDecisions] = reactExports.useState({});
  const [definitionOfDone, setDefinitionOfDone] = reactExports.useState({});
  const [customDodItems, setCustomDodItems] = reactExports.useState([]);
  const predictiveGates = [
    {
      id: "concept",
      name: "概念フェーズ",
      phase: "コンセプト",
      gate: "ゲート1：プロジェクト承認",
      description: "プロジェクトの実行可能性と戦略的適合性を評価",
      criteria: [
        "ビジネスケースの妥当性",
        "初期予算とスケジュールの合理性",
        "リスクアセスメントの完了",
        "ステークホルダーの合意",
        "組織の戦略的適合性"
      ],
      deliverables: [
        "プロジェクト憲章",
        "ビジネスケース",
        "初期リスクレジスター",
        "ステークホルダーレジスター",
        "概念設計書"
      ],
      decisions: ["継続", "修正", "中止"],
      keyQuestions: [
        "このプロジェクトは組織戦略に適合するか？",
        "投資対効果は妥当か？",
        "リスクは許容可能な範囲か？",
        "必要なリソースは確保可能か？"
      ]
    },
    {
      id: "definition",
      name: "定義フェーズ",
      phase: "デフィニション",
      gate: "ゲート2：実行承認",
      description: "プロジェクト要件と実行計画の詳細化と承認",
      criteria: [
        "詳細要件の定義完了",
        "実行計画の詳細化",
        "チーム編成の完了",
        "予算配分の確定",
        "品質基準の設定"
      ],
      deliverables: [
        "要件定義書",
        "プロジェクト管理計画書",
        "WBS（作業分解構造）",
        "詳細スケジュール",
        "品質管理計画"
      ],
      decisions: ["継続", "修正", "中止"],
      keyQuestions: [
        "要件は明確で実行可能か？",
        "計画は現実的で詳細か？",
        "チームは適切に編成されているか？",
        "品質基準は適切に設定されているか？"
      ]
    },
    {
      id: "execution",
      name: "実行フェーズ",
      phase: "エグゼキューション",
      gate: "ゲート3：実装承認",
      description: "プロジェクト成果物の開発と実装の評価",
      criteria: [
        "成果物の品質確認",
        "スケジュール遵守状況",
        "予算執行状況",
        "リスク管理状況",
        "ステークホルダー満足度"
      ],
      deliverables: [
        "プロジェクト成果物",
        "品質監査レポート",
        "進捗レポート",
        "変更管理ログ",
        "リスク更新レジスター"
      ],
      decisions: ["継続", "修正", "中止"],
      keyQuestions: [
        "成果物は品質基準を満たしているか？",
        "スケジュールは守られているか？",
        "予算は適切に管理されているか？",
        "リスクは適切に管理されているか？"
      ]
    },
    {
      id: "closure",
      name: "終結フェーズ",
      phase: "クロージャー",
      gate: "ゲート4：プロジェクト完了",
      description: "プロジェクトの正式な完了と教訓の収集",
      criteria: [
        "全成果物の検収完了",
        "ステークホルダー受け入れ",
        "契約の正式終了",
        "チームの解散",
        "教訓の文書化"
      ],
      deliverables: [
        "最終成果物",
        "プロジェクト完了報告書",
        "教訓学習レポート",
        "契約終了証明書",
        "アーカイブ文書"
      ],
      decisions: ["完了", "延長"],
      keyQuestions: [
        "全ての成果物は受け入れられたか？",
        "プロジェクト目標は達成されたか？",
        "教訓は適切に文書化されたか？",
        "チームは適切に解散されたか？"
      ]
    }
  ];
  const adaptiveIterations = [
    {
      id: "sprint1",
      name: "スプリント 1",
      phase: "イテレーション",
      gate: "スプリントレビュー",
      description: "最初の価値増分の開発と検証",
      criteria: [
        "スプリント目標の達成",
        "動作する製品増分の完成",
        "Definition of Done の遵守",
        "ステークホルダーフィードバック",
        "ベロシティの測定"
      ],
      deliverables: [
        "動作する製品増分",
        "スプリントレビュー結果",
        "レトロスペクティブ結果",
        "更新されたプロダクトバックログ",
        "ベロシティチャート"
      ],
      decisions: ["継続", "ピボット", "停止"],
      keyQuestions: [
        "スプリント目標は達成されたか？",
        "製品増分は動作するか？",
        "ステークホルダーは満足しているか？",
        "次のスプリントに向けた改善点は何か？"
      ]
    },
    {
      id: "sprint2",
      name: "スプリント 2",
      phase: "イテレーション",
      gate: "スプリントレビュー",
      description: "機能拡張と品質向上の実現",
      criteria: [
        "前回フィードバックの反映",
        "新機能の追加",
        "テストカバレッジの向上",
        "パフォーマンスの最適化",
        "チーム学習の継続"
      ],
      deliverables: [
        "拡張された製品増分",
        "改善されたテストスイート",
        "パフォーマンステストレポート",
        "学習記録",
        "適応計画"
      ],
      decisions: ["継続", "ピボット", "停止"],
      keyQuestions: [
        "前回のフィードバックは適切に反映されたか？",
        "新機能は期待通りに動作するか？",
        "チームの生産性は向上しているか？",
        "技術的品質は維持されているか？"
      ]
    },
    {
      id: "sprint3",
      name: "スプリント 3",
      phase: "イテレーション",
      gate: "スプリントレビュー",
      description: "統合とリリース準備の実施",
      criteria: [
        "システム統合の完了",
        "リリース基準の達成",
        "ユーザー受け入れテスト",
        "デプロイメント準備",
        "サポート体制の確立"
      ],
      deliverables: [
        "リリース可能な製品",
        "統合テスト結果",
        "ユーザー受け入れテスト結果",
        "デプロイメントガイド",
        "サポートドキュメント"
      ],
      decisions: ["リリース", "継続開発", "停止"],
      keyQuestions: [
        "製品はリリース可能な状態か？",
        "ユーザーは製品を受け入れているか？",
        "デプロイメント準備は完了しているか？",
        "サポート体制は確立されているか？"
      ]
    }
  ];
  const dodTemplates = {
    software: {
      name: "ソフトウェア開発",
      items: [
        "機能が要件を満たしている",
        "コードレビューが完了している",
        "単体テストが作成され成功している",
        "統合テストが成功している",
        "UIテストが成功している",
        "ドキュメントが更新されている",
        "セキュリティチェックが完了している",
        "パフォーマンステストが成功している",
        "ステークホルダーの承認を得ている",
        "プロダクトオーナーが受け入れている"
      ]
    },
    infrastructure: {
      name: "インフラストラクチャ",
      items: [
        "設計仕様を満たしている",
        "品質検査が完了している",
        "安全基準をクリアしている",
        "環境影響評価が完了している",
        "運用マニュアルが作成されている",
        "メンテナンス計画が策定されている",
        "ステークホルダーの承認を得ている",
        "法的要件を満たしている",
        "予算内で完了している",
        "引き渡し準備が完了している"
      ]
    },
    research: {
      name: "研究開発",
      items: [
        "研究目標が達成されている",
        "データが収集・分析されている",
        "結果が検証されている",
        "論文・レポートが作成されている",
        "ピアレビューが完了している",
        "知的財産が保護されている",
        "倫理審査をクリアしている",
        "研究データが適切に管理されている",
        "成果が共有されている",
        "フォローアップ計画が策定されている"
      ]
    }
  };
  const makeGateDecision = /* @__PURE__ */ __name((gateId, decision) => {
    setGateDecisions((prev) => ({
      ...prev,
      [gateId]: {
        decision,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        rationale: ""
      }
    }));
  }, "makeGateDecision");
  const getDecisionIcon = /* @__PURE__ */ __name((decision) => {
    switch (decision) {
      case "継続":
      case "リリース":
      case "完了":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" });
      case "修正":
      case "ピボット":
      case "継続開発":
      case "延長":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
      case "中止":
      case "停止":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "h-4 w-4 text-red-600" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gray-400" });
    }
  }, "getDecisionIcon");
  const getDecisionColor = /* @__PURE__ */ __name((decision) => {
    switch (decision) {
      case "継続":
      case "リリース":
      case "完了":
        return "border-green-500 bg-green-50";
      case "修正":
      case "ピボット":
      case "継続開発":
      case "延長":
        return "border-yellow-500 bg-yellow-50";
      case "中止":
      case "停止":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  }, "getDecisionColor");
  const addCustomDodItem = /* @__PURE__ */ __name(() => {
    setCustomDodItems((prev) => [...prev, ""]);
  }, "addCustomDodItem");
  const updateCustomDodItem = /* @__PURE__ */ __name((index, value) => {
    setCustomDodItems((prev) => prev.map((item, i) => i === index ? value : item));
  }, "updateCustomDodItem");
  const removeCustomDodItem = /* @__PURE__ */ __name((index) => {
    setCustomDodItems((prev) => prev.filter((_, i) => i !== index));
  }, "removeCustomDodItem");
  const currentGates = activeApproach === "predictive" ? predictiveGates : adaptiveIterations;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-5 w-5 text-indigo-600" }),
          "フェーズゲート管理システム"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの進捗と品質を管理するゲートレビューシステム" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeApproach, onValueChange: setActiveApproach, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "predictive", children: "予測型フェーズゲート" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "adaptive", children: "適応型イテレーション" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "predictive", className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "予測型アプローチ：" }),
              "段階的なフェーズゲートレビューにより、プロジェクトの進行可否を厳格に判定します。 各ゲートで承認を得てから次のフェーズに進みます。"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: predictiveGates.map((gate, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `transition-all ${gateDecisions[gate.id] ? getDecisionColor(gateDecisions[gate.id].decision) : "border-gray-200 hover:border-gray-300"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `flex h-8 w-8 items-center justify-center rounded-full ${gateDecisions[gate.id] ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`,
                          children: index + 1
                        }
                      ),
                      gate.name
                    ] }),
                    gateDecisions[gate.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [
                      getDecisionIcon(gateDecisions[gate.id].decision),
                      gateDecisions[gate.id].decision
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: gate.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "ゲート判定基準" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: gate.criteria.map((criterion, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-blue-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: criterion })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "主要成果物" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: gate.deliverables.map((deliverable, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-green-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: deliverable })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "重要な質問" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: gate.keyQuestions.map((question, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mt-0.5 h-4 w-4 text-purple-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: question })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium text-gray-900", children: "ゲート判定" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: gate.decisions.map((decision) => {
                      var _a;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          variant: ((_a = gateDecisions[gate.id]) == null ? void 0 : _a.decision) === decision ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => makeGateDecision(gate.id, decision), "onClick"),
                          className: "flex items-center gap-1",
                          children: [
                            getDecisionIcon(decision),
                            decision
                          ]
                        },
                        decision
                      );
                    }) }),
                    gateDecisions[gate.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Textarea,
                      {
                        placeholder: "判定理由を入力してください...",
                        className: "h-20",
                        value: gateDecisions[gate.id].rationale || "",
                        onChange: /* @__PURE__ */ __name((e) => setGateDecisions((prev) => ({
                          ...prev,
                          [gate.id]: {
                            ...prev[gate.id],
                            rationale: e.target.value
                          }
                        })), "onChange")
                      }
                    ) })
                  ] })
                ] })
              ]
            },
            gate.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "adaptive", className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "適応型アプローチ：" }),
              "短いイテレーションごとにレビューを実施し、継続的なフィードバックと改善を通じて 価値を早期に提供します。"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: adaptiveIterations.map((iteration, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `transition-all ${gateDecisions[iteration.id] ? getDecisionColor(gateDecisions[iteration.id].decision) : "border-gray-200 hover:border-gray-300"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: `flex h-8 w-8 items-center justify-center rounded-full ${gateDecisions[iteration.id] ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`,
                          children: index + 1
                        }
                      ),
                      iteration.name
                    ] }),
                    gateDecisions[iteration.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [
                      getDecisionIcon(gateDecisions[iteration.id].decision),
                      gateDecisions[iteration.id].decision
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: iteration.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "レビュー基準" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: iteration.criteria.map((criterion, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-green-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: criterion })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "主要成果物" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: iteration.deliverables.map((deliverable, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-blue-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: deliverable })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-gray-900", children: "レビュー質問" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: iteration.keyQuestions.map((question, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "mt-0.5 h-4 w-4 text-indigo-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: question })
                    ] }, idx)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium text-gray-900", children: "レビュー結果" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: iteration.decisions.map((decision) => {
                      var _a;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          variant: ((_a = gateDecisions[iteration.id]) == null ? void 0 : _a.decision) === decision ? "default" : "outline",
                          size: "sm",
                          onClick: /* @__PURE__ */ __name(() => makeGateDecision(iteration.id, decision), "onClick"),
                          className: "flex items-center gap-1",
                          children: [
                            getDecisionIcon(decision),
                            decision
                          ]
                        },
                        decision
                      );
                    }) }),
                    gateDecisions[iteration.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Textarea,
                      {
                        placeholder: "レビュー結果と改善点を入力してください...",
                        className: "h-20",
                        value: gateDecisions[iteration.id].rationale || "",
                        onChange: /* @__PURE__ */ __name((e) => setGateDecisions((prev) => ({
                          ...prev,
                          [iteration.id]: {
                            ...prev[iteration.id],
                            rationale: e.target.value
                          }
                        })), "onChange")
                      }
                    ) })
                  ] })
                ] })
              ]
            },
            iteration.id
          )) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-5 w-5 text-green-600" }),
          "Definition of Done (完了の定義) 管理"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "品質基準と完了条件の明確化と管理" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-3", children: Object.entries(dodTemplates).map(([key, template]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-blue-700", children: template.name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              template.items.slice(0, 5).map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: item })
              ] }, index)),
              template.items.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-500", children: [
                "+",
                template.items.length - 5,
                " 項目"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: /* @__PURE__ */ __name(() => setDefinitionOfDone((prev) => ({
                  ...prev,
                  [key]: new Set(template.items)
                })), "onClick"),
                className: "w-full",
                children: "このテンプレートを使用"
              }
            )
          ] })
        ] }, key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-dashed border-gray-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "カスタム Definition of Done" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクト固有の完了基準を追加できます" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: customDodItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: item,
                  onChange: /* @__PURE__ */ __name((e) => updateCustomDodItem(index, e.target.value), "onChange"),
                  placeholder: "完了基準を入力...",
                  className: "flex-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: /* @__PURE__ */ __name(() => removeCustomDodItem(index), "onClick"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "h-4 w-4" }) })
            ] }, index)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: addCustomDodItem, className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }),
              "基準を追加"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Definition of Done の重要性：" }),
            "明確な完了基準により、品質の一貫性を保ち、ステークホルダー間の期待値を 合わせることができます。各イテレーションやフェーズでこの基準を確認しましょう。"
          ] })
        ] })
      ] })
    ] }),
    Object.keys(gateDecisions).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-5 w-5 text-purple-600" }),
          "ゲートレビュー進捗概要"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトのゲートレビュー状況と判定結果" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-700", children: Object.keys(gateDecisions).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-blue-600", children: "レビュー完了" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-700", children: Object.values(gateDecisions).filter(
              (d) => ["継続", "リリース", "完了"].includes(d.decision)
            ).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-green-600", children: "承認済み" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-yellow-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-yellow-700", children: Object.values(gateDecisions).filter(
              (d) => ["修正", "ピボット", "継続開発", "延長"].includes(d.decision)
            ).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-yellow-600", children: "要修正" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-700", children: Object.values(gateDecisions).filter(
              (d) => ["中止", "停止"].includes(d.decision)
            ).length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-600", children: "中止・停止" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "最近の判定" }),
          Object.entries(gateDecisions).sort(([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3).map(([gateId, decision]) => {
            const gate = currentGates.find((g) => g.id === gateId);
            return gate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between rounded-lg border p-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    getDecisionIcon(decision.decision),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: gate.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: new Date(decision.timestamp).toLocaleDateString("ja-JP") })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: decision.decision })
                ]
              },
              gateId
            ) : null;
          })
        ] })
      ] })
    ] })
  ] });
}, "PhaseGateManagement");
const ProjectGovernanceLearning = /* @__PURE__ */ __name(() => {
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [completedSections, setCompletedSections] = reactExports.useState(/* @__PURE__ */ new Set());
  const [selectedGovernanceType, setSelectedGovernanceType] = reactExports.useState("prescriptive");
  const [learningProgress, setLearningProgress] = reactExports.useState(0);
  const [activeTab, setActiveTab] = reactExports.useState("introduction");
  const learningModules = [
    {
      id: "introduction",
      title: "プロジェクト・ガバナンスの基礎",
      description: "ガバナンスの概念と重要性を理解する",
      duration: "20分",
      topics: [
        "ガバナンスとマネジメントの違い",
        "プロジェクト成功へのガバナンスの影響",
        "ステークホルダーの期待管理",
        "透明性と説明責任の重要性"
      ]
    },
    {
      id: "components",
      title: "ガバナンス構成要素（13要素）",
      description: "効果的なガバナンスを構築する13の要素",
      duration: "30分",
      topics: [
        "ガバナンス構造・プロセス・意思決定",
        "監督・管理・統制機能",
        "レポーティング・透明性・説明責任",
        "リスク管理・品質管理・価値実現",
        "ステークホルダー関与"
      ]
    },
    {
      id: "types",
      title: "予測型 vs 適応型ガバナンス",
      description: "プロジェクトタイプに応じたガバナンスアプローチ",
      duration: "25分",
      topics: [
        "予測型ガバナンスの特徴と適用場面",
        "適応型ガバナンスの特徴と適用場面",
        "ハイブリッドアプローチの選択",
        "ガバナンス強度の調整"
      ]
    }
  ];
  const governanceComponents = [
    { id: "structure", name: "ガバナンス構造", icon: Building, category: "foundation" },
    { id: "processes", name: "ガバナンスプロセス", icon: Settings, category: "foundation" },
    { id: "decisions", name: "意思決定フレームワーク", icon: Target, category: "foundation" },
    { id: "oversight", name: "監督機能", icon: Eye, category: "control" },
    { id: "management", name: "管理機能", icon: Users, category: "control" },
    { id: "control", name: "統制機能", icon: Shield, category: "control" },
    { id: "reporting", name: "レポーティング", icon: BarChart3, category: "transparency" },
    { id: "transparency", name: "透明性", icon: FileText, category: "transparency" },
    { id: "accountability", name: "説明責任", icon: Award, category: "transparency" },
    { id: "risk", name: "リスク管理", icon: Activity, category: "value" },
    { id: "quality", name: "品質管理", icon: CheckCircle2, category: "value" },
    { id: "value", name: "価値実現", icon: TrendingUp, category: "value" },
    { id: "stakeholder", name: "ステークホルダー関与", icon: Users, category: "value" }
  ];
  const governanceTypes = {
    prescriptive: {
      name: "予測型ガバナンス",
      description: "詳細な計画と厳格な統制に基づく従来的アプローチ",
      characteristics: [
        "事前の詳細計画",
        "段階的なフェーズゲート",
        "厳格な変更管理",
        "包括的な文書化",
        "階層的な意思決定"
      ],
      suitableFor: [
        "規制の厳しい業界",
        "大規模インフラプロジェクト",
        "高リスクプロジェクト",
        "要件が明確なプロジェクト"
      ],
      color: "blue"
    },
    adaptive: {
      name: "適応型ガバナンス",
      description: "柔軟性と反復的改善を重視する現代的アプローチ",
      characteristics: [
        "反復的な計画策定",
        "頻繁なレビューポイント",
        "迅速な意思決定",
        "軽量な文書化",
        "分散的な権限"
      ],
      suitableFor: [
        "イノベーションプロジェクト",
        "ソフトウェア開発",
        "不確実性の高いプロジェクト",
        "短期間での価値提供"
      ],
      color: "green"
    }
  };
  reactExports.useEffect(() => {
    const totalSections = learningModules.length;
    const progress = completedSections.size / totalSections * 100;
    setLearningProgress(progress);
  }, [completedSections]);
  const markSectionComplete = /* @__PURE__ */ __name((sectionId) => {
    setCompletedSections((prev) => /* @__PURE__ */ new Set([...prev, sectionId]));
  }, "markSectionComplete");
  const CategoryBadge = /* @__PURE__ */ __name(({ category }) => {
    const categoryStyles = {
      foundation: "bg-blue-100 text-blue-800",
      control: "bg-purple-100 text-purple-800",
      transparency: "bg-amber-100 text-amber-800",
      value: "bg-green-100 text-green-800"
    };
    const categoryNames = {
      foundation: "基盤",
      control: "統制",
      transparency: "透明性",
      value: "価値"
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: categoryStyles[category], children: categoryNames[category] });
  }, "CategoryBadge");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-flex items-center justify-center rounded-full bg-blue-600 p-3 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-4xl font-bold text-gray-900", children: "プロジェクト・ガバナンス学習ハブ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600", children: "効果的なプロジェクトガバナンスの理論と実践を学習" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-6 max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex justify-between text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "学習進捗" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            Math.round(learningProgress),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: learningProgress, className: "h-2" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "introduction", children: "基礎概念" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "components", children: "構成要素" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: "タイプ比較" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "framework", children: "フレームワーク" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "gates", children: "ゲート管理" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "introduction", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5 text-blue-600" }),
            "プロジェクト・ガバナンスとは"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトガバナンスの基本概念と重要性を理解しましょう" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ガバナンス vs マネジメント：" }),
              "ガバナンスは「何をすべきか」を決定し、マネジメントは「どのように実行するか」を担当します。"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-blue-700", children: "ガバナンスの役割" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "戦略的方向性の設定" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "監督と統制" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "リスク管理" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "説明責任の確保" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-green-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-green-700", children: "マネジメントの役割" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "日常的な運営管理" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "チーム管理" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "プロセス実行" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "進捗監視" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "学習モジュール" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: learningModules.map((module, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                className: `transition-all ${completedSections.has(module.id) ? "border-green-500 bg-green-50" : "hover:shadow-md"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center justify-between p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `flex h-8 w-8 items-center justify-center rounded-full ${completedSections.has(module.id) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`,
                        children: completedSections.has(module.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: index + 1 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: module.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: module.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs text-gray-500", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                        module.duration
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: completedSections.has(module.id) ? "default" : "outline",
                      size: "sm",
                      onClick: /* @__PURE__ */ __name(() => markSectionComplete(module.id), "onClick"),
                      disabled: completedSections.has(module.id),
                      children: completedSections.has(module.id) ? "完了" : "学習開始"
                    }
                  )
                ] })
              },
              module.id
            )) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "components", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-5 w-5 text-purple-600" }),
            "ガバナンス構成要素（13要素）"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "効果的なプロジェクトガバナンスを構築する13の重要要素" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: governanceComponents.map((component) => {
            const IconComponent = component.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "transition-transform hover:scale-105", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-6 w-6 text-purple-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: component.category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900", children: component.name })
            ] }) }, component.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-blue-700", children: "基盤要素" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "ガバナンスの土台となる構造とプロセス" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "組織構造とロール定義" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "標準化されたプロセス" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "明確な意思決定権限" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-purple-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-purple-700", children: "統制要素" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの監督と管理機能" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-purple-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "継続的な監督機能" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-purple-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "効果的な管理体制" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-purple-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "適切な統制メカニズム" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-amber-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-amber-700", children: "透明性要素" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "情報共有と説明責任の確保" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "h-4 w-4 text-amber-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "定期的なレポーティング" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-amber-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "情報の透明性" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-amber-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "明確な説明責任" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-green-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg text-green-700", children: "価値要素" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "価値実現とステークホルダー満足" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "プロアクティブなリスク管理" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "継続的な品質確保" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "価値実現の最大化" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comparison", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-5 w-5 text-indigo-600" }),
            "予測型 vs 適応型ガバナンス"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "プロジェクトの性質に応じて最適なガバナンスアプローチを選択" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg bg-gray-100 p-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: selectedGovernanceType === "prescriptive" ? "default" : "ghost",
                size: "sm",
                onClick: /* @__PURE__ */ __name(() => setSelectedGovernanceType("prescriptive"), "onClick"),
                className: "rounded-md",
                children: "予測型"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: selectedGovernanceType === "adaptive" ? "default" : "ghost",
                size: "sm",
                onClick: /* @__PURE__ */ __name(() => setSelectedGovernanceType("adaptive"), "onClick"),
                className: "rounded-md",
                children: "適応型"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: Object.entries(governanceTypes).map(([key, type]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              className: `transition-all ${selectedGovernanceType === key ? `border-${type.color}-500 shadow-lg` : "border-gray-200"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: `text-${type.color}-700`, children: type.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: type.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium", children: "主な特徴" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: type.characteristics.map((char, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: `h-4 w-4 text-${type.color}-600` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: char })
                    ] }, index)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium", children: "適用場面" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: type.suitableFor.map((situation, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: `h-4 w-4 text-${type.color}-600` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: situation })
                    ] }, index)) })
                  ] })
                ] })
              ]
            },
            key
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ハイブリッドアプローチ：" }),
              "実際のプロジェクトでは、予測型と適応型の要素を組み合わせることが多く、 プロジェクトの段階や領域に応じてガバナンスの強度を調整することが重要です。"
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "framework", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GovernanceFramework, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "gates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhaseGateManagement, {}) })
    ] })
  ] }) });
}, "ProjectGovernanceLearning");
export {
  ProjectGovernanceLearning as default
};
