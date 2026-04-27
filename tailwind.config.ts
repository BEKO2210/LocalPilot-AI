import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bcd1ff",
          300: "#8eb1ff",
          400: "#5a87fb",
          500: "#3563f0",
          600: "#1f47d6",
          700: "#1a39ad",
          800: "#1a328a",
          900: "#1c2f6e",
          950: "#121e47",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b1bac8",
          400: "#8693a7",
          500: "#67738a",
          600: "#525c70",
          700: "#434b5b",
          800: "#3a414e",
          900: "#1f2530",
          950: "#0f1320",
        },
        // Theme-Tokens: lesen CSS-Custom-Properties, die der ThemeProvider
        // pro Business setzt. So funktionieren Public-Site-Komponenten ohne
        // Hardcoding und ohne Client-Context.
        theme: {
          primary: "rgb(var(--theme-primary) / <alpha-value>)",
          "primary-fg": "rgb(var(--theme-primary-fg) / <alpha-value>)",
          secondary: "rgb(var(--theme-secondary) / <alpha-value>)",
          "secondary-fg": "rgb(var(--theme-secondary-fg) / <alpha-value>)",
          accent: "rgb(var(--theme-accent) / <alpha-value>)",
          background: "rgb(var(--theme-background) / <alpha-value>)",
          foreground: "rgb(var(--theme-foreground) / <alpha-value>)",
          muted: "rgb(var(--theme-muted) / <alpha-value>)",
          "muted-fg": "rgb(var(--theme-muted-fg) / <alpha-value>)",
          border: "rgb(var(--theme-border) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        "theme-heading": ["var(--theme-font-heading)"],
        "theme-body": ["var(--theme-font-body)"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        theme: "var(--theme-radius)",
        "theme-button": "var(--theme-button-radius)",
        "theme-card": "var(--theme-card-radius)",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 19 32 / 0.04), 0 8px 24px -12px rgb(15 19 32 / 0.10)",
        ring: "0 0 0 1px rgb(15 19 32 / 0.08)",
        theme: "var(--theme-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
