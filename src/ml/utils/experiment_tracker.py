"""
Experiment Tracking System
Track and manage ML experiments
"""

import json
import yaml
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
import pandas as pd
import hashlib
import git
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ExperimentTracker:
    """Track ML experiments and results"""
    
    def __init__(self, config=None):
        self.config = config
        self.experiments_dir = Path("experiments")
        self.experiments_dir.mkdir(exist_ok=True)
        self.current_experiment = None
        
    def create_experiment(self, name: str, description: str = "") -> str:
        """Create a new experiment"""
        
        experiment_id = self._generate_experiment_id(name)
        experiment_dir = self.experiments_dir / experiment_id
        experiment_dir.mkdir(exist_ok=True)
        
        # Get git info
        try:
            repo = git.Repo(search_parent_directories=True)
            git_commit = repo.head.object.hexsha
            git_branch = repo.active_branch.name
        except:
            git_commit = "unknown"
            git_branch = "unknown"
        
        experiment_metadata = {
            'id': experiment_id,
            'name': name,
            'description': description,
            'created_at': datetime.now().isoformat(),
            'git_commit': git_commit,
            'git_branch': git_branch,
            'status': 'created'
        }
        
        # Save metadata
        with open(experiment_dir / 'metadata.json', 'w') as f:
            json.dump(experiment_metadata, f, indent=2)
        
        self.current_experiment = experiment_id
        logger.info(f"Created experiment: {experiment_id}")
        
        return experiment_id
    
    def log_params(self, params: Dict[str, Any]):
        """Log experiment parameters"""
        
        if not self.current_experiment:
            logger.warning("No active experiment")
            return
        
        exp_dir = self.experiments_dir / self.current_experiment
        
        # Load existing params if any
        params_file = exp_dir / 'params.json'
        if params_file.exists():
            with open(params_file, 'r') as f:
                existing_params = json.load(f)
            existing_params.update(params)
            params = existing_params
        
        # Save params
        with open(params_file, 'w') as f:
            json.dump(params, f, indent=2)
    
    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        """Log experiment metrics"""
        
        if not self.current_experiment:
            logger.warning("No active experiment")
            return
        
        exp_dir = self.experiments_dir / self.current_experiment
        metrics_file = exp_dir / 'metrics.jsonl'
        
        # Add timestamp and step
        metrics_entry = {
            'timestamp': datetime.now().isoformat(),
            'step': step,
            'metrics': metrics
        }
        
        # Append to metrics file
        with open(metrics_file, 'a') as f:
            f.write(json.dumps(metrics_entry) + '\n')
    
    def log_artifact(self, file_path: str, artifact_name: Optional[str] = None):
        """Log an artifact file"""
        
        if not self.current_experiment:
            logger.warning("No active experiment")
            return
        
        exp_dir = self.experiments_dir / self.current_experiment
        artifacts_dir = exp_dir / 'artifacts'
        artifacts_dir.mkdir(exist_ok=True)
        
        # Copy artifact
        source = Path(file_path)
        if not source.exists():
            logger.warning(f"Artifact not found: {file_path}")
            return
        
        artifact_name = artifact_name or source.name
        destination = artifacts_dir / artifact_name
        
        if source.is_file():
            import shutil
            shutil.copy2(source, destination)
        else:
            import shutil
            shutil.copytree(source, destination, dirs_exist_ok=True)
        
        logger.info(f"Logged artifact: {artifact_name}")
    
    def compare_experiments(self, experiment_ids: List[str]) -> pd.DataFrame:
        """Compare multiple experiments"""
        
        comparison_data = []
        
        for exp_id in experiment_ids:
            exp_dir = self.experiments_dir / exp_id
            
            if not exp_dir.exists():
                logger.warning(f"Experiment not found: {exp_id}")
                continue
            
            # Load metadata
            with open(exp_dir / 'metadata.json', 'r') as f:
                metadata = json.load(f)
            
            # Load params
            params_file = exp_dir / 'params.json'
            params = {}
            if params_file.exists():
                with open(params_file, 'r') as f:
                    params = json.load(f)
            
            # Load final metrics
            metrics_file = exp_dir / 'metrics.jsonl'
            final_metrics = {}
            if metrics_file.exists():
                with open(metrics_file, 'r') as f:
                    lines = f.readlines()
                    if lines:
                        final_metrics = json.loads(lines[-1])['metrics']
            
            # Combine data
            exp_data = {
                'experiment_id': exp_id,
                'name': metadata['name'],
                'created_at': metadata['created_at'],
                **params,
                **final_metrics
            }
            
            comparison_data.append(exp_data)
        
        return pd.DataFrame(comparison_data)
    
    def get_best_experiment(self, metric: str, direction: str = 'max') -> str:
        """Get best experiment based on metric"""
        
        all_experiments = list(self.experiments_dir.glob('*/metadata.json'))
        best_exp = None
        best_value = None
        
        for exp_path in all_experiments:
            exp_dir = exp_path.parent
            exp_id = exp_dir.name
            
            # Load metrics
            metrics_file = exp_dir / 'metrics.jsonl'
            if not metrics_file.exists():
                continue
            
            with open(metrics_file, 'r') as f:
                lines = f.readlines()
                if not lines:
                    continue
                
                final_metrics = json.loads(lines[-1])['metrics']
                
                if metric in final_metrics:
                    value = final_metrics[metric]
                    
                    if best_value is None:
                        best_value = value
                        best_exp = exp_id
                    elif direction == 'max' and value > best_value:
                        best_value = value
                        best_exp = exp_id
                    elif direction == 'min' and value < best_value:
                        best_value = value
                        best_exp = exp_id
        
        logger.info(f"Best experiment: {best_exp} with {metric}={best_value}")
        return best_exp
    
    def _generate_experiment_id(self, name: str) -> str:
        """Generate unique experiment ID"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name_hash = hashlib.md5(name.encode()).hexdigest()[:8]
        return f"{timestamp}_{name_hash}"