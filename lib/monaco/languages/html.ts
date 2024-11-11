import type { LanguageDefinition } from '../types';

export const HtmlDefinition: LanguageDefinition = {
  id: 'html',
  extensions: ['.html', '.htm', '.xhtml'],
  aliases: ['HTML', 'html'],
  mimeTypes: ['text/html'],
  detectionPatterns: [
    { pattern: /<\s*!DOCTYPE\s+html\s*>/i, weight: 2 },
    { pattern: /<\s*html\s*.*?>/i, weight: 2 },
    { pattern: /<\s*head\s*.*?>/i, weight: 1 },
    { pattern: /<\s*body\s*.*?>/i, weight: 1 },
    { pattern: /<\s*script\s*.*?>[\s\S]*?<\/\s*script\s*>/i, weight: 2 },
    { pattern: /<\s*link\s+.*?rel\s*=\s*["']stylesheet["'].*?>/i, weight: 1 },
    { pattern: /<\s*meta\s+.*?charset\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*div\s+.*?>/i, weight: 1 },
    { pattern: /<\s*input\s+.*?type\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*img\s+.*?src\s*=\s*["'][^"']*["'].*?>/i, weight: 1 },
    { pattern: /<\s*a\s+.*?href\s*=\s*["'][^"']*["'].*?>/i, weight: 1 }
  ],
};
