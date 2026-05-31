'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RepoInput from '@/components/repo/RepoInput';
import { analyzeRepo } from '@/lib/api';
import type { AnalyzeResponse } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze(url: string) {
    setIsLoading(true);
    setError('');
    sessionStorage.removeItem('codeatlas:diagram');
    sessionStorage.removeItem('codeatlas:suggestions');
    try {
      console.log('starting analyze');
      const data: AnalyzeResponse = await analyzeRepo(url);
      console.log('analyze success', data.repo);
      sessionStorage.setItem('codeatlas:analyze', JSON.stringify(data));
      sessionStorage.setItem('codeatlas:repo_url', url);
      router.push('/analyze');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Try again.');
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg px-6">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#00ff88] opacity-[0.03] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#0088ff] opacity-[0.04] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#00ff88] opacity-[0.015] blur-[80px]" />
      </div>

      {/* Corner marks — engineering aesthetic */}
      <div className="pointer-events-none absolute top-8 left-8 w-8 h-8 border-l border-t border-[#333]" />
      <div className="pointer-events-none absolute top-8 right-8 w-8 h-8 border-r border-t border-[#333]" />
      <div className="pointer-events-none absolute bottom-8 left-8 w-8 h-8 border-l border-b border-[#333]" />
      <div className="pointer-events-none absolute bottom-8 right-8 w-8 h-8 border-r border-b border-[#333]" />

      {/* Header label */}
      <div className="animate-in mb-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] pulse-dot" />
        <span className="text-xs font-mono text-[#444] tracking-[0.2em] uppercase">Microsoft / GitHub Ecosystem</span>
      </div>

      {/* Main heading */}
      <div className="animate-in animate-in-delay-1 text-center mb-4">
        <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-extrabold leading-[0.9] tracking-tight">
          <span className="text-white">Code</span>
          <span className="text-[#00ff88]">Atlas</span>
          <span className="block text-[0.6em] font-medium text-[#333] tracking-[0.15em] uppercase mt-2">AI</span>
        </h1>
      </div>

      {/* Subheading */}
      <p className="animate-in animate-in-delay-2 text-center text-[#555] text-lg max-w-md mb-10 leading-relaxed">
        Understand any GitHub repository in{' '}
        <span className="text-[#00ff88] font-semibold">minutes</span>, not days.
        Stack detection, architecture diagrams, improvement insights.
      </p>

      {/* Input */}
      <div className="animate-in animate-in-delay-3 w-full flex justify-center">
        <RepoInput onSubmit={handleAnalyze} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="animate-in mt-4 max-w-xl w-full">
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400 font-mono">
            ⚠ {error}
          </div>
        </div>
      )}

      {/* Feature chips */}
      <div className="animate-in animate-in-delay-4 mt-14 flex flex-wrap gap-3 justify-center max-w-lg">
        {[
          { icon: '⬡', label: 'Stack Detection' },
          { icon: '◈', label: 'Architecture Diagrams' },
          { icon: '◉', label: 'Module Mapping' },
          { icon: '◇', label: 'Improvement Insights' },
          { icon: '◫', label: 'Graceful AI Fallback' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1e1e1e] bg-[#111] text-xs text-[#555]"
          >
            <span className="text-[#00ff88] opacity-60">{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-[#2a2a2a] font-mono">
        Powered by GitHub Models · GitHub REST API · FastAPI · Next.js
      </div>
    </main>
  );
}
