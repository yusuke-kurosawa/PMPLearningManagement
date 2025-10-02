var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { a as useTheme } from "./index-CZZZnLRW.js";
import { F as FileText, ae as Plus, am as Tag, U as User, aa as Eye, w as Heart, aC as MessageSquare, X, a7 as Calendar, aD as Share2, aE as Trash2, aA as Send, aF as Reply, aG as ChevronUp, a4 as ChevronDown, s as Users, aH as Globe, aI as Lock, t as Target, Y as LogOut, T as TrendingUp, B as Bell } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const _CollaborationService = class _CollaborationService {
  constructor() {
    this.notes = [];
    this.comments = [];
    this.studyGroups = [];
    this.sharedLinks = /* @__PURE__ */ new Map();
    this.loadData();
  }
  // データの読み込み
  loadData() {
    try {
      const savedNotes = localStorage.getItem("sharedNotes");
      const savedComments = localStorage.getItem("comments");
      const savedGroups = localStorage.getItem("studyGroups");
      if (savedNotes) {
        this.notes = JSON.parse(savedNotes);
      }
      if (savedComments) {
        this.comments = JSON.parse(savedComments);
      }
      if (savedGroups) {
        this.studyGroups = JSON.parse(savedGroups);
      }
    } catch (error) {
    }
  }
  // データの保存
  saveData() {
    try {
      localStorage.setItem("sharedNotes", JSON.stringify(this.notes));
      localStorage.setItem("comments", JSON.stringify(this.comments));
      localStorage.setItem("studyGroups", JSON.stringify(this.studyGroups));
    } catch (error) {
    }
  }
  // === 学習ノート機能 ===
  // ノートの作成
  createNote(note) {
    const newNote = {
      id: this.generateId(),
      title: note.title,
      content: note.content,
      processId: note.processId || null,
      knowledgeArea: note.knowledgeArea || null,
      tags: note.tags || [],
      author: note.author || "Anonymous",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isPublic: note.isPublic || false,
      likes: 0,
      views: 0
    };
    this.notes.unshift(newNote);
    this.saveData();
    return newNote;
  }
  // ノートの取得
  getNotes(filters = {}) {
    let filteredNotes = [...this.notes];
    if (filters.processId) {
      filteredNotes = filteredNotes.filter((n) => n.processId === filters.processId);
    }
    if (filters.knowledgeArea) {
      filteredNotes = filteredNotes.filter((n) => n.knowledgeArea === filters.knowledgeArea);
    }
    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter((n) => filters.tags.some((tag) => n.tags.includes(tag)));
    }
    if (filters.author) {
      filteredNotes = filteredNotes.filter((n) => n.author === filters.author);
    }
    if (filters.isPublic !== void 0) {
      filteredNotes = filteredNotes.filter((n) => n.isPublic === filters.isPublic);
    }
    return filteredNotes;
  }
  // ノートの更新
  updateNote(noteId, updates) {
    const index = this.notes.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.saveData();
      return this.notes[index];
    }
    return null;
  }
  // ノートの削除
  deleteNote(noteId) {
    this.notes = this.notes.filter((n) => n.id !== noteId);
    this.saveData();
  }
  // ノートのいいね
  likeNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.likes++;
      this.saveData();
      return note;
    }
    return null;
  }
  // === コメント・ディスカッション機能 ===
  // コメントの追加
  addComment(comment) {
    const newComment = {
      id: this.generateId(),
      targetId: comment.targetId,
      // ノートID、プロセスIDなど
      targetType: comment.targetType,
      // 'note', 'process', 'glossary'など
      content: comment.content,
      author: comment.author || "Anonymous",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      replies: [],
      likes: 0
    };
    this.comments.push(newComment);
    this.saveData();
    return newComment;
  }
  // コメントの取得
  getComments(targetId, targetType) {
    return this.comments.filter((c) => c.targetId === targetId && c.targetType === targetType);
  }
  // 返信の追加
  addReply(commentId, reply) {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      const newReply = {
        id: this.generateId(),
        content: reply.content,
        author: reply.author || "Anonymous",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        likes: 0
      };
      comment.replies.push(newReply);
      this.saveData();
      return newReply;
    }
    return null;
  }
  // コメントのいいね
  likeComment(commentId) {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.likes++;
      this.saveData();
      return comment;
    }
    return null;
  }
  // === 学習グループ機能 ===
  // グループの作成
  createStudyGroup(group) {
    const newGroup = {
      id: this.generateId(),
      name: group.name,
      description: group.description,
      members: [group.creator || "Anonymous"],
      creator: group.creator || "Anonymous",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetDate: group.targetDate || null,
      isPublic: group.isPublic || true,
      sharedProgress: {},
      announcements: []
    };
    this.studyGroups.push(newGroup);
    this.saveData();
    return newGroup;
  }
  // グループへの参加
  joinGroup(groupId, username) {
    const group = this.studyGroups.find((g) => g.id === groupId);
    if (group && !group.members.includes(username)) {
      group.members.push(username);
      this.saveData();
      return group;
    }
    return null;
  }
  // グループの取得
  getStudyGroups(filters = {}) {
    let filteredGroups = [...this.studyGroups];
    if (filters.member) {
      filteredGroups = filteredGroups.filter((g) => g.members.includes(filters.member));
    }
    if (filters.isPublic !== void 0) {
      filteredGroups = filteredGroups.filter((g) => g.isPublic === filters.isPublic);
    }
    return filteredGroups;
  }
  // グループ内の進捗共有
  shareProgress(groupId, username, progress) {
    const group = this.studyGroups.find((g) => g.id === groupId);
    if (group) {
      if (!group.sharedProgress[username]) {
        group.sharedProgress[username] = {};
      }
      group.sharedProgress[username] = {
        ...progress,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.saveData();
      return group;
    }
    return null;
  }
  // グループのお知らせ追加
  addAnnouncement(groupId, announcement) {
    const group = this.studyGroups.find((g) => g.id === groupId);
    if (group) {
      const newAnnouncement = {
        id: this.generateId(),
        content: announcement.content,
        author: announcement.author || "Anonymous",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      group.announcements.unshift(newAnnouncement);
      this.saveData();
      return newAnnouncement;
    }
    return null;
  }
  // === 共有リンク機能 ===
  // 共有リンクの生成
  generateShareLink(data) {
    const shareId = this.generateShareId();
    const shareData = {
      id: shareId,
      type: data.type,
      // 'note', 'progress', 'group'など
      data: data.content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: data.expiresIn ? new Date(Date.now() + data.expiresIn).toISOString() : null
    };
    this.sharedLinks.set(shareId, shareData);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/share/${shareId}`;
  }
  // 共有リンクからデータ取得
  getSharedData(shareId) {
    const shareData = this.sharedLinks.get(shareId);
    if (!shareData) {
      return null;
    }
    if (shareData.expiresAt && /* @__PURE__ */ new Date() > new Date(shareData.expiresAt)) {
      this.sharedLinks.delete(shareId);
      return null;
    }
    return shareData;
  }
  // === 統計情報 ===
  // 人気のノート取得
  getPopularNotes(limit = 5) {
    return [...this.notes].filter((n) => n.isPublic).sort((a, b) => b.likes + b.views - (a.likes + a.views)).slice(0, limit);
  }
  // 最新のディスカッション取得
  getRecentDiscussions(limit = 10) {
    return [...this.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }
  // アクティブなグループ取得
  getActiveGroups(limit = 5) {
    return [...this.studyGroups].filter((g) => g.isPublic).sort((a, b) => b.members.length - a.members.length).slice(0, limit);
  }
  // === ヘルパー関数 ===
  // ID生成
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // 共有ID生成
  generateShareId() {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
  // ユーザー名の検証
  validateUsername(username) {
    return username && username.trim().length >= 2 && username.trim().length <= 20;
  }
  // タグの正規化
  normalizeTags(tags) {
    return tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0).filter((tag, index, self) => self.indexOf(tag) === index);
  }
};
__name(_CollaborationService, "CollaborationService");
let CollaborationService = _CollaborationService;
const collaborationService = new CollaborationService();
const SharedNotes = /* @__PURE__ */ __name(({ processId = null, knowledgeArea = null }) => {
  const { settings } = useTheme();
  const [notes, setNotes] = reactExports.useState([]);
  const [showCreateForm, setShowCreateForm] = reactExports.useState(false);
  const [selectedNote, setSelectedNote] = reactExports.useState(null);
  const [filterTag, setFilterTag] = reactExports.useState("");
  const [currentUser, setCurrentUser] = reactExports.useState("");
  const [newNote, setNewNote] = reactExports.useState({
    title: "",
    content: "",
    tags: "",
    isPublic: true
  });
  reactExports.useEffect(() => {
    loadNotes();
    const savedUser = localStorage.getItem("username") || "Anonymous";
    setCurrentUser(savedUser);
  }, [processId, knowledgeArea, filterTag, loadNotes]);
  const loadNotes = useCallback((...args) => {
    const filters = {
      processId,
      knowledgeArea,
      tags: filterTag ? [filterTag] : []
    };
    const loadedNotes = collaborationService.getNotes(filters);
    setNotes(loadedNotes);
  }, []);
  const handleCreateNote = /* @__PURE__ */ __name(() => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("タイトルと内容を入力してください");
      return;
    }
    const tags = newNote.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    const createdNote = collaborationService.createNote({
      ...newNote,
      tags,
      processId,
      knowledgeArea,
      author: currentUser
    });
    setNotes([createdNote, ...notes]);
    setNewNote({ title: "", content: "", tags: "", isPublic: true });
    setShowCreateForm(false);
  }, "handleCreateNote");
  const handleLikeNote = /* @__PURE__ */ __name((noteId) => {
    collaborationService.likeNote(noteId);
    loadNotes();
  }, "handleLikeNote");
  const handleDeleteNote = /* @__PURE__ */ __name((noteId) => {
    if (confirm("このノートを削除しますか？")) {
      collaborationService.deleteNote(noteId);
      loadNotes();
      setSelectedNote(null);
    }
  }, "handleDeleteNote");
  const handleShareNote = /* @__PURE__ */ __name((note) => {
    const shareLink = collaborationService.generateShareLink({
      type: "note",
      content: note
    });
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("共有リンクをクリップボードにコピーしました！");
    });
  }, "handleShareNote");
  const getAllTags = /* @__PURE__ */ __name(() => {
    const allTags = /* @__PURE__ */ new Set();
    notes.forEach((note) => {
      note.tags.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags);
  }, "getAllTags");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 ${settings.darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-2xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }),
        "共有ノート"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setShowCreateForm(true), "onClick"),
          className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "新規ノート"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setFilterTag(""), "onClick"),
          className: `rounded-full px-3 py-1 text-sm transition-colors ${!filterTag ? "bg-blue-600 text-white" : settings.darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`,
          children: "すべて"
        }
      ),
      getAllTags().map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setFilterTag(tag), "onClick"),
          className: `rounded-full px-3 py-1 text-sm transition-colors ${filterTag === tag ? "bg-blue-600 text-white" : settings.darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "mr-1 inline h-3 w-3" }),
            tag
          ]
        },
        tag
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: notes.map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `cursor-pointer rounded-lg p-4 transition-all hover:shadow-lg ${settings.darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:shadow-md"}`,
        onClick: /* @__PURE__ */ __name(() => setSelectedNote(note), "onClick"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold", children: note.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: `mb-3 line-clamp-3 text-sm ${settings.darkMode ? "text-gray-300" : "text-gray-600"}`,
              children: note.content
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex flex-wrap gap-1", children: note.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `rounded-full px-2 py-1 text-xs ${settings.darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`,
              children: tag
            },
            tag
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex items-center justify-between text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                    note.author
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
                    note.views
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: /* @__PURE__ */ __name((e) => {
                        e.stopPropagation();
                        handleLikeNote(note.id);
                      }, "onClick"),
                      className: "flex items-center gap-1 transition-colors hover:text-red-500",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `h-3 w-3 ${note.likes > 0 ? "fill-current" : ""}` }),
                        note.likes
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3" })
                ] })
              ]
            }
          )
        ]
      },
      note.id
    )) }),
    showCreateForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `w-full max-w-2xl rounded-lg ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold", children: "新規ノート作成" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setShowCreateForm(false), "onClick"),
                className: `rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "input-1754995293939-254",
                  className: "mb-1 block text-sm font-medium",
                  children: "タイトル"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  "aria-label": "Input field",
                  id: "input-1754995293939-254",
                  type: "text",
                  value: newNote.title,
                  onChange: /* @__PURE__ */ __name((e) => setNewNote({ ...newNote, title: e.target.value }), "onChange"),
                  className: `w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`,
                  placeholder: "ノートのタイトル"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium", children: "内容" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "-input",
                  value: newNote.content,
                  onChange: /* @__PURE__ */ __name((e) => setNewNote({ ...newNote, content: e.target.value }), "onChange"),
                  className: `h-32 w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`,
                  placeholder: "ノートの内容"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "input-1754995293939-279",
                  className: "mb-1 block text-sm font-medium",
                  children: "タグ（カンマ区切り）"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  "aria-label": "Input field",
                  id: "input-1754995293939-279",
                  type: "text",
                  value: newNote.tags,
                  onChange: /* @__PURE__ */ __name((e) => setNewNote({ ...newNote, tags: e.target.value }), "onChange"),
                  className: `w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`,
                  placeholder: "例: ITTO, 統合管理, 重要"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "isPublic",
                  checked: newNote.isPublic,
                  onChange: /* @__PURE__ */ __name((e) => setNewNote({ ...newNote, isPublic: e.target.checked }), "onChange"),
                  className: "rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isPublic", className: "text-sm", children: "他のユーザーに公開する" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setShowCreateForm(false), "onClick"),
                className: `rounded-lg px-4 py-2 ${settings.darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`,
                children: "キャンセル"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleCreateNote,
                className: "rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",
                children: "作成"
              }
            )
          ] })
        ] })
      }
    ) }),
    selectedNote && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-2xl font-semibold", children: selectedNote.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex items-center gap-4 text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
                      selectedNote.author
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                      new Date(selectedNote.createdAt).toLocaleDateString()
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setSelectedNote(null), "onClick"),
                className: `rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex flex-wrap gap-2", children: selectedNote.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `rounded-full px-3 py-1 text-sm ${settings.darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`,
              children: tag
            },
            tag
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `mb-6 whitespace-pre-wrap ${settings.darkMode ? "text-gray-200" : "text-gray-700"}`,
              children: selectedNote.content
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => handleLikeNote(selectedNote.id), "onClick"),
                  className: "flex items-center gap-2 rounded-lg px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Heart,
                      {
                        className: `h-4 w-4 ${selectedNote.likes > 0 ? "fill-current text-red-500" : ""}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedNote.likes })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => handleShareNote(selectedNote), "onClick"),
                  className: "flex items-center gap-2 rounded-lg px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
                    "共有"
                  ]
                }
              )
            ] }),
            selectedNote.author === currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => handleDeleteNote(selectedNote.id), "onClick"),
                className: "flex items-center gap-2 rounded-lg px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                  "削除"
                ]
              }
            )
          ] })
        ] })
      }
    ) }),
    notes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "まだ共有ノートがありません" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setShowCreateForm(true), "onClick"),
          className: "mt-4 text-blue-600 hover:underline",
          children: "最初のノートを作成する"
        }
      )
    ] })
  ] });
}, "SharedNotes");
const DiscussionThread = /* @__PURE__ */ __name(({ targetId, targetType, title = "ディスカッション" }) => {
  const { settings } = useTheme();
  const [comments, setComments] = reactExports.useState([]);
  const [newComment, setNewComment] = reactExports.useState("");
  const [replyTo, setReplyTo] = reactExports.useState(null);
  const [newReply, setNewReply] = reactExports.useState("");
  const [expandedComments, setExpandedComments] = reactExports.useState(/* @__PURE__ */ new Set());
  const [currentUser, setCurrentUser] = reactExports.useState("");
  reactExports.useEffect(() => {
    loadComments();
    const savedUser = localStorage.getItem("username") || "Anonymous";
    setCurrentUser(savedUser);
  }, [targetId, targetType, loadComments]);
  const loadComments = useCallback((...args) => {
    const loadedComments = collaborationService.getComments(targetId, targetType);
    setComments(loadedComments);
  }, []);
  const handlePostComment = /* @__PURE__ */ __name(() => {
    if (!newComment.trim()) {
      return;
    }
    collaborationService.addComment({
      targetId,
      targetType,
      content: newComment,
      author: currentUser
    });
    setNewComment("");
    loadComments();
  }, "handlePostComment");
  const handlePostReply = /* @__PURE__ */ __name((commentId) => {
    if (!newReply.trim()) {
      return;
    }
    collaborationService.addReply(commentId, {
      content: newReply,
      author: currentUser
    });
    setNewReply("");
    setReplyTo(null);
    loadComments();
  }, "handlePostReply");
  const handleLikeComment = /* @__PURE__ */ __name((commentId) => {
    collaborationService.likeComment(commentId);
    loadComments();
  }, "handleLikeComment");
  const toggleCommentExpansion = /* @__PURE__ */ __name((commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  }, "toggleCommentExpansion");
  const formatDate = /* @__PURE__ */ __name((dateString) => {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
    if (days === 0) {
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1e3 * 60));
        return `${minutes}分前`;
      }
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString();
    }
  }, "formatDate");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-4 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5" }),
      title,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: `text-sm font-normal ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
          children: [
            "(",
            comments.length,
            "件)"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          "aria-label": "Input field",
          id: "input-1754995293935-117",
          type: "text",
          value: newComment,
          onChange: /* @__PURE__ */ __name((e) => setNewComment(e.target.value), "onChange"),
          onKeyPress: /* @__PURE__ */ __name((e) => e.key === "Enter" && handlePostComment(), "onKeyPress"),
          placeholder: "コメントを入力...",
          className: `flex-1 rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handlePostComment,
          disabled: !newComment.trim(),
          className: `flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${newComment.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : settings.darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
            "投稿"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: comments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `rounded-lg border p-4 ${settings.darkMode ? "border-gray-700" : "border-gray-200"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `flex h-8 w-8 items-center justify-center rounded-full ${settings.darkMode ? "bg-gray-700" : "bg-gray-200"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: comment.author }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                    children: formatDate(comment.createdAt)
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => handleLikeComment(comment.id), "onClick"),
                className: `flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${comment.likes > 0 ? "text-red-500" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `h-3 w-3 ${comment.likes > 0 ? "fill-current" : ""}` }),
                  comment.likes > 0 && comment.likes
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mb-3 ${settings.darkMode ? "text-gray-200" : "text-gray-700"}`, children: comment.content }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setReplyTo(replyTo === comment.id ? null : comment.id), "onClick"),
                className: `flex items-center gap-1 text-sm hover:text-blue-600 ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-3 w-3" }),
                  "返信"
                ]
              }
            ),
            comment.replies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => toggleCommentExpansion(comment.id), "onClick"),
                className: `flex items-center gap-1 text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                children: expandedComments.has(comment.id) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3" }),
                  "返信を隠す (",
                  comment.replies.length,
                  ")"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3" }),
                  "返信を表示 (",
                  comment.replies.length,
                  ")"
                ] })
              }
            )
          ] }),
          replyTo === comment.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-11 mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                "aria-label": "Input field",
                id: "input-1754995293936-228",
                type: "text",
                value: newReply,
                onChange: /* @__PURE__ */ __name((e) => setNewReply(e.target.value), "onChange"),
                onKeyPress: /* @__PURE__ */ __name((e) => e.key === "Enter" && handlePostReply(comment.id), "onKeyPress"),
                placeholder: "返信を入力...",
                className: `flex-1 rounded-lg border px-3 py-2 text-sm ${settings.darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => handlePostReply(comment.id), "onClick"),
                disabled: !newReply.trim(),
                className: `rounded-lg px-3 py-2 text-sm ${newReply.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : settings.darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`,
                children: "送信"
              }
            )
          ] }) }),
          expandedComments.has(comment.id) && comment.replies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-11 mt-3 space-y-3", children: comment.replies.map((reply) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-lg p-3 ${settings.darkMode ? "bg-gray-700" : "bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `flex h-6 w-6 items-center justify-center rounded-full ${settings.darkMode ? "bg-gray-600" : "bg-gray-300"}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: reply.author }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                      children: formatDate(reply.createdAt)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `ml-8 text-sm ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`,
                    children: reply.content
                  }
                )
              ]
            },
            reply.id
          )) })
        ]
      },
      comment.id
    )) }),
    comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mx-auto mb-3 h-12 w-12 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "まだコメントがありません" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-sm ${settings.darkMode ? "text-gray-500" : "text-gray-500"}`, children: "最初のコメントを投稿してディスカッションを始めましょう" })
    ] })
  ] });
}, "DiscussionThread");
const StudyGroups = /* @__PURE__ */ __name(() => {
  const { settings } = useTheme();
  const [groups, setGroups] = reactExports.useState([]);
  const [myGroups, setMyGroups] = reactExports.useState([]);
  const [publicGroups, setPublicGroups] = reactExports.useState([]);
  const [showCreateForm, setShowCreateForm] = reactExports.useState(false);
  const [selectedGroup, setSelectedGroup] = reactExports.useState(null);
  const [currentUser, setCurrentUser] = reactExports.useState("");
  const [userProgress, setUserProgress] = reactExports.useState(null);
  const [newGroup, setNewGroup] = reactExports.useState({
    name: "",
    description: "",
    targetDate: "",
    isPublic: true
  });
  const [newAnnouncement, setNewAnnouncement] = reactExports.useState("");
  reactExports.useEffect(() => {
    loadGroups();
    const savedUser = localStorage.getItem("username") || "Anonymous";
    setCurrentUser(savedUser);
    loadUserProgress();
  }, [loadGroups, loadUserProgress]);
  const loadGroups = useCallback((...args) => {
    const myGroupsList = collaborationService.getStudyGroups({ member: currentUser });
    setMyGroups(myGroupsList);
    const publicGroupsList = collaborationService.getStudyGroups({ isPublic: true });
    setPublicGroups(publicGroupsList.filter((g) => !g.members.includes(currentUser)));
    setGroups([...myGroupsList, ...publicGroupsList]);
  }, []);
  const loadUserProgress = useCallback((...args) => {
    const mockProgress = {
      completedProcesses: 25,
      totalProcesses: 49,
      knowledgeAreaProgress: {
        統合: 80,
        スコープ: 70,
        スケジュール: 60,
        コスト: 50,
        リスク: 40
      },
      lastStudied: (/* @__PURE__ */ new Date()).toISOString()
    };
    setUserProgress(mockProgress);
  }, []);
  const handleCreateGroup = /* @__PURE__ */ __name(() => {
    if (!newGroup.name.trim()) {
      alert("グループ名を入力してください");
      return;
    }
    const createdGroup = collaborationService.createStudyGroup({
      ...newGroup,
      creator: currentUser
    });
    setMyGroups([createdGroup, ...myGroups]);
    setNewGroup({ name: "", description: "", targetDate: "", isPublic: true });
    setShowCreateForm(false);
  }, "handleCreateGroup");
  const handleJoinGroup = /* @__PURE__ */ __name((groupId) => {
    collaborationService.joinGroup(groupId, currentUser);
    loadGroups();
  }, "handleJoinGroup");
  const handleLeaveGroup = /* @__PURE__ */ __name((groupId) => {
    if (confirm("このグループから退出しますか？")) {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        group.members = group.members.filter((m) => m !== currentUser);
        collaborationService.saveData();
        loadGroups();
        setSelectedGroup(null);
      }
    }
  }, "handleLeaveGroup");
  const handleShareProgress = /* @__PURE__ */ __name((groupId) => {
    if (!userProgress) {
      return;
    }
    collaborationService.shareProgress(groupId, currentUser, userProgress);
    alert("進捗を共有しました！");
    if (selectedGroup && selectedGroup.id === groupId) {
      const updatedGroup = collaborationService.getStudyGroups().find((g) => g.id === groupId);
      setSelectedGroup(updatedGroup);
    }
  }, "handleShareProgress");
  const handlePostAnnouncement = /* @__PURE__ */ __name(() => {
    if (!newAnnouncement.trim() || !selectedGroup) {
      return;
    }
    collaborationService.addAnnouncement(selectedGroup.id, {
      content: newAnnouncement,
      author: currentUser
    });
    setNewAnnouncement("");
    const updatedGroup = collaborationService.getStudyGroups().find((g) => g.id === selectedGroup.id);
    setSelectedGroup(updatedGroup);
  }, "handlePostAnnouncement");
  const handleShareGroup = /* @__PURE__ */ __name((group) => {
    const shareLink = collaborationService.generateShareLink({
      type: "group",
      content: {
        id: group.id,
        name: group.name,
        description: group.description
      }
    });
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("グループの共有リンクをクリップボードにコピーしました！");
    });
  }, "handleShareGroup");
  const calculateProgressPercentage = /* @__PURE__ */ __name((progress) => {
    if (!progress || !progress.totalProcesses) {
      return 0;
    }
    return Math.round(progress.completedProcesses / progress.totalProcesses * 100);
  }, "calculateProgressPercentage");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 ${settings.darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-2xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }),
        "学習グループ"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setShowCreateForm(true), "onClick"),
          className: "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "新規グループ作成"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
        myGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-lg font-semibold", children: "参加中のグループ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: myGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `cursor-pointer rounded-lg p-4 transition-all hover:shadow-lg ${settings.darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:shadow-md"} ${(selectedGroup == null ? void 0 : selectedGroup.id) === group.id ? "ring-2 ring-blue-500" : ""}`,
              onClick: /* @__PURE__ */ __name(() => setSelectedGroup(group), "onClick"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-start justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: group.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `rounded px-2 py-1 text-xs ${group.isPublic ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`,
                      children: [
                        group.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "inline h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "inline h-3 w-3" }),
                        group.isPublic ? " 公開" : " 非公開"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `mb-3 text-sm ${settings.darkMode ? "text-gray-300" : "text-gray-600"}`,
                    children: group.description || "グループの説明なし"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `flex items-center justify-between text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                        group.members.length,
                        "名"
                      ] }),
                      group.targetDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3 w-3" }),
                        new Date(group.targetDate).toLocaleDateString()
                      ] })
                    ]
                  }
                ),
                Object.keys(group.sharedProgress || {}).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 border-t pt-3 dark:border-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex -space-x-2", children: [
                  Object.entries(group.sharedProgress).slice(0, 5).map(([username, progress]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${settings.darkMode ? "bg-gray-700" : "bg-gray-200"}`,
                      title: `${username}: ${calculateProgressPercentage(progress)}%`,
                      children: username.charAt(0).toUpperCase()
                    },
                    username
                  )),
                  Object.keys(group.sharedProgress).length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `flex h-8 w-8 items-center justify-center rounded-full text-xs ${settings.darkMode ? "bg-gray-700" : "bg-gray-200"}`,
                      children: [
                        "+",
                        Object.keys(group.sharedProgress).length - 5
                      ]
                    }
                  )
                ] }) })
              ]
            },
            group.id
          )) })
        ] }),
        publicGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-lg font-semibold", children: "参加可能なグループ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: publicGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-lg p-4 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-semibold", children: group.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `mb-3 text-sm ${settings.darkMode ? "text-gray-300" : "text-gray-600"}`,
                    children: group.description || "グループの説明なし"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `flex items-center gap-1 text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                        group.members.length,
                        "名"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: /* @__PURE__ */ __name(() => handleJoinGroup(group.id), "onClick"),
                      className: "rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700",
                      children: "参加する"
                    }
                  )
                ] })
              ]
            },
            group.id
          )) })
        ] }),
        myGroups.length === 0 && publicGroups.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-4 h-12 w-12 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "まだ学習グループがありません" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setShowCreateForm(true), "onClick"),
              className: "mt-4 text-blue-600 hover:underline",
              children: "最初のグループを作成する"
            }
          )
        ] })
      ] }),
      selectedGroup && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `rounded-lg p-4 lg:col-span-1 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: selectedGroup.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => handleShareGroup(selectedGroup), "onClick"),
                    className: "rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700",
                    title: "共有",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" })
                  }
                ),
                selectedGroup.members.includes(currentUser) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => handleLeaveGroup(selectedGroup.id), "onClick"),
                    className: "rounded p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20",
                    title: "退出",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 font-medium", children: [
                "メンバー (",
                selectedGroup.members.length,
                "名)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedGroup.members.map((member) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `flex items-center justify-between rounded p-2 ${settings.darkMode ? "bg-gray-700" : "bg-gray-100"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `flex h-8 w-8 items-center justify-center rounded-full ${settings.darkMode ? "bg-gray-600" : "bg-gray-300"}`,
                            children: member.charAt(0).toUpperCase()
                          }
                        ),
                        member,
                        member === selectedGroup.creator && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-blue-600", children: "管理者" })
                      ] }),
                      ((_a = selectedGroup.sharedProgress) == null ? void 0 : _a[member]) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                        calculateProgressPercentage(selectedGroup.sharedProgress[member]),
                        "%"
                      ] })
                    ]
                  },
                  member
                );
              }) })
            ] }),
            selectedGroup.members.includes(currentUser) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => handleShareProgress(selectedGroup.id), "onClick"),
                className: "mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                  "自分の進捗を共有"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 flex items-center gap-2 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
                "お知らせ"
              ] }),
              selectedGroup.members.includes(currentUser) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    "aria-label": "Input field",
                    id: "input-1754995293941-421",
                    type: "text",
                    value: newAnnouncement,
                    onChange: /* @__PURE__ */ __name((e) => setNewAnnouncement(e.target.value), "onChange"),
                    onKeyPress: /* @__PURE__ */ __name((e) => e.key === "Enter" && handlePostAnnouncement(), "onKeyPress"),
                    placeholder: "お知らせを入力...",
                    className: `flex-1 rounded-lg border px-3 py-2 text-sm ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handlePostAnnouncement,
                    disabled: !newAnnouncement.trim(),
                    className: `rounded-lg px-3 py-2 text-sm ${newAnnouncement.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : settings.darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`,
                    children: "投稿"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-60 space-y-2 overflow-y-auto", children: selectedGroup.announcements.length > 0 ? selectedGroup.announcements.map((announcement) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `rounded-lg p-3 text-sm ${settings.darkMode ? "bg-gray-700" : "bg-gray-100"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: announcement.author }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                          children: new Date(announcement.createdAt).toLocaleDateString()
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: announcement.content })
                  ]
                },
                announcement.id
              )) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `py-4 text-center text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                  children: "まだお知らせはありません"
                }
              ) })
            ] })
          ]
        }
      )
    ] }),
    showCreateForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `w-full max-w-md rounded-lg ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-xl font-semibold", children: "新規グループ作成" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "input-1754995293941-501",
                  className: "mb-1 block text-sm font-medium",
                  children: "グループ名"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  "aria-label": "Input field",
                  id: "input-1754995293941-501",
                  type: "text",
                  value: newGroup.name,
                  onChange: /* @__PURE__ */ __name((e) => setNewGroup({ ...newGroup, name: e.target.value }), "onChange"),
                  className: `w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`,
                  placeholder: "PMP試験対策グループ"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium", children: "説明" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "-input",
                  value: newGroup.description,
                  onChange: /* @__PURE__ */ __name((e) => setNewGroup({ ...newGroup, description: e.target.value }), "onChange"),
                  className: `h-24 w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`,
                  placeholder: "グループの目的や学習計画など"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "-input", className: "mb-1 block text-sm font-medium", children: "目標試験日" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "-input",
                  type: "date",
                  value: newGroup.targetDate,
                  onChange: /* @__PURE__ */ __name((e) => setNewGroup({ ...newGroup, targetDate: e.target.value }), "onChange"),
                  className: `w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "isPublic",
                  checked: newGroup.isPublic,
                  onChange: /* @__PURE__ */ __name((e) => setNewGroup({ ...newGroup, isPublic: e.target.checked }), "onChange"),
                  className: "rounded"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isPublic", className: "text-sm", children: "他のユーザーが参加できるようにする" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: /* @__PURE__ */ __name(() => setShowCreateForm(false), "onClick"),
                className: `rounded-lg px-4 py-2 ${settings.darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`,
                children: "キャンセル"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleCreateGroup,
                className: "rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",
                children: "作成"
              }
            )
          ] })
        ] })
      }
    ) })
  ] });
}, "StudyGroups");
const CollaborationHub = /* @__PURE__ */ __name(() => {
  const [_showHistory, _setShowHistory] = reactExports.useState(false);
  const { settings } = useTheme();
  const [activeTab, setActiveTab] = reactExports.useState("notes");
  const [username, setUsername] = reactExports.useState(() => localStorage.getItem("username") || "");
  const [showUsernamePrompt, setShowUsernamePrompt] = reactExports.useState(!username);
  const handleSetUsername = /* @__PURE__ */ __name(() => {
    if (username.trim()) {
      localStorage.setItem("username", username.trim());
      setShowUsernamePrompt(false);
    }
  }, "handleSetUsername");
  const popularNotes = collaborationService.getPopularNotes(3);
  const recentDiscussions = collaborationService.getRecentDiscussions(5);
  const activeGroups = collaborationService.getActiveGroups(3);
  const tabs = [
    { id: "notes", label: "学習ノート", icon: FileText },
    { id: "discussions", label: "ディスカッション", icon: MessageSquare },
    { id: "groups", label: "学習グループ", icon: Users },
    { id: "dashboard", label: "ダッシュボード", icon: TrendingUp }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-h-screen ${settings.darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`, children: [
    showUsernamePrompt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `w-full max-w-md rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-xl font-semibold", children: "ユーザー名を設定" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mb-4 ${settings.darkMode ? "text-gray-300" : "text-gray-600"}`, children: "コラボレーション機能を使用するには、ユーザー名を設定してください。" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username-input", className: "sr-only", children: "ユーザー名" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "username-input",
              type: "text",
              value: username,
              onChange: /* @__PURE__ */ __name((e) => setUsername(e.target.value), "onChange"),
              onKeyPress: /* @__PURE__ */ __name((e) => e.key === "Enter" && handleSetUsername(), "onKeyPress"),
              placeholder: "ユーザー名を入力",
              "aria-label": "ユーザー名を入力してください",
              className: `w-full rounded-lg border px-3 py-2 ${settings.darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleSetUsername,
              disabled: !username.trim(),
              className: `mt-4 w-full rounded-lg px-4 py-2 font-medium ${username.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : settings.darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`,
              children: "設定する"
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold", children: "コラボレーションハブ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${settings.darkMode ? "text-gray-300" : "text-gray-600"}`, children: "他の学習者と知識を共有し、一緒に学習を進めましょう" }),
        username && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-2 text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`, children: [
          "ログイン中: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: username }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setShowUsernamePrompt(true), "onClick"),
              className: "ml-2 text-blue-600 hover:underline",
              children: "変更"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-wrap gap-2 border-b dark:border-gray-700", children: tabs.map((tab) => {
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => setActiveTab(tab.id), "onClick"),
            className: `flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : settings.darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
              tab.label
            ]
          },
          tab.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        activeTab === "notes" && /* @__PURE__ */ jsxRuntimeExports.jsx(SharedNotes, {}),
        activeTab === "discussions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold", children: "全体ディスカッション" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DiscussionThread,
            {
              targetId: "global",
              targetType: "global",
              title: "PMP学習に関する質問・議論"
            }
          )
        ] }),
        activeTab === "groups" && /* @__PURE__ */ jsxRuntimeExports.jsx(StudyGroups, {}),
        activeTab === "dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-yellow-500" }),
              "人気のノート"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: popularNotes.length > 0 ? popularNotes.map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `rounded border p-3 ${settings.darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} cursor-pointer transition-colors`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-1 font-medium", children: note.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "p",
                    {
                      className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                      children: [
                        note.author,
                        " • いいね ",
                        note.likes
                      ]
                    }
                  )
                ]
              },
              note.id
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                children: "まだノートがありません"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-blue-500" }),
              "最新のディスカッション"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: recentDiscussions.length > 0 ? recentDiscussions.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `rounded border p-3 ${settings.darkMode ? "border-gray-700" : "border-gray-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `mb-1 text-sm ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`,
                      children: comment.content.length > 50 ? comment.content.substring(0, 50) + "..." : comment.content
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                      children: comment.author
                    }
                  )
                ]
              },
              comment.id
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                children: "まだディスカッションがありません"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 flex items-center gap-2 text-lg font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-green-500" }),
              "アクティブなグループ"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: activeGroups.length > 0 ? activeGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `rounded border p-3 ${settings.darkMode ? "border-gray-700" : "border-gray-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-1 font-medium", children: group.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "p",
                    {
                      className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                      children: [
                        "メンバー ",
                        group.members.length,
                        "名"
                      ]
                    }
                  )
                ]
              },
              group.id
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`,
                children: "まだグループがありません"
              }
            ) })
          ] })
        ] })
      ] }),
      activeTab === "dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-8 rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "クイックアクション" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setActiveTab("notes"), "onClick"),
              className: `rounded-lg border p-4 text-left transition-colors ${settings.darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mb-2 h-6 w-6 text-blue-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-1 font-medium", children: "ノートを作成" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "学習内容をまとめて共有" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setActiveTab("discussions"), "onClick"),
              className: `rounded-lg border p-4 text-left transition-colors ${settings.darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mb-2 h-6 w-6 text-green-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-1 font-medium", children: "質問する" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "わからないことを質問" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => setActiveTab("groups"), "onClick"),
              className: `rounded-lg border p-4 text-left transition-colors ${settings.darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mb-2 h-6 w-6 text-purple-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-1 font-medium", children: "グループに参加" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "仲間と一緒に学習" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}, "CollaborationHub");
export {
  CollaborationHub as default
};
