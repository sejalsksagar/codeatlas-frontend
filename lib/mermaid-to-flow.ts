import type { DiagramNode, DiagramEdge } from '@/types';

/**
 * Parse a "graph TD" Mermaid string into React Flow nodes and edges.
 *
 * Handles these Mermaid line shapes:
 *   A --> B
 *   A[Label] --> B[Label]
 *   A[Label] --> B[(Label)]   (cylinder / DB node)
 *   A -->|edge label| B
 *   subgraph / end lines are skipped
 */
export function mermaidToFlow(mermaid: string): {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} {
  const nodeMap = new Map<string, string>();   // id → label
  const edgeList: Array<{ source: string; target: string }> = [];

  // Strip the "graph TD" / "graph LR" header and subgraph lines
  const lines = mermaid
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/^graph\s+(TD|LR|BT|RL)/i.test(l))
    .filter((l) => !/^subgraph/i.test(l))
    .filter((l) => l !== 'end');

  // Regex to extract a node's id and optional label from a Mermaid node token.
  // Matches:
  //   A                  → id=A, label=A
  //   A[My Label]        → id=A, label=My Label
  //   A(My Label)        → id=A, label=My Label
  //   A[(DB)]            → id=A, label=DB
  //   A{Decision}        → id=A, label=Decision
  //   A((Circle))        → id=A, label=Circle
  function parseNodeToken(token: string): { id: string; label: string } | null {
    token = token.trim();
    if (!token) return null;

    // With brackets: id[label], id(label), id{label}, id[(label)], id((label))
    const bracketMatch = token.match(/^([\w-]+)\s*[\[({]+(.*?)[\])}]+$/);
    if (bracketMatch) {
      return { id: bracketMatch[1].trim(), label: bracketMatch[2].trim() };
    }

    // Plain identifier with no brackets
    const plainMatch = token.match(/^([\w-]+)$/);
    if (plainMatch) {
      return { id: plainMatch[1], label: plainMatch[1] };
    }

    return null;
  }

  // Edge line: A --> B  or  A[Label] -->|text| B[Label]
  // Capture everything before and after the arrow
  const edgeRegex = /^(.+?)\s*-[-.]->?\s*(?:\|[^|]*\|\s*)?(.+)$/;

  for (const line of lines) {
    const edgeMatch = line.match(edgeRegex);
    if (!edgeMatch) continue;

    const sourceToken = edgeMatch[1].trim();
    const targetToken = edgeMatch[2].trim();

    const sourceParsed = parseNodeToken(sourceToken);
    const targetParsed = parseNodeToken(targetToken);

    if (!sourceParsed || !targetParsed) continue;

    // Register nodes (first definition wins for label)
    if (!nodeMap.has(sourceParsed.id)) {
      nodeMap.set(sourceParsed.id, sourceParsed.label);
    }
    if (!nodeMap.has(targetParsed.id)) {
      nodeMap.set(targetParsed.id, targetParsed.label);
    }

    edgeList.push({ source: sourceParsed.id, target: targetParsed.id });
  }

  // Also parse standalone node definitions (lines with no arrow)
  for (const line of lines) {
    if (edgeRegex.test(line)) continue;
    const parsed = parseNodeToken(line);
    if (parsed && !nodeMap.has(parsed.id)) {
      nodeMap.set(parsed.id, parsed.label);
    }
  }

  // Build topological order so the waterfall layout flows top-to-bottom naturally
  // Simple approach: BFS from root nodes (nodes with no incoming edges)
  const allIds = Array.from(nodeMap.keys());
  const hasIncoming = new Set(edgeList.map((e) => e.target));
  const roots = allIds.filter((id) => !hasIncoming.has(id));

  const orderedIds: string[] = [];
  const visited = new Set<string>();

  function bfs(startIds: string[]) {
    const queue = [...startIds];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      orderedIds.push(id);
      const children = edgeList.filter((e) => e.source === id).map((e) => e.target);
      queue.push(...children);
    }
  }

  bfs(roots.length > 0 ? roots : allIds.slice(0, 1));
  // Any nodes not reachable from roots
  allIds.forEach((id) => { if (!visited.has(id)) { visited.add(id); orderedIds.push(id); } });

  // Assign positions — stagger into two columns for wider graphs
  const COLUMN_THRESHOLD = 6;
  const useColumns = orderedIds.length > COLUMN_THRESHOLD;
  const COL_X = [180, 480];
  const ROW_H = 120;
  const CENTER_X = 300;

  const nodes: DiagramNode[] = orderedIds.map((id, i) => {
    let x: number;
    let y: number;

    if (useColumns) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      x = COL_X[col];
      y = row * ROW_H + 50;
    } else {
      x = CENTER_X;
      y = i * ROW_H + 50;
    }

    return {
      id,
      label: nodeMap.get(id) ?? id,
      type: 'editableNode',
      position: { x, y },
    };
  });

  const edges: DiagramEdge[] = edgeList.map((e, i) => ({
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
  }));

  return { nodes, edges };
}

/**
 * Generate Mermaid "graph TD" syntax from React Flow nodes and edges.
 */
export function flowToMermaid(
  nodes: Array<{ id: string; data: { label: string } }>,
  edges: Array<{ source: string; target: string }>
): string {
  const labelMap = new Map(nodes.map((n) => [n.id, n.data.label ?? n.id]));

  const safeLabel = (id: string) => {
    const label = labelMap.get(id) ?? id;
    // Escape brackets in labels
    return label.replace(/[\[\](){}]/g, '');
  };

  const nodeLines = nodes.map((n) => `  ${n.id}[${safeLabel(n.id)}]`);
  const edgeLines = edges.map((e) => `  ${e.source} --> ${e.target}`);

  return ['graph TD', ...nodeLines, ...edgeLines].join('\n');
}
