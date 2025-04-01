// Server-side actions for processing chat messages

import { EvaluationResult, evaluateText, wordCounter, characterCounter } from './evaluation';

// Interface for extended assistant message
export interface ExtendedAssistantMessage {
  text: string;
  evaluations?: EvaluationResult[];
}

// Process alternative responses based on evaluator selection
export function processAlternatives(
  alternatives: string[],
  evaluator: string
): ExtendedAssistantMessage[] {
  if (!alternatives || alternatives.length === 0) {
    return [];
  }

  return alternatives.map(text => {
    let evaluations: EvaluationResult[] = [];

    // Apply the selected evaluation(s)
    switch (evaluator) {
      case 'word-counter':
        evaluations = [wordCounter(text)];
        break;
      case 'char-counter':
        evaluations = [characterCounter(text)];
        break;
      case 'both':
        evaluations = [wordCounter(text), characterCounter(text)];
        break;
      default:
        // No evaluation
        break;
    }

    return {
      text,
      evaluations
    };
  });
} 