import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Plus, Save, Trash2, Play, ListTree, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  WorkflowTemplate,
  WorkflowStepConfig,
  WorkflowCadence,
  buildWorkflowPlan,
  createBlankWorkflowTemplate,
  createWorkflowStep,
  deleteWorkflowTemplate,
  exportWorkflowTemplate,
  listWorkflowTemplates,
  saveWorkflowTemplate,
} from '@/services/workflowService';
import { CHAT_COMMAND_GUIDE, getCommandLabel } from '@/context/ChatContext';

interface WorkflowRunRecord {
  id: string;
  templateId: string;
  templateName: string;
  executedAt: string;
  stepCount: number;
  cadence: WorkflowCadence;
}

const WorkflowStepEditor: React.FC<{
  step: WorkflowStepConfig;
  index: number;
  onChange: (step: WorkflowStepConfig) => void;
  onDelete: () => void;
}> = ({ step, index, onChange, onDelete }) => {
  const commandOptions = useMemo(
    () => CHAT_COMMAND_GUIDE.map((item) => item.key).filter((key) => key !== 'workflow'),
    []
  );

  return (
    <Card className="border-dashed border-border/60 bg-background/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Step {index + 1}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Remove step">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`workflow-step-command-${step.id}`}>Command</Label>
            <Select
              value={step.command}
              onValueChange={(value) => onChange({ ...step, command: value as WorkflowStepConfig['command'] })}
            >
              <SelectTrigger id={`workflow-step-command-${step.id}`}>
                <SelectValue placeholder="Choose a command" />
              </SelectTrigger>
              <SelectContent>
                {commandOptions.map((commandKey) => (
                  <SelectItem key={commandKey} value={commandKey}>
                    {getCommandLabel(commandKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`workflow-step-title-${step.id}`}>Optional label</Label>
            <Input
              id={`workflow-step-title-${step.id}`}
              placeholder="e.g. Prepare research summary"
              value={step.title || ''}
              onChange={(event) => onChange({ ...step, title: event.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workflow-step-input-${step.id}`}>Instructions</Label>
          <Textarea
            id={`workflow-step-input-${step.id}`}
            placeholder="Describe what this step should do, including any data sources or follow-up tasks."
            value={step.input}
            onChange={(event) => onChange({ ...step, input: event.target.value })}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workflow-step-notes-${step.id}`}>Notes</Label>
          <Textarea
            id={`workflow-step-notes-${step.id}`}
            placeholder="Reminders, dependencies, or resources to reference during this step."
            value={step.notes || ''}
            onChange={(event) => onChange({ ...step, notes: event.target.value })}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const PrismWorkflowStudio: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [draft, setDraft] = useState<WorkflowTemplate>(() => ({
    ...createBlankWorkflowTemplate(),
    steps: [createWorkflowStep('summarize')],
  }));
  const [recentRuns, setRecentRuns] = useState<WorkflowRunRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'library' | 'runs'>('builder');

  useEffect(() => {
    setTemplates(listWorkflowTemplates());
  }, []);

  const updateStep = (index: number, updatedStep: WorkflowStepConfig) => {
    setDraft((current) => {
      const nextSteps = [...current.steps];
      nextSteps[index] = updatedStep;
      return {
        ...current,
        steps: nextSteps,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const addStep = () => {
    setDraft((current) => ({
      ...current,
      steps: [...current.steps, createWorkflowStep()],
      updatedAt: new Date().toISOString(),
    }));
  };

  const deleteStep = (index: number) => {
    setDraft((current) => {
      const nextSteps = current.steps.filter((_, stepIndex) => stepIndex !== index);
      return {
        ...current,
        steps: nextSteps.length > 0 ? nextSteps : [createWorkflowStep('summarize')],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const resetDraft = () => {
    setDraft({
      ...createBlankWorkflowTemplate(),
      steps: [createWorkflowStep('summarize')],
    });
  };

  const handleSaveTemplate = async () => {
    if (!draft.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Give your workflow a clear name before saving it.',
        variant: 'destructive',
      });
      return;
    }

    const saved = await saveWorkflowTemplate(draft);
    setTemplates(listWorkflowTemplates());
    setDraft(saved);
    toast({
      title: 'Workflow saved',
      description: 'This automation is available in your library and the /workflow command.',
    });
  };

  const handleLoadTemplate = (template: WorkflowTemplate) => {
    setDraft({
      ...template,
      steps: template.steps.length > 0 ? template.steps : [createWorkflowStep('summarize')],
    });
    setActiveTab('builder');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteWorkflowTemplate(templateId);
    const updated = listWorkflowTemplates();
    setTemplates(updated);
    if (draft.id === templateId) {
      resetDraft();
    }
    toast({
      title: 'Workflow removed',
      description: 'The template has been removed from your library.',
    });
  };

  const handleExportTemplate = (template: WorkflowTemplate) => {
    const data = exportWorkflowTemplate(template);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Workflow exported',
      description: 'Download complete. Share or version your automation anywhere.',
    });
  };

  const runWorkflow = () => {
    const plan = buildWorkflowPlan(
      JSON.stringify({
        name: draft.name,
        description: draft.description,
        cadence: draft.cadence,
        cadenceDetail: draft.cadenceDetail,
        steps: draft.steps,
      })
    );

    const runRecord: WorkflowRunRecord = {
      id: uuidv4(),
      templateId: draft.id,
      templateName: draft.name,
      executedAt: new Date().toISOString(),
      stepCount: plan.template.steps.length,
      cadence: plan.template.cadence,
    };

    setRecentRuns((current) => [runRecord, ...current].slice(0, 10));
    toast({
      title: 'Workflow simulated',
      description: 'Review the run summary in the Execution log tab. Use /workflow in chat to run it live.',
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-8">
      <TabsList className="grid w-full grid-cols-3 bg-background/60">
        <TabsTrigger value="builder">Design workflow</TabsTrigger>
        <TabsTrigger value="library">Saved templates</TabsTrigger>
        <TabsTrigger value="runs">Execution log</TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="space-y-6">
        <Card className="border-border/60 bg-background/80 shadow-lg">
          <CardHeader>
            <CardTitle>Workflow overview</CardTitle>
            <CardDescription>Give your automation a memorable name, context, and cadence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow name</Label>
                <Input
                  id="workflow-name"
                  placeholder="e.g. Weekly product update briefing"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-cadence">Cadence</Label>
                <Select
                  value={draft.cadence}
                  onValueChange={(value) =>
                    setDraft({ ...draft, cadence: value as WorkflowCadence, updatedAt: new Date().toISOString() })
                  }
                >
                  <SelectTrigger id="workflow-cadence">
                    <SelectValue placeholder="Choose cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                placeholder="Summarize the purpose, data sources, and expected outcomes of this automation."
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-cadence-detail">Cadence detail</Label>
              <Input
                id="workflow-cadence-detail"
                placeholder="e.g. Mondays at 9am ET via calendar reminder"
                value={draft.cadenceDetail || ''}
                onChange={(event) => setDraft({ ...draft, cadenceDetail: event.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/80 shadow-lg">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Steps</CardTitle>
              <CardDescription>Sequence Prism commands to cover every stage of your workflow.</CardDescription>
            </div>
            <Button onClick={addStep} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add step
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {draft.steps.map((step, index) => (
                <WorkflowStepEditor
                  key={step.id}
                  step={step}
                  index={index}
                  onChange={(updatedStep) => updateStep(index, updatedStep)}
                  onDelete={() => deleteStep(index)}
                />
              ))}
            </div>
            <Alert className="border-primary/30 bg-primary/10">
              <ListTree className="h-4 w-4" />
              <AlertTitle>Reference previous steps</AlertTitle>
              <AlertDescription>
                Mention outputs from earlier steps using tokens like <code>{'{step1.summary}'}</code> or describe dependencies so
                the assistant can pass context along during execution.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{draft.steps.length} steps</Badge>
                <Badge variant="outline" className="text-primary border-primary/40">
                  /workflow in Prism Chat
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={resetDraft} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportTemplate(draft)} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Export draft
                </Button>
                <Button size="sm" onClick={handleSaveTemplate} className="gap-2 bg-primary text-primary-foreground">
                  <Save className="h-4 w-4" />
                  Save template
                </Button>
                <Button variant="secondary" size="sm" onClick={runWorkflow} className="gap-2">
                  <Play className="h-4 w-4" />
                  Simulate run
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="library" className="space-y-6">
        {templates.length === 0 ? (
          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle>No workflows yet</CardTitle>
              <CardDescription>Create your first automation in the Design tab, then it will appear here.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="border-border/60 bg-background/80 shadow">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {template.cadence.charAt(0).toUpperCase() + template.cadence.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="whitespace-pre-wrap text-muted-foreground">
                    {template.description || 'No description provided yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Steps</p>
                    <ScrollArea className="max-h-40 rounded-md border border-border/40">
                      <div className="space-y-3 p-3">
                        {template.steps.map((step, index) => (
                          <div key={`${template.id}-step-${index}`} className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                              <span className="font-semibold text-foreground/80">Step {index + 1}</span>
                              <span>{getCommandLabel(step.command)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.input}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <Separator className="bg-border/60" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleLoadTemplate(template)} className="gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Load
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportTemplate(template)} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template.id)} className="gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="runs" className="space-y-6">
        {recentRuns.length === 0 ? (
          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle>No execution history yet</CardTitle>
              <CardDescription>Simulate a workflow run to preview the steps that will execute in chat.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle>Recent runs</CardTitle>
              <CardDescription>Use this log to keep track of automated routines and manual triggers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {recentRuns.map((run) => (
                  <div key={run.id} className="rounded-lg border border-border/50 bg-background/70 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold">{run.templateName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.executedAt).toLocaleString()} • {run.stepCount} steps • {run.cadence}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Draft simulation
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PrismWorkflowStudio;
