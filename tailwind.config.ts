import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/funcs/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'toast': {
          '0%': { width: '100%' },
          '100%': { width: '0%' }
        },
        'heightActive': {
          '0%': { height: '0px' },
          '100%': { height: '16px' }
        }
      },
      animation: {
        toast: 'toast 4s linear forwards',
        heightActive: 'heightActive 0.2s linear forwards'
      }
    },
  },
  plugins: [],
};
export default config;
