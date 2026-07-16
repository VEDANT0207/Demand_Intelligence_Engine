from src.config.configuration import ConfigurationManager
from src.pipeline.prediction_feature_engineering import PredictionFeatureEngineering
from src.pipeline.prediction_pipeline import PredictionPipeline
from pathlib import Path
import pandas as pd

class RecursiveForecastEngine:

    def __init__(self, config):

        self.config = config

        config_manager = ConfigurationManager()

        prediction_feature_engineering_config = (
            config_manager.get_prediction_feature_engineering_config()
        )

        prediction_pipeline_config = (
            config_manager.get_prediction_pipeline_config()
        )

        self.prediction_feature_engineering = (
            PredictionFeatureEngineering(
                prediction_feature_engineering_config
            )
        )

        self.prediction_pipeline = (
            PredictionPipeline(
                prediction_pipeline_config
            )
        )

        self.default_forecast_days = (
            self.config.get("default_forecast_days", 7)
        )



    def calculate_forecast_days(self,start_date,target_date=None,forecast_days=None):
        """
        Calculates the number of recursive forecasting days.

        Parameters:
            start_date (datetime): Forecast start date.
            target_date (datetime, optional): Target forecast date.
            forecast_days (int, optional): Number of forecast days.

        Returns:
            int: Total forecast days.
        """

        if target_date is not None:

            target_date = pd.to_datetime(
                target_date
            )

            start_date = pd.to_datetime(
                start_date
            )

            forecast_days = (target_date - start_date).days +1
        
            if forecast_days < 1:
                raise ValueError(
                    "Target date must be after the forecast start date."
                )

            return forecast_days
        
        if forecast_days is not None:

            return forecast_days

        return self.default_forecast_days
    

    def update_history(self,recursive_history_df,complete_business_request_df,prediction_df):
        """
        Updates the recursive history with the latest prediction.

        Parameters
        ----------
        recursive_history_df : pd.DataFrame
            In-memory historical dataset used during recursive forecasting.

        complete_business_request_df : pd.DataFrame
            Complete business request for the current prediction date.

        prediction_df : pd.DataFrame
            Prediction output from the Prediction Pipeline.

        Returns
        -------
        pd.DataFrame
            Updated recursive history.
        """

        updated_row = complete_business_request_df.copy()

        updated_row["Customers"] = (
            prediction_df["Predicted_Customers"].values
        )

        updated_row["Sales"] = (
            prediction_df["Predicted_Sales"].values
        )

        recursive_history_df = pd.concat(
            [recursive_history_df, updated_row],
            ignore_index=True
        )

        recursive_history_df = (
            recursive_history_df
            .sort_values("Date")
            .reset_index(drop=True)
        )

        return recursive_history_df
    
    def update_business_request(
        self,
        business_request
    ):
        """
        Updates the business request for the next recursive
        prediction date.

        Priority
        --------
        Promo:
            1. Exact date
            2. Default = 0

        Open:
            1. Exact date
            2. Same DayOfWeek + WeekOfYear
            3. Default = 1

        SchoolHoliday:
            1. Exact date
            2. Same DayOfWeek + WeekOfYear
            3. Default = 0

        StateHoliday:
            1. Exact date
            2. Same DayOfWeek + WeekOfYear
            3. Default = "0"

        Parameters
        ----------
        business_request : dict
            Current business request.

        Returns
        -------
        dict
            Updated business request.
        """

        updated_request = business_request.copy()

        # Move to next day
        updated_request["Date"] = (
            pd.to_datetime(updated_request["Date"])
            + pd.Timedelta(days=1)
        )

        current_date = updated_request["Date"]

        calendar_data = (
            self.prediction_feature_engineering
            .calendar_data
        )

        # --------------------------------------------------
        # Exact Date Lookup
        # --------------------------------------------------

        exact_record = calendar_data[
            (calendar_data["Store"] == updated_request["Store"])
            &
            (calendar_data["Date"] == current_date)
        ]

        if not exact_record.empty:

            updated_request["Promo"] = (
                exact_record.iloc[0]["Promo"]
            )

            updated_request["Open"] = (
                exact_record.iloc[0]["Open"]
            )

            updated_request["SchoolHoliday"] = (
                exact_record.iloc[0]["SchoolHoliday"]
            )

            updated_request["StateHoliday"] = (
                exact_record.iloc[0]["StateHoliday"]
            )

            return updated_request

        # --------------------------------------------------
        # Promo
        # --------------------------------------------------

        updated_request["Promo"] = 0

        # --------------------------------------------------
        # Calendar Lookup
        # --------------------------------------------------

        day_of_week = current_date.dayofweek + 1

        week_of_year = int(
            current_date.isocalendar().week
        )

        calendar_record = calendar_data[
            (calendar_data["Store"] == updated_request["Store"])
            &
            (calendar_data["DayOfWeek"] == day_of_week)
            &
            (calendar_data["WeekOfYear"] == week_of_year)
        ]

        if not calendar_record.empty:

            updated_request["Open"] = (
                calendar_record.iloc[0]["Open"]
            )

            updated_request["SchoolHoliday"] = (
                calendar_record.iloc[0]["SchoolHoliday"]
            )

            updated_request["StateHoliday"] = (
                calendar_record.iloc[0]["StateHoliday"]
            )

        else:

            updated_request["Open"] = 1

            updated_request["SchoolHoliday"] = 0

            updated_request["StateHoliday"] = "0"

        return updated_request
    
    def forecast(self,business_request,target_date=None,forecast_days=None):
        """
        Performs recursive demand forecasting.

        Parameters
        ----------
        business_request : dict
            Initial business request.

        target_date : pd.Timestamp, optional
            Forecast until the specified date.

        forecast_days : int, optional
            Number of days to forecast.

        Returns
        -------
        pd.DataFrame
            Recursive forecast results.
        """

        # ---------------------------------------
        # Determine Forecast Horizon
        # ---------------------------------------

        start_date = pd.to_datetime(
            business_request["Date"]
        )

        total_forecast_days = self.calculate_forecast_days(
            start_date=start_date,
            target_date=target_date,
            forecast_days=forecast_days
        )

        # ---------------------------------------
        # Create Recursive History
        # ---------------------------------------

        recursive_history_df = (
            self.prediction_feature_engineering
            .historical_data
            .copy()
        )

        # ---------------------------------------
        # Initialize Forecast
        # ---------------------------------------

        forecast_results = []

        current_request = business_request.copy()

        # ---------------------------------------
        # Recursive Forecast Loop
        # ---------------------------------------

        for _ in range(total_forecast_days):

            # Feature Engineering
            engineered_features = (
                self.prediction_feature_engineering
                .prepare_features(
                    current_request,
                    recursive_history_df
                )
            )

            # Prediction
            prediction_df = (
                self.prediction_pipeline.predict(
                    engineered_features
                )
            )

            # Save Prediction
            forecast_results.append(
                prediction_df
            )

            # Update Recursive History
            recursive_history_df = (
                self.update_history(
                    recursive_history_df,
                    engineered_features,
                    prediction_df
                )
            )

            # Prepare Request For Next Day
            current_request = (
                self.update_business_request(
                    current_request
                )
            )

        # ---------------------------------------
        # Combine Forecast Results
        # ---------------------------------------

        forecast_df = pd.concat(
            forecast_results,
            ignore_index=True
        )

        # ---------------------------------------
        # Save Forecast
        # ---------------------------------------

        if self.config["save_recursive_results"]:

            save_path = Path(
                self.config["recursive_results_path"]
            )

            save_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            forecast_df.to_csv(
                self.config["recursive_results_path"],
                index=False
            )

        manager_forecast = forecast_df[
            [
                "Date",
                "Store",
                "Promo",
                "Open",
                "Predicted_Customers",
                "Predicted_Sales"
            ]
        ].copy()

        manager_forecast.to_csv(
            self.config["manager_recursive_results_path"],
            index=False
        )

        return {
            "forecast": forecast_df,
            "manager_forecast": manager_forecast
        }