module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(twilio)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'json'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000
}; 