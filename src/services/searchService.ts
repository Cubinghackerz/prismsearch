
import { SearchResult } from '../components/search/types';
import { searchIndex } from '../utils/searchIndex';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const searchAcrossEngines = async (
  query: string
): Promise<SearchResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const encodedQuery = encodeURIComponent(query);
      
      // Record search query for analytics
      searchIndex.recordSearch(query);
      
      // Use our enhanced search index with BM25 scoring, proximity boosting,
      // and field-specific weighting for more relevant results
      const { results, relevanceScores } = searchIndex.search(query, {
        fuzzy: true,
        fields: ['title', 'description'],
        boostFresh: true,
        boostPopular: true,
        useBM25: true,
        proximityBoost: true,
        phraseMatching: true
      });
      
      const mockResults: SearchResult[] = [
        // Google mock results with relevance-based customization
        {
          id: generateId(),
          title: `Google result for "${query}" - Official Website`,
          url: `https://www.google.com/search?q=${encodedQuery}`,
          snippet: `This is a comprehensive resource about ${query} from Google's search index.`,
          source: 'Google',
          relevance: relevanceScores[results[0]] || 1.0
        },
        
        // Bing mock results with phrase matching
        {
          id: generateId(),
          title: `${query} - Latest News and Updates`,
          url: `https://www.bing.com/search?q=${encodedQuery}`,
          snippet: `Stay updated with the latest information about ${query}.`,
          source: 'Bing',
          relevance: relevanceScores[results[1]] || 0.9
        },
        
        // DuckDuckGo mock results with semantic matching
        {
          id: generateId(),
          title: `${query} Explained Simply`,
          url: `https://duckduckgo.com/?q=${encodedQuery}`,
          snippet: `An easy-to-understand explanation of ${query} without unnecessary jargon.`,
          source: 'DuckDuckGo',
          relevance: relevanceScores[results[2]] || 0.85
        },

        // Brave Search mock results with field boosting
        {
          id: generateId(),
          title: `${query} - Brave Search Results`,
          url: `https://search.brave.com/search?q=${encodedQuery}`,
          snippet: `Privacy-focused search results about ${query} from Brave Search.`,
          source: 'Brave',
          relevance: relevanceScores[results[3]] || 0.8
        },

        // You.com mock results with proximity boosting
        {
          id: generateId(),
          title: `${query} - AI-Enhanced Results`,
          url: `https://you.com/search?q=${encodedQuery}`,
          snippet: `AI-powered search results about ${query} with enhanced context.`,
          source: 'You.com',
          relevance: relevanceScores[results[4]] || 0.75
        },
      ];

      resolve(mockResults);
    }, 2500); // Simulate network latency
  });
};
