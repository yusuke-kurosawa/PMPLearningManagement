#!/usr/bin/env node

/**
 * ドキュメント整理スクリプト
 * docs/フォルダ内のドキュメントを体系的に整理し、索引を生成
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// カテゴリ定義
const CATEGORIES = {
  'devops': {
    name: 'DevOps & CI/CD',
    description: 'DevOps実践、CI/CDパイプライン関連',
    pattern: /devops|ci-cd|workflow|deploy/i
  },
  'idd': {
    name: 'Issue-Driven Development',
    description: 'IDD方法論と実装',
    pattern: /idd|issue/i
  },
  'claude': {
    name: 'Claude AI Integration',
    description: 'Claude AI統合と活用',
    pattern: /claude/i
  },
  'security': {
    name: 'Security',
    description: 'セキュリティポリシーと実装',
    pattern: /security|secure/i
  },
  'architecture': {
    name: 'Architecture',
    description: 'システムアーキテクチャと設計',
    pattern: /architecture|design|structure/i
  },
  'testing': {
    name: 'Testing',
    description: 'テスト戦略と実装',
    pattern: /test|spec/i
  },
  'guides': {
    name: 'User Guides',
    description: 'ユーザーガイドとチュートリアル',
    pattern: /guide|tutorial|how-to/i
  },
  'api': {
    name: 'API Documentation',
    description: 'API仕様とリファレンス',
    pattern: /api|endpoint|swagger/i
  },
  'other': {
    name: 'その他',
    description: 'その他のドキュメント',
    pattern: /.*/
  }
};

/**
 * ドキュメントファイルを分類
 */
function categorizeFile(filename) {
  const lowerName = filename.toLowerCase();
  
  for (const [key, category] of Object.entries(CATEGORIES)) {
    if (key === 'other') continue;
    if (category.pattern.test(lowerName)) {
      return key;
    }
  }
  
  return 'other';
}

/**
 * Markdownファイルからタイトルと概要を抽出
 */
async function extractMetadata(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.split('\n');
    
    // タイトル抽出（最初の#から）
    let title = path.basename(filepath, '.md');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    // 概要抽出（最初の段落または##概要セクション）
    let description = '';
    const descMatch = content.match(/##\s*(概要|Overview|Description|Summary)([\s\S]*?)(?=\n##|\n#|$)/i);
    if (descMatch) {
      description = descMatch[2].trim().split('\n')[0];
    } else {
      // 最初の段落を取得
      for (const line of lines) {
        if (line && !line.startsWith('#') && !line.startsWith('---')) {
          description = line.trim();
          if (description.length > 0) break;
        }
      }
    }
    
    // 最終更新日
    const stats = await fs.stat(filepath);
    const lastModified = stats.mtime.toISOString().split('T')[0];
    
    return {
      title,
      description: description.substring(0, 200),
      lastModified,
      size: Math.round(stats.size / 1024) + 'KB'
    };
  } catch (error) {
    console.error(`Error processing ${filepath}:`, error.message);
    return {
      title: path.basename(filepath, '.md'),
      description: 'エラー: メタデータを抽出できませんでした',
      lastModified: '-',
      size: '-'
    };
  }
}

/**
 * カテゴリ別索引を生成
 */
async function generateCategoryIndex(category, files) {
  const categoryInfo = CATEGORIES[category];
  let content = `# ${categoryInfo.name}\n\n`;
  content += `> ${categoryInfo.description}\n\n`;
  
  if (files.length === 0) {
    content += '*このカテゴリにはまだドキュメントがありません。*\n';
    return content;
  }
  
  content += `## ドキュメント一覧\n\n`;
  content += `| ドキュメント | 説明 | 最終更新 | サイズ |\n`;
  content += `|------------|------|----------|--------|\n`;
  
  for (const file of files) {
    const metadata = await extractMetadata(file.path);
    const relativePath = path.relative(path.join(process.cwd(), 'docs'), file.path);
    content += `| [${metadata.title}](${relativePath}) | ${metadata.description} | ${metadata.lastModified} | ${metadata.size} |\n`;
  }
  
  content += '\n';
  return content;
}

/**
 * メイン索引ファイルを生成
 */
