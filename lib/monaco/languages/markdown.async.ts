import type { LanguageConfiguration, LanguageTokenizer } from '../types';

export const configuration: LanguageConfiguration = {
  comments: {
    blockComment: ['<!--', '-->'],
  },
  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
  ],
  autoClosingPairs: [
    { open: '*', close: '*' },
    { open: '_', close: '_' },
    { open: '`', close: '`' },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
  ],
  surroundingPairs: [
    { open: '*', close: '*' },
    { open: '_', close: '_' },
    { open: '`', close: '`' },
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
  ],
};

export const tokenizer: LanguageTokenizer = {
  defaultToken: '',
  tokenPostfix: '.md',

  tokenizer: {
    root: [
      // Headers
      [/^\s{0,3}(#{1,6})(\s+)(.*)$/, ['keyword', '', '']],

      // Blockquote
      [/^\s*>+/, 'comment'],

      // Lists
      [/^\s*([-*+]|\d+\.)\s+/, 'keyword'],

      // Code blocks
      [/^\s*```.*$/, 'string', '@codeblock'],

      // Inline code
      [/`[^`]*`/, 'variable'],

      // Bold and Italic
      [/\*\*[^*]+\*\*/, 'strong'],
      [/\*[^*]+\*/, 'emphasis'],
      [/_([^_]+)_/, 'emphasis'],

      // Links and Images
      [/!\[.*\]\(.*\)/, 'string.link'],
      [/\[.*\]\(.*\)/, 'string.link'],

      // Text
      [/[^#\*\s]+/, ''],
    ],

    codeblock: [
      [/^\s*```$/, 'string', '@pop'],
      [/.*$/, 'variable'],
    ],
  },
};
