import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeGenerationPlan } from '@/services/codeGenerationService';
import { Sparkles, Timer } from 'lucide-react';
import { PrismAgentMode } from '@/context/PrismAgentContext';

interface PrismAgentPlanCardProps {
  plan: CodeGenerationPlan;
  usedModel?: string;
  mode: PrismAgentMode;
  createdAt: string;
}

const modeBadge: Record<PrismAgentMode, { label: string; variant: 'secondary' | 'outline' }> = {
  fast: { label: 'Fast · Gemini 2.5 Flash', variant: 'secondary' },
  thinking: { label: 'Thinking · Gemini 2.5 Pro', variant: 'outline' },
};

const PrismAgentPlanCard = ({ plan, usedModel, mode, createdAt }: PrismAgentPlanCardProps) => {
  const libraries = useMemo(() => plan.stack.libraries || [], [plan.stack.libraries]);
  const tooling = useMemo(() => plan.stack.tooling || [], [plan.stack.tooling]);
  const previewDeps = useMemo(() => plan.preview.cdnDependencies || [], [plan.preview.cdnDependencies]);
  const previewNotes = useMemo(() => plan.preview.notes || [], [plan.preview.notes]);

  return (
    <Card className="border border-primary/20 bg-background/80 backdrop-blur">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Development Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={modeBadge[mode].variant}>{modeBadge[mode].label}</Badge>
            {usedModel && (
              <Badge variant="outline" className="text-xs">
                {usedModel}
              </Badge>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Timer className="mr-1 h-3 w-3" />
              {new Date(createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Overview</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{plan.summary}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Stack</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Language: {plan.stack.language}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Framework: {plan.stack.framework}
              </Badge>
            </div>
            {libraries.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Libraries</p>
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
            {plan.stack.notes && <p className="text-xs text-muted-foreground pt-2">{plan.stack.notes}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview Strategy</p>
            <p className="text-sm text-foreground leading-relaxed">{plan.preview.strategy}</p>
            {previewDeps.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Preview Dependencies</p>
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

        {plan.goals.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Goals</p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {plan.goals.map((goal, index) => (
                <li key={`${goal}-${index}`}>{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.features.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Key Features</p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {plan.features.map((feature, index) => (
                <li key={`${feature}-${index}`}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.pages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pages & Components</p>
            <div className="grid gap-2 md:grid-cols-2">
              {plan.pages.map((page, index) => (
                <div key={`${page.name}-${index}`} className="rounded-md border border-border/40 p-3">
                  <p className="text-sm font-medium text-foreground">{page.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{page.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.steps.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Implementation Steps</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
              {plan.steps.map((step, index) => (
                <li key={`${step.title}-${index}`}>
                  <span className="font-medium">{step.title}:</span> {step.detail}
                </li>
              ))}
            </ol>
          </div>
        )}

        {plan.testing && plan.testing.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Testing Guidance</p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {plan.testing.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.risks && plan.risks.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Risks</p>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {plan.risks.map((risk, index) => (
                <li key={`${risk}-${index}`}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrismAgentPlanCard;
