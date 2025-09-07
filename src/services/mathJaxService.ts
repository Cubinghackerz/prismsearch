// MathJax Service - Global MathJax configuration and initialization
export class MathJaxService {
  private static instance: MathJaxService;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): MathJaxService {
    if (!MathJaxService.instance) {
      MathJaxService.instance = new MathJaxService();
    }
    return MathJaxService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Configure MathJax if not already configured
      if (!window.MathJax) {
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
          }
        };
      }

      // Wait for MathJax to load if it's already in the process
      const checkMathJax = () => {
        if (window.MathJax?.typesetPromise) {
          this.isInitialized = true;
          resolve();
        } else {
          // If MathJax script is not loaded, wait a bit and check again
          setTimeout(checkMathJax, 100);
        }
      };

      checkMathJax();
    });

    return this.initPromise;
  }

  public async renderMath(element: Element): Promise<void> {
    await this.initialize();
    
    if (window.MathJax?.typesetPromise) {
      try {
        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.warn('MathJax rendering error:', error);
      }
    }
  }

  public async renderMathInElements(elements: Element[]): Promise<void> {
    await this.initialize();
    
    if (window.MathJax?.typesetPromise) {
      try {
        await window.MathJax.typesetPromise(elements);
      } catch (error) {
        console.warn('MathJax rendering error:', error);
      }
    }
  }

  public isReady(): boolean {
    return this.isInitialized && !!window.MathJax?.typesetPromise;
  }
}

export const mathJaxService = MathJaxService.getInstance();