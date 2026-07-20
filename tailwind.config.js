/** @type {import('tailwindcss').Config} */
module.exports = {
 content: ['./src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter_400Regular', 'sans-serif'],
        'inter-medium': ['Inter_500Medium', 'sans-serif'],
        'inter-semibold': ['Inter_600SemiBold', 'sans-serif'],
        'inter-bold': ['Inter_700Bold', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        surface: 'var(--surface)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        error: 'var(--error)',
      }
    },
  },
  plugins: [],
}
