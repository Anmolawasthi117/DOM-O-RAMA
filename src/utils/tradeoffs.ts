import type { Framework } from '../stores/appStore';

export interface TradeoffCategory {
    id: string;
    name: string;
    description: string;
}

export const tradeoffCategories: TradeoffCategory[] = [
    { id: 'bundleSize', name: 'Bundle Size', description: 'How small the framework ships to production' },
    { id: 'ssr', name: 'SSR Support', description: 'Server-side rendering capabilities' },
    { id: 'learningCurve', name: 'Learning Curve', description: 'Ease of picking up for new developers' },
    { id: 'ecosystem', name: 'Ecosystem', description: 'Libraries, tools, and community support' },
    { id: 'performance', name: 'Performance', description: 'Runtime speed and efficiency' },
    { id: 'dx', name: 'Developer Experience', description: 'Tooling, debugging, and ergonomics' }
];

export interface FrameworkTradeoff {
    framework: Framework;
    scores: Record<string, number>; // category id -> score (1-10)
    bestFor: string[];
    avoidIf: string[];
    summary: string;
}

export const frameworkTradeoffs: Record<Framework, FrameworkTradeoff> = {
    react: {
        framework: 'react',
        scores: {
            bundleSize: 5,
            ssr: 8,
            learningCurve: 6,
            ecosystem: 10,
            performance: 6,
            dx: 8
        },
        bestFor: [
            'Large enterprise applications',
            'Teams with existing React expertise',
            'Projects needing extensive third-party libraries',
            'Complex state management requirements'
        ],
        avoidIf: [
            'Bundle size is critical (use Svelte/Solid)',
            'You need maximum runtime performance',
            'Simple static sites (overkill)'
        ],
        summary: 'The industry standard with unmatched ecosystem, but comes with runtime overhead.'
    },
    vue: {
        framework: 'vue',
        scores: {
            bundleSize: 7,
            ssr: 9,
            learningCurve: 8,
            ecosystem: 8,
            performance: 7,
            dx: 9
        },
        bestFor: [
            'Progressive adoption in existing projects',
            'Teams new to frontend frameworks',
            'Full-stack projects with Nuxt.js',
            'Projects valuing gentle learning curve'
        ],
        avoidIf: [
            'You need React-specific libraries',
            'Team is already React-native',
            'Hiring pool is a concern (React dominates)'
        ],
        summary: 'The approachable choice with excellent DX and a compiler that optimizes static content.'
    },
    svelte: {
        framework: 'svelte',
        scores: {
            bundleSize: 10,
            ssr: 8,
            learningCurve: 9,
            ecosystem: 5,
            performance: 9,
            dx: 9
        },
        bestFor: [
            'Performance-critical applications',
            'Small bundle size requirements (mobile, embedded)',
            'Developers who prefer minimal boilerplate',
            'Projects where compile-time optimization matters'
        ],
        avoidIf: [
            'You need a vast library ecosystem',
            'Team prefers explicit over magic',
            'Enterprise support is required'
        ],
        summary: 'Compiles away the framework for near-vanilla JS performance and tiny bundles.'
    },
    solid: {
        framework: 'solid',
        scores: {
            bundleSize: 9,
            ssr: 7,
            learningCurve: 5,
            ecosystem: 4,
            performance: 10,
            dx: 7
        },
        bestFor: [
            'Maximum runtime performance',
            'React developers wanting fine-grained reactivity',
            'Interactive dashboards and real-time UIs',
            'Projects where every millisecond counts'
        ],
        avoidIf: [
            'Team is unfamiliar with reactive paradigms',
            'You need extensive pre-built components',
            'SSR is a primary concern'
        ],
        summary: 'React-like syntax with fine-grained reactivity for blazing fast updates.'
    },
    qwik: {
        framework: 'qwik',
        scores: {
            bundleSize: 10,
            ssr: 10,
            learningCurve: 4,
            ecosystem: 3,
            performance: 10,
            dx: 6
        },
        bestFor: [
            'E-commerce and content sites prioritizing TTI',
            'SEO-critical applications',
            'Resumable hydration requirements',
            'Projects where Time-to-Interactive is paramount'
        ],
        avoidIf: [
            'You need a mature ecosystem',
            'Team is unfamiliar with resumability concepts',
            'Highly interactive SPAs (traditional hydration may suffice)'
        ],
        summary: 'Revolutionary resumability for instant interactivity without hydration cost.'
    }
};

export const getComparisonSummary = (fw1: Framework, fw2: Framework): string => {
    const t1 = frameworkTradeoffs[fw1];
    const t2 = frameworkTradeoffs[fw2];

    const fw1Wins: string[] = [];
    const fw2Wins: string[] = [];

    tradeoffCategories.forEach(cat => {
        const diff = t1.scores[cat.id] - t2.scores[cat.id];
        if (diff >= 2) fw1Wins.push(cat.name);
        else if (diff <= -2) fw2Wins.push(cat.name);
    });

    if (fw1Wins.length > fw2Wins.length) {
        return `${t1.framework.toUpperCase()} edges ahead in ${fw1Wins.join(', ')}, while ${t2.framework.toUpperCase()} leads in ${fw2Wins.length > 0 ? fw2Wins.join(', ') : 'no major categories'}.`;
    } else if (fw2Wins.length > fw1Wins.length) {
        return `${t2.framework.toUpperCase()} edges ahead in ${fw2Wins.join(', ')}, while ${t1.framework.toUpperCase()} leads in ${fw1Wins.length > 0 ? fw1Wins.join(', ') : 'no major categories'}.`;
    }
    return `Both frameworks are evenly matched across most categories. Choose based on team expertise and specific project needs.`;
};
