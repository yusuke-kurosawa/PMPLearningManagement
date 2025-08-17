#!/usr/bin/env node
/**
 * TypeScript統一強制スクリプト
 * 新規JavaScriptファイルの検出と警告を行う
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptEnforcement {
  constructor() {
    this.projectRoot = process.cwd();
    this.ignorePaths = [
      'node_modules',
      'dist',
      'coverage',
      'test-results',
      'playwright-report',
      '.git'
    ];
  }

  /**
   * プロジェクト内のJavaScriptファイルを検索
   */
  findJavaScriptFiles() {
    const jsFiles = [];
    
    const searchDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const relativePath = path.relative(this.projectRoot, itemPath);
        
        // 無視パスをスキップ
        if (this.ignorePaths.some(ignorePath => relativePath.startsWith(ignorePath))) {
          return;
        }
        
        if (fs.statSync(itemPath).isDirectory()) {
          searchDirectory(itemPath);
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          jsFiles.push(relativePath);
        }
      });
    };
    
    searchDirectory(this.projectRoot);
    return jsFiles;
  }

  /**
   * TypeScript化率を計算
   */
  calculateTypeScriptAdoption() {
    const findFiles = (extensions) => {
      try {
        const result = execSync(`find . -name "*.${extensions.join('" -o -name "*.')}" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./coverage/*"`, 
          { encoding: 'utf8', cwd: this.projectRoot });
        return result.trim().split('\n').filter(file => file.length > 0);
      } catch (error) {
        return [];
      }
    };
    
    const tsFiles = findFiles(['ts', 'tsx']);
    const jsFiles = findFiles(['js', 'jsx']);
    const totalFiles = tsFiles.length + jsFiles.length;
    
    const adoptionRate = totalFiles > 0 ? Math.round((tsFiles.length / totalFiles) * 100) : 100;
    
    return {
      tsFiles: tsFiles.length,
      jsFiles: jsFiles.length,
      totalFiles,
      adoptionRate
    };
  }

  /**
   * Git Hooksの設定状況をチェック
   */
  checkGitHooks() {
    const hooksPath = path.join(this.projectRoot, '.git', 'hooks');
    const requiredHooks = ['pre-commit', 'commit-msg'];
    const hookStatus = {};
    
    requiredHooks.forEach(hook => {
      const hookFile = path.join(hooksPath, hook);
      hookStatus[hook] = {
        exists: fs.existsSync(hookFile),
        executable: fs.existsSync(hookFile) && (fs.statSync(hookFile).mode & parseInt('755', 8))
      };
    });
    
    return hookStatus;
  }

  /**
   * TypeScript設定の検証
   */
  validateTypeScriptConfig() {
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    const eslintrcPath = path.join(this.projectRoot, '.eslintrc.json');
    
    const results = {
      tsconfig: { exists: false, valid: false, strict: false },
      eslint: { exists: false, valid: false, typescript: false }
    };
    
    // tsconfig.json検証
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        results.tsconfig.exists = true;
        results.tsconfig.valid = true;
        results.tsconfig.strict = 
          tsconfig.compilerOptions?.strict === true &&
          tsconfig.compilerOptions?.noImplicitAny === true &&
          tsconfig.compilerOptions?.strictNullChecks === true;
      } catch (error) {
        results.tsconfig.exists = true;
        results.tsconfig.valid = false;
      }
    }
    
    // .eslintrc.json検証
    if (fs.existsSync(eslintrcPath)) {
      try {
        const eslintrc = JSON.parse(fs.readFileSync(eslintrcPath, 'utf8'));
        results.eslint.exists = true;
        results.eslint.valid = true;
        results.eslint.typescript = 
          eslintrc.extends?.includes('@typescript-eslint/recommended') ||
          eslintrc.plugins?.includes('@typescript-eslint');
      } catch (error) {
        results.eslint.exists = true;
        results.eslint.valid = false;
      }
    }
    
    return results;
  }

  /**
   * 新規JavaScriptファイルをチェック（Git使用）
   */
  checkNewJavaScriptFiles() {
    try {
      const stagedFiles = execSync('git diff --cached --name-status', 
        { encoding: 'utf8', cwd: this.projectRoot });
      
      const newJsFiles = stagedFiles
        .split('\n')
        .filter(line => line.startsWith('A\t'))
        .map(line => line.substring(2))
        .filter(file => file.endsWith('.js') || file.endsWith('.jsx'));
      
      return newJsFiles;
    } catch (error) {
      // Git未初期化またはエラー
      return [];
    }
  }

  /**
   * レポート生成
   */
  generateReport() {
    console.log('🔍 TypeScript統一状況レポート\n');
    
    const adoption = this.calculateTypeScriptAdoption();
    const config = this.validateTypeScriptConfig();
    const hooks = this.checkGitHooks();
    const newJsFiles = this.checkNewJavaScriptFiles();
    
    // TypeScript化率
    console.log('📊 TypeScript化進捗:');
    console.log(`  TypeScriptファイル: ${adoption.tsFiles}件`);
    console.log(`  JavaScriptファイル: ${adoption.jsFiles}件`);
    console.log(`  全体の進捗: ${adoption.adoptionRate}%`);
    
    if (adoption.adoptionRate === 100) {
      console.log('  🎉 100% TypeScript化達成!');
    } else {
      console.log(`  🎯 目標まで: ${100 - adoption.adoptionRate}%`);
    }
    console.log('');
    
    // 設定状況
    console.log('⚙️ 設定状況:');
    console.log(`  tsconfig.json: ${config.tsconfig.exists ? '✅' : '❌'} 存在 | ${config.tsconfig.strict ? '✅' : '❌'} 厳格設定`);
    console.log(`  ESLint TypeScript: ${config.eslint.typescript ? '✅' : '❌'} 設定済み`);
    console.log('');
    
    // Git Hooks
    console.log('🪝 Git Hooks:');
    Object.entries(hooks).forEach(([hook, status]) => {
      const icon = status.exists && status.executable ? '✅' : '❌';
      console.log(`  ${hook}: ${icon} ${status.exists ? '存在' : '未設定'} | ${status.executable ? '実行可能' : '実行不可'}`);
    });
    console.log('');
    
    // 警告・エラー
    if (newJsFiles.length > 0) {
      console.log('🚨 警告: 新規JavaScriptファイルが検出されました:');
      newJsFiles.forEach(file => {
        const tsEquivalent = file.replace(/\.jsx?$/, file.endsWith('.jsx') ? '.tsx' : '.ts');
        console.log(`  ❌ ${file} → 推奨: ${tsEquivalent}`);
      });
      console.log('');
    }
    
    // 推奨アクション
    console.log('💡 推奨アクション:');
    
    if (adoption.adoptionRate < 100) {
      console.log('  • 残りJavaScriptファイルのTypeScript移行');
      console.log('  • npm run ts:migrate:all の実行');
    }
    
    if (!config.tsconfig.strict) {
      console.log('  • tsconfig.jsonの厳格設定有効化');
    }
    
    if (!config.eslint.typescript) {
      console.log('  • ESLint TypeScript設定の追加');
    }
    
    const hooksToFix = Object.entries(hooks).filter(([_, status]) => !status.exists || !status.executable);
    if (hooksToFix.length > 0) {
      console.log('  • Git Hooksの設定・修正');
      console.log('  • npm run ts:setup-hooks の実行');
    }
    
    if (newJsFiles.length > 0) {
      console.log('  • 新規JavaScriptファイルをTypeScriptに変更');
      process.exit(1); // CI/CDで失敗させる
    }
    
    console.log('\n✨ TypeScript統一チェック完了!');
  }

  /**
   * 対話式セットアップ
   */
  async interactiveSetup() {
    console.log('🛠️ TypeScript統一環境セットアップ\n');
    
    // Git Hooks設定
    console.log('📝 Git Hooksを設定しています...');
    try {
      this.setupGitHooks();
      console.log('✅ Git Hooks設定完了');
    } catch (error) {
      console.log('❌ Git Hooks設定失敗:', error.message);
    }
    
    // NPMスクリプト確認
    console.log('📦 NPMスクリプトを確認しています...');
    this.checkNpmScripts();
    
    console.log('\n🎉 TypeScript統一環境のセットアップが完了しました!');
    console.log('次のコマンドでTypeScript化を開始できます:');
    console.log('  npm run ts:migrate:all');
    console.log('  npm run ts:verify');
  }

  /**
   * Git Hooksセットアップ
   */
  setupGitHooks() {
    const hooksDir = path.join(this.projectRoot, '.git', 'hooks');
    
    if (!fs.existsSync(hooksDir)) {
      throw new Error('Git repository not found');
    }
    
    // pre-commitフック
    const preCommitHook = `#!/bin/bash
# TypeScript統一 pre-commit hook

echo "🔍 TypeScript validation..."

# 新規JavaScriptファイルチェック
NEW_JS_FILES=$(git diff --cached --name-status | grep -E "^A.*\\.(js|jsx)$" || true)
if [ ! -z "$NEW_JS_FILES" ]; then
    echo "❌ ERROR: New JavaScript files detected!"
    echo "Files found:"
    echo "$NEW_JS_FILES"
    echo ""
    echo "🔧 Please use TypeScript (.ts/.tsx) instead"
    exit 1
fi

# TypeScript型チェック
if command -v npm >/dev/null 2>&1; then
    npm run typecheck
    if [ $? -ne 0 ]; then
        echo "❌ ERROR: TypeScript type checking failed"
        exit 1
    fi
fi

echo "✅ TypeScript validation passed!"
`;
    
    const preCommitPath = path.join(hooksDir, 'pre-commit');
    fs.writeFileSync(preCommitPath, preCommitHook, { mode: 0o755 });
    
    // commit-msgフック
    const commitMsgHook = `#!/bin/bash
# TypeScript統一 commit-msg hook

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# TypeScript移行コミット検出・追跡
if echo "$COMMIT_MSG" | grep -qE "(migrate|typescript|\\.ts|\\.tsx)"; then
    echo "🎯 TypeScript migration commit detected"
    node scripts/typescript-enforcement.js --quiet || true
fi
`;
    
    const commitMsgPath = path.join(hooksDir, 'commit-msg');
    fs.writeFileSync(commitMsgPath, commitMsgHook, { mode: 0o755 });
  }

  /**
   * NPMスクリプト確認
   */
  checkNpmScripts() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json not found');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'typecheck',
      'lint',
      'ts:verify'
    ];
    
    const missingScripts = requiredScripts.filter(script => !scripts[script]);
    
    if (missingScripts.length > 0) {
      console.log('⚠️ 以下のスクリプトが不足しています:');
      missingScripts.forEach(script => {
        console.log(`  • ${script}`);
      });
    } else {
      console.log('✅ 必要なNPMスクリプトが揃っています');
    }
  }
}

// CLI実行
if (require.main === module) {
  const enforcement = new TypeScriptEnforcement();
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    enforcement.interactiveSetup();
  } else if (args.includes('--check-new')) {
    const newJsFiles = enforcement.checkNewJavaScriptFiles();
    if (newJsFiles.length > 0) {
      console.log('❌ New JavaScript files detected:');
      newJsFiles.forEach(file => console.log(`  ${file}`));
      process.exit(1);
    } else {
      console.log('✅ No new JavaScript files detected');
    }
  } else {
    enforcement.generateReport();
  }
}

module.exports = TypeScriptEnforcement;