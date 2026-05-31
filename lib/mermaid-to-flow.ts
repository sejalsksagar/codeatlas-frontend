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
