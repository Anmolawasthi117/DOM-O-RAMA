import { type FC } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, frameworkThemes, type Framework } from '../stores/appStore';
import { Atom, Leaf, Flame, Diamond, Zap } from 'lucide-react';

const frameworkIcons: Record<Framework, React.ReactNode> = {
  react: <Atom size={20} />,
  vue: <Leaf size={20} />,
  svelte: <Flame size={20} />,
  solid: <Diamond size={20} />,
  qwik: <Zap size={20} />
};

export const FrameworkSelector: FC = () => {
  const { currentFramework, setFramework } = useAppStore();
  const frameworks: Framework[] = ['react', 'vue', 'svelte', 'solid', 'qwik'];

  return (
    <div className="flex items-center gap-2">
      {frameworks.map((fw) => {
        const theme = frameworkThemes[fw];
        const isActive = currentFramework === fw;
        
        return (
          <motion.button
            key={fw}
            onClick={() => setFramework(fw)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`
              relative p-2.5 rounded-xl border-2 transition-all duration-300
              ${isActive 
                ? 'border-current shadow-lg' 
                : 'border-transparent hover:border-[var(--border-secondary)]'
              }
            `}
            style={{ 
              color: isActive ? theme.primary : 'var(--text-muted)',
              backgroundColor: isActive ? `${theme.primary}15` : 'transparent'
            }}
            title={`${theme.name} - ${theme.tagline}`}
          >
            {frameworkIcons[fw]}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: theme.primary }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
