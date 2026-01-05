import { BaseEngine, type EngineStep } from './BaseEngine';
import type { VNode } from './VDOMSimulator';

/**
 * Qwik Engine
 * Simulates Qwik's resumability:
 * - Lazy loading
 * - Serialized state
 * - Zero hydration
 * - Progressive loading
 */
export class QwikResumableEngine extends BaseEngine {
    name = 'Qwik Resumable';
    description = 'Resumable apps with lazy loading and zero hydration';

    private loadedChunks = new Set<string>();

    getFeatures(): string[] {
        return [
            'Resumability',
            'Lazy Loading',
            'Zero Hydration',
            'Progressive Loading',
            'Serialized State'
        ];
    }

    async *diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep> {
        yield {
            type: 'RESUMABLE',
            message: '🌐 Qwik: Server-rendered HTML ready (0kb JS)',
            metadata: { js: '0kb', hydration: false }
        };
        await this.delay();

        yield {
            type: 'RESUMABLE',
            message: '⏸️ App is paused - waiting for interaction...',
            metadata: { state: 'paused' }
        };
        await this.delay();

        // Simulate interaction triggering lazy load
        yield {
            type: 'LAZY_LOAD',
            message: '👆 User interaction detected!',
            metadata: { trigger: 'click' }
        };
        await this.delay();

        yield* this.resumeFromServer(oldTree, newTree, 'root');

        yield {
            type: 'COMPLETE',
            message: '✅ Qwik: Resumed from server state (no full hydration!)',
            metadata: { chunksLoaded: this.loadedChunks.size }
        };
    }

    private async *resumeFromServer(
        oldNode: VNode | undefined,
        newNode: VNode | undefined,
        path: string
    ): AsyncGenerator<EngineStep> {
        if (!oldNode && newNode) {
            // Lazy load the chunk for this node
            const chunkName = `chunk_${newNode.tag}_${path.replace(/\./g, '_')}`;

            if (!this.loadedChunks.has(chunkName)) {
                yield {
                    type: 'LAZY_LOAD',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `📦 import('./${chunkName}.js') - Loading component...`,
                    metadata: { chunk: chunkName }
                };
                await this.delay();

                this.loadedChunks.add(chunkName);

                yield {
                    type: 'RESUMABLE',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `⚡ Resuming <${newNode.tag}> from serialized state`,
                    metadata: { hydrated: false }
                };
                await this.delay();
            }

            yield {
                type: 'MOUNTING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `🔌 Attaching listeners to <${newNode.tag}>`,
                payload: newNode
            };
            await this.delay();

            if (newNode.children) {
                for (let i = 0; i < newNode.children.length; i++) {
                    yield* this.resumeFromServer(undefined, newNode.children[i], `${path}.${i}`);
                }
            }
        } else if (oldNode && !newNode) {
            yield {
                type: 'UNMOUNTING',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `🗑️ Removing <${oldNode.tag}>`
            };
            await this.delay();
        } else if (oldNode && newNode) {
            const hasChanges = oldNode.text !== newNode.text ||
                JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props);

            if (hasChanges) {
                yield {
                    type: 'LAZY_LOAD',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `📥 Fetching update handler for <${newNode.tag}>...`,
                    metadata: { type: 'incremental' }
                };
                await this.delay();

                yield {
                    type: 'PATCHING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `✏️ Applying incremental update to <${newNode.tag}>`
                };
                await this.delay();
            } else {
                yield {
                    type: 'SKIPPING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `💤 <${newNode.tag}> unchanged - no JS needed`,
                    metadata: { reason: 'static' }
                };
                await this.delay();
            }

            // Recurse children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
                yield* this.resumeFromServer(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }
    }
}
