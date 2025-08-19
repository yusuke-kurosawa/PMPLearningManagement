-- ==================================================
-- PMP学習管理システム - Supabaseテーブル設計
-- ==================================================
-- 学習進捗、フラッシュカード進捗、模擬試験結果等の管理
-- Row Level Security (RLS) 対応
-- ==================================================

-- プロファイル拡張テーブル
-- ユーザーの基本情報とメタデータを管理
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    preferences JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    timezone TEXT DEFAULT 'Asia/Tokyo',
    language TEXT DEFAULT 'ja',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- プロセス進捗テーブル
-- 個別PMBOKプロセスの学習進捗を管理
CREATE TABLE IF NOT EXISTS process_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    process_id TEXT NOT NULL, -- PMBOKプロセスID (p1, p2, p3, ...)
    process_name TEXT NOT NULL,
    knowledge_area TEXT NOT NULL, -- integration, scope, schedule, etc.
    process_group TEXT NOT NULL, -- initiating, planning, executing, etc.
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    understanding INTEGER DEFAULT 0 CHECK (understanding >= 0 AND understanding <= 100),
    notes TEXT DEFAULT '',
    last_studied TIMESTAMPTZ,
    study_count INTEGER DEFAULT 0,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    time_spent_minutes INTEGER DEFAULT 0,
    mastery_level TEXT DEFAULT 'beginner' CHECK (mastery_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- ユニーク制約: ユーザーごとにプロセスIDは一意
    UNIQUE(user_id, process_id)
);

-- 学習セッションテーブル
-- 学習セッションの記録を管理
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    process_count INTEGER DEFAULT 0,
    session_type TEXT DEFAULT 'reading' CHECK (session_type IN ('reading', 'practice', 'review', 'exam')),
    focus_area TEXT, -- 対象知識エリア
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5), -- セッション品質評価
    goals_achieved TEXT[], -- 達成した目標リスト
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- フラッシュカード学習セッションテーブル
-- フラッシュカード学習の記録を管理
CREATE TABLE IF NOT EXISTS flashcard_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_cards INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    session_type TEXT DEFAULT 'itto' CHECK (session_type IN ('itto', 'general', 'custom')),
    target_area TEXT, -- 対象知識エリア
    accuracy_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_cards > 0 THEN (correct_answers::DECIMAL / total_cards::DECIMAL) * 100
            ELSE 0
        END
    ) STORED,
    difficulty_level TEXT DEFAULT 'mixed' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'mixed')),
    cards_reviewed JSONB DEFAULT '[]', -- 復習したカードの詳細
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 模擬試験結果テーブル
-- 模擬試験の受験結果を管理
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    exam_type TEXT DEFAULT 'full' CHECK (exam_type IN ('full', 'domain', 'quick')),
    total_score INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    domain_scores JSONB DEFAULT '{}', -- 分野別スコア
    question_details JSONB DEFAULT '[]', -- 問題別詳細結果
    weak_areas TEXT[], -- 弱点エリア
    strong_areas TEXT[], -- 強みエリア
    improvement_suggestions TEXT[],
    percentile_rank INTEGER, -- 全受験者中の順位（パーセンタイル）
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 学習目標テーブル
-- ユーザーの学習目標設定と進捗を管理
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT DEFAULT 'general' CHECK (goal_type IN ('general', 'exam_prep', 'knowledge_area', 'time_based')),
    target_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    target_knowledge_areas TEXT[], -- 対象知識エリア
    target_metrics JSONB DEFAULT '{}', -- 目標指標（学習時間、完了プロセス数等）
    actual_metrics JSONB DEFAULT '{}', -- 実際の指標
    milestones JSONB DEFAULT '[]', -- マイルストーン
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 学習データ統合ビュー
-- 各種学習データを統合した分析用ビュー
CREATE VIEW user_learning_summary AS
SELECT 
    u.id as user_id,
    u.email,
    up.full_name,
    up.role,
    up.subscription_tier,
    
    -- プロセス進捗統計
    COALESCE(pp_stats.total_processes, 0) as total_processes,
    COALESCE(pp_stats.completed_processes, 0) as completed_processes,
    COALESCE(pp_stats.avg_understanding, 0) as avg_understanding,
    COALESCE(pp_stats.total_study_time, 0) as total_process_study_time,
    
    -- 学習セッション統計
    COALESCE(ss_stats.total_sessions, 0) as total_study_sessions,
    COALESCE(ss_stats.total_session_time, 0) as total_session_time,
    COALESCE(ss_stats.avg_session_duration, 0) as avg_session_duration,
    
    -- フラッシュカード統計
    COALESCE(fc_stats.total_flashcard_sessions, 0) as total_flashcard_sessions,
    COALESCE(fc_stats.avg_accuracy, 0) as avg_flashcard_accuracy,
    COALESCE(fc_stats.total_cards_reviewed, 0) as total_cards_reviewed,
    
    -- 模擬試験統計
    COALESCE(er_stats.total_exams, 0) as total_exams,
    COALESCE(er_stats.avg_score, 0) as avg_exam_score,
    COALESCE(er_stats.highest_score, 0) as highest_exam_score,
    COALESCE(er_stats.pass_count, 0) as exam_pass_count,
    
    -- 目標統計
    COALESCE(lg_stats.total_goals, 0) as total_goals,
    COALESCE(lg_stats.completed_goals, 0) as completed_goals,
    COALESCE(lg_stats.active_goals, 0) as active_goals,
    
    -- 最新活動日時
    GREATEST(
        COALESCE(pp_stats.last_activity, '1970-01-01'::timestamptz),
        COALESCE(ss_stats.last_activity, '1970-01-01'::timestamptz),
        COALESCE(fc_stats.last_activity, '1970-01-01'::timestamptz),
        COALESCE(er_stats.last_activity, '1970-01-01'::timestamptz)
    ) as last_activity

FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_processes,
        COUNT(*) FILTER (WHERE completed = true) as completed_processes,
        AVG(understanding) as avg_understanding,
        SUM(time_spent_minutes) as total_study_time,
        MAX(updated_at) as last_activity
    FROM process_progress
    GROUP BY user_id
) pp_stats ON u.id = pp_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_session_time,
        AVG(duration_minutes) as avg_session_duration,
        MAX(session_date) as last_activity
    FROM study_sessions
    GROUP BY user_id
) ss_stats ON u.id = ss_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_flashcard_sessions,
        AVG(accuracy_rate) as avg_accuracy,
        SUM(total_cards) as total_cards_reviewed,
        MAX(session_timestamp) as last_activity
    FROM flashcard_sessions
    GROUP BY user_id
) fc_stats ON u.id = fc_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_exams,
        AVG(total_score) as avg_score,
        MAX(total_score) as highest_score,
        COUNT(*) FILTER (WHERE passed = true) as pass_count,
        MAX(exam_timestamp) as last_activity
    FROM exam_results
    GROUP BY user_id
) er_stats ON u.id = er_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_goals,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
        COUNT(*) FILTER (WHERE status = 'active') as active_goals
    FROM learning_goals
    GROUP BY user_id
) lg_stats ON u.id = lg_stats.user_id;

-- ==================================================
-- インデックス作成
-- ==================================================

-- パフォーマンス最適化のためのインデックス
CREATE INDEX IF NOT EXISTS idx_process_progress_user_id ON process_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_process_progress_knowledge_area ON process_progress(knowledge_area);
CREATE INDEX IF NOT EXISTS idx_process_progress_process_group ON process_progress(process_group);
CREATE INDEX IF NOT EXISTS idx_process_progress_completed ON process_progress(completed);
CREATE INDEX IF NOT EXISTS idx_process_progress_last_studied ON process_progress(last_studied);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_type ON study_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_user_id ON flashcard_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_timestamp ON flashcard_sessions(session_timestamp);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_type ON flashcard_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_timestamp ON exam_results(exam_timestamp);
CREATE INDEX IF NOT EXISTS idx_exam_results_type ON exam_results(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_results_passed ON exam_results(passed);

CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON learning_goals(status);
CREATE INDEX IF NOT EXISTS idx_learning_goals_target_date ON learning_goals(target_date);

-- ==================================================
-- Row Level Security (RLS) ポリシー
-- ==================================================

-- user_profiles テーブルのRLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザープロファイル: 自分のデータのみ参照・更新可能
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- process_progress テーブルのRLS
ALTER TABLE process_progress ENABLE ROW LEVEL SECURITY;

-- プロセス進捗: 自分のデータのみアクセス可能
CREATE POLICY "Users can view own process progress" ON process_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own process progress" ON process_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own process progress" ON process_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own process progress" ON process_progress
    FOR DELETE USING (auth.uid() = user_id);

-- study_sessions テーブルのRLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- 学習セッション: 自分のデータのみアクセス可能
CREATE POLICY "Users can view own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions" ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- flashcard_sessions テーブルのRLS
ALTER TABLE flashcard_sessions ENABLE ROW LEVEL SECURITY;

-- フラッシュカードセッション: 自分のデータのみアクセス可能
CREATE POLICY "Users can view own flashcard sessions" ON flashcard_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard sessions" ON flashcard_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard sessions" ON flashcard_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcard sessions" ON flashcard_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- exam_results テーブルのRLS
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- 模擬試験結果: 自分のデータのみアクセス可能
CREATE POLICY "Users can view own exam results" ON exam_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results" ON exam_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam results" ON exam_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam results" ON exam_results
    FOR DELETE USING (auth.uid() = user_id);

-- learning_goals テーブルのRLS
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- 学習目標: 自分のデータのみアクセス可能
CREATE POLICY "Users can view own learning goals" ON learning_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning goals" ON learning_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning goals" ON learning_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning goals" ON learning_goals
    FOR DELETE USING (auth.uid() = user_id);

-- ==================================================
-- 管理者権限ポリシー（必要に応じて）
-- ==================================================

-- 管理者は全ユーザーのデータを参照可能（分析・サポート用）
-- 注意: 本番環境では慎重に適用すること

-- 管理者権限確認関数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            (raw_user_meta_data->>'role')::TEXT = 'admin', 
            false
        )
        FROM auth.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者用の追加ポリシー例（必要に応じてコメントアウト解除）
