
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Key, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeploymentSettingsProps {
  children: React.ReactNode;
}

const DeploymentSettings: React.FC<DeploymentSettingsProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [netlifyToken, setNetlifyToken] = useState('');
  const [showVercelToken, setShowVercelToken] = useState(false);
  const [showNetlifyToken, setShowNetlifyToken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load tokens from localStorage
    const savedVercelToken = localStorage.getItem('prism_vercel_token');
    const savedNetlifyToken = localStorage.getItem('prism_netlify_token');
    
    if (savedVercelToken) setVercelToken(savedVercelToken);
    if (savedNetlifyToken) setNetlifyToken(savedNetlifyToken);
  }, []);

  const saveSettings = () => {
    // Save tokens to localStorage
    if (vercelToken.trim()) {
      localStorage.setItem('prism_vercel_token', vercelToken.trim());
    } else {
      localStorage.removeItem('prism_vercel_token');
    }

    if (netlifyToken.trim()) {
      localStorage.setItem('prism_netlify_token', netlifyToken.trim());
    } else {
      localStorage.removeItem('prism_netlify_token');
    }

    toast({
      title: "Settings Saved",
      description: "Your deployment API keys have been saved securely in your browser.",
    });

    setIsOpen(false);
  };

  const clearSettings = () => {
    localStorage.removeItem('prism_vercel_token');
    localStorage.removeItem('prism_netlify_token');
    setVercelToken('');
    setNetlifyToken('');
    
    toast({
      title: "Settings Cleared",
      description: "All deployment API keys have been removed.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-prism-primary" />
            <span>Deployment Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-prism-text-muted bg-prism-surface/10 p-4 rounded-lg">
            <p className="mb-2">
              <strong>Note:</strong> API keys are stored securely in your browser's local storage and are never sent to our servers.
            </p>
            <p>
              These keys are only used when you deploy your applications to Vercel or Netlify.
            </p>
          </div>

          {/* Vercel Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-green-400" />
                <span>Vercel API Token</span>
              </CardTitle>
              <CardDescription>
                Required for deploying to Vercel. Get your token from your Vercel dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vercel-token">API Token</Label>
                <div className="relative">
                  <Input
                    id="vercel-token"
                    type={showVercelToken ? 'text' : 'password'}
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="Enter your Vercel API token"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVercelToken(!showVercelToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-prism-text-muted hover:text-prism-text"
                  >
                    {showVercelToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://vercel.com/account/tokens', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Get Vercel Token
              </Button>
            </CardContent>
          </Card>

          {/* Netlify Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-purple-400" />
                <span>Netlify Access Token</span>
              </CardTitle>
              <CardDescription>
                Required for deploying to Netlify. Get your token from your Netlify dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="netlify-token">Access Token</Label>
                <div className="relative">
                  <Input
                    id="netlify-token"
                    type={showNetlifyToken ? 'text' : 'password'}
                    value={netlifyToken}
                    onChange={(e) => setNetlifyToken(e.target.value)}
                    placeholder="Enter your Netlify access token"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNetlifyToken(!showNetlifyToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-prism-text-muted hover:text-prism-text"
                  >
                    {showNetlifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://app.netlify.com/user/applications#personal-access-tokens', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Get Netlify Token
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-prism-border">
            <Button
              variant="outline"
              onClick={clearSettings}
              className="text-red-400 hover:text-red-300 border-red-400/30 hover:border-red-300/30"
            >
              Clear All Settings
            </Button>
            
            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveSettings}
                className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentSettings;
