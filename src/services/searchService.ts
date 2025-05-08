import { SearchResult, PopularSearch, SearchCategory } from '../components/search/types';
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

// Function to get popular searches with advanced ranking and personalization
export const getPopularSearches = async (
  currentQuery?: string
): Promise<PopularSearch[]> => {
  return new Promise((resolve) => {
    // Simulate a network request delay
    setTimeout(() => {
      // Get search statistics from our index
      const searchStats = searchIndex.getSearchStats();
      
      // Convert to array format with additional metrics
      let popularSearches: PopularSearch[] = Object.entries(searchStats)
        .map(([query, stats]) => {
          // Calculate time decay factor (more recent = higher score)
          const now = Date.now();
          const recency = stats.lastSearched 
            ? Math.min(1, Math.exp(-(now - stats.lastSearched) / (7 * 24 * 60 * 60 * 1000))) // Decay over a week
            : 0;
            
          // Calculate trending score based on recent frequency increase
          const trending = (stats.recentFrequency || 0) / (stats.frequency / 10) > 1.5;
          
          // Assign a category based on query content (in a real app, this would use ML/NLP)
          const category = assignSearchCategory(query);
          
          // Click-through rate (normally would be from analytics)
          const clickRate = Math.random() * 0.5 + 0.3; // 30-80% for demo
          
          // Personalization score (would normally come from user similarity model)
          const personalizationFactor = Math.random() * 0.4 + 0.6; // 60-100% for demo
          
          // Calculate final score with multiple signals
          const score = (
            (stats.frequency * 0.5) +  // Base popularity
            (recency * 2) +            // Recency boost  
            (trending ? 1 : 0) +       // Trending bonus
            (clickRate * 1.5) +        // Engagement quality
            (personalizationFactor * 1)// Personalization
          );
          
          return {
            query,
            frequency: stats.frequency,
            recency: recency,
            trending,
            category,
            score,
            clickRate
          };
        })
        .sort((a, b) => b.score - a.score); // Sort by overall score
      
      // Filter out inappropriate content (in a real app, this would be more sophisticated)
      popularSearches = popularSearches.filter(search => 
        !search.query.includes('inappropriate'));
      
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
    }, 300); // Much faster than full search
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
  
  // In a real app, these would be based on semantic similarity with embeddings
  // or collaborative filtering from similar users
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
