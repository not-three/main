import type { LanguageDefinition } from '../types';

export const PlaintextDefinition: LanguageDefinition = {
  id: 'plaintext',
  extensions: ['.txt'],
  aliases: ['Plaintext', 'text', 'plain'],
  mimeTypes: ['text/plain'],
  detectionPatterns: []
};
