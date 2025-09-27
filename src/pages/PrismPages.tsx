import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import PrismPagesWorkspace from '@/components/prism-pages/PrismPagesWorkspace';
import { Badge } from '@/components/ui/badge';

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
          <div className="relative flex flex-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900" />
            <div className="relative z-10 flex flex-1 flex-col p-4 pb-6 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
                    <span>Prism Pages</span>
                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200">
                      Beta
                    </Badge>
                    <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200">
                      Exclusive Access
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-xs text-slate-400">
                    Draft, revise, and publish documents entirely in your browser with Gemini 2.5 Pro assisting every page.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
                <PrismPagesWorkspace />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrismPages;
