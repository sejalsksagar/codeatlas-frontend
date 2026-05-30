import type { Module } from '@/types';

interface ModuleListProps {
  modules: Module[];
}

const MODULE_COLORS = [
  'from-blue-500/5 to-transparent border-blue-500/15 hover:border-blue-500/30',
  'from-purple-500/5 to-transparent border-purple-500/15 hover:border-purple-500/30',
  'from-emerald-500/5 to-transparent border-emerald-500/15 hover:border-emerald-500/30',
  'from-orange-500/5 to-transparent border-orange-500/15 hover:border-orange-500/30',
  'from-cyan-500/5 to-transparent border-cyan-500/15 hover:border-cyan-500/30',
  'from-rose-500/5 to-transparent border-rose-500/15 hover:border-rose-500/30',
];

const MODULE_DOT_COLORS = [
  'bg-blue-400',
  'bg-purple-400',
  'bg-emerald-400',
  'bg-orange-400',
  'bg-cyan-400',
  'bg-rose-400',
];

function getInitials(name: string): string {
  return name
    .split(/[-_/.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface ModuleCardProps {
  module: Module;
  index: number;
}

function ModuleCard({ module, index }: ModuleCardProps) {
  const colorClass = MODULE_COLORS[index % MODULE_COLORS.length];
  const dotColor   = MODULE_DOT_COLORS[index % MODULE_DOT_COLORS.length];
  const initials   = getInitials(module.name);

  const pathParts = module.path.split('/').filter(Boolean);
  const lastName  = pathParts.pop() ?? module.path;
  const dirPrefix = pathParts.length > 0 ? pathParts.join('/') + '/' : '';

  return (
    <div
      className={`
        group relative rounded-xl border bg-gradient-to-br bg-[#111]
        transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
        overflow-hidden
        ${colorClass}
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-5 right-5 h-[1px] ${dotColor} opacity-0 group-hover:opacity-30 transition-opacity duration-200`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[#0d0d0d] border border-[#1e1e1e] text-[#666] group-hover:text-[#888] transition-colors`}>
            {initials || '◈'}
          </div>

          <div className="min-w-0 flex-1">
            {/* Module name */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
              <span className="text-sm font-semibold text-white truncate">
                {module.name}
              </span>
            </div>
            {/* Path */}
            <div className="flex items-center gap-0 min-w-0">
              {dirPrefix && (
                <span className="text-[11px] font-mono text-[#333] truncate shrink">
                  {dirPrefix}
                </span>
              )}
              <span className="text-[11px] font-mono text-[#555] truncate flex-shrink-0 group-hover:text-[#666] transition-colors">
                {lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#666] leading-relaxed line-clamp-3 group-hover:text-[#777] transition-colors">
          {module.description || 'No description available.'}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="text-4xl opacity-10">◫</div>
      <p className="text-sm text-[#444] font-mono">No modules detected.</p>
    </div>
  );
}

export default function ModuleList({ modules }: ModuleListProps) {
  if (!modules || modules.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#00ff88]">
          Modules
        </h3>
        <span className="text-[10px] font-mono text-[#333]">
          {modules.length} detected
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.map((mod, i) => (
          <ModuleCard key={`${mod.name}-${mod.path}`} module={mod} index={i} />
        ))}
      </div>
    </div>
  );
}
