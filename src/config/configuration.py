from pathlib import Path


class ConfigurationManager:
    """
    Creates configuration settings for project components.
    """

    def __init__(self):
        self.project_root = Path(__file__).resolve().parents[2]

    def get_data_ingestion_config(self):
        data_root = self.project_root / "data" / "raw" / "rossmann"

        return {
            "root_dir": self.project_root / "data",
            "train_data_path": data_root / "train.csv",
            "store_data_path": data_root / "store.csv",
            "merged_data_path": self.project_root / "data" / "processed" / "merged_data.csv",
        }

    def get_feature_engineering_config(self):
        """
        Creates configuration settings for the Feature Engineering component.
        """

        return {
            "root_dir": self.project_root / "data",
            "merged_data_path": self.project_root / "data" / "processed" / "merged_data.csv",
            "engineered_data_path": self.project_root / "data" / "processed" / "engineered_data.csv",
        }
    
    def get_model_trainer_config(self):
        """
        Creates configuration settings for the Model Trainer component.
        """

        model_dir = self.project_root / "data" / "models"

        # Create models directory if it doesn't exist
        model_dir.mkdir(parents=True, exist_ok=True)

        return {
            "root_dir": self.project_root / "data",

            "engineered_data_path": self.project_root
            / "data"
            / "processed"
            / "engineered_data.csv",

            "customer_model_path": model_dir / "customer_model.pkl",

            "sales_model_path": model_dir / "sales_model.pkl",

            "customer_training_columns_path": model_dir / "customer_training_columns.pkl",

            "sales_training_columns_path": model_dir / "sales_training_columns.pkl",

        }
    
    def get_prediction_pipeline_config(self):
        """
        Creates configuration settings for the Prediction Pipeline component.
        """

        model_dir = self.project_root / "data" / "models"

        return {

            "customer_model_path": model_dir / "customer_model.pkl",

            "sales_model_path": model_dir / "sales_model.pkl",

            "customer_training_columns_path": model_dir / "customer_training_columns.pkl",

            "sales_training_columns_path": model_dir / "sales_training_columns.pkl",

        }


    def get_prediction_feature_engineering_config(self):
        """
        Creates configuration settings for the Prediction Feature Engineering component.
        """

        processed_dir = self.project_root / "data" / "processed"
        raw_dir = self.project_root / "data" / "raw" / "rossmann"

        return {

            # Historical data used for lag and rolling features
            "historical_data_path": processed_dir / "engineered_data.csv",

            "calendar_data_path": processed_dir / "merged_data.csv",

            # Store master information
            "store_data_path": raw_dir / "store.csv"

        }
    
    def get_recursive_forecast_config(self):
        """
        Returns configuration for the Recursive Forecast Engine.
        """

        config = {

            "default_forecast_days": 7,

            "save_recursive_results": True,

            "recursive_results_path": "data/predictions/recursive_forecast.csv",

            "manager_recursive_results_path": "data/predictions/recursive_forecast_manager.csv"

        }

        return config
    
    
    def get_explainability_config(self):
        """
        Creates configuration settings for the Explainability component.
        """

        model_dir = self.project_root / "data" / "models"

        model_dir.mkdir(parents=True, exist_ok=True)

        return {

            "top_features": 10,

            "customer_model_path": model_dir / "customer_model.pkl",

            "sales_model_path": model_dir / "sales_model.pkl",

            "customer_training_columns_path": model_dir / "customer_training_columns.pkl",

            "sales_training_columns_path": model_dir / "sales_training_columns.pkl",

            "customer_explainer_path": model_dir / "customer_shap_explainer.pkl",

            "sales_explainer_path": model_dir / "sales_shap_explainer.pkl",

            "use_saved_explainers": True

        }


    def get_operational_intelligence_config(self):
        """
        Returns configuration for the Operational Intelligence Engine.
        """

        return {
            "historical_window": 30,
            "weekly_window": 7,
            "top_shap_features": 10,
        }

    

    def get_prompt_config(self):
        """
        Returns configuration for prompt generation.
        """

        return {
            "system_role": "Retail Operations Advisor",
            "response_style": "professional",
            "max_summary_sentences": 5,
            "max_recommendations": 5,
            "include_explainability": True
        }


    def get_llm_config(self):
        """
        Returns configuration for the LLM client.
        """

        return {
            "provider": "groq",
            "model": "llama-3.3-70b-versatile",
            "temperature": 0.2,
            "max_tokens": 1000
        }

    def get_request_parser_config(self):

        return {

            "request_schema": {

                "Store": None,
                "Date": None,
                "Promo": None,
                "Open": None,
                "StateHoliday": None,
                "SchoolHoliday": None

            }

        }


    def get_visualization_config(self):

        visualization_dir = (self.project_root /"artifacts" /"visualizations")

        visualization_dir.mkdir(parents=True,exist_ok=True)

        return {

            "visualization_dir": visualization_dir,

            "summary_plot_path":
                visualization_dir / "summary_plot.png",

            "dependence_plot_path":
                visualization_dir / "dependence_plot.png",

            "force_plot_path":
                visualization_dir / "force_plot.html"

        }


    def get_forecast_visualization_config(self):

        return {
            "figsize": (12, 6),
            "save_plots": False,
            "plots_directory": "artifacts/forecast_plots"
        }

    def get_forecast_visualization_config(self):

        forecast_visualization_dir = (self.project_root/ "artifacts"/ "forecast_visualizations")

        forecast_visualization_dir.mkdir(parents=True,exist_ok=True)

        return {

            "forecast_visualization_dir":
                forecast_visualization_dir,

            "sales_forecast_plot_path":
                forecast_visualization_dir
                / "sales_forecast.png",

            "customer_forecast_plot_path":
                forecast_visualization_dir
                / "customer_forecast.png",

            "weekly_sales_plot_path":
                forecast_visualization_dir
                / "weekly_sales_forecast.png"
        }