import type { LanguageDefinition } from '../types';

export const TomlDefinition: LanguageDefinition = {
  id: 'toml',
  extensions: ['.toml'],
  aliases: ['TOML', 'toml'],
  mimeTypes: ['text/x-toml'],
  configuration: {
    comments: {
      lineComment: '#',
    },
    brackets: [
      ['[', ']'],
      ['{', '}'],
    ],
    autoClosingPairs: [
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
    ],
    surroundingPairs: [
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
    ],
  },
  
  tokenizer: {
    defaultToken: '',
    tokenPostfix: '.toml',
    
    keywords: ['true', 'false'],
    
    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],
        
        // Whitespace
        [/\s+/, ''],
        
        // Table headers
        [/^\s*\[\[.*?\]\]/, 'metatag'],  // Array of Tables
        [/^\s*\[.*?\]/, 'metatag'],      // Standard Tables
        
        // Key-value pairs
        [/([A-Za-z_][A-Za-z0-9_\-]*)(\s*=\s*)/, ['key', 'delimiter']],
        
        // Strings
        [/"/, { token: 'string.quote', next: '@string_double' }],
        [/'/, { token: 'string.quote', next: '@string_single' }],
        
        // Numbers
        [/-?\d+(\.\d+)?([eE][\-+]?\d+)?/, 'number'],
        
        // Booleans
        [/\b(true|false)\b/, 'keyword'],
        
        // Dates and times (ISO 8601)
        [/\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?/, 'string.date'],
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', next: '@pop' }],
        [/./, 'string']
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, { token: 'string.quote', next: '@pop' }],
        [/./, 'string']
      ]
    }
  },
  
  detectionPatterns: [
    { pattern: /^\s*\[.*\]/, weight: 2 },
    { pattern: /^\s*\w+\s*=\s*.+$/, weight: 1 },
  ],
};
