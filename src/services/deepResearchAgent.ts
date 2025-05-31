
interface ResearchTask {
  id: string;
  description: string;
}

interface TaskResult {
  taskId: string;
  content: string;
}

export class DeepResearchAgent {
  private apiKey: string;
  private modelId: string;

  constructor() {
    // These will be passed from the edge function environment
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.modelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash-exp';
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
          maxOutputTokens: 8192,
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
