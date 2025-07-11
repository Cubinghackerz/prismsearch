import { SearchResult, PopularSearch, SearchCategory } from '../components/search/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Static data for popular searches
const POPULAR_SEARCHES = [
  {
    query: 'machine learning',
    frequency: 952,
    recency: 0.95,
    trending: true,
    category: SearchCategory.TECHNOLOGY,
    score: 8.7,
    clickRate: 0.78
  },
  {
    query: 'javascript',
    frequency: 845,
    recency: 0.87,
    trending: true,
    category: SearchCategory.TECHNOLOGY,
    score: 8.5,
    clickRate: 0.76
  },
  {
    query: 'data science',
    frequency: 780,
    recency: 0.92,
    trending: true,
    category: SearchCategory.SCIENCE,
    score: 8.3,
    clickRate: 0.72
  },
  {
    query: 'react',
    frequency: 742,
    recency: 0.85,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 7.9,
    clickRate: 0.82
  },
  {
    query: 'artificial intelligence',
    frequency: 685,
    recency: 0.88,
    trending: true,
    category: SearchCategory.TECHNOLOGY,
    score: 7.8,
    clickRate: 0.75
  },
  {
    query: 'web development',
    frequency: 635,
    recency: 0.82,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 7.5,
    clickRate: 0.71
  },
  {
    query: 'cloud computing',
    frequency: 520,
    recency: 0.79,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 7.2,
    clickRate: 0.67
  },
  {
    query: 'blockchain',
    frequency: 475,
    recency: 0.76,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 6.8,
    clickRate: 0.64
  },
  {
    query: 'cybersecurity',
    frequency: 420,
    recency: 0.72,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 6.5,
    clickRate: 0.68
  },
  {
    query: 'python programming',
    frequency: 398,
    recency: 0.81,
    trending: false,
    category: SearchCategory.TECHNOLOGY,
    score: 6.3,
    clickRate: 0.70
  }
];

// Generate search engine URLs for the given query
const generateSearchEngineUrls = (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  return {
    google: `https://www.google.com/search?q=${encodedQuery}`,
    bing: `https://www.bing.com/search?q=${encodedQuery}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
    brave: `https://search.brave.com/search?q=${encodedQuery}`,
    you: `https://you.com/search?q=${encodedQuery}`
  };
};

export const searchAcrossEngines = async (
  query: string
): Promise<SearchResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchUrls = generateSearchEngineUrls(query);
      
      // Create more detailed and realistic mock results with actual search engine URLs
      const mockResults: SearchResult[] = [];
      
      // Function to replace asterisks with bullet points in snippets
      const formatSnippet = (text: string) => {
        return text.replace(/\* /g, '• ');
      };
      
      // Google mock results - redirect to Google search
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Search Results on Google`,
          url: searchUrls.google,
          snippet: formatSnippet(`Find comprehensive information about ${query} on Google. Access millions of web pages, images, videos, and more with Google's powerful search engine.`),
          source: 'Google',
          relevance: 0.95,
          category: 'Search Engine',
          date: new Date().toISOString()
        },
        {
          id: generateId(),
          title: `Understanding ${query}: Complete Guide`,
          url: searchUrls.google,
          snippet: `Explore detailed information about ${query} with Google's search results. Find tutorials, guides, and expert resources.`,
          source: 'Google',
          relevance: 0.92,
          category: 'Guide',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `${query} Research and Articles`,
          url: searchUrls.google,
          snippet: `Access academic papers, research articles, and professional content about ${query} through Google's comprehensive search results.`,
          source: 'Google',
          relevance: 0.88,
          category: 'Research',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      // Bing mock results - redirect to Bing search
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Bing Search Results`,
          url: searchUrls.bing,
          snippet: `Discover relevant information about ${query} with Bing's intelligent search. Get news, images, videos, and web results.`,
          source: 'Bing',
          relevance: 0.91,
          category: 'Search Engine',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `Top Resources for ${query}`,
          url: searchUrls.bing,
          snippet: `Find the best tools, resources, and information about ${query} using Bing's comprehensive search capabilities.`,
          source: 'Bing',
          relevance: 0.87,
          category: 'Resources',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      // DuckDuckGo mock results - redirect to DuckDuckGo search
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Private Search on DuckDuckGo`,
          url: searchUrls.duckduckgo,
          snippet: `Search for ${query} privately with DuckDuckGo. No tracking, no personal data collection, just pure search results.`,
          source: 'DuckDuckGo',
          relevance: 0.89,
          category: 'Privacy Search',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `${query} Discussion Forums`,
          url: searchUrls.duckduckgo,
          snippet: `Find community discussions and forums about ${query} through DuckDuckGo's privacy-focused search results.`,
          source: 'DuckDuckGo',
          relevance: 0.84,
          category: 'Community',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      );

      // Brave Search mock results - redirect to Brave search
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Independent Search on Brave`,
          url: searchUrls.brave,
          snippet: `Explore ${query} with Brave's independent search engine. Get unbiased results without tracking or manipulation.`,
          source: 'Brave',
          relevance: 0.86,
          category: 'Independent Search',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `Open Source Projects: ${query}`,
          url: searchUrls.brave,
          snippet: `Discover open source projects and privacy-focused resources related to ${query} through Brave Search.`,
          source: 'Brave',
          relevance: 0.83,
          category: 'Open Source',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      );

      // You.com mock results - redirect to You.com search
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - AI-Powered Search on You.com`,
          url: searchUrls.you,
          snippet: `Get AI-enhanced search results for ${query} on You.com. Personalized results with intelligent summaries and insights.`,
          source: 'You.com',
          relevance: 0.85,
          category: 'AI Search',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `${query} Trends and Insights`,
          url: searchUrls.you,
          snippet: `Explore trending topics and insights about ${query} with You.com's intelligent search and personalized results.`,
          source: 'You.com',
          relevance: 0.82,
          category: 'Trends',
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      resolve(mockResults);
    }, 1500);
  });
};

