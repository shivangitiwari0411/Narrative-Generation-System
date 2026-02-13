from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class WorldConfig(BaseModel):
    description: str
    governance: List[str]
    conflicts: List[str]
    advisor_role: str

class CharacterData(BaseModel):
    factions: List[str]
    advisor: str
    themes: List[str]

class Settings(BaseSettings):
    world: WorldConfig = Field(default_factory=lambda: WorldConfig(
        description=(
            "A high-tech, cybernetic adaptation of the Mahabharata era (Kurukshetra 3000). "
            "The world is divided between the Pandava Alliance (upholders of digital Dharma) and the Kaurava Syndicate (ruthless expansionists). "
            "Advanced AI weapons (Astras) and cybernetic enhancements are commonplace."
        ),
        governance=["The Cyber-Dharma Council", "Syndicate Rule"],
        conflicts=[
            "The struggle for the Throne of Hastinapura Prime",
            "Ethical use of Astra-class AI weaponry"
        ],
        advisor_role="Krishna-AI, a supreme strategic intelligence guiding the balance of the world"
    ))
    
    characters: CharacterData = Field(default_factory=lambda: CharacterData(
        factions=[
            "Pandava Alliance: Seeking justice and distinct truth",
            "Kaurava Syndicate: Seeking absolute control and efficiency",
            "Neutral Kingdoms: Caught in the crossfire"
        ],
        advisor="Krishna-AI: The preserver of cosmic digital order",
        themes=[
            "Dharma (Duty) in a godless age",
            "The cost of war and revenge",
            "Karma and digital causality"
        ]
    ))
    
    openrouter_api_key: Optional[str] = Field(default=None, validation_alias="OPENROUTER_API_KEY")
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
