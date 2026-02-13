from common.constants import LLMStrategyType
from llm.provider import LLMProvider, OpenRouterLLM, MockLLM

def get_llm(strategy: LLMStrategyType) -> LLMProvider:
    if isinstance(strategy, str):
        strategy = LLMStrategyType(strategy)
        
    if strategy == LLMStrategyType.OPENROUTER:
        return OpenRouterLLM()
    elif strategy == LLMStrategyType.MOCK:
        return MockLLM()
    else:
        raise ValueError(f"Unknown LLM strategy: {strategy}")
