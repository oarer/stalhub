const SAFE_BASE_URL = 'https://stalhub.dev'
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/
const ABSOLUTE_SCHEME = /^[a-z][a-z\d+.-]*:/i

export function getSafeHref(href: string): string | null {
	const value = href.trim()
	if (!value || CONTROL_CHARACTERS.test(value) || value.startsWith('//')) {
		return null
	}

	try {
		const parsed = new URL(value, SAFE_BASE_URL)
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null
		}

		if (!ABSOLUTE_SCHEME.test(value) && parsed.origin !== SAFE_BASE_URL) {
			return null
		}

		return ABSOLUTE_SCHEME.test(value) ? parsed.toString() : value
	} catch {
		return null
	}
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href)
}
