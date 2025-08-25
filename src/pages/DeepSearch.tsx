
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, Globe, Zap, Database, Atom, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';

interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

interface DeepSearchResult {
  summary: string;
  sources: SearchSource[];
  totalPages: number;
}

type SearchMode = 'quick' | 'comprehensive' | 'quantum';

const DeepSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<DeepSearchResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<SearchMode>('quick');
  const { toast } = useToast();
  const { incrementQueryCount } = useDailyQueryLimit();

  // Daily usage tracking
  const [dailyUsage, setDailyUsage] = useState(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`deep_search_usage_${today}`);
    return stored ? JSON.parse(stored) : { quantum: 0, comprehensive: 0 };
  });

  const searchModes = {
    quick: {
      icon: Zap,
      title: 'Quick Search',
      description: 'Fast search across 1000 sources',
      sources: 1000,
      estimatedTime: '30-60 seconds',
      color: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600',
      dailyLimit: null
    },
    comprehensive: {
      icon: Database,
      title: 'Comprehensive Search',
      description: 'Thorough search across 1000 sources',
      sources: 1000,
      estimatedTime: '2-5 minutes',
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-600',
      dailyLimit: 10
    },
    quantum: {
      icon: Atom,
      title: 'Quantum Search',
      description: 'Advanced quantum-enhanced search',
      sources: 1000,
      estimatedTime: '3-7 minutes',
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-600',
      dailyLimit: 2
    }
  };

  const updateDailyUsage = (mode: SearchMode) => {
    if (mode === 'quick') return;
    
    const today = new Date().toDateString();
    const newUsage = {
      ...dailyUsage,
      [mode]: dailyUsage[mode] + 1
    };
    
    setDailyUsage(newUsage);
    localStorage.setItem(`deep_search_usage_${today}`, JSON.stringify(newUsage));
  };

  const canUseMode = (mode: SearchMode) => {
    if (mode === 'quick') return true;
    const limit = searchModes[mode].dailyLimit;
    return limit ? dailyUsage[mode] < limit : true;
  };

  const getRemainingUses = (mode: SearchMode) => {
    if (mode === 'quick') return null;
    const limit = searchModes[mode].dailyLimit;
    return limit ? limit - dailyUsage[mode] : null;
  };

  const handleSearch = async (mode: SearchMode) => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    if (!canUseMode(mode)) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit for ${searchModes[mode].title}. Try again tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResult(null);
    setSelectedMode(mode);

    try {
      console.log(`Starting ${mode} search for:`, query);
      
      const { data, error } = await supabase.functions.invoke('deep-search-engine', {
        body: { 
          query,
          searchMode: mode,
          maxSources: searchModes[mode].sources
        }
      });

      if (error) {
        console.error('Deep search error:', error);
        throw error;
      }

      console.log('Deep search response:', data);
      setResult(data);
      updateDailyUsage(mode);

      toast({
        title: "Search Complete",
        description: `${searchModes[mode].title} found and analyzed ${data.totalPages} pages`,
      });

    } catch (error) {
      console.error('Error during deep search:', error);
      toast({
        title: "Search Failed",
        description: error.message || "An error occurred during the search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch('quick');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-32 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Globe className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Deep Search
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced web scraping and AI analysis. Choose your search intensity and get intelligent summaries with sources.
            </p>
          </div>

          {/* Search Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Query
              </CardTitle>
              <CardDescription>
                Enter your search topic. The system will scrape multiple web pages and provide an AI-powered summary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                  className="text-lg"
                />
                
                {/* Search Mode Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(searchModes).map(([mode, config]) => {
                    const IconComponent = config.icon;
                    const remaining = getRemainingUses(mode as SearchMode);
                    const canUse = canUseMode(mode as SearchMode);
                    
                    return (
                      <Button
                        key={mode}
                        onClick={() => handleSearch(mode as SearchMode)}
                        disabled={isSearching || !query.trim() || !canUse}
                        className={`h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r ${config.color} hover:opacity-80 transition-all duration-300 ${!canUse ? 'opacity-50' : ''}`}
                        variant="outline"
                      >
                        {isSearching && selectedMode === mode ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <IconComponent className="h-6 w-6" />
                        )}
                        <div className="text-center">
                          <div className="font-semibold">{config.title}</div>
                          <div className="text-xs opacity-80">{config.description}</div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {config.sources} sources
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {config.estimatedTime}
                            </Badge>
                          </div>
                          {remaining !== null && (
                            <div className="text-xs mt-1 opacity-70">
                              {remaining} uses left today
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isSearching && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">
                    Processing {searchModes[selectedMode].title}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Searching {searchModes[selectedMode].sources} sources, scraping content, and analyzing with AI...
                  </p>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    Estimated time: {searchModes[selectedMode].estimatedTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    AI Summary
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{result.totalPages} pages analyzed</Badge>
                      <Badge className={searchModes[selectedMode].color}>
                        {searchModes[selectedMode].title}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{result.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Sources ({result.sources.length})
                  </CardTitle>
                  <CardDescription>
                    Web pages that were scraped and analyzed for this search
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.sources.map((source, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {source.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2 break-all">
                              {source.url}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {source.snippet}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(source.url, '_blank')}
                            className="shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DeepSearch;
