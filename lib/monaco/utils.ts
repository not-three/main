import { languageDefinitions } from './languages';

interface DetectionResult {
  languageId: string;
  score: number;
}

export function detectLanguageFromContent(content: string): string {
  if (!content.trim()) return 'plaintext';

  const results: DetectionResult[] = languageDefinitions
    .filter(lang => lang.detectionPatterns && lang.detectionPatterns.length > 0)
    .map(lang => {
      const score = lang.detectionPatterns!.reduce((total, { pattern, weight = 1 }) => {
        // Test against the whole content, not just the beginning
        const matches = (content.match(pattern) || []).length;
        return total + (matches * weight);
      }, 0);

      return {
        languageId: lang.id,
        score
      };
    });

  // Sort by score in descending order
  results.sort((a, b) => b.score - a.score);

  // Return the language with the highest score, or plaintext if no matches
  const res =  results.length > 0 && results[0].score > 0 
    ? results[0].languageId 
    : 'plaintext';
  console.log('Detected language:', res);
  return res;
}

// Debounce function for language detection
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
