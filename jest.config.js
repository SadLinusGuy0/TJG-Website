const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
};

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  // npm can hoist these ESM dependencies or nest them under sanitize-html.
  // Allow transformation at either depth so tests exercise the real sanitizer.
  config.transformIgnorePatterns = ['/node_modules/(?!(?:.*?/node_modules/)?(?:htmlparser2|domhandler|domutils|domelementtype|entities|dom-serializer)/)', '^.+\\.module\\.(css|sass|scss)$'];
  return config;
};
