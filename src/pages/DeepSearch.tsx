
import React, { useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Brain, Globe, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  scrapedContent?: string;
}

interface DeepSearchResponse {
  summary: string;
  sources: SearchResult[];
  totalResults: number;
}

const DeepSearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DeepSearchResponse | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      console.log('Starting deep search for:', query);
      
      const { data, error } = await supabase.functions.invoke('deep-search-engine', {
        body: { query: query.trim() }
      });

      if (error) {
        console.error('Deep search error:', error);
        throw new Error(error.message || 'Failed to perform deep search');
      }

      if (data && data.response) {
        setResults(data.response);
        toast.success('Deep search completed successfully!');
      } else {
        throw new Error('No results received from search');
      }
    } catch (error) {
      console.error('Error during deep search:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to perform deep search');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold font-fira-code">Deep Search</h1>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              New
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Advanced web scraping and AI-powered analysis with comprehensive source aggregation. 
            Get detailed summaries from multiple web sources with intelligent content analysis.
          </p>
        </div>

        {/* Search Interface */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Query</span>
            </CardTitle>
            <CardDescription>
              Enter your search query to scrape and analyze content from multiple web sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., latest developments in quantum computing"
                className="flex-1 font-mono"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !query.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Deep Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Web Scraping</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon className="h-4 w-4" />
                <span>Source Aggregation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span>AI Summary</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis based on {results.totalResults} sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {results.summary}
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Separator />

            {/* Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                  <span>Sources ({results.sources.length})</span>
                </CardTitle>
                <CardDescription>
                  Web pages analyzed for this search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.sources.map((source, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
                          {source.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">Visit</span>
                          </a>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 break-all">
                        {source.url}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {source.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Performing Deep Search...</h3>
                  <p className="text-sm text-muted-foreground">
                    Scraping web content and analyzing with AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DeepSearch;
