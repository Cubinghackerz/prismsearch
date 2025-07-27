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
}

const PrismVault: React.FC<PrismVaultProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVaultSetup, setIsVaultSetup] = useState(false);
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [storedPasswords, setStoredPasswords] = useState([]);
  const [securityScore, setSecurityScore] = useState(0);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Simulate vault setup check
      setTimeout(() => {
        setIsVaultSetup(true);
        setIsMasterPasswordSet(true);
        setIsLoading(false);
      }, 1500);
    };

    checkAuth();
  }, [navigate]);

  const handleMasterPasswordSubmit = (password: string) => {
    setIsMasterPasswordSet(true);
    toast({
      title: "Success",
      description: "Master password set successfully!"
    });
  };

  const handlePasswordGenerated = (newPassword: string) => {
    toast({
      title: "Password Generated",
      description: `A new secure password has been generated: ${newPassword}`
    });
  };

  const handlePasswordSaved = (passwordName: string) => {
    toast({
      title: "Password Saved",
      description: `Password for ${passwordName} has been saved.`
    });
  };

  if (isLoading) {
    return <VaultLoadingScreen />;
  }

  if (!isVaultSetup) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-3xl font-bold text-foreground mb-4">Vault Setup Required</h1>
        <p className="text-muted-foreground mb-8">Please complete the vault setup process.</p>
        {/* Add Vault Setup Component or Link Here */}
      </div>
    );
  }

  if (!isMasterPasswordSet) {
    return <MasterPasswordDialog onSubmit={handleMasterPasswordSubmit} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <VaultHeader />
      <div className="container mx-auto py-8 px-4">
        <SecurityScoreDashboard score={securityScore} />
        {storedPasswords.length > 0 ? (
          <StoredPasswordsList passwords={storedPasswords} />
        ) : (
          <EmptyVaultCard />
        )}
        <PasswordGenerator isOpen={isPasswordGeneratorOpen} onClose={() => setIsPasswordGeneratorOpen(false)} onPasswordGenerated={handlePasswordGenerated} />
      </div>
    </div>
  );
};

export default PrismVault;
