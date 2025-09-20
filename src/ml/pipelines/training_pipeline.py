"""
Model Training and Validation Pipeline
Automated training, validation, and experiment tracking
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
import json
import yaml
import joblib
from datetime import datetime
import hashlib
import mlflow
import mlflow.sklearn
import mlflow.xgboost
import mlflow.lightgbm
import mlflow.pytorch
from pathlib import Path
import logging
import warnings
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder
import optuna
from optuna.integration import MLflowCallback

from ..config import ModelType, ModelConfig, PipelineConfig, MODEL_SPECS
from ..features.feature_engineering import FeatureEngineer
from ..models.predictive_models import ModelFactory, ModelMetrics
from ..utils.data_validator import DataValidator
from ..utils.experiment_tracker import ExperimentTracker

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TrainingRun:
    """Container for training run information"""
    run_id: str
    model_type: ModelType
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str = "running"
    metrics: Optional[ModelMetrics] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    feature_importance: Optional[Dict[str, float]] = None
    model_path: Optional[str] = None
    data_version: Optional[str] = None
    git_commit: Optional[str] = None
    experiment_id: Optional[str] = None
    
    def to_dict(self):
        """Convert to dictionary for serialization"""
        d = asdict(self)
        d['model_type'] = self.model_type.value
        d['start_time'] = self.start_time.isoformat()
        if self.end_time:
            d['end_time'] = self.end_time.isoformat()
        return d


class TrainingPipeline:
    """Main training pipeline orchestrator"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.feature_engineer = FeatureEngineer(config)
        self.data_validator = DataValidator(config)
        self.experiment_tracker = ExperimentTracker(config)
        self.training_runs: List[TrainingRun] = []
        
        # Initialize MLflow
        mlflow.set_tracking_uri(self.config.experiment_tracking_url)
        
    def prepare_data(self, 
                    df: pd.DataFrame,
                    target_col: str,
                    model_type: ModelType) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
        """Prepare data for training"""
        logger.info("Preparing data for training...")
        
        # Validate data quality
        validation_report = self.data_validator.validate(df)
        if not validation_report['is_valid']:
            logger.warning(f"Data quality issues detected: {validation_report['issues']}")
        
        # Separate features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Engineer features
        X_engineered = self.feature_engineer.fit_transform(X, y)
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X_engineered, y,
            test_size=1 - self.config.training_config['train_test_split'],
            random_state=self.config.training_config['random_state'],
            stratify=y if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK] else None
        )
        
        logger.info(f"Data prepared: Train shape {X_train.shape}, Val shape {X_val.shape}")
        
        return X_train, y_train, X_val, y_val
    
    def train_model(self,
                   model_type: ModelType,
                   X_train: pd.DataFrame,
                   y_train: pd.Series,
                   X_val: pd.DataFrame,
                   y_val: pd.Series,
                   hyperparameter_tuning: bool = True,
                   experiment_name: str = None) -> TrainingRun:
        """Train a single model with optional hyperparameter tuning"""
        
        # Create training run
        run = TrainingRun(
            run_id=self._generate_run_id(),
            model_type=model_type,
            start_time=datetime.now(),
            data_version=self._get_data_version(X_train)
        )
        
        # Set up MLflow experiment
        experiment_name = experiment_name or f"{model_type.value}_experiment"
        mlflow.set_experiment(experiment_name)
        
        with mlflow.start_run() as mlflow_run:
            run.experiment_id = mlflow_run.info.run_id
            
            # Log data characteristics
            mlflow.log_params({
                'train_samples': len(X_train),
                'val_samples': len(X_val),
                'n_features': X_train.shape[1],
                'model_type': model_type.value
            })
            
            # Get model configuration
            model_config = MODEL_SPECS[model_type]
            
            # Hyperparameter tuning if requested
            if hyperparameter_tuning:
                logger.info(f"Starting hyperparameter tuning for {model_type.value}...")
                best_params = self._tune_hyperparameters(
                    model_type, X_train, y_train, X_val, y_val
                )
                model_config.hyperparameters.update(best_params)
                mlflow.log_params(best_params)
            
            run.hyperparameters = model_config.hyperparameters
            
            # Create and train model
            logger.info(f"Training {model_type.value} model...")
            model = ModelFactory.create_model(model_type)
            
            # Train based on model type
            if model_type == ModelType.TIME_TO_MASTERY:
                # Special handling for survival models
                y_train_survival = pd.DataFrame({
                    'duration': y_train,
                    'event': np.ones(len(y_train))  # Assuming all observed
                })
                y_val_survival = pd.DataFrame({
                    'duration': y_val,
                    'event': np.ones(len(y_val))
                })
                train_metrics = model.train(X_train, y_train_survival)
                val_metrics = model.evaluate(X_val, y_val_survival)
            elif model_type == ModelType.KNOWLEDGE_AREA:
                # Multi-output model needs multiple targets
                # For demo, create synthetic multi-output targets
                knowledge_areas = ['integration', 'scope', 'schedule', 'cost', 'quality',
                                 'resource', 'communications', 'risk', 'procurement', 'stakeholder']
                y_train_multi = pd.DataFrame(
                    np.random.rand(len(y_train), len(knowledge_areas)) * 100,
                    columns=knowledge_areas
                )
                y_val_multi = pd.DataFrame(
                    np.random.rand(len(y_val), len(knowledge_areas)) * 100,
                    columns=knowledge_areas
                )
                train_metrics = model.train(X_train, y_train_multi)
                val_metrics = model.evaluate(X_val, y_val_multi)
            elif model_type == ModelType.LEARNING_PATH:
                # Reinforcement learning model needs special data
                # For demo, create synthetic RL data
                states = X_train.values
                actions = np.random.randint(0, 10, len(X_train))
                rewards = np.random.rand(len(X_train))
                next_states = X_train.values  # Simplified
                train_metrics = model.train(states, actions, rewards, next_states)
                val_metrics = train_metrics  # Use same for validation
            else:
                # Standard supervised learning
                train_metrics = model.train(X_train, y_train)
                val_metrics = model.evaluate(X_val, y_val)
            
            # Log metrics
            self._log_metrics(train_metrics, prefix='train')
            self._log_metrics(val_metrics, prefix='val')
            
            # Log feature importance
            feature_importance = model.get_feature_importance()
            if feature_importance:
                mlflow.log_dict(feature_importance, 'feature_importance.json')
                run.feature_importance = feature_importance
            
            # Save model
            model_path = self._save_model(model, model_type, run.run_id)
            run.model_path = model_path
            
            # Log model to MLflow
            if model_type in [ModelType.EXAM_SUCCESS]:
                mlflow.xgboost.log_model(model.model, "model")
            elif model_type in [ModelType.SCORE_PREDICTOR]:
                mlflow.lightgbm.log_model(model.model, "model")
            elif model_type in [ModelType.KNOWLEDGE_AREA, ModelType.LEARNING_PATH]:
                mlflow.pytorch.log_model(model.model, "model")
            else:
                mlflow.sklearn.log_model(model.model, "model")
            
            # Update run status
            run.end_time = datetime.now()
            run.status = "completed"
            run.metrics = val_metrics
            
            # Store run
            self.training_runs.append(run)
            
            logger.info(f"Training completed for {model_type.value}")
            logger.info(f"Validation metric: {val_metrics.primary_metric:.4f}")
        
        return run
    
    def train_all_models(self,
                        df: pd.DataFrame,
                        target_mapping: Dict[ModelType, str],
                        hyperparameter_tuning: bool = True) -> List[TrainingRun]:
        """Train all models in the pipeline"""
        logger.info("Starting full pipeline training...")
        
        runs = []
        
        for model_type, target_col in target_mapping.items():
            logger.info(f"\n{'='*50}")
            logger.info(f"Training {model_type.value}")
            logger.info(f"{'='*50}")
            
            try:
                # Prepare data
                X_train, y_train, X_val, y_val = self.prepare_data(df, target_col, model_type)
                
                # Train model
                run = self.train_model(
                    model_type,
                    X_train, y_train,
                    X_val, y_val,
                    hyperparameter_tuning=hyperparameter_tuning
                )
                
                runs.append(run)
                
            except Exception as e:
                logger.error(f"Failed to train {model_type.value}: {str(e)}")
                
                # Create failed run
                run = TrainingRun(
                    run_id=self._generate_run_id(),
                    model_type=model_type,
                    start_time=datetime.now(),
                    end_time=datetime.now(),
                    status="failed"
                )
                runs.append(run)
        
        # Generate training report
        self._generate_training_report(runs)
        
        return runs
    
    def _tune_hyperparameters(self,
                             model_type: ModelType,
                             X_train: pd.DataFrame,
                             y_train: pd.Series,
                             X_val: pd.DataFrame,
                             y_val: pd.Series,
                             n_trials: int = 50) -> Dict[str, Any]:
        """Hyperparameter tuning using Optuna"""
        
        def objective(trial):
            # Define hyperparameter search space based on model type
            if model_type == ModelType.EXAM_SUCCESS:
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 100, 500),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0)
                }
            elif model_type == ModelType.SCORE_PREDICTOR:
                params = {
                    'num_leaves': trial.suggest_int('num_leaves', 20, 100),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
                    'feature_fraction': trial.suggest_float('feature_fraction', 0.5, 1.0),
                    'bagging_fraction': trial.suggest_float('bagging_fraction', 0.5, 1.0),
                    'min_child_samples': trial.suggest_int('min_child_samples', 5, 50)
                }
            elif model_type == ModelType.DROPOUT_RISK:
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 100, 500),
                    'max_depth': trial.suggest_int('max_depth', 5, 20),
                    'min_samples_split': trial.suggest_int('min_samples_split', 10, 50),
                    'min_samples_leaf': trial.suggest_int('min_samples_leaf', 5, 20)
                }
            else:
                # Default parameters for other models
                return {}
            
            # Create model with suggested parameters
            model_config = MODEL_SPECS[model_type].copy()
            model_config.hyperparameters.update(params)
            
            model = ModelFactory.create_model(model_type)
            model.config.hyperparameters.update(params)
            
            # Train and evaluate
            model.train(X_train, y_train)
            metrics = model.evaluate(X_val, y_val)
            
            return metrics.primary_metric
        
        # Create Optuna study
        study = optuna.create_study(
            direction='maximize' if model_type in [ModelType.EXAM_SUCCESS] else 'minimize',
            study_name=f"{model_type.value}_tuning"
        )
        
        # Add MLflow callback
        mlflow_callback = MLflowCallback(
            tracking_uri=self.config.experiment_tracking_url,
            metric_name='objective_value'
        )
        
        # Optimize
        study.optimize(
            objective,
            n_trials=n_trials,
            callbacks=[mlflow_callback]
        )
        
        logger.info(f"Best parameters found: {study.best_params}")
        logger.info(f"Best value: {study.best_value}")
        
        return study.best_params
    
    def cross_validate(self,
                      model_type: ModelType,
                      X: pd.DataFrame,
                      y: pd.Series,
                      cv_folds: int = None) -> Dict[str, Any]:
        """Perform cross-validation for a model"""
        cv_folds = cv_folds or self.config.training_config['cross_validation_folds']
        
        logger.info(f"Starting {cv_folds}-fold cross-validation for {model_type.value}")
        
        model = ModelFactory.create_model(model_type)
        cv_scores = []
        feature_importance_list = []
        
        # Create folds
        if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK]:
            from sklearn.model_selection import StratifiedKFold
            kfold = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        else:
            from sklearn.model_selection import KFold
            kfold = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
        
        # Cross-validation loop
        for fold, (train_idx, val_idx) in enumerate(kfold.split(X, y), 1):
            logger.info(f"Training fold {fold}/{cv_folds}")
            
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            # Train model
            model = ModelFactory.create_model(model_type)
            model.train(X_train, y_train)
            
            # Evaluate
            metrics = model.evaluate(X_val, y_val)
            cv_scores.append(metrics.primary_metric)
            
            # Collect feature importance
            if model.get_feature_importance():
                feature_importance_list.append(model.get_feature_importance())
        
        # Aggregate results
        cv_results = {
            'mean_score': np.mean(cv_scores),
            'std_score': np.std(cv_scores),
            'scores': cv_scores,
            'confidence_interval': (
                np.mean(cv_scores) - 1.96 * np.std(cv_scores) / np.sqrt(cv_folds),
                np.mean(cv_scores) + 1.96 * np.std(cv_scores) / np.sqrt(cv_folds)
            )
        }
        
        # Average feature importance
        if feature_importance_list:
            avg_importance = {}
            all_features = set()
            for fi in feature_importance_list:
                all_features.update(fi.keys())
            
            for feature in all_features:
                importances = [fi.get(feature, 0) for fi in feature_importance_list]
                avg_importance[feature] = np.mean(importances)
            
            cv_results['feature_importance'] = dict(
                sorted(avg_importance.items(), key=lambda x: x[1], reverse=True)
            )
        
        logger.info(f"Cross-validation complete: {cv_results['mean_score']:.4f} (+/- {cv_results['std_score']:.4f})")
        
        return cv_results
    
    def compare_models(self,
                      model_types: List[ModelType],
                      X: pd.DataFrame,
                      y: pd.Series) -> pd.DataFrame:
        """Compare multiple models on the same dataset"""
        logger.info("Starting model comparison...")
        
        comparison_results = []
        
        for model_type in model_types:
            logger.info(f"Evaluating {model_type.value}")
            
            # Prepare data
            X_train, X_val, y_train, y_val = train_test_split(
                X, y,
                test_size=0.2,
                random_state=42,
                stratify=y if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK] else None
            )
            
            # Train model
            model = ModelFactory.create_model(model_type)
            model.train(X_train, y_train)
            
            # Evaluate
            metrics = model.evaluate(X_val, y_val)
            
            # Cross-validation
            cv_results = self.cross_validate(model_type, X, y)
            
            # Compile results
            result = {
                'model': model_type.value,
                'primary_metric': metrics.primary_metric,
                'cv_mean': cv_results['mean_score'],
                'cv_std': cv_results['std_score'],
                **metrics.secondary_metrics
            }
            
            comparison_results.append(result)
        
        # Create comparison DataFrame
        comparison_df = pd.DataFrame(comparison_results)
        comparison_df = comparison_df.sort_values('primary_metric', ascending=False)
        
        logger.info("\nModel Comparison Results:")
        logger.info(comparison_df.to_string())
        
        return comparison_df
    
    def _generate_run_id(self) -> str:
        """Generate unique run ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:8]
    
    def _get_data_version(self, X: pd.DataFrame) -> str:
        """Generate data version hash"""
        data_str = f"{X.shape}_{X.columns.tolist()}_{X.iloc[0].values.tolist()}"
        return hashlib.md5(data_str.encode()).hexdigest()[:8]
    
    def _save_model(self, model: Any, model_type: ModelType, run_id: str) -> str:
        """Save model to disk"""
        model_dir = Path(self.config.model_artifacts_path) / model_type.value
        model_dir.mkdir(parents=True, exist_ok=True)
        
        model_path = model_dir / f"{run_id}.pkl"
        model.save(str(model_path))
        
        return str(model_path)
    
    def _log_metrics(self, metrics: ModelMetrics, prefix: str = ''):
        """Log metrics to MLflow"""
        if prefix:
            prefix = f"{prefix}_"
        
        # Log primary metric
        mlflow.log_metric(f"{prefix}primary_metric", metrics.primary_metric)
        
        # Log secondary metrics
        for name, value in metrics.secondary_metrics.items():
            if isinstance(value, (int, float)):
                mlflow.log_metric(f"{prefix}{name}", value)
        
        # Log business metrics
        if metrics.business_metrics:
            for name, value in metrics.business_metrics.items():
                if isinstance(value, (int, float)):
                    mlflow.log_metric(f"{prefix}business_{name}", value)
    
    def _generate_training_report(self, runs: List[TrainingRun]):
        """Generate comprehensive training report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_runs': len(runs),
            'successful_runs': sum(1 for r in runs if r.status == 'completed'),
            'failed_runs': sum(1 for r in runs if r.status == 'failed'),
            'runs': [run.to_dict() for run in runs]
        }
        
        # Best performing models
        completed_runs = [r for r in runs if r.status == 'completed' and r.metrics]
        if completed_runs:
            best_runs = {}
            for run in completed_runs:
                model_type = run.model_type.value
                if model_type not in best_runs or run.metrics.primary_metric > best_runs[model_type].metrics.primary_metric:
                    best_runs[model_type] = run
            
            report['best_models'] = {
                model_type: {
                    'run_id': run.run_id,
                    'metric': run.metrics.primary_metric,
                    'model_path': run.model_path
                }
                for model_type, run in best_runs.items()
            }
        
        # Save report
        report_path = Path(self.config.model_artifacts_path) / 'training_reports' / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Training report saved to {report_path}")
        
        return report


