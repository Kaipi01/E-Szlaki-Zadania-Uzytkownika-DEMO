import globals from "globals";
import pluginJs from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: { jsdoc },
    rules: {
      "no-unused-vars": "warn", 
      "no-unused-properties": "warn",
      "no-unused-expressions": "warn",
      "no-unused-methods": "warn",
      "no-console": "warn",
      "no-undef": "disabled",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-type": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-types": "error",
    },
  },
  pluginJs.configs.recommended,
];
