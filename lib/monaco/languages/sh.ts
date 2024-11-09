import type { LanguageDefinition } from '../types';

export const ShDefinition: LanguageDefinition = {
  id: 'sh',
  extensions: ['.sh', '.bash', '.ksh', '.zsh'],
  aliases: ['Sh', 'sh'],
  mimeTypes: ['application/x-sh'],
  loader: async () => import('./sh.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^#!\/bin\/sh/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+sh/, weight: 2 },
    { pattern: /^\s*#!/, weight: 1 }, // Generic shebang
  ],
};
