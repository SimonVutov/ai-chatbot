// Evaluation functions for alternative responses

export type EvaluationResult = {
  id: string; // Unique descriptive short ID
  name: string;
  value: number | string;
};

export type EvaluationFunction = (text: string) => EvaluationResult;

// Word counter evaluation function
export const wordCounter: EvaluationFunction = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return {
    id: 'word_count', // Unique ID for word count
    name: 'Word Count',
    value: words
  };
};

// Character counter evaluation function
export const characterCounter: EvaluationFunction = (text: string) => {
  const chars = text.length;
  return {
    id: 'char_count', // Unique ID for character count
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