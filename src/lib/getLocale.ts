import { type Locale, VALID_LOCALES } from '@/types/item.type'

export const getLocale = (): Locale => {
	if (typeof document !== 'undefined') {
		const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1]
		if (match && VALID_LOCALES.has(match)) {
			return match as Locale
		}
	}
	return 'ru'
}
