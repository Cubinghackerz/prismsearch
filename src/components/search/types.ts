
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance?: number; // Added relevance property for search ranking
  engine?: string;    // Added engine property for search engine identification
  category?: string;  // Added category property for filtering
  date?: string;      // Added date property for sorting by recency
}

export interface PopularSearch {
  query: string;
  frequency: number;
  recency: number;
  trending: boolean; // Changed from optional to required to match usage in searchService.ts
  category: SearchCategory; // Changed from optional to required to match usage in searchService.ts
  score: number;
  clickRate: number; // Changed from optional to required to match usage in searchService.ts
}

export enum SearchCategory {
  TECHNOLOGY = 'Technology',
  HEALTH = 'Health',
  ENTERTAINMENT = 'Entertainment',
  SCIENCE = 'Science',
  BUSINESS = 'Business',
  SPORTS = 'Sports',
  OTHER = 'Other'
}
