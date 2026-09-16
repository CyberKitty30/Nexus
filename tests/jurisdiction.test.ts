import { describe, it, expect } from 'vitest';
import { SUPPORTED_COUNTRIES, detectJurisdictionFromText } from '../src/data/jurisdictions';
import { getGroundingForCategory } from '../src/data/statutoryDatabase';
import { checkRateLimit, maskApiKey } from '../src/middleware/security';

describe('Jurisdiction & Security Extended Test Suite', () => {
  it('should support all 8 target global legal jurisdictions', () => {
    const keys = Object.keys(SUPPORTED_COUNTRIES);
    expect(keys).toEqual(['IN', 'UK', 'US', 'DE', 'UAE', 'SG', 'AU', 'CA']);
    expect(SUPPORTED_COUNTRIES.IN.flag).toBe('🇮🇳');
    expect(SUPPORTED_COUNTRIES.UK.flag).toBe('🇬🇧');
    expect(SUPPORTED_COUNTRIES.US.flag).toBe('🇺🇸');
    expect(SUPPORTED_COUNTRIES.DE.flag).toBe('🇩🇪');
    expect(SUPPORTED_COUNTRIES.UAE.flag).toBe('🇦🇪');
  });

  it('should auto-detect UAE law from text keywords', () => {
    const text = 'This agreement is governed by the laws of DIFC Dubai UAE.';
    expect(detectJurisdictionFromText(text)).toBe('UAE');
  });

  it('should auto-detect Singapore law from text keywords', () => {
    const text = 'Governed by Singapore Law under Personal Data Protection Act PDPA.';
    expect(detectJurisdictionFromText(text)).toBe('SG');
  });

  it('should auto-detect Australia law from text keywords', () => {
    const text = 'Subject to Australian Consumer Law ACL and Federal Court of Australia.';
    expect(detectJurisdictionFromText(text)).toBe('AU');
  });

  it('should auto-detect Canada law from text keywords', () => {
    const text = 'Governed by PIPEDA and laws of Ontario Canada.';
    expect(detectJurisdictionFromText(text)).toBe('CA');
  });

  it('should return statutory grounding for EU AI Act in Germany', () => {
    const grounding = getGroundingForCategory('DE', 'EU_AI_ACT');
    expect(grounding).not.toBeNull();
    expect(grounding?.statuteName).toContain('EU Artificial Intelligence Act');
  });

  it('should mask API keys securely', () => {
    expect(maskApiKey('AIzaSyD-1234567890-ABCDEFG')).toBe('AIza...DEFG');
    expect(maskApiKey('')).toBe('****');
  });

  it('should rate-limit rapid client calls correctly', () => {
    const clientId = 'test-client-unique-99';
    expect(checkRateLimit(clientId, 1000)).toBe(true);
    expect(checkRateLimit(clientId, 1000)).toBe(false); // Throttled
  });
});
