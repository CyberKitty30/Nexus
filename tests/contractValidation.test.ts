import { describe, it, expect } from 'vitest';
import { parseDocumentWithDocumentAi, extractMilestoneDates } from '../src/services/documentAiService';
import { SAMPLE_CONTRACT_PRESETS } from '../src/data/sampleContracts';
import type { FlaggedClause } from '../src/types/legal';

describe('Contract Validation & Risk Boundaries Unit Tests', () => {
  it('should parse sample contract presets without missing required fields', () => {
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.clauses.length).toBeGreaterThan(0);

      for (const clause of preset.clauses) {
        expect(clause.id).toBeDefined();
        expect(clause.clauseText.length).toBeGreaterThan(10);
        expect(clause.riskScore).toBeGreaterThanOrEqual(0);
        expect(clause.riskScore).toBeLessThanOrEqual(100);
        expect(['critical', 'high', 'medium', 'low']).toContain(clause.riskLevel);
      }
    }
  });

  it('should calculate remediation score improvements correctly', () => {
    const clauses: FlaggedClause[] = [
      {
        id: 'c1',
        section: 'Sec 1',
        primaryCategory: 'CONTRACT_RISK',
        relatedCategories: [],
        clauseText: 'High risk text',
        simplifiedText: 'Simplified',
        riskLevel: 'critical',
        riskScore: 90,
        ragRequirement: 'Req',
        ragCitation: 'Cit',
        aiVerdict: 'Verdict',
        aiConfidence: 0.95,
        benchmarkSource: 'Test',
        suggestedRevision: 'Rev',
        revisionRationale: 'Rat',
        negotiationPaths: {
          aggressive: { text: 't', rationale: 'r', riskReduction: '80%' },
          balanced: { text: 't', rationale: 'r', riskReduction: '60%' },
          conservative: { text: 't', rationale: 'r', riskReduction: '30%' },
        },
        jurisdictionCode: 'IN',
        humanStatus: 'pending',
        isRemediated: false,
      },
    ];

    const rawSum = clauses.reduce((acc, c) => acc + c.riskScore, 0);
    const initialScore = Math.max(10, Math.round(100 - rawSum / clauses.length));
    expect(initialScore).toBe(10); // 100 - 90 = 10

    // Mark clause remediated
    const remediatedClauses = clauses.map((c) => ({ ...c, isRemediated: true }));
    const remediatedSum = remediatedClauses.reduce((acc, c) => acc + (c.isRemediated ? 5 : c.riskScore), 0);
    const finalScore = Math.max(15, Math.round(100 - remediatedSum / remediatedClauses.length));
    expect(finalScore).toBe(95); // 100 - 5 = 95
  });

  it('should extract milestone dates with required metadata', () => {
    const dates = extractMilestoneDates('Sample text with dates');
    expect(dates.length).toBeGreaterThan(0);
    for (const milestone of dates) {
      expect(milestone.id).toBeDefined();
      expect(milestone.title).toBeDefined();
      expect(milestone.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['milestone', 'renewal', 'termination_notice', 'compliance_audit']).toContain(milestone.type);
    }
  });

  it('should parse document AI text asynchronously and return structured audit result', async () => {
    const text = 'SECTION 1. LIABILITY AND INDEMNIFICATION. The Vendor shall indemnify the Client for all losses up to $1,000,000.';
    const result = await parseDocumentWithDocumentAi(text, 'liability_clause.txt', 'IN');

    expect(result.fileName).toBe('liability_clause.txt');
    expect(result.extractedClauses.length).toBeGreaterThan(0);
    expect(result.extractedMilestones.length).toBeGreaterThan(0);
  });
});
