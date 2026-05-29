interface SummaryPanelProps {
  summary: string;
  entry_points: string[];
  request_flow: string;
}

function FilePathChip({ path }: { path: string }) {
  const parts = path.split('/');
  const file = parts.pop() ?? path;
  const dir  = parts.length > 0 ? parts.join('/') + '/' : '';

  return (
    <div className="inline-flex items-center gap-0 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] overflow-hidden">
      {dir && (
        <span className="px-2 py-1.5 text-xs font-mono text-[#444] border-r border-[#1e1e1e]">
          {dir}
        </span>
      )}
      <span className="px-2 py-1.5 text-xs font-mono text-[#aaa]">
        {file}
      </span>
    </div>
  );
}

function RequestFlowVisual({ flow }: { flow: string }) {
  if (!flow.includes('→')) {
    return <p className="text-sm font-mono text-[#888] leading-relaxed">{flow}</p>;
  }

  const steps = flow.split('→').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-0">
          <div className="flex flex-col items-center">
            <div className="rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-1.5 my-1">
              <span className="text-xs font-mono text-[#ccc] whitespace-nowrap">{step}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center px-1 text-[#00ff88] opacity-60">
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path
                  d="M1 6h14M12 1l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SummaryPanel({ summary, entry_points, request_flow }: SummaryPanelProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-5 py-5">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff88] mb-3">
          Summary
        </h3>
        {summary ? (
          <p className="text-sm text-[#999] leading-[1.75] max-w-2xl">
            {summary}
          </p>
        ) : (
          <p className="text-sm text-[#444] font-mono">No summary available.</p>
        )}
      </div>

      {/* Entry Points */}
      {entry_points && entry_points.length > 0 && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-5 py-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff88]">
              Entry Points
            </h3>
            <span className="rounded-full bg-[#1a1a1a] border border-[#222] px-2 py-0.5 text-[10px] font-mono text-[#555]">
              {entry_points.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry_points.map((ep) => (
              <FilePathChip key={ep} path={ep} />
            ))}
          </div>
        </div>
      )}

      {/* Request Flow */}
      {request_flow && (
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-5 py-5">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff88] mb-3">
            Request Flow
          </h3>
          <RequestFlowVisual flow={request_flow} />
        </div>
      )}
    </div>
  );
}
