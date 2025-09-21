import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, FileText, Plus, Minus, Edit } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';

const FileDiffsPane: React.FC = () => {
  const { pendingDiffs, applyDiffs, clearDiffs } = useWorkspace();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-500" />;
      case 'modify': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete': return <Minus className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'border-green-500/30 bg-green-500/5';
      case 'modify': return 'border-blue-500/30 bg-blue-500/5';
      case 'delete': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-border bg-card';
    }
  };

  const renderDiffLines = (oldContent: string, newContent: string) => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    const diffLines = [];
    for (let i = 0; i < Math.min(maxLines, 20); i++) { // Limit to 20 lines for preview
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        if (oldLine) {
          diffLines.push(
            <div key={`old-${i}`} className="flex items-start space-x-2 text-red-400 bg-red-500/10 px-2 py-1 rounded">
              <Minus className="w-3 h-3 mt-1 flex-shrink-0" />
              <code className="text-xs font-mono">{oldLine}</code>
            </div>
          );
        }
        if (newLine) {
          diffLines.push(
            <div key={`new-${i}`} className="flex items-start space-x-2 text-green-400 bg-green-500/10 px-2 py-1 rounded">
              <Plus className="w-3 h-3 mt-1 flex-shrink-0" />
              <code className="text-xs font-mono">{newLine}</code>
            </div>
          );
        }
      }
    }
    
    if (maxLines > 20) {
      diffLines.push(
        <div key="truncated" className="text-xs text-muted-foreground italic px-2">
          ... and {maxLines - 20} more lines
        </div>
      );
    }
    
    return diffLines;
  };

  const pendingDiffsList = Object.values(pendingDiffs);

  if (pendingDiffsList.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Changes</h3>
          <p className="text-muted-foreground">
            File changes will appear here before being applied to your workspace.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Pending File Changes</span>
            <Badge variant="destructive">
              {pendingDiffsList.length}
            </Badge>
          </CardTitle>
          <div className="flex space-x-2">
            <Button onClick={clearDiffs} size="sm" variant="outline">
              <XCircle className="w-4 h-4 mr-1" />
              Reject All
            </Button>
            <Button onClick={applyDiffs} size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-1" />
              Apply All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {pendingDiffsList.map((diff) => (
              <Card key={diff.path} className={`border ${getActionColor(diff.action)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(diff.action)}
                      <span className="font-mono text-sm">{diff.path}</span>
                      <Badge variant="outline" className="text-xs">
                        {diff.action}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {diff.action === 'create' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">New file will be created:</p>
                      <div className="bg-muted/30 p-3 rounded font-mono text-xs max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{diff.newContent.substring(0, 500)}</pre>
                        {diff.newContent.length > 500 && (
                          <div className="text-muted-foreground italic">... and more</div>
                        )}
                      </div>
                    </div>
                  ) : diff.action === 'modify' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">File changes:</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {renderDiffLines(diff.oldContent, diff.newContent)}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">File will be deleted:</p>
                      <div className="bg-red-500/10 p-3 rounded">
                        <code className="text-sm">{diff.path}</code>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FileDiffsPane;