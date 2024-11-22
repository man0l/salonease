const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to find potentially untranslated text
const TEXT_PATTERNS = {
  jsx: {
    label: /(?<=<label[^>]*>)\s*([^<>{}\n]+?)(:)?\s*(?=<\/label>)/g,
    button: /(?<=<button[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/button>)/g,
    heading: /(?<=<h[1-6][^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/h[1-6]>)/g,
    text: /(?<=<(?:div|span|p)[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/(?:div|span|p)>)/g,
    placeholder: /placeholder=["']([^"'{}]+?)["']/g,
    'aria-label': /aria-label=["']([^"'{}]+?)["']/g,
    title: /title=["']([^"'{}]+?)["']/g
  },
  messages: {
    toast: /toast\.(success|error|info|warning)\(\s*["']([^"']+?)["']\s*\)/g,
    validation: /(?:message|error):\s*["']([^"']+?)["']/g
  }
};

// Pattern to identify already translated strings
const TRANSLATION_PATTERN = /\{?\s*t\(['"]([^'"]+)['"](,\s*\{[^}]+\})?\)\s*\}?/g;

function shouldBeTranslated(text) {
  if (!text?.trim()) return false;

  const ignorePatterns = [
    /^[a-z]+[A-Z]/,  // camelCase
    /^[A-Z][a-z]+[A-Z]/,  // PascalCase
    /^[A-Z][A-Z0-9_]+$/,  // CONSTANTS
    /^[a-z0-9\-_]+$/,  // kebab-case or snake_case
    /^\d+$/,  // numbers
    /^[a-f0-9-]{36}$/,  // UUIDs
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // emails
    /\${.*?}/,  // template literals
    /\{\{.*?\}\}/  // template expressions
  ];

  return !ignorePatterns.some(pattern => pattern.test(text));
}

function findUntranslatedStrings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const untranslated = new Set();

    // Find all text that matches our patterns
    Object.entries(TEXT_PATTERNS).forEach(([category, patterns]) => {
      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = Array.from(content.matchAll(pattern));
        matches.forEach(match => {
          // For toast messages, the text is in the second capture group
          const text = type === 'toast' ? match[2] : match[1];
          
          if (text && shouldBeTranslated(text)) {
            // Check if this text is already translated
            const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const translationPattern = new RegExp(`t\\(['"][^'"]*${escapedText}[^'"]*['"]\\)`);
            
            if (!translationPattern.test(content)) {
              untranslated.add({
                text,
                category,
                type
              });
            }
          }
        });
      });
    });

    return Array.from(untranslated);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return [];
  }
}

// Main execution
try {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  
  if (!fs.existsSync(componentsDir)) {
    throw new Error(`Components directory not found: ${componentsDir}`);
  }

  console.log(`Scanning for untranslated strings in ${componentsDir}`);
  
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: componentsDir,
    ignore: ['**/*.test.*', '**/*.spec.*', '**/index.*', '**/__tests__/**']
  });

  let totalUntranslated = 0;

  files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const untranslatedStrings = findUntranslatedStrings(filePath);
    
    if (untranslatedStrings.length > 0) {
      console.log(`\n${file}:`);
      untranslatedStrings.forEach(({ text, category, type }) => {
        console.log(`  - "${text}" (${category}.${type})`);
        totalUntranslated++;
      });
    }
  });

  console.log(`\nFound ${totalUntranslated} untranslated strings in ${files.length} components`);
} catch (error) {
  console.error('Error running script:', error.message);
  process.exit(1);
}