import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Save, ClipboardCheck, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowExecutionPlan } from '@/services/workflowService';
import {
  exportWorkflowTemplate,
  saveWorkflowTemplate,
} from '@/services/workflowService';
import { getCommandLabel } from '@/context/ChatContext';

interface WorkflowCommandBubbleProps {
  plan: WorkflowExecutionPlan;
}

const WorkflowCommandBubble: React.FC<WorkflowCommandBubbleProps> = ({ plan }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveWorkflowTemplate(plan.template);
      setIsSaved(true);
      toast({
        title: 'Workflow saved',
        description: 'You can manage this automation from Prism Workflow Studio.',
      });
    } catch (error) {
      console.error('Failed to save workflow template:', error);
      toast({
        title: 'Save failed',
        description: 'We could not save this workflow. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      const data = exportWorkflowTemplate(plan.template);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${plan.template.name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Workflow exported',
        description: 'A JSON copy of this automation has been downloaded.',
      });
    } catch (error) {
      console.error('Failed to export workflow template:', error);
      toast({
        title: 'Export failed',
        description: 'We could not export this workflow. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(plan.summary);
      toast({
        title: 'Summary copied',
        description: 'Workflow summary copied to your clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy workflow summary:', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy workflow summary. Try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const cadenceLabel = plan.template.cadence === 'manual'
    ? 'Manual'
    : plan.template.cadence.charAt(0).toUpperCase() + plan.template.cadence.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{plan.template.name}</h3>
          {plan.template.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {plan.template.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40">
          {cadenceLabel} cadence
        </Badge>
      </div>

      <Separator className="bg-border/60" />

      <Card className="border-border/60 bg-background/80">
        <CardContent className="p-0">
          <ScrollArea className="max-h-72">
            <div className="divide-y divide-border/60">
              {plan.template.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 px-4 py-3">
                  <Badge variant="secondary" className="h-6">
                    {index + 1}
                  </Badge>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {getCommandLabel(step.command)}
                      </span>
                      {step.title && (
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {step.title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {step.input || 'Add instructions for this step.'}
                    </p>
                    {step.notes && (
                      <p className="text-xs text-muted-foreground/80 italic">
                        Notes: {step.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {plan.warnings.length > 0 && (
        <Alert variant="destructive" className="border-red-500/40 bg-red-500/10">
          <AlertTitle>Setup notes</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              {plan.warnings.map((warning, index) => (
                <li key={`${plan.runId}-warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {plan.recommendations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {plan.recommendations.map((tip, index) => (
            <Badge key={`${plan.runId}-tip-${index}`} variant="outline" className="border-primary/40 bg-primary/5 text-primary">
              {tip}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="outline" size="sm" onClick={handleCopySummary} className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Copy summary
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          {isSaved ? 'Saved' : 'Save to Workflow Studio'}
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <PlayCircle className="h-4 w-4 text-primary" />
        <span>
          Run this workflow from Prism Workflow Studio or trigger each step manually as you gather new inputs.
        </span>
      </div>
    </div>
  );
};

export default WorkflowCommandBubble;
