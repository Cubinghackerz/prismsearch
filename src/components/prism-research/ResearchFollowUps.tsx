import React from 'react';
import { ClipboardCheck, ExternalLink } from 'lucide-react';
import { ResearchFollowUp, ResearchSource } from '@/services/researchService';
import { Badge } from '@/components/ui/badge';

interface ResearchFollowUpsProps {
  followUps: ResearchFollowUp[];
  sources: Record<string, ResearchSource>;
}

const ResearchFollowUps: React.FC<ResearchFollowUpsProps> = ({ followUps, sources }) => {
  if (!followUps.length) {
    return (
      <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        Notebook follow-ups will appear here after your first run.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followUps.map((item, index) => {
        const related = item.relatedSources
          .map((id) => sources[id])
          .filter((source): source is ResearchSource => Boolean(source));

        return (
          <div key={item.id} className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-secondary/20 p-2 text-secondary-foreground">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Task {index + 1}</Badge>
                  <p className="text-sm font-semibold text-foreground">{item.question}</p>
                </div>
                <p className="text-sm text-muted-foreground">{item.rationale}</p>
                {related.length ? (
                  <div className="flex flex-wrap gap-2">
                    {related.map((source) => (
                      <a
                        key={`${item.id}-${source.id}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        Reference {source.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResearchFollowUps;
