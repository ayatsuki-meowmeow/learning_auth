import { config } from "@repo/eslint-config/base";
import neverthrow from "eslint-plugin-neverthrow";
import parser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { neverthrow },
    rules: {
      "neverthrow/must-use-result": "error",
    },
  },
];
