import type { LanguageDefinition } from '../types';

export const BashDefinition: LanguageDefinition = {
  id: 'bash',
  extensions: ['.bash', '.sh', '.command'],
  aliases: ['Bash', 'bash'],
  mimeTypes: ['application/x-sh'],
  loader: async () => import('./bash.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^#!\/bin\/bash/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+bash/, weight: 2 },
    { pattern: /^\s*#!/, weight: 1 }, // Generic shebang
  ],
};
