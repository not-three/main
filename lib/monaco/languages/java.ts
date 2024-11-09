import type { LanguageDefinition } from '../types';

export const JavaDefinition: LanguageDefinition = {
  id: 'java',
  extensions: ['.java'],
  aliases: ['Java', 'java'],
  mimeTypes: ['text/x-java-source'],
  loader: async () => import('./java.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^\s*package\s+\w+(\.\w+)*;/, weight: 2 },
    { pattern: /^\s*public\s+(class|interface)\s+\w+/, weight: 2 },
    { pattern: /^\s*import\s+/, weight: 1 },
  ],
};
