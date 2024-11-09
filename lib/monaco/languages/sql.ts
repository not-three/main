import type { LanguageDefinition } from '../types';

export const SqlDefinition: LanguageDefinition = {
  id: 'sql',
  extensions: ['.sql'],
  aliases: ['SQL', 'sql'],
  mimeTypes: ['application/sql', 'text/sql'],
  loader: async () => import('./sql.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /SELECT\s+.*?\s+FROM\s+/i, weight: 2 },
    { pattern: /INSERT\s+INTO\s+.*?\s+VALUES\s+/i, weight: 2 },
    { pattern: /UPDATE\s+.*?\s+SET\s+/i, weight: 2 },
    { pattern: /DELETE\s+FROM\s+/i, weight: 2 },
    { pattern: /CREATE\s+(TABLE|DATABASE|INDEX)\s+/i, weight: 1 },
    { pattern: /DROP\s+(TABLE|DATABASE|INDEX)\s+/i, weight: 1 },
    { pattern: /ALTER\s+TABLE\s+/i, weight: 1 },
    { pattern: /\bWHERE\b/i, weight: 1 },
  ],
};
