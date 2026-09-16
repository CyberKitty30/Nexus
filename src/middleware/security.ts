/**
 * Security Middleware & Input Sanitization Engine
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
  /eval\s*\(/i,
  /exec\s*\(/i,
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
      detectedType = pattern.source.includes('script') || pattern.source.includes('javascript') || pattern.source.includes('eval')
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
 * Validates Environment Secret Configuration securely without leaks
 */
export function getValidatedEnvironmentSecret(keyName: string): string | null {
  if (typeof process !== 'undefined' && process.env && process.env[keyName]) {
    const val = process.env[keyName];
    if (val && val.trim() !== '') return val.trim();
  }
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
  if (!apiKey || apiKey.length < 8) return '****';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

/**
 * Client-Side Rate Limiter to prevent API payload abuse
 */
const rateLimitTracker = new Map<string, number>();

export function checkRateLimit(clientId: string, limitMs = 500): boolean {
  const now = Date.now();
  const lastCall = rateLimitTracker.get(clientId) || 0;
  if (now - lastCall < limitMs) {
    return false; // Rate limit exceeded
  }
  rateLimitTracker.set(clientId, now);
  return true; // Allowed
}
