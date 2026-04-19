module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    // Transform react-native, expo and related packages (handles both flat and
    // pnpm's .pnpm/<pkg>@<version>/node_modules/<pkg> directory layout).
    "node_modules/(?!(.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop))"
  ],
  moduleNameMapper: {
    "expo/src/winter/(.*)": "<rootDir>/tests/mocks/emptyMock.js",
    "^react-native/Libraries/BatchedBridge/NativeModules$": "<rootDir>/tests/mocks/nativeModules.js"
  }
};
