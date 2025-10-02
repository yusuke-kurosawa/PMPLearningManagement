var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-Uy5hwzow.js";
import { a as useTheme } from "./index-CZZZnLRW.js";
import { av as CheckCircle, aw as AlertCircle, D as Download, i as Upload, z as Database, aJ as FileJson, L as Loader2, T as TrendingUp, e as Settings, s as Users, aK as FileSpreadsheet, F as FileText, S as Search, aL as Info, aE as Trash2, R as RefreshCw } from "./lucide-icons-B7slfWYt.js";
import "./vendor-iUsVqwEv.js";
const _ExportService = class _ExportService {
  constructor() {
    this.version = "1.0.0";
  }
  // 全データを収集
  collectAllData() {
    const data = {
      version: this.version,
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      metadata: {
        appVersion: "1.0.0",
        browser: navigator.userAgent,
        language: navigator.language
      },
      data: {}
    };
    try {
      const progressData = localStorage.getItem("learningProgress");
      if (progressData) {
        data.data.progress = JSON.parse(progressData);
      }
    } catch (error) {
    }
    try {
      const themeSettings = localStorage.getItem("themeSettings");
      if (themeSettings) {
        data.data.settings = JSON.parse(themeSettings);
      }
    } catch (error) {
    }
    try {
      const sharedNotes = localStorage.getItem("sharedNotes");
      const comments = localStorage.getItem("comments");
      const studyGroups = localStorage.getItem("studyGroups");
      data.data.collaboration = {
        notes: sharedNotes ? JSON.parse(sharedNotes) : [],
        comments: comments ? JSON.parse(comments) : [],
        groups: studyGroups ? JSON.parse(studyGroups) : []
      };
    } catch (error) {
    }
    try {
      const searchHistory = localStorage.getItem("searchHistory");
      if (searchHistory) {
        data.data.searchHistory = JSON.parse(searchHistory);
      }
    } catch (error) {
    }
    const username = localStorage.getItem("username");
    if (username) {
      data.data.user = { username };
    }
    return data;
  }
  // JSON形式でエクスポート
  exportAsJSON(data = null) {
    const exportData = data || this.collectAllData();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = `pmp-learning-backup-${this.getDateString()}.json`;
    this.downloadFile(blob, filename);
    return { success: true, filename };
  }
  // CSV形式で進捗データをエクスポート
  exportProgressAsCSV() {
    const progressData = this.getProgressData();
    if (!progressData) {
      return { success: false, error: "進捗データが見つかりません" };
    }
    const headers = [
      "プロセスID",
      "プロセス名",
      "知識エリア",
      "プロセス群",
      "完了状態",
      "理解度",
      "最終学習日",
      "学習回数"
    ];
    const rows = [headers];
    Object.entries(progressData.processes || {}).forEach(([processId, data]) => {
      rows.push([
        processId,
        data.name || "",
        data.knowledgeArea || "",
        data.processGroup || "",
        data.completed ? "完了" : "未完了",
        data.understanding || 0,
        data.lastStudied || "",
        data.studyCount || 0
      ]);
    });
    const BOM = "\uFEFF";
    const csvContent = BOM + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const filename = `pmp-progress-${this.getDateString()}.csv`;
    this.downloadFile(blob, filename);
    return { success: true, filename };
  }
  // 学習レポートのエクスポート（簡易テキスト形式）
  exportLearningReport() {
    var _a;
    const data = this.collectAllData();
    const progress = data.data.progress || {};
    let report = "=== PMP学習レポート ===\n\n";
    report += `生成日時: ${(/* @__PURE__ */ new Date()).toLocaleString("ja-JP")}
`;
    report += `ユーザー: ${((_a = data.data.user) == null ? void 0 : _a.username) || "未設定"}

`;
    const totalProcesses = 49;
    const completedCount = Object.values(progress.processes || {}).filter((p) => p.completed).length;
    const completionRate = Math.round(completedCount / totalProcesses * 100);
    report += "【全体進捗】\n";
    report += `完了プロセス: ${completedCount}/${totalProcesses} (${completionRate}%)

`;
    report += "【知識エリア別進捗】\n";
    const knowledgeAreas = this.getKnowledgeAreaStats(progress);
    Object.entries(knowledgeAreas).forEach(([area, stats]) => {
      report += `${area}: ${stats.completed}/${stats.total} (${stats.percentage}%)
`;
    });
    report += "\n";
    report += "【プロセス群別進捗】\n";
    const processGroups = this.getProcessGroupStats(progress);
    Object.entries(processGroups).forEach(([group, stats]) => {
      report += `${group}: ${stats.completed}/${stats.total} (${stats.percentage}%)
`;
    });
    report += "\n";
    report += "【最近の学習活動】\n";
    const recentActivities = this.getRecentActivities(progress);
    recentActivities.forEach((activity) => {
      report += `- ${activity.date}: ${activity.process} (${activity.action})
`;
    });
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const filename = `pmp-learning-report-${this.getDateString()}.txt`;
    this.downloadFile(blob, filename);
    return { success: true, filename };
  }
  // 選択的エクスポート
  exportSelected(options = {}) {
    const data = {
      version: this.version,
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      data: {}
    };
    if (options.progress) {
      const progressData = localStorage.getItem("learningProgress");
      if (progressData) {
        data.data.progress = JSON.parse(progressData);
      }
    }
    if (options.settings) {
      const themeSettings = localStorage.getItem("themeSettings");
      if (themeSettings) {
        data.data.settings = JSON.parse(themeSettings);
      }
    }
    if (options.collaboration) {
      const sharedNotes = localStorage.getItem("sharedNotes");
      const comments = localStorage.getItem("comments");
      const studyGroups = localStorage.getItem("studyGroups");
      data.data.collaboration = {
        notes: sharedNotes ? JSON.parse(sharedNotes) : [],
        comments: comments ? JSON.parse(comments) : [],
        groups: studyGroups ? JSON.parse(studyGroups) : []
      };
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = `pmp-partial-backup-${this.getDateString()}.json`;
    this.downloadFile(blob, filename);
    return { success: true, filename };
  }
  // ヘルパーメソッド
  getProgressData() {
    try {
      const data = localStorage.getItem("learningProgress");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
  getKnowledgeAreaStats(progress) {
    const areas = {
      統合管理: { total: 7, completed: 0 },
      スコープ管理: { total: 6, completed: 0 },
      スケジュール管理: { total: 6, completed: 0 },
      コスト管理: { total: 4, completed: 0 },
      品質管理: { total: 3, completed: 0 },
      資源管理: { total: 6, completed: 0 },
      コミュニケーション管理: { total: 3, completed: 0 },
      リスク管理: { total: 7, completed: 0 },
      調達管理: { total: 3, completed: 0 },
      ステークホルダー管理: { total: 4, completed: 0 }
    };
    Object.values(progress.processes || {}).forEach((process2) => {
      if (process2.knowledgeArea && areas[process2.knowledgeArea]) {
        if (process2.completed) {
          areas[process2.knowledgeArea].completed++;
        }
      }
    });
    Object.keys(areas).forEach((area) => {
      areas[area].percentage = Math.round(areas[area].completed / areas[area].total * 100);
    });
    return areas;
  }
  getProcessGroupStats(progress) {
    const groups = {
      立上げ: { total: 2, completed: 0 },
      計画: { total: 24, completed: 0 },
      実行: { total: 10, completed: 0 },
      "監視・コントロール": { total: 12, completed: 0 },
      終結: { total: 1, completed: 0 }
    };
    Object.values(progress.processes || {}).forEach((process2) => {
      if (process2.processGroup && groups[process2.processGroup]) {
        if (process2.completed) {
          groups[process2.processGroup].completed++;
        }
      }
    });
    Object.keys(groups).forEach((group) => {
      groups[group].percentage = Math.round(groups[group].completed / groups[group].total * 100);
    });
    return groups;
  }
  getRecentActivities(progress, limit = 10) {
    const activities = [];
    Object.entries(progress.processes || {}).forEach(([processId, data]) => {
      if (data.lastStudied) {
        activities.push({
          date: new Date(data.lastStudied).toLocaleDateString("ja-JP"),
          process: data.name || processId,
          action: data.completed ? "完了" : "学習中"
        });
      }
    });
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return activities.slice(0, limit);
  }
  getDateString() {
    const now = /* @__PURE__ */ new Date();
    return now.toISOString().replace(/[:.]/g, "-").substring(0, 19);
  }
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
__name(_ExportService, "ExportService");
let ExportService = _ExportService;
const exportService = new ExportService();
const _ImportService = class _ImportService {
  constructor() {
    this.supportedVersions = ["1.0.0"];
  }
  // ファイルを読み込んでパース
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (file.type === "application/json") {
            const data = JSON.parse(content);
            resolve({ success: true, data, type: "json" });
          } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            const data = this.parseCSV(content);
            resolve({ success: true, data, type: "csv" });
          } else {
            reject(new Error("サポートされていないファイル形式です"));
          }
        } catch (error) {
          reject(new Error(`ファイルの解析エラー: ${error.message}`));
        }
      };
      reader.onerror = () => {
        reject(new Error("ファイルの読み込みに失敗しました"));
      };
      reader.readAsText(file);
    });
  }
  // データの検証
  validateData(data) {
    const errors = [];
    const warnings = [];
    if (!data || typeof data !== "object") {
      errors.push("無効なデータ形式です");
      return { valid: false, errors, warnings };
    }
    if (data.version) {
      if (!this.supportedVersions.includes(data.version)) {
        warnings.push(`異なるバージョンのデータです (${data.version})`);
      }
    } else {
      warnings.push("バージョン情報が含まれていません");
    }
    if (data.data) {
      if (data.data.progress) {
        const progressValidation = this.validateProgressData(data.data.progress);
        errors.push(...progressValidation.errors);
        warnings.push(...progressValidation.warnings);
      }
      if (data.data.settings) {
        const settingsValidation = this.validateSettings(data.data.settings);
        errors.push(...settingsValidation.errors);
        warnings.push(...settingsValidation.warnings);
      }
      if (data.data.collaboration) {
        const collabValidation = this.validateCollaborationData(data.data.collaboration);
        errors.push(...collabValidation.errors);
        warnings.push(...collabValidation.warnings);
      }
    } else {
      errors.push("データが含まれていません");
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  // 進捗データの検証
  validateProgressData(progress) {
    const errors = [];
    const warnings = [];
    if (progress.processes && typeof progress.processes === "object") {
      Object.entries(progress.processes).forEach(([processId, data]) => {
        if (!data.name) {
          warnings.push(`プロセス ${processId} に名前がありません`);
        }
        if (typeof data.completed !== "boolean") {
          errors.push(`プロセス ${processId} の完了状態が無効です`);
        }
      });
    }
    return { errors, warnings };
  }
  // 設定データの検証
  validateSettings(settings) {
    const errors = [];
    const warnings = [];
    const validSettings = [
      "darkMode",
      "primaryColor",
      "fontSize",
      "compactMode",
      "animations",
      "highContrast"
    ];
    Object.keys(settings).forEach((key) => {
      if (!validSettings.includes(key)) {
        warnings.push(`不明な設定項目: ${key}`);
      }
    });
    return { errors, warnings };
  }
  // コラボレーションデータの検証
  validateCollaborationData(collaboration) {
    const errors = [];
    const warnings = [];
    if (collaboration.notes && !Array.isArray(collaboration.notes)) {
      errors.push("ノートデータが配列形式ではありません");
    }
    if (collaboration.comments && !Array.isArray(collaboration.comments)) {
      errors.push("コメントデータが配列形式ではありません");
    }
    if (collaboration.groups && !Array.isArray(collaboration.groups)) {
      errors.push("グループデータが配列形式ではありません");
    }
    return { errors, warnings };
  }
  // データのインポート（全データ）
  async importData(data, options = {}) {
    var _a, _b, _c, _d, _e, _f;
    const { merge = false, preview = false } = options;
    if (preview) {
      return this.generatePreview(data);
    }
    const results = {
      success: true,
      imported: [],
      errors: [],
      warnings: []
    };
    try {
      if ((_a = data.data) == null ? void 0 : _a.progress) {
        const result = await this.importProgress(data.data.progress, merge);
        if (result.success) {
          results.imported.push("進捗データ");
        } else {
          results.errors.push(...result.errors);
        }
      }
      if ((_b = data.data) == null ? void 0 : _b.settings) {
        const result = await this.importSettings(data.data.settings);
        if (result.success) {
          results.imported.push("カスタマイズ設定");
        } else {
          results.errors.push(...result.errors);
        }
      }
      if ((_c = data.data) == null ? void 0 : _c.collaboration) {
        const result = await this.importCollaboration(data.data.collaboration, merge);
        if (result.success) {
          results.imported.push("コラボレーションデータ");
        } else {
          results.errors.push(...result.errors);
        }
      }
      if ((_d = data.data) == null ? void 0 : _d.searchHistory) {
        localStorage.setItem("searchHistory", JSON.stringify(data.data.searchHistory));
        results.imported.push("検索履歴");
      }
      if ((_f = (_e = data.data) == null ? void 0 : _e.user) == null ? void 0 : _f.username) {
        localStorage.setItem("username", data.data.user.username);
        results.imported.push("ユーザー情報");
      }
      results.success = results.errors.length === 0;
    } catch (error) {
      results.success = false;
      results.errors.push(`インポート中にエラーが発生しました: ${error.message}`);
    }
    return results;
  }
  // 進捗データのインポート
  async importProgress(progressData, merge = false) {
    try {
      if (merge) {
        const existingData = localStorage.getItem("learningProgress");
        const existing = existingData ? JSON.parse(existingData) : { processes: {} };
        Object.entries(progressData.processes || {}).forEach(([processId, newData]) => {
          if (!existing.processes[processId] || !existing.processes[processId].completed) {
            existing.processes[processId] = newData;
          }
        });
        localStorage.setItem("learningProgress", JSON.stringify(existing));
      } else {
        localStorage.setItem("learningProgress", JSON.stringify(progressData));
      }
      return { success: true };
    } catch (error) {
      return { success: false, errors: [`進捗データのインポートエラー: ${error.message}`] };
    }
  }
  // 設定のインポート
  async importSettings(settings) {
    try {
      localStorage.setItem("themeSettings", JSON.stringify(settings));
      window.dispatchEvent(new Event("themeSettingsUpdated"));
      return { success: true };
    } catch (error) {
      return { success: false, errors: [`設定のインポートエラー: ${error.message}`] };
    }
  }
  // コラボレーションデータのインポート
  async importCollaboration(collaborationData, merge = false) {
    try {
      if (merge) {
        const existingNotes = localStorage.getItem("sharedNotes");
        const existingComments = localStorage.getItem("comments");
        const existingGroups = localStorage.getItem("studyGroups");
        const notes = existingNotes ? JSON.parse(existingNotes) : [];
        const comments = existingComments ? JSON.parse(existingComments) : [];
        const groups = existingGroups ? JSON.parse(existingGroups) : [];
        const noteIds = new Set(notes.map((n) => n.id));
        const newNotes = (collaborationData.notes || []).filter((n) => !noteIds.has(n.id));
        const commentIds = new Set(comments.map((c) => c.id));
        const newComments = (collaborationData.comments || []).filter((c) => !commentIds.has(c.id));
        const groupIds = new Set(groups.map((g) => g.id));
        const newGroups = (collaborationData.groups || []).filter((g) => !groupIds.has(g.id));
        localStorage.setItem("sharedNotes", JSON.stringify([...notes, ...newNotes]));
        localStorage.setItem("comments", JSON.stringify([...comments, ...newComments]));
        localStorage.setItem("studyGroups", JSON.stringify([...groups, ...newGroups]));
      } else {
        localStorage.setItem("sharedNotes", JSON.stringify(collaborationData.notes || []));
        localStorage.setItem("comments", JSON.stringify(collaborationData.comments || []));
        localStorage.setItem("studyGroups", JSON.stringify(collaborationData.groups || []));
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [`コラボレーションデータのインポートエラー: ${error.message}`]
      };
    }
  }
  // プレビューの生成
  generatePreview(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const preview = {
      metadata: {
        version: data.version,
        exportDate: data.exportDate,
        hasProgress: !!((_a = data.data) == null ? void 0 : _a.progress),
        hasSettings: !!((_b = data.data) == null ? void 0 : _b.settings),
        hasCollaboration: !!((_c = data.data) == null ? void 0 : _c.collaboration),
        hasSearchHistory: !!((_d = data.data) == null ? void 0 : _d.searchHistory),
        hasUser: !!((_e = data.data) == null ? void 0 : _e.user)
      },
      summary: {}
    };
    if ((_g = (_f = data.data) == null ? void 0 : _f.progress) == null ? void 0 : _g.processes) {
      const processes = Object.values(data.data.progress.processes);
      preview.summary.progress = {
        totalProcesses: processes.length,
        completedProcesses: processes.filter((p) => p.completed).length,
        completionRate: Math.round(
          processes.filter((p) => p.completed).length / processes.length * 100
        )
      };
    }
    if ((_h = data.data) == null ? void 0 : _h.collaboration) {
      preview.summary.collaboration = {
        notesCount: ((_i = data.data.collaboration.notes) == null ? void 0 : _i.length) || 0,
        commentsCount: ((_j = data.data.collaboration.comments) == null ? void 0 : _j.length) || 0,
        groupsCount: ((_k = data.data.collaboration.groups) == null ? void 0 : _k.length) || 0
      };
    }
    if ((_l = data.data) == null ? void 0 : _l.user) {
      preview.summary.user = data.data.user;
    }
    return preview;
  }
  // CSVデータのパース
  parseCSV(content) {
    const lines = content.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    return { headers, data };
  }
  // CSVからの進捗データインポート
  async importProgressFromCSV(csvData) {
    try {
      const progress = {
        processes: {}
      };
      csvData.data.forEach((row) => {
        const processId = row["プロセスID"];
        if (processId) {
          progress.processes[processId] = {
            name: row["プロセス名"] || "",
            knowledgeArea: row["知識エリア"] || "",
            processGroup: row["プロセス群"] || "",
            completed: row["完了状態"] === "完了",
            understanding: parseInt(row["理解度"]) || 0,
            lastStudied: row["最終学習日"] || null,
            studyCount: parseInt(row["学習回数"]) || 0
          };
        }
      });
      return await this.importProgress(progress, true);
    } catch (error) {
      return {
        success: false,
        errors: [`CSVデータのインポートエラー: ${error.message}`]
      };
    }
  }
};
__name(_ImportService, "ImportService");
let ImportService = _ImportService;
const importService = new ImportService();
const DataManagement = /* @__PURE__ */ __name(() => {
  var _a, _b, _c, _d, _e;
  const { settings } = useTheme();
  const fileInputRef = reactExports.useRef(null);
  const [activeTab, setActiveTab] = reactExports.useState("export");
  const [exportOptions, setExportOptions] = reactExports.useState({
    progress: true,
    settings: true,
    collaboration: true
  });
  const [importFile, setImportFile] = reactExports.useState(null);
  const [importPreview, setImportPreview] = reactExports.useState(null);
  const [importOptions, setImportOptions] = reactExports.useState({
    merge: false
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState(null);
  const [validationResult, setValidationResult] = reactExports.useState(null);
  const handleExport = /* @__PURE__ */ __name(async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      let result;
      switch (type) {
        case "json-all":
          result = exportService.exportAsJSON();
          break;
        case "json-selected":
          result = exportService.exportSelected(exportOptions);
          break;
        case "csv":
          result = exportService.exportProgressAsCSV();
          break;
        case "report":
          result = exportService.exportLearningReport();
          break;
        default:
          throw new Error("不明なエクスポートタイプ");
      }
      if (result.success) {
        setMessage({
          type: "success",
          text: `エクスポートが完了しました: ${result.filename}`
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "エクスポートに失敗しました"
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `エラー: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  }, "handleExport");
  const handleFileSelect = /* @__PURE__ */ __name(async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    setImportFile(file);
    setMessage(null);
    setValidationResult(null);
    setImportPreview(null);
    setLoading(true);
    try {
      const result = await importService.readFile(file);
      if (result.success) {
        if (result.type === "json") {
          const validation = importService.validateData(result.data);
          setValidationResult(validation);
          if (validation.valid || validation.warnings.length > 0) {
            const preview = importService.generatePreview(result.data);
            setImportPreview({ ...preview, data: result.data });
          }
        } else if (result.type === "csv") {
          setImportPreview({
            type: "csv",
            data: result.data,
            summary: {
              rowCount: result.data.data.length
            }
          });
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  }, "handleFileSelect");
  const handleImport = /* @__PURE__ */ __name(async () => {
    if (!importPreview) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      let result;
      if (importPreview.type === "csv") {
        result = await importService.importProgressFromCSV(importPreview.data);
      } else {
        result = await importService.importData(importPreview.data, importOptions);
      }
      if (result.success) {
        setMessage({
          type: "success",
          text: `インポートが完了しました: ${result.imported.join(", ")}`
        });
        setImportFile(null);
        setImportPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => {
          window.location.reload();
        }, 2e3);
      } else {
        setMessage({
          type: "error",
          text: `インポートエラー: ${result.errors.join(", ")}`
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `エラー: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  }, "handleImport");
  const handleResetData = /* @__PURE__ */ __name((type) => {
    const confirmMessage = {
      all: "すべてのデータを削除しますか？この操作は取り消せません。",
      progress: "学習進捗データを削除しますか？",
      collaboration: "コラボレーションデータを削除しますか？",
      settings: "カスタマイズ設定をリセットしますか？"
    };
    if (confirm(confirmMessage[type])) {
      try {
        switch (type) {
          case "all":
            localStorage.clear();
            break;
          case "progress":
            localStorage.removeItem("learningProgress");
            break;
          case "collaboration":
            localStorage.removeItem("sharedNotes");
            localStorage.removeItem("comments");
            localStorage.removeItem("studyGroups");
            break;
          case "settings":
            localStorage.removeItem("themeSettings");
            break;
        }
        setMessage({
          type: "success",
          text: "データを削除しました"
        });
        setTimeout(() => {
          window.location.reload();
        }, 1e3);
      } catch (error) {
        setMessage({
          type: "error",
          text: `エラー: ${error.message}`
        });
      }
    }
  }, "handleResetData");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `min-h-screen ${settings.darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-2 text-3xl font-bold", children: "データ管理" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${settings.darkMode ? "text-gray-300" : "text-gray-600"}`, children: "学習データのエクスポート、インポート、管理を行います" })
    ] }),
    message && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `mb-6 flex items-start gap-3 rounded-lg p-4 ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"}`,
        children: [
          message.type === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mt-0.5 h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "mt-0.5 h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.text })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex gap-4 border-b dark:border-gray-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setActiveTab("export"), "onClick"),
          className: `px-1 pb-3 font-medium transition-colors ${activeTab === "export" ? "border-b-2 border-blue-600 text-blue-600" : settings.darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 inline h-4 w-4" }),
            "エクスポート"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setActiveTab("import"), "onClick"),
          className: `px-1 pb-3 font-medium transition-colors ${activeTab === "import" ? "border-b-2 border-blue-600 text-blue-600" : settings.darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 inline h-4 w-4" }),
            "インポート"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: /* @__PURE__ */ __name(() => setActiveTab("manage"), "onClick"),
          className: `px-1 pb-3 font-medium transition-colors ${activeTab === "manage" ? "border-b-2 border-blue-600 text-blue-600" : settings.darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "mr-2 inline h-4 w-4" }),
            "データ管理"
          ]
        }
      )
    ] }),
    activeTab === "export" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "完全バックアップ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "すべてのデータをJSON形式でエクスポート" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleExport("json-all"), "onClick"),
            disabled: loading,
            className: "flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "すべてをエクスポート"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-green-100 p-3 dark:bg-green-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "h-6 w-6 text-green-600 dark:text-green-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "選択的エクスポート" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "必要なデータのみを選択してエクスポート" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: exportOptions.progress,
                onChange: /* @__PURE__ */ __name((e) => setExportOptions({
                  ...exportOptions,
                  progress: e.target.checked
                }), "onChange"),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
            "学習進捗データ"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: exportOptions.settings,
                onChange: /* @__PURE__ */ __name((e) => setExportOptions({
                  ...exportOptions,
                  settings: e.target.checked
                }), "onChange"),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
            "カスタマイズ設定"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: exportOptions.collaboration,
                onChange: /* @__PURE__ */ __name((e) => setExportOptions({
                  ...exportOptions,
                  collaboration: e.target.checked
                }), "onChange"),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            "コラボレーションデータ"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleExport("json-selected"), "onClick"),
            disabled: loading || !exportOptions.progress && !exportOptions.settings && !exportOptions.collaboration,
            className: "flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "選択したデータをエクスポート"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-6 w-6 text-purple-600 dark:text-purple-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "進捗データ（CSV）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "Excelなどで分析可能な形式でエクスポート" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleExport("csv"), "onClick"),
            disabled: loading,
            className: "flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "CSV形式でエクスポート"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6 text-amber-600 dark:text-amber-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "学習レポート" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`, children: "読みやすいテキスト形式のレポート" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: /* @__PURE__ */ __name(() => handleExport("report"), "onClick"),
            disabled: loading,
            className: "flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "レポートを生成"
            ]
          }
        )
      ] })
    ] }),
    activeTab === "import" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `mb-6 rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "ファイルを選択" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: ".json,.csv",
                  onChange: handleFileSelect,
                  className: "hidden"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: /* @__PURE__ */ __name(() => {
                      var _a2;
                      return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                    }, "onClick"),
                    className: `rounded-lg border-2 border-dashed px-4 py-2 ${settings.darkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"} transition-colors hover:bg-gray-50 dark:hover:bg-gray-700`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 inline h-5 w-5" }),
                      "ファイルを選択"
                    ]
                  }
                ),
                importFile && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                    children: importFile.name
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`, children: "対応形式: JSON (バックアップファイル), CSV (進捗データ)" })
            ] })
          ]
        }
      ),
      validationResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `mb-6 rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "検証結果" }),
            validationResult.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-red-600 dark:text-red-400", children: "エラー" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc space-y-1", children: validationResult.errors.map((error, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-red-600 dark:text-red-400", children: error }, index)) })
            ] }),
            validationResult.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-2 font-medium text-amber-600 dark:text-amber-400", children: "警告" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-inside list-disc space-y-1", children: validationResult.warnings.map((warning, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-amber-600 dark:text-amber-400", children: warning }, index)) })
            ] }),
            validationResult.valid && validationResult.warnings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600 dark:text-green-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "検証に成功しました" })
            ] })
          ]
        }
      ),
      importPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `mb-6 rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "インポートプレビュー" }),
            importPreview.type === "csv" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mb-2 ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`, children: [
              "CSVファイルから ",
              importPreview.summary.rowCount,
              " 件の進捗データを検出しました"
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              importPreview.metadata.hasProgress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                  "学習進捗データ"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                    children: [
                      ((_a = importPreview.summary.progress) == null ? void 0 : _a.totalProcesses) || 0,
                      " プロセス (",
                      ((_b = importPreview.summary.progress) == null ? void 0 : _b.completionRate) || 0,
                      "% 完了)"
                    ]
                  }
                )
              ] }),
              importPreview.metadata.hasSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
                  "カスタマイズ設定"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })
              ] }),
              importPreview.metadata.hasCollaboration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  "コラボレーションデータ"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                    children: [
                      "ノート: ",
                      ((_c = importPreview.summary.collaboration) == null ? void 0 : _c.notesCount) || 0,
                      ", コメント:",
                      " ",
                      ((_d = importPreview.summary.collaboration) == null ? void 0 : _d.commentsCount) || 0,
                      ", グループ:",
                      " ",
                      ((_e = importPreview.summary.collaboration) == null ? void 0 : _e.groupsCount) || 0
                    ]
                  }
                )
              ] }),
              importPreview.metadata.hasSearchHistory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
                  "検索履歴"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 border-t pt-6 dark:border-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mb-3 font-medium", children: "インポートオプション" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: importOptions.merge,
                    onChange: /* @__PURE__ */ __name((e) => setImportOptions({
                      ...importOptions,
                      merge: e.target.checked
                    }), "onChange"),
                    className: "rounded"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "既存データとマージする（上書きしない）" })
              ] }),
              importOptions.merge && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: `mt-2 text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mr-1 inline h-4 w-4" }),
                    "既存のデータを保持し、新しいデータのみを追加します"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleImport,
                  disabled: loading || validationResult && !validationResult.valid,
                  className: "flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50",
                  children: [
                    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                    "インポート実行"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: /* @__PURE__ */ __name(() => {
                    setImportFile(null);
                    setImportPreview(null);
                    setValidationResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }, "onClick"),
                  className: `rounded-lg px-4 py-2 ${settings.darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`,
                  children: "キャンセル"
                }
              )
            ] })
          ]
        }
      )
    ] }),
    activeTab === "manage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "データリセット" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => handleResetData("progress"), "onClick"),
              className: `w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${settings.darkMode ? "border-gray-700" : "border-gray-300"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                  "学習進捗をリセット"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-red-500" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => handleResetData("collaboration"), "onClick"),
              className: `w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${settings.darkMode ? "border-gray-700" : "border-gray-300"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  "コラボレーションデータを削除"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-red-500" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => handleResetData("settings"), "onClick"),
              className: `w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${settings.darkMode ? "border-gray-700" : "border-gray-300"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
                  "設定を初期値に戻す"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 text-amber-500" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: /* @__PURE__ */ __name(() => handleResetData("all"), "onClick"),
              className: "mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                "すべてのデータを削除"
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-6 ${settings.darkMode ? "bg-gray-800" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-lg font-semibold", children: "ストレージ使用状況" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
                  children: "LocalStorage使用量"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: (() => {
                let totalSize = 0;
                for (const key in localStorage) {
                  totalSize += localStorage[key].length + key.length;
                }
                return `${(totalSize / 1024).toFixed(2)} KB`;
              })() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-2 rounded-full bg-blue-600",
                style: {
                  width: `${Math.min(
                    (() => {
                      let totalSize = 0;
                      for (const key in localStorage) {
                        totalSize += localStorage[key].length + key.length;
                      }
                      return totalSize / (5 * 1024 * 1024) * 100;
                    })(),
                    100
                  )}%`
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `space-y-2 text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mr-1 inline h-4 w-4" }),
                  "ブラウザのLocalStorageは通常5MBまで保存可能です"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "定期的にバックアップを取ることをお勧めします" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}, "DataManagement");
export {
  DataManagement as default
};
