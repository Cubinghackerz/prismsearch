
import { useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { auditLogger } from '@/components/security/SecurityAuditLogger';
import { InputSanitizer } from '@/utils/inputSanitization';

export const useSecurityMonitoring = () => {
  const { userId } = useAuth();
  
  // Rate limiter for authentication attempts
  const authRateLimiter = useCallback(
    InputSanitizer.createRateLimiter(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    []
  );

  // Rate limiter for API calls
  const apiRateLimiter = useCallback(
    InputSanitizer.createRateLimiter(100, 60 * 1000), // 100 requests per minute
    []
  );

  const logSecurityEvent = useCallback((action: string, details: Record<string, any> = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    auditLogger.logEvent(action, details, severity, userId);
  }, [userId]);

  const validateAuthAttempt = useCallback((identifier: string): boolean => {
    const allowed = authRateLimiter(identifier);
    
    if (!allowed) {
      logSecurityEvent('auth_rate_limit_exceeded', { identifier }, 'high');
      return false;
    }
    
    return true;
  }, [authRateLimiter, logSecurityEvent]);

  const validateApiRequest = useCallback((endpoint: string): boolean => {
    const identifier = userId || 'anonymous';
    const allowed = apiRateLimiter(identifier);
    
    if (!allowed) {
      logSecurityEvent('api_rate_limit_exceeded', { endpoint, userId: identifier }, 'medium');
      return false;
    }
    
    return true;
  }, [apiRateLimiter, logSecurityEvent, userId]);

  // Monitor for suspicious activity
  useEffect(() => {
    let failedAttempts = 0;
    const maxFailedAttempts = 3;

    const monitorFailedAuth = () => {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        logSecurityEvent('multiple_auth_failures', { 
          attempts: failedAttempts,
          timestamp: Date.now()
        }, 'critical');
      }
    };

    // Reset counter on successful auth
    const resetFailedAttempts = () => {
      failedAttempts = 0;
    };

    // Monitor console access (potential developer tools usage)
    const originalConsole = { ...console };
    let consoleAccessCount = 0;
    
    Object.keys(console).forEach(key => {
      const original = console[key as keyof Console];
      if (typeof original === 'function') {
        (console[key as keyof Console] as any) = function(...args: any[]) {
          consoleAccessCount++;
          if (consoleAccessCount > 10) {
            logSecurityEvent('excessive_console_usage', { 
              count: consoleAccessCount 
            }, 'medium');
          }
          return original.apply(console, args);
        };
      }
    });

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
    };
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    validateAuthAttempt,
    validateApiRequest
  };
};
