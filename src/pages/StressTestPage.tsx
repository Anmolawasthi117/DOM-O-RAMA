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

    const engine = getEngine(currentFramework, Math.max(speed / 10, 10)); // Faster for stress tests
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

          // Log every 100th operation
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header 
        className="px-4 py-3 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: `${theme.primary}30` }}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
            >
              <Gauge size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: theme.primary }}>Stress Test Arena</h1>
              <p className="text-[10px] text-[var(--text-muted)]">Push your framework to the limit</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FrameworkSelector />
          <button
            onClick={toggleAppTheme}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          >
            {appTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex gap-6">
        {/* Test Selector */}
        <section className="w-80 shrink-0">
          <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Select Test</h2>
          <div className="space-y-3">
            {stressTests.map((test) => (
              <motion.button
                key={test.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTest(test.type)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedTest === test.type
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                    : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--border-secondary)]'
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
          <div className="mt-6 flex gap-3">
            {metrics.status !== 'running' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runTest}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
              >
                <Play size={18} fill="currentColor" />
                Run Test
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopTest}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-bold"
              >
                <Square size={18} fill="currentColor" />
                Stop
              </motion.button>
            )}
          </div>
        </section>

        {/* Metrics Dashboard */}
        <section className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard 
              icon={<Zap size={20} />}
              label="Total Operations"
              value={metrics.totalOps.toLocaleString()}
              color={theme.primary}
            />
            <MetricCard 
              icon={<Clock size={20} />}
              label="Duration"
              value={`${duration}s`}
              color="#10b981"
            />
            <MetricCard 
              icon={<Flame size={20} />}
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
              className={`p-4 rounded-xl border flex items-center gap-3 mb-6 ${
                metrics.status === 'running' ? 'border-amber-500/30 bg-amber-500/10' :
                metrics.status === 'complete' ? 'border-emerald-500/30 bg-emerald-500/10' :
                metrics.status === 'error' ? 'border-red-500/30 bg-red-500/10' :
                'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
              }`}
            >
              {metrics.status === 'running' && <Gauge size={20} className="text-amber-400 animate-spin" />}
              {metrics.status === 'complete' && <CheckCircle size={20} className="text-emerald-400" />}
              {metrics.status === 'error' && <AlertTriangle size={20} className="text-red-400" />}
              {metrics.status === 'idle' && <Gauge size={20} className="text-[var(--text-muted)]" />}
              <span className="font-semibold">
                {metrics.status === 'running' && `Running ${currentTest?.name}...`}
                {metrics.status === 'complete' && `${currentTest?.name} Complete!`}
                {metrics.status === 'error' && 'Test Failed'}
                {metrics.status === 'idle' && 'Ready to run'}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Live Log */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4 h-64 overflow-auto">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Live Log</h3>
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
    className="p-4 rounded-xl border"
    style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
  >
    <div className="flex items-center gap-2 mb-2" style={{ color }}>
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-3xl font-black" style={{ color }}>{value}</div>
  </div>
);

const SmallMetric: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
    <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
    <div className="text-xl font-bold" style={{ color }}>{value.toLocaleString()}</div>
  </div>
);

export default StressTestPage;
