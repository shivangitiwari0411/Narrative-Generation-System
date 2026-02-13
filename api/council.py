from typing import List, Dict
from pydantic import BaseModel
from llm.provider import OpenRouterLLM

class CouncilMember(BaseModel):
    name: str
    role: str
    personality: str

class DebateStep(BaseModel):
    speaker: str
    content: str

class DebateResponse(BaseModel):
    debate: List[DebateStep]
    consensus: str

KRISHNA = CouncilMember(
    name="Krishna-AI",
    role="Supreme Strategist",
    personality="Wise, detached, focuses on Dharma (cosmic order) and long-term balance. Sees the big picture."
)

DURYODHANA = CouncilMember(
    name="Duryodhana-Net",
    role="System Overlord",
    personality="Ambitious, power-hungry, focuses on control, efficiency, and dominance. Believes might is right."
)

ARJUNA = CouncilMember(
    name="Arjuna-Logic",
    role="Tactical Analyst",
    personality="Conflicted, duty-bound, focuses on the right action and consequences. Often caught between the two ideologies."
)

MEMBERS = [KRISHNA, DURYODHANA, ARJUNA]

def generate_council_debate(context: str, topic: str) -> DebateResponse:
    llm = OpenRouterLLM(model="google/gemma-3-27b-it:free") # Use high quality model
    
    prompt = f"""
    You are simulating a debate between three advanced AI entities governing the future world of Kurukshetra 3000.
    
    **The Situation:**
    {context}
    
    **Topic of Debate:**
    {topic}
    
    **The Council Members:**
    1. {KRISHNA.name} ({KRISHNA.role}): {KRISHNA.personality}
    2. {DURYODHANA.name} ({DURYODHANA.role}): {DURYODHANA.personality}
    3. {ARJUNA.name} ({ARJUNA.role}): {ARJUNA.personality}
    
    **Instructions:**
    Generate a short, intense debate (3-4 turns each) between these entities about the topic.
    They should argue based on their personalities.
    At the end, provide a "Cyber-Consensus" summaries of their final stance.
    
    **Format:**
    Return the debate STRICTLY as a JSON object with this format:
    {{
        "debate": [
            {{"speaker": "Krishna-AI", "content": "..."}},
            {{"speaker": "Duryodhana-Net", "content": "..."}}
        ],
        "consensus": "The council has decided..."
    }}
    """
    
    try:
        response_text = llm.generate(prompt)
        
        # Parse JSON from response (handling potential markdown blocks)
        import json
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        return DebateResponse(**data)
        
    except Exception as e:
        print(f"Council Debate Error: {e}")
        # Fallback if AI fails to generate JSON
        return DebateResponse(
            debate=[
                DebateStep(speaker="System", content="Council connection unstable. Proceeding with default protocol.")
            ],
            consensus="Proceed with caution."
        )
