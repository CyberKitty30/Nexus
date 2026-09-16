import React from 'react';
import type { CountryCode, CountryConfig } from '../types/legal';
import { SUPPORTED_COUNTRIES } from '../data/jurisdictions';
import { Compass, ArrowRight, X } from 'lucide-react';

interface Props {
  detectedCode: CountryCode;
  activeCode: CountryCode;
  onSwitchJurisdiction: (code: CountryCode) => void;
  onDismiss: () => void;
}

export const AutoJurisdictionBanner: React.FC<Props> = ({
  detectedCode,
  activeCode,
  onSwitchJurisdiction,
  onDismiss
}) => {
  if (detectedCode === activeCode) return null;

  const detectedCountry: CountryConfig = SUPPORTED_COUNTRIES[detectedCode];
  if (!detectedCountry) return null;

  return (
    <div className="bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 border border-sky-500/50 p-3.5 rounded-xl mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-sky-950/40 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
          <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              Jurisdiction Auto-Detector Triggered
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-0.5">
            Detected governing law clause referencing{' '}
            <strong className="text-white underline decoration-sky-400 underline-offset-2">
              {detectedCountry.flag} {detectedCountry.name} ({detectedCountry.legalSystem})
            </strong>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={() => onSwitchJurisdiction(detectedCode)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer shrink-0"
        >
          <span>Switch to {detectedCountry.name} Law</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
