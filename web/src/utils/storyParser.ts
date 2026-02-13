export interface StoryChoice {
    text: string;
}

export interface ParsedStory {
    content: string;
    choices: string[];
    imagePrompt?: string;
    dharma?: number;
    karma?: number;
    inventory?: string[];
}

export const parseStoryContent = (fullText: string): ParsedStory => {
    // Regex to find the JSON block at the end
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = fullText.match(jsonRegex);

    if (match && match[1]) {
        try {
            const data = JSON.parse(match[1]);
            const content = fullText.replace(jsonRegex, '').trim();

            return {
                content,
                choices: Array.isArray(data.choices) ? data.choices : [],
                imagePrompt: data.image_prompt,
                dharma: typeof data.dharma === 'number' ? data.dharma : undefined,
                karma: typeof data.karma === 'number' ? data.karma : undefined,
                inventory: Array.isArray(data.inventory) ? data.inventory : undefined
            };
        } catch (e) {
            console.error("Failed to parse choices JSON", e);
        }
    }

    return {
        content: fullText,
        choices: []
    };
};
