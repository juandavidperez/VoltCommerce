/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"DM Sans"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#00E5FF',
          hover: '#00B8D4',
          light: '#E0F7FA',
          text: '#006064',
        },
        accent: {
          DEFAULT: '#FFEA00',
          muted: '#FFF9C4',
        },
        surface: {
          app: '#FAFAFB',
          card: '#FFFFFF',
        },
        ink: {
          primary: '#263238',
          secondary: '#545454',
          disabled: '#BDBDBD',
          muted: '#767676',
        },
        border: '#E0E0E0',
        success: { DEFAULT: '#1B5E20', bg: '#E8F5E9' },
        warning: { DEFAULT: '#7A4500', bg: '#FFF3E0' },
        danger: { DEFAULT: '#AB1A1A', bg: '#FFEBEE' },
        info: { DEFAULT: '#0D47A1', bg: '#E3F2FD' },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,229,255,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        dropdown: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
