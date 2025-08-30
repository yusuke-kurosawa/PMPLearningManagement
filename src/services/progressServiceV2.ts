/**
 * 学習進捗管理サービス V2 - Supabase統合版
 * @description Supabaseデータベースとの統合による永続化と同期機能を提供
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-17
 */

import { supabase, authHelpers } from '../lib/auth/supabase'
import { logger } from './logger'

// 既存の型定義をインポート
import {
  ProcessCategory,
  ProcessGroup,
  ProcessProgress,
  FlashCardSession,
  ExamResult,
  StudySession,
  LearningGoal,
  ProgressData,
  processCategories,
  processGroups,
} from './progressService'

// ========================================
// Supabase Database 型定義
// ========================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'instructor' | 'admin'
          preferences: Record<string, any>
          subscription_tier: 'free' | 'premium' | 'enterprise'
          timezone: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          preferences?: Record<string, any>
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          timezone?: string
          language?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          preferences?: Record<string, any>
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          timezone?: string
          language?: string
        }
      }
      process_progress: {
        Row: {
          id: string
          user_id: string
          process_id: string
          process_name: string
          knowledge_area: string
          process_group: string
          completed: boolean
          understanding: number
          notes: string
          last_studied: string | null
          study_count: number
          difficulty: number
          time_spent_minutes: number
          mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          process_id: string
          process_name: string
          knowledge_area: string
          process_group: string
          completed?: boolean
          understanding?: number
          notes?: string
          last_studied?: string | null
          study_count?: number
          difficulty?: number
          time_spent_minutes?: number
          mastery_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        }
        Update: {
          process_name?: string
          knowledge_area?: string
          process_group?: string
          completed?: boolean
          understanding?: number
          notes?: string
          last_studied?: string | null
          study_count?: number
          difficulty?: number
          time_spent_minutes?: number
          mastery_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          session_date: string
          duration_minutes: number
          process_count: number
          session_type: 'reading' | 'practice' | 'review' | 'exam'
          focus_area: string | null
          quality_score: number | null
          goals_achieved: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          session_date?: string
          duration_minutes: number
          process_count?: number
          session_type?: 'reading' | 'practice' | 'review' | 'exam'
          focus_area?: string | null
          quality_score?: number | null
          goals_achieved?: string[]
          notes?: string | null
        }
        Update: {
          duration_minutes?: number
          process_count?: number
          session_type?: 'reading' | 'practice' | 'review' | 'exam'
          focus_area?: string | null
          quality_score?: number | null
          goals_achieved?: string[]
          notes?: string | null
        }
      }
      flashcard_sessions: {
        Row: {
          id: string
          user_id: string
          session_timestamp: string
          total_cards: number
          correct_answers: number
          duration_minutes: number
          session_type: 'itto' | 'general' | 'custom'
          target_area: string | null
          accuracy_rate: number
          difficulty_level: 'easy' | 'medium' | 'hard' | 'mixed'
          cards_reviewed: Record<string, any>[]
          created_at: string
        }
        Insert: {
          user_id: string
          session_timestamp?: string
          total_cards: number
          correct_answers: number
          duration_minutes: number
          session_type?: 'itto' | 'general' | 'custom'
          target_area?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | 'mixed'
          cards_reviewed?: Record<string, any>[]
        }
        Update: {
          total_cards?: number
          correct_answers?: number
          duration_minutes?: number
          session_type?: 'itto' | 'general' | 'custom'
          target_area?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | 'mixed'
          cards_reviewed?: Record<string, any>[]
        }
      }
      exam_results: {
        Row: {
          id: string
          user_id: string
          exam_timestamp: string
          exam_type: 'full' | 'domain' | 'quick'
          total_score: number
          correct_answers: number
          total_questions: number
          time_spent_minutes: number
          passed: boolean
          domain_scores: Record<string, any>
          question_details: Record<string, any>[]
          weak_areas: string[]
          strong_areas: string[]
          improvement_suggestions: string[]
          percentile_rank: number | null
          created_at: string
        }
        Insert: {
          user_id: string
          exam_timestamp?: string
          exam_type?: 'full' | 'domain' | 'quick'
          total_score: number
          correct_answers: number
          total_questions: number
          time_spent_minutes: number
          passed: boolean
          domain_scores?: Record<string, any>
          question_details?: Record<string, any>[]
          weak_areas?: string[]
          strong_areas?: string[]
          improvement_suggestions?: string[]
          percentile_rank?: number | null
        }
        Update: {
          exam_type?: 'full' | 'domain' | 'quick'
          total_score?: number
          correct_answers?: number
          total_questions?: number
          time_spent_minutes?: number
          passed?: boolean
          domain_scores?: Record<string, any>
          question_details?: Record<string, any>[]
          weak_areas?: string[]
          strong_areas?: string[]
          improvement_suggestions?: string[]
          percentile_rank?: number | null
        }
      }
      learning_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          goal_type: 'general' | 'exam_prep' | 'knowledge_area' | 'time_based'
          target_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          progress_percentage: number
          target_knowledge_areas: string[]
          target_metrics: Record<string, any>
          actual_metrics: Record<string, any>
          milestones: Record<string, any>[]
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          goal_type?: 'general' | 'exam_prep' | 'knowledge_area' | 'time_based'
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          progress_percentage?: number
          target_knowledge_areas?: string[]
          target_metrics?: Record<string, any>
          actual_metrics?: Record<string, any>
          milestones?: Record<string, any>[]
          completed_at?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          goal_type?: 'general' | 'exam_prep' | 'knowledge_area' | 'time_based'
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          progress_percentage?: number
          target_knowledge_areas?: string[]
          target_metrics?: Record<string, any>
          actual_metrics?: Record<string, any>
          milestones?: Record<string, any>[]
          completed_at?: string | null
        }
      }
    }
    Views: {
      user_learning_summary: {
        Row: {
          user_id: string
          email: string
          full_name: string | null
          role: string
          subscription_tier: string
          total_processes: number
          completed_processes: number
          avg_understanding: number
          total_process_study_time: number
          total_study_sessions: number
          total_session_time: number
          avg_session_duration: number
          total_flashcard_sessions: number
          avg_flashcard_accuracy: number
          total_cards_reviewed: number
          total_exams: number
          avg_exam_score: number
          highest_exam_score: number
          exam_pass_count: number
          total_goals: number
          completed_goals: number
          active_goals: number
          last_activity: string
        }
      }
    }
    Functions: {
      get_user_learning_stats: {
        Args: { target_user_id: string }
        Returns: {
          total_processes: number
          completed_processes: number
          completion_rate: number
          total_study_time: number
          avg_understanding: number
          study_streak: number
          last_activity_date: string
        }[]
      }
    }
  }
}

