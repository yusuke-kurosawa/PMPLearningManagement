"""
Model Monitoring and Drift Detection System
Real-time monitoring of model performance and data drift
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
from scipy import stats
from scipy.stats import ks_2samp, chi2_contingency, wasserstein_distance
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    mean_squared_error, mean_absolute_error, r2_score
)
import warnings
import logging
from collections import deque, defaultdict
import asyncio
import aiohttp
from prometheus_client import Counter, Histogram, Gauge
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

from ..config import ModelType, PipelineConfig

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics for monitoring
drift_detected = Counter('drift_detected_total', 'Number of drift detections', ['model_type', 'drift_type'])
performance_degradation = Counter('performance_degradation_total', 'Performance degradation events', ['model_type'])
monitoring_alerts = Counter('monitoring_alerts_total', 'Monitoring alerts triggered', ['alert_type', 'severity'])
model_performance_gauge = Gauge('model_performance', 'Current model performance', ['model_type', 'metric'])


@dataclass
class DriftReport:
    """Container for drift detection results"""
    timestamp: datetime
    model_type: ModelType
    drift_type: str  # 'feature', 'prediction', 'performance'
    is_drift_detected: bool
    drift_score: float
    p_value: Optional[float] = None
    affected_features: Optional[List[str]] = None
    severity: str = 'low'  # 'low', 'medium', 'high', 'critical'
    recommendation: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PerformanceReport:
    """Container for performance monitoring results"""
    timestamp: datetime
    model_type: ModelType
    metric_name: str
    current_value: float
    baseline_value: float
    change_percentage: float
    is_degraded: bool
    window_size: int
    confidence_interval: Tuple[float, float]
    trend: str  # 'improving', 'stable', 'degrading'


@dataclass
class Alert:
    """Container for monitoring alerts"""
    timestamp: datetime
    alert_type: str
    severity: str  # 'info', 'warning', 'error', 'critical'
    model_type: Optional[ModelType]
    message: str
    details: Dict[str, Any]
    action_required: bool
    auto_resolved: bool = False


class DriftDetector:
    """Detect various types of drift in ML systems"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.reference_data: Dict[ModelType, pd.DataFrame] = {}
        self.reference_predictions: Dict[ModelType, np.ndarray] = {}
        self.feature_statistics: Dict[ModelType, Dict] = {}
        
    def set_reference_data(self, model_type: ModelType, X: pd.DataFrame, predictions: np.ndarray):
        """Set reference data for drift detection"""
        self.reference_data[model_type] = X
        self.reference_predictions[model_type] = predictions
        self.feature_statistics[model_type] = self._calculate_statistics(X)
        logger.info(f"Reference data set for {model_type.value}")
    
    def detect_feature_drift(self, 
                           model_type: ModelType,
                           current_data: pd.DataFrame,
                           method: str = None) -> DriftReport:
        """Detect drift in feature distributions"""
        
        method = method or self.config.monitoring_config['drift_detection_method']
        
        if model_type not in self.reference_data:
            logger.warning(f"No reference data for {model_type.value}")
            return DriftReport(
                timestamp=datetime.now(),
                model_type=model_type,
                drift_type='feature',
                is_drift_detected=False,
                drift_score=0.0,
                severity='low'
            )
        
        reference = self.reference_data[model_type]
        drift_scores = {}
        p_values = {}
        drifted_features = []
        
        # Check each feature
        for column in reference.columns:
            if column not in current_data.columns:
                continue
            
            ref_values = reference[column].dropna()
            curr_values = current_data[column].dropna()
            
            if len(ref_values) == 0 or len(curr_values) == 0:
                continue
            
            # Apply appropriate test based on data type
            if pd.api.types.is_numeric_dtype(ref_values):
                # Numerical features
                if method == 'kolmogorov_smirnov':
                    statistic, p_value = ks_2samp(ref_values, curr_values)
                elif method == 'wasserstein':
                    statistic = wasserstein_distance(ref_values, curr_values)
                    p_value = None
                elif method == 'population_stability_index':
                    statistic = self._calculate_psi(ref_values, curr_values)
                    p_value = None
                else:
                    statistic, p_value = ks_2samp(ref_values, curr_values)
            else:
                # Categorical features
                statistic, p_value = self._chi_square_test(ref_values, curr_values)
            
            drift_scores[column] = statistic
            if p_value is not None:
                p_values[column] = p_value
                
                # Check if drift detected
                if p_value < self.config.monitoring_config['drift_threshold']:
                    drifted_features.append(column)
            else:
                # For methods without p-value, use threshold on statistic
                if statistic > 0.1:  # PSI threshold
                    drifted_features.append(column)
        
        # Calculate overall drift score
        overall_drift_score = np.mean(list(drift_scores.values()))
        overall_p_value = np.mean(list(p_values.values())) if p_values else None
        
        # Determine severity
        drift_percentage = len(drifted_features) / len(reference.columns)
        if drift_percentage > 0.5:
            severity = 'critical'
        elif drift_percentage > 0.3:
            severity = 'high'
        elif drift_percentage > 0.1:
            severity = 'medium'
        else:
            severity = 'low'
        
        # Generate recommendation
        recommendation = self._generate_drift_recommendation(
            drifted_features, severity, drift_percentage
        )
        
        # Record metric
        if len(drifted_features) > 0:
            drift_detected.labels(model_type=model_type.value, drift_type='feature').inc()
        
        return DriftReport(
            timestamp=datetime.now(),
            model_type=model_type,
            drift_type='feature',
            is_drift_detected=len(drifted_features) > 0,
            drift_score=overall_drift_score,
            p_value=overall_p_value,
            affected_features=drifted_features,
            severity=severity,
            recommendation=recommendation,
            details={
                'drift_scores': drift_scores,
                'p_values': p_values,
                'method': method,
                'threshold': self.config.monitoring_config['drift_threshold']
            }
        )
    
    def detect_prediction_drift(self,
                               model_type: ModelType,
                               current_predictions: np.ndarray) -> DriftReport:
        """Detect drift in model predictions"""
        
        if model_type not in self.reference_predictions:
            logger.warning(f"No reference predictions for {model_type.value}")
            return DriftReport(
                timestamp=datetime.now(),
                model_type=model_type,
                drift_type='prediction',
                is_drift_detected=False,
                drift_score=0.0,
                severity='low'
            )
        
        reference = self.reference_predictions[model_type]
        
        # Perform drift test
        if len(reference.shape) == 1 or reference.shape[1] == 1:
            # Single output
            statistic, p_value = ks_2samp(reference.flatten(), current_predictions.flatten())
        else:
            # Multi-output - average across outputs
            statistics = []
            p_values = []
            for i in range(reference.shape[1]):
                stat, p_val = ks_2samp(reference[:, i], current_predictions[:, i])
                statistics.append(stat)
                p_values.append(p_val)
            statistic = np.mean(statistics)
            p_value = np.mean(p_values)
        
        # Check if drift detected
        is_drift = p_value < self.config.monitoring_config['drift_threshold']
        
        # Determine severity based on KS statistic
        if statistic > 0.5:
            severity = 'critical'
        elif statistic > 0.3:
            severity = 'high'
        elif statistic > 0.1:
            severity = 'medium'
        else:
            severity = 'low'
        
        # Generate recommendation
        if is_drift:
            recommendation = "Significant prediction drift detected. Consider retraining the model with recent data."
        else:
            recommendation = "Predictions are stable. Continue monitoring."
        
        # Record metric
        if is_drift:
            drift_detected.labels(model_type=model_type.value, drift_type='prediction').inc()
        
        return DriftReport(
            timestamp=datetime.now(),
            model_type=model_type,
            drift_type='prediction',
            is_drift_detected=is_drift,
            drift_score=statistic,
            p_value=p_value,
            severity=severity,
            recommendation=recommendation,
            details={
                'ks_statistic': statistic,
                'reference_mean': np.mean(reference),
                'reference_std': np.std(reference),
                'current_mean': np.mean(current_predictions),
                'current_std': np.std(current_predictions)
            }
        )
    
    def detect_concept_drift(self,
                           model_type: ModelType,
                           X: pd.DataFrame,
                           y_true: np.ndarray,
                           y_pred: np.ndarray) -> DriftReport:
        """Detect concept drift through performance degradation"""
        
        # Calculate current performance
        if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK]:
            # Classification metrics
            current_accuracy = accuracy_score(y_true, y_pred)
            current_precision = precision_score(y_true, y_pred, average='weighted')
            current_recall = recall_score(y_true, y_pred, average='weighted')
            primary_metric = current_accuracy
        else:
            # Regression metrics
            current_rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            current_mae = mean_absolute_error(y_true, y_pred)
            current_r2 = r2_score(y_true, y_pred)
            primary_metric = -current_rmse  # Negative for consistency (higher is better)
        
        # Compare with expected performance (would need historical baseline)
        # For demo, using threshold-based detection
        is_drift = False
        severity = 'low'
        
        if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK]:
            if current_accuracy < 0.7:  # Below acceptable threshold
                is_drift = True
                if current_accuracy < 0.5:
                    severity = 'critical'
                elif current_accuracy < 0.6:
                    severity = 'high'
                else:
                    severity = 'medium'
        
        recommendation = "Model performance is degrading. Investigate feature quality and consider retraining." if is_drift else "Model performance is acceptable."
        
        # Record metric
        if is_drift:
            drift_detected.labels(model_type=model_type.value, drift_type='concept').inc()
        
        return DriftReport(
            timestamp=datetime.now(),
            model_type=model_type,
            drift_type='concept',
            is_drift_detected=is_drift,
            drift_score=1 - primary_metric if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK] else abs(primary_metric),
            severity=severity,
            recommendation=recommendation,
            details={
                'performance_metrics': {
                    'accuracy': current_accuracy if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK] else None,
                    'rmse': current_rmse if model_type not in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK] else None
                }
            }
        )
    
    def _calculate_statistics(self, df: pd.DataFrame) -> Dict[str, Dict]:
        """Calculate statistics for reference data"""
        statistics = {}
        
        for column in df.columns:
            if pd.api.types.is_numeric_dtype(df[column]):
                statistics[column] = {
                    'mean': df[column].mean(),
                    'std': df[column].std(),
                    'min': df[column].min(),
                    'max': df[column].max(),
                    'q25': df[column].quantile(0.25),
                    'q50': df[column].quantile(0.50),
                    'q75': df[column].quantile(0.75)
                }
            else:
                statistics[column] = {
                    'unique_values': df[column].nunique(),
                    'mode': df[column].mode()[0] if len(df[column].mode()) > 0 else None,
                    'value_counts': df[column].value_counts().to_dict()
                }
        
        return statistics
    
    def _calculate_psi(self, reference: pd.Series, current: pd.Series, buckets: int = 10) -> float:
        """Calculate Population Stability Index"""
        
        # Create bins
        min_val = min(reference.min(), current.min())
        max_val = max(reference.max(), current.max())
        bins = np.linspace(min_val, max_val, buckets + 1)
        
        # Calculate distributions
        ref_counts, _ = np.histogram(reference, bins=bins)
        curr_counts, _ = np.histogram(current, bins=bins)
        
        # Convert to percentages
        ref_percents = ref_counts / len(reference)
        curr_percents = curr_counts / len(current)
        
        # Calculate PSI
        psi = 0
        for i in range(len(ref_percents)):
            if ref_percents[i] == 0 or curr_percents[i] == 0:
                continue
            psi += (curr_percents[i] - ref_percents[i]) * np.log(curr_percents[i] / ref_percents[i])
        
        return psi
    
    def _chi_square_test(self, reference: pd.Series, current: pd.Series) -> Tuple[float, float]:
        """Perform chi-square test for categorical features"""
        
        # Get unique categories
        categories = list(set(reference.unique()) | set(current.unique()))
        
        # Create contingency table
        ref_counts = reference.value_counts()
        curr_counts = current.value_counts()
        
        contingency_table = pd.DataFrame({
            'reference': [ref_counts.get(cat, 0) for cat in categories],
            'current': [curr_counts.get(cat, 0) for cat in categories]
        })
        
        # Perform chi-square test
        chi2, p_value, _, _ = chi2_contingency(contingency_table.T)
        
        return chi2, p_value
    
    def _generate_drift_recommendation(self, 
                                      drifted_features: List[str],
                                      severity: str,
                                      drift_percentage: float) -> str:
        """Generate actionable recommendations based on drift detection"""
        
        if not drifted_features:
            return "No significant drift detected. Continue regular monitoring."
        
        if severity == 'critical':
            return (f"CRITICAL: {drift_percentage:.1%} of features show significant drift. "
                   f"Immediate action required. Retrain model with recent data. "
                   f"Most affected features: {', '.join(drifted_features[:5])}")
        elif severity == 'high':
            return (f"HIGH: Significant drift detected in {len(drifted_features)} features. "
                   f"Schedule model retraining within 24 hours. "
                   f"Monitor predictions closely for degradation.")
        elif severity == 'medium':
            return (f"MEDIUM: Moderate drift detected in {len(drifted_features)} features. "
                   f"Plan model retraining within the week. "
                   f"Increase monitoring frequency.")
        else:
            return (f"LOW: Minor drift detected in {len(drifted_features)} features. "
                   f"Continue monitoring. No immediate action required.")


