import React, { useState, type ChangeEvent } from 'react';
import { SAMPLE_CONTRACT_PRESETS } from '../data/sampleContracts';
import { FileUp, Cpu, CheckCircle2, Sparkles } from 'lucide-react';

interface Props {
  onParseText: (text: string, title: string) => void;
  onLoadPreset: (presetId: string) => void;
  isAuditing: boolean;
  currentFileName: string;
}

export const DocumentParser: React.FC<Props> = ({
  onParseText,
  onLoadPreset,
  isAuditing,
  currentFileName,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        onParseText(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          onParseText(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Document AI & OCR Parsing Engine
            </h2>
            <span className="text-[11px] text-slate-400">
              Form Layout OCR • Clause Segmentation • Auto-Jurisdiction Recognition
            </span>
          </div>
        </div>

        {/* Preset Sample Loaders */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Load Benchmark:</span>
          {SAMPLE_CONTRACT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset.id)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-md border border-slate-700 transition-all cursor-pointer"
            >
              {preset.name.split(' ')[0]} Contract
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* File Drag-and-Drop Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`lg:col-span-1 border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col justify-center items-center ${
            dragActive
              ? 'border-sky-400 bg-sky-950/40'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <FileUp className="w-8 h-8 text-sky-400 mb-2" />
          <label htmlFor="nexus-document-input" className="cursor-pointer text-xs font-bold text-slate-200 hover:text-sky-300">
            {currentFileName ? `Loaded: ${currentFileName}` : 'Drop PDF / TXT / JSON / MD File Here'}
          </label>
          <input
            id="nexus-document-input"
            type="file"
            accept=".pdf,.txt,.json,.md,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-[10px] text-slate-500 mt-1">
            Auto-segments clauses & filters raw metadata
          </span>
          {currentFileName && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" />
              <span>Parsed & Ready</span>
            </div>
          )}
        </div>

        {/* Text Area Manual Input */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
          <textarea
            placeholder="Or paste custom contract clauses, non-compete terms, liability waivers, or privacy agreements here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={3}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
          />
          <button
            onClick={() => {
              if (rawText.trim()) {
                onParseText(rawText, 'Custom Uploaded Legal Snippet');
                setRawText('');
              }
            }}
            disabled={isAuditing || !rawText.trim()}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAuditing ? 'Auditing...' : 'Audit Document'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
