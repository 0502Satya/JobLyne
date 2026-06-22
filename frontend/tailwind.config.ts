import type { Config } from "tailwindcss";

/**
 * Tailwind Configuration
 * ─────────────────────
 * Colors are defined as CSS custom properties in globals.css @theme block.
 * This config maps them to Tailwind utility classes so you can use:
 *   bg-primary, text-stat-blue, bg-page, etc.
 *
 * To change the brand color → edit --color-primary in globals.css
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        accent: "var(--color-accent)",
        "accent-gradient": "var(--color-accent-gradient)",
        "company-accent": "var(--color-company-accent)",
        "recruiter-accent": "var(--color-recruiter-accent)",
        linkedin: "var(--color-linkedin)",
        "linkedin-hover": "var(--color-linkedin-hover)",
        "stat-blue": "var(--color-stat-blue)",
        "stat-green": "var(--color-stat-green)",
        "stat-lime": "var(--color-stat-lime)",
        page: "var(--color-page)",
        surface: "var(--color-surface)",
        sidebar: {
          bg: "var(--color-primary-dark)",
          hover: "var(--color-primary-dark)",
        }
      },
      fontFamily: {
        sans: ["var(--font-primary)", "sans-serif"],
      }
    },
  },
  plugins: [],
};

export default config;