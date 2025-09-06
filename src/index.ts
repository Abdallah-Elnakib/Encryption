import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load patterns JSON from the package root (one level up from compiled dist)
const patternsPath = path.resolve(__dirname, '..', 'fixed_patterns.json');
const patternsRaw = fs.readFileSync(patternsPath, 'utf-8');
const patterns: Record<string, string[]> = JSON.parse(patternsRaw);

const getDeterministicIndex = (input: string, max: number): number => {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  return num % max;
};

export const encrypt = (text: string, secretKey: string): string => {
  let encryptedText = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const options = patterns[char];
    if (Array.isArray(options) && options.length > 0) {
      const index = getDeterministicIndex(secretKey + char + i, options.length);
      encryptedText += options[index];
    } else {
      encryptedText += char;
    }
  }
  return encryptedText;
};

export const verifyEncryption = (
  encryptedText: string,
  originalText: string,
  secretKey: string
): boolean => {
  let i = 0;
  for (let j = 0; j < originalText.length; j++) {
    const char = originalText[j];
    const options = patterns[char];
    if (!options || options.length === 0) return false;

    const index = getDeterministicIndex(secretKey + char + j, options.length);
    const pattern = options[index];

    if (encryptedText.startsWith(pattern, i)) {
      i += pattern.length;
    } else {
      return false;
    }
  }
  return i === encryptedText.length;
};



export default { encrypt, verifyEncryption };
