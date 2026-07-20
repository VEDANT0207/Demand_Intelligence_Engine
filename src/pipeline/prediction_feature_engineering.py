import pandas as pd
import numpy as np

from src.logger.logger import logging


class PredictionFeatureEngineering:
    """
    Generates model-ready features from incomplete business requests.
    """

    DEFAULT_REQUEST = {
        "Date": pd.Timestamp.today().normalize(),
        "Promo": 0,
        "Open": 1,
        "StateHoliday": "0",
        "SchoolHoliday": 0,
    }

    def __init__(self, config):

        self.config = config

        self.historical_data = None
        self.calendar_data = None
        self.store_data = None
        self.store_history_df = None

        self.load_reference_data()

    def load_reference_data(self):
        """
        Loads historical data and store master data
        required for inference feature engineering.
        """

        self.historical_data = pd.read_parquet(
            self.config["historical_data_path"]
        )

        self.calendar_data = pd.read_parquet(
            self.config["calendar_data_path"]
        )

        self.calendar_data["DayOfWeek"] = self.calendar_data["Date"].dt.dayofweek + 1

        self.calendar_data["WeekOfYear"] = (
            self.calendar_data["Date"].dt.isocalendar().week.astype(int)
        )

        # Precompute calendar features once
        self.historical_data["DayOfWeek"] = (
            self.historical_data["Date"].dt.dayofweek + 1
        )

        self.historical_data["WeekOfYear"] = (
            self.historical_data["Date"].dt.isocalendar().week.astype(int)
        )

        self.store_data = pd.read_csv(self.config["store_data_path"])

    def infer_store_open_status(self, request_df):
        """
        Infers whether the store is open for future dates.
        """

        if pd.notna(request_df["Open"].iloc[0]):
            return request_df

        store = request_df["Store"].iloc[0]
        request_date = request_df["Date"].iloc[0]

        month = request_date.month
        day = request_date.day
        day_of_week = request_date.dayofweek + 1

        calendar_data = self.historical_data

        # Exact date

        exact_record = calendar_data[
            (calendar_data["Store"] == store) & (calendar_data["Date"] == request_date)
        ]

        if not exact_record.empty:

            request_df["Open"] = exact_record.iloc[0]["Open"]

            return request_df

        # Same month and day

        month_day_record = calendar_data[
            (calendar_data["Store"] == store)
            & (calendar_data["Date"].dt.month == month)
            & (calendar_data["Date"].dt.day == day)
        ]

        if not month_day_record.empty:

            request_df["Open"] = month_day_record["Open"].mode().iloc[0]

            return request_df

        # Same weekday pattern

        day_record = calendar_data[
            (calendar_data["Store"] == store)
            & (calendar_data["DayOfWeek"] == day_of_week)
        ]

        if not day_record.empty:

            request_df["Open"] = day_record["Open"].mode().iloc[0]

            return request_df

        # Final fallback
        request_df["Open"] = 1

        return request_df

    def complete_business_request(self, request):
        """
        Completes an incomplete business request using
        default values.

        Parameters
        ----------
        request : dict
            Business request received from the user.

        Returns
        -------
        pd.DataFrame
            Single-row dataframe containing the completed request.
        """

        if "Store" not in request:
            raise ValueError("'Store' is required for prediction.")

        completed_request = self.DEFAULT_REQUEST.copy()

        completed_request.update(request)

        request_df = pd.DataFrame([completed_request])

        request_df["Date"] = pd.to_datetime(request_df["Date"])

        request_df["Store"] = (
            request_df["Store"].astype(str).str.extract(r"(\d+)").iloc[:, 0].astype(int)
        )

        if "Promo" not in request_df.columns:
            request_df["Promo"] = 0

        request_df["Promo"] = (
            pd.to_numeric(request_df["Promo"], errors="coerce").fillna(0).astype(int)
        )

        if "Open" not in request_df.columns:
            request_df["Open"] = 1

        request_df["Open"] = (
            pd.to_numeric(request_df["Open"], errors="coerce").fillna(1).astype(int)
        )

        if "SchoolHoliday" not in request_df.columns:
            request_df["SchoolHoliday"] = 0

        request_df["SchoolHoliday"] = (
            pd.to_numeric(request_df["SchoolHoliday"], errors="coerce")
            .fillna(0)
            .astype(int)
        )

        if "StateHoliday" not in request_df.columns:
            request_df["StateHoliday"] = "0"

        request_df["StateHoliday"] = request_df["StateHoliday"].fillna("0").astype(str)

        request_df = self.infer_store_open_status(request_df)

        return request_df

    def create_temporal_features(self, request_df):
        """
        Creates temporal features from the Date column.
        """

        request_df = request_df.copy()

        request_df["Year"] = request_df["Date"].dt.year

        request_df["Month"] = request_df["Date"].dt.month

        request_df["Day"] = request_df["Date"].dt.day

        request_df["DayOfWeek"] = request_df["Date"].dt.dayofweek + 1

        request_df["WeekOfYear"] = request_df["Date"].dt.isocalendar().week.astype(int)

        request_df["Quarter"] = request_df["Date"].dt.quarter

        request_df["IsWeekend"] = (request_df["DayOfWeek"] >= 6).astype(int)

        return request_df

    def create_store_features(self, request_df):
        """
        Enriches the business request with static store information.
        """

        request_df = request_df.copy()

        request_df = request_df.merge(self.store_data, on="Store", how="left")

        return request_df

    def create_competition_features(self, request_df):
        """
        Creates competition-related features.
        """

        request_df = request_df.copy()

        # Handle missing competition opening information
        request_df["CompetitionOpenSinceMonth"] = request_df[
            "CompetitionOpenSinceMonth"
        ].fillna(1)

        request_df["CompetitionOpenSinceYear"] = request_df[
            "CompetitionOpenSinceYear"
        ].fillna(1900)

        # Create competition opening date
        request_df["CompetitionOpenDate"] = pd.to_datetime(
            dict(
                year=request_df["CompetitionOpenSinceYear"].astype(int),
                month=request_df["CompetitionOpenSinceMonth"].astype(int),
                day=1,
            ),
            errors="coerce",
        )

        # Calculate competition age in months
        request_df["CompetitionAgeMonths"] = (
            request_df["Date"].dt.year - request_df["CompetitionOpenDate"].dt.year
        ) * 12 + (
            request_df["Date"].dt.month - request_df["CompetitionOpenDate"].dt.month
        )

        # Indicator for whether competition opening date is known
        request_df["CompetitionDateKnown"] = (
            request_df["CompetitionOpenSinceYear"] != 1900
        ).astype(int)

        # Indicator for whether the competitor is active
        request_df["CompetitionActive"] = (
            request_df["CompetitionAgeMonths"] >= 0
        ).astype(int)

        # Replace negative competition ages with zero
        request_df.loc[
            request_df["CompetitionAgeMonths"] < 0,
            "CompetitionAgeMonths",
        ] = 0

        return request_df

    def create_promo_features(self, request_df):
        """
        Creates Promo2-related features.

        Features Created:
            - Promo2StartDate
            - Promo2AgeMonths
            - Promo2Active
        """

        request_df = request_df.copy()

        # Handle missing Promo2 information
        request_df["Promo2SinceWeek"] = request_df["Promo2SinceWeek"].fillna(1)

        request_df["Promo2SinceYear"] = request_df["Promo2SinceYear"].fillna(1900)

        # Create Promo2 start date
        request_df["Promo2StartDate"] = pd.to_datetime(
            request_df["Promo2SinceYear"].astype(int).astype(str)
            + "-W"
            + request_df["Promo2SinceWeek"].astype(int).astype(str).str.zfill(2)
            + "-1",
            format="%Y-W%W-%w",
            errors="coerce",
        )

        # Calculate Promo2 age in months
        request_df["Promo2AgeMonths"] = (
            request_df["Date"].dt.year - request_df["Promo2StartDate"].dt.year
        ) * 12 + (request_df["Date"].dt.month - request_df["Promo2StartDate"].dt.month)

        # Indicator for whether Promo2 is active
        request_df["Promo2Active"] = (request_df["Promo2AgeMonths"] >= 0).astype(int)

        # Replace negative Promo2 ages with zero
        request_df.loc[
            request_df["Promo2AgeMonths"] < 0,
            "Promo2AgeMonths",
        ] = 0

        request_df.loc[request_df["Promo2SinceYear"] == 1900, "Promo2AgeMonths"] = 0

        request_df.loc[request_df["Promo2SinceYear"] == 1900, "Promo2Active"] = 0

        return request_df

    def get_store_history(self, store, prediction_date, history_df=None):
        """
        Retrieves historical records for a store before the
        prediction date.

        Parameters
        ----------
        store : int
            Store for which history is required.

        prediction_date : pd.Timestamp
            Date for which prediction is being made.

        history_df : pd.DataFrame, optional
            Working historical dataset used during recursive forecasting.
            If None, the original historical dataset is used.

        Returns
        -------
        pd.DataFrame
            Historical records sorted by date.
        """
        if history_df is None:
            history_df = self.historical_data

        history = history_df[
            (history_df["Store"] == store) & (history_df["Date"] < prediction_date)
        ].copy()

        history = history.sort_values(by="Date").reset_index(drop=True)

        self.store_history_df = history.copy()

        return history

    def create_customer_historical_features(self, request_df, history_df=None):
        """
        Creates historical customer-based features.

        Features Created:
            - Customer Lag Features (7, 14, 28 days)
            - Customer Rolling Mean Features (7, 14, 28 days)
            - Customer Rolling Standard Deviation Features (7, 14, 28 days)
        """

        request_df = request_df.copy()

        store = request_df.loc[0, "Store"]

        prediction_date = request_df.loc[0, "Date"]

        customer_history = self.get_store_history(store, prediction_date, history_df)[
            "Customers"
        ]

        # Customer Lag Features
        for lag in [7, 14, 28]:

            request_df[f"Customers_Lag_{lag}"] = customer_history.iloc[-lag]

        # Customer Rolling Mean Features
        for window in [7, 14, 28]:

            request_df[f"Customers_RollingMean_{window}"] = customer_history.tail(
                window
            ).mean()

        # Customer Rolling Standard Deviation Features
        for window in [7, 14, 28]:

            request_df[f"Customers_RollingStd_{window}"] = customer_history.tail(
                window
            ).std()

        return request_df

    def create_sales_historical_features(self, request_df, history_df=None):
        """
        Creates historical sales-based features.

        Features Created:
            - Sales Lag Features (7, 14, 28 days)
            - Sales Rolling Mean Features (7, 14, 28 days)
            - Sales Rolling Standard Deviation Features (7, 14, 28 days)
        """

        request_df = request_df.copy()

        store = request_df.loc[0, "Store"]

        prediction_date = request_df.loc[0, "Date"]

        sales_history = self.get_store_history(store, prediction_date, history_df)[
            "Sales"
        ]

        # Sales Lag Features
        for lag in [7, 14, 28]:

            request_df[f"Sales_Lag_{lag}"] = sales_history.iloc[-lag]

        # Sales Rolling Mean Features
        for window in [7, 14, 28]:

            request_df[f"Sales_RollingMean_{window}"] = sales_history.tail(
                window
            ).mean()

        # Sales Rolling Standard Deviation Features
        for window in [7, 14, 28]:

            request_df[f"Sales_RollingStd_{window}"] = sales_history.tail(window).std()

        return request_df

    def prepare_features(self, business_request, history_df=None):
        """
        Executes the complete prediction feature engineering
        pipeline.

        Parameters
        ----------
        business_request : dict
            User input containing prediction information.

        Returns
        -------
        pd.DataFrame
            Fully engineered feature set ready for prediction.
        """

        request_df = self.complete_business_request(business_request)

        request_df = self.create_temporal_features(request_df)

        request_df = self.create_store_features(request_df)

        request_df = self.create_competition_features(request_df)

        request_df = self.create_promo_features(request_df)

        request_df = self.create_customer_historical_features(request_df, history_df)

        request_df = self.create_sales_historical_features(request_df, history_df)

        return request_df


# from src.config.configuration import ConfigurationManager

# config = ConfigurationManager().get_prediction_feature_engineering_config()

# feature_engineering = PredictionFeatureEngineering(config)

# request = {"Store": 15, "Date": "2015-07-15"}

# request_df = feature_engineering.complete_business_request(request)

# request_df = feature_engineering.create_temporal_features(request_df)

# request_df = feature_engineering.create_store_features(request_df)

# request_df = feature_engineering.create_competition_features(request_df)

# request_df = feature_engineering.create_promo_features(request_df)

# request_df = feature_engineering.create_customer_historical_features(request_df)

# print(request_df)
