import type { LanguageDefinition } from '../types';

export const XmlDefinition: LanguageDefinition = {
  id: 'xml',
  extensions: ['.xml', '.xsd', '.xsl', '.xslt', '.svg'],
  aliases: ['XML', 'xml'],
  mimeTypes: ['application/xml', 'text/xml', 'application/atom+xml', 'application/rss+xml'],
  detectionPatterns: [
    { pattern: /<\?xml\s+version\s*=\s*["'][^"']*["']\s*.*?\?>/i, weight: 2 },
    { pattern: /<\s*\w+:?\w*\s*.*?>/i, weight: 2 },
    { pattern: /<\s*\w+\s*.*?\/>/i, weight: 1 },
    { pattern: /<\s*\w+\s*.*?>[\s\S]*?<\/\s*\w+\s*>/i, weight: 2 },
    { pattern: /<\s*\!DOCTYPE\s+[^>]*>/i, weight: 1 },
    { pattern: /<\s*\!\[CDATA\[[\s\S]*?\]\]>/i, weight: 1 },
    { pattern: /<\s*comment\s*.*?>[\s\S]*?<\/\s*comment\s*>/i, weight: 1 },
  ],
};
