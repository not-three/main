import type * as monaco from 'monaco-editor';

export interface EditorConfig {
  value: string;
  language?: string;
  readonly?: boolean;
  filename?: string;
  theme?: string;
}

export interface LanguageInfo {
  id: string;
  extensions: string[];
  aliases: string[];
}

export type EditorEvents = {
  (event: 'update:modelValue', value: string): void;
  (event: 'loaded'): void;
  (event: 'save'): void;
  (event: 'duplicate'): void;
  (event: 'new'): void;
  (event: 'loaded-languages', languages: LanguageInfo[]): void;
  (event: 'language-detected', language: string): void;
}

export interface LanguageMapping {
  extensions: string[];
  aliases?: string[];
  mimeTypes?: string[]; // Keep this for our internal use
}

export type TokenizerRuleAction = string | string[] | { 
  token: string; 
  next?: string; 
  switchTo?: string;
  nextEmbedded?: string;
  log?: string;
};

// Using Monaco's types directly where possible
export interface LanguageTokenizer extends Omit<monaco.languages.IMonarchLanguage, 'tokenizer'> {
  tokenizer: {
    [stateName: string]: monaco.languages.IMonarchLanguageRule[];
  };
}

export interface LanguageConfiguration extends monaco.languages.LanguageConfiguration {
  // Add any additional configuration options here if needed
}

export interface LanguageDefinition extends Omit<LanguageMapping, 'mimeTypes'> {
  id: string;
  configuration?: LanguageConfiguration;
  tokenizer?: LanguageTokenizer;
  mimeTypes?: string[]; // Keep for internal use
  loader?: () => Promise<{
    configuration?: LanguageConfiguration;
    tokenizer?: LanguageTokenizer;
  }>;
  detectionPatterns?: {
    pattern: RegExp;
    weight?: number; // Optional weight for pattern importance
  }[];
}

export type Editor = monaco.editor.IStandaloneCodeEditor;
