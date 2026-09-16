/**
 * NEXUS AI — Legal Domain Types Unit Tests
 * Tests data integrity, type guards, and contract preset structure.
 */

import { describe, it, expect } from 'vitest';
import { SAMPLE_CONTRACT_PRESETS } from '../src/data/sampleContracts';
import { SUPPORTED_COUNTRIES, DEFAULT_JURISDICTION } from '../src/data/jurisdictions';
import { extractMilestoneDates } from '../src/services/documentAiService';
import type { FlaggedClause, CountryConfig } from '../src/types/legal';

describe('SUPPORTED_COUNTRIES', () => {
  it('has at least 8 supported jurisdictions', () => {
    expect(Object.keys(SUPPORTED_COUNTRIES).length).toBeGreaterThanOrEqual(8);
  });

  it('every country has required fields', () => {
    const required: (keyof CountryConfig)[] = ['code', 'name', 'flag', 'currency', 'primaryStatutes', 'legalSystem'];
    for (const [code, config] of Object.entries(SUPPORTED_COUNTRIES)) {
      for (const field of required) {
        expect(config[field], `${code} missing field: ${field}`).toBeDefined();
      }
    }
  });

  it('every country has at least one primary statute', () => {
    for (const [code, config] of Object.entries(SUPPORTED_COUNTRIES)) {
      expect(config.primaryStatutes.length, `${code} has no primary statutes`).toBeGreaterThan(0);
    }
  });

  it('DEFAULT_JURISDICTION is a valid country code', () => {
    expect(SUPPORTED_COUNTRIES[DEFAULT_JURISDICTION]).toBeDefined();
  });

  it('India (IN) jurisdiction has Section 27 in statutes', () => {
    const india = SUPPORTED_COUNTRIES['IN'];
    const hasSection27 = india.primaryStatutes.some(s => s.includes('Indian Contract Act') || s.includes('Section 27'));
    expect(hasSection27).toBe(true);
  });
});

describe('SAMPLE_CONTRACT_PRESETS', () => {
  it('has at least 2 contract presets', () => {
    expect(SAMPLE_CONTRACT_PRESETS.length).toBeGreaterThanOrEqual(2);
  });

  it('every preset has required structure', () => {
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.jurisdictionCode).toBeDefined();
      expect(Array.isArray(preset.clauses)).toBe(true);
      expect(preset.clauses.length).toBeGreaterThan(0);
    }
  });

  it('every clause has required FlaggedClause fields', () => {
    const requiredFields: (keyof FlaggedClause)[] = [
      'id', 'section', 'clauseText', 'simplifiedText', 'riskLevel', 'riskScore',
      'aiVerdict', 'negotiationPaths', 'guardrail', 'humanStatus', 'isRemediated'
    ];
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      for (const clause of preset.clauses) {
        for (const field of requiredFields) {
          expect(clause[field], `Clause ${clause.id} missing: ${field}`).toBeDefined();
        }
      }
    }
  });

  it('clause riskScore is within 0-100 range', () => {
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      for (const clause of preset.clauses) {
        expect(clause.riskScore).toBeGreaterThanOrEqual(0);
        expect(clause.riskScore).toBeLessThanOrEqual(100);
      }
    }
  });

  it('all negotiationPaths have aggressive, balanced, and conservative options', () => {
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      for (const clause of preset.clauses) {
        expect(clause.negotiationPaths.aggressive).toBeDefined();
        expect(clause.negotiationPaths.balanced).toBeDefined();
        expect(clause.negotiationPaths.conservative).toBeDefined();
      }
    }
  });

  it('aiConfidence is between 0 and 1', () => {
    for (const preset of SAMPLE_CONTRACT_PRESETS) {
      for (const clause of preset.clauses) {
        expect(clause.aiConfidence).toBeGreaterThanOrEqual(0);
        expect(clause.aiConfidence).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('extractMilestoneDates()', () => {
  it('extracts renewal dates from text', () => {
    const text = 'This contract renews on 2026-03-31. Notice must be given 90 days prior.';
    const milestones = extractMilestoneDates(text);
    expect(Array.isArray(milestones)).toBe(true);
    expect(milestones.length).toBeGreaterThan(0);
  });

  it('returns array even for empty text', () => {
    const milestones = extractMilestoneDates('');
    expect(Array.isArray(milestones)).toBe(true);
  });

  it('every milestone has required fields', () => {
    const text = 'Renewal date: December 31, 2026. Payment due 2026-06-15.';
    const milestones = extractMilestoneDates(text);
    for (const m of milestones) {
      expect(m.id).toBeDefined();
      expect(m.title).toBeDefined();
      expect(m.date).toBeDefined();
      expect(m.type).toBeDefined();
    }
  });
});
