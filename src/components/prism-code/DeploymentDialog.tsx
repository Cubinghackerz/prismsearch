
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Globe, Rocket, ExternalLink, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeploymentService, DeploymentOptions } from '@/services/deploymentService';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface DeploymentDialogProps {
  generatedApp: GeneratedApp;
  children: React.ReactNode;
}

const DeploymentDialog: React.FC<DeploymentDialogProps> = ({ generatedApp, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isDeploying, setIsDeploying] = useState<string | null>(null);
  const [deploymentResults, setDeploymentResults] = useState<Array<{ platform: string; url: string; success: boolean }>>([]);
  const { toast } = useToast();

  const handleDeploy = async (platform: 'vercel' | 'netlify' | 'development') => {
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name for deployment.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(platform);

    const options: DeploymentOptions = {
      platform,
      projectName: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      html: generatedApp.html,
      css: generatedApp.css,
      javascript: generatedApp.javascript
    };

    try {
      let result;
      
      switch (platform) {
        case 'vercel':
          result = await DeploymentService.deployToVercel(options);
          break;
        case 'netlify':
          result = await DeploymentService.deployToNetlify(options);
          break;
        case 'development':
          result = await DeploymentService.createDevelopmentLink(options);
          break;
      }

      if (result.success && result.url) {
        setDeploymentResults(prev => [
          ...prev.filter(r => r.platform !== platform),
          { platform, url: result.url!, success: true }
        ]);
        
        toast({
          title: "Deployment Successful!",
          description: `Your app has been deployed to ${platform}.`,
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error(`${platform} deployment error:`, error);
      toast({
        title: "Deployment Failed",
        description: `Failed to deploy to ${platform}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeploying(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Deployment URL copied to clipboard.",
    });
  };

  const openDeployment = (url: string) => {
    window.open(url, '_blank');
  };

  const sanitizeProjectName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-prism-primary" />
            <span>Deploy Your Web App</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Name Input */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(sanitizeProjectName(e.target.value))}
              placeholder="my-awesome-webapp"
              className="bg-prism-surface/10 border-prism-border"
            />
            <p className="text-xs text-prism-text-muted">
              Only lowercase letters, numbers, and hyphens are allowed.
            </p>
          </div>

          {/* App Info */}
          <Card className="bg-prism-surface/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">App Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-prism-text-muted">{generatedApp.description}</p>
              <div className="flex flex-wrap gap-1">
                {generatedApp.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-prism-primary/10 text-prism-primary text-xs rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="platforms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms">Deploy</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="platforms" className="space-y-4">
              {/* Development Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span>Development Link</span>
                  </CardTitle>
                  <CardDescription>
                    Create a shareable development link for testing and sharing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleDeploy('development')}
                    disabled={isDeploying === 'development' || !projectName.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {isDeploying === 'development' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Link...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Create Development Link
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Vercel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Cloud className="w-5 h-5 text-green-400" />
                    <span>Vercel</span>
                  </CardTitle>
                  <CardDescription>
                    Deploy to Vercel for production-ready hosting with global CDN
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-300 text-sm">
                      Requires Vercel API token configuration in project settings.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => handleDeploy('vercel')}
                    disabled={isDeploying === 'vercel' || !projectName.trim()}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {isDeploying === 'vercel' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deploying to Vercel...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 mr-2" />
                        Deploy to Vercel
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Netlify */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Cloud className="w-5 h-5 text-purple-400" />
                    <span>Netlify</span>
                  </CardTitle>
                  <CardDescription>
                    Deploy to Netlify for fast, secure web hosting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-300 text-sm">
                      Requires Netlify API token configuration in project settings.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => handleDeploy('netlify')}
                    disabled={isDeploying === 'netlify' || !projectName.trim()}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    {isDeploying === 'netlify' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deploying to Netlify...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 mr-2" />
                        Deploy to Netlify
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {deploymentResults.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Rocket className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-prism-text mb-2">No Deployments Yet</h3>
                    <p className="text-prism-text-muted">Deploy your app to see results here.</p>
                  </CardContent>
                </Card>
              ) : (
                deploymentResults.map((result) => (
                  <Card key={result.platform} className="bg-green-500/5 border-green-500/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <h4 className="font-semibold text-prism-text capitalize">{result.platform}</h4>
                            <p className="text-sm text-prism-text-muted">Deployment successful</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.url)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openDeployment(result.url)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-prism-surface/10 rounded text-xs font-mono text-prism-text-muted">
                        {result.url}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
