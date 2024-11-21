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
    listItem: /(?<=<li[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/li>)/g,
    // Add new patterns for general text content
    generalText: /(?<=<p[^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/p>)/g,
    // Enhanced heading pattern to capture h2/h3 with classes
    heading: /(?<=<h[1-6][^>]*>)\s*([^<>{}\n]+?)\s*(?=<\/h[1-6]>)/g,
    // Pattern for text with required asterisk
    requiredField: /(?<=>)[^<>]*?<span[^>]*text-red-500[^>]*>\s*\*\s*<\/span>/g,
    // Pattern for loading/state text
    conditionalText: /(?<=\{)\s*loading\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]\s*(?=\})/g,
    // Pattern for error messages
    errorText: /(?<=toast\.error\()\s*['"]([^'"]+)['"]\s*(?=\))/g,
    // Pattern for placeholder text
    placeholderText: /placeholderText=["']([^"'{}]+?)["']/g,
    // Pattern for service details
    serviceDetails: /(?<=<p[^>]*>)(Duration:|Price:)\s*\{[^}]+\}(?=<\/p>)/g
  },
  props: {
    // Capture only user-facing prop text
    placeholder: /placeholder=["']([^"'{}]+?)["']/g,
    'aria-label': /aria-label=["']([^"'{}]+?)["']/g,
    title: /title=["']([^"'{}]+?)["']/g,
    // Add patterns for staff-specific attributes
    alt: /alt=["']([^"'{}]+?)["']/g,
    'data-testid': /data-testid=["']([^"'{}]+?)["']/g,
    // Add pattern for aria-required
    'aria-required': /aria-required=["']([^"'{}]+?)["']/g,
    // Add pattern for error messages in data attributes
    'data-error': /data-error=["']([^"'{}]+?)["']/g
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
    alert: /alert\(["']([^"']+?)["']\)/g,
    // Add pattern for validation messages
    validationError: /errors\.[a-zA-Z]+\.message/g,
    // Add pattern for toast messages with template literals
    toastTemplate: /toast\.(error|success|info|warning)\(`([^`]+)`\)/g,
    // Capture Yup validation messages
    yupMessages: {
      // Direct validation messages
      required: /\.required\(['"]([^'"]+)['"]\)/g,
      email: /\.email\(['"]([^'"]+)['"]\)/g,
      min: /\.min\(\d+,\s*['"]([^'"]+)['"]\)/g,
      max: /\.max\(\d+,\s*['"]([^'"]+)['"]\)/g,
      matches: /\.matches\([^,]+,\s*['"]([^'"]+)['"]\)/g,
      oneOf: /\.oneOf\(\[[^\]]+\],\s*['"]([^'"]+)['"]\)/g,
      
      // Test validation messages
      test: /\.test\([^,]+,\s*['"]([^'"]+)['"]/g,
      
      // Schema validation messages from validation schemas file
      schemaMessages: /export const \w+Schema = yup\.(?:string|object)\(\)(?:\s*\.\s*[a-zA-Z]+\([^)]*\))*\s*\.\s*[a-zA-Z]+\(['"]([^'"]+)['"]\)/g,
    },
    
    // Component-level schema validations
    componentSchema: {
      // Direct schema definitions in components
      inlineSchema: /const schema = yup\.object\(\)\.shape\({[\s\S]*?}\);/g,
      
      // Schema validation messages
      messages: /['"]([^'"]+)['"]\s*(?:,\s*{|$)/g
    }
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

  if (text.includes('${')) {
    // Extract static parts of template literals
    return true;
  }

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

function extractTextFromComponent(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const texts = new Set();

    // Process each pattern type
    Object.entries(TEXT_PATTERNS).forEach(([type, patterns]) => {
      Object.entries(patterns).forEach(([name, pattern]) => {
        if (typeof pattern === 'object' && !pattern.test) {
          // Skip nested pattern objects (like yupMessages)
          return;
        }
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const text = match[1];
          if (text && shouldTranslateText(text)) {
            texts.add(text);
          }
        }
      });
    });

    return Array.from(texts);
  } catch (error) {
    console.error(`Error processing file ${componentPath}:`, error);
    return [];
  }
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
    'Layout': [
      'Sidebar',
      'Header',
      'Footer',
      'SearchInput',
      'Navigation',
      'SalonSelector'
    ],
    'Dashboard': [
      'AdminDashboard',
      'StaffDashboard',      // Reference: StaffDashboard.js lines 6-99
      'SalonOwnerDashboard', // Reference: SalonOwnerDashboard.js lines 8-97
      'DashboardStats',
      'ActivityFeed'
    ],
    'Legal': [
      'Terms',
      'PrivacyPolicy',
      'CookiePolicy'
    ],
    'Auth': [
      'Login',
      'Register',
      'ForgotPassword',
      'VerifyEmail'
    ],
    'Salon': [
      'SalonManagement',
      'ServiceManagement',
      'StaffManagement',     // Reference: StaffManagement.js lines 14-193
      'ServiceCategories',
      'Staff',
      'StaffList',
      'StaffForm',
      'StaffAvailability',   // Reference: StaffAvailability.js lines 24-188
      'PublicSalonPage'      // Reference: PublicSalonPage.js lines 93-116
    ],
    'Bookings': [
      'BookingsManagement',  // Reference: BookingsManagement.js lines 20-498
      'BookingForm',
      'BookingCalendar',
      'BookingSuccess',
      'RescheduleModal',
      'CancelBookingModal',
      'ReassignStaffModal',
      'UnauthorizedBookingModal'
    ],
    'Modals': [
      'DeleteConfirmationDialog',
      'ConfirmationModal',
      'AddAvailabilityModal',
      'ErrorModal',
      'SuccessModal'
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
      'ClientProfile',
      'ClientHistory'
    ],
    'Settings': [
      'ProfileSettings',
      'SalonSettings',
      'NotificationSettings',
      'SecuritySettings'
    ],
    'Common': [
      'Pagination',
      'SearchInput',
      'FilterBar',
      'SortSelect',
      'LoadingSpinner'
    ]
  };

  // Directory mappings for specific paths
  const directoryMappings = {
    'components': 'common',
    'Layout': 'layout',
    'Dashboard': 'dashboard',
    'Legal': 'legal',
    'Auth': 'auth',
    'Salon': 'salon',
    'Bookings': 'bookings',
    'Modals': 'common',
    'Reports': 'reports',
    'Clients': 'clients',
    'Settings': 'settings'
  };

  const dirName = path.basename(path.dirname(componentPath));
  const fileName = path.basename(componentPath, path.extname(componentPath))
    .replace('.test', '');

  // First check directory mapping
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
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const componentGroup = getComponentGroup(componentPath);
    const frontendDir = path.resolve(process.cwd(), 'salonease-mvp/frontend');
    const localesDir = path.join(frontendDir, 'public/locales/en');
    
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }
    
    const translationFile = path.join(localesDir, `${componentGroup}.json`);
    
    // Extract regular texts and validation messages
    const extractedTexts = extractTextFromComponent(componentPath);
    const validationMessages = extractYupValidationMessages(content);
    
    if (extractedTexts.length === 0 && validationMessages.length === 0) return;

    // Load existing translations
    let translations = {};
    if (fs.existsSync(translationFile)) {
      translations = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
    }

    // Add regular texts
    extractedTexts.forEach(text => {
      const key = generateTranslationKey(text);
      if (!translations[key]) {
        translations[key] = text;
      }
    });

    // Add validation messages with prefix
    validationMessages.forEach(([type, text]) => {
      const key = generateTranslationKey(text, type);
      if (!translations[key]) {
        translations[key] = text;
      }
    });

    fs.writeFileSync(translationFile, JSON.stringify(translations, null, 2));
    console.log(`Updated translations for ${componentGroup}: ${componentPath}`);
  } catch (error) {
    console.error(`Error processing component ${componentPath}:`, error);
  }
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

function extractYupValidationMessages(content) {
  const messages = new Set();

  // Process validation schemas file
  if (content.includes('export const') && content.includes('yup.')) {
    const schemaMatches = content.match(TEXT_PATTERNS.messages.yupMessages.schemaMessages);
    if (schemaMatches) {
      schemaMatches.forEach(match => {
        const message = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (message) messages.add(['yupMessages', message]);
      });
    }
  }

  // Process component-level schemas
  const schemaBlocks = content.match(/const schema = yup\.object\(\)\.shape\({[\s\S]*?}\);/g);
  if (schemaBlocks) {
    schemaBlocks.forEach(block => {
      const messageRegexes = [
        /\.required\(['"]([^'"]+)['"]\)/g,
        /\.email\(['"]([^'"]+)['"]\)/g,
        /\.min\(\d+,\s*['"]([^'"]+)['"]\)/g,
        /\.max\(\d+,\s*['"]([^'"]+)['"]\)/g,
        /\.matches\([^,]+,\s*['"]([^'"]+)['"]\)/g,
        /\.oneOf\(\[[^\]]+\],\s*['"]([^'"]+)['"]\)/g,
        /\.positive\(['"]([^'"]+)['"]\)/g,
        /\.test\([^,]+,\s*['"]([^'"]+)['"]\)/g
      ];

      messageRegexes.forEach(regex => {
        const matches = block.matchAll(regex);
        for (const match of matches) {
          if (match[1]) messages.add(['yupMessages', match[1]]);
        }
      });
    });
  }

  return Array.from(messages);
}

main();

