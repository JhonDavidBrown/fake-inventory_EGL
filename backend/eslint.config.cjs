const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "script",
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    ...tseslint.configs.recommended
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  // Configuración específica para archivos de test con Jest
  {
    files: ["**/__tests__/**/*.{js,ts}", "**/*.spec.{js,ts}", "**/*.test.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
]);

