import type { LanguageDefinition } from '../types';

export const JsonDefinition: LanguageDefinition = {
  id: 'json',
  extensions: ['.json', '.jsonc'],
  aliases: ['JSON', 'json'],
  mimeTypes: ['application/json'],
  detectionPatterns: [
    { pattern: /^[\s\n]*(\{|\[)[\s\n]*"/, weight: 2 },
    { pattern: /^[\s\n]*\{[\s\n]*"[^"]+"\s*:/, weight: 2 }
  ]
};
