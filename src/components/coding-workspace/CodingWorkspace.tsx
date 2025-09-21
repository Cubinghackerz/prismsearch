import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, FileText, Terminal, Monitor, Play, Square, 
  Download, Upload, Settings, Maximize2, Minimize2, RefreshCw,
  CheckCircle, XCircle, Clock, Folder, Code, Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatPane from './ChatPane';
import FileDiffsPane from './FileDiffsPane';
import LogsPanel from './LogsPanel';
import PreviewIframe from './PreviewIframe';
import FileExplorer from './FileExplorer';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';

interface CodingWorkspaceProps {
  initialPrompt?: string;
  onClose?: () => void;
  isFullscreen?: boolean;
}

const CodingWorkspaceContent: React.FC<CodingWorkspaceProps> = ({ 
  initialPrompt, 
  onClose,
  isFullscreen = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { 
    workspace, 
    pendingDiffs, 
    isServerRunning, 
    serverPort,
    logs,
    startDevServer,
    stopDevServer,
    applyDiffs,
    exportWorkspace
  } = useWorkspace();
  const { toast } = useToast();

  // Initialize workspace
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing workspace...</p>
        </div>
      </div>
    );
  }
  useEffect(() => {
    if (serverPort && !previewUrl) {
      setPreviewUrl(`http://localhost:${serverPort}`);
    }
  }, [serverPort, previewUrl]);

  const handleApplyChanges = async () => {
    try {
      await applyDiffs();
      toast({
        title: "Changes Applied",
        description: "All pending file changes have been applied to the workspace.",
      });
    } catch (error) {
      toast({
        title: "Apply Failed",
        description: "Failed to apply changes to the workspace.",
        variant: "destructive"
      });
    }
  };

  const handleStartServer = async () => {
    try {
      await startDevServer();
      toast({
        title: "Development Server Started",
        description: `Server is running on port ${serverPort}`,
      });
    } catch (error) {
      toast({
        title: "Server Start Failed",
        description: "Failed to start the development server.",
        variant: "destructive"
      });
    }
  };

  const handleStopServer = async () => {
    try {
      await stopDevServer();
      setPreviewUrl(null);
      toast({
        title: "Development Server Stopped",
        description: "The development server has been stopped.",
      });
    } catch (error) {
      toast({
        title: "Server Stop Failed",
        description: "Failed to stop the development server.",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportWorkspace();
      toast({
        title: "Workspace Exported",
        description: "Your project has been exported as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export the workspace.",
        variant: "destructive"
      });
    }
  };

  const getPendingChangesCount = () => {
    return Object.keys(pendingDiffs).length;
  };

  const getActiveFilesCount = () => {
    return Object.keys(workspace.files).length;
  };

  return (
    <div className={`flex h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Left Sidebar - File Explorer */}
      <div className="w-64 border-r border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Workspace</h3>
            <Badge variant="secondary" className="text-xs">
              {getActiveFilesCount()} files
            </Badge>
          </div>
        </div>
        <FileExplorer />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/30">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Coding Assistant</h2>
              <Badge variant="outline">{workspace.framework}</Badge>
            </div>
            
            {workspace.language && (
              <Badge variant="secondary">{workspace.language}</Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Server Status */}
            {isServerRunning ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                  Live: {serverPort}
                </Badge>
                <Button onClick={handleStopServer} size="sm" variant="outline">
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </div>
            ) : (
              <Button onClick={handleStartServer} size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-1" />
                Start Server
              </Button>
            )}

            {/* Apply Changes */}
            {getPendingChangesCount() > 0 && (
              <Button onClick={handleApplyChanges} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-1" />
                Apply {getPendingChangesCount()} Changes
              </Button>
            )}

            {/* Export */}
            <Button onClick={handleExport} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

            {/* Close */}
            {onClose && (
              <Button onClick={onClose} size="sm" variant="outline">
                <XCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Tabs */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="chat" className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger value="diffs" className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>File Diffs</span>
                  {getPendingChangesCount() > 0 && (
                    <Badge variant="destructive" className="ml-1 h-4 min-w-4 text-xs">
                      {getPendingChangesCount()}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center space-x-1">
                  <Terminal className="w-4 h-4" />
                  <span>Logs</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-1">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 mt-4 mx-4">
                <ChatPane initialPrompt={initialPrompt} />
              </TabsContent>

              <TabsContent value="diffs" className="flex-1 mt-4 mx-4">
                <FileDiffsPane />
              </TabsContent>

              <TabsContent value="logs" className="flex-1 mt-4 mx-4">
                <LogsPanel />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 mt-4 mx-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Framework</label>
                        <div className="text-lg font-mono">{workspace.framework}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        <div className="text-lg font-mono">{workspace.language}</div>
                      </div>
                    </div>
                    
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        Framework and language are automatically detected from your conversation.
                        Ask the AI to switch frameworks if needed.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          {isPreviewVisible && (
            <div className="w-1/2 border-l border-border flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/30">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Live Preview</h3>
                  {isServerRunning && previewUrl && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                    size="sm" 
                    variant="outline"
                    disabled={!previewUrl}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Open
                  </Button>
                  <Button 
                    onClick={() => setIsPreviewVisible(false)}
                    size="sm" 
                    variant="outline"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <PreviewIframe url={previewUrl} />
              </div>
            </div>
          )}
        </div>

        {/* Show Preview Button when hidden */}
        {!isPreviewVisible && (
          <div className="fixed bottom-4 right-4 z-10">
            <Button 
              onClick={() => setIsPreviewVisible(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Show Preview
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CodingWorkspace: React.FC<CodingWorkspaceProps> = (props) => {
  return (
    <WorkspaceProvider>
      <CodingWorkspaceContent {...props} />
    </WorkspaceProvider>
  );
};

export default CodingWorkspace;