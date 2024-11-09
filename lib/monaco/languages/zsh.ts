import type { LanguageDefinition } from '../types';

export const ZshDefinition: LanguageDefinition = {
  id: 'zsh',
  extensions: ['.zsh', '.zshrc', '.zprofile', '.zlogin', '.zlogout'],
  aliases: ['Zsh', 'zsh'],
  mimeTypes: ['application/x-zsh'],
  loader: async () => import('./zsh.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^#!\/bin\/zsh/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+zsh/, weight: 2 },
    { pattern: /^\s*#!/, weight: 1 }, // Generic shebang
  ],
};
