import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChat, CodePlanState } from '@/context/ChatContext';
import { CodeGenerationPlan } from '@/services/codeGenerationService';
import { useToast } from '@/hooks/use-toast';
import { Check, FileJson, Loader2, Pencil, RefreshCcw, Sparkles, X } from 'lucide-react';

interface CodePlanBubbleProps {
  messageId: string;
  planState: CodePlanState;
}

const statusLabel: Record<CodePlanState['status'], string> = {
  'awaiting-user': 'Awaiting approval',
  generating: 'Generating application',
  declined: 'Declined',
  error: 'Generation failed',
  completed: 'Completed',
};

const statusVariant: Record<CodePlanState['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'awaiting-user': 'secondary',
  generating: 'default',
  declined: 'outline',
  error: 'destructive',
  completed: 'default',
};

const formatIso = (iso: string | undefined) => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch (error) {
    return iso;
  }
};

const CodePlanBubble = ({ messageId, planState }: CodePlanBubbleProps) => {
  const { approveCodePlan, declineCodePlan, updateCodePlan } = useChat();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState(() => JSON.stringify(planState.plan, null, 2));

  const libraries = useMemo(() => planState.plan.stack.libraries || [], [planState.plan.stack.libraries]);
  const tooling = useMemo(() => planState.plan.stack.tooling || [], [planState.plan.stack.tooling]);
  const previewDeps = useMemo(() => planState.plan.preview.cdnDependencies || [], [planState.plan.preview.cdnDependencies]);
  const previewNotes = useMemo(() => planState.plan.preview.notes || [], [planState.plan.preview.notes]);

  const handleOpenEditor = () => {
    setDraft(JSON.stringify(planState.plan, null, 2));
    setIsEditorOpen(true);
  };

  const handleSavePlan = () => {
    try {
      const parsed = JSON.parse(draft) as CodeGenerationPlan;
      updateCodePlan(messageId, parsed);
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Invalid plan JSON', error);
      toast({
        title: 'Invalid plan',
        description: 'The plan must be valid JSON matching the documented structure.',
        variant: 'destructive',
      });
    }
  };

  const isActionDisabled = planState.status === 'generating';
  const showApprove = planState.status !== 'generating' && planState.status !== 'completed';
  const canRegenerate = planState.status === 'completed';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI development plan</span>
          </div>
          {planState.planModel && (
            <p className="mt-1 text-xs text-muted-foreground">Planned with {planState.planModel}</p>
          )}
        </div>
        <Badge variant={statusVariant[planState.status]} className="text-xs">
          {statusLabel[planState.status]}
        </Badge>
      </div>

      <Card className="bg-muted/20 border-border/40">
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overview</p>
            <p className="text-sm text-foreground leading-relaxed mt-1">{planState.plan.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stack</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  Language: {planState.plan.stack.language}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Framework: {planState.plan.stack.framework}
                </Badge>
              </div>
              {libraries.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Libraries / CDNs</p>
                  <div className="flex flex-wrap gap-2">
                    {libraries.map((library) => (
                      <Badge key={library} variant="outline" className="text-xs">
                        {library}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {tooling.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Tooling</p>
                  <div className="flex flex-wrap gap-2">
                    {tooling.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {planState.plan.stack.notes && (
                <p className="mt-2 text-xs text-muted-foreground">{planState.plan.stack.notes}</p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview strategy</p>
              <p className="text-sm text-foreground leading-relaxed">{planState.plan.preview.strategy}</p>
              {previewDeps.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview dependencies</p>
                  <div className="flex flex-wrap gap-2">
                    {previewDeps.map((dependency) => (
                      <Badge key={dependency} variant="outline" className="text-xs">
                        {dependency}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {previewNotes.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {previewNotes.map((note, index) => (
                    <li key={`${note}-${index}`}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {planState.plan.goals.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Goals</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {planState.plan.goals.map((goal, index) => (
                  <li key={`${goal}-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}

          {planState.plan.features.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Key features</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {planState.plan.features.map((feature, index) => (
                  <li key={`${feature}-${index}`}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {planState.plan.pages.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Pages & components</p>
              <div className="space-y-2">
                {planState.plan.pages.map((page, index) => (
                  <div key={`${page.name}-${index}`} className="rounded-md border border-border/40 p-2">
                    <p className="text-sm font-medium text-foreground">{page.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{page.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {planState.plan.steps.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Implementation steps</p>
              <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                {planState.plan.steps.map((step, index) => (
                  <li key={`${step.title}-${index}`}>
                    <span className="font-medium">{step.title}: </span>
                    <span className="text-muted-foreground">{step.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(planState.plan.risks?.length || 0) > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Risks</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {planState.plan.risks?.map((risk, index) => (
                  <li key={`${risk}-${index}`}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {(planState.plan.testing?.length || 0) > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Testing & QA</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {planState.plan.testing?.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {planState.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {planState.error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {showApprove && (
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={() => approveCodePlan(messageId)}
                disabled={isActionDisabled}
              >
                {planState.status === 'generating' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {planState.status === 'error' ? 'Try again' : 'Approve plan'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleOpenEditor}
              disabled={planState.status === 'generating'}
            >
              <Pencil className="h-4 w-4" />
              Modify plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => declineCodePlan(messageId)}
              disabled={isActionDisabled}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
            {canRegenerate && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => approveCodePlan(messageId)}
              >
                <RefreshCcw className="h-4 w-4" />
                Regenerate
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleOpenEditor}
            >
              <FileJson className="h-4 w-4" />
              View JSON
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1">
            Last updated: {formatIso(planState.lastUpdated)}
            {planState.generationModel && ` · Generated with ${planState.generationModel}`}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit plan JSON</DialogTitle>
            <DialogDescription>
              Adjust the plan to change the target stack, steps, or preview strategy. Keep the JSON structure intact.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </ScrollArea>
          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Include any frameworks, languages, or additional files you want the generator to produce.
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan}>Save changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodePlanBubble;
