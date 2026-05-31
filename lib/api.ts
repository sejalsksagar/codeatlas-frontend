import type { AnalyzeResponse, DiagramResponse, Module, RepoStack, SuggestionsResponse } from '@/types';
import { getMockAnalyze, getMockDiagram, getMockSuggestions } from './mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Flag stored in sessionStorage so analyze page can read it too ────────────
const DEMO_KEY = 'codeatlas:demo_mode';

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DEMO_KEY) === 'true';
}

function setDemoMode(on: boolean) {
  if (typeof window === 'undefined') return;
  on
    ? sessionStorage.setItem(DEMO_KEY, 'true')
    : sessionStorage.removeItem(DEMO_KEY);
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function fetchJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // Short timeout so demo mode kicks in quickly rather than hanging
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) message = err.detail;
      else if (err?.error) message = err.error;
      else if (typeof err === 'string') message = err;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── Returns true when the error is "backend unreachable" (not a 4xx/5xx) ────
function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = err.name;
  const msg  = err.message.toLowerCase();
  return (
    name === 'AbortError'       ||   // our 8-second timeout
    name === 'TimeoutError'     ||   // AbortSignal.timeout
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('network request failed') ||
    msg.includes('fetch')
  );
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function analyzeRepo(repoUrl: string): Promise<AnalyzeResponse> {
  try {
    console.log('calling backend');
    const data = await fetchJSON<AnalyzeResponse>('/analyze', { repo_url: repoUrl, branch: 'master' });
    setDemoMode(false);
    return data;
  } catch (err) {
    if (isNetworkError(err)) {
      console.log(err);
      setDemoMode(true);
      // Simulate a brief "thinking" delay so the loading spinner is visible
      await new Promise((r) => setTimeout(r, 900));
      return getMockAnalyze(repoUrl);
    }
    throw err;
  }
}

export async function getDiagram(
  repoUrl: string,
  stack: RepoStack,
  modules: Module[]
): Promise<DiagramResponse> {
  try {
    const data = await fetchJSON<DiagramResponse>('/diagram', { repo_url: repoUrl, stack, modules });
    return data;
  } catch (err) {
    if (isNetworkError(err) || isDemoMode()) {
      return getMockDiagram(repoUrl);
    }
    throw err;
  }
}

export async function getSuggestions(
  repoUrl: string,
  stack: RepoStack,
  modules: Module[]
): Promise<SuggestionsResponse> {
  try {
    const data = await fetchJSON<SuggestionsResponse>('/suggestions', { repo_url: repoUrl, stack, modules });
    return data;
  } catch (err) {
    if (isNetworkError(err) || isDemoMode()) {
      return getMockSuggestions(repoUrl);
    }
    throw err;
  }
}
