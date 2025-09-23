import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedCommand } from '@/context/ChatContext';

export type WorkflowCadence = 'manual' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface WorkflowStepConfig {
  id: string;
  command: SupportedCommand;
  title?: string;
  input: string;
  notes?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStepConfig[];
  cadence: WorkflowCadence;
  cadenceDetail?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionPlan {
  runId: string;
  template: WorkflowTemplate;
  summary: string;
  warnings: string[];
  recommendations: string[];
}

interface WorkflowParseResult {
  template: WorkflowTemplate;
  warnings: string[];
}

const WORKFLOW_STORAGE_KEY = 'prism_workflow_templates';

const isWorkflowCadence = (value: string): value is WorkflowCadence =>
  ['manual', 'daily', 'weekly', 'monthly', 'custom'].includes(value as WorkflowCadence);

const parseCadence = (value: unknown): WorkflowCadence | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.toLowerCase();
  return isWorkflowCadence(normalized) ? normalized : undefined;
};

const defaultTemplate = (): WorkflowTemplate => ({
  id: uuidv4(),
  name: 'Custom Workflow',
  description: 'Automation generated from chat input.',
  steps: [],
  cadence: 'manual',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const normalizeCommand = (value: string): SupportedCommand | null => {
  const cleaned = value.replace(/^\//, '').trim().toLowerCase();
  const knownCommands: SupportedCommand[] = [
    'summarize',
    'explain',
    'math',
    'todo',
    'translate',
    'define',
    'quote',
    'weather',
    'search',
    'remind',
    'calc',
    'table',
    'wiki',
    'news',
    'chess',
    'music',
    'review',
    'script',
    'finance',
    'graph',
    'code',
  ];

  return (knownCommands as string[]).includes(cleaned) ? (cleaned as SupportedCommand) : null;
};

const detectCadence = (text: string): { cadence: WorkflowCadence; detail?: string } => {
  const lower = text.toLowerCase();
  if (/(daily|every day)/.test(lower)) {
    return { cadence: 'daily', detail: 'Triggers once per day' };
  }
  if (/(weekly|every week|mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)/.test(lower)) {
    return { cadence: 'weekly', detail: 'Runs on a weekly cadence' };
  }
  if (/(monthly|every month|1st|first of the month)/.test(lower)) {
    return { cadence: 'monthly', detail: 'Runs each month' };
  }
  if (/(schedule|cron|every \d+ (minutes?|hours?))/i.test(lower)) {
    return { cadence: 'custom', detail: 'Custom cadence detected from prompt' };
  }

  return { cadence: 'manual' };
};

const parseJsonWorkflow = (input: string): WorkflowParseResult | null => {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const now = new Date().toISOString();
    const schedule =
      record.schedule && typeof record.schedule === 'object'
        ? (record.schedule as Record<string, unknown>)
        : undefined;

    const stepsRaw = Array.isArray(record.steps) ? record.steps : [];
    const steps = stepsRaw
      .map((rawStep, index): WorkflowStepConfig | null => {
        if (!rawStep || typeof rawStep !== 'object') {
          return null;
        }

        const stepRecord = rawStep as Record<string, unknown>;
        const commandValue =
          typeof stepRecord.command === 'string' ? normalizeCommand(stepRecord.command) : null;

        if (!commandValue) {
          return null;
        }

        const titleCandidate =
          typeof stepRecord.title === 'string'
            ? stepRecord.title
            : typeof stepRecord.name === 'string'
            ? stepRecord.name
            : undefined;

        const instruction =
          typeof stepRecord.input === 'string'
            ? stepRecord.input
            : typeof stepRecord.prompt === 'string'
            ? stepRecord.prompt
            : '';

        const note = typeof stepRecord.notes === 'string' ? stepRecord.notes : undefined;

        return {
          id: typeof stepRecord.id === 'string' ? stepRecord.id : uuidv4(),
          command: commandValue,
          title: titleCandidate || `Step ${index + 1}`,
          input: instruction,
          notes: note,
        } satisfies WorkflowStepConfig;
      })
      .filter((step): step is WorkflowStepConfig => Boolean(step));

    const cadenceValue =
      parseCadence(record['cadence']) || (schedule ? parseCadence(schedule['cadence']) : undefined) || 'manual';
    const cadenceDetailValue =
      (typeof record.cadenceDetail === 'string' && record.cadenceDetail) ||
      (schedule && typeof schedule['detail'] === 'string' ? (schedule['detail'] as string) : undefined);

    const tagsValue = Array.isArray(record.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === 'string')
      : undefined;

    const template: WorkflowTemplate = {
      id: typeof record.id === 'string' ? record.id : uuidv4(),
      name:
        (typeof record.name === 'string' && record.name) ||
        (typeof record.title === 'string' && record.title) ||
        'Custom Workflow',
      description:
        (typeof record.description === 'string' && record.description) ||
        (typeof record.summary === 'string' && record.summary) ||
        '',
      cadence: cadenceValue,
      cadenceDetail: cadenceDetailValue,
      steps,
      tags: tagsValue,
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : now,
      updatedAt: now,
    };

    return {
      template,
      warnings: [],
    };
  } catch (error) {
    return null;
  }
};

const parseLineWorkflow = (input: string): WorkflowParseResult => {
  const template = defaultTemplate();
  const warnings: string[] = [];
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    warnings.push('No workflow details detected. Add steps after the command to outline your automation.');
    return { template, warnings };
  }

  let nameAssigned = false;
  const cadenceGuess = detectCadence(input);
  template.cadence = cadenceGuess.cadence;
  template.cadenceDetail = cadenceGuess.detail;

  const stepRegex = /^(?:-?\s*)?(?:step\s*(\d+)\s*[:.-]\s*)?(?:\/)?([a-z0-9-]+)\s*(?:[:|-]\s*|\s+)(.+)$/i;

  lines.forEach((line, index) => {
    const scheduleMatch = line.match(/^(?:schedule|cadence)[:|-]\s*(.+)$/i);
    if (scheduleMatch) {
      const { cadence, detail } = detectCadence(scheduleMatch[1]);
      template.cadence = cadence;
      template.cadenceDetail = detail || scheduleMatch[1];
      return;
    }

    const stepMatch = line.match(stepRegex);
    if (stepMatch) {
      const [, stepNumber, commandRaw, remainder] = stepMatch;
      const command = normalizeCommand(commandRaw);
      if (!command) {
        warnings.push(`Skipped line ${index + 1}: "/${commandRaw}" is not a supported command.`);
        return;
      }

      const parts = remainder.split(/\s+--\s+/);
      const instruction = parts[0].trim();
      const notes = parts[1]?.trim();

      template.steps.push({
        id: uuidv4(),
        command,
        title: stepNumber ? `Step ${stepNumber}` : undefined,
        input: instruction,
        notes,
      });
      return;
    }

    if (!nameAssigned) {
      template.name = line.replace(/^title[:|-]\s*/i, '').replace(/^name[:|-]\s*/i, '') || template.name;
      nameAssigned = true;
      return;
    }

    if (!template.description) {
      template.description = line;
    } else {
      template.description += ` ${line}`;
    }
  });

  if (template.steps.length === 0) {
    warnings.push('No structured steps detected. Created a single summarize step from the request.');
    template.steps.push({
      id: uuidv4(),
      command: 'summarize',
      title: 'Review context',
      input: input,
    });
  }

  template.updatedAt = new Date().toISOString();

  return { template, warnings };
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable for workflow templates:', error);
    return null;
  }
};

