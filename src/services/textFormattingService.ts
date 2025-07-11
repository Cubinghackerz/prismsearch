
class TextFormattingService {
  public formatMessage(rawText: string): string {
    // Return raw text without HTML formatting
    return rawText;
  }

  public formatToPlainText(rawText: string): string {
    // For user messages, just return the raw text
    return rawText;
  }
}

export const textFormattingService = new TextFormattingService();
