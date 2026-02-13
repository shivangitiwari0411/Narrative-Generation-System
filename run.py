import argparse
from loguru import logger
from config import settings
from story.spec import build_act_specification
from prompts import build_prompt
from llm.factory import get_llm
from dotenv import load_dotenv
from common.constants import LLMStrategyType
load_dotenv()

from common.state import StateManager
from story.exporter import StoryExporter

def main():
    """
    Main entry point for the Narrative Generation System.
    Parses command line arguments, builds the act specification,
    Generates the prompt, and queries the LLM to generate the story.
    """
    logger.info("Starting Narrative Generation System")
    parser = argparse.ArgumentParser()
    parser.add_argument("--llm", default=LLMStrategyType.OPENROUTER.value,
                        choices=[s.value for s in LLMStrategyType])
    args = parser.parse_args()

    logger.info(f"Using LLM strategy: {args.llm}")
    
    spec = build_act_specification(
        settings.characters,
        settings.world,
        act_name="Ethics in World of intelligent systems"
    )

    prompts = build_prompt()
    context = prompts.handle({"spec": spec})
    llm = get_llm(args.llm)
    output = llm.generate(context["final_prompt"])

    print("\nETHICS IN THE WORLD OF INTELLIGENT SYSTEMS\n")
    print(output)
    
    # Save State
    state_manager = StateManager()
    state_manager.save_state(spec.name, output)
    
    # Export
    exporter = StoryExporter()
    exported_path = exporter.export_to_markdown(spec.name, output)
    if exported_path:
        logger.info(f"Story exported to: {exported_path}")

if __name__ == "__main__":
    main()
