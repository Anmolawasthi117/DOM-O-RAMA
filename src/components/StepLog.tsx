import { useRef, useEffect } from 'react';
import type { DiffStep } from '../core/engine/VDOMSimulator';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Search, PenLine, Plus, Minus, SkipForward, CheckCircle } from 'lucide-react';

interface StepLogProps {
  steps: DiffStep[];
}

export const StepLog: React.FC<StepLogProps> = ({ steps }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-sm rounded-xl h-full overflow-hidden border border-[var(--border-primary)] shadow-lg flex flex-col">
      <div className="px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] shrink-0">
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <ClipboardList size={14} className="text-purple-500" />
          Operations Log
          <span className="ml-auto text-[var(--text-muted)] font-mono text-[9px]">{steps.length} ops</span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <AnimatePresence>
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className={`p-2 rounded-lg border-l-2 ${getStepColor(step.type)} bg-[var(--bg-secondary)] backdrop-blur-sm transition-all hover:bg-[var(--bg-tertiary)]`}
            >
              <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] mb-0.5">
                 <span className="uppercase font-bold tracking-wider flex items-center gap-1.5">
                    {getStepIcon(step.type)}
                    {step.type}
                 </span>
                 <span className="font-mono text-[var(--text-muted)]">{step.nodeId}</span>
              </div>
              <div className="text-[var(--text-secondary)] text-xs leading-snug">
                {step.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
};

function getStepColor(type: string) {
  switch (type) {
    case 'COMPARING': return 'border-blue-500 bg-blue-500/5';
    case 'PATCHING': return 'border-amber-500 bg-amber-500/5';
    case 'MOUNTING': return 'border-emerald-500 bg-emerald-500/5';
    case 'UNMOUNTING': return 'border-red-500 bg-red-500/5';
    case 'SKIPPING': return 'border-slate-500';
    case 'COMPLETE': return 'border-cyan-500 bg-cyan-500/10';
    default: return 'border-[var(--border-primary)]';
  }
}

function getStepIcon(type: string) {
  switch (type) {
    case 'COMPARING': return <Search size={10} className="text-blue-400" />;
    case 'PATCHING': return <PenLine size={10} className="text-amber-400" />;
    case 'MOUNTING': return <Plus size={10} className="text-emerald-400" />;
    case 'UNMOUNTING': return <Minus size={10} className="text-red-400" />;
    case 'SKIPPING': return <SkipForward size={10} className="text-slate-400" />;
    case 'COMPLETE': return <CheckCircle size={10} className="text-cyan-400" />;
    default: return null;
  }
}
