import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, type Locale } from './settings'

async function getLocaleFromCookie(): Promise<Locale | undefined> {
	const cookieStore = await cookies()
	const match = cookieStore.get('lang')?.value

	if (
		match === 'ru' ||
		match === 'en' ||
		match === 'es' ||
		match === 'fr' ||
		match === 'ko'
	) {
		return match
	}

	return undefined
}

export default getRequestConfig(async () => {
	const locale = (await getLocaleFromCookie()) ?? defaultLocale

	const [messages, markers] = await Promise.all([
		import(`@/locales/${locale}.json`).then((m) => m.default),
		import(`@/locales/markers/${locale}.json`).then((m) => m.default),
	])

	return {
		locale,
		messages: { ...messages, markers },
	}
})
