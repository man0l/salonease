const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to identify translatable text
const TEXT_PATTERNS = {
  jsx: {
    // Improved label pattern to avoid capturing code
    label: /(?<=<label[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/label>)/g,
    // Improved button pattern to avoid capturing code
    button: /(?<=<button[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/button>)/g,
    // Capture text content more precisely
    text: /(?<=>)\s*([^<>{}\n]+?)\s*(?=<)/g,
  },
  props: {
    // More specific prop patterns
    placeholder: /placeholder=["']([^"'{}]+)["']/g,
    title: /title=["']([^"'{}]+)["']/g,
    'aria-label': /aria-label=["']([^"'{}]+)["']/g,
    alt: /alt=["']([^"'{}]+)["']/g
  },
  messages: {
    // Improved toast pattern to capture the message part only
    toast: /toast\.[^(]+\(["']([^"']+)["']\)/g,
    // Improved error pattern to avoid capturing code
    error: /(?<!\/\/).*?new Error\(["']([^"']+)["']\)/g,
    // Improved validation pattern
    validation: /message:\s*["']([^"']+)["']/g
  },
  test: {
    // More precise test patterns
    getByText: /getByText\(\/([^\/]+)\/i?\)/g,
    getByLabelText: /getByLabelText\(["']([^"']+)["']\)/g,
    getByRole: /getByRole\([^,]+,\s*{\s*name:\s*\/([^\/]+)\/i?\s*}\)/g
  }
};

function shouldTranslateText(text) {
  if (!text?.trim()) return false;
  
  const ignorePatterns = [
    // Code patterns
    /^[a-z]+[A-Z]/,  // camelCase
    /^[A-Z][a-z]+[A-Z]/,  // PascalCase
    /^[A-Z][A-Z0-9_]+$/,  // CONSTANTS
    /^[a-z0-9\-_]+$/,  // kebab-case or snake_case
    /^\.\.\./,  // spread operator
    /^[{}[\]()]/,  // brackets
    /^[a-z]+:/,  // object keys
    /=>/,  // arrow functions
    
    // Framework/library specific
    /^use[A-Z]/,  // React hooks
    /^on[A-Z]/,  // Event handlers
    /^handle[A-Z]/,  // Event handlers
    /^import\s/,  // imports
    /^export\s/,  // exports
    /^const\s/,  // declarations
    /^let\s/,  // declarations
    /^var\s/,  // declarations
    /^function\s/,  // functions
    
    // Data patterns
    /^\d+$/,  // numbers
    /^[a-f0-9-]{36}$/,  // UUIDs
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // emails
    
    // Template literals
    /\${.*?}/,
    /\{\{.*?\}\}/
  ];

  return !ignorePatterns.some(pattern => pattern.test(text));
}

function cleanTranslationText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n/g, '')
    .replace(/\s*\{.*?\}\s*/g, '')
    .replace(/\s*\$\{.*?\}\s*/g, '');
}

function generateTranslationKey(text) {
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const keyMappings = {
    error: {
      pattern: /error|failed|invalid|incorrect/i,
      prefix: 'error'
    },
    success: {
      pattern: /success|completed|updated|added|saved|deleted/i,
      prefix: 'success'
    },
    action: {
      pattern: /^(click|tap|press|submit|save|delete|cancel|confirm|add|edit|update)/i,
      prefix: 'action'
    },
    label: {
      pattern: /(name|email|phone|address|password|description)(:)?$/i,
      prefix: 'label'
    },
    title: {
      pattern: /management|dashboard|overview|list|form/i,
      prefix: 'title'
    },
    message: {
      pattern: /please|would you|are you sure|confirm/i,
      prefix: 'message'
    }
  };

  for (const [, {pattern, prefix}] of Object.entries(keyMappings)) {
    if (pattern.test(text)) {
      return `${prefix}.${cleanText}`;
    }
  }

  return cleanText;
}

function extractTextFromComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const extractedTexts = new Set();
  
  Object.entries(TEXT_PATTERNS).forEach(([, patterns]) => {
    Object.entries(patterns).forEach(([, pattern]) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const text = match[1];
        if (shouldTranslateText(text)) {
          extractedTexts.add(text);
        }
      }
    });
  });
  
  return Array.from(extractedTexts);
}

function shouldProcessFile(filePath) {
  // Skip test files when processing components
  if (filePath.includes('__tests__') || filePath.endsWith('.test.js')) {
    return false;
  }
  return true;
}

function getComponentGroup(componentPath) {
  const groupMappings = {
    'Auth': ['Login', 'Register', 'ForgotPassword', 'VerifyEmail'],
    'Salon': ['SalonManagement', 'ServiceManagement', 'StaffManagement', 'ServiceCategories'],
    'Bookings': ['BookingsManagement', 'BookingForm', 'BookingCalendar'],
    'Clients': ['ClientsManagement', 'ClientForm', 'ClientList']
  };

  const componentName = path.basename(componentPath, path.extname(componentPath))
    .replace('.test', '');

  for (const [group, components] of Object.entries(groupMappings)) {
    if (components.includes(componentName)) {
      return group.toLowerCase();
    }
  }

  return 'common';
}

function processComponent(componentPath) {
  const componentGroup = getComponentGroup(componentPath);
  const frontendDir = path.resolve(process.cwd(), 'salonease-mvp/frontend');
  const localesDir = path.join(frontendDir, 'public/locales/en');
  const translationFile = path.join(localesDir, `${componentGroup}.json`);
  
  const extractedTexts = extractTextFromComponent(componentPath);
  if (extractedTexts.length === 0) {
    return;
  }

  // Load existing translations if file exists
  let translations = {};
  if (fs.existsSync(translationFile)) {
    translations = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
  }

  // Add new translations
  extractedTexts.forEach(text => {
    const key = generateTranslationKey(text);
    if (!translations[key]) {
      translations[key] = text;
    }
  });

  fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2));
  console.log(`Updated translations for ${componentGroup}`);
}

function main() {
  // Get the absolute path to the frontend directory
  const frontendDir = path.resolve(process.cwd(), 'salonease-mvp/frontend');
  const componentsDir = path.join(frontendDir, 'src/components');
  
  console.log(`Searching for components in ${componentsDir}`);
  
  // Find all component files
  const componentFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: componentsDir,
    ignore: ['**/*.test.*', '**/*.spec.*', '**/index.*', '**/__tests__/**']
  }).map(file => path.join(componentsDir, file));
  
  // Process each component
  componentFiles.forEach(file => {
    processComponent(file);
  });
}

main();

