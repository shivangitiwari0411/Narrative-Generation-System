import requests
import os
from dotenv import load_dotenv

load_dotenv()

def list_models():
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        print("No API key found")
        return

    response = requests.get("https://openrouter.ai/api/v1/models")
    if response.status_code == 200:
        models = response.json()["data"]
        # Filter for free or low cost models
        print("Available models:")
        for m in models:
            if "free" in m["id"] or "gemini" in m["id"] or "mistral" in m["id"]:
                 print(f"- {m['id']}")
    else:
        print(f"Error fetching models: {response.text}")

if __name__ == "__main__":
    list_models()
