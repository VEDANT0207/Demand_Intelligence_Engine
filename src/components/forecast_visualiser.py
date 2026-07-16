import matplotlib.pyplot as plt
import pandas as pd
from pathlib import Path

class ForecastVisualizer:

    def __init__(self,config):

        self.config = config
        self.figsize = (12, 6)


    def plot_sales_forecast(
        self,
        forecast_df
    ):

        fig, ax = plt.subplots(
            figsize=self.figsize
        )

        ax.plot(
            forecast_df["Date"],
            forecast_df["Predicted_Sales"]
        )

        ax.set_title(
            "Forecasted Sales"
        )

        ax.set_xlabel(
            "Date"
        )

        ax.set_ylabel(
            "Predicted Sales"
        )

        plt.xticks(
            rotation=45
        )

        plt.tight_layout()


        fig.savefig(
            self.config["sales_forecast_plot_path"]
        )

        return fig 
    

    def plot_customer_forecast(
        self,
        forecast_df
    ):

        fig, ax = plt.subplots(
            figsize=self.figsize
        )

        ax.plot(
            forecast_df["Date"],
            forecast_df["Predicted_Customers"]
        )

        ax.set_title(
            "Forecasted Customers"
        )

        ax.set_xlabel(
            "Date"
        )

        ax.set_ylabel(
            "Predicted Customers"
        )

        plt.xticks(
            rotation=45
        )

        plt.tight_layout()

        fig.savefig(
            self.config["customer_forecast_plot_path"]
        )

        return fig


    def plot_weekly_sales(
        self,
        forecast_df
    ):

        weekly = (
            forecast_df
            .set_index("Date")
            .resample("W")
            ["Predicted_Sales"]
            .sum()
            .reset_index()
        )

        fig, ax = plt.subplots(
            figsize=self.figsize
        )

        ax.plot(
            weekly["Date"],
            weekly["Predicted_Sales"]
        )

        ax.set_title(
            "Weekly Forecasted Sales"
        )

        ax.set_xlabel(
            "Week"
        )

        ax.set_ylabel(
            "Predicted Sales"
        )

        plt.xticks(
            rotation=45
        )

        plt.tight_layout()

    

        fig.savefig(
            self.config["weekly_sales_plot_path"]
        )

        return fig
    

    