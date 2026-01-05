import { BaseEngine, type EngineStep } from './BaseEngine';
import type { VNode } from './VDOMSimulator';

/**
 * Vue Compiler Engine
 * Simulates Vue's compiler optimizations:
 * - Static hoisting (skip static nodes)
 * - Patch flags (targeted updates)
 * - Block tree optimization
 */
export class VueCompilerEngine extends BaseEngine {
    name = 'Vue Compiler';
    description = 'Compiler-optimized VDOM with static hoisting';

    private staticNodes = new Set<string>();

    getFeatures(): string[] {
        return [
            'Static Hoisting',
            'Patch Flags',
            'Block Tree',
            'Compiler Hints',
            'Template Optimization'
        ];
    }

    async *diff(oldTree: VNode, newTree: VNode): AsyncGenerator<EngineStep> {
        // First pass: identify static nodes
        yield {
            type: 'COMPILE_TIME',
            message: '🔧 Vue Compiler: Analyzing template...',
            metadata: { phase: 'compile' }
        };
        await this.delay();

        this.identifyStaticNodes(newTree, 'root');

        yield {
            type: 'STATIC_HOIST',
            message: `📦 Hoisted ${this.staticNodes.size} static nodes`,
            metadata: { staticCount: this.staticNodes.size }
        };
        await this.delay();

        // Second pass: diff with optimizations
        yield* this.patchWithFlags(oldTree, newTree, 'root');

        yield {
            type: 'COMPLETE',
            message: '✅ Vue optimized patch complete',
            metadata: { skipped: this.staticNodes.size }
        };
    }

    private identifyStaticNodes(node: VNode, path: string): boolean {
        // A node is static if it has no dynamic bindings and all children are static
        const hasNoEvents = !node.props || !Object.keys(node.props).some(k => k.startsWith('@') || k.startsWith('v-'));
        const isTextNode = node.tag === 'text';

        if (isTextNode) {
            this.staticNodes.add(path);
            return true;
        }

        const children = node.children || [];
        const allChildrenStatic = children.every((child, i) =>
            this.identifyStaticNodes(child, `${path}.${i}`)
        );

        if (hasNoEvents && allChildrenStatic && children.length > 0) {
            this.staticNodes.add(path);
            return true;
        }

        return false;
    }

    private async *patchWithFlags(
        oldNode: VNode | undefined,
        newNode: VNode | undefined,
        path: string
    ): AsyncGenerator<EngineStep> {
        // Check if this is a hoisted static node
        if (this.staticNodes.has(path) && oldNode && newNode) {
            yield {
                type: 'SKIPPING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `⚡ Skipping static node <${newNode.tag}> (hoisted)`,
                metadata: { optimization: 'static-hoist' }
            };
            await this.delay();
            return;
        }

        if (!oldNode && newNode) {
            yield {
                type: 'MOUNTING',
                nodeId: path,
                nodeTag: newNode.tag,
                message: `➕ Mounting <${newNode.tag}>`,
                payload: newNode
            };
            await this.delay();
        } else if (oldNode && !newNode) {
            yield {
                type: 'UNMOUNTING',
                nodeId: path,
                nodeTag: oldNode.tag,
                message: `➖ Unmounting <${oldNode.tag}>`
            };
            await this.delay();
        } else if (oldNode && newNode) {
            // Determine patch flag
            const patchFlag = this.getPatchFlag(oldNode, newNode);

            if (patchFlag !== 'NONE') {
                yield {
                    type: 'PATCH_FLAG',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `🏷️ Patch flag: ${patchFlag} on <${newNode.tag}>`,
                    metadata: { flag: patchFlag }
                };   
                await this.delay();

                yield {
                    type: 'PATCHING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `✏️ Applying targeted patch to <${newNode.tag}>`
                };
                await this.delay();
            } else {
                yield {
                    type: 'COMPARING',
                    nodeId: path,
                    nodeTag: newNode.tag,
                    message: `🔍 No changes in <${newNode.tag}>`
                };
                await this.delay();
            }

            // Recurse children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLen = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLen; i++) {
                yield* this.patchWithFlags(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }
    }

    private getPatchFlag(oldNode: VNode, newNode: VNode): string {
        if (oldNode.tag !== newNode.tag) return 'FULL_REPLACE';
        if (oldNode.text !== newNode.text) return 'TEXT';
        if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) return 'PROPS';
        if ((oldNode.children?.length || 0) !== (newNode.children?.length || 0)) return 'CHILDREN';
        return 'NONE';
    }
}
