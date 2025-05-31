
import { FormatterAgent } from './formatterAgent';

class TextFormattingService {
  private formatter: FormatterAgent;

  constructor() {
    this.formatter = new FormatterAgent();
  }

  public formatMessage(rawText: string): string {
    try {
      return this.formatter.formatToHtml(rawText);
    } catch (error) {
      console.error('Error formatting text:', error);
      return rawText; // Return original text if formatting fails
    }
  }

  public formatToPlainText(rawText: string): string {
    // For user messages, just return the raw text
    return rawText;
  }
}

export const textFormattingService = new TextFormattingService();
