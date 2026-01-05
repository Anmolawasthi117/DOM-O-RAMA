import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { frameworkThemes, useAppStore } from '../stores/appStore';
import { Layers, Zap, GitCompare, Activity } from 'lucide-react';

export const LandingPage: FC = () => {
  const { appTheme, toggleAppTheme } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <Layers size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight">DOM-O-RAMA</span>
        </div>
        <button 
          onClick={toggleAppTheme}
          className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {appTheme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
          >
            The Ultimate <br/> VDOM Simulator
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Visualize how React, Vue, Svelte, Solid, and Qwik render under the hood. 
            Compare performance, stress test engines, and master the internals.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/playground">
              <button className="px-8 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                <Zap size={20} />
                Start Simulating
              </button>
            </Link>
            <Link to="/compare">
              <button className="px-8 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
                <GitCompare size={20} />
                Compare Frameworks
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <FeatureCard 
            icon={<Zap size={32} className="text-amber-500" />}
            title="Interactive Playground"
            desc="Write JSX, see the VDOM tree update in real-time, and watch the reconciliation process step-by-step."
            link="/playground"
          />
          <FeatureCard 
            icon={<GitCompare size={32} className="text-blue-500" />}
            title="Framework Battle"
            desc="Pit React against Vue or Svelte against Solid in a side-by-side performance comparison."
            link="/compare"
          />
          <FeatureCard 
            icon={<Activity size={32} className="text-red-500" />}
            title="Stress Test Arena"
            desc="Push frameworks to their breaking point with 10k items, prop bombs, and deep nesting tests."
            link="/stress-test"
          />
        </div>

        {/* Frameworks Marquee */}
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8">Supported Frameworks</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            {Object.entries(frameworkThemes).map(([key, theme]) => (
              <div key={key} className="flex flex-col items-center gap-3 group cursor-default">
                <div className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">
                  {theme.icon}
                </div>
                <span className="font-bold text-sm" style={{ color: theme.primary }}>{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard: FC<{ icon: React.ReactNode, title: string, desc: string, link: string }> = ({ icon, title, desc, link }) => (
  <Link to={link} className="block group">
    <div className="h-full p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-colors relative overflow-hidden group-hover:shadow-2xl">
      <div className="mb-6 bg-[var(--bg-primary)] w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--accent-primary)] transition-colors">{title}</h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </div>
  </Link>
);
