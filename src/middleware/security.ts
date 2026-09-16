/**
 * Security Middleware Bridge
 * Delegates to master SecurityService for DRY, zero-duplication security operations.
 */

import { securityService } from '../services/securityService';

export interface SanitizationResult {
  sanitizedText: string;
  isThreatDetected: boolean;
  threatType?: 'PROMPT_INJECTION' | 'SCRIPT_EXECUTION' | 'PAYLOAD_OVERFLOW';
  warningMessage?: string;
}

/**
 * Sanitizes user input against XSS, script execution, and prompt injection attacks
 */
export function sanitizeInput(rawInput: string, maxCharLimit = 50000): SanitizationResult {
  const res = securityService.sanitizeInput(rawInput, maxCharLimit);
  return {
    sanitizedText: res.sanitizedText,
    isThreatDetected: res.hasViolation,
    threatType: res.threatType,
    warningMessage: res.hasViolation ? `Input sanitized: ${res.violations.join('; ')}` : undefined,
  };
}

/**
 * Validates Environment Secret Configuration securely without leaks
 */
export function getValidatedEnvironmentSecret(keyName: string): string | null {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[keyName]) {
    const val = String(import.meta.env[keyName]);
    if (val && val.trim() !== '') return val.trim();
  }
  return null;
}

/**
 * Masks sensitive API keys for secure console logging & UI display
 */
export function maskApiKey(apiKey: string): string {
  return securityService.maskApiKey(apiKey);
}

/**
 * Client-Side Rate Limiter to prevent API payload abuse
 */
export function checkRateLimit(clientId = 'default_client', limitMs = 500): boolean {
  return securityService.checkRateLimit(clientId, limitMs);
}
