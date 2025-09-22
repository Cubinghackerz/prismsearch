import React from 'react';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { ResearchInsight, ResearchSource } from '@/services/researchService';
import { Badge } from '@/components/ui/badge';

interface ResearchInsightsProps {
  insights: ResearchInsight[];
  sources: Record<string, ResearchSource>;
}

const ResearchInsights: React.FC<ResearchInsightsProps> = ({ insights, sources }) => {
  if (!insights.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border/60 text-sm text-muted-foreground">
        Run the notebook to generate structured insights for your topic.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {insights.map((insight, index) => {
        const relatedSources = insight.supportingSources
          .map((id) => sources[id])
          .filter((source): source is ResearchSource => Boolean(source));

        return (
          <div key={insight.id} className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Insight {index + 1}
                  </Badge>
                  <p className="text-base font-semibold text-foreground">{insight.heading}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {insight.summary}
                </p>
                {relatedSources.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {relatedSources.map((source) => {
                      let hostname = '';
                      try {
                        hostname = new URL(source.url).hostname;
                      } catch {
                        hostname = source.url;
                      }

                      return (
                        <a
                          key={`${insight.id}-${source.id}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          {hostname}
                          <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      );
                    })}
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

export default ResearchInsights;
