# Reimagined Mahabharata in an AI World

This project generates a story inspired by the Mahabharata in a world governed by intelligent systems.

## Features
- Modular prompt engineering
- Chain-of-responsibility for story transformation
- Multiple LLM support
- Structured story acts: Setup, Confrontation, Resolution

## Requirements
- Python 3.10+
- Install dependencies: `pip install -r requirements.txt`
- An OpenRouter API key

## Setup to run

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Narrative-Generation-System
   ```

2. **Install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your **OpenRouter API Key** (Get one at [openrouter.ai](https://openrouter.ai/)).

4. **Run the Project:**
   - **Real World Mode** (Uses OpenRouter):
     ```bash
     python run.py
     ```
   - **Test Mode** (No API Key needed):
     ```bash
     python run.py --llm mock
     ```

5. **Docker Usage:**
   ```bash
   docker build -t narrative-app .
   docker run -e OPENROUTER_API_KEY=your_key narrative-app
   ```
