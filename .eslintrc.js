const path = require("path");
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["standard-with-typescript", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: [path.resolve(__dirname, "./packages/chrome/tsconfig.json")],
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-extraneous-class": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/consistent-type-assertions": "warn",
  },
  settings: {},
};
