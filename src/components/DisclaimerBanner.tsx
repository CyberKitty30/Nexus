import React from 'react';
import type { CountryConfig } from '../types/legal';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  country: CountryConfig;
}

export const DisclaimerBanner: React.FC<Props> = React.memo(({ country }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-100 px-4 py-2.5 rounded-lg text-xs mb-4 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
        <span>
          <strong className="text-indigo-300">LEGAL DISCLAIMER:</strong> NEXUS AI provides preliminary legal information and document navigation for informational purposes under{' '}
          <strong className="text-white underline decoration-sky-400 underline-offset-2">{country.flag} {country.name} law</strong>. It does not provide formal legal advice or substitute for a licensed legal professional.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-indigo-900/60 px-2.5 py-1 rounded border border-indigo-700/40 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        <span>ZERO-HALLUCINATION LEGAL GROUNDING</span>
      </div>
    </div>
  );
});

DisclaimerBanner.displayName = 'DisclaimerBanner';
