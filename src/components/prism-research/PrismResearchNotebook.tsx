import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Edit3, FolderOpen, Loader2, RefreshCw, Save, Sparkles } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';
import ResearchTimeline from './ResearchTimeline';
import ResearchInsights from './ResearchInsights';
import ResearchSourcesPanel from './ResearchSourcesPanel';
import ResearchFollowUps from './ResearchFollowUps';
import NotebookEditorDialog from './NotebookEditorDialog';
import SavedNotebooksDrawer, { NotebookExportFormat } from './SavedNotebooksDrawer';
import {
  SavedResearchNotebook,
  loadSavedNotebooks,
  persistSavedNotebooks,
} from '@/services/researchNotebookStorage';

const DEFAULT_QUERY = 'Artificial intelligence safety';

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'prism-research-notebook';
};

const formatTimestampForDisplay = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toUTCString();
};

const countWords = (value: string | undefined | null): number => {
  if (!value) {
    return 0;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
};

const countNotebookWords = (notebook: ResearchNotebook): number => {
  let total = 0;
  total += countWords(notebook.overview);

  notebook.insights.forEach((insight) => {
    total += countWords(insight.heading);
    total += countWords(insight.summary);
  });

  notebook.timeline.forEach((event) => {
    total += countWords(event.title);
    total += countWords(event.description);
  });

  notebook.sources.forEach((source) => {
    total += countWords(source.title);
    total += countWords(source.snippet);
  });

  notebook.followUps.forEach((followUp) => {
    total += countWords(followUp.question);
    total += countWords(followUp.rationale);
  });

  return total;
};

const notebookToMarkdown = (notebook: ResearchNotebook): string => {
  const sourceLookup = notebook.sources.reduce<Record<string, ResearchSource>>((acc, source) => {
    acc[source.id] = source;
    return acc;
  }, {});

  const lines: string[] = [];
  lines.push(`# ${notebook.query || 'Prism Research Notebook'}`);
  lines.push('');
  lines.push(`Generated at: ${formatTimestampForDisplay(notebook.generatedAt)}`);
  lines.push('');
  lines.push('## Overview');
  lines.push(notebook.overview || 'No overview available.');
  lines.push('');

  lines.push('## Key Insights');
  if (notebook.insights.length === 0) {
    lines.push('No insights recorded.');
  } else {
    notebook.insights.forEach((insight, index) => {
      lines.push(`### ${index + 1}. ${insight.heading || 'Insight'}`);
      lines.push(insight.summary || 'No summary provided.');
      if (insight.supportingSources.length > 0) {
        const sources = insight.supportingSources
          .map((sourceId) => sourceLookup[sourceId])
          .filter(Boolean)
          .map((source) => `[[${source!.id}]](${source!.url}) ${source!.title}`);
        if (sources.length > 0) {
          lines.push('');
          lines.push(`Supporting sources: ${sources.join(', ')}`);
        }
      }
      lines.push('');
    });
  }

  lines.push('## Timeline');
  if (notebook.timeline.length === 0) {
    lines.push('No timeline events recorded.');
  } else {
    notebook.timeline.forEach((event) => {
      const source = sourceLookup[event.sourceId];
      const sourceLabel = source ? ` – Source: [[${source.id}]](${source.url}) ${source.title}` : '';
      lines.push(`- **${event.title || 'Timeline event'}** (${formatTimestampForDisplay(event.timestamp)})${sourceLabel}`);
      lines.push(`  ${event.description || 'No description provided.'}`);
    });
  }
  lines.push('');

  lines.push('## Sources');
  if (notebook.sources.length === 0) {
    lines.push('No sources captured.');
  } else {
    notebook.sources.forEach((source, index) => {
      lines.push(`${index + 1}. [[${source.id}]](${source.url}) — ${source.title}`);
      lines.push(`   - Published: ${formatTimestampForDisplay(source.publishedAt)}`);
      lines.push(`   - Type: ${source.type}`);
      lines.push(`   - Summary: ${source.snippet}`);
    });
  }
  lines.push('');

  lines.push('## Follow-up Actions');
  if (notebook.followUps.length === 0) {
    lines.push('No follow-up actions recorded.');
  } else {
    notebook.followUps.forEach((followUp, index) => {
      lines.push(`${index + 1}. **${followUp.question || 'Follow-up question'}**`);
      lines.push(`   - Rationale: ${followUp.rationale || 'No rationale provided.'}`);
      if (followUp.relatedSources.length > 0) {
        const related = followUp.relatedSources
          .map((sourceId) => sourceLookup[sourceId])
          .filter(Boolean)
          .map((source) => `[[${source!.id}]](${source!.url}) ${source!.title}`);
        if (related.length > 0) {
          lines.push(`   - Related sources: ${related.join(', ')}`);
        }
      }
    });
  }

  return lines.join('\n');
};

const triggerDownload = (filename: string, content: string, mimeType: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const PrismResearchNotebook: React.FC = () => {
  const { toast } = useToast();
  const { consume, getRemaining, limits, isUnlimitedUser } = useDailyQueryLimit();
  const researchWordLimit = limits.researchWords;
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [mode, setMode] = useState<ResearchMode>('comprehensive');
  const [fastMode, setFastMode] = useState(false);
  const [notebook, setNotebook] = useState<ResearchNotebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotebooks, setSavedNotebooks] = useState<SavedResearchNotebook[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const updateSavedNotebookState = useCallback(
    (updater: (current: SavedResearchNotebook[]) => SavedResearchNotebook[]) => {
      setSavedNotebooks((current) => {
        const next = updater(current);
        persistSavedNotebooks(next);
        return next;
      });
    },
    [],
  );

  const snapshotNotebook = useCallback((value: ResearchNotebook): ResearchNotebook => {
    const clone = JSON.parse(JSON.stringify(value)) as ResearchNotebook;
    clone.generatedAt = new Date().toISOString();
    clone.metadata = {
      ...clone.metadata,
      totalSources: clone.sources.length,
    };
    return clone;
  }, []);

  const handleExportNotebook = useCallback(
    (target: ResearchNotebook, format: NotebookExportFormat) => {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filenameBase = `${slugify(target.query || 'prism-research')}-${timestamp}`;

      if (format === 'markdown') {
        triggerDownload(`${filenameBase}.md`, notebookToMarkdown(target), 'text/markdown');
      } else {
        triggerDownload(`${filenameBase}.json`, JSON.stringify(target, null, 2), 'application/json');
      }

      toast({
        title: 'Notebook exported',
        description: `Downloaded ${format === 'markdown' ? 'Markdown' : 'JSON'} file for "${target.query}".`,
      });
    },
    [toast],
  );

  const runNotebook = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setError('Enter a topic or question to start your research notebook.');
        return;
      }

      const remainingWords = getRemaining('researchWords');
      if (!isUnlimitedUser && remainingWords <= 0) {
        toast({
          title: 'Daily limit reached',
          description: `You've reached your daily limit of ${researchWordLimit} Research Preview words. Try again tomorrow.`,
          variant: 'destructive',
        });
        setError('Daily Research Preview word limit reached. Try again tomorrow.');
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

        const generatedWordCount = countNotebookWords(result);
        if (!consume('researchWords', generatedWordCount)) {
          toast({
            title: 'Daily limit reached',
            description: `This run would exceed the ${researchWordLimit}-word Research Preview limit for today. Try again tomorrow.`,
            variant: 'destructive',
          });
          setError('Daily Research Preview word limit reached. Try again tomorrow.');
          return;
        }

        setNotebook(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong while running the notebook.');
      } finally {
        setLoading(false);
      }
    },
    [consume, fastMode, getRemaining, isUnlimitedUser, mode, query, researchWordLimit, toast],
  );

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void runNotebook();
    }
  }, [runNotebook]);

  useEffect(() => {
    setSavedNotebooks(loadSavedNotebooks());
  }, []);

  useEffect(() => {
    if (notebook) {
      setSaveTitle(notebook.query);
    }
  }, [notebook]);

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

  const generateNotebookId = useCallback(() => {
    if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
      return window.crypto.randomUUID();
    }
    return `notebook-${Date.now()}`;
  }, []);

  const handleOpenSaveDialog = useCallback(() => {
    if (!notebook) {
      toast({
        title: 'No notebook to save yet',
        description: 'Run the notebook before saving it to your device.',
        variant: 'destructive',
      });
      return;
    }

    setSaveTitle(notebook.query);
    setIsSaveDialogOpen(true);
  }, [notebook, toast]);

  const handleConfirmSave = useCallback(() => {
    if (!notebook) {
      toast({
        title: 'Nothing to save',
        description: 'Generate a notebook before saving.',
        variant: 'destructive',
      });
      return;
    }

    const title = (saveTitle || notebook.query || 'Prism research notebook').trim();
    const timestamp = new Date().toISOString();
    const snapshot = snapshotNotebook(notebook);

    updateSavedNotebookState((current) => {
      const existing = current.find((entry) => entry.title.toLowerCase() === title.toLowerCase());
      if (existing) {
        return current
          .map((entry) =>
            entry.id === existing.id
              ? {
                  ...entry,
                  title,
                  notebook: snapshot,
                  updatedAt: timestamp,
                }
              : entry,
          )
          .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      }

      const newEntry: SavedResearchNotebook = {
        id: generateNotebookId(),
        title,
        notebook: snapshot,
        createdAt: timestamp,
        updatedAt: timestamp,
        version: 1,
      };

      const combined = [newEntry, ...current].slice(0, 30);
      return combined.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    });

    toast({
      title: 'Notebook saved',
      description: `Stored "${title}" on this device.`,
    });
    setIsSaveDialogOpen(false);
  }, [generateNotebookId, notebook, saveTitle, snapshotNotebook, toast, updateSavedNotebookState]);

  const handleLoadNotebook = useCallback(
    (entry: SavedResearchNotebook) => {
      setNotebook(entry.notebook);
      setQuery(entry.notebook.query);
      setMode(entry.notebook.metadata.searchMode);
      setFastMode(Boolean(entry.notebook.metadata.fastMode));
      setIsDrawerOpen(false);
      toast({
        title: 'Notebook loaded',
        description: `Loaded "${entry.title}" from your saved notebooks.`,
      });
    },
    [toast],
  );

  const handleDeleteNotebook = useCallback(
    (id: string) => {
      updateSavedNotebookState((current) => current.filter((entry) => entry.id !== id));
      toast({
        title: 'Notebook removed',
        description: 'Deleted the saved notebook from this device.',
      });
    },
    [toast, updateSavedNotebookState],
  );

  const handleExportCurrent = useCallback(
    (format: NotebookExportFormat) => {
      if (!notebook) {
        toast({
          title: 'No notebook to export',
          description: 'Generate or load a notebook first.',
          variant: 'destructive',
        });
        return;
      }
      handleExportNotebook(snapshotNotebook(notebook), format);
    },
    [handleExportNotebook, notebook, snapshotNotebook, toast],
  );

  const handleExportSaved = useCallback(
    (entry: SavedResearchNotebook, format: NotebookExportFormat) => {
      handleExportNotebook(entry.notebook, format);
    },
    [handleExportNotebook],
  );

  const handleApplyEdits = useCallback(
    (updated: ResearchNotebook) => {
      setNotebook(updated);
      setQuery(updated.query);
      setMode(updated.metadata.searchMode);
      setFastMode(Boolean(updated.metadata.fastMode));
      toast({
        title: 'Notebook updated',
        description: 'Edits applied to this research session.',
      });
    },
    [toast],
  );

  const handleEditNotebook = useCallback(() => {
    if (!notebook) {
      toast({
        title: 'No notebook to edit yet',
        description: 'Run or load a notebook to open the editor.',
        variant: 'destructive',
      });
      return;
    }
    setIsEditorOpen(true);
  }, [notebook, toast]);

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
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={handleOpenSaveDialog}
                disabled={loading || !notebook}
              >
                <Save className="h-4 w-4" />
                Save notebook
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsDrawerOpen(true)}
              >
                <FolderOpen className="h-4 w-4" />
                Saved notebooks
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleEditNotebook}
                disabled={!notebook}
              >
                <Edit3 className="h-4 w-4" />
                Edit content
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2" disabled={!notebook}>
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem onSelect={() => handleExportCurrent('markdown')}>
                    Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleExportCurrent('json')}>
                    JSON (.json)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      <NotebookEditorDialog
        notebook={notebook}
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSave={handleApplyEdits}
      />

      <SavedNotebooksDrawer
        open={isDrawerOpen}
        notebooks={savedNotebooks}
        onOpenChange={setIsDrawerOpen}
        onLoad={handleLoadNotebook}
        onDelete={handleDeleteNotebook}
        onExport={handleExportSaved}
      />

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save notebook</DialogTitle>
            <DialogDescription>
              Name this notebook to keep it on your device. Saved notebooks can be reloaded, edited, and exported later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="notebook-save-name">Notebook name</Label>
            <Input
              id="notebook-save-name"
              value={saveTitle}
              onChange={(event) => setSaveTitle(event.target.value)}
              placeholder="e.g. AI Safety Landscape"
            />
            <p className="text-xs text-muted-foreground">Notebooks are stored locally in your browser, similar to Prism Vault.</p>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmSave}>
              Save notebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrismResearchNotebook;
