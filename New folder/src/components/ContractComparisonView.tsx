import React, { useState } from 'react';
import type { FlaggedClause, CountryConfig, ContractComparisonItem } from '../types/legal';
import { SAMPLE_CONTRACT_PRESETS } from '../data/sampleContracts';
import { GitCompare, ArrowRightLeft, ShieldAlert, ShieldCheck, FileCheck } from 'lucide-react';

interface Props {
  currentClauses: FlaggedClause[];
  currentFileName: string;
  activeCountry: CountryConfig;
}

export const ContractComparisonView: React.FC<Props> = ({
  currentClauses,
  currentFileName,
  activeCountry,
}) => {
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>(SAMPLE_CONTRACT_PRESETS[1].id);

  const baselinePreset = SAMPLE_CONTRACT_PRESETS.find((p) => p.id === selectedBaselineId) || SAMPLE_CONTRACT_PRESETS[1];

  const comparisonItems: ContractComparisonItem[] = currentClauses.map((clause, idx) => {
    const baselineClause = baselinePreset.clauses[idx] || baselinePreset.clauses[0];

    const isDifferent = clause.clauseText.trim() !== baselineClause.clauseText.trim();
    const riskShift =
      clause.riskScore < baselineClause.riskScore
        ? 'safer'
        : clause.riskScore > baselineClause.riskScore
        ? 'riskier'
        : 'neutral';

    return {
      sectionTitle: clause.section,
      docAClause: clause.clauseText,
      docBClause: baselineClause.clauseText,
      diffType: isDifferent ? 'modified' : 'identical',
      riskShift,
      explanation: isDifferent
        ? `Document A evaluates to risk score ${clause.riskScore}/100 vs Baseline (${baselineClause.riskScore}/100). Difference primarily in ${clause.primaryCategory}.`
        : 'Clause wording aligns with standard benchmark template.',
    };
  });

  const saferCount = comparisonItems.filter((i) => i.riskShift === 'safer').length;
  const riskierCount = comparisonItems.filter((i) => i.riskShift === 'riskier').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-md">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Use Case 2: Side-by-Side Contract Comparison Matrix</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono border border-indigo-800">
                Diff Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Compare uploaded document against standard market baselines or previous contract versions under {activeCountry.name} law.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="nexus-baseline-select" className="text-xs font-semibold text-slate-400">Baseline Template:</label>
          <select
            id="nexus-baseline-select"
            value={selectedBaselineId}
            onChange={(e) => setSelectedBaselineId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {SAMPLE_CONTRACT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Active Document</div>
            <div className="text-sm font-bold text-white truncate">{currentFileName}</div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Baseline Benchmark</div>
            <div className="text-sm font-bold text-white truncate">{baselinePreset.name}</div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{saferCount} Terms Safer</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span className="text-xs font-bold text-red-400">{riskierCount} Terms Riskier</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3.5 w-1/4">Clause Section</th>
              <th className="p-3.5 w-1/3 text-sky-300">Active Document ({currentFileName})</th>
              <th className="p-3.5 w-1/3 text-indigo-300">Baseline ({baselinePreset.name})</th>
              <th className="p-3.5 text-center">Risk Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {comparisonItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                <td className="p-3.5 font-bold text-white">
                  <div>{item.sectionTitle}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.explanation}</span>
                </td>
                <td className="p-3.5 font-mono text-[11px] leading-relaxed text-slate-200 bg-slate-950/40">
                  "{item.docAClause}"
                </td>
                <td className="p-3.5 font-mono text-[11px] leading-relaxed text-slate-400 bg-slate-950/20">
                  "{item.docBClause}"
                </td>
                <td className="p-3.5 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded font-bold text-[10px] uppercase ${
                      item.riskShift === 'safer'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.riskShift === 'riskier'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.riskShift}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
