const path = require("path");
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  plugins: ["react", "react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: [path.resolve(__dirname, "./tsconfig.json")],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
