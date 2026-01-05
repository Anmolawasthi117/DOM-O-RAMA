import { useEffect, useMemo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { VNode, DiffStep } from '../core/engine/VDOMSimulator';
import { getLayoutedElements } from '../utils/layout';
import { CustomNode } from './CustomNode';
import { useAppStore } from '../stores/appStore';

const nodeTypes = {
  custom: CustomNode,
};

interface TreeVisualizerProps {
  currentStep: DiffStep | null;
  tree: VNode;
  reset: boolean;
}

const buildGraphFromVNode = (root: VNode | undefined): { nodes: Node[], edges: Edge[] } => {
    if (!root) return { nodes: [], edges: [] };
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const traverse = (node: VNode, parentId: string | undefined, path: string) => {
       const id = path;
       nodes.push({
         id,
         type: 'custom',
         data: { label: node.tag, status: 'idle' },
         position: { x: 0, y: 0 }
       });

       if (parentId) {
         edges.push({
           id: `${parentId}-${id}`,
           source: parentId,
           target: id,
           type: 'smoothstep',
           animated: false,
           style: { stroke: 'var(--border-secondary)', strokeWidth: 2 },
           markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-secondary)' }
         });
       }

       if (node.children) {
         node.children.forEach((child, index) => {
            traverse(child, id, `${path}.${index}`);
         });
       }
    };

    traverse(root, undefined, 'root');
    return { nodes, edges };
};

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ currentStep, tree, reset }) => {
  const { appTheme } = useAppStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (reset) {
        const { nodes: initialNodes, edges: initialEdges } = buildGraphFromVNode(tree);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }
  }, [tree, reset, setNodes, setEdges]);
  
  useEffect(() => {
    if (!currentStep) return;

    setNodes((nds) => {
        return nds.map((node) => {
           const isTarget = node.id === currentStep.nodeId;
           let status = 'idle';
           if (isTarget) {
               switch (currentStep.type) {
                   case 'COMPARING': status = 'comparing'; break;
                   case 'PATCHING': status = 'patching'; break;
                   case 'MOUNTING': status = 'mounting'; break;
                   case 'UNMOUNTING': status = 'unmounting'; break;
                   default: status = 'idle';
               }
           }
           return { ...node, data: { ...node.data, status } }; 
        });
    });

    if (currentStep.type === 'MOUNTING' && currentStep.payload && currentStep.nodeId) {
        setNodes(currNodes => {
            const exists = currNodes.some(n => n.id === currentStep.nodeId);
            if (exists) return currNodes;

             const newNode: Node = {
                id: currentStep.nodeId!,
                type: 'custom',
                data: { label: currentStep.payload!.tag, status: 'mounting' },
                position: { x: 0, y: 0 } 
            };
            
            return [...currNodes, newNode];
        });

        setEdges(currEdges => {
            if (!currentStep.nodeId) return currEdges;
            const lastDotIndex = currentStep.nodeId.lastIndexOf('.');
            if (lastDotIndex === -1) return currEdges;

            const parentId = currentStep.nodeId.substring(0, lastDotIndex);
            
             const exists = currEdges.some(e => e.id === `${parentId}-${currentStep.nodeId}`);
             if (exists) return currEdges;

             const newEdge: Edge = {
                id: `${parentId}-${currentStep.nodeId}`,
                source: parentId,
                target: currentStep.nodeId!,
                type: 'smoothstep',
                style: { stroke: 'var(--border-secondary)', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-secondary)' }
            };
            return [...currEdges, newEdge];
        });
    }

  }, [currentStep, setNodes, setEdges]);

  const defaultEdgeOptions = useMemo(() => ({ type: 'smoothstep' }), []);
  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypesMemo}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background 
          color={appTheme === 'dark' ? '#1e293b' : '#cbd5e1'} 
          gap={20} 
          size={1} 
        />
        <Controls className="!bg-[var(--bg-secondary)] !border-[var(--border-primary)] !rounded-lg !shadow-lg [&>button]:!bg-[var(--bg-tertiary)] [&>button]:!border-[var(--border-primary)] [&>button]:hover:!bg-[var(--border-primary)] [&>button>svg]:!fill-[var(--text-secondary)]" />
      </ReactFlow>
    </div>
  );
};
