import { type FC } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { GraduationCap, Briefcase } from 'lucide-react';

export const SkillLevelToggle: FC = () => {
  const { skillLevel, setSkillLevel } = useAppStore();

  return (
    <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-primary)]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSkillLevel('junior')}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${skillLevel === 'junior' 
            ? 'bg-[var(--accent-primary)] text-white shadow-md' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }
        `}
      >
        <GraduationCap size={14} />
        Junior
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSkillLevel('senior')}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
          ${skillLevel === 'senior' 
            ? 'bg-[var(--accent-secondary)] text-white shadow-md' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }
        `}
      >
        <Briefcase size={14} />
        Senior
      </motion.button>
    </div>
  );
};
