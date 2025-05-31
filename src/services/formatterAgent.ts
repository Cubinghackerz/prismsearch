
export class FormatterAgent {
  public formatToHtml(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    const lines = rawText.split('\n');
    const result: string[] = [];
    let currentParagraph: string[] = [];
    let inOrderedList = false;
    let inUnorderedList = false;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          result.push(`<p>${this.formatInlineElements(paragraphText)}</p>`);
        }
        currentParagraph = [];
      }
    };

    const closeOrderedList = () => {
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
    };

    const closeUnorderedList = () => {
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Empty line handling
      if (!trimmedLine) {
        closeOrderedList();
        closeUnorderedList();
        flushParagraph();
        continue;
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        closeOrderedList();
        closeUnorderedList();
        flushParagraph();
        result.push(`<h3>${this.formatInlineElements(trimmedLine.substring(4))}</h3>`);
        continue;
      }

      if (trimmedLine.startsWith('## ')) {
        closeOrderedList();
        closeUnorderedList();
        flushParagraph();
        result.push(`<h2>${this.formatInlineElements(trimmedLine.substring(3))}</h2>`);
        continue;
      }

      if (trimmedLine.startsWith('# ')) {
        closeOrderedList();
        closeUnorderedList();
        flushParagraph();
        result.push(`<h1>${this.formatInlineElements(trimmedLine.substring(2))}</h1>`);
        continue;
      }

      // Numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        closeUnorderedList();
        flushParagraph();
        if (!inOrderedList) {
          result.push('<ol>');
          inOrderedList = true;
        }
        result.push(`<li>${this.formatInlineElements(numberedMatch[1])}</li>`);
        continue;
      }

      // Bullet lists
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        closeOrderedList();
        flushParagraph();
        if (!inUnorderedList) {
          result.push('<ul>');
          inUnorderedList = true;
        }
        result.push(`<li>${this.formatInlineElements(trimmedLine.substring(2))}</li>`);
        continue;
      }

      // Regular text
      closeOrderedList();
      closeUnorderedList();
      currentParagraph.push(trimmedLine);
    }

    // Flush any remaining content
    closeOrderedList();
    closeUnorderedList();
    flushParagraph();

    return result.join('');
  }

  private formatInlineElements(text: string): string {
    // Handle bold text **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Escape any remaining HTML
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    
    return text;
  }
}
