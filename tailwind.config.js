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
        element: 'var(--background-element)',
        hover: 'var(--background-hover)',
        border: 'var(--border)',
        foreground: 'var(--text)',
        muted: 'var(--text-secondary)',
        faint: 'var(--text-tertiary)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        accent: 'var(--accent)',
        error: 'var(--error)',
        momentum: '#10b981',
      }
    },
  },
  plugins: [],
}
