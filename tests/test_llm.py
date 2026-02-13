import pytest
from llm.provider import MockLLM, OpenRouterLLM
from common.constants import LLMStrategyType

def test_mock_llm_generation():
    llm = MockLLM()
    response = llm.generate("Test prompt")
    assert "mock response" in response

def test_openrouter_init_without_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    with pytest.raises(ValueError, match="OPENROUTER_API_KEY environment variable is not set"):
        OpenRouterLLM()
