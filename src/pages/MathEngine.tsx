import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import MathEngineWorkspace from '@/components/math-engine/MathEngineWorkspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STATUS_TEXT = [
  'Calibrating symbolic core',
  'Syncing Gemini 2.5 Pro reasoning',
  'Loading graphing pipelines',
  'Preparing file workspace',
  'Launching Math Engine environment',
];

const MathEngine: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [statusIndex, setStatusIndex] = useState(0);
  const [isBooting, setIsBooting] = useState(true);

  const hasAccess = useMemo(() => {
    if (!user) {
      return false;
    }
    return EXCLUSIVE_USER_IDS.has(user.id);
  }, [user]);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_TEXT.length);
    }, 2000);

    const bootTimer = window.setTimeout(() => {
      setIsBooting(false);
      window.clearInterval(rotation);
    }, 10000);

    return () => {
      window.clearInterval(rotation);
      window.clearTimeout(bootTimer);
    };
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex flex-1 items-center justify-center bg-muted/30 p-6">
          <div className="max-w-md space-y-4 rounded-xl border bg-background p-6 text-center shadow-lg">
            <LetterGlitch text="Math Engine" className="text-3xl font-semibold" />
            <p className="text-sm text-muted-foreground">
              Math Engine is currently in an exclusive beta and available only to invited accounts. Check back soon for a broader release.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col bg-muted/20">
        {isBooting ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
            <LetterGlitch text="Math Engine" className="text-5xl font-semibold" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Math Engine blends a symbolic computer algebra system with Gemini 2.5 Pro to keep your work local-first while giving you real-time reasoning support.
              </p>
              <Badge variant="outline" className="px-3 py-1 text-xs uppercase">
                {STATUS_TEXT[statusIndex]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-6">
            <div className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold">Math Engine</h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Beta
                    </Badge>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Exclusive Access
                    </Badge>
                  </div>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    Explore a full-stack mathematics workspace that tackles algebra, calculus, linear algebra, number theory, statistics, and unit-aware conversions with step-by-step reasoning. Upload notebooks or datasets, define custom functions, and switch between symbolic and numeric outputs while Gemini 2.5&nbsp;Pro keeps explanations approachable.
                  </p>
                  <ul className="mt-4 grid gap-2 text-left text-sm text-muted-foreground md:grid-cols-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      Rich CAS tools for solving equations, inequalities, matrices, and series with detailed working.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      Interactive 2D/3D graphing with sliders, multi-plot overlays, and annotation layers.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      Tutor-style breakdowns, multiple solution methods, and LaTeX exports for every session.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      Local file uploads with versioned history so experiments stay on your device.
                    </li>
                  </ul>
                  <div className="mt-6 grid gap-4 text-left md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Core Computation</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Expand, factorise, and simplify algebraic expressions; solve polynomial systems; differentiate, integrate, evaluate limits, and build series expansions; run linear algebra routines with determinants, eigenvalues, and matrix factorizations; and tackle number theory, probability, and statistics with combinatorics and hypothesis testing.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Graphing & Visualisation</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Plot 2D and 3D functions, inequalities, parametric and polar curves with slider-controlled parameters, shaded solution regions, tangent overlays, asymptote highlights, and vector fields rendered in real time.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Step-by-Step Reasoning</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Gemini 2.5 Pro narrates each transformation, offers alternative solution methods like completing the square or using the quadratic formula, and answers “why” questions so learners understand the logic behind every step.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Advanced CAS Features</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Switch between symbolic and numeric modes, define reusable functions, substitute values, manipulate units, and export LaTeX, PDF summaries, or graph images without leaving the workspace.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Usability & Integration</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Accept natural language, LaTeX, or raw math syntax, upload supporting files, and keep everything local-first with browser storage, downloads, and shareable exports similar to Prism Vault and Chat.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold">Why it stands out</h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Math Engine blends CAS power with AI reasoning, giving exclusive members an all-in-one environment for computation, exploration, and teaching without juggling separate tools.
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">
                    Available by exclusive access invitation only.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://prism.tools/math-engine"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    Learn more <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <MathEngineWorkspace />
          </div>
        )}
      </main>
    </div>
  );
};

export default MathEngine;
