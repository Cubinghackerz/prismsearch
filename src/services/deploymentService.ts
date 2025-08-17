
import { supabase } from "@/integrations/supabase/client";

export interface DeploymentOptions {
  platform: 'vercel' | 'netlify' | 'development';
  projectName: string;
  html: string;
  css: string;
  javascript: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  deploymentId?: string;
}

export class DeploymentService {
  static async deployToVercel(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('deploy-webapp', {
        body: {
          platform: 'vercel',
          projectName: options.projectName,
          files: {
            'index.html': options.html,
            'styles.css': options.css,
            'script.js': options.javascript,
            'package.json': JSON.stringify({
              name: options.projectName,
              version: '1.0.0',
              scripts: {
                start: 'serve -s .',
                build: 'echo "No build step required"'
              },
              dependencies: {}
            })
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        url: data.deploymentUrl,
        deploymentId: data.deploymentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deploy to Vercel'
      };
    }
  }

  static async deployToNetlify(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('deploy-webapp', {
        body: {
          platform: 'netlify',
          projectName: options.projectName,
          files: {
            'index.html': options.html,
            'styles.css': options.css,
            'script.js': options.javascript
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        url: data.deploymentUrl,
        deploymentId: data.deploymentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deploy to Netlify'
      };
    }
  }

  static async createDevelopmentLink(options: DeploymentOptions): Promise<DeploymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('deploy-webapp', {
        body: {
          platform: 'development',
          projectName: options.projectName,
          files: {
            'index.html': options.html,
            'styles.css': options.css,
            'script.js': options.javascript
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        url: data.developmentUrl,
        deploymentId: data.deploymentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create development link'
      };
    }
  }
}
