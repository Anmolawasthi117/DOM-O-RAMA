import { BaseEngine, type EngineStep } from './BaseEngine';
import type { VNode } from './VDOMSimulator';

/**
 * Svelte Engine
 * Simulates Svelte's "No VDOM" approach:
 * - Compile-time analysis
 * - Direct DOM mutations
 * - No runtime diffing
 */
export class SvelteEngine extends BaseEngine {
    name = 'Svelte';
    description = 'No Virtual DOM - Direct surgical updates';

    getFeatures(): string[] {
        return [
            'No Virtual DOM',
            'Compile-time Reactivity',
            'Surgical DOM Updates',
            'Zero Runtime Overhead',
            'Code Generation'
        ];
    }

    async *diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep> {
        yield {
            type: 'COMPILE_TIME',
            message: '🔧 Svelte: Compiling component to imperative code...',
            metadata: { phase: 'compile' }
        };
        await this.delay();

        yield {
            type: 'COMPILE_TIME',
            message: '📝 Generated: create_fragment(), mount(), update(), destroy()',
            metadata: { functions: ['create_fragment', 'mount', 'update', 'destroy'] }
        };
        await this.delay();

        // Svelte doesn't diff - it directly updates
        yield* this.generateDirectUpdates(oldTree, newTree, 'root');

        yield {
            type: 'COMPLETE',
            message: '✅ Svelte: All DOM updates applied directly (no VDOM!)',
            metadata: { approach: 'compile-time' }
        };
    }

    private async *generateDirectUpdates(
        oldNode: VNode | undefined,
        newNode: VNode | undefined,
        path: string
    ): AsyncGenerator<EngineStep> {
        if (!oldNode && newNode) {
            // Create fragment
            yield {
                type: 'DIRECT_UPDATE',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `🎯 DOM.createElement('${newNode.tag}')`,
                metadata: { operation: 'create' }
            };
            await this.delay();

            yield {
                type: 'MOUNTING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `📌 parent.appendChild(${newNode.tag}_node)`,
                payload: newNode
            };
            await this.delay();

            // Create children
            if (newNode.children) {
                for (let i = 0; i < newNode.children.length; i++) {
                    yield* this.generateDirectUpdates(undefined, newNode.children[i], `${path}.${i}`);
                }
            }
        } else if (oldNode && !newNode) {
            yield {
                type: 'DIRECT_UPDATE',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `🎯 ${oldNode.tag}_node.remove()`,
                metadata: { operation: 'remove' }
            };
            await this.delay();

            yield {
                type: 'UNMOUNTING',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `🗑️ Destroyed ${oldNode.tag} fragment`
            };
            await this.delay();
        } else if (oldNode && newNode) {
            // Check for text changes
            if (oldNode.text !== newNode.text && newNode.text) {
                yield {
                    type: 'DIRECT_UPDATE',
                    nodeId: path,
                    nodeTag: 'text',
                    message: `🎯 text_node.data = "${newNode.text.slice(0, 20)}..."`,
                    metadata: { operation: 'set_text' }
                };
                await this.delay();
            }

            // Check for prop changes
            if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) {
                const changedProps = Object.keys(newNode.props || {});
                for (const prop of changedProps.slice(0, 2)) {
                    yield {
                        type: 'DIRECT_UPDATE',
                        nodeId: path,
                        nodeTag: newNode.tag,
                        message: `🎯 ${newNode.tag}_node.${prop} = "${(newNode.props as any)[prop]}"`,
                        metadata: { operation: 'set_prop', prop }
                    };
                    await this.delay();
                }
            }

            // Recurse children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
                yield* this.generateDirectUpdates(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }
    }
}
