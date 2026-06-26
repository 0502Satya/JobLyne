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
        "company-gradient-end": "var(--color-company-gradient-end)",
        "recruiter-accent": "var(--color-recruiter-accent)",
        "recruiter-gradient-end": "var(--color-recruiter-gradient-end)",
        linkedin: "var(--color-linkedin)",
        "linkedin-hover": "var(--color-linkedin-hover)",
        "stat-blue": "var(--color-stat-blue)",
        "stat-green": "var(--color-stat-green)",
        "stat-lime": "var(--color-stat-lime)",
        page: "var(--color-page)",
        surface: "var(--color-surface)",
        featured: "var(--color-featured)",
        "featured-bg": "var(--color-featured-bg)",
        experience: "var(--color-experience)",
        "experience-bg": "var(--color-experience-bg)",
        "chart-grid": "var(--color-chart-grid)",
        "chart-surface": "var(--color-chart-surface)",
        "chart-fill": "var(--color-chart-fill)",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "sans-serif"],
      }
    },
  },
  plugins: [],
};

export default config;