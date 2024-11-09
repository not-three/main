import type { LanguageDefinition } from '../types';

export const IniDefinition: LanguageDefinition = {
  id: 'ini',
  extensions: ['.ini', '.cfg', '.conf'],
  aliases: ['INI', 'ini'],
  mimeTypes: ['text/x-ini'],
  loader: async () => import('./ini.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^\s*\[.*\]/, weight: 2 },
    { pattern: /^\s*\w+\s*=\s*.*$/, weight: 1 },
  ],
};
