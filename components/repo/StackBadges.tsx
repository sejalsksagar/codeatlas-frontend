import type { RepoStack } from '@/types';

interface StackBadgesProps {
  stack: RepoStack;
}

type BadgeColor = 'blue' | 'purple' | 'green' | 'orange' | 'slate';

interface SectionProps {
  title: string;
  items: string[];
  color: BadgeColor;
}

const COLOR_CLASSES: Record<BadgeColor, string> = {
  blue:   'bg-blue-500/15 text-blue-300 border-blue-500/25 hover:bg-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25 hover:bg-purple-500/25',
  green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25',
  orange: 'bg-orange-500/15 text-orange-300 border-orange-500/25 hover:bg-orange-500/25',
  slate:  'bg-slate-500/15 text-slate-300 border-slate-500/25 hover:bg-slate-500/25',
};

const DOT_CLASSES: Record<BadgeColor, string> = {
  blue:   'bg-blue-400',
  purple: 'bg-purple-400',
  green:  'bg-emerald-400',
  orange: 'bg-orange-400',
  slate:  'bg-slate-400',
};

function BadgeSection({ title, items, color }: SectionProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#444]">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`
              inline-flex items-center gap-1.5
              rounded-full border px-3 py-1
              text-xs font-medium tracking-wide
              transition-colors duration-150 cursor-default
              ${COLOR_CLASSES[color]}
            `}
          >
            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${DOT_CLASSES[color]}`} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StackBadges({ stack }: StackBadgesProps) {
  const sections: SectionProps[] = [
    { title: 'Languages',  items: stack.languages          ?? [], color: 'blue'   },
    { title: 'Frameworks', items: stack.frameworks         ?? [], color: 'purple' },
    { title: 'Databases',  items: stack.databases          ?? [], color: 'green'  },
    { title: 'Infra',      items: stack.infra              ?? [], color: 'orange' },
    { title: 'Testing',    items: stack.test_frameworks    ?? [], color: 'slate'  },
  ];

  const hasAny = sections.some((s) => s.items.length > 0);

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-5 py-4">
        <p className="text-xs font-mono text-[#444]">No stack detected</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e1e1e] bg-[#111] px-5 py-5 space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#00ff88]">
        Tech Stack
      </h3>
      {sections
        .filter((s) => s.items.length > 0)
        .map((section) => (
          <BadgeSection key={section.title} {...section} />
        ))}
      {stack.package_manager && (
        <div className="pt-1 border-t border-[#1a1a1a]">
          <span className="text-[10px] font-mono text-[#333] uppercase tracking-widest">
            Package manager:{' '}
          </span>
          <span className="text-[10px] font-mono text-[#555]">
            {stack.package_manager}
          </span>
        </div>
      )}
    </div>
  );
}
