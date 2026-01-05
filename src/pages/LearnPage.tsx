import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, frameworkThemes, type Framework } from '../stores/appStore';
import { FrameworkSelector } from '../components/FrameworkSelector';
import { 
  Home, BookOpen, Sun, Moon, 
  Cpu, Box, Zap, FileCode, Layers, AlertCircle,
  ArrowRight, Sparkles, Code, RefreshCw, Rocket
} from 'lucide-react';

// Educational content sections
const sections = [
  { id: 'why', icon: <AlertCircle size={18} />, label: 'Why Frameworks?' },
  { id: 'vdom', icon: <Layers size={18} />, label: 'VDOM Explained' },
  { id: 'engine', icon: <Cpu size={18} />, label: 'Our Engine' },
  { id: 'framework', icon: <Sparkles size={18} />, label: 'Framework Deep-Dive' }
];

export const LearnPage: FC = () => {
  const { currentFramework, appTheme, toggleAppTheme } = useAppStore();
  const theme = frameworkThemes[currentFramework];
  const [activeSection, setActiveSection] = useState('why');
  const [activeFrameworkTab, setActiveFrameworkTab] = useState<'philosophy' | 'internals' | 'code'>('philosophy');

  const frameworkContent: Record<Framework, any> = {
    react: {
      philosophy: "It's all JavaScript. UI is a function of state. React pioneered the component model and declarative UI.",
      internals: "Uses a 'Fiber' architecture with a time-slicing work loop. Renders can be interrupted, prioritized, and resumed for smooth UX.",
      code: `function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c+1)}>{count}</button>;\n}`,
      features: ["Virtual DOM", "One-way Data Flow", "Hooks System", "Concurrent Mode"],
      engineNote: "Our React engine simulates FIBER_BEGIN_WORK and FIBER_COMPLETE_WORK phases, mimicking the work loop."
    },
    vue: {
      philosophy: "Progressive Framework. Easy to pick up, powerful to scale. Start small, grow as needed.",
      internals: "Compiler analyzes templates to hoist static content and generate patch flags. Only dynamic parts are diffed at runtime.",
      code: `<template>\n  <button @click="count++">{{ count }}</button>\n</template>\n<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>`,
      features: ["Reactivity System", "Single File Components", "Directives", "Composition API"],
      engineNote: "Our Vue engine simulates VUE_HOIST_CHECK and VUE_PATCH_FLAGS to show compiler-driven optimizations."
    },
    svelte: {
      philosophy: "The compiler IS the framework. Write less code, ship smaller bundles. No VDOM overhead.",
      internals: "Compiles components into tiny, imperative JS modules that surgically update the DOM. No diffing needed.",
      code: `<script>\n  let count = 0;\n</script>\n<button on:click={() => count++}>{count}</button>`,
      features: ["No Virtual DOM", "True Reactivity", "Less Boilerplate", "Scoped CSS"],
      engineNote: "Our Svelte engine simulates DIRECT_UPDATE operations—no VDOM comparison, just targeted mutations."
    },
    solid: {
      philosophy: "Fine-grained reactivity. Components run once, only dependencies update. React syntax, better perf.",
      internals: "Uses compiled Signals to track dependencies. DOM updates are precise and direct, no component re-renders.",
      code: `function App() {\n  const [count, setCount] = createSignal(0);\n  return <button onClick={() => setCount(c => c+1)}>{count()}</button>;\n}`,
      features: ["Signals", "No Component Re-renders", "JSX Support", "Small Bundle Size"],
      engineNote: "Our Solid engine simulates SIGNAL_TRACK and SIGNAL_TRIGGER to demonstrate fine-grained updates."
    },
    qwik: {
      philosophy: "Instant apps of any size. Resumability is key. JS loads only when needed.",
      internals: "Serializes app state into HTML. JS is lazy-loaded on interaction. No hydration cost.",
      code: `export default component$(() => {\n  const count = useSignal(0);\n  return <button onClick$={() => count.value++}>{count.value}</button>;\n});`,
      features: ["Resumability", "Zero Hydration", "Lazy Loading", "Optimizer"],
      engineNote: "Our Qwik engine simulates QWIK_RESUME and QWIK_SERIALIZE to show resumability concepts."
    }
  };

  const currentContent = frameworkContent[currentFramework];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            <Home size={18} className="text-[var(--text-muted)]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl sketchy-border bg-[var(--bg-card)] flex items-center justify-center shadow-ink">
              <BookOpen size={24} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-black font-hand text-[var(--accent-primary)]">Learning Center</h1>
              <p className="text-xs text-[var(--text-muted)]">Master frameworks from first principles</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FrameworkSelector />
          <button onClick={toggleAppTheme} className="p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish">
            {appTheme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Section Navigation */}
      <nav className="relative z-10 px-6 py-4 flex justify-center gap-2 flex-wrap">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all btn-squish ${
              activeSection === sec.id 
                ? 'bg-[var(--accent-primary)] text-white shadow-float' 
                : 'sketchy-border bg-[var(--bg-card)] text-[var(--text-muted)] shadow-ink'
            }`}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 p-6 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeSection === 'why' && (
            <motion.div key="why" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <WhyFrameworksSection />
            </motion.div>
          )}
          {activeSection === 'vdom' && (
            <motion.div key="vdom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <VDOMExplainedSection />
            </motion.div>
          )}
          {activeSection === 'engine' && (
            <motion.div key="engine" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OurEngineSection theme={theme} />
            </motion.div>
          )}
          {activeSection === 'framework' && (
            <motion.div key="framework" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FrameworkDeepDive 
                theme={theme} 
                content={currentContent} 
                activeTab={activeFrameworkTab} 
                setActiveTab={setActiveFrameworkTab} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Section: Why Frameworks?
const WhyFrameworksSection: FC = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-black mb-4 font-hand">Why Do We Need Frameworks?</h2>
      <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
        Before frameworks, building dynamic UIs meant wrestling with the DOM directly. Let's see why that's painful.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <ContentCard 
        title="❌ Vanilla JS Pain Points"
        color="#ef4444"
        items={[
          "Manual DOM manipulation is verbose",
          "Tracking state changes is error-prone",
          "No component reusability patterns",
          "Event listener cleanup is tedious",
          "Performance optimizations are DIY"
        ]}
      />
      <ContentCard 
        title="✅ Frameworks Solve This"
        color="#10b981"
        items={[
          "Declarative UI: describe WHAT, not HOW",
          "Automatic state → UI synchronization",
          "Component model for reusability",
          "Built-in lifecycle management",
          "Optimized rendering out of the box"
        ]}
      />
    </div>

    <div className="p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Code size={20} className="text-[var(--accent-primary)]" />
        The Core Idea
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        Instead of imperatively telling the browser "add this element, remove that one, change this text"... 
        frameworks let you <strong>declare</strong> what the UI should look like for a given state. 
        The framework figures out the minimal changes needed to update the DOM.
      </p>
    </div>
  </div>
);

// Section: VDOM Explained
const VDOMExplainedSection: FC = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-black mb-4 font-hand">The Virtual DOM Concept</h2>
      <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
        The Virtual DOM is a lightweight JavaScript representation of the real DOM. It enables efficient updates.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      <StepCard number={1} title="Render" desc="Create a VDOM tree from your components" />
      <StepCard number={2} title="Diff" desc="Compare new VDOM with previous VDOM" />
      <StepCard number={3} title="Patch" desc="Apply only the minimal changes to real DOM" />
    </div>

    <div className="p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <RefreshCw size={20} className="text-[var(--accent-primary)]" />
        Why Not Update Directly?
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
        Real DOM operations are expensive. By batching changes and computing the minimal diff in memory (VDOM), 
        frameworks can reduce the number of actual DOM operations significantly.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge label="React" desc="Uses Fiber for async diffing" />
        <Badge label="Vue" desc="Compiler optimizes at build time" />
        <Badge label="Svelte" desc="No VDOM—compiles to direct updates" />
      </div>
    </div>
  </div>
);

// Section: Our Engine
const OurEngineSection: FC<{ theme: { icon: string; name: string; primary: string; accent: string; tagline: string } }> = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-black mb-4 font-hand">How Our Engine Simulates Frameworks</h2>
      <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
        DOM-O-RAMA uses custom engines that mimic each framework's unique approach to UI updates.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <EngineCard 
        icon="⚛️"
        name="React Fiber Engine"
        phases={["FIBER_BEGIN_WORK", "FIBER_COMPLETE_WORK", "COMMIT"]}
        desc="Simulates React's interruptible work loop and reconciliation phases."
      />
      <EngineCard 
        icon="💚"
        name="Vue Compiler Engine"
        phases={["VUE_HOIST_CHECK", "VUE_PATCH_FLAGS", "VUE_STATIC_LIFT"]}
        desc="Mimics Vue's compiler-driven optimizations and patch flag system."
      />
      <EngineCard 
        icon="🔥"
        name="Svelte Direct Engine"
        phases={["COMPILE", "DIRECT_UPDATE", "COMPLETE"]}
        desc="Shows how Svelte skips diffing entirely with surgical DOM mutations."
      />
      <EngineCard 
        icon="💎"
        name="Solid Signals Engine"
        phases={["SIGNAL_TRACK", "SIGNAL_TRIGGER", "EFFECT_RUN"]}
        desc="Demonstrates fine-grained reactivity where only affected nodes update."
      />
    </div>

    <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Rocket size={20} className="text-amber-400" />
        Try It Yourself!
      </h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Head to the Playground, select a framework, and watch the engine steps in real-time.
      </p>
      <Link to="/playground" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold btn-squish">
        Open Playground <ArrowRight size={16} />
      </Link>
    </div>
  </div>
);

// Section: Framework Deep-Dive
const FrameworkDeepDive: FC<{ 
  theme: any; 
  content: any; 
  activeTab: string; 
  setActiveTab: (tab: any) => void;
}> = ({ theme, content, activeTab, setActiveTab }) => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">{theme.icon}</div>
      <h2 className="text-3xl font-black mb-2" style={{ color: theme.primary }}>{theme.name}</h2>
      <p className="text-[var(--text-muted)] italic">"{theme.tagline}"</p>
    </div>

    <div className="flex justify-center gap-2 mb-6">
      {[
        { id: 'philosophy', icon: <Box size={16} />, label: 'Philosophy' },
        { id: 'internals', icon: <Cpu size={16} />, label: 'Internals' },
        { id: 'code', icon: <FileCode size={16} />, label: 'Code' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === tab.id ? 'text-white' : 'sketchy-border bg-[var(--bg-card)] text-[var(--text-muted)]'
          }`}
          style={{ backgroundColor: activeTab === tab.id ? theme.primary : undefined }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>

    <div className="p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink min-h-[250px]">
      {activeTab === 'philosophy' && (
        <div className="text-center">
          <Zap size={40} className="mx-auto mb-4" style={{ color: theme.primary }} />
          <p className="text-lg leading-relaxed">{content.philosophy}</p>
        </div>
      )}
      {activeTab === 'internals' && (
        <div>
          <p className="text-lg leading-relaxed mb-4">{content.internals}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {content.features.map((f: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>{f}</span>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)] italic text-center">{content.engineNote}</p>
        </div>
      )}
      {activeTab === 'code' && (
        <div className="bg-[var(--bg-primary)] p-4 rounded-xl font-mono text-sm">
          <pre style={{ color: theme.primary }}>{content.code}</pre>
        </div>
      )}
    </div>
  </div>
);

// Reusable Components
const ContentCard: FC<{ title: string; color: string; items: string[] }> = ({ title, color, items }) => (
  <div className="p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink">
    <h3 className="text-lg font-bold mb-4" style={{ color }}>{title}</h3>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)] text-sm">
          <span style={{ color }}>•</span> {item}
        </li>
      ))}
    </ul>
  </div>
);

const StepCard: FC<{ number: number; title: string; desc: string }> = ({ number, title, desc }) => (
  <div className="p-6 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink text-center">
    <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-4 text-xl font-black">{number}</div>
    <h4 className="font-bold mb-2">{title}</h4>
    <p className="text-sm text-[var(--text-muted)]">{desc}</p>
  </div>
);

const Badge: FC<{ label: string; desc: string }> = ({ label, desc }) => (
  <div className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-xs">
    <strong>{label}</strong>: {desc}
  </div>
);

const EngineCard: FC<{ icon: string; name: string; phases: string[]; desc: string }> = ({ icon, name, phases, desc }) => (
  <div className="p-5 rounded-2xl sketchy-border bg-[var(--bg-card)] shadow-ink">
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-bold mb-2">{name}</h4>
    <p className="text-sm text-[var(--text-muted)] mb-3">{desc}</p>
    <div className="flex flex-wrap gap-1">
      {phases.map(p => (
        <code key={p} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent-primary)]">{p}</code>
      ))}
    </div>
  </div>
);

export default LearnPage;
