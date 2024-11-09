import type { LanguageDefinition } from '../types';

export const PhpDefinition: LanguageDefinition = {
  id: 'php',
  extensions: ['.php', '.phtml', '.php3', '.php4', '.php5', '.php7', '.php8'],
  aliases: ['PHP', 'php'],
  mimeTypes: ['application/x-php'],
  detectionPatterns: [
    { pattern: /^<\?php/, weight: 2 },
    { pattern: /<\?=.*\?>/, weight: 1 },
  ],
};
