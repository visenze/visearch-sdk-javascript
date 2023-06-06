const config = {
  verbose: true,
  testMatch: ['<rootDir>/test/**'],
  testPathIgnorePatterns: ['<rootDir>/test/mock', '<rootDir>/test/setup'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/setup/setup.js'],
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  extensionsToTreatAsEsm: ['.ts']
};

module.exports = config;
