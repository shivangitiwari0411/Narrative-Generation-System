import argparse
from config import WORLD_CONFIG, CHARACTER_DATA
from story.spec import build_act_specification
from prompts import build_prompt
from llm.factory import get_llm
from dotenv import load_dotenv
from common.constants import LLMStrategyType
load_dotenv()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--llm", default=LLMStrategyType.OPENROUTER,
                        choices=[LLMStrategyType.OPENROUTER.value])
    args = parser.parse_args()

    spec = build_act_specification(
        CHARACTER_DATA,
        WORLD_CONFIG,
        act_name="Ethics in World of intelligent systems"
    )

    prompts = build_prompt()
    context = prompts.handle({"spec": spec})
    llm = get_llm(args.llm)
    output = llm.generate(context["final_prompt"])

    print("\nETHICS IN THE WORLD OF INTELLIGENT SYSTEMS\n")
    print(output)

if __name__ == "__main__":
    main()