/*
CREATE POLICY "Admins can view all process progress" ON process_progress
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all study sessions" ON study_sessions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all flashcard sessions" ON flashcard_sessions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all exam results" ON exam_results
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all learning goals" ON learning_goals
    FOR SELECT USING (is_admin());
*/

-- ==================================================
-- トリガー関数
-- ==================================================

-- updated_at フィールドの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at トリガーの作成
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_progress_updated_at
    BEFORE UPDATE ON process_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at
    BEFORE UPDATE ON learning_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 初期データ挿入
-- ==================================================

-- 新規ユーザー登録時のプロファイル自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================================================
-- データ整合性チェック関数
-- ==================================================

-- プロセス進捗の整合性チェック
CREATE OR REPLACE FUNCTION validate_process_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- 理解度が100%で完了フラグがfalseの場合は自動で完了にする
    IF NEW.understanding = 100 AND NEW.completed = FALSE THEN
        NEW.completed = TRUE;
    END IF;
    
    -- 完了フラグがtrueで理解度が0の場合は理解度を50に設定
    IF NEW.completed = TRUE AND NEW.understanding = 0 THEN
        NEW.understanding = 50;
    END IF;
    
    -- 学習回数の整合性チェック
    IF NEW.study_count < 0 THEN
        NEW.study_count = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_process_progress_trigger
    BEFORE INSERT OR UPDATE ON process_progress
    FOR EACH ROW
    EXECUTE FUNCTION validate_process_progress();

-- ==================================================
-- 分析用関数
-- ==================================================

-- ユーザーの学習統計を取得する関数
CREATE OR REPLACE FUNCTION get_user_learning_stats(target_user_id UUID)
RETURNS TABLE (
    total_processes INTEGER,
    completed_processes INTEGER,
    completion_rate DECIMAL,
    total_study_time INTEGER,
    avg_understanding DECIMAL,
    study_streak INTEGER,
    last_activity_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_processes,
        COUNT(*) FILTER (WHERE completed = true)::INTEGER as completed_processes,
        ROUND((COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) as completion_rate,
        COALESCE(SUM(time_spent_minutes), 0)::INTEGER as total_study_time,
        ROUND(AVG(understanding), 2) as avg_understanding,
        COALESCE(calculate_study_streak(target_user_id), 0)::INTEGER as study_streak,
        (SELECT MAX(session_date)::DATE FROM study_sessions WHERE user_id = target_user_id) as last_activity_date
    FROM process_progress 
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 学習ストリーク計算関数
CREATE OR REPLACE FUNCTION calculate_study_streak(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    check_date DATE;
BEGIN
    check_date := CURRENT_DATE;
    
    -- 連続学習日数を計算
    LOOP
        IF EXISTS (
            SELECT 1 FROM study_sessions 
            WHERE user_id = target_user_id 
            AND session_date::DATE = check_date
        ) THEN
            streak := streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- コメント追加
-- ==================================================

COMMENT ON TABLE user_profiles IS 'ユーザープロファイル拡張情報';
COMMENT ON TABLE process_progress IS 'PMBOKプロセス別学習進捗';
COMMENT ON TABLE study_sessions IS '学習セッション記録';
COMMENT ON TABLE flashcard_sessions IS 'フラッシュカード学習セッション';
COMMENT ON TABLE exam_results IS '模擬試験結果';
COMMENT ON TABLE learning_goals IS '学習目標設定';

COMMENT ON VIEW user_learning_summary IS 'ユーザー学習データ統合ビュー（分析用）';

COMMENT ON FUNCTION get_user_learning_stats IS 'ユーザーの包括的な学習統計を取得';
COMMENT ON FUNCTION calculate_study_streak IS '連続学習日数を計算';
COMMENT ON FUNCTION is_admin IS '管理者権限チェック';