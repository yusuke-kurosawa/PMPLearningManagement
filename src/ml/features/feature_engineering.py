"""
Feature Engineering Pipeline
Automated feature extraction, transformation, and selection
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.feature_selection import SelectKBest, RFE, mutual_info_classif, mutual_info_regression
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from scipy import stats
from scipy.stats import skew, kurtosis
import warnings
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

from ..config import FeatureType, FEATURE_DEFINITIONS, PipelineConfig

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class FeatureMetadata:
    """Metadata for engineered features"""
    name: str
    type: FeatureType
    dtype: str
    importance: float = 0.0
    missing_ratio: float = 0.0
    unique_values: int = 0
    correlation_with_target: float = 0.0
    variance: float = 0.0
    selected: bool = True


class FeatureEngineer:
    """Main feature engineering pipeline"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.feature_metadata: Dict[str, FeatureMetadata] = {}
        self.scalers: Dict[str, Any] = {}
        self.encoders: Dict[str, Any] = {}
        self.selected_features: List[str] = []
        
    def extract_behavioral_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract behavioral features from user activity data"""
        features = pd.DataFrame(index=df.index)
        
        # Study hours per week
        if 'study_sessions' in df.columns:
            features['study_hours_per_week'] = df.groupby('user_id')['session_duration'].transform(
                lambda x: x.sum() / (x.count() / 7) if x.count() > 0 else 0
            )
            
        # Average session duration
        if 'session_duration' in df.columns:
            features['avg_session_duration'] = df.groupby('user_id')['session_duration'].transform('mean')
            features['session_duration_std'] = df.groupby('user_id')['session_duration'].transform('std')
            
        # Study time consistency (coefficient of variation)
        if 'daily_study_time' in df.columns:
            features['study_time_consistency'] = df.groupby('user_id')['daily_study_time'].transform(
                lambda x: x.std() / x.mean() if x.mean() > 0 else 0
            )
            
        # Preferred study time (hour of day)
        if 'session_start_time' in df.columns:
            df['hour'] = pd.to_datetime(df['session_start_time']).dt.hour
            features['preferred_study_time'] = df.groupby('user_id')['hour'].transform(
                lambda x: x.mode()[0] if len(x.mode()) > 0 else x.mean()
            )
            
        # Study break frequency
        if 'break_count' in df.columns:
            features['study_break_frequency'] = df.groupby('user_id')['break_count'].transform('mean')
            
        # Content revisit rate
        if 'content_id' in df.columns:
            features['content_revisit_rate'] = df.groupby(['user_id', 'content_id']).size().groupby('user_id').transform(
                lambda x: (x > 1).sum() / len(x) if len(x) > 0 else 0
            )
            
        # Learning style features
        features['visual_learning_preference'] = df['visual_content_views'] / df['total_content_views']
        features['practice_learning_preference'] = df['practice_questions_attempted'] / df['total_activities']
        
        # Advanced behavioral patterns
        features['learning_momentum'] = self._calculate_learning_momentum(df)
        features['study_pattern_entropy'] = self._calculate_pattern_entropy(df)
        
        return features
    
    def extract_performance_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract performance-related features"""
        features = pd.DataFrame(index=df.index)
        
        # Current and historical scores
        if 'quiz_scores' in df.columns:
            features['current_score'] = df.groupby('user_id')['quiz_scores'].transform('last')
            features['avg_score'] = df.groupby('user_id')['quiz_scores'].transform('mean')
            features['score_std'] = df.groupby('user_id')['quiz_scores'].transform('std')
            features['max_score'] = df.groupby('user_id')['quiz_scores'].transform('max')
            features['min_score'] = df.groupby('user_id')['quiz_scores'].transform('min')
            
        # Score improvement rate
        if 'quiz_scores' in df.columns and 'timestamp' in df.columns:
            features['score_improvement_rate'] = self._calculate_improvement_rate(df, 'quiz_scores')
            
        # Knowledge area performance
        knowledge_areas = ['integration', 'scope', 'schedule', 'cost', 'quality',
                          'resource', 'communications', 'risk', 'procurement', 'stakeholder']
        
        for area in knowledge_areas:
            col_name = f'{area}_score'
            if col_name in df.columns:
                features[f'{area}_mastery'] = df.groupby('user_id')[col_name].transform('mean')
                features[f'{area}_consistency'] = df.groupby('user_id')[col_name].transform('std')
                
        # Process group mastery
        process_groups = ['initiating', 'planning', 'executing', 'monitoring_controlling', 'closing']
        for group in process_groups:
            col_name = f'{group}_score'
            if col_name in df.columns:
                features[f'{group}_mastery'] = df.groupby('user_id')[col_name].transform('mean')
                
        # ITTO recall accuracy
        if 'itto_correct' in df.columns and 'itto_attempted' in df.columns:
            features['itto_recall_accuracy'] = df['itto_correct'] / df['itto_attempted'].replace(0, 1)
            
        # Weak areas identification
        features['weak_areas_count'] = self._identify_weak_areas(df)
        
        # Consecutive correct answers (streak)
        if 'answer_correct' in df.columns:
            features['max_correct_streak'] = self._calculate_max_streak(df, 'answer_correct')
            features['current_streak'] = self._calculate_current_streak(df, 'answer_correct')
            
        # Advanced performance metrics
        features['learning_efficiency'] = features['avg_score'] / features['study_hours_per_week'].replace(0, 1)
        features['performance_volatility'] = features['score_std'] / features['avg_score'].replace(0, 1)
        
        return features
    
    def extract_engagement_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract engagement-related features"""
        features = pd.DataFrame(index=df.index)
        
        # Login frequency
        if 'login_timestamp' in df.columns:
            features['login_frequency'] = df.groupby('user_id')['login_timestamp'].transform('count')
            features['days_between_logins'] = self._calculate_days_between_events(df, 'login_timestamp')
            
        # Content completion
        if 'content_completed' in df.columns:
            features['content_completion_rate'] = df.groupby('user_id')['content_completed'].transform('mean')
            
        # Video engagement
        if 'video_watch_percentage' in df.columns:
            features['avg_video_completion'] = df.groupby('user_id')['video_watch_percentage'].transform('mean')
            features['video_skip_rate'] = (df['video_watch_percentage'] < 0.5).groupby(df['user_id']).transform('mean')
            
        # Interaction depth
        if 'page_views' in df.columns and 'unique_pages' in df.columns:
            features['interaction_depth'] = df['page_views'] / df['unique_pages'].replace(0, 1)
            
        # Forum participation
        if 'forum_posts' in df.columns:
            features['forum_activity_score'] = (
                df['forum_posts'] * 3 + 
                df.get('forum_replies', 0) * 2 + 
                df.get('forum_views', 0)
            )
            
        # Resource utilization
        if 'resources_downloaded' in df.columns:
            features['resource_utilization'] = df['resources_downloaded'] / df.get('resources_available', 1)
            
        # Search behavior
        if 'search_queries' in df.columns:
            features['search_intensity'] = df.groupby('user_id')['search_queries'].transform('count')
            features['search_diversity'] = df.groupby('user_id')['search_queries'].transform('nunique')
            
        # Help-seeking behavior
        if 'help_requests' in df.columns:
            features['help_seeking_rate'] = df.groupby('user_id')['help_requests'].transform('count')
            
        # Engagement consistency
        features['engagement_consistency'] = self._calculate_engagement_consistency(df)
        
        # Multi-channel engagement
        features['channel_diversity'] = self._calculate_channel_diversity(df)
        
        return features
    
    def extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract time-based features"""
        features = pd.DataFrame(index=df.index)
        
        # Days since enrollment
        if 'enrollment_date' in df.columns:
            df['enrollment_date'] = pd.to_datetime(df['enrollment_date'])
            features['days_since_enrollment'] = (datetime.now() - df['enrollment_date']).dt.days
            
        # Study streak
        if 'study_date' in df.columns:
            features['current_study_streak'] = self._calculate_study_streak(df)
            features['max_study_streak'] = df.groupby('user_id')['current_study_streak'].transform('max')
            
        # Time to milestones
        if 'first_quiz_date' in df.columns and 'enrollment_date' in df.columns:
            features['time_to_first_quiz'] = (
                pd.to_datetime(df['first_quiz_date']) - pd.to_datetime(df['enrollment_date'])
            ).dt.days
            
        # Learning velocity
        if 'content_completed' in df.columns and 'days_since_enrollment' in df.columns:
            features['learning_velocity'] = df['content_completed'] / df['days_since_enrollment'].replace(0, 1)
            
        # Peak performance time
        if 'quiz_timestamp' in df.columns and 'quiz_scores' in df.columns:
            features['peak_performance_hour'] = self._identify_peak_performance_time(df)
            
        # Study gap analysis
        if 'study_date' in df.columns:
            features['avg_study_gap'] = self._calculate_avg_study_gap(df)
            features['max_study_gap'] = self._calculate_max_study_gap(df)
            
        # Deadline proximity
        if 'exam_date' in df.columns:
            features['days_to_exam'] = (pd.to_datetime(df['exam_date']) - datetime.now()).dt.days
            features['deadline_pressure'] = 1 / (features['days_to_exam'].replace(0, 1) + 1)
            
        # Seasonal patterns
        features['month_of_year'] = datetime.now().month
        features['day_of_week'] = datetime.now().weekday()
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Time-based momentum
        features['recent_activity_intensity'] = self._calculate_recent_activity(df, days=7)
        features['activity_trend'] = self._calculate_activity_trend(df)
        
        return features
    
    def extract_content_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract content-related features"""
        features = pd.DataFrame(index=df.index)
        
        # Content difficulty preference
        if 'content_difficulty' in df.columns and 'content_views' in df.columns:
            features['preferred_difficulty'] = self._calculate_preferred_difficulty(df)
            features['difficulty_progression'] = self._calculate_difficulty_progression(df)
            
        # Content type preferences
        content_types = ['video', 'text', 'quiz', 'simulation', 'flashcard']
        for ctype in content_types:
            col_name = f'{ctype}_views'
            if col_name in df.columns:
                features[f'{ctype}_preference'] = df[col_name] / df['total_content_views'].replace(0, 1)
                
        # Topic interest scores
        if 'topic_views' in df.columns and 'topic_time_spent' in df.columns:
            features['topic_engagement_score'] = (
                df['topic_views'] * 0.3 + 
                df['topic_time_spent'] * 0.7
            )
            
        # Content consumption patterns
        if 'content_sequence' in df.columns:
            features['linear_progression_rate'] = self._calculate_linear_progression(df)
            features['content_jumping_rate'] = self._calculate_content_jumping(df)
            
        # Reading speed and comprehension
        if 'text_content_words' in df.columns and 'reading_time' in df.columns:
            features['reading_speed_wpm'] = df['text_content_words'] / (df['reading_time'] / 60).replace(0, 1)
            
        # Content rating behavior
        if 'content_ratings' in df.columns:
            features['avg_rating_given'] = df.groupby('user_id')['content_ratings'].transform('mean')
            features['rating_frequency'] = df.groupby('user_id')['content_ratings'].transform('count')
            
        # Content skip patterns
        if 'content_skipped' in df.columns:
            features['content_skip_rate'] = df.groupby('user_id')['content_skipped'].transform('mean')
            
        # Annotation and note-taking
        if 'annotations_created' in df.columns:
            features['annotation_density'] = df['annotations_created'] / df['content_viewed'].replace(0, 1)
            
        return features
    
    def extract_social_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract social and collaborative features"""
        features = pd.DataFrame(index=df.index)
        
        # Study group participation
        if 'study_group_id' in df.columns:
            features['study_group_member'] = (~df['study_group_id'].isna()).astype(int)
            features['study_group_size'] = df.groupby('study_group_id')['user_id'].transform('nunique')
            
        # Peer interaction
        if 'peer_messages_sent' in df.columns:
            features['peer_interaction_score'] = (
                df['peer_messages_sent'] + 
                df.get('peer_messages_received', 0)
            )
            
        # Mentorship engagement
        if 'has_mentor' in df.columns:
            features['mentorship_active'] = df['has_mentor'].astype(int)
            features['mentor_interaction_frequency'] = df.get('mentor_sessions', 0)
            
        # Discussion participation
        if 'discussion_posts' in df.columns:
            features['discussion_contribution_score'] = (
                df['discussion_posts'] * 3 + 
                df.get('discussion_replies', 0) * 2 + 
                df.get('discussion_likes_received', 0)
            )
            
        # Peer help metrics
        if 'help_given' in df.columns and 'help_received' in df.columns:
            features['peer_help_ratio'] = df['help_given'] / (df['help_received'] + 1)
            features['collaboration_score'] = df['help_given'] + df['help_received']
            
        # Network metrics
        if 'connections' in df.columns:
            features['network_size'] = df['connections']
            features['network_growth_rate'] = self._calculate_network_growth(df)
            
        # Influence metrics
        if 'content_shared' in df.columns and 'content_views_from_shares' in df.columns:
            features['influence_score'] = df['content_views_from_shares'] / df['content_shared'].replace(0, 1)
            
        # Community engagement
        features['community_engagement_index'] = self._calculate_community_engagement(df)
        
        return features
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between different feature types"""
        features = pd.DataFrame(index=df.index)
        
        # Performance x Engagement interactions
        if 'avg_score' in df.columns and 'login_frequency' in df.columns:
            features['performance_engagement_ratio'] = df['avg_score'] * df['login_frequency']
            
        # Behavioral x Temporal interactions
        if 'study_hours_per_week' in df.columns and 'days_to_exam' in df.columns:
            features['study_intensity_deadline'] = df['study_hours_per_week'] / df['days_to_exam'].replace(0, 1)
            
        # Content x Performance interactions
        if 'preferred_difficulty' in df.columns and 'avg_score' in df.columns:
            features['difficulty_performance_match'] = 1 - abs(df['preferred_difficulty'] - df['avg_score'] / 100)
            
        # Social x Performance interactions
        if 'collaboration_score' in df.columns and 'score_improvement_rate' in df.columns:
            features['collaborative_learning_effect'] = df['collaboration_score'] * df['score_improvement_rate']
            
        # Engagement x Temporal interactions
        if 'engagement_consistency' in df.columns and 'days_since_enrollment' in df.columns:
            features['sustained_engagement'] = df['engagement_consistency'] * np.log1p(df['days_since_enrollment'])
            
        return features
    
    def create_aggregate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create aggregate and statistical features"""
        features = pd.DataFrame(index=df.index)
        
        # Rolling statistics
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols[:10]:  # Limit to prevent feature explosion
            if col in df.columns:
                # Rolling means
                features[f'{col}_rolling_mean_7d'] = df.groupby('user_id')[col].transform(
                    lambda x: x.rolling(window=7, min_periods=1).mean()
                )
                
                # Rolling std
                features[f'{col}_rolling_std_7d'] = df.groupby('user_id')[col].transform(
                    lambda x: x.rolling(window=7, min_periods=1).std()
                )
                
                # Lag features
                features[f'{col}_lag_1'] = df.groupby('user_id')[col].shift(1)
                features[f'{col}_lag_7'] = df.groupby('user_id')[col].shift(7)
                
                # Difference features
                features[f'{col}_diff_1'] = df.groupby('user_id')[col].diff(1)
                
        # Percentile features
        for col in ['avg_score', 'study_hours_per_week', 'login_frequency']:
            if col in df.columns:
                features[f'{col}_percentile'] = df[col].rank(pct=True)
                
        # Clustering features
        if len(numeric_cols) > 5:
            features['user_cluster'] = self._create_user_clusters(df[numeric_cols[:20]])
            
        return features
    
    def select_features(self, 
                       X: pd.DataFrame, 
                       y: pd.Series,
                       method: str = 'mutual_info',
                       n_features: int = 50) -> pd.DataFrame:
        """Automated feature selection"""
        
        # Remove features with high missing ratio
        missing_ratio = X.isnull().mean()
        valid_features = missing_ratio[missing_ratio < self.config.feature_engineering_config['missing_value_threshold']].index
        X_valid = X[valid_features]
        
        # Remove features with low variance
        variance = X_valid.var()
        high_variance_features = variance[variance > 0.01].index
        X_valid = X_valid[high_variance_features]
        
        # Remove highly correlated features
        correlation_matrix = X_valid.corr().abs()
        upper_triangle = correlation_matrix.where(
            np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
        )
        
        to_drop = [column for column in upper_triangle.columns 
                  if any(upper_triangle[column] > self.config.feature_engineering_config['correlation_threshold'])]
        X_valid = X_valid.drop(columns=to_drop)
        
        # Feature importance-based selection
        if method == 'mutual_info':
            if y.dtype == 'object' or len(y.unique()) < 10:
                selector = SelectKBest(score_func=mutual_info_classif, k=min(n_features, len(X_valid.columns)))
            else:
                selector = SelectKBest(score_func=mutual_info_regression, k=min(n_features, len(X_valid.columns)))
                
        elif method == 'random_forest':
            if y.dtype == 'object' or len(y.unique()) < 10:
                rf = RandomForestClassifier(n_estimators=100, random_state=42)
            else:
                rf = RandomForestRegressor(n_estimators=100, random_state=42)
            
            rf.fit(X_valid.fillna(0), y)
            feature_importance = pd.Series(rf.feature_importances_, index=X_valid.columns)
            selected_features = feature_importance.nlargest(n_features).index
            X_selected = X_valid[selected_features]
            
        elif method == 'rfe':
            estimator = RandomForestRegressor(n_estimators=50, random_state=42)
            selector = RFE(estimator, n_features_to_select=n_features)
            X_selected = pd.DataFrame(
                selector.fit_transform(X_valid.fillna(0), y),
                columns=X_valid.columns[selector.support_],
                index=X_valid.index
            )
        else:
            X_selected = selector.fit_transform(X_valid.fillna(0), y)
            selected_features = X_valid.columns[selector.get_support()]
            X_selected = pd.DataFrame(X_selected, columns=selected_features, index=X_valid.index)
            
        self.selected_features = list(X_selected.columns)
        
        # Update feature metadata
        for feature in self.selected_features:
            self.feature_metadata[feature] = FeatureMetadata(
                name=feature,
                type=self._identify_feature_type(feature),
                dtype=str(X_selected[feature].dtype),
                importance=selector.scores_[list(X_valid.columns).index(feature)] if hasattr(selector, 'scores_') else 0,
                missing_ratio=X_selected[feature].isnull().mean(),
                unique_values=X_selected[feature].nunique(),
                correlation_with_target=X_selected[feature].corr(y),
                variance=X_selected[feature].var(),
                selected=True
            )
            
        logger.info(f"Selected {len(self.selected_features)} features from {len(X.columns)} original features")
        
        return X_selected
    
    def scale_features(self, X: pd.DataFrame, method: str = 'standard') -> pd.DataFrame:
        """Scale features using specified method"""
        X_scaled = X.copy()
        
        if method == 'standard':
            scaler = StandardScaler()
        elif method == 'minmax':
            scaler = MinMaxScaler()
        elif method == 'robust':
            scaler = RobustScaler()
        else:
            raise ValueError(f"Unknown scaling method: {method}")
            
        # Scale only numeric columns
        numeric_cols = X_scaled.select_dtypes(include=[np.number]).columns
        X_scaled[numeric_cols] = scaler.fit_transform(X_scaled[numeric_cols])
        
        self.scalers[method] = scaler
        
        return X_scaled
    
    # Helper methods
    def _calculate_learning_momentum(self, df: pd.DataFrame) -> pd.Series:
        """Calculate learning momentum based on recent progress"""
        if 'progress_rate' not in df.columns:
            return pd.Series(0, index=df.index)
            
        return df.groupby('user_id')['progress_rate'].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean() - x.rolling(window=14, min_periods=1).mean()
        )
    
    def _calculate_pattern_entropy(self, df: pd.DataFrame) -> pd.Series:
        """Calculate entropy of study patterns"""
        if 'study_time' not in df.columns:
            return pd.Series(0, index=df.index)
            
        def entropy(x):
            if len(x) == 0:
                return 0
            p = x.value_counts(normalize=True)
            return -np.sum(p * np.log2(p + 1e-10))
            
        return df.groupby('user_id')['study_time'].transform(entropy)
    
    def _calculate_improvement_rate(self, df: pd.DataFrame, score_col: str) -> pd.Series:
        """Calculate score improvement rate over time"""
        def improvement_rate(group):
            if len(group) < 2:
                return 0
            x = np.arange(len(group))
            y = group[score_col].values
            if np.std(x) == 0 or np.std(y) == 0:
                return 0
            slope, _ = np.polyfit(x, y, 1)
            return slope
            
        return df.groupby('user_id').apply(improvement_rate).reindex(df.index).fillna(0)
    
    def _identify_weak_areas(self, df: pd.DataFrame) -> pd.Series:
        """Identify number of weak knowledge areas"""
        knowledge_areas = ['integration', 'scope', 'schedule', 'cost', 'quality',
                          'resource', 'communications', 'risk', 'procurement', 'stakeholder']
        
        weak_count = pd.Series(0, index=df.index)
        threshold = 0.7  # Consider area weak if score < 70%
        
        for area in knowledge_areas:
            col_name = f'{area}_score'
            if col_name in df.columns:
                weak_count += (df[col_name] < threshold).astype(int)
                
        return weak_count
    
    def _calculate_max_streak(self, df: pd.DataFrame, col: str) -> pd.Series:
        """Calculate maximum consecutive streak"""
        def max_streak(group):
            values = group[col].values
            if len(values) == 0:
                return 0
            
            max_streak = 0
            current_streak = 0
            
            for val in values:
                if val:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 0
                    
            return max_streak
            
        return df.groupby('user_id').apply(max_streak).reindex(df.index).fillna(0)
    
    def _calculate_current_streak(self, df: pd.DataFrame, col: str) -> pd.Series:
        """Calculate current consecutive streak"""
        def current_streak(group):
            values = group[col].values[::-1]  # Reverse to start from most recent
            if len(values) == 0:
                return 0
            
            streak = 0
            for val in values:
                if val:
                    streak += 1
                else:
                    break
                    
            return streak
            
        return df.groupby('user_id').apply(current_streak).reindex(df.index).fillna(0)
    
    def _calculate_days_between_events(self, df: pd.DataFrame, timestamp_col: str) -> pd.Series:
        """Calculate average days between events"""
        def days_between(group):
            timestamps = pd.to_datetime(group[timestamp_col]).sort_values()
            if len(timestamps) < 2:
                return 0
            
            diffs = timestamps.diff().dt.days
            return diffs.mean()
            
        return df.groupby('user_id').apply(days_between).reindex(df.index).fillna(0)
    
    def _calculate_engagement_consistency(self, df: pd.DataFrame) -> pd.Series:
        """Calculate consistency of engagement over time"""
        if 'daily_activity' not in df.columns:
            return pd.Series(1, index=df.index)
            
        return df.groupby('user_id')['daily_activity'].transform(
            lambda x: 1 - (x.std() / x.mean() if x.mean() > 0 else 0)
        )
    
    def _calculate_channel_diversity(self, df: pd.DataFrame) -> pd.Series:
        """Calculate diversity of engagement channels"""
        channels = ['web', 'mobile', 'tablet']
        diversity = pd.Series(0, index=df.index)
        
        for channel in channels:
            col_name = f'{channel}_usage'
            if col_name in df.columns:
                diversity += (df[col_name] > 0).astype(int)
                
        return diversity
    
    def _calculate_study_streak(self, df: pd.DataFrame) -> pd.Series:
        """Calculate current study streak in days"""
        def study_streak(group):
            dates = pd.to_datetime(group['study_date']).sort_values()
            if len(dates) == 0:
                return 0
            
            streak = 1
            for i in range(len(dates) - 1, 0, -1):
                if (dates.iloc[i] - dates.iloc[i-1]).days <= 1:
                    streak += 1
                else:
                    break
                    
            return streak
            
        return df.groupby('user_id').apply(study_streak).reindex(df.index).fillna(0)
    
    def _identify_peak_performance_time(self, df: pd.DataFrame) -> pd.Series:
        """Identify hour of day with best performance"""
        df['hour'] = pd.to_datetime(df['quiz_timestamp']).dt.hour
        
        def peak_hour(group):
            hour_scores = group.groupby('hour')['quiz_scores'].mean()
            if len(hour_scores) == 0:
                return 12  # Default to noon
            return hour_scores.idxmax()
            
        return df.groupby('user_id').apply(peak_hour).reindex(df.index).fillna(12)
    
    def _calculate_avg_study_gap(self, df: pd.DataFrame) -> pd.Series:
        """Calculate average gap between study sessions"""
        def avg_gap(group):
            dates = pd.to_datetime(group['study_date']).sort_values()
            if len(dates) < 2:
                return 0
            
            gaps = dates.diff().dt.days
            return gaps.mean()
            
        return df.groupby('user_id').apply(avg_gap).reindex(df.index).fillna(0)
    
    def _calculate_max_study_gap(self, df: pd.DataFrame) -> pd.Series:
        """Calculate maximum gap between study sessions"""
        def max_gap(group):
            dates = pd.to_datetime(group['study_date']).sort_values()
            if len(dates) < 2:
                return 0
            
            gaps = dates.diff().dt.days
            return gaps.max()
            
        return df.groupby('user_id').apply(max_gap).reindex(df.index).fillna(0)
    
    def _calculate_recent_activity(self, df: pd.DataFrame, days: int = 7) -> pd.Series:
        """Calculate activity intensity in recent days"""
        if 'activity_timestamp' not in df.columns:
            return pd.Series(0, index=df.index)
            
        cutoff_date = datetime.now() - timedelta(days=days)
        df['activity_timestamp'] = pd.to_datetime(df['activity_timestamp'])
        
        return df.groupby('user_id').apply(
            lambda x: (x['activity_timestamp'] > cutoff_date).sum()
        ).reindex(df.index).fillna(0)
    
    def _calculate_activity_trend(self, df: pd.DataFrame) -> pd.Series:
        """Calculate trend in activity over time"""
        if 'daily_activity' not in df.columns:
            return pd.Series(0, index=df.index)
            
        def activity_trend(group):
            if len(group) < 2:
                return 0
            x = np.arange(len(group))
            y = group['daily_activity'].values
            if np.std(x) == 0 or np.std(y) == 0:
                return 0
            slope, _ = np.polyfit(x, y, 1)
            return slope
            
        return df.groupby('user_id').apply(activity_trend).reindex(df.index).fillna(0)
    
    def _calculate_preferred_difficulty(self, df: pd.DataFrame) -> pd.Series:
        """Calculate preferred content difficulty level"""
        def preferred_difficulty(group):
            difficulty_views = group.groupby('content_difficulty')['content_views'].sum()
            if len(difficulty_views) == 0:
                return 0.5  # Default to medium difficulty
            return difficulty_views.idxmax()
            
        return df.groupby('user_id').apply(preferred_difficulty).reindex(df.index).fillna(0.5)
    
    def _calculate_difficulty_progression(self, df: pd.DataFrame) -> pd.Series:
        """Calculate progression in difficulty over time"""
        def difficulty_progression(group):
            if len(group) < 2:
                return 0
            
            group = group.sort_values('timestamp')
            x = np.arange(len(group))
            y = group['content_difficulty'].values
            
            if np.std(x) == 0 or np.std(y) == 0:
                return 0
                
            slope, _ = np.polyfit(x, y, 1)
            return slope
            
        return df.groupby('user_id').apply(difficulty_progression).reindex(df.index).fillna(0)
    
    def _calculate_linear_progression(self, df: pd.DataFrame) -> pd.Series:
        """Calculate rate of linear content progression"""
        def linear_rate(group):
            sequence = group['content_sequence'].values
            if len(sequence) < 2:
                return 1
            
            linear_moves = sum(1 for i in range(1, len(sequence)) if sequence[i] == sequence[i-1] + 1)
            return linear_moves / (len(sequence) - 1) if len(sequence) > 1 else 1
            
        return df.groupby('user_id').apply(linear_rate).reindex(df.index).fillna(1)
    
    def _calculate_content_jumping(self, df: pd.DataFrame) -> pd.Series:
        """Calculate rate of jumping between content"""
        def jumping_rate(group):
            sequence = group['content_sequence'].values
            if len(sequence) < 2:
                return 0
            
            jumps = sum(1 for i in range(1, len(sequence)) if abs(sequence[i] - sequence[i-1]) > 1)
            return jumps / (len(sequence) - 1) if len(sequence) > 1 else 0
            
        return df.groupby('user_id').apply(jumping_rate).reindex(df.index).fillna(0)
    
    def _calculate_network_growth(self, df: pd.DataFrame) -> pd.Series:
        """Calculate network growth rate"""
        def growth_rate(group):
            if 'connections' not in group.columns or len(group) < 2:
                return 0
            
            connections = group['connections'].values
            x = np.arange(len(connections))
            
            if np.std(x) == 0 or np.std(connections) == 0:
                return 0
                
            slope, _ = np.polyfit(x, connections, 1)
            return slope
            
        return df.groupby('user_id').apply(growth_rate).reindex(df.index).fillna(0)
    
    def _calculate_community_engagement(self, df: pd.DataFrame) -> pd.Series:
        """Calculate overall community engagement index"""
        engagement_score = pd.Series(0, index=df.index)
        
        engagement_factors = {
            'forum_posts': 3,
            'forum_replies': 2,
            'content_shared': 2,
            'peer_messages_sent': 1,
            'study_group_participation': 3,
            'mentor_sessions': 4
        }
        
        for factor, weight in engagement_factors.items():
            if factor in df.columns:
                engagement_score += df[factor] * weight
                
        # Normalize to 0-1 scale
        if engagement_score.max() > 0:
            engagement_score = engagement_score / engagement_score.max()
            
        return engagement_score
    
    def _create_user_clusters(self, X: pd.DataFrame, n_clusters: int = 5) -> pd.Series:
        """Create user clusters based on feature patterns"""
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X.fillna(0))
        
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(X_scaled)
        
        return pd.Series(clusters, index=X.index)
    
    def _identify_feature_type(self, feature_name: str) -> FeatureType:
        """Identify feature type from feature name"""
        feature_name_lower = feature_name.lower()
        
        if any(keyword in feature_name_lower for keyword in ['study', 'session', 'break', 'learning_style']):
            return FeatureType.BEHAVIORAL
        elif any(keyword in feature_name_lower for keyword in ['score', 'mastery', 'accuracy', 'streak']):
            return FeatureType.PERFORMANCE
        elif any(keyword in feature_name_lower for keyword in ['login', 'completion', 'video', 'forum', 'search']):
            return FeatureType.ENGAGEMENT
        elif any(keyword in feature_name_lower for keyword in ['days', 'time', 'streak', 'velocity', 'deadline']):
            return FeatureType.TEMPORAL
        elif any(keyword in feature_name_lower for keyword in ['content', 'difficulty', 'topic', 'reading']):
            return FeatureType.CONTENT
        elif any(keyword in feature_name_lower for keyword in ['group', 'peer', 'mentor', 'discussion', 'network']):
            return FeatureType.SOCIAL
        elif any(keyword in feature_name_lower for keyword in ['age', 'education', 'experience', 'location']):
            return FeatureType.DEMOGRAPHIC
        else:
            return FeatureType.BEHAVIORAL  # Default
    
    def fit_transform(self, df: pd.DataFrame, y: pd.Series = None) -> pd.DataFrame:
        """Full feature engineering pipeline"""
        logger.info("Starting feature engineering pipeline...")
        
        # Extract all feature types
        all_features = pd.DataFrame(index=df.index)
        
        logger.info("Extracting behavioral features...")
        behavioral_features = self.extract_behavioral_features(df)
        all_features = pd.concat([all_features, behavioral_features], axis=1)
        
        logger.info("Extracting performance features...")
        performance_features = self.extract_performance_features(df)
        all_features = pd.concat([all_features, performance_features], axis=1)
        
        logger.info("Extracting engagement features...")
        engagement_features = self.extract_engagement_features(df)
        all_features = pd.concat([all_features, engagement_features], axis=1)
        
        logger.info("Extracting temporal features...")
        temporal_features = self.extract_temporal_features(df)
        all_features = pd.concat([all_features, temporal_features], axis=1)
        
        logger.info("Extracting content features...")
        content_features = self.extract_content_features(df)
        all_features = pd.concat([all_features, content_features], axis=1)
        
        logger.info("Extracting social features...")
        social_features = self.extract_social_features(df)
        all_features = pd.concat([all_features, social_features], axis=1)
        
        logger.info("Creating interaction features...")
        interaction_features = self.create_interaction_features(all_features)
        all_features = pd.concat([all_features, interaction_features], axis=1)
        
        logger.info("Creating aggregate features...")
        aggregate_features = self.create_aggregate_features(all_features)
        all_features = pd.concat([all_features, aggregate_features], axis=1)
        
        # Feature selection if target is provided
        if y is not None and self.config.feature_engineering_config['auto_feature_selection']:
            logger.info("Performing automated feature selection...")
            all_features = self.select_features(
                all_features, 
                y,
                method='mutual_info',
                n_features=self.config.feature_engineering_config['max_features']
            )
        
        # Feature scaling
        logger.info("Scaling features...")
        all_features = self.scale_features(
            all_features,
            method=self.config.feature_engineering_config['scaling_method']
        )
        
        logger.info(f"Feature engineering complete. Generated {len(all_features.columns)} features.")
        
        return all_features