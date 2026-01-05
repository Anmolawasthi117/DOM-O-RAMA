import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Search, PenLine, Plus, Minus } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    patches: number;
    mounts: number;
    unmounts: number;
    comparisons: number;
  };
}

export const StatsPanel: FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-3 border border-[var(--border-primary)] shadow-lg">
      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
        <BarChart3 size={14} className="text-[var(--accent-secondary)]" />
        Real-time Metrics
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Comparisons" value={stats.comparisons} color="blue" icon={<Search size={16} />} />
        <StatCard label="Patches" value={stats.patches} color="amber" icon={<PenLine size={16} />} />
        <StatCard label="Mounts" value={stats.mounts} color="emerald" icon={<Plus size={16} />} />
        <StatCard label="Unmounts" value={stats.unmounts} color="red" icon={<Minus size={16} />} />
      </div>
    </div>
  );
};

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const StatCard: FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div className={`p-2.5 rounded-lg border ${colors.border} ${colors.bg} flex items-center gap-3 transition-all hover:scale-[1.02]`}>
        <span className={`${colors.text} opacity-70`}>{icon}</span>
        <div className="flex flex-col">
            <span className="text-[var(--text-muted)] text-[9px] uppercase tracking-wider font-semibold">{label}</span>
            <AnimatePresence mode='wait'>
                <motion.span 
                    key={value}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className={`text-xl font-black ${colors.text}`}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    </div>
  );
};
