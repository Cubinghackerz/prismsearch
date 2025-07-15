import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Heart, Clock, RefreshCw, Info, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BreachDetectionService from '@/services/breachDetectionService';
interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_favorite?: boolean;
  breach_status?: 'safe' | 'breached' | 'checking';
  breach_count?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  breach_recommendations?: string[];
}
interface PasswordSecurityDashboardProps {
  passwords: StoredPassword[];
  onPasswordUpdate: (id: string, updates: Partial<StoredPassword>) => void;
}
export const PasswordSecurityDashboard: React.FC<PasswordSecurityDashboardProps> = ({
  passwords,
  onPasswordUpdate
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showBreachDetails, setShowBreachDetails] = useState(false);
  const {
    toast
  } = useToast();
  const expiredPasswords = passwords.filter(p => p.expires_at && new Date(p.expires_at) < new Date());
  const expiringSoonPasswords = passwords.filter(p => {
    if (!p.expires_at) return false;
    const expiryDate = new Date(p.expires_at);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate > now && expiryDate <= thirtyDaysFromNow;
  });
  const breachedPasswords = passwords.filter(p => p.breach_status === 'breached');
  const criticalRiskPasswords = passwords.filter(p => p.risk_level === 'critical');
  const highRiskPasswords = passwords.filter(p => p.risk_level === 'high');
  const favoritePasswords = passwords.filter(p => p.is_favorite);
  const runEnhancedSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    const stats = BreachDetectionService.getBreachStatistics();
    console.log('Starting enhanced security scan with stats:', stats);
    for (let i = 0; i < passwords.length; i++) {
      const password = passwords[i];
      try {
        onPasswordUpdate(password.id, {
          breach_status: 'checking'
        });
        const breachData = await BreachDetectionService.checkPasswordBreach(password.password_encrypted);
        onPasswordUpdate(password.id, {
          breach_status: breachData.isBreached ? 'breached' : 'safe',
          breach_count: breachData.breachCount,
          risk_level: breachData.riskLevel,
          breach_recommendations: breachData.recommendations
        });
        setScanProgress((i + 1) / passwords.length * 100);

        // Add small delay to avoid overwhelming the API
        if (i < passwords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('Error checking password breach:', error);
        onPasswordUpdate(password.id, {
          breach_status: 'safe'
        });
      }
    }
    setIsScanning(false);
    setScanProgress(0);
    const finalStats = BreachDetectionService.getBreachStatistics();
    toast({
      title: "Enhanced security scan completed",
      description: `Scanned ${passwords.length} passwords. Found ${breachedPasswords.length} breached passwords with detailed risk analysis.`
    });
  };
  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-black';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };
  return;
};