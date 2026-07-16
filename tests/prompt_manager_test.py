from src.components.prompt_manager import PromptManager

pm = PromptManager()

business_context = {
    "predicted_sales": 12000,
    "predicted_customers": 350,
    "promotion": True,
    "confidence": "High",
}

print("=" * 80)
print("SUMMARY")
print(pm.get_summary_prompt(business_context))

print("=" * 80)
print("RECOMMENDATIONS")
print(pm.get_recommendation_prompt(business_context))

print("=" * 80)
print("CHAT")
print(pm.get_chat_prompt(business_context, "Why is demand increasing?"))

print("=" * 80)
print("REPORT")
print(pm.get_report_prompt(business_context))

print("=" * 80)
print("WEEKLY")
print(pm.get_weekly_summary_prompt(business_context))

print("=" * 80)
print("RECURSIVE")
print(pm.get_recursive_forecast_prompt(business_context))

print("=" * 80)
print("PARSER")
print(
    pm.get_prediction_request_prompt(
        "Predict sales for Store 15 tomorrow with promotion."
    )
)
