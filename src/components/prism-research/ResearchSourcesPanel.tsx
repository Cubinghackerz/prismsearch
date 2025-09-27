import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ResearchSource } from '@/services/researchService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ResearchSourcesPanelProps {
  sources: ResearchSource[];
}

const ResearchSourcesPanel: React.FC<ResearchSourcesPanelProps> = ({ sources }) => {
  if (!sources.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sources will appear here after you run a research session.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[22rem] pr-3">
      <div className="space-y-4">
        {sources.map((source) => {
          let hostname = '';
          try {
            hostname = new URL(source.url).hostname.replace(/^www\./, '');
          } catch {
            hostname = source.url;
          }

          return (
            <div key={source.id} className="rounded-xl border border-border/50 bg-background/60 p-4 shadow-sm transition hover:border-primary/40">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{source.title}</h3>
                  <Badge variant="outline" className="text-xs font-medium">{source.type}</Badge>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{hostname}</p>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{source.snippet}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Open source
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ResearchSourcesPanel;
