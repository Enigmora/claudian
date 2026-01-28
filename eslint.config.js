import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module"
      },
      globals: {
        // Browser globals
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        prompt: "readonly",
        alert: "readonly",
        confirm: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        Element: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        DragEvent: "readonly",
        ClipboardEvent: "readonly",
        CustomEvent: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        IntersectionObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        File: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
      },
    },
    rules: {
      // Disable sample-names rule (not relevant for our plugin)
      "obsidianmd/sample-names": "off",
      // Allow prompt() - we'll replace it with Obsidian modal
      "no-alert": "off",
      // Allow unused variables with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
    },
  },
]);
