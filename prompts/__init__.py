from typing import Dict, Any

class PromptBuilder:
    def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        spec = context["spec"]
        
        world_desc = spec.world_context.get("description", "")
        governance = ", ".join(spec.world_context.get("governance", []))
        
        characters_str = "\n".join([f"- {c.name}: {c.description}" for c in spec.characters])
        
        previous_context = context.get("previous_context", "")
        context_instruction = ""
        if previous_context:
            context_instruction = f"""
            **PREVIOUS STORY CONTEXT:**
            {previous_context}
            
            **INSTRUCTION:**
            Continue the story from the above context.
            """

        prompt = f"""
        Write a story act titled "{spec.name}".
        
        **The World:**
        {world_desc}
        Governance: {governance}
        
        **The Characters/Factions:**
        {characters_str}
        
        {context_instruction}
        
        **Instructions:**
        Write a compelling narrative that explores the conflict between efficiency and ethics.
        The story should be set in this futuristic world.

        **IMPORTANT: FORMATTING**
        At the end of your story, you MUST provide:
        1. An image generation prompt that describes the key scene of this chapter visually.
        2. A "State Update" for the player's RPG stats:
            - **dharma**: An integer from -100 (Adharma/Chaos) to +100 (Dharma/Order). Based on the user's last choice.
            - **karma**: An integer representing accumulated consequences (starts at 0).
            - **inventory**: A list of items/abilities the player currently has (e.g. "Data-Astra", "Royal Signet").
        3. 3 distinct choices for the reader to decide what happens next.
        
        These must be formatted as a JSON block at the very end of your response.
        
        Example format:
        ```json
        {{
            "image_prompt": "A cybernetic warrior standing on a neon-lit rooftop...",
            "dharma": 10,
            "karma": 5,
            "inventory": ["Plasma Katana", "Council Access Code"],
            "choices": [
                "Choice 1: Rachel decides to shutdown the AI.",
                "Choice 2: Rachel tries to negotiate with the Council.",
                "Choice 3: Rachel flees the city to finding the resistance."
            ]
        }}
        ```
        """
        
        context["final_prompt"] = prompt
        return context

def build_prompt() -> PromptBuilder:
    return PromptBuilder()
