module.exports = {
  transform: {
    '^.+\\.ts?$': ['@swc/jest'],
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/test/*.test.ts'],
};
