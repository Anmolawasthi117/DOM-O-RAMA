import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface SimulationControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const SimulationControls: FC<SimulationControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  speed,
  onSpeedChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Playback Controls */}
      <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-primary)] backdrop-blur-sm shadow-lg">
        {!isPlaying ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPlay}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-lg hover:opacity-90"
          >
            <Play size={14} fill="currentColor" />
            RUN
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPause}
            className="flex items-center gap-1.5 bg-[var(--warning)] text-slate-950 px-4 py-1.5 rounded-lg font-bold text-xs transition-all"
          >
            <Pause size={14} fill="currentColor" />
            PAUSE
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="flex items-center gap-1 bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
        >
          <RotateCcw size={14} />
          RESET
        </motion.button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-primary)] backdrop-blur-sm shadow-lg">
        <Clock size={14} className="text-[var(--text-muted)]" />
        <span className="text-[var(--text-muted)] font-mono text-[10px] font-semibold whitespace-nowrap w-12">{speed}ms</span>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-20 h-1 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-secondary)]"
        />
      </div>
    </div>
  );
};
