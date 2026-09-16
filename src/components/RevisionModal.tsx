import React, { useState } from 'react';
import type { FlaggedClause, CountryConfig } from '../types/legal';
import { Copy, Check, X, Sparkles, Wand2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clause: FlaggedClause | null;
  country: CountryConfig;
  onApplyRevision: (id: string) => void;
}

export const RevisionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clause,
  country,
  onApplyRevision,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !clause) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(clause.suggestedRevision);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-500/60 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400">
            <Wand2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">AI Clause Remediation Draft</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Original Legalese Clause Text:
          </span>
          <div className="bg-slate-950 border border-red-900/40 p-3.5 rounded-xl font-mono text-xs text-red-300 italic">
            "{clause.clauseText}"
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Suggested Redline Revision ({country.name} Law Aligned):</span>
          </span>
          <div className="bg-slate-950 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 p-3.5 rounded-r-xl font-mono text-xs text-slate-100 font-semibold leading-relaxed">
            "{clause.suggestedRevision}"
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Revision Rationale:
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">{clause.revisionRationale}</p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Revised Clause'}</span>
          </button>
          <button
            onClick={() => {
              onApplyRevision(clause.id);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply & Mark Remediated</span>
          </button>
        </div>
      </div>
    </div>
  );
};
