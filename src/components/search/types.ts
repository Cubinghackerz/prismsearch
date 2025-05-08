
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance?: number; // Added relevance property for search ranking
}

export interface PopularSearch {
  query: string;
  frequency: number;
  recency: number;
  trending: boolean; // Changed from optional to required to match usage in searchService.ts
  category?: string;
  score: number;
  clickRate?: number;
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
