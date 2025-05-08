
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
          relevance: 1.0
        },
        
        // Bing mock results
        {
          id: generateId(),
          title: `${query} - Latest News and Updates`,
          url: `https://www.bing.com/search?q=${encodedQuery}`,
          snippet: `Stay updated with the latest information about ${query}.`,
          source: 'Bing',
          relevance: 0.9
        },
        
        // DuckDuckGo mock results
        {
          id: generateId(),
          title: `${query} Explained Simply`,
          url: `https://duckduckgo.com/?q=${encodedQuery}`,
          snippet: `An easy-to-understand explanation of ${query} without unnecessary jargon.`,
          source: 'DuckDuckGo',
          relevance: 0.85
        },

        // Brave Search mock results
        {
          id: generateId(),
          title: `${query} - Brave Search Results`,
          url: `https://search.brave.com/search?q=${encodedQuery}`,
          snippet: `Privacy-focused search results about ${query} from Brave Search.`,
          source: 'Brave',
          relevance: 0.8
        },

        // You.com mock results
        {
          id: generateId(),
          title: `${query} - AI-Enhanced Results`,
          url: `https://you.com/search?q=${encodedQuery}`,
          snippet: `AI-powered search results about ${query} with enhanced context.`,
          source: 'You.com',
          relevance: 0.75
        },
      ];

      resolve(mockResults);
    }, 2500); // Simulate network latency
  });
};

// Function to get popular searches with advanced ranking and personalization
export const getPopularSearches = async (
  currentQuery?: string
): Promise<PopularSearch[]> => {
  return new Promise((resolve) => {
    // Simulate a network request delay
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
    }, 300);
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