const readStoredTemplates = (): WorkflowTemplate[] => {
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((template) => ({
      ...template,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: template.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to parse stored workflow templates:', error);
    return [];
  }
};

const writeStoredTemplates = (templates: WorkflowTemplate[]) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to persist workflow templates:', error);
  }
};

export const parseWorkflowInput = (input: string): WorkflowParseResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    const template = defaultTemplate();
    return {
      template,
      warnings: ['Add at least one step or instruction after /workflow to outline your automation.'],
    };
  }

  const jsonResult = parseJsonWorkflow(trimmed);
  if (jsonResult) {
    return jsonResult;
  }

  return parseLineWorkflow(trimmed);
};

export const buildWorkflowPlan = (input: string): WorkflowExecutionPlan => {
  const { template, warnings } = parseWorkflowInput(input);
  const now = new Date().toISOString();
  template.updatedAt = now;
  if (!template.createdAt) {
    template.createdAt = now;
  }

  const stepsSummary = template.steps
    .map((step, index) => `Step ${index + 1}: /${step.command}${step.title ? ` — ${step.title}` : ''}\n${step.input}`)
    .join('\n\n');

  const scheduleLabel = template.cadence === 'manual'
    ? 'Manual trigger only'
    : template.cadenceDetail || `Runs on a ${template.cadence} cadence`;

  const summaryLines = [
    `**${template.name}**`,
    template.description || 'Multi-step automation ready to run in Prism Workflow Studio.',
    '',
    `Schedule: ${scheduleLabel}`,
    '',
    stepsSummary,
  ].filter(Boolean);

  const recommendations: string[] = [
    'Use "Run workflow" to execute each step sequentially and capture notes along the way.',
    'Save this template to Prism Workflow Studio to reuse, tweak, or schedule later.',
  ];

  if (template.cadence !== 'manual') {
    recommendations.push('Configure reminders or integrations to match the desired cadence.');
  }

  return {
    runId: uuidv4(),
    template,
    summary: summaryLines.join('\n'),
    warnings,
    recommendations,
  };
};

