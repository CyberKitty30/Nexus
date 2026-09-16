import { useState } from 'react';
import type { CountryCode, CountryConfig, FlaggedClause, HumanStatus, MilestoneDate } from './types/legal';
import { SUPPORTED_COUNTRIES, DEFAULT_JURISDICTION } from './data/jurisdictions';
import { SAMPLE_CONTRACT_PRESETS } from './data/sampleContracts';
import { parseDocumentWithDocumentAi, extractMilestoneDates } from './services/documentAiService';
import { downloadExecutiveAuditReport } from './services/workspaceService';

// UI Components
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { AutoJurisdictionBanner } from './components/AutoJurisdictionBanner';
import { JurisdictionSelector } from './components/JurisdictionSelector';
import { TabNavigation, type ActiveTab } from './components/TabNavigation';
import { ClauseAuditView } from './components/ClauseAuditView';
import { ContractComparisonView } from './components/ContractComparisonView';
import { GroundedChatView } from './components/GroundedChatView';
import { MilestonesChecklistView } from './components/MilestonesChecklistView';
import { AttorneyBriefView } from './components/AttorneyBriefView';
import { StatutoryGuardrailModal } from './components/StatutoryGuardrailModal';
import { RevisionModal } from './components/RevisionModal';
import { ApiKeyModal } from './components/ApiKeyModal';

import { BentoDashboardView } from './components/BentoDashboardView';

