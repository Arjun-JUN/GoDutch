/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@godutch/commons$': '<rootDir>/../../packages/commons/src/index.ts',
    '^@godutch/commons/(.*)$': '<rootDir>/../../packages/commons/src/$1',
    '^@godutch/slate$': '<rootDir>/../../packages/slate/src/index.ts',
    '^@godutch/slate/(.*)$': '<rootDir>/../../packages/slate/src/$1',
    '^@godutch/dutch$': '<rootDir>/../../packages/dutch/src/index.ts',
    '^@godutch/crew$': '<rootDir>/../../packages/crew/src/index.ts',
    '^@godutch/ledger$': '<rootDir>/../../packages/ledger/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true } }],
  },
};
