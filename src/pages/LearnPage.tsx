import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore, frameworkThemes, type Framework } from '../stores/appStore';
import { FrameworkSelector } from '../components/FrameworkSelector';
import { 
  Home, BookOpen, Sun, Moon, 
  Cpu, Box, Zap, FileCode, Layers
} from 'lucide-react';

export const LearnPage: FC = () => {
  const { currentFramework, appTheme, toggleAppTheme } = useAppStore();
  const theme = frameworkThemes[currentFramework];
  const [activeTab, setActiveTab] = useState<'philosophy' | 'internals' | 'code'>('philosophy');

  const content: Record<Framework, any> = {
    react: {
      philosophy: "It's all JavaScript. UI is a function of state.",
      internals: "Uses a 'Fiber' architecture with a time-slicing work loop. Renders can be paused, prioritized, and resumed.",
      code: "const App = () => <div>Hello React</div>",
      features: ["Virtual DOM", "One-way Data Flow", "Hooks System", "Concurrent Mode"]
    },
    vue: {
      philosophy: "Progressive Framework. Easy to pick up, powerful to scale.",
      internals: "Uses a highly optimized compiler that analyzes templates to hoist static content and generate patch flags.",
      code: "<template><div>Hello Vue</div></template>",
      features: ["Reactivity System", "Single File Components", "Directives", "Composition API"]
    },
    svelte: {
      philosophy: "The compiler is the framework. Write less code.",
      internals: "Compiles components into tiny, imperative vanilla JS modules that surgically update the DOM. No VDOM.",
      code: "<script>let name = 'Svelte';</script><h1>Hello {name}</h1>",
      features: ["No Virtual DOM", "True Reactivity", "Less Boilerplate", "Scoped CSS"]
    },
    solid: {
      philosophy: "Fine-grained reactivity. Components vanish at runtime.",
      internals: "Uses compiled Signals to track dependencies. DOM updates are precise and direct only where needed.",
      code: "const App = () => <div>Hello Solid</div>",
      features: ["Signals", "No Component Re-renders", "JSX Support", "Small Bundle Size"]
    },
    qwik: {
      philosophy: "Instant apps of any size. Resumability is key.",
      internals: "Serializes application state into HTML. JS is lazy-loaded only when user interacts (Click-to-load).",
      code: "export default component$(() => <div>Hello Qwik</div>)",
      features: ["Resumability", "Zero Hydration", "Lazy Loading", "Optimizer"]
    }
  };

  const currentContent = content[currentFramework];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: `${theme.primary}30` }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: theme.primary }}>Learning Center</h1>
              <p className="text-[10px] text-[var(--text-muted)]">Master the internals of {theme.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FrameworkSelector />
          <button
            onClick={toggleAppTheme}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          >
            {appTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-6 rounded-3xl mb-6 shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: `${theme.primary}10` }}
          >
            <div className="absolute inset-0 opacity-20 blur-xl" style={{ backgroundColor: theme.primary }} />
            <div className="relative text-6xl">{theme.icon}</div>
          </motion.div>
          <h2 className="text-4xl font-black mb-4" style={{ color: theme.primary }}>{theme.name}</h2>
          <p className="text-xl text-[var(--text-secondary)] italic">"{theme.tagline}"</p>
        </section>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { id: 'philosophy', icon: <Box size={18} />, label: 'Philosophy' },
            { id: 'internals', icon: <Cpu size={18} />, label: 'Internals' },
            { id: 'code', icon: <FileCode size={18} />, label: 'Snippet' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'text-white shadow-lg scale-105' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
              style={{ 
                backgroundColor: activeTab === tab.id ? theme.primary : undefined 
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-xl min-h-[300px] flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 rounded-full blur-3xl opacity-5" style={{ backgroundColor: theme.primary }} />
          
          {activeTab === 'philosophy' && (
            <div className="max-w-2xl">
              <Zap size={48} className="mx-auto mb-6" style={{ color: theme.primary }} />
              <h3 className="text-2xl font-bold mb-4">Core Philosophy</h3>
              <p className="text-lg leading-relaxed">{currentContent.philosophy}</p>
            </div>
          )}

          {activeTab === 'internals' && (
            <div className="max-w-2xl">
              <Layers size={48} className="mx-auto mb-6" style={{ color: theme.primary }} />
              <h3 className="text-2xl font-bold mb-4">Under the Hood</h3>
              <p className="text-lg leading-relaxed mb-6">{currentContent.internals}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {currentContent.features.map((feat: string, i: number) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-full text-sm font-bold border"
                    style={{ 
                      borderColor: `${theme.primary}40`,
                      backgroundColor: `${theme.primary}10`,
                      color: theme.primary
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="w-full max-w-2xl text-left">
              <div className="bg-[var(--bg-primary)] p-6 rounded-xl font-mono text-sm border border-[var(--border-primary)] shadow-inner">
                <div className="flex gap-1.5 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre style={{ color: theme.primary }}>
                  {currentContent.code}
                </pre>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default LearnPage;
