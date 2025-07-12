import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CloudPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
  device_id?: string;
}

export interface CloudBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

class CloudSyncService {
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncAll();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async syncAll() {
    if (!this.isOnline) return;

    try {
      await Promise.all([
        this.syncPasswords(),
        this.syncBookmarks()
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async syncPasswords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get local passwords
      const localPasswords = JSON.parse(localStorage.getItem('prism_vault_passwords') || '[]');
      
      // Get cloud passwords
      const { data: cloudPasswords, error } = await supabase
        .from('stored_passwords')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Merge and sync logic here
      const deviceId = this.getDeviceId();
      const passwordsToUpload = localPasswords.filter((local: any) => {
        const cloudVersion = cloudPasswords?.find(cloud => cloud.id === local.id);
        return !cloudVersion || new Date(local.updated_at) > new Date(cloudVersion.updated_at);
      });

      // Upload local changes
      for (const password of passwordsToUpload) {
        const { error: upsertError } = await supabase
          .from('stored_passwords')
          .upsert({
            ...password,
            user_id: user.id,
            device_id: deviceId,
            synced_at: new Date().toISOString()
          });

        if (upsertError) {
          console.error('Error syncing password:', upsertError);
        }
      }

      // Update local storage with cloud data
      if (cloudPasswords) {
        const mergedPasswords = this.mergePasswords(localPasswords, cloudPasswords);
        localStorage.setItem('prism_vault_passwords', JSON.stringify(mergedPasswords));
      }

    } catch (error) {
      console.error('Password sync failed:', error);
    }
  }

  async syncBookmarks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get local bookmarks
      const localBookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
      
      // Get cloud bookmarks
      const { data: cloudBookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Upload local bookmarks that aren't in cloud or are newer
      const bookmarksToUpload = localBookmarks.filter((local: any) => {
        const cloudVersion = cloudBookmarks?.find(cloud => cloud.id === local.id);
        return !cloudVersion || new Date(local.updated_at || local.created_at) > new Date(cloudVersion.updated_at);
      });

      for (const bookmark of bookmarksToUpload) {
        const { error: upsertError } = await supabase
          .from('bookmarks')
          .upsert({
            id: bookmark.id,
            user_id: user.id,
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            created_at: bookmark.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          console.error('Error syncing bookmark:', upsertError);
        }
      }

      // Update local storage with merged data
      if (cloudBookmarks) {
        const mergedBookmarks = this.mergeBookmarks(localBookmarks, cloudBookmarks);
        localStorage.setItem('prism_bookmarks', JSON.stringify(mergedBookmarks));
      }

    } catch (error) {
      console.error('Bookmark sync failed:', error);
    }
  }

  private mergePasswords(local: any[], cloud: CloudPassword[]): any[] {
    const merged = [...local];
    
    cloud.forEach(cloudPassword => {
      const localIndex = merged.findIndex(local => local.id === cloudPassword.id);
      
      if (localIndex === -1) {
        // Add cloud password if not in local
        merged.push(cloudPassword);
      } else {
        // Keep the newer version
        if (new Date(cloudPassword.updated_at) > new Date(merged[localIndex].updated_at)) {
          merged[localIndex] = cloudPassword;
        }
      }
    });
    
    return merged;
  }

  private mergeBookmarks(local: any[], cloud: CloudBookmark[]): any[] {
    const merged = [...local];
    
    cloud.forEach(cloudBookmark => {
      const localIndex = merged.findIndex(local => local.id === cloudBookmark.id);
      
      if (localIndex === -1) {
        // Add cloud bookmark if not in local
        merged.push(cloudBookmark);
      } else {
        // Keep the newer version
        if (new Date(cloudBookmark.updated_at) > new Date(merged[localIndex].updated_at || merged[localIndex].created_at)) {
          merged[localIndex] = cloudBookmark;
        }
      }
    });
    
    return merged;
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('prism_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('prism_device_id', deviceId);
    }
    return deviceId;
  }

  async deleteFromCloud(type: 'password' | 'bookmark', id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const table = type === 'password' ? 'stored_passwords' : 'bookmarks';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${type} from cloud:`, error);
    }
  }
}

export const cloudSyncService = new CloudSyncService();
