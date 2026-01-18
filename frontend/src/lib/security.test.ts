import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  sanitizeHTML,
  sanitizeNumber,
  isValidEmail,
  sanitizeFilename,
  RateLimiter,
  validateOrigin,
  generateSecureToken,
} from './security'

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello')
      expect(result).not.toContain('<script>')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Content</div>'
      const result = sanitizeInput(input)
      expect(result).not.toContain('onclick')
      expect(result).toBe('Content')
    })

    it('should remove javascript: urls', () => {
      const input = 'javascript:alert(1)'
      const result = sanitizeInput(input)
      expect(result).not.toContain('javascript:')
    })

    it('should escape dangerous characters', () => {
      const input = '<>&"\''
      const result = sanitizeInput(input)
      expect(result).toBe('&lt;&gt;&amp;&quot;&#x27;')
    })

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('')
      expect(sanitizeInput(undefined as unknown as string)).toBe('')
    })
  })

  describe('sanitizeHTML', () => {
    it('should preserve allowed tags', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should remove disallowed tags', () => {
      const input = '<p>Hello</p><script>alert(1)</script>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<p>')
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizeNumber', () => {
    it('should parse valid numbers', () => {
      expect(sanitizeNumber('123')).toBe(123)
      expect(sanitizeNumber('123.45')).toBe(123.45)
      expect(sanitizeNumber(456)).toBe(456)
    })

    it('should handle invalid input', () => {
      expect(sanitizeNumber('abc')).toBeNull()
      expect(sanitizeNumber('')).toBeNull()
    })

    it('should respect min/max constraints', () => {
      expect(sanitizeNumber('5', { min: 10 })).toBeNull()
      expect(sanitizeNumber('15', { max: 10 })).toBeNull()
      expect(sanitizeNumber('8', { min: 5, max: 10 })).toBe(8)
    })

    it('should handle negative numbers', () => {
      expect(sanitizeNumber('-5', { allowNegative: false })).toBeNull()
      expect(sanitizeNumber('-5', { allowNegative: true })).toBe(-5)
    })

    it('should handle decimal constraint', () => {
      expect(sanitizeNumber('123.45', { allowDecimals: false })).toBe(123)
      expect(sanitizeNumber('123.45', { allowDecimals: true })).toBe(123.45)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('sanitizeFilename', () => {
    it('should sanitize dangerous filenames', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd')
      expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file.txt')
    })

    it('should handle valid filenames', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf')
      expect(sanitizeFilename('image_123.jpg')).toBe('image_123.jpg')
    })

    it('should return null for invalid input', () => {
      expect(sanitizeFilename('')).toBeNull()
      expect(sanitizeFilename('a'.repeat(300))).toBeNull()
    })
  })

  describe('RateLimiter', () => {
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter(3, 1000)
      const userId = 'test-user'

      expect(limiter.isRateLimited(userId)).toBe(false)
      limiter.recordAttempt(userId)
      
      expect(limiter.isRateLimited(userId)).toBe(false)
      limiter.recordAttempt(userId)
      
      expect(limiter.isRateLimited(userId)).toBe(false)
      limiter.recordAttempt(userId)
      
      expect(limiter.isRateLimited(userId)).toBe(true)
    })

    it('should reset after time window', async () => {
      const limiter = new RateLimiter(1, 10) // 10ms window
      const userId = 'test-user'

      limiter.recordAttempt(userId)
      expect(limiter.isRateLimited(userId)).toBe(true)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(limiter.isRateLimited(userId)).toBe(false)
    })
  })

  describe('validateOrigin', () => {
    const allowedOrigins = ['https://example.com', 'https://app.example.com']

    it('should allow valid origins', () => {
      expect(validateOrigin('https://example.com', allowedOrigins)).toBe(true)
      expect(validateOrigin('https://app.example.com', allowedOrigins)).toBe(true)
    })

    it('should reject invalid origins', () => {
      expect(validateOrigin('https://malicious.com', allowedOrigins)).toBe(false)
      expect(validateOrigin(null, allowedOrigins)).toBe(false)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate tokens of correct length', () => {
      expect(generateSecureToken(16)).toHaveLength(16)
      expect(generateSecureToken(32)).toHaveLength(32)
    })

    it('should generate different tokens', () => {
      const token1 = generateSecureToken(16)
      const token2 = generateSecureToken(16)
      expect(token1).not.toBe(token2)
    })

    it('should only contain allowed characters', () => {
      const token = generateSecureToken(100)
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })
  })
})