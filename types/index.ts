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
  repo_name: string;
  stack: RepoStack;
  summary: string;
  modules: Module[];
  entry_points: string[];
  request_flow: string;
  ai_used: boolean;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
}

export interface DiagramResponse {
  mermaid_source: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  ai_used: boolean;
}

export interface Suggestion {
  category: 'security' | 'performance' | 'scalability' | 'quality';
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  file_hint?: string;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  ai_used: boolean;
}
