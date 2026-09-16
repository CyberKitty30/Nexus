import React, { useState } from 'react';
import type { FlaggedClause, CountryConfig, HumanStatus, ComplianceCategory, RiskLevel, MilestoneDate } from '../types/legal';
import { SAMPLE_CONTRACT_PRESETS } from '../data/sampleContracts';
import { askNexusAssistant } from '../services/geminiService';
import { sanitizeInput } from '../middleware/security';
import { syncToGoogleCalendar, downloadExecutiveAuditReport, exportToGoogleDocs } from '../services/workspaceService';
import {
  Globe, ShieldCheck, Sparkles, Filter, Info, HelpCircle,
  ArrowRight, Send, Bot, BookOpen, Calendar,
  Download, FileUp, Cpu, Key, CalendarPlus, TrendingUp, AlertTriangle, FileText
} from 'lucide-react';

interface Props {
  clauses: FlaggedClause[];
  activeClauseId: string;
  onSelectClause: (id: string) => void;
  activeCountry: CountryConfig;
  contractFileName: string;
  beforeScore: number;
  afterScore: number;
  milestones: MilestoneDate[];
  geminiApiKey: string;
  onReviewAction: (id: string, status: HumanStatus, notes: string) => void;
  onToggleRemediated: (id: string) => void;
  onOpenGuardrailModal: (clause: FlaggedClause) => void;
  onOpenRevisionModal: (clause: FlaggedClause) => void;
  onOpenJurisdictionModal: () => void;
  onOpenApiKeyModal: () => void;
  onLoadPreset: (presetId: string) => void;
  onParseText: (text: string, title: string) => void;
  isAuditing: boolean;
}

interface ChatMessage {
  sender: 'user' | 'nexus';
  text: string;
  citation?: string;
  timestamp: string;
}

