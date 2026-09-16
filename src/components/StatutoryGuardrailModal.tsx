import React from 'react';
import type { FlaggedClause, CountryConfig } from '../types/legal';
import { AlertTriangle, HelpCircle, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clause: FlaggedClause | null;
  country: CountryConfig;
}

export const StatutoryGuardrailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clause,
  country,
}) => {
  if (!isOpen || !clause) return null;

  const guardrail = clause.guardrail;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/60 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Statutory Uncertainty Guardrail</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Statutory Limitation & Judicial Ambiguity Flag</span>
          </div>
          <p className="text-xs text-amber-100 leading-relaxed">
            {guardrail?.ambiguityReason ||
              `Under ${country.name} law, local statutory enforceability for this clause depends on judicial discretion, bargaining power, or evolving case law precedents.`}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Targeted Questions to Direct to Local {country.name} Advocate / Solicitor</span>
          </h4>
          <div className="space-y-2">
            {guardrail?.targetedAdvocateQuestions.map((question, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{question}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
          >
            Close Guardrail
          </button>
        </div>
      </div>
    </div>
  );
};
