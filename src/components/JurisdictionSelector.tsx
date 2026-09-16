import React from 'react';
import type { CountryCode, CountryConfig } from '../types/legal';
import { SUPPORTED_COUNTRIES } from '../data/jurisdictions';
import { Globe, Check, BookOpen, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeCountry: CountryConfig;
  onSelectCountry: (code: CountryCode) => void;
}

export const JurisdictionSelector: React.FC<Props> = React.memo(({
  isOpen,
  onClose,
  activeCountry,
  onSelectCountry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Global Jurisdiction & Statutory Engine</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-3">
          Select any global country to switch the active statutory legal framework in real time. Grounded AI risk assessment will adapt instantly to local statutory acts, court precedents, and enforceability rules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 my-2 flex-1">
          {Object.values(SUPPORTED_COUNTRIES).map((country) => {
            const isSelected = country.code === activeCountry.code;
            return (
              <div
                key={country.code}
                onClick={() => {
                  onSelectCountry(country.code);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {country.name}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {country.code}
                          </span>
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">{country.legalSystem}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{country.description}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Primary Statutory Acts:</span>
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-0.5 pl-4 list-disc">
                    {country.primaryStatutes.slice(0, 3).map((statute, idx) => (
                      <li key={idx}>{statute}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
});

JurisdictionSelector.displayName = 'JurisdictionSelector';
