import type { Config } from "@jest/types";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

const esModules = ["nuqs"].join("|");

// Add any custom config to be passed to Jest
const config: Config.InitialOptions = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Test environment configuration
  testEnvironment: "<rootDir>/test/FixJSDOMEnvironment.ts",

  transform: {
    "^.+\\.(js|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "utils/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!app/layout.tsx", // Skip layouts
    "!app/**/layout.tsx",
    "!app/globals.css",
  ],

  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 26,
      functions: 29,
      lines: 31,
      statements: 31,
    },
  },

  // Test file patterns
  testMatch: ["<rootDir>/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}"],

  // Directories to ignore
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
//export default createJestConfig(config);
const jestConfig = async () => ({
  ...(await createJestConfig(config)()),
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
});

export default jestConfig;
