import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PrismFinanceDashboard from '@/components/prism-finance/PrismFinanceDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, LineChart } from 'lucide-react';

const PrismFinance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 space-y-12">
          <header className="space-y-6 text-center md:text-left">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="space-y-4">
                <Badge className="bg-primary/15 text-primary border-primary/30">New in Prism Suite</Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                  Prism Finance
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  Stream live Polygon.io market data, explore interactive trends, and manage a custom watchlist without leaving Prism. Prism Finance refreshes quotes automatically so you can stay ahead of every swing in the US markets.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Real-time quotes
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Market movers
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Custom watchlists
                  </Badge>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Interactive charts
                  </Badge>
                </div>
              </div>
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                onClick={() => {
                  document.getElementById('prism-finance-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Launch live dashboard
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground md:flex-row md:gap-3 md:justify-start">
              <LineChart className="h-4 w-4 text-primary" />
              <span className="text-center md:text-left">
                Live Polygon.io US equity coverage • Scheduled refresh cycle every four hours with on-demand updates.
              </span>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">US equities only</Badge>
            </div>
          </header>

          <PrismFinanceDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrismFinance;
