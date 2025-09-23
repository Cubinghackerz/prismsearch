import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrismAgentMode, PrismAgentVersion } from '@/context/PrismAgentContext';
import { History, RefreshCw } from 'lucide-react';

interface PrismAgentVersionHistoryProps {
  versions: PrismAgentVersion[];
  activeVersionId?: string;
  onRestore: (versionId: string) => void;
}

const modeLabel: Record<PrismAgentMode, string> = {
  fast: 'Fast',
  thinking: 'Thinking',
};

const PrismAgentVersionHistory = ({ versions, activeVersionId, onRestore }: PrismAgentVersionHistoryProps) => {
  if (!versions.length) {
    return (
      <Card className="border border-border/40 bg-background/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-muted-foreground" /> Version history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No builds yet. Generate your first version to see it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/40 bg-background/70 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-muted-foreground" /> Version history
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="divide-y divide-border/30">
            {versions
              .slice()
              .reverse()
              .map((version) => {
                const isActive = version.id === activeVersionId;
                return (
                  <div key={version.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {modeLabel[version.mode]} mode
                        </p>
                      </div>
                      {!isActive ? (
                        <Button variant="outline" size="sm" onClick={() => onRestore(version.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Restore
                        </Button>
                      ) : (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{version.prompt}</p>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PrismAgentVersionHistory;
