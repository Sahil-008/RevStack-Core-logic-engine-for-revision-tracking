import React, { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Cpu } from 'lucide-react';

interface ReactFlowMemoryGraphProps {
  vcsState: any;
}

// SIMULATE C++ MEMORY ADDRESSES
const getMemoryAddress = (id: string | number) => {
  if (typeof id === 'string') {
    const parsed = parseInt(id);
    if (!isNaN(parsed)) {
      return `0x${(parsed * 65536).toString(16).toUpperCase()}`;
    }
    // Hash string if it's not a number
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `0x${Math.abs(hash % 1048576).toString(16).toUpperCase()}`;
  }
  return `0x${(id * 65536).toString(16).toUpperCase()}`;
};

// 1. CUSTOM NODE: HEAP COMMIT NODE
const HeapCommitNode = ({ data }: any) => {
  const address = getMemoryAddress(data.id);
  const isHead = data.isHead;

  // File hashes for visual flair
  const getFileHash = (content: string) => {
    return Math.floor(content.length * 997).toString(16).toUpperCase();
  };

  return (
    <div
      className={`min-w-[240px] max-w-[280px] bg-neutral-950/90 border rounded-xl overflow-hidden shadow-2xl font-mono text-[11px] transition-all duration-300 ${
        isHead
          ? 'border-primary shadow-primary/20 ring-1 ring-primary/30'
          : 'border-glass-border hover:border-neutral-700'
      }`}
    >
      {/* Node Header (Simulated C++ Type info and Address) */}
      <div
        className={`px-3 py-1.5 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider ${
          isHead ? 'bg-primary/25 text-white' : 'bg-neutral-900 text-neutral-400'
        }`}
      >
        <span className="flex items-center space-x-1.5">
          <Database className="w-3 h-3 text-cyanAccent" />
          <span>Commit*</span>
        </span>
        <span className="text-emerald-400 select-all">{address}</span>
      </div>

      {/* Node body (Struct member variables) */}
      <div className="p-3.5 space-y-3">
        {/* Basic fields */}
        <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-white/5">
          <div className="flex justify-between">
            <span className="text-neutral-500">commitID:</span>
            <span className="text-white font-bold">{data.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">branch:</span>
            <span className="text-purpleAccent">{data.branch}</span>
          </div>
          <div className="text-[10px] text-neutral-400 truncate mt-1 italic">
            "{data.message}"
          </div>
        </div>

        {/* files map */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-neutral-500 border-b border-glass-border/40 pb-1">
            <span>files (std::unordered_map)</span>
            <span>{Object.keys(data.files).length} items</span>
          </div>
          <div className="max-h-[80px] overflow-y-auto space-y-1.5 pr-1 pt-1">
            {Object.keys(data.files).length === 0 ? (
              <span className="text-neutral-600 italic block text-center">empty</span>
            ) : (
              Object.entries(data.files).map(([filename, content]) => (
                <div key={filename} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-[10px]">
                  <span className="text-cyanAccent truncate max-w-[120px]">{filename}</span>
                  <span className="text-[9px] text-neutral-500">hash: {getFileHash(content as string)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* parents list */}
        <div className="space-y-1">
          <div className="text-[10px] text-neutral-500 border-b border-glass-border/40 pb-1">
            <span>parents (std::vector&lt;Commit*&gt;)</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {data.parents && data.parents.length > 0 ? (
              data.parents.map((pId: string) => (
                <span
                  key={pId}
                  className="bg-neutral-900 border border-glass-border text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-bold"
                >
                  {getMemoryAddress(pId)}
                </span>
              ))
            ) : (
              <span className="text-neutral-600 italic text-[10px]">nullptr (Root)</span>
            )}
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} id="target-ptr" className="!w-2 !h-2 !bg-primary/80" />
      <Handle type="source" position={Position.Right} id="source-parent" className="!w-2 !h-2 !bg-cyanAccent/80" />
      <Handle type="target" position={Position.Top} id="target-head" className="!w-2 !h-2 !bg-white" />
    </div>
  );
};

// 2. CUSTOM NODE: STACK ELEMENT NODE
const StackSlotNode = ({ data }: any) => {
  return (
    <div className="w-[170px] bg-neutral-950/80 border border-glass-border rounded-lg overflow-hidden font-mono text-[11px] shadow-lg hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-center bg-neutral-900/60 border-b border-glass-border px-2.5 py-1 text-[9px] uppercase font-bold text-neutral-400">
        <span>Slot [{data.index}]</span>
        <span className="text-neutral-500">{data.stackName}</span>
      </div>
      <div className="p-2 flex justify-between items-center bg-black/30">
        <span className="text-neutral-500">val (Commit*):</span>
        <span className="text-primary font-bold">{getMemoryAddress(data.commitId)}</span>
      </div>
      <Handle type="source" position={Position.Right} id="source-stack" className="!w-2 !h-2 !bg-primary/80" />
    </div>
  );
};

// 3. CUSTOM NODE: REGISTER POINTER NODE
const RegisterNode = ({ data }: any) => {
  const isHead = data.name === 'HEAD';
  return (
    <div
      className={`min-w-[130px] bg-neutral-950/90 border rounded-full px-4 py-2 flex items-center justify-between font-mono text-xs shadow-glow-primary/5 ${
        isHead ? 'border-primary/60 shadow-md ring-1 ring-primary/20' : 'border-purpleAccent/60'
      }`}
    >
      <div className="flex flex-col">
        <span className={`text-[9px] uppercase tracking-widest font-bold ${isHead ? 'text-primary' : 'text-purpleAccent'}`}>
          {data.name} Register
        </span>
        <span className="text-white font-bold text-[11px] mt-0.5">
          {data.targetAddress || 'nullptr'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} id="source-ptr" className="!w-2 !h-2 !bg-primary/80" />
    </div>
  );
};

// Node Types Registry
const nodeTypes = {
  commitNode: HeapCommitNode,
  stackSlotNode: StackSlotNode,
  registerNode: RegisterNode,
};

export const ReactFlowMemoryGraph: React.FC<ReactFlowMemoryGraphProps> = ({ vcsState }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (!vcsState) return;

    const { commitMap, undoStack, redoStack, branches, currentBranchName, headId } = vcsState;

    const newNodes: any[] = [];
    const newEdges: any[] = [];

    // 1. HEAD Register Node
    const headAddress = headId ? getMemoryAddress(headId) : 'nullptr';
    newNodes.push({
      id: 'reg-head',
      type: 'registerNode',
      position: { x: 420, y: 30 },
      data: { name: 'HEAD', targetAddress: headAddress },
    });

    // Link HEAD Register to Commit
    if (headId) {
      newEdges.push({
        id: 'edge-head-to-commit',
        source: 'reg-head',
        target: `commit-${headId}`,
        targetHandle: 'target-head',
        animated: true,
        style: { stroke: '#FF6B00', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FF6B00' },
      });
    }

    // 2. Branch Pointer Registers
    branches.forEach((b: any, index: number) => {
      const bAddress = b.headId ? getMemoryAddress(b.headId) : 'nullptr';
      const xPos = 580 + index * 170;

      newNodes.push({
        id: `reg-branch-${b.name}`,
        type: 'registerNode',
        position: { x: xPos, y: 30 },
        data: { name: b.name, targetAddress: bAddress },
      });

      // Link Branch Register to Commit
      if (b.headId) {
        const isBranchActive = b.name === currentBranchName;
        newEdges.push({
          id: `edge-branch-${b.name}-to-commit`,
          source: `reg-branch-${b.name}`,
          target: `commit-${b.headId}`,
          targetHandle: 'target-head',
          animated: isBranchActive,
          style: {
            stroke: isBranchActive ? '#8A5CFF' : 'rgba(255,255,255,0.25)',
            strokeWidth: 2,
            strokeDasharray: isBranchActive ? '0' : '4 4',
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isBranchActive ? '#8A5CFF' : 'rgba(255,255,255,0.25)' },
        });
      }
    });

    // 3. Stacks Header Labels
    newNodes.push({
      id: 'label-undo-stack',
      position: { x: 50, y: 130 },
      data: {
        label: (
          <div className="text-center font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            std::stack&lt;Commit*&gt; <span className="text-primary font-semibold block mt-0.5">undoStack</span>
          </div>
        ),
      },
      style: { width: 170 },
    });

    newNodes.push({
      id: 'label-redo-stack',
      position: { x: 240, y: 130 },
      data: {
        label: (
          <div className="text-center font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            std::stack&lt;Commit*&gt; <span className="text-cyanAccent font-semibold block mt-0.5">redoStack</span>
          </div>
        ),
      },
      style: { width: 170 },
    });

    // 4. Undo Stack Slots
    undoStack.forEach((cId: string, index: number) => {
      newNodes.push({
        id: `undo-slot-${index}`,
        type: 'stackSlotNode',
        position: { x: 50, y: 170 + index * 65 },
        data: { index, commitId: cId, stackName: 'Undo' },
      });

      // Link slot pointer to target commit node on the Heap
      newEdges.push({
        id: `edge-undo-${index}-to-commit`,
        source: `undo-slot-${index}`,
        target: `commit-${cId}`,
        targetHandle: 'target-ptr',
        animated: true,
        style: { stroke: 'rgba(255, 107, 0, 0.45)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255, 107, 0, 0.45)' },
      });
    });

    // 5. Redo Stack Slots
    redoStack.forEach((cId: string, index: number) => {
      newNodes.push({
        id: `redo-slot-${index}`,
        type: 'stackSlotNode',
        position: { x: 240, y: 170 + index * 65 },
        data: { index, commitId: cId, stackName: 'Redo' },
      });

      // Link slot pointer to target commit node on the Heap
      newEdges.push({
        id: `edge-redo-${index}-to-commit`,
        source: `redo-slot-${index}`,
        target: `commit-${cId}`,
        targetHandle: 'target-ptr',
        animated: true,
        style: { stroke: 'rgba(44, 230, 255, 0.45)', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(44, 230, 255, 0.45)' },
      });
    });

    // 6. Heap Commit Node allocation
    const branchColMapping: Record<string, number> = { main: 0 };
    let colCounter = 1;
    branches.forEach((b: any) => {
      if (b.name !== 'main') {
        branchColMapping[b.name] = colCounter;
        colCounter++;
      }
    });

    const commits = Object.values(commitMap) as any[];
    commits.forEach((commit, idx) => {
      const col = branchColMapping[commit.branch] ?? 0;
      const xPos = 460 + col * 320;
      const yPos = 170 + idx * 165;

      newNodes.push({
        id: `commit-${commit.id}`,
        type: 'commitNode',
        position: { x: xPos, y: yPos },
        data: {
          id: commit.id,
          message: commit.message,
          files: commit.files,
          parents: commit.parents,
          branch: commit.branch,
          isHead: commit.id === headId,
        },
      });

      // Draw pointer from Commit to parent Commits on the Heap
      commit.parents.forEach((parentId: string) => {
        let edgeColor = '#FF6B00';
        if (commit.branch === 'dev') edgeColor = '#8A5CFF';
        else if (commit.branch !== 'main') edgeColor = '#2CE6FF';

        newEdges.push({
          id: `edge-commit-${commit.id}-to-parent-${parentId}`,
          source: `commit-${commit.id}`,
          target: `commit-${parentId}`,
          sourceHandle: 'source-parent',
          targetHandle: 'target-ptr',
          style: { stroke: edgeColor, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [vcsState]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="w-full h-full"
      >
        <Background color="#222" gap={20} size={1.2} />
        <Controls className="!bg-neutral-900 !border-glass-border !text-neutral-300" />
      </ReactFlow>

      {/* Heap Memory Indicator */}
      <div className="absolute bottom-4 right-4 bg-neutral-950/80 border border-glass-border rounded-lg p-3 backdrop-blur font-mono text-[10px] space-y-1.5 text-neutral-400 select-none z-10 pointer-events-none">
        <div className="flex items-center text-emerald-400 font-bold uppercase tracking-wider mb-1">
          <Cpu className="w-3.5 h-3.5 mr-1.5" /> Simulated C++ Heap Allocations
        </div>
        <div>Heap Addresses: 0x5F0000 - 0x9FFFFF</div>
        <div>Pointers resolve to Heap memory cells dynamically.</div>
      </div>
    </div>
  );
};
