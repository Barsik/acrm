/** @type {import('tailwindcss').Config} */

// MOEX design-system palette (see .claude/references/moex-design-system.md).
// We remap Tailwind's default `slate`/`blue`/`red`/`green`/`amber`/`violet`
// scales onto MOEX hex values so the ~870 existing utility usages across the
// app recolor coherently in one move, instead of hand-editing each occurrence.
//   slate  → MOEX neutral / text ramp  (#F6F7FA … #1E2535)
//   blue   → MOEX brand red ramp       (primary accent in this app == red)
//   red    → MOEX danger red ramp      (aligned to brand red)
//   green  → MOEX positive #12A05C
//   amber  → MOEX warning #F5A623 / #B07800
//   violet → MOEX purple #9B59B6
// Genuine info-tier blue (severity "medium", AI summary, charts) is applied via
// the named `info` token / explicit hex in the few places it's semantically blue.

const neutral = {
  50: '#F6F7FA', // --moex-bg (page background)
  100: '#EEF1F5', // light divider / chip bg
  200: '#E8EBF0', // --moex-border
  300: '#C0C8D4', // muted icon stroke / secondary-button hover border
  400: '#A0AABB', // --moex-muted
  500: '#5A6478', // --moex-text-2 (labels / secondary)
  600: '#3A4255', // darker body copy
  700: '#2A3142',
  800: '#222838',
  900: '#1E2535', // --moex-text (primary)
};

const red = {
  50: '#FDECEA',
  100: '#FDE7EA',
  200: '#F8CDD2',
  300: '#F2A6AE',
  400: '#ED6B78',
  500: '#E8001C', // --moex-red
  600: '#E8001C',
  700: '#C40018', // --moex-red-hover
  800: '#A60014',
  900: '#8A0011',
};

const green = {
  50: '#E9F8F0',
  100: '#D6F2E4',
  200: '#B0E6CC',
  300: '#7FD3A8',
  400: '#3DBA7C',
  500: '#12A05C', // MOEX positive / growth
  600: '#12A05C',
  700: '#0E7E48',
  800: '#0B6038',
  900: '#08482A',
};

const amber = {
  50: '#FDF6EC',
  100: '#FEF3E2',
  200: '#FCE3B5',
  300: '#FACD6E',
  400: '#F7B731',
  500: '#F5A623', // MOEX warning
  600: '#E08E00',
  700: '#B07800',
  800: '#7A5200',
  900: '#5C3E00',
};

const violet = {
  50: '#F5ECF9',
  100: '#ECDCF3',
  200: '#DCC0E8',
  300: '#C79BD9',
  400: '#B176C9',
  500: '#9B59B6', // MOEX purple (logo palette)
  600: '#8E47AB',
  700: '#7A3B93',
  800: '#632F77',
  900: '#4C235C',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"PT Sans"', 'Arial', 'system-ui', 'sans-serif'],
      },
      colors: {
        slate: neutral,
        gray: neutral,
        blue: red, // primary accent in this app maps to MOEX brand red
        red,
        green,
        emerald: green,
        amber,
        yellow: amber,
        violet,
        purple: violet,
        // Named MOEX tokens for explicit use
        moex: {
          red: '#E8001C',
          'red-hover': '#C40018',
          bg: '#F6F7FA',
          surface: '#FFFFFF',
          border: '#E8EBF0',
          text: '#1E2535',
          'text-2': '#5A6478',
          muted: '#A0AABB',
          pos: '#12A05C',
          warn: '#F5A623',
          info: '#4A90D9',
        },
        // Real info-tier blue (severity "medium" / info), kept distinct from accent
        info: {
          50: '#EBF4FC',
          100: '#E6F0FE',
          200: '#CFE3F8',
          300: '#A6CBF0',
          400: '#4A90D9',
          500: '#2196F3',
          600: '#1976D2',
          700: '#1565C0',
          800: '#114E92',
          900: '#0D3C73',
        },
        brand: {
          navy: '#0F1F3D',
          blue: '#1A3A6B',
          mid: '#2255AA',
          sky: '#4A90D9',
          light: '#93C5FD',
          violet: '#9B59B6',
          purple: '#9B59B6',
          teal: '#0D7377',
          green: '#12A05C',
          amber: '#F5A623',
          red: '#E8001C',
          moex: '#E8001C',
        },
      },
      borderRadius: {
        moex: '12px',
        pill: '99px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-dense': '0 2px 8px rgba(0,0,0,0.04)',
        float: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        'tile-hover': '0 12px 32px rgba(232,0,28,0.09)',
      },
    },
  },
  plugins: [],
};
