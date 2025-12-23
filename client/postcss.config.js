// postcss.config.js
export default {
  // Or module.exports = { if using CJS
  plugins: {
    // 1. New Tailwind plugin
    "@tailwindcss/postcss": {},
    // 2. Autoprefixer (if you are using it)
    autoprefixer: {},
  },
};
