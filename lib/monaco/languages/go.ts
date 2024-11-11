import type { LanguageDefinition } from '../types';

export const GoDefinition: LanguageDefinition = {
  id: 'go',
  extensions: ['.go'],
  aliases: ['Go', 'go'],
  mimeTypes: ['text/x-go'],
  detectionPatterns: [
    { pattern: /^\s*package\s+\w+/, weight: 2 },
    { pattern: /^\s*func\s+(\w+\s*)?\(/, weight: 2 },
    { pattern: /^\s*import\s+/, weight: 1 },
  ],
};
