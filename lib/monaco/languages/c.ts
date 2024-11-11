import type { LanguageDefinition } from '../types';

export const CDefinition: LanguageDefinition = {
  id: 'c',
  extensions: ['.c', '.h'],
  aliases: ['C', 'c'],
  mimeTypes: ['text/x-csrc'],
  detectionPatterns: [
    { pattern: /^\s*#include\s+<.*>/, weight: 2 },
    { pattern: /^\s*(int|void|char)\s+\w+\s*\(/, weight: 2 },
    { pattern: /^\s*#define\s+\w+/, weight: 1 },
  ],
};
