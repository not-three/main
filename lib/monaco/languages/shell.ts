import type { LanguageDefinition } from '../types';

export const ShellDefinition: LanguageDefinition = {
  id: 'shell',
  extensions: ['.sh', '.bash', '.ksh', '.zsh'],
  aliases: ['Sh', 'sh'],
  mimeTypes: ['application/x-sh'],
  detectionPatterns: [
    { pattern: /^#!\/bin\/sh/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+sh/, weight: 2 },
    { pattern: /^#!\/bin\/bash/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+bash/, weight: 2 },
    { pattern: /^#!\/bin\/ksh/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+ksh/, weight: 2 },
    { pattern: /^#!\/bin\/zsh/, weight: 2 },
    { pattern: /^#!\/usr\/bin\/env\s+zsh/, weight: 2 },
    { pattern: /^\s*case\s+\w+\s+in/, weight: 1 },
    { pattern: /^\s*if\s+\[/, weight: 1 },
    { pattern: /^\s*#!/, weight: 1 }, // Generic shebang
  ],
};
