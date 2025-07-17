import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Ensure API keys are available
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const AZURE_OPENAI_KEY = Deno.env.get('AZURE_OPENAI_KEY');

// Check which API keys are available
const availableModels = {
  gemini: !!GEMINI_API_KEY,
  'llama-4-maverick-17b': !!GROQ_API_KEY,
  'llama-4-scout-17b': !!GROQ_API_KEY,
  'llama-guard-4-12b': !!GROQ_API_KEY,
  'mistral-saba-24b': !!GROQ_API_KEY,
  'llama3-70b': !!GROQ_API_KEY,
  'llama-3.3-70b': !!GROQ_API_KEY,
  'llama-3.1-8b': !!GROQ_API_KEY,
  'llama3-8b': !!GROQ_API_KEY,
  mistral: !!MISTRAL_API_KEY,
  'mistral-medium-3': !!MISTRAL_API_KEY,
  groq: !!GROQ_API_KEY,
  'groq-qwen-qwq': !!GROQ_API_KEY,
  'groq-llama4-scout': !!GROQ_API_KEY,
  'azure-gpt4-nano': !!AZURE_OPENAI_KEY,
  'azure-o4-mini': !!AZURE_OPENAI_KEY
};

interface ResearchTask {
  id: string;
  description: string;
}

interface TaskResult {
  taskId: string;
  content: string;
}

class DeepResearchAgent {
  private apiKey: string;
  private modelId: string;
  private model: string;

  constructor(model: string) {
    // Default to gemini if the requested model is not available
    if (!availableModels[model]) {
      console.warn(`Model ${model} is not available. Falling back to gemini.`);
      this.model = 'gemini';
    } else {
      this.model = model;
    }
    
    // Set API key and model ID based on the selected model
    switch (model) {
      case 'gemini':
        this.apiKey = GEMINI_API_KEY || '';
        this.modelId = 'gemini-2.0-flash-exp';
        break;
      case 'mistral':
      case 'mistral-medium-3':
        this.apiKey = MISTRAL_API_KEY || '';
        this.modelId = model === 'mistral-medium-3' ? 'mistral-large-2411' : 'mistral-medium-latest';
        break;
      case 'groq':
      case 'groq-qwen-qwq':
      case 'groq-llama4-scout':
      case 'llama-4-maverick-17b':
      case 'llama-4-scout-17b':
      case 'llama-guard-4-12b':
      case 'mistral-saba-24b':
      case 'llama3-70b':
      case 'llama-3.3-70b':
      case 'llama-3.1-8b':
      case 'llama3-8b':
        this.apiKey = GROQ_API_KEY || '';
        if (model === 'llama-4-maverick-17b') {
          this.modelId = 'meta-llama/llama-4-maverick-17b-128e-instruct';
        } else if (model === 'llama-4-scout-17b') {
          this.modelId = 'meta-llama/llama-4-scout-17b-16e-instruct';
        } else if (model === 'llama-guard-4-12b') {
          this.modelId = 'meta-llama/llama-guard-4-12b';
        } else if (model === 'mistral-saba-24b') {
          this.modelId = 'mistral-saba-24b';
        } else if (model === 'llama3-70b') {
          this.modelId = 'llama3-70b-8192';
        } else if (model === 'llama-3.3-70b') {
          this.modelId = 'llama-3.3-70b-versatile';
        } else if (model === 'llama-3.1-8b') {
          this.modelId = 'llama-3.1-8b-instant';
        } else if (model === 'llama3-8b') {
          this.modelId = 'llama3-8b-8192';
        } else if (model === 'groq-qwen-qwq') {
          this.modelId = 'qwen2.5-72b-instruct';
        } else if (model === 'groq-llama4-scout') {
          this.modelId = 'llama-3.3-70b-versatile';
        } else {
          this.modelId = 'llama-3.1-70b-versatile';
        }
        break;
      case 'azure-gpt4-nano':
      case 'azure-o4-mini':
        this.apiKey = AZURE_OPENAI_KEY || '';
        this.modelId = model === 'azure-o4-mini' ? 'o1-mini' : 'gpt-4';
        break;
      default:
        // Default to Gemini
        this.apiKey = GEMINI_API_KEY || '';
        this.modelId = 'gemini-2.0-flash-exp';
    }

    if (!this.apiKey) {
      throw new Error(`API key not found for model: ${this.model}`);
    }
  }

