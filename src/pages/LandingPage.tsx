import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { frameworkThemes, useAppStore } from '../stores/appStore';
import { Layers, Zap, GitCompare, Activity, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';

// Floating doodle SVGs
const FloatingDoodles: FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Squiggly lines */}
    <svg className="absolute top-20 left-10 w-32 h-32 text-[var(--accent-primary)] opacity-20 animate-float" viewBox="0 0 100 100">
      <path d="M10 50 Q 25 25, 50 50 T 90 50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
    <svg className="absolute top-40 right-20 w-24 h-24 text-[var(--accent-secondary)] opacity-20 animate-float-delayed" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="10 8" />
    </svg>
    <svg className="absolute bottom-40 left-1/4 w-20 h-20 text-[var(--accent-success)] opacity-15 animate-float" viewBox="0 0 100 100">
      <polygon points="50,5 95,40 80,95 20,95 5,40" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
    </svg>
    <svg className="absolute top-1/3 right-1/4 w-16 h-16 text-[var(--accent-warning)] opacity-20 animate-float-delayed" viewBox="0 0 100 100">
      <path d="M50 10 L90 90 L10 90 Z" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
    </svg>
    {/* Arrow */}
    <svg className="absolute bottom-60 right-10 w-40 h-40 text-[var(--accent-primary)] opacity-10" viewBox="0 0 100 100">
      <path d="M20 80 Q 40 20, 80 30" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M70 20 L80 30 L68 35" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  </div>
);

// Animated title with wave effect
const AnimatedTitle: FC = () => {
  const text = "DOM-O-RAMA";
  return (
    <motion.h1 
      className="text-6xl md:text-8xl font-black mb-4 tracking-tight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] via-purple-500 to-[var(--accent-secondary)]"
          initial={{ y: 50, opacity: 0, rotate: -10 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: i * 0.05, 
            type: 'spring', 
            stiffness: 200,
            damping: 15
          }}
        >
          {char === '-' ? <span className="mx-1">{char}</span> : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export const LandingPage: FC = () => {
  const { appTheme, toggleAppTheme } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <FloatingDoodles />
      
      {/* Dot pattern background */}
      <div className="absolute inset-0 pattern-dots opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center shadow-ink">
            <Layers size={24} className="text-[var(--accent-primary)]" />
          </div>
          <span className="text-2xl font-black tracking-tight font-hand text-[var(--text-primary)]">DOM-O-RAMA</span>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <Link to="/learn" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hidden md:block">
            Learn
          </Link>
          <button 
            onClick={toggleAppTheme}
            className="p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish"
          >
            {appTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-sm font-bold mb-6"
          >
            <Sparkles size={14} />
            Visual Learning Platform
          </motion.div>
          
          <AnimatedTitle />
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-hand"
          >
            See how frontend frameworks really work. 
            Visualize VDOM diffs, compare engines, and become a framework wizard.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/playground">
              <button className="px-8 py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-lg btn-squish shadow-float flex items-center gap-3 group">
                <Zap size={20} />
                Start Exploring
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/compare">
              <button className="px-8 py-4 rounded-2xl sketchy-border bg-[var(--bg-card)] font-bold text-lg btn-squish shadow-ink flex items-center gap-3">
                <GitCompare size={20} />
                Compare Frameworks
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <FeatureCard 
            icon={<Zap size={28} className="text-amber-500" />}
            title="Interactive Playground"
            desc="Write JSX, watch the VDOM tree update in real-time."
            link="/playground"
            delay={0.7}
          />
          <FeatureCard 
            icon={<GitCompare size={28} className="text-blue-500" />}
            title="Framework Battle"
            desc="Pit React against Vue in a side-by-side performance race."
            link="/compare"
            delay={0.8}
          />
          <FeatureCard 
            icon={<Activity size={28} className="text-rose-500" />}
            title="Stress Test Arena"
            desc="Push frameworks to their limits with 10k item tests."
            link="/stress-test"
            delay={0.9}
          />
        </div>

        {/* Framework Icons */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8 font-hand">Explore All 5 Frameworks</p>
          <div className="flex flex-wrap justify-center gap-6">
            {Object.entries(frameworkThemes).map(([key, theme], i) => (
              <motion.div 
                key={key} 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div 
                  className="w-16 h-16 rounded-2xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center text-3xl shadow-ink card-lift"
                  style={{ borderColor: `${theme.primary}40` }}
                >
                  {theme.icon}
                </div>
                <span className="text-xs font-bold" style={{ color: theme.primary }}>{theme.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-[var(--text-muted)] text-sm">
        <p className="font-hand">Built for visual learners 🎨</p>
      </footer>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const FeatureCard: FC<{ icon: React.ReactNode, title: string, desc: string, link: string, delay: number }> = ({ icon, title, desc, link, delay }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
  >
    <Link to={link} className="block group">
      <div className="h-full p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink card-lift">
        <div className="mb-4 w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{title}</h3>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{desc}</p>
      </div>
    </Link>
  </motion.div>
);
