import React from 'react';
import type { FlaggedClause, CountryConfig } from '../types/legal';
import { AlertOctagon, ShieldCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  clauses: FlaggedClause[];
  activeCountry: CountryConfig;
  onSelectClause: (id: string) => void;
  beforeScore: number;
  afterScore: number;
}

export const DashboardOverview: React.FC<Props> = ({
  clauses,
  activeCountry,
  onSelectClause,
  beforeScore,
  afterScore,
}) => {
  const total = clauses.length;
  const critical = clauses.filter((c) => c.riskLevel === 'critical' && !c.isRemediated).length;
  const high = clauses.filter((c) => c.riskLevel === 'high' && !c.isRemediated).length;
  const medium = clauses.filter((c) => c.riskLevel === 'medium' && !c.isRemediated).length;
  const lowOrFixed = clauses.filter((c) => c.riskLevel === 'low' || c.isRemediated).length;

  const reviewedCount = clauses.filter((c) => c.humanStatus !== 'pending').length;
  const remediatedCount = clauses.filter((c) => c.isRemediated).length;

  const topPriorityIssues = [...clauses]
    .filter((c) => !c.isRemediated)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  return (
    <div className="space-y-4 mb-6">
      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Remediation Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2 flex items-baseline gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">INITIAL</span>
              <span className={`text-xl font-bold ${beforeScore < 50 ? 'text-red-400' : 'text-amber-400'}`}>
                {beforeScore}/100
              </span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div>
              <span className="text-[10px] text-emerald-400 block font-semibold">REMEDIATED</span>
              <span className="text-2xl font-black text-emerald-400">{afterScore}/100</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${afterScore}%` }}
            />
          </div>
        </div>

        {/* Risk Distribution Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Unresolved Risk Severity
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="bg-red-950/40 border border-red-900/40 p-2 rounded-lg text-red-400 flex items-center justify-between">
              <span>Critical 🔴</span>
              <strong className="text-sm font-bold">{critical}</strong>
            </div>
            <div className="bg-amber-950/40 border border-amber-900/40 p-2 rounded-lg text-amber-400 flex items-center justify-between">
              <span>High 🔴</span>
              <strong className="text-sm font-bold">{high}</strong>
            </div>
            <div className="bg-sky-950/40 border border-sky-900/40 p-2 rounded-lg text-sky-400 flex items-center justify-between">
              <span>Medium 🟡</span>
              <strong className="text-sm font-bold">{medium}</strong>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-900/40 p-2 rounded-lg text-emerald-400 flex items-center justify-between">
              <span>Fixed 🟢</span>
              <strong className="text-sm font-bold">{lowOrFixed}</strong>
            </div>
          </div>
        </div>

        {/* Active Framework Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Active Legal Jurisdiction
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{activeCountry.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-white">{activeCountry.name} Law</h3>
              <span className="text-[10px] text-sky-400 font-mono">{activeCountry.currency}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">{activeCountry.primaryStatutes[0]}</p>
        </div>

        {/* Human Oversight Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Human Legal Review Progress
          </div>
          <div>
            <div className="text-xl font-bold text-sky-400 my-1">
              {reviewedCount} / {total} Reviewed
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {remediatedCount} Clauses Remediated
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-sky-500 h-full transition-all duration-500"
              style={{ width: `${total > 0 ? (reviewedCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Priority Issues Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
          <AlertOctagon className="w-4 h-4" />
          <span>Top Priority Risk Items Requiring Advocate Review ({topPriorityIssues.length})</span>
        </div>

        {topPriorityIssues.length === 0 ? (
          <div className="text-xs text-emerald-400 font-semibold py-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>All high-risk clauses have been remediated under {activeCountry.name} law!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {topPriorityIssues.map((issue, idx) => (
              <div
                key={issue.id}
                role="button"
                tabIndex={0}
                aria-label={`Inspect priority issue ${idx + 1}: ${issue.section}`}
                onClick={() => onSelectClause(issue.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectClause(issue.id);
                  }
                }}
                className="bg-slate-950/80 border-l-4 border-l-red-500 border-y border-r border-slate-800 p-3 rounded-xl hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-200 truncate pr-2">
                      {idx + 1}. {issue.section}
                    </span>
                    <span className="text-red-400 font-mono text-[10px] shrink-0">
                      {issue.riskScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{issue.aiVerdict}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-sky-400">
                  <span className="font-semibold">{issue.primaryCategory}</span>
                  <span className="flex items-center gap-1 font-bold">
                    <span>Inspect</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
