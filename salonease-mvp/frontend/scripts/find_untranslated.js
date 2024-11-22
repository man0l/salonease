const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Reuse patterns from extract_translations.js
const TEXT_PATTERNS = {
  jsx: {
    label: /(?<=<label[^>]*>)\s*([^<>{}\n]+?)(:)?\s*(?=<\/label>)/g,
    button: /(?<=<button[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/button>)/g,
    heading: /(?<=<h[1-6][^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/h[1-6]>)/g,
    labelLike: /(?<=<(?:div|span)[^>]*>)\s*([^<>{}\n]+?:)\s*(?=<\/(?:div|span)>)/g,
    tableHeader: /(?<=<th[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/th>)/g,
    tableCell: /(?<=<td[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/td>)/g,
    listItem: /(?<=<li[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/li>)/g,
    generalText: /(?<=<p[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/p>)/g,
    placeholderText: /placeholder=["']([^"'{}]+?)["']/g
  },
  props: {
    placeholder: /placeholder=["']([^"'{}]+?)["']/g,
    'aria-label': /aria-label=["']([^"'{}]+?)["']/g,
    title: /title=["']([^"'{}]+?)["']/g,
    alt: /alt=["']([^"'{}]+?)["']/g
  },
  messages: {
    toast: /toast\.(success|error|info|warning)\(\s*["']([^"']+?)["']\s*\)/g,
    validation: /(?:message|error):\s*["']([^"']+?)["']/g,
    confirmation: /confirm\(\s*["']([^"']+?)["']\s*\)/g
  }
};

// Pattern to identify translated strings
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

function findUntranslatedStrings(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const untranslated = new Set();
    const translatedKeys = new Set();

    // First collect all translated keys
    const translationMatches = content.matchAll(TRANSLATION_PATTERN);
    for (const match of translationMatches) {
      translatedKeys.add(match[1]);
    }

    // Then find potentially untranslated strings
    Object.entries(TEXT_PATTERNS).forEach(([type, patterns]) => {
      Object.entries(patterns).forEach(([name, pattern]) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const text = match[1];
          if (text && shouldBeTranslated(text) && !isTranslated(text, content)) {
            untranslated.add({
              text,
              type,
              pattern: name
            });
          }
        }
      });
    });

    return Array.from(untranslated);
  } catch (error) {
    console.error(`Error processing file ${componentPath}:`, error);
    return [];
  }
}

function isTranslated(text, content) {
  // Check if the text is wrapped in a translation function
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const translationPattern = new RegExp(`t\\(['"][^'"]*${escapedText}[^'"]*['"]\\)`);
  return translationPattern.test(content);
}

function main() {
  const frontendDir = path.resolve(process.cwd(), 'salonease-mvp/frontend');
  const componentsDir = path.join(frontendDir, 'src/components');
  
  console.log(`Scanning for untranslated strings in ${componentsDir}`);
  
  const componentFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: componentsDir,
    ignore: ['**/*.test.*', '**/*.spec.*', '**/index.*', '**/__tests__/**']
  }).map(file => path.join(componentsDir, file));

  let totalUntranslated = 0;
  
  componentFiles.forEach(file => {
    const untranslatedStrings = findUntranslatedStrings(file);
    if (untranslatedStrings.length > 0) {
      const relativePath = path.relative(frontendDir, file);
      console.log(`\n${relativePath}:`);
      untranslatedStrings.forEach(({ text, type, pattern }) => {
        console.log(`  - "${text}" (${type}.${pattern})`);
        totalUntranslated++;
      });
    }
  });

  console.log(`\nFound ${totalUntranslated} untranslated strings in ${componentFiles.length} components`);
}

main(); 