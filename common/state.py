import json
import os
from typing import Dict, Any, List
from datetime import datetime
from loguru import logger

class StateManager:
    def __init__(self, state_file: str = "story_state.json"):
        self.state_file = state_file

    def save_state(self, act_name: str, content: str):
        state = self.load_state()
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "act": act_name,
            "content": content
        }
        
        if "history" not in state:
            state["history"] = []
            
        state["history"].append(entry)
        
        try:
            with open(self.state_file, "w") as f:
                json.dump(state, f, indent=4)
            logger.info(f"State saved to {self.state_file}")
        except Exception as e:
            logger.error(f"Failed to save state: {e}")

    def load_state(self) -> Dict[str, Any]:
        if not os.path.exists(self.state_file):
            return {}
        try:
            with open(self.state_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load state: {e}")
            return {}
