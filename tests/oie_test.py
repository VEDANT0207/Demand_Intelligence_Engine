from src.components.operational_intelligence_engine import OperationalIntelligenceEngine
from src.pipeline.prediction_pipeline import PredictionPipeline
from src.pipeline.prediction_feature_engineering import PredictionFeatureEngineering

# Prepare business request
business_request = {
    "Store": 1,
    "Date": "2015-08-01",
    "Promo": 1,
    "Open": 1,
    "StateHoliday": "0",
    "SchoolHoliday": 0
}

# Generate prediction
prediction_manager = PredictionFeatureEngineering()
feature_df = prediction_manager.prepare_features(business_request)

pipeline = PredictionPipeline()
prediction_df = pipeline.predict(feature_df)

# Historical data
store_history_df = prediction_manager.get_store_history(
    business_request["Store"]
)

# Operational Intelligence
oie = OperationalIntelligenceEngine()

metrics = oie._calculate_demand_metrics(
    prediction_df,
    store_history_df
)

print(metrics)