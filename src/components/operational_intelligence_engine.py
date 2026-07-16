from sqlite3 import Date

import numpy as np
import pandas as pd

from src.config.configuration import ConfigurationManager


class OperationalIntelligenceEngine:
    """
    Converts prediction results into structured business intelligence
    for downstream AI reasoning and decision support.
    """

    def __init__(self):
        self.config = ConfigurationManager().get_operational_intelligence_config()

        self.historical_window = self.config["historical_window"]
        self.weekly_window = self.config["weekly_window"]
        self.top_shap_features = self.config["top_shap_features"]

    def _calculate_demand_metrics(
        self, prediction_df: pd.DataFrame, store_history_df: pd.DataFrame
    ):
        """
        Calculates demand-related business metrics by comparing
        predicted demand with recent historical performance.
        """

        historical_window = store_history_df.tail(self.historical_window)

        predicted_sales = prediction_df["Predicted_Sales"].iloc[0]
        predicted_customers = prediction_df["Predicted_Customers"].iloc[0]

        historical_avg_sales = historical_window["Sales"].mean()
        historical_avg_customers = historical_window["Customers"].mean()

        sales_deviation = (
            (predicted_sales - historical_avg_sales) / historical_avg_sales * 100
            if historical_avg_sales != 0
            else None
        )

        customer_deviation = (
            (predicted_customers - historical_avg_customers)
            / historical_avg_customers
            * 100
            if historical_avg_customers != 0
            else None
        )

        return {
            "predicted_sales": round(predicted_sales, 2),
            "predicted_customers": round(predicted_customers, 2),
            "historical_avg_sales": round(historical_avg_sales, 2),
            "historical_avg_customers": round(historical_avg_customers, 2),
            "sales_deviation_percent": round(sales_deviation, 2),
            "customer_deviation_percent": round(customer_deviation, 2),
        }

    def _calculate_trend_metrics(self, store_history_df: pd.DataFrame):
        """
        Calculates short-term demand trends using recent
        historical sales and customer data.
        """

        recent_window = store_history_df.tail(self.weekly_window)
        previous_window = store_history_df.iloc[
            -(2 * self.weekly_window) : -self.weekly_window
        ]

        recent_sales_avg = recent_window["Sales"].mean()
        previous_sales_avg = previous_window["Sales"].mean()

        recent_customers_avg = recent_window["Customers"].mean()
        previous_customers_avg = previous_window["Customers"].mean()

        sales_trend = (
            ((recent_sales_avg - previous_sales_avg) / previous_sales_avg) * 100
            if previous_sales_avg != 0
            else None
        )

        customer_trend = (
            ((recent_customers_avg - previous_customers_avg) / previous_customers_avg)
            * 100
            if previous_customers_avg != 0
            else None
        )

        return {
            "sales_trend_percent": sales_trend,
            "customer_trend_percent": customer_trend,
        }

    def _calculate_promotion_metrics(self, prediction_df: pd.DataFrame):
        """
        Calculates promotion-related business metrics.

        Parameters
        ----------
        prediction_df : pd.DataFrame
            Engineered prediction features.

        Returns
        -------
        dict
            Promotion-related business metrics.
        """

        return {
            "promo_active": bool(prediction_df["Promo"].iloc[0]),
            "promo2_active": bool(prediction_df["Promo2Active"].iloc[0]),
            "promo2_age_months": prediction_df["Promo2AgeMonths"].iloc[0],
        }

    def _calculate_competition_metrics(self, feature_df: pd.DataFrame):
        """
        Calculates competition-related business metrics.

        Parameters
        ----------
        feature_df : pd.DataFrame
            Engineered prediction features.

        Returns
        -------
        dict
            Competition-related business metrics.
        """

        return {
            "competition_distance": feature_df["CompetitionDistance"].iloc[0],
            "competition_age_months": feature_df["CompetitionAgeMonths"].iloc[0],
            "competition_active": bool(feature_df["CompetitionActive"].iloc[0]),
            "competition_known": bool(feature_df["CompetitionDateKnown"].iloc[0]),
        }

    def _calculate_forecast_context(
        self,
        prediction_df: pd.DataFrame,
        store_history_df: pd.DataFrame,
        feature_df: pd.DataFrame,
    ):
        """
        Calculates forecast-related contextual metrics.

        Parameters
        ----------
        prediction_df : pd.DataFrame
            Prediction results containing predicted sales.

        store_history_df : pd.DataFrame
            Historical data for the requested store.

        feature_df : pd.DataFrame
            Engineered feature set used for prediction.

        Returns
        -------
        dict
            Forecast context metrics.
        """

        historical_window = store_history_df.tail(self.historical_window)

        predicted_sales = prediction_df["Predicted_Sales"].iloc[0]

        historical_records = len(historical_window)

        historical_min_sales = historical_window["Sales"].min()
        historical_max_sales = historical_window["Sales"].max()

        sales_mean = historical_window["Sales"].mean()
        sales_std = historical_window["Sales"].std()

        sales_volatility = sales_std / sales_mean if sales_mean != 0 else None

        return {
            "historical_records": historical_records,
            "historical_min_sales": historical_min_sales,
            "historical_max_sales": historical_max_sales,
            "sales_volatility": sales_volatility,
            "competition_context_available": bool(
                feature_df["CompetitionDateKnown"].iloc[0]
            ),
        }

    def _create_business_context(
        self,
        demand_metrics: dict,
        trend_metrics: dict,
        promotion_metrics: dict,
        competition_metrics: dict,
        forecast_context: dict,
        sales_explanation: dict = None,
    ):
        """
        Combines all operational intelligence metrics into a single
        business context dictionary.

        Parameters
        ----------
        demand_metrics : dict
            Demand-related metrics.

        trend_metrics : dict
            Trend-related metrics.

        promotion_metrics : dict
            Promotion-related metrics.

        competition_metrics : dict
            Competition-related metrics.

        forecast_context : dict
            Forecast contextual information.

        sales_explanation : dict, optional
            SHAP explanation for the sales prediction.

        Returns
        -------
        dict
            Combined business context.
        """

        return {
            "demand": demand_metrics,
            "trend": trend_metrics,
            "promotion": promotion_metrics,
            "competition": competition_metrics,
            "forecast_context": forecast_context,
            "explainability": sales_explanation,
        }

    def generate_operational_intelligence(
        self,
        prediction_df: pd.DataFrame,
        feature_df: pd.DataFrame,
        store_history_df: pd.DataFrame,
        sales_explanation: dict = None,
    ):
        """
        Generates complete operational intelligence for a prediction.

        Parameters
        ----------
        prediction_df : pd.DataFrame
            Prediction results.

        feature_df : pd.DataFrame
            Engineered feature set.

        store_history_df : pd.DataFrame
            Historical data for the requested store.

        sales_explanation : dict, optional
            SHAP explanation for the sales prediction.

        Returns
        -------
        dict
            Complete operational intelligence.
        """

        demand_metrics = self._calculate_demand_metrics(prediction_df, store_history_df)

        trend_metrics = self._calculate_trend_metrics(store_history_df)

        promotion_metrics = self._calculate_promotion_metrics(feature_df)

        competition_metrics = self._calculate_competition_metrics(feature_df)

        forecast_context = self._calculate_forecast_context(
            prediction_df, store_history_df, feature_df
        )

        return self._create_business_context(
            demand_metrics,
            trend_metrics,
            promotion_metrics,
            competition_metrics,
            forecast_context,
            sales_explanation,
        )

    def generate_batch_operational_intelligence(
        self, prediction_df: pd.DataFrame, batch_explanation: dict = None
    ):
        """
        Generates operational intelligence for batch predictions.

        Parameters
        ----------
        prediction_df : pd.DataFrame
            Batch prediction results.

        batch_explanation : dict, optional
            Aggregated explainability output.

        Returns
        -------
        dict
            Batch business context.
        """

        open_store_df = prediction_df[prediction_df["Open"] == 1]

        return {
            "summary": {
                "total_predictions": int(len(prediction_df)),
                "open_stores": int((prediction_df["Open"] == 1).sum()),
                "closed_stores": int((prediction_df["Open"] == 0).sum()),
                "total_predicted_sales": round(
                    prediction_df["Predicted_Sales"].sum(), 2
                ),
                "average_predicted_sales": round(
                    prediction_df["Predicted_Sales"].mean(), 2
                ),
                "total_predicted_customers": round(
                    prediction_df["Predicted_Customers"].sum(), 2
                ),
                "average_predicted_customers": round(
                    prediction_df["Predicted_Customers"].mean(), 2
                ),
                "max_predicted_sales": round(prediction_df["Predicted_Sales"].max(), 2),
                "min_predicted_sales": round(prediction_df["Predicted_Sales"].min(), 2),
            },
            "promotion": {
                "promo_active_stores": int(prediction_df["Promo"].sum()),
                "promo_percentage": round(prediction_df["Promo"].mean() * 100, 2),
            },
            "top_stores": (
                open_store_df.sort_values("Predicted_Sales", ascending=False)
                .head(10)[
                    ["Store", "Date", "Predicted_Sales", "Predicted_Customers", "Promo"]
                ]
                .to_dict(orient="records")
            ),
            "forecast_context": {
                "sales_std": round(prediction_df["Predicted_Sales"].std(), 2),
                "customer_std": round(prediction_df["Predicted_Customers"].std(), 2),
            },
            "explainability": batch_explanation,
        }

    def _calculate_forecast_summary(self, forecast_df: pd.DataFrame):
        summary = {
            "forecast_horizon_days": len(forecast_df),
            "forecast_start_date": forecast_df["Date"].min(),
            "forecast_end_date": forecast_df["Date"].max(),
            "total_predicted_sales": round(forecast_df["Predicted_Sales"].sum(), 2),
            "average_daily_sales": round(forecast_df["Predicted_Sales"].mean(), 2),
            "total_predicted_customers": round(
                forecast_df["Predicted_Customers"].sum(), 2
            ),
            "average_daily_customers": round(
                forecast_df["Predicted_Customers"].mean(), 2
            ),
            "open_days": int((forecast_df["Open"] == 1).sum()),
            "closed_days": int((forecast_df["Open"] == 0).sum()),
            "peak_sales_day": forecast_df.loc[
                forecast_df["Predicted_Sales"].idxmax(), "Date"
            ],
            "peak_sales": round(forecast_df["Predicted_Sales"].max(), 2),
            "lowest_sales_day": forecast_df.loc[
                forecast_df["Predicted_Sales"].idxmin(), "Date"
            ],
            "lowest_sales": round(forecast_df["Predicted_Sales"].min(), 2),
            "sales_volatility_percent": round(
                forecast_df["Predicted_Sales"].std()
                / forecast_df["Predicted_Sales"].mean()
                * 100,
                2,
            ),
        }

        return summary

    def _calculate_peak_forecast_days(self, forecast_df: pd.DataFrame):

        top_days = forecast_df.sort_values("Predicted_Sales", ascending=False).head(10)

        return top_days[
            ["Date", "Predicted_Sales", "Predicted_Customers", "Promo"]
        ].to_dict(orient="records")

    def _calculate_forecast_statistics(self, forecast_df: pd.DataFrame):

        return {
            "sales_std": round(forecast_df["Predicted_Sales"].std(), 2),
            "customer_std": round(forecast_df["Predicted_Customers"].std(), 2),
            "max_sales": round(forecast_df["Predicted_Sales"].max(), 2),
            "min_sales": round(forecast_df["Predicted_Sales"].min(), 2),
        }

    def generate_forecast_operational_intelligence(self, forecast_df: pd.DataFrame):
        """generates operational intelligence for a forecasted period."""

        summary = self._calculate_forecast_summary(forecast_df)

        top_days = self._calculate_peak_forecast_days(forecast_df)

        forecast_statistics = self._calculate_forecast_statistics(forecast_df)

        return {
            "summary": summary,
            "top_forecast_days": top_days,
            "forecast_context": forecast_statistics,
            "explainability": None,
        }
