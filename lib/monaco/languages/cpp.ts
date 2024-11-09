import type { LanguageDefinition } from '../types';

export const CppDefinition: LanguageDefinition = {
  id: 'cpp',
  extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
  aliases: ['C++', 'cpp'],
  mimeTypes: ['text/x-c++src'],
  loader: async () => import('./cpp.async').then(module => ({
    configuration: module.configuration,
    tokenizer: module.tokenizer,
  })),
  detectionPatterns: [
    { pattern: /^\s*#include\s+<.*>/, weight: 2 },
    { pattern: /^\s*(class|struct)\s+\w+/, weight: 2 },
    { pattern: /^\s*template\s*<.*>/, weight: 1 },
  ],
};
