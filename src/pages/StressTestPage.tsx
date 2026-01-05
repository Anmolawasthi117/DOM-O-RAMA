import { useState, useRef, useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, frameworkThemes } from '../stores/appStore';
import { getEngine } from '../core/engine';
import { stressTests, type StressTestType } from '../utils/stressTests';
import { FrameworkSelector } from '../components/FrameworkSelector';
import { 
  Home, Play, Square, Gauge, Clock, Zap, 
  AlertTriangle, CheckCircle, Flame, Sun, Moon 
} from 'lucide-react';

interface Metrics {
  totalOps: number;
  mounts: number;
  unmounts: number;
  patches: number;
  comparisons: number;
  startTime: number;
  endTime: number;
  status: 'idle' | 'running' | 'complete' | 'error';
}

export const StressTestPage: FC = () => {
  const { currentFramework, appTheme, toggleAppTheme, speed } = useAppStore();
  const theme = frameworkThemes[currentFramework];
  
  const [selectedTest, setSelectedTest] = useState<StressTestType>('10k-list');
  const [metrics, setMetrics] = useState<Metrics>({
    totalOps: 0,
    mounts: 0,
    unmounts: 0,
    patches: 0,
    comparisons: 0,
    startTime: 0,
    endTime: 0,
    status: 'idle'
  });
  
  const isRunningRef = useRef(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runTest = useCallback(async () => {
    const test = stressTests.find(t => t.type === selectedTest);
    if (!test) return;

    const engine = getEngine(currentFramework, Math.max(speed / 10, 10));
    const oldTree = test.generateOldTree();
    const newTree = test.generateNewTree();

    setMetrics({
      totalOps: 0,
      mounts: 0,
      unmounts: 0,
      patches: 0,
      comparisons: 0,
      startTime: performance.now(),
      endTime: 0,
      status: 'running'
    });
    setLogs([`🚀 Starting ${test.name}...`]);
    isRunningRef.current = true;

    try {
      const iterator = engine.diff(oldTree, newTree);
      let opCount = 0;

      while (isRunningRef.current) {
        const { value, done } = await iterator.next();
        if (done) break;

        opCount++;
        if (value) {
          setMetrics(prev => {
            const updated = { ...prev, totalOps: opCount };
            if (value.type === 'MOUNTING') updated.mounts++;
            if (value.type === 'UNMOUNTING') updated.unmounts++;
            if (value.type === 'PATCHING') updated.patches++;
            if (value.type.includes('COMPARING') || value.type.includes('BEGIN_WORK')) updated.comparisons++;
            return updated;
          });

          if (opCount % 100 === 0) {
            setLogs(prev => [...prev.slice(-20), `📊 ${opCount} ops processed...`]);
          }
        }
      }

      setMetrics(prev => ({
        ...prev,
        endTime: performance.now(),
        status: 'complete'
      }));
      setLogs(prev => [...prev, `✅ Complete! Total: ${opCount} operations`]);
    } catch (error) {
      setMetrics(prev => ({ ...prev, status: 'error' }));
      setLogs(prev => [...prev, `❌ Error: ${error}`]);
    }

    isRunningRef.current = false;
  }, [selectedTest, currentFramework, speed]);

  const stopTest = useCallback(() => {
    isRunningRef.current = false;
    setMetrics(prev => ({ ...prev, status: 'idle' }));
    setLogs(prev => [...prev, '⏹️ Test stopped']);
  }, []);

  const currentTest = stressTests.find(t => t.type === selectedTest);
  const duration = metrics.endTime > 0 ? ((metrics.endTime - metrics.startTime) / 1000).toFixed(2) : '0.00';
  const opsPerSecond = metrics.endTime > 0 
    ? Math.round(metrics.totalOps / ((metrics.endTime - metrics.startTime) / 1000))
    : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      
      {/* Floating Doodles */}
      <svg className="absolute top-20 right-10 w-24 h-24 text-[var(--accent-secondary)] opacity-20 animate-pulse" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="10 8" />
      </svg>
      <svg className="absolute bottom-40 left-10 w-20 h-20 text-[var(--accent-primary)] opacity-15" viewBox="0 0 100 100">
        <polygon points="50,5 95,40 80,95 20,95 5,40" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
      </svg>

      {/* Header - Mobile Responsive */}
      <header className="relative z-10 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center shadow-ink"
              style={{ borderColor: `${theme.primary}40` }}
            >
              <Gauge size={20} style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black font-hand" style={{ color: theme.primary }}>Stress Test</h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] hidden sm:block">Push {theme.name} to its limits</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:block">
            <FrameworkSelector />
          </div>
          <button
            onClick={toggleAppTheme}
            className="p-2 md:p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish"
          >
            {appTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Mobile Framework Selector */}
      <div className="sm:hidden relative z-10 px-3 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <FrameworkSelector />
      </div>

      <main className="relative z-10 flex-1 p-3 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 overflow-auto">
        {/* Test Selector */}
        <section className="w-full md:w-80 shrink-0">
          <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 font-hand">Select Test</h2>
          <div className="space-y-3">
            {stressTests.map((test) => (
              <motion.button
                key={test.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTest(test.type)}
                className={`w-full p-4 rounded-xl sketchy-border text-left transition-all shadow-ink card-lift ${
                  selectedTest === test.type
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                    : 'bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{test.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{test.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">{test.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Run/Stop Buttons */}
          <div className="mt-6">
            {metrics.status !== 'running' ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={runTest}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-bold shadow-float btn-squish"
                style={{ backgroundColor: theme.primary }}
              >
                <Play size={20} fill="currentColor" />
                Run Test
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={stopTest}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-rose-500 text-white font-bold shadow-float btn-squish"
              >
                <Square size={20} fill="currentColor" />
                Stop Test
              </motion.button>
            )}
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard 
              icon={<Zap size={24} />}
              label="Total Ops"
              value={metrics.totalOps.toLocaleString()}
              color={theme.primary}
            />
            <MetricCard 
              icon={<Clock size={24} />}
              label="Duration"
              value={`${duration}s`}
              color="#10b981"
            />
            <MetricCard 
              icon={<Flame size={24} />}
              label="Ops/Second"
              value={opsPerSecond.toLocaleString()}
              color="#f59e0b"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <SmallMetric label="Mounts" value={metrics.mounts} color="#10b981" />
            <SmallMetric label="Unmounts" value={metrics.unmounts} color="#ef4444" />
            <SmallMetric label="Patches" value={metrics.patches} color="#f59e0b" />
            <SmallMetric label="Comparisons" value={metrics.comparisons} color="#3b82f6" />
          </div>

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={metrics.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl sketchy-border flex items-center gap-3 mb-6 shadow-ink ${
                metrics.status === 'running' ? 'border-amber-500/30 bg-amber-500/10' :
                metrics.status === 'complete' ? 'border-emerald-500/30 bg-emerald-500/10' :
                metrics.status === 'error' ? 'border-red-500/30 bg-red-500/10' :
                'bg-[var(--bg-card)]'
              }`}
            >
              {metrics.status === 'running' && <Gauge size={20} className="text-amber-400 animate-spin" />}
              {metrics.status === 'complete' && <CheckCircle size={20} className="text-emerald-400" />}
              {metrics.status === 'error' && <AlertTriangle size={20} className="text-red-400" />}
              {metrics.status === 'idle' && <Gauge size={20} className="text-[var(--text-muted)]" />}
              <span className="font-bold">
                {metrics.status === 'running' && `Running ${currentTest?.name}...`}
                {metrics.status === 'complete' && `${currentTest?.name} Complete!`}
                {metrics.status === 'error' && 'Test Failed'}
                {metrics.status === 'idle' && 'Ready to run'}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Live Log */}
          <div className="bg-[var(--bg-card)] rounded-xl sketchy-border p-4 h-64 overflow-auto shadow-ink">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 font-hand">Live Log</h3>
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-[var(--text-secondary)]">{log}</div>
              ))}
              {logs.length === 0 && (
                <div className="text-[var(--text-muted)]">Waiting for test to start...</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const MetricCard: FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ 
  icon, label, value, color 
}) => (
  <div 
    className="p-5 rounded-xl sketchy-border shadow-ink card-lift"
    style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
  >
    <div className="flex items-center gap-2 mb-2" style={{ color }}>
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider font-hand">{label}</span>
    </div>
    <div className="text-3xl font-black" style={{ color }}>{value}</div>
  </div>
);

const SmallMetric: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="p-4 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink">
    <div className="text-xs text-[var(--text-muted)] mb-1 font-hand">{label}</div>
    <div className="text-xl font-black" style={{ color }}>{value.toLocaleString()}</div>
  </div>
);

export default StressTestPage;
