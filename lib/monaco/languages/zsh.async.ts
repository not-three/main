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
    { open: '`', close: '`', notIn: ['comment', 'string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' },
  ],
  folding: {
    markers: {
      start: /^\s*#\s*region\b/,
      end: /^\s*#\s*endregion\b/,
    },
  },
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.zsh',

  keywords: [
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac',
    'function', 'select', 'in', 'until', 'return', 'break', 'continue', 'typeset', 'export',
    'readonly', 'shift', 'source', 'trap', 'alias', 'unalias', 'autoload', 'bg', 'bindkey',
    'bind', 'builtin', 'cd', 'dirs', 'disable', 'echo', 'enable', 'eval', 'exec', 'exit',
    'fg', 'getopts', 'hash', 'integer', 'kill', 'let', 'print', 'pushd', 'popd', 'read',
    'readarray', 'readonly', 'rehash', 'set', 'shift', 'source', 'test', 'times', 'trap',
    'type', 'typeset', 'ulimit', 'umask', 'unalias', 'unset', 'wait',
  ],

  operators: [
    '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '|', '&', ';', ';;', '<<', '>>',
    '<<<', '&>', '>|', '>>|', '+', '-', '*', '/', '%', '++', '--', '**', '+=', '-=', '*=', '/=',
    '%=', '<<=', '>>=', '&&=', '||=', '##', '###', '#', '!', '(', ')', '{', '}', '[', ']',
  ],

  symbols: /[=><!|&+\-*\/%^]+/,

  tokenizer: {
    root: [
      // Shebang
      [/^#!.*$/, 'metatag'],

      // Identifiers and keywords
      [/[a-zA-Z_][\w]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier',
        },
      }],

      // Variables
      [/\$[a-zA-Z_][\w]*/, 'variable'],

      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Strings
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
      [/`/, 'string', '@string_backtick'],

      // Whitespace
      { include: '@whitespace' },

      // Comments
      [/#.*$/, 'comment'],

      // Operators
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': '',
        },
      }],
    ],

    comment: [
      [/[^\#]+/, 'comment'],
      [/\#/, 'comment'],
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

    string_backtick: [
      [/[^\\`]+/, 'string'],
      [/\\./, 'string.escape'],
      [/`/, 'string', '@pop'],
    ],

    whitespace: [
      [/\s+/, 'white'],
    ],
  },
};
