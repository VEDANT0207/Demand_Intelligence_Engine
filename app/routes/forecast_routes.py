from fastapi import APIRouter, HTTPException

from fastapi.encoders import jsonable_encoder

import json

from app.schemas.forecast_schema import ForecastRequest

from src.config.configuration import ConfigurationManager

from src.pipeline.recursive_forecast_engine import RecursiveForecastEngine

from src.components.business_advisor import BusinessAdvisor

from src.components.operational_intelligence_engine import OperationalIntelligenceEngine

from src.components.forecast_visualiser import ForecastVisualizer

from app.schemas.nlp_request_schema import NLPRequest

advisor = BusinessAdvisor()

oie = OperationalIntelligenceEngine()


router = APIRouter(prefix="/forecast", tags=["Forecast"])

config = ConfigurationManager()

visualizer = ForecastVisualizer(config.get_forecast_visualization_config())

engine = RecursiveForecastEngine(config.get_recursive_forecast_config())


def generate_forecast_response(
    business_request: dict, target_date=None, forecast_days=None
):

    forecast_result = engine.forecast(
        business_request=business_request,
        target_date=target_date,
        forecast_days=forecast_days,
    )

    forecast_df = forecast_result["forecast"]

    business_context = oie.generate_forecast_operational_intelligence(forecast_df)

    business_context = json.loads(json.dumps(business_context, default=str))

    llm_summary = advisor.explain_recursive_forecast(business_context)

    llm_summary = json.loads(json.dumps(llm_summary, default=str))

    visualizer.plot_sales_forecast(forecast_df)

    visualizer.plot_customer_forecast(forecast_df)

    visualizer.plot_weekly_sales(forecast_df)

    forecast_records = json.loads(
        forecast_df.to_json(orient="records", date_format="iso")
    )

    response = {
        "forecast": forecast_records,
        "summary": business_context,
        "llm_summary": llm_summary,
        "graphs": {
            "sales_plot": "/artifacts/forecast_visualizations/sales_forecast.png",
            "customer_plot": "/artifacts/forecast_visualizations/customer_forecast.png",
            "weekly_sales_plot": "/artifacts/forecast_visualizations/weekly_sales_forecast.png",
        },
    }

    return jsonable_encoder(response)


@router.post("/")
def forecast(request: ForecastRequest):

    try:

        return generate_forecast_response(
            request.model_dump(), request.target_date, request.forecast_days
        )

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nlp")
def forecast_nlp(request: NLPRequest):

    try:

        business_request = advisor.parse_prediction_request(request.query)

        return generate_forecast_response(business_request)

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
