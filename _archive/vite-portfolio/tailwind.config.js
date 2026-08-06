/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark theme colors
                dark: {
                    bg: '#0a0a0a',
                    surface: '#111111',
                    border: '#222222',
                    text: {
                        primary: '#e5e5e5',
                        secondary: '#a3a3a3',
                        muted: '#737373',
                    },
                    accent: '#6b7280', // Muted gray accent
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
