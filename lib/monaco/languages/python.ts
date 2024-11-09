import type { LanguageDefinition } from '../types';

export const PythonDefinition: LanguageDefinition = {
  id: 'python',
  extensions: ['.py', '.pyw'],
  aliases: ['Python', 'python'],
  mimeTypes: ['text/x-python'],
  detectionPatterns: [
    { pattern: /^\s*def\s+\w+\s*\(/, weight: 2 },
    { pattern: /^\s*class\s+\w+\s*:/, weight: 2 },
    { pattern: /^\s*import\s+\w+/, weight: 1 },
  ],
};
