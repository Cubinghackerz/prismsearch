
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance?: number; // Added relevance property for search ranking
}
