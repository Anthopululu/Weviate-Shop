import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wv: {
          green: "#00d48a",
          gl: "#00f5a0",
          dark: "#07070e",
          surface: "#0e0e1a",
          card: "#151525",
          border: "#252540",
          muted: "#6b7194",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
