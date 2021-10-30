const { createGlobPatternsForDependencies } = require("@nrwl/next/tailwind");

const { join } = require("path");

module.exports = {
  mode: "jit",
  purge: [
    join(__dirname, "pages/**/*.{js,ts,jsx,tsx}"),
    ...createGlobPatternsForDependencies(__dirname)
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        river: {
          50: "#edf5fd",
          100: "#e1effe",
          200: "#c3ddfd",
          300: "#a4cafd",
          400: "#6fa7fc",
          500: "#417df7",
          600: "#395ff1",
          700: "#3750d9",
          800: "#323da1",
          900: "#303176"
        },
        robin: {
          50: "#ecfcfa",
          100: "#d7f6f3",
          200: "#b6ede9",
          300: "#86dbda",
          400: "#1ebec6",
          500: "#0698a1",
          600: "#067781",
          700: "#056a71",
          800: "#055359",
          900: "#03494e"
        }
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require("@tailwindcss/typography")]
};
