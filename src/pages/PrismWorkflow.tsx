import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Workflow, PlayCircle, Layers } from 'lucide-react';
import PrismWorkflowStudio from '@/components/prism-workflow/PrismWorkflowStudio';

const PrismWorkflow: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 space-y-12">
          <header className="space-y-6 text-center md:text-left">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="space-y-4 max-w-3xl">
                <Badge className="bg-primary/15 text-primary border-primary/30">Automation Builder</Badge>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                  Prism Workflow Studio
                </h1>
                <p className="text-sm text-muted-foreground md:text-base">
                  Orchestrate Prism commands into reusable automations. Draft multi-step routines, capture dependencies,
                  and schedule your favorite flows to run whenever inspiration strikes.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Command chaining
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Scheduling hints
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Saved templates
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Run history
                  </Badge>
                </div>
              </div>
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                onClick={() => {
                  document.getElementById('prism-workflow-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Start building
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground md:flex-row md:gap-4 md:justify-start">
              <Workflow className="h-4 w-4 text-primary" />
              <span className="text-center md:text-left">
                Chain Prism slash commands, capture dependencies, and hand off automations to teammates.
              </span>
              <span className="flex items-center gap-2 text-primary/80">
                <PlayCircle className="h-4 w-4" />
                Live execution assistant
              </span>
              <span className="flex items-center gap-2 text-primary/80">
                <Layers className="h-4 w-4" />
                Drag-and-drop step design
              </span>
            </div>
          </header>

          <section id="prism-workflow-studio">
            <PrismWorkflowStudio />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrismWorkflow;
