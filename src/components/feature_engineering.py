"""
Feature Engineering Component

Responsibilities:
- Load merged Rossmann dataset.
- Create engineered features.
- Encode categorical variables.
- Generate lag and rolling features.
- Save the processed dataset.

Input:
    data/processed/merged_data.csv

Output:
    data/processed/engineered_data.csv
"""

from pathlib import Path

import pandas as pd

from src.config.configuration import ConfigurationManager


class FeatureEngineering:

    def __init__(self, config: dict):
        """
        Initialize the Feature Engineering component.

        Args:
            config (dict): Configuration dictionary
                           containing file paths.
        """

        self.config = config

        # DataFrame that will be transformed throughout the pipeline
        self.df = None

    def load_data(self):
        """
        Load the merged dataset for feature engineering.

        Reads the merged dataset, parses the Date column as datetime,
        and stores the DataFrame as an instance attribute.

        Returns:
            None
        """

        self.df = pd.read_csv(
            self.config["merged_data_path"],
            parse_dates=["Date"],
            dtype={"StateHoliday": str},
        )

    def create_temporal_features(self) -> None:
        """
        Create temporal features from the Date column.

        Features Created:
            - Year
            - Month
            - Quarter
            - Day
            - WeekOfYear
            - IsWeekend
            - IsMonthStart
            - IsMonthEnd
            - IsQuarterStart
            - IsQuarterEnd
        """

        date = self.df["Date"]

        self.df["Year"] = date.dt.year
        self.df["Month"] = date.dt.month
        self.df["Quarter"] = date.dt.quarter
        self.df["Day"] = date.dt.day

        self.df["WeekOfYear"] = date.dt.isocalendar().week.astype(int)

        self.df["IsWeekend"] = (date.dt.dayofweek >= 5).astype(int)

        self.df["IsMonthStart"] = date.dt.is_month_start.astype(int)
        self.df["IsMonthEnd"] = date.dt.is_month_end.astype(int)

        self.df["IsQuarterStart"] = date.dt.is_quarter_start.astype(int)
        self.df["IsQuarterEnd"] = date.dt.is_quarter_end.astype(int)

    def create_competition_features(self) -> None:
        """
        Create competition-related features.

        Features Created:
            - CompetitionOpenDate
            - CompetitionAgeMonths
            - CompetitionDateKnown
            - CompetitionActive
        """

        # Handle missing competition opening information

        self.df["CompetitionOpenSinceMonth"] = self.df[
            "CompetitionOpenSinceMonth"
        ].fillna(1)

        self.df["CompetitionOpenSinceYear"] = self.df[
            "CompetitionOpenSinceYear"
        ].fillna(1900)

        # Create competition opening date
        self.df["CompetitionOpenDate"] = pd.to_datetime(
            dict(
                year=self.df["CompetitionOpenSinceYear"].astype(int),
                month=self.df["CompetitionOpenSinceMonth"].astype(int),
                day=1,
            ),
            errors="coerce",
        )

        # Calculate competition age in months

        self.df["CompetitionAgeMonths"] = (
            self.df["Date"].dt.year - self.df["CompetitionOpenDate"].dt.year
        ) * 12 + (self.df["Date"].dt.month - self.df["CompetitionOpenDate"].dt.month)

        # Indicator for whether competition opening date is known

        self.df["CompetitionDateKnown"] = (
            self.df["CompetitionOpenSinceYear"] != 1900
        ).astype(int)

        # Indicator for whether the competitor is active

        self.df["CompetitionActive"] = (self.df["CompetitionAgeMonths"] >= 0).astype(
            int
        )

        # Replace negative competition ages with zero

        self.df.loc[
            self.df["CompetitionAgeMonths"] < 0,
            "CompetitionAgeMonths",
        ] = 0

    def create_promo_features(self) -> None:
        """
        Create Promo2-related features.

        Features Created:
            - Promo2StartDate
            - Promo2AgeMonths
            - Promo2Active
        """

        # Handle missing Promo2 information

        self.df["Promo2SinceWeek"] = self.df["Promo2SinceWeek"].fillna(1)

        self.df["Promo2SinceYear"] = self.df["Promo2SinceYear"].fillna(1900)

        # Create Promo2 start date

        self.df["Promo2StartDate"] = pd.to_datetime(
            self.df["Promo2SinceYear"].astype(int).astype(str)
            + "-W"
            + self.df["Promo2SinceWeek"].astype(int).astype(str).str.zfill(2)
            + "-1",
            format="%Y-W%W-%w",
            errors="coerce",
        )

        # Calculate Promo2 age in months
        self.df["Promo2AgeMonths"] = (
            self.df["Date"].dt.year - self.df["Promo2StartDate"].dt.year
        ) * 12 + (self.df["Date"].dt.month - self.df["Promo2StartDate"].dt.month)

        # Indicator for whether Promo2 is active

        self.df["Promo2Active"] = (self.df["Promo2AgeMonths"] >= 0).astype(int)

        # Replace negative Promo2 ages with zero

        self.df.loc[
            self.df["Promo2AgeMonths"] < 0,
            "Promo2AgeMonths",
        ] = 0

    def encode_features(self) -> None:
        """
        One-hot encode categorical features.

        Encodes:
            - StoreType
            - Assortment
            - StateHoliday
        """

        self.df = pd.get_dummies(
            self.df,
            columns=[
                "StoreType",
                "Assortment",
                "StateHoliday",
            ],
            drop_first=True,
            dtype=int,
        )

    def create_lag_features(self) -> None:
        """
        Create historical sales lag features.

        Features Created:
            - Sales_Lag_7
            - Sales_Lag_14
            - Sales_Lag_28
        """

        # Ensure chronological ordering within each store

        self.df = self.df.sort_values(by=["Store", "Date"])

        # Create lag features

        for lag in [7, 14, 28]:
            self.df[f"Sales_Lag_{lag}"] = self.df.groupby("Store")["Sales"].shift(lag)

    def create_rolling_features(self) -> None:
        """
        Create rolling statistical features.

        Features Created:
            - Sales_RollingMean_7
            - Sales_RollingMean_14
            - Sales_RollingMean_28
            - Sales_RollingStd_7
            - Sales_RollingStd_14
            - Sales_RollingStd_28
        """

        # Create rolling mean features

        for window in [7, 14, 28]:
            self.df[f"Sales_RollingMean_{window}"] = self.df.groupby("Store")[
                "Sales"
            ].transform(lambda x: x.shift(1).rolling(window).mean())

        # Create rolling standard deviation features

        for window in [7, 14, 28]:
            self.df[f"Sales_RollingStd_{window}"] = self.df.groupby("Store")[
                "Sales"
            ].transform(lambda x: x.shift(1).rolling(window).std())

    def create_customer_historical_features(self) -> None:
        """
        Create historical customer-based features.

        Features Created:
            - Customer Lag Features (7, 14, 28 days)
            - Customer Rolling Mean Features (7, 14, 28 days)
            - Customer Rolling Standard Deviation Features (7, 14, 28 days)

        Notes:
            - Assumes the dataset is already sorted by
            Store and Date.
            - Uses shift(1) before rolling calculations
            to prevent data leakage.
        """

        # Customer Lag Features

        for lag in [7, 14, 28]:
            self.df[f"Customers_Lag_{lag}"] = self.df.groupby("Store")[
                "Customers"
            ].shift(lag)

        # Customer Rolling Mean Features

        for window in [7, 14, 28]:
            self.df[f"Customers_RollingMean_{window}"] = self.df.groupby("Store")[
                "Customers"
            ].transform(lambda x: x.shift(1).rolling(window).mean())

        # Customer Rolling Standard Deviation Features

        for window in [7, 14, 28]:
            self.df[f"Customers_RollingStd_{window}"] = self.df.groupby("Store")[
                "Customers"
            ].transform(lambda x: x.shift(1).rolling(window).std())

    def cleanup_data(self) -> None:
        """
        Clean the engineered dataset.

        Operations:
            - Fill missing CompetitionDistance values.
            - Remove intermediate feature engineering columns.
            - Remove rows containing NaN values introduced by
            lag and rolling feature creation.
            - Reset the DataFrame index.
        """

        # Fill missing competition distance values

        self.df["CompetitionDistance"] = self.df["CompetitionDistance"].fillna(
            self.df["CompetitionDistance"].median()
        )

        # Remove intermediate feature engineering columns

        drop_columns = [
            "CompetitionOpenSinceMonth",
            "CompetitionOpenSinceYear",
            "CompetitionOpenDate",
            "Promo2SinceWeek",
            "Promo2SinceYear",
            "Promo2StartDate",
            "PromoInterval",
        ]

        self.df.drop(columns=drop_columns, inplace=True)

        # Remove rows with missing values

        self.df.dropna(inplace=True)

        # Reset index

        self.df.reset_index(drop=True, inplace=True)

        # Mark unknown competition history

        self.df.loc[
            self.df["CompetitionDateKnown"] == 0,
            "CompetitionAgeMonths",
        ] = -1

        # Mark stores without Promo2 history

        self.df.loc[
            self.df["Promo2"] == 0,
            "Promo2AgeMonths",
        ] = -1

    def save_data(self):
        """
        Save the engineered dataset.
        """

        output_path = self.config["engineered_data_path"]

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.df.to_csv(output_path, index=False)

        return output_path

    def initiate_feature_engineering(self):

        self.load_data()

        self.create_temporal_features()

        self.create_competition_features()

        self.create_promo_features()

        self.encode_features()

        self.create_lag_features()

        self.create_rolling_features()

        self.create_customer_historical_features()

        self.cleanup_data()

        output_path = self.save_data()

        return output_path


if __name__ == "__main__":

    config = ConfigurationManager().get_feature_engineering_config()

    feature_engineering = FeatureEngineering(config)

    output_path = feature_engineering.initiate_feature_engineering()

    print("Feature Engineering completed successfully!")
    print(f"Engineered dataset saved at:\n{output_path}")
