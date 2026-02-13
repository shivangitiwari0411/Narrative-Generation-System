import React, { useEffect, useRef } from 'react';
import { User, Cpu, Shield, Zap } from 'lucide-react';

interface DebateStep {
    speaker: string;
    content: string;
}

interface DebateResponse {
    debate: DebateStep[];
    consensus: string;
}

interface CouncilDisplayProps {
    debateData: DebateResponse | null;
    isLoading: boolean;
}

const CouncilDisplay: React.FC<CouncilDisplayProps> = ({ debateData, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [debateData]);

    if (!isLoading && !debateData) return null;

    return (
        <div className="glass-panel p-6 rounded-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
                <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                    <Shield className="text-amber-500" size={20} />
                    THE COUNCIL CHAMBER
                </h3>
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-amber-500/60 animate-pulse">
                        <Zap size={14} />
                        DELIBERATING...
                    </div>
                )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
                {isLoading && !debateData && (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-800/50" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-800/50 rounded w-1/4" />
                                    <div className="h-16 bg-slate-800/30 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {debateData?.debate.map((step, index) => {
                    const isKrishna = step.speaker.includes('Krishna');
                    const isDuryodhana = step.speaker.includes('Duryodhana');
                    const isArjuna = step.speaker.includes('Arjuna');

                    return (
                        <div key={index} className="flex gap-4 animate-fade-in-up">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center shrink-0 border
                                ${isKrishna ? 'bg-blue-900/30 border-blue-500/30 text-blue-400' : ''}
                                ${isDuryodhana ? 'bg-red-900/30 border-red-500/30 text-red-500' : ''}
                                ${isArjuna ? 'bg-amber-900/30 border-amber-500/30 text-amber-500' : ''}
                            `}>
                                {isKrishna && <User size={18} />}
                                {isDuryodhana && <Cpu size={18} />}
                                {isArjuna && <Shield size={18} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider
                                        ${isKrishna ? 'text-blue-400' : ''}
                                        ${isDuryodhana ? 'text-red-500' : ''}
                                        ${isArjuna ? 'text-amber-500' : ''}
                                    `}>
                                        {step.speaker}
                                    </span>
                                </div>
                                <div className="bg-slate-900/40 p-3 rounded-lg rounded-tl-none border border-slate-800/50 text-sm text-slate-300 leading-relaxed shadow-sm">
                                    {step.content}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {debateData?.consensus && (
                    <div className="mt-8 p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl animate-fade-in-up delay-300">
                        <h4 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap size={14} />
                            COUNCIL CONSENSUS REALLIED
                        </h4>
                        <p className="text-amber-100 text-sm italic">
                            "{debateData.consensus}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouncilDisplay;