export const listWorkflowTemplates = (): WorkflowTemplate[] => {
  return readStoredTemplates().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
};

export const saveWorkflowTemplate = async (template: WorkflowTemplate): Promise<WorkflowTemplate> => {
  const now = new Date().toISOString();
  const existing = listWorkflowTemplates();
  const idx = existing.findIndex((item) => item.id === template.id);
  const payload: WorkflowTemplate = {
    ...template,
    createdAt: template.createdAt || now,
    updatedAt: now,
  };

  if (idx >= 0) {
    existing[idx] = payload;
  } else {
    existing.unshift(payload);
  }

  writeStoredTemplates(existing);

  try {
    await supabase.from('workflow_templates').upsert({
      id: payload.id,
      name: payload.name,
      description: payload.description,
      cadence: payload.cadence,
      cadence_detail: payload.cadenceDetail,
      steps: payload.steps,
      tags: payload.tags,
      created_at: payload.createdAt,
      updated_at: payload.updatedAt,
    });
  } catch (error) {
    console.warn('Supabase persistence skipped or failed for workflow template:', error);
  }

  return payload;
};

export const deleteWorkflowTemplate = async (templateId: string) => {
  const existing = listWorkflowTemplates().filter((item) => item.id !== templateId);
  writeStoredTemplates(existing);

  try {
    await supabase.from('workflow_templates').delete().eq('id', templateId);
  } catch (error) {
    console.warn('Supabase deletion skipped or failed for workflow template:', error);
  }
};

export const exportWorkflowTemplate = (template: WorkflowTemplate): string => {
  return JSON.stringify(template, null, 2);
};

export const createBlankWorkflowTemplate = (): WorkflowTemplate => ({
  id: uuidv4(),
  name: 'Untitled Automation',
  description: '',
  steps: [],
  cadence: 'manual',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createWorkflowStep = (command: SupportedCommand = 'summarize'): WorkflowStepConfig => ({
  id: uuidv4(),
  command,
  title: '',
  input: '',
});
