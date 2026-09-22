import os

from openai import OpenAI
from dotenv import load_dotenv

from src.config.configuration import ConfigurationManager


class LLMClient:

    def __init__(self):

        load_dotenv()  # Load environment variables from .env file

        self.config = ConfigurationManager().get_llm_config()

        self.provider = self.config["provider"]
        self.model = self.config["model"]
        self.temperature = self.config["temperature"]
        self.max_tokens = self.config["max_tokens"]

        self.client = self._create_client()

    def _create_client(self):
        """
        Creates and returns the configured LLM client.

        Returns
        -------
        OpenAI
            Initialized LLM client.

        Raises
        ------
        ValueError
            If the configured provider is not supported.
        """

        if self.provider == "groq":

            api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")

            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables.")

            return OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

        raise ValueError(f"Unsupported LLM provider: {self.provider}")

    def generate_response(
        self, prompt: str, temperature: float = None, max_tokens: int = None
    ):
        """
        Generates a response from the configured LLM.

        Parameters
        ----------
        prompt : str
            Prompt to send to the LLM.

        temperature : float, optional
            Overrides the configured temperature.

        max_tokens : int, optional
            Overrides the configured maximum tokens.

        Returns
        -------
        dict
            Generated response.
        """

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        temperature = temperature if temperature is not None else self.temperature

        max_tokens = max_tokens if max_tokens is not None else self.max_tokens

        candidate_models = [self.model, "openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
        seen = set()
        unique_models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        last_error = None
        for candidate_model in unique_models:
            try:
                response = self.client.chat.completions.create(
                    model=candidate_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

                return {
                    "provider": self.provider,
                    "model": candidate_model,
                    "response": response.choices[0].message.content,
                    "usage": response.usage,
                }
            except Exception as e:
                last_error = e
                continue

        raise RuntimeError(f"Failed to generate LLM response: {str(last_error)}") from last_error
