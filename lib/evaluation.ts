// Evaluation functions for alternative responses

export type EvaluationResult = {
  name: string;
  value: number | string;
};

export type EvaluationFunction = (text: string) => EvaluationResult;

// Word counter evaluation function
export const wordCounter: EvaluationFunction = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return {
    name: 'Word Count',
    value: words
  };
};

// Character counter evaluation function
export const characterCounter: EvaluationFunction = (text: string) => {
  const chars = text.length;
  return {
    name: 'Character Count',
    value: chars
  };
};

// List of all available evaluation functions
export const evaluators: EvaluationFunction[] = [
  wordCounter,
  characterCounter
];

// Run all evaluators on a given text
export const evaluateText = (text: string): EvaluationResult[] => {
  return evaluators.map(evaluator => evaluator(text));
}; 