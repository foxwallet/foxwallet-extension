const path = require("path");
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "standard-with-typescript",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./packages/**/tsconfig.json"],
  },
  plugins: ["react"],
  rules: {
    "@typescript-eslint/no-unused-vars": 1,
  },
  includes: [path.resolve(__dirname, "./packages/**/*")],
  settings: {
    react: {
      version: "detect",
    },
  },
};
