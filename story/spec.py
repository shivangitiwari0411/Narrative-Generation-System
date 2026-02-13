from typing import Dict, Any
from common.types import Act, Character

from config import CharacterData, WorldConfig

def build_act_specification(character_data: CharacterData, world_config: WorldConfig, act_name: str) -> Act:
    characters = []
    # Simple logic to flatten factions into characters for now
    for faction in character_data.factions:
         characters.append(Character(name=faction, role="Faction", description=faction))
         
    if character_data.advisor:
         characters.append(Character(name="Advisor", role="Advisor", description=character_data.advisor))

    return Act(
        name=act_name,
        description=f"A story act exploring {act_name} in the defined world.",
        characters=characters,
        world_context=world_config.model_dump()
    )
