import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js }, 
    extends: ["js/recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"], 
    languageOptions: { globals: globals.browser },
    rules: {
      "react/react-in-jsx-scope": "off",
    }
  },
  pluginReact.configs.flat.recommended,
]);
