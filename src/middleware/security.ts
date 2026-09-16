/**
 * Security Middleware & Input Sanitization
 * Enforces zero hardcoded secrets, prompt injection defense, XSS protection, and payload boundaries.
 */

export interface SanitizationResult {
  sanitizedText: string;
  isThreatDetected: boolean;
  threatType?: 'PROMPT_INJECTION' | 'SCRIPT_EXECUTION' | 'PAYLOAD_OVERFLOW';
  warningMessage?: string;
}

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+all\s+previous\s+instructions/i,
  /disregard\s+the\s+above/i,
  /you\s+are\s+now\s+a/i,
  /system\s*:\s*override/i,
  /jailbreak/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/i,
  /onerror\s*=/i,
];

/**
 * Sanitizes user input against XSS, script execution, and prompt injection attacks
 */
export function sanitizeInput(rawInput: string, maxCharLimit = 50000): SanitizationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { sanitizedText: '', isThreatDetected: false };
  }

  // 1. Check Payload Size Boundary
  if (rawInput.length > maxCharLimit) {
    return {
      sanitizedText: rawInput.slice(0, maxCharLimit),
      isThreatDetected: true,
      threatType: 'PAYLOAD_OVERFLOW',
      warningMessage: `Payload truncated to maximum allowed size of ${maxCharLimit} characters.`
    };
  }

  let sanitized = rawInput;
  let threatDetected = false;
  let detectedType: 'PROMPT_INJECTION' | 'SCRIPT_EXECUTION' | undefined;

  // 2. Check for Prompt Injection & Script Injection Patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      threatDetected = true;
      detectedType = pattern.source.includes('script') || pattern.source.includes('javascript')
        ? 'SCRIPT_EXECUTION'
        : 'PROMPT_INJECTION';
      sanitized = sanitized.replace(pattern, '[REDACTED_SECURITY_RISK]');
    }
  }

  // 3. HTML Escaping for rendering safety
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return {
    sanitizedText: sanitized,
    isThreatDetected: threatDetected,
    threatType: detectedType,
    warningMessage: threatDetected ? `Input sanitized: Potential ${detectedType} pattern disarmed.` : undefined
  };
}

/**
 * Validates Environment Secret Configuration
 */
export function getValidatedEnvironmentSecret(keyName: string): string | null {
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[keyName];
    if (val && val.trim() !== '') return val;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[keyName];
    if (val && val.trim() !== '') return val;
  }
  return null;
}
