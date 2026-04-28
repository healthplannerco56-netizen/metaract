/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["'DM Serif Display'", "Georgia", "serif"],
      },
      colors: {
        slate: {
          950: "#020817",
        },
        clinical: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc6fb",
          400: "#36a5f6",
          500: "#0c88e8",
          600: "#006cc6",
          700: "#0055a0",
          800: "#044985",
          900: "#0a3d6e",
          950: "#072649",
        },
      },
      backgroundImage: {
        "grid-slate": "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "32px 32px",
      },
    },
  },
  plugins: [],
};
