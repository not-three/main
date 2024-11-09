import type { LanguageDefinition } from '../types';

export const JavascriptDefinition: LanguageDefinition = {
  id: 'javascript',
  extensions: ['.js', '.jsx', '.mjs', '.cjs'],
  aliases: ['JavaScript', 'js', 'javascript'],
  mimeTypes: ['application/javascript'],
  detectionPatterns: [
    { pattern: /^[\s\n]*(import|export)\s+.*from\s+['"]/, weight: 1 },
    { pattern: /^[\s\n]*const\s+\w+\s*=\s*require\(/, weight: 2 },
    { pattern: /\bfunction\s*\*?\s*\w+\s*\(/, weight: 1 },
    { pattern: /\bclass\s+\w+(\s+extends\s+\w+)?/, weight: 1 }
  ]
};
