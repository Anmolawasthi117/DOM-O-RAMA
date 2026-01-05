import type { FrameworkEngine } from './BaseEngine';
import { ReactFiberEngine } from './ReactFiberEngine';
import { VueCompilerEngine } from './VueCompilerEngine';
import { SvelteEngine } from './SvelteEngine';
import { SolidSignalEngine } from './SolidSignalEngine';
import { QwikResumableEngine } from './QwikResumableEngine';
import type { Framework } from '../../stores/appStore';

// Factory function to get the appropriate engine
export function getEngine(framework: Framework, speed: number = 500): FrameworkEngine {
    switch (framework) {
        case 'react':
            return new ReactFiberEngine(speed);
        case 'vue':
            return new VueCompilerEngine(speed);
        case 'svelte':
            return new SvelteEngine(speed);
        case 'solid':
            return new SolidSignalEngine(speed);
        case 'qwik':
            return new QwikResumableEngine(speed);
        default:
            return new ReactFiberEngine(speed);
    }
}

// Export all engines for direct use
export { ReactFiberEngine } from './ReactFiberEngine';
export { VueCompilerEngine } from './VueCompilerEngine';
export { SvelteEngine } from './SvelteEngine';
export { SolidSignalEngine } from './SolidSignalEngine';
export { QwikResumableEngine } from './QwikResumableEngine';
export type { FrameworkEngine, EngineStep } from './BaseEngine';
