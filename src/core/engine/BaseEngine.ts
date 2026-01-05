import type { VNode } from './VDOMSimulator';

// Base types for all engines
export type StepType =
    | 'COMPARING'
    | 'PATCHING'
    | 'MOUNTING'
    | 'UNMOUNTING'
    | 'SKIPPING'
    | 'COMPLETE'
    // React Fiber specific
    | 'FIBER_BEGIN_WORK'
    | 'FIBER_COMPLETE_WORK'
    | 'FIBER_COMMIT'
    | 'FIBER_PAUSE'
    | 'FIBER_RESUME'
    // Vue specific
    | 'STATIC_HOIST'
    | 'PATCH_FLAG'
    // Svelte specific
    | 'DIRECT_UPDATE'
    | 'COMPILE_TIME'
    // Solid specific
    | 'SIGNAL_UPDATE'
    | 'FINE_GRAINED'
    // Qwik specific
    | 'RESUMABLE'
    | 'LAZY_LOAD';

export interface EngineStep {
    type: StepType;
    nodeId?: string;
    nodeTag?: string;
    message: string;
    payload?: VNode;
    metadata?: Record<string, any>;
}

export interface FrameworkEngine {
    name: string;
    description: string;
    diff: (oldTree: VNode, newTree: VNode) => AsyncGenerator<EngineStep>;
    setSpeed: (ms: number) => void;
    getFeatures: () => string[];
}

// Base engine class with common functionality
export abstract class BaseEngine implements FrameworkEngine {
    protected speed: number;
    abstract name: string;
    abstract description: string;

    constructor(speed: number = 500) {
        this.speed = speed;
    }

    setSpeed(ms: number): void {
        this.speed = ms;
    }

    protected delay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.speed));
    }

    abstract diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep>;
    abstract getFeatures(): string[];
}
