import os
import joblib
import pandas as pd

from xgboost import XGBRegressor

from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from src.logger.logger import logging
from src.config.configuration import ConfigurationManager


class ModelTrainer:
    """
    Handles training of the two-stage XGBoost models.
    """

    SPLIT_DATE = "2015-06-01"

    # Customer Model
    # Features to Drop
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

    # Sales Model

    SALES_DROP_COLUMNS = ["Sales", "Customers", "Date", "Open"]

    PREDICTED_CUSTOMERS_COLUMN = "Predicted_Customers"

    def __init__(self, config):
        self.config = config

        # Complete dataset
        self.data = None

        # Split datasets
        self.train_df = None
        self.test_df = None

        # Customer Model
        self.X_train = None
        self.X_test = None

        self.y_customer_train = None
        self.y_customer_test = None

        # Sales Model
        self.X_sales_train = None
        self.X_sales_test = None

        self.y_sales_train = None
        self.y_sales_test = None

        # Models
        self.customer_model = None
        self.sales_model = None

        self.customer_predictions = None
        self.sales_predictions = None

    def load_data(self):
        """
        Loads the engineered dataset.
        """

        logging.info("Loading engineered dataset...")

        self.data = pd.read_csv(
            self.config["engineered_data_path"], parse_dates=["Date"]
        )

        self.data.sort_values(by=["Store", "Date"], inplace=True)

        self.data.reset_index(drop=True, inplace=True)

        logging.info(f"Dataset loaded successfully. Shape: {self.data.shape}")

    def split_data(self):
        """
        Filters open stores and performs a chronological train-test split.
        Also prepares the feature matrices and target variables for the
        customer prediction model.
        """

        logging.info("Filtering open stores...")

        open_df = self.data[self.data["Open"] == 1].copy()

        logging.info(f"Open stores dataset shape: {open_df.shape}")

        logging.info("Performing chronological train-test split...")

        train_df = open_df[open_df["Date"] < self.SPLIT_DATE].copy()

        test_df = open_df[open_df["Date"] >= self.SPLIT_DATE].copy()

        # Store complete datasets for later use
        self.train_df = train_df
        self.test_df = test_df

        # Customer Model Features
        self.X_train = self.train_df.drop(columns=self.CUSTOMER_DROP_COLUMNS)

        self.X_test = self.test_df.drop(columns=self.CUSTOMER_DROP_COLUMNS)

        # Customer Targets
        self.y_customer_train = self.train_df["Customers"]

        self.y_customer_test = self.test_df["Customers"]

        # Sales Targets
        self.y_sales_train = self.train_df["Sales"]

        self.y_sales_test = self.test_df["Sales"]

        logging.info(
            f"Training Period : {self.train_df['Date'].min().date()} "
            f"to {self.train_df['Date'].max().date()}"
        )

        logging.info(
            f"Testing Period : {self.test_df['Date'].min().date()} "
            f"to {self.test_df['Date'].max().date()}"
        )

        logging.info(f"Training samples : {len(self.train_df)}")
        logging.info(f"Testing samples  : {len(self.test_df)}")

        logging.info("Data splitting completed successfully.")

    def train_customer_model(self):
        """
        Trains the customer demand prediction model.
        """

        logging.info("Training Customer Demand Model...")

        self.customer_model = XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
        )

        self.customer_model.fit(self.X_train, self.y_customer_train)

    logging.info("Customer model trained successfully.")

    def generate_customer_predictions(self):
        """
        Generates customer demand predictions and appends them
        as a feature for the sales prediction model.
        """

        logging.info("Generating customer predictions...")

        # Training predictions
        self.train_df[self.PREDICTED_CUSTOMERS_COLUMN] = self.customer_model.predict(
            self.X_train
        )

        # Testing predictions
        self.test_df[self.PREDICTED_CUSTOMERS_COLUMN] = self.customer_model.predict(
            self.X_test
        )

        logging.info("Customer predictions generated successfully.")

    def train_sales_model(self):
        """
        Trains the final sales prediction model using
        predicted customers as an additional feature.
        """

        logging.info("Preparing sales model features...")

        self.X_sales_train = self.train_df.drop(columns=self.SALES_DROP_COLUMNS)

        self.X_sales_test = self.test_df.drop(columns=self.SALES_DROP_COLUMNS)

        logging.info("Training Sales Prediction Model...")

        self.sales_model = XGBRegressor(
            n_estimators=500,
            learning_rate=0.03,
            max_depth=8,
            subsample=0.7,
            colsample_bytree=0.8,
            min_child_weight=1,
            gamma=0.1,
            random_state=42,
            n_jobs=-1,
        )

        self.sales_model.fit(self.X_sales_train, self.y_sales_train)

        logging.info("Sales model trained successfully.")

    def evaluate_models(self):
        """
        Evaluates the customer and sales prediction models.
        """

        logging.info("Evaluating models...")

        # Customer Model Evaluation

        customer_predictions = self.customer_model.predict(self.X_test)

        customer_metrics = {
            "MAE": mean_absolute_error(self.y_customer_test, customer_predictions),
            "RMSE": root_mean_squared_error(self.y_customer_test, customer_predictions),
            "R2": r2_score(self.y_customer_test, customer_predictions),
        }

        # Sales Model Evaluation

        sales_predictions = self.sales_model.predict(self.X_sales_test)

        sales_metrics = {
            "MAE": mean_absolute_error(self.y_sales_test, sales_predictions),
            "RMSE": root_mean_squared_error(self.y_sales_test, sales_predictions),
            "R2": r2_score(self.y_sales_test, sales_predictions),
        }

        logging.info("Model evaluation completed successfully.")

        return {"customer_model": customer_metrics, "sales_model": sales_metrics}

    def save_models(self):
        """
        Saves trained models and training columns.
        """

        logging.info("Saving trained models...")

        joblib.dump(self.customer_model, self.config["customer_model_path"])

        joblib.dump(self.sales_model, self.config["sales_model_path"])

        # Save customer model feature columns
        joblib.dump(
            self.X_train.columns.tolist(), self.config["customer_training_columns_path"]
        )

        # Save sales model feature columns
        joblib.dump(
            self.X_sales_train.columns.tolist(),
            self.config["sales_training_columns_path"],
        )

        logging.info("Models saved successfully.")

    def initiate_model_training(self):
        """
        Executes the complete model training pipeline.
        """

        logging.info("Starting Model Training Pipeline")

        self.load_data()

        self.split_data()

        self.train_customer_model()

        self.generate_customer_predictions()

        self.train_sales_model()

        metrics = self.evaluate_models()

        self.save_models()

        logging.info("Model Training Pipeline Completed Successfully")

        return metrics


from src.config.configuration import ConfigurationManager
from src.components.model_trainer import ModelTrainer

config = ConfigurationManager().get_model_trainer_config()

trainer = ModelTrainer(config)

metrics = trainer.initiate_model_training()

print(metrics)
