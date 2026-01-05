import { memo } from 'react';
import type { FC } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Box, List, Type, Hash, MousePointer2, MessageSquare } from 'lucide-react';

interface CustomNodeData {
  label: string;
  status?: 'idle' | 'comparing' | 'patching' | 'mounting' | 'unmounting';
}

const statusStyles: Record<string, { border: string; shadow: string; bg: string }> = {
  idle: { border: 'border-[var(--border-primary)]', shadow: '', bg: 'bg-[var(--bg-secondary)]' },
  comparing: { border: 'border-amber-400', shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]', bg: 'bg-[var(--bg-secondary)]' },
  patching: { border: 'border-amber-500', shadow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]', bg: 'bg-amber-500/10' },
  mounting: { border: 'border-emerald-400', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', bg: 'bg-emerald-500/10' },
  unmounting: { border: 'border-red-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]', bg: 'bg-red-500/10' },
};

const statusVariants = {
  idle: { scale: 1 },
  comparing: { scale: 1.05, transition: { duration: 0.2 } },
  patching: { scale: [1, 1.15, 1], transition: { duration: 0.3 } },
  mounting: { opacity: [0, 1], scale: [0.7, 1], transition: { duration: 0.4 } },
  unmounting: { x: [0, -4, 4, -4, 4, 0], opacity: [1, 0.5], transition: { duration: 0.5 } },
};

const getTagIcon = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'div': return <Box size={12} />;
    case 'ul': 
    case 'ol': return <List size={12} />;
    case 'li': return <Hash size={12} />;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'p': return <Type size={12} />;
    case 'text': return <MessageSquare size={12} />;
    case 'button': return <MousePointer2 size={12} />;
    default: return <Box size={12} />;
  }
};

export const CustomNode: FC<NodeProps<CustomNodeData>> = memo(({ data }) => {
  const status = data.status || 'idle';
  const styles = statusStyles[status] || statusStyles.idle;

  return (
    <motion.div
      variants={statusVariants}
      animate={status}
      initial="idle"
      className={`px-3 py-1.5 rounded-lg ${styles.bg} border-2 ${styles.border} ${styles.shadow} min-w-[80px] text-center transition-all duration-200`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[var(--border-secondary)] !border-[var(--border-primary)]" />
      <div className="flex items-center justify-center gap-1.5 text-[var(--text-primary)]">
        <span className="opacity-70">{getTagIcon(data.label)}</span>
        <span className="font-semibold text-xs tracking-wide">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[var(--border-secondary)] !border-[var(--border-primary)]" />
    </motion.div>
  );
});
