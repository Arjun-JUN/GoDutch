module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop)"
  ],
  moduleNameMapper: {
    "expo/src/winter/(.*)": "<rootDir>/tests/mocks/emptyMock.js",
    "^react-native/Libraries/BatchedBridge/NativeModules$": "<rootDir>/tests/mocks/nativeModules.js"
  }
};
