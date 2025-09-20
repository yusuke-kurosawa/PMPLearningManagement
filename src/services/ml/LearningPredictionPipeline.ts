/**
 * Machine Learning Pipeline for Learning Effectiveness Prediction
 * Comprehensive ML models for predicting learning outcomes
 */

import * as tf from '@tensorflow/tfjs'

export interface PredictionModel {
  id: string
  name: string
  type: ModelType
  version: string
  metrics: ModelMetrics
  features: FeatureDefinition[]
  hyperparameters: any
  trainingData: TrainingDataset
  status: 'training' | 'deployed' | 'archived'
}

export type ModelType =
  | 'exam_success_prediction'
  | 'learning_path_optimization'
  | 'content_difficulty_assessment'
  | 'student_risk_identification'
  | 'study_schedule_optimization'
  | 'knowledge_decay_modeling'
  | 'engagement_prediction'
  | 'dropout_prediction'

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  rmse?: number
  mae?: number
  crossValidationScore?: number
}

export interface FeatureDefinition {
  name: string
  type: 'numerical' | 'categorical' | 'text' | 'temporal'
  importance: number
  preprocessing: PreprocessingStep[]
}

export interface PreprocessingStep {
  type: 'normalize' | 'standardize' | 'encode' | 'embed' | 'bin'
  parameters: any
}

export interface TrainingDataset {
  size: number
  features: number
  splitRatio: { train: number; validation: number; test: number }
  lastUpdated: Date
}

export interface PredictionResult {
  modelId: string
  prediction: any
  confidence: number
  explanation: FeatureImportance[]
  timestamp: Date
}

export interface FeatureImportance {
  feature: string
  importance: number
  value: any
  contribution: number
}

export class LearningPredictionPipeline {
  private models: Map<string, tf.LayersModel> = new Map()
  private featureEngineers: Map<string, FeatureEngineer> = new Map()
  private modelConfigs: Map<string, PredictionModel> = new Map()

