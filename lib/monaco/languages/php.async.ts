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
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.php',

  keywords: [
    'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone',
    'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty',
    'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit',
    'extends', 'final', 'finally', 'for', 'foreach', 'function', 'global', 'goto', 'if',
    'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
    'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require',
    'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var',
    'while', 'xor', 'yield', '__halt_compiler',
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '===', '!=', '<>', '!==', '<=', '>=', '<=>',
    '&&', '||', '++', '--', '**', '*', '/', '%', '+', '-', '.', '<<', '>>', '&', '|', '^', '~',
    '::', '=>', '??',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%\.]+/,

  tokenizer: {
    root: [
      [/<\?php/, { token: 'metatag.php', next: '@php' }],
      [/<\?=/, { token: 'metatag.php', next: '@php' }],
      [/<\?/, { token: 'metatag.php', next: '@php' }],
      [/[^<]+/, 'text'],
      [/<\/?/, 'delimiter.html'],
    ],

    php: [
      [/\?>/, { token: 'metatag.php', next: '@pop' }],

      // Identifiers and keywords
      [/[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/, {
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
      [/'/, 'string', '@string_single'],

      // Numbers
      [/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+([eE][\-+]?\d+)?/, 'number'],

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
      [/[^*/]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
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
