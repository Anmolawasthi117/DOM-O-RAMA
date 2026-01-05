import { type FC } from 'react';
import { motion } from 'framer-motion';
import { frameworkThemes, type Framework } from '../stores/appStore';
import { Trophy, Zap, AlertTriangle, GraduationCap, Star } from 'lucide-react';

interface ReportCardProps {
  framework: Framework;
  stats: {
    duration: number;
    ops: number;
    mounts: number;
  };
  rank: number; // 1 (Winner) or 2 (Runner-up)
}

const getGrade = (rank: number, duration: number): string => {
  if (rank === 1 && duration < 100) return 'S';
  if (rank === 1) return 'A+';
  if (duration < 1000) return 'B+';
  return 'C';
};

const getComments = (framework: Framework, rank: number): string => {
  const comments = {
    react: {
      win: "The Fiber King reigns supreme! Heavy work loop, but smooth concurrent updates.",
      loss: "The heavy machinery of Fiber couldn't keep up with raw speed this time. Time slicing has a cost!"
    },
    vue: {
      win: "Static hoisting for the win! The compiler skipped almost everything.",
      loss: "Even with optimization, dynamic updates dragged us down."
    },
    svelte: {
      win: "Surgical precision! No VDOM means zero overhead diffing.",
      loss: "Direct updates were fast, but the sheer volume overwhelmed the DOM."
    },
    solid: {
      win: "Granular reactivity is unbeatable. Only changed what absolutely needed changing.",
      loss: "The dependency graph overhead was just slightly too high for this test."
    },
    qwik: {
      win: "Resumability meant we didn't even hydrate until interaction!",
      loss: "Lazy loading chunks added some network overhead simulation."
    }
  };
  return rank === 1 ? comments[framework].win : comments[framework].loss;
};

export const ReportCard: FC<ReportCardProps> = ({ framework, stats, rank }) => {
  const theme = frameworkThemes[framework];
  const grade = getGrade(rank, stats.duration);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[var(--bg-secondary)] border-2 rounded-2xl p-6 relative overflow-hidden shadow-xl"
      style={{ borderColor: rank === 1 ? theme.primary : 'var(--border-primary)' }}
    >
      {/* Background decoration */}
      <div 
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 flex gap-6">
        {/* Grade Circle */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl font-black bg-[var(--bg-primary)] shadow-inner"
            style={{ 
              borderColor: theme.primary,
              color: theme.primary,
              textShadow: `0 0 20px ${theme.primary}50`
            }}
          >
            {grade}
          </div>
          {rank === 1 && (
            <div className="mt-2 flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Trophy size={14} /> Winner
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{theme.name} Report</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              {theme.tagline}
            </span>
          </div>

          <div className="bg-[var(--bg-tertiary)]/50 rounded-xl p-3 mb-4 border border-[var(--border-primary)] italic text-sm text-[var(--text-secondary)]">
            "{getComments(framework, rank)}"
          </div>

          {/* Badges/Tags */}
          <div className="flex flex-wrap gap-2">
            {rank === 1 && (
              <Badge icon={<Zap size={12} />} label="Speed Demon" color="#f59e0b" />
            )}
            {stats.ops < 10 && (
              <Badge icon={<Star size={12} />} label="Minimalist" color="#10b981" />
            )}
            {stats.duration > 1000 && (
              <Badge icon={<AlertTriangle size={12} />} label="Heavy Lifter" color="#ef4444" />
            )}
            <Badge icon={<GraduationCap size={12} />} label={`${stats.ops} Operations`} color={theme.accent} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Badge: FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <span 
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
    style={{ 
      borderColor: `${color}40`, 
      backgroundColor: `${color}10`,
      color: color 
    }}
  >
    {icon} {label}
  </span>
);
