import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Terminal, ArrowRight, Volume2, Image as ImageIcon, StopCircle, Mic, MicOff } from 'lucide-react';
import { parseStoryContent } from '../utils/storyParser';

interface StoryDisplayProps {
    story: string;
    title: string;
    onChoiceSelected?: (choice: string) => void;
    isLoadingChoice?: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, title, onChoiceSelected, isLoadingChoice }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null); // Use any for SpeechRecognition to avoid TS issues without types

    // Utilize the parser to separate content, choices, and image prompt
    const { content, choices, imagePrompt } = useMemo(() => parseStoryContent(story), [story]);

    // Handle TTS cancellation on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([story], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${title.replace(/\s+/g, '_').toLowerCase()}.md`;
        document.body.appendChild(element);
        element.click();
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = 0.9; // Slightly slower for dramatic effect
        utterance.pitch = 0.8; // Deeper voice

        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Daniel'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const toggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Command:", transcript);

            // Check for selection commands
            if (transcript.includes("one") || transcript.includes("1") || transcript.includes("first")) {
                if (choices.length >= 1 && onChoiceSelected) onChoiceSelected(choices[0]);
            } else if (transcript.includes("two") || transcript.includes("2") || transcript.includes("second")) {
                if (choices.length >= 2 && onChoiceSelected) onChoiceSelected(choices[1]);
            } else if (transcript.includes("three") || transcript.includes("3") || transcript.includes("third")) {
                if (choices.length >= 3 && onChoiceSelected) onChoiceSelected(choices[2]);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };


    if (!story) return null;

    return (
        <div className="glass-panel rounded-3xl overflow-hidden animate-fade-in-up">
            {/* Document Header */}
            <div className="bg-slate-900/80 border-b border-slate-700/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
                        <Terminal className="text-amber-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-amber-50 tracking-tight">{title}</h2>
                        <div className="flex items-center gap-2 text-xs text-amber-500/60 font-mono mt-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            CHRONICLE RECORDED
                            <span className="text-slate-600">|</span>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleListening}
                        className={`
                            p-2 rounded-lg transition-all border
                            ${isListening
                                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}
                        `}
                        title={isListening ? "Stop Listening" : "Voice Command"}
                        disabled={choices.length === 0}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        onClick={handleSpeak}
                        className={`
                            p-2 rounded-lg transition-all border
                            ${isSpeaking
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}
                        `}
                        title={isSpeaking ? "Stop Narration" : "Read Aloud"}
                    >
                        {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-200 rounded-lg transition-all text-sm font-medium group"
                    >
                        <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                        Export
                    </button>
                </div>
            </div>

            {/* Generated Image (Simulated Visual Cortex) */}
            {imagePrompt && (
                <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-slate-800/50 group">
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />

                    <img
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1200&height=600&nologo=true`}
                        alt="Generated Scene"
                        className="w-full h-full object-cover transition-transform duration-[20s] ease-linear transform hover:scale-110"
                        loading="lazy"
                    />

                    <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2 text-xs text-amber-200/80 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <ImageIcon size={12} />
                        <span>VISUAL CORTEX FEED</span>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="p-8 md:p-10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 min-h-[500px]">
                <div className="prose prose-invert max-w-none 
          prose-headings:text-amber-100 prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
          prose-strong:text-amber-400 prose-strong:font-semibold
          prose-blockquote:border-l-4 prose-blockquote:border-amber-500/50 prose-blockquote:bg-slate-800/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
          prose-hr:border-slate-700/50
          prose-ul:marker:text-amber-500
        ">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                {/* Choices Area */}
                {choices.length > 0 && onChoiceSelected && !isLoadingChoice && (
                    <div className="mt-12 space-y-4 animate-fade-in-up delay-200">
                        <h3 className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-4 border-b border-amber-900/50 pb-2 flex justify-between items-center">
                            <span>Select Your Path...</span>
                            {isListening && (
                                <span className="text-xs text-red-500 animate-pulse">LISTENING FOR "ONE", "TWO", "THREE"...</span>
                            )}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {choices.map((choice, index) => (
                                <button
                                    key={index}
                                    onClick={() => onChoiceSelected(choice)}
                                    className="group relative overflow-hidden p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-900 hover:border-amber-500/50 transition-all text-left w-full"
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex gap-4">
                                            <span className="font-mono text-amber-500/50 text-xl font-bold">0{index + 1}</span>
                                            <span className="text-slate-300 font-medium group-hover:text-amber-100 transition-colors">{choice}</span>
                                        </div>
                                        <ArrowRight className="text-slate-500 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" size={20} />
                                    </div>
                                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading Indicator for Next Chapter */}
                {isLoadingChoice && (
                    <div className="mt-12 p-8 rounded-xl bg-slate-900/30 border border-amber-500/10 flex flex-col items-center justify-center gap-4 animate-pulse">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 blur-md"></div>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-1">Consulting The Oracle</h3>
                            <p className="text-slate-500 text-xs">Weaving fate...</p>
                        </div>
                    </div>
                )}

                {/* Footer Signature */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500 font-mono uppercase tracking-widest opacity-60">
                    <span>Narrative Generation System // v1.0.4</span>
                    <div className="flex items-center gap-2">
                        <span className="w-16 h-0.5 bg-slate-700" />
                        END OF RECORD
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryDisplay;
