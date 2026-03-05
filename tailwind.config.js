/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,md,html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        washi: '#f8f6f1',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth:  '100%',
            color:     theme('colors.stone.800'),
            lineHeight: '1.8',
            a: {
              color:          theme('colors.amber.700'),
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
            'h1,h2,h3,h4': { color: theme('colors.stone.900'), fontWeight: '700' },
            code: {
              backgroundColor: theme('colors.stone.100'),
              color:           theme('colors.stone.800'),
              padding:         '0.2em 0.4em',
              borderRadius:    '0.25rem',
              fontWeight:      '400',
              fontFamily:      '"JetBrains Mono", monospace',
            },
            'code::before': { content: '""' },
            'code::after':  { content: '""' },
            blockquote: {
              borderLeftColor: theme('colors.amber.400'),
              color:           theme('colors.stone.600'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
