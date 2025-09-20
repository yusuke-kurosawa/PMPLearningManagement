"""
Real-time Scoring API
Low-latency prediction service with caching and async processing
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union
import asyncio
import aioredis
import numpy as np
import pandas as pd
import json
import joblib
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
import logging
from concurrent.futures import ThreadPoolExecutor
import uvloop
from cachetools import TTLCache, LRUCache
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

from ..config import ModelType, PipelineConfig
from ..models.predictive_models import ModelFactory, ModelPrediction
from ..features.feature_engineering import FeatureEngineer

# Use uvloop for better async performance
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
prediction_counter = Counter('predictions_total', 'Total number of predictions', ['model_type', 'status'])
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency', ['model_type'])
cache_hits = Counter('cache_hits_total', 'Cache hit count', ['cache_type'])
cache_misses = Counter('cache_misses_total', 'Cache miss count', ['cache_type'])
active_models = Gauge('active_models', 'Number of loaded models')
queue_size = Gauge('prediction_queue_size', 'Current prediction queue size')


class PredictionRequest(BaseModel):
    """Request model for predictions"""
    user_id: str
    features: Dict[str, Any]
    model_type: str
    return_explanation: bool = False
    return_confidence: bool = True
    return_feature_importance: bool = False
    cache_key: Optional[str] = None
    
    @validator('model_type')
    def validate_model_type(cls, v):
        try:
            ModelType[v.upper()]
        except KeyError:
            raise ValueError(f"Invalid model type: {v}")
        return v.upper()


class BatchPredictionRequest(BaseModel):
    """Request model for batch predictions"""
    requests: List[PredictionRequest]
    async_processing: bool = False
    callback_url: Optional[str] = None


class PredictionResponse(BaseModel):
    """Response model for predictions"""
    user_id: str
    model_type: str
    prediction: Union[float, List[float], Dict[str, float]]
    probability: Optional[List[float]] = None
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    feature_importance: Optional[Dict[str, float]] = None
    prediction_interval: Optional[Dict[str, float]] = None
    latency_ms: float
    cached: bool = False
    timestamp: str


class ModelServer:
    """High-performance model serving engine"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.models: Dict[ModelType, Any] = {}
        self.feature_engineers: Dict[ModelType, FeatureEngineer] = {}
        self.model_versions: Dict[ModelType, str] = {}
        
        # Caching layers
        self.prediction_cache = TTLCache(
            maxsize=10000,
            ttl=self.config.serving_config['cache_ttl_seconds']
        )
        self.feature_cache = LRUCache(maxsize=5000)
        
        # Thread pool for CPU-bound operations
        self.executor = ThreadPoolExecutor(
            max_workers=self.config.serving_config['max_workers']
        )
        
        # Async queue for batch processing
        self.prediction_queue = asyncio.Queue(maxsize=1000)
        
        # Redis for distributed caching (optional)
        self.redis_client = None
        
    async def initialize(self):
        """Initialize model server"""
        logger.info("Initializing model server...")
        
        # Load models
        await self._load_models()
        
        # Initialize Redis if configured
        if self.config.serving_config.get('redis_url'):
            self.redis_client = await aioredis.create_redis_pool(
                self.config.serving_config['redis_url']
            )
        
        # Start background workers
        if self.config.serving_config['async_inference']:
            for _ in range(self.config.serving_config['max_workers']):
                asyncio.create_task(self._process_queue())
        
        # Warm up models
        if self.config.serving_config['model_warm_up']:
            await self._warm_up_models()
        
        logger.info(f"Model server initialized with {len(self.models)} models")
    
    async def _load_models(self):
        """Load all models into memory"""
        model_dir = Path(self.config.model_artifacts_path)
        
        for model_type in ModelType:
            model_path = self._get_latest_model_path(model_type)
            if model_path and model_path.exists():
                try:
                    # Load model in thread pool to avoid blocking
                    model = await asyncio.get_event_loop().run_in_executor(
                        self.executor,
                        self._load_model,
                        model_type,
                        model_path
                    )
                    self.models[model_type] = model
                    self.model_versions[model_type] = model_path.stem
                    
                    # Load corresponding feature engineer
                    self.feature_engineers[model_type] = FeatureEngineer(self.config)
                    
                    logger.info(f"Loaded {model_type.value} model from {model_path}")
                    active_models.inc()
                    
                except Exception as e:
                    logger.error(f"Failed to load {model_type.value}: {str(e)}")
    
    def _load_model(self, model_type: ModelType, model_path: Path):
        """Load a single model (CPU-bound operation)"""
        model = ModelFactory.create_model(model_type)
        model.load(str(model_path))
        return model
    
    def _get_latest_model_path(self, model_type: ModelType) -> Optional[Path]:
        """Get path to latest model version"""
        model_dir = Path(self.config.model_artifacts_path) / model_type.value
        if not model_dir.exists():
            return None
        
        model_files = list(model_dir.glob("*.pkl"))
        if not model_files:
            return None
        
        # Return most recent model
        return max(model_files, key=lambda p: p.stat().st_mtime)
    
    async def _warm_up_models(self):
        """Warm up models with dummy predictions"""
        logger.info("Warming up models...")
        
        for model_type, model in self.models.items():
            try:
                # Create dummy features
                dummy_features = {f"feature_{i}": np.random.rand() for i in range(50)}
                dummy_df = pd.DataFrame([dummy_features])
                
                # Make dummy prediction
                await self._predict_single(model_type, dummy_df)
                
                logger.info(f"Warmed up {model_type.value}")
                
            except Exception as e:
                logger.warning(f"Failed to warm up {model_type.value}: {str(e)}")
    
    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        """Make a single prediction"""
        start_time = time.time()
        
        # Check cache first
        cache_key = self._get_cache_key(request)
        cached_result = await self._get_from_cache(cache_key)
        
        if cached_result:
            cache_hits.labels(cache_type='prediction').inc()
            cached_result['cached'] = True
            cached_result['latency_ms'] = (time.time() - start_time) * 1000
            return PredictionResponse(**cached_result)
        
        cache_misses.labels(cache_type='prediction').inc()
        
        # Convert features to DataFrame
        features_df = pd.DataFrame([request.features])
        
        # Get model
        model_type = ModelType[request.model_type]
        if model_type not in self.models:
            raise HTTPException(status_code=404, detail=f"Model {request.model_type} not found")
        
        # Make prediction
        try:
            prediction = await self._predict_single(model_type, features_df)
            
            # Build response
            response_data = {
                'user_id': request.user_id,
                'model_type': request.model_type,
                'prediction': self._format_prediction(prediction.prediction),
                'timestamp': datetime.now().isoformat()
            }
            
            if request.return_confidence and prediction.confidence:
                response_data['confidence'] = float(prediction.confidence)
            
            if request.return_explanation and prediction.explanation:
                response_data['explanation'] = prediction.explanation
            
            if request.return_feature_importance and prediction.feature_importance:
                response_data['feature_importance'] = prediction.feature_importance
            
            if prediction.probability is not None:
                response_data['probability'] = prediction.probability.tolist() if hasattr(prediction.probability, 'tolist') else prediction.probability
            
            if prediction.prediction_interval:
                response_data['prediction_interval'] = {
                    'lower': float(prediction.prediction_interval[0]),
                    'upper': float(prediction.prediction_interval[1])
                }
            
            # Cache result
            await self._cache_result(cache_key, response_data)
            
            # Add metrics
            response_data['latency_ms'] = (time.time() - start_time) * 1000
            response_data['cached'] = False
            
            # Record metrics
            prediction_counter.labels(model_type=request.model_type, status='success').inc()
            prediction_latency.labels(model_type=request.model_type).observe(response_data['latency_ms'] / 1000)
            
            return PredictionResponse(**response_data)
            
        except Exception as e:
            prediction_counter.labels(model_type=request.model_type, status='error').inc()
            logger.error(f"Prediction error for {request.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def predict_batch(self, request: BatchPredictionRequest) -> List[PredictionResponse]:
        """Make batch predictions"""
        if request.async_processing:
            # Queue for async processing
            batch_id = self._generate_batch_id()
            
            for pred_request in request.requests:
                await self.prediction_queue.put((batch_id, pred_request, request.callback_url))
            
            queue_size.set(self.prediction_queue.qsize())
            
            return {"batch_id": batch_id, "status": "queued", "size": len(request.requests)}
        
        else:
            # Process synchronously
            tasks = [self.predict(req) for req in request.requests]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle exceptions
            responses = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Batch prediction error for request {i}: {str(result)}")
                    # Return error response
                    responses.append(PredictionResponse(
                        user_id=request.requests[i].user_id,
                        model_type=request.requests[i].model_type,
                        prediction=None,
                        latency_ms=0,
                        timestamp=datetime.now().isoformat()
                    ))
                else:
                    responses.append(result)
            
            return responses
    
    async def _predict_single(self, model_type: ModelType, features_df: pd.DataFrame) -> ModelPrediction:
        """Make a single model prediction"""
        model = self.models[model_type]
        feature_engineer = self.feature_engineers[model_type]
        
        # Feature engineering (check cache first)
        feature_hash = hashlib.md5(features_df.to_json().encode()).hexdigest()
        
        if feature_hash in self.feature_cache:
            engineered_features = self.feature_cache[feature_hash]
            cache_hits.labels(cache_type='features').inc()
        else:
            # Run feature engineering in thread pool
            engineered_features = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                feature_engineer.fit_transform,
                features_df
            )
            self.feature_cache[feature_hash] = engineered_features
            cache_misses.labels(cache_type='features').inc()
        
        # Make prediction in thread pool
        prediction = await asyncio.get_event_loop().run_in_executor(
            self.executor,
            model.predict,
            engineered_features
        )
        
        return prediction
    
    async def _process_queue(self):
        """Background worker for processing queued predictions"""
        while True:
            try:
                batch_id, request, callback_url = await self.prediction_queue.get()
                queue_size.set(self.prediction_queue.qsize())
                
                # Process prediction
                result = await self.predict(request)
                
                # Send callback if provided
                if callback_url:
                    await self._send_callback(callback_url, batch_id, result)
                
            except Exception as e:
                logger.error(f"Queue processing error: {str(e)}")
    
    async def _send_callback(self, callback_url: str, batch_id: str, result: PredictionResponse):
        """Send prediction result to callback URL"""
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            try:
                await session.post(
                    callback_url,
                    json={
                        'batch_id': batch_id,
                        'result': result.dict()
                    }
                )
            except Exception as e:
                logger.error(f"Callback failed for {batch_id}: {str(e)}")
    
    def _get_cache_key(self, request: PredictionRequest) -> str:
        """Generate cache key for request"""
        if request.cache_key:
            return request.cache_key
        
        # Create deterministic cache key
        key_data = {
            'user_id': request.user_id,
            'model_type': request.model_type,
            'features': sorted(request.features.items())
        }
        
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    async def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get prediction from cache"""
        # Check local cache first
        if cache_key in self.prediction_cache:
            return self.prediction_cache[cache_key]
        
        # Check Redis if available
        if self.redis_client:
            cached = await self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        
        return None
    
    async def _cache_result(self, cache_key: str, result: Dict):
        """Cache prediction result"""
        # Local cache
        self.prediction_cache[cache_key] = result
        
        # Redis cache if available
        if self.redis_client:
            await self.redis_client.setex(
                cache_key,
                self.config.serving_config['cache_ttl_seconds'],
                json.dumps(result)
            )
    
    def _format_prediction(self, prediction: Any) -> Union[float, List[float], Dict[str, float]]:
        """Format prediction for response"""
        if isinstance(prediction, np.ndarray):
            if prediction.ndim == 0:
                return float(prediction)
            elif prediction.ndim == 1:
                return prediction.tolist()
            else:
                return prediction.tolist()
        elif isinstance(prediction, pd.DataFrame):
            return prediction.to_dict('records')[0] if len(prediction) == 1 else prediction.to_dict('records')
        elif isinstance(prediction, (int, float)):
            return float(prediction)
        else:
            return prediction
    
    def _generate_batch_id(self) -> str:
        """Generate unique batch ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:16]
    
    async def reload_model(self, model_type: str):
        """Reload a specific model"""
        model_type_enum = ModelType[model_type.upper()]
        
        # Load new model
        model_path = self._get_latest_model_path(model_type_enum)
        if not model_path:
            raise HTTPException(status_code=404, detail=f"No model found for {model_type}")
        
        new_model = await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self._load_model,
            model_type_enum,
            model_path
        )
        
        # Atomic swap
        self.models[model_type_enum] = new_model
        self.model_versions[model_type_enum] = model_path.stem
        
        # Clear caches
        self.prediction_cache.clear()
        self.feature_cache.clear()
        
        logger.info(f"Reloaded {model_type} model")
        
        return {"status": "success", "model": model_type, "version": model_path.stem}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            "models": {
                model_type.value: {
                    "loaded": model_type in self.models,
                    "version": self.model_versions.get(model_type, "unknown")
                }
                for model_type in ModelType
            },
            "cache_size": len(self.prediction_cache),
            "queue_size": self.prediction_queue.qsize() if self.prediction_queue else 0,
            "config": {
                "cache_ttl": self.config.serving_config['cache_ttl_seconds'],
                "max_batch_size": self.config.serving_config['max_batch_size'],
                "async_enabled": self.config.serving_config['async_inference']
            }
        }


