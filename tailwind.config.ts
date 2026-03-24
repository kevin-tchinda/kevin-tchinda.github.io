import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom palette
        background: "#FCFAF7",        // Creamy Alabaster
        "background-secondary": "#F2EFE9", // Soft Oatmeal
        footer: "#3C3431",            // Deep Espresso
        header: "#FCFAF7",            // matches background
        "nav-link": "#2E2E2E",        // Deep Charcoal
        "nav-link-hover": "#8E4343",  // Muted Burgundy
        "border-light": "#E5E0D8",    // Light Linen
        "heading-primary": "#3C3431", // Deep Espresso
        "heading-secondary": "#5A514D", // Warm Slate
        "body-text": "#2E2E2E",       // Deep Charcoal
        "caption-text": "#76716B",    // Cocoa Grey
        "primary-button": "#8E4343",  // Muted Burgundy
        "primary-button-text": "#FCFAF7",
        "secondary-button": "transparent",
        "secondary-button-border": "#8E4343",
        "secondary-button-text": "#8E4343",
        "input-bg": "#FFFFFF",
        "input-border": "#D1CDC7",    // Stone
        "accent": "#D4A373",          // Toasted Amber
        "success": "#7A8471",         // Sage Green
        "error": "#A65D5D",           // Soft Brick
        "selection": "#F0E6D2",       // Antique White
        "footer-heading": "#D4A373",
        "footer-text": "#E5E0D8",
        "social-icon": "#BCB8B1",     // Frosted Slate
      },
      fontFamily: {
        // Apple system fonts
        sans: ["-apple-system", "SF Pro", "Roboto", "system-ui", "sans-serif"],
        // Fun font for section titles (optional)
        fun: ["Poppins", "Montserrat", "sans-serif"],
      },
      borderRadius: {
        // Subtle rounded corners
        'ios': '10px',
      },
    },
  },
  plugins: [],
};

export default config;