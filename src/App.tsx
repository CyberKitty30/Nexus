import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import type { CountryCode, CountryConfig, FlaggedClause, HumanStatus, MilestoneDate } from './types/legal';
import { SUPPORTED_COUNTRIES, DEFAULT_JURISDICTION } from './data/jurisdictions';
import { SAMPLE_CONTRACT_PRESETS } from './data/sampleContracts';
import { parseDocumentWithDocumentAi, extractMilestoneDates } from './services/documentAiService';
import { downloadExecutiveAuditReport } from './services/workspaceService';

// Synchronous Eager UI Components
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { AutoJurisdictionBanner } from './components/AutoJurisdictionBanner';
import { JurisdictionSelector } from './components/JurisdictionSelector';
import { DocumentParser } from './components/DocumentParser';
import { DashboardOverview } from './components/DashboardOverview';
import { TabNavigation, type ActiveTab } from './components/TabNavigation';
import { ClauseAuditView } from './components/ClauseAuditView';
import { StatutoryGuardrailModal } from './components/StatutoryGuardrailModal';
import { RevisionModal } from './components/RevisionModal';
import { ApiKeyModal } from './components/ApiKeyModal';

// Code Splitting / Lazy Loading for Heavy Views
const ContractComparisonView = lazy(() =>
  import('./components/ContractComparisonView').then((m) => ({ default: m.ContractComparisonView }))
);
const GroundedChatView = lazy(() =>
  import('./components/GroundedChatView').then((m) => ({ default: m.GroundedChatView }))
);
const MilestonesChecklistView = lazy(() =>
  import('./components/MilestonesChecklistView').then((m) => ({ default: m.MilestonesChecklistView }))
);
const AttorneyBriefView = lazy(() =>
  import('./components/AttorneyBriefView').then((m) => ({ default: m.AttorneyBriefView }))
);

/**
 * Tab Fallback Skeleton Loader
 */
