import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// Hex color check: matches #123, #1234, #123456, #12345678 (standard hex values)
const hexRegex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

// Absolute Tailwind color check: matches bg-red-500, text-blue-600/20, border-gray-200, ring-indigo-500, from-teal-500, shadow-blue-500/25 etc.
const tailwindColorRegex = /\b(?:bg|text|border|ring|stroke|fill|shadow|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+(?:\/\d+)?\b/;

const localRulesPlugin = {
  rules: {
    "no-hardcoded-colors": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow hardcoded hex colors and absolute Tailwind color classes.",
        },
        messages: {
          hardcodedHex: "Avoid hardcoded hex color '{{ value }}'. Use semantic theme variables instead.",
          absoluteTailwind: "Avoid absolute Tailwind color class '{{ value }}'. Use semantic classes (e.g., text-primary, text-error, bg-surface) instead.",
        },
        schema: [],
      },
      create(context) {
        // Whitelist files that define tokens, the theme configuration, or documentation guides
        const whitelistPatterns = [
          "globals.css",
          "tailwind.config.",
          "styleguide",
          "tokens.",
          "theme.",
          "design-tokens"
        ];
        
        const isWhitelisted = whitelistPatterns.some(pat => context.filename.includes(pat));
        if (isWhitelisted) {
          return {};
        }

        function checkString(value, node) {
          if (typeof value !== "string") return;
          
          const hexMatch = hexRegex.exec(value);
          if (hexMatch) {
            context.report({
              node,
              messageId: "hardcodedHex",
              data: { value: hexMatch[0] },
            });
          }
          
          const twMatch = tailwindColorRegex.exec(value);
          if (twMatch) {
            context.report({
              node,
              messageId: "absoluteTailwind",
              data: { value: twMatch[0] },
            });
          }
        }
        
        return {
          Literal(node) {
            checkString(node.value, node);
          },
          TemplateLiteral(node) {
            node.quasis.forEach((quasi) => {
              checkString(quasi.value.raw, node);
            });
          },
          JSXAttribute(node) {
            if (node.value && node.value.type === "JSXExpressionContainer") {
              if (node.value.expression && node.value.expression.type === "Literal") {
                checkString(node.value.expression.value, node.value.expression);
              }
            }
          }
        };
      },
    },
    "no-arbitrary-spacing": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow raw arbitrary spacing values in Tailwind classes.",
        },
        messages: {
          arbitrarySpacing: "Avoid arbitrary spacing class '{{ value }}'. Aligned styles must follow standard 8px grid steps or semantic theme spacing tokens.",
        },
        schema: [],
      },
      create(context) {
        const whitelistPatterns = [
          "globals.css",
          "tailwind.config.",
          "styleguide",
          "tokens.",
          "theme.",
          "design-tokens"
        ];
        
        const isWhitelisted = whitelistPatterns.some(pat => context.filename.includes(pat));
        if (isWhitelisted) {
          return {};
        }

        const arbitrarySpacingRegex = /(?:^|\s|\b)(-?)([a-zA-Z0-9-]+)-\[([^\]]+)\]/g;

        // Prefixes that handle font sizes — these follow the typography scale, not the 8px grid
        const fontSizePrefixes = ["text", "leading", "tracking", "indent"];

        // Prefixes for layout templates and transforms that use fractional/complex values by design
        const structuralPrefixes = ["grid-cols", "grid-rows", "translate", "rotate", "skew", "perspective", "cols", "rows"];

        function checkString(value, node) {
          if (typeof value !== "string") return;
          
          let match;
          arbitrarySpacingRegex.lastIndex = 0;
          while ((match = arbitrarySpacingRegex.exec(value)) !== null) {
            const fullClass = match[0].trim();
            const prefix = match[2];
            const innerValue = match[3];
            
            if (!innerValue.endsWith("px")) continue;

            // Skip calc()/var() expressions — they resolve dynamically
            if (innerValue.includes("calc") || innerValue.includes("var")) continue;

            // Skip font-size and related typography prefixes — separate scale
            if (fontSizePrefixes.some(fp => prefix === fp || prefix.startsWith(fp + "-"))) continue;

            // Skip structural layout and transform prefixes
            if (structuralPrefixes.some(sp => prefix === sp || prefix.startsWith(sp))) continue;

            // Universally allow 1px and 2px — used for sub-pixel nudges, dividers, and focus indicators
            if (innerValue === "1px" || innerValue === "2px") continue;

            // Core rule: only flag values that are NOT multiples of 4px.
            // The design system allows 8px grid steps with a 4px sub-unit (for icon padding etc.)
            const numericValue = parseFloat(innerValue);
            if (!Number.isNaN(numericValue) && Number.isInteger(numericValue) && numericValue % 4 === 0) continue;

            context.report({
              node,
              messageId: "arbitrarySpacing",
              data: { value: fullClass },
            });
          }
        }
        
        return {
          Literal(node) {
            checkString(node.value, node);
          },
          TemplateLiteral(node) {
            node.quasis.forEach((quasi) => {
              checkString(quasi.value.raw, node);
            });
          },
          JSXAttribute(node) {
            if (node.value && node.value.type === "JSXExpressionContainer") {
              if (node.value.expression && node.value.expression.type === "Literal") {
                checkString(node.value.expression.value, node.value.expression);
              }
            }
          }
        };
      },
    },
  },
};

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "local-rules": localRulesPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "local-rules/no-hardcoded-colors": "error",
      "local-rules/no-arbitrary-spacing": "error",
    }
  }
];

export default eslintConfig;