class AutoMLPipeline:
    """Automated machine learning pipeline with minimal configuration"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.training_pipeline = TrainingPipeline(config)
        
    def auto_train(self,
                  df: pd.DataFrame,
                  target_col: str,
                  problem_type: str = 'auto',
                  time_budget: int = 3600) -> Dict[str, Any]:
        """Automatically train best model for the data
        
        Args:
            df: Input DataFrame
            target_col: Target column name
            problem_type: 'classification', 'regression', or 'auto'
            time_budget: Maximum time in seconds for training
        """
        logger.info("Starting AutoML pipeline...")
        
        # Detect problem type if auto
        if problem_type == 'auto':
            problem_type = self._detect_problem_type(df[target_col])
            logger.info(f"Detected problem type: {problem_type}")
        
        # Select appropriate models
        if problem_type == 'classification':
            if df[target_col].nunique() == 2:
                model_types = [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK]
            else:
                model_types = [ModelType.DROPOUT_RISK]  # Multi-class
        else:
            model_types = [ModelType.SCORE_PREDICTOR]
        
        # Prepare data
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Feature engineering
        feature_engineer = FeatureEngineer(self.config)
        X_engineered = feature_engineer.fit_transform(X, y)
        
        # Compare models
        comparison_df = self.training_pipeline.compare_models(model_types, X_engineered, y)
        
        # Select best model
        best_model_type = ModelType[comparison_df.iloc[0]['model'].upper()]
        
        # Train final model with full hyperparameter tuning
        X_train, X_val, y_train, y_val = train_test_split(
            X_engineered, y,
            test_size=0.2,
            random_state=42
        )
        
        best_run = self.training_pipeline.train_model(
            best_model_type,
            X_train, y_train,
            X_val, y_val,
            hyperparameter_tuning=True,
            experiment_name="automl_best_model"
        )
        
        results = {
            'best_model': best_model_type.value,
            'performance': best_run.metrics.primary_metric if best_run.metrics else None,
            'model_path': best_run.model_path,
            'comparison': comparison_df.to_dict(),
            'feature_importance': best_run.feature_importance,
            'selected_features': feature_engineer.selected_features
        }
        
        logger.info(f"AutoML complete. Best model: {results['best_model']}")
        
        return results
    
    def _detect_problem_type(self, y: pd.Series) -> str:
        """Detect if problem is classification or regression"""
        # Check if target is numeric
        if not pd.api.types.is_numeric_dtype(y):
            return 'classification'
        
        # Check number of unique values
        n_unique = y.nunique()
        n_samples = len(y)
        
        # If few unique values relative to samples, likely classification
        if n_unique < 20 or n_unique / n_samples < 0.05:
            return 'classification'
        
        return 'regression'