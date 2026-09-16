export type CountryCode = 'IN' | 'UK' | 'US' | 'DE' | 'UAE' | 'SG' | 'AU' | 'CA';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplianceCategory =
  | 'EU_AI_ACT'
  | 'GDPR_PRIVACY'
  | 'DATA_GOVERNANCE'
  | 'HUMAN_OVERSIGHT'
  | 'CYBERSECURITY'
  | 'CONTRACT_RISK'
  | 'RESTRAINT_OF_TRADE'
  | 'IP_OWNERSHIP'
  | 'GOVERNING_LAW'
  | 'TRANSPARENCY'
  | 'DATA_TRANSFER';

export type HumanStatus = 'pending' | 'approved' | 'flagged' | 'revision_requested';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  primaryStatutes: string[];
  governingLawKeywords: string[];
  description: string;
  legalSystem: string;
}

export interface GroundedCitation {
  statute: string;
  section: string;
  title: string;
  legalTextSnippet: string;
  enforceabilitySummary: string;
  confidence: number;
}

export interface NegotiationPaths {
  aggressive: {
    text: string;
    rationale: string;
    riskReduction: string;
  };
  balanced: {
    text: string;
    rationale: string;
    riskReduction: string;
  };
  conservative: {
    text: string;
    rationale: string;
    riskReduction: string;
  };
}

export interface StatutoryGuardrailInfo {
  isAmbiguous: boolean;
  ambiguityReason?: string;
  statutoryLimitation?: string;
  targetedAdvocateQuestions: string[];
}

export interface FlaggedClause {
  id: string;
  section: string;
  primaryCategory: ComplianceCategory;
  relatedCategories: ComplianceCategory[];
  clauseText: string;
  simplifiedText: string; // Use Case 1: 8th-grade translation
  jargonTerms: Array<{ term: string; definition: string }>; // Use Case 1: Jargon tooltips
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  ragRequirement: string;
  ragCitation: string;
  aiVerdict: string;
  aiConfidence: number;
  benchmarkSource: string;
  suggestedRevision: string;
  revisionRationale: string;
  negotiationPaths: NegotiationPaths; // Use Case 5: Aggressive / Balanced / Conservative
  guardrail: StatutoryGuardrailInfo; // Statutory Uncertainty Guardrail
  jurisdictionCode: CountryCode;
  humanStatus: HumanStatus;
  expertNotes?: string;
  isRemediated: boolean;
}

export interface MilestoneDate {
  id: string;
  title: string;
  date: string;
  type: 'renewal' | 'termination_notice' | 'payment' | 'compliance_audit' | 'milestone';
  clauseSection: string;
  description: string;
  isSyncedToCalendar?: boolean;
}

export interface ComplianceChecklistItem {
  id: string;
  task: string;
  category: ComplianceCategory;
  statutoryReference: string;
  completed: boolean;
  priority: 'must_have' | 'recommended' | 'optional';
}

export interface InconsistencyIssue {
  id: string;
  clauseA: string;
  clauseB: string;
  conflictDescription: string;
  severity: RiskLevel;
  recommendation: string;
}

export interface ContractComparisonItem {
  sectionTitle: string;
  docAClause: string;
  docBClause: string;
  diffType: 'modified' | 'added_in_b' | 'deleted_in_b' | 'identical';
  riskShift: 'safer' | 'riskier' | 'neutral';
  explanation: string;
}

export interface AttorneyBrief {
  title: string;
  generatedAt: string;
  contractTitle: string;
  jurisdictionName: string;
  executiveSummary: string;
  criticalRisksCount: number;
  highRisksCount: number;
  keyStatutoryViolations: Array<{ statute: string; clauseSection: string; violation: string }>;
  recommendedPositioning: string;
  targetedAdvocateQuestions: string[];
}
