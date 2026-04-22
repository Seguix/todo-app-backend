module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
    "/generated/**/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "import/no-unresolved": 0,
    "max-len": ["error", {"code": 120, "ignoreUrls": true}],
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "new-cap": "off",
    "object-curly-spacing": ["error", "never"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {"argsIgnorePattern": "^_", "varsIgnorePattern": "^_"},
    ],
  },
};
