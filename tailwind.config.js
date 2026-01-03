/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#DBEAFE',
                    100: '#BFDBFE',
                    200: '#93C5FD',
                    300: '#60A5FA',
                    400: '#3B82F6',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
            },
            spacing: {
                'xs': '0.25rem',   // 4px
                'sm': '0.5rem',    // 8px
                'md': '0.75rem',   // 12px
                'lg': '1rem',      // 16px
                'xl': '1.25rem',   // 20px
                '2xl': '1.5rem',   // 24px
                '3xl': '2rem',     // 32px
            },
            fontSize: {
                'tiny': '0.6875rem',  // 11px
                'xs': '0.75rem',      // 12px
                'sm': '0.875rem',     // 14px
                'base': '0.875rem',   // 14px (body default)
                'lg': '1.125rem',     // 18px
                'xl': '1.25rem',      // 20px
                '2xl': '1.5rem',      // 24px
            },
            borderRadius: {
                DEFAULT: '0.375rem', // 6px
                'md': '0.5rem',      // 8px
                'lg': '0.75rem',     // 12px
            },
            boxShadow: {
                'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
                'icon': '0 2px 4px rgba(59, 130, 246, 0.1)',
            }
        },
    },
    plugins: [],
}
