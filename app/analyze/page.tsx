'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { AnalyzeResponse, DiagramNode, DiagramEdge, Suggestion } from '@/types';
import { getDiagram, getSuggestions, isDemoMode } from '@/lib/api';
import StackBadges from '@/components/repo/StackBadges';
import SummaryPanel from '@/components/repo/SummaryPanel';
import SuggestionsPanel from '@/components/repo/SuggestionsPanel';
import ModuleList from '@/components/repo/ModuleList';

// Dynamic import — React Flow uses browser-only APIs, SSR must be off
const DiagramCanvas = dynamic(
  () => import('@/components/diagram/DiagramCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] flex items-center justify-center h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <span className="text-xs font-mono text-[#444]">Loading diagram…</span>
        </div>
      </div>
    ),
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'diagram' | 'suggestions' | 'modules';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',    label: 'Overview',    icon: '◉' },
  { id: 'diagram',     label: 'Diagram',     icon: '◈' },
  { id: 'suggestions', label: 'Suggestions', icon: '◇' },
  { id: 'modules',     label: 'Modules',     icon: '◫' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AiBadge({ aiUsed, demoMode }: { aiUsed: boolean; demoMode: boolean }) {
  if (demoMode) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-[#9966ff30] bg-[#9966ff10] text-[#aa88ff]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#aa88ff] pulse-dot" />
        Demo Mode
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
      aiUsed
        ? 'border-[#00ff8830] bg-[#00ff8810] text-[#00ff88]'
        : 'border-[#ff880030] bg-[#ff880010] text-[#ff8800]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${aiUsed ? 'bg-[#00ff88]' : 'bg-[#ff8800]'} pulse-dot`} />
      {aiUsed ? 'AI Enhanced' : 'Heuristic Mode'}
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="rounded-xl border border-[#9966ff25] bg-[#9966ff08] px-4 py-3 flex items-start gap-3 mb-4">
      <span className="text-[#aa88ff] mt-0.5 flex-shrink-0">◈</span>
      <div>
        <p className="text-xs font-semibold text-[#aa88ff] mb-0.5">Demo Mode — backend offline</p>
        <p className="text-xs text-[#555] leading-relaxed">
          The FastAPI backend at <code className="font-mono text-[#666]">localhost:8000</code> is not running.
          Showing curated mock data. Start the backend and re-analyze to see live results.
        </p>
      </div>
    </div>
  );
}

function Breadcrumb({ repoName }: { repoName: string }) {
  const router = useRouter();
  const [owner, repo] = repoName.includes('/')
    ? repoName.split('/')
    : ['', repoName];
  return (
    <nav className="flex items-center gap-1.5 text-sm font-mono text-[#444]">
      <button
        onClick={() => router.push('/')}
        className="hover:text-[#00ff88] transition-colors duration-150"
      >
        codeatlas
      </button>
      <span>/</span>
      {owner && <><span className="text-[#666]">{owner}</span><span>/</span></>}
      <span className="text-white">{repo}</span>
    </nav>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-tab="${active}"]`
    ) as HTMLElement | null;
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div className="relative border-b border-[#1a1a1a]">
      <div ref={containerRef} className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors duration-150 ${
              active === tab.id ? 'text-white' : 'text-[#3a3a3a] hover:text-[#777]'
            }`}
          >
            <span className={`text-xs ${active === tab.id ? 'text-[#00ff88]' : 'text-[#2a2a2a]'}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="absolute bottom-0 h-[2px] bg-[#00ff88] transition-all duration-200 ease-out"
        style={{ left: ind.left, width: ind.width }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const router = useRouter();

  const [data,          setData]          = useState<AnalyzeResponse | null>(null);
  const [activeTab,     setActiveTab]     = useState<Tab>('overview');
  const [demoMode,      setDemoMode]      = useState(false);
  const [diagramNodes,  setDiagramNodes]  = useState<DiagramNode[]>([]);
  const [diagramEdges,  setDiagramEdges]  = useState<DiagramEdge[]>([]);
  const [suggestions,   setSuggestions]   = useState<Suggestion[]>([]);
  const [loadingTab,    setLoadingTab]    = useState<Tab | null>(null);
  const fetchedTabs = useRef<Set<Tab>>(new Set());

  // ── Initial load from sessionStorage ──────────────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem('codeatlas:analyze');
    if (!raw) { router.push('/'); return; }
    try {
      const parsed: AnalyzeResponse = JSON.parse(raw);
      setData(parsed);
      setDemoMode(isDemoMode());
    } catch {
      router.push('/');
    }
  }, [router]);

  // ── Lazy-load diagram/suggestions when their tab is first opened ───────────
  useEffect(() => {
    if (!data) return;
    if (fetchedTabs.current.has(activeTab)) return;
    fetchedTabs.current.add(activeTab);

    const repoUrl = sessionStorage.getItem('codeatlas:repo_url') ?? '';

    if (activeTab === 'diagram') {
      setLoadingTab('diagram');
      // Check sessionStorage cache first
      const cached = sessionStorage.getItem('codeatlas:diagram');
      if (cached) {
        try {
          const d = JSON.parse(cached);
          setDiagramNodes(d.nodes ?? []);
          setDiagramEdges(d.edges ?? []);
          setLoadingTab(null);
          return;
        } catch { /* fall through */ }
      }
      getDiagram(repoUrl, data.stack, data.modules)
        .then((res) => {
          setDiagramNodes(res.nodes);
          setDiagramEdges(res.edges);
          sessionStorage.setItem('codeatlas:diagram', JSON.stringify(res));
        })
        .catch(console.error)
        .finally(() => setLoadingTab(null));
    }

    if (activeTab === 'suggestions') {
      setLoadingTab('suggestions');
      getSuggestions(repoUrl, data.stack, data.modules)
        .then((res) => setSuggestions(res.suggestions))
        .catch(console.error)
        .finally(() => setLoadingTab(null));
    }
  }, [activeTab, data]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">

      {/* Sticky header */}
      <header className="border-b border-[#141414] bg-[#0a0a0a]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Breadcrumb repoName={data.repo_name} />
          <div className="flex items-center gap-3">
            <AiBadge aiUsed={data.ai_used} demoMode={demoMode} />
            <button
              onClick={() => router.push('/')}
              className="text-xs font-mono text-[#2a2a2a] hover:text-[#00ff88] transition-colors duration-150"
            >
              ← New repo
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto w-full px-6 mt-6">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-6 flex-1">

        {/* Demo banner — shown on every tab when backend is offline */}
        {demoMode && <DemoBanner />}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in">
            <StackBadges stack={data.stack} />
            <SummaryPanel
              summary={data.summary}
              entry_points={data.entry_points}
              request_flow={data.request_flow}
            />
          </div>
        )}

        {/* ── Diagram ── */}
        {activeTab === 'diagram' && (
          <div className="animate-in">
            {loadingTab === 'diagram' ? (
              <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] flex items-center justify-center h-[500px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="spinner" />
                  <span className="text-xs font-mono text-[#444]">Generating architecture diagram…</span>
                </div>
              </div>
            ) : (
              <DiagramCanvas
                nodes={diagramNodes}
                edges={diagramEdges}
                onNodesChange={setDiagramNodes}
              />
            )}
          </div>
        )}

        {/* ── Suggestions ── */}
        {activeTab === 'suggestions' && (
          <div className="animate-in">
            {loadingTab === 'suggestions' ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <div className="spinner" />
                <span className="text-xs font-mono text-[#444]">Analyzing for improvements…</span>
              </div>
            ) : (
              <SuggestionsPanel suggestions={suggestions} />
            )}
          </div>
        )}

        {/* ── Modules ── */}
        {activeTab === 'modules' && (
          <div className="animate-in">
            <ModuleList modules={data.modules} />
          </div>
        )}

      </main>

      <footer className="border-t border-[#0f0f0f] py-4 text-center text-xs text-[#1e1e1e] font-mono">
        CodeAtlas AI · GitHub Models · GitHub REST API
      </footer>
    </div>
  );
}
