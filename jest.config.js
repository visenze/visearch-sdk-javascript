const config = {
  verbose: true,
  testMatch: ['<rootDir>/test/**'],
  testPathIgnorePatterns: ['<rootDir>/test/mock', '<rootDir>/test/setup'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setup/setup.js'],
};

module.exports = config;
