
import DOMPurify from 'dompurify';

export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target']
    });
  }

  // Sanitize plain text (remove HTML and script tags)
  static sanitizeText(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Validate and sanitize email
  static sanitizeEmail(email: string): string | null {
    const sanitized = this.sanitizeText(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      return null;
    }
    
    return sanitized;
  }

  // Validate and sanitize URL
  static sanitizeUrl(url: string): string | null {
    try {
      const sanitized = this.sanitizeText(url);
      
      // Only allow http and https protocols
      if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        return `https://${sanitized}`;
      }
      
      // Validate URL format
      new URL(sanitized);
      return sanitized;
    } catch {
      return null;
    }
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      
      return true; // Request allowed
    };
  }
}
