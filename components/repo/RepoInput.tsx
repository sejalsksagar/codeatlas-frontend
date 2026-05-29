'use client';

import { useState, type FormEvent } from 'react';

interface RepoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function validate(value: string): string {
    if (!value.trim()) return 'Enter a GitHub repository URL';
    try {
      const u = new URL(value.trim());
      if (u.hostname !== 'github.com') return 'Must be a github.com URL';
      const parts = u.pathname.replace(/^\//, '').split('/').filter(Boolean);
      if (parts.length < 2) return 'URL must include owner and repository (e.g. github.com/owner/repo)';
    } catch {
      return 'Enter a valid URL';
    }
    return '';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate(url);
    if (err) { setError(err); return; }
    setError('');
    onSubmit(url.trim());
  }

  const examples = [
    'github.com/tiangolo/fastapi',
    'github.com/vercel/next.js',
    'github.com/expressjs/express',
  ];

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-stretch gap-0 rounded-xl border border-[#222] bg-[#111] overflow-hidden focus-within:border-[#00ff88] focus-within:shadow-[0_0_24px_#00ff8815] transition-all duration-300">
          {/* GH icon prefix */}
          <div className="flex items-center px-4 border-r border-[#222] bg-[#0d0d0d]">
            <svg className="w-4 h-4 text-[#555]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
            placeholder="https://github.com/owner/repository"
            className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-[#444] font-mono focus:outline-none"
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-2 px-6 bg-[#00ff88] text-black text-sm font-bold tracking-wide hover:bg-[#00e87a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ borderTopColor: '#000' }} />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 1l6 6-6 6M2 7h12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400 font-mono pl-1">{error}</p>
        )}
      </form>

      {/* Example repos */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-[#444] font-mono">try:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => { setUrl(`https://${ex}`); setError(''); }}
            disabled={isLoading}
            className="text-xs text-[#555] font-mono hover:text-[#00ff88] transition-colors duration-150 disabled:opacity-40"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
