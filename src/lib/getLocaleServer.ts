import { headers } from 'next/headers'
import { type Locale, VALID_LOCALES } from '@/types/item.type'

export const getLocaleServer = async (): Promise<Locale> => {
	const headerList = await headers()

	const langCookie = headerList
		.get('cookie')
		?.match(/(?:^|; )lang=([^;]*)/)?.[1]
	if (langCookie && VALID_LOCALES.has(langCookie)) {
		return langCookie as Locale
	}

	const acceptLang = headerList.get('accept-language') || 'ru'
	const locale = acceptLang.split(',')[0].split('-')[0]
	if (locale && VALID_LOCALES.has(locale)) {
		return locale as Locale
	}

	return 'ru'
}
