import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    lineComment: ';',
  },
  brackets: [
    ['[', ']'],
  ],
  autoClosingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '[', close: ']' },
  ],
  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '[', close: ']' },
  ],
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.ini',

  tokenizer: {
    root: [
      // Comments
      [/^\s*;.*$/, 'comment'],

      // Section headers
      [/^\s*\[.*\]$/, 'metatag'],

      // Key-value pairs
      [/^\s*([\w\.\-]+)(\s*=\s*)(.*)$/, ['key', '', 'string']],

      // Strings
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'/, 'string', '@pop'],
    ],
  },
};