  /**
   * Initialize exam success prediction model
   */
  async initializeExamSuccessPrediction(): Promise<PredictionModel> {
    const modelConfig: PredictionModel = {
      id: 'exam-success-v1',
      name: 'Exam Success Predictor',
      type: 'exam_success_prediction',
      version: '1.0.0',
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        auc: 0,
      },
      features: this.getExamSuccessFeatures(),
      hyperparameters: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        hiddenLayers: [128, 64, 32],
        dropout: 0.2,
        optimizer: 'adam',
      },
      trainingData: {
        size: 0,
        features: 25,
        splitRatio: { train: 0.7, validation: 0.15, test: 0.15 },
        lastUpdated: new Date(),
      },
      status: 'training',
    }

    // Build neural network model
    const model = this.buildExamSuccessModel(modelConfig)
    this.models.set(modelConfig.id, model)
    this.modelConfigs.set(modelConfig.id, modelConfig)

    return modelConfig
  }

  /**
   * Build exam success prediction model
   */
  private buildExamSuccessModel(config: PredictionModel): tf.LayersModel {
    const model = tf.sequential()

    // Input layer
    model.add(
      tf.layers.dense({
        inputShape: [config.features.length],
        units: config.hyperparameters.hiddenLayers[0],
        activation: 'relu',
        kernelInitializer: 'heNormal',
      })
    )

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: config.hyperparameters.dropout }))

    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(
        tf.layers.dense({
          units: config.hyperparameters.hiddenLayers[i],
          activation: 'relu',
          kernelInitializer: 'heNormal',
        })
      )
      model.add(tf.layers.batchNormalization())
      model.add(tf.layers.dropout({ rate: config.hyperparameters.dropout }))
    }

    // Output layer (binary classification)
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
      })
    )

    // Compile model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall'],
    })

    return model
  }

  /**
   * Get exam success features
   */
  private getExamSuccessFeatures(): FeatureDefinition[] {
    return [
      // Learning metrics
      {
        name: 'study_hours_total',
        type: 'numerical',
        importance: 0.15,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'study_sessions_count',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'avg_session_duration',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'practice_questions_attempted',
        type: 'numerical',
        importance: 0.18,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'practice_accuracy',
        type: 'numerical',
        importance: 0.25,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Progress metrics
      {
        name: 'modules_completed',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'completion_rate',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'knowledge_area_coverage',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'process_group_mastery',
        type: 'numerical',
        importance: 0.11,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Engagement metrics
      {
        name: 'days_since_start',
        type: 'numerical',
        importance: 0.05,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'study_streak',
        type: 'numerical',
        importance: 0.07,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'engagement_score',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'resource_utilization',
        type: 'numerical',
        importance: 0.06,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Performance trends
      {
        name: 'performance_trend',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'difficulty_progression',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'mock_exam_scores_avg',
        type: 'numerical',
        importance: 0.2,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'mock_exam_improvement',
        type: 'numerical',
        importance: 0.16,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Learning patterns
      {
        name: 'preferred_study_time',
        type: 'categorical',
        importance: 0.04,
        preprocessing: [{ type: 'encode', parameters: { method: 'onehot' } }],
      },
      {
        name: 'learning_style',
        type: 'categorical',
        importance: 0.06,
        preprocessing: [{ type: 'encode', parameters: { method: 'onehot' } }],
      },
      {
        name: 'content_type_preference',
        type: 'categorical',
        importance: 0.05,
        preprocessing: [{ type: 'encode', parameters: { method: 'onehot' } }],
      },

      // Time-based features
      {
        name: 'days_to_exam',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'study_consistency',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'weekend_study_ratio',
        type: 'numerical',
        importance: 0.03,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Interaction features
      {
        name: 'forum_participation',
        type: 'numerical',
        importance: 0.04,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'peer_comparison_score',
        type: 'numerical',
        importance: 0.07,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
    ]
  }

  /**
   * Train exam success prediction model
   */
  async trainExamSuccessModel(data: TrainingData): Promise<ModelMetrics> {
    const modelId = 'exam-success-v1'
    const model = this.models.get(modelId)
    const config = this.modelConfigs.get(modelId)

    if (!model || !config) {
      throw new Error('Model not initialized')
    }

    // Prepare data
    const { features, labels } = this.prepareTrainingData(data, config.features)

    // Split data
    const { trainX, trainY, valX, valY, testX, testY } = this.splitData(
      features,
      labels,
      config.trainingData.splitRatio
    )

    // Train model
    const history = await model.fit(trainX, trainY, {
      epochs: config.hyperparameters.epochs,
      batchSize: config.hyperparameters.batchSize,
      validationData: [valX, valY],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(
            `Epoch ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, accuracy=${logs?.acc?.toFixed(4)}`
          )
        },
      },
    })

    // Evaluate on test set
    const evaluation = model.evaluate(testX, testY) as tf.Scalar[]
    const [loss, accuracy, precision, recall] = await Promise.all(evaluation.map((t) => t.data()))

    // Calculate F1 score
    const f1Score = (2 * (precision[0] * recall[0])) / (precision[0] + recall[0])

    // Calculate AUC
    const predictions = model.predict(testX) as tf.Tensor
    const auc = await this.calculateAUC(predictions, testY)

    const metrics: ModelMetrics = {
      accuracy: accuracy[0],
      precision: precision[0],
      recall: recall[0],
      f1Score,
      auc,
    }

    // Update model config
    config.metrics = metrics
    config.status = 'deployed'
    config.trainingData.size = data.samples.length
    config.trainingData.lastUpdated = new Date()

    // Clean up tensors
    trainX.dispose()
    trainY.dispose()
    valX.dispose()
    valY.dispose()
    testX.dispose()
    testY.dispose()
    predictions.dispose()

    return metrics
  }

  /**
   * Predict exam success probability
   */
  async predictExamSuccess(userFeatures: any): Promise<PredictionResult> {
    const modelId = 'exam-success-v1'
    const model = this.models.get(modelId)
    const config = this.modelConfigs.get(modelId)

    if (!model || !config) {
      throw new Error('Model not initialized')
    }

    // Prepare features
    const features = this.prepareFeatures(userFeatures, config.features)
    const inputTensor = tf.tensor2d([features])

    // Make prediction
    const prediction = model.predict(inputTensor) as tf.Tensor
    const probability = await prediction.data()

    // Calculate feature importance using SHAP-like approach
    const explanation = await this.explainPrediction(model, features, config.features)

    // Clean up
    inputTensor.dispose()
    prediction.dispose()

    return {
      modelId,
      prediction: {
        probability: probability[0],
        outcome: probability[0] > 0.5 ? 'pass' : 'fail',
      },
      confidence: Math.abs(probability[0] - 0.5) * 2, // Convert to confidence
      explanation,
      timestamp: new Date(),
    }
  }

  /**
   * Initialize learning path optimization model
   */
  async initializeLearningPathOptimization(): Promise<PredictionModel> {
    const modelConfig: PredictionModel = {
      id: 'learning-path-v1',
      name: 'Learning Path Optimizer',
      type: 'learning_path_optimization',
      version: '1.0.0',
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        auc: 0,
        rmse: 0,
      },
      features: this.getLearningPathFeatures(),
      hyperparameters: {
        algorithm: 'reinforcement_learning',
        learningRate: 0.001,
        discountFactor: 0.95,
        epsilon: 0.1,
        bufferSize: 10000,
        updateFrequency: 4,
      },
      trainingData: {
        size: 0,
        features: 30,
        splitRatio: { train: 0.8, validation: 0.1, test: 0.1 },
        lastUpdated: new Date(),
      },
      status: 'training',
    }

    // Build reinforcement learning model for path optimization
    const model = this.buildPathOptimizationModel(modelConfig)
    this.models.set(modelConfig.id, model)
    this.modelConfigs.set(modelConfig.id, modelConfig)

    return modelConfig
  }

  /**
   * Build learning path optimization model
   */
  private buildPathOptimizationModel(config: PredictionModel): tf.LayersModel {
    // Deep Q-Network for learning path optimization
    const model = tf.sequential()

    // State representation layer
    model.add(
      tf.layers.dense({
        inputShape: [config.features.length],
        units: 256,
        activation: 'relu',
      })
    )

    model.add(
      tf.layers.dense({
        units: 128,
        activation: 'relu',
      })
    )

    model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu',
      })
    )

    // Action value output (Q-values for different learning paths)
    model.add(
      tf.layers.dense({
        units: 10, // Number of possible next modules
        activation: 'linear',
      })
    )

    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
    })

    return model
  }

  /**
   * Get learning path features
   */
  private getLearningPathFeatures(): FeatureDefinition[] {
    return [
      // Current state features
      {
        name: 'current_module',
        type: 'categorical',
        importance: 0.15,
        preprocessing: [{ type: 'embed', parameters: { dimensions: 10 } }],
      },
      {
        name: 'completed_modules',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'current_knowledge_level',
        type: 'numerical',
        importance: 0.18,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'time_spent_current',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Performance features
      {
        name: 'module_success_rate',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'difficulty_handled',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'learning_velocity',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Preference features
      {
        name: 'content_type_preference',
        type: 'categorical',
        importance: 0.08,
        preprocessing: [{ type: 'encode', parameters: {} }],
      },
      {
        name: 'learning_style_match',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Context features
      {
        name: 'available_study_time',
        type: 'numerical',
        importance: 0.11,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'deadline_pressure',
        type: 'numerical',
        importance: 0.13,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'prerequisites_met',
        type: 'numerical',
        importance: 0.16,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Historical features
      {
        name: 'path_efficiency_history',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'module_revisit_count',
        type: 'numerical',
        importance: 0.07,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Module characteristics
      {
        name: 'module_difficulty',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'module_importance',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'module_dependencies',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Additional context
      {
        name: 'peer_performance',
        type: 'numerical',
        importance: 0.06,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'knowledge_decay_rate',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'engagement_level',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
    ]
  }

  /**
   * Initialize student risk identification model
   */
  async initializeStudentRiskModel(): Promise<PredictionModel> {
    const modelConfig: PredictionModel = {
      id: 'student-risk-v1',
      name: 'Student Risk Identifier',
      type: 'student_risk_identification',
      version: '1.0.0',
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        auc: 0,
      },
      features: this.getStudentRiskFeatures(),
      hyperparameters: {
        algorithm: 'gradient_boosting',
        nEstimators: 100,
        maxDepth: 5,
        learningRate: 0.1,
        subsample: 0.8,
        minSamplesSplit: 20,
      },
      trainingData: {
        size: 0,
        features: 20,
        splitRatio: { train: 0.7, validation: 0.15, test: 0.15 },
        lastUpdated: new Date(),
      },
      status: 'training',
    }

    // For gradient boosting, we'll use a neural network approximation
    const model = this.buildRiskIdentificationModel(modelConfig)
    this.models.set(modelConfig.id, model)
    this.modelConfigs.set(modelConfig.id, modelConfig)

    return modelConfig
  }

  /**
   * Build student risk identification model
   */
  private buildRiskIdentificationModel(config: PredictionModel): tf.LayersModel {
    const model = tf.sequential()

    // Ensemble-like architecture
    model.add(
      tf.layers.dense({
        inputShape: [config.features.length],
        units: 100,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    )

    model.add(tf.layers.dropout({ rate: 0.3 }))

    model.add(
      tf.layers.dense({
        units: 50,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    )

    model.add(tf.layers.dropout({ rate: 0.2 }))

    model.add(
      tf.layers.dense({
        units: 25,
        activation: 'relu',
      })
    )

    // Multi-class output for risk levels
    model.add(
      tf.layers.dense({
        units: 4, // No risk, Low, Medium, High
        activation: 'softmax',
      })
    )

    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    })

    return model
  }

  /**
   * Get student risk features
   */
  private getStudentRiskFeatures(): FeatureDefinition[] {
    return [
      // Engagement indicators
      {
        name: 'login_frequency',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'session_duration_trend',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'days_inactive',
        type: 'numerical',
        importance: 0.18,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Performance indicators
      {
        name: 'recent_performance_drop',
        type: 'numerical',
        importance: 0.2,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'failed_attempts_ratio',
        type: 'numerical',
        importance: 0.16,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'struggle_indicator',
        type: 'numerical',
        importance: 0.15,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Progress indicators
      {
        name: 'behind_schedule',
        type: 'numerical',
        importance: 0.17,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'completion_rate_decline',
        type: 'numerical',
        importance: 0.13,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'module_repetition_rate',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Behavioral indicators
      {
        name: 'help_seeking_frequency',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'resource_access_decline',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'forum_participation_drop',
        type: 'numerical',
        importance: 0.07,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // External factors
      {
        name: 'time_constraints',
        type: 'numerical',
        importance: 0.11,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'difficulty_mismatch',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Historical patterns
      {
        name: 'previous_dropout_signal',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'consistency_score',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Emotional indicators
      {
        name: 'frustration_events',
        type: 'numerical',
        importance: 0.13,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'confidence_level',
        type: 'numerical',
        importance: 0.11,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Support utilization
      {
        name: 'support_resource_usage',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'peer_interaction_level',
        type: 'numerical',
        importance: 0.08,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
    ]
  }

  /**
   * Initialize knowledge decay model
   */
  async initializeKnowledgeDecayModel(): Promise<PredictionModel> {
    const modelConfig: PredictionModel = {
      id: 'knowledge-decay-v1',
      name: 'Knowledge Decay Predictor',
      type: 'knowledge_decay_modeling',
      version: '1.0.0',
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        auc: 0,
        rmse: 0,
        mae: 0,
      },
      features: this.getKnowledgeDecayFeatures(),
      hyperparameters: {
        algorithm: 'lstm',
        sequenceLength: 30,
        lstmUnits: 64,
        dropoutRate: 0.2,
        learningRate: 0.001,
        batchSize: 32,
      },
      trainingData: {
        size: 0,
        features: 15,
        splitRatio: { train: 0.7, validation: 0.15, test: 0.15 },
        lastUpdated: new Date(),
      },
      status: 'training',
    }

    const model = this.buildKnowledgeDecayModel(modelConfig)
    this.models.set(modelConfig.id, model)
    this.modelConfigs.set(modelConfig.id, modelConfig)

    return modelConfig
  }

  /**
   * Build knowledge decay model (LSTM for time series)
   */
  private buildKnowledgeDecayModel(config: PredictionModel): tf.LayersModel {
    const model = tf.sequential()

    // LSTM layers for temporal patterns
    model.add(
      tf.layers.lstm({
        units: config.hyperparameters.lstmUnits,
        returnSequences: true,
        inputShape: [config.hyperparameters.sequenceLength, config.features.length],
      })
    )

    model.add(tf.layers.dropout({ rate: config.hyperparameters.dropoutRate }))

    model.add(
      tf.layers.lstm({
        units: config.hyperparameters.lstmUnits / 2,
        returnSequences: false,
      })
    )

    model.add(tf.layers.dropout({ rate: config.hyperparameters.dropoutRate }))

    // Dense layers for prediction
    model.add(
      tf.layers.dense({
        units: 32,
        activation: 'relu',
      })
    )

    // Output: predicted retention score
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
      })
    )

    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    })

    return model
  }

  /**
   * Get knowledge decay features
   */
  private getKnowledgeDecayFeatures(): FeatureDefinition[] {
    return [
      // Time-based features
      {
        name: 'days_since_learning',
        type: 'numerical',
        importance: 0.25,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'review_frequency',
        type: 'numerical',
        importance: 0.2,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'time_between_reviews',
        type: 'numerical',
        importance: 0.15,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Learning quality features
      {
        name: 'initial_mastery_level',
        type: 'numerical',
        importance: 0.18,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'learning_depth',
        type: 'numerical',
        importance: 0.14,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'practice_intensity',
        type: 'numerical',
        importance: 0.16,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },

      // Content features
      {
        name: 'content_complexity',
        type: 'numerical',
        importance: 0.12,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'content_type',
        type: 'categorical',
        importance: 0.08,
        preprocessing: [{ type: 'encode', parameters: {} }],
      },
      {
        name: 'interconnectedness',
        type: 'numerical',
        importance: 0.1,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Reinforcement features
      {
        name: 'application_frequency',
        type: 'numerical',
        importance: 0.17,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'retrieval_practice_count',
        type: 'numerical',
        importance: 0.19,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
      {
        name: 'spaced_repetition_score',
        type: 'numerical',
        importance: 0.22,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },

      // Individual factors
      {
        name: 'prior_knowledge',
        type: 'numerical',
        importance: 0.11,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'learning_style_match',
        type: 'numerical',
        importance: 0.09,
        preprocessing: [{ type: 'normalize', parameters: {} }],
      },
      {
        name: 'cognitive_load',
        type: 'numerical',
        importance: 0.13,
        preprocessing: [{ type: 'standardize', parameters: {} }],
      },
    ]
  }

  /**
   * Prepare training data
   */
  private prepareTrainingData(
    data: TrainingData,
    features: FeatureDefinition[]
  ): { features: tf.Tensor2D; labels: tf.Tensor2D } {
    const featureArrays: number[][] = []
    const labelArrays: number[][] = []

    for (const sample of data.samples) {
      const featureVector = this.prepareFeatures(sample.features, features)
      featureArrays.push(featureVector)
      labelArrays.push([sample.label])
    }

    return {
      features: tf.tensor2d(featureArrays),
      labels: tf.tensor2d(labelArrays),
    }
  }

  /**
   * Prepare features for prediction
   */
  private prepareFeatures(rawFeatures: any, featureDefinitions: FeatureDefinition[]): number[] {
    const processedFeatures: number[] = []

    for (const featureDef of featureDefinitions) {
      let value = rawFeatures[featureDef.name]

      // Apply preprocessing
      for (const step of featureDef.preprocessing) {
        value = this.applyPreprocessing(value, step)
      }

      // Handle different feature types
      if (featureDef.type === 'categorical') {
        // One-hot encoding (simplified)
        processedFeatures.push(value)
      } else {
        processedFeatures.push(value)
      }
    }

    return processedFeatures
  }

  /**
   * Apply preprocessing step
   */
  private applyPreprocessing(value: any, step: PreprocessingStep): any {
    switch (step.type) {
      case 'normalize':
        // Min-max normalization (0-1)
        return Math.max(0, Math.min(1, value))
      case 'standardize':
        // Z-score standardization (simplified)
        return value // Would need mean and std from training data
      case 'encode':
        // Encoding (simplified)
        return typeof value === 'string' ? value.charCodeAt(0) % 10 : value
      case 'embed':
        // Embedding (simplified)
        return value
      case 'bin':
        // Binning (simplified)
        return Math.floor(value / 10)
      default:
        return value
    }
  }

  /**
   * Split data into train, validation, and test sets
   */
  private splitData(
    features: tf.Tensor2D,
    labels: tf.Tensor2D,
    splitRatio: { train: number; validation: number; test: number }
  ) {
    const totalSamples = features.shape[0]
    const trainSize = Math.floor(totalSamples * splitRatio.train)
    const valSize = Math.floor(totalSamples * splitRatio.validation)

    const trainX = features.slice([0, 0], [trainSize, -1])
    const trainY = labels.slice([0, 0], [trainSize, -1])

    const valX = features.slice([trainSize, 0], [valSize, -1])
    const valY = labels.slice([trainSize, 0], [valSize, -1])

    const testX = features.slice([trainSize + valSize, 0], [-1, -1])
    const testY = labels.slice([trainSize + valSize, 0], [-1, -1])

    return { trainX, trainY, valX, valY, testX, testY }
  }

  /**
   * Calculate AUC (Area Under Curve)
   */
  private async calculateAUC(predictions: tf.Tensor, labels: tf.Tensor): Promise<number> {
    const predArray = (await predictions.array()) as number[]
    const labelArray = (await labels.array()) as number[]

    // Sort by predictions
    const paired = predArray.map((pred, i) => ({ pred, label: labelArray[i] }))
    paired.sort((a, b) => b.pred - a.pred)

    // Calculate AUC using trapezoidal rule
    let auc = 0
    let tpr = 0
    let fpr = 0
    const positives = paired.filter((p) => p.label === 1).length
    const negatives = paired.length - positives

    for (let i = 0; i < paired.length; i++) {
      if (paired[i].label === 1) {
        tpr += 1 / positives
      } else {
        auc += tpr / negatives
        fpr += 1 / negatives
      }
    }

    return auc
  }

  /**
   * Explain prediction using SHAP-like approach
   */
  private async explainPrediction(
    model: tf.LayersModel,
    features: number[],
    featureDefinitions: FeatureDefinition[]
  ): Promise<FeatureImportance[]> {
    const baseline = new Array(features.length).fill(0)
    const baselineTensor = tf.tensor2d([baseline])
    const featureTensor = tf.tensor2d([features])

    const baselinePred = await (model.predict(baselineTensor) as tf.Tensor).data()
    const featurePred = await (model.predict(featureTensor) as tf.Tensor).data()

    const importance: FeatureImportance[] = []

    // Calculate feature contributions
    for (let i = 0; i < features.length; i++) {
      const maskedFeatures = [...features]
      maskedFeatures[i] = baseline[i]
      const maskedTensor = tf.tensor2d([maskedFeatures])
      const maskedPred = await (model.predict(maskedTensor) as tf.Tensor).data()

      const contribution = featurePred[0] - maskedPred[0]

      importance.push({
        feature: featureDefinitions[i].name,
        importance: featureDefinitions[i].importance,
        value: features[i],
        contribution,
      })

      maskedTensor.dispose()
    }

    // Sort by absolute contribution
    importance.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

    // Clean up
    baselineTensor.dispose()
    featureTensor.dispose()

    return importance
  }

  /**
   * Get all models
   */
  getAllModels(): PredictionModel[] {
    return Array.from(this.modelConfigs.values())
  }

  /**
   * Get model by ID
   */
  getModel(id: string): PredictionModel | undefined {
    return this.modelConfigs.get(id)
  }

  /**
   * Update model metrics
   */
  updateModelMetrics(id: string, metrics: ModelMetrics): void {
    const config = this.modelConfigs.get(id)
    if (config) {
      config.metrics = metrics
    }
  }
}

// Supporting interfaces
export interface TrainingData {
  samples: TrainingSample[]
}

export interface TrainingSample {
  features: any
  label: number
}

export interface FeatureEngineer {
  transform(data: any): number[]
  fitTransform(data: any[]): number[][]
}

export default LearningPredictionPipeline