// Function to get popular searches with advanced ranking and personalization
export const getPopularSearches = async (
  currentQuery?: string
): Promise<PopularSearch[]> => {
  return new Promise((resolve) => {
    // Simulate a network request delay - reduced for better performance
    setTimeout(() => {
      // Start with our static popular searches
      let popularSearches = [...POPULAR_SEARCHES];
      
      // Add a few recommended searches based on current query context
      if (currentQuery) {
        const contextualSuggestions = generateContextualSuggestions(currentQuery);
        popularSearches = [...contextualSuggestions, ...popularSearches];
      }
      
      // Add exploration component (introduce some diversity)
      const exploratorySuggestions = generateExploratorySuggestions();
      
      // Combine and take top N results
      popularSearches = [...popularSearches, ...exploratorySuggestions]
        .slice(0, 12); // Limit to top 12 results
      
      resolve(popularSearches);
    }, 200); // Reduced from 300ms to 200ms
  });
};

// Helper function to assign a category to a search query
const assignSearchCategory = (query: string): SearchCategory => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.match(/computer|software|programming|app|website|tech|ai|code/i)) {
    return SearchCategory.TECHNOLOGY;
  }
  else if (lowerQuery.match(/health|fitness|diet|exercise|medical|doctor|symptom/i)) {
    return SearchCategory.HEALTH;
  }
  else if (lowerQuery.match(/movie|film|actor|music|celebrity|tv|show|entertainment/i)) {
    return SearchCategory.ENTERTAINMENT;
  }
  else if (lowerQuery.match(/science|physics|biology|chemistry|research|study/i)) {
    return SearchCategory.SCIENCE;
  }
  else if (lowerQuery.match(/business|company|stock|market|finance|investment|money/i)) {
    return SearchCategory.BUSINESS;
  }
  else if (lowerQuery.match(/sports|football|basketball|soccer|team|game|player|score/i)) {
    return SearchCategory.SPORTS;
  }
  
  return SearchCategory.OTHER;
};

// Generate contextual search suggestions based on current query
const generateContextualSuggestions = (currentQuery: string): PopularSearch[] => {
  const baseScore = 5.0; // Strong score to prioritize contextual suggestions
  
  // Simple contextually relevant suggestions
  const suggestions = [
    `${currentQuery} tutorial`,
    `how to ${currentQuery}`,
    `best ${currentQuery} examples`,
    `${currentQuery} alternatives`
  ];
  
  return suggestions.map(query => ({
    query,
    frequency: Math.floor(Math.random() * 500) + 100,
    recency: Math.random() * 0.5 + 0.5, // 50-100% recency
    trending: Math.random() > 0.7, // 30% chance of trending
    category: assignSearchCategory(query),
    score: baseScore + (Math.random() * 0.5), // Small random variation
    clickRate: Math.random() * 0.3 + 0.5 // 50-80% CTR
  }));
};

// Generate exploratory suggestions for diversity
const generateExploratorySuggestions = (): PopularSearch[] => {
  // These would typically come from topics that are under-represented in the user's search history
  // but still relevant based on broader interest patterns
  const exploratoryQueries = [
    'emerging technologies 2025',
    'sustainable innovation',
    'future of remote work',
    'digital privacy tips',
    'new programming languages'
  ];
  
  return exploratoryQueries.map(query => ({
    query,
    frequency: Math.floor(Math.random() * 200) + 50, // Lower frequencies
    recency: Math.random() * 0.3 + 0.1, // 10-40% recency
    trending: false, // Not trending
    category: assignSearchCategory(query),
    score: 2.0 + (Math.random() * 0.5), // Lower but still significant score
    clickRate: Math.random() * 0.2 + 0.4 // 40-60% CTR
  }));
};
