
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
import { Github, GitBranch, Lock, Globe, Loader2, CheckCircle, Key, ExternalLink } from "lucide-react";
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
  onSyncComplete?: (owner: string, repo: string, token: string) => void;
}

const GitHubSyncDialog: React.FC<GitHubSyncDialogProps> = ({
  isOpen,
  onClose,
  generatedApp,
  projectId,
  onSyncComplete
}) => {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [githubToken, setGithubToken] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);
  const { toast } = useToast();

  // Load saved GitHub credentials from localStorage
  React.useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    const savedUsername = localStorage.getItem('github_username');
    if (savedToken) setGithubToken(savedToken);
    if (savedUsername) setGithubUsername(savedUsername);
  }, []);

  const saveCredentials = () => {
    if (githubToken) localStorage.setItem('github_token', githubToken);
    if (githubUsername) localStorage.setItem('github_username', githubUsername);
  };

  const createGitHubRepo = async () => {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: description || generatedApp?.description,
        private: visibility === 'private',
        auto_init: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  };

  const uploadFileToRepo = async (repoFullName: string, filePath: string, content: string, message: string) => {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodedContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to upload ${filePath}: ${error.message}`);
    }

    return response.json();
  };

  const handleSync = async () => {
    if (!generatedApp || !repoName.trim() || !githubToken.trim() || !githubUsername.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide repository name, GitHub token, and username.",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    saveCredentials();

    try {
      // Create repository
      const repo = await createGitHubRepo();
      const repoFullName = repo.full_name;

      // Prepare files to upload
      const files = {
        'index.html': generatedApp.html,
        'styles.css': generatedApp.css,
        'script.js': generatedApp.javascript,
        'README.md': `# ${repoName}\n\n${description || generatedApp.description}\n\n## Features\n\n${generatedApp.features.map(f => `- ${f}`).join('\n')}\n\n## Generated with Prism Code\n\nThis project was generated using Prism Code's AI Web App Generator.\n\n## How to Run\n\n1. Clone this repository\n2. Open \`index.html\` in your browser\n3. Or serve it using a local server:\n   - Python: \`python -m http.server 8000\`\n   - Node.js: \`npx serve .\`\n   - PHP: \`php -S localhost:8000\``,
        'package.json': JSON.stringify({
          name: repoName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          description: description || generatedApp.description,
          main: 'index.html',
          scripts: {
            start: 'python -m http.server 8000',
            dev: 'live-server .',
            serve: 'npx serve .'
          },
          keywords: ['web-app', 'prism-code', 'ai-generated'],
          author: 'Prism Code User',
          license: 'MIT'
        }, null, 2)
      };

      // Upload files sequentially
      for (const [filePath, content] of Object.entries(files)) {
        await uploadFileToRepo(repoFullName, filePath, content, `Add ${filePath} - Generated by Prism Code`);
      }

      setRepoUrl(repo.html_url);
      setSyncComplete(true);

      // Enable auto-sync
      if (onSyncComplete) {
        onSyncComplete(githubUsername, repoName, githubToken);
      }

      toast({
        title: "Repository Created!",
        description: `Your project has been synced to GitHub with auto-sync enabled.`,
      });

    } catch (error) {
      console.error('GitHub sync error:', error);
      toast({
        title: "Sync Failed",
        description: `Failed to sync to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    setShowApiKeyHelp(false);
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
              Your web app has been successfully synced to GitHub and will auto-update with future changes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-green-500/30 bg-green-500/5">
              <Github className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-300">
                <strong>Success!</strong> Your repository is now live on GitHub with automatic syncing enabled.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2 p-3 bg-prism-surface/10 rounded-lg">
              <Globe className="w-4 h-4 text-prism-text-muted" />
              <span className="text-sm text-prism-text break-all">{repoUrl}</span>
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Github className="w-5 h-5 text-prism-primary" />
            <span>Sync to GitHub</span>
          </DialogTitle>
          <DialogDescription>
            Create a new GitHub repository and enable automatic syncing for future changes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-300">
              <strong>Auto-Sync:</strong> Once connected, all future changes to your web app will automatically update in the GitHub repository.
            </AlertDescription>
          </Alert>

          {/* GitHub API Key Help */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">GitHub Authentication</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                className="text-xs"
              >
                <Key className="w-3 h-3 mr-1" />
                How to get API key?
              </Button>
            </div>
            
            {showApiKeyHelp && (
              <Alert className="border-orange-500/30 bg-orange-500/5">
                <Key className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-300 space-y-2">
                  <div><strong>To get your GitHub Personal Access Token:</strong></div>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to GitHub.com → Settings → Developer settings</li>
                    <li>Click "Personal access tokens" → "Tokens (classic)"</li>
                    <li>Click "Generate new token (classic)"</li>
                    <li>Give it a name like "Prism Code Sync"</li>
                    <li>Select scopes: <code>repo</code> (full control of repositories)</li>
                    <li>Click "Generate token" and copy the token</li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                    className="mt-2"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open GitHub Token Settings
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="github-username">GitHub Username</Label>
              <Input
                id="github-username"
                placeholder="your-username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={isSyncing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-token">GitHub Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                disabled={isSyncing}
              />
            </div>
          </div>

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
          <Button 
            onClick={handleSync} 
            disabled={isSyncing || !repoName.trim() || !githubToken.trim() || !githubUsername.trim()}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Repository...
              </>
            ) : (
              <>
                <Github className="w-4 h-4 mr-2" />
                Create & Sync Repository
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubSyncDialog;
