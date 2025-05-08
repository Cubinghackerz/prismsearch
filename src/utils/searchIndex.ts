
// Advanced search indexing system inspired by Elasticsearch and Lucene
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
      positions?: number[]; // Positions within this field
      vector?: number[]; // Semantic vector for this field
    };
  };
  lastUpdated?: Date; // For freshness boosting
  popularity?: number; // For popularity boosting
  tags?: string[]; // For context-aware boosting
  length?: number; // Document length for BM25 normalization
  vector?: number[]; // Document embedding vector for semantic search
}

// Inverted index enhanced with positional information
interface InvertedIndex {
  [term: string]: {
    frequency: number; 
    documents: string[];
    positions?: {[docId: string]: number[]}; // Positions within each document
    boost?: number; // Term-specific boosting
    idf?: number; // Inverse document frequency for BM25
  };
}

// Token filter types for analyzer pipeline
type TokenFilter = (tokens: string[]) => string[];

// Search options interface
interface SearchOptions {
  fuzzy?: boolean;
  fields?: string[];
  boostFresh?: boolean;
  boostPopular?: boolean;
  useBM25?: boolean;
  useSemanticSearch?: boolean;
  proximityBoost?: boolean;
  booleanOperators?: boolean;
  phraseMatching?: boolean;
}

// BM25 Parameters
interface BM25Params {
  k1: number; // Term frequency saturation
  b: number;  // Length normalization factor
}

// Query operator for boolean queries
type QueryOperator = 'AND' | 'OR' | 'NOT';

// Boolean query expression
interface BooleanQuery {
  operator: QueryOperator;
  expressions: (string | BooleanQuery)[];
}

// Search index combining trie, inverted index, and analyzer pipeline
class SearchIndex {
  private trie: TrieNode;
  private invertedIndex: InvertedIndex;
  private documents: {[id: string]: IndexedDocument};
  private cache: Map<string, string[]>;
  private popularQueries: Map<string, number>;
  private stopWords: Set<string>;
  private fuzzyCache: Map<string, Set<string>>;
  private avgDocLength: number;
  private totalDocs: number;
  private bm25Params: BM25Params;
  private languages: Map<string, Set<string>>; // Language-specific stopwords
  private ngramCache: Map<string, string[]>; // Cache for n-grams
  
