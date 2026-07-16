import shap
import matplotlib.pyplot as plt


class SHAPVisualizer:
    """
    Visualizes SHAP explanations.
    """

    def plot_summary(self, shap_values, features, save_path=None):
        """
        Generates the SHAP summary plot.

        Parameters
        ----------
        shap_values
            SHAP values.

        features
            Feature dataframe.

        save_path : str or Path, optional
            If provided, saves the plot to this location.

        Returns
        -------
        str or None
            Saved image path if save_path is provided.
        """

        shap.summary_plot(shap_values, features, show=False)

        plt.tight_layout()

        if save_path is not None:
            plt.savefig(save_path, dpi=300, bbox_inches="tight")
            plt.close()
            return save_path

        plt.show()
        plt.close()

        return None

    def plot_force(
        self, expected_value, shap_values, features, index=0, save_path=None
    ):
        """
        Generates the SHAP force plot.

        Parameters
        ----------
        expected_value
            SHAP expected value.

        shap_values
            SHAP values.

        features
            Feature dataframe.

        index : int, default=0
            Row to explain.

        save_path : str or Path, optional
            Saves the interactive force plot as HTML.

        Returns
        -------
        object or str
            SHAP force plot object or saved HTML path.
        """

        force_plot = shap.force_plot(
            expected_value, shap_values[index], features.iloc[index]
        )

        if save_path is not None:
            shap.save_html(save_path, force_plot)
            return save_path

        return force_plot

    def plot_dependence(self, feature_name, shap_values, features, save_path=None):
        """
        Generates the SHAP dependence plot.

        Parameters
        ----------
        feature_name : str
            Feature to visualize.

        shap_values
            SHAP values.

        features
            Feature dataframe.

        save_path : str or Path, optional
            If provided, saves the plot.

        Returns
        -------
        str or None
            Saved image path if save_path is provided.
        """

        shap.dependence_plot(feature_name, shap_values, features, show=False)

        plt.tight_layout()

        if save_path is not None:
            plt.savefig(save_path, dpi=300, bbox_inches="tight")
            plt.close()
            return save_path

        plt.show()
        plt.close()

        return None
