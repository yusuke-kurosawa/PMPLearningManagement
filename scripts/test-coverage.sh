#!/bin/bash
# PMPLearningManagementプロジェクト テストカバレッジ計測スクリプト
# 6人チーム並列実行対応版

set -e  # エラー時に停止

# 色付きログ出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# スクリプト設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COVERAGE_DIR="$PROJECT_ROOT/coverage"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results"
MIN_COVERAGE_THRESHOLD=80
PARALLEL_WORKERS=6

# ログ関数
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}🚀 $1${NC}"; }

# 使用方法表示
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --team TEAM_NAME     特定チームのテストのみ実行 (auth-security|business-logic|integration-external|performance-infra)"
    echo "  --parallel           並列実行モード（デフォルト）"
    echo "  --sequential         順次実行モード"
    echo "  --threshold N        カバレッジ閾値設定（デフォルト: 80%）"
    echo "  --report-only        テスト実行なし、レポート生成のみ"
    echo "  --html               HTMLレポート生成"
    echo "  --json               JSONレポート生成"
    echo "  --lcov               LCOVレポート生成（Codecov用）"
    echo "  --open               HTMLレポートをブラウザで開く"
    echo "  --help, -h           このヘルプを表示"
}

# 引数解析
TEAM=""
EXECUTION_MODE="parallel"
COVERAGE_THRESHOLD=$MIN_COVERAGE_THRESHOLD
REPORT_ONLY=false
GENERATE_HTML=false
GENERATE_JSON=false
GENERATE_LCOV=false
OPEN_REPORT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --team)
            TEAM="$2"
            shift 2
            ;;
        --parallel)
            EXECUTION_MODE="parallel"
            shift
            ;;
        --sequential)
            EXECUTION_MODE="sequential"
            shift
            ;;
        --threshold)
            COVERAGE_THRESHOLD="$2"
            shift 2
            ;;
        --report-only)
            REPORT_ONLY=true
            shift
            ;;
        --html)
            GENERATE_HTML=true
            shift
            ;;
        --json)
            GENERATE_JSON=true
            shift
            ;;
        --lcov)
            GENERATE_LCOV=true
            shift
            ;;
        --open)
            OPEN_REPORT=true
            GENERATE_HTML=true  # HTML生成も有効化
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            log_error "不明なオプション: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 環境確認
check_environment() {
    log_header "環境確認中..."
    
    # Node.js確認
    if ! command -v node &> /dev/null; then
        log_error "Node.jsがインストールされていません"
        exit 1
    fi
    
    local node_version=$(node --version)
    log_info "Node.js: $node_version"
    
    # npm確認
    if ! command -v npm &> /dev/null; then
        log_error "npmがインストールされていません"
        exit 1
    fi
    
    local npm_version=$(npm --version)
    log_info "npm: $npm_version"
    
    # Vitestインストール確認
    if ! npm list vitest &> /dev/null; then
        log_error "Vitestがインストールされていません"
        log_info "npm install -D vitest を実行してください"
        exit 1
    fi
    
    # データベース接続確認
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        log_warning "PostgreSQLが起動していない可能性があります"
    fi
    
    # Redis接続確認
    if ! redis-cli ping &> /dev/null; then
        log_warning "Redisが起動していない可能性があります"
    fi
    
    log_success "環境確認完了"
}

# ディレクトリ準備
prepare_directories() {
    log_header "ディレクトリ準備中..."
    
    # 既存のカバレッジデータクリア
    if [[ -d "$COVERAGE_DIR" ]]; then
        rm -rf "$COVERAGE_DIR"
        log_info "既存のカバレッジディレクトリをクリア"
    fi
    
    # 既存のテスト結果クリア
    if [[ -d "$TEST_RESULTS_DIR" ]]; then
        rm -rf "$TEST_RESULTS_DIR"
        log_info "既存のテスト結果ディレクトリをクリア"
    fi
    
    # 新規ディレクトリ作成
    mkdir -p "$COVERAGE_DIR"/{auth-security,business-logic,integration-external,performance-infra,merged,html}
    mkdir -p "$TEST_RESULTS_DIR"
    
    log_success "ディレクトリ準備完了"
}

