import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import PrismPagesWorkspace from '@/components/prism-pages/PrismPagesWorkspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, History, RefreshCw, Sparkles, Workflow } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STATUS_TEXT = [
  'Unlocking document studio',
  'Checking local version history',
  'Syncing Gemini 2.5 collaboration tools',
  'Preparing mode-aware toolbars',
  'Loading Prism Pages environment',
];

const FEATURE_CALLOUTS = [
  {
    title: 'AI co-author',
    description: 'Ask Gemini 2.5 Pro to suggest edits, then review and apply updates with a single click.',
    icon: <Sparkles className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Version control',
    description: 'Capture manual snapshots and roll back instantly with a local-first history.',
    icon: <History className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Multi-format export',
    description: 'Import or export .docx, .pdf, .odt, .rtf, .txt, and .md files entirely in your browser.',
    icon: <RefreshCw className="h-5 w-5 text-primary" />,
  },
  {
    title: 'Mode-aware tooling',
    description: 'Switch between Standard, Sigma, Vector, and Atomis modes for tailored toolbars.',
    icon: <Workflow className="h-5 w-5 text-primary" />,
  },
];

const MODE_DETAILS = [
  {
    name: 'Standard',
    description: 'A clean slate for structured writing, reports, and everyday documents with clarity-focused formatting.',
  },
  {
    name: 'Sigma',
    description: 'Surface quick inserts for integrals, summations, and proofs to keep mathematical notation precise.',
  },
  {
    name: 'Vector',
    description: 'Built for physics — drop in vector notation, units, and diagram annotations without breaking flow.',
  },
  {
    name: 'Atomis',
    description: 'Compose chemical formulas, balance reactions, and capture lab notes with dedicated helpers.',
  },
];

const PrismPages: React.FC = () => {
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
    }, 2200);

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
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex flex-1 items-center justify-center bg-muted/30 p-6">
          <div className="max-w-md space-y-4 rounded-xl border bg-background p-6 text-center shadow-lg">
            <LetterGlitch text="Prism Pages" className="text-3xl font-semibold" />
            <p className="text-sm text-muted-foreground">
              Prism Pages is currently in an exclusive beta and available only to invited accounts. Check back soon for a broader release.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {isBooting ? (
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <LetterGlitch
                text=""
                glitchColors={["#020617", "#0b1120", "#1e293b", "#334155"]}
                glitchSpeed={70}
                centerVignette={false}
                outerVignette
                smooth
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/80 to-slate-900/80" />
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <LetterGlitch text="Prism Pages" className="text-5xl font-semibold text-white" />
              <p className="max-w-xl text-sm text-slate-300">
                Prism Pages is a Gemini 2.5 powered writing studio that blends AI collaboration, mode-aware formatting, and on-device version history.
              </p>
              <Badge variant="outline" className="border-indigo-400/60 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wider text-indigo-200">
                {STATUS_TEXT[statusIndex]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900" />
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
              <section className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] backdrop-blur">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold text-white md:text-4xl">Prism Pages</h1>
                      <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200">
                        Beta
                      </Badge>
                      <Badge variant="outline" className="border-indigo-400/50 bg-indigo-500/10 text-indigo-200">
                        Exclusive Access
                      </Badge>
                    </div>
                    <p className="max-w-3xl text-base text-slate-300">
                      Draft, revise, and publish documents with Gemini 2.5 Pro as your co-author. Prism Pages keeps everything stored locally, lets you request AI revisions, and tracks every version for quick rollbacks.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {FEATURE_CALLOUTS.map((feature) => (
                        <div
                          key={feature.title}
                          className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-inner"
                        >
                          <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-300">{feature.icon}</div>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-slate-100">{feature.title}</div>
                            <p className="text-xs text-slate-400">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4 text-sm md:grid-cols-2">
                      {MODE_DETAILS.map((mode) => (
                        <div key={mode.name} className="space-y-1">
                          <p className="font-semibold text-indigo-200">{mode.name}</p>
                          <p className="text-xs text-indigo-100/70">{mode.description}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-300">
                      Available by exclusive access invitation only.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/10">
                    <a
                      href="https://prism.tools/prism-pages"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2"
                    >
                      Learn more <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </section>

              <section className="flex flex-1 flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Workspace</p>
                    <p className="text-xs text-slate-400">
                      Build up to ten local documents, invite Gemini to revise them, and roll back to any saved snapshot without leaving the browser.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-200">
                    Stored locally
                  </Badge>
                </div>
                <PrismPagesWorkspace />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrismPages;
