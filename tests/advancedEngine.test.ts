import { describe, it, expect } from 'vitest';
import { parseDocumentWithDocumentAi } from '../src/services/documentAiService';
import { syncToGoogleCalendar } from '../src/services/workspaceService';
import { getGroundingForCategory } from '../src/data/statutoryDatabase';
import { SUPPORTED_COUNTRIES } from '../src/data/jurisdictions';
import { sanitizeInput } from '../src/middleware/security';

describe('Advanced Legal Engine & Workspace Verification Suite', () => {
  it('should parse raw contract documents into extracted clauses and milestones', async () => {
    const rawDoc = `
      GOVERNING LAW: This Agreement shall be governed by the laws of India.
      SECTION 1: Non-compete for 3 years in India post termination.
      SECTION 2: Unlimited liability without cap.
      EFFECTIVE DATE: 2026-01-01.
    `;
    const result = await parseDocumentWithDocumentAi(rawDoc, 'Test Agreement', 'IN');
    expect(result.extractedClauses.length).toBeGreaterThan(0);
    expect(result.extractedMilestones.length).toBeGreaterThan(0);
    expect(result.detectedJurisdiction).toBe('IN');
  });

  it('should format valid Google Calendar render links for milestones', () => {
    const milestone = {
      id: 'm1',
      title: 'Contract Effective Date',
      date: '2026-01-01',
      type: 'effective_date' as const,
      clauseSection: 'Section 1.1',
      description: 'Effective date of contract',
    };
    const { calendarUrl } = syncToGoogleCalendar(milestone);
    expect(calendarUrl).toContain('calendar.google.com');
    expect(calendarUrl).toContain('Contract%20Effective%20Date');
  });

  it('should return statutory grounding for IN RESTRAINT_OF_TRADE', () => {
    const grounding = getGroundingForCategory('IN', 'RESTRAINT_OF_TRADE');
    expect(grounding).not.toBeNull();
    expect(grounding?.statuteName).toContain('Indian Contract Act');
  });

  it('should sanitize script tags in prompt injection defenses', () => {
    const malicious = '<script src="http://attacker.com/xss.js"></script>';
    const res = sanitizeInput(malicious);
    expect(res.isThreatDetected).toBe(true);
    expect(res.sanitizedText).not.toContain('<script>');
  });

  it('should validate support for all 8 country configs in SUPPORTED_COUNTRIES', () => {
    const countries = Object.values(SUPPORTED_COUNTRIES);
    expect(countries.length).toBe(8);
    for (const c of countries) {
      expect(c.code).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.flag).toBeDefined();
    }
  });
});