export const BentoDashboardView: React.FC<Props> = ({
  clauses,
  activeClauseId,
  onSelectClause,
  activeCountry,
  contractFileName,
  beforeScore,
  afterScore,
  milestones: initialMilestones,
  geminiApiKey,
  onReviewAction,
  onToggleRemediated,
  onOpenGuardrailModal,
  onOpenRevisionModal,
  onOpenJurisdictionModal,
  onOpenApiKeyModal,
  onLoadPreset,
  onParseText,
  isAuditing,
}) => {
  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<ComplianceCategory | 'ALL'>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [expertNotes, setExpertNotes] = useState<string>('');
  const [showPlainEnglish, setShowPlainEnglish] = useState<boolean>(true);
  const [activeNegotiationTab, setActiveNegotiationTab] = useState<'balanced' | 'aggressive' | 'conservative'>('balanced');
  const [copiedRevision, setCopiedRevision] = useState<boolean>(false);
  const [showDocParserDropzone, setShowDocParserDropzone] = useState<boolean>(false);
  const [rawInputText, setRawInputText] = useState<string>('');

  // Milestone State
  const [milestones, setMilestones] = useState<MilestoneDate[]>(initialMilestones);

  // Embedded Q&A Chat State
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'nexus',
      text: `Greetings! I am Ask NEXUS AI — grounded on "${contractFileName}" under ${activeCountry.flag} ${activeCountry.name} legal statutes (${activeCountry.primaryStatutes[0]}). Ask me anything!`,
      citation: activeCountry.primaryStatutes[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Active Clause & Metric Calculations
  const activeClause = clauses.find((c) => c.id === activeClauseId) || clauses[0];
  const criticalCount = clauses.filter((c) => c.riskLevel === 'critical' && !c.isRemediated).length;
  const highCount = clauses.filter((c) => c.riskLevel === 'high' && !c.isRemediated).length;
  const mediumCount = clauses.filter((c) => c.riskLevel === 'medium' && !c.isRemediated).length;
  const lowOrFixedCount = clauses.filter((c) => c.riskLevel === 'low' || c.isRemediated).length;

  const filteredClauses = clauses.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.primaryCategory === selectedCategory || c.relatedCategories.includes(selectedCategory);
    const matchesRisk = selectedRisk === 'ALL' || c.riskLevel === selectedRisk;
    return matchesCategory && matchesRisk;
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRevision(true);
    setTimeout(() => setCopiedRevision(false), 2000);
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;
    const { sanitizedText } = sanitizeInput(queryText, 4000);
    const safeQuery = sanitizedText || queryText;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: safeQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatQuery('');
    setIsThinking(true);

    const contractContext = clauses.map((c) => `${c.section}: ${c.clauseText}`).join('\n');

    try {
      const response = await askNexusAssistant(safeQuery, contractContext, activeCountry.code, activeClause, geminiApiKey);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'nexus',
          text: response.text,
          citation: response.citation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCalendarSync = (milestone: MilestoneDate) => {
    const { calendarUrl, icsDownload } = syncToGoogleCalendar(milestone);
    window.open(calendarUrl, '_blank');
    icsDownload();
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestone.id ? { ...m, isSyncedToCalendar: true } : m))
    );
  };

  const handleExportAttorneyBrief = () => {
    const htmlContent = `
      <h1>ATTORNEY CONSULTATION BRIEF — ${activeCountry.name.toUpperCase()} LAW</h1>
      <p><strong>Contract Document:</strong> ${contractFileName}</p>
      <p><strong>Jurisdiction:</strong> ${activeCountry.name} Law</p>
      <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
      <h2>Key Risk Violations & Recommendations</h2>
      <ul>
        ${clauses.map((c) => `<li><strong>${c.section} (${c.primaryCategory}):</strong> ${c.aiVerdict}</li>`).join('')}
      </ul>
    `;
    exportToGoogleDocs(`Attorney_Brief_${activeCountry.code}_${contractFileName}`, htmlContent);
  };

  return (
    <div className="space-y-4">
      {/* ============================================================
          HORIZONTAL DASHBOARD TOP BAR: Score Gauge + Jurisdiction + Actions
          ============================================================ */}
      <div className="bento-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-500/30 shadow-[0_8px_32px_0_rgba(15,3,25,0.8)] backdrop-blur-xl">
        {/* Left: Country Selector & Safety Badge */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onOpenJurisdictionModal}
            className="px-3.5 py-2 rounded-xl bg-purple-950/70 border border-purple-500/50 hover:border-purple-400 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer glow-purple shrink-0"
            aria-label="Select country jurisdiction"
          >
            <span className="text-xl">{activeCountry.flag}</span>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black tracking-wide text-purple-200">{activeCountry.name} Law</span>
                <Globe className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-[10px] text-purple-300 font-mono">{activeCountry.primaryStatutes[0]}</span>
            </div>
          </button>

          <div className="hidden lg:block border-l border-purple-900/60 pl-3">
            <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider block">
              🛡️ Non-Advice Legal Safety Notice:
            </span>
            <p className="text-[11px] text-purple-200/90 line-clamp-1">
              Grounded AI legal information under {activeCountry.name} statutory regulations. Information only — not formal legal advice.
            </p>
          </div>
        </div>

        {/* Center: Global Score Dial Ring */}
        <div className="flex items-center gap-4 shrink-0 bg-purple-950/80 px-4 py-2 rounded-xl border border-purple-800/80">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="18" stroke="#1f1435" strokeWidth="4" fill="transparent" />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke={afterScore >= 80 ? '#10b981' : afterScore >= 50 ? '#a855f7' : '#ec4899'}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * afterScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-black font-mono text-purple-100">{afterScore}</span>
          </div>

          <div className="text-left">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Remediation Score</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 font-mono line-through">{beforeScore} Initial</span>
              <span className="text-xs font-black text-emerald-400 font-mono">→ {afterScore}/100</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDocParserDropzone(!showDocParserDropzone)}
            className="px-3 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-semibold text-xs rounded-xl border border-purple-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-400" />
            <span>{showDocParserDropzone ? 'Hide Upload' : 'Upload Contract'}</span>
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              geminiApiKey
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 glow-emerald'
                : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-pink-400" />
            <span>{geminiApiKey ? 'Gemini Live' : 'API Key'}</span>
          </button>

          <button
            onClick={() => downloadExecutiveAuditReport(contractFileName, activeCountry, clauses, beforeScore, afterScore)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center gap-1.5 cursor-pointer glow-purple"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>
        </div>
      </div>

      {/* Optional Document Upload Drawer */}
      {showDocParserDropzone && (
        <div className="bento-panel p-4 animate-fade-slide-up space-y-3 border-purple-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Document AI OCR & Contract Segmenter</span>
            </span>
            <div className="flex gap-2">
              {SAMPLE_CONTRACT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onLoadPreset(p.id)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 cursor-pointer"
                >
                  {p.name.split(' ')[0]} Preset
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <textarea
              id="bento-document-input-horiz"
              aria-label="Paste custom contract text"
              placeholder="Paste custom legal contract clauses here for zero-latency AI audit..."
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              rows={2}
              className="flex-1 bg-purple-950/50 border border-purple-800/60 rounded-xl p-2.5 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-purple-400 font-mono"
            />
            <button
              onClick={() => {
                if (rawInputText.trim()) {
                  onParseText(rawInputText, 'Custom Uploaded Snippet');
                  setRawInputText('');
                  setShowDocParserDropzone(false);
                }
              }}
              disabled={isAuditing || !rawInputText.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isAuditing ? 'Auditing...' : 'Audit Document'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          HORIZONTAL MULTI-COLUMN BENTO WORKSPACE GRID
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* ------------------------------------------------------------
            COLUMN 1 (SPAN 3 COLS): Risk Summary & Parsed Clause Queue
            ------------------------------------------------------------ */}
        <div className="lg:col-span-3 space-y-3 flex flex-col">
          {/* Executive Risk Metrics Banner */}
          <div className="bento-panel p-3.5 shadow-xl border-purple-800/40">
            <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
              <span>Risk Breakdown Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-pink-950/40 border border-pink-500/50 p-2 rounded-lg glow-pink text-pink-300">
                <span className="text-[9px] uppercase font-bold block">Critical</span>
                <strong className="text-sm font-mono">{criticalCount} 🔴</strong>
              </div>
              <div className="bg-purple-950/40 border border-purple-500/50 p-2 rounded-lg glow-purple text-purple-300">
                <span className="text-[9px] uppercase font-bold block">High</span>
                <strong className="text-sm font-mono">{highCount} 🔴</strong>
              </div>
              <div className="bg-indigo-950/40 border border-indigo-500/50 p-2 rounded-lg glow-indigo text-indigo-300">
                <span className="text-[9px] uppercase font-bold block">Medium</span>
                <strong className="text-sm font-mono">{mediumCount} 🟡</strong>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/50 p-2 rounded-lg glow-emerald text-emerald-300">
                <span className="text-[9px] uppercase font-bold block">Fixed</span>
                <strong className="text-sm font-mono">{lowOrFixedCount} 🟢</strong>
              </div>
            </div>
          </div>

          {/* Parsed Clause Queue Card */}
          <div className="bento-panel p-3.5 shadow-xl space-y-2.5 flex-1 flex flex-col border-purple-800/40">
            <div className="flex items-center justify-between pb-2 border-b border-purple-900/60 text-xs font-bold text-purple-200">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>Clause Queue ({filteredClauses.length})</span>
              </span>
              <span className="text-[10px] text-purple-400 font-mono">{activeCountry.code}</span>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-1.5">
              <select
                id="bento-category-filter-horiz"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ComplianceCategory | 'ALL')}
                className="bg-purple-950/80 border border-purple-800/80 text-[10px] text-purple-200 rounded-lg p-1 font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="ALL">All Categories</option>
                <option value="RESTRAINT_OF_TRADE">Restraint of Trade</option>
                <option value="EU_AI_ACT">EU AI Act</option>
                <option value="GDPR_PRIVACY">GDPR / Privacy</option>
                <option value="CONTRACT_RISK">Contract Risk</option>
                <option value="CYBERSECURITY">Cybersecurity</option>
                <option value="HUMAN_OVERSIGHT">Human Oversight</option>
              </select>

              <select
                id="bento-severity-filter-horiz"
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value as RiskLevel | 'ALL')}
                className="bg-purple-950/80 border border-purple-800/80 text-[10px] text-purple-200 rounded-lg p-1 font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="ALL">All Severity</option>
                <option value="critical">Critical 🔴</option>
                <option value="high">High 🔴</option>
                <option value="medium">Medium 🟡</option>
                <option value="low">Low 🟢</option>
              </select>
            </div>

            {/* Vertical Clause Stack */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 flex-1">
              {filteredClauses.map((item) => {
                const isSelected = item.id === activeClauseId;
                const glowClass = item.isRemediated
                  ? 'glow-emerald'
                  : item.riskLevel === 'critical'
                  ? 'glow-pink'
                  : item.riskLevel === 'high'
                  ? 'glow-purple'
                  : 'glow-indigo';

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${item.section}`}
                    aria-selected={isSelected}
                    onClick={() => onSelectClause(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectClause(item.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      item.isRemediated
                        ? 'bg-emerald-950/20 border-emerald-900/60'
                        : item.riskLevel === 'critical'
                        ? 'bg-pink-950/30 border-pink-900/40'
                        : 'bg-purple-950/30 border-purple-900/40'
                    } ${isSelected ? `${glowClass} ring-1 ring-purple-400 bg-purple-950/80` : 'hover:bg-purple-900/40'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${item.isRemediated ? 'text-emerald-400' : 'text-purple-100'}`}>
                        {item.isRemediated ? '✓ ' : ''}{item.section}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          item.isRemediated
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.riskLevel === 'critical'
                            ? 'bg-pink-950 text-pink-300 border-pink-800'
                            : item.riskLevel === 'high'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        }`}
                      >
                        {item.isRemediated ? 'Fixed' : item.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-300/80 line-clamp-2 italic mb-1.5">"{item.clauseText}"</p>

                    <div className="flex items-center justify-between text-[9px] text-purple-400/70 pt-1 border-t border-purple-900/60">
                      <span className="font-semibold text-purple-300 truncate pr-1">{item.primaryCategory}</span>
                      <span className={`font-bold font-mono shrink-0 ${item.isRemediated ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {item.isRemediated ? 0 : item.riskScore}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------
            COLUMN 2 (SPAN 5 COLS): Active Clause Compliance Inspector
            ------------------------------------------------------------ */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          {activeClause ? (
            <div className="bento-panel p-4 shadow-2xl space-y-3.5 flex-1 flex flex-col border-purple-800/40">
              {/* Header */}
              <div className="pb-2.5 border-b border-purple-900/60 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-purple-100 flex items-center gap-2">
                    <span>{activeClause.section}</span>
                    {activeClause.isRemediated && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        ✓ Remediated
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {activeClause.primaryCategory}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400">
                      {activeCountry.flag} Statutory Grounding
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${
                      activeClause.riskLevel === 'critical'
                        ? 'bg-pink-950 border-pink-700 text-pink-300 glow-pink'
                        : 'bg-purple-950 border-purple-700 text-purple-300 glow-purple'
                    }`}
                  >
                    Risk: {activeClause.riskLevel} ({activeClause.riskScore}/100)
                  </span>
                </div>
              </div>

              {/* Plain 8th-Grade Language Summary vs Legalese Toggle */}
              <div className="bg-purple-950/40 border border-purple-900/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-400" />
                    <span>Plain 8th-Grade Language Summary</span>
                  </span>
                  <button
                    onClick={() => setShowPlainEnglish(!showPlainEnglish)}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    {showPlainEnglish ? 'Show Legalese Text' : 'Translate to Plain English'}
                  </button>
                </div>

                {showPlainEnglish ? (
                  <div className="bg-purple-950/60 border-l-4 border-l-purple-400 border-y border-r border-purple-900/40 p-2.5 rounded-r-xl">
                    <p className="text-xs text-purple-100 font-medium leading-relaxed">
                      "{activeClause.simplifiedText}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-purple-950/80 border-l-4 border-l-purple-600 p-2.5 rounded-r-xl font-mono text-xs text-purple-300 italic leading-relaxed">
                    "{activeClause.clauseText}"
                  </div>
                )}

                {/* Jargon Glossary Tooltips */}
                {activeClause.jargonTerms && activeClause.jargonTerms.length > 0 && (
                  <div className="pt-2 border-t border-purple-900/60 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-purple-400 block w-full mb-0.5">Jargon Glossary:</span>
                    {activeClause.jargonTerms.map((jargon, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-purple-950 border border-purple-800 text-purple-200 text-[10px] px-2 py-0.5 rounded cursor-help flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3 text-purple-400" />
                        <span className="font-semibold">{jargon.term}</span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-2 bg-slate-950 border border-purple-500 rounded-lg text-[10px] text-purple-200 shadow-2xl z-30">
                          <strong className="text-purple-400 block mb-0.5">{jargon.term}:</strong>
                          {jargon.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Compliance Verdict & Statutory Diagnosis Tags */}
              <div className="bg-purple-950/40 border border-purple-900/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Statutory Legal Evidence & Diagnosis</span>
                  </span>
                  <span className="font-mono text-[10px] text-purple-400">
                    Confidence: {(activeClause.aiConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-xs text-purple-100 leading-relaxed">{activeClause.aiVerdict}</p>

                <div className="text-[10px] text-purple-300 font-mono bg-purple-950 p-2 rounded border border-purple-900">
                  Statutory Citation: {activeClause.ragCitation}
                </div>

                {/* Guardrail Trigger */}
                {activeClause.guardrail && (
                  <div className="pt-1.5 border-t border-purple-900/60 flex items-center justify-between">
                    <span className="text-[10px] text-pink-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Statutory Guardrail Active</span>
                    </span>
                    <button
                      onClick={() => onOpenGuardrailModal(activeClause)}
                      className="text-[10px] font-bold text-pink-400 hover:text-pink-300 underline cursor-pointer"
                    >
                      View Advocate Questions →
                    </button>
                  </div>
                )}
              </div>

              {/* 3-Way Negotiation Trade-Off Paths */}
              <div className="bg-purple-950/40 border border-purple-900/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Negotiation Trade-Off Paths</span>
                  </span>
                  <button
                    onClick={() => onOpenRevisionModal(activeClause)}
                    className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-all"
                  >
                    AI Redline Draft
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {(['balanced', 'aggressive', 'conservative'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveNegotiationTab(tab)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded border uppercase transition-all cursor-pointer ${
                        activeNegotiationTab === tab
                          ? 'bg-purple-900/80 border-purple-400 text-purple-100'
                          : 'bg-purple-950/60 border-purple-900 text-purple-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeClause.negotiationPaths && (
                  <div className="bg-purple-950 p-2 rounded-lg border border-purple-900 space-y-1 text-xs">
                    <p className="font-mono text-purple-200 text-[11px]">
                      "{activeClause.negotiationPaths[activeNegotiationTab].text}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-purple-400 pt-1 border-t border-purple-900">
                      <span>{activeClause.negotiationPaths[activeNegotiationTab].rationale}</span>
                      <button
                        onClick={() => handleCopyText(activeClause.negotiationPaths[activeNegotiationTab].text)}
                        className="text-purple-300 font-bold hover:underline cursor-pointer shrink-0"
                      >
                        {copiedRevision ? 'Copied!' : 'Copy Path'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advocate Override Actions */}
              <div className="pt-2 border-t border-purple-900/60 space-y-2 mt-auto">
                <label htmlFor="bento-expert-notes-horiz" className="text-[10px] font-bold text-purple-300 uppercase block">
                  Advocate Override Notes:
                </label>
                <input
                  id="bento-expert-notes-horiz"
                  type="text"
                  placeholder="Record advocate notes..."
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  className="w-full bg-purple-950 border border-purple-800 rounded-lg p-1.5 text-xs text-purple-100 placeholder-purple-400/60 font-mono"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => onReviewAction(activeClause.id, 'approved', expertNotes)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeClause.humanStatus === 'approved'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-purple-950 border-purple-900 text-purple-300 hover:bg-purple-900'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReviewAction(activeClause.id, 'flagged', expertNotes)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeClause.humanStatus === 'flagged'
                        ? 'bg-pink-950 border-pink-600 text-pink-300'
                        : 'bg-purple-950 border-purple-900 text-purple-300 hover:bg-purple-900'
                    }`}
                  >
                    Flag
                  </button>
                  <button
                    onClick={() => onReviewAction(activeClause.id, 'revision_requested', expertNotes)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeClause.humanStatus === 'revision_requested'
                        ? 'bg-purple-900 border-purple-500 text-purple-200'
                        : 'bg-purple-950 border-purple-900 text-purple-300 hover:bg-purple-900'
                    }`}
                  >
                    Request Redline
                  </button>
                  <button
                    onClick={() => onToggleRemediated(activeClause.id)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeClause.isRemediated
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {activeClause.isRemediated ? 'Unmark Fixed' : 'Mark Fixed'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bento-panel p-8 text-center text-purple-400 flex-1 flex items-center justify-center">
              Select a clause from the queue to inspect compliance findings.
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------
            COLUMN 3 (SPAN 4 COLS): Grounded Ask NEXUS Q&A + Export Dock
            ------------------------------------------------------------ */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          {/* Ask NEXUS Grounded RAG Chat Drawer */}
          <div className="bento-panel p-4 shadow-xl flex-1 flex flex-col border-purple-800/40 min-h-[380px]">
            <div className="pb-2 border-b border-purple-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-purple-100">Ask NEXUS Q&A</h4>
              </div>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Gemini RAG
              </span>
            </div>

            {/* Quick Trigger Chips */}
            <div className="py-2 flex items-center gap-1 overflow-x-auto">
              {['Is non-compete void?', 'Safer wording', 'Milestones'].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[9px] bg-purple-950/80 hover:bg-purple-900 border border-purple-800/80 text-purple-200 px-2 py-0.5 rounded shrink-0 cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-2 p-1 font-sans my-1 text-xs max-h-[260px]">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-2.5 rounded-xl leading-relaxed max-w-[90%] ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-purple-950 border border-purple-800 text-purple-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.citation && (
                    <span className="text-[9px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{msg.citation}</span>
                    </span>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="text-[10px] text-purple-300 italic bg-purple-950 p-2 rounded-lg border border-purple-800">
                  Reasoning over {activeCountry.name} law...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="pt-2 border-t border-purple-900/60 flex gap-1.5 mt-auto">
              <input
                id="bento-chat-input-horiz"
                aria-label="Ask NEXUS legal query"
                type="text"
                placeholder="Ask legal question..."
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatQuery)}
                className="flex-1 bg-purple-950/80 border border-purple-800 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 placeholder-purple-400/60 focus:outline-none focus:border-purple-400 font-sans"
              />
              <button
                onClick={() => handleSendMessage(chatQuery)}
                disabled={!chatQuery.trim() || isThinking}
                className="p-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actionable Outputs & Export Dock */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* Google Calendar Milestone Sync Card */}
            <div className="bento-panel p-3 shadow-xl space-y-2 border-purple-800/40">
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Calendar Milestones ({milestones.length})</span>
                </span>
                <span className="text-[9px] text-purple-300 font-mono uppercase bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Sync
                </span>
              </div>

              <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                {milestones.slice(0, 2).map((item) => (
                  <div key={item.id} className="bg-purple-950/50 p-2 rounded-lg border border-purple-900 flex items-center justify-between text-[10px]">
                    <div>
                      <div className="font-bold text-purple-100">{item.title}</div>
                      <div className="text-[9px] text-purple-400 font-mono">{item.date}</div>
                    </div>
                    <button
                      onClick={() => handleCalendarSync(item)}
                      className="text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      <span>{item.isSyncedToCalendar ? 'Synced' : 'Sync'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 1-Click Attorney Consultation Brief Export */}
            <div className="bento-panel p-3.5 shadow-xl space-y-2 bg-gradient-to-br from-purple-950/80 to-pink-950/40 border-purple-700/40">
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-1">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Attorney Brief Export</span>
                </span>
                <span className="text-[9px] text-pink-300 font-mono uppercase bg-pink-950 px-2 py-0.5 rounded border border-pink-800">
                  Google Docs
                </span>
              </div>
              <button
                onClick={handleExportAttorneyBrief}
                className="w-full py-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 glow-purple"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1-Click Google Docs Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
