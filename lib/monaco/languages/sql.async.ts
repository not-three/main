import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    lineComment: '--',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['comment'] },
    { open: "'", close: "'", notIn: ['comment', 'string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: /^\s*--\s*region\b/,
      end: /^\s*--\s*endregion\b/,
    },
  },
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.sql',

  keywords: [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'DATABASE', 'INDEX', 'DROP', 'ALTER', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL',
    'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
    'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'CASE',
    'WHEN', 'THEN', 'ELSE', 'END',
  ],

  operators: [
    '=', '>', '<', '>=', '<=', '<>', '!=', '+', '-', '*', '/', '%', '||', '&&', '^', '!',
  ],

  symbols: /[=><!~?@#%&*+\-^|\/]+/,

  tokenizer: {
    root: [
      // Comments
      [/--.*/, 'comment'],

      // Identifiers and keywords
      [/[a-zA-Z_][\w]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier',
        },
      }],

      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Strings
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],

      // Whitespace
      { include: '@whitespace' },

      // Operators
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': '',
        },
      }],
    ],

    string_double: [
      [/[^\"]+/, 'string'],
      [/\"/, 'string', '@pop'],
    ],

    string_single: [
      [/[^\']+/, 'string'],
      [/\'/, 'string', '@pop'],
    ],

    whitespace: [
      [/\s+/, 'white'],
    ],
  },
};
