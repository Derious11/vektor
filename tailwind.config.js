/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },

    extend: {
      /* -----------------------------
       * COLOR SYSTEM (VEKTOR TOKENS)
       * ----------------------------- */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* --- CTA Color: Digital Lime Green --- */
        primary: {
          DEFAULT: "hsl(var(--primary))", // lime CTA
          foreground: "hsl(var(--primary-foreground))",
        },

        /* --- Secondary: Subtle Architectural Grays --- */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        /* --- Muted UI regions --- */
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        /* --- Brand Blueprint Blue surfaces --- */
        accent: {
          DEFAULT: "hsl(var(--accent))", // blueprint
          foreground: "hsl(var(--accent-foreground))",
        },

        /* --- Card / Sheet surfaces --- */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* --- Feedback colors --- */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },

      /* -----------------------------
       * TYPOGRAPHY
       * ----------------------------- */
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-geist-mono)",
          "JetBrains Mono",
          "Fira Code",
          "monospace",
        ],
      },

      /* -----------------------------
       * CORNER RADIUS (ENGINEERED)
       * ----------------------------- */
      borderRadius: {
        lg: "var(--radius)", // 0.5rem
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* -----------------------------
       * SHADOWS (MINIMAL, TECHNICAL)
       * ----------------------------- */
      boxShadow: {
        "outline-blueprint": "0 0 0 1px hsl(var(--accent))",
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
        card: "0 2px 6px rgba(0,0,0,0.06)",
      },

      /* -----------------------------
       * KEYFRAMES & ANIMATIONS
       * ----------------------------- */
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-up": {
          from: { transform: "translateY(6px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};