function TabLoadingFallback() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[350px]">
      <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Loading Compliance View...
      </p>
    </div>
  );
}

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

  // App UI & Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Modals State
  const [showJurisdictionModal, setShowJurisdictionModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [selectedGuardrailClause, setSelectedGuardrailClause] = useState<FlaggedClause | null>(null);
  const [selectedRevisionClause, setSelectedRevisionClause] = useState<FlaggedClause | null>(null);

  // ==========================================
  // COMPLIANCE METRICS ENGINE (MEMOIZED)
  // ==========================================
  const { criticalCount, highCount, beforeScore, afterScore } = useMemo(() => {
    const total = clauses.length;
    const critical = clauses.filter((c) => c.riskLevel === 'critical' && !c.isRemediated).length;
    const high = clauses.filter((c) => c.riskLevel === 'high' && !c.isRemediated).length;

    const rawSumRisk = clauses.reduce((acc, curr) => acc + curr.riskScore, 0);
    const before = total > 0 ? Math.max(10, Math.round(100 - rawSumRisk / total)) : 100;

    const remediatedSumRisk = clauses.reduce((acc, curr) => acc + (curr.isRemediated ? 5 : curr.riskScore), 0);
    const after = total > 0 ? Math.max(15, Math.round(100 - remediatedSumRisk / total)) : 100;

    return {
      criticalCount: critical,
      highCount: high,
      beforeScore: before,
      afterScore: after,
    };
  }, [clauses]);

  // ==========================================
  // MEMOIZED HANDLERS FOR STABLE PROP REFERENCES
  // ==========================================

  const handleParseDocumentText = useCallback(
    async (text: string, title: string) => {
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
    },
    [activeCountry.code]
  );

  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = SAMPLE_CONTRACT_PRESETS.find((p) => p.id === presetId) ?? SAMPLE_CONTRACT_PRESETS[0];
    setIsAuditing(true);
    setContractFileName(preset.name);
    setActiveCountry(SUPPORTED_COUNTRIES[preset.jurisdictionCode]);

    setTimeout(() => {
      setClauses(preset.clauses);
      setMilestones(extractMilestoneDates(preset.clauses.map((c) => c.clauseText).join(' ')));
      setActiveClauseId(preset.clauses[0].id);
      setDetectedCountryCode(null);
      setIsAuditing(false);
    }, 250);
  }, []);

  const handleSwitchJurisdiction = useCallback((code: CountryCode) => {
    const country = SUPPORTED_COUNTRIES[code];
    if (country) {
      setActiveCountry(country);
      setClauses((prev) => prev.map((c) => ({ ...c, jurisdictionCode: code })));
    }
  }, []);

  const handleReviewAction = useCallback((id: string, status: HumanStatus, notes: string) => {
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
  }, []);

  const handleToggleRemediated = useCallback((id: string) => {
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
  }, []);

  // Modal controls
  const handleOpenJurisdictionModal = useCallback(() => setShowJurisdictionModal(true), []);
  const handleCloseJurisdictionModal = useCallback(() => setShowJurisdictionModal(false), []);

  const handleOpenApiKeyModal = useCallback(() => setShowApiKeyModal(true), []);
  const handleCloseApiKeyModal = useCallback(() => setShowApiKeyModal(false), []);

  const handleCloseGuardrailModal = useCallback(() => setSelectedGuardrailClause(null), []);
  const handleCloseRevisionModal = useCallback(() => setSelectedRevisionClause(null), []);

  const handleDismissAutoJurisdiction = useCallback(() => setDetectedCountryCode(null), []);

  const handleAutoJurisdictionSwitch = useCallback(
    (code: CountryCode) => {
      handleSwitchJurisdiction(code);
      setDetectedCountryCode(null);
    },
    [handleSwitchJurisdiction]
  );

  const handleSelectClauseFromDashboard = useCallback((id: string) => {
    setActiveClauseId(id);
    setActiveTab('audit');
  }, []);

  const handleExportReport = useCallback(() => {
    downloadExecutiveAuditReport(contractFileName, activeCountry, clauses, beforeScore, afterScore);
  }, [contractFileName, activeCountry, clauses, beforeScore, afterScore]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 selection:bg-sky-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* MANDATORY DISCLAIMER BANNER */}
        <DisclaimerBanner country={activeCountry} />

        {/* WORKBENCH HEADER */}
        <Header
          activeCountry={activeCountry}
          onOpenJurisdictionModal={handleOpenJurisdictionModal}
          onOpenApiKeyModal={handleOpenApiKeyModal}
          onExportReport={handleExportReport}
          hasApiKey={Boolean(geminiApiKey)}
        />

        {/* AUTO-JURISDICTION DETECTOR PROMPT BANNER */}
        {detectedCountryCode && (
          <AutoJurisdictionBanner
            detectedCode={detectedCountryCode}
            activeCode={activeCountry.code}
            onSwitchJurisdiction={handleAutoJurisdictionSwitch}
            onDismiss={handleDismissAutoJurisdiction}
          />
        )}

        {/* DOCUMENT AI PARSER INPUT PANEL */}
        <DocumentParser
          onParseText={handleParseDocumentText}
          onLoadPreset={handleLoadPreset}
          isAuditing={isAuditing}
          currentFileName={contractFileName}
        />

        {/* SIDEBAR + WORKSPACE LAYOUT */}
        <div className="flex gap-6 items-start">
          {/* VERTICAL TAB SIDEBAR */}
          <TabNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            unresolvedCount={criticalCount + highCount}
          />

          {/* TAB WORKSPACE CONTENT WITH LAZY SUSPENSE */}
          <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 outline-none">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                clauses={clauses}
                activeCountry={activeCountry}
                onSelectClause={handleSelectClauseFromDashboard}
                beforeScore={beforeScore}
                afterScore={afterScore}
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

            <Suspense fallback={<TabLoadingFallback />}>
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
            </Suspense>
          </main>
        </div>
      </div>

      {/* MODALS */}
      <JurisdictionSelector
        isOpen={showJurisdictionModal}
        onClose={handleCloseJurisdictionModal}
        activeCountry={activeCountry}
        onSelectCountry={handleSwitchJurisdiction}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={handleCloseApiKeyModal}
        apiKey={geminiApiKey}
        onSaveApiKey={setGeminiApiKey}
      />

      <StatutoryGuardrailModal
        isOpen={Boolean(selectedGuardrailClause)}
        onClose={handleCloseGuardrailModal}
        clause={selectedGuardrailClause}
        country={activeCountry}
      />

      <RevisionModal
        isOpen={Boolean(selectedRevisionClause)}
        onClose={handleCloseRevisionModal}
        clause={selectedRevisionClause}
        country={activeCountry}
        onApplyRevision={handleToggleRemediated}
      />
    </div>
  );
}