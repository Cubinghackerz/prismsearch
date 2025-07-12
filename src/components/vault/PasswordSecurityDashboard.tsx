
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Heart, Clock, RefreshCw } from 'lucide-react';
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
  const favoritePasswords = passwords.filter(p => p.is_favorite);

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    for (let i = 0; i < passwords.length; i++) {
      const password = passwords[i];
      
      try {
        onPasswordUpdate(password.id, { breach_status: 'checking' });
        
        const breachData = await BreachDetectionService.checkPasswordBreach(password.password_encrypted);
        
        onPasswordUpdate(password.id, {
          breach_status: breachData.isBreached ? 'breached' : 'safe',
          breach_count: breachData.breachCount
        });
        
        setScanProgress(((i + 1) / passwords.length) * 100);
      } catch (error) {
        console.error('Error checking password breach:', error);
        onPasswordUpdate(password.id, { breach_status: 'safe' });
      }
    }

    setIsScanning(false);
    setScanProgress(0);
    
    toast({
      title: "Security scan completed",
      description: `Scanned ${passwords.length} passwords for security threats.`
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-cyan-300">
            <Shield className="h-5 w-5" />
            <span>Security Dashboard</span>
          </CardTitle>
          <Button
            onClick={runSecurityScan}
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
                Run Security Scan
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-red-400">{breachedPasswords.length}</p>
                <p className="text-sm text-slate-400">Breached</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
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

        {(expiredPasswords.length > 0 || expiringSoonPasswords.length > 0 || breachedPasswords.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">Security Alerts</h3>
            
            {expiredPasswords.length > 0 && (
              <div className="bg-red-950/30 border border-red-600/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
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
                  {breachedPasswords.length} password{breachedPasswords.length !== 1 ? 's have' : ' has'} been found in data breaches.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
