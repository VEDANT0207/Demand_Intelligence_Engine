"""
Data Ingestion Component

Responsibilities:
- Read raw Rossmann datasets.
- Validate the datasets.
- Merge train.csv and store.csv.
- Save the merged dataset.

Input:
    data/raw/train.csv
    data/raw/store.csv

Output:
    data/processed/merged_data.csv
"""

from pathlib import Path

import pandas as pd

from src.config.configuration import ConfigurationManager

REQUIRED_TRAIN_COLUMNS = [
    "Store",
    "Date",
    "Sales",
    "Customers",
]

REQUIRED_STORE_COLUMNS = [
    "Store",
]


class DataIngestion:
    """
    Handles loading, validating, merging, and saving
    the raw Rossmann datasets.
    """

    def __init__(self, config: dict):
        """
        Initialize the Data Ingestion component.

        Args:
            config (dict): Configuration dictionary
                           containing file paths.
        """

        self.config = config

    def read_data(self) -> tuple[pd.DataFrame, pd.DataFrame]:
        """
        Read the raw training and store datasets.

        Shifting dates by 11 years to make it feel more realistic

        Returns:
            tuple[pd.DataFrame, pd.DataFrame]:
                Training DataFrame and Store DataFrame.

        """

        train_df = pd.read_csv(self.config["train_data_path"], dtype={"StateHoliday": str})
        train_df["Date"] = pd.to_datetime(train_df["Date"]) + pd.DateOffset(years=11)
        
        store_df = pd.read_csv(self.config["store_data_path"])

        return train_df, store_df

    def validate_data(
        self,
        train_df: pd.DataFrame,
        store_df: pd.DataFrame,
    ) -> None:
        """
        Validate the training and store datasets.

        Checks:
        - DataFrames are not empty.
        - Required columns are present.

        Args:
            train_df (pd.DataFrame): Training dataset.
            store_df (pd.DataFrame): Store dataset.

        Raises:
            ValueError: If a dataset is empty or required columns are missing.
        """

        # Check if datasets are empty
        if train_df.empty:
            raise ValueError("Training dataset is empty.")

        if store_df.empty:
            raise ValueError("Store dataset is empty.")

        # Check required columns in train dataset
        missing_train_columns = [
            column
            for column in REQUIRED_TRAIN_COLUMNS
            if column not in train_df.columns
        ]

        if missing_train_columns:
            raise ValueError(
                f"Missing columns in training dataset: {missing_train_columns}"
            )

        # Check required columns in store dataset
        missing_store_columns = [
            column
            for column in REQUIRED_STORE_COLUMNS
            if column not in store_df.columns
        ]

        if missing_store_columns:
            raise ValueError(
                f"Missing columns in store dataset: {missing_store_columns}"
            )

    def merge_data(
        self,
        train_df: pd.DataFrame,
        store_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Merge the training and store datasets.

        Args:
            train_df (pd.DataFrame): Training dataset.
            store_df (pd.DataFrame): Store dataset.

        Returns:
            pd.DataFrame: Merged dataset.
        """

        merged_df = train_df.merge(
            store_df,
            on="Store",
            how="left",
        )

        return merged_df

    def save_data(self, merged_df: pd.DataFrame) -> Path:
        """
        Save the merged dataset to the processed data directory.

        Args:
            merged_df (pd.DataFrame): Merged dataset.

        Returns:
            Path: Path to the saved CSV file.
        """

        output_path = self.config["merged_data_path"]

        # Create processed directory if it doesn't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Save merged dataset
        merged_df.to_parquet(output_path, index=False)

        return output_path

    def initiate_data_ingestion(self) -> Path:
        """
        Execute the complete data ingestion pipeline.

        Workflow:
            1. Read raw datasets.
            2. Validate datasets.
            3. Merge datasets.
            4. Save merged dataset.

        Returns:
            Path: Path to the merged dataset.
        """

        # Step 1: Read datasets
        train_df, store_df = self.read_data()

        # Step 2: Validate datasets
        self.validate_data(train_df, store_df)

        # Step 3: Merge datasets
        merged_df = self.merge_data(train_df, store_df)

        # Step 4: Save merged dataset
        output_path = self.save_data(merged_df)

        return output_path


if __name__ == "__main__":
    config = ConfigurationManager().get_data_ingestion_config()

    ingestion = DataIngestion(config)

    output_path = ingestion.initiate_data_ingestion()
    print(f"Data Ingestion completed successfully!")
    print(f"Merged dataset saved at:\n{output_path}")
