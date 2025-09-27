import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { ResearchTimelineEvent, ResearchSource } from '@/services/researchService';
import { Badge } from '@/components/ui/badge';

interface ResearchTimelineProps {
  events: ResearchTimelineEvent[];
  sources: Record<string, ResearchSource>;
}

const ResearchTimeline: React.FC<ResearchTimelineProps> = ({ events, sources }) => {
  if (!events.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No sources were returned for this notebook yet.
      </div>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border/60 pl-6">
      {events.map((event, index) => {
        const source = sources[event.sourceId];
        const relativeTime = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
        return (
          <li key={event.id} className="ml-4">
            <span className="absolute -left-[10px] mt-1 h-2.5 w-2.5 rounded-full border border-primary bg-background" aria-hidden />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <span className="text-xs text-muted-foreground">{relativeTime}</span>
                </div>
                {source ? <Badge variant="outline" className="text-xs font-medium">{source.type}</Badge> : null}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
              {source ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  View source
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : null}
            </div>
            {index !== events.length - 1 ? <div className="mt-6 border-b border-border/40" /> : null}
          </li>
        );
      })}
    </ol>
  );
};

export default ResearchTimeline;
