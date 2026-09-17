/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        canvas: '#FFFFFF',
        'surface-soft': '#F5F5F5',
        hairline: '#E5E5E5',
        'hairline-soft': '#F0F0F0',
        'accent-magenta': '#FF3366',
        block: {
          lime: '#D9F99D',
          lilac: '#E9D5FF',
          cream: '#FEF3C7',
          mint: '#CCFBF1',
          pink: '#FCE7F3',
          coral: '#FED7AA',
          navy: '#0B0F19',
        },
        ink: '#000000',
        'inverse-ink': '#FFFFFF',
      },
      borderRadius: {
        pill: '50px',
        lg: '24px',
        xl: '32px',
      },
      letterSpacing: {
        'display-xl': '-1.72px',
        'display-lg': '-0.96px',
        'headline': '-0.26px',
        'eyebrow': '0.54px',
        'caption': '0.60px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
