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
import { SkillLevelToggle } from '../components/SkillLevelToggle';
import { CollapsiblePanel } from '../components/CollapsiblePanel';
import { VNodeRenderer } from '../components/VNodeRenderer';
import { scenarios, type Scenario } from '../utils/scenarios';
import { 
  Activity, Home, Sun, Moon, Code, 
  PlayCircle, FileText, MousePointerClick 
} from 'lucide-react';


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
  const [mode, setMode] = useState<'code' | 'interact'>('code');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  // Tree State
  const [oldTree, setOldTree] = useState<VNode>({ tag: 'div', children: [] });
  const [newTree, setNewTree] = useState<VNode>({ tag: 'div', children: [] });
  // For interaction mode, we need a "display tree" which is what the user sees
  // Initially it's oldTree. When interaction happens, we diff oldTree -> newTree
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
    setNewTree(scenario.finalTree); // Ready to be diffed
    setDisplayTree(scenario.initialTree);
    
    // Reset Sim
    iteratorRef.current = null;
    setLogs([]);
    setStats({ patches: 0, mounts: 0, unmounts: 0, comparisons: 0 });
    setCurrentStep(null);
    setIsPlaying(false);
    isRunningRef.current = false;
  }, []);

  // Handle Interaction Event (from VNodeRenderer)
  const handleInteraction = useCallback((_tag: string, _props: any) => {
    if (mode === 'interact' && activeScenario && !isPlaying) {
      // If we clicked the trigger (e.g. submit button), run the simulation
      // For simplicity, ANY interactive click in the scenario triggers the diff for now
      // Realistically we'd match ids, but let's keep it simple "Form Submit Scenario"
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
          // Update display tree to final state
          setDisplayTree(newTree);
          // And cycle old->new for next run?
          setOldTree(newTree); // Next run starts from here
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
    <div className="h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2 border-b flex items-center justify-between shrink-0 shadow-lg"
        style={{ borderColor: `${theme.primary}30`, background: `linear-gradient(90deg, var(--bg-secondary), ${theme.primary}08)` }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"><Home size={18} /></Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
              <Activity size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: theme.primary }}>{theme.name} Playground</h1>
            </div>
          </div>
          <FrameworkSelector />
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-primary)]">
            <button onClick={() => setMode('code')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'code' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
              <Code size={14} className="inline mr-1"/> Code
            </button>
            <button onClick={() => setMode('interact')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'interact' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
              <MousePointerClick size={14} className="inline mr-1"/> Interact
            </button>
          </div>

          <SkillLevelToggle />
          <SimulationControls 
            isPlaying={isPlaying} onPlay={startSimulation} onPause={() => { setIsPlaying(false); isRunningRef.current = false; }} 
            onReset={() => {}} speed={speed} onSpeedChange={setSpeed} 
          />
          <button onClick={toggleAppTheme} className="p-2 rounded-xl bg-[var(--bg-secondary)] border">
            {appTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-400" />}
          </button>
        </div>
      </header>

      {/* Main Content: Collapsible Panels */}
      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        
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
              <p className="text-xs text-[var(--text-muted)] mb-2">Select a scenario to simulate:</p>
              {scenarios.map(s => (
                <button 
                  key={s.id}
                  onClick={() => selectScenario(s)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeScenario?.id === s.id 
                      ? 'bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-md' 
                      : 'border-[var(--border-primary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{s.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{s.description}</div>
                </button>
              ))}
            </div>
          )}
        </CollapsiblePanel>

        {/* CENTER PANEL: Visualizer + Live Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)] relative">
          
          {/* Live Preview Bar (Interact Mode Only) */}
          {mode === 'interact' && activeScenario && (
            <div className="shrink-0 p-4 border-b bg-[var(--bg-primary)] flex justify-center shadow-sm z-10">
              <div className="w-full max-w-md bg-white text-black rounded-lg shadow-sm border p-4 relative">
                 <div className="absolute -top-3 left-3 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                   Live Preview
                 </div>
                 {/* Render interactive VDOM */}
                 <VNodeRenderer node={displayTree} onEvent={handleInteraction} />
              </div>
            </div>
          )}

          {/* Visualization Area */}
          <div className="flex-1 relative overflow-hidden p-4">
             <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold bg-white/50 backdrop-blur border shadow-sm">
                Framework Strategy: <span style={{ color: theme.primary }}>{engineRef.current?.name}</span>
             </div>
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
            <div className="flex-1 min-h-0 border rounded-xl overflow-hidden shadow-inner bg-[var(--bg-primary)]">
               <StepLog steps={logs as any} />
            </div>
          </div>
        </CollapsiblePanel>

      </main>
    </div>
  );
};
