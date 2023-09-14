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
  rules: {},
  settings: {},
};
