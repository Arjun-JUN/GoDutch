const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all packages in the monorepo so hot reload works when you edit a package
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then the workspace root
//    This prevents the "two instances of React" error
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Map workspace package names to their TypeScript source
//    Metro reads source directly — no build step needed
config.resolver.extraNodeModules = {
  '@godutch/commons': path.resolve(workspaceRoot, 'packages/commons/src'),
  '@godutch/slate': path.resolve(workspaceRoot, 'packages/slate/src'),
  '@godutch/dutch': path.resolve(workspaceRoot, 'packages/dutch/src'),
  '@godutch/crew': path.resolve(workspaceRoot, 'packages/crew/src'),
  '@godutch/ledger': path.resolve(workspaceRoot, 'packages/ledger/src'),
};

module.exports = config;