export default function App() {
  // Jurisdiction Engine State
  const [activeCountry, setActiveCountry] = useState<CountryConfig>(SUPPORTED_COUNTRIES[DEFAULT_JURISDICTION]);
  const [detectedCountryCode, setDetectedCountryCode] = useState<CountryCode | null>(null);

  // Contract Document & Clauses State
  const [contractFileName, setContractFileName] = useState<string>('HIGH-RISK AI & DATA CONTRACT');
  const [clauses, setClauses] = useState<FlaggedClause[]>(SAMPLE_CONTRACT_PRESETS[0].clauses);
  const [milestones, setMilestones] = useState<MilestoneDate[]>(() =>
    extractMilestoneDates(SAMPLE_CONTRACT_PRESETS[0].clauses.map((c) => c.clauseText).join(' '))
  );
  const [activeClauseId, setActiveClauseId] = useState<string>(SAMPLE_CONTRACT_PRESETS[0].clauses[0].id);

  // App UI & Tab State (Default to 12-Column Bento Grid)
  const [activeTab, setActiveTab] = useState<ActiveTab>('bento');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Modals State
  const [showJurisdictionModal, setShowJurisdictionModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [selectedGuardrailClause, setSelectedGuardrailClause] = useState<FlaggedClause | null>(null);
  const [selectedRevisionClause, setSelectedRevisionClause] = useState<FlaggedClause | null>(null);

  // ==========================================
  // COMPLIANCE METRICS ENGINE
  // ==========================================
  const totalClauses = clauses.length;
  const criticalCount = clauses.filter((c) => c.riskLevel === 'critical' && !c.isRemediated).length;
  const highCount = clauses.filter((c) => c.riskLevel === 'high' && !c.isRemediated).length;

  const rawSumRisk = clauses.reduce((acc, curr) => acc + curr.riskScore, 0);
  const beforeScore = totalClauses > 0 ? Math.max(10, Math.round(100 - rawSumRisk / totalClauses)) : 100;

  const remediatedSumRisk = clauses.reduce((acc, curr) => acc + (curr.isRemediated ? 5 : curr.riskScore), 0);
  const afterScore = totalClauses > 0 ? Math.max(15, Math.round(100 - remediatedSumRisk / totalClauses)) : 100;

  // ==========================================
  // HANDLERS
  // ==========================================

  // Document AI OCR & Text Parse Handler
  const handleParseDocumentText = async (text: string, title: string) => {
    setIsAuditing(true);
    setContractFileName(title.toUpperCase());

    try {
      const result = await parseDocumentWithDocumentAi(text, title, activeCountry.code);

      setClauses(result.extractedClauses);
      setMilestones(result.extractedMilestones);
      if (result.extractedClauses[0]) {
        setActiveClauseId(result.extractedClauses[0].id);
      }

      if (result.detectedJurisdiction && result.detectedJurisdiction !== activeCountry.code) {
        setDetectedCountryCode(result.detectedJurisdiction);
      } else {
        setDetectedCountryCode(null);
      }
    } catch (err) {
      console.error('Error parsing document:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Preset Load Handler
  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_CONTRACT_PRESETS.find((p) => p.id === presetId) || SAMPLE_CONTRACT_PRESETS[0];
    setIsAuditing(true);
    setContractFileName(preset.name);
    setActiveCountry(SUPPORTED_COUNTRIES[preset.jurisdictionCode]);

    setTimeout(() => {
      setClauses(preset.clauses);
      setMilestones(extractMilestoneDates(preset.clauses.map((c) => c.clauseText).join(' ')));
      setActiveClauseId(preset.clauses[0].id);
      setDetectedCountryCode(null);
      setIsAuditing(false);
    }, 300);
  };

  // Switch Active Country
  const handleSwitchJurisdiction = (code: CountryCode) => {
    const country = SUPPORTED_COUNTRIES[code];
    if (country) {
      setActiveCountry(country);
      setClauses((prev) => prev.map((c) => ({ ...c, jurisdictionCode: code })));
    }
  };

  // Human Review Actions
  const handleReviewAction = (id: string, status: HumanStatus, notes: string) => {
    setClauses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              humanStatus: status,
              expertNotes: notes.trim() ? notes : c.expertNotes,
            }
          : c
      )
    );
  };

  const handleToggleRemediated = (id: string) => {
    setClauses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isRemediated: !c.isRemediated,
              humanStatus: !c.isRemediated ? 'approved' : c.humanStatus,
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 font-sans p-3 sm:p-5 selection:bg-sky-500 selection:text-slate-950">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* MANDATORY DISCLAIMER BANNER */}
        <DisclaimerBanner country={activeCountry} />

        {/* WORKBENCH HEADER */}
        <Header
          activeCountry={activeCountry}
          onOpenJurisdictionModal={() => setShowJurisdictionModal(true)}
          onOpenApiKeyModal={() => setShowApiKeyModal(true)}
          onExportReport={() =>
            downloadExecutiveAuditReport(contractFileName, activeCountry, clauses, beforeScore, afterScore)
          }
          hasApiKey={Boolean(geminiApiKey)}
        />

        {/* AUTO-JURISDICTION DETECTOR PROMPT BANNER */}
        {detectedCountryCode && (
          <AutoJurisdictionBanner
            detectedCode={detectedCountryCode}
            activeCode={activeCountry.code}
            onSwitchJurisdiction={(code) => {
              handleSwitchJurisdiction(code);
              setDetectedCountryCode(null);
            }}
            onDismiss={() => setDetectedCountryCode(null)}
          />
        )}

        {/* WORKSPACE TAB NAVIGATION */}
        <TabNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unresolvedCount={criticalCount + highCount}
        />

        {/* TAB WORKSPACE CONTENT */}
        <main>
          {activeTab === 'bento' && (
            <BentoDashboardView
              clauses={clauses}
              activeClauseId={activeClauseId}
              onSelectClause={setActiveClauseId}
              activeCountry={activeCountry}
              contractFileName={contractFileName}
              beforeScore={beforeScore}
              afterScore={afterScore}
              milestones={milestones}
              geminiApiKey={geminiApiKey}
              onReviewAction={handleReviewAction}
              onToggleRemediated={handleToggleRemediated}
              onOpenGuardrailModal={setSelectedGuardrailClause}
              onOpenRevisionModal={setSelectedRevisionClause}
              onOpenJurisdictionModal={() => setShowJurisdictionModal(true)}
              onOpenApiKeyModal={() => setShowApiKeyModal(true)}
              onLoadPreset={handleLoadPreset}
              onParseText={handleParseDocumentText}
              isAuditing={isAuditing}
            />
          )}

          {activeTab === 'audit' && (
            <ClauseAuditView
              clauses={clauses}
              activeClauseId={activeClauseId}
              onSelectClause={setActiveClauseId}
              activeCountry={activeCountry}
              onReviewAction={handleReviewAction}
              onToggleRemediated={handleToggleRemediated}
              onOpenGuardrailModal={setSelectedGuardrailClause}
              onOpenRevisionModal={setSelectedRevisionClause}
            />
          )}

          {activeTab === 'compare' && (
            <ContractComparisonView
              currentClauses={clauses}
              currentFileName={contractFileName}
              activeCountry={activeCountry}
            />
          )}

          {activeTab === 'chat' && (
            <GroundedChatView
              clauses={clauses}
              activeClause={clauses.find((c) => c.id === activeClauseId)}
              activeCountry={activeCountry}
              contractFileName={contractFileName}
              apiKey={geminiApiKey}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesChecklistView
              milestones={milestones}
              clauses={clauses}
              activeCountry={activeCountry}
              contractFileName={contractFileName}
              beforeScore={beforeScore}
              afterScore={afterScore}
            />
          )}

          {activeTab === 'attorney' && (
            <AttorneyBriefView
              clauses={clauses}
              activeCountry={activeCountry}
              contractFileName={contractFileName}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <JurisdictionSelector
        isOpen={showJurisdictionModal}
        onClose={() => setShowJurisdictionModal(false)}
        activeCountry={activeCountry}
        onSelectCountry={handleSwitchJurisdiction}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiKey={geminiApiKey}
        onSaveApiKey={setGeminiApiKey}
      />

      <StatutoryGuardrailModal
        isOpen={Boolean(selectedGuardrailClause)}
        onClose={() => setSelectedGuardrailClause(null)}
        clause={selectedGuardrailClause}
        country={activeCountry}
      />

      <RevisionModal
        isOpen={Boolean(selectedRevisionClause)}
        onClose={() => setSelectedRevisionClause(null)}
        clause={selectedRevisionClause}
        country={activeCountry}
        onApplyRevision={handleToggleRemediated}
      />
    </div>
  );
}