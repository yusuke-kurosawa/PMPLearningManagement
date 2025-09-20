/**
 * ML Integration Service
 * Connects the React frontend with the ML pipeline backend
 */

import axios from 'axios'

const ML_API_BASE_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8080'

class MLIntegrationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: ML_API_BASE_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('ml_api_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized()
        }
        return Promise.reject(error)
      }
    )
  }

  // ============ Prediction APIs ============

  /**
   * Get exam success prediction for a student
   */
  async predictExamSuccess(userId, features) {
    try {
      const response = await this.apiClient.post('/predict', {
        user_id: userId,
        model_type: 'EXAM_SUCCESS',
        features: this.prepareFeatures(features),
        return_explanation: true,
        return_confidence: true,
        return_feature_importance: true,
      })

      return {
        success: true,
        data: {
          passsProbability: response.data.probability[1],
          confidence: response.data.confidence,
          explanation: response.data.explanation,
          featureImportance: response.data.feature_importance,
          predictionInterval: response.data.prediction_interval,
        },
      }
    } catch (error) {
      console.error('Exam success prediction error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Predict exam score for a student
   */
  async predictExamScore(userId, features) {
    try {
      const response = await this.apiClient.post('/predict', {
        user_id: userId,
        model_type: 'SCORE_PREDICTOR',
        features: this.prepareFeatures(features),
        return_confidence: true,
      })

      return {
        success: true,
        data: {
          predictedScore: response.data.prediction,
          confidence: response.data.confidence,
          predictionInterval: response.data.prediction_interval,
        },
      }
    } catch (error) {
      console.error('Score prediction error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Assess dropout risk for a student
   */
  async assessDropoutRisk(userId, features) {
    try {
      const response = await this.apiClient.post('/predict', {
        user_id: userId,
        model_type: 'DROPOUT_RISK',
        features: this.prepareFeatures(features),
        return_explanation: true,
      })

      const riskLevel = response.data.metadata?.risk_levels?.[0] || 'Unknown'
      const needsIntervention = response.data.metadata?.needs_intervention?.[0] || false

      return {
        success: true,
        data: {
          riskLevel,
          dropoutProbability: response.data.probability[1],
          needsIntervention,
          explanation: response.data.explanation,
        },
      }
    } catch (error) {
      console.error('Dropout risk assessment error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get knowledge area performance predictions
   */
  async predictKnowledgeAreaPerformance(userId, features) {
    try {
      const response = await this.apiClient.post('/predict', {
        user_id: userId,
        model_type: 'KNOWLEDGE_AREA',
        features: this.prepareFeatures(features),
      })

      return {
        success: true,
        data: response.data.prediction,
      }
    } catch (error) {
      console.error('Knowledge area prediction error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get learning path recommendations
   */
  async getLearningPathRecommendations(userId, currentState) {
    try {
      const response = await this.apiClient.post('/predict', {
        user_id: userId,
        model_type: 'LEARNING_PATH',
        features: currentState,
      })

      return {
        success: true,
        data: {
          recommendedAction: response.data.prediction,
          topRecommendations: response.data.metadata?.top_k_recommendations || [],
          qValues: response.data.metadata?.q_values || [],
        },
      }
    } catch (error) {
      console.error('Learning path recommendation error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Batch predictions for multiple students
   */
  async batchPredict(requests, asyncProcessing = false) {
    try {
      const response = await this.apiClient.post('/predict/batch', {
        requests: requests.map((req) => ({
          user_id: req.userId,
          model_type: req.modelType,
          features: this.prepareFeatures(req.features),
        })),
        async_processing: asyncProcessing,
      })

      if (asyncProcessing) {
        return {
          success: true,
          data: {
            batchId: response.data.batch_id,
            status: response.data.status,
          },
        }
      }

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Batch prediction error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // ============ Feature Extraction ============

  /**
   * Extract features from user learning data
   */
  extractFeaturesFromUserData(userData) {
    const features = {}

    // Behavioral features
    features.study_hours_per_week = userData.weeklyStudyHours || 0
    features.avg_session_duration = userData.avgSessionDuration || 0
    features.study_time_consistency = userData.studyConsistency || 0
    features.preferred_study_time = userData.preferredStudyHour || 12
    features.study_break_frequency = userData.breakFrequency || 0
    features.content_revisit_rate = userData.contentRevisitRate || 0

    // Performance features
    features.current_score = userData.currentScore || 0
    features.avg_score = userData.averageScore || 0
    features.quiz_accuracy = userData.quizAccuracy || 0
    features.mock_exam_scores = userData.mockExamScore || 0
    features.weak_areas_count = userData.weakAreasCount || 0
    features.consecutive_correct_answers = userData.correctStreak || 0

    // Engagement features
    features.login_frequency = userData.loginFrequency || 0
    features.content_completion_rate = userData.completionRate || 0
    features.video_watch_percentage = userData.videoWatchPercentage || 0
    features.forum_participation = userData.forumPosts || 0
    features.resource_download_count = userData.downloadsCount || 0

    // Temporal features
    features.days_since_enrollment = userData.daysSinceEnrollment || 0
    features.study_streak_days = userData.studyStreak || 0
    features.days_to_exam = userData.daysToExam || 30
    features.learning_velocity = userData.learningSpeed || 0

    // Content features
    features.content_difficulty_preference = userData.preferredDifficulty || 0.5
    features.video_preference = userData.videoPreference || 0.5
    features.reading_speed_wpm = userData.readingSpeed || 200

    // Social features
    features.study_group_member = userData.inStudyGroup ? 1 : 0
    features.peer_interaction_frequency = userData.peerInteractions || 0
    features.mentorship_active = userData.hasMentor ? 1 : 0

    // Knowledge area scores
    const knowledgeAreas = [
      'integration',
      'scope',
      'schedule',
      'cost',
      'quality',
      'resource',
      'communications',
      'risk',
      'procurement',
      'stakeholder',
    ]

    knowledgeAreas.forEach((area) => {
      features[`${area}_score`] = userData.knowledgeAreaScores?.[area] || 0
    })

    // Process group scores
    const processGroups = [
      'initiating',
      'planning',
      'executing',
      'monitoring_controlling',
      'closing',
    ]

    processGroups.forEach((group) => {
      features[`${group}_score`] = userData.processGroupScores?.[group] || 0
    })

    return features
  }

  /**
   * Prepare features for API call
   */
  prepareFeatures(features) {
    // Ensure all features are properly formatted
    const prepared = {}

    Object.keys(features).forEach((key) => {
      const value = features[key]

      // Convert undefined/null to 0
      if (value === undefined || value === null) {
        prepared[key] = 0
      }
      // Ensure numbers are numbers
      else if (typeof value === 'string' && !isNaN(value)) {
        prepared[key] = parseFloat(value)
      }
      // Keep as is
      else {
        prepared[key] = value
      }
    })

    return prepared
  }

  // ============ Model Management ============

  /**
   * Get information about loaded models
   */
  async getModelInfo() {
    try {
      const response = await this.apiClient.get('/models')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get model info error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Reload a specific model
   */
  async reloadModel(modelType) {
    try {
      const response = await this.apiClient.post(`/models/${modelType}/reload`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Model reload error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get model metrics
   */
  async getModelMetrics() {
    try {
      const response = await this.apiClient.get('/metrics')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Get metrics error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // ============ Real-time Updates ============

  /**
   * Subscribe to real-time predictions
   */
  subscribeToPredictions(userId, callback) {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://localhost:8081/subscribe/${userId}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.close()
  }

  // ============ Analytics ============

  /**
   * Get aggregated analytics data
   */
  async getAnalytics(timeRange = '7d') {
    try {
      // This would typically call a separate analytics endpoint
      // For now, returning mock data structure
      return {
        success: true,
        data: {
          totalPredictions: 15234,
          avgLatency: 23,
          cacheHitRate: 0.67,
          modelPerformance: {
            examSuccess: { accuracy: 0.89, trend: 'up' },
            scorePredictor: { rmse: 8.2, trend: 'stable' },
            dropoutRisk: { precision: 0.78, trend: 'up' },
          },
        },
      }
    } catch (error) {
      console.error('Get analytics error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // ============ Utility Methods ============

  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    // Clear token and redirect to login
    localStorage.removeItem('ml_api_token')
    window.location.href = '/auth/login'
  }

  /**
   * Set API token
   */
  setApiToken(token) {
    localStorage.setItem('ml_api_token', token)
  }

  /**
   * Clear API token
   */
  clearApiToken() {
    localStorage.removeItem('ml_api_token')
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await this.apiClient.get('/health')
      return {
        success: true,
        healthy: response.data.status === 'healthy',
      }
    } catch (error) {
      return {
        success: false,
        healthy: false,
        error: error.message,
      }
    }
  }
}

// Create singleton instance
const mlService = new MLIntegrationService()

// Export service
export default mlService

// Export specific functions for convenience
export const {
  predictExamSuccess,
  predictExamScore,
  assessDropoutRisk,
  predictKnowledgeAreaPerformance,
  getLearningPathRecommendations,
  batchPredict,
  extractFeaturesFromUserData,
  getModelInfo,
  reloadModel,
  getModelMetrics,
  subscribeToPredictions,
  getAnalytics,
  checkHealth,
} = mlService
