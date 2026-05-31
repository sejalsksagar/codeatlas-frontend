'use client';

import { useState } from 'react';
import type { Suggestion } from '@/types';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

type Category = Suggestion['category'] | 'all';

const CATEGORY_TABS: { id: Category; label: string }[] = [
  { id: 'all',          label: 'All'          },
  { id: 'security',     label: 'Security'     },
  { id: 'performance',  label: 'Performance'  },
  { id: 'scalability',  label: 'Scalability'  },
  { id: 'quality',      label: 'Quality'      },
];

const CATEGORY_COLORS: Record<Suggestion['category'], string> = {
  security:    'text-red-400 bg-red-500/10 border-red-500/20',
  performance: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  scalability: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  quality:     'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const CATEGORY_ICONS: Record<Suggestion['category'], string> = {
  security:    '🔒',
  performance: '⚡',
  scalability: '📈',
  quality:     '✦',
};

const SEVERITY_CONFIG = {
  high:   { label: 'HIGH',   classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  medium: { label: 'MED',    classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  low:    { label: 'LOW',    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
};

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const severity = SEVERITY_CONFIG[suggestion.severity];
  const catColor = CATEGORY_COLORS[suggestion.category];

  return (
    <div className="group rounded-xl border border-[#1e1e1e] bg-[#111] hover:bg-[#141414] hover:border-[#2a2a2a] transition-all duration-200 p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category chip */}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${catColor}`}>
            <span>{CATEGORY_ICONS[suggestion.category]}</span>
            {suggestion.category}
          </span>
          {/* Severity badge */}
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-widest ${severity.classes}`}>
            {severity.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-white mb-1.5 leading-snug group-hover:text-[#f5f5f5] transition-colors">
        {suggestion.title}
      </p>

      {/* Detail */}
      <p className="text-xs text-[#666] leading-relaxed mb-3">
        {suggestion.detail}
      </p>

      {/* File hint */}
      {suggestion.file_hint && (
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-[#444] flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 1h5.5L13 4.5V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 1v4h4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <code className="text-[11px] font-mono text-[#555]">{suggestion.file_hint}</code>
        </div>
      )}
    </div>
  );
}

function EmptyState({ category }: { category: Category }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-3xl opacity-20">
        {category === 'all' ? '◇' : CATEGORY_ICONS[category as Suggestion['category']]}
      </div>
      <p className="text-sm text-[#444] font-mono">
        No {category === 'all' ? '' : category} suggestions found.
      </p>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 rounded-full bg-[#1e1e1e] px-1.5 py-0.5 text-[10px] font-mono text-[#555] tabular-nums">
      {count}
    </span>
  );
}

export default function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const countFor = (cat: Category) =>
    cat === 'all' ? suggestions.length : suggestions.filter((s) => s.category === cat).length;

  const filtered =
    activeCategory === 'all'
      ? suggestions
      : suggestions.filter((s) => s.category === activeCategory);

  // Sort: high → medium → low
  const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-1 overflow-x-auto">
        {CATEGORY_TABS.map((tab) => {
          const count = countFor(tab.id);
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'text-[#444] hover:text-[#888]'
              }`}
            >
              {tab.id !== 'all' && (
                <span className="mr-1.5">
                  {CATEGORY_ICONS[tab.id as Suggestion['category']]}
                </span>
              )}
              {tab.label}
              <CountBadge count={count} />
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      {sorted.length === 0 ? (
        <EmptyState category={activeCategory} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((s, i) => (
            <SuggestionCard key={`${s.category}-${s.title}-${i}`} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
