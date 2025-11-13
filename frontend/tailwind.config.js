/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Midday.ai Color System
      colors: {
        // Base - Pure black and white
        black: '#000000',
        white: '#FFFFFF',

        // Gray Scale (950-50)
        gray: {
          950: '#0A0A0A',
          900: '#121212',
          800: '#1A1A1A',
          700: '#2E2E2E',
          600: '#404040',
          500: '#6B6B6B',
          400: '#8C8C8C',
          300: '#B8B8B8',
          200: '#DBDBDB',
          100: '#EFEFEF',
          50: '#F7F7F7',
        },

        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Accent Colors
        primary: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF',
        },

        // Border
        border: {
          DEFAULT: '#2E2E2E',
          subtle: '#1A1A1A',
        },

        // Background
        background: {
          DEFAULT: '#000000',
          secondary: '#0A0A0A',
          tertiary: '#121212',
        },

        // Text
        foreground: {
          DEFAULT: '#FFFFFF',
          secondary: '#B8B8B8',
          muted: '#6B6B6B',
        },
      },

      // Typography - Geist Font Family
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },

      // Spacing (8px grid system)
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
        '20': '160px',
        '24': '192px',
      },

      // Border Radius (dead square - Midday.ai style)
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px', // Keep for avatars/circles only
      },

      // Transitions (smooth, polished)
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        slow: '300ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // Animations
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // Box Shadows (minimal, mostly borders instead)
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },

      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
