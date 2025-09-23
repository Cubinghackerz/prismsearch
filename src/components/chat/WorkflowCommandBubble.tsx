import React, { useEffect, useMemo, useState } from 'react';
import { ListOrdered, Play, Plus, Trash2 } from 'lucide-react';
import { useChat, getCommandLabel } from '@/context/ChatContext';
import type { ChatCommandKey, SupportedCommand } from '@/context/ChatContext';
import {
  WorkflowExecutionPlan,
  WorkflowStep,
  addWorkflowStep,
  getEligibleWorkflowCommands,
  getMaxWorkflowSteps,
  removeWorkflowStep,
  updateWorkflowStep,
} from '@/services/workflowService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import MathRenderer from '@/components/math-assistant/MathRenderer';

interface WorkflowCommandBubbleProps {
  plan: WorkflowExecutionPlan;
}

const WorkflowCommandBubble: React.FC<WorkflowCommandBubbleProps> = ({ plan }) => {
  const { executeCommand, generateCodeFromPrompt } = useChat();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [steps, setSteps] = useState<WorkflowStep[]>(plan.steps);
  const [isRunning, setIsRunning] = useState(false);
  const maxSteps = getMaxWorkflowSteps();

  const eligibleCommands = useMemo(() => getEligibleWorkflowCommands(), []);

  useEffect(() => {
    setSteps(plan.steps);
    setDialogOpen(true);
  }, [plan.runId, plan.steps]);

  const handleCommandChange = (stepId: string, value: string) => {
    setSteps((prev) => updateWorkflowStep(prev, stepId, { command: value as SupportedCommand }));
  };

  const handleInputChange = (stepId: string, value: string) => {
    setSteps((prev) => updateWorkflowStep(prev, stepId, { input: value }));
  };

  const handleAddStep = () => {
    setSteps((prev) => addWorkflowStep(prev));
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps((prev) => removeWorkflowStep(prev, stepId));
  };

  const runWorkflow = async () => {
    const preparedSteps = steps
      .map((step) => ({ ...step, input: step.input.trim() }))
      .filter((step) => step.input.length > 0);

    if (preparedSteps.length === 0) {
      toast({
        title: 'Add step details',
        description: 'Please provide details for at least one command before running the workflow.',
        variant: 'destructive',
      });
      return;
    }

    if (preparedSteps.length !== steps.length) {
      toast({
        title: 'Missing step details',
        description: 'Each command needs input so the workflow can run in order.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);

    try {
      let previousOutput = '';

      for (const [index, step] of preparedSteps.entries()) {
        const stepNumber = index + 1;
        const contextPrefix = previousOutput
          ? `\n\nContext from previous steps:\n${previousOutput}`
          : '';
        const combinedInput = `${step.input}${contextPrefix}`.trim();

        if (step.command === 'code') {
          await generateCodeFromPrompt(combinedInput);
          previousOutput = `Code generation requested with prompt:\n${combinedInput}`;
        } else {
          const assistantMessage = await executeCommand(step.command as ChatCommandKey, combinedInput);
          if (!assistantMessage) {
            throw new Error(`Step ${stepNumber} did not complete. Check the chat transcript for details.`);
          }

          previousOutput = assistantMessage.formattedContent ?? assistantMessage.content;
        }
      }

      setDialogOpen(false);
      toast({
        title: 'Workflow running',
        description: 'Each step was triggered in Prism Chat. Review the transcript for results.',
      });
    } catch (error) {
      console.error('Workflow execution error:', error);
      toast({
        title: 'Workflow interrupted',
        description: error instanceof Error ? error.message : 'Something went wrong while running the steps.',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const renderedSteps = steps.map((step, index) => {
    const positionLabel = `Step ${index + 1}`;
    const isRemovalDisabled = steps.length === 1;

    return (
      <div key={step.id} className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Badge variant="outline" className="border-primary/40 text-primary">
              {positionLabel}
            </Badge>
            <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
              Runs after previous command
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleRemoveStep(step.id)}
            disabled={isRemovalDisabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[200px,1fr] sm:items-start">
          <div className="space-y-2">
            <Label htmlFor={`workflow-command-${step.id}`} className="text-xs uppercase tracking-wide text-muted-foreground/80">
              Command
            </Label>
            <Select
              value={step.command}
              onValueChange={(value) => handleCommandChange(step.id, value)}
            >
              <SelectTrigger id={`workflow-command-${step.id}`} className="capitalize">
                <SelectValue placeholder="Select a command" />
              </SelectTrigger>
              <SelectContent>
                {eligibleCommands.map((command) => (
                  <SelectItem key={command} value={command} className="capitalize">
                    {getCommandLabel(command)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`workflow-input-${step.id}`}
              className="text-xs uppercase tracking-wide text-muted-foreground/80"
            >
              Details
            </Label>
            <Textarea
              id={`workflow-input-${step.id}`}
              value={step.input}
              onChange={(event) => handleInputChange(step.id, event.target.value)}
              placeholder={`Describe what ${getCommandLabel(step.command)} should do.`}
              className="min-h-[90px]"
            />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-4">
      <MathRenderer content={plan.summary} className="text-sm leading-relaxed text-foreground/90" />

      <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListOrdered className="h-4 w-4 text-primary" />
            Workflow steps overview
          </div>
          <Badge variant="secondary" className="text-xs uppercase tracking-wide">Sequential</Badge>
        </div>

        <div className="space-y-3 px-4 py-4 text-sm text-muted-foreground leading-relaxed">
          <p>{plan.notes[0]}</p>
          {plan.notes.slice(1).map((note, index) => (
            <p key={index}>{note}</p>
          ))}
          <ul className="mt-2 space-y-2">
            {steps.map((step, index) => (
              <li key={step.id} className="flex flex-col gap-1 rounded-lg bg-card/50 p-3 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wide">
                  Step {index + 1}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {getCommandLabel(step.command)}
                </span>
                <span className="text-xs text-muted-foreground/90 break-words">
                  {step.input ? step.input : 'Add details to run this command.'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-muted/30 px-4 py-3">
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            Edit steps
          </Button>
          <Button size="sm" className="gap-2" onClick={runWorkflow} disabled={isRunning}>
            {isRunning ? (
              <>
                <Play className="h-4 w-4 animate-pulse" /> Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Run workflow
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Workflow steps/commands</DialogTitle>
            <DialogDescription>
              Information from each step is passed on to the next command automatically. Configure up to three commands below.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-2">
              {renderedSteps}
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="border-dashed">
                Up to {maxSteps} steps
              </Badge>
              <Badge variant="outline" className="border-dashed">
                Commands run sequentially
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleAddStep}
                disabled={steps.length >= maxSteps}
              >
                <Plus className="h-4 w-4" /> Add step
              </Button>
              <Button type="button" className="gap-2" onClick={runWorkflow} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Play className="h-4 w-4 animate-pulse" /> Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Run workflow
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowCommandBubble;
