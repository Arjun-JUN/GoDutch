try {
  const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
  console.log('NativeModules keys:', Object.keys(NativeModules));
  console.log('NativeModules.default:', NativeModules.default);
  console.log('Type of NativeModules.default:', typeof NativeModules.default);
} catch (e) {
  console.error('Error requiring NativeModules:', e.message);
}
