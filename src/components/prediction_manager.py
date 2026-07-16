
from importlib import metadata

import pandas as pd

from src.config.configuration import ConfigurationManager
from src.pipeline.prediction_feature_engineering import PredictionFeatureEngineering
from src.pipeline.prediction_pipeline import PredictionPipeline
from src.components.explainability import Explainability

from src.logger.logger import logging

class PredictionManager:

    def __init__(self):

        config = ConfigurationManager()

        self.feature_engineering = PredictionFeatureEngineering(
            config.get_prediction_feature_engineering_config()
        )

        self.prediction_pipeline = PredictionPipeline(config.get_prediction_pipeline_config())

        self.explainability = Explainability()


    def predict_single(self, request,generate_explanations=False):
        """
        Executes the complete prediction workflow
        for a single business request.
        """

        logging.info("Starting single prediction...")

        # Feature Engineering
        features = self.feature_engineering.prepare_features(
            request
        )

        if features["Open"].iloc[0] == 0:

            prediction = features.copy()

            prediction["Predicted_Customers"] = 0
            prediction["Predicted_Sales"] = 0

            logging.info(
                "Store closed. Returning zero predictions."
            )

            if generate_explanations:
                return {
                    "predictions": prediction,
                    "customer_explanation": None,
                    "sales_explanation": None,
                    "combined_explanation": None,
                    "metadata": {
                        "feature_df": features,
                        "store_history_df":
                            self.feature_engineering.store_history_df
                    }
                }

            return {
                "predictions": prediction,
                "metadata": {
                    "feature_df": features,
                    "store_history_df":
                        self.feature_engineering.store_history_df
                }
            }

        # Prediction
        prediction = self.prediction_pipeline.predict(
            features
        )

        
        # Explainability
        if generate_explanations:
            customer_explanation = (
                self.explainability.explain_customer_prediction(
                    self.prediction_pipeline.customer_features
                )
            )

            sales_explanation = (
                self.explainability.explain_sales_prediction(
                    self.prediction_pipeline.sales_features
                )
            )

            combined_explanation = (
                self.explainability.combine_explanations(
                    customer_explanation,
                    sales_explanation
                )
            )

        logging.info("Single prediction completed successfully.")

        if generate_explanations:

            return {
                "predictions": prediction,
                "customer_explanation": customer_explanation,
                "sales_explanation": sales_explanation,
                "combined_explanation": combined_explanation,
                "metadata": {
                    "feature_df": features,
                    "store_history_df":
                        self.feature_engineering.store_history_df
                }
            }

        return {
            "predictions": prediction,
            "metadata": {
                "feature_df": features,
                "store_history_df":
                    self.feature_engineering.store_history_df
            }
        }   

    def predict_batch(self,requests_df,generate_explanations=False):
        """
        Executes the complete prediction workflow
        for multiple business requests.
        """

        logging.info("Starting batch prediction...")

        prediction_results = []
        explanations = []
        metadata = []

        for _, row in requests_df.iterrows():

            request = row.to_dict()

            result = self.predict_single(
                request,
                generate_explanations
            )

            metadata.append(
                result["metadata"]
            )

            prediction_results.append(
                result["predictions"]
            )

            if generate_explanations:
                explanations.append(
                    result["combined_explanation"]
                )

        prediction_results = pd.concat(
            prediction_results,
            ignore_index=True
        )

        batch_explanation = None

        if generate_explanations:

            batch_explanation = (
                self.explainability
                .aggregate_explanations(
                    explanations
                )
            )
        

        logging.info("Batch prediction completed successfully.")

        if generate_explanations:

            return {
                "predictions": prediction_results,
                "explanations": explanations,
                "metadata": metadata,
                "batch_explanation": batch_explanation
            }

        return {
            "predictions": prediction_results,
            "metadata": metadata
        }
    

    def predict(self,input_data,generate_explanations=False):
        """
        Executes prediction based on the input type.

        Parameters
        ----------
        input_data : dict or pd.DataFrame
            Single business request or batch of requests.

        generate_explanations : bool, default=False
            Whether to generate SHAP explanations.

        Returns
        -------
        dict or pd.DataFrame
            Prediction results.
        """

        if isinstance(input_data, dict):

            return self.predict_single(
                input_data,
                generate_explanations
            )

        elif isinstance(input_data, pd.DataFrame):

            return self.predict_batch(
                input_data,
                generate_explanations
            )

        else:

            raise ValueError(
                "Input must be a dictionary or pandas DataFrame."
            )