module.exports = {
  content: [
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.md",
    "./*.html",
    "./*.md",
    "./_pages/**/*.html", // if you have pages folder
    "./_site/**/*.html", // optionally include the built site,
    "./src/**/*.js",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
