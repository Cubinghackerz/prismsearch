import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, ChevronDown, ChevronUp, Copy, Share2, BookmarkPlus, Clock, TrendingUp } from 'lucide-react';
import { SearchResult } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '../LoadingAnimation';

interface SearchResultSummaryProps {
  results: SearchResult[];
  query: string;
  isVisible: boolean;
}

interface SummaryData {
  executiveSummary: string;
  keyInsights: string[];
  topSources: {
    title: string;
    url: string;
    relevance: number;
  }[];
  relatedTopics: string[];
  confidence: number;
  lastUpdated: string;
}

const SearchResultSummary = ({ results, query, isVisible }: SearchResultSummaryProps) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && results.length > 0 && query) {
      generateSummary();
    } 
  }, [isVisible, results, query]);

  const generateSummary = async () => {
    if (results.length === 0) return;

    setIsLoading(true);
    setError(null);

    // Use a more efficient approach with Promise.race to handle timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Summary generation timed out')), 10000);
    });

    try {
      // Prepare data for summarization
      const summaryData = {
        query,
        results: results.slice(0, 10).map(result => ({
          title: result.title,
          snippet: result.snippet,
          source: result.source,
          url: result.url,
          relevance: result.relevance || 0
        }))
      };

      const { data, error } = await Promise.race([supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: `Generate a comprehensive summary for the search query: "${query}"`,
          summaryMode: true,
          searchResults: summaryData,
          model: 'gemini' // Use Gemini for summary generation
        }
      });
      }, timeoutPromise]);
      if (error) throw error;

      // Parse the AI response to extract structured summary data
      const summaryResponse = data.response;
      const parsedSummary = parseSummaryResponse(summaryResponse, results);
      
      setSummary(parsedSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
      toast({
        title: "Summary Generation Failed",
        description: "Unable to generate search result summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseSummaryResponse = (response: string, searchResults: SearchResult[]): SummaryData => {
    // Extract key insights (look for bullet points or numbered lists)
    const insightMatches = response.match(/(?:•|\*|-|\d+\.)\s*(.+)/g) || [];
    const keyInsights = insightMatches
      .map(insight => insight.replace(/^(?:•|\*|-|\d+\.)\s*/, '').trim())
      .filter(insight => insight.length > 10)
      .slice(0, 5);

    // Extract the main summary (first substantial paragraph)
    const paragraphs = response.split('\n').filter(p => p.trim().length > 50);
    const executiveSummary = paragraphs[0] || response.substring(0, 300) + '...';

    // Generate top sources based on relevance
    const topSources = searchResults
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 3)
      .map(result => ({
        title: result.title,
        url: result.url,
        relevance: result.relevance || 0
      }));

    // Extract related topics (look for capitalized terms and technical keywords)
    const relatedTopics = extractRelatedTopics(response, query);

    return {
      executiveSummary,
      keyInsights: keyInsights.length > 0 ? keyInsights : [
        'Multiple sources provide comprehensive information on this topic',
        'Results span various perspectives and approaches',
        'Current information available from reliable sources'
      ],
      topSources,
      relatedTopics,
      confidence: calculateConfidence(searchResults.length, keyInsights.length),
      lastUpdated: new Date().toISOString()
    };
  };

  const extractRelatedTopics = (text: string, originalQuery: string): string[] => {
    // Simple extraction of potential related topics
    const words = text.toLowerCase().split(/\s+/);
    const queryWords = originalQuery.toLowerCase().split(/\s+/);
    
    const technicalTerms = words.filter(word => 
      word.length > 4 && 
      !queryWords.includes(word) &&
      /^[a-z]+$/.test(word) &&
      !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'more', 'some', 'what', 'when', 'where', 'which', 'their', 'there', 'these', 'those'].includes(word)
    );

    return [...new Set(technicalTerms)].slice(0, 6);
  };

  const calculateConfidence = (resultCount: number, insightCount: number): number => {
    const baseConfidence = Math.min(resultCount * 10, 70);
    const insightBonus = Math.min(insightCount * 5, 20);
    return Math.min(baseConfidence + insightBonus, 95);
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    
    const summaryText = `
Search Summary for: "${query}"

Executive Summary:
${summary.executiveSummary}

Key Insights:
${summary.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Top Sources:
${summary.topSources.map(source => `• ${source.title} - ${source.url}`).join('\n')}

Related Topics: ${summary.relatedTopics.join(', ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      toast({
        title: "Summary Copied",
        description: "Search summary has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy summary to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleBookmarkSummary = () => {
    if (!summary) return;

    const bookmarkData = {
      id: `summary-${Date.now()}`,
      title: `Search Summary: ${query}`,
      url: window.location.href,
      snippet: summary.executiveSummary,
      source: 'Prism Search Summary',
      category: 'AI Summary',
      date: new Date().toISOString()
    };

    const existingBookmarks = JSON.parse(localStorage.getItem('prism_bookmarks') || '[]');
    existingBookmarks.unshift(bookmarkData);
    localStorage.setItem('prism_bookmarks', JSON.stringify(existingBookmarks));

    toast({
      title: "Summary Bookmarked",
      description: "Search summary has been saved to your bookmarks.",
    });
  };

  if (!isVisible || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }} 
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <Card className="border-prism-accent/30 bg-gradient-to-br from-prism-accent/20 to-prism-accent-dark/10 shadow-lg shadow-prism-accent/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-prism-accent/20">
                  <Sparkles className="h-5 w-5 text-prism-accent-light" />
                </div>
                <div>
                  <CardTitle className="text-lg text-prism-text flex items-center gap-2">
                    AI Search Summary
                    {summary && (
                      <Badge variant="outline" className="border-prism-accent/30 text-prism-accent-light text-xs">
                        {summary.confidence}% confidence
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-prism-text-muted mt-1">
                    Intelligent analysis of {results.length} search results
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {summary && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySummary}
                      className="text-prism-accent-light hover:text-prism-text hover:bg-prism-accent/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmarkSummary}
                      className="text-prism-accent-light hover:text-prism-text hover:bg-prism-accent/20"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-prism-accent-light hover:text-prism-text hover:bg-prism-accent/20"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3" style={{ willChange: 'transform' }}>
                        <LoadingAnimation color="indigo" size="medium" variant="prism" />
                        <p className="text-prism-accent-light/70 text-sm">Analyzing search results...</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300" style={{ willChange: 'transform' }}>
                      <p className="text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateSummary}
                        className="mt-2 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {summary && !isLoading && (
                    <div className="space-y-6">
                      {/* Executive Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-prism-text mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Executive Summary
                        </h3>
                        <p className="text-prism-text/90 leading-relaxed text-sm bg-prism-accent/10 p-3 rounded-lg border border-prism-accent/20">
                          {summary.executiveSummary}
                        </p>
                      </div>

                      {/* Key Insights */}
                      {summary.keyInsights.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-prism-text mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Key Insights
                          </h3>
                          <ul className="space-y-2">
                            {summary.keyInsights.map((insight, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 text-sm text-prism-text/80"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-prism-accent mt-2 shrink-0" />
                                {insight}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Top Sources */}
                      {summary.topSources.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-prism-text mb-2">Top Sources</h3>
                          <div className="space-y-2">
                            {summary.topSources.map((source, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-prism-accent/10 border border-prism-accent/20 hover:bg-prism-accent/20 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-prism-text truncate">{source.title}</p>
                                  <p className="text-xs text-prism-text-muted truncate">{new URL(source.url).hostname}</p>
                                </div>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 p-1 rounded hover:bg-prism-accent/20 text-prism-accent-light hover:text-prism-text transition-colors"
                                >
                                  <Share2 className="h-3 w-3" />
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Topics */}
                      {summary.relatedTopics.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-prism-text mb-2">Related Topics</h3>
                          <div className="flex flex-wrap gap-2">
                            {summary.relatedTopics.map((topic, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-prism-accent/30 text-prism-accent-light hover:bg-prism-accent/20 cursor-pointer transition-colors text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-prism-border">
                        <div className="flex items-center gap-4 text-xs text-prism-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Generated {new Date(summary.lastUpdated).toLocaleTimeString()}
                          </span>
                          <span>{results.length} sources analyzed</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateSummary}
                          className="text-prism-accent-light hover:text-prism-text hover:bg-prism-accent/20 text-xs"
                        >
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchResultSummary;