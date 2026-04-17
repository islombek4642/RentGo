import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../locales');
const supportedLangs = ['uz', 'ru', 'en'];
const defaultLang = 'uz';

const translations = {};

// Load translations on startup
try {
  supportedLangs.forEach((lang) => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  });
} catch (error) {
  logger.error('Failed to load translations:', error);
}

/**
 * Translate a key into the given language
 * @param {string} lang - The language code (uz, ru, en)
 * @param {string} keyPath - The path to the key (e.g., 'auth.login_success')
 * @returns {string} - The translated string or the key itself if not found
 */
export const t = (lang, keyPath) => {
  const normalizeLang = supportedLangs.includes(lang) ? lang : defaultLang;
  
  const keys = keyPath.split('.');
  let result = translations[normalizeLang];

  // Traverse the keys
  for (const key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      // Fallback logic: if key missing in requested lang, try default lang
      if (normalizeLang !== defaultLang) {
        return t(defaultLang, keyPath);
      }
      return keyPath; // Return key if not found in default lang
    }
  }

  return result;
};
