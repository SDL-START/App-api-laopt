/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./html/*.{html,js,css}", "./views/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
