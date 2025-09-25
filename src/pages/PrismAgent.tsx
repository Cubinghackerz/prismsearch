import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LetterGlitch from '@/components/LetterGlitch';
import PrismAgentWorkspace from '@/components/prism-agent/PrismAgentWorkspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const EXCLUSIVE_USER_IDS = new Set([
  'user_30z8cmTlPMcTfCEvoXUTf9FuBhh',
  'user_30dXgGX4sh2BzDZRix5yNEjdehx',
  'user_30VC241Fkl0KuubR0hqkyQNaq6r',
]);

const STATUS_TEXT = [
  'Unlocking environment',
  'Updating to latest version',
  'Checking dependencies',
  'Installing dependencies',
  'Launching environment',
];

const PrismAgent: React.FC = () => {
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
            <LetterGlitch text="Prism Agent" className="text-3xl font-semibold" />
            <p className="text-sm text-muted-foreground">
              Prism Agent is currently in an exclusive beta and available only to invited accounts. Check back soon for a broader release.
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
            <LetterGlitch text="Prism Agent" className="text-5xl font-semibold" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Prism Agent is a local-first builder currently in beta. Your projects stay in the browser until you export them.
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
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">Prism Agent</h1>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Beta
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Build and preview Vite-powered apps entirely in your browser. Projects, files, and history stay local, with Sandpack providing instant previews for React and Vanilla templates.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://prism.tools/agent"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    Learn more <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <PrismAgentWorkspace />
          </div>
        )}
      </main>
    </div>
  );
};

export default PrismAgent;
