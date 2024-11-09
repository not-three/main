import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
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
      start: /^\s*#pragma\s+region\b/,
      end: /^\s*#pragma\s+endregion\b/,
    },
  },
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.c',

  keywords: [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else',
    'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return',
    'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned',
    'void', 'volatile', 'while',
  ],

  operators: [
    '+', '-', '*', '/', '%', '++', '--', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!',
    '&', '|', '^', '~', '<<', '>>', '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=',
    '>>=', '?', ':',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  tokenizer: {
    root: [
      // Identifiers and keywords
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier',
        },
      }],

      // Preprocessor directives
      [/^\s*#\s*\w+/, 'keyword.directive'],

      // Whitespace
      { include: '@whitespace' },

      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // Strings
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],

      // Numbers
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/0[0-7]+/, 'number.octal'],
      [/\d+/, 'number'],

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': '',
        },
      }],
      [/[;,]/, 'delimiter'],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
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

    whitespace: [
      [/\s+/, 'white'],
    ],
  },
};
