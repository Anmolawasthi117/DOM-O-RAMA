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
import { VNodeRenderer } from '../components/VNodeRenderer';
import { scenarios, type Scenario } from '../utils/scenarios';
import { 
  Activity, Home, Sun, Moon, Code, 
  PlayCircle, FileText, MousePointerClick, Layers, Menu, X, ChevronLeft, ChevronRight
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

  // Mobile panel states
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

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
    setLeftPanelOpen(false); // Close panel on mobile after selection
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

      {/* Header - Mobile Responsive */}
      <header className="relative z-10 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile menu button */}
          <button 
            onClick={() => setLeftPanelOpen(true)}
            className="md:hidden p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish"
          >
            <Menu size={18} className="text-[var(--text-muted)]" />
          </button>
          
          <Link to="/" className="p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish hidden md:flex">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center shadow-ink"
              style={{ borderColor: `${theme.primary}40` }}
            >
              <Activity size={20} style={{ color: theme.primary }} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black font-hand" style={{ color: theme.primary }}>{theme.name} Playground</h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] hidden md:block">Visualize VDOM diffing in real-time</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <FrameworkSelector />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Mode Switcher - Compact on mobile */}
          <div className="flex bg-[var(--bg-card)] p-1 rounded-xl sketchy-border shadow-ink">
            <button 
              onClick={() => setMode('code')} 
              className={`p-2 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all btn-squish ${
                mode === 'code' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-muted)]'
              }`}
            >
              <Code size={14} />
              <span className="hidden md:inline ml-1">Code</span>
            </button>
            <button 
              onClick={() => setMode('interact')} 
              className={`p-2 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all btn-squish ${
                mode === 'interact' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-[var(--text-muted)]'
              }`}
            >
              <MousePointerClick size={14} />
              <span className="hidden md:inline ml-1">Interact</span>
            </button>
          </div>

          <div className="hidden md:block">
            <SimulationControls 
              isPlaying={isPlaying} 
              onPlay={startSimulation} 
              onPause={() => { setIsPlaying(false); isRunningRef.current = false; }} 
              onReset={() => {}} 
              speed={speed} 
              onSpeedChange={setSpeed} 
            />
          </div>
          
          <button onClick={toggleAppTheme} className="p-2 md:p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            {appTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
          
          {/* Mobile stats button */}
          <button 
            onClick={() => setRightPanelOpen(true)}
            className="md:hidden p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish"
          >
            <FileText size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>
      </header>

      {/* Mobile Controls Bar */}
      <div className="md:hidden relative z-10 px-3 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between">
        <FrameworkSelector />
        <SimulationControls 
          isPlaying={isPlaying} 
          onPlay={startSimulation} 
          onPause={() => { setIsPlaying(false); isRunningRef.current = false; }} 
          onReset={() => {}} 
          speed={speed} 
          onSpeedChange={setSpeed} 
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {(leftPanelOpen || rightPanelOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => { setLeftPanelOpen(false); setRightPanelOpen(false); }}
          />
        )}
      </AnimatePresence>

      {/* Left Panel - Mobile Drawer */}
      <AnimatePresence>
        {leftPanelOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-primary)] z-50 shadow-2xl overflow-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-hand">{mode === 'code' ? 'Code Editor' : 'Scenarios'}</h2>
                <button onClick={() => setLeftPanelOpen(false)} className="p-2">
                  <X size={20} />
                </button>
              </div>
              {mode === 'code' ? (
                <CodePlayground onCompile={(oldT, newT) => { setOldTree(oldT); setNewTree(newT); setDisplayTree(oldT); setLeftPanelOpen(false); }} />
              ) : (
                <div className="space-y-3">
                  {scenarios.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => selectScenario(s)}
                      className={`w-full text-left p-3 rounded-xl sketchy-border transition-all shadow-ink ${
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel - Mobile Drawer */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed right-0 top-0 bottom-0 w-[280px] bg-[var(--bg-primary)] z-50 shadow-2xl overflow-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-hand">Analysis</h2>
                <button onClick={() => setRightPanelOpen(false)} className="p-2">
                  <X size={20} />
                </button>
              </div>
              <StatsPanel stats={stats} />
              <div className="mt-4 rounded-xl sketchy-border overflow-hidden shadow-ink bg-[var(--bg-card)] h-64">
                <StepLog steps={logs as any} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: Desktop only */}
        <div className="hidden md:flex w-72 lg:w-80 shrink-0 flex-col border-r border-[var(--border-primary)] bg-[var(--bg-card)]">
          <div className="p-4 border-b border-[var(--border-primary)] flex items-center gap-2">
            {mode === 'code' ? <Code size={18} style={{ color: theme.primary }} /> : <PlayCircle size={18} style={{ color: theme.primary }} />}
            <span className="font-bold text-sm">{mode === 'code' ? 'Code Editor' : 'Scenarios'}</span>
          </div>
          <div className="flex-1 overflow-auto">
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
          </div>
        </div>

        {/* CENTER PANEL: Visualizer + Live Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)] relative">
          
          {/* Live Preview Bar (Interact Mode Only) */}
          <AnimatePresence>
            {mode === 'interact' && activeScenario && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="shrink-0 p-2 md:p-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex justify-center z-10"
              >
                <div className="w-full max-w-md bg-white text-black rounded-xl sketchy-border shadow-float p-3 md:p-4 relative">
                   <div className="absolute -top-3 left-3 bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                     Tap to Trigger
                   </div>
                   <VNodeRenderer node={displayTree} onEvent={handleInteraction} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visualization Area */}
          <div className="flex-1 relative overflow-hidden p-2 md:p-4">
             <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 px-2 md:px-3 py-1 md:py-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink flex items-center gap-2">
                <Layers size={14} style={{ color: theme.primary }} />
                <span className="text-[10px] md:text-xs font-bold">Engine: <span style={{ color: theme.primary }}>{engineRef.current?.name}</span></span>
             </div>
             
             {/* Highlight border when simulation is running */}
             <div className={`absolute inset-2 md:inset-4 rounded-2xl pointer-events-none transition-all duration-300 ${
               isPlaying ? 'ring-4 ring-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5' : ''
             }`} />
             
             <TreeVisualizer currentStep={currentStep as any} tree={newTree} reset={logs.length === 0} />
          </div>

          {/* Mobile: Floating action buttons */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button
              onClick={() => setLeftPanelOpen(true)}
              className="p-3 rounded-xl bg-[var(--accent-primary)] text-white shadow-float btn-squish flex items-center gap-2"
            >
              <ChevronRight size={16} />
              <span className="text-xs font-bold">Scenarios</span>
            </button>
            <button
              onClick={() => setRightPanelOpen(true)}
              className="p-3 rounded-xl bg-[var(--bg-card)] sketchy-border shadow-float btn-squish flex items-center gap-2"
            >
              <span className="text-xs font-bold">Stats</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Desktop only */}
        <div className="hidden md:flex w-72 lg:w-80 shrink-0 flex-col border-l border-[var(--border-primary)] bg-[var(--bg-card)]">
          <div className="p-4 border-b border-[var(--border-primary)] flex items-center gap-2">
            <FileText size={18} style={{ color: theme.primary }} />
            <span className="font-bold text-sm">Analysis</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <StatsPanel stats={stats} />
            <div className="flex-1 min-h-[300px] rounded-xl sketchy-border overflow-hidden shadow-ink bg-[var(--bg-card)]">
              <StepLog steps={logs as any} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
