import { v4 as uuidv4 } from 'uuid';
import type { SupportedCommand } from '@/context/ChatContext';

export interface WorkflowStep {
  id: string;
  command: SupportedCommand;
  input: string;
}

export interface WorkflowExecutionPlan {
  runId: string;
  steps: WorkflowStep[];
  summary: string;
  notes: string[];
  originalInput: string;
}

const MAX_STEPS = 3;
const COMMAND_REGEX = /\/([a-z0-9-]+)\s*([^/]*)/gi;

const WORKFLOW_ELIGIBLE_COMMANDS: SupportedCommand[] = [
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

const WORKFLOW_COMMAND_SET = new Set(WORKFLOW_ELIGIBLE_COMMANDS);

const isEligibleWorkflowCommand = (value: string): value is SupportedCommand => {
  const normalized = value.toLowerCase() as SupportedCommand;
  return WORKFLOW_COMMAND_SET.has(normalized) && normalized !== 'workflow';
};

const createEmptyStep = (command: SupportedCommand = 'summarize', input = ''): WorkflowStep => ({
  id: uuidv4(),
  command,
  input,
});

const stripTrailingConnector = (value: string): string =>
  value.replace(/(?:\band\s+then\b|\bthen\b|\band\b)\s*$/i, '').trim();

const buildSummary = (steps: WorkflowStep[]): string => {
  if (steps.length === 0) {
    return 'Start by adding up to three Prism commands to run back-to-back.';
  }

  if (steps.length === 1) {
    return 'Ready to run a single command with results you can reuse in follow-up steps later.';
  }

  return `Ready to run ${steps.length} commands in sequence with each output feeding the next step.`;
};

export const buildWorkflowPlan = (rawInput: string): WorkflowExecutionPlan => {
  const trimmed = rawInput.trim();
  const matches = Array.from(trimmed.matchAll(COMMAND_REGEX));
  const steps: WorkflowStep[] = [];

  for (const match of matches) {
    const [, commandName, commandInput = ''] = match;
    if (!commandName) {
      continue;
    }

    const normalized = commandName.trim().toLowerCase();

    if (!isEligibleWorkflowCommand(normalized)) {
      continue;
    }

    const sanitizedInput = stripTrailingConnector(commandInput.trim());
    steps.push(createEmptyStep(normalized as SupportedCommand, sanitizedInput));

    if (steps.length === MAX_STEPS) {
      break;
    }
  }

  if (steps.length === 0) {
    const initialInput = stripTrailingConnector(trimmed.replace(/^\/workflow\s*/i, '').trim());
    steps.push(createEmptyStep('summarize', initialInput));
  }

  const notes = [
    'Information from each step is passed to the next command automatically.',
    'Edit any step or add more details before running the workflow.',
  ];

  if (matches.length > MAX_STEPS) {
    notes.push('Only the first three commands were added. Run again to include additional steps.');
  }

  return {
    runId: uuidv4(),
    steps,
    summary: buildSummary(steps),
    notes,
    originalInput: trimmed,
  };
};

export const addWorkflowStep = (steps: WorkflowStep[]): WorkflowStep[] => {
  if (steps.length >= MAX_STEPS) {
    return steps;
  }

  return [...steps, createEmptyStep('summarize')];
};

export const removeWorkflowStep = (steps: WorkflowStep[], stepId: string): WorkflowStep[] => {
  if (steps.length <= 1) {
    return steps;
  }

  return steps.filter((step) => step.id !== stepId);
};

export const updateWorkflowStep = (
  steps: WorkflowStep[],
  stepId: string,
  updates: Partial<Omit<WorkflowStep, 'id'>>
): WorkflowStep[] =>
  steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step));

export const getEligibleWorkflowCommands = (): SupportedCommand[] => WORKFLOW_ELIGIBLE_COMMANDS;

export const getMaxWorkflowSteps = () => MAX_STEPS;
