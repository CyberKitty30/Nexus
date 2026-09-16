import React, { useState } from 'react';
import type { MilestoneDate, ComplianceChecklistItem, CountryConfig, FlaggedClause } from '../types/legal';
import { syncToGoogleCalendar, downloadExecutiveAuditReport } from '../services/workspaceService';
import { Calendar, CheckSquare, Download, CalendarPlus, Check, Sparkles, Clock } from 'lucide-react';

interface Props {
  milestones: MilestoneDate[];
  clauses: FlaggedClause[];
  activeCountry: CountryConfig;
  contractFileName: string;
  beforeScore: number;
  afterScore: number;
}

export const MilestonesChecklistView: React.FC<Props> = ({
  milestones: initialMilestones,
  clauses,
  activeCountry,
  contractFileName,
  beforeScore,
  afterScore,
}) => {
  const [milestones, setMilestones] = useState<MilestoneDate[]>(initialMilestones);
  const [checklist, setChecklist] = useState<ComplianceChecklistItem[]>([
    {
      id: 'chk-1',
      task: `Verify Section 27 non-compete voidness legal advice under ${activeCountry.name} law`,
      category: 'RESTRAINT_OF_TRADE',
      statutoryReference: activeCountry.primaryStatutes[0],
      completed: false,
      priority: 'must_have',
    },
    {
      id: 'chk-2',
      task: `Execute Standard Data Protection Addendum (DPA) and Consent Manager protocol`,
      category: 'GDPR_PRIVACY',
      statutoryReference: activeCountry.primaryStatutes[1] || 'DPDP Act 2023 / GDPR',
      completed: false,
      priority: 'must_have',
    },
    {
      id: 'chk-3',
      task: `Insert UCTA / UCC reasonableness liability cap carve-out for gross negligence`,
      category: 'CONTRACT_RISK',
      statutoryReference: 'UCTA 1977 s.2(1) & UCC 2-719',
      completed: true,
      priority: 'must_have',
    },
    {
      id: 'chk-4',
      task: `Establish real-time Human-in-the-Loop manual override control for automated decisions`,
      category: 'HUMAN_OVERSIGHT',
      statutoryReference: 'EU AI Act Article 14',
      completed: false,
      priority: 'recommended',
    },
    {
      id: 'chk-5',
      task: `Perform CERT-In / NIS2 cybersecurity audit on public API endpoints`,
      category: 'CYBERSECURITY',
      statutoryReference: 'IT Act 2000 & NIS2 Directive',
      completed: false,
      priority: 'recommended',
    },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCalendarSync = (milestone: MilestoneDate) => {
    const { calendarUrl, icsDownload } = syncToGoogleCalendar(milestone);
    
    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank');
    
    // Also trigger .ics file download
    icsDownload();

    setMilestones((prev) =>
      prev.map((m) => (m.id === milestone.id ? { ...m, isSyncedToCalendar: true } : m))
    );
  };

  const completedChecklistCount = checklist.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Key Milestone Date Extractor & Google Calendar Sync */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Use Case 6: Milestone Date Extractor & Google Calendar Sync</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Google Workspace
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated extraction of renewal windows, notice deadlines, and payment schedules with 1-click Google Calendar integration.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                    {item.type}
                  </span>
                </div>
                <div className="text-sm font-black font-mono text-purple-400 my-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({item.clauseSection})</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.isSyncedToCalendar ? '✓ Synced to Calendar' : 'Pending Calendar Sync'}
                </span>
                <button
                  onClick={() => handleCalendarSync(item)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    item.isSyncedToCalendar
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                  }`}
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>{item.isSyncedToCalendar ? 'Re-sync Google Calendar' : 'Sync Google Calendar'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Interactive Compliance Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Actionable Compliance Audit Checklist</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {completedChecklistCount} / {checklist.length} Completed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Actionable step-by-step audit tasks mapped to {activeCountry.name} statutory regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`Toggle checklist item: ${item.task}`}
              aria-pressed={item.completed}
              onClick={() => toggleChecklist(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleChecklist(item.id);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-950/20 border-emerald-900/50'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {item.task}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                    <span>Category: {item.category}</span>
                    <span>•</span>
                    <span className="text-sky-400">{item.statutoryReference}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                  item.priority === 'must_have'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {item.priority.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Executive Audit Report Download Trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/60 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Download Executive Audit Report</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Export a full structured audit report containing risk findings, statutory citations, and remediation scores.
          </p>
        </div>

        <button
          onClick={() =>
            downloadExecutiveAuditReport(contractFileName, activeCountry, clauses, beforeScore, afterScore)
          }
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download JSON Report</span>
        </button>
      </div>
    </div>
  );
};
