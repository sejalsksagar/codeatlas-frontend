export interface RepoStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
  infra: string[];
  test_frameworks?: string[];
  package_manager?: string | null;
}

export interface Module {
  name: string;
  path: string;
  description: string;
}

export interface AnalyzeResponse {
  status: string;
  repo: string;
  branch: string;

  stack: RepoStack;
  summary: string;

  modules: Module[];
  entry_points: string[];
  request_flow: string;

  used_fallback: boolean;
}

export interface ApiDiagramNode {
  id: string;
  label: string;
}

export interface ApiDiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowNode {
  id: string;
  data: {
    label: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DiagramResponse {
  status: string;
  repo: string;

  mermaid_source: string;
  nodes: any[];
  edges: any[];

  used_fallback: boolean;
}

export interface Suggestion {
  category: 'security' | 'performance' | 'scalability' | 'quality';
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  file_hint?: string;
}

export interface SuggestionsResponse {
  status: string;
  repo: string;

  suggestions: Suggestion[];

  used_fallback: boolean;
}
