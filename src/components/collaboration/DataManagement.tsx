import React, { useState, useRef } from 'react'
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
  Trash2,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import exportService from '../../services/exportService'
import importService from '../../services/importService'

const DataManagement = () => {
  const { settings } = useTheme()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('export')
  const [exportOptions, setExportOptions] = useState({
    progress: true,
    settings: true,
    collaboration: true,
  })
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importOptions, setImportOptions] = useState({
    merge: false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [validationResult, setValidationResult] = useState(null)

  // エクスポート処理
  const handleExport = async (type) => {
    setLoading(true)
    setMessage(null)

    try {
      let result

      switch (type) {
        case 'json-all':
          result = exportService.exportAsJSON()
          break
        case 'json-selected':
          result = exportService.exportSelected(exportOptions)
          break
        case 'csv':
          result = exportService.exportProgressAsCSV()
          break
        case 'report':
          result = exportService.exportLearningReport()
          break
        default:
          throw new Error('不明なエクスポートタイプ')
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `エクスポートが完了しました: ${result.filename}`,
        })
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'エクスポートに失敗しました',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `エラー: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // ファイル選択処理
  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportFile(file)
    setMessage(null)
    setValidationResult(null)
    setImportPreview(null)
    setLoading(true)

    try {
      const result = await importService.readFile(file)

      if (result.success) {
        if (result.type === 'json') {
          // JSONデータの検証
          const validation = importService.validateData(result.data)
          setValidationResult(validation)

          if (validation.valid || validation.warnings.length > 0) {
            // プレビューの生成
            const preview = importService.generatePreview(result.data)
            setImportPreview({ ...preview, data: result.data })
          }
        } else if (result.type === 'csv') {
          // CSV進捗データ
          setImportPreview({
            type: 'csv',
            data: result.data,
            summary: {
              rowCount: result.data.data.length,
            },
          })
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // インポート実行
  const handleImport = async () => {
    if (!importPreview) return

    setLoading(true)
    setMessage(null)

    try {
      let result

      if (importPreview.type === 'csv') {
        result = await importService.importProgressFromCSV(importPreview.data)
      } else {
        result = await importService.importData(importPreview.data, importOptions)
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `インポートが完了しました: ${result.imported.join(', ')}`,
        })

        // 成功後にリセット
        setImportFile(null)
        setImportPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // ページを更新して変更を反映
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: `インポートエラー: ${result.errors.join(', ')}`,
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `エラー: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // データのリセット
  const handleResetData = (type) => {
    const confirmMessage = {
      all: 'すべてのデータを削除しますか？この操作は取り消せません。',
      progress: '学習進捗データを削除しますか？',
      collaboration: 'コラボレーションデータを削除しますか？',
      settings: 'カスタマイズ設定をリセットしますか？',
    }

    if (confirm(confirmMessage[type])) {
      try {
        switch (type) {
          case 'all':
            localStorage.clear()
            break
          case 'progress':
            localStorage.removeItem('learningProgress')
            break
          case 'collaboration':
            localStorage.removeItem('sharedNotes')
            localStorage.removeItem('comments')
            localStorage.removeItem('studyGroups')
            break
          case 'settings':
            localStorage.removeItem('themeSettings')
            break
        }

        setMessage({
          type: 'success',
          text: 'データを削除しました',
        })

        // ページを更新
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        setMessage({
          type: 'error',
          text: `エラー: ${error.message}`,
        })
      }
    }
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">データ管理</h1>
          <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            学習データのエクスポート、インポート、管理を行います
          </p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="mb-6 flex gap-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-1 pb-3 font-medium transition-colors ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="mr-2 inline h-4 w-4" />
            エクスポート
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-1 pb-3 font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="mr-2 inline h-4 w-4" />
            インポート
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-1 pb-3 font-medium transition-colors ${
              activeTab === 'manage'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : settings.darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="mr-2 inline h-4 w-4" />
            データ管理
          </button>
        </div>

        {/* エクスポートタブ */}
        {activeTab === 'export' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 完全バックアップ */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <FileJson className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">完全バックアップ</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    すべてのデータをJSON形式でエクスポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('json-all')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                すべてをエクスポート
              </button>
            </div>

            {/* 選択的エクスポート */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                  <FileJson className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">選択的エクスポート</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    必要なデータのみを選択してエクスポート
                  </p>
                </div>
              </div>
              <div className="mb-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.progress}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        progress: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <TrendingUp className="h-4 w-4" />
                  学習進捗データ
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.settings}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        settings: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Settings className="h-4 w-4" />
                  カスタマイズ設定
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.collaboration}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        collaboration: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Users className="h-4 w-4" />
                  コラボレーションデータ
                </label>
              </div>
              <button
                onClick={() => handleExport('json-selected')}
                disabled={
                  loading ||
                  (!exportOptions.progress &&
                    !exportOptions.settings &&
                    !exportOptions.collaboration)
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                選択したデータをエクスポート
              </button>
            </div>

            {/* CSV進捗データ */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">進捗データ（CSV）</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Excelなどで分析可能な形式でエクスポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                CSV形式でエクスポート
              </button>
            </div>

            {/* 学習レポート */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20">
                  <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">学習レポート</h3>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    読みやすいテキスト形式のレポート
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExport('report')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
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
            <div
              className={`mb-6 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className="mb-4 text-lg font-semibold">ファイルを選択</h3>
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
                    className={`rounded-lg border-2 border-dashed px-4 py-2 ${
                      settings.darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    } transition-colors hover:bg-gray-50 dark:hover:bg-gray-700`}
                  >
                    <Upload className="mr-2 inline h-5 w-5" />
                    ファイルを選択
                  </button>
                  {importFile && (
                    <span
                      className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {importFile.name}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  対応形式: JSON (バックアップファイル), CSV (進捗データ)
                </p>
              </div>
            </div>

            {/* 検証結果 */}
            {validationResult && (
              <div
                className={`mb-6 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="mb-4 text-lg font-semibold">検証結果</h3>
                {validationResult.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 font-medium text-red-600 dark:text-red-400">エラー</h4>
                    <ul className="list-inside list-disc space-y-1">
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
                    <h4 className="mb-2 font-medium text-amber-600 dark:text-amber-400">警告</h4>
                    <ul className="list-inside list-disc space-y-1">
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
                    <CheckCircle className="h-5 w-5" />
                    <span>検証に成功しました</span>
                  </div>
                )}
              </div>
            )}

            {/* インポートプレビュー */}
            {importPreview && (
              <div
                className={`mb-6 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className="mb-4 text-lg font-semibold">インポートプレビュー</h3>

                {importPreview.type === 'csv' ? (
                  <div>
                    <p className={`mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      CSVファイルから {importPreview.summary.rowCount} 件の進捗データを検出しました
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {importPreview.metadata.hasProgress && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          学習進捗データ
                        </span>
                        <span
                          className={`text-sm ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {importPreview.summary.progress?.totalProcesses || 0} プロセス (
                          {importPreview.summary.progress?.completionRate || 0}% 完了)
                        </span>
                      </div>
                    )}
                    {importPreview.metadata.hasSettings && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          カスタマイズ設定
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {importPreview.metadata.hasCollaboration && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          コラボレーションデータ
                        </span>
                        <span
                          className={`text-sm ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          ノート: {importPreview.summary.collaboration?.notesCount || 0}, コメント:{' '}
                          {importPreview.summary.collaboration?.commentsCount || 0}, グループ:{' '}
                          {importPreview.summary.collaboration?.groupsCount || 0}
                        </span>
                      </div>
                    )}
                    {importPreview.metadata.hasSearchHistory && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          検索履歴
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* インポートオプション */}
                <div className="mt-6 border-t pt-6 dark:border-gray-700">
                  <h4 className="mb-3 font-medium">インポートオプション</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importOptions.merge}
                      onChange={(e) =>
                        setImportOptions({
                          ...importOptions,
                          merge: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span>既存データとマージする（上書きしない）</span>
                  </label>
                  {importOptions.merge && (
                    <p
                      className={`mt-2 text-sm ${
                        settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Info className="mr-1 inline h-4 w-4" />
                      既存のデータを保持し、新しいデータのみを追加します
                    </p>
                  )}
                </div>

                {/* インポートボタン */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={loading || (validationResult && !validationResult.valid)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    インポート実行
                  </button>
                  <button
                    onClick={() => {
                      setImportFile(null)
                      setImportPreview(null)
                      setValidationResult(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className={`rounded-lg px-4 py-2 ${
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* データリセット */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="mb-4 text-lg font-semibold">データリセット</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleResetData('progress')}
                  className={`w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      学習進捗をリセット
                    </span>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('collaboration')}
                  className={`w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      コラボレーションデータを削除
                    </span>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('settings')}
                  className={`w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      設定を初期値に戻す
                    </span>
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                  </div>
                </button>
                <button
                  onClick={() => handleResetData('all')}
                  className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    すべてのデータを削除
                  </div>
                </button>
              </div>
            </div>

            {/* ストレージ使用状況 */}
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="mb-4 text-lg font-semibold">ストレージ使用状況</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      LocalStorage使用量
                    </span>
                    <span className="text-sm font-medium">
                      {(() => {
                        let totalSize = 0
                        for (const key in localStorage) {
                          totalSize += localStorage[key].length + key.length
                        }
                        return `${(totalSize / 1024).toFixed(2)} KB`
                      })()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          (() => {
                            let totalSize = 0
                            for (const key in localStorage) {
                              totalSize += localStorage[key].length + key.length
                            }
                            // LocalStorageの一般的な上限は5MB
                            return (totalSize / (5 * 1024 * 1024)) * 100
                          })(),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`space-y-2 text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <p>
                    <Info className="mr-1 inline h-4 w-4" />
                    ブラウザのLocalStorageは通常5MBまで保存可能です
                  </p>
                  <p>定期的にバックアップを取ることをお勧めします</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataManagement
