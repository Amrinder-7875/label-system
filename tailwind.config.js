/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'Space Mono'", 'monospace'],
        display: ["'Bebas Neue'", 'sans-serif'],
        heading: ["'Anton'", 'sans-serif'],
      },
      colors: {
        black:    '#080808',
        offblack: '#0e0e0e',
        surface:  '#141414',
        surface2: '#1c1c1c',
        border:   '#2a2a2a',
        red:      '#fb0d01',
        'red-dim':'#7a1a15',
        cream:    '#f0ede8',
        muted:    '#666',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black:    "#080808",
        offblack: "#0e0e0e",
        surface:  "#141414",
        surface2: "#1c1c1c",
        border:   "#2a2a2a",
        red:      "#e63329",
        "red-dim":"#7a1a15",
        cream:    "#f0ede8",
        muted:    "#666666",
      },
      fontFamily: {
        bebas:  ["Bebas Neue", "sans-serif"],
        anton:  ["Anton", "sans-serif"],
        mono:   ["Space Mono", "monospace"],
      },
      letterSpacing: {
        label: "0.3em",
        ui:    "0.2em",
        tag:   "0.2em",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};