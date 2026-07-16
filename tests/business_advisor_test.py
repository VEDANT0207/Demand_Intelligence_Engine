from src.components.business_advisor import BusinessAdvisor

advisor = BusinessAdvisor()


business_context = {
    "predicted_sales": 12000,
    "predicted_customers": 350,
    "promotion": True,
    "competition": False,
    "confidence": "High",
    "trend": "Increasing demand",
}


print("=" * 80)
print("SUMMARY")
print("=" * 80)

response = advisor.generate_summary(business_context)
print(response["response"])


print("\n" + "=" * 80)
print("RECOMMENDATIONS")
print("=" * 80)

response = advisor.generate_recommendations(business_context)
print(response["response"])


print("\n" + "=" * 80)
print("EXPLANATION")
print("=" * 80)

response = advisor.explain_prediction(
    business_context, "Why are tomorrow's sales expected to increase?"
)

print(response["response"])


print("\n" + "=" * 80)
print("CHAT")
print("=" * 80)

response = advisor.answer_question(
    business_context, "What should I prepare for tomorrow?"
)

print(response["response"])


print("\n" + "=" * 80)
print("REPORT")
print("=" * 80)

response = advisor.generate_report(business_context)

print(response["response"])


print("\n" + "=" * 80)
print("WEEKLY SUMMARY")
print("=" * 80)

response = advisor.generate_weekly_summary(business_context)

print(response["response"])


print("\n" + "=" * 80)
print("RECURSIVE FORECAST")
print("=" * 80)

response = advisor.explain_recursive_forecast(business_context)

print(response["response"])


print("\n" + "=" * 80)
print("SCENARIO")
print("=" * 80)

simulated_context = {
    "predicted_sales": 14500,
    "predicted_customers": 410,
    "promotion": True,
    "competition": False,
    "confidence": "High",
    "trend": "Strong increase",
}

response = advisor.simulate_scenario(
    business_context, simulated_context, "What happens if promotion is enabled?"
)

print(response["response"])


print("\n" + "=" * 80)
print("REQUEST PARSER")
print("=" * 80)

response = advisor.parse_prediction_request(
    "Predict sales for Store 15 tomorrow with promotion."
)

print(response)
