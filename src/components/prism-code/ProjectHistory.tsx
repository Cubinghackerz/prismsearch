
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

interface ProjectHistoryItem {
  id: string;
  prompt: string;
  generatedApp: GeneratedApp;
  model: string;
  timestamp: Date;
}

interface ProjectHistoryProps {
  onLoadProject: (project: ProjectHistoryItem) => void;
}

const ProjectHistory: React.FC<ProjectHistoryProps> = ({ onLoadProject }) => {
  const [projects, setProjects] = useState<ProjectHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('prism-code-projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        })));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('prism-code-projects', JSON.stringify(updatedProjects));
    toast({
      title: "Project Deleted",
      description: "The project has been removed from your history.",
    });
  };

  const handleLoadProject = (project: ProjectHistoryItem) => {
    onLoadProject(project);
    setIsOpen(false);
    toast({
      title: "Project Loaded",
      description: "You can now continue working on this project.",
    });
  };

  return (
    <Dialog open={isOpen} onValueChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Project History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-prism-primary" />
            <span>Project History</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-prism-text-muted">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects saved yet</p>
                <p className="text-sm">Generate your first web app to see it here</p>
              </div>
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="border-prism-border bg-prism-surface/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium text-prism-text line-clamp-2">
                          {project.generatedApp.description}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {project.model}
                          </Badge>
                          <div className="flex items-center text-xs text-prism-text-muted">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadProject(project)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-prism-text-muted line-clamp-2 mb-2">
                      {project.prompt}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.generatedApp.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {project.generatedApp.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.generatedApp.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectHistory;
