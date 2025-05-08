
// Advanced search indexing system inspired by Elasticsearch
interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  frequency: number;
  documents: string[];
  positions?: number[]; // Positional information
}

// Document with metadata for relevance signals
interface IndexedDocument {
  id: string;
  content: string;
  fields?: {
    [field: string]: {
      value: string;
      boost?: number; // Field-specific boosting
    };
  };
  lastUpdated?: Date; // For freshness boosting
  popularity?: number; // For popularity boosting
  tags?: string[]; // For context-aware boosting
}

// Inverted index for term-based lookup
interface InvertedIndex {
  [term: string]: {
    frequency: number; 
    documents: string[];
    positions?: {[docId: string]: number[]}; // Positions within each document
    boost?: number; // Term-specific boosting
  };
}

// Token filter types for analyzer pipeline
type TokenFilter = (tokens: string[]) => string[];

// Search index combining trie, inverted index and analyzer pipeline
class SearchIndex {
  private trie: TrieNode;
  private invertedIndex: InvertedIndex;
  private documents: {[id: string]: IndexedDocument};
  private cache: Map<string, string[]>;
  private popularQueries: Map<string, number>;
  private stopWords: Set<string>;
  private fuzzyCache: Map<string, Set<string>>;
  
  constructor() {
    this.trie = this.createNode();
    this.invertedIndex = {};
    this.documents = {};
    this.cache = new Map();
    this.popularQueries = new Map();
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'as', 'of', 'about', 'from'
    ]);
    this.fuzzyCache = new Map();
  }
  
  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfWord: false,
      frequency: 0,
      documents: []
    };
  }
  
  // Analyzer pipeline - processes text through multiple filters
  private analyzeText(text: string, fieldName?: string): string[] {
    // Convert to lowercase and tokenize
    const tokens = this.tokenize(text);
    
    // Apply filters in sequence
    return this.applyFilters(tokens, [
      this.removeStopWords,
      this.applyStemming,
      this.normalizeTokens
    ]);
  }

  // Basic tokenizer 
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Replace special chars with space
      .split(/\s+/)
      .filter(term => term.length > 1);
  }
  
  // Apply a sequence of token filters
  private applyFilters(tokens: string[], filters: TokenFilter[]): string[] {
    return filters.reduce((currentTokens, filter) => filter.call(this, currentTokens), tokens);
  }
  
  // Filter: Remove common stop words
  private removeStopWords(tokens: string[]): string[] {
    return tokens.filter(token => !this.stopWords.has(token));
  }
  
  // Filter: Apply basic stemming
  private applyStemming(tokens: string[]): string[] {
    return tokens.map(term => {
      // Very basic stemming (remove common endings)
      return term
        .replace(/(?:s|es|ing|ed|er|ly|ment)$/, '')
        .replace(/(?:tion|sion|ism|ness|ity)$/, '');
    });
  }
  
  // Filter: Normalize tokens
  private normalizeTokens(tokens: string[]): string[] {
    return tokens.map(term => term.trim()).filter(term => term.length > 1);
  }

  // Generate variations for fuzzy matching
  private generateFuzzyVariants(term: string, maxDistance: number = 1): Set<string> {
    // Check cache first
    const cacheKey = `${term}-${maxDistance}`;
    if (this.fuzzyCache.has(cacheKey)) {
      return this.fuzzyCache.get(cacheKey)!;
    }
    
    const results = new Set<string>([term]);
    
    if (maxDistance <= 0 || term.length <= 1) {
      return results;
    }

    // Generate single character variations
    for (let i = 0; i < term.length; i++) {
      // Deletion
      results.add(term.slice(0, i) + term.slice(i + 1));
      
      // Substitution (limited set for performance)
      const commonLetters = 'abcdefghijklmnoprstuvwyz';
      for (const letter of commonLetters) {
        results.add(term.slice(0, i) + letter + term.slice(i + 1));
      }
      
      // Insertion (limited set for performance)
      for (const letter of commonLetters) {
        results.add(term.slice(0, i) + letter + term.slice(i));
      }
      
      // Transposition
      if (i < term.length - 1) {
        results.add(
          term.slice(0, i) + 
          term[i + 1] + 
          term[i] + 
          term.slice(i + 2)
        );
      }
    }
    
    // Cache the results
    this.fuzzyCache.set(cacheKey, results);
    
    return results;
  }
  
  // Insert term into trie for autocomplete
  private insertIntoTrie(term: string, documentId: string, position?: number): void {
    let node = this.trie;
    
    for (const char of term) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char)!;
    }
    
    node.isEndOfWord = true;
    node.frequency += 1;
    
    if (!node.documents.includes(documentId)) {
      node.documents.push(documentId);
    }
    
    if (position !== undefined) {
      if (!node.positions) {
        node.positions = [];
      }
      node.positions.push(position);
    }
  }
  
  // Add term to inverted index with positional information
  private addToInvertedIndex(term: string, documentId: string, position?: number, boost: number = 1.0): void {
    if (!this.invertedIndex[term]) {
      this.invertedIndex[term] = { 
        frequency: 0, 
        documents: [],
        positions: {}
      };
    }
    
    this.invertedIndex[term].frequency += 1;
    
    if (!this.invertedIndex[term].documents.includes(documentId)) {
      this.invertedIndex[term].documents.push(documentId);
    }
    
    // Store position information
    if (position !== undefined) {
      if (!this.invertedIndex[term].positions) {
        this.invertedIndex[term].positions = {};
      }
      
      if (!this.invertedIndex[term].positions[documentId]) {
        this.invertedIndex[term].positions[documentId] = [];
      }
      
      this.invertedIndex[term].positions[documentId].push(position);
    }
    
    // Apply boosting
    if (boost !== 1.0) {
      this.invertedIndex[term].boost = 
        (this.invertedIndex[term].boost || 1.0) * boost;
    }
  }
  
  // Index a document with field-specific processing
  public indexDocument(documentId: string, content: string, metadata?: Partial<IndexedDocument>): void {
    // Store the document
    this.documents[documentId] = {
      id: documentId,
      content,
      ...(metadata || {})
    };
    
    // Process main content
    const mainTerms = this.analyzeText(content);
    
    // Clear cache as index is modified
    this.cache.clear();
    
    // Add main content terms to indexes
    for (let i = 0; i < mainTerms.length; i++) {
      const term = mainTerms[i];
      this.insertIntoTrie(term, documentId, i);
      this.addToInvertedIndex(term, documentId, i);
    }
    
    // Process multi-field content if provided
    if (metadata?.fields) {
      Object.entries(metadata.fields).forEach(([fieldName, fieldData]) => {
        const fieldTerms = this.analyzeText(fieldData.value, fieldName);
        const boost = fieldData.boost || 1.0;
        
        for (let i = 0; i < fieldTerms.length; i++) {
          const term = fieldTerms[i];
          // Prefix field-specific terms to distinguish them
          const fieldTerm = `${fieldName}:${term}`;
          
          this.insertIntoTrie(term, documentId); // Add without field prefix for autocomplete
          this.addToInvertedIndex(fieldTerm, documentId, i, boost); // Add with field prefix for searching
        }
      });
    }
    
    // Add n-grams for phrase matching (bigrams and trigrams)
    this.addNgrams(mainTerms, documentId);
  }
  
  // Add n-grams to the index for phrase matching
  private addNgrams(terms: string[], documentId: string): void {
    // Add bigrams
    for (let i = 0; i < terms.length - 1; i++) {
      const bigram = `${terms[i]} ${terms[i + 1]}`;
      this.addToInvertedIndex(bigram, documentId, i);
    }
    
    // Add trigrams
    for (let i = 0; i < terms.length - 2; i++) {
      const trigram = `${terms[i]} ${terms[i + 1]} ${terms[i + 2]}`;
      this.addToInvertedIndex(trigram, documentId, i);
    }
  }
  
  // Record a search query for popularity tracking
  public recordSearch(query: string): void {
    const normalizedQuery = query.toLowerCase();
    this.popularQueries.set(
      normalizedQuery, 
      (this.popularQueries.get(normalizedQuery) || 0) + 1
    );
  }
  
  // Find autocomplete suggestions for a prefix
  public findSuggestions(prefix: string, limit: number = 5): string[] {
    const normalizedPrefix = prefix.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(normalizedPrefix)) {
      return this.cache.get(normalizedPrefix)!;
    }
    
    // If empty prefix, return popular searches
    if (!normalizedPrefix) {
      return this.getPopularQueries(limit);
    }
    
    // Find the node corresponding to prefix in trie
    let node = this.trie;
    for (const char of normalizedPrefix) {
      if (!node.children.has(char)) {
        // If no exact match, try fuzzy match for the prefix
        return this.findFuzzyMatches(normalizedPrefix, limit);
      }
      node = node.children.get(char)!;
    }
    
    // Collect all words with the given prefix
    const suggestions: string[] = [];
    this.collectWords(node, normalizedPrefix, suggestions);
    
    // Sort by frequency, recency and popularity
    const result = this.rankSuggestions(suggestions, normalizedPrefix, limit);
    
    // Cache the results
    this.cache.set(normalizedPrefix, result);
    
    return result;
  }
  
  // Find fuzzy matches for prefixes with typos
  private findFuzzyMatches(prefix: string, limit: number): string[] {
    const variants = this.generateFuzzyVariants(prefix);
    const allSuggestions: string[] = [];
    
    // Try each variant
    for (const variant of variants) {
      let node = this.trie;
      let validPrefix = true;
      
      // Try to find this variant in the trie
      for (const char of variant) {
        if (!node.children.has(char)) {
          validPrefix = false;
          break;
        }
        node = node.children.get(char)!;
      }
      
      // If this variant exists, collect words
      if (validPrefix) {
        this.collectWords(node, variant, allSuggestions);
      }
      
      // Stop early if we have enough suggestions
      if (allSuggestions.length >= limit * 3) break;
    }
    
    // Rank and return suggestions
    return this.rankSuggestions(allSuggestions, prefix, limit);
  }
  
  // Helper method to collect all words from a trie node
  private collectWords(node: TrieNode, prefix: string, result: string[]): void {
    if (node.isEndOfWord) {
      result.push(prefix);
    }
    
    for (const [char, childNode] of node.children.entries()) {
      this.collectWords(childNode, prefix + char, result);
    }
  }
  
  // Get most popular search queries
  private getPopularQueries(limit: number): string[] {
    return [...this.popularQueries.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  }
  
  // Rank suggestions by multiple factors
  private rankSuggestions(suggestions: string[], query: string, limit: number): string[] {
    return [...new Set(suggestions)] // Remove duplicates
      .sort((a, b) => {
        // Term frequency in documents
        const freqA = this.invertedIndex[a]?.frequency || 0;
        const freqB = this.invertedIndex[b]?.frequency || 0;
        
        // Popularity in past searches
        const popA = this.popularQueries.get(a) || 0;
        const popB = this.popularQueries.get(b) || 0;
        
        // Exact prefix match score
        const exactA = a.startsWith(query) ? 10 : 0; 
        const exactB = b.startsWith(query) ? 10 : 0;
        
        // Length similarity (prefer shorter terms)
        const lenA = 1 / (1 + Math.abs(a.length - query.length));
        const lenB = 1 / (1 + Math.abs(b.length - query.length));
        
        // Calculate composite score
        const scoreA = (freqA * 0.4) + (popA * 0.3) + (exactA * 0.2) + (lenA * 0.1);
        const scoreB = (freqB * 0.4) + (popB * 0.3) + (exactB * 0.2) + (lenB * 0.1);
        
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
  
  // Search for exact and partial matches with relevance ranking
  public search(query: string, options?: {
    fuzzy?: boolean,
    fields?: string[],
    boostFresh?: boolean,
    boostPopular?: boolean
  }): {
    results: string[],
    relevanceScores: {[docId: string]: number}
  } {
    // Default options
    const { 
      fuzzy = true, 
      fields = [], 
      boostFresh = true, 
      boostPopular = true 
    } = options || {};
    
    const terms = this.analyzeText(query);
    
    // Track this search
    this.recordSearch(query);
    
    if (terms.length === 0) return { results: [], relevanceScores: {} };
    
    // For each term, get matching documents with scores
    const termResults = terms.map(term => {
      const matches = new Map<string, number>(); // docId -> score
      
      // Get exact matches
      if (this.invertedIndex[term]) {
        for (const docId of this.invertedIndex[term].documents) {
          matches.set(docId, (matches.get(docId) || 0) + 1.0);
        }
      }
      
      // Field-specific matches
      fields.forEach(field => {
        const fieldTerm = `${field}:${term}`;
        if (this.invertedIndex[fieldTerm]) {
          const boost = this.invertedIndex[fieldTerm].boost || 1.0;
          for (const docId of this.invertedIndex[fieldTerm].documents) {
            matches.set(docId, (matches.get(docId) || 0) + (1.0 * boost));
          }
        }
      });
      
      // Get fuzzy matches if enabled
      if (fuzzy && term.length > 3) {
        const variants = this.generateFuzzyVariants(term);
        for (const variant of variants) {
          if (variant === term) continue; // Skip the exact term
          
          if (this.invertedIndex[variant]) {
            for (const docId of this.invertedIndex[variant].documents) {
              // Lower score for fuzzy matches
              matches.set(docId, (matches.get(docId) || 0) + 0.3);
            }
          }
        }
      }
      
      // Get prefix matches for the last term (for incomplete words)
      const lastTerm = terms[terms.length - 1];
      if (term === lastTerm) {
        const suggestions = this.findSuggestions(term, 10);
        for (const suggestion of suggestions) {
          if (suggestion === term) continue; // Skip exact match
          
          if (this.invertedIndex[suggestion]) {
            for (const docId of this.invertedIndex[suggestion].documents) {
              matches.set(docId, (matches.get(docId) || 0) + 0.5);
            }
          }
        }
      }
      
      return matches;
    });
    
    // Combine scores from all terms
    const combinedScores = new Map<string, number>();
    for (const termMatch of termResults) {
      for (const [docId, score] of termMatch.entries()) {
        combinedScores.set(docId, (combinedScores.get(docId) || 0) + score);
      }
    }
    
    // Apply document-specific boosting
    for (const [docId, baseScore] of combinedScores.entries()) {
      let finalScore = baseScore;
      const doc = this.documents[docId];
      
      // Boost by freshness if enabled
      if (boostFresh && doc.lastUpdated) {
        const ageInDays = (Date.now() - doc.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        const freshnessBoost = 1 + (1 / (1 + ageInDays * 0.1)); // Decay factor
        finalScore *= freshnessBoost;
      }
      
      // Boost by popularity if enabled
      if (boostPopular && doc.popularity) {
        const popularityBoost = 1 + (0.1 * Math.log(1 + doc.popularity));
        finalScore *= popularityBoost;
      }
      
      // Update the score
      combinedScores.set(docId, finalScore);
    }
    
    // Sort by score and convert to array of document IDs
    const results = [...combinedScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Create relevance scores object
    const relevanceScores: {[docId: string]: number} = {};
    for (const [docId, score] of combinedScores.entries()) {
      relevanceScores[docId] = score;
    }
    
    return { results, relevanceScores };
  }
  
  // Get document by ID
  public getDocument(documentId: string): IndexedDocument | undefined {
    return this.documents[documentId];
  }
  
  // Update document metadata (for boosting, etc.)
  public updateDocumentMetadata(documentId: string, metadata: Partial<IndexedDocument>): void {
    if (this.documents[documentId]) {
      this.documents[documentId] = {
        ...this.documents[documentId],
        ...metadata
      };
    }
  }
  
  // Clear cached results
  public clearCache(): void {
    this.cache.clear();
    this.fuzzyCache.clear();
  }
}

// Create and export singleton instance
export const searchIndex = new SearchIndex();

// Initialize with mock data
export const initializeSearchIndex = () => {
  // Pre-populate with some common search terms for testing
  const mockDocuments = {
    'doc1': 'machine learning artificial intelligence neural networks',
    'doc2': 'web development javascript react typescript',
    'doc3': 'data science python pandas numpy visualization',
    'doc4': 'cloud computing aws azure google kubernetes',
    'doc5': 'cybersecurity encryption privacy data protection',
    'doc6': 'blockchain cryptocurrency bitcoin ethereum smart contracts',
    'doc7': 'mobile development ios android flutter react native',
    'doc8': 'internet of things iot sensors embedded systems',
    'doc9': 'quantum computing qubits algorithms',
    'doc10': 'virtual reality augmented reality metaverse',
  };
  
  // Index mock documents with additional metadata
  Object.entries(mockDocuments).forEach(([id, content], index) => {
    searchIndex.indexDocument(id, content, {
      lastUpdated: new Date(Date.now() - index * 86400000), // Staggered dates
      popularity: 10 - index, // Popularity score
      fields: {
        title: { 
          value: content.split(' ').slice(0, 2).join(' '), 
          boost: 2.0 // Boost title matches
        },
        description: {
          value: content,
          boost: 1.0
        }
      },
      tags: content.split(' ').slice(0, 2) // First two terms as tags
    });
  });
  
  // Add some popular queries
  const popularQueries = [
    'machine learning', 'javascript', 'python', 'react', 'data science',
    'aws', 'blockchain', 'cybersecurity', 'artificial intelligence', 'mobile app'
  ];
  
  popularQueries.forEach((query, index) => {
    // Record more times for more popular queries
    const popularity = 10 - index;
    for (let i = 0; i < popularity; i++) {
      searchIndex.recordSearch(query);
    }
  });
};
