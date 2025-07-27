
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import VaultLoadingScreen from '@/components/vault/VaultLoadingScreen';
import MasterPasswordDialog from '@/components/vault/MasterPasswordDialog';
import VaultHeader from '@/components/vault/VaultHeader';
import PasswordGenerator from '@/components/vault/PasswordGenerator';
import StoredPasswordsList from '@/components/StoredPasswordsList';
import SecurityScoreDashboard from '@/components/vault/SecurityScoreDashboard';
import EmptyVaultCard from '@/components/vault/EmptyVaultCard';
import Navigation from '@/components/Navigation';

interface PrismVaultProps {
  passwords?: any[];
}

const PrismVault: React.FC<PrismVaultProps> = ({ passwords = [] }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [storedPasswords, setStoredPasswords] = useState<any[]>(passwords);
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [securityScore, setSecurityScore] = useState(85);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Check if master password is set (mock check)
      const masterPasswordSet = localStorage.getItem('masterPasswordSet') === 'true';
      setIsMasterPasswordSet(masterPasswordSet);
      
      // Load stored passwords (mock data for now)
      if (masterPasswordSet) {
        const mockPasswords = [
          {
            id: '1',
            website: 'example.com',
            email: 'user@example.com',
            password: '••••••••',
            lastUsed: new Date(),
            strength: 'strong'
          }
        ];
        setStoredPasswords(mockPasswords);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleMasterPasswordSubmit = async (password: string) => {
    try {
      // Store master password setup status
      localStorage.setItem('masterPasswordSet', 'true');
      setIsMasterPasswordSet(true);
      
      toast({
        title: "Success",
        description: "Master password set successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set master password",
        variant: "destructive"
      });
    }
  };

  const handlePasswordGenerated = (password: string) => {
    // Handle generated password
    console.log('Generated password:', password);
    setIsPasswordGeneratorOpen(false);
  };

  if (loading) {
    return <VaultLoadingScreen />;
  }

  if (!isMasterPasswordSet) {
    return <MasterPasswordDialog onSubmit={handleMasterPasswordSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <VaultHeader />
      <div className="container mx-auto py-8 px-4">
        <SecurityScoreDashboard score={securityScore} />
        {storedPasswords.length > 0 ? (
          <StoredPasswordsList passwords={storedPasswords} />
        ) : (
          <EmptyVaultCard />
        )}
        <PasswordGenerator 
          isOpen={isPasswordGeneratorOpen} 
          onClose={() => setIsPasswordGeneratorOpen(false)} 
          onPasswordGenerated={handlePasswordGenerated} 
        />
      </div>
    </div>
  );
};

export default PrismVault;
