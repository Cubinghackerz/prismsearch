
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Check for required environment variables
const QWEN_API_BASE = Deno.env.get('QWEN_API_BASE') || 'http://localhost:11434';
const QWEN_MODEL = Deno.env.get('QWEN_MODEL') || 'qwen2.5:latest';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  scrapedContent?: string;
}

interface DeepSearchResponse {
  summary: string;
  sources: SearchResult[];
  totalResults: number;
}

// Function to perform web search using DuckDuckGo
async function performWebSearch(query: string): Promise<SearchResult[]> {
  try {
    console.log('Performing web search for:', query);
    
    // Use DuckDuckGo Instant Answer API for search results
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Search API response received');
    
    // Extract results from DuckDuckGo response
    const results: SearchResult[] = [];
    
    // Add abstract if available
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || 'Primary Source',
        url: data.AbstractURL,
        snippet: data.Abstract
      });
    }
    
    // Add related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.substring(0, 100) + '...',
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      }
    }
    
    // If we have limited results, add some fallback URLs based on the query
    if (results.length < 3) {
      const fallbackSources = [
        {
          title: `Wikipedia: ${query}`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          snippet: `Wikipedia article about ${query}`
        },
        {
          title: `Scholar: ${query}`,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
          snippet: `Academic papers and research about ${query}`
        },
        {
          title: `News: ${query}`,
          url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Latest news and updates about ${query}`
        }
      ];
      
      results.push(...fallbackSources);
    }
    
    console.log(`Found ${results.length} search results`);
    return results.slice(0, 8); // Limit to 8 results
    
  } catch (error) {
    console.error('Error performing web search:', error);
    // Return fallback results
    return [
      {
        title: `Search Results for: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Please search for "${query}" to find relevant information.`
      }
    ];
  }
}

// Function to scrape content from a URL
async function scrapeContent(url: string): Promise<string> {
  try {
    console.log('Scraping content from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PrismBot/1.0)'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return '';
    }
    
    const html = await response.text();
    
    // Basic HTML content extraction - remove tags and get text
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content length
    return textContent.substring(0, 2000);
    
  } catch (error) {
    console.error('Error scraping content from', url, ':', error);
    return '';
  }
}

// Function to call Qwen2.5 for analysis
async function analyzeWithQwen(query: string, scrapedData: SearchResult[]): Promise<string> {
  try {
    console.log('Analyzing content with Qwen2.5');
    
    const sourcesText = scrapedData
      .map(source => `Source: ${source.title}\nURL: ${source.url}\nContent: ${source.snippet} ${source.scrapedContent || ''}\n---`)
      .join('\n');
    
    const prompt = `You are an expert researcher and analyst. Based on the following web sources about "${query}", provide a comprehensive, well-structured summary that synthesizes the information from all sources.

Query: ${query}

Sources:
${sourcesText}

Instructions:
1. Provide a comprehensive summary that covers all key aspects found in the sources
2. Identify main themes, trends, and important findings
3. Highlight any contradictions or different perspectives
4. Structure your response with clear sections if appropriate
5. Be objective and factual
6. Reference insights from multiple sources when possible
7. Keep the summary detailed but concise (aim for 300-500 words)

Summary:`;

    const response = await fetch(`${QWEN_API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.response) {
      console.log('Qwen analysis completed successfully');
      return data.response.trim();
    } else {
      throw new Error('No response from Qwen API');
    }
    
  } catch (error) {
    console.error('Error analyzing with Qwen:', error);
    
    // Fallback summary generation
    const sourceCount = scrapedData.length;
    return `Based on analysis of ${sourceCount} sources about "${query}", here's what we found:

The search revealed information from various web sources including ${scrapedData.slice(0, 3).map(s => s.title).join(', ')}${sourceCount > 3 ? ' and others' : ''}.

Key findings include information gathered from these reputable sources. The analysis shows multiple perspectives and data points related to your query.

Note: This is a fallback summary as the AI analysis service is currently unavailable. For the most current and detailed information, please review the individual sources listed below.

The sources provide comprehensive coverage of the topic from different angles and should give you a thorough understanding of the subject matter.`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }
    
    console.log('Deep search request for:', query);
    
    // Step 1: Perform web search
    const searchResults = await performWebSearch(query);
    
    // Step 2: Scrape content from top results
    console.log('Scraping content from search results...');
    const scrapingPromises = searchResults.slice(0, 5).map(async (result) => {
      const scrapedContent = await scrapeContent(result.url);
      return {
        ...result,
        scrapedContent
      };
    });
    
    const scrapedResults = await Promise.all(scrapingPromises);
    
    // Step 3: Analyze with Qwen2.5
    const summary = await analyzeWithQwen(query, scrapedResults);
    
    const response: DeepSearchResponse = {
      summary,
      sources: scrapedResults,
      totalResults: searchResults.length
    };
    
    console.log('Deep search completed successfully');
    
    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in deep search:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Deep search failed',
        response: null
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
