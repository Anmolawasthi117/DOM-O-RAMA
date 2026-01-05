
export type VNodeType = 'element' | 'text';

export interface VNode {
    tag: string; // 'div', 'p', 'text', etc.
    props?: Record<string, any>;
    children?: VNode[];
    key?: string | number;
    text?: string; // only for 'text' nodes
}

export type DiffStepType =
    | 'COMPARING'
    | 'PATCHING'
    | 'MOUNTING'
    | 'UNMOUNTING'
    | 'SKIPPING'
    | 'COMPLETE';

export interface DiffStep {
    type: DiffStepType;
    nodeTag?: string; // for display
    nodeId?: string; // path or id
    message: string;
    details?: any;
    payload?: VNode; // The node data associated with the step
}

export class VDOMSimulator {
    speed: number = 500; // ms

    constructor(initialSpeed: number = 500) {
        this.speed = initialSpeed;
    }

    setSpeed(ms: number) {
        this.speed = ms;
    }

    private async wait() {
        if (this.speed <= 0) return;
        return new Promise(resolve => setTimeout(resolve, this.speed));
    }

    // Async Generator for Diffing
    async *diff(oldNode: VNode | undefined, newNode: VNode | undefined, path: string = 'root'): AsyncGenerator<DiffStep> {

        // Case 1: Unmounting
        if (oldNode && !newNode) {
            yield { type: 'UNMOUNTING', nodeTag: oldNode.tag, nodeId: path, message: `Removing node: ${oldNode.tag}`, payload: oldNode };
            await this.wait();
            return;
        }

        // Case 2: Mounting
        if (!oldNode && newNode) {
            yield { type: 'MOUNTING', nodeTag: newNode.tag, nodeId: path, message: `Mounting new node: ${newNode.tag}`, payload: newNode };
            await this.wait();
            // Drill down for visualization of build up
            if (newNode.children) {
                for (let i = 0; i < newNode.children.length; i++) {
                    yield* this.diff(undefined, newNode.children[i], `${path}.${i}`);
                }
            }
            return;
        }

        // Case 3: Comparison
        if (oldNode && newNode) {
            yield { type: 'COMPARING', nodeTag: oldNode.tag, nodeId: path, message: `Comparing ${oldNode.tag} vs ${newNode.tag}`, payload: newNode };
            await this.wait();

            // Different Types
            if (oldNode.tag !== newNode.tag) {
                yield { type: 'PATCHING', nodeTag: newNode.tag, nodeId: path, message: `Replacing ${oldNode.tag} with ${newNode.tag}`, payload: newNode };
                await this.wait();
                if (newNode.children) {
                    for (let i = 0; i < newNode.children.length; i++) {
                        yield* this.diff(undefined, newNode.children[i], `${path}.${i}`);
                    }
                }
                return;
            }

            // Same tag, check props/text
            if (oldNode.tag === 'text' && newNode.tag === 'text') {
                if (oldNode.text !== newNode.text) {
                    yield { type: 'PATCHING', nodeTag: 'text', nodeId: path, message: `Updating text: "${oldNode.text}" -> "${newNode.text}"`, payload: newNode };
                    await this.wait();
                } else {
                    yield { type: 'SKIPPING', nodeTag: 'text', nodeId: path, message: `Text identical: "${oldNode.text}"`, payload: newNode };
                    await this.wait();
                }
                return;
            }

            const propsChanged = JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props);
            if (propsChanged) {
                yield { type: 'PATCHING', nodeTag: newNode.tag, nodeId: path, message: `Updating props for ${newNode.tag}`, details: { old: oldNode.props, new: newNode.props }, payload: newNode };
                await this.wait();
            }

            // Recursively diff children
            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];
            const maxLength = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLength; i++) {
                yield* this.diff(oldChildren[i], newChildren[i], `${path}.${i}`);
            }
        }
    }
}
