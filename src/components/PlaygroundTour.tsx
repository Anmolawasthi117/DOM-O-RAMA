import { useEffect, useRef, useState, createContext, useContext, type FC } from 'react';
import Shepherd from 'shepherd.js';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import 'shepherd.js/dist/css/shepherd.css';

// Create context for the tour
const TourContext = createContext<Shepherd.Tour | null>(null);

// Tour steps configuration
const getTourSteps = (): Shepherd.Step.StepOptions[] => [
  {
    id: 'welcome',
    text: `
      <div class="shepherd-content-custom">
        <h3>🎉 Welcome to DOM-O-RAMA Playground!</h3>
        <p>This interactive playground lets you <strong>visualize how Virtual DOM diffing works</strong> in real-time.</p>
        <p>Let's take a quick tour of all the features!</p>
      </div>
    `,
    buttons: [
      { text: 'Skip Tour', action() { this.complete(); }, secondary: true },
      { text: 'Let\'s Go! →', action() { this.next(); } }
    ]
  },
  {
    id: 'framework-selector',
    attachTo: { element: '#tour-framework-selector', on: 'bottom' },
    text: `
      <div class="shepherd-content-custom">
        <h3>🔧 Framework Selector</h3>
        <p>Switch between different framework engines to see how each one handles VDOM diffing:</p>
        <ul>
          <li><strong>React</strong> - Fiber reconciliation with work-in-progress trees</li>
          <li><strong>Vue</strong> - Template-optimized with static hoisting</li>
          <li><strong>Svelte</strong> - Compile-time reactivity (minimal runtime)</li>
          <li><strong>Solid</strong> - Fine-grained reactivity with no VDOM</li>
          <li><strong>Qwik</strong> - Resumable with lazy hydration</li>
        </ul>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'mode-switcher',
    attachTo: { element: '#tour-mode-switcher', on: 'bottom' },
    text: `
      <div class="shepherd-content-custom">
        <h3>🎯 Mode Switcher</h3>
        <p>Toggle between two modes:</p>
        <ul>
          <li><strong>Code Mode</strong> 💻 - Write your own JSX code and compile it to see the VDOM structure</li>
          <li><strong>Interact Mode</strong> 🖱️ - Use prebuilt interactive scenarios with clickable demos</li>
        </ul>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'simulation-controls',
    attachTo: { element: '#tour-simulation-controls', on: 'bottom' },
    text: `
      <div class="shepherd-content-custom">
        <h3>⏯️ Simulation Controls</h3>
        <p>Control the VDOM diffing simulation:</p>
        <ul>
          <li><strong>RUN</strong> ▶️ - Start the step-by-step visualization</li>
          <li><strong>PAUSE</strong> ⏸️ - Freeze the simulation mid-way</li>
          <li><strong>RESET</strong> 🔄 - Clear and restart from the beginning</li>
        </ul>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'scenarios-panel',
    attachTo: { element: '#tour-scenarios-panel', on: 'right' },
    text: `
      <div class="shepherd-content-custom">
        <h3>📋 Scenarios Panel</h3>
        <p>In <strong>Interact Mode</strong>, choose from prebuilt scenarios:</p>
        <ul>
          <li>Counter increment</li>
          <li>Todo list updates</li>
          <li>List reordering</li>
          <li>Conditional rendering</li>
        </ul>
        <p>Each scenario demonstrates a specific diffing pattern!</p>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'tree-visualizer',
    attachTo: { element: '#tour-tree-visualizer', on: 'left' },
    text: `
      <div class="shepherd-content-custom">
        <h3>🌳 Tree Visualizer</h3>
        <p>The main visualization area! Watch as the engine:</p>
        <ul>
          <li><span style="color: #3b82f6;">🔵 Compares</span> - nodes being diffed</li>
          <li><span style="color: #f59e0b;">🟡 Patches</span> - properties being updated</li>
          <li><span style="color: #22c55e;">🟢 Mounts</span> - new nodes added</li>
          <li><span style="color: #ef4444;">🔴 Unmounts</span> - nodes removed</li>
        </ul>
        <p>Nodes animate in real-time as the diff algorithm walks the tree!</p>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'stats-panel',
    attachTo: { element: '#tour-stats-panel', on: 'left' },
    text: `
      <div class="shepherd-content-custom">
        <h3>📊 Real-time Metrics</h3>
        <p>Track performance metrics during simulation:</p>
        <ul>
          <li><strong>Comparisons</strong> - How many nodes were examined</li>
          <li><strong>Patches</strong> - How many DOM updates needed</li>
          <li><strong>Mounts</strong> - New elements created</li>
          <li><strong>Unmounts</strong> - Elements removed from DOM</li>
        </ul>
        <p><em>Compare these across frameworks to see efficiency differences!</em></p>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'step-log',
    attachTo: { element: '#tour-step-log', on: 'left' },
    text: `
      <div class="shepherd-content-custom">
        <h3>📜 Step Log</h3>
        <p>A detailed <strong>chronological log</strong> of every operation:</p>
        <ul>
          <li>See exactly which nodes are being processed</li>
          <li>Understand the order of operations</li>
          <li>Track mounting, patching, and unmounting events</li>
        </ul>
        <p><em>Great for debugging and understanding the algorithm!</em></p>
      </div>
    `,
    buttons: [
      { text: '← Back', action() { this.back(); }, secondary: true },
      { text: 'Next →', action() { this.next(); } }
    ]
  },
  {
    id: 'complete',
    text: `
      <div class="shepherd-content-custom">
        <h3>🚀 You're All Set!</h3>
        <p>You now know all the features of the VDOM Playground!</p>
        <p><strong>Quick tips:</strong></p>
        <ul>
          <li>Start with <strong>Interact Mode</strong> to see prebuilt demos</li>
          <li>Try different <strong>frameworks</strong> to compare approaches</li>
          <li>Use <strong>slower speeds</strong> for learning</li>
          <li>Check the <strong>Stats Panel</strong> to compare efficiency</li>
        </ul>
        <p><em>Click the ? button anytime to restart this tour!</em></p>
      </div>
    `,
    buttons: [
      { text: 'Start Exploring! 🎉', action() { this.complete(); } }
    ]
  }
];

