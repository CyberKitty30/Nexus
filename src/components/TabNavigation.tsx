import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  GitCompare,
  MessageSquare,
  CalendarCheck,
  FileText,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'audit' | 'compare' | 'chat' | 'milestones' | 'attorney';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unresolvedCount: number;
}

export const TabNavigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  unresolvedCount,
}) => {
  const tabs: {
    id: ActiveTab;
    label: string;
    subLabel: string;
    icon: React.FC<{ className?: string; 'aria-hidden'?: boolean }>;
    badge: string;
    badgeColor: string;
    star?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: '12-Column Bento Grid Dashboard',
      subLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'Bento Mode',
      badgeColor: 'bg-violet-950 text-violet-300 border-violet-700',
      star: true,
    },
    {
      id: 'audit',
      label: 'Clause Risk Audit',
      subLabel: 'Risk Analysis',
      icon: ShieldAlert,
      badge: unresolvedCount > 0 ? `${unresolvedCount} Risks` : 'Fixed',
      badgeColor:
        unresolvedCount > 0
          ? 'bg-red-950 text-red-400 border-red-800'
          : 'bg-emerald-950 text-emerald-400 border-emerald-800',
    },
    {
      id: 'compare',
      label: 'Contract Comparison',
      subLabel: 'Side-by-Side Diff',
      icon: GitCompare,
      badge: 'Diff Matrix',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
    {
      id: 'chat',
      label: 'Ask NEXUS Q&A',
      subLabel: 'Grounded Answers',
      icon: MessageSquare,
      badge: 'Gemini RAG',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
    {
      id: 'milestones',
      label: 'Calendar & Milestones',
      subLabel: 'Deadline Tracker',
      icon: CalendarCheck,
      badge: 'Google Sync',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'attorney',
      label: 'Attorney Brief',
      subLabel: 'Export & Review',
      icon: FileText,
      badge: 'Google Docs',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
  ];

  return (
    <nav
      aria-label="Workbench Workspaces"
      className="flex flex-col gap-1 w-56 shrink-0 border-r border-slate-800/70 pr-3 pt-1"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2 px-1">
        Navigation
      </p>

      <div role="tablist" className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDashboard = tab.id === 'dashboard';

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`w-full text-left px-3 py-3 rounded-xl font-semibold text-xs flex flex-col gap-2 transition-all duration-200 cursor-pointer border group ${
                isDashboard && isActive
                  ? 'bg-gradient-to-br from-violet-950/80 to-purple-950/60 border-violet-500/70 text-violet-300 shadow-lg shadow-violet-950/40'
                  : isActive
                  ? 'bg-slate-800/90 border-sky-500/80 text-sky-300 shadow-lg shadow-sky-950/40'
                  : isDashboard
                  ? 'bg-violet-950/20 border-violet-800/40 text-violet-400 hover:bg-violet-950/40 hover:border-violet-600/60 hover:text-violet-200'
                  : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700/70'
              }`}
            >
              {/* Icon row */}
              <span className="flex items-center gap-2">
                {tab.star && (
                  <span className="text-yellow-400 text-sm leading-none" aria-hidden="true">
                    ★
                  </span>
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden={true} />
                <span className="font-bold leading-snug">{tab.label}</span>
              </span>

              {/* Badge row */}
              <span className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-600 group-hover:text-slate-500 leading-none">
                  {tab.subLabel}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border leading-tight ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
