import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from config import settings
from story.spec import build_act_specification
from prompts import build_prompt
from llm.provider import OpenRouterLLM
from common.state import StateManager
from list_models import list_models # Reusing logic if possible, or we can inline it

app = FastAPI(title="Narrative Generation API")

# Allow CORS for React app
# Allow CORS for all origins (Simplifies deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    api_key: Optional[str] = None
    model: str
    act_name: str
    world_description: str
    previous_context: Optional[str] = None
    choice: Optional[str] = None

class GenerateResponse(BaseModel):
    story: str

@app.post("/generate", response_model=GenerateResponse)
async def generate_story(request: GenerateRequest):
    try:
        # Set API Key if provided, otherwise use existing env/settings
        if request.api_key:
            os.environ["OPENROUTER_API_KEY"] = request.api_key
        
        # Update Settings
        settings.world.description = request.world_description
        
        # Build Spec
        spec = build_act_specification(
            settings.characters,
            settings.world,
            act_name=request.act_name
        )
        
        # Prepare Context
        context_data = {"spec": spec}
        
        # If continuing a story
        if request.previous_context and request.choice:
            context_data["previous_context"] = f"{request.previous_context}\n\nUSER CHOICE SELECTED: {request.choice}"
        
        # Build Prompt
        prompts = build_prompt()
        context = prompts.handle(context_data)
        
        # Generate
        llm = OpenRouterLLM(model=request.model)
        output = llm.generate(context["final_prompt"])
        
        # Save State (Optional)
        state_manager = StateManager()
        state_manager.save_state(spec.name, output)
        
        return GenerateResponse(story=output)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def get_models():
    # Return a static list for simplicity, or fetch dynamically
    return {
        "models": [
            "meta-llama/llama-3.2-3b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "google/gemini-2.0-flash-exp:free"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Council Debate Endpoint
from api.council import generate_council_debate, DebateResponse

class CouncilRequest(BaseModel):
    world_context: str
    topic: str

@app.post("/council/debate", response_model=DebateResponse)
async def debate(request: CouncilRequest):
    try:
        if not os.getenv("OPENROUTER_API_KEY") and not settings.openrouter_api_key:
             raise HTTPException(status_code=500, detail="API Key not configured")

        # Use fallback if key missing in env but present in request?
        # Actually generate_story sets the env var. Here we might need it too.
        # But this is a separate request. The api_key should be verified.
        # For simplicity, we assume the environment has the key (which it does via .env).
        
        return generate_council_debate(request.world_context, request.topic)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
