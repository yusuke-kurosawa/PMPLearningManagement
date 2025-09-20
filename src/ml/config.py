"""
ML Pipeline Configuration
Centralized configuration for all ML components
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
import os
from pathlib import Path


class ModelType(Enum):
    """Supported model types"""
    EXAM_SUCCESS = "exam_success_classifier"
    SCORE_PREDICTOR = "score_predictor"
    TIME_TO_MASTERY = "time_to_mastery"
    KNOWLEDGE_AREA = "knowledge_area_performance"
    LEARNING_PATH = "learning_path_optimizer"
    DROPOUT_RISK = "dropout_risk_classifier"
    RETENTION_MODEL = "retention_predictor"
    CONTENT_EFFECTIVENESS = "content_effectiveness"


class FeatureType(Enum):
    """Feature categories for engineering"""
    BEHAVIORAL = "behavioral"
    PERFORMANCE = "performance"
    ENGAGEMENT = "engagement"
    TEMPORAL = "temporal"
    CONTENT = "content"
    SOCIAL = "social"
    DEMOGRAPHIC = "demographic"


@dataclass
class ModelConfig:
    """Configuration for individual models"""
    model_type: ModelType
    algorithm: str
    hyperparameters: Dict[str, Any] = field(default_factory=dict)
    feature_sets: List[FeatureType] = field(default_factory=list)
    training_params: Dict[str, Any] = field(default_factory=dict)
    serving_config: Dict[str, Any] = field(default_factory=dict)
    monitoring_config: Dict[str, Any] = field(default_factory=dict)
    version: str = "1.0.0"
    
    
@dataclass
class PipelineConfig:
    """Main ML pipeline configuration"""
    # Data paths
    raw_data_path: Path = Path("data/raw")
    processed_data_path: Path = Path("data/processed")
    feature_store_path: Path = Path("data/features")
    model_artifacts_path: Path = Path("models/artifacts")
    
    # Model registry
    model_registry_url: str = "http://localhost:5000"
    experiment_tracking_url: str = "http://localhost:5001"
    
    # Feature engineering
    feature_engineering_config: Dict[str, Any] = field(default_factory=lambda: {
        "auto_feature_selection": True,
        "max_features": 100,
        "feature_importance_threshold": 0.01,
        "correlation_threshold": 0.95,
        "missing_value_threshold": 0.3,
        "outlier_detection_method": "isolation_forest",
        "scaling_method": "standard",
        "encoding_method": "target"
    })
    
    # Training configuration
    training_config: Dict[str, Any] = field(default_factory=lambda: {
        "train_test_split": 0.8,
        "validation_split": 0.2,
        "cross_validation_folds": 5,
        "random_state": 42,
        "early_stopping_patience": 10,
        "batch_size": 32,
        "max_epochs": 100,
        "learning_rate": 0.001,
        "optimizer": "adam"
    })
    
    # Serving configuration
    serving_config: Dict[str, Any] = field(default_factory=lambda: {
        "api_host": "0.0.0.0",
        "api_port": 8080,
        "max_batch_size": 100,
        "timeout_ms": 100,
        "cache_ttl_seconds": 300,
        "model_warm_up": True,
        "async_inference": True,
        "max_workers": 4
    })
    
    # Monitoring configuration
    monitoring_config: Dict[str, Any] = field(default_factory=lambda: {
        "drift_detection_method": "kolmogorov_smirnov",
        "drift_threshold": 0.05,
        "performance_degradation_threshold": 0.1,
        "alert_email": "admin@pmplearning.com",
        "monitoring_interval_minutes": 30,
        "data_quality_checks": True,
        "model_quality_checks": True,
        "business_metrics_tracking": True
    })
    
    # A/B testing configuration
    ab_testing_config: Dict[str, Any] = field(default_factory=lambda: {
        "enabled": True,
        "traffic_split": {"control": 0.5, "treatment": 0.5},
        "min_sample_size": 1000,
        "confidence_level": 0.95,
        "experiment_duration_days": 14,
        "auto_rollout": True,
        "rollout_threshold": 0.05
    })
    
    # Business metrics
    business_metrics_config: Dict[str, Any] = field(default_factory=lambda: {
        "primary_metrics": ["pass_rate", "avg_score", "completion_rate"],
        "secondary_metrics": ["engagement_rate", "retention_rate", "satisfaction_score"],
        "cost_metrics": ["cost_per_student", "roi", "ltv"],
        "operational_metrics": ["model_latency", "api_availability", "data_freshness"]
    })


# Model specifications
MODEL_SPECS = {
    ModelType.EXAM_SUCCESS: ModelConfig(
        model_type=ModelType.EXAM_SUCCESS,
        algorithm="xgboost_classifier",
        hyperparameters={
            "n_estimators": 200,
            "max_depth": 6,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "scale_pos_weight": 1
        },
        feature_sets=[
            FeatureType.BEHAVIORAL,
            FeatureType.PERFORMANCE,
            FeatureType.ENGAGEMENT,
            FeatureType.TEMPORAL
        ],
        training_params={
            "early_stopping_rounds": 50,
            "eval_metric": "auc",
            "class_weight": "balanced"
        },
        serving_config={
            "batch_size": 100,
            "cache_predictions": True,
            "confidence_threshold": 0.7
        },
        monitoring_config={
            "primary_metric": "auc",
            "secondary_metrics": ["precision", "recall", "f1"],
            "drift_features": ["study_hours", "quiz_scores", "progress_rate"]
        }
    ),
    
    ModelType.SCORE_PREDICTOR: ModelConfig(
        model_type=ModelType.SCORE_PREDICTOR,
        algorithm="lightgbm_regressor",
        hyperparameters={
            "num_leaves": 31,
            "learning_rate": 0.05,
            "feature_fraction": 0.9,
            "bagging_fraction": 0.8,
            "bagging_freq": 5,
            "min_child_samples": 20,
            "boosting_type": "gbdt"
        },
        feature_sets=[
            FeatureType.PERFORMANCE,
            FeatureType.BEHAVIORAL,
            FeatureType.CONTENT,
            FeatureType.TEMPORAL
        ],
        training_params={
            "objective": "regression",
            "metric": "rmse",
            "num_boost_round": 1000,
            "early_stopping_rounds": 100
        },
        serving_config={
            "prediction_interval": True,
            "quantiles": [0.1, 0.5, 0.9]
        },
        monitoring_config={
            "primary_metric": "rmse",
            "secondary_metrics": ["mae", "r2", "mape"],
            "prediction_bounds": [0, 100]
        }
    ),
    
    ModelType.TIME_TO_MASTERY: ModelConfig(
        model_type=ModelType.TIME_TO_MASTERY,
        algorithm="cox_proportional_hazards",
        hyperparameters={
            "penalizer": 0.1,
            "l1_ratio": 0.5
        },
        feature_sets=[
            FeatureType.BEHAVIORAL,
            FeatureType.TEMPORAL,
            FeatureType.ENGAGEMENT,
            FeatureType.DEMOGRAPHIC
        ],
        training_params={
            "duration_col": "study_duration",
            "event_col": "mastery_achieved",
            "strata": ["knowledge_area"]
        },
        serving_config={
            "survival_probabilities": [7, 14, 30, 60, 90],
            "median_survival": True
        },
        monitoring_config={
            "primary_metric": "concordance_index",
            "calibration_check": True
        }
    ),
    
    ModelType.KNOWLEDGE_AREA: ModelConfig(
        model_type=ModelType.KNOWLEDGE_AREA,
        algorithm="multi_output_neural_network",
        hyperparameters={
            "hidden_layers": [256, 128, 64],
            "activation": "relu",
            "dropout_rate": 0.3,
            "batch_norm": True
        },
        feature_sets=[
            FeatureType.PERFORMANCE,
            FeatureType.CONTENT,
            FeatureType.BEHAVIORAL,
            FeatureType.TEMPORAL
        ],
        training_params={
            "optimizer": "adam",
            "learning_rate": 0.001,
            "batch_size": 64,
            "epochs": 200,
            "early_stopping_patience": 20
        },
        serving_config={
            "output_areas": [
                "integration", "scope", "schedule", "cost", "quality",
                "resource", "communications", "risk", "procurement", "stakeholder"
            ]
        },
        monitoring_config={
            "per_area_metrics": True,
            "correlation_monitoring": True
        }
    ),
    
    ModelType.LEARNING_PATH: ModelConfig(
        model_type=ModelType.LEARNING_PATH,
        algorithm="deep_q_network",
        hyperparameters={
            "state_dim": 50,
            "action_dim": 20,
            "hidden_layers": [128, 64],
            "epsilon": 0.1,
            "gamma": 0.99,
            "tau": 0.001
        },
        feature_sets=[
            FeatureType.PERFORMANCE,
            FeatureType.BEHAVIORAL,
            FeatureType.CONTENT,
            FeatureType.TEMPORAL
        ],
        training_params={
            "replay_buffer_size": 10000,
            "batch_size": 32,
            "update_frequency": 4,
            "target_update_frequency": 100
        },
        serving_config={
            "exploration_rate": 0.05,
            "recommendation_count": 5
        },
        monitoring_config={
            "reward_tracking": True,
            "action_distribution": True,
            "convergence_monitoring": True
        }
    ),
    
    ModelType.DROPOUT_RISK: ModelConfig(
        model_type=ModelType.DROPOUT_RISK,
        algorithm="random_forest_classifier",
        hyperparameters={
            "n_estimators": 300,
            "max_depth": 10,
            "min_samples_split": 20,
            "min_samples_leaf": 10,
            "max_features": "sqrt"
        },
        feature_sets=[
            FeatureType.ENGAGEMENT,
            FeatureType.BEHAVIORAL,
            FeatureType.TEMPORAL,
            FeatureType.SOCIAL
        ],
        training_params={
            "class_weight": "balanced_subsample",
            "oob_score": True
        },
        serving_config={
            "risk_levels": ["low", "medium", "high", "critical"],
            "intervention_threshold": 0.6
        },
        monitoring_config={
            "primary_metric": "precision_at_k",
            "k_values": [10, 20, 50],
            "false_positive_cost": 10,
            "false_negative_cost": 100
        }
    )
}


# Feature definitions
FEATURE_DEFINITIONS = {
    FeatureType.BEHAVIORAL: [
        "study_hours_per_week",
        "avg_session_duration",
        "study_time_consistency",
        "preferred_study_time",
        "study_break_frequency",
        "content_revisit_rate",
        "learning_style_preference",
        "note_taking_frequency",
        "practice_exam_frequency"
    ],
    
    FeatureType.PERFORMANCE: [
        "current_score",
        "score_improvement_rate",
        "quiz_accuracy",
        "mock_exam_scores",
        "knowledge_area_scores",
        "process_group_mastery",
        "itto_recall_accuracy",
        "weak_areas_count",
        "consecutive_correct_answers"
    ],
    
    FeatureType.ENGAGEMENT: [
        "login_frequency",
        "content_completion_rate",
        "video_watch_percentage",
        "interaction_depth",
        "forum_participation",
        "resource_download_count",
        "bookmark_usage",
        "search_query_count",
        "help_request_frequency"
    ],
    
    FeatureType.TEMPORAL: [
        "days_since_enrollment",
        "study_streak_days",
        "time_to_first_quiz",
        "learning_velocity",
        "content_coverage_speed",
        "peak_performance_time",
        "study_gap_duration",
        "deadline_proximity",
        "seasonal_pattern"
    ],
    
    FeatureType.CONTENT: [
        "content_difficulty_preference",
        "content_type_preference",
        "topic_interest_scores",
        "content_consumption_pattern",
        "multimedia_preference",
        "reading_speed",
        "content_rating_given",
        "content_skip_rate",
        "annotation_frequency"
    ],
    
    FeatureType.SOCIAL: [
        "study_group_participation",
        "peer_interaction_frequency",
        "mentorship_engagement",
        "discussion_contribution",
        "peer_help_given",
        "peer_help_received",
        "collaboration_score",
        "network_centrality",
        "influence_score"
    ],
    
    FeatureType.DEMOGRAPHIC: [
        "age_group",
        "education_level",
        "work_experience_years",
        "industry_domain",
        "prior_certification_count",
        "learning_disability_flag",
        "language_preference",
        "device_type",
        "location_timezone"
    ]
}


# Default pipeline configuration
DEFAULT_CONFIG = PipelineConfig()


def get_model_config(model_type: ModelType) -> ModelConfig:
    """Get configuration for a specific model type"""
    return MODEL_SPECS.get(model_type)


def get_feature_list(feature_type: FeatureType) -> List[str]:
    """Get list of features for a specific feature type"""
    return FEATURE_DEFINITIONS.get(feature_type, [])


def get_all_features() -> List[str]:
    """Get all available features"""
    all_features = []
    for features in FEATURE_DEFINITIONS.values():
        all_features.extend(features)
    return all_features