const locales = ['ru', 'en', 'es', 'fr', 'ko'] as const
export const defaultLocale = 'ru'

export type Locale = (typeof locales)[number]
