/** Tailwind build for vendor/offline walkthrough CSS (wt/node tokens match html-patterns.md). */
module.exports = {
  content: [
    "../examples/walkthrough-how-it-works.html",
    "../skills/walkthrough/references/html-patterns.md",
  ],
  theme: {
    extend: {
      colors: {
        wt: {
          bg: "#000000",
          surface: "#0a0a0a",
          raised: "#141414",
          border: "#2a2a2a",
          fg: "#ffffff",
          muted: "#a0a0a0",
          accent: "#a855f7",
          file: "#c084fc",
          red: "#ef4444",
        },
        node: {
          component: "#a855f7",
          composable: "#7c3aed",
          utility: "#6d28d9",
          external: "#525252",
          event: "#d8b4fe",
          data: "#9333ea",
        },
      },
    },
  },
  plugins: [],
};
