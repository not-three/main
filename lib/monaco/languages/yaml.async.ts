import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    lineComment: '#'
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  folding: {
    markers: {
      start: /^([^#]*:)|(-\s*\w+:)|(\w+:)/,
      end: /^[^#]*$/
    }
  }
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenizer: {
    root: [
      // Using object syntax
      { 
        regex: /^---/, 
        action: 'operators'
      },
      
      // Using array syntax with multiple tokens
      [/([^,\{\[\]\}\s]+)(\s*)(:)/, ['key', 'white', 'operators']],
      
      // Using simple array syntax
      [/#.*$/, 'comment'],
      
      // Using object syntax with next state
      { 
        regex: /"/, 
        action: { token: 'string', next: '@string_double' }
      },
      { 
        regex: /'/, 
        action: { token: 'string', next: '@string_single' }
      },
      
      // Using simple array syntax for direct tokens
      [/-?\d+\.?\d*([eE]\-?\d+)?/, 'number'],
      [/\b(true|false)\b/, 'keyword'],
      [/\bnull\b/, 'keyword'],
      [/\-\s+/, 'operators'],
      [/[,\{\[\]\}]/, 'operators'],
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, { token: 'string', next: '@pop' }]
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'/, { token: 'string', next: '@pop' }]
    ]
  }
};
