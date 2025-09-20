"""
Data Quality Validation System
Comprehensive data validation and quality checks
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import logging
from scipy import stats
import great_expectations as ge
from great_expectations.dataset import PandasDataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ValidationRule:
    """Data validation rule definition"""
    name: str
    column: Optional[str]
    rule_type: str  # 'completeness', 'uniqueness', 'range', 'format', 'statistical'
    parameters: Dict[str, Any]
    severity: str = 'warning'  # 'info', 'warning', 'error', 'critical'
    description: Optional[str] = None


@dataclass 
class ValidationReport:
    """Data validation report"""
    timestamp: datetime
    is_valid: bool
    total_checks: int
    passed_checks: int
    failed_checks: int
    issues: List[Dict[str, Any]]
    statistics: Dict[str, Any]
    recommendations: List[str]
    data_quality_score: float


class DataValidator:
    """Comprehensive data validation system"""
    
    def __init__(self, config=None):
        self.config = config
        self.validation_rules: List[ValidationRule] = []
        self._setup_default_rules()
        
    def _setup_default_rules(self):
        """Setup default validation rules"""
        
        # Completeness rules
        self.validation_rules.extend([
            ValidationRule(
                name="no_empty_dataset",
                column=None,
                rule_type="completeness",
                parameters={"min_rows": 10},
                severity="critical",
                description="Dataset must have at least 10 rows"
            ),
            ValidationRule(
                name="missing_value_threshold",
                column=None,
                rule_type="completeness",
                parameters={"max_missing_ratio": 0.3},
                severity="warning",
                description="Columns should not have more than 30% missing values"
            )
        ])
        
        # Statistical rules
        self.validation_rules.extend([
            ValidationRule(
                name="outlier_detection",
                column=None,
                rule_type="statistical",
                parameters={"method": "iqr", "threshold": 3},
                severity="info",
                description="Detect statistical outliers"
            ),
            ValidationRule(
                name="distribution_check",
                column=None,
                rule_type="statistical",
                parameters={"test": "normaltest"},
                severity="info",
                description="Check distribution properties"
            )
        ])
    
    def validate(self, df: pd.DataFrame, target_col: Optional[str] = None) -> ValidationReport:
        """Perform comprehensive data validation"""
        
        logger.info("Starting data validation...")
        issues = []
        passed = 0
        failed = 0
        
        # Basic checks
        if df.empty:
            issues.append({
                'type': 'critical',
                'message': 'Dataset is empty',
                'details': {}
            })
            failed += 1
        else:
            passed += 1
        
        # Shape validation
        if len(df) < 10:
            issues.append({
                'type': 'warning',
                'message': f'Dataset has only {len(df)} rows',
                'details': {'row_count': len(df)}
            })
            failed += 1
        else:
            passed += 1
        
        # Missing value analysis
        missing_report = self._check_missing_values(df)
        if missing_report['has_issues']:
            issues.extend(missing_report['issues'])
            failed += missing_report['failed_checks']
        passed += missing_report['passed_checks']
        
        # Duplicate detection
        duplicate_report = self._check_duplicates(df)
        if duplicate_report['has_duplicates']:
            issues.append(duplicate_report['issue'])
            failed += 1
        else:
            passed += 1
        
        # Data type validation
        dtype_report = self._validate_data_types(df)
        issues.extend(dtype_report['issues'])
        passed += dtype_report['passed']
        failed += dtype_report['failed']
        
        # Statistical validation
        stat_report = self._statistical_validation(df)
        issues.extend(stat_report['issues'])
        passed += stat_report['passed']
        failed += stat_report['failed']
        
        # Target variable validation
        if target_col and target_col in df.columns:
            target_report = self._validate_target(df[target_col])
            issues.extend(target_report['issues'])
            passed += target_report['passed']
            failed += target_report['failed']
        
        # Calculate data quality score
        total_checks = passed + failed
        quality_score = (passed / total_checks * 100) if total_checks > 0 else 0
        
        # Generate recommendations
        recommendations = self._generate_recommendations(issues)
        
        # Compile statistics
        statistics = self._calculate_statistics(df)
        
        return ValidationReport(
            timestamp=datetime.now(),
            is_valid=len([i for i in issues if i['type'] in ['error', 'critical']]) == 0,
            total_checks=total_checks,
            passed_checks=passed,
            failed_checks=failed,
            issues=issues,
            statistics=statistics,
            recommendations=recommendations,
            data_quality_score=quality_score
        )
    
    def _check_missing_values(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Check for missing values"""
        
        issues = []
        passed = 0
        failed = 0
        
        # Overall missing ratio
        total_missing = df.isnull().sum().sum()
        total_values = df.size
        missing_ratio = total_missing / total_values
        
        if missing_ratio > 0.1:
            issues.append({
                'type': 'warning',
                'message': f'High overall missing ratio: {missing_ratio:.2%}',
                'details': {'missing_ratio': missing_ratio}
            })
            failed += 1
        else:
            passed += 1
        
        # Per-column missing values
        for col in df.columns:
            col_missing_ratio = df[col].isnull().mean()
            
            if col_missing_ratio > 0.3:
                issues.append({
                    'type': 'warning',
                    'message': f'Column {col} has {col_missing_ratio:.2%} missing values',
                    'details': {'column': col, 'missing_ratio': col_missing_ratio}
                })
                failed += 1
            else:
                passed += 1
        
        return {
            'has_issues': len(issues) > 0,
            'issues': issues,
            'passed_checks': passed,
            'failed_checks': failed
        }
    
    def _check_duplicates(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Check for duplicate rows"""
        
        duplicates = df.duplicated().sum()
        
        if duplicates > 0:
            return {
                'has_duplicates': True,
                'issue': {
                    'type': 'warning',
                    'message': f'Found {duplicates} duplicate rows',
                    'details': {'duplicate_count': duplicates, 'duplicate_ratio': duplicates / len(df)}
                }
            }
        
        return {'has_duplicates': False}
    
    def _validate_data_types(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Validate data types"""
        
        issues = []
        passed = 0
        failed = 0
        
        for col in df.columns:
            # Check for mixed types
            if df[col].dtype == 'object':
                # Try to infer better type
                try:
                    pd.to_numeric(df[col])
                    issues.append({
                        'type': 'info',
                        'message': f'Column {col} could be numeric',
                        'details': {'column': col, 'current_type': 'object', 'suggested_type': 'numeric'}
                    })
                    failed += 1
                except:
                    try:
                        pd.to_datetime(df[col])
                        issues.append({
                            'type': 'info',
                            'message': f'Column {col} could be datetime',
                            'details': {'column': col, 'current_type': 'object', 'suggested_type': 'datetime'}
                        })
                        failed += 1
                    except:
                        passed += 1
            else:
                passed += 1
        
        return {'issues': issues, 'passed': passed, 'failed': failed}
    
    def _statistical_validation(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform statistical validation"""
        
        issues = []
        passed = 0
        failed = 0
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            col_data = df[col].dropna()
            
            if len(col_data) < 2:
                continue
            
            # Outlier detection using IQR
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((col_data < (Q1 - 3 * IQR)) | (col_data > (Q3 + 3 * IQR))).sum()
            
            if outliers > 0:
                outlier_ratio = outliers / len(col_data)
                if outlier_ratio > 0.05:
                    issues.append({
                        'type': 'warning',
                        'message': f'Column {col} has {outlier_ratio:.2%} outliers',
                        'details': {'column': col, 'outlier_count': outliers, 'outlier_ratio': outlier_ratio}
                    })
                    failed += 1
                else:
                    passed += 1
            else:
                passed += 1
            
            # Check for zero variance
            if col_data.std() == 0:
                issues.append({
                    'type': 'error',
                    'message': f'Column {col} has zero variance',
                    'details': {'column': col}
                })
                failed += 1
            else:
                passed += 1
        
        return {'issues': issues, 'passed': passed, 'failed': failed}
    
    def _validate_target(self, target: pd.Series) -> Dict[str, Any]:
        """Validate target variable"""
        
        issues = []
        passed = 0
        failed = 0
        
        # Check for missing values
        if target.isnull().any():
            issues.append({
                'type': 'error',
                'message': 'Target variable contains missing values',
                'details': {'missing_count': target.isnull().sum()}
            })
            failed += 1
        else:
            passed += 1
        
        # Check class balance for classification
        if target.dtype == 'object' or target.nunique() < 20:
            value_counts = target.value_counts()
            min_class = value_counts.min()
            max_class = value_counts.max()
            imbalance_ratio = min_class / max_class
            
            if imbalance_ratio < 0.1:
                issues.append({
                    'type': 'warning',
                    'message': f'Severe class imbalance detected (ratio: {imbalance_ratio:.3f})',
                    'details': {'class_distribution': value_counts.to_dict()}
                })
                failed += 1
            else:
                passed += 1
        
        return {'issues': issues, 'passed': passed, 'failed': failed}
    
    def _calculate_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate comprehensive statistics"""
        
        statistics = {
            'shape': df.shape,
            'memory_usage': df.memory_usage(deep=True).sum() / 1024**2,  # MB
            'column_types': df.dtypes.value_counts().to_dict(),
            'missing_values': {
                'total': df.isnull().sum().sum(),
                'by_column': df.isnull().sum().to_dict()
            }
        }
        
        # Numeric statistics
        numeric_df = df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            statistics['numeric'] = {
                'summary': numeric_df.describe().to_dict(),
                'correlations': numeric_df.corr().to_dict() if len(numeric_df.columns) > 1 else {}
            }
        
        # Categorical statistics  
        categorical_df = df.select_dtypes(include=['object'])
        if not categorical_df.empty:
            statistics['categorical'] = {
                col: {
                    'unique_values': df[col].nunique(),
                    'most_frequent': df[col].mode()[0] if len(df[col].mode()) > 0 else None
                }
                for col in categorical_df.columns
            }
        
        return statistics
    
    def _generate_recommendations(self, issues: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # Analyze issues
        issue_types = [i['type'] for i in issues]
        
        if 'critical' in issue_types:
            recommendations.append("CRITICAL: Address critical data quality issues before proceeding")
        
        if 'error' in issue_types:
            recommendations.append("Fix data errors to ensure model training success")
        
        # Specific recommendations
        missing_issues = [i for i in issues if 'missing' in i['message'].lower()]
        if missing_issues:
            recommendations.append("Consider imputation strategies for missing values or remove high-missing columns")
        
        outlier_issues = [i for i in issues if 'outlier' in i['message'].lower()]
        if outlier_issues:
            recommendations.append("Review outliers and consider robust scaling or outlier removal")
        
        duplicate_issues = [i for i in issues if 'duplicate' in i['message'].lower()]
        if duplicate_issues:
            recommendations.append("Remove duplicate rows to avoid data leakage")
        
        imbalance_issues = [i for i in issues if 'imbalance' in i['message'].lower()]
        if imbalance_issues:
            recommendations.append("Apply class balancing techniques (SMOTE, class weights, etc.)")
        
        if not recommendations:
            recommendations.append("Data quality is acceptable. Proceed with feature engineering.")
        
        return recommendations