  private async sendPrompt(promptText: string): Promise<string> {
    try {
      switch (this.model) {
        case 'gemini':
          return await this.sendGeminiPrompt(promptText);
        case 'mistral':
        case 'mistral-medium-3':
          return await this.sendMistralPrompt(promptText);
        case 'groq':
        case 'groq-qwen-qwq':
        case 'groq-llama4-scout':
          return await this.sendGroqPrompt(promptText);
        case 'azure-gpt4-nano':
        case 'azure-o4-mini':
          return await this.sendAzurePrompt(promptText);
        default:
          return await this.sendGeminiPrompt(promptText);
      }
    } catch (error) {
      console.error(`Error with ${this.model}:`, error);
      throw new Error(`Failed to generate response with ${this.model}: ${error.message}`);
    }
  }

  private async sendGeminiPrompt(promptText: string): Promise<string> {
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
          maxOutputTokens: 4096, // Reduced to avoid potential token limit issues
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini API');
    }

    return content.trim();
  }

  private async sendMistralPrompt(promptText: string): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.7,
        max_tokens: 8192,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', response.status, errorText);
      throw new Error(`Mistral API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Mistral API');
    }

    return content.trim();
  }

  private async sendGroqPrompt(promptText: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.7,
        max_tokens: 8192,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Groq API');
    }

    return content.trim();
  }

  private async sendAzurePrompt(promptText: string): Promise<string> {
    const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    const deploymentName = Deno.env.get('AZURE_DEPLOYMENT_NAME') || 'gpt-4';
    
    if (!endpoint) {
      throw new Error('Azure OpenAI endpoint not configured');
    }

    const response = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-08-01-preview`, {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.7,
        max_tokens: 8192,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      throw new Error(`Azure OpenAI API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Azure OpenAI API');
    }

    return content.trim();
  }

  async determineResearchPlan(topic: string): Promise<ResearchTask[]> {
    const prompt = `System: You are a research-optimized AI agent. Given a broad research topic, break it into an ordered list of specific subtasks. Return a JSON array of objects with 'id' and 'description'.

User: Research Topic: ${topic}

Create at least four subtasks covering literature review, data gathering, analysis, and synthesis. Output exactly as a JSON array.`;

    try {
      const response = await this.sendPrompt(prompt);
      
      // Extract JSON from response if it's wrapped in markdown or other text
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const tasks: ResearchTask[] = JSON.parse(jsonStr);
      
      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error('Invalid research plan format');
      }
      
      return tasks;
    } catch (error) {
      console.error('Error parsing research plan:', error);
      throw new Error('Failed to generate research plan. Please try again.');
    }
  }

  async conductResearchTasks(tasks: ResearchTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    
    for (const task of tasks) {
      const prompt = `System: You are a research assistant. For the following subtask, provide detailed analysis, gather relevant points, and summarize key findings. Use evidence-based reasoning.

User: Subtask ID: ${task.id}
Description: ${task.description}

Execute this subtask and provide a comprehensive response.`;

      try {
        const content = await this.sendPrompt(prompt);
        results.push({
          taskId: task.id,
          content: content.trim()
        });
        
        // Add a small delay between tasks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error conducting task ${task.id}:`, error);
        results.push({
          taskId: task.id,
          content: `Error conducting research for this subtask: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return results;
  }

  async compileReport(topic: string, taskResults: TaskResult[]): Promise<string> {
    const findingsText = taskResults
      .map(result => `Task ${result.taskId} Findings: ${result.content}`)
      .join('\n\n');

    const prompt = `System: You are an expert research compiler. Given multiple subtask responses, synthesize them into a structured report with an Introduction, Methodology, Findings by subsection, and Conclusion/Recommendations.

User: Research Topic: ${topic}

Here are the subtasks' findings:
${findingsText}

Please produce a coherent final report.`;

    const report = await this.sendPrompt(prompt);
    return report.trim();
  }

  async runDeepResearch(topic: string): Promise<string> {
    console.log('Plan generated');
    const tasks = await this.determineResearchPlan(topic);
    
    console.log('Tasks complete');
    const taskResults = await this.conductResearchTasks(tasks);
    
    console.log('Report compiled');
    const finalReport = await this.compileReport(topic, taskResults);
    
    return finalReport;
  }
}

// Regular chat functionality
async function sendRegularChat(prompt: string, model: string): Promise<string> {
  // Check if any API keys are available
  if (!Object.values(availableModels).some(available => available)) {
    return "I'm sorry, but I'm currently unable to generate a response as no AI models are available. Please try again later or contact support.";
  }

  try {
    const agent = new DeepResearchAgent(model);
    return await agent.sendPrompt(prompt);
  } catch (error) {
    console.error(`Error with regular chat for ${model}:`, error);
    
    // Fallback to Gemini if the selected model fails
    if (model !== 'gemini') {
      console.log('Falling back to Gemini...');
      try {
        const geminiAgent = new DeepResearchAgent('gemini');
        return await geminiAgent.sendPrompt(prompt);
      } catch (geminiError) {
        console.error('Gemini fallback also failed:', geminiError);
        throw new Error('All AI models are currently unavailable. Please try again later.');
      }
    }
    
    throw error;
  }
}

async function processDeepResearch(query: string, model: string): Promise<string> {
  console.log(`Starting deep research for topic: ${query} using model: ${model}`);

  // Check if any API keys are available
  if (!Object.values(availableModels).some(available => available)) {
    return "I'm sorry, but I'm currently unable to perform deep research as no AI models are available. Please try again later or contact support.";
  }
  
  try {
    const researchAgent = new DeepResearchAgent(model);
    const report = await researchAgent.runDeepResearch(query);
    return report;
  } catch (error) {
    console.error('Error in deep research:', error);
    
    // Fallback to Gemini for deep research if the selected model fails
    if (model !== 'gemini') {
      console.log('Falling back to Gemini for deep research...');
      try {
        const geminiAgent = new DeepResearchAgent('gemini');
        const report = await geminiAgent.runDeepResearch(query);
        return report;
      } catch (geminiError) {
        console.error('Gemini fallback for deep research also failed:', geminiError);
        throw new Error('Deep research is currently unavailable. Please try again later.');
      }
    }
    
    throw error;
  }
}

// Function to generate search result summaries
async function generateSearchSummary(query: string, searchResults: any, model: string): Promise<string> {
  // Check if any API keys are available
  if (!Object.values(availableModels).some(available => available)) {
    return "I'm sorry, but I'm currently unable to generate a search summary as no AI models are available. Please try again later or contact support.";
  }

  const resultsText = searchResults.results.map((result: any) => 
    `Title: ${result.title}\nSource: ${result.source}\nSnippet: ${result.snippet}\nRelevance: ${result.relevance}\n---`
  ).join('\n');

  const summaryPrompt = `You are an expert research analyst. Analyze the following search results for the query "${query}" and provide a comprehensive summary.

Search Results:
${resultsText}

Please provide:
1. A clear executive summary (2-3 sentences) that captures the main findings
2. Key insights as bullet points (3-5 main points)
3. Important patterns or themes across the sources
4. Any notable contradictions or different perspectives
5. Assessment of information quality and reliability

Focus on synthesizing information rather than just listing what each source says. Identify the most important and actionable insights.

Format your response clearly with sections, but keep it concise and focused.`;

  try {
    return await sendRegularChat(summaryPrompt, model);
  } catch (error) {
    console.error('Error generating search summary:', error);
    throw new Error('Failed to generate search summary. Please try again later.');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, chatId, chatHistory, model = 'gemini', deepResearch, summaryMode, searchResults } = await req.json();
    
    console.log(`Processing ${model} request for chat ${chatId}${deepResearch ? ' (Deep Research Mode)' : ''}${summaryMode ? ' (Summary Mode)' : ''}`);

    // Check if any API keys are available
    if (!Object.values(availableModels).some(available => available)) {
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, but I'm currently unable to generate a response as no AI models are available. Please try again later or contact support." 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    let result = '';

    if (summaryMode && searchResults) {
      // Generate search result summary
      result = await generateSearchSummary(query, searchResults, model);
    } else if (deepResearch) {
      // Use deep research mode with the selected model
      result = await processDeepResearch(query, model);
    } else {
      // Regular chat mode
      let prompt = '';
      
      if (chatHistory && chatHistory.length > 0) {
        const historyContext = chatHistory.map((msg: any) => 
          `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
        prompt = `Previous conversation:\n${historyContext}\n\nUser: ${query}\n\nAssistant:`;
      } else {
        prompt = `User: ${query}\n\nAssistant:`;
      }

      result = await sendRegularChat(prompt, model);
    }

    return new Response(
      JSON.stringify({ response: result }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    
    // Return a more user-friendly error message
    const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    
    return new Response(
      JSON.stringify({ 
        response: `I'm sorry, but I encountered an error: ${errorMessage}. If this error persists, please try again later or contact support.`
      }),
      { 
        status: 200, // Return 200 even for errors to prevent client-side crashes
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
