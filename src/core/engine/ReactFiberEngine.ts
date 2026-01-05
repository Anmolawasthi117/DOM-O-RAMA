import { BaseEngine, type EngineStep } from './BaseEngine';
import type { VNode } from './VDOMSimulator';

/**
 * React Fiber Engine
 * Simulates React's Fiber reconciliation with:
 * - Time slicing (can pause/resume work)
 * - Work loop
 * - Priority lanes
 * - Interruptible rendering
 */
export class ReactFiberEngine extends BaseEngine {
    name = 'React Fiber';
    description = 'Time-sliced reconciliation with interruptible rendering';

    private workCounter = 0;
    private maxWorkPerFrame = 5; // Simulate time slicing

    getFeatures(): string[] {
        return [
            'Time Slicing',
            'Fiber Work Loop',
            'Interruptible Rendering',
            'Priority Lanes',
            'Concurrent Mode'
        ];
    }

    async *diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep> {
        this.workCounter = 0;
        yield* this.beginWork(oldTree, newTree, 'root');

        yield {
            type: 'FIBER_COMMIT',
            message: '🔄 Committing all changes to DOM',
            metadata: { phase: 'commit' }
        };
        await this.delay();

        yield {
            type: 'COMPLETE',
            message: '✅ React Fiber reconciliation complete',
            metadata: { totalWork: this.workCounter }
        };
    }

    private async *beginWork(
        oldNode: VNode | undefined,
        newNode: VNode | undefined,
        path: string
    ): AsyncGenerator<EngineStep> {
        // Check if we need to yield to browser (time slicing simulation)
        this.workCounter++;
        if (this.workCounter % this.maxWorkPerFrame === 0) {
            yield {
                type: 'FIBER_PAUSE',
                nodeId: path,
                message: '⏸️ Yielding to browser (Time Slice)',
                metadata: { workDone: this.workCounter }
            };
            await this.delay();

            yield {
                type: 'FIBER_RESUME',
                nodeId: path,
                message: '▶️ Resuming work loop',
                metadata: { remainingWork: 'unknown' }
            };
            await this.delay();
        }

        // Begin work on this fiber
        yield {
            type: 'FIBER_BEGIN_WORK',
            nodeId: path,
            nodeTag: newNode?.tag || oldNode?.tag,
            message: `📦 beginWork() on <${newNode?.tag || oldNode?.tag}>`,
            metadata: { phase: 'render' }
        };
        await this.delay();

        // Handle different reconciliation cases
        if (!oldNode && newNode) {
            yield {
                type: 'MOUNTING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `➕ Mounting new fiber <${newNode.tag}>`,
                payload: newNode
            };
            await this.delay();
        } else if (oldNode && !newNode) {
            yield {
                type: 'UNMOUNTING',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `➖ Unmounting fiber <${oldNode.tag}>`
            };
            await this.delay();
        } else if (oldNode && newNode) {
            if (oldNode.tag !== newNode.tag) {
                yield {
                    type: 'UNMOUNTING',
                    nodeId: path,
                    nodeTag: oldNode.tag,
                    message: `🔄 Replace fiber <${oldNode.tag}> → <${newNode.tag}>`
                };
                await this.delay();

                yield {
                    type: 'MOUNTING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `➕ Mount replacement <${newNode.tag}>`,
                    payload: newNode
                };
                await this.delay();
            } else {
                // Same tag - compare props/children
                const hasChanges = JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props) ||
                    JSON.stringify(oldNode.text) !== JSON.stringify(newNode.text);

                if (hasChanges) {
                    yield {
                        type: 'PATCHING',
                        nodeId: path,
                        nodeTag: newNode.tag,
                        message: `✏️ Patching fiber <${newNode.tag}> props/text`
                    };
                    await this.delay();
                } else {
                    yield {
                        type: 'COMPARING',
                        nodeId: path,
                        nodeTag: newNode.tag,
                        message: `🔍 Comparing fiber <${newNode.tag}> - no changes`
                    };
                    await this.delay();
                }
            }

            // Reconcile children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
                yield* this.beginWork(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }

        // Complete work
        yield {
            type: 'FIBER_COMPLETE_WORK',
            nodeId: path,
            nodeTag: newNode?.tag || oldNode?.tag,
            message: `✓ completeWork() on <${newNode?.tag || oldNode?.tag}>`,
            metadata: { phase: 'render' }
        };
        await this.delay();
    }
}
