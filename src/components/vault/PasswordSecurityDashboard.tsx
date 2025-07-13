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
  className?: string;
}

export const PasswordSecurityDashboard: React.FC<PasswordSecurityDashboardProps> = ({
  passwords,
  onPasswordUpdate,
  className
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showBreachDetails, setShowBreachDetails] = useState(false);
  const { toast } = useToast();

  const expiredPasswords = passwords.filter(p => 
    p.expires_at && new Date(p.expires_at) < new Date()
  );

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
        onPasswordUpdate(password.id, { breach_status: 'checking' });
        
        const breachData = await BreachDetectionService.checkPasswordBreach(password.password_encrypted);
        
        onPasswordUpdate(password.id, {
          breach_status: breachData.isBreached ? 'breached' : 'safe',
          breach_count: breachData.breachCount,
          risk_level: breachData.riskLevel,
          breach_recommendations: breachData.recommendations
        });
        
        setScanProgress(((i + 1) / passwords.length) * 100);
        
        // Add small delay to avoid overwhelming the API
        if (i < passwords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error('Error checking password breach:', error);
        onPasswordUpdate(password.id, { breach_status: 'safe' });
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
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-black';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className={`bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-cyan-300">
            <Shield className="h-5 w-5" />
            <span>Enhanced Security Dashboard</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowBreachDetails(!showBreachDetails)}
              size="sm"
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              <Info className="h-4 w-4 mr-2" />
              {showBreachDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              onClick={runEnhancedSecurityScan}
              disabled={isScanning || passwords.length === 0}
              size="sm"
              className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning... {Math.round(scanProgress)}%
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enhanced Security Scan
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-200">{passwords.length}</p>
                <p className="text-sm text-slate-400">Total Passwords</p>
              </div>
              <Shield className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{favoritePasswords.length}</p>
                <p className="text-sm text-slate-400">Favorites</p>
              </div>
              <Heart className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-400">{criticalRiskPasswords.length}</p>
                <p className="text-sm text-slate-400">Critical Risk</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-400">{highRiskPasswords.length}</p>
                <p className="text-sm text-slate-400">High Risk</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-400">{expiredPasswords.length + expiringSoonPasswords.length}</p>
                <p className="text-sm text-slate-400">Need Attention</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </div>

        {showBreachDetails && breachedPasswords.length > 0 && (
          <div className="bg-slate-800/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2 text-cyan-400" />
              Breach Analysis Details
            </h4>
            <div className="space-y-3">
              {breachedPasswords.slice(0, 5).map((password, index) => (
                <div key={password.id} className="bg-slate-700/30 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-200">{password.name}</span>
                    <Badge className={getRiskBadgeColor(password.risk_level || 'medium')}>
                      {password.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                    </Badge>
                  </div>
                  {password.breach_count && (
                    <p className="text-sm text-red-300 mb-2">
                      Found in {password.breach_count.toLocaleString()} breaches
                    </p>
                  )}
                  {password.breach_recommendations && password.breach_recommendations.length > 0 && (
                    <div className="space-y-1">
                      {password.breach_recommendations.slice(0, 2).map((rec, i) => (
                        <p key={i} className="text-xs text-slate-400 flex items-start">
                          <span className="text-amber-400 mr-1">•</span>
                          {rec}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {breachedPasswords.length > 5 && (
                <p className="text-sm text-slate-400 text-center">
                  ... and {breachedPasswords.length - 5} more breached passwords
                </p>
              )}
            </div>
          </div>
        )}

        {(expiredPasswords.length > 0 || expiringSoonPasswords.length > 0 || breachedPasswords.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">Security Alerts</h3>
            
            {criticalRiskPasswords.length > 0 && (
              <div className="bg-red-950/30 border border-red-600/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-300">Critical Risk Passwords</span>
                  <Badge variant="destructive">{criticalRiskPasswords.length}</Badge>
                </div>
                <p className="text-sm text-red-200">
                  {criticalRiskPasswords.length} password{criticalRiskPasswords.length !== 1 ? 's are' : ' is'} at critical risk and should be changed immediately.
                </p>
              </div>
            )}

            {expiredPasswords.length > 0 && (
              <div className="bg-red-950/30 border border-red-600/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-300">Expired Passwords</span>
                  <Badge variant="destructive">{expiredPasswords.length}</Badge>
                </div>
                <p className="text-sm text-red-200">
                  {expiredPasswords.length} password{expiredPasswords.length !== 1 ? 's have' : ' has'} expired and should be changed immediately.
                </p>
              </div>
            )}

            {expiringSoonPasswords.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="font-medium text-amber-300">Expiring Soon</span>
                  <Badge variant="outline" className="border-amber-600 text-amber-300">{expiringSoonPasswords.length}</Badge>
                </div>
                <p className="text-sm text-amber-200">
                  {expiringSoonPasswords.length} password{expiringSoonPasswords.length !== 1 ? 's will' : ' will'} expire within 30 days.
                </p>
              </div>
            )}

            {breachedPasswords.length > 0 && (
              <div className="bg-red-950/30 border border-red-600/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-red-300">Breached Passwords</span>
                  <Badge variant="destructive">{breachedPasswords.length}</Badge>
                </div>
                <p className="text-sm text-red-200">
                  {breachedPasswords.length} password{breachedPasswords.length !== 1 ? 's have' : ' has'} been found in data breaches with detailed risk analysis.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
