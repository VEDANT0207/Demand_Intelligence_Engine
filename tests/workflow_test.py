from src.components.prediction_manager import PredictionManager

request = {
    "Store": 1,
    "Date": "2015-08-01",
    "Promo": 1,
    "Open": 1,
    "StateHoliday": "0",
    "SchoolHoliday": 0
}

manager = PredictionManager()

result = manager.predict(
    request,
    generate_explanations=True
)

print(result.keys())

print(result["predictions"])

print(
    result["customer_explanation"].keys()
)

print(
    result["sales_explanation"].keys()
)

print(
    result["customer_explanation"]["top_features"]
)

print(
    result["sales_explanation"]["top_features"]
)