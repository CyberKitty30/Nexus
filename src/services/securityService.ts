/**
 * SecurityService
 * Enterprise-grade security utilities for input sanitization, prompt injection prevention,
 * PII masking, rate-limiting, and API Key integrity validation.
 */

export interface SecuritySanitizeResult {
  sanitizedText: string;
  hasViolation: boolean;
  violations: string[];
  threatType?: 'PROMPT_INJECTION' | 'SCRIPT_EXECUTION' | 'PAYLOAD_OVERFLOW';
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+all\s+previous\s+instructions/gi,
  /ignore\s+previous\s+instructions/gi,
  /disregard\s+all\s+prior\s+rules/gi,
  /disregard\s+the\s+above/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /you\s+are\s+now\s+a/gi,
  /system\s*:\s*override/gi,
  /system\s+prompt\s+override/gi,
  /jailbreak/gi,
];

class SecurityService {
  private rateLimitMap = new Map<string, number>();

  /**
   * Sanitizes user and document text against XSS, HTML injection, and prompt injection attempts.
   */
  public sanitizeInput(input: string, maxCharLimit = 50000): SecuritySanitizeResult {
    if (!input || typeof input !== 'string') {
      return { sanitizedText: '', hasViolation: false, violations: [] };
    }

    const violations: string[] = [];
    let threatType: 'PROMPT_INJECTION' | 'SCRIPT_EXECUTION' | 'PAYLOAD_OVERFLOW' | undefined;
    let workingText = input;

    // 1. Check payload size boundary
    if (workingText.length > maxCharLimit) {
      violations.push(`Payload truncated to maximum allowed size of ${maxCharLimit} characters.`);
      threatType = 'PAYLOAD_OVERFLOW';
      workingText = workingText.slice(0, maxCharLimit);
    }

    // 2. Check for XSS / Script tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(workingText) || /javascript:/gi.test(workingText) || /eval\s*\(/gi.test(workingText)) {
      violations.push('XSS script execution payload detected');
      threatType = 'SCRIPT_EXECUTION';
    }

    // Check for HTML event handler injections
    if (/on\w+\s*=\s*["'][^"']*["']/gi.test(workingText)) {
      violations.push('HTML event handler injection detected');
      if (!threatType) threatType = 'SCRIPT_EXECUTION';
    }

    // 3. Check for Prompt Injection / Override directives and replace with REDACTED placeholder
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(workingText)) {
        violations.push('Prompt injection or instruction override payload detected');
        if (!threatType) threatType = 'PROMPT_INJECTION';
        workingText = workingText.replace(pattern, '[REDACTED_SECURITY_RISK]');
      }
    }

    // 4. Perform safe HTML entity encoding
    const sanitizedText = workingText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return {
      sanitizedText,
      hasViolation: violations.length > 0,
      violations,
      threatType,
    };
  }

  /**
   * Masks Personally Identifiable Information (PII) before external transmission or AI analysis.
   */
  public maskPII(text: string): string {
    if (!text) return '';

    return text
      // Mask Email Addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[CONFIDENTIAL_EMAIL]')
      // Mask Phone Numbers (US/International standard format)
      .replace(/\b(?:\+\d{1,3}[-  ]?)?\(?\d{3}\)?[-  ]?\d{3}[-  ]?\d{4}\b/g, '[CONFIDENTIAL_PHONE]')
      // Mask Social Security Numbers (US SSN)
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[CONFIDENTIAL_SSN]')
      // Mask Credit Card Numbers
      .replace(/\b(?:\d{4}[-  ]?){3}\d{4}\b/g, '[CONFIDENTIAL_CARD]');
  }

  /**
   * Enforces client-side rate limiting per client ID to prevent spam and denial of service.
   */
  public checkRateLimit(clientId = 'default_client', limitMs = 500): boolean {
    const now = Date.now();
    const lastTimestamp = this.rateLimitMap.get(clientId) ?? 0;

    if (now - lastTimestamp < limitMs) {
      return false; // Rate limit exceeded (throttled)
    }

    this.rateLimitMap.set(clientId, now);
    return true;
  }

  /**
   * Validates Gemini API Key string structure and integrity
   */
  public isValidApiKeyFormat(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(trimmed);
  }

  /**
   * Masks sensitive API keys for UI display
   */
  public maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '****';
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  }
}

export const securityService = new SecurityService();
