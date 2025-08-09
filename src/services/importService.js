// データインポートサービス
class ImportService {
  constructor() {
    this.supportedVersions = ['1.0.0'];
  }

  // ファイルを読み込んでパース
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          
          if (file.type === 'application/json') {
            const data = JSON.parse(content);
            resolve({ success: true, data, type: 'json' });
          } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const data = this.parseCSV(content);
            resolve({ success: true, data, type: 'csv' });
          } else {
            reject(new Error('サポートされていないファイル形式です'));
          }
        } catch (error) {
          reject(new Error(`ファイルの解析エラー: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };
      
      reader.readAsText(file);
    });
  }

  // データの検証
  validateData(data) {
    const errors = [];
    const warnings = [];

    // 基本構造の確認
    if (!data || typeof data !== 'object') {
      errors.push('無効なデータ形式です');
      return { valid: false, errors, warnings };
    }

    // バージョンチェック
    if (data.version) {
      if (!this.supportedVersions.includes(data.version)) {
        warnings.push(`異なるバージョンのデータです (${data.version})`);
      }
    } else {
      warnings.push('バージョン情報が含まれていません');
    }

    // データ構造の検証
    if (data.data) {
      // 進捗データの検証
      if (data.data.progress) {
        const progressValidation = this.validateProgressData(data.data.progress);
        errors.push(...progressValidation.errors);
        warnings.push(...progressValidation.warnings);
      }

      // 設定データの検証
      if (data.data.settings) {
        const settingsValidation = this.validateSettings(data.data.settings);
        errors.push(...settingsValidation.errors);
        warnings.push(...settingsValidation.warnings);
      }

      // コラボレーションデータの検証
      if (data.data.collaboration) {
        const collabValidation = this.validateCollaborationData(data.data.collaboration);
        errors.push(...collabValidation.errors);
        warnings.push(...collabValidation.warnings);
      }
    } else {
      errors.push('データが含まれていません');
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

    if (progress.processes && typeof progress.processes === 'object') {
      Object.entries(progress.processes).forEach(([processId, data]) => {
        if (!data.name) {
          warnings.push(`プロセス ${processId} に名前がありません`);
        }
        if (typeof data.completed !== 'boolean') {
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
      'darkMode', 'primaryColor', 'fontSize', 
      'compactMode', 'animations', 'highContrast'
    ];

    Object.keys(settings).forEach(key => {
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
      errors.push('ノートデータが配列形式ではありません');
    }

    if (collaboration.comments && !Array.isArray(collaboration.comments)) {
      errors.push('コメントデータが配列形式ではありません');
    }

    if (collaboration.groups && !Array.isArray(collaboration.groups)) {
      errors.push('グループデータが配列形式ではありません');
    }

    return { errors, warnings };
  }

  // データのインポート（全データ）
  async importData(data, options = {}) {
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
      // 進捗データのインポート
      if (data.data?.progress) {
        const result = await this.importProgress(data.data.progress, merge);
        if (result.success) {
          results.imported.push('進捗データ');
        } else {
          results.errors.push(...result.errors);
        }
      }

      // 設定のインポート
      if (data.data?.settings) {
        const result = await this.importSettings(data.data.settings);
        if (result.success) {
          results.imported.push('カスタマイズ設定');
        } else {
          results.errors.push(...result.errors);
        }
      }

      // コラボレーションデータのインポート
      if (data.data?.collaboration) {
        const result = await this.importCollaboration(data.data.collaboration, merge);
        if (result.success) {
          results.imported.push('コラボレーションデータ');
        } else {
          results.errors.push(...result.errors);
        }
      }

      // 検索履歴のインポート
      if (data.data?.searchHistory) {
        localStorage.setItem('searchHistory', JSON.stringify(data.data.searchHistory));
        results.imported.push('検索履歴');
      }

      // ユーザー情報のインポート
      if (data.data?.user?.username) {
        localStorage.setItem('username', data.data.user.username);
        results.imported.push('ユーザー情報');
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
        // 既存データとマージ
        const existingData = localStorage.getItem('learningProgress');
        const existing = existingData ? JSON.parse(existingData) : { processes: {} };
        
        // マージロジック
        Object.entries(progressData.processes || {}).forEach(([processId, newData]) => {
          if (!existing.processes[processId] || !existing.processes[processId].completed) {
            // 既存データがないか、未完了の場合は新しいデータで上書き
            existing.processes[processId] = newData;
          }
        });
        
        localStorage.setItem('learningProgress', JSON.stringify(existing));
      } else {
        // 完全に置き換え
        localStorage.setItem('learningProgress', JSON.stringify(progressData));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, errors: [`進捗データのインポートエラー: ${error.message}`] };
    }
  }

  // 設定のインポート
  async importSettings(settings) {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(settings));
      
      // 設定を即座に適用するためのイベント発火
      window.dispatchEvent(new Event('themeSettingsUpdated'));
      
      return { success: true };
    } catch (error) {
      return { success: false, errors: [`設定のインポートエラー: ${error.message}`] };
    }
  }

  // コラボレーションデータのインポート
  async importCollaboration(collaborationData, merge = false) {
    try {
      if (merge) {
        // 既存データとマージ
        const existingNotes = localStorage.getItem('sharedNotes');
        const existingComments = localStorage.getItem('comments');
        const existingGroups = localStorage.getItem('studyGroups');
        
        const notes = existingNotes ? JSON.parse(existingNotes) : [];
        const comments = existingComments ? JSON.parse(existingComments) : [];
        const groups = existingGroups ? JSON.parse(existingGroups) : [];
        
        // IDの重複を避けてマージ
        const noteIds = new Set(notes.map(n => n.id));
        const newNotes = (collaborationData.notes || []).filter(n => !noteIds.has(n.id));
        
        const commentIds = new Set(comments.map(c => c.id));
        const newComments = (collaborationData.comments || []).filter(c => !commentIds.has(c.id));
        
        const groupIds = new Set(groups.map(g => g.id));
        const newGroups = (collaborationData.groups || []).filter(g => !groupIds.has(g.id));
        
        localStorage.setItem('sharedNotes', JSON.stringify([...notes, ...newNotes]));
        localStorage.setItem('comments', JSON.stringify([...comments, ...newComments]));
        localStorage.setItem('studyGroups', JSON.stringify([...groups, ...newGroups]));
      } else {
        // 完全に置き換え
        localStorage.setItem('sharedNotes', JSON.stringify(collaborationData.notes || []));
        localStorage.setItem('comments', JSON.stringify(collaborationData.comments || []));
        localStorage.setItem('studyGroups', JSON.stringify(collaborationData.groups || []));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, errors: [`コラボレーションデータのインポートエラー: ${error.message}`] };
    }
  }

  // プレビューの生成
  generatePreview(data) {
    const preview = {
      metadata: {
        version: data.version,
        exportDate: data.exportDate,
        hasProgress: !!data.data?.progress,
        hasSettings: !!data.data?.settings,
        hasCollaboration: !!data.data?.collaboration,
        hasSearchHistory: !!data.data?.searchHistory,
        hasUser: !!data.data?.user
      },
      summary: {}
    };

    // 進捗データのサマリー
    if (data.data?.progress?.processes) {
      const processes = Object.values(data.data.progress.processes);
      preview.summary.progress = {
        totalProcesses: processes.length,
        completedProcesses: processes.filter(p => p.completed).length,
        completionRate: Math.round(
          (processes.filter(p => p.completed).length / processes.length) * 100
        )
      };
    }

    // コラボレーションデータのサマリー
    if (data.data?.collaboration) {
      preview.summary.collaboration = {
        notesCount: data.data.collaboration.notes?.length || 0,
        commentsCount: data.data.collaboration.comments?.length || 0,
        groupsCount: data.data.collaboration.groups?.length || 0
      };
    }

    // ユーザー情報
    if (data.data?.user) {
      preview.summary.user = data.data.user;
    }

    return preview;
  }

  // CSVデータのパース
  parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
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

      csvData.data.forEach(row => {
        const processId = row['プロセスID'];
        if (processId) {
          progress.processes[processId] = {
            name: row['プロセス名'] || '',
            knowledgeArea: row['知識エリア'] || '',
            processGroup: row['プロセス群'] || '',
            completed: row['完了状態'] === '完了',
            understanding: parseInt(row['理解度']) || 0,
            lastStudied: row['最終学習日'] || null,
            studyCount: parseInt(row['学習回数']) || 0
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
}

// シングルトンインスタンス
const importService = new ImportService();

export default importService;