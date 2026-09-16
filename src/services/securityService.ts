/**
 * SecurityService
 * Enterprise-grade security utilities for input sanitization, prompt injection prevention,
 * PII masking, rate-limiting, and API Key integrity validation.
 */

export interface SecuritySanitizeResult {
  sanitizedText: string;
  hasViolation: boolean;
  violations: string[];
}

class SecurityService {
  private requestTimestamps: number[] = [];
  private readonly maxRequestsPerMinute = 60;

  /**
   * Sanitizes user and document text against XSS, HTML injection, and prompt injection attempts.
   */
  public sanitizeInput(input: string): SecuritySanitizeResult {
    if (!input || typeof input !== 'string') {
      return { sanitizedText: '', hasViolation: false, violations: [] };
    }

    const violations: string[] = [];

    // Check for XSS / Script tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input) || /javascript:/gi.test(input)) {
      violations.push('XSS script execution payload detected');
    }

    // Check for HTML event handler injections
    if (/on\w+\s*=\s*["'][^"']*["']/gi.test(input)) {
      violations.push('HTML event handler injection detected');
    }

    // Check for Prompt Injection / Override directives
    const promptInjectionPatterns = [
      /ignore previous instructions/gi,
      /disregard all prior rules/gi,
      /you are now in developer mode/gi,
      /system prompt override/gi,
      /jailbreak/gi,
    ];

    for (const pattern of promptInjectionPatterns) {
      if (pattern.test(input)) {
        violations.push('Prompt injection or instruction override payload detected');
        break;
      }
    }

    // Perform safe HTML entity encoding
    let sanitizedText = input
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
   * Enforces client-side rate limiting to prevent spam and denial of service.
   */
  public checkRateLimit(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter((ts) => now - ts < 60000);

    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      return false; // Rate limit exceeded
    }

    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Validates Gemini API Key string structure and integrity
   */
  public isValidApiKeyFormat(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    // Valid Gemini API key format check (starts with AIza and contains ~39 chars)
    return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(trimmed);
  }
}

export const securityService = new SecurityService();
