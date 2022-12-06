const tsconfig = require('./tsconfig.json');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/**/*.interface.ts',
    '!<rootDir>/**/*.dto.ts',
    '!<rootDir>/**/*.enum.ts',
    '!<rootDir>/**/*.schema.ts',
    '!<rootDir>/**/*.mock.ts',
    '!<rootDir>/**/*.module.ts',
    '!<rootDir>/**/__mocks__/*',
    '!<rootDir>/**/test/*',
    '!<rootDir>/**/test/**/*',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/database/**/*',
    '!<rootDir>/src/scripts/*',
  ],
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true,
};
