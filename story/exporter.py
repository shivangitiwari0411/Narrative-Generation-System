from pathlib import Path
from loguru import logger

class StoryExporter:
    def __init__(self, export_dir: str = "exports"):
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(exist_ok=True)

    def export_to_markdown(self, title: str, content: str):
        # Sanitize title for filename
        filename = "".join(x for x in title if x.isalnum() or x in " -_").strip()
        filename = filename.replace(" ", "_").lower() + ".md"
        
        filepath = self.export_dir / filename
        
        try:
            with open(filepath, "w") as f:
                f.write(f"# {title}\n\n")
                f.write(content)
            logger.info(f"Story exported to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export story: {e}")
            return None
