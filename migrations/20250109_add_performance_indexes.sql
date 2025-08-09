-- PMPLearningManagement Database Performance Optimization
-- Migration: 20250109_add_performance_indexes.sql
-- Purpose: High-performance indexes for 10,000+ concurrent users

BEGIN;

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =====================================================

-- Learning Progress: Most frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_user_status_knowledge 
ON learning_progress (user_id, status, knowledge_area, process_group);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_mastery_review 
ON learning_progress (mastery_level DESC, next_review_at ASC) 
WHERE status IN ('IN_PROGRESS', 'COMPLETED');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_active_users 
ON learning_progress (user_id, updated_at DESC) 
WHERE status != 'NOT_STARTED';

-- Exam Performance: High-traffic patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_user_performance 
ON exam_attempts (user_id, exam_type, percentage_score DESC, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_answers_performance_analysis 
ON exam_answers (question_id, is_correct, time_spent) 
WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE status = 'COMPLETED');

-- User Activity: Session and engagement tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_engagement 
ON users (last_active_at DESC, role, total_study_time DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_premium_features 
ON users (role, created_at) 
WHERE role IN ('PREMIUM', 'INSTRUCTOR', 'ADMIN');

-- =====================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- =====================================================

-- Active study sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_active_study 
ON learning_progress (user_id, process_id, updated_at DESC) 
WHERE status = 'IN_PROGRESS' AND last_reviewed_at > NOW() - INTERVAL '7 days';

-- Recent exam attempts for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_recent_analytics 
ON exam_attempts (exam_type, completed_at DESC, percentage_score) 
WHERE completed_at > NOW() - INTERVAL '30 days' AND status = 'COMPLETED';

-- Active discussions for community features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_active_community 
ON discussions (group_id, updated_at DESC, view_count DESC) 
WHERE is_locked = FALSE AND created_at > NOW() - INTERVAL '90 days';

-- =====================================================
-- FUNCTIONAL INDEXES FOR ADVANCED QUERIES
-- =====================================================

-- Case-insensitive user search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
ON users (LOWER(email)) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_lower 
ON users (LOWER(username)) 
WHERE username IS NOT NULL AND deleted_at IS NULL;

-- Study time aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_study_time_sum 
ON learning_progress (user_id, knowledge_area, study_time) 
WHERE study_time > 0;

-- Question difficulty analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_questions_difficulty_stats 
ON exam_questions (difficulty, correct_rate, times_answered) 
WHERE is_active = TRUE AND times_answered > 10;

-- =====================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- =====================================================

-- User dashboard queries (includes frequently accessed columns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_dashboard_covering 
ON learning_progress (user_id, knowledge_area) 
INCLUDE (status, mastery_level, completed_at, study_time);

-- Exam results summary (covers result display needs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_results_covering 
ON exam_attempts (user_id, completed_at DESC) 
INCLUDE (exam_type, percentage_score, correct_answers, time_spent);

-- Process performance metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pmbok_processes_metrics_covering 
ON pmbok_processes (knowledge_area, process_group) 
INCLUDE (complexity, importance, name);

-- =====================================================
-- SPECIALIZED INDEXES FOR ADVANCED FEATURES
-- =====================================================

-- Spaced repetition algorithm
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_spaced_repetition 
ON learning_progress (next_review_at ASC, mastery_level ASC, user_id) 
WHERE status IN ('COMPLETED', 'NEEDS_REVIEW') AND next_review_at IS NOT NULL;

-- Adaptive learning recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_adaptive_learning 
ON learning_progress (user_id, knowledge_area, mastery_level ASC, practice_count ASC);

-- Gamification: Achievement tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_leaderboard 
ON user_achievements (unlocked_at DESC) 
INCLUDE (user_id, achievement_id);

-- Social features: Study group activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_group_members_activity 
ON study_group_members (group_id, last_active_at DESC, role);

-- =====================================================
-- ANALYTICS AND REPORTING INDEXES
-- =====================================================

-- Monthly active users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_mau_analytics 
ON users (last_active_at, created_at) 
WHERE deleted_at IS NULL;

-- Learning completion rates by knowledge area
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_completion_analytics 
ON learning_progress (knowledge_area, status, completed_at) 
WHERE completed_at IS NOT NULL;

-- Exam performance trends
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_trends 
ON exam_attempts (completed_at, exam_type) 
INCLUDE (percentage_score, time_spent);

-- Question effectiveness analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_questions_effectiveness 
ON exam_questions (knowledge_area, difficulty, correct_rate, times_answered) 
WHERE is_active = TRUE;

-- =====================================================
-- PARTITIONING PREPARATION INDEXES
-- =====================================================

-- Audit logs partitioning support (by month)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_partition_ready 
ON audit_logs (created_at, action) 
WHERE created_at >= '2025-01-01';

-- Learning progress historical analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_progress_historical 
ON learning_progress (created_at, user_id, knowledge_area);

-- =====================================================
-- CONSTRAINTS AND OPTIMIZATIONS
-- =====================================================

-- Ensure data integrity with partial unique constraints
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique_active 
ON users (email) 
WHERE deleted_at IS NULL;

-- Subscription uniqueness per active user
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_active 
ON subscriptions (user_id) 
WHERE status = 'ACTIVE';

-- =====================================================
-- STATISTICS UPDATE FOR QUERY PLANNER
-- =====================================================

-- Update table statistics for optimal query planning
ANALYZE users;
ANALYZE learning_progress;
ANALYZE exam_attempts;
ANALYZE exam_answers;
ANALYZE exam_questions;
ANALYZE pmbok_processes;
ANALYZE study_groups;
ANALYZE discussions;

-- =====================================================
-- VACUUM AND MAINTENANCE
-- =====================================================

-- Optimize table storage
VACUUM ANALYZE users;
VACUUM ANALYZE learning_progress;
VACUUM ANALYZE exam_attempts;

COMMIT;

-- =====================================================
-- PERFORMANCE MONITORING QUERIES
-- =====================================================

/*
-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Check for unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

-- Monitor table bloat
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables;
*/