// Custom hook to use the tour
export const useTour = () => {
  const tour = useContext(TourContext);
  return tour;
};

// Tour start button component
export const TourButton: FC = () => {
  const tour = useTour();
  
  const handleStartTour = () => {
    if (tour) {
      tour.start();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleStartTour}
      className="p-2 md:p-3 rounded-xl sketchy-border bg-[var(--bg-card)] shadow-ink btn-squish"
      title="Start Tour"
      id="tour-help-button"
    >
      <HelpCircle size={18} className="text-[var(--accent-secondary)]" />
    </motion.button>
  );
};

// Main wrapper component
interface PlaygroundTourProps {
  children: React.ReactNode;
}

export const PlaygroundTour: FC<PlaygroundTourProps> = ({ children }) => {
  const tourRef = useRef<Shepherd.Tour | null>(null);
  const [tourInstance, setTourInstance] = useState<Shepherd.Tour | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Create tour instance
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 12
      },
      useModalOverlay: true,
      keyboardNavigation: true
    });

    // Add steps
    getTourSteps().forEach((step) => {
      tour.addStep(step);
    });

    // Handle tour completion
    const handleComplete = () => {
      localStorage.setItem('dom-o-rama-playground-tour-completed', 'true');
    };

    tour.on('complete', handleComplete);
    tour.on('cancel', handleComplete);

    tourRef.current = tour;
    setTourInstance(tour);
    setIsInitialized(true);

    return () => {
      tour.off('complete', handleComplete);
      tour.off('cancel', handleComplete);
      tour.complete();
    };
  }, []);

  // Auto-start tour on first visit
  useEffect(() => {
    if (isInitialized && tourRef.current) {
      const hasSeenTour = localStorage.getItem('dom-o-rama-playground-tour-completed');
      
      if (!hasSeenTour) {
        // Small delay to ensure all elements are rendered
        const timer = setTimeout(() => {
          tourRef.current?.start();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInitialized]);

  return (
    <TourContext.Provider value={tourInstance}>
      {children}
    </TourContext.Provider>
  );
};
