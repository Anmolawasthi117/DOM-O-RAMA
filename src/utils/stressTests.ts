import type { VNode } from '../core/engine/VDOMSimulator';

export type StressTestType = '10k-list' | 'prop-bomb' | 'deep-nesting' | 'rapid-updates';

export interface StressTestConfig {
    type: StressTestType;
    name: string;
    description: string;
    icon: string;
    generateOldTree: () => VNode;
    generateNewTree: () => VNode;
}

// Generate a list with N items
function generateList(count: number, prefix: string = 'Item'): VNode {
    const children: VNode[] = [];
    for (let i = 0; i < count; i++) {
        children.push({
            tag: 'li',
            props: { key: `${prefix}-${i}` },
            children: [{ tag: 'text', text: `${prefix} ${i + 1}` }]
        });
    }
    return {
        tag: 'ul',
        props: { className: 'stress-list' },
        children
    };
}

// Generate a deeply nested tree
function generateDeepTree(depth: number, current: number = 0): VNode {
    if (current >= depth) {
        return { tag: 'text', text: `Leaf at depth ${depth}` };
    }
    return {
        tag: 'div',
        props: { className: `level-${current}`, 'data-depth': current },
        children: [generateDeepTree(depth, current + 1)]
    };
}

// Generate a wide tree with many siblings
function generateWideTree(width: number, depth: number = 3): VNode {
    const generateLevel = (d: number): VNode[] => {
        if (d <= 0) return [{ tag: 'text', text: 'Leaf' }];
        const children: VNode[] = [];
        for (let i = 0; i < width; i++) {
            children.push({
                tag: 'div',
                props: { key: `node-${d}-${i}` },
                children: generateLevel(d - 1)
            });
        }
        return children;
    };

    return {
        tag: 'div',
        props: { className: 'wide-tree' },
        children: generateLevel(depth)
    };
}

export const stressTests: StressTestConfig[] = [
    {
        type: '10k-list',
        name: '10K List Render',
        description: 'Render and update a list with 10,000 items. Watch the dropped frames meter spike!',
        icon: '📜',
        generateOldTree: () => ({
            tag: 'div',
            props: { className: 'app' },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: '10K List Test' }] },
                generateList(100, 'Old Item') // Start with 100
            ]
        }),
        generateNewTree: () => ({
            tag: 'div',
            props: { className: 'app' },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: '10K List Test - Updated!' }] },
                generateList(10000, 'New Item') // Grow to 10k
            ]
        })
    },
    {
        type: 'prop-bomb',
        name: 'Prop Bomb',
        description: 'Send a single prop change from the top and watch the "Tree of Fire" as every component updates.',
        icon: '💣',
        generateOldTree: () => ({
            tag: 'div',
            props: { className: 'app', theme: 'light' },
            children: [
                { tag: 'header', props: { theme: 'light' }, children: [{ tag: 'text', text: 'Header' }] },
                {
                    tag: 'main',
                    props: { theme: 'light' },
                    children: [
                        { tag: 'section', props: { theme: 'light' }, children: generateList(50, 'Section A Item').children },
                        { tag: 'section', props: { theme: 'light' }, children: generateList(50, 'Section B Item').children },
                        { tag: 'sidebar', props: { theme: 'light' }, children: [{ tag: 'text', text: 'Sidebar' }] }
                    ]
                },
                { tag: 'footer', props: { theme: 'light' }, children: [{ tag: 'text', text: 'Footer' }] }
            ]
        }),
        generateNewTree: () => ({
            tag: 'div',
            props: { className: 'app', theme: 'dark' }, // Theme change cascades!
            children: [
                { tag: 'header', props: { theme: 'dark' }, children: [{ tag: 'text', text: 'Header' }] },
                {
                    tag: 'main',
                    props: { theme: 'dark' },
                    children: [
                        { tag: 'section', props: { theme: 'dark' }, children: generateList(50, 'Section A Item').children },
                        { tag: 'section', props: { theme: 'dark' }, children: generateList(50, 'Section B Item').children },
                        { tag: 'sidebar', props: { theme: 'dark' }, children: [{ tag: 'text', text: 'Sidebar' }] }
                    ]
                },
                { tag: 'footer', props: { theme: 'dark' }, children: [{ tag: 'text', text: 'Footer' }] }
            ]
        })
    },
    {
        type: 'deep-nesting',
        name: 'Deep Nesting',
        description: 'A 100-level deep component tree. Stress tests recursive algorithms.',
        icon: '🪆',
        generateOldTree: () => ({
            tag: 'div',
            props: { className: 'deep-test' },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: 'Deep Nesting Test' }] },
                generateDeepTree(50)
            ]
        }),
        generateNewTree: () => ({
            tag: 'div',
            props: { className: 'deep-test' },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: 'Deep Nesting Test - Deeper!' }] },
                generateDeepTree(100)
            ]
        })
    },
    {
        type: 'rapid-updates',
        name: 'Rapid Updates',
        description: 'Simulate 60fps state changes with a wide tree. Tests batching efficiency.',
        icon: '⚡',
        generateOldTree: () => ({
            tag: 'div',
            props: { className: 'rapid-test', counter: 0 },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: 'Counter: 0' }] },
                generateWideTree(5, 3)
            ]
        }),
        generateNewTree: () => ({
            tag: 'div',
            props: { className: 'rapid-test', counter: 1000 },
            children: [
                { tag: 'h1', children: [{ tag: 'text', text: 'Counter: 1000' }] },
                generateWideTree(5, 3)
            ]
        })
    }
];

export function getStressTest(type: StressTestType): StressTestConfig | undefined {
    return stressTests.find(t => t.type === type);
}
