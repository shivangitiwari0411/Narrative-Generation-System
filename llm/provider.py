from abc import ABC, abstractmethod
import os
import requests
from typing import Dict, Any, Optional
from common.constants import LLMStrategyType

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        pass

from config import settings

import time

class OpenRouterLLM(LLMProvider):
    def __init__(self, model: str = "google/gemma-3-27b-it:free"):
        self.api_key = os.getenv("OPENROUTER_API_KEY") or settings.openrouter_api_key
        self.model = model
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in environment or config")
            
    def generate(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        # Fallback models to try if the primary one fails
        fallback_models = [
            "mistralai/mistral-7b-instruct:free",
            "meta-llama/llama-3.2-3b-instruct:free",
            "openrouter/auto"
        ]
        
        # Helper to try a specific model
        def try_generate(params, retries=2):
            for attempt in range(retries + 1):
                try:
                    response = requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=params,
                        timeout=45
                    )
                    
                    if response.status_code == 429:
                        if attempt < retries:
                            wait_time = (attempt + 1) * 2
                            print(f"Rate limit ({params['model']}). Retrying in {wait_time}s...")
                            time.sleep(wait_time)
                            continue
                        else:
                            print(f"Rate limit exhausted for {params['model']}.")
                            return None # Signal to try next model

                    if response.status_code != 200:
                        print(f"Error {response.status_code} for {params['model']}: {response.text}")
                        if attempt < retries:
                             time.sleep(1)
                             continue
                        return None
                        
                    return response.json()["choices"][0]["message"]["content"]
                    
                except Exception as e:
                    print(f"Exception for {params['model']}: {e}")
                    if attempt < retries:
                        time.sleep(1)
                    else:
                        return None
            return None

        # 1. Try Primary Model
        print(f"Generating with primary model: {self.model}")
        result = try_generate({**data, "model": self.model})
        if result:
            return result
            
        # 2. Try Fallbacks
        for fallback in fallback_models:
            if fallback == self.model: continue # Skip if it was the primary
            
            print(f"Primary failed. Switching to fallback: {fallback}")
            result = try_generate({**data, "model": fallback})
            if result:
                return result
        
        raise RuntimeError(f"All models failed. Please try again later.")

class MockLLM(LLMProvider):
    def generate(self, prompt: str) -> str:
        return "This is a mock response from the LLM for testing purposes."
