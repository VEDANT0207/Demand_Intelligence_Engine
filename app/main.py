from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Retail Demand Intelligence Platform",
    description="Demand Forecasting and Business Intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/artifacts", StaticFiles(directory="artifacts"), name="artifacts")


@app.get("/")
def root():

    return {"message": "Retail Demand Intelligence Platform API", "version": "1.0.0"}


from app.routes.health_routes import router as health_router

app.include_router(health_router)

from app.routes.prediction_routes import router as prediction_router

app.include_router(prediction_router)


from app.routes.forecast_routes import router as forecast_router

app.include_router(forecast_router)


from app.routes.chat_routes import router as chat_router

app.include_router(chat_router)


from app.routes.report_routes import router as report_router

app.include_router(report_router)


from app.routes.recommendation_routes import router as recommendation_router

app.include_router(recommendation_router)


from app.routes.batch_prediction_routes import router as batch_prediction_router

app.include_router(batch_prediction_router)
