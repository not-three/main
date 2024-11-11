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
    mimetypes: lang.mimeTypes,
  });

  // Set language configuration if provided
  if (lang.configuration) {
    monaco.languages.setLanguageConfiguration(lang.id, lang.configuration);
  }

  // Set tokenizer if provided
  if (lang.tokenizer) monaco.languages.setMonarchTokensProvider(lang.id, lang.tokenizer);
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

  // Set compiler options for TypeScript
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    checkJs: false,
    noEmit: true,
    noResolve: true, // Ignores import errors
    module: monaco.languages.typescript.ModuleKind.ESNext,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  });

  // Set diagnostic options to suppress specific error codes (e.g., import errors)
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2792], // Error code for "Cannot find module"
  });
}
