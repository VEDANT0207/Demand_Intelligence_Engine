from src.components.explainability import Explainability

explainer = Explainability()

explainer.save_explainers()

print("SHAP explainers created successfully.")