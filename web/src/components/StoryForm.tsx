import React, { useState } from 'react';
import { Loader2, Key, Layers, Globe, Edit3 } from 'lucide-react';

interface StoryFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('google/gemma-3-27b-it:free');
    const [actName, setActName] = useState('The Dice Game Protocol');
    const [worldDesc, setWorldDesc] = useState('Kurukshetra 3000: A cyber-mythological world where the Pandava Alliance and Kaurava Syndicate vie for control of the Hastinapura Network.');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ api_key: apiKey, model, act_name: actName, world_description: worldDesc });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Key size={14} /> API Key
                </label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full neon-input"
                    placeholder="sk-or-v1-... (Leave empty to use .env)"
                />
            </div>

            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Layers size={14} /> Model
                </label>
                <div className="relative">
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full neon-input appearance-none cursor-pointer"
                    >
                        <option value="google/gemma-3-27b-it:free">Gemma 3 27B (Free)</option>
                        <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free)</option>
                        <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                        <option value="google/gemini-2.0-flash-lite-preview-09-2025:free">Gemini 2.0 Flash Lite (Free)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        ▼
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Edit3 size={14} /> Act Name
                </label>
                <input
                    type="text"
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                    className="w-full neon-input"
                />
            </div>

            <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Globe size={14} /> World Description
                </label>
                <textarea
                    value={worldDesc}
                    onChange={(e) => setWorldDesc(e.target.value)}
                    rows={4}
                    className="w-full neon-input min-h-[120px] resize-none"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full neon-button group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            Initializing...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 group-hover:tracking-widest transition-all">
                            INITIATE GENERATION
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default StoryForm;
