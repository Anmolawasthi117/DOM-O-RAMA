import { useState, useRef, useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, frameworkThemes, type Framework } from '../stores/appStore';
import { getEngine } from '../core/engine';
import type { VNode } from '../core/engine/VDOMSimulator';
import { 
  Home, Play, Square, GitCompare, Sun, Moon, 
  CheckCircle, Trophy, Zap, Clock, Lightbulb
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { TradeoffChart } from '../components/TradeoffChart';
import { WhenToUse } from '../components/WhenToUse';
import { getComparisonSummary } from '../utils/tradeoffs';

const frameworks: Framework[] = ['react', 'vue', 'svelte', 'solid', 'qwik'];

interface FrameworkResult {
  framework: Framework;
  totalOps: number;
  mounts: number;
  unmounts: number;
  patches: number;
  duration: number;
  status: 'idle' | 'running' | 'complete';
}

const initialResult = (fw: Framework): FrameworkResult => ({
  framework: fw,
  totalOps: 0,
  mounts: 0,
  unmounts: 0,
  patches: 0,
  duration: 0,
  status: 'idle'
});

export const ComparePage: FC = () => {
  const { appTheme, toggleAppTheme } = useAppStore();
  
  const [leftFramework, setLeftFramework] = useState<Framework>('react');
  const [rightFramework, setRightFramework] = useState<Framework>('vue');
  const [leftResult, setLeftResult] = useState<FrameworkResult>(initialResult('react'));
  const [rightResult, setRightResult] = useState<FrameworkResult>(initialResult('vue'));
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | 'tie' | null>(null);
  
  const isRunningRef = useRef(false);

  // Sample tree for comparison
  const getComparisonTree = (): { old: VNode; new: VNode } => {
    const oldTree: VNode = {
      tag: 'div',
      props: { className: 'app' },
      children: [
        { tag: 'header', children: [{ tag: 'text', text: 'Old Header' }] },
        { tag: 'main', children: Array(50).fill(null).map((_, i) => ({
          tag: 'div',
          props: { key: `item-${i}` },
          children: [{ tag: 'text', text: `Item ${i}` }]
        })) }
      ]
    };

    const newTree: VNode = {
      tag: 'div',
      props: { className: 'app', theme: 'dark' },
      children: [
        { tag: 'header', children: [{ tag: 'text', text: 'New Header!' }] },
        { tag: 'main', children: Array(100).fill(null).map((_, i) => ({
          tag: 'div',
          props: { key: `item-${i}`, updated: true },
          children: [{ tag: 'text', text: `Updated Item ${i + 1}` }]
        })) }
      ]
    };

    return { old: oldTree, new: newTree };
  };

  const runComparison = useCallback(async () => {
    setIsRunning(true);
    setWinner(null);
    isRunningRef.current = true;
    
    const { old: oldTree, new: newTree } = getComparisonTree();

    // Reset results
    setLeftResult(initialResult(leftFramework));
    setRightResult(initialResult(rightFramework));

    const runEngine = async (
      framework: Framework,
      setResult: React.Dispatch<React.SetStateAction<FrameworkResult>>
    ) => {
      const engine = getEngine(framework, 5); // Very fast for comparison
      const startTime = performance.now();
      
      setResult(prev => ({ ...prev, status: 'running' }));
      
      let opCount = 0;
      let mounts = 0;
      let unmounts = 0;
      let patches = 0;

      const iterator = engine.diff(oldTree, newTree);

      while (isRunningRef.current) {
        const { value, done } = await iterator.next();
        if (done) break;

        opCount++;
        if (value) {
          if (value.type === 'MOUNTING') mounts++;
          if (value.type === 'UNMOUNTING') unmounts++;
          if (value.type === 'PATCHING') patches++;
        }

        // Update every 10 ops for smoother UI
        if (opCount % 10 === 0) {
          setResult(prev => ({
            ...prev,
            totalOps: opCount,
            mounts,
            unmounts,
            patches
          }));
        }
      }

      const duration = performance.now() - startTime;
      
      setResult({
        framework,
        totalOps: opCount,
        mounts,
        unmounts,
        patches,
        duration,
        status: 'complete'
      });

      return { opCount, duration };
    };

    // Run both engines in parallel
    const [leftStats, rightStats] = await Promise.all([
      runEngine(leftFramework, setLeftResult),
      runEngine(rightFramework, setRightResult)
    ]);

    // Determine winner (faster = winner)
    if (leftStats.duration < rightStats.duration * 0.95) {
      setWinner('left');
    } else if (rightStats.duration < leftStats.duration * 0.95) {
      setWinner('right');
    } else {
      setWinner('tie');
    }

    setIsRunning(false);
    isRunningRef.current = false;
  }, [leftFramework, rightFramework]);

  const stopComparison = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const leftTheme = frameworkThemes[leftFramework];
  const rightTheme = frameworkThemes[rightFramework];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-2">
            <GitCompare size={24} className="text-[var(--accent-primary)]" />
            <div>
              <h1 className="text-lg font-bold">Framework Comparison</h1>
              <p className="text-[10px] text-[var(--text-muted)]">Side-by-side performance battle</p>
            </div>
          </div>
        </div>
        <button
          onClick={toggleAppTheme}
          className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
        >
          {appTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex-1 p-6">
        {/* Framework Selectors */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <FrameworkPicker 
            selected={leftFramework} 
            onChange={setLeftFramework} 
            label="Left Fighter"
            disabled={isRunning}
          />
          
          <div className="text-4xl font-black text-[var(--text-muted)]">VS</div>
          
          <FrameworkPicker 
            selected={rightFramework} 
            onChange={setRightFramework} 
            label="Right Fighter"
            disabled={isRunning}
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-center mb-8">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runComparison}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-xl"
            >
              <Play size={24} fill="currentColor" />
              START BATTLE!
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopComparison}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-500 text-white font-bold text-lg"
            >
              <Square size={24} fill="currentColor" />
              STOP
            </motion.button>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ResultCard 
            result={leftResult}
            theme={leftTheme}
            isWinner={winner === 'left'}
          />
          <ResultCard 
            result={rightResult}
            theme={rightTheme}
            isWinner={winner === 'right'}
          />
        </div>

        {/* Winner Banner */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 text-center"
            >
              {winner === 'tie' ? (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                  <Trophy size={24} className="text-amber-400" />
                  <span className="text-xl font-bold text-amber-400">It's a TIE!</span>
                </div>
              ) : (
                <div 
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border"
                  style={{ 
                    background: `linear-gradient(135deg, ${winner === 'left' ? leftTheme.primary : rightTheme.primary}20, ${winner === 'left' ? leftTheme.accent : rightTheme.accent}20)`,
                    borderColor: `${winner === 'left' ? leftTheme.primary : rightTheme.primary}40`
                  }}
                >
                  <Trophy size={24} style={{ color: winner === 'left' ? leftTheme.primary : rightTheme.primary }} />
                  <span 
                    className="text-xl font-bold"
                    style={{ color: winner === 'left' ? leftTheme.primary : rightTheme.primary }}
                  >
                    {winner === 'left' ? leftTheme.name : rightTheme.name} WINS!
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Report Cards */}
        <AnimatePresence>
          {winner && leftResult.status === 'complete' && rightResult.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-12 max-w-5xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="h-px w-20 bg-[var(--border-primary)]" />
                <h2 className="text-xl font-bold text-[var(--text-muted)] uppercase tracking-widest">Performance Analysis</h2>
                <div className="h-px w-20 bg-[var(--border-primary)]" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <ReportCard 
                  framework={leftFramework}
                  stats={{
                    duration: leftResult.duration,
                    ops: leftResult.totalOps,
                    mounts: leftResult.mounts
                  }}
                  rank={winner === 'left' ? 1 : 2}
                />
                <ReportCard 
                  framework={rightFramework}
                  stats={{
                    duration: rightResult.duration,
                    ops: rightResult.totalOps,
                    mounts: rightResult.mounts
                  }}
                  rank={winner === 'right' ? 1 : 2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trade-off Analysis Section */}
        <AnimatePresence>
          {winner && leftResult.status === 'complete' && rightResult.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 max-w-6xl mx-auto"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="h-px w-20 bg-[var(--border-primary)]" />
                <h2 className="text-xl font-bold text-[var(--text-muted)] uppercase tracking-widest">Framework Trade-offs</h2>
                <div className="h-px w-20 bg-[var(--border-primary)]" />
              </div>

              {/* Radar Chart */}
              <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary)] p-8 mb-8 shadow-xl">
                <TradeoffChart framework1={leftFramework} framework2={rightFramework} />
              </div>

              {/* When to Use Cards */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <WhenToUse framework={leftFramework} />
                <WhenToUse framework={rightFramework} />
              </div>

              {/* Comparison Summary */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Lightbulb size={20} className="text-amber-400" />
                  <h3 className="font-bold text-lg">The Verdict</h3>
                </div>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                  {getComparisonSummary(leftFramework, rightFramework)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const FrameworkPicker: FC<{
  selected: Framework;
  onChange: (fw: Framework) => void;
  label: string;
  disabled: boolean;
}> = ({ selected, onChange, label, disabled }) => {
  const theme = frameworkThemes[selected];
  
  return (
    <div className="text-center">
      <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">{label}</div>
      <div className="flex gap-2">
        {frameworks.map(fw => {
          const fwTheme = frameworkThemes[fw];
          return (
            <motion.button
              key={fw}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.9 }}
              onClick={() => !disabled && onChange(fw)}
              disabled={disabled}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${
                selected === fw ? 'shadow-lg' : 'opacity-50'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ 
                borderColor: selected === fw ? fwTheme.primary : 'transparent',
                backgroundColor: selected === fw ? `${fwTheme.primary}20` : 'var(--bg-secondary)'
              }}
            >
              {fwTheme.icon}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-2 text-sm font-bold" style={{ color: theme.primary }}>{theme.name}</div>
    </div>
  );
};

const ResultCard: FC<{
  result: FrameworkResult;
  theme: typeof frameworkThemes.react;
  isWinner: boolean;
}> = ({ result, theme, isWinner }) => {
  return (
    <motion.div
      animate={isWinner ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isWinner ? Infinity : 0 }}
      className={`p-6 rounded-2xl border-2 transition-all ${
        isWinner ? 'shadow-2xl' : ''
      }`}
      style={{ 
        borderColor: isWinner ? theme.primary : `${theme.primary}30`,
        backgroundColor: `${theme.primary}08`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{theme.icon}</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: theme.primary }}>{theme.name}</h3>
            <p className="text-xs text-[var(--text-muted)]">{theme.tagline}</p>
          </div>
        </div>
        {result.status === 'running' && (
          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold animate-pulse">
            Running...
          </div>
        )}
        {result.status === 'complete' && (
          <CheckCircle size={24} className="text-emerald-400" />
        )}
        {isWinner && (
          <Trophy size={24} style={{ color: theme.primary }} />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatBlock 
          icon={<Zap size={16} />}
          label="Operations"
          value={result.totalOps.toLocaleString()}
          color={theme.primary}
        />
        <StatBlock 
          icon={<Clock size={16} />}
          label="Duration"
          value={`${(result.duration / 1000).toFixed(2)}s`}
          color="#10b981"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <MiniStat label="Mounts" value={result.mounts} color="#10b981" />
        <MiniStat label="Unmounts" value={result.unmounts} color="#ef4444" />
        <MiniStat label="Patches" value={result.patches} color="#f59e0b" />
      </div>
    </motion.div>
  );
};

const StatBlock: FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon, label, value, color
}) => (
  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-1">
      <span style={{ color }}>{icon}</span>
      {label}
    </div>
    <div className="text-xl font-bold" style={{ color }}>{value}</div>
  </div>
);

const MiniStat: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="text-center p-2 rounded-lg bg-[var(--bg-tertiary)]">
    <div className="text-lg font-bold" style={{ color }}>{value}</div>
    <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
  </div>
);

export default ComparePage;
