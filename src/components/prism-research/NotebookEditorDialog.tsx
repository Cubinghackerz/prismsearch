import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  ResearchFollowUp,
  ResearchInsight,
  ResearchNotebook,
  ResearchSource,
  ResearchTimelineEvent,
} from '@/services/researchService';

interface NotebookEditorDialogProps {
  notebook: ResearchNotebook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notebook: ResearchNotebook) => void;
}

const cloneNotebook = (value: ResearchNotebook): ResearchNotebook => {
  try {
    if (typeof globalThis.structuredClone === 'function') {
      return globalThis.structuredClone(value);
    }
  } catch (error) {
    console.warn('Structured clone failed, falling back to JSON clone', error);
  }

  return JSON.parse(JSON.stringify(value)) as ResearchNotebook;
};

const allowedSourceTypes: ResearchSource['type'][] = ['Reference', 'News', 'Education', 'Government', 'Web'];

const NotebookEditorDialog: React.FC<NotebookEditorDialogProps> = ({ notebook, open, onOpenChange, onSave }) => {
  const [draft, setDraft] = useState<ResearchNotebook | null>(null);

  useEffect(() => {
    if (open && notebook) {
      setDraft(cloneNotebook(notebook));
    }
  }, [notebook, open]);

  const handleNotebookChange = (updater: (current: ResearchNotebook) => ResearchNotebook) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      return updater(current);
    });
  };

  const updateInsight = (index: number, partial: Partial<ResearchInsight>) => {
    handleNotebookChange((current) => {
      const insights = [...current.insights];
      insights[index] = {
        ...insights[index],
        ...partial,
      };
      return {
        ...current,
        insights,
      };
    });
  };

  const addInsight = () => {
    handleNotebookChange((current) => ({
      ...current,
      insights: [
        ...current.insights,
        {
          id: `insight-${Date.now()}`,
          heading: 'New insight',
          summary: 'Describe the key learning or takeaway.',
          supportingSources: [],
        },
      ],
    }));
  };

  const removeInsight = (index: number) => {
    handleNotebookChange((current) => ({
      ...current,
      insights: current.insights.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateSource = (index: number, partial: Partial<ResearchSource>) => {
    handleNotebookChange((current) => {
      const sources = [...current.sources];
      sources[index] = {
        ...sources[index],
        ...partial,
      };
      const metadata = {
        ...current.metadata,
        totalSources: sources.length,
      };
      return {
        ...current,
        sources,
        metadata,
      };
    });
  };

  const addSource = () => {
    handleNotebookChange((current) => {
      const newSource: ResearchSource = {
        id: `source-${Date.now()}`,
        title: 'New source',
        url: 'https://',
        snippet: 'Add a brief summary or key point from this source.',
        publishedAt: new Date().toISOString(),
        type: 'Web',
      };
      const sources = [...current.sources, newSource];
      return {
        ...current,
        sources,
        metadata: {
          ...current.metadata,
          totalSources: sources.length,
        },
      };
    });
  };

  const removeSource = (index: number) => {
    handleNotebookChange((current) => {
      const sources = current.sources.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        sources,
        metadata: {
          ...current.metadata,
          totalSources: sources.length,
        },
      };
    });
  };

  const updateTimelineEvent = (index: number, partial: Partial<ResearchTimelineEvent>) => {
    handleNotebookChange((current) => {
      const timeline = [...current.timeline];
      timeline[index] = {
        ...timeline[index],
        ...partial,
      };
      return {
        ...current,
        timeline,
      };
    });
  };

  const addTimelineEvent = () => {
    handleNotebookChange((current) => ({
      ...current,
      timeline: [
        ...current.timeline,
        {
          id: `event-${Date.now()}`,
          title: 'New milestone',
          timestamp: new Date().toISOString(),
          description: 'Summarize why this point matters to the research.',
          sourceId: current.sources[0]?.id ?? 'source-0',
        },
      ],
    }));
  };

  const removeTimelineEvent = (index: number) => {
    handleNotebookChange((current) => ({
      ...current,
      timeline: current.timeline.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateFollowUp = (index: number, partial: Partial<ResearchFollowUp>) => {
    handleNotebookChange((current) => {
      const followUps = [...current.followUps];
      followUps[index] = {
        ...followUps[index],
        ...partial,
      };
      return {
        ...current,
        followUps,
      };
    });
  };

  const addFollowUp = () => {
    handleNotebookChange((current) => ({
      ...current,
      followUps: [
        ...current.followUps,
        {
          id: `follow-${Date.now()}`,
          question: 'What additional angle should we explore?',
          rationale: 'Explain why this follow-up could deepen the research findings.',
          relatedSources: [],
        },
      ],
    }));
  };

  const removeFollowUp = (index: number) => {
    handleNotebookChange((current) => ({
      ...current,
      followUps: current.followUps.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const supportingSourcesToString = (sources: string[]) => sources.join(', ');

  const parseSupportingSources = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit notebook</DialogTitle>
          <DialogDescription>
            Adjust the generated content before saving, exporting, or sharing. Changes are applied locally to this session.
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <ScrollArea className="max-h-[65vh] pr-3">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notebook-query">Notebook title or topic</Label>
                <Input
                  id="notebook-query"
                  value={draft.query}
                  onChange={(event) =>
                    handleNotebookChange((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                  placeholder="e.g. Advances in battery technology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notebook-overview">Overview</Label>
                <Textarea
                  id="notebook-overview"
                  value={draft.overview}
                  onChange={(event) =>
                    handleNotebookChange((current) => ({
                      ...current,
                      overview: event.target.value,
                    }))
                  }
                  rows={6}
                  className="min-h-[160px]"
                />
              </div>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Key insights</h3>
                    <p className="text-xs text-muted-foreground">Refine summaries and source links for each insight.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addInsight}>
                    <Plus className="h-4 w-4" />
                    Add insight
                  </Button>
                </div>
                <div className="space-y-4">
                  {draft.insights.map((insight, index) => (
                    <div key={insight.id} className="rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`insight-heading-${insight.id}`}>Heading</Label>
                            <Input
                              id={`insight-heading-${insight.id}`}
                              value={insight.heading}
                              onChange={(event) => updateInsight(index, { heading: event.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`insight-summary-${insight.id}`}>Summary</Label>
                            <Textarea
                              id={`insight-summary-${insight.id}`}
                              value={insight.summary}
                              onChange={(event) => updateInsight(index, { summary: event.target.value })}
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`insight-sources-${insight.id}`}>
                              Supporting sources (comma separated IDs)
                            </Label>
                            <Input
                              id={`insight-sources-${insight.id}`}
                              value={supportingSourcesToString(insight.supportingSources)}
                              onChange={(event) =>
                                updateInsight(index, {
                                  supportingSources: parseSupportingSources(event.target.value),
                                })
                              }
                              placeholder="source-1, source-3"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeInsight(index)}
                          aria-label="Remove insight"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {draft.insights.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Add at least one insight to capture the key findings.</p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Sources</h3>
                    <p className="text-xs text-muted-foreground">Update titles, URLs, and snippets for each reference.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addSource}>
                    <Plus className="h-4 w-4" />
                    Add source
                  </Button>
                </div>
                <div className="space-y-4">
                  {draft.sources.map((source, index) => (
                    <div key={source.id} className="rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`source-title-${source.id}`}>Title</Label>
                              <Input
                                id={`source-title-${source.id}`}
                                value={source.title}
                                onChange={(event) => updateSource(index, { title: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`source-url-${source.id}`}>URL</Label>
                              <Input
                                id={`source-url-${source.id}`}
                                value={source.url}
                                onChange={(event) => updateSource(index, { url: event.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`source-snippet-${source.id}`}>Snippet</Label>
                            <Textarea
                              id={`source-snippet-${source.id}`}
                              value={source.snippet}
                              onChange={(event) => updateSource(index, { snippet: event.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`source-published-${source.id}`}>Published date</Label>
                              <Input
                                id={`source-published-${source.id}`}
                                value={source.publishedAt}
                                onChange={(event) => updateSource(index, { publishedAt: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={source.type}
                                onValueChange={(value) => updateSource(index, { type: value as ResearchSource['type'] })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allowedSourceTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSource(index)}
                          aria-label="Remove source"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {draft.sources.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Include sources so citations can be referenced throughout the notebook.
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Timeline</h3>
                    <p className="text-xs text-muted-foreground">Document the chronology of key developments.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addTimelineEvent}>
                    <Plus className="h-4 w-4" />
                    Add event
                  </Button>
                </div>
                <div className="space-y-4">
                  {draft.timeline.map((event, index) => (
                    <div key={event.id} className="rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`timeline-title-${event.id}`}>Title</Label>
                            <Input
                              id={`timeline-title-${event.id}`}
                              value={event.title}
                              onChange={(eventChange) => updateTimelineEvent(index, { title: eventChange.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`timeline-description-${event.id}`}>Description</Label>
                            <Textarea
                              id={`timeline-description-${event.id}`}
                              value={event.description}
                              onChange={(eventChange) => updateTimelineEvent(index, { description: eventChange.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`timeline-timestamp-${event.id}`}>Timestamp</Label>
                              <Input
                                id={`timeline-timestamp-${event.id}`}
                                value={event.timestamp}
                                onChange={(eventChange) => updateTimelineEvent(index, { timestamp: eventChange.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`timeline-source-${event.id}`}>Source ID</Label>
                              <Input
                                id={`timeline-source-${event.id}`}
                                value={event.sourceId}
                                onChange={(eventChange) => updateTimelineEvent(index, { sourceId: eventChange.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeTimelineEvent(index)}
                          aria-label="Remove timeline event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {draft.timeline.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Add events to explain how information unfolded over time.</p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Follow-up actions</h3>
                    <p className="text-xs text-muted-foreground">Outline next steps or related research questions.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addFollowUp}>
                    <Plus className="h-4 w-4" />
                    Add follow-up
                  </Button>
                </div>
                <div className="space-y-4">
                  {draft.followUps.map((followUp, index) => (
                    <div key={followUp.id} className="rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`follow-question-${followUp.id}`}>Question</Label>
                            <Textarea
                              id={`follow-question-${followUp.id}`}
                              value={followUp.question}
                              onChange={(event) => updateFollowUp(index, { question: event.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`follow-rationale-${followUp.id}`}>Rationale</Label>
                            <Textarea
                              id={`follow-rationale-${followUp.id}`}
                              value={followUp.rationale}
                              onChange={(event) => updateFollowUp(index, { rationale: event.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`follow-sources-${followUp.id}`}>Related sources (comma separated IDs)</Label>
                            <Input
                              id={`follow-sources-${followUp.id}`}
                              value={supportingSourcesToString(followUp.relatedSources)}
                              onChange={(event) =>
                                updateFollowUp(index, {
                                  relatedSources: parseSupportingSources(event.target.value),
                                })
                              }
                              placeholder="source-2, source-4"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFollowUp(index)}
                          aria-label="Remove follow-up"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {draft.followUps.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Capture follow-ups to keep momentum on the research effort.</p>
                  ) : null}
                </div>
              </section>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-2 py-10 text-center text-sm text-muted-foreground">
            <p>Select a notebook to edit or run a new research session.</p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (draft) {
                onSave({
                  ...draft,
                  metadata: {
                    ...draft.metadata,
                    totalSources: draft.sources.length,
                  },
                });
              }
              onOpenChange(false);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default NotebookEditorDialog;
