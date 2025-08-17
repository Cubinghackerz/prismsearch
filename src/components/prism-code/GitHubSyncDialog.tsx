
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, GitBranch, Lock, Globe, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface GitHubSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  generatedApp: GeneratedApp | null;
  projectId: string | null;
}

const GitHubSyncDialog: React.FC<GitHubSyncDialogProps> = ({
  isOpen,
  onClose,
  generatedApp,
  projectId
}) => {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const { toast } = useToast();

  const handleSync = async () => {
    if (!generatedApp || !repoName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a repository name.",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);

    try {
      // Simulate GitHub API call - in real implementation, this would create a repo and push files
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create the repository structure
      const files = {
        'index.html': generatedApp.html,
        'styles.css': generatedApp.css,
        'script.js': generatedApp.javascript,
        'README.md': `# ${repoName}\n\n${description || generatedApp.description}\n\n## Features\n\n${generatedApp.features.map(f => `- ${f}`).join('\n')}\n\n## Generated with Prism Code\n\nThis project was generated using Prism Code's AI Web App Generator.`,
        'package.json': JSON.stringify({
          name: repoName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          description: description || generatedApp.description,
          main: 'index.html',
          scripts: {
            start: 'python -m http.server 8000',
            dev: 'live-server .'
          },
          keywords: ['web-app', 'prism-code', 'ai-generated'],
          author: 'Prism Code User',
          license: 'MIT'
        }, null, 2)
      };

      // Simulate successful repo creation
      const mockRepoUrl = `https://github.com/user/${repoName.toLowerCase().replace(/\s+/g, '-')}`;
      setRepoUrl(mockRepoUrl);
      setSyncComplete(true);

      toast({
        title: "Repository Created!",
        description: `Your project has been synced to GitHub successfully.`,
      });

    } catch (error) {
      console.error('GitHub sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync to GitHub. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const resetDialog = () => {
    setRepoName("");
    setDescription("");
    setVisibility("public");
    setSyncComplete(false);
    setRepoUrl("");
    onClose();
  };

  if (syncComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Repository Created!</span>
            </DialogTitle>
            <DialogDescription>
              Your web app has been successfully synced to GitHub.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-green-500/30 bg-green-500/5">
              <Github className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-300">
                <strong>Success!</strong> Your repository is now available on GitHub.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2 p-3 bg-prism-surface/10 rounded-lg">
              <Globe className="w-4 h-4 text-prism-text-muted" />
              <span className="text-sm text-prism-text">{repoUrl}</span>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => window.open(repoUrl, '_blank')} className="flex-1">
              <Github className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
            <Button variant="outline" onClick={resetDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Github className="w-5 h-5 text-prism-primary" />
            <span>Sync to GitHub</span>
          </DialogTitle>
          <DialogDescription>
            Create a new GitHub repository and sync your generated web app.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-300">
              <strong>Note:</strong> This will create a new repository with your web app files, README, and package.json.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="repo-name">Repository Name</Label>
            <Input
              id="repo-name"
              placeholder="my-awesome-webapp"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              disabled={isSyncing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repo-description">Description (Optional)</Label>
            <Input
              id="repo-description"
              placeholder="A web app generated with Prism Code"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSyncing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Repository Visibility</Label>
            <Select value={visibility} onValueChange={(value: "public" | "private") => setVisibility(value)} disabled={isSyncing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSyncing}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={isSyncing || !repoName.trim()}>
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Repository...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                Sync to GitHub
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubSyncDialog;
