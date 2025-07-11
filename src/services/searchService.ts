
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
      
      // Create more detailed and realistic mock results
      const mockResults: SearchResult[] = [];
      
      // Google mock results
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Comprehensive Guide (2025)`,
          url: `https://www.example.com/guides/${encodedQuery}`,
          snippet: `A detailed guide about ${query} with the latest information and expert insights. Learn about key concepts, practical applications, and best practices.`,
          source: 'Google',
          relevance: 0.95,
          category: 'Guide',
          date: new Date().toISOString()
        },
        {
          id: generateId(),
          title: `Understanding ${query}: Complete Tutorial`,
          url: `https://www.tutorialsite.com/${encodedQuery}`,
          snippet: `This comprehensive tutorial explains ${query} in simple terms with practical examples and code snippets that you can follow along with.`,
          source: 'Google',
          relevance: 0.92,
          category: 'Tutorial',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `${query} Research Paper - Journal of Technology`,
          url: `https://journal.tech/papers/${encodedQuery}`,
          snippet: `Recent academic research on ${query} showing significant advancements in the field. The paper discusses methodology, findings, and implications.`,
          source: 'Google',
          relevance: 0.88,
          category: 'Academic',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      // Bing mock results
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Latest News and Updates (2025)`,
          url: `https://www.technews.com/topics/${encodedQuery}`,
          snippet: `Stay updated with the latest developments in ${query}. Our news coverage includes recent breakthroughs, industry trends, and expert opinions.`,
          source: 'Bing',
          relevance: 0.91,
          category: 'News',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `Top 10 ${query} Tools for Professionals`,
          url: `https://www.toolreviews.com/${encodedQuery}-tools`,
          snippet: `Discover the best tools for working with ${query}. This curated list includes both free and premium options with detailed reviews and comparisons.`,
          source: 'Bing',
          relevance: 0.87,
          category: 'Tools',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      // DuckDuckGo mock results
      mockResults.push(
        {
          id: generateId(),
          title: `${query} Explained Simply - No Jargon Guide`,
          url: `https://www.simpleexplained.com/${encodedQuery}`,
          snippet: `An easy-to-understand explanation of ${query} without unnecessary technical jargon. Perfect for beginners and non-technical readers.`,
          source: 'DuckDuckGo',
          relevance: 0.89,
          category: 'Beginner',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `${query} Community Forum - Discussions`,
          url: `https://community.tech/forum/${encodedQuery}`,
          snippet: `Join the conversation about ${query} with experts and enthusiasts. Find solutions to common problems and share your experiences.`,
          source: 'DuckDuckGo',
          relevance: 0.84,
          category: 'Community',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      );

      // Brave Search mock results
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - Privacy-Focused Implementation Guide`,
          url: `https://www.privacytech.com/guides/${encodedQuery}`,
          snippet: `Learn how to implement ${query} while maintaining privacy and security. This guide covers best practices, potential pitfalls, and ethical considerations.`,
          source: 'Brave',
          relevance: 0.86,
          category: 'Privacy',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `Open Source ${query} Projects Worth Following`,
          url: `https://www.opensource.dev/projects/${encodedQuery}`,
          snippet: `Discover the most promising open source projects related to ${query}. Includes project descriptions, activity metrics, and contribution opportunities.`,
          source: 'Brave',
          relevance: 0.83,
          category: 'Open Source',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      );

      // You.com mock results
      mockResults.push(
        {
          id: generateId(),
          title: `${query} - AI-Enhanced Analysis and Insights`,
          url: `https://www.aiinsights.com/analysis/${encodedQuery}`,
          snippet: `Our AI-powered analysis provides deeper insights into ${query}, identifying patterns and connections that might be missed by traditional research methods.`,
          source: 'You.com',
          relevance: 0.85,
          category: 'AI Analysis',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: generateId(),
          title: `How ${query} is Transforming Industries in 2025`,
          url: `https://www.industrytrends.com/transformation/${encodedQuery}`,
          snippet: `Explore how ${query} is disrupting traditional business models and creating new opportunities across multiple sectors. Includes case studies and expert interviews.`,
          source: 'You.com',
          relevance: 0.82,
          category: 'Industry',
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
      
      resolve(mockResults);
    }, 1500); // Reduced latency from 2500ms to 1500ms for better performance
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
