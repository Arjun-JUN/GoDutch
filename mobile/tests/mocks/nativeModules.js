const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');

// Expo's jest-expo setup.js expects .default to exist on this require
// In newer RN versions, it doesn't, so we provide an interop mock.
const interopMock = {
  ...NativeModules,
  UIManager: NativeModules.UIManager || {},
  NativeUnimoduleProxy: NativeModules.NativeUnimoduleProxy || { viewManagersMetadata: {} },
};

module.exports = {
  ...interopMock,
  default: interopMock
};
