import React, { useState, useMemo } from 'react';
import type { FlaggedClause, CountryConfig, HumanStatus, ComplianceCategory, RiskLevel } from '../types/legal';
import { AlertTriangle, ShieldCheck, Copy, Sparkles, Filter, Info, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  clauses: FlaggedClause[];
  activeClauseId: string;
  onSelectClause: (id: string) => void;
  activeCountry: CountryConfig;
  onReviewAction: (id: string, status: HumanStatus, notes: string) => void;
  onToggleRemediated: (id: string) => void;
  onOpenGuardrailModal: (clause: FlaggedClause) => void;
  onOpenRevisionModal: (clause: FlaggedClause) => void;
}

export const ClauseAuditView: React.FC<Props> = React.memo(({
  clauses,
  activeClauseId,
  onSelectClause,
  activeCountry,
  onReviewAction,
  onToggleRemediated,
  onOpenGuardrailModal,
  onOpenRevisionModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ComplianceCategory | 'ALL'>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [expertNotes, setExpertNotes] = useState<string>('');
  const [showPlainEnglish, setShowPlainEnglish] = useState<boolean>(true);
  const [activeNegotiationTab, setActiveNegotiationTab] = useState<'balanced' | 'aggressive' | 'conservative'>('balanced');
  const [copiedRevision, setCopiedRevision] = useState<boolean>(false);

  const activeClause = useMemo(
    () => clauses.find((c) => c.id === activeClauseId) || clauses[0],
    [clauses, activeClauseId]
  );

  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        c.primaryCategory === selectedCategory ||
        c.relatedCategories.includes(selectedCategory);
      const matchesRisk = selectedRisk === 'ALL' || c.riskLevel === selectedRisk;
      return matchesCategory && matchesRisk;
    });
  }, [clauses, selectedCategory, selectedRisk]);

  const handleCopyRevision = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRevision(true);
    setTimeout(() => setCopiedRevision(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Filter & Clause Queue (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ComplianceCategory | 'ALL')}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-1.5 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="RESTRAINT_OF_TRADE">RESTRAINT OF TRADE</option>
              <option value="EU_AI_ACT">EU AI ACT</option>
              <option value="GDPR_PRIVACY">GDPR / PRIVACY</option>
              <option value="CONTRACT_RISK">CONTRACT RISK</option>
              <option value="CYBERSECURITY">CYBERSECURITY</option>
              <option value="HUMAN_OVERSIGHT">HUMAN OVERSIGHT</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Severity</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as RiskLevel | 'ALL')}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-1.5 focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="ALL">ALL RISKS</option>
              <option value="critical">CRITICAL 🔴</option>
              <option value="high">HIGH 🔴</option>
              <option value="medium">MEDIUM 🟡</option>
              <option value="low">LOW 🟢</option>
            </select>
          </div>
        </div>

        {/* Clause Cards Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span>Parsed Clause Queue ({filteredClauses.length})</span>
            </span>
            <span className="text-[11px] font-normal text-slate-500">{activeCountry.name} Law</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredClauses.map((item) => {
              const isSelected = item.id === activeClauseId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectClause(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.isRemediated
                      ? 'border-l-4 border-l-emerald-500 border-slate-800 bg-emerald-950/20'
                      : item.riskLevel === 'critical'
                      ? 'border-l-4 border-l-red-500 border-slate-800 bg-slate-950/80'
                      : item.riskLevel === 'high'
                      ? 'border-l-4 border-l-amber-500 border-slate-800 bg-slate-950/80'
                      : 'border-l-4 border-l-sky-500 border-slate-800 bg-slate-950/80'
                  } ${isSelected ? 'ring-2 ring-sky-500 bg-slate-800/80' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${item.isRemediated ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {item.isRemediated ? '✓ ' : ''}{item.section}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.isRemediated && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          REMEDIATED
                        </span>
                      )}
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.humanStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 italic mb-2">"{item.clauseText}"</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span className="font-semibold text-slate-400">{item.primaryCategory}</span>
                    <span className={`font-bold font-mono ${item.riskLevel === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                      Risk Score: {item.isRemediated ? 0 : item.riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Deep-Dive Analysis & Use Cases 1, 3, 5 (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {activeClause ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
            {/* Header & Categories */}
            <div className="pb-3 border-b border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
                  <span>{activeClause.section}</span>
                  {activeClause.isRemediated && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      ✓ Remediated
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Primary: {activeClause.primaryCategory}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeCountry.flag} {activeCountry.name} Law Grounded
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg border ${
                  activeClause.riskLevel === 'critical'
                    ? 'bg-red-950/80 border-red-800 text-red-400'
                    : 'bg-amber-950/80 border-amber-800 text-amber-400'
                }`}>
                  Risk: {activeClause.riskLevel.toUpperCase()} ({activeClause.riskScore}/100)
                </span>
              </div>
            </div>

            {/* USE CASE 1: Original vs Plain 8th-Grade Language Translator Toggle */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Use Case 1: Plain 8th-Grade Translation
                  </span>
                </div>
                <button
                  onClick={() => setShowPlainEnglish(!showPlainEnglish)}
                  className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  {showPlainEnglish ? 'Show Legalese Text' : 'Translate to Plain English'}
                </button>
              </div>

              {showPlainEnglish ? (
                <div className="bg-sky-950/30 border-l-4 border-l-sky-400 border-y border-r border-sky-900/40 p-3.5 rounded-r-xl">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                    Plain 8th-Grade Language Summary:
                  </div>
                  <p className="text-xs text-sky-100 font-medium leading-relaxed">
                    "{activeClause.simplifiedText}"
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 border-l-4 border-l-slate-600 p-3.5 rounded-r-xl font-mono text-xs text-slate-300 italic leading-relaxed">
                  "{activeClause.clauseText}"
                </div>
              )}

              {/* Jargon Glossary Tooltips */}
              {activeClause.jargonTerms && activeClause.jargonTerms.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                    Legal Jargon Defined:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeClause.jargonTerms.map((jargon, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-md cursor-help transition-all flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.0 h-3.0 text-sky-400" />
                        <span className="font-semibold">{jargon.term}</span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-950 border border-sky-500 rounded-lg text-[11px] text-slate-200 shadow-2xl z-20">
                          <strong className="text-sky-400 block mb-0.5">{jargon.term}:</strong>
                          {jargon.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Compliance Verdict */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Compliance Diagnosis ({activeCountry.name} Law)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{activeClause.aiVerdict}</p>
            </div>

            {/* Grounded Legal Evidence & Citation */}
            <div className="bg-slate-950/80 border border-emerald-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grounded Statutory Legal Evidence</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Confidence: {(activeClause.aiConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 mb-1">
                Statutory Mandate: {activeClause.ragRequirement}
              </div>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800 mt-2">
                Source Citation: {activeClause.ragCitation}
              </div>

              {/* Statutory Uncertainty Guardrail Trigger */}
              {activeClause.guardrail && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Statutory Uncertainty Guardrail Available</span>
                  </span>
                  <button
                    onClick={() => onOpenGuardrailModal(activeClause)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Generate Targeted Advocate Questions →
                  </button>
                </div>
              )}
            </div>

            {/* USE CASE 5: Options & Next Steps Negotiation Guidance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" />
                  <span>Use Case 5: Actionable Negotiation Trade-Off Paths</span>
                </div>
                <button
                  onClick={() => onOpenRevisionModal(activeClause)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Generate AI Redline Draft
                </button>
              </div>

              {/* Tabs: Aggressive, Balanced, Conservative */}
              <div className="flex gap-2 mb-3">
                {(['balanced', 'aggressive', 'conservative'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveNegotiationTab(tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                      activeNegotiationTab === tab
                        ? 'bg-slate-800 border-sky-500 text-sky-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab} Option
                  </button>
                ))}
              </div>

              {activeClause.negotiationPaths && (
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">
                      {activeNegotiationTab} Negotiation Path:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                      {activeClause.negotiationPaths[activeNegotiationTab].riskReduction}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                    "{activeClause.negotiationPaths[activeNegotiationTab].text}"
                  </p>

                  <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                    <span>
                      <strong>Rationale:</strong> {activeClause.negotiationPaths[activeNegotiationTab].rationale}
                    </span>
                    <button
                      onClick={() => handleCopyRevision(activeClause.negotiationPaths[activeNegotiationTab].text)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold shrink-0 cursor-pointer pl-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedRevision ? 'Copied!' : 'Copy Path'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Human Review & Remediated Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Human Legal Expert Override & Review Notes:
              </label>

              <textarea
                placeholder="Record advocate consultation notes, board review rationale, or override reasons..."
                value={expertNotes}
                onChange={(e) => setExpertNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => onReviewAction(activeClause.id, 'approved', expertNotes)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeClause.humanStatus === 'approved'
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => onReviewAction(activeClause.id, 'flagged', expertNotes)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeClause.humanStatus === 'flagged'
                      ? 'bg-red-950 border-red-600 text-red-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Flag
                </button>
                <button
                  onClick={() => onReviewAction(activeClause.id, 'revision_requested', expertNotes)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeClause.humanStatus === 'revision_requested'
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Request Revision
                </button>
                <button
                  onClick={() => onToggleRemediated(activeClause.id)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeClause.isRemediated
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-sky-600 text-white hover:bg-sky-500'
                  }`}
                >
                  {activeClause.isRemediated ? 'Unmark Remediated' : 'Mark Remediated'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            Select a clause from the left queue to perform deep-dive compliance analysis.
          </div>
        )}
      </div>
    </div>
  );
});

ClauseAuditView.displayName = 'ClauseAuditView';
