declare module 'nerdamer' {
  interface NerdamerExpression {
    toString(): string;
    toTeX(): string;
    text(): string;
    evaluate(values?: Record<string, number>): NerdamerExpression;
  }

  interface NerdamerStatic {
    (expression: string, ...args: unknown[]): NerdamerExpression;
  }

  const nerdamer: NerdamerStatic;
  export default nerdamer;
}

declare module 'nerdamer/Calculus.js';
declare module 'nerdamer/Algebra.js';
declare module 'nerdamer/Solve.js';