  constructor() {
    this.trie = this.createNode();
    this.invertedIndex = {};
    this.documents = {};
    this.cache = new Map();
    this.popularQueries = new Map();
    this.stopWords = this.getDefaultStopwords();
    this.fuzzyCache = new Map();
    this.avgDocLength = 0;
    this.totalDocs = 0;
    this.bm25Params = { k1: 1.2, b: 0.75 };
    this.languages = new Map();
    this.ngramCache = new Map();
    
    // Initialize language-specific stopwords
    this.initializeLanguageStopwords();
  }
  
  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfWord: false,
      frequency: 0,
      documents: []
    };
  }
  
  // Initialize default English stopwords
  private getDefaultStopwords(): Set<string> {
    return new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'as', 'of', 'about', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
      'should', 'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these', 
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
      'them', 'my', 'your', 'his', 'its', 'our', 'their'
    ]);
  }
  
  // Initialize language-specific stopwords
  private initializeLanguageStopwords(): void {
    // Spanish stopwords
    this.languages.set('es', new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si',
      'de', 'a', 'en', 'para', 'por', 'con', 'sin', 'sobre', 'entre', 'como', 'según',
      'cuando', 'donde', 'mientras', 'quien', 'que', 'cuyo', 'cuál', 'esto', 'eso'
    ]));
    
    // French stopwords
    this.languages.set('fr', new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'si', 'de', 'à', 'en',
      'pour', 'par', 'avec', 'sans', 'sur', 'dans', 'sous', 'entre', 'comme', 'quand',
      'où', 'qui', 'que', 'quoi', 'dont', 'ce', 'cette', 'ces', 'mon', 'ton', 'son'
    ]));
    
    // German stopwords
    this.languages.set('de', new Set([
      'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'aber', 'wenn', 'von', 'zu',
      'aus', 'mit', 'für', 'gegen', 'über', 'unter', 'zwischen', 'wie', 'als', 'wann',
      'wo', 'wer', 'was', 'welche', 'dieser', 'diese', 'dieses', 'mein', 'dein', 'sein'
    ]));
  }
  
  // Analyzer pipeline - processes text through multiple filters
  private analyzeText(text: string, language: string = 'en', fieldName?: string): string[] {
    // Convert to lowercase and tokenize
    const tokens = this.tokenize(text, language);
    
    // Apply filters in sequence
    return this.applyFilters(tokens, [
      (t) => this.removeStopWords(t, language),
      this.applyStemming,
      this.normalizeTokens
    ]);
  }

  // Basic tokenizer with language support
  private tokenize(text: string, language: string = 'en'): string[] {
    // Language-specific tokenization rules could be applied here
    let tokenizedText = text.toLowerCase().replace(/[^\w\s-]/g, ' ').split(/\s+/);
    
    // Filter out empty tokens and single characters (except for some languages like Chinese)
    return tokenizedText.filter(term => term.length > 1);
  }
  
  // Apply a sequence of token filters
  private applyFilters(tokens: string[], filters: TokenFilter[]): string[] {
    return filters.reduce((currentTokens, filter) => filter.call(this, currentTokens), tokens);
  }
  
  // Filter: Remove common stop words with language support
  private removeStopWords(tokens: string[], language: string = 'en'): string[] {
    // Use language-specific stopwords if available
    const languageStopwords = this.languages.get(language);
    
    if (language !== 'en' && languageStopwords) {
      return tokens.filter(token => !languageStopwords.has(token));
    }
    
    // Default to English stopwords
    return tokens.filter(token => !this.stopWords.has(token));
  }
  
  // Filter: Apply basic stemming with language awareness
  private applyStemming(tokens: string[], language: string = 'en'): string[] {
    return tokens.map(term => {
      // Very basic stemming that could be improved with language-specific rules
      if (language === 'en') {
        return term
          .replace(/(?:s|es|ing|ed|er|ly|ment)$/, '')
          .replace(/(?:tion|sion|ism|ness|ity)$/, '');
      }
      
      // Spanish stemming
      if (language === 'es') {
        return term
          .replace(/(?:os|as|es|ando|iendo|ado|ido)$/, '');
      }
      
      // French stemming
      if (language === 'fr') {
        return term
          .replace(/(?:er|ir|re|ant|ent|é|és|ée|ées)$/, '');
      }
      
      // German stemming
      if (language === 'de') {
        return term
          .replace(/(?:en|er|e|ung|ig|lich|isch)$/, '');
      }
      
      // Default behavior for other languages
      return term;
    });
  }
  
  // Filter: Normalize tokens
  private normalizeTokens(tokens: string[]): string[] {
    return tokens.map(term => term.trim()).filter(term => term.length > 1);
  }
  
  // Generate n-grams from tokens
  private generateNgrams(tokens: string[], n: number = 2): string[] {
    if (tokens.length < n) return [];
    
    const key = `${tokens.join('_')}_${n}`;
    if (this.ngramCache.has(key)) {
      return this.ngramCache.get(key)!;
    }
    
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    
    this.ngramCache.set(key, ngrams);
    return ngrams;
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
      
      // Update IDF when new document contains this term
      this.updateIDF(term);
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
  
  // Calculate and update inverse document frequency for BM25
  private updateIDF(term: string): void {
    const docsWithTerm = this.invertedIndex[term].documents.length;
    const idf = Math.log(1 + (this.totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5));
    this.invertedIndex[term].idf = Math.max(idf, 0); // Ensure non-negative
  }
  
  // Calculate BM25 score for a term in a document
  private calculateBM25(term: string, documentId: string): number {
    const { k1, b } = this.bm25Params;
    const idf = this.invertedIndex[term].idf || 0;
    
    // Get term frequency in this document
    const termPositions = this.invertedIndex[term]?.positions?.[documentId] || [];
    const termFreq = termPositions.length;
    
    if (termFreq === 0) return 0;
    
    // Get document length
    const docLength = this.documents[documentId]?.length || 0;
    
    // Calculate normalized term frequency component
    const tfNormalized = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLength / this.avgDocLength)));
    
    return idf * tfNormalized;
  }
  
  // Create or update semantic embedding vector for a document
  private updateDocumentVector(documentId: string, vector: number[]): void {
    if (this.documents[documentId]) {
      this.documents[documentId].vector = vector;
    }
  }
  
  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    // Avoid division by zero
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Index a document with field-specific processing
  public indexDocument(documentId: string, content: string, metadata?: Partial<IndexedDocument>): void {
    // Store the document
    this.documents[documentId] = {
      id: documentId,
      content,
      length: content.split(/\s+/).length, // Store document length for BM25
      ...(metadata || {})
    };
    
    this.totalDocs++;
    this.recalculateAvgDocLength();
    
    // Process main content
    const mainTerms = this.analyzeText(content);
    
    // Clear cache as index is modified
    this.cache.clear();
    this.ngramCache.clear();
    
    // Add main content terms to indexes
    for (let i = 0; i < mainTerms.length; i++) {
      const term = mainTerms[i];
      this.insertIntoTrie(term, documentId, i);
      this.addToInvertedIndex(term, documentId, i);
    }
    
    // Process multi-field content if provided
    if (metadata?.fields) {
      Object.entries(metadata.fields).forEach(([fieldName, fieldData]) => {
        const fieldTerms = this.analyzeText(fieldData.value, 'en', fieldName);
        const boost = fieldData.boost || 1.0;
        
        for (let i = 0; i < fieldTerms.length; i++) {
          const term = fieldTerms[i];
          // Field-specific term
          const fieldTerm = `${fieldName}:${term}`;
          
          // Add term without field prefix for general autocomplete
          this.insertIntoTrie(term, documentId);
          
          // Add with field prefix for field-specific searching
          this.addToInvertedIndex(fieldTerm, documentId, i, boost);
          
          // Also add without prefix but with boosting for general search
          this.addToInvertedIndex(term, documentId, i, boost);
          
          // Track position in the field
          if (fieldData.positions) {
            fieldData.positions.push(i);
          } else {
            fieldData.positions = [i];
          }
        }
      });
    }
    
    // Add n-grams for phrase matching
    this.addNgrams(mainTerms, documentId);
    
    // Update IDF for all terms to maintain BM25 accuracy
    Object.keys(this.invertedIndex).forEach(term => {
      this.updateIDF(term);
    });
  }
  
  // Recalculate average document length for BM25
  private recalculateAvgDocLength(): void {
    const totalLength = Object.values(this.documents).reduce(
      (sum, doc) => sum + (doc.length || 0), 
      0
    );
    this.avgDocLength = totalLength / this.totalDocs;
  }
  
  // Add n-grams to the index for phrase matching
  private addNgrams(terms: string[], documentId: string): void {
    // Add bigrams
    const bigrams = this.generateNgrams(terms, 2);
    for (let i = 0; i < bigrams.length; i++) {
      const bigram = bigrams[i];
      this.addToInvertedIndex(bigram, documentId, i);
    }
    
    // Add trigrams
    const trigrams = this.generateNgrams(terms, 3);
    for (let i = 0; i < trigrams.length; i++) {
      const trigram = trigrams[i];
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
  
  // Parse and process boolean expressions
  private parseBooleanQuery(query: string): BooleanQuery {
    // This is a simplified boolean query parser
    // A full implementation would use a proper parsing algorithm
    
    // Default to AND for multiple terms
    const parts = query.split(/\s+/);
    return {
      operator: 'AND',
      expressions: parts
    };
  }
  
  // Evaluate a boolean query against the index
  private evaluateBooleanQuery(query: BooleanQuery): Set<string> {
    const { operator, expressions } = query;
    
    if (expressions.length === 0) {
      return new Set<string>();
    }
    
    // Evaluate each expression
    const results: Set<string>[] = [];
    
    for (const expr of expressions) {
      if (typeof expr === 'string') {
        // Simple term
        const term = expr.toLowerCase();
        const docs = new Set(this.invertedIndex[term]?.documents || []);
        results.push(docs);
      } else {
        // Nested expression
        results.push(this.evaluateBooleanQuery(expr));
      }
    }
    
    // Combine results based on operator
    let finalResults: Set<string>;
    
    switch (operator) {
      case 'AND':
        finalResults = results.reduce((acc, curr) => {
          return new Set([...acc].filter(x => curr.has(x)));
        }, new Set(results[0]));
        break;
        
      case 'OR':
        finalResults = new Set<string>();
        results.forEach(set => {
          set.forEach(item => finalResults.add(item));
        });
        break;
        
      case 'NOT':
        // NOT requires a universe to operate on - use all documents
        const universe = new Set(Object.keys(this.documents));
        const toExclude = results[0];
        finalResults = new Set([...universe].filter(x => !toExclude.has(x)));
        break;
        
      default:
        finalResults = new Set<string>();
    }
    
    return finalResults;
  }
  
  // Check for phrase matches using positional information
  private checkPhraseMatch(docId: string, terms: string[]): boolean {
    if (terms.length <= 1) return true;
    
    // Get positions for the first term
    const firstTermPositions = 
      this.invertedIndex[terms[0]]?.positions?.[docId] || [];
    
    if (firstTermPositions.length === 0) return false;
    
    // For each position of the first term, check if subsequent terms follow in sequence
    for (const startPos of firstTermPositions) {
      let matchFound = true;
      
      for (let i = 1; i < terms.length; i++) {
        const expectedPos = startPos + i;
        const termPositions = 
          this.invertedIndex[terms[i]]?.positions?.[docId] || [];
        
        if (!termPositions.includes(expectedPos)) {
          matchFound = false;
          break;
        }
      }
      
      if (matchFound) return true;
    }
    
    return false;
  }
  
  // Check for proximity match between terms
  private checkProximityMatch(docId: string, terms: string[], maxDistance: number): number {
    if (terms.length <= 1) return 1;
    
    // Get positions for all terms
    const positions: number[][] = terms.map(term => 
      this.invertedIndex[term]?.positions?.[docId] || []
    );
    
    // If any term is missing from the document, no proximity match
    if (positions.some(p => p.length === 0)) return 0;
    
    // Find minimum distance between any pair of positions
    let minDistance = Infinity;
    
    for (let i = 0; i < positions.length - 1; i++) {
      for (const pos1 of positions[i]) {
        for (const pos2 of positions[i + 1]) {
          const distance = Math.abs(pos1 - pos2);
          minDistance = Math.min(minDistance, distance);
        }
      }
    }
    
    // Calculate proximity score (1 for exact adjacency, decreasing as distance increases)
    if (minDistance > maxDistance) return 0;
    return 1 - (minDistance / (maxDistance + 1));
  }
  
  // Search for exact and partial matches with relevance ranking
  public search(query: string, options?: SearchOptions): {
    results: string[],
    relevanceScores: {[docId: string]: number}
  } {
    // Default options
    const { 
      fuzzy = true, 
      fields = [], 
      boostFresh = true, 
      boostPopular = true,
      useBM25 = true,
      useSemanticSearch = false,
      proximityBoost = true,
      booleanOperators = false,
      phraseMatching = true
    } = options || {};
    
    // Track this search
    this.recordSearch(query);
    
    // Handle boolean queries if enabled
    if (booleanOperators && (query.includes(' AND ') || query.includes(' OR ') || query.includes(' NOT '))) {
      const booleanQuery = this.parseBooleanQuery(query);
      const matchingDocs = this.evaluateBooleanQuery(booleanQuery);
      
      // Convert Set to array and add basic scoring
      const results = Array.from(matchingDocs);
      const relevanceScores: {[docId: string]: number} = {};
      
      results.forEach(docId => {
        relevanceScores[docId] = 1.0; // Base score for boolean matches
      });
      
      return { results, relevanceScores };
    }
    
    // Check for phrase queries
    const isPhrase = query.startsWith('"') && query.endsWith('"');
    let phraseTerms: string[] = [];
    
    if (isPhrase && phraseMatching) {
      // Extract the phrase without quotes
      const phrase = query.slice(1, -1);
      phraseTerms = this.analyzeText(phrase);
      
      if (phraseTerms.length === 0) return { results: [], relevanceScores: {} };
      
      // Find documents containing all terms
      let docsWithAllTerms = new Set<string>();
      let isFirst = true;
      
      for (const term of phraseTerms) {
        const docsWithTerm = new Set(this.invertedIndex[term]?.documents || []);
        
        if (isFirst) {
          docsWithAllTerms = docsWithTerm;
          isFirst = false;
        } else {
          docsWithAllTerms = new Set(
            [...docsWithAllTerms].filter(docId => docsWithTerm.has(docId))
          );
        }
      }
      
      // Check positional constraints for phrase matches
      const phraseMatches: string[] = [];
      const relevanceScores: {[docId: string]: number} = {};
      
      for (const docId of docsWithAllTerms) {
        if (this.checkPhraseMatch(docId, phraseTerms)) {
          phraseMatches.push(docId);
          relevanceScores[docId] = 2.0; // Higher base score for exact phrase matches
        }
      }
      
      return {
        results: phraseMatches,
        relevanceScores
      };
    }
    
    // Standard term-based search
    const terms = this.analyzeText(query);
    
    if (terms.length === 0) return { results: [], relevanceScores: {} };
    
    // For each term, get matching documents with scores
    const termResults = terms.map(term => {
      const matches = new Map<string, number>(); // docId -> score
      
      // Get exact matches
      if (this.invertedIndex[term]) {
        for (const docId of this.invertedIndex[term].documents) {
          // Use BM25 score if enabled, otherwise use term frequency
          const score = useBM25 
            ? this.calculateBM25(term, docId) 
            : 1.0 + (this.invertedIndex[term].boost || 0);
            
          matches.set(docId, (matches.get(docId) || 0) + score);
        }
      }
      
      // Field-specific matches
      fields.forEach(field => {
        const fieldTerm = `${field}:${term}`;
        if (this.invertedIndex[fieldTerm]) {
          const boost = this.invertedIndex[fieldTerm].boost || 1.0;
          for (const docId of this.invertedIndex[fieldTerm].documents) {
            const score = useBM25 
              ? this.calculateBM25(fieldTerm, docId) * boost 
              : 1.0 * boost;
              
            matches.set(docId, (matches.get(docId) || 0) + score);
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
              const fuzzyScore = useBM25 
                ? this.calculateBM25(variant, docId) * 0.3
                : 0.3;
                
              matches.set(docId, (matches.get(docId) || 0) + fuzzyScore);
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
              const prefixScore = useBM25
                ? this.calculateBM25(suggestion, docId) * 0.5
                : 0.5;
                
              matches.set(docId, (matches.get(docId) || 0) + prefixScore);
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
    
    // Check for proximity if enabled and there are multiple terms
    if (proximityBoost && terms.length > 1) {
      for (const docId of combinedScores.keys()) {
        const proximityScore = this.checkProximityMatch(docId, terms, 5);
        if (proximityScore > 0) {
          // Boost score based on proximity
          const currentScore = combinedScores.get(docId) || 0;
          combinedScores.set(docId, currentScore * (1 + proximityScore * 0.5));
        }
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
      
      // Apply semantic search if enabled and vectors are available
      if (useSemanticSearch && doc.vector) {
        // This would require a query vector, which would normally come from an embedding model
        // For now, we'll skip this but in a real implementation you'd:
        // 1. Get embedding for the query
        // 2. Calculate similarity with document vectors
        // 3. Boost scores based on semantic similarity
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
    this.ngramCache.clear();
  }
  
  // Add or update semantic vector for a document
  public updateDocumentSemanticVector(documentId: string, vector: number[]): void {
    if (this.documents[documentId]) {
      this.documents[documentId].vector = vector;
    }
  }
  
  // Get statistics about the index
  public getIndexStats(): {
    totalDocuments: number;
    totalTerms: number;
    avgDocLength: number;
    uniqueTerms: number;
  } {
    return {
      totalDocuments: this.totalDocs,
      totalTerms: Object.values(this.invertedIndex).reduce(
        (sum, term) => sum + term.frequency, 
        0
      ),
      avgDocLength: this.avgDocLength,
      uniqueTerms: Object.keys(this.invertedIndex).length,
    };
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
