
declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
      typesetClear?: (elements?: Element[]) => void;
      tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
        processEscapes?: boolean;
        processEnvironments?: boolean;
      };
      options?: {
        skipHtmlTags?: string[];
      };
      startup?: {
        ready?: () => void;
      };
    };
  }
}

export {};
