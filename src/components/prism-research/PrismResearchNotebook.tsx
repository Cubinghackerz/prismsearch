import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import {
  fetchResearchNotebook,
  ResearchMode,
  ResearchNotebook,
  ResearchSource,
} from '@/services/researchService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import ResearchTimeline from './ResearchTimeline';
import ResearchInsights from './ResearchInsights';
import ResearchSourcesPanel from './ResearchSourcesPanel';
import ResearchFollowUps from './ResearchFollowUps';

const DEFAULT_QUERY = 'Artificial intelligence safety';

const PrismResearchNotebook: React.FC = () => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [mode, setMode] = useState<ResearchMode>('comprehensive');
  const [fastMode, setFastMode] = useState(false);
  const [notebook, setNotebook] = useState<ResearchNotebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runNotebook = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setError('Enter a topic or question to start your research notebook.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchResearchNotebook(trimmed, {
          mode,
          fastMode,
          maxSources: 10,
          forceRefresh: options?.forceRefresh,
        });
        setNotebook(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong while running the notebook.');
      } finally {
        setLoading(false);
      }
    },
    [fastMode, mode, query],
  );

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void runNotebook();
    }
  }, [runNotebook]);

  const sourceLookup = useMemo(() => {
    if (!notebook) {
      return {} as Record<string, ResearchSource>;
    }
    return notebook.sources.reduce<Record<string, ResearchSource>>((acc, source) => {
      acc[source.id] = source;
      return acc;
    }, {});
  }, [notebook]);

  const lastRunLabel = useMemo(() => {
    if (!notebook) {
      return null;
    }
    try {
      return formatDistanceToNow(new Date(notebook.generatedAt), { addSuffix: true });
    } catch {
      return null;
    }
  }, [notebook]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void runNotebook();
  };

  const showSkeleton = loading && !notebook;

  return (
    <div className="space-y-8" id="prism-research-notebook">
      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-semibold">Research notebook</CardTitle>
              <CardDescription>
                Aggregate search findings, AI summaries, and next steps in a single workspace.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Research preview
            </Badge>
          </div>
          {notebook ? (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                Mode: <strong className="text-foreground">{notebook.metadata.searchMode}</strong>
              </span>
              <span>
                Sources: <strong className="text-foreground">{notebook.metadata.totalSources}</strong>
              </span>
              <span>
                Last run: <strong className="text-foreground">{lastRunLabel ?? 'just now'}</strong>
              </span>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <Label htmlFor="research-topic" className="text-sm font-medium text-foreground">
                  Topic or question
                </Label>
                <Input
                  id="research-topic"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Next-generation battery technology"
                  className="h-12"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="research-mode" className="text-sm font-medium text-foreground">
                    Research depth
                  </Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as ResearchMode)}>
                    <SelectTrigger id="research-mode" className="h-12">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick scan</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="quantum">Quantum (deep dive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Fast mode</p>
                    <p className="text-xs text-muted-foreground">Skips extended scraping for speed.</p>
                  </div>
                  <Switch checked={fastMode} onCheckedChange={setFastMode} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                The notebook coordinates search, summarization, and task planning so you can stay focused on analysis.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => void runNotebook({ forceRefresh: true })}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh sources
                </Button>
                <Button type="submit" className="gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loading ? 'Running notebook...' : 'Run notebook'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Notebook error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className={`space-y-6 ${loading ? 'transition-opacity duration-300' : ''}`} aria-busy={loading}>
          <Card className="relative overflow-hidden border-border/60 bg-background/80">
            {loading ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : null}
            <CardHeader>
              <CardTitle className="text-xl">Research overview</CardTitle>
              <CardDescription>
                {notebook ? 'AI-generated summary of the sources collected in this session.' : 'Start a session to generate an overview.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : notebook ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {notebook.overview}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The overview will summarize your topic once the notebook has run.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle className="text-xl">Key insights</CardTitle>
              <CardDescription>Structured findings with links back to supporting material.</CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <ResearchInsights insights={notebook?.insights ?? []} sources={sourceLookup} />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle className="text-xl">Source timeline</CardTitle>
              <CardDescription>See how the notebook stitched information together.</CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ) : (
                <ResearchTimeline events={notebook?.timeline ?? []} sources={sourceLookup} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle className="text-lg">Source library</CardTitle>
              <CardDescription>Primary references captured during the session.</CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <ResearchSourcesPanel sources={notebook?.sources ?? []} />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle className="text-lg">Suggested follow-ups</CardTitle>
              <CardDescription>Transform the research into actionable next steps.</CardDescription>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <ResearchFollowUps followUps={notebook?.followUps ?? []} sources={sourceLookup} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrismResearchNotebook;