# FastAPI app
app = FastAPI(title="ML Scoring API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model server instance
model_server = None


@app.on_event("startup")
async def startup_event():
    """Initialize model server on startup"""
    global model_server
    model_server = ModelServer()
    await model_server.initialize()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if model_server and model_server.redis_client:
        model_server.redis_client.close()
        await model_server.redis_client.wait_closed()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/models")
async def get_models():
    """Get information about loaded models"""
    if not model_server:
        raise HTTPException(status_code=503, detail="Model server not initialized")
    
    return model_server.get_model_info()


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Single prediction endpoint"""
    if not model_server:
        raise HTTPException(status_code=503, detail="Model server not initialized")
    
    return await model_server.predict(request)


@app.post("/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    """Batch prediction endpoint"""
    if not model_server:
        raise HTTPException(status_code=503, detail="Model server not initialized")
    
    return await model_server.predict_batch(request)


@app.post("/models/{model_type}/reload")
async def reload_model(model_type: str):
    """Reload a specific model"""
    if not model_server:
        raise HTTPException(status_code=503, detail="Model server not initialized")
    
    return await model_server.reload_model(model_type)


@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add process time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


if __name__ == "__main__":
    import uvicorn
    
    config = PipelineConfig()
    uvicorn.run(
        app,
        host=config.serving_config['api_host'],
        port=config.serving_config['api_port'],
        workers=1,  # Use single worker with async
        loop="uvloop",
        log_level="info"
    )