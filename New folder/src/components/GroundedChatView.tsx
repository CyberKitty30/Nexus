import React, { useState } from 'react';
import type { FlaggedClause, CountryConfig } from '../types/legal';
import { askNexusAssistant } from '../services/geminiService';
import { sanitizeInput } from '../middleware/security';
import { Send, Sparkles, BookOpen, Bot, User } from 'lucide-react';

interface Props {
  clauses: FlaggedClause[];
  activeClause?: FlaggedClause;
  activeCountry: CountryConfig;
  contractFileName: string;
  apiKey?: string;
}

interface ChatMessage {
  sender: 'user' | 'nexus';
  text: string;
  citation?: string;
  timestamp: string;
}

export const GroundedChatView: React.FC<Props> = ({
  clauses,
  activeClause,
  activeCountry,
  contractFileName,
  apiKey,
}) => {
  const [chatQuery, setChatQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'nexus',
      text: `Hello! I am Ask NEXUS AI, your grounded legal chat assistant. Ask me questions about "${contractFileName}" or statutory legal requirements under ${activeCountry.flag} ${activeCountry.name} law.`,
      citation: activeCountry.primaryStatutes[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Security: sanitize user query against prompt injection before sending to LLM
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
      const response = await askNexusAssistant(safeQuery, contractContext, activeCountry.code, activeClause, apiKey);
      const nexusMsg: ChatMessage = {
        sender: 'nexus',
        text: response.text,
        citation: response.citation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, nexusMsg]);
    } catch (err) {
      console.warn('Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const presetQuestions = [
    'Why was this clause flagged?',
    'Show me a safer alternative revision.',
    `Is the non-compete clause legal under ${activeCountry.name} law?`,
    'What are my termination and renewal notice obligations?',
    'What privacy obligations apply under data statutes?',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[680px]">
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Ask NEXUS AI — Grounded Document Q&A</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                Use Case 4
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Grounded on contract text + {activeCountry.flag} {activeCountry.name} statutory legal knowledge base
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini 1.5 Grounded</span>
        </div>
      </div>

      <div className="py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto pr-1">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Presets:</span>
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 text-slate-300 text-[11px] rounded-lg transition-all shrink-0 cursor-pointer"
          >
            "{q}"
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans my-2">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-sky-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                <span>{msg.timestamp}</span>
                {msg.citation && (
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span>RAG Citation: {msg.citation}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-sky-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>NEXUS AI is reasoning over {activeCountry.name} law and contract context...</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 flex gap-2">
        <label htmlFor="nexus-chat-input" className="sr-only">
          Ask NEXUS legal query input
        </label>
        <input
          id="nexus-chat-input"
          aria-label="Ask NEXUS legal query"
          type="text"
          placeholder={`Ask Ask NEXUS about ${contractFileName} or ${activeCountry.name} legal standards...`}
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatQuery)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
        />
        <button
          onClick={() => handleSendMessage(chatQuery)}
          disabled={!chatQuery.trim() || isThinking}
          className="px-5 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
