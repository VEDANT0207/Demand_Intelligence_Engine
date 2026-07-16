from fastapi import APIRouter, HTTPException

from fastapi.encoders import jsonable_encoder

import json
import math
import numpy as np
import pandas as pd

from app.schemas.prediction_schema import PredictionRequest

from src.components.prediction_manager import PredictionManager

from src.components.business_advisor import BusinessAdvisor

from src.components.operational_intelligence_engine import OperationalIntelligenceEngine

from app.schemas.nlp_request_schema import NLPRequest

router = APIRouter(prefix="/predict", tags=["Prediction"])

manager = PredictionManager()

advisor = BusinessAdvisor()

oie = OperationalIntelligenceEngine()


def generate_prediction_response(business_request: dict):

    result = manager.predict(business_request, generate_explanations=False)

    prediction_df = result["predictions"]

    metadata = result["metadata"]

    feature_df = metadata["feature_df"]

    store_history_df = metadata["store_history_df"]

    business_context = oie.generate_operational_intelligence(
        prediction_df, feature_df, store_history_df
    )

    llm_summary = advisor.generate_summary(business_context)

    prediction = (
        prediction_df.replace([np.inf, -np.inf], np.nan)
        .where(pd.notnull(prediction_df), None)
        .iloc[0]
        .to_dict()
    )

    for key, value in prediction.items():

        if isinstance(value, np.floating):
            value = float(value)

        if isinstance(value, float):

            if math.isnan(value):
                prediction[key] = None

            elif math.isinf(value):
                prediction[key] = None

    prediction = json.loads(json.dumps(prediction, default=str))

    business_context = json.loads(json.dumps(business_context, default=str))

    llm_summary = json.loads(json.dumps(llm_summary, default=str))

    response = {
        "predictions": prediction,
        "summary": business_context,
        "llm_summary": llm_summary,
    }

    return jsonable_encoder(response)


@router.post("/")
def predict(request: PredictionRequest):

    try:

        return generate_prediction_response(request.model_dump())

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nlp")
def predict_nlp(request: NLPRequest):

    try:

        business_request = advisor.parse_prediction_request(request.query)

        return generate_prediction_response(business_request)

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