async function generateMainIndex(categorizedFiles) {
  let content = `# ドキュメント索引\n\n`;
  content += `> PMPLearningManagementプロジェクトの全ドキュメント索引\n\n`;
  content += `**生成日時**: ${new Date().toLocaleString('ja-JP')}\n\n`;
  
  // 統計情報
  const totalFiles = Object.values(categorizedFiles).reduce((sum, files) => sum + files.length, 0);
  content += `## 📊 統計\n\n`;
  content += `- **総ドキュメント数**: ${totalFiles}\n`;
  content += `- **カテゴリ数**: ${Object.keys(categorizedFiles).length}\n\n`;
  
  // カテゴリ別サマリー
  content += `## 📁 カテゴリ別ドキュメント\n\n`;
  
  for (const [category, files] of Object.entries(categorizedFiles)) {
    if (files.length === 0) continue;
    
    const categoryInfo = CATEGORIES[category];
    content += `### ${categoryInfo.name} (${files.length}件)\n\n`;
    content += `> ${categoryInfo.description}\n\n`;
    
    // 最新5件を表示
    const recentFiles = files.slice(0, 5);
    for (const file of recentFiles) {
      const metadata = await extractMetadata(file.path);
      const relativePath = path.relative(path.join(process.cwd(), 'docs'), file.path);
      content += `- [${metadata.title}](${relativePath}) - ${metadata.description.substring(0, 80)}...\n`;
    }
    
    if (files.length > 5) {
      content += `- *他${files.length - 5}件...*\n`;
    }
    content += '\n';
  }
  
  // クイックリンク
  content += `## 🔗 クイックリンク\n\n`;
  content += `### 重要ドキュメント\n`;
  content += `- [DevOps改善計画](DEVOPS_IMPROVEMENT_PLAN.md)\n`;
  content += `- [IDD実装ステータス](IDD_IMPLEMENTATION_STATUS.md)\n`;
  content += `- [Claude統合ガイド](CLAUDE_INTEGRATION_SETUP.md)\n`;
  content += `- [セキュリティ運用](SECURITY_OPERATIONS.md)\n\n`;
  
  content += `### カテゴリ別索引\n`;
  for (const [category, files] of Object.entries(categorizedFiles)) {
    if (files.length === 0) continue;
    const categoryInfo = CATEGORIES[category];
    content += `- [${categoryInfo.name}](categories/${category}.md) (${files.length}件)\n`;
  }
  
  content += `\n---\n`;
  content += `*このファイルは自動生成されています。手動で編集しないでください。*\n`;
  content += `*生成スクリプト: scripts/organize-docs.js*\n`;
  
  return content;
}

/**
 * メイン処理
 */
async function main() {
  console.log('📚 ドキュメント整理を開始します...\n');
  
  const docsDir = path.join(process.cwd(), 'docs');
  
  // docsディレクトリの存在確認
  try {
    await fs.access(docsDir);
  } catch {
    console.error('❌ docs/ディレクトリが見つかりません');
    process.exit(1);
  }
  
  // ドキュメントファイルを収集
  const files = await fs.readdir(docsDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  console.log(`📄 ${mdFiles.length}個のMarkdownファイルを発見\n`);
  
  // ファイルを分類
  const categorizedFiles = {};
  for (const category of Object.keys(CATEGORIES)) {
    categorizedFiles[category] = [];
  }
  
  for (const file of mdFiles) {
    const filepath = path.join(docsDir, file);
    const category = categorizeFile(file);
    categorizedFiles[category].push({
      name: file,
      path: filepath
    });
  }
  
  // カテゴリ別ファイル数を表示
  console.log('📊 カテゴリ別分類結果:');
  for (const [category, files] of Object.entries(categorizedFiles)) {
    if (files.length > 0) {
      console.log(`  - ${CATEGORIES[category].name}: ${files.length}件`);
    }
  }
  console.log('');
  
  // categoriesディレクトリを作成
  const categoriesDir = path.join(docsDir, 'categories');
  try {
    await fs.mkdir(categoriesDir, { recursive: true });
  } catch (error) {
    console.error('⚠️ categoriesディレクトリの作成に失敗:', error.message);
  }
  
  // カテゴリ別索引を生成
  console.log('📝 カテゴリ別索引を生成中...');
  for (const [category, files] of Object.entries(categorizedFiles)) {
    if (files.length > 0) {
      const indexContent = await generateCategoryIndex(category, files);
      const indexPath = path.join(categoriesDir, `${category}.md`);
      await fs.writeFile(indexPath, indexContent);
      console.log(`  ✅ ${category}.md`);
    }
  }
  
  // メイン索引を生成
  console.log('\n📝 メイン索引を生成中...');
  const mainIndex = await generateMainIndex(categorizedFiles);
  await fs.writeFile(path.join(docsDir, 'INDEX.md'), mainIndex);
  console.log('  ✅ INDEX.md');
  
  // 重複ファイルのチェック
  console.log('\n🔍 重複コンテンツをチェック中...');
  const duplicates = [];
  const contentHashes = new Map();
  
  for (const file of mdFiles) {
    const filepath = path.join(docsDir, file);
    const content = await fs.readFile(filepath, 'utf-8');
    // 簡易的なハッシュ（実際のプロジェクトではcryptoモジュールを使用）
    const hash = content.length + '-' + content.substring(0, 100);
    
    if (contentHashes.has(hash)) {
      duplicates.push([contentHashes.get(hash), file]);
    } else {
      contentHashes.set(hash, file);
    }
  }
  
  if (duplicates.length > 0) {
    console.log('  ⚠️ 重複の可能性があるファイル:');
    for (const [file1, file2] of duplicates) {
      console.log(`    - ${file1} と ${file2}`);
    }
  } else {
    console.log('  ✅ 重複ファイルなし');
  }
  
  console.log('\n✨ ドキュメント整理が完了しました！');
  console.log('📖 docs/INDEX.md を確認してください。');
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});

// 実行
main().catch(console.error);