
// Trie node for efficient prefix matching
interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  frequency: number;
  documents: string[];
}

// Inverted index for term-based lookup
interface InvertedIndex {
  [term: string]: {
    frequency: number;
    documents: string[];
  };
}

// Search index combining trie and inverted index
class SearchIndex {
  private trie: TrieNode;
  private invertedIndex: InvertedIndex;
  private cache: Map<string, string[]>;
  private popularQueries: Map<string, number>;
  
  constructor() {
    this.trie = this.createNode();
    this.invertedIndex = {};
    this.cache = new Map();
    this.popularQueries = new Map();
  }
  
  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfWord: false,
      frequency: 0,
      documents: []
    };
  }
  
  // Process and normalize text for indexing
  private processText(text: string): string[] {
    // Convert to lowercase and remove special characters
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Split into words and apply basic stemming
    return normalized.split(/\s+/).map(term => {
      // Very basic stemming (remove common endings)
      return term.replace(/(?:s|es|ing|ed|ly)$/, '');
    }).filter(term => term.length > 1); // Filter out single characters
  }
  
  // Insert term into trie for autocomplete
  private insertIntoTrie(term: string, documentId: string): void {
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
  }
  
  // Add term to inverted index
  private addToInvertedIndex(term: string, documentId: string): void {
    if (!this.invertedIndex[term]) {
      this.invertedIndex[term] = { frequency: 0, documents: [] };
    }
    
    this.invertedIndex[term].frequency += 1;
    if (!this.invertedIndex[term].documents.includes(documentId)) {
      this.invertedIndex[term].documents.push(documentId);
    }
  }
  
  // Index a document
  public indexDocument(documentId: string, content: string): void {
    const terms = this.processText(content);
    
    // Clear cache as index is modified
    this.cache.clear();
    
    // Add terms to both indexes
    for (const term of terms) {
      this.insertIntoTrie(term, documentId);
      this.addToInvertedIndex(term, documentId);
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
    const normalizedPrefix = prefix.toLowerCase();
    
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
        return [];
      }
      node = node.children.get(char)!;
    }
    
    // Collect all words with the given prefix
    const suggestions: string[] = [];
    this.collectWords(node, normalizedPrefix, suggestions);
    
    // Sort by frequency and limit results
    const result = suggestions
      .sort((a, b) => {
        // Sort by frequency in inverted index
        const freqA = this.invertedIndex[a]?.frequency || 0;
        const freqB = this.invertedIndex[b]?.frequency || 0;
        
        // Then by popularity in past searches
        if (freqA === freqB) {
          const popA = this.popularQueries.get(a) || 0;
          const popB = this.popularQueries.get(b) || 0;
          return popB - popA;
        }
        
        return freqB - freqA;
      })
      .slice(0, limit);
    
    // Cache the results
    this.cache.set(normalizedPrefix, result);
    
    return result;
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
  
  // Search for exact and partial matches
  public search(query: string): string[] {
    const terms = this.processText(query);
    
    // Track this search
    this.recordSearch(query);
    
    if (terms.length === 0) return [];
    
    // For each term, get matching documents
    const termResults = terms.map(term => {
      // Get exact matches
      const exactMatches = new Set(this.invertedIndex[term]?.documents || []);
      
      // Get prefix matches for the last term (for incomplete words)
      let prefixMatches = new Set<string>();
      const lastTerm = terms[terms.length - 1];
      
      if (term === lastTerm) {
        const suggestions = this.findSuggestions(term, 10);
        for (const suggestion of suggestions) {
          const docs = this.invertedIndex[suggestion]?.documents || [];
          docs.forEach(doc => prefixMatches.add(doc));
        }
      }
      
      // Combine matches
      return new Set([...exactMatches, ...prefixMatches]);
    });
    
    // Intersect results for all terms to get AND semantics
    let result: string[] = [];
    if (termResults.length > 0) {
      result = [...termResults[0]];
      for (let i = 1; i < termResults.length; i++) {
        result = result.filter(doc => termResults[i].has(doc));
      }
    }
    
    return result;
  }
  
  // Get term frequency for relevance scoring
  public getTermFrequency(term: string): number {
    return this.invertedIndex[term]?.frequency || 0;
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
  
  // Index mock documents
  Object.entries(mockDocuments).forEach(([id, content]) => {
    searchIndex.indexDocument(id, content);
  });
  
  // Add some popular queries
  const popularQueries = [
    'machine learning', 'javascript', 'python', 'react', 'data science',
    'aws', 'blockchain', 'cybersecurity', 'artificial intelligence', 'mobile app'
  ];
  
  popularQueries.forEach(query => {
    searchIndex.recordSearch(query);
    searchIndex.recordSearch(query); // Record twice for higher popularity
  });
};

