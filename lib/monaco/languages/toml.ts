import type { LanguageDefinition } from '../types';

export const TomlDefinition: LanguageDefinition = {
  id: 'toml',
  extensions: ['.toml'],
  aliases: ['TOML', 'toml'],
  mimeTypes: ['text/x-toml'],
  loader: async () => import('./toml.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^\s*\[.*\]/, weight: 2 },
    { pattern: /^\s*\w+\s*=\s*.+$/, weight: 1 },
  ],
};
