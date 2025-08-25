
import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, Globe, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
}

interface DeepSearchResponse {
  summary: string;
  sources: SearchResult[];
  totalPages: number;
  searchTime: number;
}

const DeepSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DeepSearchResponse | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search query to begin deep search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('deep-search', {
        body: { query }
      });

      if (error) {
        throw new Error(error.message || 'Deep search failed');
      }

      setResults(data);
      
      toast({
        title: "Deep Search Complete",
        description: `Found ${data.totalPages} pages and generated comprehensive summary.`,
      });
    } catch (error) {
      console.error('Deep search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to complete deep search. Please ensure Qwen2.5 is running locally on port 11434.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-prism-bg via-prism-dark-bg to-prism-surface">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-prism-primary" />
              <h1 className="text-4xl font-bold text-prism-text font-fira-code">
                Deep Search
              </h1>
              <Badge variant="secondary" className="bg-prism-accent/20 text-prism-accent-light">
                Beta
              </Badge>
            </div>
            <p className="text-prism-text-muted text-lg max-w-2xl mx-auto">
              Advanced web search with AI-powered analysis. Scrapes multiple sources and provides intelligent summaries using Qwen2.5.
            </p>
          </div>

          {/* Search Input */}
          <Card className="mb-8 bg-prism-surface/50 border-prism-border">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-prism-text-muted h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Enter your search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-prism-bg/50 border-prism-border text-prism-text"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Deep Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isSearching && (
            <Card className="mb-8 bg-prism-surface/50 border-prism-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-y-4 flex-col">
                  <Loader2 className="h-8 w-8 animate-spin text-prism-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-prism-text mb-2">
                      Conducting Deep Search...
                    </h3>
                    <p className="text-prism-text-muted">
                      Scraping web pages and analyzing content with Qwen2.5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-prism-surface/50 border-prism-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-prism-text">
                    <BookOpen className="h-5 w-5 text-prism-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-prism-text-light leading-relaxed whitespace-pre-wrap">
                      {results.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-prism-text-muted">
                    <span>Sources: {results.sources.length}</span>
                    <span>Pages Analyzed: {results.totalPages}</span>
                    <span>Search Time: {results.searchTime}s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sources */}
              <Card className="bg-prism-surface/50 border-prism-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-prism-text">
                    <Users className="h-5 w-5 text-prism-primary" />
                    Sources ({results.sources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {results.sources.map((source, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-prism-bg/30 border-prism-border/50 hover:border-prism-primary/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-prism-text mb-1 truncate">
                                    {source.title}
                                  </h4>
                                  <p className="text-sm text-prism-text-muted mb-2 line-clamp-2">
                                    {source.snippet}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {source.domain}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(source.url, '_blank')}
                                  className="flex-shrink-0"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          {index < results.sources.length - 1 && (
                            <Separator className="bg-prism-border/30" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default DeepSearch;
