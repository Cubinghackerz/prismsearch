import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import MathEngineChat from '@/components/math-engine/MathEngineChat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Orbit, Sparkles, Wand2, Zap } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STATUS_TEXT = [
  'Synchronising symbolic solvers',
  'Connecting Gemini 2.5 reasoning',
  'Loading graphing pipelines',
  'Preparing equation keyboard',
  'Launching Math Engine environment',
];

const FEATURE_CALLOUTS = [
  {
    title: 'Command-ready chat',
    description: 'Run /factorise, /expand, /graph2D, /graph3D, or freeform prompts inside a local-first chat built for maths.',
    icon: <Wand2 className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Fast & Thinking modes',
    description: 'Choose Fast for quick answers or Thinking for slower, cross-checked reasoning powered by Gemini 2.5 Pro.',
    icon: <Zap className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Equation keyboard',
    description: 'Insert algebra, calculus, statistics, and graphing symbols instantly with the adaptive on-screen keyboard.',
    icon: <Orbit className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Mode-aware guidance',
    description: 'Gemini adapts explanations based on your command, surfacing verification steps when Thinking mode is active.',
    icon: <Sparkles className="h-5 w-5 text-primary" />,
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
                Math Engine is a Gemini 2.5 powered CAS workspace for algebra, calculus, graphing, and number theory—all in a chat built for maths.
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
                    Solve, factorise, expand, and visualise mathematics with Gemini 2.5 Pro. Select a command, pick a mode, and keep every conversation stored locally on your device.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    {FEATURE_CALLOUTS.map((feature) => (
                      <div
                        key={feature.title}
                        className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-3"
                      >
                        <div className="rounded-full bg-primary/10 p-2">{feature.icon}</div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-foreground">{feature.title}</div>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
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

            <section className="flex flex-1 flex-col rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">Math Engine chat</p>
                  <p className="text-xs text-muted-foreground">
                    Commands, history, and outputs are stored privately in your browser. Switch between Fast and Thinking modes at any time.
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <MathEngineChat />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default MathEngine;
