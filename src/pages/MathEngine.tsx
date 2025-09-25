import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import MathEngineWorkspace from '@/components/math-engine/MathEngineWorkspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, UploadCloud, Wand2, Zap } from 'lucide-react';

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

const CAPABILITY_SECTIONS = [
  {
    title: 'Core Computation',
    description:
      'Algebra, calculus, linear algebra, number theory, probability, and statistics—powered by a full CAS so you can expand, factorise, solve, differentiate, integrate, evaluate limits, build series, compute determinants, and run hypothesis tests without leaving the browser.',
    bullets: [
      'Solve linear, quadratic, and higher-degree systems with symbolic or numeric answers.',
      'Run matrix operations, eigenvalue decompositions, and vector-space routines instantly.',
      'Factorise polynomials, simplify expressions, and compute limits or Taylor expansions.',
      'Tackle number theory, combinatorics, and regression with dedicated toolkits.',
    ],
  },
  {
    title: 'Graphing & Visualisation',
    description:
      'Plot 2D and 3D functions, inequalities, parametric/polar curves, and vector fields. Attach sliders to parameters, overlay multiple plots, and annotate tangents, intercepts, and asymptotes for deeper insight.',
    bullets: [
      'Dynamic sliders update graphs in real time as you explore parameter changes.',
      'Shade inequality regions and compare multiple plots within the same viewport.',
      'Render polar, parametric, and vector field visualisations with exportable images.',
      'Highlight key features like asymptotes, tangent lines, and intercepts on demand.',
    ],
  },
  {
    title: 'Step-by-Step Reasoning',
    description:
      'Every solution includes narrated reasoning from Gemini 2.5 Pro so learners understand the “why” behind each transformation, with optional alternative methods such as completing the square or using the quadratic formula.',
    bullets: [
      'See intermediate steps for factoring, differentiation, and integration.',
      'Request multiple approaches to the same problem to compare strategies.',
      'Ask follow-up questions in natural language and receive plain-language answers.',
      'Export worked solutions as PDF or LaTeX study guides.',
    ],
  },
  {
    title: 'Advanced CAS Features',
    description:
      'Switch between exact symbolic answers (π, √2) and numeric approximations, define custom functions for reuse, solve systems of equations and inequalities, and apply substitutions or pattern matching inside the same workspace.',
    bullets: [
      'Dual symbolic/numeric mode lets you toggle precision per calculation.',
      'Equation and inequality solvers handle single equations and full systems.',
      'Custom definitions keep reusable functions at your fingertips.',
      'Pattern matching and substitution utilities streamline repeated workflows.',
    ],
  },
  {
    title: 'Usability & Integration',
    description:
      'Math Engine accepts natural language, LaTeX, or raw math syntax. Upload datasets, notebooks, or supporting documents directly into the local project, and share results as LaTeX snippets, graph exports, or downloadable workspaces.',
    bullets: [
      'Local-first storage keeps projects, files, and uploads on your device.',
      'File uploads feed directly into computations and graphing sessions.',
      'Export entire sessions as ZIP archives, PDFs, or LaTeX bundles.',
      'Explain-like-a-tutor responses clarify each step when you ask “Why?”.',
    ],
  },
  {
    title: 'Why it stands out',
    description:
      'Math Engine blends a symbolic CAS, numeric computation, and Gemini 2.5 Pro reasoning inside one exclusive workspace. No context switching between tools—compute, visualise, explain, and export in a single flow.',
    bullets: [
      'Exclusive access delivers dedicated capacity for deep math sessions.',
      'Interactive visualisation and reasoning tools live side-by-side.',
      'Natural language prompts like “Graph sin(x)/x and highlight asymptotes” just work.',
      'Built-in exporting makes it effortless to share findings or continue elsewhere.',
    ],
  },
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
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-6">
            <section className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold">Math Engine</h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Beta
                    </Badge>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Exclusive Access
                    </Badge>
                  </div>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    Math Engine combines a symbolic computer algebra system, numeric solvers, and Gemini 2.5&nbsp;Pro so exclusive members can compute, visualise, and explain mathematics end-to-end. Upload files, define reusable functions, and keep every project fully local while enjoying AI-assisted reasoning.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <span>Default model: Gemini 2.5 Pro</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <UploadCloud className="h-4 w-4 text-primary" />
                      <span>Local file uploads &amp; dataset imports</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Live graphing &amp; interactive previews</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
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
            </section>

            <section className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {CAPABILITY_SECTIONS.map((section) => (
                  <div key={section.title} className="rounded-xl border border-border/70 bg-background p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-sm text-primary">
                <p className="font-medium uppercase tracking-wide">Workspace preview</p>
                <p className="mt-2 text-muted-foreground">
                  Launch the Math Engine workspace below to upload notebooks, sync files, and collaborate with Gemini 2.5&nbsp;Pro on complex problems. Projects, snapshots, and uploads stay on your device for privacy.
                </p>
              </div>
              <MathEngineWorkspace />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default MathEngine;
