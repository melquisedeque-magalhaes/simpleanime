/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0B101A',
      },
      fontFamily: {
        heading: 'Roboto_700Bold',
        subtitle: 'Roboto_500Medium',
        body: 'Roboto_400Regular',
      },
    },
  },
  plugins: [],
}