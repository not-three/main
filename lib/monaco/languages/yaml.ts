import type { LanguageDefinition } from '../types';

export const YamlDefinition: LanguageDefinition = {
  id: 'yaml',
  extensions: ['.yml', '.yaml'],
  aliases: ['YAML', 'yaml'],
  mimeTypes: ['text/x-yaml'],
  loader: async () => import('./yaml.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^[\s\n]*---/, weight: 2 },
    { pattern: /^[\s\n]*[\w-]+:\s*[|\[{]?/, weight: 1 },
    { pattern: /^[\s\n]*-\s+\w+:\s/, weight: 1 },
  ],
};
