
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, Globe, Zap, Database, Atom, FileText, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import SearchLoadingAnimation from '@/components/search/SearchLoadingAnimation';

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

  const searchModes = {
    quick: {
      icon: Zap,
      title: 'Quick Search',
      description: 'Fast search across 1000 sources',
      sources: 1000,
      estimatedTime: '30-60 seconds',
      color: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600'
    },
    comprehensive: {
      icon: Database,
      title: 'Comprehensive Search',
      description: 'Thorough search across 1000 sources',
      sources: 1000,
      estimatedTime: '2-4 minutes',
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-600'
    },
    quantum: {
      icon: Atom,
      title: 'Quantum Search',
      description: 'Advanced quantum-enhanced search',
      sources: 1000,
      estimatedTime: '3-5 minutes',
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-600'
    }
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

    setIsSearching(true);
    setResult(null);
    setSelectedMode(mode);

    try {
      console.log(`Starting ${mode} search for:`, query);
      
      const { data, error } = await supabase.functions.invoke('deep-search-engine', {
        body: { 
          query,
          searchMode: mode,
          maxSources: searchModes[mode].sources,
          fastMode: true // Enable fast processing
        }
      });

      if (error) {
        console.error('Deep search error:', error);
        throw error;
      }

      console.log('Deep search response:', data);
      setResult(data);

      toast({
        title: "Search Complete",
        description: `${searchModes[mode].title} analyzed ${data.totalPages} pages`,
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

  // Show loading animation when searching
  if (isSearching) {
    return <SearchLoadingAnimation query={query} searchMode={selectedMode} />;
  }

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
              Lightning-fast web scraping and AI analysis. Choose your search intensity and get intelligent summaries with sources.
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
                Enter your search topic. The system will rapidly scrape multiple web pages and provide an AI-powered summary.
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
                    return (
                      <Button
                        key={mode}
                        onClick={() => handleSearch(mode as SearchMode)}
                        disabled={isSearching || !query.trim()}
                        className={`h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r ${config.color} hover:opacity-80 transition-all duration-300`}
                        variant="outline"
                      >
                        <IconComponent className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">{config.title}</div>
                          <div className="text-xs opacity-80">{config.description}</div>
                          <div className="flex flex-col items-center space-y-1 mt-2">
                            <Badge variant="secondary">
                              {config.sources} sources
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {config.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 mr-2" />
                      AI Summary
                    </div>
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
