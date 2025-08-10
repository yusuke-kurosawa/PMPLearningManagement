#!/usr/bin/env node

/**
 * 📚 CLAUDE.md と README.md の自動同期バリデーター
 * 
 * ドキュメント間の整合性を検証し、不整合を検出します。
 * Claude Code Actions との連携により、自動同期を支援します。
 */

const fs = require('fs');
const path = require('path');

class DocumentSyncValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.metrics = {};
    this.rootPath = process.cwd();
    this.claudePath = path.join(this.rootPath, 'CLAUDE.md');
    this.readmePath = path.join(this.rootPath, 'README.md');
  }

  /**
   * メインバリデーション実行
   */
  async validate() {
    console.log('🔍 ドキュメント同期バリデーションを開始...\n');

    try {
      // ファイル存在確認
      await this.checkFileExistence();
      
      // ファイル読み込み
      const claudeContent = await this.readFile(this.claudePath);
      const readmeContent = await this.readFile(this.readmePath);
      
      // 各種整合性チェック
      await this.validateProjectInfo(claudeContent, readmeContent);
      await this.validateTechnicalSpecs(claudeContent, readmeContent);
      await this.validateLanguageConventions(claudeContent, readmeContent);
      await this.validateDevelopmentInfo(claudeContent, readmeContent);
      await this.validateFeatures(claudeContent, readmeContent);
      
      // メトリクス計算
      this.calculateMetrics(claudeContent, readmeContent);
      
      // 結果出力
      this.outputResults();
      
      return this.errors.length === 0;
      
    } catch (error) {
      console.error('❌ バリデーション中にエラーが発生:', error.message);
      return false;
    }
  }

  /**
   * ファイル存在確認
   */
  async checkFileExistence() {
    if (!fs.existsSync(this.claudePath)) {
      this.errors.push('CLAUDE.md が見つかりません');
    }
    
    if (!fs.existsSync(this.readmePath)) {
      this.errors.push('README.md が見つかりません');
    }
  }

  /**
   * ファイル読み込み
   */
  async readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.errors.push(`${path.basename(filePath)} の読み込みに失敗: ${error.message}`);
      return '';
    }
  }

  /**
   * プロジェクト基本情報の検証
   */
  async validateProjectInfo(claudeContent, readmeContent) {
    console.log('📋 プロジェクト基本情報を検証中...');

    // プロジェクト名の確認
    const claudeProjectName = this.extractPattern(claudeContent, /PMPLearningManagement/);
    const readmeProjectName = this.extractPattern(readmeContent, /PMPLearningManagement/);
    
    if (!claudeProjectName || !readmeProjectName) {
      this.errors.push('プロジェクト名が見つかりません');
    }

    // タイトルの一貫性確認
    const claudeTitle = this.extractPattern(claudeContent, /# (.+)/);
    const readmeTitle = this.extractPattern(readmeContent, /# (.+)/);
    
    if (claudeTitle && readmeTitle) {
      // PMBOK バージョン情報の確認
      const claudeHasPMBOK6 = claudeContent.includes('PMBOK第6版') || claudeContent.includes('PMBOK第6版・第7版');
      const readmeHasPMBOK6 = readmeContent.includes('PMBOK第6版') || readmeContent.includes('PMBOK第6版・第7版');
      
      if (claudeHasPMBOK6 !== readmeHasPMBOK6) {
        this.errors.push('PMBOKバージョン記述に不整合があります');
      }
    }
  }

  /**
   * 技術仕様の検証
   */
  async validateTechnicalSpecs(claudeContent, readmeContent) {
    console.log('⚙️ 技術仕様を検証中...');

    const techSpecs = [
      { name: 'React', pattern: /React\s+18/ },
      { name: 'Vite', pattern: /Vite\s+v?5/ },
      { name: 'TypeScript', pattern: /TypeScript\s+v?5/ },
      { name: 'Tailwind CSS', pattern: /Tailwind\s+CSS/ },
      { name: 'D3.js', pattern: /D3\.js/ }
    ];

    techSpecs.forEach(spec => {
      const claudeHasSpec = spec.pattern.test(claudeContent);
      const readmeHasSpec = spec.pattern.test(readmeContent);
      
      if (claudeHasSpec && !readmeHasSpec) {
        this.warnings.push(`${spec.name} の記述が README.md にありません`);
      } else if (!claudeHasSpec && readmeHasSpec) {
        this.warnings.push(`${spec.name} の記述が CLAUDE.md にありません`);
      }
    });

    // Node.js バージョン確認
    const claudeNodeVersion = this.extractPattern(claudeContent, /Node\.js\s+(\d+)/);
    const readmeNodeVersion = this.extractPattern(readmeContent, /Node\.js\s+(\d+)/);
    
    if (claudeNodeVersion && readmeNodeVersion && claudeNodeVersion !== readmeNodeVersion) {
      this.errors.push('Node.js バージョンが一致しません');
    }
  }

  /**
   * 言語規約の検証
   */
  async validateLanguageConventions(claudeContent, readmeContent) {
    console.log('🗾 言語規約を検証中...');

    const claudeHasLanguageConvention = claudeContent.includes('言語規約') || claudeContent.includes('日本語.*標準');
    const readmeHasLanguageConvention = readmeContent.includes('言語規約') || readmeContent.includes('日本語.*標準');

    if (claudeHasLanguageConvention && !readmeHasLanguageConvention) {
      this.errors.push('言語規約の記述が README.md にありません');
    } else if (!claudeHasLanguageConvention && readmeHasLanguageConvention) {
      this.errors.push('言語規約の記述が CLAUDE.md にありません');
    }

    // GitHub Actions での日本語使用確認
    const claudeHasGitHubJapanese = claudeContent.includes('GitHub.*日本語') || claudeContent.includes('Issue.*日本語');
    const readmeHasGitHubJapanese = readmeContent.includes('GitHub.*日本語') || readmeContent.includes('Issue.*日本語');

    if (claudeHasGitHubJapanese !== readmeHasGitHubJapanese) {
      this.warnings.push('GitHub での日本語使用に関する記述が不一致です');
    }
  }

  /**
   * 開発環境情報の検証
   */
  async validateDevelopmentInfo(claudeContent, readmeContent) {
    console.log('🔧 開発環境情報を検証中...');

    const devCommands = [
      'npm install',
      'npm run dev',
      'npm run build',
      'npm run preview'
    ];

    devCommands.forEach(command => {
      const claudeHasCommand = claudeContent.includes(command);
      const readmeHasCommand = readmeContent.includes(command);
      
      if (claudeHasCommand !== readmeHasCommand) {
        this.warnings.push(`開発コマンド "${command}" の記述が不一致です`);
      }
    });

    // 開発サーバーポート確認
    const claudePort = this.extractPattern(claudeContent, /localhost:(\d+)/);
    const readmePort = this.extractPattern(readmeContent, /localhost:(\d+)/);
    
    if (claudePort && readmePort && claudePort !== readmePort) {
      this.errors.push(`開発サーバーポートが不一致です (CLAUDE: ${claudePort}, README: ${readmePort})`);
    }
  }

  /**
   * 機能リストの検証
   */
  async validateFeatures(claudeContent, readmeContent) {
    console.log('✨ 機能リストを検証中...');

    const keyFeatures = [
      'PMBOKマトリックス',
      'ネットワークダイアグラム',
      'AIコーチング',
      'プロジェクトシミュレーター',
      'メンターシップハブ',
      'フラッシュカード',
      '模擬試験'
    ];

    keyFeatures.forEach(feature => {
      const claudeHasFeature = claudeContent.includes(feature);
      const readmeHasFeature = readmeContent.includes(feature);
      
      if (claudeHasFeature !== readmeHasFeature) {
        this.warnings.push(`機能 "${feature}" の記述が不一致です`);
      }
    });
  }

  /**
   * パターン抽出ヘルパー
   */
  extractPattern(content, pattern) {
    const match = content.match(pattern);
    return match ? match[1] || match[0] : null;
  }

  /**
   * メトリクス計算
   */
  calculateMetrics(claudeContent, readmeContent) {
    this.metrics = {
      claudeLines: claudeContent.split('\n').length,
      readmeLines: readmeContent.split('\n').length,
      claudeSize: Buffer.byteLength(claudeContent, 'utf8'),
      readmeSize: Buffer.byteLength(readmeContent, 'utf8'),
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      consistencyScore: this.calculateConsistencyScore()
    };
  }

  /**
   * 整合性スコア計算
   */
  calculateConsistencyScore() {
    const totalChecks = 20; // 想定される総チェック数
    const issues = this.errors.length + (this.warnings.length * 0.5);
    return Math.max(0, Math.round(((totalChecks - issues) / totalChecks) * 100));
  }

  /**
   * 結果出力
   */
  outputResults() {
    console.log('\n📊 バリデーション結果');
    console.log('================================');
    
    console.log(`📏 CLAUDE.md: ${this.metrics.claudeLines}行 (${this.formatBytes(this.metrics.claudeSize)})`);
    console.log(`📏 README.md: ${this.metrics.readmeLines}行 (${this.formatBytes(this.metrics.readmeSize)})`);
    console.log(`🎯 整合性スコア: ${this.metrics.consistencyScore}%`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ エラー:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ すべてのチェックが通過しました！');
    }

    // Claude 同期指示の生成
    if (this.errors.length > 0 || this.warnings.length > 0) {
      this.generateClaudeSyncInstruction();
    }
  }

  /**
   * Claude 同期指示の生成
   */
  generateClaudeSyncInstruction() {
    const instruction = `
# 🤖 Claude 自動同期指示

## 検出された問題
${this.errors.map(err => `- ❌ ${err}`).join('\n')}
${this.warnings.map(warn => `- ⚠️ ${warn}`).join('\n')}

## 同期タスク
CLAUDE.md と README.md の以下の項目を完全同期してください：

1. プロジェクト基本情報（名前、概要、バージョン）
2. 技術仕様（React, Vite, TypeScript等のバージョン）
3. 言語規約（日本語標準の明記）
4. 開発環境（コマンド、ポート番号）
5. 機能リスト（すべての機能説明）

## 期待する結果
- 整合性スコア: 100%
- エラー: 0個
- 警告: 0個

プロンプト例: "CLAUDE.mdとREADME.mdを完全同期してください。上記の問題を修正し、100%の整合性を達成してください。"
`;

    const instructionPath = path.join(this.rootPath, '.claude-sync-instruction.md');
    fs.writeFileSync(instructionPath, instruction);
    console.log(`\n📝 Claude同期指示を生成しました: .claude-sync-instruction.md`);
  }

  /**
   * バイト数フォーマット
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}

// CLI実行
if (require.main === module) {
  const validator = new DocumentSyncValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ 実行エラー:', error);
    process.exit(1);
  });
}

module.exports = DocumentSyncValidator;