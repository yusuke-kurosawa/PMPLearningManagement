"""
Predictive Models Implementation
Multiple model types for different prediction tasks
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
import joblib
import json
from datetime import datetime
import logging

# ML Libraries
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error,
    confusion_matrix, classification_report
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.preprocessing import StandardScaler

# Advanced ML Libraries
import xgboost as xgb
import lightgbm as lgb
from lifelines import CoxPHFitter
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from ..config import ModelType, ModelConfig, MODEL_SPECS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ModelPrediction:
    """Container for model predictions"""
    prediction: Union[float, np.ndarray]
    probability: Optional[np.ndarray] = None
    confidence: Optional[float] = None
    prediction_interval: Optional[Tuple[float, float]] = None
    feature_importance: Optional[Dict[str, float]] = None
    explanation: Optional[str] = None
    metadata: Dict[str, Any] = None


@dataclass
class ModelMetrics:
    """Container for model evaluation metrics"""
    primary_metric: float
    secondary_metrics: Dict[str, float]
    confusion_matrix: Optional[np.ndarray] = None
    feature_importance: Optional[Dict[str, float]] = None
    cross_val_scores: Optional[np.ndarray] = None
    business_metrics: Optional[Dict[str, float]] = None


class BaseModel:
    """Base class for all predictive models"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.model = None
        self.is_fitted = False
        self.feature_names = []
        self.metrics = None
        self.scaler = StandardScaler()
        
    def preprocess(self, X: pd.DataFrame) -> np.ndarray:
        """Preprocess input data"""
        # Handle missing values
        X_processed = X.fillna(X.mean())
        
        # Scale features
        if not self.is_fitted:
            X_scaled = self.scaler.fit_transform(X_processed)
        else:
            X_scaled = self.scaler.transform(X_processed)
            
        return X_scaled
    
    def train(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Train the model"""
        raise NotImplementedError
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Make predictions"""
        raise NotImplementedError
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate model performance"""
        raise NotImplementedError
    
    def save(self, path: str):
        """Save model to disk"""
        model_data = {
            'model': self.model,
            'config': self.config,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'is_fitted': self.is_fitted
        }
        joblib.dump(model_data, path)
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str):
        """Load model from disk"""
        model_data = joblib.load(path)
        self.model = model_data['model']
        self.config = model_data['config']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.metrics = model_data['metrics']
        self.is_fitted = model_data['is_fitted']
        logger.info(f"Model loaded from {path}")
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if hasattr(self.model, 'feature_importances_'):
            importance = dict(zip(self.feature_names, self.model.feature_importances_))
            return dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
        return {}


class ExamSuccessClassifier(BaseModel):
    """Binary classifier for exam pass/fail prediction"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.EXAM_SUCCESS])
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Train exam success classifier"""
        logger.info("Training Exam Success Classifier...")
        
        self.feature_names = list(X.columns)
        X_processed = self.preprocess(X)
        
        # Initialize XGBoost classifier
        self.model = xgb.XGBClassifier(
            **self.config.hyperparameters,
            random_state=42,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        
        # Train with early stopping
        X_train, X_val = X_processed[:int(0.8*len(X))], X_processed[int(0.8*len(X)):]
        y_train, y_val = y[:int(0.8*len(y))], y[int(0.8*len(y)):]
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            early_stopping_rounds=self.config.training_params.get('early_stopping_rounds', 50),
            verbose=False
        )
        
        self.is_fitted = True
        
        # Evaluate performance
        metrics = self.evaluate(X, y)
        self.metrics = metrics
        
        logger.info(f"Training complete. AUC: {metrics.primary_metric:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Predict exam success probability"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        X_processed = self.preprocess(X)
        
        # Get predictions and probabilities
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)
        
        # Calculate confidence
        confidence = np.max(probabilities, axis=1).mean()
        
        # Get feature importance for explanation
        feature_importance = self.get_feature_importance()
        
        # Generate explanation
        if predictions[0] == 1:
            explanation = f"Model predicts PASS with {probabilities[0][1]:.1%} probability"
        else:
            explanation = f"Model predicts FAIL with {probabilities[0][0]:.1%} probability"
        
        return ModelPrediction(
            prediction=predictions,
            probability=probabilities,
            confidence=confidence,
            feature_importance=feature_importance,
            explanation=explanation,
            metadata={'model_type': 'exam_success_classifier'}
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classifier performance"""
        X_processed = self.preprocess(X)
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)[:, 1]
        
        # Calculate metrics
        metrics = ModelMetrics(
            primary_metric=roc_auc_score(y, probabilities),
            secondary_metrics={
                'accuracy': accuracy_score(y, predictions),
                'precision': precision_score(y, predictions),
                'recall': recall_score(y, predictions),
                'f1': f1_score(y, predictions)
            },
            confusion_matrix=confusion_matrix(y, predictions),
            feature_importance=self.get_feature_importance()
        )
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.model, X_processed, y,
            cv=StratifiedKFold(n_splits=5),
            scoring='roc_auc'
        )
        metrics.cross_val_scores = cv_scores
        
        # Business metrics
        tn, fp, fn, tp = metrics.confusion_matrix.ravel()
        metrics.business_metrics = {
            'false_positive_rate': fp / (fp + tn) if (fp + tn) > 0 else 0,
            'false_negative_rate': fn / (fn + tp) if (fn + tp) > 0 else 0,
            'positive_predictive_value': tp / (tp + fp) if (tp + fp) > 0 else 0,
            'negative_predictive_value': tn / (tn + fn) if (tn + fn) > 0 else 0
        }
        
        return metrics


