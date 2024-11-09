import * as monaco from 'monaco-editor';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import { languageDefinitions } from './languages';
import type { LanguageDefinition } from './types';

function registerLanguage(lang: LanguageDefinition) {
  monaco.languages.register({
    id: lang.id,
    extensions: lang.extensions,
    aliases: lang.aliases,
    mimetypes: lang.mimeTypes
  });

  // Set language configuration if provided
  if (lang.configuration) {
    monaco.languages.setLanguageConfiguration(lang.id, lang.configuration);
  }

  // Set tokenizer if provided
  if (lang.tokenizer) {
    monaco.languages.setMonarchTokensProvider(lang.id, {
      ...lang.tokenizer,
      tokenizer: Object.fromEntries(
        Object.entries(lang.tokenizer.tokenizer).map(([key, rules]) => [
          key,
          rules.map(rule => {
            if (Array.isArray(rule)) {
              // Ensure rule has all required elements for IMonarchLanguageRule
              const [regex, token, next = '@pop'] = rule;
              return [regex, token, next];
            }
            return rule;
          })
        ])
      )
    });
  }
}

export async function setupMonaco() {
  (self as any).MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      switch (label) {
        case 'json':
          return new jsonWorker();
        case 'css':
        case 'scss':
        case 'less':
          return new cssWorker();
        case 'html':
          return new htmlWorker();
        case 'typescript':
        case 'javascript':
          return new tsWorker();
        default:
          return undefined as any;
      }
    }
  };

  for (const lang of languageDefinitions) registerLanguage(lang);

  monaco.editor.defineTheme('custom-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '9CDCFE' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'operators', foreground: 'D4D4D4' },
      { token: 'comment', foreground: '6A9955' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
    }
  });
}

export function registerSimpleSyntax(
  languageId: string,
  config: {
    keywords?: string[];
    operators?: string[];
    symbols?: string[];
    tokenizer?: Record<string, monaco.languages.IMonarchLanguageRule[]>;
  }
): void {
  const { keywords = [], operators = [], symbols = [], tokenizer = {} } = config;

  const defaultTokenizer: monaco.languages.IMonarchLanguage = {
    defaultToken: '',
    tokenizer: {
      root: [
        // Keywords
        [new RegExp(`\\b(?:${keywords.join('|')})\\b`), 'keyword', '@pop'], // Fixed template string

        // Operators
        [new RegExp(`[${operators.join('')}]`), 'operators', '@pop'],

        // Symbols
        [new RegExp(`[${symbols.join('')}]`), 'delimiter', '@pop'],

        // Strings
        [/"[^"]*"/, 'string', '@pop'],
        [/'[^']*'/, 'string', '@pop'],

        // Numbers
        [/\d+/, 'number', '@pop'],

        // Comments
        [/\/\/.*$/, 'comment', '@pop'],
        [/\/\*/, 'comment', '@comment'],

        // Identifiers
        [/[a-zA-Z_]\w*/, 'identifier', '@pop'],
      ],
      comment: [
        [/[^/*]+/, 'comment', '@pop'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment', '@pop']
      ],
      ...tokenizer
    }
  };

  monaco.languages.setMonarchTokensProvider(languageId, defaultTokenizer);
}
