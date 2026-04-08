/* eslint-disable @typescript-eslint/no-require-imports */

// Test setup for @testing-library/react-native
// Add global mocks and configuration here as needed

// @ts-expect-error -- jest globals available at test runtime
// eslint-disable-next-line no-undef
const jestMock = jest

jestMock.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)
