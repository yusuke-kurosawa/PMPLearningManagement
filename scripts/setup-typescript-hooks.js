#!/usr/bin/env node
/**
 * TypeScript統一のためのGit Hooks自動セットアップスクリプト
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptHooksSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.gitHooksDir = path.join(this.projectRoot, '.git', 'hooks');
    this.hooksInstalled = [];
  }

  /**
   * Git環境の確認
   */
  validateGitEnvironment() {
    console.log('🔍 Git環境を確認しています...');
    
    if (!fs.existsSync(path.join(this.projectRoot, '.git'))) {
      throw new Error('Git repository not found. Please run this script in a Git repository.');
    }
    
    if (!fs.existsSync(this.gitHooksDir)) {
      fs.mkdirSync(this.gitHooksDir, { recursive: true });
      console.log('📁 Git hooks directory created');
    }
    
    console.log('✅ Git environment validated');
  }

  /**
   * pre-commit hook設定
   */
  setupPreCommitHook() {
    console.log('📝 pre-commit hookを設定しています...');
    
    const preCommitHook = `#!/bin/bash
# TypeScript統一 pre-commit hook
# このフックは新規JavaScriptファイルの作成を防ぎ、TypeScript品質を確保します

set -e

echo "🔍 TypeScript品質チェックを実行しています..."

# 新規JavaScriptファイルの検出
echo "🚫 新規JavaScriptファイルの検出..."
NEW_JS_FILES=$(git diff --cached --name-status | grep -E "^A.*\\.(js|jsx)$" || true)

if [ ! -z "$NEW_JS_FILES" ]; then
    echo ""
    echo "❌ ERROR: 新規JavaScriptファイルが検出されました!"
    echo "検出されたファイル:"
    echo "$NEW_JS_FILES"
    echo ""
    echo "🔧 代わりにTypeScript (.ts/.tsx) を使用してください:"
    echo "$NEW_JS_FILES" | sed 's/\\.jsx\\?$/.tsx/' | sed 's/^A\\t/  推奨: /'
    echo ""
    echo "📚 TypeScript移行ガイド: docs/TYPESCRIPT_MIGRATION_ROADMAP.md"
    echo "📚 TypeScript統一ルール: docs/TYPESCRIPT_UNIFIED_STANDARDS.md"
    exit 1
fi

# TypeScript型チェック
if command -v npm >/dev/null 2>&1; then
    echo "📝 TypeScript型チェックを実行..."
    if ! npm run typecheck >/dev/null 2>&1; then
        echo "❌ ERROR: TypeScript型チェックに失敗しました"
        echo "🔧 以下のコマンドで詳細を確認してください:"
        echo "  npm run typecheck"
        exit 1
    fi
    echo "✅ TypeScript型チェック通過"
    
    # ESLint TypeScriptチェック
    echo "🎨 ESLint TypeScriptルールチェック..."
    STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' || true)
    
    if [ ! -z "$STAGED_TS_FILES" ]; then
        if ! npx eslint $STAGED_TS_FILES >/dev/null 2>&1; then
            echo "❌ ERROR: ESLint TypeScriptルールに違反しています"
            echo "🔧 以下のコマンドで修正してください:"
            echo "  npm run lint:fix"
            exit 1
        fi
        echo "✅ ESLint TypeScriptルールチェック通過"
    fi
    
    # any型使用チェック（警告のみ）
    echo "🚫 any型使用チェック..."
    STAGED_TS_CONTENT=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' | xargs -I {} git show :"{}" 2>/dev/null || true)
    
    if echo "$STAGED_TS_CONTENT" | grep -q ": any\\|<any>\\|any\\[\\]\\|as any" 2>/dev/null; then
        echo "⚠️  WARNING: any型の使用が検出されました"
        echo "💡 可能であれば具体的な型やunknownを使用することを推奨します"
        echo "📚 詳細: docs/TYPESCRIPT_TEAM_GUIDELINES.md"
        # 警告のみで、コミットは阻止しない
    else
        echo "✅ any型使用チェック通過"
    fi
else
    echo "⚠️  WARNING: npm not found, skipping TypeScript checks"
fi

echo "✅ TypeScript品質チェック完了!"
echo ""
`;

    const preCommitPath = path.join(this.gitHooksDir, 'pre-commit');
    fs.writeFileSync(preCommitPath, preCommitHook, { mode: 0o755 });
    this.hooksInstalled.push('pre-commit');
    
    console.log('✅ pre-commit hook設定完了');
  }

  /**
   * commit-msg hook設定
   */
  setupCommitMsgHook() {
    console.log('📝 commit-msg hookを設定しています...');
    
    const commitMsgHook = `#!/bin/bash
# TypeScript統一 commit-msg hook
# TypeScript移行関連のコミットを追跡し、進捗を表示します

set -e

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# TypeScript移行コミットの検出と追跡
if echo "$COMMIT_MSG" | grep -qE "(migrate|typescript|\\.ts|\\.tsx|型|type)" 2>/dev/null; then
    echo "🎯 TypeScript関連のコミットを検出しました"
    
    # TypeScript化率の計算と表示
    if command -v npm >/dev/null 2>&1 && [ -f "scripts/typescript-enforcement.js" ]; then
        echo "📊 TypeScript化進捗を確認しています..."
        node scripts/typescript-enforcement.js --quiet 2>/dev/null || true
    fi
    
    echo "📚 関連ドキュメント:"
    echo "  - TypeScript統一ルール: docs/TYPESCRIPT_UNIFIED_STANDARDS.md"
    echo "  - 移行ロードマップ: docs/TYPESCRIPT_MIGRATION_ROADMAP.md"
    echo "  - チーム運用ガイド: docs/TYPESCRIPT_TEAM_GUIDELINES.md"
fi

# IDD (Issue-Driven Development) 準拠チェック
if ! echo "$COMMIT_MSG" | grep -qE "#[0-9]+" 2>/dev/null; then
    echo "⚠️  WARNING: Issue番号がコミットメッセージに含まれていません"
    echo "💡 IDD準拠のため、Issue番号を含めることを推奨します (例: #123)"
fi

echo "✅ commit-msg hook処理完了"
`;

    const commitMsgPath = path.join(this.gitHooksDir, 'commit-msg');
    fs.writeFileSync(commitMsgPath, commitMsgHook, { mode: 0o755 });
    this.hooksInstalled.push('commit-msg');
    
    console.log('✅ commit-msg hook設定完了');
  }

  /**
   * pre-push hook設定
   */
  setupPrePushHook() {
    console.log('📝 pre-push hookを設定しています...');
    
    const prePushHook = `#!/bin/bash
# TypeScript統一 pre-push hook
# プッシュ前の最終TypeScript品質チェック

set -e

echo "🚀 プッシュ前TypeScript品質チェックを実行しています..."

# 現在のブランチ名取得
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📋 現在のブランチ: $CURRENT_BRANCH"

# メインブランチへのプッシュ時は厳格チェック
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
    echo "🔒 メインブランチへのプッシュのため、厳格チェックを実行します"
    
    if command -v npm >/dev/null 2>&1; then
        # 包括的TypeScript品質チェック
        echo "📊 包括的品質チェック実行中..."
        
        # TypeScript化率100%チェック
        JS_FILES=$(find . -name "*.js" -o -name "*.jsx" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./coverage/*" | wc -l)
        if [ $JS_FILES -gt 0 ]; then
            echo "❌ ERROR: JavaScriptファイルが残っています ($JS_FILES ファイル)"
            echo "🔧 TypeScript移行を完了してからプッシュしてください"
            echo "📋 移行コマンド: npm run ts:migrate:all"
            exit 1
        fi
        
        # TypeScript型チェック
        if ! npm run typecheck; then
            echo "❌ ERROR: TypeScript型チェックに失敗しました"
            exit 1
        fi
        
        # 全体テスト実行
        if ! npm run test:run; then
            echo "❌ ERROR: テストに失敗しました"
            exit 1
        fi
        
        echo "✅ メインブランチ厳格チェック通過"
    fi
else
    echo "📝 フィーチャーブランチのため、基本チェックを実行します"
    
    if command -v npm >/dev/null 2>&1; then
        # 基本TypeScriptチェック
        npm run typecheck || {
            echo "❌ ERROR: TypeScript型チェックに失敗しました"
            exit 1
        }
        
        echo "✅ 基本チェック通過"
    fi
fi

echo "🎉 pre-push hookチェック完了!"
echo ""
`;

    const prePushPath = path.join(this.gitHooksDir, 'pre-push');
    fs.writeFileSync(prePushPath, prePushHook, { mode: 0o755 });
    this.hooksInstalled.push('pre-push');
    
    console.log('✅ pre-push hook設定完了');
  }

  /**
   * 既存hooksのバックアップ
   */
  backupExistingHooks() {
    console.log('💾 既存hooksをバックアップしています...');
    
    const hooks = ['pre-commit', 'commit-msg', 'pre-push'];
    const backupDir = path.join(this.gitHooksDir, 'backup');
    
    let backedUp = 0;
    
    hooks.forEach(hook => {
      const hookPath = path.join(this.gitHooksDir, hook);
      if (fs.existsSync(hookPath)) {
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupPath = path.join(backupDir, `${hook}.backup.${Date.now()}`);
        fs.copyFileSync(hookPath, backupPath);
        backedUp++;
        
        console.log(`📁 ${hook} をバックアップしました: ${backupPath}`);
      }
    });
    
    if (backedUp > 0) {
      console.log(`✅ ${backedUp}個のhookをバックアップしました`);
    } else {
      console.log('ℹ️ バックアップするhookはありませんでした');
    }
  }

  /**
   * package.jsonスクリプトの確認・追加
   */
  checkAndAddNpmScripts() {
    console.log('📦 package.jsonスクリプトを確認しています...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️ package.json not found, skipping npm scripts check');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = packageJson.scripts || {};
    
    const requiredScripts = {
      'ts:setup-hooks': 'node scripts/setup-typescript-hooks.js',
      'ts:check-hooks': 'ls -la .git/hooks/ | grep -E "(pre-commit|commit-msg|pre-push)"',
      'ts:enforce': 'node scripts/typescript-enforcement.js',
      'ts:migrate': 'node scripts/migrate-to-typescript.js',
      'ts:verify': 'npm run typecheck && npm run lint && npm run test:run'
    };
    
    let updated = false;
    const addedScripts = [];
    
    Object.entries(requiredScripts).forEach(([script, command]) => {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        addedScripts.push(script);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log('✅ package.jsonにスクリプトを追加しました:');
      addedScripts.forEach(script => {
        console.log(`  📋 ${script}: ${requiredScripts[script]}`);
      });
    } else {
      console.log('✅ 必要なスクリプトは既に存在します');
    }
  }

  /**
   * hooks設定状況の確認
   */
  verifyHooksInstallation() {
    console.log('🔍 hooks設定状況を確認しています...');
    
    const hooks = ['pre-commit', 'commit-msg', 'pre-push'];
    const status = {};
    
    hooks.forEach(hook => {
      const hookPath = path.join(this.gitHooksDir, hook);
      status[hook] = {
        exists: fs.existsSync(hookPath),
        executable: false,
        typescript: false
      };
      
      if (status[hook].exists) {
        const stats = fs.statSync(hookPath);
        status[hook].executable = !!(stats.mode & parseInt('755', 8));
        
        const content = fs.readFileSync(hookPath, 'utf8');
        status[hook].typescript = content.includes('TypeScript');
      }
    });
    
    console.log('\n📊 Hooks設定状況:');
    console.log('==================');
    
    hooks.forEach(hook => {
      const s = status[hook];
      const icon = s.exists && s.executable && s.typescript ? '✅' : '❌';
      console.log(`${icon} ${hook}: ${s.exists ? '存在' : '未設定'} | ${s.executable ? '実行可能' : '実行不可'} | ${s.typescript ? 'TypeScript対応' : '非対応'}`);
    });
    
    const allGood = hooks.every(hook => {
      const s = status[hook];
      return s.exists && s.executable && s.typescript;
    });
    
    if (allGood) {
      console.log('\n🎉 すべてのhooksが正常に設定されています!');
    } else {
      console.log('\n⚠️ 一部のhooksに問題があります');
    }
    
    return allGood;
  }

  /**
   * セットアップ実行
   */
  async run() {
    console.log('🛠️ TypeScript統一Git Hooksセットアップを開始します\n');
    
    try {
      // 環境確認
      this.validateGitEnvironment();
      
      // 既存hooksバックアップ
      this.backupExistingHooks();
      
      // hooks設定
      this.setupPreCommitHook();
      this.setupCommitMsgHook();
      this.setupPrePushHook();
      
      // package.jsonスクリプト確認・追加
      this.checkAndAddNpmScripts();
      
      // 設定確認
      const success = this.verifyHooksInstallation();
      
      // 完了メッセージ
      console.log('\n🎯 セットアップ完了サマリー');
      console.log('==========================');
      console.log(`📦 インストールされたhooks: ${this.hooksInstalled.join(', ')}`);
      console.log('📚 関連ドキュメント:');
      console.log('  - docs/TYPESCRIPT_UNIFIED_STANDARDS.md');
      console.log('  - docs/TYPESCRIPT_MIGRATION_ROADMAP.md');
      console.log('  - docs/TYPESCRIPT_TEAM_GUIDELINES.md');
      
      console.log('\n🚀 次のステップ:');
      console.log('1. npm run ts:migrate  # 残りJavaScriptファイル移行');
      console.log('2. npm run ts:verify   # TypeScript品質確認');
      console.log('3. git add .           # 変更をステージング');
      console.log('4. git commit -m "feat: TypeScript統一完了"  # コミット');
      
      if (success) {
        console.log('\n🎉 TypeScript統一環境のセットアップが完了しました!');
      } else {
        console.log('\n⚠️ セットアップは完了しましたが、一部に問題があります');
        console.log('📋 npm run ts:check-hooks で詳細を確認してください');
      }
      
    } catch (error) {
      console.error('\n❌ セットアップ中にエラーが発生しました:', error.message);
      process.exit(1);
    }
  }
}

// CLI実行
if (require.main === module) {
  const setup = new TypeScriptHooksSetup();
  
  const args = process.argv.slice(2);
  if (args.includes('--verify-only')) {
    setup.validateGitEnvironment();
    setup.verifyHooksInstallation();
  } else {
    setup.run();
  }
}

module.exports = TypeScriptHooksSetup;