# チーム別テスト実行
run_team_tests() {
    local team="$1"
    local worker_id="${2:-1}"
    
    log_info "チーム '$team' のテスト実行開始（ワーカー: $worker_id）"
    
    local test_patterns=""
    local output_dir="$COVERAGE_DIR/$team"
    local result_file="$TEST_RESULTS_DIR/$team-$worker_id.json"
    local db_suffix="_${team}_${worker_id}"
    
    # チーム別テストパターン設定
    case "$team" in
        "auth-security")
            test_patterns="tests/unit/auth/**/*.test.ts"
            ;;
        "business-logic")
            test_patterns="tests/unit/services/**/*.test.ts tests/unit/routers/**/*.test.ts"
            ;;
        "integration-external")
            test_patterns="tests/unit/external/**/*.test.ts tests/integration/**/*.test.ts"
            ;;
        "performance-infra")
            test_patterns="tests/performance/**/*.test.ts"
            ;;
        *)
            log_error "不明なチーム名: $team"
            return 1
            ;;
    esac
    
    # 環境変数設定
    export DATABASE_URL="postgresql://test:test@localhost:5432/pmp_test${db_suffix}?schema=public"
    export REDIS_URL="redis://localhost:6379"
    export NODE_ENV="test"
    
    if [[ "$team" == "performance-infra" ]]; then
        export NODE_OPTIONS="--expose-gc --max-old-space-size=4096"
    fi
    
    # テスト実行
    local start_time=$(date +%s)
    
    if npx vitest run $test_patterns \
        --reporter=json --outputFile="$result_file" \
        --coverage --coverage.reporter=json \
        --coverage.reportsDirectory="$output_dir" \
        --testTimeout=30000 \
        --maxWorkers=$([ "$team" = "performance-infra" ] && echo "1" || echo "2"); then
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "チーム '$team' テスト完了（${duration}秒）"
        return 0
    else
        log_error "チーム '$team' テスト失敗"
        return 1
    fi
}

# 並列テスト実行
run_parallel_tests() {
    log_header "並列テスト実行開始（$PARALLEL_WORKERS workers）"
    
    local pids=()
    local start_time=$(date +%s)
    
    # 認証・セキュリティチーム（2名）
    (run_team_tests "auth-security" "1") &
    pids+=($!)
    (run_team_tests "auth-security" "2") &
    pids+=($!)
    
    # ビジネスロジックチーム（2名）
    (run_team_tests "business-logic" "1") &
    pids+=($!)
    (run_team_tests "business-logic" "2") &
    pids+=($!)
    
    # 統合・外部APIチーム（1名）
    (run_team_tests "integration-external" "1") &
    pids+=($!)
    
    # パフォーマンス・インフラチーム（1名）
    (run_team_tests "performance-infra" "1") &
    pids+=($!)
    
    # プログレス表示
    local completed=0
    while [[ $completed -lt ${#pids[@]} ]]; do
        completed=0
        for pid in "${pids[@]}"; do
            if ! kill -0 "$pid" 2>/dev/null; then
                ((completed++))
            fi
        done
        
        log_info "進捗: $completed/${#pids[@]} チーム完了"
        sleep 2
    done
    
    # 結果収集
    local failed=0
    for pid in "${pids[@]}"; do
        if ! wait "$pid"; then
            ((failed++))
        fi
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $failed -eq 0 ]]; then
        log_success "並列テスト実行完了（${duration}秒、失敗: $failed）"
    else
        log_error "並列テスト実行完了（${duration}秒、失敗: $failed チーム）"
        return 1
    fi
}

# 順次テスト実行
run_sequential_tests() {
    log_header "順次テスト実行開始"
    
    local teams=("auth-security" "business-logic" "integration-external" "performance-infra")
    local failed=0
    local start_time=$(date +%s)
    
    for team in "${teams[@]}"; do
        if ! run_team_tests "$team"; then
            ((failed++))
        fi
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $failed -eq 0 ]]; then
        log_success "順次テスト実行完了（${duration}秒）"
    else
        log_error "順次テスト実行完了（${duration}秒、失敗: $failed チーム）"
        return 1
    fi
}

