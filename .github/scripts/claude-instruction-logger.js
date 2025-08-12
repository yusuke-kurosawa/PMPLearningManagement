#!/usr/bin/env node

/**
 * 📝 Claude Code 指示 → GitHub Issue 自動生成システム
 * 
 * Claude Codeでの指示内容とその回答を自動的にGitHub Issueとして記録します。
 * プロジェクトの追跡可能性と知識蓄積を向上させます。
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class ClaudeInstructionLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), '.claude-logs');
    this.configPath = path.join(process.cwd(), '.github', 'claude-logging-config.json');
    this.ensureDirectories();
  }

  /**
   * 必要なディレクトリを作成
   */
  ensureDirectories() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Claude指示をIssueとして記録
   */
  async logInstruction(instruction, response, metadata = {}) {
    try {
      console.log('🤖 Claude指示をIssueとして記録中...');

      const issueData = this.prepareIssueData(instruction, response, metadata);
      const issueNumber = await this.createGitHubIssue(issueData);
      
      // ローカルログファイルに記録
      await this.saveLocalLog(instruction, response, issueNumber, metadata);
      
      console.log(`✅ Issue #${issueNumber} が作成されました`);
      return issueNumber;
      
    } catch (error) {
      console.error('❌ Issue作成中にエラーが発生:', error);
      
      // エラー時はローカルログのみ保存
      await this.saveLocalLog(instruction, response, null, { ...metadata, error: error.message });
      throw error;
    }
  }

  /**
   * Issue データの準備
   */
  prepareIssueData(instruction, response, metadata) {
    const timestamp = new Date().toISOString();
    const shortInstruction = this.truncateText(instruction, 60);
    
    const title = `🤖 Claude指示: ${shortInstruction}`;
    
    const body = this.generateIssueBody(instruction, response, metadata, timestamp);
    
    const labels = this.determineLabels(instruction, metadata);
    
    return { title, body, labels };
  }

  /**
   * Issue本文の生成
   */
  generateIssueBody(instruction, response, metadata, timestamp) {
    let body = `## 📝 Claude Code 指示記録

### 🎯 指示内容
\`\`\`
${instruction}
\`\`\`

### 🤖 Claude回答
${response}

---

### 📊 メタデータ
- **記録時刻**: ${timestamp}
- **実行環境**: ${process.platform} / Node.js ${process.version}
- **Git Branch**: ${metadata.branch || 'unknown'}
- **作業ディレクトリ**: ${process.cwd()}
`;

    // 追加メタデータがある場合
    if (metadata.taskType) {
      body += `- **タスク種別**: ${metadata.taskType}\n`;
    }
    
    if (metadata.affectedFiles) {
      body += `- **影響ファイル**: ${metadata.affectedFiles.join(', ')}\n`;
    }
    
    if (metadata.estimatedTime) {
      body += `- **推定作業時間**: ${metadata.estimatedTime}\n`;
    }

    body += `\n### 🏷️ 分類
このIssueは自動生成されたClaude指示ログです。プロジェクトの進行状況追跡と知識蓄積のために作成されています。

### ✅ 対応状況
- [ ] 指示内容の確認
- [ ] 実装結果の検証
- [ ] 関連ドキュメントの更新
- [ ] 学習内容の整理

---
*このIssueは Claude Code Instruction Logger により自動生成されました*`;

    return body;
  }

  /**
   * ラベルの決定
   */
  determineLabels(instruction, metadata) {
    const labels = ['claude-code', 'auto-generated'];
    
    // 指示内容に基づくラベル分類
    const instructionLower = instruction.toLowerCase();
    
    if (instructionLower.includes('bug') || instructionLower.includes('fix') || instructionLower.includes('エラー')) {
      labels.push('bug');
    }
    
    if (instructionLower.includes('feature') || instructionLower.includes('implement') || instructionLower.includes('機能')) {
      labels.push('enhancement');
    }
    
    if (instructionLower.includes('test') || instructionLower.includes('testing') || instructionLower.includes('テスト')) {
      labels.push('testing');
    }
    
    if (instructionLower.includes('doc') || instructionLower.includes('documentation') || instructionLower.includes('ドキュメント')) {
      labels.push('documentation');
    }
    
    if (instructionLower.includes('security') || instructionLower.includes('セキュリティ')) {
      labels.push('security');
    }

    // メタデータに基づくラベル
    if (metadata.priority) {
      labels.push(`priority-${metadata.priority.toLowerCase()}`);
    }
    
    if (metadata.taskType) {
      labels.push(`type-${metadata.taskType.toLowerCase()}`);
    }

    return labels;
  }

  /**
   * GitHub Issue の作成
   */
  async createGitHubIssue(issueData) {
    return new Promise((resolve, reject) => {
      // 一時ファイルでIssue本文を作成
      const tempBodyFile = path.join(this.logDir, `temp-issue-body-${Date.now()}.md`);
      
      try {
        fs.writeFileSync(tempBodyFile, issueData.body);
        
        let command = `gh issue create --title "${issueData.title}" --body-file "${tempBodyFile}"`;
        
        console.log('📝 Issueを作成中...');
        
        exec(command, (error, stdout, stderr) => {
          // 一時ファイルを削除
          try {
            fs.unlinkSync(tempBodyFile);
          } catch (e) {
            console.warn('⚠️ 一時ファイル削除失敗:', e.message);
          }
          
          if (error) {
            reject(new Error(`GitHub Issue作成失敗: ${error.message}`));
            return;
          }
          
          if (stderr) {
            console.warn('⚠️ 警告:', stderr);
          }
          
          // Issue URLからIssue番号を抽出
          const issueUrl = stdout.trim();
          const issueNumber = issueUrl.split('/').pop();
          
          resolve(issueNumber);
        });
        
      } catch (fileError) {
        reject(new Error(`一時ファイル作成失敗: ${fileError.message}`));
      }
    });
  }

  /**
   * ローカルログの保存
   */
  async saveLocalLog(instruction, response, issueNumber, metadata) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `claude-instruction-${timestamp}.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      timestamp: new Date().toISOString(),
      instruction,
      response,
      issueNumber,
      metadata,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd()
      }
    };
    
    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📁 ローカルログ保存: ${filename}`);
  }

  /**
   * テキストの切り詰め
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * 設定の読み込み
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ 設定ファイル読み込みエラー:', error.message);
    }
    
    return this.getDefaultConfig();
  }

  /**
   * デフォルト設定
   */
  getDefaultConfig() {
    return {
      enabled: true,
      autoLabeling: true,
      minimumInstructionLength: 10,
      excludePatterns: [
        'test',
        'debug',
        'temporary'
      ],
      priorityKeywords: {
        high: ['urgent', '緊急', 'critical', 'important'],
        medium: ['should', 'できれば', 'prefer'],
        low: ['nice to have', 'optional', 'できたら']
      }
    };
  }

  /**
   * 指示の分析とカテゴライズ
   */
  analyzeInstruction(instruction) {
    const config = this.loadConfig();
    const analysis = {
      category: 'general',
      priority: 'medium',
      estimatedComplexity: 'medium',
      taskType: 'implementation'
    };

    const instructionLower = instruction.toLowerCase();
    
    // 優先度判定
    for (const [priority, keywords] of Object.entries(config.priorityKeywords)) {
      if (keywords.some(keyword => instructionLower.includes(keyword))) {
        analysis.priority = priority;
        break;
      }
    }
    
    // カテゴリ判定
    if (instructionLower.includes('bug') || instructionLower.includes('fix')) {
      analysis.category = 'bugfix';
      analysis.taskType = 'debugging';
    } else if (instructionLower.includes('test')) {
      analysis.category = 'testing';
      analysis.taskType = 'testing';
    } else if (instructionLower.includes('doc')) {
      analysis.category = 'documentation';
      analysis.taskType = 'documentation';
    } else if (instructionLower.includes('feature') || instructionLower.includes('implement')) {
      analysis.category = 'feature';
      analysis.taskType = 'implementation';
    }
    
    // 複雑度推定（簡易）
    if (instruction.length > 200) {
      analysis.estimatedComplexity = 'high';
    } else if (instruction.length < 50) {
      analysis.estimatedComplexity = 'low';
    }

    return analysis;
  }
}

// CLI実行時のメイン処理
async function main() {
  if (require.main === module) {
    const logger = new ClaudeInstructionLogger();
    
    // コマンドライン引数からの実行
    const instruction = process.argv[2];
    const response = process.argv[3];
    
    if (!instruction) {
      console.error('使用方法: node claude-instruction-logger.js "指示内容" "回答内容"');
      process.exit(1);
    }
    
    try {
      const metadata = logger.analyzeInstruction(instruction);
      const issueNumber = await logger.logInstruction(instruction, response || '実行中...', metadata);
      console.log(`🎉 Claude指示がIssue #${issueNumber}として記録されました！`);
    } catch (error) {
      console.error('❌ エラー:', error.message);
      process.exit(1);
    }
  }
}

// NPMスクリプトや他のスクリプトからの利用のためのエクスポート
module.exports = ClaudeInstructionLogger;

// CLI実行
main().catch(console.error);