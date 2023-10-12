/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      error: "#F50008",
      warning: "#FF7C0A",
      success: "#00E25A",
      primary: "#1389FF",
      secondary: "#7490FF",
      errorDarker: "#DE0A12",
      warningDarker: "#F1760B",
      successDarker: "#0ACC57",
      primaryDarker: "#1283F4",
      secondaryDarker: "#6A86F8",
      defaultIOSBlue: "#2a62ff",

      // MRT Line Colors
      mrtNS: "#ff0000",
      mrtNE: "#6c169e",
      mrtEW: "#0aa605",
      mrtCC: "#fc8c03",
      mrtDT: "#033dfc",
      mrtTE: "#a1654d",
    }
  },
  plugins: [],
}

