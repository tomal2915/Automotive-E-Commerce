export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  testTimeout: 15000, // in-memory MongoDB startup can be slow on first run
};
