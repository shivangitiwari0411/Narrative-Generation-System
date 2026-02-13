from config import CharacterData, WorldConfig
from story.spec import build_act_specification

def test_build_act_specification():
    char_data = CharacterData(
        factions=["Faction A", "Faction B"],
        advisor="Advisor Bot",
        themes=["Theme A"]
    )
    world_config = WorldConfig(
        description="A dark world",
        governance=["Rule 1"],
        conflicts=["Conflict 1"],
        advisor_role="Guide"
    )
    
    spec = build_act_specification(char_data, world_config, "Test Act")
    
    assert spec.name == "Test Act"
    assert len(spec.characters) == 3 # 2 factions + 1 advisor
    assert spec.characters[0].name == "Faction A"
    assert spec.characters[2].role == "Advisor"
    assert spec.world_context["description"] == "A dark world"
