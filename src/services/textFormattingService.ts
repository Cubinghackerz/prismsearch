
class TextFormattingService {
  public formatMessage(rawText: string): string {
    // Replace asterisks with bullet points
    return rawText
      .replace(/\*/g, '•')
      .replace(/• +/g, '• ')
      .replace(/•• +/g, '•• ');
  }

  public formatToPlainText(rawText: string): string {
    // For user messages, just return the raw text with asterisks replaced
    return rawText
      .replace(/\*/g, '•')
      .replace(/• +/g, '• ')
      .replace(/•• +/g, '•• ');
  }
}

export const textFormattingService = new TextFormattingService();
