import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PrismResearchNotebook from '@/components/prism-research/PrismResearchNotebook';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, Sparkles } from 'lucide-react';

const PrismResearch: React.FC = () => {
  const handleScrollToNotebook = () => {
    const element = document.getElementById('prism-research-notebook');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 space-y-12">
          <header className="space-y-8 text-center md:text-left">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="space-y-4 max-w-3xl">
                <Badge className="bg-primary/15 text-primary border-primary/30">Research preview</Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Prism Research Notebook
                </h1>
                <p className="text-sm text-muted-foreground md:text-base">
                  Orchestrate search sweeps, AI summaries, and curated follow-ups in a living notebook designed for deep dives.
                  Prism keeps your findings structured with timelines, insight cards, and tasks you can action immediately.
                </p>
                <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Timeline synthesis
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Key insights &amp; tasks
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Source library
                  </Badge>
                </div>
              </div>
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                onClick={handleScrollToNotebook}
              >
                Launch notebook workspace
                <ArrowDownCircle className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground md:flex-row md:gap-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-center md:text-left">
                Powered by the deep search function with summary, news, and follow-up intelligence stitched together for rapid analysis.
              </span>
            </div>
          </header>

          <PrismResearchNotebook />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrismResearch;
