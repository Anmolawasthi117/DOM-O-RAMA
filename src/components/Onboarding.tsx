import { type FC, useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Zap, GitCompare, Activity, BookOpen, Layers } from 'lucide-react';

// Onboarding context
interface OnboardingContextType {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  hasSeenOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};

// Onboarding steps data
const onboardingSteps = [
  {
    id: 'welcome',
    icon: <Sparkles size={48} className="text-amber-400" />,
    title: 'Welcome to DOM-O-RAMA!',
    description: 'Your visual guide to understanding how modern frontend frameworks update the DOM.',
    features: [
      'See how React, Vue, Svelte, Solid, and Qwik work internally',
      'Compare framework performance side-by-side',
      'Interactive simulations with step-by-step breakdowns'
    ]
  },
  {
    id: 'playground',
    icon: <Zap size={48} className="text-purple-500" />,
    title: 'Interactive Playground',
    description: 'Write code or pick a scenario, then watch the VDOM diff in real-time.',
    features: [
      'Code Mode: Write your own JSX and see the tree render',
      'Interact Mode: Click through pre-built scenarios',
      '6 different scenarios: Forms, Modals, Lists, and more',
      'Live tree visualization with step highlighting'
    ],
    link: '/playground'
  },
  {
    id: 'compare',
    icon: <GitCompare size={48} className="text-blue-500" />,
    title: 'Framework Battle',
    description: 'Pit two frameworks against each other in a performance race.',
    features: [
      'Side-by-side comparison with real metrics',
      'Report cards with grades and analysis',
      'Trade-off charts showing strengths/weaknesses',
      '"When to Use" recommendations for each framework'
    ],
    link: '/compare'
  },
  {
    id: 'stress',
    icon: <Activity size={48} className="text-rose-500" />,
    title: 'Stress Test Arena',
    description: 'Push frameworks to their limits with extreme test scenarios.',
    features: [
      '10,000 item list rendering',
      'Deep nesting stress tests',
      'Property bomb explosions',
      'Real-time metrics: ops/second, duration, patches'
    ],
    link: '/stress-test'
  },
  {
    id: 'learn',
    icon: <BookOpen size={48} className="text-emerald-500" />,
    title: 'Learning Center',
    description: 'Deep-dive into framework internals and VDOM concepts.',
    features: [
      'Why Frameworks? — The problem vanilla JS solves',
      'VDOM Explained — Render, Diff, Patch cycle',
      'Our Engine — How we simulate each framework',
      'Framework Deep-Dive — Philosophy, internals, code'
    ],
    link: '/learn'
  }
];

// Provider component
export const OnboardingProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('dom-o-rama-onboarding') === 'true';
    setHasSeenOnboarding(seen);
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('dom-o-rama-onboarding', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding, currentStep, setCurrentStep, completeOnboarding, hasSeenOnboarding }}>
      {children}
      <OnboardingModal />
    </OnboardingContext.Provider>
  );
};

// Modal component
const OnboardingModal: FC = () => {
  const { showOnboarding, setShowOnboarding, currentStep, setCurrentStep, completeOnboarding } = useOnboarding();
  const step = onboardingSteps[currentStep];
  const isLast = currentStep === onboardingSteps.length - 1;
  const isFirst = currentStep === 0;

  const next = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  const skip = () => {
    completeOnboarding();
  };

  return (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowOnboarding(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[var(--bg-card)] rounded-3xl sketchy-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-0">
              <button
                onClick={skip}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
              >
                <X size={20} />
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {onboardingSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep 
                        ? 'w-6 bg-[var(--accent-primary)]' 
                        : 'bg-[var(--border-primary)] hover:bg-[var(--text-muted)]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 pt-0"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="mb-4 p-4 rounded-2xl bg-[var(--bg-secondary)]">
                    {step.icon}
                  </div>
                  <h2 className="text-2xl font-black mb-2 font-hand">{step.title}</h2>
                  <p className="text-[var(--text-secondary)]">{step.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="text-[var(--accent-primary)] mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={isFirst}
                className={`px-4 py-2 rounded-xl flex items-center gap-1 font-bold text-sm transition-all ${
                  isFirst 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}
              >
                <ChevronLeft size={16} /> Back
              </button>

              <button
                onClick={skip}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Skip tour
              </button>

              <button
                onClick={next}
                className="px-6 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-sm flex items-center gap-1 btn-squish shadow-float"
              >
                {isLast ? 'Get Started' : 'Next'} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Button to trigger onboarding manually
export const OnboardingTrigger: FC = () => {
  const { setShowOnboarding, setCurrentStep } = useOnboarding();
  
  const openTour = () => {
    setCurrentStep(0);
    setShowOnboarding(true);
  };

  return (
    <button
      onClick={openTour}
      className="flex items-center gap-2 px-4 py-2 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish text-sm font-bold"
    >
      <Layers size={16} className="text-[var(--accent-primary)]" />
      Tour
    </button>
  );
};
