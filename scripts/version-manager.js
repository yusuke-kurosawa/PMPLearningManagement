#!/usr/bin/env node

/**
 * バージョン管理自動化スクリプト
 * セマンティックバージョニング (SemVer) に準拠
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// パス設定
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const CHANGELOG_PATH = path.join(__dirname, '..', 'docs', 'CHANGELOG.md');

// カラー出力用
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// バージョンタイプ
const VERSION_TYPES = {
  major: 'major',
  minor: 'minor', 
  patch: 'patch',
  prerelease: 'prerelease'
};

/**
 * 現在のバージョンを取得
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return packageJson.version;
}

/**
 * バージョンを増加
 */
function incrementVersion(currentVersion, type) {
  const parts = currentVersion.split('.');
  let [major, minor, patch] = parts.map(Number);
  
  switch (type) {
    case VERSION_TYPES.major:
      major++;
      minor = 0;
      patch = 0;
      break;
    case VERSION_TYPES.minor:
      minor++;
      patch = 0;
      break;
    case VERSION_TYPES.patch:
      patch++;
      break;
    case VERSION_TYPES.prerelease:
      if (currentVersion.includes('-')) {
        // 既存のプレリリース番号を増加
        const prereleaseParts = currentVersion.split('-');
        const prereleaseNumber = parseInt(prereleaseParts[1] || '0') + 1;
        return `${major}.${minor}.${patch}-${prereleaseNumber}`;
      } else {
        return `${major}.${minor}.${patch}-1`;
      }
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * package.jsonのバージョンを更新
 */
function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * CHANGELOGを更新
 */
function updateChangelog(newVersion, type, changes) {
  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
  const now = new Date().toISOString().split('T')[0];
  
  // バージョンタイプに応じたラベル
  const typeLabels = {
    major: '🎉 メジャーリリース',
    minor: '✨ マイナーリリース', 
    patch: '🔧 パッチリリース',
    prerelease: '🚧 プレリリース'
  };
  
  const newEntry = `
## [${newVersion}] - ${now}

### ${typeLabels[type]}

${changes || '- 変更内容を追加してください'}

`;
  
  // CHANGELOGの先頭に新しいエントリを挿入
  const lines = changelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || 4;
  
  lines.splice(insertIndex, 0, ...newEntry.split('\n'));
  
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
}

/**
 * Gitタグを作成
 */
function createGitTag(version) {
  try {
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    console.log(`${colors.green}✓${colors.reset} Gitタグ v${version} を作成しました`);
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} Gitタグの作成に失敗しました: ${error.message}`);
  }
}

/**
 * リリースノートの生成
 */
function generateReleaseNotes(version) {
  const releaseNotesPath = path.join(__dirname, '..', 'docs', 'releases', `v${version}.md`);
  const releaseNotesDir = path.dirname(releaseNotesPath);
  
  // ディレクトリ作成
  if (!fs.existsSync(releaseNotesDir)) {
    fs.mkdirSync(releaseNotesDir, { recursive: true });
  }
  
  const releaseNotes = `# Release v${version}

## 📋 概要

このリリースの主な変更点と新機能について説明します。

## ✨ 新機能

- 新機能1
- 新機能2

## 🔧 改善

- 改善点1
- 改善点2

## 🐛 バグ修正

- 修正1
- 修正2

## 🚨 破壊的変更

- 該当なし

## 📝 アップグレードガイド

このバージョンへのアップグレード手順：

1. \`npm install\` を実行
2. 設定ファイルを確認
3. テストを実行

## 📊 パフォーマンス

- ビルド時間: XX%改善
- バンドルサイズ: XX%削減

## 🙏 貢献者

このリリースに貢献してくださった皆様に感謝します。

---

**リリース日**: ${new Date().toISOString().split('T')[0]}
**前回リリースからの期間**: XX日
`;
  
  fs.writeFileSync(releaseNotesPath, releaseNotes);
  console.log(`${colors.blue}📝${colors.reset} リリースノートを作成しました: ${releaseNotesPath}`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const versionType = args[1];
  const changes = args.slice(2).join(' ');
  
  if (command !== 'bump') {
    console.log(`${colors.red}使用方法:${colors.reset}`);
    console.log(`  node version-manager.js bump <type> [changes]`);
    console.log('');
    console.log(`${colors.blue}バージョンタイプ:${colors.reset}`);
    console.log(`  major      - 破壊的変更 (X.0.0)`);
    console.log(`  minor      - 新機能追加 (x.Y.0)`);
    console.log(`  patch      - バグ修正 (x.y.Z)`);
    console.log(`  prerelease - プレリリース (x.y.z-N)`);
    console.log('');
    console.log(`${colors.blue}例:${colors.reset}`);
    console.log(`  node version-manager.js bump minor "新しい視覚化機能を追加"`);
    process.exit(1);
  }
  
  if (!Object.values(VERSION_TYPES).includes(versionType)) {
    console.log(`${colors.red}エラー:${colors.reset} 無効なバージョンタイプ: ${versionType}`);
    process.exit(1);
  }
  
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, versionType);
  
  console.log(`${colors.blue}📦 バージョン管理${colors.reset}`);
  console.log(`現在のバージョン: ${colors.yellow}${currentVersion}${colors.reset}`);
  console.log(`新しいバージョン: ${colors.green}${newVersion}${colors.reset}`);
  console.log(`バージョンタイプ: ${colors.magenta}${versionType}${colors.reset}`);
  console.log('');
  
  // 確認プロンプト
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('このバージョンアップを実行しますか? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        // バージョン更新
        updatePackageVersion(newVersion);
        console.log(`${colors.green}✓${colors.reset} package.json を更新しました`);
        
        // CHANGELOG更新
        updateChangelog(newVersion, versionType, changes);
        console.log(`${colors.green}✓${colors.reset} CHANGELOG.md を更新しました`);
        
        // リリースノート生成
        generateReleaseNotes(newVersion);
        
        // Gitタグ作成
        createGitTag(newVersion);
        
        console.log('');
        console.log(`${colors.green}🎉 バージョン ${newVersion} のリリース準備が完了しました！${colors.reset}`);
        console.log('');
        console.log(`${colors.blue}次のステップ:${colors.reset}`);
        console.log(`1. git add . && git commit -m "Release v${newVersion}"`);
        console.log(`2. git push origin main --tags`);
        console.log(`3. GitHub Releases でリリースノートを公開`);
        
      } catch (error) {
        console.log(`${colors.red}❌ エラーが発生しました:${colors.reset} ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log(`${colors.yellow}キャンセルされました${colors.reset}`);
    }
    
    rl.close();
  });
}

// 実行
main();