
interface GitHubRepo {
  owner: string;
  repo: string;
  token: string;
}

class GitHubSyncService {
  private static instance: GitHubSyncService;
  private syncEnabled = false;
  private currentRepo: GitHubRepo | null = null;

  static getInstance(): GitHubSyncService {
    if (!GitHubSyncService.instance) {
      GitHubSyncService.instance = new GitHubSyncService();
    }
    return GitHubSyncService.instance;
  }

  enableAutoSync(owner: string, repo: string, token: string) {
    this.currentRepo = { owner, repo, token };
    this.syncEnabled = true;
    
    // Save to localStorage for persistence
    localStorage.setItem('github_auto_sync', JSON.stringify({
      owner,
      repo,
      token,
      enabled: true
    }));
  }

  disableAutoSync() {
    this.syncEnabled = false;
    this.currentRepo = null;
    localStorage.removeItem('github_auto_sync');
  }

  // Load auto-sync settings from localStorage
  loadSyncSettings() {
    const saved = localStorage.getItem('github_auto_sync');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.enabled) {
          this.currentRepo = {
            owner: settings.owner,
            repo: settings.repo,
            token: settings.token
          };
          this.syncEnabled = true;
        }
      } catch (error) {
        console.error('Failed to load GitHub sync settings:', error);
      }
    }
  }

  async updateFile(filePath: string, content: string, commitMessage: string): Promise<boolean> {
    if (!this.syncEnabled || !this.currentRepo) {
      return false;
    }

    try {
      // First, get the current file to get its SHA (required for updates)
      let sha: string | undefined;
      try {
        const getResponse = await fetch(
          `https://api.github.com/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contents/${filePath}`,
          {
            headers: {
              'Authorization': `token ${this.currentRepo.token}`,
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        );
        
        if (getResponse.ok) {
          const fileData = await getResponse.json();
          sha = fileData.sha;
        }
      } catch (error) {
        // File might not exist yet, which is fine
      }

      // Update or create the file
      const encodedContent = btoa(unescape(encodeURIComponent(content)));
      
      const updateResponse = await fetch(
        `https://api.github.com/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.currentRepo.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: encodedContent,
            ...(sha && { sha })
          })
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.error(`Failed to update ${filePath}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('GitHub sync error:', error);
      return false;
    }
  }

  async syncGeneratedApp(html: string, css: string, javascript: string, description: string) {
    if (!this.syncEnabled) {
      return false;
    }

    const timestamp = new Date().toISOString();
    const updates = [
      this.updateFile('index.html', html, `Update index.html - ${timestamp}`),
      this.updateFile('styles.css', css, `Update styles.css - ${timestamp}`),
      this.updateFile('script.js', javascript, `Update script.js - ${timestamp}`)
    ];

    try {
      const results = await Promise.all(updates);
      const allSuccessful = results.every(result => result);
      
      if (allSuccessful) {
        console.log('GitHub auto-sync completed successfully');
      } else {
        console.warn('Some GitHub auto-sync operations failed');
      }
      
      return allSuccessful;
    } catch (error) {
      console.error('GitHub auto-sync failed:', error);
      return false;
    }
  }

  isAutoSyncEnabled(): boolean {
    return this.syncEnabled && this.currentRepo !== null;
  }

  getCurrentRepo(): GitHubRepo | null {
    return this.currentRepo;
  }
}

export default GitHubSyncService;
