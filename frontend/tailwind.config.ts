import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        goldLight: "#F5D06F",
        goldMain: "#D4AF37",
        goldDeep: "#B68D2A",
        goldDark: "#8C6A1C",
        elegantBlack: "#0F0F0F",
        darkBg: "#1A1A1A",
        softCream: "#F5E6C8",
        greyText: "#BDBDBD",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(90deg, #F5D06F, #D4AF37, #8C6A1C)",
      },
      boxShadow: {
        "gold-glow":
          "0 0 25px rgba(212, 175, 55, 0.3)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

export default config;