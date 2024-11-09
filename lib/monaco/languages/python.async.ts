import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    lineComment: '#',
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
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.python',

  keywords: [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
    'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
    'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while',
    'with', 'yield',
  ],

  operators: [
    '=', '>', '<', '==', '!=', '<=', '>=', '+', '-', '*', '**', '/', '//', '%', '@', '<<', '>>',
    '&', '|', '^', '~', ':=', '->', '+=', '-=', '*=', '/=', '//=', '%=', '@=', '&=', '|=', '^=',
    '>>=', '<<=', '**=',
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

      // Whitespace
      { include: '@whitespace' },

      // Comments
      [/#.*$/, 'comment'],

      // Strings
      [/"""/, 'string', '@string_triple_double'],
      [/'''/, 'string', '@string_triple_single'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],

      // Numbers
      [/\d+\.\d+([eE][\-+]?\d+)?j?/, 'number.float'],
      [/\d+[eE][\-+]?\d+j?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+j?/, 'number.hex'],
      [/0[oO]?[0-7]+j?/, 'number.octal'],
      [/0[bB][01]+j?/, 'number.binary'],
      [/\d+j?/, 'number'],

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': '',
        },
      }],
      [/[;:.,]/, 'delimiter'],
    ],

    whitespace: [
      [/\s+/, 'white'],
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

    string_triple_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"""/, 'string', '@pop'],
    ],

    string_triple_single: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'''/, 'string', '@pop'],
    ],
  },
};
