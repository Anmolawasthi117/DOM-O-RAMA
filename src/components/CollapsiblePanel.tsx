import { useState, type FC, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  position: 'left' | 'right';
  defaultExpanded?: boolean;
  color: string;
}

export const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
  title,
  icon,
  children,
  position,
  defaultExpanded = true,
  color
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isExpanded ? 384 : 48, // 384px = w-96, 48px = w-12
      }}
      className={`shrink-0 flex flex-col min-h-0 bg-[var(--bg-card)] border-y border-[var(--border-primary)] shadow-lg transition-colors z-20 relative ${
        position === 'left' ? 'border-r' : 'border-l'
      }`}
      style={{ borderColor: `${color}20` }}
    >
      {/* Header / Toggle Strip */}
      <div 
        className={`flex items-center justify-between p-2 ${
          !isExpanded ? 'flex-col h-full py-4' : 'border-b'
        }`}
        style={{ borderColor: `${color}10` }}
      >
        <div className={`flex items-center gap-2 ${!isExpanded ? 'flex-col rotate-180 [writing-mode:vertical-lr]' : ''}`}>
          <div style={{ color }}>{icon}</div>
          <span className={`font-bold text-sm truncate ${!isExpanded ? 'mt-2' : ''}`}>
            {title}
          </span>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
        >
          {position === 'left' ? (
            isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
          ) : (
            isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-hidden min-h-0 ${!isExpanded ? 'hidden' : 'block'}`}>
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
