import React from 'react';
import { LayoutGrid, ShieldAlert, GitCompare, MessageSquare, CalendarCheck, FileText } from 'lucide-react';

export type ActiveTab = 'bento' | 'audit' | 'compare' | 'chat' | 'milestones' | 'attorney';

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
  const tabs = [
    {
      id: 'bento' as ActiveTab,
      label: '★ 12-Column Bento Grid Dashboard',
      icon: LayoutGrid,
      badge: 'Bento Mode',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800 glow-cyan',
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Clause Risk Audit',
      icon: ShieldAlert,
      badge: unresolvedCount > 0 ? `${unresolvedCount} Risks` : 'Fixed',
      badgeColor: unresolvedCount > 0 ? 'bg-red-950 text-red-400 border-red-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800',
    },
    {
      id: 'compare' as ActiveTab,
      label: 'Contract Comparison',
      icon: GitCompare,
      badge: 'Diff Matrix',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
    {
      id: 'chat' as ActiveTab,
      label: 'Ask NEXUS Q&A',
      icon: MessageSquare,
      badge: 'Gemini RAG',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
    {
      id: 'milestones' as ActiveTab,
      label: 'Calendar & Milestones',
      icon: CalendarCheck,
      badge: 'Google Sync',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      id: 'attorney' as ActiveTab,
      label: 'Attorney Brief',
      icon: FileText,
      badge: 'Google Docs',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
  ];

  return (
    <nav aria-label="Workbench Workspaces" className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 pr-1">
      <div role="tablist" className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-slate-800 border-sky-500 text-sky-400 shadow-lg shadow-sky-950/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
