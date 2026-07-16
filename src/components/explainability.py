from src.config.configuration import ConfigurationManager
import joblib
import shap
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

class Explainability:

    def __init__(
        self,
        customer_model=None,
        sales_model=None
    ):

        config = ConfigurationManager()

        self.config = config.get_explainability_config()

        self.customer_model = customer_model

        self.sales_model = sales_model

        self.customer_explainer = None

        self.sales_explainer = None


    def load_models(self):

        if self.customer_model is None:
            self.customer_model = joblib.load(
                self.config["customer_model_path"]
            )

        if self.sales_model is None:
            self.sales_model = joblib.load(
                self.config["sales_model_path"]
            )


    def create_explainers(self):

        self.load_models()

        if self.customer_explainer is None:
            self.customer_explainer = shap.TreeExplainer(self.customer_model)

        if self.sales_explainer is None:
            self.sales_explainer = shap.TreeExplainer(self.sales_model)

    
    def save_explainers(self):

        self.create_explainers()

        joblib.dump(
            self.customer_explainer,
            self.config["customer_explainer_path"]
        )

        joblib.dump(
            self.sales_explainer,
            self.config["sales_explainer_path"]
        )


    def load_explainers(self):

        if self.customer_explainer is None:
            self.customer_explainer = joblib.load(
                self.config["customer_explainer_path"]
            )

        if self.sales_explainer is None:
            self.sales_explainer = joblib.load(
                self.config["sales_explainer_path"]
            )


    def _generate_explanation(self, explainer, features):

        shap_values = explainer.shap_values(features)

        expected_value = explainer.expected_value

        feature_importance = self.calculate_feature_importance(
            features,
            shap_values
        )

        top_features = feature_importance.head(
            self.config["top_features"]
        )

        return {

            "shap_values": shap_values,

            "expected_value": expected_value,

            "feature_importance": feature_importance,

            "top_features": top_features

        }
    

    def explain_customer_prediction(self, customer_features):

        if self.config["use_saved_explainers"]:
            self.load_explainers()
        else:
            self.create_explainers()

        return self._generate_explanation(
            self.customer_explainer,
            customer_features
        )
    

    def explain_sales_prediction(self, sales_features):

        if self.config["use_saved_explainers"]:
            self.load_explainers()
        else:
            self.create_explainers()

        return self._generate_explanation(
            self.sales_explainer,
            sales_features
        )
    

    def combine_explanations(self,customer_explanation,sales_explanation):

        return {

            "customer": customer_explanation,

            "sales": sales_explanation

        }
    

    def calculate_feature_importance(self, features, shap_values):
        """
        Calculates feature importance from SHAP values.
        """

        feature_importance = (
            pd.DataFrame(
                {
                    "Feature": features.columns,
                    "Mean_SHAP": np.abs(shap_values).mean(axis=0)
                }
            )
            .sort_values(
                by="Mean_SHAP",
                ascending=False
            )
            .reset_index(drop=True)
        )

        return feature_importance
    

    def aggregate_explanations(self,explanations):

        """
        Aggregates multiple prediction explanations
        into a single batch explanation.
        """
        if not explanations:
            return None

        feature_importances = []

        for explanation in explanations:

            if explanation is None:
                continue

            sales_explanation = explanation.get("sales")

            if sales_explanation is None:
                continue

            feature_importances.append(
                sales_explanation["feature_importance"]
            )

        if not feature_importances:
            return None

        combined_importance = pd.concat(
            feature_importances,
            ignore_index=True
        )

        feature_importance = (
            combined_importance
            .groupby("Feature")["Mean_SHAP"]
            .mean()
            .reset_index()
            .sort_values(
                "Mean_SHAP",
                ascending=False
            )
        )

        top_features = feature_importance.head(
            self.config["top_features"]
        )

        return {
            "feature_importance": feature_importance,
            "top_features": top_features
        }