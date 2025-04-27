
import { SearchResult } from '../components/search/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export const searchAcrossEngines = async (
  query: string
): Promise<SearchResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const encodedQuery = encodeURIComponent(query);
      
      const mockResults: SearchResult[] = [
        // Google mock results
        {
          id: generateId(),
          title: `Google result for "${query}" - Official Website`,
          url: `https://www.google.com/search?q=${encodedQuery}`,
          snippet: `This is a comprehensive resource about ${query} from Google's search index.`,
          source: 'Google',
        },
        
        // Bing mock results
        {
          id: generateId(),
          title: `${query} - Latest News and Updates`,
          url: `https://www.bing.com/search?q=${encodedQuery}`,
          snippet: `Stay updated with the latest information about ${query}.`,
          source: 'Bing',
        },
        
        // DuckDuckGo mock results
        {
          id: generateId(),
          title: `${query} Explained Simply`,
          url: `https://duckduckgo.com/?q=${encodedQuery}`,
          snippet: `An easy-to-understand explanation of ${query} without unnecessary jargon.`,
          source: 'DuckDuckGo',
        },

        // Brave Search mock results
        {
          id: generateId(),
          title: `${query} - Brave Search Results`,
          url: `https://search.brave.com/search?q=${encodedQuery}`,
          snippet: `Privacy-focused search results about ${query} from Brave Search.`,
          source: 'Brave',
        },

        // You.com mock results
        {
          id: generateId(),
          title: `${query} - AI-Enhanced Results`,
          url: `https://you.com/search?q=${encodedQuery}`,
          snippet: `AI-powered search results about ${query} with enhanced context.`,
          source: 'You.com',
        },
      ];

      resolve(mockResults);
    }, 2500);
  });
};
