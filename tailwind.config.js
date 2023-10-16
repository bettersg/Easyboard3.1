/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        error: "#F50008",
        warning: "#FF7C0A",
        success: "#00E25A",
        primary: "#D81E5B",
        secondary: "#F79F1F",
        errorDarker: "#DE0A12",
        warningDarker: "#F1760B",
        successDarker: "#0ACC57",
        primaryDarker: "#1283F4",
        secondaryDarker: "#6A86F8",
        defaultIOSBlue: "#2a62ff",

        textInputBorder: "#706D6D",
        defaultBackground: "#ECF0F1",

        // MRT Line Colors
        "mrt-NS": "#ff0000",
        "mrt-NE": "#6c169e",
        "mrt-EW": "#0aa605",
        "mrt-CC": "#fc8c03",
        "mrt-DT": "#033dfc",
        "mrt-TE": "#a1654d",
      },
    },
  },
  plugins: [],
}

