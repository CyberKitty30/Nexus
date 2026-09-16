import React from 'react';
import type { CountryConfig } from '../types/legal';
import { Scale, Globe, Key, FileSpreadsheet, Sparkles } from 'lucide-react';

interface Props {
  activeCountry: CountryConfig;
  onOpenJurisdictionModal: () => void;
  onOpenApiKeyModal: () => void;
  onExportReport: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<Props> = ({
  activeCountry,
  onOpenJurisdictionModal,
  onOpenApiKeyModal,
  onExportReport,
  hasApiKey
}) => {
  return (
    <header role="banner" className="border-b border-slate-800 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Scale className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 tracking-tight">
              NEXUS AI
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              v3.0 Production
            </span>
          </div>
          <p className="text-xs text-slate-400">
            GenAI Legal Assistant Platform • Global Multi-Jurisdiction Engine • Vertex AI & Document AI Powered
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <button
          onClick={onOpenJurisdictionModal}
          aria-label={`Active Legal Jurisdiction: ${activeCountry.name}. Click to change jurisdiction.`}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-slate-200 text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
          title="Switch Active Legal Jurisdiction"
        >
          <span className="text-base" aria-hidden="true">{activeCountry.flag}</span>
          <span className="text-sky-400">{activeCountry.name} Law</span>
          <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </button>

        <button
          onClick={onOpenApiKeyModal}
          aria-label="Configure Google Gemini API Key"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            hasApiKey
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500'
          }`}
          title="Configure Gemini API Key"
        >
          <Key className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{hasApiKey ? 'Gemini 1.5 Active' : 'Configure API Key'}</span>
          <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
        </button>

        <button
          onClick={onExportReport}
          aria-label="Export Executive Audit Report"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-md shadow-sky-600/30 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export Audit Report</span>
        </button>
      </div>
    </header>
  );
};
