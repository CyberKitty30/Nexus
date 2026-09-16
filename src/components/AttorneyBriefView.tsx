import React, { useState, useCallback, useMemo } from 'react';
import type { FlaggedClause, CountryConfig, AttorneyBrief } from '../types/legal';
import { exportToGoogleDocs } from '../services/workspaceService';
import { FileText, FileUp, Sparkles, ShieldCheck } from 'lucide-react';

interface Props {
  clauses: FlaggedClause[];
  activeCountry: CountryConfig;
  contractFileName: string;
}

export const AttorneyBriefView: React.FC<Props> = React.memo(({
  clauses,
  activeCountry,
  contractFileName,
}) => {
  const buildAttorneyBrief = useCallback((): AttorneyBrief => {
    const criticals = clauses.filter((c) => c.riskLevel === 'critical' && !c.isRemediated);
    const highs = clauses.filter((c) => c.riskLevel === 'high' && !c.isRemediated);

    const violations = clauses.map((c) => ({
      statute: c.ragCitation,
      clauseSection: c.section,
      violation: c.aiVerdict,
    }));

    const targetedQuestions = [
      `Under ${activeCountry.name} law, does the restraint of trade clause violate statutory voidness rules (e.g. Section 27 / UCTA 1977 / Cal B&P 16600)?`,
      `Is the aggregate liability cap disclaiming gross negligence and statutory data breach fines enforceable in local courts?`,
      `What specific interim injunction remedies should be prepared if a dispute arises regarding IP or non-competes?`,
      `What amendments to the governing law or jurisdiction clause are recommended to minimize dispute costs?`,
      `Has a formal Data Processing Addendum (DPA) been reviewed for compliance with local data privacy mandates?`,
    ];

    return {
      title: `ATTORNEY CONSULTATION BRIEF — ${activeCountry.name.toUpperCase()} LAW`,
      generatedAt: new Date().toLocaleString(),
      contractTitle: contractFileName,
      jurisdictionName: activeCountry.name,
      executiveSummary: `This consultation brief consolidates preliminary GenAI legal risk findings for "${contractFileName}" under ${activeCountry.flag} ${activeCountry.name} law (${activeCountry.primaryStatutes.join(', ')}). A total of ${clauses.length} clauses were audited, highlighting ${criticals.length} Critical risks and ${highs.length} High risks requiring advocate review.`,
      criticalRisksCount: criticals.length,
      highRisksCount: highs.length,
      keyStatutoryViolations: violations,
      recommendedPositioning: `Insist on deleting void non-compete restraints, inserting UCTA/UCC carve-outs for negligence, uncapping liability for data privacy breaches, and adding a 30-day cure period for default notices.`,
      targetedAdvocateQuestions: targetedQuestions,
    };
  }, [clauses, activeCountry, contractFileName]);

  const initialBrief = useMemo(() => buildAttorneyBrief(), [buildAttorneyBrief]);
  const [brief, setBrief] = useState<AttorneyBrief | null>(initialBrief);

  const handleExportDocs = useCallback(() => {
    if (!brief) return;

    const htmlContent = `
<h1>${brief.title}</h1>
<p><strong>Contract Document:</strong> ${brief.contractTitle}</p>
<p><strong>Jurisdiction:</strong> ${brief.jurisdictionName} Law</p>
<p><strong>Generated On:</strong> ${brief.generatedAt}</p>

<h2>1. Executive Summary</h2>
<p>${brief.executiveSummary}</p>

<h2>2. Key Statutory Violations & Risk Breakdown</h2>
<ul>
  ${brief.keyStatutoryViolations
    .map(
      (v) => `
    <li>
      <strong>${v.clauseSection} (${v.statute}):</strong> ${v.violation}
    </li>
  `
    )
    .join('')}
</ul>

<h2>3. Recommended Client Positioning</h2>
<p>${brief.recommendedPositioning}</p>

<h2>4. Targeted Questions for Local Advocate / Solicitor</h2>
<ol>
  ${brief.targetedAdvocateQuestions.map((q) => `<li>${q}</li>`).join('')}
</ol>
`;

    exportToGoogleDocs(`Attorney_Brief_${activeCountry.code}_${contractFileName}`, htmlContent);
  }, [brief, activeCountry.code, contractFileName]);

  const handleRegenerate = useCallback(() => {
    setBrief(buildAttorneyBrief());
  }, [buildAttorneyBrief]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Use Case 7: Legal Professional Consultation Preparation</span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                1-Click Google Docs Export
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              One-click generation of structured Attorney Consultation Briefs containing targeted questions for local advocates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Re-Generate Brief</span>
          </button>

          <button
            onClick={handleExportDocs}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <span>1-Click Google Docs Export</span>
          </button>
        </div>
      </div>

      {brief && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-amber-400 font-mono tracking-wide">{brief.title}</h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Generated for {brief.contractTitle} • {brief.generatedAt}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-400 px-3 py-1 bg-amber-950/60 border border-amber-800 rounded-lg">
              {activeCountry.flag} {brief.jurisdictionName} Advocate Brief
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              1. Executive Briefing Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              {brief.executiveSummary}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Key Statutory Violations Identified ({brief.keyStatutoryViolations.length})
            </h4>
            <div className="space-y-2">
              {brief.keyStatutoryViolations.map((v, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                    <span>
                      {idx + 1}. {v.clauseSection}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{v.statute}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{v.violation}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Recommended Client Positioning
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              {brief.recommendedPositioning}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Targeted Questions for Local {activeCountry.name} Advocate / Solicitor</span>
            </h4>
            <div className="space-y-2">
              {brief.targetedAdvocateQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AttorneyBriefView.displayName = 'AttorneyBriefView';
