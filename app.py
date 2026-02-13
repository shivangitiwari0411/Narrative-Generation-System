import streamlit as st
import os
from config import settings
from story.spec import build_act_specification
from prompts import build_prompt
from llm.factory import get_llm
from common.constants import LLMStrategyType
from common.state import StateManager
from story.exporter import StoryExporter

# Page Config
st.set_page_config(
    page_title="Narrative Generator",
    page_icon="🤖",
    layout="wide"
)

# Sidebar Configuration
st.sidebar.title("Configuration")

api_key = st.sidebar.text_input("OpenRouter API Key", value=os.getenv("OPENROUTER_API_KEY", ""), type="password", help="Enter your OpenRouter API Key to generate stories.")
if api_key:
    os.environ["OPENROUTER_API_KEY"] = api_key

model_name = st.sidebar.selectbox(
    "Select Model",
    ["meta-llama/llama-3.2-3b-instruct:free", "mistralai/mistral-7b-instruct:free", "google/gemini-2.0-flash-exp:free"],
    index=0
)

# Custom World Config
st.sidebar.subheader("World Settings")
world_desc = st.sidebar.text_area("World Description", value=settings.world.description)
act_name = st.sidebar.text_input("Act Name", value="Ethics in World of intelligent systems")

# Main Page
st.title("🤖 Narrative Generation System")
st.markdown("Generate sci-fi stories set in a world governed by AI.")

if st.button("Generate Story", type="primary"):
    if not api_key:
        st.error("Please enter an OpenRouter API Key in the sidebar.")
    else:
        with st.spinner("Generating narrative... (this may take a minute)"):
            try:
                # Update settings temporarily (in a real app, we'd use a better config injection)
                settings.world.description = world_desc
                
                # Update provider model
                # We need to hack the provider a bit since get_llm initializes with env var
                # For now, we assume the user set the key in session state or env
                
                spec = build_act_specification(
                    settings.characters,
                    settings.world,
                    act_name=act_name
                )
                
                prompts = build_prompt()
                context = prompts.handle({"spec": spec})
                
                # Initialize LLM with selected model
                from llm.provider import OpenRouterLLM
                llm = OpenRouterLLM(model=model_name)
                
                output = llm.generate(context["final_prompt"])
                
                st.subheader(act_name.upper())
                st.write(output)
                
                # Save & Export
                state_manager = StateManager()
                state_manager.save_state(spec.name, output)
                
                exporter = StoryExporter()
                path = exporter.export_to_markdown(spec.name, output)
                
                st.success(f"Story generated and saved!")
                
                # Download Button
                st.download_button(
                    label="Download Markdown",
                    data=output,
                    file_name=f"{act_name.replace(' ', '_').lower()}.md",
                    mime="text/markdown"
                )
                
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

# Footer
st.markdown("---")
st.markdown("Powered by OpenRouter & Streamlit")
