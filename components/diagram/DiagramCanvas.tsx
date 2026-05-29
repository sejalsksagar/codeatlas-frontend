'use client';

import {
  useCallback,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type OnConnect,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { DiagramNode, DiagramEdge } from '@/types';
import { flowToMermaid } from '@/lib/mermaid-to-flow';

/* ─────────────────────────────────────────────────────────────────────────────
   Editable Node
───────────────────────────────────────────────────────────────────────────── */

interface EditableNodeData extends Record<string, unknown> {
  label: string;
  onLabelChange: (id: string, newLabel: string) => void;
}

function EditableNode({ id, data, selected }: NodeProps) {
  const nodeData = data as EditableNodeData;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nodeData.label as string);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when label prop changes externally
  useEffect(() => {
    if (!editing) setDraft(nodeData.label as string);
  }, [nodeData.label, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitEdit() {
    const trimmed = draft.trim() || (nodeData.label as string);
    setDraft(trimmed);
    nodeData.onLabelChange(id, trimmed);
    setEditing(false);
  }

  function handleDoubleClick(e: ReactMouseEvent) {
    e.stopPropagation();
    setDraft(nodeData.label as string);
    setEditing(true);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { setDraft(nodeData.label as string); setEditing(false); }
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[#00ff88] !border-0 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div
        onDoubleClick={handleDoubleClick}
        className="group"
        style={{
          background: '#1e1e2e',
          border: `1.5px solid ${selected ? '#00ff88' : '#2e2e3e'}`,
          borderRadius: '10px',
          padding: '10px 18px',
          minWidth: '130px',
          maxWidth: '220px',
          boxShadow: selected
            ? '0 0 0 1px #00ff8840, 0 4px 20px #00ff8815'
            : '0 2px 12px rgba(0,0,0,0.5)',
          cursor: editing ? 'text' : 'grab',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 600,
              width: '100%',
              minWidth: '80px',
              textAlign: 'center',
            }}
          />
        ) : (
          <span
            style={{
              color: '#ffffff',
              fontSize: '13px',
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 600,
              display: 'block',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              userSelect: 'none',
            }}
            title="Double-click to rename"
          >
            {nodeData.label as string}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#00ff88] !border-0 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </>
  );
}

const NODE_TYPES: NodeTypes = { editableNode: EditableNode };

/* ─────────────────────────────────────────────────────────────────────────────
   Toolbar Button
───────────────────────────────────────────────────────────────────────────── */
interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  flash?: boolean;
}

function ToolbarButton({ onClick, title, children, variant = 'default', flash }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        border transition-all duration-150
        ${variant === 'accent'
          ? 'border-[#00ff8840] bg-[#00ff8810] text-[#00ff88] hover:bg-[#00ff8820]'
          : 'border-[#2a2a2a] bg-[#161616] text-[#888] hover:text-white hover:border-[#333]'
        }
        ${flash ? 'scale-95' : 'scale-100'}
      `}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Prop → RF node/edge converters
───────────────────────────────────────────────────────────────────────────── */
function toRFNodes(
  propNodes: DiagramNode[],
  onLabelChange: (id: string, label: string) => void
): Node[] {
  return propNodes.map((n) => ({
    id: n.id,
    type: 'editableNode',
    position: n.position,
    data: { label: n.label, onLabelChange },
  }));
}

function toRFEdges(propEdges: DiagramEdge[]): Edge[] {
  return propEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: { stroke: '#3a3a4a', strokeWidth: 1.5 },
    animated: false,
  }));
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
interface DiagramCanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodesChange?: (nodes: DiagramNode[]) => void;
}

export default function DiagramCanvas({ nodes: propNodes, edges: propEdges, onNodesChange }: DiagramCanvasProps) {
  const [copied, setCopied] = useState(false);
  const [flashLayout, setFlashLayout] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Label change handler — needs stable ref so node data doesn't go stale
  const onLabelChangeRef = useRef<(id: string, label: string) => void>(() => {});

  const initialNodes = toRFNodes(propNodes, (...args) => onLabelChangeRef.current(...args));
  const initialEdges = toRFEdges(propEdges);

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-init when props change (e.g. after API response loads)
  useEffect(() => {
    setNodes(toRFNodes(propNodes, (...args) => onLabelChangeRef.current(...args)));
    setEdges(toRFEdges(propEdges));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propNodes, propEdges]);

  // Stable label change callback
  onLabelChangeRef.current = useCallback((id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, label: newLabel, onLabelChange: (...args: [string, string]) => onLabelChangeRef.current(...args) } }
          : n
      )
    );
  }, [setNodes]);

  // Surface changes upstream
  useEffect(() => {
    if (!onNodesChange) return;
    const mapped: DiagramNode[] = nodes.map((n) => ({
      id: n.id,
      label: (n.data.label as string) ?? n.id,
      type: n.type ?? 'editableNode',
      position: n.position,
    }));
    onNodesChange(mapped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // New edge on connect
  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, style: { stroke: '#3a3a4a', strokeWidth: 1.5 } }, eds)
      ),
    [setEdges]
  );

  /* ── Auto Layout ── */
  function handleAutoLayout() {
    setFlashLayout(true);
    setTimeout(() => setFlashLayout(false), 200);

    const ROW_H = 120;
    const CENTER_X = 300;
    const COLUMN_THRESHOLD = 6;
    const COL_X = [180, 480];

    setNodes((nds) =>
      nds.map((n, i) => {
        const useColumns = nds.length > COLUMN_THRESHOLD;
        let x: number, y: number;
        if (useColumns) {
          x = COL_X[i % 2];
          y = Math.floor(i / 2) * ROW_H + 50;
        } else {
          x = CENTER_X;
          y = i * ROW_H + 50;
        }
        return { ...n, position: { x, y } };
      })
    );
  }

  /* ── Export Mermaid ── */
  function handleExportMermaid() {
    const mermaid = flowToMermaid(
      nodes.map((n) => ({ id: n.id, data: { label: (n.data.label as string) ?? n.id } })),
      edges.map((e) => ({ source: e.source, target: e.target }))
    );

    navigator.clipboard.writeText(mermaid).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── Empty state ── */
  if (nodes.length === 0) {
    return (
      <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] flex flex-col items-center justify-center h-[500px] gap-3">
        <div className="text-4xl text-[#00ff88] opacity-15">◈</div>
        <p className="text-sm text-[#333] font-mono">No diagram data yet.</p>
        <p className="text-xs text-[#222] font-mono">Run an analysis to generate an architecture diagram.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 rounded-xl overflow-hidden border border-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          {/* Auto layout */}
          <ToolbarButton onClick={handleAutoLayout} title="Reset node positions to waterfall layout" flash={flashLayout}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="1" width="6" height="4" rx="1" />
              <rect x="9" y="1" width="6" height="4" rx="1" />
              <rect x="5" y="11" width="6" height="4" rx="1" />
              <path d="M4 5v2a4 4 0 004 4h0a4 4 0 004-4V5" />
            </svg>
            Auto Layout
          </ToolbarButton>

          {/* Export Mermaid */}
          <ToolbarButton
            onClick={handleExportMermaid}
            title="Copy Mermaid syntax to clipboard"
            variant={copied ? 'accent' : 'default'}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 8l4 4 8-8" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="10" height="10" rx="1.5" />
                  <path d="M4 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v9a1 1 0 001 1h1" />
                </svg>
                Export Mermaid
              </>
            )}
          </ToolbarButton>
        </div>

        <span className="text-[10px] font-mono text-[#2a2a2a]">
          double-click node to rename · drag to reposition · scroll to zoom
        </span>
      </div>

      {/* Canvas */}
      <div style={{ width: '100%', height: '500px', background: '#0a0a0e' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          defaultEdgeOptions={{
            style: { stroke: '#3a3a4a', strokeWidth: 1.5 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1e1e2e"
          />

          <Controls
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
            showInteractive={false}
          />

          <MiniMap
            style={{
              background: '#0d0d0d',
              border: '1px solid #1e1e1e',
              borderRadius: '8px',
            }}
            nodeColor="#1e1e2e"
            nodeStrokeColor="#3e3e4e"
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
