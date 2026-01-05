import { BaseEngine, type EngineStep } from './BaseEngine';
import type { VNode } from './VDOMSimulator';

/**
 * SolidJS Engine
 * Simulates Solid's fine-grained reactivity:
 * - Signals and effects
 * - No component re-renders
 * - Surgical updates via dependency tracking
 */
export class SolidSignalEngine extends BaseEngine {
    name = 'SolidJS Signals';
    description = 'Fine-grained reactivity with surgical updates';

    private signalGraph: Map<string, string[]> = new Map();

    getFeatures(): string[] {
        return [
            'Fine-grained Reactivity',
            'Signals & Effects',
            'No Component Re-renders',
            'Dependency Tracking',
            'Surgical DOM Updates'
        ];
    }

    async *diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep> {
        yield {
            type: 'COMPILE_TIME',
            message: '🔧 SolidJS: Building reactive dependency graph...',
            metadata: { phase: 'compile' }
        };
        await this.delay();

        // Build signal graph
        this.buildSignalGraph(newTree, 'root');

        yield {
            type: 'SIGNAL_UPDATE',
            message: `📊 Created ${this.signalGraph.size} reactive subscriptions`,
            metadata: { subscriptions: this.signalGraph.size }
        };
        await this.delay();

        // Simulate signal-based updates
        yield* this.trackAndUpdate(oldTree, newTree, 'root');

        yield {
            type: 'COMPLETE',
            message: '✅ SolidJS: Fine-grained updates complete (no VDOM diff!)',
            metadata: { approach: 'signals' }
        };
    }

    private buildSignalGraph(node: VNode, path: string): void {
        // Simulate tracking dependencies
        if (node.text || node.props) {
            this.signalGraph.set(path, ['signal_' + path]);
        }

        if (node.children) {
            node.children.forEach((child, i) => {
                this.buildSignalGraph(child, `${path}.${i}`);
            });
        }
    }

    private async *trackAndUpdate(
        oldNode: VNode | undefined,
        newNode: VNode | undefined,
        path: string
    ): AsyncGenerator<EngineStep> {
        if (!oldNode && newNode) {
            yield {
                type: 'SIGNAL_UPDATE',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `📡 createSignal() → <${newNode.tag}>`,
                metadata: { signal: 'create' }
            };
            await this.delay();

            yield {
                type: 'MOUNTING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `⚡ Mounting reactive node <${newNode.tag}>`,
                payload: newNode
            };
            await this.delay();

            if (newNode.children) {
                for (let i = 0; i < newNode.children.length; i++) {
                    yield* this.trackAndUpdate(undefined, newNode.children[i], `${path}.${i}`);
                }
            }
        } else if (oldNode && !newNode) {
            yield {
                type: 'SIGNAL_UPDATE',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `🔌 Disposing signal for <${oldNode.tag}>`,
                metadata: { signal: 'dispose' }
            };
            await this.delay();

            yield {
                type: 'UNMOUNTING',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `💨 Unmounting <${oldNode.tag}>`
            };
            await this.delay();
        } else if (oldNode && newNode) {
            const hasTextChange = oldNode.text !== newNode.text;
            const hasPropChange = JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props);

            if (hasTextChange || hasPropChange) {
                // Solid's laser-like precision
                yield {
                    type: 'FINE_GRAINED',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `🎯 Signal triggered → Only <${newNode.tag}> updates!`,
                    metadata: { precision: 'surgical' }
                };
                await this.delay();

                yield {
                    type: 'SIGNAL_UPDATE',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `💫 setSignal() → DOM updated (no re-render!)`,
                    metadata: { operation: 'update' }
                };
                await this.delay();
            } else {
                yield {
                    type: 'SKIPPING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `✨ No signal change for <${newNode.tag}> - skipped`,
                    metadata: { reason: 'unchanged' }
                };
                await this.delay();
            }

            // Recurse children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
                yield* this.trackAndUpdate(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }
    }
}
