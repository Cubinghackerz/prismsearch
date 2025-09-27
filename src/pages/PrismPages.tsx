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
    }, 8000);

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
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col bg-muted/20">
        {isBooting ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
            <LetterGlitch text="Prism Pages" className="text-5xl font-semibold" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Prism Pages is a Gemini 2.5 powered writing studio that blends AI collaboration, mode-aware formatting, and on-device version history.
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
                    <h1 className="text-3xl font-semibold">Prism Pages</h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Beta
                    </Badge>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Exclusive Access
                    </Badge>
                  </div>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    Draft, revise, and publish documents with Gemini 2.5 Pro as your co-author. Prism Pages keeps everything stored locally, lets you request AI revisions, and tracks every version for quick rollbacks.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                    {FEATURE_CALLOUTS.map((feature) => (
                      <div key={feature.title} className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-3">
                        <div className="rounded-full bg-primary/10 p-2">{feature.icon}</div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-foreground">{feature.title}</div>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-sm md:grid-cols-2">
                    {MODE_DETAILS.map((mode) => (
                      <div key={mode.name} className="space-y-1">
                        <p className="font-semibold text-primary">{mode.name}</p>
                        <p className="text-xs text-muted-foreground">{mode.description}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Available by exclusive access invitation only.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
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

            <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">Prism Pages workspace</p>
                  <p className="text-xs text-muted-foreground">
                    Build up to ten local documents, invite Gemini to revise them, and roll back to any saved snapshot without leaving the browser.
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Stored locally
                </Badge>
              </div>
              <PrismPagesWorkspace />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrismPages;
