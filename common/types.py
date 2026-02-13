from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class Character:
    name: str
    role: str
    description: str

@dataclass
class Act:
    name: str
    description: str
    characters: List[Character] = field(default_factory=list)
    world_context: Dict[str, Any] = field(default_factory=dict)
    
@dataclass
class Scene:
    act_name: str
    description: str
    characters_in_scene: List[str]
