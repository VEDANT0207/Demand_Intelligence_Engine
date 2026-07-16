from src.components.llm_client import LLMClient

client = LLMClient()

response = client.generate_response(
    prompt="Say hello in one sentence."
)

print("\n===== RESPONSE =====")
print(response["response"])

print("\n===== MODEL =====")
print(response["model"])

print("\n===== USAGE =====")
print(response["usage"])