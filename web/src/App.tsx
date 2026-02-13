import { useState, useMemo } from 'react';
import StoryForm from './components/StoryForm';
import StoryDisplay from './components/StoryDisplay';
import CouncilDisplay from './components/CouncilDisplay';
import StatusHUD from './components/StatusHUD';
import MultiverseMap, { type StoryNode } from './components/MultiverseMap';
import axios from 'axios';
import { BookOpen, Github, Sparkles } from 'lucide-react';
import { parseStoryContent } from './utils/storyParser';

interface GenerationConfig {
  api_key: string;
  model: string;
  act_name: string;
  world_description: string;
}

// Configurable API URL for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function App() {
  const [storyNodes, setStoryNodes] = useState<StoryNode[]>([]);
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);

  const [lastConfig, setLastConfig] = useState<GenerationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCouncilLoading, setIsCouncilLoading] = useState(false);
  const [error, setError] = useState('');
  const [councilData, setCouncilData] = useState<any>(null);

  // RPG State
  const [dharma, setDharma] = useState(0);
  const [karma, setKarma] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  // Derived Full Story (Traverse from Root to Current Leaf)
  const fullStory = useMemo(() => {
    if (!currentLeafId) return '';

    const findPath = (nodes: StoryNode[], targetId: string): StoryNode[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) return [node];
        if (node.children) {
          const childPath = findPath(node.children, targetId);
          if (childPath) return [node, ...childPath];
        }
      }
      return null;
    };

    const pathNodes = findPath(storyNodes, currentLeafId);
    return pathNodes ? pathNodes.map(n => n.description).join('\n\n---\n\n') : '';
  }, [storyNodes, currentLeafId]);

  // Helper to add child to a specific parent
  const addChildToNode = (nodes: StoryNode[], parentId: string, newChild: StoryNode): StoryNode[] => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newChild] };
      } else if (node.children) {
        return { ...node, children: addChildToNode(node.children, parentId, newChild) };
      }
      return node;
    });
  };

  const runCouncilDebate = async (config: GenerationConfig, context: string, topic: string) => {
    setIsCouncilLoading(true);
    setCouncilData(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/council/debate`, {
        world_context: config.world_description,
        topic: `Current Context: ${context.substring(0, 500)}... \n\nDecision/Topic: ${topic}`
      });
      setCouncilData(response.data);
      return response.data.consensus;
    } catch (err) {
      console.error("Council debate failed", err);
      return null;
    } finally {
      setIsCouncilLoading(false);
    }
  };

  const generateAct = async (config: GenerationConfig, previousContext?: string, choice?: string, consensus?: string) => {
    setIsLoading(true);
    setError('');

    if (!previousContext) {
      setStoryNodes([]);
      setCurrentLeafId(null);
      setDharma(0);
      setKarma(0);
      setInventory([]);
      setHasStarted(true);
    }

    setLastConfig(config);

    try {
      const parseUrl = `${API_BASE_URL}/generate`;

      let contextToSend = previousContext ? fullStory : undefined;
      if (consensus) {
        contextToSend = contextToSend
          ? `${contextToSend}\n\n[COUNCIL CONSENSUS]: ${consensus}`
          : `[COUNCIL CONSENSUS]: ${consensus}`;
      }

      const response = await axios.post(parseUrl, {
        api_key: config.api_key,
        model: config.model,
        act_name: config.act_name,
        world_description: config.world_description,
        previous_context: contextToSend,
        choice: choice
      });

      const newContent = response.data.story;
      const parsed = parseStoryContent(newContent);

      if (parsed.dharma !== undefined) setDharma(prev => Math.max(-100, Math.min(100, prev + parsed.dharma!)));
      if (parsed.karma !== undefined) setKarma(prev => prev + parsed.karma!);
      if (parsed.inventory) setInventory(parsed.inventory);

      // Create New Node
      const newNode: StoryNode = {
        id: Date.now().toString(),
        title: choice ? `Choice: ${choice.substring(0, 15)}...` : `Act 1: ${config.act_name}`,
        description: choice ? `> **DECISION:** ${choice}\n\n---\n\n${newContent}` : newContent,
        children: [],
        isCurrent: true
      };

      // Update Tree
      if (!previousContext) {
        setStoryNodes([newNode]);
      } else if (currentLeafId) {
        // Determine root for adding child
        setStoryNodes(prev => addChildToNode(prev, currentLeafId, newNode));
      }

      setCurrentLeafId(newNode.id);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate story. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialGenerate = async (data: GenerationConfig) => {
    // 1. Run Council Debate first
    const consensus = await runCouncilDebate(data, "Initial Situation", data.act_name);
    // 2. Generate Story with Consensus
    generateAct(data, undefined, undefined, consensus);
  };

  const handleChoiceSelected = async (choice: string) => {
    if (!lastConfig) return;
    // 1. Run Council Debate on the choice
    const consensus = await runCouncilDebate(lastConfig, fullStory.slice(-1000), `User chose: ${choice}`);
    // 2. Generate Next Act
    generateAct(lastConfig, fullStory, choice, consensus);
  };

  // To visualize current path vs others
  const formatTreeForMap = (nodes: StoryNode[]): StoryNode[] => {
    return nodes.map(n => ({
      ...n,
      isCurrent: n.id === currentLeafId, // Only leaf is "Current" for now
      children: formatTreeForMap(n.children)
    }));
  };

  return (
    <div className="min-h-screen selection:bg-amber-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-slate-800/50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative p-2.5 bg-slate-900 border border-slate-700/50 rounded-xl group-hover:border-amber-500/30 transition-colors">
                <BookOpen className="text-amber-500" size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-400 to-amber-600">
                Mahabharata<span className="text-amber-500">OS</span>
              </h1>
              <p className="text-xs text-amber-500/60 font-medium tracking-wider">PROJECT KURUKSHETRA</p>
            </div>
          </div>
          <a href="https://github.com/yourusername/narrative-system" target="_blank" rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Github size={22} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar / Form */}
          <div className="lg:col-span-4 space-y-8 animate-fade-in-up">
            <div className="glass-panel p-1 rounded-2xl">
              <div className="bg-slate-950/50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Sparkles className="text-amber-500" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-amber-100">Simulation Config</h2>
                    <p className="text-xs text-slate-400">Initialize generation parameters</p>
                  </div>
                </div>

                <StoryForm onSubmit={handleInitialGenerate} isLoading={(isLoading || isCouncilLoading) && !fullStory} />

                {error && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-200 rounded-xl text-sm flex gap-3 items-start">
                    <span className="text-xl">⚠️</span>
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status HUD - Only show if story started */}
            {hasStarted && (
              <StatusHUD dharma={dharma} karma={karma} inventory={inventory} />
            )}

            {/* Council Display Sidebar */}
            {(councilData || isCouncilLoading) && (
              <CouncilDisplay debateData={councilData} isLoading={isCouncilLoading} />
            )}

          </div>

          {/* Output Area */}
          <div className="lg:col-span-8 animate-fade-in-up delay-100 space-y-8">
            {fullStory ? (
              <>
                <StoryDisplay
                  story={fullStory}
                  title={lastConfig?.act_name || 'Narrative Stream'}
                  onChoiceSelected={handleChoiceSelected}
                  isLoadingChoice={isLoading || isCouncilLoading}
                />

                {/* Multiverse Map Visualization */}
                <MultiverseMap
                  roots={formatTreeForMap(storyNodes)}
                  onNodeSelect={(id) => { console.log('Node selected', id); /* setCurrentLeafId(id); */ }}
                />
              </>
            ) : (
              <div className="h-full min-h-[500px] glass-panel rounded-3xl flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-800/50 bg-slate-950/30">
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <BookOpen size={64} className="relative text-slate-700 group-hover:text-amber-500/50 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">Ready to Initialize</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Configure the simulation parameters in the sidebar to begin the narrative generation sequence.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
