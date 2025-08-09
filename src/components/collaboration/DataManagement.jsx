import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  FileSpreadsheet,
  Database,
  Loader2,
  Info,
  Settings,
  Users,
  TrendingUp,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import exportService from '../../services/exportService';
import importService from '../../services/importService';

const DataManagement = () => {
  const { settings } = useTheme();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('export');
  const [exportOptions, setExportOptions] = useState({
    progress: true,
    settings: true,
    collaboration: true
  });
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importOptions, setImportOptions] = useState({
    merge: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // エクスポート処理
  const handleExport = async (type) => {
    setLoading(true);
    setMessage(null);

    try {
      let result;
      
      switch (type) {
        case 'json-all':
          result = exportService.exportAsJSON();
          break;
        case 'json-selected':
          result = exportService.exportSelected(exportOptions);
          break;
        case 'csv':
          result = exportService.exportProgressAsCSV();
          break;
        case 'report':
          result = exportService.exportLearningReport();
          break;
        default:
          throw new Error('不明なエクスポートタイプ');
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `エクスポートが完了しました: ${result.filename}`
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'エクスポートに失敗しました'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `エラー: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // ファイル選択処理
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setMessage(null);
    setValidationResult(null);
    setImportPreview(null);
    setLoading(true);

    try {
      const result = await importService.readFile(file);
      
      if (result.success) {
        if (result.type === 'json') {
          // JSONデータの検証
          const validation = importService.validateData(result.data);
          setValidationResult(validation);
          
          if (validation.valid || validation.warnings.length > 0) {
            // プレビューの生成
            const preview = importService.generatePreview(result.data);
            setImportPreview({ ...preview, data: result.data });
          }
        } else if (result.type === 'csv') {
          // CSV進捗データ
          setImportPreview({
            type: 'csv',
            data: result.data,
            summary: {
              rowCount: result.data.data.length
            }
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // インポート実行
  const handleImport = async () => {
    if (!importPreview) return;

    setLoading(true);
    setMessage(null);

    try {
      let result;
      
      if (importPreview.type === 'csv') {
        result = await importService.importProgressFromCSV(importPreview.data);
      } else {
        result = await importService.importData(importPreview.data, importOptions);
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `インポートが完了しました: ${result.imported.join(', ')}`
        });
        
        // 成功後にリセット
        setImportFile(null);
        setImportPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // ページを更新して変更を反映
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: `インポートエラー: ${result.errors.join(', ')}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `エラー: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // データのリセット
  const handleResetData = (type) => {
    const confirmMessage = {
      all: 'すべてのデータを削除しますか？この操作は取り消せません。',
      progress: '学習進捗データを削除しますか？',
      collaboration: 'コラボレーションデータを削除しますか？',
      settings: 'カスタマイズ設定をリセットしますか？'
    };

    if (confirm(confirmMessage[type])) {
      try {
        switch (type) {
          case 'all':
            localStorage.clear();
            break;
          case 'progress':
            localStorage.removeItem('learningProgress');
            break;
          case 'collaboration':
            localStorage.removeItem('sharedNotes');
            localStorage.removeItem('comments');
            localStorage.removeItem('studyGroups');
            break;
          case 'settings':
            localStorage.removeItem('themeSettings');
            break;
        }
        
        setMessage({
          type: 'success',
          text: 'データを削除しました'
        });
        
        // ページを更新
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        setMessage({
          type: 'error',
          text: `エラー: ${error.message}`
        });
      }
    }
  };

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">データ管理</h1>
          <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            学習データのエクスポート、インポート、管理を行います
          </p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            エクスポート
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            インポート
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'manage'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            データ管理
          </button>
        </div>

        {/* エクスポートタブ */}
        {activeTab === 'export' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 完全バックアップ */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileJson className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">完全バックアップ</h3>
                  <p className={`text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    すべてのデータをJSON形式でエクスポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('json-all')}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                すべてをエクスポート
              </button>
            </div>

            {/* 選択的エクスポート */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FileJson className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">選択的エクスポート</h3>
                  <p className={`text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    必要なデータのみを選択してエクスポート
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.progress}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      progress: e.target.checked
                    })}
                    className="rounded"
                  />
                  <TrendingUp className="w-4 h-4" />
                  学習進捗データ
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.settings}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      settings: e.target.checked
                    })}
                    className="rounded"
                  />
                  <Settings className="w-4 h-4" />
                  カスタマイズ設定
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.collaboration}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      collaboration: e.target.checked
                    })}
                    className="rounded"
                  />
                  <Users className="w-4 h-4" />
                  コラボレーションデータ
                </label>
              </div>
              <button
                onClick={() => handleExport('json-selected')}
                disabled={loading || (!exportOptions.progress && !exportOptions.settings && !exportOptions.collaboration)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                選択したデータをエクスポート
              </button>
            </div>

            {/* CSV進捗データ */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">進捗データ（CSV）</h3>
                  <p className={`text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Excelなどで分析可能な形式でエクスポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                CSV形式でエクスポート
              </button>
            </div>

            {/* 学習レポート */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">学習レポート</h3>
                  <p className={`text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    読みやすいテキスト形式のレポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('report')}
                disabled={loading}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                レポートを生成
              </button>
            </div>
          </div>
        )}

        {/* インポートタブ */}
        {activeTab === 'import' && (
          <div>
            {/* ファイル選択 */}
            <div className={`p-6 rounded-lg mb-6 ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className="text-lg font-semibold mb-4">ファイルを選択</h3>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-lg border-2 border-dashed ${
                      settings.darkMode 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    ファイルを選択
                  </button>
                  {importFile && (
                    <span className={`text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {importFile.name}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  対応形式: JSON (バックアップファイル), CSV (進捗データ)
                </p>
              </div>
            </div>

            {/* 検証結果 */}
            {validationResult && (
              <div className={`p-6 rounded-lg mb-6 ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className="text-lg font-semibold mb-4">検証結果</h3>
                {validationResult.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                      エラー
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                      警告
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-amber-600 dark:text-amber-400">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.valid && validationResult.warnings.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>検証に成功しました</span>
                  </div>
                )}
              </div>
            )}

            {/* インポートプレビュー */}
            {importPreview && (
              <div className={`p-6 rounded-lg mb-6 ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className="text-lg font-semibold mb-4">インポートプレビュー</h3>
                
                {importPreview.type === 'csv' ? (
                  <div>
                    <p className={`mb-2 ${
                      settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      CSVファイルから {importPreview.summary.rowCount} 件の進捗データを検出しました
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {importPreview.metadata.hasProgress && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          学習進捗データ
                        </span>
                        <span className={`text-sm ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {importPreview.summary.progress?.totalProcesses || 0} プロセス
                          ({importPreview.summary.progress?.completionRate || 0}% 完了)
                        </span>
                      </div>
                    )}
                    {importPreview.metadata.hasSettings && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          カスタマイズ設定
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    {importPreview.metadata.hasCollaboration && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          コラボレーションデータ
                        </span>
                        <span className={`text-sm ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          ノート: {importPreview.summary.collaboration?.notesCount || 0},
                          コメント: {importPreview.summary.collaboration?.commentsCount || 0},
                          グループ: {importPreview.summary.collaboration?.groupsCount || 0}
                        </span>
                      </div>
                    )}
                    {importPreview.metadata.hasSearchHistory && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          検索履歴
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* インポートオプション */}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h4 className="font-medium mb-3">インポートオプション</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importOptions.merge}
                      onChange={(e) => setImportOptions({
                        ...importOptions,
                        merge: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>既存データとマージする（上書きしない）</span>
                  </label>
                  {importOptions.merge && (
                    <p className={`text-sm mt-2 ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Info className="w-4 h-4 inline mr-1" />
                      既存のデータを保持し、新しいデータのみを追加します
                    </p>
                  )}
                </div>

                {/* インポートボタン */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={loading || (validationResult && !validationResult.valid)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    インポート実行
                  </button>
                  <button
                    onClick={() => {
                      setImportFile(null);
                      setImportPreview(null);
                      setValidationResult(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      settings.darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* データ管理タブ */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* データリセット */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className="text-lg font-semibold mb-4">データリセット</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleResetData('progress')}
                  className={`w-full px-4 py-2 rounded-lg border text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      学習進捗をリセット
                    </span>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('collaboration')}
                  className={`w-full px-4 py-2 rounded-lg border text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      コラボレーションデータを削除
                    </span>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('settings')}
                  className={`w-full px-4 py-2 rounded-lg border text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      設定を初期値に戻す
                    </span>
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('all')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mt-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    すべてのデータを削除
                  </div>
                </button>
              </div>
            </div>

            {/* ストレージ使用状況 */}
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className="text-lg font-semibold mb-4">ストレージ使用状況</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      LocalStorage使用量
                    </span>
                    <span className="text-sm font-medium">
                      {(() => {
                        let totalSize = 0;
                        for (let key in localStorage) {
                          totalSize += localStorage[key].length + key.length;
                        }
                        return `${(totalSize / 1024).toFixed(2)} KB`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (() => {
                            let totalSize = 0;
                            for (let key in localStorage) {
                              totalSize += localStorage[key].length + key.length;
                            }
                            // LocalStorageの一般的な上限は5MB
                            return (totalSize / (5 * 1024 * 1024)) * 100;
                          })(),
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
                <div className={`text-sm space-y-2 ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <p>
                    <Info className="w-4 h-4 inline mr-1" />
                    ブラウザのLocalStorageは通常5MBまで保存可能です
                  </p>
                  <p>
                    定期的にバックアップを取ることをお勧めします
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManagement;