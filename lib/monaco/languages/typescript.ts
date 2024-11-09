import type { LanguageDefinition } from '../types';

export const TypeScriptDefinition: LanguageDefinition = {
  id: 'typescript',
  extensions: ['.ts', '.tsx'],
  aliases: ['TypeScript', 'ts', 'typescript'],
  mimeTypes: ['application/typescript'],
  detectionPatterns: [
    { pattern: /^[\s\n]*(import|export)\s+.*from\s+['"]/, weight: 2 },
    { pattern: /^[\s\n]*(interface|type|class)\s+\w+/, weight: 2 },
    { pattern: /:\s*(string|number|boolean|any)\b/, weight: 1 },
    { pattern: /\basync\s+function\b/, weight: 1 }
  ]
};
