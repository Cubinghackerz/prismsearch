
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

  constructor(apiKey: string, modelId: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  private async sendPrompt(promptText: string): Promise<string> {
    try {
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
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates received from Gemini');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error in sendPrompt:', error);
      throw error;
    }
  }

  async determineResearchPlan(topic: string): Promise<ResearchTask[]> {
    const systemInstruction = "You are a research-optimized AI agent. Given a broad research topic, break it into an ordered list of specific subtasks. Return a JSON array of objects with 'id' and 'description'.";
    const userInstruction = `Research Topic: ${topic}\n\nCreate at least 4 subtasks covering literature review, data gathering, analysis, and synthesis. Output exactly as a JSON array.`;
    
    const prompt = `${systemInstruction}\n\n${userInstruction}`;
    
    try {
      const response = await this.sendPrompt(prompt);
      
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      return JSON.parse(jsonString) as ResearchTask[];
    } catch (error) {
      console.error('Error parsing research plan:', error);
      throw new Error('Failed to generate research plan. Please try again.');
    }
  }

  async conductResearchTasks(tasks: ResearchTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    
    for (const task of tasks) {
      const systemInstruction = "You are a research assistant. For the following subtask, provide detailed analysis, gather relevant points, and summarize key findings. Use evidence-based reasoning.";
      const userInstruction = `Subtask ID: ${task.id}\nDescription: ${task.description}\n\nExecute this subtask and provide a comprehensive response.`;
      
      const prompt = `${systemInstruction}\n\n${userInstruction}`;
      
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
          content: `Error conducting this research task: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return results;
  }

  async compileReport(topic: string, taskResults: TaskResult[]): Promise<string> {
    const systemInstruction = "You are an expert research compiler. Given multiple subtask responses, synthesize them into a structured report with an Introduction, Methodology, Findings by subsection, and Conclusion/Recommendations.";
    
    const findingsText = taskResults.map(result => 
      `Task ${result.taskId} Findings: ${result.content}`
    ).join('\n\n');
    
    const userInstruction = `Research Topic: ${topic}\n\nHere are the subtasks' findings:\n\n${findingsText}\n\nPlease produce a coherent final report.`;
    
    const prompt = `${systemInstruction}\n\n${userInstruction}`;
    
    try {
      const report = await this.sendPrompt(prompt);
      return report.trim();
    } catch (error) {
      console.error('Error compiling report:', error);
      throw new Error('Failed to compile research report. Please try again.');
    }
  }

  async runDeepResearch(topic: string): Promise<string> {
    console.log('Starting deep research for topic:', topic);
    
    try {
      // Step 1: Determine research plan
      console.log('Step 1: Determining research plan...');
      const tasks = await this.determineResearchPlan(topic);
      console.log(`Generated ${tasks.length} research tasks`);
      
      // Step 2: Conduct research tasks
      console.log('Step 2: Conducting research tasks...');
      const taskResults = await this.conductResearchTasks(tasks);
      console.log('Completed all research tasks');
      
      // Step 3: Compile final report
      console.log('Step 3: Compiling final report...');
      const finalReport = await this.compileReport(topic, taskResults);
      console.log('Deep research completed successfully');
      
      return finalReport;
    } catch (error) {
      console.error('Error in runDeepResearch:', error);
      throw error;
    }
  }
}