# カバレッジマージ
merge_coverage_reports() {
    log_header "カバレッジレポートマージ中..."
    
    local coverage_dirs=()
    
    # 既存のカバレッジディレクトリを検索
    for dir in "$COVERAGE_DIR"/*; do
        if [[ -d "$dir" && -f "$dir/coverage-final.json" ]]; then
            coverage_dirs+=("$dir")
        fi
    done
    
    if [[ ${#coverage_dirs[@]} -eq 0 ]]; then
        log_error "マージ対象のカバレッジデータが見つかりません"
        return 1
    fi
    
    log_info "マージ対象: ${#coverage_dirs[@]} ディレクトリ"
    
    # NYC/C8を使用してマージ
    if npx c8 merge "${coverage_dirs[@]}" --out "$COVERAGE_DIR/merged"; then
        log_success "カバレッジレポートマージ完了"
    else
        log_error "カバレッジレポートマージ失敗"
        return 1
    fi
}

# レポート生成
generate_reports() {
    log_header "レポート生成中..."
    
    local merged_dir="$COVERAGE_DIR/merged"
    
    if [[ ! -d "$merged_dir" ]]; then
        log_error "マージされたカバレッジデータが見つかりません"
        return 1
    fi
    
    # JSON サマリーレポート生成（必須）
    if npx c8 report --reporter=json-summary --reports-dir="$merged_dir" --out-dir="$COVERAGE_DIR"; then
        log_success "JSON サマリーレポート生成完了"
    else
        log_error "JSON サマリーレポート生成失敗"
        return 1
    fi
    
    # HTML レポート生成
    if [[ "$GENERATE_HTML" == true ]]; then
        if npx c8 report --reporter=html --reports-dir="$merged_dir" --out-dir="$COVERAGE_DIR/html"; then
            log_success "HTML レポート生成完了: $COVERAGE_DIR/html/index.html"
        else
            log_warning "HTML レポート生成失敗"
        fi
    fi
    
    # JSON 詳細レポート生成
    if [[ "$GENERATE_JSON" == true ]]; then
        if npx c8 report --reporter=json --reports-dir="$merged_dir" --out-dir="$COVERAGE_DIR"; then
            log_success "JSON 詳細レポート生成完了"
        else
            log_warning "JSON 詳細レポート生成失敗"
        fi
    fi
    
    # LCOV レポート生成
    if [[ "$GENERATE_LCOV" == true ]]; then
        if npx c8 report --reporter=lcov --reports-dir="$merged_dir" --out-dir="$COVERAGE_DIR"; then
            log_success "LCOV レポート生成完了"
        else
            log_warning "LCOV レポート生成失敗"
        fi
    fi
}

# カバレッジ統計表示
show_coverage_stats() {
    log_header "カバレッジ統計"
    
    local summary_file="$COVERAGE_DIR/coverage-summary.json"
    
    if [[ ! -f "$summary_file" ]]; then
        log_error "カバレッジサマリーファイルが見つかりません"
        return 1
    fi
    
    # jqを使用してカバレッジ統計を解析
    if command -v jq &> /dev/null; then
        local lines_pct=$(jq -r '.total.lines.pct' "$summary_file")
        local branches_pct=$(jq -r '.total.branches.pct' "$summary_file")
        local functions_pct=$(jq -r '.total.functions.pct' "$summary_file")
        local statements_pct=$(jq -r '.total.statements.pct' "$summary_file")
        
        echo ""
        echo "📊 総合カバレッジ統計:"
        echo "  Lines:      ${lines_pct}%"
        echo "  Branches:   ${branches_pct}%"
        echo "  Functions:  ${functions_pct}%"
        echo "  Statements: ${statements_pct}%"
        echo ""
        
        # 閾値チェック
        local lines_ok=$(echo "$lines_pct >= $COVERAGE_THRESHOLD" | bc -l)
        local overall_status=""
        
        if [[ "$lines_ok" -eq 1 ]]; then
            overall_status="${GREEN}✅ 合格${NC}"
            log_success "カバレッジ閾値 ${COVERAGE_THRESHOLD}% を満たしています"
        else
            overall_status="${RED}❌ 不合格${NC}"
            log_error "カバレッジ ${lines_pct}% が閾値 ${COVERAGE_THRESHOLD}% を下回っています"
            return 1
        fi
        
        echo -e "🎯 品質ゲート: $overall_status (閾値: ${COVERAGE_THRESHOLD}%)"
        echo ""
        
    else
        log_warning "jqがインストールされていないため、詳細統計を表示できません"
        log_info "統計ファイル: $summary_file"
    fi
}

# テスト結果統計
show_test_stats() {
    log_header "テスト結果統計"
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local skipped_tests=0
    
    # JSON結果ファイルを解析
    for result_file in "$TEST_RESULTS_DIR"/*.json; do
        if [[ -f "$result_file" ]] && command -v jq &> /dev/null; then
            local file_total=$(jq -r '.numTotalTests // 0' "$result_file")
            local file_passed=$(jq -r '.numPassedTests // 0' "$result_file")
            local file_failed=$(jq -r '.numFailedTests // 0' "$result_file")
            local file_skipped=$(jq -r '.numSkippedTests // 0' "$result_file")
            
            total_tests=$((total_tests + file_total))
            passed_tests=$((passed_tests + file_passed))
            failed_tests=$((failed_tests + file_failed))
            skipped_tests=$((skipped_tests + file_skipped))
        fi
    done
    
    if [[ $total_tests -gt 0 ]]; then
        local pass_rate=$(echo "scale=2; $passed_tests * 100 / $total_tests" | bc -l)
        
        echo ""
        echo "🧪 テスト実行統計:"
        echo "  総テスト数:   $total_tests"
        echo "  成功:        $passed_tests"
        echo "  失敗:        $failed_tests"
        echo "  スキップ:    $skipped_tests"
        echo "  成功率:      ${pass_rate}%"
        echo ""
        
        if [[ $failed_tests -eq 0 ]]; then
            log_success "すべてのテストが成功しました"
        else
            log_error "$failed_tests 件のテストが失敗しました"
        fi
    else
        log_warning "テスト結果データが見つかりません"
    fi
}

# HTMLレポートを開く
open_html_report() {
    local html_file="$COVERAGE_DIR/html/index.html"
    
    if [[ -f "$html_file" ]]; then
        log_info "HTMLレポートを開いています..."
        
        if command -v xdg-open &> /dev/null; then
            xdg-open "$html_file"
        elif command -v open &> /dev/null; then
            open "$html_file"
        elif command -v start &> /dev/null; then
            start "$html_file"
        else
            log_warning "HTMLレポートを自動で開けません"
            log_info "手動で開いてください: $html_file"
        fi
    else
        log_error "HTMLレポートファイルが見つかりません: $html_file"
    fi
}

# メイン処理
main() {
    cd "$PROJECT_ROOT"
    
    log_header "PMP Learning Management テストカバレッジ計測"
    log_info "実行モード: $EXECUTION_MODE"
    log_info "カバレッジ閾値: ${COVERAGE_THRESHOLD}%"
    
    if [[ -n "$TEAM" ]]; then
        log_info "対象チーム: $TEAM"
    fi
    
    # 環境確認
    check_environment
    
    if [[ "$REPORT_ONLY" == false ]]; then
        # ディレクトリ準備
        prepare_directories
        
        # テスト実行
        if [[ -n "$TEAM" ]]; then
            # 特定チームのみ実行
            if ! run_team_tests "$TEAM"; then
                log_error "チーム '$TEAM' のテスト実行に失敗しました"
                exit 1
            fi
        elif [[ "$EXECUTION_MODE" == "parallel" ]]; then
            # 並列実行
            if ! run_parallel_tests; then
                log_error "並列テスト実行に失敗しました"
                exit 1
            fi
        else
            # 順次実行
            if ! run_sequential_tests; then
                log_error "順次テスト実行に失敗しました"
                exit 1
            fi
        fi
        
        # カバレッジマージ
        if ! merge_coverage_reports; then
            log_error "カバレッジマージに失敗しました"
            exit 1
        fi
    fi
    
    # レポート生成
    if ! generate_reports; then
        log_error "レポート生成に失敗しました"
        exit 1
    fi
    
    # 統計表示
    show_coverage_stats
    show_test_stats
    
    # HTMLレポートを開く
    if [[ "$OPEN_REPORT" == true ]]; then
        open_html_report
    fi
    
    log_success "テストカバレッジ計測完了"
}

# スクリプト実行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi