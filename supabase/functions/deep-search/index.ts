
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const QWEN_API_URL = 'http://localhost:11434/api/generate';

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
}

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  links: string[];
}

// Search engines to scrape from
const SEARCH_ENGINES = [
  'https://www.google.com/search?q=',
  'https://www.bing.com/search?q=',
  'https://search.yahoo.com/search?p=',
  'https://duckduckgo.com/?q=',
];

async function searchWithEngine(query: string, engineUrl: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `${engineUrl}${encodeURIComponent(query)}`;
    console.log(`Searching with: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Search failed for ${engineUrl}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Extract search results from HTML (simplified parsing)
    const results: SearchResult[] = [];
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = html.match(urlRegex) || [];
    
    // Get first 5 unique URLs from search results
    const uniqueUrls = [...new Set(urls)].slice(0, 5);
    
    for (const url of uniqueUrls) {
      try {
        const domain = new URL(url).hostname;
        results.push({
          url,
          title: `Result from ${domain}`,
          snippet: `Content from ${domain} for query: ${query}`,
          domain
        });
      } catch (e) {
        console.error('Invalid URL:', url);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error searching with ${engineUrl}:`, error);
    return [];
  }
}

async function scrapeWebPage(url: string): Promise<ScrapedContent | null> {
  try {
    console.log(`Scraping: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to scrape ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Extract text content (remove HTML tags)
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit content length
    
    // Extract links
    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const links = [...new Set(html.match(linkRegex) || [])].slice(0, 10);
    
    return {
      url,
      title,
      content: textContent,
      links
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function generateSummaryWithQwen(scrapedData: ScrapedContent[], query: string): Promise<string> {
  try {
    console.log('Generating summary with Qwen2.5');
    
    const combinedContent = scrapedData
      .map(data => `Source: ${data.title} (${data.url})\nContent: ${data.content}\n`)
      .join('\n---\n');
    
    const prompt = `Based on the following scraped web content, provide a comprehensive summary for the query: "${query}"

Scraped Content:
${combinedContent}

Please provide a well-structured summary that:
1. Directly addresses the user's query
2. Synthesizes information from multiple sources
3. Highlights key findings and insights
4. Is clear and informative

Summary:`;

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'Unable to generate summary at this time.';
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Error generating summary: ${error.message}. Please ensure Qwen2.5 is running locally on port 11434.`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Starting deep search for: ${query}`);
    const startTime = Date.now();

    // Step 1: Search across multiple engines
    const allResults: SearchResult[] = [];
    
    for (const engine of SEARCH_ENGINES) {
      try {
        const results = await searchWithEngine(query, engine);
        allResults.push(...results);
      } catch (error) {
        console.error(`Search engine error:`, error);
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    ).slice(0, 15);

    console.log(`Found ${uniqueResults.length} unique results`);

    // Step 2: Scrape content from found URLs
    const scrapingPromises = uniqueResults.map(result => scrapeWebPage(result.url));
    const scrapedResults = await Promise.allSettled(scrapingPromises);
    
    const scrapedData: ScrapedContent[] = scrapedResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<ScrapedContent>).value);

    console.log(`Successfully scraped ${scrapedData.length} pages`);

    // Step 3: Generate AI summary with Qwen2.5
    const summary = await generateSummaryWithQwen(scrapedData, query);

    // Step 4: Prepare final results
    const finalSources = scrapedData.map(data => ({
      url: data.url,
      title: data.title,
      snippet: data.content.substring(0, 200) + '...',
      domain: new URL(data.url).hostname
    }));

    const searchTime = Math.round((Date.now() - startTime) / 1000);

    const response = {
      summary,
      sources: finalSources,
      totalPages: scrapedData.length,
      searchTime
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Deep search error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Deep search failed',
        details: error.message 
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
