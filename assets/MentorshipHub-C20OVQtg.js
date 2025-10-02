var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { s as Users, S as Search, aC as MessageSquare, ar as Award, aU as Filter, aY as Building, aQ as Briefcase, aZ as MapPin, a3 as Star, au as Trophy, c as Clock, a_ as Video, aw as AlertCircle, T as TrendingUp, w as Heart, aH as Globe, av as CheckCircle, t as Target } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const MentorshipHub = /* @__PURE__ */ __name(() => {
  const [connections] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("find-mentor");
  const [mentors, setMentors] = reactExports.useState([]);
  const [filteredMentors, setFilteredMentors] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [filters, setFilters] = reactExports.useState({
    industry: "",
    experience: "",
    location: "",
    availability: "",
    language: ""
  });
  const [mentorshipRequests, setMentorshipRequests] = reactExports.useState([]);
  const mockMentors = [
    {
      id: "m1",
      name: "田中 健太郎",
      title: "シニアプロジェクトマネージャー",
      company: "テックイノベーション株式会社",
      experience: 12,
      industry: ["IT", "フィンテック"],
      location: "東京",
      languages: ["日本語", "英語"],
      rating: 4.9,
      reviewCount: 127,
      specialties: ["アジャイル開発", "デジタル変革", "チームマネジメント"],
      certifications: ["PMP", "CSM", "SAFe"],
      menteeCount: 45,
      successRate: 94,
      availability: "weekends",
      priceRange: "無料",
      bio: "12年間のIT業界経験を持ち、特にアジャイル開発とデジタル変革プロジェクトを専門としています。これまで50以上のプロジェクトを成功に導き、現在はメンタリングを通じて次世代のPMを育成しています。",
      achievements: [
        "年間最優秀PMアワード受賞（2023）",
        "Fortune 500企業でのプロジェクト成功率95%",
        "メンティの平均年収向上率35%"
      ],
      communicationStyle: "practical",
      avatar: "🧑‍💼",
      status: "available",
      lastActive: "2時間前",
      responseTime: "通常2時間以内",
      sessionTypes: ["1対1メンタリング", "グループセッション", "プロジェクトレビュー"]
    },
    {
      id: "m2",
      name: "佐藤 美恵",
      title: "グローバル PMO ディレクター",
      company: "国際コンサルティング",
      experience: 15,
      industry: ["コンサルティング", "製造業", "ヘルスケア"],
      location: "大阪",
      languages: ["日本語", "英語", "中国語"],
      rating: 4.8,
      reviewCount: 89,
      specialties: ["プロジェクトポートフォリオ", "国際プロジェクト", "PMO構築"],
      certifications: ["PMP", "PgMP", "PfMP"],
      menteeCount: 32,
      successRate: 91,
      availability: "evenings",
      priceRange: "¥5,000-10,000/時",
      bio: "15年間でグローバル企業のPMOを複数立ち上げ、国際的なプロジェクトマネジメントのエキスパートとして活動。特に多文化チームでのプロジェクト運営に強み。",
      achievements: ["PMI Global Award受賞", "3つの国でPMO設立", "メンティの海外赴任成功率80%"],
      communicationStyle: "structured",
      avatar: "👩‍💼",
      status: "busy",
      lastActive: "30分前",
      responseTime: "通常4時間以内",
      sessionTypes: ["戦略セッション", "キャリア相談", "国際プロジェクト指導"]
    },
    {
      id: "m3",
      name: "マイケル・ジョンソン",
      title: "シニア・テクニカルPM",
      company: "グローバルテック",
      experience: 8,
      industry: ["AI/ML", "クラウド", "セキュリティ"],
      location: "リモート（米国）",
      languages: ["英語", "日本語"],
      rating: 4.7,
      reviewCount: 156,
      specialties: ["テクニカルPM", "AI/MLプロジェクト", "クラウド移行"],
      certifications: ["PMP", "AWS Certified", "Google Cloud Professional"],
      menteeCount: 28,
      successRate: 89,
      availability: "flexible",
      priceRange: "$50-100/時",
      bio: "Silicon ValleyでAI/MLプロジェクトを多数手掛けるテクニカルPM。日本企業との協業経験も豊富で、技術とビジネスの架け橋として活動。",
      achievements: [
        "テック企業でのプロダクト成功率92%",
        "AI関連特許3件保有",
        "カンファレンス登壇50回以上"
      ],
      communicationStyle: "technical",
      avatar: "👨‍💻",
      status: "available",
      lastActive: "1時間前",
      responseTime: "通常6時間以内（時差あり）",
      sessionTypes: ["テクニカル指導", "プロダクト戦略", "キャリア相談"]
    }
  ];
  reactExports.useEffect(() => {
    setMentors(mockMentors);
    setFilteredMentors(mockMentors);
  }, []);
  reactExports.useEffect(() => {
    let filtered = mentors;
    if (searchQuery) {
      filtered = filtered.filter(
        (mentor) => mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) || mentor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) || mentor.industry.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filters.industry) {
      filtered = filtered.filter((mentor) => mentor.industry.includes(filters.industry));
    }
    if (filters.experience) {
      const expMap = { junior: [0, 5], mid: [6, 10], senior: [11, 20] };
      const [min, max] = expMap[filters.experience] || [0, 100];
      filtered = filtered.filter((mentor) => mentor.experience >= min && mentor.experience <= max);
    }
    if (filters.availability) {
      filtered = filtered.filter((mentor) => mentor.availability === filters.availability);
    }
    if (filters.language) {
      filtered = filtered.filter((mentor) => mentor.languages.includes(filters.language));
    }
    setFilteredMentors(filtered);
  }, [mentors, searchQuery, filters]);
  const sendMentorshipRequest = reactExports.useCallback(
    async (mentorId) => {
      var _a;
      const newRequest = {
        id: Date.now(),
        mentorId,
        mentorName: (_a = mentors.find((m) => m.id === mentorId)) == null ? void 0 : _a.name,
        status: "pending",
        message: "",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        proposedTime: null
      };
      setMentorshipRequests((prev) => [...prev, newRequest]);
      alert("メンタリング申請を送信しました。メンターからの返信をお待ちください。");
    },
    [mentors]
  );
  const getStatusColor = /* @__PURE__ */ __name((status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }, "getStatusColor");
  const getCommunicationStyleIcon = /* @__PURE__ */ __name((style) => {
    switch (style) {
      case "practical":
        return "🎯";
      case "structured":
        return "📋";
      case "technical":
        return "⚙️";
      default:
        return "💬";
    }
  }, "getCommunicationStyleIcon");
  const renderFindMentor = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-4 md:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              "aria-label": "Input field",
              id: "input-1754995293945-234",
              type: "text",
              placeholder: "メンター、スキル、業界で検索...",
              value: searchQuery,
              onChange: /* @__PURE__ */ __name((e) => setSearchQuery(e.target.value), "onChange"),
              className: "w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "mr-2 h-4 w-4" }),
          "フィルター"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.industry,
            onChange: /* @__PURE__ */ __name((e) => setFilters((prev) => ({ ...prev, industry: e.target.value })), "onChange"),
            className: "rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "業界" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IT", children: "IT" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "コンサルティング", children: "コンサルティング" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "製造業", children: "製造業" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ヘルスケア", children: "ヘルスケア" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.experience,
            onChange: /* @__PURE__ */ __name((e) => setFilters((prev) => ({ ...prev, experience: e.target.value })), "onChange"),
            className: "rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "経験年数" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "junior", children: "5年以下" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mid", children: "6-10年" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "senior", children: "11年以上" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.availability,
            onChange: /* @__PURE__ */ __name((e) => setFilters((prev) => ({ ...prev, availability: e.target.value })), "onChange"),
            className: "rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "対応時間" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekdays", children: "平日" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekends", children: "週末" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "evenings", children: "夜間" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "flexible", children: "柔軟" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.language,
            onChange: /* @__PURE__ */ __name((e) => setFilters((prev) => ({ ...prev, language: e.target.value })), "onChange"),
            className: "rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "言語" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "日本語", children: "日本語" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "英語", children: "英語" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "中国語", children: "中国語" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setFilters({
              industry: "",
              experience: "",
              location: "",
              availability: "",
              language: ""
            }), "onClick"),
            className: "rounded-lg border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700",
            children: "クリア"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: filteredMentors.map((mentor) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-3 text-4xl", children: mentor.avatar }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: mentor.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: mentor.title })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(mentor.status)}`,
                children: mentor.status === "available" ? "対応可能" : mentor.status === "busy" ? "多忙" : "オフライン"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "mr-1 h-4 w-4" }),
              mentor.company
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "mr-1 h-4 w-4" }),
              mentor.experience,
              "年の経験 • ",
              mentor.industry.join(", ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mr-1 h-4 w-4" }),
              mentor.location,
              " • ",
              mentor.languages.join(", ")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mr-4 flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-current text-yellow-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-sm font-medium", children: mentor.rating }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-gray-500", children: [
                "(",
                mentor.reviewCount,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mr-4 flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-blue-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-sm", children: [
                mentor.menteeCount,
                "人指導"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-sm", children: [
                mentor.successRate,
                "%成功率"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: mentor.specialties.slice(0, 3).map((specialty, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800",
              children: specialty
            },
            index
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 line-clamp-3 text-xs text-gray-600 dark:text-gray-300", children: mentor.bio }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-3 w-3" }),
              mentor.responseTime
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              getCommunicationStyleIcon(mentor.communicationStyle),
              mentor.communicationStyle === "practical" ? "実践型" : mentor.communicationStyle === "structured" ? "構造型" : "技術型"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => sendMentorshipRequest(mentor.id), "onClick"),
                className: "flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700",
                children: "メンタリング申請"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }) })
          ] })
        ] })
      },
      mentor.id
    )) }),
    filteredMentors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-medium text-gray-900 dark:text-white", children: "条件に合うメンターが見つかりません" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "検索条件を調整するか、フィルターをクリアしてください" })
    ] })
  ] }), "renderFindMentor");
  const renderMyConnections = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-gray-900 dark:text-white", children: "進行中のメンタリング" }),
      connections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "まだメンタリングセッションがありません。メンターを探してみましょう。" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setActiveTab("find-mentor"), "onClick"),
            className: "mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",
            children: "メンターを探す"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: connections.map((connection) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "rounded-lg border border-gray-200 p-4 dark:border-gray-600",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-3 text-2xl", children: connection.avatar }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900 dark:text-white", children: connection.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: connection.nextSession })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "mr-1 inline h-4 w-4" }),
                "セッション開始"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }) })
            ] })
          ] })
        },
        connection.id
      )) })
    ] }),
    mentorshipRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-gray-900 dark:text-white", children: "メンタリング申請状況" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: mentorshipRequests.map((request) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: request.mentorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-gray-600 dark:text-gray-300", children: "への申請" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mr-1 h-4 w-4 text-yellow-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-yellow-600", children: "承認待ち" })
            ] })
          ]
        },
        request.id
      )) })
    ] })
  ] }), "renderMyConnections");
  const renderBecomeMentor = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-8 shadow dark:from-purple-900/20 dark:to-blue-900/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "mx-auto mb-4 h-16 w-16 text-purple-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold text-gray-900 dark:text-white", children: "メンターになりませんか？" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300", children: "あなたの経験とスキルで次世代のPMを育成しましょう" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid grid-cols-1 gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mx-auto mb-2 h-8 w-8 text-green-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold text-gray-900 dark:text-white", children: "追加収入" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "月5-20万円の副収入を得られます" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "mx-auto mb-2 h-8 w-8 text-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold text-gray-900 dark:text-white", children: "やりがい" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "次世代PMの成長を直接サポート" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "mx-auto mb-2 h-8 w-8 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold text-gray-900 dark:text-white", children: "ネットワーク" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "業界のリーダーとの繋がり構築" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-lg bg-purple-600 px-8 py-3 text-lg font-medium text-white hover:bg-purple-700", children: "メンター申請する" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-500", children: "申請から審査完了まで通常3-5営業日" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white p-6 shadow dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-gray-900 dark:text-white", children: "メンター要件" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-medium text-gray-900 dark:text-white", children: "必須要件" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
              "PMP認定資格保有"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
              "5年以上のPM実務経験"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
              "過去3年以内のプロジェクト成功実績"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-2 h-4 w-4 text-green-500" }),
              "メンタリング経験（推奨）"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-medium text-gray-900 dark:text-white", children: "期待する活動" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4 text-blue-500" }),
              "月2-4時間のメンタリングセッション"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4 text-blue-500" }),
              "学習者からの質問への回答"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4 text-blue-500" }),
              "キャリア相談とガイダンス"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center text-gray-600 dark:text-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4 text-blue-500" }),
              "プロジェクト課題の相談対応"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }), "renderBecomeMentor");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6 dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-3 h-8 w-8 text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "メンターシップハブ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto max-w-3xl text-gray-600 dark:text-gray-300", children: "経験豊富なプロジェクトマネージャーとのマンツーマン指導で、実践的なスキルと深い洞察を身につけましょう" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-lg bg-white shadow-lg dark:bg-gray-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-gray-200 dark:border-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex space-x-8 px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setActiveTab("find-mentor"), "onClick"),
            className: `border-b-2 px-2 py-4 text-sm font-medium ${activeTab === "find-mentor" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-1 inline h-4 w-4" }),
              "メンターを探す"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setActiveTab("my-connections"), "onClick"),
            className: `border-b-2 px-2 py-4 text-sm font-medium ${activeTab === "my-connections" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mr-1 inline h-4 w-4" }),
              "マイメンタリング",
              mentorshipRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white", children: mentorshipRequests.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setActiveTab("become-mentor"), "onClick"),
            className: `border-b-2 px-2 py-4 text-sm font-medium ${activeTab === "become-mentor" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "mr-1 inline h-4 w-4" }),
              "メンターになる"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        activeTab === "find-mentor" && renderFindMentor(),
        activeTab === "my-connections" && renderMyConnections(),
        activeTab === "become-mentor" && renderBecomeMentor()
      ] })
    ] })
  ] }) });
}, "MentorshipHub");
export {
  MentorshipHub as default
};
