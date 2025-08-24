import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface AuditEvent {
  timestamp: number;
  userId?: string;
  action: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: AuditEvent[] = [];
  private maxEvents = 1000;

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  logEvent(action: string, details: Record<string, any> = {}, severity: AuditEvent['severity'] = 'medium', userId?: string): void {
    const event: AuditEvent = {
      timestamp: Date.now(),
      userId,
      action,
      details,
      severity
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for development (remove in production)
    console.log(`[SECURITY AUDIT] ${action}`, event);

    // For critical events, you might want to send to a security monitoring service
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  private handleCriticalEvent(event: AuditEvent): void {
    // In a production app, send this to your security monitoring service
    console.error('[CRITICAL SECURITY EVENT]', event);
    
    // Store critical events in localStorage for now
    const criticalEvents = JSON.parse(localStorage.getItem('prism_critical_events') || '[]');
    criticalEvents.push(event);
    localStorage.setItem('prism_critical_events', JSON.stringify(criticalEvents.slice(-100))); // Keep last 100
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  getEventsByUserId(userId: string): AuditEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const auditLogger = SecurityAuditLogger.getInstance();

interface SecurityAuditProviderProps {
  children: React.ReactNode;
}

const SecurityAuditProvider: React.FC<SecurityAuditProviderProps> = ({ children }) => {
  const { userId } = useAuth();

  useEffect(() => {
    // Log user session start
    if (userId) {
      auditLogger.logEvent('user_session_start', { userId }, 'low', userId);
    }

    // Log page visibility changes (potential security concern if user leaves sensitive page open)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        auditLogger.logEvent('page_hidden', { url: window.location.href }, 'low', userId);
      } else {
        auditLogger.logEvent('page_visible', { url: window.location.href }, 'low', userId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (userId) {
        auditLogger.logEvent('user_session_end', { userId }, 'low', userId);
      }
    };
  }, [userId]);

  return <>{children}</>;
};

export default SecurityAuditProvider;
