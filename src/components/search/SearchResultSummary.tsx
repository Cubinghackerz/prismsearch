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

      const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
        body: {
          query: `Generate a comprehensive summary for the search query: "${query}"`,
          summaryMode: true,
          searchResults: summaryData,
          model: 'gemini' // Use Gemini for summary generation
        }
      });

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
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 shadow-lg shadow-purple-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-purple-100 flex items-center gap-2">
                    AI Search Summary
                    {summary && (
                      <Badge variant="outline" className="border-purple-400/30 text-purple-300 text-xs">
                        {summary.confidence}% confidence
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-purple-300/70 mt-1">
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
                      className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmarkSummary}
                      className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
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
                      <div className="flex flex-col items-center gap-3">
                        <LoadingAnimation color="purple" size="medium" variant="neural" />
                        <p className="text-purple-300/70 text-sm">Analyzing search results...</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300">
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
                        <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Executive Summary
                        </h3>
                        <p className="text-purple-100/90 leading-relaxed text-sm bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                          {summary.executiveSummary}
                        </p>
                      </div>

                      {/* Key Insights */}
                      {summary.keyInsights.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
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
                                className="flex items-start gap-2 text-sm text-purple-100/80"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                                {insight}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Top Sources */}
                      {summary.topSources.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-purple-200 mb-2">Top Sources</h3>
                          <div className="space-y-2">
                            {summary.topSources.map((source, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/30 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-purple-100 truncate">{source.title}</p>
                                  <p className="text-xs text-purple-300/70 truncate">{new URL(source.url).hostname}</p>
                                </div>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 p-1 rounded hover:bg-purple-500/20 text-purple-300 hover:text-purple-100 transition-colors"
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
                          <h3 className="text-sm font-semibold text-purple-200 mb-2">Related Topics</h3>
                          <div className="flex flex-wrap gap-2">
                            {summary.relatedTopics.map((topic, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 cursor-pointer transition-colors text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
                        <div className="flex items-center gap-4 text-xs text-purple-300/70">
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
                          className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 text-xs"
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