import { defineConfig } from 'i18next-cli'

export default defineConfig({
    locales: ['ru', 'en', 'fr', 'es'],
    extract: {
        input: 'src/**/*.{js,jsx,ts,tsx}',
        output: 'src/locales/{{language}}.json',
    },
})
