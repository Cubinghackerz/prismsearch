
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  searchMode: 'quick' | 'comprehensive' | 'quantum';
  maxSources: number;
  fastMode?: boolean;
}

interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResult {
  summary: string;
  sources: SearchSource[];
  totalPages: number;
}

const searchEngines = [
  'https://www.google.com/search?q=',
  'https://www.bing.com/search?q=',
  'https://duckduckgo.com/?q=',
  'https://search.brave.com/search?q=',
  'https://you.com/search?q='
];

async function scrapeWebPage(url: string): Promise<{ title: string; content: string; links: string[] }> {
  try {
    console.log(`Scraping: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000) // Faster timeout for speed
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No title';
    
    // Extract main content (simplified for speed)
    const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = contentMatch ? contentMatch[1] : html;
    
    // Remove scripts and styles quickly
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1500); // Limit content for speed
    
    // Extract links (simplified)
    const linkMatches = html.match(/href=["']([^"']+)["']/gi) || [];
    const links = linkMatches
      .map(match => match.replace(/href=["']([^"']+)["']/i, '$1'))
      .filter(link => link.startsWith('http'))
      .slice(0, 8); // Limit links for speed

    return { title, content, links };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return { title: 'Error', content: '', links: [] };
  }
}

async function performSearch(query: string, maxResults: number, fastMode: boolean = false): Promise<SearchSource[]> {
  console.log(`Starting search for "${query}" with ${maxResults} max results, fast mode: ${fastMode}`);
  
  const sources: SearchSource[] = [];
  const seenUrls = new Set<string>();
  
  // Generate search URLs from multiple engines
  const searchUrls: string[] = [];
  
  // For fast mode, use parallel processing and fewer sources per engine
  const sourcesPerEngine = fastMode ? Math.min(15, Math.ceil(maxResults / searchEngines.length)) : Math.ceil(maxResults / searchEngines.length);
  
  for (const engine of searchEngines) {
    // Simulate search results (in real implementation, you'd parse search engine results)
    for (let i = 0; i < sourcesPerEngine && searchUrls.length < maxResults; i++) {
      // Generate realistic URLs for demonstration
      const domains = [
        'wikipedia.org', 'stackoverflow.com', 'github.com', 'medium.com', 'reddit.com',
        'arxiv.org', 'nature.com', 'sciencedirect.com', 'ieee.org', 'acm.org',
        'news.ycombinator.com', 'techcrunch.com', 'wired.com', 'arstechnica.com',
        'cnn.com', 'bbc.com', 'reuters.com', 'bloomberg.com', 'forbes.com'
      ];
      
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const path = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      const url = `https://www.${domain}/${path}-${i + 1}`;
      
      if (!seenUrls.has(url)) {
        searchUrls.push(url);
        seenUrls.add(url);
      }
    }
  }

  console.log(`Generated ${searchUrls.length} URLs for scraping`);

  // Process URLs in batches for speed
  const batchSize = fastMode ? 12 : 6; // Larger batches in fast mode
  const batches = [];
  
  for (let i = 0; i < searchUrls.length; i += batchSize) {
    batches.push(searchUrls.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    console.log(`Processing batch of ${batch.length} URLs`);
    
    const promises = batch.map(async (url) => {
      try {
        const result = await scrapeWebPage(url);
        
        if (result.content && result.content.length > 50) {
          return {
            title: result.title,
            url: url,
            snippet: result.content.substring(0, 150) + '...'
          };
        }
        return null;
      } catch (error) {
        console.error(`Failed to process ${url}:`, error.message);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        sources.push(result.value);
      }
    });

    // Stop early if we have enough sources and in fast mode
    if (fastMode && sources.length >= maxResults * 0.7) {
      console.log(`Fast mode: Early exit with ${sources.length} sources`);
      break;
    }
  }

  console.log(`Collected ${sources.length} valid sources`);
  return sources.slice(0, maxResults);
}

// DeepResearchAgent class for AI analysis
class DeepResearchAgent {
  private apiKey: string;
  private modelId: string;

  constructor() {
    this.apiKey = Deno.env.get('GOOGLE_API_KEY') || '';
    this.modelId = Deno.env.get('GEMINI_MODEL_ID') || 'gemini-2.0-flash-exp';
  }

  private async sendPrompt(promptText: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Reduced for faster processing
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from API');
    }

    return content.trim();
  }

  async generateAnalysis(prompt: string): Promise<string> {
    try {
      return await this.sendPrompt(prompt);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      throw new Error('Failed to generate AI analysis. Please try again.');
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, searchMode, maxSources, fastMode = false }: SearchRequest = await req.json();
    
    console.log(`Deep search request: "${query}", mode: ${searchMode}, sources: ${maxSources}, fast: ${fastMode}`);

    if (!query?.trim()) {
      throw new Error('Query parameter is required');
    }

    // Perform web scraping and content extraction
    const sources = await performSearch(query, Math.min(maxSources, 1000), fastMode);
    
    if (sources.length === 0) {
      throw new Error('No sources found for the given query');
    }

    // Combine all scraped content for AI analysis
    const combinedContent = sources
      .map(source => `Source: ${source.title}\nURL: ${source.url}\nContent: ${source.snippet}`)
      .join('\n\n');

    // Initialize research agent for AI analysis
    const researchAgent = new DeepResearchAgent();
    
    console.log('Starting AI analysis...');
    
    // Create AI prompt based on search mode
    let analysisPrompt = '';
    
    switch (searchMode) {
      case 'quick':
        analysisPrompt = `Analyze the following web content and provide a concise summary focusing on key points and main themes. Keep it informative but brief.

Query: "${query}"

Content:
${combinedContent.substring(0, 6000)}

Provide a clear, structured summary highlighting the most important information found across these sources.`;
        break;
        
      case 'comprehensive':
        analysisPrompt = `Conduct a thorough analysis of the following web content. Provide a detailed summary that covers all major aspects, trends, and insights related to the query.

Query: "${query}"

Content:
${combinedContent.substring(0, 12000)}

Provide a comprehensive analysis covering:
1. Main findings and key points
2. Different perspectives or approaches
3. Important trends or patterns
4. Conclusions and implications`;
        break;
        
      case 'quantum':
        analysisPrompt = `Perform an advanced quantum-enhanced analysis of the following content. Use sophisticated reasoning to identify deep patterns, connections, and insights that might not be immediately obvious.

Query: "${query}"

Content:
${combinedContent}

Provide an advanced analysis including:
1. Deep pattern analysis and hidden connections
2. Multi-dimensional perspective synthesis  
3. Emergent themes and meta-insights
4. Predictive implications and future considerations
5. Cross-domain correlations and novel insights`;
        break;
    }

    const summary = await researchAgent.generateAnalysis(analysisPrompt);
    
    const result: SearchResult = {
      summary,
      sources: sources,
      totalPages: sources.length
    };

    console.log(`Deep search completed: ${result.totalPages} sources analyzed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Deep search error:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'An unexpected error occurred',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
