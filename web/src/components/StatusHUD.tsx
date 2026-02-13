import React from 'react';
import { Shield, Zap, Package, Sword } from 'lucide-react';

interface StatusHUDProps {
    dharma: number; // -100 to 100
    karma: number;  // 0 to infinity
    inventory: string[];
}

const StatusHUD: React.FC<StatusHUDProps> = ({ dharma, karma, inventory }) => {
    // Determine Alignment
    let alignment = "Neutral";
    let alignmentColor = "text-slate-400";
    if (dharma > 30) { alignment = "Dharmic (Order)"; alignmentColor = "text-blue-400"; }
    else if (dharma < -30) { alignment = "Adharmic (Chaos)"; alignmentColor = "text-red-500"; }

    return (
        <div className="glass-panel p-6 rounded-2xl animate-fade-in-up space-y-6">
            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2 border-b border-slate-800/50 pb-4">
                <Sword className="text-amber-500" size={20} />
                KARMIC ENGINE
            </h3>

            {/* Dharma Meter */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-red-500">Adharma</span>
                    <span className={alignmentColor}>{alignment}</span>
                    <span className="text-blue-400">Dharma</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    {/* Center Marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />

                    {/* Bar */}
                    <div
                        className={`absolute top-0 bottom-0 transition-all duration-700 ${dharma >= 0 ? 'bg-blue-500 left-1/2' : 'bg-red-500 right-1/2'}`}
                        style={{ width: `${Math.abs(dharma) / 2}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-100</span>
                    <span>0</span>
                    <span>+100</span>
                </div>
            </div>

            {/* Karma Score */}
            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 text-amber-500/80">
                    <Zap size={16} />
                    <span className="text-xs font-bold uppercase">Karma Score</span>
                </div>
                <span className="text-xl font-mono text-amber-100">{karma}</span>
            </div>

            {/* Inventory */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Package size={12} />
                    Inventory Protocol
                </h4>
                {inventory.length === 0 ? (
                    <div className="text-sm text-slate-600 italic text-center py-2">
                        No Astras or Artifacts detected.
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {inventory.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                                <Shield size={14} className="text-amber-500/50" />
                                <span className="text-sm text-slate-300">{item}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default StatusHUD;
