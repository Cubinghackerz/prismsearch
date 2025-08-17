
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Cloud, CloudOff, Save, Download } from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  files: { [key: string]: string };
  packages: Array<{
    name: string;
    version: string;
    type: 'dependency' | 'devDependency';
  }>;
  description: string;
  features: string[];
}

interface ProjectCloudStorageProps {
  projectData: ProjectData;
  onProjectLoad: (project: ProjectData) => void;
}

const ProjectCloudStorage: React.FC<ProjectCloudStorageProps> = ({ 
  projectData, 
  onProjectLoad 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToCloud = async () => {
    if (!user || !isOnline) {
      toast({
        title: "Save Failed",
        description: !user ? "Please sign in to save to cloud" : "No internet connection",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prism_projects')
        .upsert({
          id: projectData.id,
          user_id: user.id,
          name: projectData.name,
          files: projectData.files,
          packages: projectData.packages,
          description: projectData.description,
          features: projectData.features,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Project Saved",
        description: "Your project has been saved to the cloud successfully.",
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save project to cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadFromCloud = async () => {
    if (!user || !isOnline) {
      toast({
        title: "Load Failed",
        description: !user ? "Please sign in to load from cloud" : "No internet connection",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('prism_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        onProjectLoad(data);
        toast({
          title: "Project Loaded",
          description: "Your latest project has been loaded from the cloud.",
        });
      } else {
        toast({
          title: "No Projects Found",
          description: "No cloud projects found for your account.",
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load project from cloud. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-xs text-prism-text-muted">
        {isOnline ? (
          <Cloud className="w-4 h-4 text-green-400" />
        ) : (
          <CloudOff className="w-4 h-4 text-red-400" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={saveToCloud}
        disabled={isSaving || !isOnline || !user}
      >
        <Save className="w-3 h-3 mr-1" />
        {isSaving ? 'Saving...' : 'Save to Cloud'}
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={loadFromCloud}
        disabled={!isOnline || !user}
      >
        <Download className="w-3 h-3 mr-1" />
        Load from Cloud
      </Button>
    </div>
  );
};

export default ProjectCloudStorage;
