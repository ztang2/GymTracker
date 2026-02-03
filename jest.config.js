module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^@sentry/react-native$': '<rootDir>/__mocks__/sentry.ts',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.ts',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.ts',
    '^expo-device$': '<rootDir>/__mocks__/expo-device.ts',
  },
  setupFiles: ['<rootDir>/__mocks__/setup.ts'],
};
