module.exports = {
  testEnvironment: 'node',
  
  testMatch: ['**/__tests__/**/*.spec.js'],

  clearMocks: true,
  
  setupFilesAfterEnv: [
    './__tests__/config/setup-env.js',
    './__tests__/config/setup-console-mocks.js'
  
  ],

  testTimeout: 30000,

  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
};