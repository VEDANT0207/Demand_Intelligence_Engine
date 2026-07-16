import joblib
import pandas as pd

from src.logger.logger import logging


class PredictionPipeline:
    """
    Handles inference using the trained two-stage prediction pipeline.
    """

    PREDICTED_CUSTOMERS_COLUMN = "Predicted_Customers"

    SALES_DROP_COLUMNS = ["Sales", "Customers", "Date", "Open"]

    CUSTOMER_DROP_COLUMNS = [
        "Sales",
        "Customers",
        "Date",
        "Sales_Lag_7",
        "Sales_Lag_14",
        "Sales_Lag_28",
        "Sales_RollingMean_7",
        "Sales_RollingMean_14",
        "Sales_RollingMean_28",
        "Sales_RollingStd_7",
        "Sales_RollingStd_14",
        "Sales_RollingStd_28",
    ]

    def __init__(self, config):

        self.config = config

        self.customer_model = None
        self.sales_model = None

        self.customer_training_columns = None
        self.sales_training_columns = None

        self.customer_features = None
        self.sales_features = None

        self.load_artifacts()

    def load_artifacts(self):
        """
        Loads the trained models and training columns.
        """
        logging.info("Loading trained artifacts...")

        self.customer_model = joblib.load(self.config["customer_model_path"])
        self.sales_model = joblib.load(self.config["sales_model_path"])

        self.customer_training_columns = joblib.load(
            self.config["customer_training_columns_path"]
        )
        self.sales_training_columns = joblib.load(
            self.config["sales_training_columns_path"]
        )

        logging.info("Trained artifacts loaded successfully.")

    def prepare_customer_features(self, input_df):
        """
        Prepares the feature matrix required by the customer prediction model.
        """

        customer_features = input_df.drop(
            columns=self.CUSTOMER_DROP_COLUMNS, errors="ignore"
        )

        customer_features = customer_features.reindex(
            columns=self.customer_training_columns, fill_value=0
        )

        return customer_features

    def predict_customers(self, customer_features):
        """
        Predicts customer demand.
        """

        customer_predictions = self.customer_model.predict(customer_features)

        return customer_predictions

    def prepare_sales_features(self, input_df, customer_predictions):
        """
        Prepares the feature matrix required by the sales prediction model.
        """

        sales_features = input_df.copy()

        sales_features[self.PREDICTED_CUSTOMERS_COLUMN] = customer_predictions

        sales_features = sales_features.drop(
            columns=self.SALES_DROP_COLUMNS, errors="ignore"
        )

        sales_features = sales_features.reindex(
            columns=self.sales_training_columns, fill_value=0
        )

        return sales_features

    def predict_sales(self, sales_features):
        """
        Predicts store sales.
        """

        sales_predictions = self.sales_model.predict(sales_features)

        return sales_predictions

    def predict(self, input_df):
        """
        Executes the complete two-stage prediction pipeline.

        Parameters:
            input_df (pd.DataFrame): Engineered input features.

        Returns:
            pd.DataFrame: Input dataframe with Predicted_Customers and Predicted_Sales columns.
        """

        logging.info("Starting prediction pipeline...")

        customer_features = self.prepare_customer_features(input_df)

        customer_predictions = self.predict_customers(customer_features)

        sales_features = self.prepare_sales_features(input_df, customer_predictions)

        sales_predictions = self.predict_sales(sales_features)

        # Store feature matrices for Explainability
        self.customer_features = customer_features
        self.sales_features = sales_features

        logging.info("Prediction pipeline completed successfully.")

        result_df = input_df.copy()

        result_df["Predicted_Customers"] = customer_predictions
        result_df["Predicted_Sales"] = sales_predictions

        return result_df


# from src.config.configuration import ConfigurationManager
# from src.pipeline.prediction_pipeline import PredictionPipeline

# import pandas as pd

# # Load configuration
# config = ConfigurationManager().get_prediction_pipeline_config()

# # Initialize pipeline
# pipeline = PredictionPipeline(config)

# # Load one engineered sample
# engineered_df = pd.read_csv(
#     "data/processed/engineered_data.csv",
#     parse_dates=["Date"]
# )

# sample = engineered_df.iloc[[0]]

# # Run prediction
# results = pipeline.predict(sample)

# print("Predicted Customers :", results["predicted_customers"])
# print("Predicted Sales     :", results["predicted_sales"])