class PerformanceMonitor:
    """Monitor model performance over time"""
    
    def __init__(self, config: PipelineConfig = None, window_size: int = 100):
        self.config = config or PipelineConfig()
        self.window_size = window_size
        self.performance_history: Dict[ModelType, Dict[str, deque]] = defaultdict(
            lambda: defaultdict(lambda: deque(maxlen=window_size))
        )
        self.baseline_performance: Dict[ModelType, Dict[str, float]] = {}
        
    def set_baseline(self, model_type: ModelType, metrics: Dict[str, float]):
        """Set baseline performance metrics"""
        self.baseline_performance[model_type] = metrics
        logger.info(f"Baseline set for {model_type.value}: {metrics}")
    
    def update_metrics(self,
                      model_type: ModelType,
                      y_true: np.ndarray,
                      y_pred: np.ndarray,
                      timestamp: Optional[datetime] = None) -> PerformanceReport:
        """Update performance metrics and check for degradation"""
        
        timestamp = timestamp or datetime.now()
        
        # Calculate metrics based on model type
        if model_type in [ModelType.EXAM_SUCCESS, ModelType.DROPOUT_RISK]:
            metrics = {
                'accuracy': accuracy_score(y_true, y_pred),
                'precision': precision_score(y_true, y_pred, average='weighted'),
                'recall': recall_score(y_true, y_pred, average='weighted'),
                'f1': f1_score(y_true, y_pred, average='weighted')
            }
            
            # Add AUC if binary classification
            if len(np.unique(y_true)) == 2:
                try:
                    metrics['auc'] = roc_auc_score(y_true, y_pred)
                except:
                    pass
            
            primary_metric = 'accuracy'
            
        else:
            metrics = {
                'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
                'mae': mean_absolute_error(y_true, y_pred)),
                'r2': r2_score(y_true, y_pred)
            }
            primary_metric = 'rmse'
        
        # Update history
        for metric_name, value in metrics.items():
            self.performance_history[model_type][metric_name].append((timestamp, value))
            
            # Update Prometheus gauge
            model_performance_gauge.labels(model_type=model_type.value, metric=metric_name).set(value)
        
        # Check for degradation
        report = self._check_degradation(model_type, primary_metric, metrics[primary_metric])
        
        return report
    
    def _check_degradation(self,
                          model_type: ModelType,
                          metric_name: str,
                          current_value: float) -> PerformanceReport:
        """Check if performance has degraded"""
        
        # Get baseline
        baseline = self.baseline_performance.get(model_type, {}).get(metric_name)
        if baseline is None:
            baseline = current_value  # Use current as baseline if not set
            if model_type not in self.baseline_performance:
                self.baseline_performance[model_type] = {}
            self.baseline_performance[model_type][metric_name] = baseline
        
        # Calculate change
        if metric_name in ['rmse', 'mae']:  # Lower is better
            change_percentage = (current_value - baseline) / baseline * 100
            is_degraded = current_value > baseline * (1 + self.config.monitoring_config['performance_degradation_threshold'])
        else:  # Higher is better
            change_percentage = (baseline - current_value) / baseline * 100
            is_degraded = current_value < baseline * (1 - self.config.monitoring_config['performance_degradation_threshold'])
        
        # Calculate confidence interval
        history = self.performance_history[model_type][metric_name]
        if len(history) > 1:
            values = [v[1] for v in history]
            mean_val = np.mean(values)
            std_val = np.std(values)
            ci_lower = mean_val - 1.96 * std_val / np.sqrt(len(values))
            ci_upper = mean_val + 1.96 * std_val / np.sqrt(len(values))
        else:
            ci_lower = ci_upper = current_value
        
        # Determine trend
        if len(history) > 10:
            recent_values = [v[1] for v in list(history)[-10:]]
            older_values = [v[1] for v in list(history)[-20:-10]] if len(history) > 20 else recent_values
            
            if metric_name in ['rmse', 'mae']:  # Lower is better
                if np.mean(recent_values) < np.mean(older_values) * 0.95:
                    trend = 'improving'
                elif np.mean(recent_values) > np.mean(older_values) * 1.05:
                    trend = 'degrading'
                else:
                    trend = 'stable'
            else:  # Higher is better
                if np.mean(recent_values) > np.mean(older_values) * 1.05:
                    trend = 'improving'
                elif np.mean(recent_values) < np.mean(older_values) * 0.95:
                    trend = 'degrading'
                else:
                    trend = 'stable'
        else:
            trend = 'stable'
        
        # Record degradation event
        if is_degraded:
            performance_degradation.labels(model_type=model_type.value).inc()
        
        return PerformanceReport(
            timestamp=datetime.now(),
            model_type=model_type,
            metric_name=metric_name,
            current_value=current_value,
            baseline_value=baseline,
            change_percentage=change_percentage,
            is_degraded=is_degraded,
            window_size=len(history),
            confidence_interval=(ci_lower, ci_upper),
            trend=trend
        )
    
    def get_performance_summary(self, model_type: ModelType) -> Dict[str, Any]:
        """Get performance summary for a model"""
        
        if model_type not in self.performance_history:
            return {'error': f'No performance data for {model_type.value}'}
        
        summary = {
            'model_type': model_type.value,
            'metrics': {}
        }
        
        for metric_name, history in self.performance_history[model_type].items():
            if not history:
                continue
            
            values = [v[1] for v in history]
            summary['metrics'][metric_name] = {
                'current': values[-1],
                'mean': np.mean(values),
                'std': np.std(values),
                'min': np.min(values),
                'max': np.max(values),
                'trend': self._calculate_trend(values),
                'baseline': self.baseline_performance.get(model_type, {}).get(metric_name)
            }
        
        return summary
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend from values"""
        if len(values) < 2:
            return 'unknown'
        
        # Simple linear regression
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)
        
        if abs(slope) < 0.001:
            return 'stable'
        elif slope > 0:
            return 'increasing'
        else:
            return 'decreasing'


class AlertManager:
    """Manage monitoring alerts and notifications"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.alerts: List[Alert] = []
        self.alert_history: deque = deque(maxlen=1000)
        self.notification_channels: List[str] = []
        
    async def trigger_alert(self, alert: Alert):
        """Trigger an alert and send notifications"""
        
        # Add to alerts
        self.alerts.append(alert)
        self.alert_history.append(alert)
        
        # Record metric
        monitoring_alerts.labels(alert_type=alert.alert_type, severity=alert.severity).inc()
        
        # Log alert
        logger.warning(f"Alert triggered: {alert.message}")
        
        # Send notifications based on severity
        if alert.severity in ['error', 'critical']:
            await self._send_email_notification(alert)
            await self._send_slack_notification(alert)
        elif alert.severity == 'warning':
            await self._send_slack_notification(alert)
        
        # Auto-remediation for certain alerts
        if alert.action_required and alert.alert_type == 'model_degradation':
            await self._trigger_auto_retrain(alert)
    
    async def _send_email_notification(self, alert: Alert):
        """Send email notification"""
        
        email_config = self.config.monitoring_config.get('alert_email')
        if not email_config:
            return
        
        # Email sending logic would go here
        logger.info(f"Email sent to {email_config} for alert: {alert.message}")
    
    async def _send_slack_notification(self, alert: Alert):
        """Send Slack notification"""
        
        slack_webhook = self.config.monitoring_config.get('slack_webhook')
        if not slack_webhook:
            return
        
        payload = {
            'text': f"*{alert.severity.upper()}*: {alert.message}",
            'attachments': [{
                'color': self._get_severity_color(alert.severity),
                'fields': [
                    {'title': 'Type', 'value': alert.alert_type, 'short': True},
                    {'title': 'Model', 'value': alert.model_type.value if alert.model_type else 'N/A', 'short': True},
                    {'title': 'Timestamp', 'value': alert.timestamp.isoformat(), 'short': False}
                ]
            }]
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                await session.post(slack_webhook, json=payload)
                logger.info(f"Slack notification sent for alert: {alert.message}")
            except Exception as e:
                logger.error(f"Failed to send Slack notification: {str(e)}")
    
    async def _trigger_auto_retrain(self, alert: Alert):
        """Trigger automatic model retraining"""
        
        if not self.config.monitoring_config.get('auto_retrain_enabled'):
            return
        
        # Trigger retraining pipeline
        logger.info(f"Auto-retraining triggered for {alert.model_type.value}")
        # Actual retraining logic would be implemented here
    
    def _get_severity_color(self, severity: str) -> str:
        """Get color for severity level"""
        colors = {
            'info': '#36a64f',
            'warning': '#ff9900',
            'error': '#ff0000',
            'critical': '#8b0000'
        }
        return colors.get(severity, '#808080')
    
    def get_active_alerts(self) -> List[Alert]:
        """Get currently active alerts"""
        return [alert for alert in self.alerts if not alert.auto_resolved]
    
    def resolve_alert(self, alert_id: int):
        """Manually resolve an alert"""
        if 0 <= alert_id < len(self.alerts):
            self.alerts[alert_id].auto_resolved = True
            logger.info(f"Alert {alert_id} resolved")


class MonitoringDashboard:
    """Generate monitoring dashboards and visualizations"""
    
    def __init__(self):
        self.figures = {}
    
    def create_drift_dashboard(self, drift_reports: List[DriftReport]) -> go.Figure:
        """Create drift monitoring dashboard"""
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=['Feature Drift Over Time', 'Drift Severity Distribution',
                          'Affected Features', 'P-Value Distribution'],
            specs=[[{'type': 'scatter'}, {'type': 'bar'}],
                  [{'type': 'bar'}, {'type': 'histogram'}]]
        )
        
        # Drift over time
        timestamps = [r.timestamp for r in drift_reports]
        drift_scores = [r.drift_score for r in drift_reports]
        
        fig.add_trace(
            go.Scatter(x=timestamps, y=drift_scores, mode='lines+markers', name='Drift Score'),
            row=1, col=1
        )
        
        # Severity distribution
        severity_counts = pd.Series([r.severity for r in drift_reports]).value_counts()
        
        fig.add_trace(
            go.Bar(x=severity_counts.index, y=severity_counts.values, name='Severity'),
            row=1, col=2
        )
        
        # Affected features
        all_features = []
        for report in drift_reports:
            if report.affected_features:
                all_features.extend(report.affected_features)
        
        if all_features:
            feature_counts = pd.Series(all_features).value_counts().head(10)
            fig.add_trace(
                go.Bar(x=feature_counts.values, y=feature_counts.index, orientation='h', name='Features'),
                row=2, col=1
            )
        
        # P-value distribution
        p_values = [r.p_value for r in drift_reports if r.p_value is not None]
        
        if p_values:
            fig.add_trace(
                go.Histogram(x=p_values, nbinsx=20, name='P-Values'),
                row=2, col=2
            )
        
        fig.update_layout(height=800, showlegend=False, title_text="Drift Monitoring Dashboard")
        
        return fig
    
    def create_performance_dashboard(self, performance_reports: List[PerformanceReport]) -> go.Figure:
        """Create performance monitoring dashboard"""
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=['Performance Metrics Over Time', 'Performance vs Baseline',
                          'Metric Trends', 'Degradation Events'],
            specs=[[{'type': 'scatter'}, {'type': 'bar'}],
                  [{'type': 'scatter'}, {'type': 'indicator'}]]
        )
        
        # Group by metric
        metrics_data = defaultdict(list)
        for report in performance_reports:
            metrics_data[report.metric_name].append({
                'timestamp': report.timestamp,
                'value': report.current_value,
                'baseline': report.baseline_value
            })
        
        # Performance over time
        colors = px.colors.qualitative.Plotly
        for i, (metric, data) in enumerate(metrics_data.items()):
            timestamps = [d['timestamp'] for d in data]
            values = [d['value'] for d in data]
            
            fig.add_trace(
                go.Scatter(x=timestamps, y=values, mode='lines', name=metric,
                          line=dict(color=colors[i % len(colors)])),
                row=1, col=1
            )
        
        # Performance vs baseline
        latest_reports = {}
        for report in performance_reports:
            if report.metric_name not in latest_reports or report.timestamp > latest_reports[report.metric_name].timestamp:
                latest_reports[report.metric_name] = report
        
        metric_names = list(latest_reports.keys())
        current_values = [latest_reports[m].current_value for m in metric_names]
        baseline_values = [latest_reports[m].baseline_value for m in metric_names]
        
        fig.add_trace(
            go.Bar(x=metric_names, y=current_values, name='Current', marker_color='blue'),
            row=1, col=2
        )
        fig.add_trace(
            go.Bar(x=metric_names, y=baseline_values, name='Baseline', marker_color='gray'),
            row=1, col=2
        )
        
        # Trends
        for i, (metric, data) in enumerate(metrics_data.items()):
            if len(data) > 1:
                timestamps = [d['timestamp'] for d in data]
                values = [d['value'] for d in data]
                
                # Add trend line
                x_numeric = np.arange(len(timestamps))
                z = np.polyfit(x_numeric, values, 1)
                p = np.poly1d(z)
                
                fig.add_trace(
                    go.Scatter(x=timestamps, y=p(x_numeric), mode='lines',
                             name=f'{metric} trend', line=dict(dash='dash')),
                    row=2, col=1
                )
        
        # Degradation indicator
        degradation_count = sum(1 for r in performance_reports if r.is_degraded)
        total_count = len(performance_reports)
        degradation_rate = degradation_count / total_count if total_count > 0 else 0
        
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=degradation_rate * 100,
                title={'text': "Degradation Rate (%)"},
                gauge={'axis': {'range': [None, 100]},
                      'bar': {'color': "red" if degradation_rate > 0.1 else "green"},
                      'steps': [
                          {'range': [0, 10], 'color': "lightgreen"},
                          {'range': [10, 30], 'color': "yellow"},
                          {'range': [30, 100], 'color': "lightcoral"}],
                      'threshold': {'line': {'color': "red", 'width': 4},
                                  'thickness': 0.75, 'value': 10}}),
            row=2, col=2
        )
        
        fig.update_layout(height=800, title_text="Performance Monitoring Dashboard")
        
        return fig