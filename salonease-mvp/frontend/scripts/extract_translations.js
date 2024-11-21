const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to identify translatable text
const TEXT_PATTERNS = {
  jsx: {
    // Capture label text with colon handling
    label: /(?<=<label[^>]*>)\s*([^<>{}\n]+?)(:)?\s*(?=<\/label>)/g,
    // Capture button text without newlines
    button: /(?<=<button[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/button>)/g,
    // Capture heading text
    heading: /(?<=<h[1-6][^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/h[1-6]>)/g,
    // Capture specific div/span text that looks like labels
    labelLike: /(?<=<(?:div|span)[^>]*>)\s*([^<>{}\n]+?:)\s*(?=<\/(?:div|span)>)/g,
    // Add patterns for staff-specific content
    tableHeader: /(?<=<th[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/th>)/g,
    tableCell: /(?<=<td[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/td>)/g,
    listItem: /(?<=<li[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/li>)/g
  },
  props: {
    // Capture only user-facing prop text
    placeholder: /placeholder=["']([^"'{}]+?)["']/g,
    'aria-label': /aria-label=["']([^"'{}]+?)["']/g,
    title: /title=["']([^"'{}]+?)["']/g,
    // Add patterns for staff-specific attributes
    alt: /alt=["']([^"'{}]+?)["']/g,
    'data-testid': /data-testid=["']([^"'{}]+?)["']/g
  },
  messages: {
    // Capture toast messages
    toast: /toast\.(success|error|info|warning)\(\s*["']([^"']+?)["']\s*\)/g,
    // Capture validation messages
    validation: /(?:message|error):\s*["']([^"']+?)["']/g,
    // Capture confirmation messages
    confirmation: /confirm\(\s*["']([^"']+?)["']\s*\)/g,
    // Add patterns for staff-specific messages
    modal: /setModalMessage\(["']([^"']+?)["']\)/g,
    alert: /alert\(["']([^"']+?)["']\)/g
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
    'Salon': [
      'SalonManagement', 
      'ServiceManagement', 
      'StaffManagement', 
      'ServiceCategories',
      'Staff',
      'StaffList',
      'StaffForm',
      'StaffAvailability',
      'PublicSalonPage',
      'StaffProfile'
    ],
    'Bookings': [
      'BookingsManagement', 
      'BookingForm', 
      'BookingCalendar',
      'BookingSuccess',
      'RescheduleModal',
      'CancelBookingModal',
      'ReassignStaffModal',
      'CreateBookingModal'
    ],
    'Modals': [
      'UnauthorizedBookingModal',
      'AddAvailabilityDialog',
      'ConfirmationModal',
      'DeleteConfirmationModal'
    ],
    'Reports': [
      'FinancialReports',
      'BookingReports',
      'StaffPerformance',
      'ServiceAnalytics'
    ],
    'Clients': [
      'ClientsManagement', 
      'ClientForm', 
      'ClientList',
      'ClientProfile'
    ]
  };

  // Check both the directory name and file name
  const dirName = path.basename(path.dirname(componentPath));
  const fileName = path.basename(componentPath, path.extname(componentPath))
    .replace('.test', '');

  // First check if the file is in a specific component directory
  const directoryMappings = {
    'Salon': 'salon',
    'Bookings': 'bookings',
    'Modals': 'common',
    'Reports': 'reports',
    'Clients': 'clients'
  };

  if (directoryMappings[dirName]) {
    return directoryMappings[dirName];
  }

  // Then check component mappings
  for (const [group, components] of Object.entries(groupMappings)) {
    if (components.includes(fileName)) {
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

