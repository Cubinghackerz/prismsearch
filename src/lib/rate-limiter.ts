
interface RateLimit {
  count: number;
  resetTime: number;
  lastRequest: number;
}

const rateLimits = new Map<string, RateLimit>();

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
  limit?: number;
}

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const userLimit = rateLimits.get(identifier);

  // Clean up old entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredLimits();
  }

  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      lastRequest: now,
    });
    return { 
      allowed: true, 
      remaining: maxRequests - 1,
      limit: maxRequests
    };
  }

  if (userLimit.count >= maxRequests) {
    return { 
      allowed: false, 
      resetTime: userLimit.resetTime,
      remaining: 0,
      limit: maxRequests
    };
  }

  userLimit.count++;
  userLimit.lastRequest = now;
  
  return { 
    allowed: true,
    remaining: maxRequests - userLimit.count,
    limit: maxRequests
  };
}

function cleanupExpiredLimits(): void {
  const now = Date.now();
  for (const [key, limit] of rateLimits.entries()) {
    if (now > limit.resetTime) {
      rateLimits.delete(key);
    }
  }
}

export function getRateLimitInfo(identifier: string): RateLimitResult | null {
  const userLimit = rateLimits.get(identifier);
  if (!userLimit) return null;
  
  const now = Date.now();
  if (now > userLimit.resetTime) {
    rateLimits.delete(identifier);
    return null;
  }
  
  return {
    allowed: userLimit.count < 10, // Default limit
    resetTime: userLimit.resetTime,
    remaining: Math.max(0, 10 - userLimit.count),
    limit: 10
  };
}
