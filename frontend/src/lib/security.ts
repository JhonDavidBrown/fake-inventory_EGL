/**
 * Security utilities for input sanitization and validation
 * Replaces the basic validation.ts with more robust security measures
 */

// For now, we'll use a more robust sanitization without DOMPurify
// to avoid adding another dependency. In production, consider adding isomorphic-dompurify

/**
 * Comprehensive input sanitization that prevents XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string safe for rendering
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: urls
    .replace(/javascript:/gi, '')
    // Remove data: urls
    .replace(/data:/gi, '')
    // Remove vbscript: urls
    .replace(/vbscript:/gi, '')
    // Escape remaining dangerous characters
    .replace(/[<>'"&]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[char] || char;
    });
}

/**
 * Sanitize HTML content while preserving safe tags
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // List of allowed tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'span', 'div'];

  let sanitized = html;

  // Remove all script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove all event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous URLs
  sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, '');

  // Remove tags not in allowed list
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return '';
    }
    return match;
  });

  return sanitized;
}

/**
 * Validate and sanitize numeric input
 * @param input - Input to validate as number
 * @param options - Validation options
 * @returns Validated number or null if invalid
 */
export function sanitizeNumber(
  input: string | number,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    allowNegative?: boolean;
  } = {}
): number | null {
  const {
    min,
    max,
    allowDecimals = true,
    allowNegative = false,
  } = options;

  // Convert to string first to sanitize
  const stringInput = String(input).trim();
  
  // Remove any non-numeric characters except decimal point and minus
  const cleanInput = stringInput.replace(/[^0-9.-]/g, '');
  
  // Parse as number
  const num = allowDecimals ? parseFloat(cleanInput) : parseInt(cleanInput, 10);
  
  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  // Check negative constraint
  if (!allowNegative && num < 0) {
    return null;
  }
  
  // Check min/max constraints
  if (min !== undefined && num < min) {
    return null;
  }
  
  if (max !== undefined && num > max) {
    return null;
  }
  
  return num;
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate and sanitize file paths to prevent directory traversal
 * @param filename - Filename to validate
 * @returns Sanitized filename or null if invalid
 */
export function sanitizeFilename(filename: string): string | null {
  if (typeof filename !== 'string') {
    return null;
  }

  // Remove directory traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .trim();

  // Check if filename is still valid after sanitization
  if (sanitized.length === 0 || sanitized.length > 255) {
    return null;
  }

  return sanitized;
}

/**
 * Rate limiting helper for form submissions
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  /**
   * Check if action is rate limited
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns True if rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Filter out attempts outside the time window
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Update stored attempts
    this.attempts.set(identifier, recentAttempts);
    
    // Check if rate limited
    return recentAttempts.length >= this.maxAttempts;
  }

  /**
   * Record an attempt
   * @param identifier - Unique identifier
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }

  /**
   * Reset attempts for an identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Validate request origin against allowed origins
 * @param origin - Request origin
 * @param allowedOrigins - Array of allowed origins
 * @returns True if origin is allowed
 */
export function validateOrigin(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) {
    return false;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Generate a secure random token
 * @param length - Token length
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

// Re-export for backward compatibility
export { sanitizeInput as sanitizeString };