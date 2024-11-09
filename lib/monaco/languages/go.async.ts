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
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '`', close: '`' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '`', close: '`' },
  ],
  folding: {
    markers: {
      start: /^\s*\/\/\s*#region\b/,
      end: /^\s*\/\/\s*#endregion\b/,
    },
  },
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.go',

  keywords: [
    'break', 'default', 'func', 'interface', 'select', 'case', 'defer', 'go', 'map', 'struct',
    'chan', 'else', 'goto', 'package', 'switch', 'const', 'fallthrough', 'if', 'range', 'type',
    'continue', 'for', 'import', 'return', 'var',
  ],

  operators: [
    '+', '-', '*', '/', '%', '&', '|', '^', '<<', '>>', '&^',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '&^=',
    '&&', '||', '<-', '++', '--', '==', '<', '>', '=', '!', '!=', '<=', '>=', ':=', '...',
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
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // Strings
      [/"/, 'string', '@string_double'],
      [/`/, 'string', '@string_raw'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
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
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],

    string_raw: [
      [/[^`]+/, 'string'],
      [/`/, 'string', '@pop'],
    ],

    whitespace: [
      [/\s+/, 'white'],
    ],
  },
};
