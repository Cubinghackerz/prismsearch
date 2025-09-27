// MathJax Service - manages initialization, rendering, and resiliency helpers

interface RenderOptions {
  force?: boolean;
}

type CleanupFn = () => void;

export class MathJaxService {
  private static instance: MathJaxService;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private activeObservers = new WeakMap<Element, MutationObserver>();
  private typesettingElements = new WeakSet<Element>();
  private scheduledRenders = new WeakMap<Element, number>();

  private constructor() {}

  public static getInstance(): MathJaxService {
    if (!MathJaxService.instance) {
      MathJaxService.instance = new MathJaxService();
    }

    return MathJaxService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      if (!window.MathJax) {
        window.MathJax = {
          tex: {
            inlineMath: [
              ['$', '$'],
              ['\\(', '\\)'],
            ],
            displayMath: [
              ['$$', '$$'],
              ['\\[', '\\]'],
            ],
            processEscapes: true,
            processEnvironments: true,
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          },
        };
      }

      const checkMathJaxReady = () => {
        if (window.MathJax?.typesetPromise) {
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(checkMathJaxReady, 100);
        }
      };

      checkMathJaxReady();
    });

    return this.initPromise;
  }

  private clearScheduledRender(element: Element) {
    const handle = this.scheduledRenders.get(element);
    if (handle !== undefined) {
      cancelAnimationFrame(handle);
      this.scheduledRenders.delete(element);
    }
  }

  private scheduleRender(element: Element, options: RenderOptions = {}) {
    this.clearScheduledRender(element);
    const handle = requestAnimationFrame(() => {
      this.scheduledRenders.delete(element);
      this.renderMath(element, options).catch((error) => {
        console.warn('MathJax scheduled rendering error:', error);
      });
    });
    this.scheduledRenders.set(element, handle);
  }

  public async renderMath(element: Element, options: RenderOptions = {}): Promise<void> {
    await this.initialize();

    if (!window.MathJax?.typesetPromise) {
      return;
    }

    if (this.typesettingElements.has(element) && !options.force) {
      return;
    }

    this.typesettingElements.add(element);

    try {
      if (options.force && typeof window.MathJax.typesetClear === 'function') {
        window.MathJax.typesetClear([element]);
      }

      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.warn('MathJax rendering error:', error);
      throw error;
    } finally {
      requestAnimationFrame(() => {
        this.typesettingElements.delete(element);
      });
    }
  }

  public async renderMathInElements(elements: Element[], options: RenderOptions = {}): Promise<void> {
    await this.initialize();

    if (!window.MathJax?.typesetPromise) {
      return;
    }

    const renders = elements.map((element) => this.renderMath(element, options));
    await Promise.allSettled(renders);
  }

  public async forceRender(element: Element): Promise<void> {
    return this.renderMath(element, { force: true });
  }

  public async watchElement(element: HTMLElement): Promise<CleanupFn> {
    await this.initialize();

    if (this.activeObservers.has(element)) {
      const existing = this.activeObservers.get(element);
      return () => {
        existing?.disconnect();
        this.activeObservers.delete(element);
        this.clearScheduledRender(element);
      };
    }

    let disposed = false;

    const observer = new MutationObserver((mutations) => {
      if (this.typesettingElements.has(element)) {
        return;
      }

      const relevantMutation = mutations.some((mutation) => {
        if (mutation.type === 'childList') {
          return true;
        }
        if (mutation.type === 'characterData') {
          return true;
        }
        return false;
      });

      if (relevantMutation) {
        this.scheduleRender(element);
      }
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.activeObservers.set(element, observer);

    this.scheduleRender(element);

    const cleanup = () => {
      if (disposed) {
        return;
      }

      disposed = true;
      observer.disconnect();
      this.activeObservers.delete(element);
      this.clearScheduledRender(element);
    };

    return cleanup;
  }

  public isReady(): boolean {
    return this.isInitialized && !!window.MathJax?.typesetPromise;
  }
}

export const mathJaxService = MathJaxService.getInstance();
