import React, { useState } from 'react';
import { Key, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  apiKey: currentApiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState<string>(currentApiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400">
            <Key className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Google Gemini API Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Provide your Google Gemini API Key to enable live online Gemini 1.5 Pro & Flash model calls. If omitted, NEXUS AI automatically uses its zero-latency grounded legal reasoning engine.
        </p>

        <div>
          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
            Gemini API Key:
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveApiKey(inputKey);
              onClose();
            }}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
