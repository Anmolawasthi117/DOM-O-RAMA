import { useState, useRef, useEffect, useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';
import type { VNode } from '../core/engine/VDOMSimulator';
import { getEngine, type EngineStep, type FrameworkEngine } from '../core/engine';
import { useAppStore, frameworkThemes } from '../stores/appStore';
import { SimulationControls } from '../components/SimulationControls';
import { StepLog } from '../components/StepLog';
import { TreeVisualizer } from '../components/TreeVisualizer';
import { CodePlayground } from '../components/CodePlayground';
import { StatsPanel } from '../components/StatsPanel';
import { FrameworkSelector } from '../components/FrameworkSelector';
import { CollapsiblePanel } from '../components/CollapsiblePanel';
import { VNodeRenderer } from '../components/VNodeRenderer';
import { scenarios, type Scenario } from '../utils/scenarios';
import { 
  Activity, Home, Sun, Moon, Code, 
  PlayCircle, FileText, MousePointerClick, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// Adapt EngineStep to the old DiffStep format
interface DiffStep {
  type: string;
  nodeId?: string;
  nodeTag?: string;
  message: string;
  payload?: VNode;
}

export const PlaygroundPage: FC = () => {
  const { currentFramework, appTheme, toggleAppTheme, speed, setSpeed } = useAppStore();
  const theme = frameworkThemes[currentFramework];

  // Mode: 'code' (manual) or 'interact' (scenarios)
  const [mode, setMode] = useState<'code' | 'interact'>('interact');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  // Tree State
  const [oldTree, setOldTree] = useState<VNode>({ tag: 'div', children: [] });
  const [newTree, setNewTree] = useState<VNode>({ tag: 'div', children: [] });
  const [displayTree, setDisplayTree] = useState<VNode>(oldTree);

  // Simulation State
  const [logs, setLogs] = useState<DiffStep[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const engineRef = useRef<FrameworkEngine | null>(null);
  const iteratorRef = useRef<AsyncGenerator<EngineStep> | null>(null);
  const isRunningRef = useRef(false);
  const [currentStep, setCurrentStep] = useState<DiffStep | null>(null);
  const [stats, setStats] = useState({ patches: 0, mounts: 0, unmounts: 0, comparisons: 0 });

  // Init Engine
  useEffect(() => {
    engineRef.current = getEngine(currentFramework, speed);
  }, [currentFramework, speed]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setSpeed(speed);
  }, [speed]);

  // Handle Scenario Select
  const selectScenario = useCallback((scenario: Scenario) => {
    setActiveScenario(scenario);
    setOldTree(scenario.initialTree);
    setNewTree(scenario.finalTree);
    setDisplayTree(scenario.initialTree);
    
    iteratorRef.current = null;
    setLogs([]);
    setStats({ patches: 0, mounts: 0, unmounts: 0, comparisons: 0 });
    setCurrentStep(null);
    setIsPlaying(false);
    isRunningRef.current = false;
  }, []);

  // Handle Interaction Event
  const handleInteraction = useCallback(() => {
    if (mode === 'interact' && activeScenario && !isPlaying) {
      startSimulation();
    }
  }, [mode, activeScenario, isPlaying]);

  const startSimulation = useCallback(async () => {
    if (!engineRef.current) return;

    if (!iteratorRef.current) {
      iteratorRef.current = engineRef.current.diff(oldTree, newTree);
      setLogs([]);
      setStats({ patches: 0, mounts: 0, unmounts: 0, comparisons: 0 });
      setCurrentStep(null);
    }
    
    setIsPlaying(true);
    isRunningRef.current = true;

    try {
      while (isRunningRef.current) {
        const { value, done } = await iteratorRef.current!.next();
        if (done) {
          setIsPlaying(false);
          isRunningRef.current = false;
          iteratorRef.current = null;
          setCurrentStep(null);
          setDisplayTree(newTree);
          setOldTree(newTree);
          break;
        }
        if (value) {
          const step: DiffStep = {
            type: value.type,
            nodeId: value.nodeId,
            nodeTag: value.nodeTag,
            message: value.message,
            payload: value.payload
          };
          setCurrentStep(step);
          setLogs(prev => [...prev, step]);
          setStats(prev => {
            const s = { ...prev };
            if (value.type === 'PATCHING') s.patches++;
            if (value.type === 'MOUNTING') s.mounts++;
            if (value.type === 'UNMOUNTING') s.unmounts++;
            if (['COMPARING', 'FIBER_BEGIN_WORK', 'VUE_HOIST_CHECK'].includes(value.type)) s.comparisons++;
            return s;
          });
        }
        if (!isRunningRef.current) break;
      }
    } catch (error) {
      console.error("Simulation error:", error);
      setIsPlaying(false);
    }
  }, [oldTree, newTree]);

  return (
    <div className="h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center shadow-ink"
              style={{ borderColor: `${theme.primary}40` }}
            >
              <Activity size={24} style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-black font-hand" style={{ color: theme.primary }}>{theme.name} Playground</h1>
              <p className="text-xs text-[var(--text-muted)]">Visualize VDOM diffing in real-time</p>
            </div>
          </div>
          <FrameworkSelector />
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-[var(--bg-card)] p-1 rounded-xl sketchy-border shadow-ink">
            <button 
              onClick={() => setMode('code')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all btn-squish ${
                mode === 'code' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-muted)]'
              }`}
            >
              <Code size={14} className="inline mr-1"/> Code
            </button>
            <button 
              onClick={() => setMode('interact')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all btn-squish ${
                mode === 'interact' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-muted)]'
              }`}
            >
              <MousePointerClick size={14} className="inline mr-1"/> Interact
            </button>
          </div>

          <SimulationControls 
            isPlaying={isPlaying} 
            onPlay={startSimulation} 
            onPause={() => { setIsPlaying(false); isRunningRef.current = false; }} 
            onReset={() => {}} 
            speed={speed} 
            onSpeedChange={setSpeed} 
          />
          <button onClick={toggleAppTheme} className="p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            {appTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: Input / Scenarios */}
        <CollapsiblePanel 
          position="left" 
          title={mode === 'code' ? "Code Editor" : "Scenarios"} 
          icon={mode === 'code' ? <Code size={18}/> : <PlayCircle size={18}/>}
          color={theme.primary}
        >
          {mode === 'code' ? (
             <CodePlayground onCompile={(oldT, newT) => { setOldTree(oldT); setNewTree(newT); setDisplayTree(oldT); }} />
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-xs text-[var(--text-muted)] mb-2 font-hand">Select a scenario:</p>
              {scenarios.map(s => (
                <motion.button 
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectScenario(s)}
                  className={`w-full text-left p-3 rounded-xl sketchy-border transition-all shadow-ink card-lift ${
                    activeScenario?.id === s.id 
                      ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' 
                      : 'bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{s.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{s.description}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </CollapsiblePanel>

        {/* CENTER PANEL: Visualizer + Live Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)] relative">
          
          {/* Live Preview Bar (Interact Mode Only) */}
          <AnimatePresence>
            {mode === 'interact' && activeScenario && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="shrink-0 p-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex justify-center z-10"
              >
                <div className="w-full max-w-md bg-white text-black rounded-xl sketchy-border shadow-float p-4 relative">
                   <div className="absolute -top-3 left-3 bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                     Live Preview - Click to Trigger
                   </div>
                   <VNodeRenderer node={displayTree} onEvent={handleInteraction} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visualization Area with Enhanced Highlighting */}
          <div className="flex-1 relative overflow-hidden p-4">
             <div className="absolute top-4 left-4 z-10 px-3 py-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink flex items-center gap-2">
                <Layers size={16} style={{ color: theme.primary }} />
                <span className="text-xs font-bold">Engine: <span style={{ color: theme.primary }}>{engineRef.current?.name}</span></span>
             </div>
             
             {/* Highlight border when simulation is running */}
             <div className={`absolute inset-4 rounded-2xl pointer-events-none transition-all duration-300 ${
               isPlaying ? 'ring-4 ring-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5' : ''
             }`} />
             
             <TreeVisualizer currentStep={currentStep as any} tree={newTree} reset={logs.length === 0} />
          </div>
        </div>

        {/* RIGHT PANEL: Stats & Logs */}
        <CollapsiblePanel 
          position="right" 
          title="Analysis" 
          icon={<FileText size={18}/>}
          color={theme.primary}
        >
          <div className="flex flex-col h-full gap-4 p-4">
            <StatsPanel stats={stats} />
            <div className="flex-1 min-h-0 rounded-xl sketchy-border overflow-hidden shadow-ink bg-[var(--bg-card)]">
               <StepLog steps={logs as any} />
            </div>
          </div>
        </CollapsiblePanel>

      </main>
    </div>
  );
};