// ========================================
// エラー型定義
// ========================================

export interface SupabaseProgressError {
  code: string
  message: string
  details?: unknown
  hint?: string
}

export interface ProgressServiceResult<T> {
  data: T | null
  error: SupabaseProgressError | null
  isOnline: boolean
}

// ========================================
// オフライン対応型定義
// ========================================

export interface OfflineOperation {
  id: string
  type: 'insert' | 'update' | 'delete'
  table: string
  data: unknown
  timestamp: number
  retry_count: number
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingOperations: number
  hasConflicts: boolean
}

// ========================================
// 進捗サービス V2 クラス
// ========================================

export class ProgressServiceV2 {
  private static instance: ProgressServiceV2
  private offlineQueue: OfflineOperation[] = []
  private syncInProgress = false
  private maxRetries = 3
  private retryDelay = 1000

  // シングルトンパターン
  public static getInstance(): ProgressServiceV2 {
    if (!ProgressServiceV2.instance) {
      ProgressServiceV2.instance = new ProgressServiceV2()
    }
    return ProgressServiceV2.instance
  }

  // ========================================
  // ユーザープロファイル管理
  // ========================================

  /**
   * ユーザープロファイルを取得
   */
  async getUserProfile(
    userId?: string
  ): Promise<ProgressServiceResult<Database['public']['Tables']['user_profiles']['Row']>> {
    try {
      const targetUserId = userId || (await authHelpers.getCurrentUser())?.id
      if (!targetUserId) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        logger.error('ユーザープロファイル取得エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('ユーザープロファイル取得例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: 'プロファイル取得中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  /**
   * ユーザープロファイルを更新
   */
  async updateUserProfile(
    updates: Database['public']['Tables']['user_profiles']['Update']
  ): Promise<ProgressServiceResult<Database['public']['Tables']['user_profiles']['Row']>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      if (!navigator.onLine) {
        // オフラインの場合はキューに追加
        this.addToOfflineQueue('update', 'user_profiles', { id: user.id, ...updates })
        return {
          data: null,
          error: { code: 'OFFLINE', message: 'オフライン時の更新はキューに追加されました' },
          isOnline: false,
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logger.error('ユーザープロファイル更新エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('ユーザープロファイル更新例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: 'プロファイル更新中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // プロセス進捗管理
  // ========================================

  /**
   * プロセス進捗を取得
   */
  async getProcessProgress(
    processId?: string
  ): Promise<ProgressServiceResult<Database['public']['Tables']['process_progress']['Row'][]>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      let query = supabase
        .from('process_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (processId) {
        query = query.eq('process_id', processId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('プロセス進捗取得エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data: data || [], error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('プロセス進捗取得例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: 'プロセス進捗取得中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  /**
   * プロセス進捗を更新
   */
  async updateProcessProgress(
    processId: string,
    updates: Partial<Database['public']['Tables']['process_progress']['Update']>
  ): Promise<ProgressServiceResult<Database['public']['Tables']['process_progress']['Row']>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const updateData = {
        ...updates,
        last_studied: new Date().toISOString(),
        study_count: updates.study_count ? updates.study_count + 1 : 1,
      }

      if (!navigator.onLine) {
        // オフラインの場合はキューに追加
        this.addToOfflineQueue('update', 'process_progress', {
          user_id: user.id,
          process_id: processId,
          ...updateData,
        })
        return {
          data: null,
          error: { code: 'OFFLINE', message: 'オフライン時の更新はキューに追加されました' },
          isOnline: false,
        }
      }

      const { data, error } = await supabase
        .from('process_progress')
        .upsert({
          user_id: user.id,
          process_id: processId,
          ...updateData,
        })
        .select()
        .single()

      if (error) {
        logger.error('プロセス進捗更新エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('プロセス進捗更新例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: 'プロセス進捗更新中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // 学習セッション管理
  // ========================================

  /**
   * 学習セッションを記録
   */
  async recordStudySession(
    sessionData: Database['public']['Tables']['study_sessions']['Insert']
  ): Promise<ProgressServiceResult<Database['public']['Tables']['study_sessions']['Row']>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const session = {
        user_id: user.id,
        session_date: new Date().toISOString(),
        ...sessionData,
      }

      if (!navigator.onLine) {
        // オフラインの場合はキューに追加
        this.addToOfflineQueue('insert', 'study_sessions', session)
        return {
          data: null,
          error: { code: 'OFFLINE', message: 'オフライン時のセッションはキューに追加されました' },
          isOnline: false,
        }
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(session)
        .select()
        .single()

      if (error) {
        logger.error('学習セッション記録エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('学習セッション記録例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: '学習セッション記録中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // フラッシュカードセッション管理
  // ========================================

  /**
   * フラッシュカードセッションを記録
   */
  async recordFlashcardSession(
    sessionData: Database['public']['Tables']['flashcard_sessions']['Insert']
  ): Promise<ProgressServiceResult<Database['public']['Tables']['flashcard_sessions']['Row']>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const session = {
        user_id: user.id,
        session_timestamp: new Date().toISOString(),
        ...sessionData,
      }

      if (!navigator.onLine) {
        // オフラインの場合はキューに追加
        this.addToOfflineQueue('insert', 'flashcard_sessions', session)
        return {
          data: null,
          error: { code: 'OFFLINE', message: 'オフライン時のセッションはキューに追加されました' },
          isOnline: false,
        }
      }

      const { data, error } = await supabase
        .from('flashcard_sessions')
        .insert(session)
        .select()
        .single()

      if (error) {
        logger.error('フラッシュカードセッション記録エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('フラッシュカードセッション記録例外:', error)
      return {
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'フラッシュカードセッション記録中にエラーが発生しました',
        },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // 模擬試験結果管理
  // ========================================

  /**
   * 模擬試験結果を記録
   */
  async recordExamResult(
    examData: Database['public']['Tables']['exam_results']['Insert']
  ): Promise<ProgressServiceResult<Database['public']['Tables']['exam_results']['Row']>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const exam = {
        user_id: user.id,
        exam_timestamp: new Date().toISOString(),
        ...examData,
      }

      if (!navigator.onLine) {
        // オフラインの場合はキューに追加
        this.addToOfflineQueue('insert', 'exam_results', exam)
        return {
          data: null,
          error: { code: 'OFFLINE', message: 'オフライン時の試験結果はキューに追加されました' },
          isOnline: false,
        }
      }

      const { data, error } = await supabase.from('exam_results').insert(exam).select().single()

      if (error) {
        logger.error('模擬試験結果記録エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('模擬試験結果記録例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: '模擬試験結果記録中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // 統計・分析機能
  // ========================================

  /**
   * ユーザー学習統計を取得
   */
  async getUserLearningStats(): Promise<ProgressServiceResult<any>> {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const { data, error } = await supabase.rpc('get_user_learning_stats', {
        target_user_id: user.id,
      })

      if (error) {
        logger.error('学習統計取得エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data: data?.[0] || null, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('学習統計取得例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: '学習統計取得中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  /**
   * 学習サマリーを取得
   */
  async getLearningViewSummary(): Promise<
    ProgressServiceResult<Database['public']['Views']['user_learning_summary']['Row']>
  > {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        return {
          data: null,
          error: { code: 'NO_USER', message: 'ユーザーが認証されていません' },
          isOnline: navigator.onLine,
        }
      }

      const { data, error } = await supabase
        .from('user_learning_summary')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        logger.error('学習サマリー取得エラー:', error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
          isOnline: navigator.onLine,
        }
      }

      return { data, error: null, isOnline: navigator.onLine }
    } catch (error) {
      logger.error('学習サマリー取得例外:', error)
      return {
        data: null,
        error: { code: 'UNKNOWN_ERROR', message: '学習サマリー取得中にエラーが発生しました' },
        isOnline: navigator.onLine,
      }
    }
  }

  // ========================================
  // オフライン対応機能
  // ========================================

  /**
   * オフラインキューに操作を追加
   */
  private addToOfflineQueue(
    type: 'insert' | 'update' | 'delete',
    table: string,
    data: unknown
  ): void {
    const operation: OfflineOperation = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retry_count: 0,
    }

    this.offlineQueue.push(operation)
    localStorage.setItem('pmp_offline_queue', JSON.stringify(this.offlineQueue))

    logger.info('オフライン操作をキューに追加:', operation)
  }

  /**
   * オフラインキューを同期
   */
  async syncOfflineQueue(): Promise<{ success: number; failed: number; errors: any[] }> {
    if (this.syncInProgress || !navigator.onLine) {
      return { success: 0, failed: 0, errors: [] }
    }

    this.syncInProgress = true
    const results = { success: 0, failed: 0, errors: [] as any[] }

    try {
      // LocalStorageからキューを読み込み
      const savedQueue = localStorage.getItem('pmp_offline_queue')
      if (savedQueue) {
        this.offlineQueue = JSON.parse(savedQueue)
      }

      const operations = [...this.offlineQueue]
      this.offlineQueue = []

      for (const operation of operations) {
        try {
          await this.executeOfflineOperation(operation)
          results.success++
        } catch (error) {
          logger.error('オフライン操作実行エラー:', error)
          results.failed++
          results.errors.push({ operation, error })

          // リトライ回数チェック
          if (operation.retry_count < this.maxRetries) {
            operation.retry_count++
            this.offlineQueue.push(operation)
          }
        }
      }

      // 更新されたキューを保存
      localStorage.setItem('pmp_offline_queue', JSON.stringify(this.offlineQueue))
    } catch (error) {
      logger.error('オフライン同期エラー:', error)
    } finally {
      this.syncInProgress = false
    }

    return results
  }

  /**
   * オフライン操作を実行
   */
  private async executeOfflineOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(operation.table as any)
          .insert(operation.data)
        if (insertError) {
          throw insertError
        }
        break

      case 'update':
        const { error: updateError } = await supabase
          .from(operation.table as any)
          .update(operation.data)
          .eq('user_id', operation.data.user_id)
        if (updateError) {
          throw updateError
        }
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from(operation.table as any)
          .delete()
          .eq('id', operation.data.id)
        if (deleteError) {
          throw deleteError
        }
        break
    }
  }

  /**
   * 同期状況を取得
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress,
      lastSyncTime: parseInt(localStorage.getItem('pmp_last_sync_time') || '0') || null,
      pendingOperations: this.offlineQueue.length,
      hasConflicts: false, // 今後の実装で競合検出機能を追加
    }
  }

  /**
   * 手動同期実行
   */
  async forcSync(): Promise<void> {
    const results = await this.syncOfflineQueue()
    localStorage.setItem('pmp_last_sync_time', Date.now().toString())

    logger.info('手動同期完了:', results)
  }

  // ========================================
  // 自動同期設定
  // ========================================

  /**
   * 自動同期を開始
   */
  startAutoSync(intervalMinutes: number = 5): void {
    // ネットワーク状態変化監視
    window.addEventListener('online', () => {
      logger.info('ネットワーク復旧 - 自動同期開始')
      this.syncOfflineQueue()
    })

    // 定期同期
    setInterval(
      async () => {
        if (navigator.onLine && !this.syncInProgress) {
          await this.syncOfflineQueue()
        }
      },
      intervalMinutes * 60 * 1000
    )
  }
}

// ========================================
// エクスポート
// ========================================

// シングルトンインスタンスをエクスポート
export const progressServiceV2 = ProgressServiceV2.getInstance()

// 自動同期開始（5分間隔）
if (typeof window !== 'undefined') {
  progressServiceV2.startAutoSync(5)
}
