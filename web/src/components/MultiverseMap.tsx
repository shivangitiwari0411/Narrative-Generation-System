import React from 'react';
import { Network } from 'lucide-react';

export interface StoryNode {
    id: string;
    title: string;
    description: string;
    children: StoryNode[];
    isCurrent: boolean;
    choiceStats?: {
        dharma: number;
        karma: number;
    };
}

interface MultiverseMapProps {
    roots: StoryNode[];
    onNodeSelect: (nodeId: string) => void;
}

const MultiverseMap: React.FC<MultiverseMapProps> = ({ roots, onNodeSelect }) => {

    const renderNode = (node: StoryNode, depth: number) => {
        return (
            <div key={node.id} className="relative flex flex-col items-center">
                {/* Connector Line */}
                {depth > 0 && (
                    <div className="h-6 w-0.5 bg-slate-700/50" />
                )}

                {/* Node */}
                <button
                    onClick={() => onNodeSelect(node.id)}
                    className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 z-10
                        ${node.isCurrent
                            ? 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-amber-500/50 hover:text-amber-500'}
                    `}
                    title={node.title}
                >
                    <div className="w-3 h-3 rounded-full bg-current" />
                </button>

                {/* Node Label */}
                <div className="mt-2 text-[10px] text-slate-400 max-w-[150px] text-center break-words leading-tight font-mono">
                    {node.title}
                </div>

                {/* Children Container */}
                {node.children.length > 0 && (
                    <div className="flex gap-4 mt-2 relative">
                        {/* Horizontal Connector for branching */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-6 right-6 h-0.5 bg-slate-700/50 -translate-y-3" />
                        )}

                        {node.children.map(child => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Vertical Connector from parent to child */}
                                {/* <div className="h-4 w-0.5 bg-slate-700/50" /> */}
                                {renderNode(child, depth + 1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass-panel p-6 rounded-2xl animate-fade-in-up mt-8">
            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2 border-b border-slate-800/50 pb-4 mb-6">
                <Network className="text-amber-500" size={20} />
                MULTIVERSE TOPOLOGY
            </h3>

            <div className="overflow-x-auto pb-4 custom-scrollbar flex justify-center min-h-[200px]">
                {roots.map(root => renderNode(root, 0))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-4 italic">
                *Current Timeline Reality Branch
            </p>
        </div>
    );
};

export default MultiverseMap;
