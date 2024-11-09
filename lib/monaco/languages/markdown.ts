import type { LanguageDefinition } from '../types';

export const MarkdownDefinition: LanguageDefinition = {
  id: 'markdown',
  extensions: ['.md', '.markdown'],
  aliases: ['Markdown', 'markdown'],
  mimeTypes: ['text/markdown'],
  detectionPatterns: [
    { pattern: /^#{1,6}\s+/, weight: 2 },
    { pattern: /^\s*>/, weight: 1 },
    { pattern: /^\s*[-*+]\s+/, weight: 1 },
  ],
};