class ScorePredictor(BaseModel):
    """Regression model for exam score prediction"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.SCORE_PREDICTOR])
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Train score predictor"""
        logger.info("Training Score Predictor...")
        
        self.feature_names = list(X.columns)
        X_processed = self.preprocess(X)
        
        # Initialize LightGBM regressor
        self.model = lgb.LGBMRegressor(
            **self.config.hyperparameters,
            random_state=42,
            verbose=-1
        )
        
        # Train with early stopping
        X_train, X_val = X_processed[:int(0.8*len(X))], X_processed[int(0.8*len(X)):]
        y_train, y_val = y[:int(0.8*len(y))], y[int(0.8*len(y)):]
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            eval_metric='rmse',
            callbacks=[lgb.early_stopping(self.config.training_params.get('early_stopping_rounds', 100))],
            verbose=False
        )
        
        self.is_fitted = True
        
        # Train quantile regressors for prediction intervals
        self.quantile_models = {}
        for quantile in self.config.serving_config.get('quantiles', [0.1, 0.9]):
            q_model = lgb.LGBMRegressor(
                **self.config.hyperparameters,
                objective='quantile',
                alpha=quantile,
                random_state=42,
                verbose=-1
            )
            q_model.fit(X_train, y_train)
            self.quantile_models[quantile] = q_model
        
        # Evaluate performance
        metrics = self.evaluate(X, y)
        self.metrics = metrics
        
        logger.info(f"Training complete. RMSE: {metrics.primary_metric:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Predict exam scores with intervals"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        X_processed = self.preprocess(X)
        
        # Get point predictions
        predictions = self.model.predict(X_processed)
        
        # Get prediction intervals
        lower_bound = self.quantile_models[0.1].predict(X_processed)
        upper_bound = self.quantile_models[0.9].predict(X_processed)
        
        # Calculate confidence based on interval width
        interval_width = upper_bound - lower_bound
        confidence = 1 - (interval_width.mean() / 100)  # Normalized by max score
        
        # Ensure predictions are within valid range
        predictions = np.clip(predictions, 0, 100)
        lower_bound = np.clip(lower_bound, 0, 100)
        upper_bound = np.clip(upper_bound, 0, 100)
        
        return ModelPrediction(
            prediction=predictions,
            confidence=confidence,
            prediction_interval=(lower_bound.mean(), upper_bound.mean()),
            feature_importance=self.get_feature_importance(),
            explanation=f"Predicted score: {predictions.mean():.1f} (90% CI: {lower_bound.mean():.1f}-{upper_bound.mean():.1f})",
            metadata={'model_type': 'score_predictor'}
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate regressor performance"""
        X_processed = self.preprocess(X)
        predictions = self.model.predict(X_processed)
        
        # Calculate metrics
        metrics = ModelMetrics(
            primary_metric=np.sqrt(mean_squared_error(y, predictions)),
            secondary_metrics={
                'mae': mean_absolute_error(y, predictions),
                'r2': r2_score(y, predictions),
                'mape': mean_absolute_percentage_error(y, predictions) if y.min() > 0 else 0
            },
            feature_importance=self.get_feature_importance()
        )
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.model, X_processed, y,
            cv=KFold(n_splits=5),
            scoring='neg_root_mean_squared_error'
        )
        metrics.cross_val_scores = -cv_scores
        
        # Business metrics
        metrics.business_metrics = {
            'within_5_points': np.mean(np.abs(predictions - y) <= 5),
            'within_10_points': np.mean(np.abs(predictions - y) <= 10),
            'overestimation_rate': np.mean(predictions > y),
            'underestimation_rate': np.mean(predictions < y)
        }
        
        return metrics


class TimeToMasteryModel(BaseModel):
    """Survival analysis model for time-to-mastery prediction"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.TIME_TO_MASTERY])
        
    def train(self, X: pd.DataFrame, y: pd.DataFrame) -> ModelMetrics:
        """Train survival model
        
        Args:
            X: Features DataFrame
            y: DataFrame with 'duration' and 'event' columns
        """
        logger.info("Training Time-to-Mastery Model...")
        
        self.feature_names = list(X.columns)
        
        # Prepare data for survival analysis
        survival_df = pd.concat([X, y[['duration', 'event']]], axis=1)
        
        # Initialize Cox Proportional Hazards model
        self.model = CoxPHFitter(
            penalizer=self.config.hyperparameters.get('penalizer', 0.1),
            l1_ratio=self.config.hyperparameters.get('l1_ratio', 0.5)
        )
        
        # Fit the model
        self.model.fit(
            survival_df,
            duration_col='duration',
            event_col='event',
            show_progress=False
        )
        
        self.is_fitted = True
        
        # Evaluate performance
        metrics = self.evaluate(X, y)
        self.metrics = metrics
        
        logger.info(f"Training complete. C-Index: {metrics.primary_metric:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Predict survival probabilities and median time"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        # Get survival predictions
        survival_functions = self.model.predict_survival_function(X)
        median_survival = self.model.predict_median(X)
        
        # Calculate survival probabilities at specific time points
        time_points = self.config.serving_config.get('survival_probabilities', [7, 14, 30, 60, 90])
        survival_probs = {}
        
        for t in time_points:
            if t in survival_functions.index:
                survival_probs[f'day_{t}'] = survival_functions.loc[t].values
            else:
                # Interpolate if exact time point not available
                survival_probs[f'day_{t}'] = survival_functions.iloc[
                    (survival_functions.index - t).abs().argsort()[0]
                ].values
        
        # Calculate hazard ratios for feature importance
        hazard_ratios = np.exp(self.model.params_)
        feature_importance = dict(zip(self.model.params_.index, hazard_ratios))
        
        return ModelPrediction(
            prediction=median_survival.values,
            probability=pd.DataFrame(survival_probs),
            confidence=self.model.concordance_index_,
            feature_importance=feature_importance,
            explanation=f"Median time to mastery: {median_survival.mean():.1f} days",
            metadata={
                'model_type': 'time_to_mastery',
                'survival_probabilities': survival_probs
            }
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.DataFrame) -> ModelMetrics:
        """Evaluate survival model performance"""
        # Calculate concordance index
        c_index = self.model.concordance_index_
        
        metrics = ModelMetrics(
            primary_metric=c_index,
            secondary_metrics={
                'log_likelihood': self.model.log_likelihood_,
                'AIC': self.model.AIC_,
                'BIC': self.model.BIC_
            }
        )
        
        # Get hazard ratios and confidence intervals
        summary = self.model.summary
        metrics.business_metrics = {
            'significant_features': len(summary[summary['p'] < 0.05]),
            'avg_hazard_ratio': np.exp(self.model.params_).mean()
        }
        
        return metrics


class KnowledgeAreaPredictor(BaseModel):
    """Multi-output neural network for knowledge area performance"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.KNOWLEDGE_AREA])
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def _build_network(self, input_dim: int, output_dim: int):
        """Build neural network architecture"""
        
        class MultiOutputNN(nn.Module):
            def __init__(self, input_dim, hidden_layers, output_dim, dropout_rate=0.3):
                super().__init__()
                
                layers = []
                prev_dim = input_dim
                
                for hidden_dim in hidden_layers:
                    layers.append(nn.Linear(prev_dim, hidden_dim))
                    layers.append(nn.BatchNorm1d(hidden_dim))
                    layers.append(nn.ReLU())
                    layers.append(nn.Dropout(dropout_rate))
                    prev_dim = hidden_dim
                
                layers.append(nn.Linear(prev_dim, output_dim))
                layers.append(nn.Sigmoid())  # Output between 0 and 1
                
                self.network = nn.Sequential(*layers)
            
            def forward(self, x):
                return self.network(x) * 100  # Scale to 0-100
        
        return MultiOutputNN(
            input_dim,
            self.config.hyperparameters['hidden_layers'],
            output_dim,
            self.config.hyperparameters.get('dropout_rate', 0.3)
        )
    
    def train(self, X: pd.DataFrame, y: pd.DataFrame) -> ModelMetrics:
        """Train multi-output neural network
        
        Args:
            X: Features DataFrame
            y: DataFrame with columns for each knowledge area score
        """
        logger.info("Training Knowledge Area Predictor...")
        
        self.feature_names = list(X.columns)
        self.output_areas = list(y.columns)
        
        X_processed = self.preprocess(X)
        y_scaled = y.values / 100  # Scale to 0-1
        
        # Convert to tensors
        X_tensor = torch.FloatTensor(X_processed).to(self.device)
        y_tensor = torch.FloatTensor(y_scaled).to(self.device)
        
        # Create data loader
        dataset = TensorDataset(X_tensor, y_tensor)
        train_size = int(0.8 * len(dataset))
        val_size = len(dataset) - train_size
        train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
        
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config.training_params.get('batch_size', 64),
            shuffle=True
        )
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config.training_params.get('batch_size', 64)
        )
        
        # Initialize model
        self.model = self._build_network(X_processed.shape[1], len(self.output_areas)).to(self.device)
        
        # Training setup
        criterion = nn.MSELoss()
        optimizer = optim.Adam(
            self.model.parameters(),
            lr=self.config.training_params.get('learning_rate', 0.001)
        )
        
        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0
        patience = self.config.training_params.get('early_stopping_patience', 20)
        
        for epoch in range(self.config.training_params.get('epochs', 200)):
            # Training
            self.model.train()
            train_loss = 0
            for batch_X, batch_y in train_loader:
                optimizer.zero_grad()
                outputs = self.model(batch_X) / 100  # Scale back to 0-1
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                train_loss += loss.item()
            
            # Validation
            self.model.eval()
            val_loss = 0
            with torch.no_grad():
                for batch_X, batch_y in val_loader:
                    outputs = self.model(batch_X) / 100
                    loss = criterion(outputs, batch_y)
                    val_loss += loss.item()
            
            val_loss /= len(val_loader)
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                # Save best model
                self.best_model_state = self.model.state_dict()
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
        
        # Load best model
        self.model.load_state_dict(self.best_model_state)
        self.is_fitted = True
        
        # Evaluate performance
        metrics = self.evaluate(X, y)
        self.metrics = metrics
        
        logger.info(f"Training complete. Average RMSE: {metrics.primary_metric:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Predict knowledge area scores"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        X_processed = self.preprocess(X)
        X_tensor = torch.FloatTensor(X_processed).to(self.device)
        
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(X_tensor).cpu().numpy()
        
        # Create prediction DataFrame
        predictions_df = pd.DataFrame(predictions, columns=self.output_areas)
        
        # Calculate confidence based on prediction variance
        confidence = 1 - (predictions.std() / predictions.mean())
        
        return ModelPrediction(
            prediction=predictions_df,
            confidence=confidence,
            explanation=f"Predicted scores for {len(self.output_areas)} knowledge areas",
            metadata={
                'model_type': 'knowledge_area_predictor',
                'areas': self.output_areas
            }
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.DataFrame) -> ModelMetrics:
        """Evaluate multi-output model performance"""
        predictions = self.predict(X).prediction
        
        # Calculate metrics for each area
        area_metrics = {}
        for area in self.output_areas:
            area_metrics[area] = {
                'rmse': np.sqrt(mean_squared_error(y[area], predictions[area])),
                'mae': mean_absolute_error(y[area], predictions[area]),
                'r2': r2_score(y[area], predictions[area])
            }
        
        # Average metrics across all areas
        avg_rmse = np.mean([m['rmse'] for m in area_metrics.values()])
        avg_mae = np.mean([m['mae'] for m in area_metrics.values()])
        avg_r2 = np.mean([m['r2'] for m in area_metrics.values()])
        
        metrics = ModelMetrics(
            primary_metric=avg_rmse,
            secondary_metrics={
                'avg_mae': avg_mae,
                'avg_r2': avg_r2,
                'area_metrics': area_metrics
            }
        )
        
        # Business metrics
        metrics.business_metrics = {
            'areas_above_threshold': np.mean(predictions.mean() > 70),
            'weakest_area': predictions.mean().idxmin(),
            'strongest_area': predictions.mean().idxmax()
        }
        
        return metrics


class LearningPathOptimizer(BaseModel):
    """Deep Q-Network for learning path optimization"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.LEARNING_PATH])
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.replay_buffer = []
        
    def _build_dqn(self, state_dim: int, action_dim: int):
        """Build Deep Q-Network"""
        
        class DQN(nn.Module):
            def __init__(self, state_dim, action_dim, hidden_layers):
                super().__init__()
                
                layers = []
                prev_dim = state_dim
                
                for hidden_dim in hidden_layers:
                    layers.append(nn.Linear(prev_dim, hidden_dim))
                    layers.append(nn.ReLU())
                    prev_dim = hidden_dim
                
                layers.append(nn.Linear(prev_dim, action_dim))
                
                self.network = nn.Sequential(*layers)
            
            def forward(self, x):
                return self.network(x)
        
        return DQN(
            state_dim,
            action_dim,
            self.config.hyperparameters['hidden_layers']
        )
    
    def train(self, states: np.ndarray, actions: np.ndarray, rewards: np.ndarray, next_states: np.ndarray) -> ModelMetrics:
        """Train DQN for learning path optimization"""
        logger.info("Training Learning Path Optimizer...")
        
        state_dim = states.shape[1]
        action_dim = len(np.unique(actions))
        
        # Initialize Q-network and target network
        self.q_network = self._build_dqn(state_dim, action_dim).to(self.device)
        self.target_network = self._build_dqn(state_dim, action_dim).to(self.device)
        self.target_network.load_state_dict(self.q_network.state_dict())
        
        optimizer = optim.Adam(
            self.q_network.parameters(),
            lr=self.config.training_params.get('learning_rate', 0.001)
        )
        
        # Training parameters
        batch_size = self.config.training_params.get('batch_size', 32)
        gamma = self.config.hyperparameters.get('gamma', 0.99)
        epsilon = self.config.hyperparameters.get('epsilon', 0.1)
        tau = self.config.hyperparameters.get('tau', 0.001)
        
        # Populate replay buffer
        for i in range(len(states)):
            self.replay_buffer.append((states[i], actions[i], rewards[i], next_states[i]))
        
        # Training loop
        num_episodes = 1000
        for episode in range(num_episodes):
            if len(self.replay_buffer) < batch_size:
                continue
            
            # Sample batch from replay buffer
            batch_indices = np.random.choice(len(self.replay_buffer), batch_size, replace=False)
            batch = [self.replay_buffer[i] for i in batch_indices]
            
            batch_states = torch.FloatTensor([s[0] for s in batch]).to(self.device)
            batch_actions = torch.LongTensor([s[1] for s in batch]).to(self.device)
            batch_rewards = torch.FloatTensor([s[2] for s in batch]).to(self.device)
            batch_next_states = torch.FloatTensor([s[3] for s in batch]).to(self.device)
            
            # Compute Q values
            current_q_values = self.q_network(batch_states).gather(1, batch_actions.unsqueeze(1))
            
            # Compute target Q values
            with torch.no_grad():
                next_q_values = self.target_network(batch_next_states).max(1)[0]
                target_q_values = batch_rewards + gamma * next_q_values
            
            # Compute loss
            loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
            
            # Optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            # Soft update target network
            for target_param, param in zip(self.target_network.parameters(), self.q_network.parameters()):
                target_param.data.copy_(tau * param.data + (1 - tau) * target_param.data)
        
        self.model = self.q_network
        self.is_fitted = True
        
        logger.info("Training complete")
        
        # Return dummy metrics for now
        return ModelMetrics(
            primary_metric=0.0,
            secondary_metrics={'episodes_trained': num_episodes}
        )
    
    def predict(self, state: np.ndarray) -> ModelPrediction:
        """Predict optimal action for given state"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        state_tensor = torch.FloatTensor(state).to(self.device)
        
        # Epsilon-greedy action selection
        epsilon = self.config.serving_config.get('exploration_rate', 0.05)
        
        if np.random.random() < epsilon:
            # Random action
            action = np.random.randint(0, self.config.hyperparameters['action_dim'])
        else:
            # Greedy action
            with torch.no_grad():
                q_values = self.model(state_tensor)
                action = q_values.argmax().item()
        
        # Get top k recommendations
        k = self.config.serving_config.get('recommendation_count', 5)
        with torch.no_grad():
            q_values = self.model(state_tensor).cpu().numpy()
            top_k_actions = np.argsort(q_values)[-k:][::-1]
        
        return ModelPrediction(
            prediction=action,
            probability=q_values,
            explanation=f"Recommended action: {action} (Q-value: {q_values[action]:.2f})",
            metadata={
                'model_type': 'learning_path_optimizer',
                'top_k_recommendations': top_k_actions.tolist(),
                'q_values': q_values.tolist()
            }
        )
    
    def evaluate(self, states: np.ndarray, optimal_actions: np.ndarray) -> ModelMetrics:
        """Evaluate DQN performance"""
        predicted_actions = []
        
        for state in states:
            prediction = self.predict(state)
            predicted_actions.append(prediction.prediction)
        
        accuracy = np.mean(np.array(predicted_actions) == optimal_actions)
        
        return ModelMetrics(
            primary_metric=accuracy,
            secondary_metrics={'action_accuracy': accuracy}
        )


class DropoutRiskClassifier(BaseModel):
    """Random Forest classifier for dropout risk assessment"""
    
    def __init__(self, config: ModelConfig = None):
        super().__init__(config or MODEL_SPECS[ModelType.DROPOUT_RISK])
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Train dropout risk classifier"""
        logger.info("Training Dropout Risk Classifier...")
        
        self.feature_names = list(X.columns)
        X_processed = self.preprocess(X)
        
        # Initialize Random Forest
        self.model = RandomForestClassifier(
            **self.config.hyperparameters,
            random_state=42
        )
        
        # Train model
        self.model.fit(X_processed, y)
        self.is_fitted = True
        
        # Evaluate performance
        metrics = self.evaluate(X, y)
        self.metrics = metrics
        
        logger.info(f"Training complete. Precision@20: {metrics.primary_metric:.4f}")
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Predict dropout risk"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before prediction")
        
        X_processed = self.preprocess(X)
        
        # Get predictions and probabilities
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)
        
        # Map to risk levels
        risk_levels = self.config.serving_config['risk_levels']
        risk_mapping = {
            0: risk_levels[0],  # low
            1: risk_levels[1],  # medium
            2: risk_levels[2],  # high
            3: risk_levels[3]   # critical
        }
        
        # Determine risk level based on probability
        risk_level = []
        for prob in probabilities[:, 1]:  # Probability of dropout
            if prob < 0.25:
                risk_level.append(risk_levels[0])
            elif prob < 0.5:
                risk_level.append(risk_levels[1])
            elif prob < 0.75:
                risk_level.append(risk_levels[2])
            else:
                risk_level.append(risk_levels[3])
        
        # Identify students needing intervention
        intervention_threshold = self.config.serving_config['intervention_threshold']
        needs_intervention = probabilities[:, 1] >= intervention_threshold
        
        return ModelPrediction(
            prediction=predictions,
            probability=probabilities,
            confidence=self.model.oob_score_ if hasattr(self.model, 'oob_score_') else None,
            feature_importance=self.get_feature_importance(),
            explanation=f"Risk Level: {risk_level[0]} (Dropout probability: {probabilities[0, 1]:.1%})",
            metadata={
                'model_type': 'dropout_risk_classifier',
                'risk_levels': risk_level,
                'needs_intervention': needs_intervention.tolist()
            }
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classifier with focus on precision at k"""
        X_processed = self.preprocess(X)
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)[:, 1]
        
        # Calculate precision at k
        k_values = self.config.monitoring_config['k_values']
        precision_at_k = {}
        
        for k in k_values:
            # Get top k predictions
            top_k_indices = np.argsort(probabilities)[-k:]
            precision_at_k[f'precision@{k}'] = np.mean(y.iloc[top_k_indices])
        
        # Standard metrics
        metrics = ModelMetrics(
            primary_metric=precision_at_k[f'precision@{k_values[0]}'],
            secondary_metrics={
                'accuracy': accuracy_score(y, predictions),
                'precision': precision_score(y, predictions),
                'recall': recall_score(y, predictions),
                'f1': f1_score(y, predictions),
                'auc': roc_auc_score(y, probabilities),
                **precision_at_k
            },
            confusion_matrix=confusion_matrix(y, predictions),
            feature_importance=self.get_feature_importance()
        )
        
        # Business metrics with cost analysis
        tn, fp, fn, tp = metrics.confusion_matrix.ravel()
        fp_cost = self.config.monitoring_config['false_positive_cost']
        fn_cost = self.config.monitoring_config['false_negative_cost']
        
        metrics.business_metrics = {
            'total_cost': fp * fp_cost + fn * fn_cost,
            'cost_per_student': (fp * fp_cost + fn * fn_cost) / len(y),
            'intervention_rate': np.mean(predictions),
            'dropout_prevention_rate': tp / (tp + fn) if (tp + fn) > 0 else 0
        }
        
        return metrics


class ModelFactory:
    """Factory class for creating and managing models"""
    
    @staticmethod
    def create_model(model_type: ModelType) -> BaseModel:
        """Create a model instance based on type"""
        model_map = {
            ModelType.EXAM_SUCCESS: ExamSuccessClassifier,
            ModelType.SCORE_PREDICTOR: ScorePredictor,
            ModelType.TIME_TO_MASTERY: TimeToMasteryModel,
            ModelType.KNOWLEDGE_AREA: KnowledgeAreaPredictor,
            ModelType.LEARNING_PATH: LearningPathOptimizer,
            ModelType.DROPOUT_RISK: DropoutRiskClassifier
        }
        
        model_class = model_map.get(model_type)
        if not model_class:
            raise ValueError(f"Unknown model type: {model_type}")
        
        return model_class()
    
    @staticmethod
    def create_ensemble(model_types: List[ModelType], weights: Optional[List[float]] = None) -> 'EnsembleModel':
        """Create an ensemble of models"""
        models = [ModelFactory.create_model(mt) for mt in model_types]
        return EnsembleModel(models, weights)


class EnsembleModel:
    """Ensemble of multiple models for improved predictions"""
    
    def __init__(self, models: List[BaseModel], weights: Optional[List[float]] = None):
        self.models = models
        self.weights = weights or [1.0 / len(models)] * len(models)
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, ModelMetrics]:
        """Train all models in ensemble"""
        metrics = {}
        for i, model in enumerate(self.models):
            logger.info(f"Training model {i+1}/{len(self.models)}: {model.__class__.__name__}")
            metrics[model.__class__.__name__] = model.train(X, y)
        return metrics
    
    def predict(self, X: pd.DataFrame) -> ModelPrediction:
        """Make ensemble predictions"""
        predictions = []
        probabilities = []
        
        for model, weight in zip(self.models, self.weights):
            pred = model.predict(X)
            predictions.append(pred.prediction * weight)
            if pred.probability is not None:
                probabilities.append(pred.probability * weight)
        
        # Weighted average
        ensemble_prediction = np.sum(predictions, axis=0)
        ensemble_probability = np.sum(probabilities, axis=0) if probabilities else None
        
        return ModelPrediction(
            prediction=ensemble_prediction,
            probability=ensemble_probability,
            explanation="Ensemble prediction from multiple models",
            metadata={'ensemble_size': len(self.models)}
        )
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, ModelMetrics]:
        """Evaluate all models in ensemble"""
        metrics = {}
        for model in self.models:
            metrics[model.__class__.__name__] = model.evaluate(X, y)
        return metrics